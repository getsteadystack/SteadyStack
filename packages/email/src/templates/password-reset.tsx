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

export interface PasswordResetEmailData {
  userName?: string;
  resetUrl: string;
}

export function PasswordReset({ data }: { data: PasswordResetEmailData }) {
  const displayName = data.userName || "SteadyStack Operator";

  return (
    <Html>
      <Head>
        <title>Reset Your Password - SteadyStack</title>
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
          <EmailHeader badge="SECURITY" badgeColor="#f59e0b" />

          {/* Content */}
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
              Reset Your Password
            </Text>

            <Text
              style={{
                margin: "0 0 20px",
                fontSize: "15px",
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              Hello {displayName}, we received a request to reset your SteadyStack account password.
              Click the button below to establish new credentials.
            </Text>

            {/* CTA Button */}
            <PrimaryButton href={data.resetUrl}>Reset Account Password</PrimaryButton>

            {/* Security Warning Box */}
            <div
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "16px 20px",
                marginTop: "24px",
                marginBottom: "20px",
              }}
            >
              <Text
                style={{
                  margin: "0 0 6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#f4f4f5",
                }}
              >
                🛡️ Account Protection Advisory
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#71717a",
                  lineHeight: 1.5,
                }}
              >
                If you did not initiate this password reset, no action is needed and your existing
                password remains active. For security, this link expires automatically.
              </Text>
            </div>

            {/* Fallback URL */}
            <Text
              style={{
                margin: "0 0 6px",
                fontSize: "12px",
                color: "#71717a",
              }}
            >
              Direct Link:
            </Text>
            <div
              style={{
                backgroundColor: "#0d0d10",
                border: "1px solid #1f1f23",
                borderRadius: "6px",
                padding: "10px 14px",
                fontFamily: emailTheme.fonts.mono,
                fontSize: "11px",
                color: "#f59e0b",
                wordBreak: "break-all",
                lineHeight: 1.4,
              }}
            >
              {data.resetUrl}
            </div>
          </Section>

          {/* Footer */}
          <EmailFooter customMessage="SteadyStack Security & Authentication Engine" />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderPasswordReset(data: PasswordResetEmailData): Promise<string> {
  return await render(<PasswordReset data={data} />);
}
