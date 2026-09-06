import { neon } from "@neondatabase/serverless";

const allowedServices = new Set([
  "AC repair",
  "Heating repair",
  "Heat pumps",
  "System replacement",
  "Emergency / urgent",
]);
function value(input: Record<string, unknown>, key: string, max: number) {
  return typeof input[key] === "string" ? input[key].trim().slice(0, max) : "";
}
function checked(input: Record<string, unknown>, key: string) {
  return input[key] === true || input[key] === "on" || input[key] === "true";
}
function validEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

async function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  const sql = neon(url);
  await sql`CREATE TABLE IF NOT EXISTS partners (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), legal_name TEXT NOT NULL, display_name TEXT NOT NULL, primary_contact_name TEXT, email TEXT, phone TEXT, status TEXT NOT NULL DEFAULT 'applicant', delivery_priority INTEGER NOT NULL DEFAULT 0, monthly_lead_cap INTEGER, monthly_spend_cap_cents INTEGER, free_pilot_lead_limit INTEGER NOT NULL DEFAULT 3, billing_contact_email TEXT, website TEXT, license_number TEXT, notes TEXT)`;
  await sql`CREATE TABLE IF NOT EXISTS partner_service_types (partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE, service_type TEXT NOT NULL, PRIMARY KEY (partner_id, service_type))`;
  await sql`CREATE TABLE IF NOT EXISTS partner_territories (id TEXT PRIMARY KEY, partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE, city TEXT, zip TEXT, CHECK (city IS NOT NULL OR zip IS NOT NULL), UNIQUE (partner_id, city, zip))`;
  await sql`CREATE TABLE IF NOT EXISTS partner_lead_types (partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE, lead_type TEXT NOT NULL, PRIMARY KEY (partner_id, lead_type))`;
  await sql`CREATE TABLE IF NOT EXISTS partner_applications (id TEXT PRIMARY KEY, partner_id TEXT NOT NULL UNIQUE REFERENCES partners(id) ON DELETE RESTRICT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), application_status TEXT NOT NULL DEFAULT 'pending_verification', insurance_confirmed BOOLEAN NOT NULL, pilot_acknowledged BOOLEAN NOT NULL, terms_acknowledged BOOLEAN NOT NULL, data_acknowledged BOOLEAN NOT NULL, monthly_spend_preference TEXT, raw_payload JSONB NOT NULL, is_test BOOLEAN NOT NULL DEFAULT FALSE)`;
  return sql;
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Record<string, unknown>;
    if (value(input, "company_site_check", 100))
      return Response.json({ ok: true }, { status: 201 });
    const legalName = value(input, "legalName", 160),
      dbaName = value(input, "dbaName", 160),
      website = value(input, "website", 250),
      contactName = value(input, "contactName", 120),
      businessEmail = value(input, "email", 254),
      phone = value(input, "phone", 32),
      deliveryEmail = value(input, "deliveryEmail", 254),
      licenseNumber = value(input, "licenseNumber", 80);
    const cities = value(input, "cities", 500)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const zips = value(input, "zips", 500)
      .split(",")
      .map((item) => item.trim())
      .filter((item) => /^\d{5}(?:-\d{4})?$/.test(item));
    const services = Array.isArray(input.services)
      ? input.services.filter(
          (item): item is string =>
            typeof item === "string" && allowedServices.has(item),
        )
      : [];
    const insurance = checked(input, "insuranceConfirmed"),
      pilot = checked(input, "pilotAcknowledged"),
      terms = checked(input, "termsAcknowledged"),
      dataUse = checked(input, "dataAcknowledged");
    if (
      !legalName ||
      !contactName ||
      !validEmail(businessEmail) ||
      !validEmail(deliveryEmail) ||
      !/^\d{7,15}$/.test(phone.replace(/\D/g, "")) ||
      !licenseNumber ||
      !cities.length ||
      !services.length ||
      !insurance ||
      !pilot ||
      !terms ||
      !dataUse
    )
      return Response.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    if (website && !/^https?:\/\//i.test(website))
      return Response.json(
        { error: "Website must begin with http:// or https://." },
        { status: 400 },
      );
    const sql = await getSql();
    const partnerId = crypto.randomUUID(),
      applicationId = crypto.randomUUID();
    const leadTypes = [
      checked(input, "acceptRepair") ? "repair" : "",
      checked(input, "acceptReplacement") ? "replacement" : "",
      checked(input, "acceptUrgent") ? "urgent" : "",
    ].filter(Boolean);
    const leadCap = Number(value(input, "monthlyLeadCap", 20));
    const spendPreference =
      value(input, "spendCap", 40) || "decide_after_pilot";
    const spendCap = /^\d+$/.test(spendPreference)
      ? Number(spendPreference)
      : null;
    await sql`INSERT INTO partners (id, legal_name, display_name, primary_contact_name, email, phone, status, monthly_lead_cap, monthly_spend_cap_cents, billing_contact_email, website, license_number, notes) VALUES (${partnerId}, ${legalName}, ${dbaName || legalName}, ${contactName}, ${businessEmail}, ${phone}, 'pending_verification', ${Number.isInteger(leadCap) && leadCap > 0 ? leadCap : null}, ${spendCap}, ${deliveryEmail}, ${website || null}, ${licenseNumber}, 'Submitted through /partners/apply')`;
    for (const service of services)
      await sql`INSERT INTO partner_service_types (partner_id, service_type) VALUES (${partnerId}, ${service}) ON CONFLICT DO NOTHING`;
    for (const leadType of leadTypes)
      await sql`INSERT INTO partner_lead_types (partner_id, lead_type) VALUES (${partnerId}, ${leadType}) ON CONFLICT DO NOTHING`;
    for (const city of cities)
      await sql`INSERT INTO partner_territories (id, partner_id, city) VALUES (${crypto.randomUUID()}, ${partnerId}, ${city}) ON CONFLICT DO NOTHING`;
    for (const zip of zips)
      await sql`INSERT INTO partner_territories (id, partner_id, zip) VALUES (${crypto.randomUUID()}, ${partnerId}, ${zip}) ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO partner_applications (id, partner_id, insurance_confirmed, pilot_acknowledged, terms_acknowledged, data_acknowledged, monthly_spend_preference, raw_payload, is_test) VALUES (${applicationId}, ${partnerId}, ${insurance}, ${pilot}, ${terms}, ${dataUse}, ${spendPreference}, ${JSON.stringify(input)}, ${/^test\b/i.test(legalName)})`;
    return Response.json({ applicationId }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Unable to submit application." },
      { status: 500 },
    );
  }
}
