import type { Metadata } from "next";
import { PartnerApplicationForm } from "@/components/partner-application-form";

export const metadata: Metadata = {
  title: "Apply as a Founding HVAC Partner | Arkansas HVAC Connect",
  description: "Apply for the Arkansas HVAC Connect Founding Partner Pilot.",
  alternates: { canonical: "/partners/apply" },
};

export default function PartnerApplyPage() {
  return (
    <main className="section">
      <div className="shell application-shell">
        <p className="eyebrow" style={{ color: "#1267a8" }}>
          Founding Partner Pilot
        </p>
        <h1>Apply to Become a Founding Partner</h1>
        <p className="lede">
          A short application for established Central Arkansas HVAC businesses.
          Applications are reviewed before any activation; no homeowner
          information is shared during this process.
        </p>
        <PartnerApplicationForm />
      </div>
    </main>
  );
}
