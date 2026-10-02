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

export interface SubscriptionConfirmData {
  pageTitle: string;
  verifyUrl: string;
}

export function SubscriptionConfirm({ data }: { data: SubscriptionConfirmData }) {
  return (
    <Html>
      <Head>
        <title>Confirm Subscription to {data.pageTitle} - SteadyStack</title>
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
            border: "1px solid #27272a",
            borderRadius: "12px",
            backgroundColor: "#121215",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <EmailHeader badge="SUBSCRIPTION" badgeColor="#10b981" />

          {/* Content */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <div style={{ marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#10b981",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Status Page Subscription
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
              Confirm Status Notifications
            </Text>

            <Text
              style={{
                margin: "0 0 20px",
                fontSize: "15px",
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              You've requested to receive real-time incident and maintenance notifications for:
            </Text>

            {/* Target Status Page Card */}
            <div
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <table width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation">
                <tbody>
                  <tr>
                    <td align="left">
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#ffffff",
                          marginBottom: "4px",
                        }}
                      >
                        {data.pageTitle}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#71717a",
                        }}
                      >
                        Public Status & Incident Communications
                      </div>
                    </td>
                    <td align="right">
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          fontFamily: emailTheme.fonts.mono,
                          color: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "9999px",
                          textTransform: "uppercase",
                        }}
                      >
                        ● ACTIVE
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA Button */}
            <PrimaryButton href={data.verifyUrl}>Confirm Email Subscription</PrimaryButton>

            <Text
              style={{
                margin: "16px 0 0",
                fontSize: "12px",
                color: "#71717a",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              If you did not request this subscription, you can safely ignore this email and you
              won't be added to any lists.
            </Text>
          </Section>

          {/* Footer */}
          <EmailFooter customMessage="SteadyStack Public Status Communications Engine." />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderSubscriptionConfirm(data: SubscriptionConfirmData): Promise<string> {
  return await render(<SubscriptionConfirm data={data} />);
}
