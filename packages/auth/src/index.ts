import { expo } from "@better-auth/expo";
import { getPrisma } from "@steadystack/db";
import { env } from "@steadystack/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import {
  getResendClient,
  sendPasswordResetEmail,
  sendTeamInvitationEmail,
  sendWelcomeEmail,
} from "@steadystack/email";
import { organization } from "better-auth/plugins";

const safeDbUrl = env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";
const safeAuthUrl = env.BETTER_AUTH_URL || "http://localhost:3000";

const prisma = getPrisma(safeDbUrl);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET || "dummy-secret-for-build-123456789",
  baseURL: safeAuthUrl,
  advanced: {
    useSecureCookies: safeAuthUrl.startsWith("https"),
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  user: {
    additionalFields: {
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC",
      },
      dateFormat: {
        type: "string",
        required: false,
        defaultValue: "MM/DD/YYYY",
      },
      timeFormat: {
        type: "string",
        required: false,
        defaultValue: "HH:mm",
      },
      tier: {
        type: "string",
        required: false,
        defaultValue: "INITIATE",
      },
    },
    deleteUser: {
      enabled: true,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - refresh session expiration when used
    freshAge: 60 * 60 * 24, // 1 day - session is considered fresh for 1 day
  },

  trustedOrigins: [
    ...(env.CORS_ORIGIN ? [env.CORS_ORIGIN] : []),
    ...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
    ...(env.NODE_ENV !== "production"
      ? ["http://localhost:3000", "exp://", "http://127.0.0.1:3000"]
      : []),
  ],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }, _request) => {
      await sendPasswordResetEmail(user.email, {
        userName: user.name || user.email,
        resetUrl: url,
      });
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx: any) => {
          const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

          // 1. Immediately ensure exactly one personal workspace exists for the new user
          try {
            const existingMembership = await prisma.member.findFirst({
              where: { userId: user.id },
            });

            if (!existingMembership) {
              const slug = `personal-${
                user.email
                  .split("@")[0]
                  ?.toLowerCase()
                  .replace(/[^a-z0-9]/g, "") || "user"
              }-${Math.random().toString(36).substring(2, 6)}`;

              await prisma.organization.create({
                data: {
                  name: `${user.name || "Personal"}'s Workspace`,
                  slug,
                  plan: "INITIATE",
                  members: {
                    create: {
                      userId: user.id,
                      role: "owner",
                    },
                  },
                },
              });
              console.log(`[Auth] Created single personal workspace for ${user.email}`);
            }
          } catch (orgErr) {
            console.error("[Auth] Failed to create initial personal workspace:", orgErr);
          }

          // 2. Automatically attribute referral from cookie or request context
          try {
            const rawCookie =
              ctx?.headers?.get?.("cookie") ||
              ctx?.request?.headers?.get?.("cookie") ||
              ctx?.context?.headers?.get?.("cookie") ||
              "";
            let referralCode = "";
            if (rawCookie) {
              const match = rawCookie
                .split("; ")
                .find((row: string) => row.startsWith("steadystack_ref="));
              if (match) {
                try {
                  const val = decodeURIComponent(match.split("=")[1]);
                  const parsed = JSON.parse(val);
                  referralCode = parsed?.code || val;
                } catch {
                  referralCode = match.split("=")[1];
                }
              }
            }

            if (referralCode) {
              const refRecord = await prisma.referralCode.findUnique({
                where: { code: referralCode },
                select: { id: true, userId: true },
              });

              if (refRecord && refRecord.userId !== user.id) {
                const existing = await prisma.referral.findUnique({
                  where: { referredUserId: user.id },
                });

                if (!existing) {
                  await prisma.referral.create({
                    data: {
                      referralCodeId: refRecord.id,
                      referredUserId: user.id,
                      status: "PENDING",
                      rewardAmount: 10.0,
                    },
                  });
                  console.log(
                    `[Auth] Automatically attributed referral for user ${user.email} (code: ${referralCode})`,
                  );
                }
              }
            }
          } catch (refErr) {
            console.error("[Auth] Failed to auto-attribute referral:", refErr);
          }

          // 3. Automatically generate referral code for this new user
          try {
            const existingCode = await prisma.referralCode.findUnique({
              where: { userId: user.id },
            });
            if (!existingCode) {
              const code = `pg_${Math.random().toString(36).substring(2, 9)}`;
              await prisma.referralCode.create({
                data: {
                  userId: user.id,
                  code,
                },
              });
              console.log(`[Auth] Generated referral code ${code} for ${user.email}`);
            }
          } catch (codeErr) {
            console.error("[Auth] Failed to create initial referral code:", codeErr);
          }

          // Fire-and-forget: failures here must never break signup
          void (async () => {
            try {
              await sendWelcomeEmail(user.email, {
                userName: user.name || user.email,
                dashboardUrl: `${appUrl}/dashboard`,
              });
              console.log(`[Auth] Welcome email sent to ${user.email}`);
            } catch (err) {
              // This is intentionally fire-and-forget, but we want visibility.
              // A missing RESEND_API_KEY will throw here — check your .env.
              console.error("[Auth] Failed to send welcome email:", err);
            }

            // Add contact to Resend audience (only when configured)
            const audienceId = process.env.RESEND_AUDIENCE_ID;
            if (audienceId && env.RESEND_API_KEY) {
              try {
                const resend = getResendClient();
                const nameParts = (user.name || "").trim().split(" ");
                await resend.contacts.create({
                  audienceId,
                  email: user.email,
                  firstName: nameParts[0] || "",
                  lastName: nameParts.slice(1).join(" ") || "",
                  unsubscribed: false,
                });
              } catch (err) {
                console.error("[Auth] Failed to add contact to Resend audience:", err);
              }
            }
          })();
        },
      },
    },
  },
  plugins: [
    nextCookies(),
    expo(),
    organization({
      async sendInvitationEmail(data) {
        const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        await sendTeamInvitationEmail(data.email, {
          organizationName: data.organization.name,
          inviterName:
            data.inviter?.user?.name || data.inviter?.user?.email || "A team administrator",
          role: data.role || "member",
          inviteUrl: `${appUrl}/invitations/${data.id}`,
        });
      },
    }),
  ],
});
