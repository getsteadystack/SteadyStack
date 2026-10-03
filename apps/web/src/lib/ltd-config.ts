/**
 * Centralized Configuration & Inventory Limiter for SteadyStack Lifetime Deals.
 */

export interface LtdTierConfig {
  tier: 1 | 2 | 3;
  id: string;
  name: string;
  price: number;
  mappedPlan: "Starter / Free" | "Pro Agency" | "Enterprise Scale";
  monitors: number;
  interval: string;
  statusPortals: number;
  seats: number;
  quorum: string;
  telemetryDays: number;
  isSoldOut?: boolean;
}

export const LTD_CONFIG = {
  totalCap: 100,
  claimedCount: Number.parseInt(process.env.NEXT_PUBLIC_LTD_CLAIMED_BASELINE || "0", 10),
  isGloballySoldOut: process.env.NEXT_PUBLIC_LTD_SOLD_OUT === "true" || false,
  tiers: [
    {
      tier: 1,
      id: "ltd-tier-1",
      name: "Solo Founder Lifetime",
      price: 49,
      mappedPlan: "Starter / Free",
      monitors: 50,
      interval: "1-min",
      statusPortals: 2,
      seats: 1,
      quorum: "3-Region (2-of-3)",
      telemetryDays: 30,
      isSoldOut: false,
    },
    {
      tier: 2,
      id: "ltd-tier-2",
      name: "Agency Growth Lifetime",
      price: 99,
      mappedPlan: "Pro Agency",
      monitors: 120,
      interval: "60-sec",
      statusPortals: 5,
      seats: 3,
      quorum: "7-Region (4-of-7)",
      telemetryDays: 45,
      isSoldOut: false,
    },
    {
      tier: 3,
      id: "ltd-tier-3",
      name: "Scale Fleet Lifetime",
      price: 199,
      mappedPlan: "Enterprise Scale",
      monitors: 250,
      interval: "30-sec",
      statusPortals: 15,
      seats: 5,
      quorum: "7-Region (4-of-7)",
      telemetryDays: 90,
      isSoldOut: false,
    },
  ] as LtdTierConfig[],
};
