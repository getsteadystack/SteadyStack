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
import type { WelcomeEmailData } from "../index";

export function Welcome({ data }: { data: WelcomeEmailData }) {
  return (
    <Html>
      <Head>
        <title>Welcome to SteadyStack</title>
        <style>{`
          body { margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; border-radius: 0 !important; }
            .card-padding { padding: 24px 16px !important; }
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
          <EmailHeader badge="WELCOME" badgeColor="#10b981" />

          {/* Welcome Hero Content */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <Text
              style={{
                margin: "0 0 12px",
                fontSize: "24px",
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: "-0.5px",
                lineHeight: 1.3,
              }}
            >
              Welcome to SteadyStack, {data.userName}
            </Text>

            <Text
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              Your enterprise monitoring station is now active. SteadyStack tracks your critical
              APIs, websites, and infrastructure across global edge locations with sub-minute
              precision.
            </Text>

            {/* Step 1 */}
            <div
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#10b981",
                    fontSize: "12px",
                    fontWeight: "700",
                    textAlign: "center",
                    lineHeight: "24px",
                    marginRight: "12px",
                    verticalAlign: "top",
                  }}
                >
                  1
                </div>
                <div
                  style={{
                    display: "inline-block",
                    width: "calc(100% - 44px)",
                  }}
                >
                  <Text
                    style={{
                      margin: "0 0 4px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#f4f4f5",
                    }}
                  >
                    Deploy Your First Monitor
                  </Text>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#82828e",
                      lineHeight: 1.5,
                    }}
                  >
                    Configure HTTP/S endpoints, WebSocket streams, SSL expirations, or custom TCP
                    ports.
                  </Text>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(6, 182, 212, 0.15)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    color: "#06b6d4",
                    fontSize: "12px",
                    fontWeight: "700",
                    textAlign: "center",
                    lineHeight: "24px",
                    marginRight: "12px",
                    verticalAlign: "top",
                  }}
                >
                  2
                </div>
                <div
                  style={{
                    display: "inline-block",
                    width: "calc(100% - 44px)",
                  }}
                >
                  <Text
                    style={{
                      margin: "0 0 4px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#f4f4f5",
                    }}
                  >
                    Connect Incident Channels
                  </Text>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#82828e",
                      lineHeight: 1.5,
                    }}
                  >
                    Route real-time alerts to Slack, Discord, PagerDuty, OpsGenie, or custom
                    Webhooks.
                  </Text>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#f59e0b",
                    fontSize: "12px",
                    fontWeight: "700",
                    textAlign: "center",
                    lineHeight: "24px",
                    marginRight: "12px",
                    verticalAlign: "top",
                  }}
                >
                  3
                </div>
                <div
                  style={{
                    display: "inline-block",
                    width: "calc(100% - 44px)",
                  }}
                >
                  <Text
                    style={{
                      margin: "0 0 4px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#f4f4f5",
                    }}
                  >
                    Publish Status Pages
                  </Text>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#82828e",
                      lineHeight: 1.5,
                    }}
                  >
                    Give your users transparent uptime visibility on custom domains with automated
                    incident logs.
                  </Text>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <PrimaryButton href={data.dashboardUrl}>Open Control Center</PrimaryButton>
          </Section>

          {/* Footer */}
          <EmailFooter customMessage="Have questions or need assistance? Our 24/7 engineering team is here to help." />
        </Container>
      </Body>
    </Html>
  );
}

export function renderWelcomeText(data: WelcomeEmailData): string {
  return `Welcome to SteadyStack, ${data.userName}!

Your enterprise monitoring station is now active. SteadyStack tracks your critical services 24/7 across global edge locations with sub-minute precision.

QUICK START:
1. Deploy Your First Monitor: Add HTTP/S endpoints, TCP checks, or SSL expiry rules.
2. Connect Incident Channels: Route alerts to Slack, Discord, PagerDuty, or Webhooks.
3. Publish Status Pages: Give users transparent uptime visibility on custom domains.

Open Control Center: ${data.dashboardUrl}

Sent by SteadyStack Monitoring Platform • https://steadystack.dev`;
}

export async function renderWelcome(data: WelcomeEmailData): Promise<string> {
  return await render(<Welcome data={data} />);
}
