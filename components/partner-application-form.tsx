"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

const services = [
  "AC repair",
  "Heating repair",
  "Heat pumps",
  "System replacement",
  "Emergency / urgent",
];

export function PartnerApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body: Record<string, FormDataEntryValue | FormDataEntryValue[]> =
      Object.fromEntries(form.entries());
    body.services = form.getAll("services");
    try {
      const response = await fetch("/api/partner-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Unable to submit");
      setSubmitted(true);
    } catch {
      setError("We could not submit your application. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (submitted)
    return (
      <div className="application-success">
        <p className="eyebrow" style={{ color: "#1267a8" }}>
          Application received
        </p>
        <h1>Thank you for your interest.</h1>
        <p>
          Arkansas HVAC Connect verifies business, license, and insurance
          information before activation. Submission does not guarantee
          acceptance. No payment is required for the founding pilot; approved
          applicants receive onboarding instructions.
        </p>
        <Link className="button" href="/partners">
          Return to partner overview
        </Link>
      </div>
    );
  return (
    <form className="application-form" onSubmit={submit}>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="company_site_check" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <fieldset>
        <legend>Business</legend>
        <div className="form-grid">
          <label>
            Legal business name
            <input name="legalName" required maxLength={160} />
          </label>
          <label>
            DBA / business name <input name="dbaName" maxLength={160} />
          </label>
          <label>
            Website{" "}
            <input
              name="website"
              type="url"
              placeholder="https://"
              maxLength={250}
            />
          </label>
          <label>
            Arkansas HVAC/R license number
            <input name="licenseNumber" required maxLength={80} />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Primary contact</legend>
        <div className="form-grid">
          <label>
            Owner or primary contact
            <input name="contactName" required maxLength={120} />
          </label>
          <label>
            Business email
            <input name="email" type="email" required maxLength={254} />
          </label>
          <label>
            Business phone
            <input name="phone" type="tel" required maxLength={32} />
          </label>
          <label>
            Preferred lead-delivery email
            <input name="deliveryEmail" type="email" required maxLength={254} />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Coverage and lead preferences</legend>
        <p className="form-help">Select all that apply.</p>
        <div className="check-grid">
          {services.map((service) => (
            <label key={service}>
              <input type="checkbox" name="services" value={service} />{" "}
              {service}
            </label>
          ))}
        </div>
        <div className="check-grid three">
          <label>
            <input type="checkbox" name="acceptRepair" /> Repair leads
          </label>
          <label>
            <input type="checkbox" name="acceptReplacement" /> Replacement leads
          </label>
          <label>
            <input type="checkbox" name="acceptUrgent" /> Emergency / urgent
            leads
          </label>
        </div>
        <div className="form-grid">
          <label>
            Cities served
            <input
              name="cities"
              required
              placeholder="Little Rock, Conway…"
              maxLength={500}
            />
          </label>
          <label>
            ZIP codes served (if applicable)
            <input name="zips" placeholder="72201, 72113…" maxLength={500} />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Capacity</legend>
        <div className="form-grid">
          <label>
            Approximate monthly lead cap
            <input
              name="monthlyLeadCap"
              type="number"
              min="1"
              max="1000"
              placeholder="Optional"
            />
          </label>
          <label>
            Approximate monthly spend cap after pilot
            <select name="spendCap">
              <option value="decide_after_pilot">Decide after pilot</option>
              <option value="25000">Up to $250</option>
              <option value="50000">Up to $500</option>
              <option value="100000">Up to $1,000</option>
              <option value="custom">Discuss a custom cap</option>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Confirmations</legend>
        <div className="check-stack">
          <label>
            <input type="checkbox" name="insuranceConfirmed" required /> I
            confirm this business maintains appropriate insurance for its HVAC
            services.
          </label>
          <label>
            <input type="checkbox" name="pilotAcknowledged" required /> I
            understand the founding pilot includes the first 3 qualified,
            successfully delivered leads at no charge.
          </label>
          <label>
            <input type="checkbox" name="termsAcknowledged" required /> I have
            read and agree to the{" "}
            <Link className="link" href="/partners/terms" target="_blank">
              Partner Terms & Pilot Rules
            </Link>
            .
          </label>
          <label>
            <input type="checkbox" name="dataAcknowledged" required /> I
            understand homeowner information may only be used to respond to the
            submitted HVAC request and related legitimate follow-up.
          </label>
        </div>
      </fieldset>
      {error && <p className="form-error">{error}</p>}
      <button className="button" disabled={busy}>
        {busy ? "Submitting…" : "Submit founding partner application"}
      </button>
      <p className="partner-fine">
        Questions: partners@arkansashvacconnect.com
      </p>
    </form>
  );
}
