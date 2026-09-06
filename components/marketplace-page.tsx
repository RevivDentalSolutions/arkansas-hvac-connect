"use client";
import { useState } from "react";

const cities = [
  "Little Rock",
  "North Little Rock",
  "Conway",
  "Benton",
  "Bryant",
];
const labels: Record<string, { title: string; lede: string }> = {
  "/ac-repair": {
    title: "AC Repair Help in Central Arkansas",
    lede: "Tell us what your air conditioner is doing and request help from a participating local HVAC professional.",
  },
  "/hvac-replacement": {
    title: "HVAC Replacement Estimates",
    lede: "Considering a new HVAC system? Share a few details so your request can be reviewed for an appropriate local professional.",
  },
  "/emergency-ac-repair": {
    title: "Request Help for an Urgent AC Issue",
    lede: "When cooling stops, send a request with your situation. Availability depends on participating local professionals.",
  },
  "/heating-repair": {
    title: "Heating Repair Help",
    lede: "Request help for a heating issue from a participating Central Arkansas HVAC professional.",
  },
  "/heat-pumps": {
    title: "Heat Pump Help in Central Arkansas",
    lede: "Whether you need repair, replacement, or are still figuring it out, start with a quick request.",
  },
  "/little-rock": {
    title: "HVAC Help for Little Rock Homeowners",
    lede: "Request repair or replacement help for your Little Rock home.",
  },
  "/north-little-rock": {
    title: "HVAC Help for North Little Rock",
    lede: "A clear starting point for AC, heating, and replacement requests.",
  },
  "/conway": {
    title: "HVAC Help for Conway Homeowners",
    lede: "Request local help for a repair issue or a new-system estimate.",
  },
  "/benton": {
    title: "HVAC Help for Benton Homeowners",
    lede: "Tell us what your home needs and we’ll review the request.",
  },
  "/bryant": {
    title: "HVAC Help for Bryant Homeowners",
    lede: "Start a repair or replacement request in just a few steps.",
  },
};
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
  const fields =
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
  const contact = [
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
              {current.map((f: any) => (
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
              <a className="link" href="/terms">
                Terms
              </a>{" "}
              and{" "}
              <a className="link" href="/privacy">
                Privacy Policy
              </a>
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
export function MarketplacePage() {
  const [flow, setFlow] = useState<"repair" | "replacement" | null>(null);
  const path = typeof window === "undefined" ? "/" : window.location.pathname;
  const special =
    path === "/how-it-works" ||
    path === "/privacy" ||
    path === "/terms" ||
    path === "/contact" ||
    path === "/guides/ac-not-cooling";
  const data = labels[path];
  const title =
    data?.title ||
    (path === "/guides/ac-not-cooling"
      ? "AC Running but Not Cooling?"
      : "HVAC Trouble? Find Local Help Fast.");
  const lede =
    data?.lede ||
    (path === "/guides/ac-not-cooling"
      ? "A dirty filter, thermostat issue, frozen coil, or more serious problem can keep your home from cooling. Start with safe checks, then request help if needed."
      : "Request help for AC repair, heating issues, or a new HVAC system throughout Central Arkansas.");
  return (
    <>
      <header className="nav">
        <div className="shell nav-inner">
          <a className="brand" href="/">
            Arkansas HVAC Connect
            <small>Central Arkansas homeowner referral service</small>
          </a>
          <nav className="nav-links">
            <a href="/how-it-works">How it works</a>
            <a href="/ac-repair">AC repair</a>
            <a href="/hvac-replacement">Replacement</a>
            <button className="button" onClick={() => setFlow("repair")}>
              Get HVAC Help
            </button>
          </nav>
        </div>
      </header>
      {special ? (
        <main className="section">
          <article className="article">
            <p className="eyebrow" style={{ color: "#1267a8" }}>
              Arkansas HVAC Connect
            </p>
            <h1>{title}</h1>
            <p className="lede">{lede}</p>
            {path === "/guides/ac-not-cooling" && (
              <>
                <h2>Safe things to check first</h2>
                <ul>
                  <li>
                    Confirm your thermostat is set to cool and below room
                    temperature.
                  </li>
                  <li>
                    Check the filter and replace it if it is visibly dirty.
                  </li>
                  <li>
                    Make sure indoor vents are open and the outdoor unit is
                    clear of debris.
                  </li>
                </ul>
                <h2>When to request help</h2>
                <p>
                  If the system is blowing warm air, freezing, making unusual
                  noises, or still will not cool after basic checks, a
                  professional evaluation is a sensible next step.
                </p>
              </>
            )}
            {path === "/how-it-works" && (
              <>
                <h2>1. Tell us what your home needs.</h2>
                <p>
                  Choose repair help or replacement estimates and complete a
                  short request.
                </p>
                <h2>2. We review and qualify the request.</h2>
                <p>
                  We look at service type, timing, service area, and contact
                  information.
                </p>
                <h2>3. Your request may be shared.</h2>
                <p>
                  When appropriate, it may be shared with a participating local
                  HVAC professional. Arkansas HVAC Connect does not perform HVAC
                  work or guarantee availability.
                </p>
              </>
            )}
            {(path === "/privacy" || path === "/terms") && (
              <>
                <h2>Draft notice for launch</h2>
                <p>
                  This MVP uses draft consumer disclosures and should receive
                  attorney review before paid traffic, automated SMS, or
                  scale-up. We collect request and attribution data to review
                  and route homeowner requests. We may share submitted
                  information with participating HVAC professionals relevant to
                  the request.
                </p>
                <h2>Contact consent</h2>
                <p>
                  By submitting a request, homeowners agree to be contacted
                  about it by Arkansas HVAC Connect and/or participating
                  professionals using the contact method provided. Consent is
                  not a condition of purchase.
                </p>
              </>
            )}
            {path === "/contact" && (
              <>
                <h2>Need to reach us?</h2>
                <p>
                  This site is currently request-first. Use the secure request
                  form so we have the details needed to review your homeowner
                  HVAC request.
                </p>
              </>
            )}
            <button
              className="button"
              onClick={() => setFlow("repair")}
            >
              Start your request
            </button>
          </article>
        </main>
      ) : (
        <main>
          <section className="hero">
            <div className="shell hero-grid">
              <div>
                <p className="eyebrow">
                  Central Arkansas homeowner referral service
                </p>
                <h1>{title}</h1>
                <p>{lede}</p>
                <p className="disclosure">
                  Arkansas HVAC Connect is not an HVAC contractor and does not
                  perform or dispatch HVAC work. Requests may be shared with
                  appropriate participating local professionals.
                </p>
              </div>
              <div className="choice-card">
                <h2>What do you need today?</h2>
                <p>Choose the path that fits your situation.</p>
                <div className="choices">
                  <button className="choice" onClick={() => setFlow("repair")}>
                    I need HVAC repair help →
                  </button>
                  <button
                    className="choice"
                    onClick={() => setFlow("replacement")}
                  >
                    I need a replacement estimate →
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section className="section">
            <div className="shell">
              <h2>Start with the right request</h2>
              <p className="lede">
                Short, homeowner-friendly forms help us understand whether you
                need a repair or are considering a system replacement.
              </p>
              <div className="grid3">
                <div className="card">
                  <h3>AC repair</h3>
                  <p>
                    Cooling issues, warm air, strange noises, frozen systems,
                    and more.
                  </p>
                  <a className="link" href="/ac-repair">
                    Explore AC repair →
                  </a>
                </div>
                <div className="card">
                  <h3>HVAC replacement</h3>
                  <p>
                    For homeowners comparing a new AC, heat pump, or full HVAC
                    system.
                  </p>
                  <a className="link" href="/hvac-replacement">
                    Explore replacement →
                  </a>
                </div>
                <div className="card">
                  <h3>Urgent HVAC issue</h3>
                  <p>
                    Share what is happening. Availability depends on
                    participating professionals.
                  </p>
                  <a className="link" href="/emergency-ac-repair">
                    Request urgent help →
                  </a>
                </div>
              </div>
            </div>
          </section>
          <section className="section band">
            <div className="shell">
              <h2>How requests work</h2>
              <div className="steps">
                <div>
                  <span className="step-num">1</span>
                  <h3>Tell us what your home needs.</h3>
                </div>
                <div>
                  <span className="step-num">2</span>
                  <h3>We review and qualify your request.</h3>
                </div>
                <div>
                  <span className="step-num">3</span>
                  <h3>
                    Your request may be shared with a local HVAC professional.
                  </h3>
                </div>
              </div>
              <div className="cities">
                {cities.map((c) => (
                  <a
                    className="city"
                    key={c}
                    href={"/" + c.toLowerCase().replaceAll(" ", "-")}
                  >
                    {c}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <strong>Arkansas HVAC Connect</strong>
            <p className="fine">
              Homeowner referral service. Not an HVAC contractor.
            </p>
          </div>
          <nav>
            <a href="/how-it-works">How it works</a> ·{" "}
            <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{" "}
            <a href="/contact">Contact</a>
          </nav>
        </div>
      </footer>
      {flow && <LeadForm flow={flow} onClose={() => setFlow(null)} />}
    </>
  );
}
