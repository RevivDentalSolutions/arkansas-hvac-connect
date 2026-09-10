import { neon } from '@neondatabase/serverless';
if(!process.env.DATABASE_URL||process.env.ROUTING_TEST_ISOLATED!=='true')throw Error('Run only on the isolated test branch with ROUTING_TEST_ISOLATED=true');
const sql=neon(process.env.DATABASE_URL);
// Every fixture has a TEST name; production flags are simulated ONLY on the isolated
// branch to exercise the real billing path. The final exception rolls everything back.
const body=`DO $$
DECLARE p TEXT:='TEST-partner-state-machine'; l TEXT; a TEXT; r JSONB; i INTEGER; total INTEGER; c INTEGER;
BEGIN
 INSERT INTO partners(id,legal_name,display_name,status,is_test) VALUES(p,'TEST ISOLATED FIXTURE','TEST ISOLATED FIXTURE','pending_verification',false);
 INSERT INTO partner_applications(id,partner_id,insurance_confirmed,pilot_acknowledged,terms_acknowledged,data_acknowledged,raw_payload,is_test)
 VALUES(p,p,true,true,true,true,'{"testFixture":true}',false);
 INSERT INTO partner_territories(id,partner_id,city) VALUES(p,p,'TESTVILLE');
 INSERT INTO partner_service_types(partner_id,service_type) VALUES(p,'AC repair');
 INSERT INTO partner_lead_types(partner_id,lead_type) VALUES(p,'all');
 FOR i IN 0..12 LOOP
  l:='TEST-lead-state-'||i;
  INSERT INTO leads(id,flow,service,city,zip,name,phone,payload_json,score,score_label,consent,qualification_status,routing_service,price_key,is_test)
   VALUES(l,'repair','AC not cooling','TESTVILLE','99999','TEST ISOLATED FIXTURE', '+1501555'||lpad(i::text,4,'0'),'{"testFixture":true}',100,'HOT REPAIR',true,'qualified','AC repair','standard_repair',i=0);
 END LOOP;
 r:=hvac_route_lead('TEST-lead-state-0');
 IF r->>'reason'<>'test_lead' OR EXISTS(SELECT 1 FROM lead_assignments WHERE lead_id='TEST-lead-state-0') THEN RAISE EXCEPTION 'FAIL test isolation'; END IF;
 r:=hvac_route_lead('TEST-lead-state-1');
 IF r->>'status'<>'awaiting_partner' OR EXISTS(SELECT 1 FROM partner_billing_ledger WHERE partner_id=p) THEN RAISE EXCEPTION 'FAIL no partner'; END IF;
 UPDATE partners SET status='pilot',approved_at=now(),license_verified_at=now(),insurance_verified_at=now(),delivery_authorized_at=now(),delivery_method='manual_verified' WHERE id=p;
 UPDATE partner_applications SET application_status='approved' WHERE partner_id=p;
 UPDATE partners SET is_test=true WHERE id=p;
 r:=hvac_route_lead('TEST-lead-state-1');
 IF r->>'status'<>'awaiting_partner' THEN RAISE EXCEPTION 'FAIL test partner eligibility'; END IF;
 UPDATE partners SET is_test=false WHERE id=p;
 FOR i IN 1..3 LOOP
  r:=hvac_route_lead('TEST-lead-state-'||i); a:=r->>'assignmentId';
  IF a IS NULL THEN RAISE EXCEPTION 'FAIL reservation % %',i,r; END IF;
  IF i=1 THEN
   r:=hvac_record_delivery(a,'',false,'TEST simulated delivery failure');
   IF r->>'status'<>'delivery_failed' OR EXISTS(SELECT 1 FROM partner_billing_ledger WHERE lead_assignment_id=a) THEN RAISE EXCEPTION 'FAIL delivery failure billing'; END IF;
  END IF;
  r:=hvac_record_delivery(a,'TEST evidence '||i,true);
  IF (r->>'amountCents')::int<>0 OR (r->>'pilotFree')::boolean IS NOT TRUE THEN RAISE EXCEPTION 'FAIL free pilot % %',i,r; END IF;
  r:=hvac_route_lead('TEST-lead-state-'||i);
  IF r->>'assignmentId'<>a THEN RAISE EXCEPTION 'FAIL exclusive idempotency'; END IF;
  r:=hvac_record_delivery(a,'TEST repeated delivery',true);
  IF r->>'status'<>'already_delivered' THEN RAISE EXCEPTION 'FAIL delivery idempotency'; END IF;
 END LOOP;
 SELECT pilot_leads_used INTO c FROM hvac_partner_usage WHERE partner_id=p;
 IF c<>3 THEN RAISE EXCEPTION 'FAIL pilot usage %',c; END IF;
 r:=hvac_route_lead('TEST-lead-state-4');
 IF r->>'status'<>'awaiting_partner' THEN RAISE EXCEPTION 'FAIL paid opt in'; END IF;
 UPDATE partners SET paid_leads_authorized_at=now() WHERE id=p;
 r:=hvac_route_lead('TEST-lead-state-4');a:=r->>'assignmentId';
 r:=hvac_record_delivery(a,'TEST fourth evidence',true);
 IF (r->>'amountCents')::int<>4900 OR (r->>'pilotFree')::boolean THEN RAISE EXCEPTION 'FAIL fourth price %',r; END IF;
 PERFORM hvac_record_disposition(a,'disputed','TEST dispute');
 SELECT amount_cents INTO total FROM partner_billing_ledger WHERE lead_assignment_id=a;
 IF total<>0 THEN RAISE EXCEPTION 'FAIL disputed billing'; END IF;
 BEGIN
  PERFORM hvac_record_disposition(a,'booked','TEST silent restoration');
  RAISE EXCEPTION 'FAIL restored dispute';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='FAIL restored dispute' THEN RAISE; END IF; END;
 UPDATE leads SET qualification_status='invalid' WHERE id='TEST-lead-state-5';
 r:=hvac_route_lead('TEST-lead-state-5');
 IF EXISTS(SELECT 1 FROM lead_assignments WHERE lead_id='TEST-lead-state-5') THEN RAISE EXCEPTION 'FAIL invalid assignment'; END IF;
 UPDATE leads SET phone=(SELECT phone FROM leads WHERE id='TEST-lead-state-1'),created_at=now()+interval '1 second' WHERE id='TEST-lead-state-6';
 r:=hvac_route_lead('TEST-lead-state-6');
 IF r->>'reason'<>'duplicate_submission' THEN RAISE EXCEPTION 'FAIL duplicate %',r; END IF;
 -- Configurable prices are snapshotted on reservation.
 UPDATE lead_price_rules SET price_cents=5100 WHERE key='standard_repair';
 r:=hvac_route_lead('TEST-lead-state-7');a:=r->>'assignmentId';
 UPDATE lead_price_rules SET price_cents=5200 WHERE key='standard_repair';
 r:=hvac_record_delivery(a,'TEST configured snapshot',true);
 IF (r->>'amountCents')::int<>5100 THEN RAISE EXCEPTION 'FAIL price snapshot %',r; END IF;
 -- Direct positive test ledger writes are rejected at the database boundary.
 UPDATE leads SET is_test=true WHERE id='TEST-lead-state-7';
 BEGIN
  UPDATE partner_billing_ledger SET amount_cents=5100 WHERE lead_assignment_id=a;
  RAISE EXCEPTION 'FAIL test ledger guard';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='FAIL test ledger guard' THEN RAISE; END IF; END;
 UPDATE leads SET is_test=false WHERE id='TEST-lead-state-7';
 FOR i IN 8..10 LOOP
  UPDATE leads SET price_key=CASE i WHEN 8 THEN 'urgent_repair' WHEN 9 THEN 'replacement' ELSE 'hot_replacement' END WHERE id='TEST-lead-state-'||i;
  r:=hvac_route_lead('TEST-lead-state-'||i);a:=r->>'assignmentId';
  r:=hvac_record_delivery(a,'TEST pricing '||i,true);
  IF (r->>'amountCents')::int <> (CASE i WHEN 8 THEN 6900 WHEN 9 THEN 9900 ELSE 12900 END) THEN RAISE EXCEPTION 'FAIL price tier % %',i,r; END IF;
 END LOOP;
 UPDATE partners SET monthly_lead_cap=0 WHERE id=p;
 r:=hvac_route_lead('TEST-lead-state-11');
 IF r->>'status'<>'awaiting_partner' THEN RAISE EXCEPTION 'FAIL zero lead cap'; END IF;
 UPDATE partners SET monthly_lead_cap=NULL,monthly_spend_cap_cents=0 WHERE id=p;
 r:=hvac_route_lead('TEST-lead-state-11');
 IF r->>'status'<>'awaiting_partner' THEN RAISE EXCEPTION 'FAIL zero spend cap'; END IF;
 UPDATE partners SET monthly_spend_cap_cents=NULL WHERE id=p;
 UPDATE leads SET city='OUTSIDE TERRITORY',zip='00000' WHERE id='TEST-lead-state-12';
 r:=hvac_route_lead('TEST-lead-state-12');
 IF r->>'status'<>'awaiting_partner' THEN RAISE EXCEPTION 'FAIL territory mismatch'; END IF;
 RAISE EXCEPTION 'HVAC_TEST_PASS_ROLLBACK';
END $$`;
try {await sql.query(body);throw Error('Test did not roll back');}
catch(e){if(e.message!=='HVAC_TEST_PASS_ROLLBACK')throw e;}
console.log('PASS: test isolation, zero partners, failed delivery, 3 free leads, pilot count, exclusive/idempotent routing and delivery, paid opt-in, fourth lead, dispute hold, invalid/duplicate exclusion, configurable price snapshot, 4 price tiers, zero caps, territory mismatch. All fixtures rolled back; no external calls.');
