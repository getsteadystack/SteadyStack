import * as React from "react";
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

export interface UsageLimitWarningEmailProps {
  userName: string;
  planName: string;
  warnings: Array<{
    resource: string;
    label: string;
    used: number;
    limit: number;
    percentage: number;
  }>;
  upgradeUrl: string;
}

export const UsageLimitWarningEmail: React.FC<Readonly<UsageLimitWarningEmailProps>> = ({
  userName = "Operator",
  planName = "Starter",
  warnings = [
    {
      resource: "monitors",
      label: "Active Monitors",
      used: 42,
      limit: 50,
      percentage: 84,
    },
  ],
  upgradeUrl,
}) => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://steadystack.dev"
  ).replace(/\/+$/, "");

  const finalUpgradeUrl = upgradeUrl || `${baseUrl}/dashboard/settings?tab=billing`;
  const hasCriticalWarning = warnings.some((w) => w.percentage >= 90);
  const themeColor = hasCriticalWarning ? "#ef4444" : "#f59e0b";

  return (
    <Html>
      <Head>
        <title>Workspace Usage Limit Warning</title>
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
            border: `1px solid ${themeColor}40`,
            borderRadius: "12px",
            backgroundColor: "#121215",
            boxShadow: `0 12px 40px ${themeColor}14`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <EmailHeader badge="USAGE ALERT" badgeColor={themeColor} />

          {/* Body Content */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <div style={{ marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: themeColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Plan Quota Threshold Reached
              </span>
            </div>

            <Text
              style={{
                margin: "0 0 12px",
                fontSize: "22px",
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: "-0.4px",
              }}
            >
              Workspace Approaching Limits
            </Text>

            <Text
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              Hello {userName}, your workspace on the{" "}
              <strong style={{ color: "#f4f4f5" }}>{planName}</strong> plan is nearing its resource
              allowance. Upgrade before hitting 100% capacity to prevent new check or integration
              creation blocks.
            </Text>

            {/* Warning Meters */}
            <div style={{ marginBottom: "24px" }}>
              {warnings.map((w, idx) => {
                const isCritical = w.percentage >= 90;
                const meterColor = isCritical ? "#ef4444" : "#f59e0b";

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "#18181b",
                      borderRadius: "10px",
                      border: "1px solid #27272a",
                      padding: "16px 20px",
                      marginBottom: "12px",
                    }}
                  >
                    <table
                      width="100%"
                      border={0}
                      cellPadding="0"
                      cellSpacing="0"
                      role="presentation"
                      style={{ marginBottom: "10px" }}
                    >
                      <tbody>
                        <tr>
                          <td align="left">
                            <span
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "#f4f4f5",
                              }}
                            >
                              {w.label}
                            </span>
                          </td>
                          <td align="right">
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "700",
                                fontFamily: emailTheme.fonts.mono,
                                color: meterColor,
                              }}
                            >
                              {w.used} / {w.limit} ({w.percentage}%)
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Progress Bar Container */}
                    <div
                      style={{
                        backgroundColor: "#27272a",
                        borderRadius: "9999px",
                        height: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: meterColor,
                          width: `${Math.min(w.percentage, 100)}%`,
                          height: "100%",
                          borderRadius: "9999px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <PrimaryButton href={finalUpgradeUrl}>Upgrade Workspace Plan</PrimaryButton>
          </Section>

          {/* Footer */}
          <EmailFooter
            customMessage="Quota & Capacity Management System."
            unsubscribeUrl={`${baseUrl}/dashboard/settings?tab=billing`}
          />
        </Container>
      </Body>
    </Html>
  );
};

export async function renderUsageLimitWarning(props: UsageLimitWarningEmailProps): Promise<string> {
  return await render(<UsageLimitWarningEmail {...props} />);
}
