export type MonitorStatus = "UP" | "DOWN" | "MAINTENANCE" | "DEGRADED";

export type MonitorType =
  | "HTTP"
  | "HTTPS"
  | "PING"
  | "PORT"
  | "DNS"
  | "SSL"
  | "DOMAIN"
  | "HEARTBEAT"
  | "BROWSER"
  | "SEQUENCE"
  | "GRAPHQL"
  | "WEBSOCKET"
  | "DATABASE"
  | "BGP"
  | "MCP"
  | "GRPC"
  | "SMTP"
  | "FTP"
  | "ICMP"
  | "MAIL";

export type ProbeHealthState = "ONLINE" | "DEGRADED" | "OFFLINE" | "FLAPPING";

export interface ProbeJob {
  id: string;
  monitorId: string;
  url: string;
  /** Encrypted client certificate bundle for mTLS HTTP monitors. */
  clientCert?: string;
  type: string;
  timeout: number;
  method?: string;
  headers?: string;
  body?: string;
  expectation?: string;
  script?: string;
  checkRegions?: string[];
}

/**
 * Standardized result payload from any probe (Cloudflare DO or external VPS agent)
 */
export interface ProbeCheckResult {
  monitorId: string;
  probeId: string;
  region: string;
  status: "UP" | "DOWN";
  statusCode?: number | undefined;
  latency: number;
  errorClass?: string | undefined;
  errorReason?: string | undefined;
  resolvedIp?: string | undefined;
  asn?: string | undefined;
  colo?: string | undefined;
  timestamp: string;
  isVerificationRetry?: boolean | undefined;
}

export interface CheckResult {
  monitorId: string;
  status: MonitorStatus;
  latency: number;
  errorReason?: string | undefined;
  timestamp: string;
  region: string;
  probeId?: string | undefined;
  colo?: string | undefined;
  resolvedIp?: string | undefined;
  asn?: string | undefined;
}

/**
 * Quorum Consensus Engine evaluation result
 */
export interface QuorumEvaluation {
  monitorId: string;
  finalStatus: "UP" | "DOWN" | "DEGRADED";
  isDownConsensus: boolean;
  isRegionalDegradation: boolean;
  isGlobalOutage: boolean;
  confirmedDownCount: number;
  totalEligibleProbes: number;
  reportingRegions: string[];
  downRegions: string[];
  upRegions: string[];
  excludedFlappingProbes: string[];
  excludedSlowProbes: string[];
  asnDistribution: Record<string, number>;
  distinctDownAsns?: string[];
  isSingleProviderPartition?: boolean;
  averageLatency: number;
  timestamp: string;
  reason?: string | undefined;
}

/**
 * State Transition event (recorded to database on state change)
 */
export interface StateChangeEvent {
  monitorId: string;
  previousStatus: MonitorStatus;
  newStatus: MonitorStatus;
  timestamp: Date;
  reason?: string | undefined;
  downRegions: string[];
  confirmedCount: number;
  isGlobalOutage: boolean;
}

/**
 * Live Probe Telemetry published for public transparency
 */
export interface LiveProbeNodeTelemetry {
  code: string;
  name: string;
  city: string;
  continent: string;
  flag: string;
  provider: string;
  asn: string;
  colo: string;
  status: ProbeHealthState;
  lastHeartbeat: string;
  latencyMs: number;
  activeChecksLastHour: number;
  ipv4Ranges: string[];
  ipv6Ranges: string[];
  flappingTransitions2h: number;
}
