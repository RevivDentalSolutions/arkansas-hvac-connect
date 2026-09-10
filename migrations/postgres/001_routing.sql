-- Explicit additive Postgres migration. Legacy drizzle/ is SQLite only.
-- Apply in one transaction after verifying the target database.
CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      flow TEXT NOT NULL,
      service TEXT NOT NULL,
      city TEXT,
      zip TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      contact_method TEXT,
      payload_json TEXT NOT NULL,
      landing_page TEXT,
      page_url TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      utm_content TEXT,
      channel TEXT,
      score INTEGER NOT NULL,
      score_label TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      consent BOOLEAN NOT NULL DEFAULT FALSE,
      highlevel_sync_status TEXT NOT NULL DEFAULT 'pending',
      highlevel_contact_id TEXT,
      highlevel_opportunity_id TEXT,
      highlevel_last_error TEXT,
      highlevel_synced_at TIMESTAMPTZ
    );

ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_sync_status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_contact_id TEXT;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_opportunity_id TEXT;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_last_error TEXT;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_synced_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      legal_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      primary_contact_name TEXT,
      email TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'applicant',
      delivery_priority INTEGER NOT NULL DEFAULT 0,
      monthly_lead_cap INTEGER,
      monthly_spend_cap_cents INTEGER,
      free_pilot_lead_limit INTEGER NOT NULL DEFAULT 3,
      pilot_started_at TIMESTAMPTZ,
      license_verified_at TIMESTAMPTZ,
      insurance_verified_at TIMESTAMPTZ,
      delivery_method TEXT,
      billing_contact_email TEXT,
      notes TEXT
    );

CREATE TABLE IF NOT EXISTS partner_service_types (
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      service_type TEXT NOT NULL,
      PRIMARY KEY (partner_id, service_type)
    );

CREATE TABLE IF NOT EXISTS partner_territories (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      city TEXT,
      zip TEXT,
      CHECK (city IS NOT NULL OR zip IS NOT NULL),
      UNIQUE (partner_id, city, zip)
    );

CREATE TABLE IF NOT EXISTS partner_lead_types (
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      lead_type TEXT NOT NULL,
      PRIMARY KEY (partner_id, lead_type)
    );

CREATE TABLE IF NOT EXISTS lead_assignments (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL UNIQUE REFERENCES leads(id) ON DELETE RESTRICT,
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      delivered_at TIMESTAMPTZ,
      accepted_at TIMESTAMPTZ,
      rejected_at TIMESTAMPTZ,
      disputed_at TIMESTAMPTZ,
      assignment_status TEXT NOT NULL DEFAULT 'reserved',
      contractor_disposition TEXT NOT NULL DEFAULT 'pending',
      billable_status TEXT NOT NULL DEFAULT 'pending',
      price_key TEXT NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0,
      pilot_free BOOLEAN NOT NULL DEFAULT FALSE,
      delivery_reference TEXT,
      rejection_reason TEXT,
      dispute_reason TEXT
    );

CREATE TABLE IF NOT EXISTS lead_price_rules (
      key TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS partner_billing_ledger (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
      lead_assignment_id TEXT UNIQUE REFERENCES lead_assignments(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      invoice_reference TEXT,
      paid_at TIMESTAMPTZ,
      voided_at TIMESTAMPTZ,
      dispute_reason TEXT
    );

CREATE INDEX IF NOT EXISTS lead_assignments_partner_status_idx ON lead_assignments (partner_id, assignment_status, delivered_at);

CREATE INDEX IF NOT EXISTS partners_status_priority_idx ON partners (status, delivery_priority DESC);

INSERT INTO lead_price_rules (key, label, price_cents)
      VALUES
        ('standard_repair', 'Standard repair', 4900),
        ('urgent_repair', 'Urgent repair', 6900),
        ('replacement', 'Replacement', 9900),
        ('hot_replacement', 'High-intent / hot replacement', 12900)
      ON CONFLICT (key) DO NOTHING;

-- Reconcile columns omitted by the partner application's CREATE TABLE.
ALTER TABLE partners ADD COLUMN IF NOT EXISTS pilot_started_at TIMESTAMPTZ;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS license_verified_at TIMESTAMPTZ;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS insurance_verified_at TIMESTAMPTZ;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS delivery_authorized_at TIMESTAMPTZ;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS paid_leads_authorized_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS partner_applications (
 id TEXT PRIMARY KEY, partner_id TEXT NOT NULL UNIQUE REFERENCES partners(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), application_status TEXT NOT NULL DEFAULT 'pending_verification',
 insurance_confirmed BOOLEAN NOT NULL, pilot_acknowledged BOOLEAN NOT NULL,
 terms_acknowledged BOOLEAN NOT NULL, data_acknowledged BOOLEAN NOT NULL,
 monthly_spend_preference TEXT, raw_payload JSONB NOT NULL, is_test BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS routing_status TEXT NOT NULL DEFAULT 'awaiting_review';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS routing_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_status TEXT NOT NULL DEFAULT 'review';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS routing_service TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS price_key TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS duplicate_of TEXT REFERENCES leads(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_attempted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_note_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_sync_lock TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_opportunity_attempted_at TIMESTAMPTZ;
ALTER TABLE lead_assignments ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE partner_billing_ledger ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE partner_billing_ledger ADD COLUMN IF NOT EXISTS reason TEXT;
CREATE TABLE IF NOT EXISTS lead_deliveries (
 id TEXT PRIMARY KEY, lead_assignment_id TEXT NOT NULL REFERENCES lead_assignments(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), status TEXT NOT NULL DEFAULT 'pending'
 CHECK(status IN ('pending','failed','delivered')),
 method TEXT NOT NULL, reference TEXT, error TEXT, is_test BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX IF NOT EXISTS lead_delivery_success_idx ON lead_deliveries(lead_assignment_id) WHERE status='delivered';
CREATE TABLE IF NOT EXISTS lead_events (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), event TEXT NOT NULL, detail TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_routing_queue_idx ON leads(routing_status,created_at);
CREATE INDEX IF NOT EXISTS leads_contact_dedupe_idx ON leads ((regexp_replace(phone,'[^0-9]','','g')),created_at);
CREATE TABLE IF NOT EXISTS hvac_schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

-- Defense in depth: even a direct insert cannot create a positive test ledger.
CREATE OR REPLACE FUNCTION hvac_guard_ledger() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE a lead_assignments; l leads; p partners;
BEGIN
 SELECT * INTO a FROM lead_assignments WHERE id=NEW.lead_assignment_id;
 SELECT * INTO l FROM leads WHERE id=a.lead_id;
 SELECT * INTO p FROM partners WHERE id=a.partner_id;
 IF a.id IS NULL OR NEW.partner_id IS DISTINCT FROM a.partner_id THEN RAISE EXCEPTION 'Ledger assignment mismatch'; END IF;
 NEW.is_test := NEW.is_test OR a.is_test OR l.is_test OR p.is_test OR EXISTS(SELECT 1 FROM partner_applications WHERE partner_id=p.id AND is_test);
 IF NEW.amount_cents < 0 THEN RAISE EXCEPTION 'Negative ledger amount'; END IF;
 IF NEW.amount_cents > 0 AND (
   NEW.is_test OR l.qualification_status <> 'qualified' OR l.duplicate_of IS NOT NULL
   OR a.assignment_status NOT IN ('delivered','accepted') OR a.delivered_at IS NULL
   OR a.contractor_disposition IN ('invalid','duplicate','disputed','rejected')
   OR a.billable_status <> 'billable' OR a.pilot_free
   OR p.approved_at IS NULL OR p.status NOT IN ('approved','pilot','active')
   OR p.paid_leads_authorized_at IS NULL OR NEW.amount_cents <> a.price_cents
 ) THEN RAISE EXCEPTION 'Unsafe billable ledger entry'; END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER hvac_ledger_safety BEFORE INSERT OR UPDATE ON partner_billing_ledger FOR EACH ROW EXECUTE FUNCTION hvac_guard_ledger();

-- One transaction per route; the advisory lock serializes eligibility/cap checks,
-- duplicate detection, reservations and pilot accounting at this small scale.
CREATE OR REPLACE FUNCTION hvac_route_lead(p_lead_id TEXT) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE l leads; p partners; candidate partners; a lead_assignments; v_price INTEGER; v_key TEXT;
 v_count INTEGER; v_month_count INTEGER; v_month_spend INTEGER; v_free BOOLEAN; v_reason TEXT;
BEGIN
 PERFORM pg_advisory_xact_lock(728194031);
 SELECT * INTO l FROM leads WHERE id=p_lead_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown lead'; END IF;
 SELECT * INTO a FROM lead_assignments WHERE lead_id=l.id;
 IF FOUND THEN RETURN jsonb_build_object('status',a.assignment_status,'assignmentId',a.id); END IF;
 IF l.is_test THEN v_reason:='test_lead';
 ELSIF l.duplicate_of IS NOT NULL OR l.qualification_status='duplicate' THEN v_reason:='duplicate';
 ELSIF l.qualification_status <> 'qualified' OR NOT l.consent THEN v_reason:='qualification_required';
 ELSIF l.routing_service IS NULL OR l.price_key IS NULL THEN v_reason:='classification_required';
 END IF;
 IF v_reason IS NOT NULL THEN
  UPDATE leads SET routing_status=CASE WHEN l.is_test THEN 'test_excluded' ELSE 'awaiting_review' END, routing_reason=v_reason WHERE id=l.id;
  RETURN jsonb_build_object('status','excluded','reason',v_reason);
 END IF;
 -- A second submission for the same phone/service in 30 days requires review.
 SELECT id INTO l.duplicate_of FROM leads WHERE id<>l.id AND NOT is_test
   AND regexp_replace(phone,'[^0-9]','','g')=regexp_replace(l.phone,'[^0-9]','','g')
   AND flow=l.flow AND routing_service=l.routing_service
   AND created_at >= l.created_at - interval '30 days'
   AND (created_at,id) < (l.created_at,l.id) ORDER BY created_at LIMIT 1;
 IF l.duplicate_of IS NOT NULL THEN
  UPDATE leads SET duplicate_of=l.duplicate_of,qualification_status='duplicate',routing_status='awaiting_review',routing_reason='duplicate_submission' WHERE id=l.id;
  RETURN jsonb_build_object('status','awaiting_review','reason','duplicate_submission');
 END IF;
 SELECT price_cents INTO v_price FROM lead_price_rules WHERE key=l.price_key AND active AND price_cents>=0;
 IF NOT FOUND THEN
  UPDATE leads SET routing_status='awaiting_review',routing_reason='price_rule_missing' WHERE id=l.id;
  RETURN jsonb_build_object('status','awaiting_review','reason','price_rule_missing');
 END IF;
 v_key := CASE WHEN l.price_key='urgent_repair' THEN 'urgent' ELSE l.flow END;
 FOR candidate IN SELECT pp.* FROM partners pp
  WHERE pp.status IN ('approved','pilot','active') AND NOT pp.is_test
   AND pp.approved_at IS NOT NULL AND pp.license_verified_at IS NOT NULL AND pp.insurance_verified_at IS NOT NULL
   AND pp.delivery_authorized_at IS NOT NULL AND pp.delivery_method IS NOT NULL
   AND EXISTS(SELECT 1 FROM partner_applications pa WHERE pa.partner_id=pp.id AND NOT pa.is_test AND pa.application_status='approved' AND pa.pilot_acknowledged AND pa.terms_acknowledged AND pa.data_acknowledged AND pa.insurance_confirmed)
   AND EXISTS(SELECT 1 FROM partner_service_types ps WHERE ps.partner_id=pp.id AND ps.service_type IN (l.routing_service,'all'))
   AND EXISTS(SELECT 1 FROM partner_lead_types pt WHERE pt.partner_id=pp.id AND pt.lead_type IN (v_key,'all'))
   AND EXISTS(SELECT 1 FROM partner_territories t WHERE t.partner_id=pp.id AND ((t.zip IS NOT NULL AND t.zip=left(l.zip,5)) OR (t.city IS NOT NULL AND lower(trim(t.city))=lower(trim(l.city)))))
  ORDER BY pp.delivery_priority DESC,(SELECT count(*) FROM lead_assignments x WHERE x.partner_id=pp.id AND x.created_at>=date_trunc('month',now()) AND x.assignment_status NOT IN ('cancelled','rejected','disputed')),pp.id
 LOOP
  SELECT count(*) INTO v_count FROM lead_assignments WHERE partner_id=candidate.id AND NOT is_test
    AND assignment_status NOT IN ('cancelled','rejected','disputed') AND contractor_disposition NOT IN ('invalid','duplicate','disputed','rejected');
  v_free := v_count < candidate.free_pilot_lead_limit;
  IF NOT v_free AND candidate.paid_leads_authorized_at IS NULL THEN CONTINUE; END IF;
  SELECT count(*),COALESCE(sum(CASE WHEN pilot_free THEN 0 ELSE price_cents END),0) INTO v_month_count,v_month_spend
   FROM lead_assignments WHERE partner_id=candidate.id AND NOT is_test AND created_at>=date_trunc('month',now())
   AND assignment_status NOT IN ('cancelled','rejected','disputed');
  IF candidate.monthly_lead_cap IS NOT NULL AND v_month_count>=candidate.monthly_lead_cap THEN CONTINUE; END IF;
  IF candidate.monthly_spend_cap_cents IS NOT NULL AND v_month_spend+(CASE WHEN v_free THEN 0 ELSE v_price END)>candidate.monthly_spend_cap_cents THEN CONTINUE; END IF;
  p:=candidate; EXIT;
 END LOOP;
 IF p.id IS NULL THEN
  UPDATE leads SET routing_status='awaiting_partner',routing_reason='no_eligible_approved_partner_or_capacity' WHERE id=l.id;
  INSERT INTO lead_events(lead_id,event,detail) VALUES(l.id,'awaiting_partner','No eligible approved partner with capacity and delivery authorization');
  RETURN jsonb_build_object('status','awaiting_partner');
 END IF;
 INSERT INTO lead_assignments(id,lead_id,partner_id,price_key,price_cents,pilot_free)
 VALUES(gen_random_uuid()::text,l.id,p.id,l.price_key,v_price,v_free) RETURNING * INTO a;
 INSERT INTO lead_deliveries(id,lead_assignment_id,method) VALUES(gen_random_uuid()::text,a.id,p.delivery_method);
 UPDATE leads SET routing_status='reserved',routing_reason='awaiting_confirmed_delivery' WHERE id=l.id;
 INSERT INTO lead_events(lead_id,event,detail) VALUES(l.id,'reserved',a.id);
 RETURN jsonb_build_object('status','reserved','assignmentId',a.id,'partnerId',p.id);
END $$;

CREATE OR REPLACE FUNCTION hvac_record_delivery(p_assignment_id TEXT,p_reference TEXT,p_success BOOLEAN,p_error TEXT DEFAULT NULL) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE a lead_assignments; l leads; p partners; v_used INTEGER; v_amount INTEGER; v_free BOOLEAN; v_committed_spend INTEGER;
BEGIN
 PERFORM pg_advisory_xact_lock(728194031);
 SELECT * INTO a FROM lead_assignments WHERE id=p_assignment_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown assignment'; END IF;
 IF a.delivered_at IS NOT NULL THEN RETURN jsonb_build_object('status','already_delivered'); END IF;
 SELECT * INTO l FROM leads WHERE id=a.lead_id;
 SELECT * INTO p FROM partners WHERE id=a.partner_id;
 IF a.is_test OR l.is_test OR p.is_test OR EXISTS(SELECT 1 FROM partner_applications WHERE partner_id=p.id AND is_test)
  OR l.qualification_status<>'qualified' OR l.duplicate_of IS NOT NULL OR NOT l.consent
  OR p.status NOT IN ('approved','pilot','active') OR p.approved_at IS NULL OR p.delivery_authorized_at IS NULL
  OR p.license_verified_at IS NULL OR p.insurance_verified_at IS NULL OR a.assignment_status<>'reserved'
  THEN RAISE EXCEPTION 'Lead or partner is ineligible for delivery'; END IF;
 IF NOT p_success THEN
  INSERT INTO lead_deliveries(id,lead_assignment_id,status,method,error) VALUES(gen_random_uuid()::text,a.id,'failed',p.delivery_method,left(p_error,500));
  UPDATE leads SET routing_reason='delivery_failed_requires_retry' WHERE id=l.id;
  RETURN jsonb_build_object('status','delivery_failed');
 END IF;
 IF nullif(trim(p_reference),'') IS NULL THEN RAISE EXCEPTION 'Delivery evidence reference required'; END IF;
 SELECT count(*) INTO v_used FROM lead_assignments WHERE partner_id=p.id AND delivered_at IS NOT NULL AND pilot_free
  AND NOT is_test AND assignment_status NOT IN ('rejected','disputed','cancelled') AND contractor_disposition NOT IN ('invalid','duplicate','disputed','rejected');
 v_free:=v_used<p.free_pilot_lead_limit;
 IF NOT v_free AND p.paid_leads_authorized_at IS NULL THEN RAISE EXCEPTION 'Paid leads not authorized'; END IF;
 v_amount:=CASE WHEN v_free THEN 0 ELSE a.price_cents END;
 SELECT COALESCE(sum(CASE WHEN pilot_free THEN 0 ELSE price_cents END),0) INTO v_committed_spend
 FROM lead_assignments WHERE partner_id=p.id AND id<>a.id AND NOT is_test AND created_at>=date_trunc('month',now())
 AND assignment_status NOT IN ('cancelled','rejected','disputed');
 IF p.monthly_spend_cap_cents IS NOT NULL AND v_committed_spend+v_amount>p.monthly_spend_cap_cents THEN RAISE EXCEPTION 'Delivery would exceed agreed spend cap'; END IF;
 IF NOT EXISTS(SELECT 1 FROM partner_applications WHERE partner_id=p.id AND application_status='approved' AND NOT is_test AND terms_acknowledged AND pilot_acknowledged AND data_acknowledged AND insurance_confirmed) THEN RAISE EXCEPTION 'Application no longer approved'; END IF;
 UPDATE lead_assignments SET delivered_at=now(),assignment_status='delivered',delivery_reference=p_reference,pilot_free=v_free,
  billable_status=CASE WHEN v_free THEN 'waived' ELSE 'billable' END WHERE id=a.id;
 INSERT INTO lead_deliveries(id,lead_assignment_id,status,method,reference) VALUES(gen_random_uuid()::text,a.id,'delivered',p.delivery_method,p_reference);
 UPDATE lead_deliveries SET status='failed',error='Superseded by confirmed delivery' WHERE lead_assignment_id=a.id AND status='pending';
 INSERT INTO partner_billing_ledger(id,partner_id,lead_assignment_id,amount_cents,status,reason)
 VALUES(gen_random_uuid()::text,p.id,a.id,v_amount,CASE WHEN v_free THEN 'waived' ELSE 'billable' END,
 CASE WHEN v_free THEN 'Founding pilot qualified delivered lead' ELSE 'Qualified delivered lead; ledger only, no payment authorized' END);
 UPDATE leads SET routing_status='delivered',routing_reason=NULL WHERE id=l.id;
 INSERT INTO lead_events(lead_id,event,detail) VALUES(l.id,'delivered',p_reference);
 RETURN jsonb_build_object('status','delivered','pilotFree',v_free,'amountCents',v_amount);
END $$;

CREATE OR REPLACE FUNCTION hvac_record_disposition(p_assignment_id TEXT,p_disposition TEXT,p_reason TEXT) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE a lead_assignments; blocked BOOLEAN;
BEGIN
 PERFORM pg_advisory_xact_lock(728194031);
 IF p_disposition NOT IN ('contacted','booked','not_booked','invalid','duplicate','disputed','rejected') THEN RAISE EXCEPTION 'Invalid disposition'; END IF;
 IF nullif(trim(p_reason),'') IS NULL THEN RAISE EXCEPTION 'Reason required'; END IF;
 SELECT * INTO a FROM lead_assignments WHERE id=p_assignment_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown assignment'; END IF;
 blocked:=p_disposition IN ('invalid','duplicate','disputed','rejected');
 IF a.contractor_disposition IN ('invalid','duplicate','disputed','rejected') AND NOT blocked THEN RAISE EXCEPTION 'Blocked lead requires explicit review; cannot silently restore billing'; END IF;
 -- Zero out ledger before changing qualification; historical quoted price remains on assignment and in events.
 IF blocked THEN
  UPDATE partner_billing_ledger SET amount_cents=0,status=CASE WHEN p_disposition='disputed' THEN 'disputed' ELSE 'void' END,
   voided_at=now(),dispute_reason=p_reason,reason='Held or voided after contractor disposition' WHERE lead_assignment_id=a.id;
 END IF;
 UPDATE lead_assignments SET contractor_disposition=p_disposition,
  assignment_status=CASE WHEN blocked THEN CASE WHEN p_disposition='disputed' THEN 'disputed' ELSE 'rejected' END ELSE assignment_status END,
  billable_status=CASE WHEN blocked THEN CASE WHEN p_disposition='disputed' THEN 'disputed' ELSE 'void' END ELSE billable_status END,
  disputed_at=CASE WHEN p_disposition='disputed' THEN now() ELSE disputed_at END,
  rejected_at=CASE WHEN blocked AND p_disposition<>'disputed' THEN now() ELSE rejected_at END,
  dispute_reason=CASE WHEN p_disposition='disputed' THEN p_reason ELSE dispute_reason END,
  rejection_reason=CASE WHEN blocked AND p_disposition<>'disputed' THEN p_reason ELSE rejection_reason END WHERE id=a.id;
 IF blocked THEN UPDATE leads SET qualification_status=CASE WHEN p_disposition='disputed' THEN 'disputed' ELSE 'invalid' END,
  routing_status='awaiting_review',routing_reason=p_reason WHERE id=a.lead_id; END IF;
 INSERT INTO lead_events(lead_id,event,detail) VALUES(a.lead_id,'disposition_'||p_disposition,p_reason||'; prior quoted cents='||a.price_cents);
 RETURN jsonb_build_object('status',p_disposition);
END $$;

-- Metrics exclude test records; pilot usage is derived from accepted delivery facts, never a mutable counter.
CREATE OR REPLACE VIEW hvac_partner_usage AS
 SELECT p.id AS partner_id,
 (SELECT count(*) FROM lead_assignments a WHERE a.partner_id=p.id AND NOT a.is_test AND a.pilot_free AND a.delivered_at IS NOT NULL
  AND a.assignment_status NOT IN ('rejected','disputed','cancelled') AND a.contractor_disposition NOT IN ('invalid','duplicate','disputed','rejected')) AS pilot_leads_used,
 (SELECT COALESCE(sum(b.amount_cents),0) FROM partner_billing_ledger b WHERE b.partner_id=p.id AND NOT b.is_test AND b.status='billable') AS recorded_billable_cents
 FROM partners p WHERE NOT p.is_test AND NOT EXISTS(SELECT 1 FROM partner_applications pa WHERE pa.partner_id=p.id AND pa.is_test);

-- These are privileged operational functions, never callable anonymously through a data API.
REVOKE ALL ON FUNCTION hvac_route_lead(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION hvac_record_delivery(TEXT,TEXT,BOOLEAN,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION hvac_record_disposition(TEXT,TEXT,TEXT) FROM PUBLIC;
INSERT INTO hvac_schema_migrations(version) VALUES('001_routing') ON CONFLICT DO NOTHING;

-- Approval records the human verification, never infers it from a checked form box.
CREATE OR REPLACE FUNCTION hvac_approve_partner(p_partner_id TEXT,p_evidence TEXT,p_delivery_method TEXT,p_allow_paid BOOLEAN DEFAULT FALSE) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE p partners;
BEGIN
 PERFORM pg_advisory_xact_lock(728194031);
 SELECT * INTO p FROM partners WHERE id=p_partner_id FOR UPDATE;
 IF NOT FOUND OR p.is_test OR p.legal_name ~* '^test' OR EXISTS(SELECT 1 FROM partner_applications WHERE partner_id=p.id AND is_test) THEN RAISE EXCEPTION 'Unknown or test partner'; END IF;
 IF p.license_verified_at IS NULL OR p.insurance_verified_at IS NULL OR nullif(trim(p_evidence),'') IS NULL THEN RAISE EXCEPTION 'License and insurance verification evidence required'; END IF;
 IF p_delivery_method<>'manual_verified' OR nullif(trim(p.billing_contact_email),'') IS NULL THEN RAISE EXCEPTION 'Verified manual delivery destination required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM partner_applications WHERE partner_id=p.id AND NOT is_test AND insurance_confirmed AND pilot_acknowledged AND terms_acknowledged AND data_acknowledged)
 OR NOT EXISTS(SELECT 1 FROM partner_service_types WHERE partner_id=p.id)
 OR NOT EXISTS(SELECT 1 FROM partner_lead_types WHERE partner_id=p.id)
 OR NOT EXISTS(SELECT 1 FROM partner_territories WHERE partner_id=p.id) THEN RAISE EXCEPTION 'Incomplete application or coverage'; END IF;
 UPDATE partners SET status='pilot',approved_at=now(),pilot_started_at=COALESCE(pilot_started_at,now()),
 delivery_authorized_at=now(),delivery_method=p_delivery_method,
 paid_leads_authorized_at=CASE WHEN p_allow_paid THEN now() ELSE NULL END,
 notes=COALESCE(notes,'')||E'\nApproval evidence: '||p_evidence,updated_at=now() WHERE id=p.id;
 UPDATE partner_applications SET application_status='approved' WHERE partner_id=p.id;
 RETURN jsonb_build_object('status','pilot','freeLeadLimit',p.free_pilot_lead_limit,'paidLeadsAuthorized',p_allow_paid);
END $$;
REVOKE ALL ON FUNCTION hvac_approve_partner(TEXT,TEXT,TEXT,BOOLEAN) FROM PUBLIC;
