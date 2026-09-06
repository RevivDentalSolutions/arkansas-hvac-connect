import { neon } from "@neondatabase/serverless";

let schemaReady = false;

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
      consent BOOLEAN NOT NULL DEFAULT FALSE
    )`;
    schemaReady = true;
  }
  return sql;
}
function score(p:any){let n=0;if(p.authority==='Homeowner')n+=35;if(p.zip)n+=15;if(p.name&&p.phone)n+=20;if(p.flow==='replacement'&&['0–7 days','This month'].includes(p.timeline))n+=30;if(p.flow==='repair'&&(['No','Partly / not sure'].includes(p.running)||p.urgency==='Today'))n+=30;return {score:n,label:n>=80?p.flow==='replacement'?'HOT REPLACEMENT':'HOT REPAIR':n>=50?'WARM':'LOW / REVIEW'}}
export async function POST(request:Request){try{const p=await request.json();if(!p.name||!p.phone||!p.flow||!p.service)return Response.json({error:'Missing required fields'},{status:400});const s=score(p);const id=crypto.randomUUID();const sql=await getSql();await sql`INSERT INTO leads (id, flow, service, city, zip, name, phone, email, contact_method, payload_json, landing_page, page_url, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, channel, score, score_label, consent) VALUES (${id}, ${p.flow}, ${p.service}, ${p.city||null}, ${p.zip||null}, ${p.name}, ${p.phone}, ${p.email||null}, ${p.contactMethod||null}, ${JSON.stringify(p)}, ${p.landingPage||null}, ${p.pageUrl||null}, ${p.referrer||null}, ${p.utmSource||null}, ${p.utmMedium||null}, ${p.utmCampaign||null}, ${p.utmTerm||null}, ${p.utmContent||null}, ${p.channel||'direct'}, ${s.score}, ${s.label}, ${Boolean(p.consent)});`;return Response.json({leadId:id,score:s},{status:201})}catch{return Response.json({error:'Unable to save request'},{status:500})}}
