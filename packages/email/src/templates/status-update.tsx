import * as React from "react";
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
import { isRtlEmailLocale, t, type EmailLocale } from "../i18n";

export interface StatusUpdateData {
  pageTitle: string;
  incidentTitle: string;
  incidentStatus:
    | "INVESTIGATING"
    | "IDENTIFIED"
    | "MONITORING"
    | "RESOLVED"
    | "SCHEDULED"
    | "IN_PROGRESS"
    | "COMPLETED";
  description: string;
  affectedMonitors: string[];
  manageUrl: string;
  pageUrl: string;
}

export function StatusUpdate({
  data,
  locale = "en",
}: {
  data: StatusUpdateData;
  locale?: EmailLocale;
}) {
  const tr = (key: string, params?: Record<string, string | number>) => t(locale, key, params);
  const dir = isRtlEmailLocale(locale) ? "rtl" : "ltr";
  const isResolved = data.incidentStatus === "RESOLVED" || data.incidentStatus === "COMPLETED";
  const isMaintenance =
    data.incidentStatus === "SCHEDULED" || data.incidentStatus === "IN_PROGRESS";

  let statusColor = "#ef4444"; // Red for investigating/identified
  let statusBadge = data.incidentStatus;

  if (isResolved) {
    statusColor = "#10b981"; // Emerald
  } else if (isMaintenance) {
    statusColor = "#06b6d4"; // Cyan
  } else if (data.incidentStatus === "MONITORING") {
    statusColor = "#f59e0b"; // Amber
  }

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <title>
          [{data.incidentStatus}] {data.incidentTitle} - {data.pageTitle}
        </title>
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
            boxShadow: `0 12px 40px ${statusColor}14`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <EmailHeader badge={statusBadge} badgeColor={statusColor} locale={locale} />

          {/* Incident Content */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <div style={{ marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {data.pageTitle} {tr("status.statusUpdateSuffix")}
              </span>
            </div>

            <Text
              style={{
                margin: "0 0 16px",
                fontSize: "22px",
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: "-0.4px",
                lineHeight: 1.3,
              }}
            >
              {data.incidentTitle}
            </Text>

            {/* Status Pill Badge */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  backgroundColor: `${statusColor}18`,
                  border: `1px solid ${statusColor}33`,
                  color: statusColor,
                  fontSize: "12px",
                  fontWeight: "700",
                  fontFamily: emailTheme.fonts.mono,
                  letterSpacing: "0.5px",
                }}
              >
                <span style={{ marginInlineEnd: "6px", fontSize: "10px" }}>●</span>
                {tr("status.statusLabel")} {data.incidentStatus}
              </div>
            </div>

            {/* Description Card */}
            <div
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#d4d4d8",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.description}
              </Text>
            </div>

            {/* Affected Components */}
            {data.affectedMonitors.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <Text
                  style={{
                    margin: "0 0 10px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {tr("status.affectedComponents")}
                </Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.affectedMonitors.map((monitor, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        fontFamily: emailTheme.fonts.mono,
                        fontSize: "12px",
                        color: "#f4f4f5",
                        backgroundColor: "#1f1f23",
                        border: "1px solid #27272a",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        marginInlineEnd: "6px",
                        marginBottom: "4px",
                      }}
                    >
                      {monitor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA */}
            <PrimaryButton href={data.pageUrl}>{tr("status.viewLiveStatus")}</PrimaryButton>
          </Section>

          {/* Footer */}
          <EmailFooter
            locale={locale}
            customMessage={tr("status.subscribedMessage", { page: data.pageTitle })}
            unsubscribeUrl={data.manageUrl}
          />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderStatusUpdate(
  data: StatusUpdateData,
  locale: EmailLocale = "en",
): Promise<string> {
  return await render(<StatusUpdate data={data} locale={locale} />);
}
