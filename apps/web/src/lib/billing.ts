export type PlanTier = "INITIATE" | "NETRUNNER" | "CONSTRUCT";

export interface PlanLimits {
  maxClients: number;
  maxMonitors: number;
  minIntervalSeconds: number;
  maxAlertChannels: number;
  maxStatusPages: number;
  customDomainAllowed: boolean;
  whiteLabelAllowed: boolean;
  monthlyReportsAllowed: boolean;
  prioritySupport: boolean;
  usageMetered: boolean;
  priorityProbes: boolean;
  maxSeats: number;
  multiSeatAllowed: boolean;
  /** Max manual run-checks per monitor per window. 0 = unlimited. */
  maxManualChecksPerWindow: number;
  /** Sliding window length in seconds for manual check rate limiting. */
  manualCheckWindowSeconds: number;
}

export interface PlanDetails {
  id: PlanTier;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPriceMonthly: number; // Monthly equivalent when billed annually ($348/yr = $29/mo, $948/yr = $79/mo)
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  limits: PlanLimits;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanDetails> = {
  INITIATE: {
    id: "INITIATE",
    name: "Free",
    description: "Essential multi-client uptime monitoring with SteadyStack status badge.",
    monthlyPrice: 0,
    annualPriceMonthly: 0,
    limits: {
      maxClients: 2,
      maxMonitors: 50,
      minIntervalSeconds: 60,
      maxAlertChannels: 3,
      maxStatusPages: 2,
      customDomainAllowed: false,
      whiteLabelAllowed: false,
      monthlyReportsAllowed: false,
      prioritySupport: false,
      usageMetered: false,
      priorityProbes: false,
      maxSeats: 1,
      multiSeatAllowed: false,
      maxManualChecksPerWindow: 3,
      manualCheckWindowSeconds: 300,
    },
    features: [
      "1–2 Client Workspaces",
      "50 Active Monitors (60s check intervals)",
      "3-Region Quorum Verification",
      "Public Status Pages (SteadyStack badge)",
      "Email & Discord Alert Dispatches",
      "3 Days Log Retention",
    ],
  },
  NETRUNNER: {
    id: "NETRUNNER",
    name: "Agency",
    description:
      "Manage up to 10 clients with 100% white-label status portals, custom domains & automated monthly reports.",
    monthlyPrice: 39,
    annualPriceMonthly: 29,
    stripePriceIdMonthly:
      process.env.STRIPE_NETRUNNER_MONTHLY_PRICE_ID || "price_netrunner_monthly",
    stripePriceIdAnnual: process.env.STRIPE_NETRUNNER_ANNUAL_PRICE_ID || "price_netrunner_annual",
    limits: {
      maxClients: 10,
      maxMonitors: 250,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 10,
      customDomainAllowed: true,
      whiteLabelAllowed: true,
      monthlyReportsAllowed: true,
      prioritySupport: false,
      usageMetered: true,
      priorityProbes: true,
      maxSeats: 3,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 10,
      manualCheckWindowSeconds: 300,
    },
    features: [
      "Up to 10 Client Accounts",
      "100% White-Label Status Pages (No platform badge)",
      "Custom Domains with Automated SSL",
      "Automated Monthly PDF Reports & SLA Sign-Offs",
      "250 Active Monitors (30s intervals)",
      "45 Days Telemetry & Retention",
    ],
  },
  CONSTRUCT: {
    id: "CONSTRUCT",
    name: "Agency Pro",
    description:
      "For scaling agencies needing unlimited client accounts, high-frequency heartbeats, and dedicated priority support.",
    monthlyPrice: 99,
    annualPriceMonthly: 79,
    stripePriceIdMonthly:
      process.env.STRIPE_CONSTRUCT_MONTHLY_PRICE_ID || "price_construct_monthly",
    stripePriceIdAnnual: process.env.STRIPE_CONSTRUCT_ANNUAL_PRICE_ID || "price_construct_annual",
    limits: {
      maxClients: 999999,
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 100,
      customDomainAllowed: true,
      whiteLabelAllowed: true,
      monthlyReportsAllowed: true,
      prioritySupport: true,
      usageMetered: true,
      priorityProbes: true,
      maxSeats: 25,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 0,
      manualCheckWindowSeconds: 300,
    },
    features: [
      "Unlimited Client Accounts",
      "100% White-Label Everything (Pages, Reports & Alerts)",
      "Custom Domains & Status Portals",
      "Automated Monthly PDF Reports & SLA Sign-Offs",
      "1,500 Active Monitors (10s HFT checks)",
      "Dedicated Priority Agency Support",
      "1 Year Log Retention & 99.99% SLA",
    ],
  },
};

export const PLAN_VERSIONS: Record<string, Record<PlanTier, Partial<PlanLimits>>> = {
  v1_launch: {
    INITIATE: {
      maxMonitors: 50,
      minIntervalSeconds: 60,
      maxAlertChannels: 3,
      maxStatusPages: 1,
    },
    NETRUNNER: {
      maxMonitors: 250,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 15,
    },
    CONSTRUCT: {
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 75,
    },
  },
  design_partner_vip: {
    INITIATE: {
      maxMonitors: 100,
      minIntervalSeconds: 30,
      maxAlertChannels: 10,
      maxStatusPages: 5,
    },
    NETRUNNER: {
      maxMonitors: 500,
      minIntervalSeconds: 15,
      maxAlertChannels: 50,
      maxStatusPages: 25,
    },
    CONSTRUCT: {
      maxMonitors: 2500,
      minIntervalSeconds: 5,
      maxAlertChannels: 500,
      maxStatusPages: 100,
    },
  },
  stripe_live: {
    INITIATE: {
      maxMonitors: 50,
      minIntervalSeconds: 60,
      maxAlertChannels: 3,
      maxStatusPages: 1,
    },
    NETRUNNER: {
      maxMonitors: 250,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 15,
    },
    CONSTRUCT: {
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 75,
    },
  },
  appsumo_tier_1: {
    INITIATE: {
      maxMonitors: 150,
      minIntervalSeconds: 60,
      maxAlertChannels: 10,
      maxStatusPages: 3,
      customDomainAllowed: true,
      maxSeats: 3,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 5,
    },
    NETRUNNER: {
      maxMonitors: 150,
      minIntervalSeconds: 60,
      maxAlertChannels: 10,
      maxStatusPages: 3,
      customDomainAllowed: true,
      maxSeats: 3,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 5,
    },
    CONSTRUCT: {
      maxMonitors: 150,
      minIntervalSeconds: 60,
      maxAlertChannels: 10,
      maxStatusPages: 3,
      customDomainAllowed: true,
      maxSeats: 3,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 5,
    },
  },
  appsumo_tier_2: {
    INITIATE: {
      maxMonitors: 250,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 10,
      customDomainAllowed: true,
      maxSeats: 10,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 10,
    },
    NETRUNNER: {
      maxMonitors: 250,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 10,
      customDomainAllowed: true,
      maxSeats: 10,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 10,
    },
    CONSTRUCT: {
      maxMonitors: 250,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 10,
      customDomainAllowed: true,
      maxSeats: 10,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 10,
    },
  },
  appsumo_tier_3: {
    INITIATE: {
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 100,
      customDomainAllowed: true,
      maxSeats: 50,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 0,
    },
    NETRUNNER: {
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 100,
      customDomainAllowed: true,
      maxSeats: 50,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 0,
    },
    CONSTRUCT: {
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 100,
      customDomainAllowed: true,
      maxSeats: 50,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 0,
    },
  },
};

/**
 * Resolves limits for a given plan tier, applying grandfathered terms if tierVersion is specified.
 */
export function getPlanLimits(tier: PlanTier, tierVersion?: string | null): PlanLimits {
  const baseLimits = PLANS[tier]?.limits || PLANS.INITIATE.limits;
  if (!tierVersion || !PLAN_VERSIONS[tierVersion] || !PLAN_VERSIONS[tierVersion][tier]) {
    return { ...baseLimits };
  }
  return {
    ...baseLimits,
    ...PLAN_VERSIONS[tierVersion][tier],
  };
}

export interface UsageWarning {
  resource: "clients" | "monitors" | "alertChannels" | "statusPages";
  label: string;
  used: number;
  limit: number;
  percentage: number;
}

export interface UsageSummary {
  clientsUsed: number;
  clientsLimit: number;
  monitorsUsed: number;
  monitorsLimit: number;
  alertChannelsUsed: number;
  alertChannelsLimit: number;
  statusPagesUsed: number;
  statusPagesLimit: number;
  monthlyChecksCount: number;
  plan: PlanTier;
  limits: PlanLimits;
  isApproachingLimit: boolean;
  warnings: UsageWarning[];
  isTrialActive?: boolean;
  trialDaysRemaining?: number;
}
