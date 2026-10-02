import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { ProfileForm } from "@/components/settings/profile-form";
import { RegionalForm } from "@/components/settings/regional-form";
import { TeamForm } from "@/components/settings/team-form";
import { AuditLogForm } from "@/components/settings/audit-log-form";
import { DangerZone } from "@/components/settings/danger-zone";
import { SecurityForm } from "@/components/settings/security-form";
import { ApiKeysForm } from "@/components/settings/api-keys-form";
import { MigrationForm } from "@/components/settings/migration-form";
import { PrivacyForm } from "@/components/settings/privacy-form";
import { BillingForm } from "@/components/settings/billing-form";
import { HolidayModeForm } from "@/components/settings/holiday-mode-form";
import { ReferralForm } from "@/components/settings/referral-form";
import { getUserUsageSummary } from "@/lib/billing-server";
import { verifyAndApplyCheckoutSession, syncUserSubscriptionFromStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Renders the settings page based on the user's session and selected tab.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    session_id?: string;
    mock_checkout?: string;
    plan?: string;
    sync?: string;
  }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const rawTab = resolvedParams.tab || "general";
  const sessionId = resolvedParams.session_id;
  const isMockCheckout = resolvedParams.mock_checkout === "true";
  const mockPlan = resolvedParams.plan?.toUpperCase();
  const shouldSync = resolvedParams.sync === "true";

  // If returning from Stripe checkout with a session_id, verify and apply plan immediately!
  if (sessionId && sessionId.startsWith("cs_")) {
    await verifyAndApplyCheckoutSession({
      userId: session.user.id,
      sessionId,
    });
  } else if (
    isMockCheckout &&
    mockPlan &&
    (mockPlan === "CONSTRUCT" || mockPlan === "NETRUNNER" || mockPlan === "INITIATE")
  ) {
    const prisma = (await import("@steadystack/db")).default;
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: mockPlan,
        status: "ACTIVE",
        trialEndsAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: oneYearFromNow,
        tierVersion: "mock_test",
      },
      update: {
        plan: mockPlan,
        status: "ACTIVE",
        trialEndsAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: oneYearFromNow,
        tierVersion: "mock_test",
      },
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { tier: mockPlan },
    });
  } else if (rawTab.includes("billing") || shouldSync) {
    // Proactively synchronize with Stripe to ensure customer tier matches active subscription
    await syncUserSubscriptionFromStripe(session.user.id).catch(() => {});
  }

  // Clean tab parameter in case query parameters were concatenated (e.g. "billing?session_id=...")
  const cleanTab = rawTab.split("?")[0].split("&")[0];
  const validTabs = [
    "general",
    "team",
    "billing",
    "referrals",
    "security",
    "api-keys",
    "audit-log",
    "migration",
    "privacy",
  ];
  const tab = validTabs.includes(cleanTab) ? cleanTab : "general";
  const usageSummary = tab === "billing" ? await getUserUsageSummary(session.user.id) : undefined;
  const dbUser = await (await import("@steadystack/db")).default.user.findUnique({
    where: { id: session.user.id },
    select: { holidayModeUntil: true },
  });
  const holidayModeUntil = dbUser?.holidayModeUntil
    ? dbUser.holidayModeUntil.toISOString()
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl">
      <SettingsSidebar />
      <div className="flex-1 flex flex-col gap-6">
        {tab === "general" && (
          <>
            <ProfileForm />
            <RegionalForm />
            <HolidayModeForm initialUntil={holidayModeUntil} />
            <DangerZone />
          </>
        )}
        {tab === "team" && <TeamForm />}
        {tab === "billing" && <BillingForm initialUsage={usageSummary} />}
        {tab === "referrals" && <ReferralForm />}
        {tab === "security" && <SecurityForm />}
        {tab === "api-keys" && <ApiKeysForm />}
        {tab === "audit-log" && <AuditLogForm />}
        {tab === "migration" && <MigrationForm />}
        {tab === "privacy" && <PrivacyForm />}
      </div>
    </div>
  );
}
