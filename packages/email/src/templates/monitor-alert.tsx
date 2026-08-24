import {
  render,
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  EmailHeader,
  EmailFooter,
  PrimaryButton,
} from "../primitives";
import { emailTheme } from "../styles/theme";
import type { MonitorAlertData } from "../index";

export function MonitorAlert({ data }: { data: MonitorAlertData }) {
  const isDown = data.status === "DOWN";
  const isDegraded = data.status === "DEGRADED";
  const isSslWarning =
    data.reason?.includes("expires in") || data.reason?.includes("SSL certificate expires");

  let statusColor = isDown ? "#ef4444" : isDegraded ? "#f59e0b" : "#10b981";
  let statusBadgeText = isDown
    ? "CRITICAL ALERT"
    : isDegraded
      ? "REGIONAL DEGRADATION"
      : "INCIDENT RESOLVED";
  let statusTitle = isDown
    ? "Service Outage Detected"
    : isDegraded
      ? "Partial Regional Failure Detected"
      : "Service Recovered & Operational";

  if (isSslWarning) {
    statusColor = "#f59e0b";
    statusBadgeText = "SSL WARNING";
    statusTitle = "SSL Certificate Expiring Soon";
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://steadystack.dev"
  ).replace(/\/+$/, "");

  const dashboardUrl = `${baseUrl}/dashboard/monitors/${data.monitorId}`;
  const actionUrl = data.runbookUrl || dashboardUrl;

  return (
    <Html>
      <Head>
        <title>{statusTitle}</title>
        <style>{`
          body { margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; border-radius: 0 !important; }
          }
        `}</style>
      </Head>
      <Body
        style={{
          backgroundColor: "#09090b",
          color: "#f4f4f5",
          fontFamily: emailTheme.fonts.sans,
          padding: "32px 16px",
          margin: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "580px",
            border: `1px solid ${statusColor}40`,
            borderRadius: "12px",
            backgroundColor: "#121215",
            boxShadow: `0 12px 40px ${statusColor}18`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <EmailHeader badge={statusBadgeText} badgeColor={statusColor} />

          {/* Alert Status Card */}
          <Section style={{ padding: "32px 32px 24px" }}>
            {/* Status Indicator */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  backgroundColor: `${statusColor}18`,
                  border: `1px solid ${statusColor}33`,
                  color: statusColor,
                  fontSize: "13px",
                  fontWeight: "700",
                  fontFamily: emailTheme.fonts.mono,
                  letterSpacing: "0.5px",
                }}
              >
                <span style={{ marginRight: "8px", fontSize: "10px" }}>●</span>
                {isDown ? "SERVICE DOWN" : isSslWarning ? "EXPIRY NOTICE" : "SERVICE RESTORED"}
              </div>
            </div>

            <Text
              style={{
                margin: "0 0 6px",
                fontSize: "22px",
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: "-0.4px",
              }}
            >
              {data.monitorName}
            </Text>

            <Text
              style={{
                margin: "0 0 20px",
                fontSize: "13px",
                fontFamily: emailTheme.fonts.mono,
                color: "#71717a",
                wordBreak: "break-all",
              }}
            >
              {data.url}
            </Text>

            {/* Diagnostic Details Grid */}
            <div
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <table width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation">
                <tbody>
                  <tr>
                    <td
                      style={{
                        paddingBottom: "12px",
                        fontSize: "13px",
                        color: "#a1a1aa",
                        width: "35%",
                      }}
                    >
                      Status Change:
                    </td>
                    <td
                      style={{
                        paddingBottom: "12px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: statusColor,
                      }}
                    >
                      {data.previousStatus} ➔ {data.status}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        paddingBottom: "12px",
                        fontSize: "13px",
                        color: "#a1a1aa",
                      }}
                    >
                      Timestamp:
                    </td>
                    <td
                      style={{
                        paddingBottom: "12px",
                        fontSize: "13px",
                        color: "#f4f4f5",
                        fontFamily: emailTheme.fonts.mono,
                      }}
                    >
                      {new Date(data.timestamp).toUTCString()}
                    </td>
                  </tr>

                  {data.downtimeDuration && !isDown && (
                    <tr>
                      <td
                        style={{
                          paddingBottom: "12px",
                          fontSize: "13px",
                          color: "#a1a1aa",
                        }}
                      >
                        Total Downtime:
                      </td>
                      <td
                        style={{
                          paddingBottom: "12px",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#10b981",
                        }}
                      >
                        {data.downtimeDuration}
                      </td>
                    </tr>
                  )}

                  {data.reason && (
                    <tr>
                      <td
                        style={{
                          paddingTop: "4px",
                          fontSize: "13px",
                          color: "#a1a1aa",
                          verticalAlign: "top",
                        }}
                      >
                        Failure Reason:
                      </td>
                      <td
                        style={{
                          paddingTop: "4px",
                          fontSize: "13px",
                          fontFamily: emailTheme.fonts.mono,
                          color: isDown ? "#f87171" : "#e4e4e7",
                          lineHeight: 1.5,
                        }}
                      >
                        {data.reason}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Failed Regions Badge Row */}
            {data.failedRegions && data.failedRegions.length > 0 && (
              <div
                style={{
                  backgroundColor: "#1e1316",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  marginBottom: "24px",
                }}
              >
                <Text
                  style={{
                    margin: "0 0 8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#f87171",
                  }}
                >
                  Detected from {data.failedRegions.length} Edge Locations:
                </Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.failedRegions.map((region, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: "inline-block",
                        fontFamily: emailTheme.fonts.mono,
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        marginRight: "6px",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA */}
            <PrimaryButton href={actionUrl} variant={isDown ? "danger" : "primary"}>
              {data.runbookUrl
                ? "View Incident Runbook"
                : isDown
                  ? "Investigate Incident"
                  : "View Live Telemetry"}
            </PrimaryButton>

            {data.runbookUrl && (
              <Text
                style={{
                  margin: "12px 0 0",
                  fontSize: "12px",
                  color: "#71717a",
                  textAlign: "center",
                }}
              >
                Or open{" "}
                <Link href={dashboardUrl} style={{ color: "#a1a1aa", textDecoration: "underline" }}>
                  monitor dashboard
                </Link>
              </Text>
            )}
          </Section>

          {/* Footer */}
          <EmailFooter
            customMessage="This is an automated alert generated by the SteadyStack edge consensus engine."
            unsubscribeUrl={`${baseUrl}/dashboard/settings?tab=notifications`}
          />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderMonitorAlert(data: MonitorAlertData): Promise<string> {
  return await render(<MonitorAlert data={data} />);
}
