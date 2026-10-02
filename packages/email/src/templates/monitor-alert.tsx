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
import { isRtlEmailLocale, t, formatEmailTimestamp, type EmailLocale } from "../i18n";

export function MonitorAlert({ data, locale = "en" }: { data: MonitorAlertData; locale?: EmailLocale }) {
  const tr = (key: string, params?: Record<string, string | number>) => t(locale, key, params);
  const dir = isRtlEmailLocale(locale) ? "rtl" : "ltr";

  const isDown = data.status === "DOWN";
  const isDegraded = data.status === "DEGRADED";
  const isSslWarning =
    data.reason?.includes("expires in") || data.reason?.includes("SSL certificate expires");

  let statusColor = isDown ? "#ef4444" : isDegraded ? "#f59e0b" : "#10b981";
  let statusBadgeText = isDown ? tr("alert.critical") : isDegraded ? tr("alert.degraded") : tr("alert.resolved");
  let statusTitle = isDown
    ? tr("alert.outageTitle")
    : isDegraded
      ? tr("alert.degradedTitle")
      : tr("alert.recoveredTitle");

  if (isSslWarning) {
    statusColor = "#f59e0b";
    statusBadgeText = tr("alert.sslWarning");
    statusTitle = tr("alert.sslTitle");
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://steadystack.dev"
  ).replace(/\/+$/, "");

  const dashboardUrl = `${baseUrl}/dashboard/monitors/${data.monitorId}`;
  const actionUrl = data.runbookUrl || dashboardUrl;

  return (
    <Html lang={locale} dir={dir}>
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
          <EmailHeader badge={statusBadgeText} badgeColor={statusColor} locale={locale} />

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
                <span style={{ marginInlineEnd: "8px", fontSize: "10px" }}>●</span>
                {isDown ? tr("alert.serviceDown") : isSslWarning ? tr("alert.expiryNotice") : tr("alert.serviceRestored")}
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
                      {tr("alert.statusChange")}
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
                      {tr("alert.timestamp")}
                    </td>
                    <td
                      style={{
                        paddingBottom: "12px",
                        fontSize: "13px",
                        color: "#f4f4f5",
                        fontFamily: emailTheme.fonts.mono,
                      }}
                    >
                      {formatEmailTimestamp(locale, data.timestamp)}
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
                        {tr("alert.totalDowntime")}
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
                        {tr("alert.failureReason")}
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
                  {tr("alert.detectedFrom", { count: data.failedRegions.length })}
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
                        marginInlineEnd: "6px",
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
              {data.runbookUrl ? tr("alert.viewRunbook") : isDown ? tr("alert.investigate") : tr("alert.viewTelemetry")}
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
                {tr("alert.orOpen")}{" "}
                <Link href={dashboardUrl} style={{ color: "#a1a1aa", textDecoration: "underline" }}>
                  {tr("alert.monitorDashboard")}
                </Link>
              </Text>
            )}
          </Section>

          {/* Footer */}
          <EmailFooter
            locale={locale}
            customMessage={tr("alert.autoMessage")}
            unsubscribeUrl={`${baseUrl}/dashboard/settings?tab=notifications`}
          />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderMonitorAlert(
  data: MonitorAlertData,
  locale: EmailLocale = "en",
): Promise<string> {
  return await render(<MonitorAlert data={data} locale={locale} />);
}
