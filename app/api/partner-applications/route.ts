import { getSql } from "@/lib/postgres";

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
    const sql = getSql();
    const partnerId = crypto.randomUUID(),
      applicationId = crypto.randomUUID();
    const leadTypes = [
      checked(input, "acceptRepair") ? "repair" : "",
      checked(input, "acceptReplacement") ? "replacement" : "",
      checked(input, "acceptUrgent") ? "urgent" : "",
    ].filter(Boolean);
    if (!leadTypes.length) return Response.json({error:'Select at least one lead type.'},{status:400});
    const isTest = input.isTest === true || /^test(?:\b|ing)/i.test(legalName);
    const leadCap = Number(value(input, "monthlyLeadCap", 20));
    const spendPreference =
      value(input, "spendCap", 40) || "decide_after_pilot";
    const spendCap = /^\d+$/.test(spendPreference)
      ? Number(spendPreference)
      : null;
    const queries = [sql`INSERT INTO partners (id, legal_name, display_name, primary_contact_name, email, phone, status, monthly_lead_cap, monthly_spend_cap_cents, billing_contact_email, website, license_number, notes, is_test) VALUES (${partnerId}, ${legalName}, ${dbaName || legalName}, ${contactName}, ${businessEmail}, ${phone}, 'pending_verification', ${Number.isInteger(leadCap) && leadCap > 0 ? leadCap : null}, ${spendCap}, ${deliveryEmail}, ${website || null}, ${licenseNumber}, 'Submitted through /partners/apply', ${isTest})`];
    for (const service of services)
      queries.push(sql`INSERT INTO partner_service_types (partner_id, service_type) VALUES (${partnerId}, ${service}) ON CONFLICT DO NOTHING`);
    for (const leadType of leadTypes)
      queries.push(sql`INSERT INTO partner_lead_types (partner_id, lead_type) VALUES (${partnerId}, ${leadType}) ON CONFLICT DO NOTHING`);
    for (const city of cities)
      queries.push(sql`INSERT INTO partner_territories (id, partner_id, city) VALUES (${crypto.randomUUID()}, ${partnerId}, ${city}) ON CONFLICT DO NOTHING`);
    for (const zip of zips)
      queries.push(sql`INSERT INTO partner_territories (id, partner_id, zip) VALUES (${crypto.randomUUID()}, ${partnerId}, ${zip}) ON CONFLICT DO NOTHING`);
    queries.push(sql`INSERT INTO partner_applications (id, partner_id, insurance_confirmed, pilot_acknowledged, terms_acknowledged, data_acknowledged, monthly_spend_preference, raw_payload, is_test) VALUES (${applicationId}, ${partnerId}, ${insurance}, ${pilot}, ${terms}, ${dataUse}, ${spendPreference}, ${JSON.stringify(input)}, ${isTest})`);
    await sql.transaction(queries);
    return Response.json({ applicationId }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Unable to submit application." },
      { status: 500 },
    );
  }
}
