import type { Metadata } from "next";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log In | SteadyStack",
  description: "Sign in to your SteadyStack edge monitoring dashboard.",
  alternates: {
    canonical: "https://steadystack.dev/login",
  },
};

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If the user has a valid active session, redirect them to the dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}
