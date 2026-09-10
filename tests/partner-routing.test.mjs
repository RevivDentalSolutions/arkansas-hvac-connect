import test from "node:test";
import assert from "node:assert/strict";
import { selectEligiblePartner } from "../lib/partner-routing.ts";

const lead = { flow: "repair", scoreLabel: "WARM", service: "AC repair", city: "Little Rock" };
const partner = {
  id: "verified-fixture", status: "pilot", deliveryPriority: 1,
  monthlyLeadsDelivered: 0, monthlySpendCents: 0,
  acceptedServices: ["AC repair"], acceptedLeadTypes: ["repair"],
  acceptedCities: ["little rock"], acceptedZips: [],
};
const select = (overrides = {}, price = 4900) =>
  selectEligiblePartner(lead, price, [{ ...partner, ...overrides }]);

test("only active and pilot partners are eligible", () => {
  for (const status of [undefined, null, "", "applicant", "pending_verification", "inactive", "approved"]) {
    assert.equal(select({ status }), undefined);
  }
  assert.equal(select({ status: "active" })?.id, partner.id);
  assert.equal(select()?.id, partner.id);
});
test("test partners are excluded even when marked active", () => {
  assert.equal(select({ status: "active", isTest: true }), undefined);
});
test("zero lead cap blocks assignment while null remains unlimited", () => {
  assert.equal(select({ monthlyLeadCap: 0 }), undefined);
  assert.equal(select({ monthlyLeadCap: null })?.id, partner.id);
  assert.equal(select({ monthlyLeadCap: 2, monthlyLeadsDelivered: 2 }), undefined);
  assert.equal(select({ monthlyLeadCap: 2, monthlyLeadsDelivered: 1 })?.id, partner.id);
});
test("zero spend cap blocks paid leads but permits zero-cost pilot leads", () => {
  assert.equal(select({ monthlySpendCapCents: 0 }), undefined);
  assert.equal(select({ monthlySpendCapCents: 0 }, 0)?.id, partner.id);
  assert.equal(select({ monthlySpendCapCents: null })?.id, partner.id);
  assert.equal(select({ monthlySpendCapCents: 5000, monthlySpendCents: 100 })?.id, partner.id);
  assert.equal(select({ monthlySpendCapCents: 5000, monthlySpendCents: 101 }), undefined);
});
test("invalid prices and unsupported lead flows fail closed", () => {
  for (const price of [-1, NaN, Infinity, 49.5]) assert.equal(select({}, price), undefined);
  assert.equal(selectEligiblePartner({ ...lead, flow: "invalid" }, 4900, [partner]), undefined);
});
test("territory and service exclusions remain enforced", () => {
  assert.equal(select({ acceptedCities: ["conway"] }), undefined);
  assert.equal(select({ acceptedServices: ["Heating repair"] }), undefined);
  assert.equal(select({ acceptedLeadTypes: ["replacement"] }), undefined);
});
test("eligible ranking stays deterministic without mutating input", () => {
  const candidates = [
    { ...partner, id: "b", monthlyLeadsDelivered: 1 },
    { ...partner, id: "a", monthlyLeadsDelivered: 1 },
    { ...partner, id: "blocked", status: "pending_verification", deliveryPriority: 99 },
  ];
  assert.equal(selectEligiblePartner(lead, 4900, candidates)?.id, "a");
  assert.deepEqual(candidates.map(p => p.id), ["b", "a", "blocked"]);
});
