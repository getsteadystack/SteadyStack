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
import type { VerificationEmailData } from "../index";

export function Verification({ data }: { data: VerificationEmailData }) {
  return (
    <Html>
      <Head>
        <title>Verify Your Email - SteadyStack</title>
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
          <EmailHeader badge="VERIFICATION" badgeColor="#06b6d4" />

          {/* Verification Content */}
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
              Verify Your Email Address
            </Text>

            <Text
              style={{
                margin: "0 0 20px",
                fontSize: "15px",
                color: "#a1a1aa",
                lineHeight: 1.6,
              }}
            >
              Hi {data.userName}, thank you for registering with SteadyStack. Please confirm your
              email to activate your account and access global edge monitoring.
            </Text>

            {/* CTA Button */}
            <PrimaryButton href={data.verificationUrl}>Verify Email Address</PrimaryButton>

            {/* Expiry / Security Note */}
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
                🔒 Security Notice
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#71717a",
                  lineHeight: 1.5,
                }}
              >
                This verification link expires in 24 hours. If you did not create a SteadyStack
                account, please disregard this email.
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
              Button not working? Copy and paste this link into your browser:
            </Text>
            <div
              style={{
                backgroundColor: "#0d0d10",
                border: "1px solid #1f1f23",
                borderRadius: "6px",
                padding: "10px 14px",
                fontFamily: emailTheme.fonts.mono,
                fontSize: "11px",
                color: "#06b6d4",
                wordBreak: "break-all",
                lineHeight: 1.4,
              }}
            >
              {data.verificationUrl}
            </div>
          </Section>

          {/* Footer */}
          <EmailFooter customMessage="SteadyStack Identity & Access Management System" />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderVerification(data: VerificationEmailData): Promise<string> {
  return await render(<Verification data={data} />);
}
