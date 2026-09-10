# Lead architecture

The production application uses Neon PostgreSQL through `DATABASE_URL`.
`POST /api/leads` validates and persists first, then calls `hvac_route_lead` and
attempts CRM sync. Once saved, routing/CRM failures do not turn the response into
an invitation to resubmit. `awaiting_partner` is a durable queue state.

`migrations/postgres/001_routing.sql` defines the PostgreSQL routing state machine.
The older `db/schema.ts`, `drizzle/`, and D1 hosting declaration belong to the
original Sites/SQLite scaffold and are not production PostgreSQL migrations.
Do not use `db:generate` or SQLite migrations to manage Neon.

HighLevel is a CRM mirror, never the source of truth for assignment or billing.
See `docs/routing-repair-2026-09-10.md` for verified state, deployment and operation.
