import { neon } from "@neondatabase/serverless";

const HIGHLEVEL_API = "https://services.leadconnectorhq.com";
const HIGHLEVEL_LOCATION_ID =
  process.env.HIGHLEVEL_LOCATION_ID || "pbSvbVU5DMI3OnWI5WoR";
const HIGHLEVEL_PIPELINE_NAME =
  process.env.HIGHLEVEL_PIPELINE_NAME || "Arkansas HVAC Connect Lead Pipeline";
const HIGHLEVEL_STAGE_NAME = process.env.HIGHLEVEL_STAGE_NAME || "New Lead";

let schemaReady = false;

type LeadPayload = Record<string, unknown> & {
  name: string;
  phone: string;
  email?: string;
  flow: string;
  service: string;
  city?: string;
  zip?: string;
  contactMethod?: string;
  landingPage?: string;
  pageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  channel?: string;
  consent?: boolean;
  authority?: string;
  timeline?: string;
  running?: string;
  urgency?: string;
};

async function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");

  const sql = neon(databaseUrl);
  if (!schemaReady) {
    await sql`CREATE TABLE IF NOT EXISTS leads (
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
    )`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_sync_status TEXT NOT NULL DEFAULT 'pending'`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_contact_id TEXT`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_opportunity_id TEXT`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_last_error TEXT`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS highlevel_synced_at TIMESTAMPTZ`;
    schemaReady = true;
  }
  return sql;
}

function score(p: LeadPayload) {
  let n = 0;
  if (p.authority === "Homeowner") n += 35;
  if (p.zip) n += 15;
  if (p.name && p.phone) n += 20;
  if (
    p.flow === "replacement" &&
    ["0–7 days", "This month"].includes(p.timeline || "")
  )
    n += 30;
  if (
    p.flow === "repair" &&
    (["No", "Partly / not sure"].includes(p.running || "") ||
      p.urgency === "Today")
  )
    n += 30;
  return {
    score: n,
    label:
      n >= 80
        ? p.flow === "replacement"
          ? "HOT REPLACEMENT"
          : "HOT REPAIR"
        : n >= 50
          ? "WARM"
          : "LOW / REVIEW",
  };
}

function splitName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") || undefined };
}

function highLevelHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Version: "v3",
  };
}

async function highLevelRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${HIGHLEVEL_API}${path}`, {
    ...init,
    headers: { ...highLevelHeaders(token), ...init.headers },
  });
  if (!response.ok) {
    throw new Error(`HighLevel ${response.status} at ${path}`);
  }
  return response.json() as Promise<T>;
}

async function syncLeadToHighLevel(
  leadId: string,
  payload: LeadPayload,
  leadScore: { score: number; label: string },
  sql: Awaited<ReturnType<typeof getSql>>,
) {
  const token = process.env.HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN;
  if (!token) {
    await sql`UPDATE leads SET highlevel_sync_status = 'not_configured' WHERE id = ${leadId}`;
    return;
  }

  try {
    const { firstName, lastName } = splitName(payload.name);
    const contact = await highLevelRequest<{ contact: { id: string } }>(
      token,
      "/contacts/upsert",
      {
        method: "POST",
        body: JSON.stringify({
          locationId: HIGHLEVEL_LOCATION_ID,
          firstName,
          lastName,
          name: payload.name,
          email: payload.email || undefined,
          phone: payload.phone,
          city: payload.city || undefined,
          state: "AR",
          postalCode: payload.zip || undefined,
          timezone: "America/Chicago",
          source: "Arkansas HVAC Connect website",
          createNewIfDuplicateAllowed: false,
        }),
      },
    );

    const contactId = contact.contact.id;
    await highLevelRequest(token, `/contacts/${contactId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: ["hvac - new lead"] }),
    });

    const pipelines = await highLevelRequest<{
      pipelines: Array<{
        id: string;
        name: string;
        stages: Array<{ id: string; name: string }>;
      }>;
    }>(
      token,
      `/opportunities/pipelines?locationId=${encodeURIComponent(HIGHLEVEL_LOCATION_ID)}`,
    );
    const pipeline = pipelines.pipelines.find(
      (item) => item.name === HIGHLEVEL_PIPELINE_NAME,
    );
    const stage = pipeline?.stages.find(
      (item) => item.name === HIGHLEVEL_STAGE_NAME,
    );
    if (!pipeline || !stage) {
      throw new Error("HighLevel pipeline or New Lead stage was not found");
    }

    const opportunity = await highLevelRequest<{
      opportunity: { id: string };
    }>(token, "/opportunities/", {
      method: "POST",
      body: JSON.stringify({
        pipelineId: pipeline.id,
        locationId: HIGHLEVEL_LOCATION_ID,
        name: `HVAC Lead · ${payload.flow} · ${payload.service}`,
        pipelineStageId: stage.id,
        status: "open",
        contactId,
      }),
    });

    const noteLines = [
      `Arkansas HVAC Connect lead ID: ${leadId}`,
      `Service: ${payload.service}`,
      `Flow: ${payload.flow}`,
      `Urgency: ${payload.urgency || "Not provided"}`,
      `Lead score: ${leadScore.score} (${leadScore.label})`,
      `Contact preference: ${payload.contactMethod || "Not provided"}`,
      `Consent: ${payload.consent ? "yes" : "no"}`,
      `Landing page: ${payload.landingPage || "Not provided"}`,
      `Page URL: ${payload.pageUrl || "Not provided"}`,
      `Referrer: ${payload.referrer || "Direct"}`,
      `UTM: ${
        [payload.utmSource, payload.utmMedium, payload.utmCampaign]
          .filter(Boolean)
          .join(" / ") || "Not provided"
      }`,
    ];
    await highLevelRequest(token, `/contacts/${contactId}/notes`, {
      method: "POST",
      body: JSON.stringify({ body: noteLines.join("\n") }),
    });

    await sql`UPDATE leads SET highlevel_sync_status = 'synced', highlevel_contact_id = ${contactId}, highlevel_opportunity_id = ${opportunity.opportunity.id}, highlevel_last_error = NULL, highlevel_synced_at = NOW() WHERE id = ${leadId}`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "HighLevel sync failed";
    await sql`UPDATE leads SET highlevel_sync_status = 'failed', highlevel_last_error = ${message.slice(0, 500)} WHERE id = ${leadId}`;
    console.error("HighLevel lead sync failed", { leadId, message });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload;
    if (!payload.name || !payload.phone || !payload.flow || !payload.service) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const leadScore = score(payload);
    const id = crypto.randomUUID();
    const sql = await getSql();
    await sql`INSERT INTO leads (id, flow, service, city, zip, name, phone, email, contact_method, payload_json, landing_page, page_url, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, channel, score, score_label, consent) VALUES (${id}, ${payload.flow}, ${payload.service}, ${payload.city || null}, ${payload.zip || null}, ${payload.name}, ${payload.phone}, ${payload.email || null}, ${payload.contactMethod || null}, ${JSON.stringify(payload)}, ${payload.landingPage || null}, ${payload.pageUrl || null}, ${payload.referrer || null}, ${payload.utmSource || null}, ${payload.utmMedium || null}, ${payload.utmCampaign || null}, ${payload.utmTerm || null}, ${payload.utmContent || null}, ${payload.channel || "direct"}, ${leadScore.score}, ${leadScore.label}, ${Boolean(payload.consent)})`;

    await syncLeadToHighLevel(id, payload, leadScore, sql);
    return Response.json({ leadId: id, score: leadScore }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to save request" }, { status: 500 });
  }
}
