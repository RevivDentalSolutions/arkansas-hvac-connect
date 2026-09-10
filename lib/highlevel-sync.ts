import type { getSql } from './postgres';
type Sql=ReturnType<typeof getSql>;
const locationId=process.env.HIGHLEVEL_LOCATION_ID||'pbSvbVU5DMI3OnWI5WoR';
const api='https://services.leadconnectorhq.com';
async function call<T>(path:string,init:RequestInit={}):Promise<T>{
 const r=await fetch(api+path,{...init,headers:{Authorization:`Bearer ${process.env.HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN}`,'Content-Type':'application/json',Version:'v3'},signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error(`HighLevel ${r.status} at ${path.split('?')[0]}`);
 return r.json() as Promise<T>;
}
const post=(body:unknown)=>({method:'POST',body:JSON.stringify(body)});
export async function syncLeadToHighLevel(id:string,sql:Sql){
 const lock=crypto.randomUUID();
 const claimed=await sql`UPDATE leads SET highlevel_sync_lock=${lock},highlevel_attempted_at=now()
 WHERE id=${id} AND NOT is_test AND highlevel_sync_status<>'synced' AND highlevel_sync_lock IS NULL RETURNING *`;
 if(!claimed.length)return;
 const lead=claimed[0];
 try{
  if(!process.env.HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN)throw Error('HighLevel token not configured');
  let contactId=lead.highlevel_contact_id as string|null;
  if(!contactId){
   const response=await call<{contact:{id:string}}>('/contacts/upsert',post({locationId,name:lead.name,phone:lead.phone,email:lead.email||undefined,city:lead.city||undefined,state:'AR',postalCode:lead.zip||undefined,source:'Arkansas HVAC Connect website',createNewIfDuplicateAllowed:false}));
   contactId=response.contact.id;
   await sql`UPDATE leads SET highlevel_contact_id=${contactId} WHERE id=${id}`;
  }
  // Every remote ID is checkpointed immediately; retries do not recreate completed stages.
  const pipelines=await call<{pipelines:Array<{id:string;name:string;stages:Array<{id:string;name:string}>}>}>(`/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`);
  const pipeline=pipelines.pipelines.find(p=>p.name===(process.env.HIGHLEVEL_PIPELINE_NAME||'Arkansas HVAC Connect Lead Pipeline'));
  const stage=pipeline?.stages.find(s=>s.name===(process.env.HIGHLEVEL_STAGE_NAME||'New Lead'));
  if(!pipeline||!stage)throw Error('HighLevel pipeline or stage missing');
  let opportunityId=lead.highlevel_opportunity_id as string|null;
  if(!opportunityId){
   const params=new URLSearchParams({locationId,pipelineId:pipeline.id,contactId,limit:'100'});
   const found=await call<{opportunities:Array<{id:string;name:string;contactId?:string}>;meta?:{total?:number}}>(`/opportunities/search?${params}`);
   if(found.opportunities.length>=100)throw Error('Opportunity reconciliation needs manual review: too many matches');
   const exact=found.opportunities.filter(o=>o.name.includes(id));
   const legacy=found.opportunities.filter(o=>o.name===`HVAC Lead · ${lead.flow} · ${lead.service}`);
   if(exact.length>1||(!exact.length&&legacy.length>1))throw Error('Multiple existing opportunities require manual reconciliation');
   const match=exact[0]||legacy[0];
   if(match)opportunityId=match.id;
   else{
    // An ambiguous timeout must NEVER automatically POST another opportunity.
    if(lead.highlevel_opportunity_attempted_at)throw Error('Previous opportunity attempt needs reconciliation before retry');
    await sql`UPDATE leads SET highlevel_opportunity_attempted_at=now() WHERE id=${id}`;
    const created=await call<{opportunity:{id:string}}>('/opportunities/',post({locationId,pipelineId:pipeline.id,pipelineStageId:stage.id,contactId,name:`HVAC Lead · ${lead.flow} · ${lead.service} · ${id}`,status:'open'}));
    opportunityId=created.opportunity.id;
   }
   await sql`UPDATE leads SET highlevel_opportunity_id=${opportunityId} WHERE id=${id}`;
  }
  if(!lead.highlevel_note_id){
   const notes=await call<{notes:Array<{id:string;body:string}>}>(`/contacts/${contactId}/notes`);
   const existing=notes.notes.find(n=>n.body.includes(`Arkansas HVAC Connect lead ID: ${id}`));
   const note=existing|| (await call<{note:{id:string}}>(`/contacts/${contactId}/notes`,post({body:`Arkansas HVAC Connect lead ID: ${id}\nService: ${lead.service}\nRouting: ${lead.routing_status}\nNeon owns qualification, assignment and billing. CRM sync is not delivery.`}))).note;
   await sql`UPDATE leads SET highlevel_note_id=${note.id} WHERE id=${id}`;
  }
  // Existing trigger behavior retained; no contractor delivery or billing is performed here.
  await call(`/contacts/${contactId}/tags`,post({tags:['hvac - new lead']}));
  await sql`UPDATE leads SET highlevel_sync_status='synced',highlevel_last_error=NULL,highlevel_synced_at=now() WHERE id=${id}`;
 }catch(error){
  await sql`UPDATE leads SET highlevel_sync_status='failed',highlevel_last_error=${(error instanceof Error?error.message:'Sync failed').slice(0,500)} WHERE id=${id}`;
 }finally{
  await sql`UPDATE leads SET highlevel_sync_lock=NULL WHERE id=${id} AND highlevel_sync_lock=${lock}`;
 }
}
