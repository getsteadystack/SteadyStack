import { PLANS, type PlanTier } from "./billing";

export type FeatureFlag =
  | "custom_domains"
  | "browser_monitors"
  | "sequence_monitors"
  | "mcp_database_monitors"
  | "protocol_monitors"
  | "multi_region"
  | "dynamic_thresholding"
  | "white_label_status_pages"
  | "private_status_pages"
  | "sla_pdf_export"
  | "saml_sso"
  | "custom_webhooks_pagerduty"
  | "pagerduty_integration"
  | "sms_alerts"
  | "multi_seat_teams";

export const PLAN_FEATURE_FLAGS: Record<PlanTier, Record<FeatureFlag, boolean>> = {
  INITIATE: {
    custom_domains: false,
    browser_monitors: false,
    sequence_monitors: false,
    mcp_database_monitors: false,
    protocol_monitors: false,
    multi_region: false,
    dynamic_thresholding: false,
    white_label_status_pages: false,
    private_status_pages: false,
    sla_pdf_export: false,
    saml_sso: false,
    custom_webhooks_pagerduty: false,
    pagerduty_integration: true,
    sms_alerts: false,
    multi_seat_teams: false,
  },
  NETRUNNER: {
    custom_domains: true,
    browser_monitors: true,
    sequence_monitors: true,
    mcp_database_monitors: false,
    protocol_monitors: true,
    multi_region: true,
    dynamic_thresholding: true,
    white_label_status_pages: true,
    private_status_pages: false,
    sla_pdf_export: true,
    saml_sso: false,
    custom_webhooks_pagerduty: false,
    pagerduty_integration: true,
    sms_alerts: false,
    multi_seat_teams: false,
  },
  CONSTRUCT: {
    custom_domains: true,
    browser_monitors: true,
    sequence_monitors: true,
    mcp_database_monitors: true,
    protocol_monitors: true,
    multi_region: true,
    dynamic_thresholding: true,
    white_label_status_pages: true,
    private_status_pages: true,
    sla_pdf_export: true,
    saml_sso: true,
    custom_webhooks_pagerduty: true,
    pagerduty_integration: true,
    sms_alerts: true,
    multi_seat_teams: true,
  },
};

const FEATURE_DESCRIPTIONS: Record<FeatureFlag, { name: string; requiredPlan: PlanTier }> = {
  custom_domains: { name: "Custom CNAME Domains", requiredPlan: "NETRUNNER" },
  browser_monitors: {
    name: "Browser Synthetic Checks",
    requiredPlan: "NETRUNNER",
  },
  sequence_monitors: { name: "API Sequence Checks", requiredPlan: "NETRUNNER" },
  mcp_database_monitors: {
    name: "MCP & Database Monitoring",
    requiredPlan: "CONSTRUCT",
  },
  protocol_monitors: {
    name: "gRPC, SMTP, FTP, ICMP & Mail Monitoring",
    requiredPlan: "NETRUNNER",
  },
  multi_region: { name: "Multi-Region Monitoring", requiredPlan: "NETRUNNER" },
  dynamic_thresholding: {
    name: "Dynamic Anomaly Thresholds",
    requiredPlan: "NETRUNNER",
  },
  white_label_status_pages: {
    name: "White-Label Status Pages",
    requiredPlan: "NETRUNNER",
  },
  private_status_pages: {
    name: "Password-Protected Portals",
    requiredPlan: "CONSTRUCT",
  },
  sla_pdf_export: { name: "SLA PDF Export Reports", requiredPlan: "NETRUNNER" },
  saml_sso: { name: "SAML SSO & Workspaces", requiredPlan: "CONSTRUCT" },
  custom_webhooks_pagerduty: {
    name: "Custom Webhook Integrations",
    requiredPlan: "CONSTRUCT",
  },
  pagerduty_integration: {
    name: "PagerDuty Integration",
    requiredPlan: "INITIATE",
  },
  sms_alerts: { name: "SMS Notification Alerts", requiredPlan: "CONSTRUCT" },
  multi_seat_teams: {
    name: "Multi-Seat Team Workspaces & RBAC",
    requiredPlan: "CONSTRUCT",
  },
};

/**
 * Checks if a feature flag is enabled for the specified plan.
 */
export function isFeatureEnabled(plan: PlanTier, flag: FeatureFlag): boolean {
  return PLAN_FEATURE_FLAGS[plan]?.[flag] ?? false;
}

/**
 * Gets a human-readable error explaining why access is denied and which plan is required.
 */
export function getFeatureError(flag: FeatureFlag): string {
  const meta = FEATURE_DESCRIPTIONS[flag];
  const planName = PLANS[meta.requiredPlan]?.name || meta.requiredPlan;
  return `${meta.name} requires the ${planName} plan. Please upgrade your workspace subscription to unlock this feature.`;
}
