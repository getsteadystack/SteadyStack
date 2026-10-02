import {
  render,
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  EmailHeader,
  EmailFooter,
  PrimaryButton,
} from "../primitives";
import { emailTheme } from "../styles/theme";
import type { WeeklyDigestData } from "../index";

export function WeeklyDigest({ data }: { data: WeeklyDigestData }) {
  const isFlawless = data.totalIncidents === 0;
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://steadystack.dev"
  ).replace(/\/+$/, "");

  return (
    <Html>
      <Head>
        <title>Weekly Uptime Report - {data.weekRange}</title>
        <style>{`
          body { margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; border-radius: 0 !important; }
            .stat-column { display: block !important; width: 100% !important; margin-bottom: 10px !important; }
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
            border: "1px solid #27272a",
            borderRadius: "12px",
            backgroundColor: "#121215",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <EmailHeader badge="WEEKLY DIGEST" badgeColor="#06b6d4" />

          {/* Digest Body */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <div style={{ marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#06b6d4",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Telemetry & Availability Digest
              </span>
            </div>

            <Text
              style={{
                margin: "0 0 4px",
                fontSize: "22px",
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: "-0.4px",
              }}
            >
              Weekly Performance Summary
            </Text>

            <Text
              style={{
                margin: "0 0 24px",
                fontSize: "13px",
                fontFamily: emailTheme.fonts.mono,
                color: "#71717a",
              }}
            >
              Reporting Period: {data.weekRange}
            </Text>

            {/* 3-Column KPI Metric Cards */}
            <table
              width="100%"
              border={0}
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
              style={{ marginBottom: "24px" }}
            >
              <tbody>
                <tr>
                  {/* Uptime Stat */}
                  <td
                    width="32%"
                    style={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "10px",
                      padding: "16px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        fontFamily: emailTheme.fonts.mono,
                        color: data.uptimePercentage >= 99.9 ? "#10b981" : "#f59e0b",
                        marginBottom: "4px",
                      }}
                    >
                      {data.uptimePercentage}%
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#71717a",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Avg Uptime
                    </div>
                  </td>

                  <td width="2%" />

                  {/* Monitors Stat */}
                  <td
                    width="32%"
                    style={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "10px",
                      padding: "16px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        fontFamily: emailTheme.fonts.mono,
                        color: "#f4f4f5",
                        marginBottom: "4px",
                      }}
                    >
                      {data.totalMonitors}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#71717a",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Endpoints
                    </div>
                  </td>

                  <td width="2%" />

                  {/* Incidents Stat */}
                  <td
                    width="32%"
                    style={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "10px",
                      padding: "16px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        fontFamily: emailTheme.fonts.mono,
                        color: isFlawless ? "#10b981" : "#ef4444",
                        marginBottom: "4px",
                      }}
                    >
                      {data.totalIncidents}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#71717a",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Incidents
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Top Performers Section */}
            {data.topPerformers.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <Text
                  style={{
                    margin: "0 0 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Top Monitored Services
                </Text>

                {data.topPerformers.map((monitor, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      marginBottom: "8px",
                    }}
                  >
                    <table
                      width="100%"
                      border={0}
                      cellPadding="0"
                      cellSpacing="0"
                      role="presentation"
                    >
                      <tbody>
                        <tr>
                          <td align="left" style={{ verticalAlign: "middle" }}>
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#f4f4f5",
                              }}
                            >
                              {monitor.name}
                            </span>
                          </td>
                          <td align="right" style={{ verticalAlign: "middle" }}>
                            <span
                              style={{
                                fontFamily: emailTheme.fonts.mono,
                                fontSize: "13px",
                                fontWeight: "700",
                                color: monitor.uptime >= 99.9 ? "#10b981" : "#38bdf8",
                              }}
                            >
                              {monitor.uptime}%
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <PrimaryButton href={`${baseUrl}/dashboard`}>View Analytics Dashboard</PrimaryButton>
          </Section>

          {/* Footer */}
          <EmailFooter
            customMessage="Weekly digest generated by SteadyStack Distributed Analytics Engine."
            unsubscribeUrl={`${baseUrl}/dashboard/settings?tab=notifications`}
          />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderWeeklyDigest(data: WeeklyDigestData): Promise<string> {
  return await render(<WeeklyDigest data={data} />);
}
