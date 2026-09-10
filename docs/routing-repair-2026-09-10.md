# Production reconciliation — September 10, 2026

## Verified discrepancy

GitHub main at `439710ace72e519c5f303fd00cfc1aa96ef3aff8` included partner/routing/billing DDL inside `app/api/leads/route.ts`, not in an executed PostgreSQL migration. Its POST handler never called routing. `lib/partner-routing.ts` was an unused candidate-selection helper, not a delivery implementation. `db/schema.ts` and `drizzle/` describe legacy SQLite, not production Neon. The partner-application handler independently created a smaller partner schema, causing first-request-dependent columns. No existing routing/billing data or alternate table names were found in production.

Production: Neon project `rapid-band-08466773` (`neon-citron-cave`), branch `br-falling-morning-avn2u7dm`, database `neondb`. A uniquely named TEST application submitted to `https://www.arkansashvacconnect.com/api/partner-applications` returned application ID `59e7f427-1ab1-41a2-acf6-5407da4c8161`, which was read back from that exact database. This verifies the live application/database link without viewing or changing credentials. The test partner and application remain isolated and retained.

Jessica's lead was created September 6 at 02:41 UTC. The HighLevel sync implementation was committed at 13:19 UTC (`9ca05fb`), before the successful 13:21 UTC Test lead. The older record's pending default was added later; there was no historical backfill. There is no evidence of an attempted failed CRM request for Jessica's record. Her request remains held for review and CRM reconciliation; do not relabel it as synced without remote evidence.

## Implemented

- Explicit, additive PostgreSQL migration; existing IDs/data preserved; existing routing table names reused.
- Row/advisory locks and unique lead assignment enforce exclusivity and serialize pilot/cap accounting.
- Configurable prices in `lead_price_rules`; quoted price is copied to the assignment at reservation.
- Validation and normalized service categories match partner form categories.
- No eligible partner: retain lead as `awaiting_partner`, create no assignment or billable ledger.
- Approved/verified partner, application acknowledgments, coverage, capacity, and delivery authorization required.
- Manual verified delivery is the minimum supported channel. Recording evidence is separate from transmitting a lead. No automatic email/SMS transport is installed or enabled by this repair.
- Successful qualified delivery produces a $0 pilot ledger for the first three; subsequent leads require explicit paid-lead agreement and use the configured price. A ledger does not execute payment.
- Disputed/invalid/duplicate/rejected dispositions hold or void billing and require review before any restoration.
- Test partner/application/lead exclusions; production partner usage view excludes test data.
- Partner application inserts are atomic and reject empty lead preferences; test detection recognizes `TestingHvacLLC`.
- CRM sync persists remote IDs stage-by-stage, searches existing opportunities before creation, and stops after an ambiguous creation attempt. Unfinished locks require controlled review, never blind retry.
- Authenticated operations endpoint is disabled unless `HVAC_OPERATIONS_TOKEN` is set to at least 32 characters. No public approval/delivery/billing endpoint exists.

## Deployment and operation

Apply `migrations/postgres/001_routing.sql` in one transaction using `scripts/migrate-postgres.mjs` with `DATABASE_URL` and an independently verified `EXPECTED_DATABASE_HOST`. This script does not print credentials. Do not run SQLite migrations against Neon. Rollback application code independently; retain added tables and audit data rather than dropping them.

Use authenticated `POST /api/operations` actions `route`, `delivery`, `disposition`, or `sync` with the existing lead/assignment ID. Delivery needs an actual external delivery evidence reference and a boolean success flag. It never sends a message itself. Never record success merely because CRM sync succeeded.

For the first contractor: obtain application; verify license and insurance and record timestamps/evidence; verify coverage, service/lead types, delivery email, and caps; confirm pilot terms and the permitted delivery channel. Then call privileged `hvac_approve_partner(partner_id,evidence,'manual_verified',allow_paid)` after real verification. `allow_paid` means agreed paid lead supply, not permission to charge. Leave false if they chose to decide after the pilot. Do not fabricate verification timestamps.

Manual delivery procedure: reserve via `route`; independently deliver to that assigned contractor through the agreed channel only when authorized; record its message/receipt reference via `delivery`; record contractor feedback via `disposition`. Failed transmission stays reserved with a failed delivery record and no ledger charge. Repeated successful confirmation is idempotent.

Climate Warriors outreach must not be resent. HighLevel search still returns 401 scope/auth-class denial, so current replies/status are unverified. Vercel connected-app lookup returns no teams and a 403 for the existing team/project. GitHub reports a successful prior Vercel deployment; live database linkage is separately confirmed above.

## Verification

Isolated branch: `br-hidden-lake-avwwu5om` (`routing-repair-20260910`). Tests never use CRM credentials or payment services. State-machine fixtures are clearly TEST named; non-test flags are simulated only on this isolated branch to exercise production billing rules. Transaction tests roll back; concurrency/API fixtures are retained but quarantined as test and any simulated balance is voided.

- State machine: tests/exclusions; no approved partner; failed delivery; 3 free deliveries; derived pilot usage; fourth paid lead; opt-in gate; all four prices; pricing snapshot; disputes; invalid/duplicate leads; zero lead/spend caps; territory mismatch.
- Concurrency: eight simultaneous same-lead requests yield one assignment; four simultaneous deliveries yield exactly three free and one billable record.
- API handlers: invalid consent rejected; test CRM skipped; lead retained when CRM unavailable; unauthenticated operations rejected; test partner classification.
- Input unit tests and production Next.js build/typecheck.
