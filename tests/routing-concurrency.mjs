import assert from 'node:assert/strict';
import {neon} from '@neondatabase/serverless';
if(process.env.ROUTING_TEST_ISOLATED!=='true')throw Error('Isolated branch required');
const sql=neon(process.env.DATABASE_URL), prefix='TEST-RACE-'+crypto.randomUUID(), p=prefix+'-partner';
await sql.transaction([
 sql`INSERT INTO partners(id,legal_name,display_name,status,is_test,approved_at,license_verified_at,insurance_verified_at,delivery_authorized_at,paid_leads_authorized_at,delivery_method) VALUES(${p},'TEST ISOLATED CONCURRENCY','TEST ISOLATED CONCURRENCY','pilot',false,now(),now(),now(),now(),now(),'manual_verified')`,
 sql`INSERT INTO partner_applications(id,partner_id,application_status,insurance_confirmed,pilot_acknowledged,terms_acknowledged,data_acknowledged,raw_payload,is_test) VALUES(${p},${p},'approved',true,true,true,true,'{"testFixture":true}',false)`,
 sql`INSERT INTO partner_service_types VALUES(${p},'AC repair')`,
 sql`INSERT INTO partner_lead_types VALUES(${p},'repair')`,
 sql`INSERT INTO partner_territories(id,partner_id,city) VALUES(${p},${p},${prefix})`,
 ...Array.from({length:4},(_,i)=>sql`INSERT INTO leads(id,flow,service,city,name,phone,payload_json,score,score_label,consent,qualification_status,routing_service,price_key) VALUES(${prefix+'-'+i},'repair','AC not cooling',${prefix},'TEST ISOLATED CONCURRENCY',${'+150155501'+i+'9'},'{"testFixture":true}',80,'WARM',true,'qualified','AC repair','standard_repair')`)
]);
try{
 const results=await Promise.all(Array.from({length:8},()=>sql`SELECT hvac_route_lead(${prefix+'-0'}) AS r`));
 assert.equal(new Set(results.map(r=>r[0].r.assignmentId)).size,1,'same lead reserved exactly once');
 const others=await Promise.all([1,2,3].map(i=>sql`SELECT hvac_route_lead(${prefix+'-'+i}) AS r`));
 const ids=[results[0][0].r.assignmentId,...others.map(r=>r[0].r.assignmentId)];
 const delivery=await Promise.all(ids.map(id=>sql`SELECT hvac_record_delivery(${id},'TEST concurrent evidence',true) AS r`));
 assert.equal(delivery.filter(r=>r[0].r.pilotFree).length,3);
 assert.equal(delivery.filter(r=>r[0].r.amountCents===4900).length,1);
 const counts=await sql`SELECT count(*)::int AS assignments,(SELECT count(*)::int FROM partner_billing_ledger WHERE partner_id=${p}) AS ledger FROM lead_assignments WHERE partner_id=${p}`;
 assert.deepEqual(counts[0],{assignments:4,ledger:4});
 console.log('PASS: 8 simultaneous same-lead routes produce 1 assignment; 4 simultaneous deliveries produce exactly 3 free and 1 billable ledger entry. No external delivery/payment.');
}finally{
 // Retain clearly marked isolated fixtures, but remove all simulated billable balances.
 await sql.transaction([
  sql`UPDATE partner_billing_ledger SET amount_cents=0,status='void',is_test=true,reason='Isolated concurrency test complete' WHERE partner_id=${p}`,
  sql`UPDATE lead_assignments SET is_test=true,billable_status='void' WHERE partner_id=${p}`,
  sql`UPDATE leads SET is_test=true,routing_status='test_excluded' WHERE id LIKE ${prefix+'-%'}`,
  sql`UPDATE partners SET is_test=true,status='test' WHERE id=${p}`,
  sql`UPDATE partner_applications SET is_test=true WHERE partner_id=${p}`
 ]);
}
