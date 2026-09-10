import {build} from 'esbuild';
import {neon} from '@neondatabase/serverless';
import assert from 'node:assert/strict';
if(process.env.ROUTING_TEST_ISOLATED!=='true'||process.env.HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN)throw Error('Isolated branch without CRM credentials required');
await build({entryPoints:{leads:'app/api/leads/route.ts',partners:'app/api/partner-applications/route.ts',operations:'app/api/operations/route.ts'},bundle:true,platform:'node',format:'esm',packages:'external',outdir:'work/api-tests',outExtension:{'.js':'.mjs'}});
const {POST:lead}=await import('../work/api-tests/leads.mjs');
const {POST:partner}=await import('../work/api-tests/partners.mjs');
const {POST:operation}=await import('../work/api-tests/operations.mjs');
const request=p=>new Request('https://test.invalid/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
const base={name:'Isolated homeowner fixture',phone:'5015550197',flow:'repair',service:'AC not cooling',authority:'Homeowner',city:'ISOLATED API TEST',consent:true};
const sql=neon(process.env.DATABASE_URL);let ids=[],application;
try{
 assert.equal((await lead(request({...base,consent:'false'}))).status,400);
 let response=await lead(request({...base,isTest:true}));assert.equal(response.status,201);let data=await response.json();ids.push(data.leadId);
 let rows=await sql`SELECT is_test,routing_status,highlevel_sync_status FROM leads WHERE id=${data.leadId}`;
 assert.deepEqual(rows[0],{is_test:true,routing_status:'test_excluded',highlevel_sync_status:'test_excluded'});
 response=await lead(request(base));assert.equal(response.status,201);data=await response.json();ids.push(data.leadId);
 rows=await sql`SELECT routing_status,highlevel_sync_status FROM leads WHERE id=${data.leadId}`;
 assert.equal(rows[0].routing_status,'awaiting_partner');assert.equal(rows[0].highlevel_sync_status,'failed');
 assert.equal((await operation(request({action:'delivery',id:'anything',reference:'fake',success:true}))).status,401);
 response=await partner(request({legalName:'TestingHvacLLC API fixture',contactName:'TEST',email:'test@example.invalid',phone:'5015550198',deliveryEmail:'test@example.invalid',licenseNumber:'TEST',cities:'ISOLATED API TEST',services:['AC repair'],acceptRepair:true,insuranceConfirmed:true,pilotAcknowledged:true,termsAcknowledged:true,dataAcknowledged:true}));
 assert.equal(response.status,201);application=(await response.json()).applicationId;
 rows=await sql`SELECT a.is_test,p.is_test AS partner_test FROM partner_applications a JOIN partners p ON p.id=a.partner_id WHERE a.id=${application}`;
 assert.deepEqual(rows[0],{is_test:true,partner_test:true});
 console.log('PASS: real API handlers reject invalid input; test lead skips CRM; valid lead persists awaiting_partner through CRM failure; operations deny unauthenticated delivery; TestingHvacLLC application saves atomically as test.');
}finally{for(const id of ids)await sql`UPDATE leads SET is_test=true,qualification_status='test',routing_status='test_excluded' WHERE id=${id}`;}
