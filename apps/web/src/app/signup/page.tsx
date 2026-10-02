import type { Metadata } from "next";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SignupClient from "./signup-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get Started Free | SteadyStack",
  description:
    "Create your SteadyStack account. Start monitoring up to 50 endpoints with multi-region edge quorum consensus and commercial use permitted in writing.",
  alternates: {
    canonical: "https://steadystack.dev/signup",
  },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    deal?: string;
    plan?: string;
    ref?: string;
    returnUrl?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    if (resolvedParams?.deal) {
      redirect(`/dashboard/settings?tab=billing&deal=${encodeURIComponent(resolvedParams.deal)}`);
    }
    if (resolvedParams?.plan) {
      redirect(`/dashboard/settings?tab=billing&plan=${encodeURIComponent(resolvedParams.plan)}`);
    }
    redirect("/dashboard");
  }

  return <SignupClient deal={resolvedParams?.deal} plan={resolvedParams?.plan} />;
}
