"use client";

import dynamic from "next/dynamic";
import DashboardLoading from "./loading";
import type { DashboardStatsData } from "@/components/dashboard/stats";
import type { MonitorInsight } from "@/components/dashboard/ai-insights";
import type { OnboardingStatus } from "@/actions/onboarding";
import type { UsageSummary } from "@/lib/billing";

const Dashboard = dynamic(() => import("./dashboard"), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

export default function DashboardClient({
  monitors,
  stats,
  insights,
  onboardingStatus,
  usageSummary,
  userEmail,
  holidayModeUntil,
  isDemo = false,
}: {
  monitors: any[];
  stats: DashboardStatsData;
  insights: MonitorInsight[];
  onboardingStatus: OnboardingStatus;
  usageSummary?: UsageSummary;
  userEmail?: string;
  holidayModeUntil?: string | null;
  isDemo?: boolean;
}) {
  return (
    <Dashboard
      monitors={monitors}
      stats={stats}
      insights={insights}
      onboardingStatus={onboardingStatus}
      usageSummary={usageSummary}
      userEmail={userEmail}
      holidayModeUntil={holidayModeUntil}
      isDemo={isDemo}
    />
  );
}
