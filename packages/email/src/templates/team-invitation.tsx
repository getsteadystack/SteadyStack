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

export interface TeamInvitationEmailData {
  inviterName: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
}

export function TeamInvitation({ data }: { data: TeamInvitationEmailData }) {
  return (
    <Html>
      <Head>
        <title>You've been invited to join {data.organizationName} - SteadyStack</title>
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
          <EmailHeader badge="WORKSPACE INVITE" badgeColor="#10b981" />

          {/* Invitation Content */}
          <Section style={{ padding: "32px 32px 24px" }}>
            <Text
              style={{
                margin: "0 0 12px",
                fontSize: "22px",
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: "-0.4px",
              }}
            >
              Join {data.organizationName}
            </Text>

            <Text
              style={{
                margin: "0 0 20px",
                fontSize: "15px",
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "#f4f4f5" }}>{data.inviterName}</strong> has invited you to
              collaborate on the{" "}
              <strong style={{ color: "#f4f4f5" }}>{data.organizationName}</strong> workspace on
              SteadyStack.
            </Text>

            {/* Team Details Card */}
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
                    <td
                      style={{
                        paddingBottom: "12px",
                        fontSize: "13px",
                        color: "#a1a1aa",
                        width: "35%",
                      }}
                    >
                      Workspace:
                    </td>
                    <td
                      style={{
                        paddingBottom: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#ffffff",
                      }}
                    >
                      {data.organizationName}
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
                      Assigned Role:
                    </td>
                    <td style={{ paddingBottom: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          fontFamily: emailTheme.fonts.mono,
                          color: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        {data.role}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontSize: "13px",
                        color: "#a1a1aa",
                        verticalAlign: "top",
                      }}
                    >
                      Capabilities:
                    </td>
                    <td
                      style={{
                        fontSize: "13px",
                        color: "#82828e",
                        lineHeight: 1.5,
                      }}
                    >
                      Access live uptime monitors, incident war rooms, automated alerting, and SLA
                      compliance reports.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA Button */}
            <PrimaryButton href={data.inviteUrl}>Accept Invitation</PrimaryButton>

            {/* Expiry Note */}
            <Text
              style={{
                margin: "16px 0 12px",
                fontSize: "12px",
                color: "#71717a",
                textAlign: "center",
              }}
            >
              This invitation link is unique to you and expires in 7 days.
            </Text>

            {/* Fallback Direct Link */}
            <div
              style={{
                backgroundColor: "#0d0d10",
                border: "1px solid #1f1f23",
                borderRadius: "6px",
                padding: "10px 14px",
                fontFamily: emailTheme.fonts.mono,
                fontSize: "11px",
                color: "#a1a1aa",
                wordBreak: "break-all",
                lineHeight: 1.4,
              }}
            >
              {data.inviteUrl}
            </div>
          </Section>

          {/* Footer */}
          <EmailFooter customMessage="SteadyStack Organizations & Workspace Collaboration Engine" />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderTeamInvitation(data: TeamInvitationEmailData): Promise<string> {
  return await render(<TeamInvitation data={data} />);
}
