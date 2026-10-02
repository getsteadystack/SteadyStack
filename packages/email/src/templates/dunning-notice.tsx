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

export interface DunningNoticeEmailProps {
  userName: string;
  planName: string;
  amountDue: string;
  failureReason?: string;
  billingPortalUrl: string;
}

export const DunningNoticeEmail: React.FC<Readonly<DunningNoticeEmailProps>> = ({
  userName = "Operator",
  planName = "Enterprise",
  amountDue = "$49.00",
  failureReason = "Card declined by issuing bank",
  billingPortalUrl,
}) => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://steadystack.dev"
  ).replace(/\/+$/, "");

  const finalBillingUrl = billingPortalUrl || `${baseUrl}/dashboard/settings?tab=billing`;

  return (
    <Html>
      <Head>
        <title>Payment Action Required</title>
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
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "12px",
            backgroundColor: "#121215",
            boxShadow: "0 12px 40px rgba(239, 68, 68, 0.15)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <EmailHeader badge="BILLING ACTION" badgeColor="#ef4444" />

          {/* Content */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <div style={{ marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#ef4444",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Subscription Payment Failed
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
              Action Required: Update Payment Method
            </Text>

            <Text
              style={{
                margin: "0 0 20px",
                fontSize: "15px",
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              Hello {userName}, we were unable to process the scheduled renewal for your{" "}
              <strong style={{ color: "#f4f4f5" }}>{planName}</strong> plan subscription.
            </Text>

            {/* Invoice Failure Card */}
            <div
              style={{
                backgroundColor: "#1c1214",
                borderRadius: "10px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <table width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation">
                <tbody>
                  <tr>
                    <td
                      style={{
                        paddingBottom: "10px",
                        fontSize: "13px",
                        color: "#a1a1aa",
                        width: "40%",
                      }}
                    >
                      Outstanding Amount:
                    </td>
                    <td
                      style={{
                        paddingBottom: "10px",
                        fontSize: "15px",
                        fontWeight: "700",
                        fontFamily: emailTheme.fonts.mono,
                        color: "#f87171",
                      }}
                    >
                      {amountDue}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontSize: "13px",
                        color: "#a1a1aa",
                      }}
                    >
                      Processor Message:
                    </td>
                    <td
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#fca5a5",
                      }}
                    >
                      {failureReason}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Text
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                color: "#8a8a98",
                lineHeight: 1.6,
              }}
            >
              Your monitoring checks and alert escalations remain active during our grace period.
              Please update your payment method to ensure continuous 24/7 service without
              interruption.
            </Text>

            {/* CTA Button */}
            <PrimaryButton href={finalBillingUrl} variant="danger">
              Update Payment Method
            </PrimaryButton>
          </Section>

          {/* Footer */}
          <EmailFooter
            customMessage="Invoicing & Subscription Management Engine."
            unsubscribeUrl={`${baseUrl}/dashboard/settings?tab=billing`}
          />
        </Container>
      </Body>
    </Html>
  );
};

export async function renderDunningNotice(props: DunningNoticeEmailProps): Promise<string> {
  return await render(<DunningNoticeEmail {...props} />);
}
