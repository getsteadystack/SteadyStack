"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth-layout";
import SignUpForm from "@/components/sign-up-form";
import { Sparkles, Zap } from "lucide-react";

interface SignupClientProps {
  deal?: string;
  plan?: string;
}

export default function SignupClient({ deal: propDeal, plan: propPlan }: SignupClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deal = propDeal || searchParams?.get("deal");
  const plan = propPlan || searchParams?.get("plan");

  const getDealTitle = () => {
    if (deal === "ltd-tier-3") return "Founder Lifetime Deal Tier 3 ($199)";
    if (deal === "ltd-tier-2") return "Founder Lifetime Deal Tier 2 ($99)";
    if (deal === "ltd-tier-1") return "Founder Lifetime Deal Tier 1 ($49)";
    if (deal) return "Founder Lifetime Deal";
    if (plan === "pro" || plan === "netrunner") return "Agency Pro Plan";
    if (plan === "enterprise" || plan === "construct") return "Enterprise Tier";
    return null;
  };

  const dealTitle = getDealTitle();

  return (
    <AuthLayout title="New User Registration">
      {dealTitle && (
        <div className="mb-6 p-4 rounded-2xl bg-[#ffd439]/10 border border-[#ffd439]/30 text-[#23211a] dark:text-[#ffd439] flex items-center gap-3 animate-in fade-in-50 duration-300">
          <div className="size-8 rounded-xl bg-[#ffd439] text-[#23211a] flex items-center justify-center shrink-0 shadow-xs">
            {deal ? <Sparkles className="size-4" /> : <Zap className="size-4" />}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold block opacity-80">
              Selected Package
            </span>
            <span className="text-xs font-bold font-sans block">{dealTitle}</span>
          </div>
        </div>
      )}
      <SignUpForm
        onSwitchToSignIn={() => router.push("/login")}
        deal={deal || undefined}
        plan={plan || undefined}
      />
    </AuthLayout>
  );
}
