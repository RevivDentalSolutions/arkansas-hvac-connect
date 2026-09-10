# Arkansas HVAC Connect partner operations

## Current state

The live homeowner flow saves every request in Neon before HighLevel is updated.
Routing is implemented in the explicit PostgreSQL migration. With zero eligible
partners, new qualified leads remain awaiting_partner. No contractor can receive
a lead until approval and delivery authorization are recorded. Delivery is
manual and evidence-based; no outbound transport is enabled. See
`routing-repair-2026-09-10.md` for the verified repair and operations procedure.

## Partner data required for onboarding

- Legal business name, operating name, primary contact, business email, and
  business phone
- Arkansas license/insurance details and the date they were verified
- Service types accepted (for example, repair, replacement, heat pump, heating,
  emergency)
- Cities and ZIP codes covered
- Lead types accepted (repair, replacement, both)
- Delivery priority and whether the partner is pilot, active, or inactive
- Monthly lead cap and monthly spend cap
- Pilot start date and the acknowledgment that the first three qualified,
  delivered leads are free
- Preferred future delivery method and billing contact. Do not collect payment
  credentials until a payment method is approved.

## Deterministic routing

1. Classify the lead into a configurable price key:
   standard repair, urgent repair, replacement, or hot replacement.
2. Select only active or pilot partners that accept the service, lead flow, and
   city or ZIP.
3. Exclude partners at a monthly lead or spend cap.
4. Rank by delivery priority, then fewest leads delivered in the month, then
   stable partner ID order.
5. Reserve the lead in a Neon transaction. A unique lead-assignment record
   makes a lead exclusive: one lead can never have two active deliveries.
6. Mark the assignment delivered only after an approved contractor-delivery
   channel succeeds. Failed delivery remains reserved for controlled retry or
   review; it is not silently sent to a second contractor.

## Pilot and billing rules

- Each pilot partner starts with a free pilot lead limit of 3.
- A lead becomes a pilot-free lead only when it is qualified and successfully
  delivered. Rejected, invalid, disputed, or failed-delivery records do not
  consume a free lead until resolved.
- After the free limit, the price is copied from the active pricing rule into
  both the assignment and the billing ledger. Later price changes never alter
  historical lead prices.
- Initial configurable pricing: standard repair $49, urgent repair $69,
  replacement $99, hot replacement $129.
- Future automatic billing should invoice approved billable assignments on a
  scheduled cycle or deduct from prepaid credits. It should never charge a card
  during routing. Payment processor setup, invoice delivery, and charging
  require separate approval.

## Operational statuses

- Assignment: reserved, delivered, accepted, rejected, disputed, cancelled.
- Contractor disposition: pending, contacted, booked, not_booked, invalid.
- Billing: pending, waived, billable, invoiced, paid, void, disputed.
