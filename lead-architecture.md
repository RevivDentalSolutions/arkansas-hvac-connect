# Lead architecture
`POST /api/leads` persists a lead with a UUID, flow, request detail, score, consent and full attribution. Future routing can forward the same JSON payload to HighLevel, then notify contractors and update `status` (`new`, `review`, `routed`, `accepted`, `closed`).

Example payload: `{ "flow":"replacement", "service":"Replace full HVAC", "authority":"Homeowner", "zip":"72212", "name":"Jamie Smith", "phone":"501-555-0100", "landingPage":"/hvac-replacement", "utmSource":"google", "channel":"paid", "consent":true }`

Events ready to emit after IDs are added: `lead_form_started`, `lead_form_step_completed`, `repair_lead_submitted`, `replacement_lead_submitted`, `phone_click`, `email_click`, `cta_click`, and `qualified_lead`.
