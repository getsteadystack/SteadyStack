export type PlanTier = "INITIATE" | "NETRUNNER" | "CONSTRUCT";

export interface PlanLimits {
  maxMonitors: number;
  minIntervalSeconds: number;
  maxAlertChannels: number;
  maxStatusPages: number;
  customDomainAllowed: boolean;
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
  annualPriceMonthly: number; // Monthly equivalent when billed annually ($180/yr = $15/mo, $780/yr = $65/mo)
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  limits: PlanLimits;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanDetails> = {
  INITIATE: {
    id: "INITIATE",
    name: "The Initiate",
    description: "Perfect for indie developers, side projects & commercial use.",
    monthlyPrice: 0,
    annualPriceMonthly: 0,
    limits: {
      maxMonitors: 50,
      minIntervalSeconds: 60,
      maxAlertChannels: 3,
      maxStatusPages: 1,
      customDomainAllowed: false,
      usageMetered: false,
      priorityProbes: false,
      maxSeats: 1,
      multiSeatAllowed: false,
      maxManualChecksPerWindow: 3,
      manualCheckWindowSeconds: 300,
    },
    features: [
      "50 Active Monitors (3m standard, 1m for first 10)",
      "3-region 2-of-3 quorum consensus",
      "Commercial use permitted in writing",
      "Email & Discord alert dispatches",
      "1 Public Status page",
      "3 Days log & telemetry retention",
    ],
  },
  NETRUNNER: {
    id: "NETRUNNER",
    name: "The Netrunner",
    badge: "THE SLEEP PLAN",
    description:
      "Solo devs who value their sleep with 4-of-7 multi-region verification & quorum alerts.",
    monthlyPrice: 19,
    annualPriceMonthly: 15,
    stripePriceIdMonthly:
      process.env.STRIPE_NETRUNNER_MONTHLY_PRICE_ID || "price_netrunner_monthly",
    stripePriceIdAnnual: process.env.STRIPE_NETRUNNER_ANNUAL_PRICE_ID || "price_netrunner_annual",
    limits: {
      maxMonitors: 250,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 15,
      customDomainAllowed: true,
      usageMetered: true,
      priorityProbes: true,
      maxSeats: 1,
      multiSeatAllowed: false,
      maxManualChecksPerWindow: 10,
      manualCheckWindowSeconds: 300,
    },
    features: [
      "250 Active Monitors",
      "30-second Heartbeat checks",
      "4-of-7 multi-region quorum verification",
      "Anomalous latency indicators",
      "SSL & Port monitoring",
      "15 White-label Status pages",
      "45 Days logs & PDF SLA reports",
    ],
  },
  CONSTRUCT: {
    id: "CONSTRUCT",
    name: "The Construct",
    description: "Enterprise reliability, HFT checks, SAML & Workspaces for professional teams.",
    monthlyPrice: 79,
    annualPriceMonthly: 65,
    stripePriceIdMonthly:
      process.env.STRIPE_CONSTRUCT_MONTHLY_PRICE_ID || "price_construct_monthly",
    stripePriceIdAnnual: process.env.STRIPE_CONSTRUCT_ANNUAL_PRICE_ID || "price_construct_annual",
    limits: {
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 75,
      customDomainAllowed: true,
      usageMetered: true,
      priorityProbes: true,
      maxSeats: 25,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 0,
      manualCheckWindowSeconds: 300,
    },
    features: [
      "1,500 Active Monitors",
      "10-second HFT Heartbeat checks",
      "Full Global Pulse coverage (7 regions)",
      "Multi-Seat Team Workspaces & RBAC",
      "SSO, SAML & Workspaces",
      "PagerDuty, Slack & custom webhooks",
      "75 Private status portals",
      "1 Year log retention & 99.99% SLA",
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
      maxMonitors: 50,
      minIntervalSeconds: 60,
      maxAlertChannels: 10,
      maxStatusPages: 3,
      customDomainAllowed: true,
      maxSeats: 3,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 5,
    },
    NETRUNNER: {
      maxMonitors: 50,
      minIntervalSeconds: 60,
      maxAlertChannels: 10,
      maxStatusPages: 3,
      customDomainAllowed: true,
      maxSeats: 3,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 5,
    },
    CONSTRUCT: {
      maxMonitors: 50,
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
      maxMonitors: 150,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 10,
      customDomainAllowed: true,
      maxSeats: 10,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 10,
    },
    NETRUNNER: {
      maxMonitors: 150,
      minIntervalSeconds: 30,
      maxAlertChannels: 25,
      maxStatusPages: 10,
      customDomainAllowed: true,
      maxSeats: 10,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 10,
    },
    CONSTRUCT: {
      maxMonitors: 1500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 75,
    },
  },
  appsumo_tier_3: {
    INITIATE: {
      maxMonitors: 500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 100,
      customDomainAllowed: true,
      maxSeats: 50,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 0,
    },
    NETRUNNER: {
      maxMonitors: 500,
      minIntervalSeconds: 10,
      maxAlertChannels: 250,
      maxStatusPages: 100,
      customDomainAllowed: true,
      maxSeats: 50,
      multiSeatAllowed: true,
      maxManualChecksPerWindow: 0,
    },
    CONSTRUCT: {
      maxMonitors: 500,
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
  resource: "monitors" | "alertChannels" | "statusPages";
  label: string;
  used: number;
  limit: number;
  percentage: number;
}

export interface UsageSummary {
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
