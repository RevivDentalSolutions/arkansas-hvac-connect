import { timingSafeEqual } from 'node:crypto';
import { getSql } from '@/lib/postgres';
import { syncLeadToHighLevel } from '@/lib/highlevel-sync';
export async function POST(request:Request){
 const expected=process.env.HVAC_OPERATIONS_TOKEN;
 const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!expected||expected.length<32||Buffer.byteLength(supplied)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(expected)))return Response.json({error:'Unauthorized'},{status:401});
 try{
  const p=await request.json();const sql=getSql();let result;
  if(typeof p.id!=='string')return Response.json({error:'ID required'},{status:400});
  switch(p.action){
   case 'route': result=await sql`SELECT hvac_route_lead(${p.id}) AS result`;break;
   case 'delivery':
    if(typeof p.reference!=='string'||typeof p.success!=='boolean')throw Error('Delivery evidence required');
    result=await sql`SELECT hvac_record_delivery(${p.id},${p.reference},${p.success},${typeof p.error==='string'?p.error:null}) AS result`;break;
   case 'disposition':
    if(typeof p.disposition!=='string'||typeof p.reason!=='string')throw Error('Disposition and reason required');
    result=await sql`SELECT hvac_record_disposition(${p.id},${p.disposition},${p.reason}) AS result`;break;
   case 'sync': await syncLeadToHighLevel(p.id,sql);result=await sql`SELECT highlevel_sync_status AS status FROM leads WHERE id=${p.id}`;break;
   default:return Response.json({error:'Unknown action'},{status:400});
  }
  return Response.json({result});
 }catch{return Response.json({error:'Operation rejected; inspect Neon state before retry'},{status:409});}
}
