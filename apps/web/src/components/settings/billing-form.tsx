"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CreditCard,
  ExternalLink,
  Moon,
  Zap,
  ShieldCheck,
  Loader2,
  Tag,
  RefreshCw,
} from "lucide-react";
import { PLANS, type PlanTier, type UsageSummary } from "@/lib/billing";
import { toast } from "@/components/ui/sonner";
import { syncStripeSubscriptionAction } from "@/actions/user";
import { redeemAppSumoCode } from "@/actions/appsumo";
import Link from "next/link";
import { Sparkles, Key } from "lucide-react";

interface BillingFormProps {
  initialUsage?: UsageSummary;
}

export function BillingForm({ initialUsage }: BillingFormProps) {
  const searchParams = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [syncingStripe, setSyncingStripe] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [appsumoCode, setAppsumoCode] = useState("");
  const [redeemingSumo, setRedeemingSumo] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionId = searchParams.get("session_id");

    if (success === "true" || sessionId) {
      toast.success("Payment successful! Your subscription is now active.", {
        description: "Thank you for upgrading with SteadyStack.",
      });
    } else if (canceled === "true") {
      toast.info("Checkout was canceled. No charges were made.");
    }
  }, [searchParams]);

  const usage = initialUsage || {
    monitorsUsed: 3,
    monitorsLimit: 50,
    alertChannelsUsed: 2,
    alertChannelsLimit: 3,
    statusPagesUsed: 1,
    statusPagesLimit: 1,
    monthlyChecksCount: 14280,
    plan: "INITIATE" as PlanTier,
    limits: PLANS.INITIATE.limits,
    isApproachingLimit: false,
    warnings: [],
    isTrialActive: true,
    trialDaysRemaining: 14,
  };

  const currentPlan = PLANS[usage.plan] || PLANS.INITIATE;

  const handleSyncStripe = async () => {
    try {
      setSyncingStripe(true);
      const res = await syncStripeSubscriptionAction();
      if (res?.success && "plan" in res) {
        toast.success(`License synchronized: ${res.plan} tier active!`);
        window.location.reload();
      } else {
        toast.error(res?.error || "Failed to sync license from Stripe");
      }
    } catch (err: any) {
      toast.error(err?.message || "Sync failed");
    } finally {
      setSyncingStripe(false);
    }
  };

  const handleCheckout = async (planTier: PlanTier) => {
    if (planTier === usage.plan && !usage.isTrialActive) {
      toast.info("You are currently subscribed to this plan.");
      return;
    }

    try {
      setLoadingPlan(planTier);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planTier,
          interval: billingCycle,
          promoCode: appliedPromo || promoCode.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Checkout error";
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleRedeemSumo = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = appsumoCode.trim().toUpperCase();
    if (!clean) {
      toast.error("Please enter an AppSumo code");
      return;
    }

    try {
      setRedeemingSumo(true);
      const res = await redeemAppSumoCode(clean);
      if (res.success) {
        toast.success(res.message || "AppSumo lifetime access activated!");
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to redeem AppSumo code");
      }
    } catch (err: any) {
      toast.error(err?.message || "Redemption failed");
    } finally {
      setRedeemingSumo(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoadingPortal(true);
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to open customer portal");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Portal error";
      toast.error(msg);
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 14-Day Pro Trial Active Banner */}
      {usage.isTrialActive && (
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-cyan-200">
                  14-Day Netrunner Pro Trial Active
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {usage.trialDaysRemaining ?? 14} DAYS REMAINING
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Enjoy full Netrunner Pro telemetry checks, quorum-verified alerts, and multi-region
                monitoring.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan Overview Banner */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                Current Subscription
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="size-3" />
                {currentPlan.name}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">{currentPlan.description}</h2>
            <p className="text-xs text-slate-400 font-mono">
              Monthly telemetry checks performed this cycle:{" "}
              <span className="text-slate-200 font-bold">
                {usage.monthlyChecksCount.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleSyncStripe}
              disabled={syncingStripe}
              title="Sync subscription status from Stripe"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              {syncingStripe ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5 text-cyan-400" />
              )}
              Sync License
            </button>

            <button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm font-semibold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {loadingPortal ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="size-4 text-emerald-400" />
                  Manage Invoices & Billing
                  <ExternalLink className="size-3.5 text-slate-400" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Usage Progress Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Monitors Used</span>
              <span className="text-slate-200 font-bold">
                {usage.monitorsUsed} / {usage.monitorsLimit}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (usage.monitorsUsed / usage.monitorsLimit) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Alert Channels</span>
              <span className="text-slate-200 font-bold">
                {usage.alertChannelsUsed} / {usage.alertChannelsLimit}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (usage.alertChannelsUsed / usage.alertChannelsLimit) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Status Pages</span>
              <span className="text-slate-200 font-bold">
                {usage.statusPagesUsed} / {usage.statusPagesLimit}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (usage.statusPagesUsed / usage.statusPagesLimit) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coupon / Promo Code Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            {appliedPromo
              ? `Promo code "${appliedPromo}" applied!`
              : "Have a Coupon or Promo Code?"}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. INDIE50"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 uppercase font-mono w-full sm:w-36"
          />
          <button
            type="button"
            onClick={() => {
              if (!promoCode.trim()) return;
              setAppliedPromo(promoCode.trim());
              toast.success(`Promo code "${promoCode.trim()}" applied for checkout!`);
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-all shrink-0 cursor-pointer"
          >
            Apply Code
          </button>
        </div>
      </div>

      {/* Pricing Header & Cycle Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Zap className="size-5 text-emerald-400" />
            Upgrade Plan & Quotas
          </h3>
          <p className="text-xs text-slate-400">
            Select simple, developer-friendly options designed to scale with your infrastructure.
          </p>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Annual Billing
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-slate-950 text-emerald-400">
              Save 17% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(PLANS) as PlanTier[]).map((tierKey) => {
          const plan = PLANS[tierKey];
          const isCurrent = usage.plan === tierKey;
          const isSleepPlan = plan.id === "NETRUNNER";
          const price = billingCycle === "annual" ? plan.annualPriceMonthly : plan.monthlyPrice;

          return (
            <div
              key={tierKey}
              className={`relative flex flex-col justify-between rounded-xl border p-6 transition-all duration-300 ${
                isSleepPlan
                  ? "border-emerald-500/50 bg-slate-900/80 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                  : isCurrent
                    ? "border-slate-700 bg-slate-900/50"
                    : "border-slate-800 bg-slate-900/30 hover:border-slate-700"
              }`}
            >
              {isSleepPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-md">
                  <Moon className="size-3" />
                  The Sleep Plan
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-100">{plan.name}</h4>
                  <p className="text-xs text-slate-400 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="flex flex-col gap-1 py-2 border-y border-slate-800/60">
                  <div className="flex items-baseline gap-1.5">
                    {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                      <span className="text-sm line-through text-slate-500 font-mono">
                        ${plan.monthlyPrice}
                      </span>
                    )}
                    <span className="text-3xl font-extrabold text-slate-100 font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      / mo {billingCycle === "annual" && price > 0 ? "(billed annually)" : ""}
                    </span>
                  </div>
                  {plan.monthlyPrice === 0 && (
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                      Free Forever
                    </span>
                  )}
                  {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                    <span className="text-[10px] text-emerald-400/90 font-mono font-bold uppercase tracking-wider">
                      {tierKey === "NETRUNNER"
                        ? "Billed $180 annually — Save $48/yr"
                        : "Billed $780 annually — Save $168/yr"}
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleCheckout(tierKey)}
                  disabled={isCurrent || loadingPlan === tierKey}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                      : isSleepPlan
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:shadow-emerald-500/20"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  {loadingPlan === tierKey ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isCurrent ? (
                    "Active Plan"
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AppSumo Lifetime License Redemption Box (Commented out) */}
      {/*
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-[#0E1512]/60 p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="size-3" />
              AppSumo Partner Lifetime Deal
            </div>
            <h4 className="text-sm font-bold text-white">Have an AppSumo License Code?</h4>
            <p className="text-xs text-slate-300">
              Redeem your lifetime license to instantly upgrade your workspace without recurring
              subscription fees.
            </p>
          </div>

          <form onSubmit={handleRedeemSumo} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Key className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={appsumoCode}
                onChange={(e) => setAppsumoCode(e.target.value.toUpperCase())}
                placeholder="SUMO-XXXX-YYYY-ZZZZ"
                className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/15 focus:border-emerald-500 rounded-lg text-xs font-mono text-white outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={redeemingSumo || !appsumoCode.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {redeemingSumo ? <Loader2 className="size-3.5 animate-spin" /> : "Redeem"}
            </button>
            <Link
              href={"/redeem" as any}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all shrink-0"
            >
              Full Portal
            </Link>
          </form>
        </div>
      </div>
      */}

      {/* Stripe Tax & VAT/GST Compliance Footer Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-400 font-mono text-[11px] pt-4 border-t border-slate-800/60">
        <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
        <span>Automated VAT/GST & Stripe Tax compliance enabled for all international regions</span>
      </div>
    </div>
  );
}
