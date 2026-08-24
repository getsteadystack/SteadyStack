export const MonitorType = {
  HTTP: "HTTP",
  HTTPS: "HTTPS",
  PING: "PING",
  PORT: "PORT",
  DNS: "DNS",
  SSL: "SSL",
  DOMAIN: "DOMAIN",
  HEARTBEAT: "HEARTBEAT",
  BROWSER: "BROWSER",
  SEQUENCE: "SEQUENCE",
  GRAPHQL: "GRAPHQL",
  WEBSOCKET: "WEBSOCKET",
  DATABASE: "DATABASE",
  BGP: "BGP",
  MCP: "MCP",
} as const;

export type MonitorTypeValue = (typeof MonitorType)[keyof typeof MonitorType];

export const MonitorStatus = {
  UP: "UP",
  DOWN: "DOWN",
  DEGRADED: "DEGRADED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type MonitorStatusValue = (typeof MonitorStatus)[keyof typeof MonitorStatus];

export const CheckErrorReason = {
  TIMEOUT: "TIMEOUT",
  CONNECTION_REFUSED: "CONNECTION_REFUSED",
  DNS_ERROR: "DNS_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  PORT_CLOSED: "PORT_CLOSED",
  PING_FAILED: "PING_FAILED",
  SSL_CHECK_FAILED: "SSL_CHECK_FAILED",
  LEGACY_TLS_PROTOCOL: "LEGACY_TLS_PROTOCOL",
  DNS_CHECK_FAILED: "DNS_CHECK_FAILED",
  DOMAIN_CHECK_FAILED: "DOMAIN_CHECK_FAILED",
  HEARTBEAT_CHECK_FAILED: "HEARTBEAT_CHECK_FAILED",
  MCP_CHECK_FAILED: "MCP_CHECK_FAILED",
  GRAPHQL_CHECK_FAILED: "GRAPHQL_CHECK_FAILED",
  WEBSOCKET_CHECK_FAILED: "WEBSOCKET_CHECK_FAILED",
  DATABASE_CHECK_FAILED: "DATABASE_CHECK_FAILED",
  BGP_CHECK_FAILED: "BGP_CHECK_FAILED",
} as const;

export type CheckErrorReasonValue = (typeof CheckErrorReason)[keyof typeof CheckErrorReason];

export const NotificationType = {
  INCIDENT_CREATED: "INCIDENT_CREATED",
  INCIDENT_RESOLVED: "INCIDENT_RESOLVED",
  REGIONAL_DEGRADATION: "REGIONAL_DEGRADATION",
  HIGH_LATENCY: "HIGH_LATENCY",
  SSL_EXPIRY: "SSL_EXPIRY",
  CHECK_RESULT: "check_result",
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

export const AlertRuleTrigger = {
  LATENCY: "LATENCY",
  STATUS_CHANGE: "STATUS_CHANGE",
  SSL_EXPIRY: "SSL_EXPIRY",
} as const;

export type AlertRuleTriggerValue = (typeof AlertRuleTrigger)[keyof typeof AlertRuleTrigger];

export const ProxyError = {
  PROXY_UNAVAILABLE: "PROXY_UNAVAILABLE",
  PROXY_FETCH_FAILED: "PROXY_FETCH_FAILED",
  MESH_CONGESTION_FAILSAFE: "MESH_CONGESTION_FAILSAFE",
  MESH_TIMEOUT: "MESH_TIMEOUT",
  GRID_CONGESTION_FAILSAFE: "GRID_CONGESTION_FAILSAFE",
  CLUSTER_TIMEOUT: "CLUSTER_TIMEOUT",
} as const;

export type ProxyErrorValue = (typeof ProxyError)[keyof typeof ProxyError];

/** Milestones (in days) at which an expiring SSL certificate triggers an alert. */
export const SSL_ALERT_MILESTONES = [30, 14, 7, 3, 1] as const;

/** Default alert rule thresholds. */
export const DEFAULT_LATENCY_THRESHOLD_MS = 1000;
export const DEFAULT_SSL_EXPIRY_ALERT_DAYS = 7;

/** Circuit breaker state strings. */
export const CircuitState = {
  OPEN: "OPEN",
  HALF_OPEN: "HALF_OPEN",
  CLOSED: "CLOSED",
} as const;

export type CircuitStateValue = (typeof CircuitState)[keyof typeof CircuitState];
