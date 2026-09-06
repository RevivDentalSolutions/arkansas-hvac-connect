import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For HVAC Companies | Arkansas HVAC Connect",
  description:
    "Apply for the Arkansas HVAC Connect Founding Partner Pilot for Central Arkansas HVAC businesses.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  return (
    <main className="partner-page">
      <section className="partner-hero">
        <div className="shell narrow">
          <p className="eyebrow">For Central Arkansas HVAC companies</p>
          <h1>
            Qualified homeowner requests. One participating contractor at a
            time.
          </h1>
          <p className="partner-lede">
            Arkansas HVAC Connect is an independent homeowner lead-generation
            and referral platform. We connect homeowners seeking HVAC help with
            participating local HVAC businesses—we do not perform HVAC services
            ourselves.
          </p>
          <a className="button partner-cta" href="/partners/apply">
            Apply to Become a Founding Partner
          </a>
          <p className="partner-fine">
            No credit card required for the pilot. No subscription or obligation
            to continue.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell narrow">
          <div className="partner-grid">
            <article>
              <span>01</span>
              <h2>Designed for one contractor</h2>
              <p>
                When a qualified request is delivered, Arkansas HVAC Connect
                assigns it to one participating contractor through the platform.
                We do not intentionally sell the same platform lead to multiple
                contractors at once.
              </p>
            </article>
            <article>
              <span>02</span>
              <h2>Founding Partner Pilot</h2>
              <p>
                Your first 3 qualified, successfully delivered leads are free.
                There is no payment required to participate and no obligation to
                continue after the pilot.
              </p>
            </article>
            <article>
              <span>03</span>
              <h2>Clear operational feedback</h2>
              <p>
                Partners provide simple disposition feedback—contacted, booked,
                not booked, or invalid—so lead quality and routing can be
                evaluated responsibly.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section partner-band">
        <div className="shell narrow">
          <h2>What participation means</h2>
          <ul className="partner-list">
            <li>
              You choose the service types and Central Arkansas areas you
              accept.
            </li>
            <li>You set approximate monthly lead and spend caps.</li>
            <li>
              After the pilot, approved partners may choose to continue on
              configurable fixed pay-per-lead pricing.
            </li>
            <li>
              Arkansas HVAC Connect does not guarantee lead volume, booked work,
              jobs, revenue, or customer purchases.
            </li>
          </ul>
          <a className="text-cta" href="/partners/terms">
            Read partner terms and pilot rules →
          </a>
        </div>
      </section>
      <section className="section">
        <div className="shell narrow partner-close">
          <h2>Built for local HVAC businesses—not a directory listing.</h2>
          <p>
            Apply to be considered for the founding group. We verify business,
            license, and insurance information before any activation.
          </p>
          <a className="button" href="/partners/apply">
            Apply to Become a Founding Partner
          </a>
          <p className="partner-fine">
            Partner questions: partners@arkansashvacconnect.com
          </p>
        </div>
      </section>
    </main>
  );
}
