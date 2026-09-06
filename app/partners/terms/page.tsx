import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Partner Terms & Pilot Rules | Arkansas HVAC Connect" },
  alternates: { canonical: "/partners/terms" },
  robots: { index: false, follow: true },
};

export default function PartnerTermsPage() {
  return (
    <main className="section">
      <article className="article partner-terms">
        <p className="eyebrow" style={{ color: "#1267a8" }}>
          Arkansas HVAC Connect
        </p>
        <h1>Partner Terms & Founding Pilot Rules</h1>
        <p>
          These operational terms describe the founding partner application and
          pilot. They are not represented as attorney-reviewed legal advice.
        </p>
        <h2>Platform role</h2>
        <p>
          Arkansas HVAC Connect is an independent lead-generation and referral
          platform, not an HVAC contractor or service provider. The contractor
          remains solely responsible for licensing, insurance, estimates,
          contracts, scheduling, service, workmanship, warranties, regulatory
          compliance, homeowner communications, and collection.
        </p>
        <h2>No booking or job guarantee</h2>
        <p>
          A lead is a homeowner request, not a guaranteed appointment, purchase,
          job, conversion, or revenue outcome.
        </p>
        <h2>Qualified and billable lead</h2>
        <p>
          A qualified lead is a homeowner-requested HVAC inquiry with usable
          contact information that fits the participating contractor’s agreed
          service type and territory and is successfully delivered through the
          platform. Pricing, if continued after pilot, is fixed per delivered
          qualified lead and configured in advance.
        </p>
        <h2>Founding pilot</h2>
        <p>
          The first 3 qualified, successfully delivered leads for an approved
          pilot partner are free. No payment method is required for the pilot,
          and participation does not require continuation after it ends.
        </p>
        <h2>Exclusive assignment</h2>
        <p>
          Exclusive means Arkansas HVAC Connect assigns that platform lead to
          one participating contractor through its platform. It does not
          guarantee that a homeowner will not contact another business
          independently.
        </p>
        <h2>Potentially creditable lead issues</h2>
        <p>
          Possible credit review may apply to a bogus/spam submission, invalid
          contact information, a duplicate attributable to this platform, a lead
          outside the agreed territory or accepted services, or a homeowner who
          credibly states they did not request HVAC contact. A homeowner who
          does not answer, declines an estimate, chooses another company, or is
          not won by the contractor is not automatically invalid.
        </p>
        <h2>Homeowner data</h2>
        <p>
          Any homeowner information received through the platform may be used
          only to respond to the homeowner’s submitted HVAC request and
          legitimate follow-up related to that request. It may not be sold,
          reused for unrelated marketing, or shared outside the contractor’s
          legitimate service operations.
        </p>
        <p>
          <Link className="link" href="/partners/apply">
            Apply for the founding pilot →
          </Link>
        </p>
      </article>
    </main>
  );
}
