import { getSql } from '@/lib/postgres';
import { validateLead, classifyLead } from '@/lib/lead-validation';
import { syncLeadToHighLevel } from '@/lib/highlevel-sync';
export async function POST(request:Request){
 let payload;
 try {payload=validateLead(await request.json());}
 catch(error){return Response.json({error:error instanceof Error?error.message:'Invalid request'},{status:400});}
 const id=crypto.randomUUID(), s=classifyLead(payload), sql=getSql();
 try {
  const p=payload;
  const attr=(key:string)=>typeof p[key]==='string'?p[key] as string:null;
  await sql`INSERT INTO leads (id,flow,service,city,zip,name,phone,email,contact_method,payload_json,landing_page,page_url,referrer,utm_source,utm_medium,utm_campaign,utm_term,utm_content,channel,score,score_label,consent,is_test,qualification_status,routing_service,price_key,routing_status,routing_reason)
  VALUES(${id},${p.flow},${p.service},${p.city||null},${p.zip||null},${p.name},${p.phone},${p.email||null},${attr('contactMethod')},${JSON.stringify(p)},${attr('landingPage')},${attr('pageUrl')},${attr('referrer')},${attr('utmSource')},${attr('utmMedium')},${attr('utmCampaign')},${attr('utmTerm')},${attr('utmContent')},${attr('channel')||'direct'},${s.score},${s.label},true,${!!p.isTest},${s.qualification},${s.service},${s.priceKey},'awaiting_review','routing_pending')`;
 }catch{ return Response.json({error:'Unable to save request'},{status:503}); }
 // Persistence is already committed. Routing/CRM failures must not invite duplicate resubmission.
 let routingStatus='awaiting_review';
 try {const rows=await sql`SELECT hvac_route_lead(${id}) AS result`;routingStatus=rows[0].result.status;}
 catch {await sql`UPDATE leads SET routing_reason='routing_error_requires_retry' WHERE id=${id}`.catch(()=>{});}
 if(!payload.isTest)await syncLeadToHighLevel(id,sql).catch(()=>{});
 else await sql`UPDATE leads SET highlevel_sync_status='test_excluded' WHERE id=${id}`.catch(()=>{});
 return Response.json({leadId:id,score:{score:s.score,label:s.label},routingStatus},{status:201});
}
