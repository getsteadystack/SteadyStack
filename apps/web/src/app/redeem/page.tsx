import type { Metadata } from "next";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { getAppSumoLicenseDetails } from "@/actions/appsumo";
import { RedeemClient } from "@/components/redeem/redeem-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Redeem AppSumo Code | SteadyStack",
  description:
    "Redeem your AppSumo Lifetime Deal code for SteadyStack edge-native synthetic monitoring.",
  alternates: {
    canonical: "https://steadystack.dev/redeem",
  },
};

interface PageProps {
  searchParams: Promise<{ code?: string; tier?: string; plan?: string }>;
}

export default async function RedeemPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const licenseDetails = session?.user?.id ? await getAppSumoLicenseDetails() : null;

  return (
    <RedeemClient
      initialCode={resolvedSearchParams?.code || ""}
      initialTier={resolvedSearchParams?.tier || ""}
      isLoggedIn={Boolean(session?.user)}
      user={
        session?.user
          ? {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
            }
          : null
      }
      activeLicense={licenseDetails}
    />
  );
}
