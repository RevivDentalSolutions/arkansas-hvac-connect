export type LeadRoutingInput = {
  flow: string;
  scoreLabel: string;
  urgency?: string | null;
  service: string;
  city?: string | null;
  zip?: string | null;
};

export type PartnerRoutingCandidate = {
  id: string;
  deliveryPriority: number;
  monthlyLeadsDelivered: number;
  monthlyLeadCap?: number | null;
  monthlySpendCents: number;
  monthlySpendCapCents?: number | null;
  acceptedServices: string[];
  acceptedLeadTypes: string[];
  acceptedCities: string[];
  acceptedZips: string[];
};

export type PriceKey =
  | "standard_repair"
  | "urgent_repair"
  | "replacement"
  | "hot_replacement";

export function priceKeyForLead(lead: LeadRoutingInput): PriceKey {
  if (lead.flow === "replacement" && lead.scoreLabel === "HOT REPLACEMENT") {
    return "hot_replacement";
  }
  if (lead.flow === "replacement") return "replacement";
  if (lead.urgency === "Today" || lead.scoreLabel === "HOT REPAIR") {
    return "urgent_repair";
  }
  return "standard_repair";
}

function accepts(values: string[], value: string) {
  return values.includes("all") || values.includes(value);
}

function servesLocation(
  candidate: PartnerRoutingCandidate,
  lead: LeadRoutingInput,
) {
  const city = lead.city?.trim().toLowerCase();
  const zip = lead.zip?.trim();
  return (
    (zip && candidate.acceptedZips.includes(zip)) ||
    (city && candidate.acceptedCities.includes(city))
  );
}

export function selectEligiblePartner(
  lead: LeadRoutingInput,
  priceCents: number,
  candidates: PartnerRoutingCandidate[],
) {
  return candidates
    .filter((candidate) => {
      const hasLeadCapacity =
        !candidate.monthlyLeadCap ||
        candidate.monthlyLeadsDelivered < candidate.monthlyLeadCap;
      const hasSpendCapacity =
        !candidate.monthlySpendCapCents ||
        candidate.monthlySpendCents + priceCents <=
          candidate.monthlySpendCapCents;
      return (
        hasLeadCapacity &&
        hasSpendCapacity &&
        accepts(candidate.acceptedServices, lead.service) &&
        accepts(candidate.acceptedLeadTypes, lead.flow) &&
        servesLocation(candidate, lead)
      );
    })
    .sort(
      (a, b) =>
        b.deliveryPriority - a.deliveryPriority ||
        a.monthlyLeadsDelivered - b.monthlyLeadsDelivered ||
        a.id.localeCompare(b.id),
    )[0];
}
