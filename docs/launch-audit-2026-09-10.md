# Launch audit — 2026-09-10

## Evidence and limits

Inspected GitHub main commit 439710ace72e519c5f303fd00cfc1aa96ef3aff8, the recursive repository tree, both intake endpoints, routing helper, both forms, partner operations, partner terms, robots and sitemap. GitHub reports a successful Vercel deployment for this commit on September 6. That is deployment evidence, not a current live health check.

Public-site retrieval was unavailable in this session. Mobile rendering, live HTTP responses, indexing, and conversion behavior remain unverified. HighLevel returned HTTP 401 for the read request. Neon is not connected, so actual schema, counts, eligible partners, stored consent, CRM workflows, replies and delivery history were NOT inspected. No database migration, lead submission, outreach, charge, activation or production deployment was performed.

The source is newer than the phase-three commit referenced in the brief. It already includes partner terms, a partner information page, and expanded homeowner content; do not recreate these.

## Priority answer

The repository intake path stops after Neon insertion and CRM synchronization. It does not invoke partner selection, reserve an assignment, send a contractor notification, record delivery, increment a pilot allowance, or write a charge. The existing tables and pure selection helper are foundations, not an operating referral engine. Independent database jobs or external workflows could exist; they require live inspection before implementing competing infrastructure.

## Lead-to-payment trace

| Step | Repository evidence | Remaining requirement |
| --- | --- | --- |
| Receive | POST /api/leads inserts into Neon before CRM sync | Recheck production safely after active communications are known |
| Validate | Only four fields are checked for truthiness | Typed payload validation, genuine contact data, consent, qualification, duplicate handling |
| Classify | Score and price-key helper exist | Price helper is not invoked by intake; reconcile urgency with contractor opt-in |
| Territory | City/ZIP matching helper exists | Inspect actual coverage and approved partners |
| Eligible contractor | Pure service/flow/location filter exists | Load verified, non-test pilot/active partners from actual schema |
| Exclusive assignment | lead_id has UNIQUE constraint in source DDL | Transactional reservation and concurrency handling are absent from intake |
| Pilot | Limit field and pilot_free assignment flag exist | Atomic allowance reservation/finalization; failures and disputes must not double-count |
| Deliver | Assignment contains delivery_reference and delivered_at | Authorized delivery channel, retry/idempotency and provider evidence |
| Disposition | Text column exists | Authenticated contractor update path, ownership checks and audit history |
| Dispute | Status/reason fields exist | Review path, billing hold and controlled resolution |
| Billable | Price rules and assignment pricing columns exist | Snapshot price and apply agreed qualification/pilot rules only after confirmed delivery |
| Paid | Billing ledger has invoice reference and paid_at | Approved payment method, reconciliation and collection; no financial action authorized |

## P0 — operating blockers

1. Inspect Neon and HighLevel first. Confirm whether any verified pilot/active partner actually exists, their territories, capacity, delivery destination, test flags and current workflows. Do not infer approval from a prospect or application.
2. Build the assignment/delivery path against the verified schema. Lock partner capacity and pilot reservations in the transaction as well as enforcing unique lead assignment. Concurrent distinct leads must not exceed caps. Retrying a delivery must reuse the same assignment and delivery idempotency key.
3. Resolve the taxonomy mismatch. Homeowners submit symptoms such as "AC not cooling" and "Replace AC"; partners select "AC repair" and "System replacement". Exact string matching currently cannot connect these. Preserve the original symptom and map to a separate canonical service. Ambiguous symptoms stay in review. Emergency acceptance must be explicit: the application stores "urgent" while homeowner flow remains "repair".
4. Harden lead validation and consent handling. The form uses required attributes inside a div with a click handler, so native form validation is not invoked. The server does not require consent=true and Boolean("false") records true. Establish strict validated values before CRM tags or routing.
5. Reconcile divergent partners table definitions. The lead endpoint creates verification/delivery fields without website/license_number; the application endpoint creates website/license_number without verification/delivery fields. CREATE TABLE IF NOT EXISTS does not reconcile an existing table. Actual production schema may already include both sets; inspect before preparing a migration.
6. Make application writes atomic and idempotent after schema inspection. Current sequential inserts can leave a partial partner without a complete application. Repeat submissions can create duplicate applicants. Do not delete suspected duplicates automatically.

## P1 — revenue blockers

- No end-to-end delivery evidence or billable-ledger transition is implemented in the inspected intake path.
- Establish a hold after three free qualified delivered leads until paid participation and applicable limits are explicitly accepted; an application is not authorization to charge.
- Implement failed CRM-sync retry with step-level saved external IDs and duplicate protection. Current code records contact/opportunity IDs only after the entire sequence succeeds.
- Distinguish invalid, duplicate, disputed, credited, paid and pilot-free outcomes. A retry must not create a second debit; historical prices must remain immutable.
- Verify current terms and resolve operational ambiguity about whether a disputed pilot lead reserves a slot while review is pending. Use a hold until resolved; do not invent a refund or dispute deadline.

## P2 — growth

- Restore reliable operations and contractor supply before acquiring more homeowner traffic.
- Attribution fields exist, but source inspection did not establish an analytics event pipeline.
- Verify robots/sitemap and mobile forms in production. The application and partner terms are excluded by robots; homeowner content is intended to be indexable.
- Check Climate Warriors' actual conversation and opportunity before drafting a contextual follow-up. No reply status is known and the initial email must not be resent.
- Reverify researched prospect details only when preparing that prospect for outreach; deduplicate against CRM before adding.

## P3 — defer

Visual redesign, extra lead products, additional paid services and nonessential dashboards.

## Prepared changes

The unused routing helper now rejects missing/unapproved status, explicit test partners, invalid prices and unsupported lead flows. Zero is enforced as a real cap; null/undefined remain uncapped. A zero spend cap can still permit a zero-cost pilot lead if lead capacity permits. Callers must supply status and propagate the application test flag when candidate loading is built. This helper is not a substitute for server-side license/insurance verification, qualification, transactional cap checks or an authorization boundary.

Seven regression tests pass under Node 24.19.0. Six fail against the original helper, demonstrating the changes catch real behavior. Run with Node >=22.18 (native TypeScript stripping) using node --test tests/partner-routing.test.mjs. The full Next.js build and live integration tests have not been run for this draft.

## Safe acceptance test before activation

Use an isolated test database and a delivery stub, with no real contacts or provider sends. Cover: pending/test/unverified candidates excluded; out-of-area and ambiguous service held; zero caps enforced; concurrent requests honor caps and pilot limit; duplicate submission returns one assignment; provider timeout leaves delivery uncertain and held; retries do not send twice or debit twice; disputes hold billing; fourth pilot lead held without paid acceptance; contractor cannot access another partner's lead; unauthorized callbacks rejected. Only then run an owner-approved controlled integration test after inspecting active communications.

## Next three actions

1. Restore Neon and HighLevel read access; inventory live schema, eligible partners, workflows and the existing contractor conversation.
2. Reconcile schema and service classification, then implement transactional assignment plus approved delivery and evidence capture.
3. Complete one verified founding-partner onboarding and an isolated full-path test; approve paid participation and payment setup separately.

## Needs Jess

Connect Neon to the existing project and repair/re-authorize the HighLevel connection that returned 401. Later decisions: approve a verified pilot partner and contractor delivery channel; approve paid terms/payment setup only after the free-pilot path works. No need to purchase anything to perform the audit.
