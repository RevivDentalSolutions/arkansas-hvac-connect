# Arkansas HVAC Connect

Central Arkansas homeowner HVAC referral MVP. It does not perform HVAC work or promise contractor availability.

## Launch pages
Home, AC repair, HVAC replacement, urgent AC help, heating repair, heat pumps, Little Rock, North Little Rock, Conway, Benton, Bryant, AC-not-cooling guide, how it works, privacy, terms, and contact.

## Lead system
`POST /api/leads` stores a durable D1 lead record. It captures UUID, timestamp, repair/replacement flow, service, contact details, consent, landing page, full UTM set, referrer, channel classification, score, and status. Lead score rules are in `app/api/leads/route.ts`.

## Local development
Install dependencies, generate migrations with `npm run db:generate`, then run `npm run build`. Add actual analytics and automation values only through runtime environment variables; see `.env.example`.

## Future integration
Send the stored lead payload to HighLevel after validation; use Twilio/Vapi for consented follow-up; add contractor routing and Stripe credits only after a contractor network exists. See `docs/lead-architecture.md`.
