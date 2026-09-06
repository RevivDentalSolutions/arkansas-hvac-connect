"use client";
import { useState } from "react";
import Link from "next/link";

const cities = [
  "Little Rock",
  "North Little Rock",
  "Conway",
  "Benton",
  "Bryant",
];
function classify() {
  const q = new URLSearchParams(location.search);
  if (q.get("utm_medium")?.match(/cpc|ppc|paid/i)) return "paid";
  if (document.referrer.includes("google.")) return "organic";
  if (!document.referrer) return "direct";
  return "referral";
}
function LeadForm({
  flow,
  onClose,
}: {
  flow: "repair" | "replacement";
  onClose: () => void;
}) {
  const [step, setStep] = useState(1),
    [data, setData] = useState<Record<string, string>>({ flow }),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setData({ ...data, [k]: v });
  const fields: Array<[string, string, string[]?]> =
    flow === "repair"
      ? [
          [
            "service",
            "What needs help?",
            [
              "AC not cooling",
              "AC blowing warm air",
              "System not turning on",
              "System freezing",
              "Unusual noise",
              "Heating not working",
              "Poor airflow",
              "Thermostat issue",
              "Unsure",
            ],
          ],
          [
            "running",
            "Is the system currently running?",
            ["Yes", "No", "Partly / not sure"],
          ],
          [
            "urgency",
            "How urgent is it?",
            ["Today", "Within 2–7 days", "This month", "Planning ahead"],
          ],
          [
            "authority",
            "Are you the homeowner?",
            ["Homeowner", "Landlord", "Renter"],
          ],
        ]
      : [
          [
            "service",
            "What are you considering?",
            [
              "Replace AC",
              "Replace heating",
              "Replace full HVAC",
              "Replace heat pump",
              "Unsure",
            ],
          ],
          [
            "systemAge",
            "Current system age",
            ["Under 10 years", "10–15 years", "15+ years", "Not sure"],
          ],
          [
            "reason",
            "Why are you considering replacement?",
            [
              "Frequent repairs",
              "Not cooling/heating well",
              "High bills",
              "System stopped working",
              "Planning an upgrade",
            ],
          ],
          [
            "timeline",
            "Desired installation timeline",
            ["0–7 days", "This month", "1–3 months", "Researching"],
          ],
          [
            "authority",
            "Are you the homeowner?",
            ["Homeowner", "Landlord", "Renter"],
          ],
        ];
  const contact: Array<[string, string, string[]?]> = [
    ["zip", "ZIP code"],
    ["city", "City"],
    ["name", "Your name"],
    ["phone", "Phone"],
    ["email", "Email (optional)"],
    ["contactMethod", "Preferred contact method", ["Call", "Text", "Email"]],
    ["description", "Anything else we should know?"],
  ];
  const current = step === 1 ? fields : contact;
  async function next() {
    if (step === 1) {
      setStep(2);
      return;
    }
    setBusy(true);
    const p = new URLSearchParams(location.search);
    const attribution = {
      landingPage: location.pathname,
      pageUrl: location.href,
      referrer: document.referrer,
      utmSource: p.get("utm_source"),
      utmMedium: p.get("utm_medium"),
      utmCampaign: p.get("utm_campaign"),
      utmTerm: p.get("utm_term"),
      utmContent: p.get("utm_content"),
      channel: classify(),
    };
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...attribution, consent: true }),
      });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch {
      alert("We could not save your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal">
      <div className="form-panel">
        <button className="close" onClick={onClose}>
          ×
        </button>
        {done ? (
          <div className="success">
            <h2>Request received</h2>
            <p>
              Thanks. We’ll review your request. If it fits our service area, it
              may be shared with an appropriate participating HVAC professional.
            </p>
            <button className="button" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow" style={{ color: "#1267a8" }}>
              Request {flow === "repair" ? "repair help" : "an estimate"}
            </p>
            <h2>
              {step === 1 ? "A few quick details" : "How should we reach you?"}
            </h2>
            <div className="progress">
              <span style={{ width: `${step * 50}%` }} />
            </div>
            <div className="fields">
              {current.map((f) => (
                <label key={f[0]}>
                  {f[1]}
                  {f[2] ? (
                    <select
                      required
                      value={data[f[0]] || ""}
                      onChange={(e) => set(f[0], e.target.value)}
                    >
                      <option value="">Select one</option>
                      {f[2].map((v: string) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  ) : f[0] === "description" ? (
                    <textarea
                      value={data[f[0]] || ""}
                      onChange={(e) => set(f[0], e.target.value)}
                    />
                  ) : (
                    <input
                      required={["zip", "name", "phone"].includes(f[0])}
                      value={data[f[0]] || ""}
                      onChange={(e) => set(f[0], e.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
            <p className="fine">
              By submitting, you agree to our{" "}
              <Link className="link" href="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="link" href="/privacy">
                Privacy Policy
              </Link>
              , and consent to contact about this request. Your information may
              be shared with participating local HVAC professionals.
            </p>
            <div className="form-actions">
              {step === 2 ? (
                <button className="button alt" onClick={() => setStep(1)}>
                  Back
                </button>
              ) : (
                <span />
              )}
              <button className="button" onClick={next} disabled={busy}>
                {step === 1 ? "Continue" : "Send request"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export function MarketplacePage({ path = "/", page }: { path?: string; page?: import("@/lib/site-pages").SitePage }) {
  const [flow, setFlow] = useState<"repair" | "replacement" | null>(null);
  const openRequest = (preferred?: "repair" | "replacement") => setFlow(preferred || page?.flow || "repair");
  return (
    <>
      <Link className="skip-link" href="#main-content">Skip to main content</Link>
      <header className="nav">
        <div className="shell nav-inner">
          <Link className="brand" href="/" aria-label="Arkansas HVAC Connect home">
            Arkansas HVAC Connect
            <small>Independent homeowner referral platform</small>
          </Link>
          <nav className="nav-links" aria-label="Primary navigation">
            <Link href="/how-it-works">How it works</Link>
            <Link href="/ac-repair">AC repair</Link>
            <Link href="/hvac-replacement">Replacement</Link>
            <Link href="/guides">Guides</Link>
            <button className="button" onClick={() => openRequest()}>Request HVAC help</button>
          </nav>
        </div>
      </header>
      {path === "/" ? (
        <main id="main-content">
          <section className="hero">
            <div className="shell hero-grid">
              <div>
                <p className="eyebrow">Central Arkansas homeowner referral platform</p>
                <h1>Find the Right Path for HVAC Help</h1>
                <p>Describe your AC, heating, heat-pump, or replacement need. We review your request and may connect it with a participating local HVAC professional.</p>
                <p className="disclosure"><strong>Know who you are contacting:</strong> Arkansas HVAC Connect is not an HVAC contractor. We do not perform, price, schedule, guarantee, or dispatch HVAC work.</p>
              </div>
              <div className="choice-card" id="request-help">
                <h2>What does your home need?</h2>
                <p>Choose the closest path. The request takes only a few minutes.</p>
                <div className="choices">
                  <button className="choice" onClick={() => openRequest("repair")}>Request repair help →</button>
                  <button className="choice" onClick={() => openRequest("replacement")}>Request a replacement estimate →</button>
                </div>
                <p className="fine">Submitting does not guarantee contact, availability, an appointment, or service.</p>
              </div>
            </div>
          </section>
          <section className="section" aria-labelledby="needs-heading">
            <div className="shell">
              <h2 id="needs-heading">Start with your situation</h2>
              <p className="lede">Useful information first, then a direct route to the existing homeowner request form.</p>
              <div className="grid3">
                <article className="card"><h3>Cooling problem</h3><p>Warm air, weak airflow, ice, unusual operation, or no cooling.</p><Link className="link" href="/ac-repair">Explore AC repair help →</Link></article>
                <article className="card"><h3>Replacement planning</h3><p>Compare repair value, system scope, heat pumps, and estimate details.</p><Link className="link" href="/hvac-replacement">Plan an HVAC replacement →</Link></article>
                <article className="card"><h3>Not sure what is wrong?</h3><p>Work through safe, homeowner-accessible checks without opening equipment.</p><Link className="link" href="/guides/what-to-check-when-ac-stops-working">Use the AC checklist →</Link></article>
              </div>
            </div>
          </section>
          <section className="section band" aria-labelledby="process-heading"><div className="shell"><h2 id="process-heading">How the referral process works</h2><div className="steps">
            <div><span className="step-num" aria-hidden="true">1</span><h3>Tell us what is happening</h3><p>Provide the property location, symptoms, timing, and contact details.</p></div>
            <div><span className="step-num" aria-hidden="true">2</span><h3>We review the request</h3><p>We check service type, area, timing, and whether the details are usable.</p></div>
            <div><span className="step-num" aria-hidden="true">3</span><h3>A professional may contact you</h3><p>An independent participating professional decides fit and availability.</p></div>
          </div><p><Link className="link" href="/how-it-works">Read the complete process and platform disclosure →</Link></p></div></section>
          <section className="section"><div className="shell"><h2>Central Arkansas request areas</h2><p>Coverage and professional availability vary by request. Select your city for locally useful request guidance.</p><div className="cities">{cities.map((c) => <Link className="city" key={c} href={"/" + c.toLowerCase().replaceAll(" ", "-")}>{c}</Link>)}</div></div></section>
          <section className="section band"><div className="shell narrow"><h2>Make a more informed HVAC decision</h2><p>Our homeowner guides explain safe checks and questions—not remote diagnoses or sales claims.</p><p><Link className="button" href="/guides">Browse all homeowner HVAC guides</Link></p></div></section>
        </main>
      ) : page ? (
        <main id="main-content">
          <article>
            <header className="page-hero"><div className="shell narrow"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span>{page.type === "guide" && <><Link href="/guides">Guides</Link><span aria-hidden="true">/</span></>}<span aria-current="page">{page.title}</span></nav><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="lede">{page.intro}</p>{page.updated && <p className="updated">Reviewed {page.updated}</p>}<button className="button" onClick={() => openRequest()}>Start a homeowner request</button><p className="disclosure compact">Independent referral platform—not an HVAC contractor or emergency dispatch service.</p></div></header>
            <div className="section"><div className="shell content-layout"><div className="article-body">
              {page.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs?.map((p) => <p key={p}>{p}</p>)}{section.bullets && <ul>{section.bullets.map((b) => <li key={b}>{b.includes("energy.gov/") || b.includes("energystar.gov/") ? <Link className="link" href={`https://${b}`} rel="external">{b}</Link> : b}</li>)}</ul>}</section>)}
              {page.faq && <section><h2>Frequently asked questions</h2>{page.faq.map((item) => <div className="faq" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section>}
              <section className="next-step"><h2>Ready to describe your HVAC need?</h2><p>Use the secure request flow. Your details may be shared with an appropriate participating professional under the consent shown in the form.</p><button className="button" onClick={() => openRequest()}>Start your request</button></section>
            </div><aside className="related" aria-labelledby="related-heading"><h2 id="related-heading">Related homeowner resources</h2><ul>{page.related.map((link) => <li key={link.href}><Link href={link.href}>{link.label} →</Link></li>)}</ul><p className="fine"><strong>Platform disclosure:</strong> Arkansas HVAC Connect does not diagnose systems, employ technicians, hold itself out as a contractor, or guarantee a response.</p></aside></div></div>
          </article>
        </main>
      ) : null}
      <footer className="footer"><div className="shell footer-grid"><div><strong>Arkansas HVAC Connect</strong><p className="fine">Independent Central Arkansas homeowner HVAC referral platform. Not an HVAC contractor.</p></div><nav aria-label="Footer navigation"><Link href="/guides">Guides</Link> · <Link href="/how-it-works">How it works</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/contact">Contact</Link> · <Link href="/partners">For HVAC companies</Link></nav></div></footer>
      {flow && <LeadForm flow={flow} onClose={() => setFlow(null)} />}
    </>
  );
}
