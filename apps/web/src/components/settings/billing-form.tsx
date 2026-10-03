"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/navigation";
import {
  Check,
  CreditCard,
  ExternalLink,
  Zap,
  ShieldCheck,
  Loader2,
  Tag,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Gift,
} from "lucide-react";
import { PLANS, type PlanTier, type UsageSummary } from "@/lib/billing";
import { toast } from "@/components/ui/sonner";
import { syncStripeSubscriptionAction } from "@/actions/user";
import { LTD_CONFIG } from "@/lib/ltd-config";
import { useLtdStats } from "@/lib/use-ltd-stats";

interface BillingFormProps {
  initialUsage?: UsageSummary;
}

const LTD_TIERS = LTD_CONFIG.tiers.map((t) => ({
  id: t.id,
  name: t.name,
  price: t.price,
  popular: t.tier === 2,
  monitors: `${t.monitors} Endpoints`,
  interval: `${t.interval} checks`,
  statusPages: `${t.statusPortals} White-Label Portals`,
  seats: `${t.seats} Team Seat${t.seats > 1 ? "s" : ""}`,
  whiteLabel: t.tier === 1 ? "Custom Domain Included" : "Full White-Label Branding",
  description:
    t.tier === 1
      ? "Ideal for freelancers and solo dev shops monitoring starter client sites."
      : t.tier === 2
        ? "Built for growing agencies requiring multi-region quorum consensus and white-label portals."
        : "The scale fleet tier for established agencies and multi-client retainers.",
}));

export function BillingForm({ initialUsage }: BillingFormProps) {
  const ltdStats = useLtdStats();
  const searchParams = useSearchParams();
  const dealParam = searchParams.get("deal");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [syncingStripe, setSyncingStripe] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [selectedLtdTier, setSelectedLtdTier] = useState<string>(
    dealParam && LTD_TIERS.some((t) => t.id === dealParam) ? dealParam : "ltd-tier-3",
  );

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

  useEffect(() => {
    if (dealParam && LTD_TIERS.some((t) => t.id === dealParam)) {
      setSelectedLtdTier(dealParam);
    }
  }, [dealParam]);

  const usage = initialUsage || {
    clientsUsed: 1,
    clientsLimit: 2,
    monitorsUsed: 3,
    monitorsLimit: 50,
    alertChannelsUsed: 2,
    alertChannelsLimit: 3,
    statusPagesUsed: 1,
    statusPagesLimit: 2,
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

  const handleLifetimeCheckout = async (tierId: string) => {
    try {
      setLoadingPlan(tierId);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal: tierId,
          promoCode: appliedPromo || promoCode.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to start lifetime checkout");

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

  const selectedTierData = LTD_TIERS.find((t) => t.id === selectedLtdTier) || LTD_TIERS[2];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 14-Day Pro Trial Active Banner */}
      {usage.isTrialActive && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffd439]/20 text-[#23211a] dark:text-[#ffd439] border border-[#ffd439]/40">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  14-Day Agency Trial Active
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#ffd439] text-[#23211a]">
                  {usage.trialDaysRemaining ?? 14} DAYS REMAINING
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enjoy full Agency white-label portals, custom domain status pages, automated monthly
                PDF reports, and multi-region monitoring.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FOUNDER LIFETIME DEAL SPOTLIGHT BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="size-3.5 text-[#ffd439]" />
              <span>
                Founder Lifetime Deal •{" "}
                {ltdStats.isSoldOut
                  ? "Sold Out"
                  : `${ltdStats.claimedCount}/${ltdStats.totalCap} Claimed`}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              Lock in Lifetime Multi-Region Monitoring
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Pay once and never pay monthly recurring fees. Capped client workspaces, automated SLA
              sign-off reports, and Cloudflare edge quorum consensus.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <a
              href="/redeem"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-xs cursor-pointer"
            >
              <Gift className="size-3.5 text-foreground" />
              <span>Redeem Code</span>
            </a>
            <button
              type="button"
              onClick={() => handleLifetimeCheckout(selectedLtdTier)}
              disabled={loadingPlan === selectedLtdTier || ltdStats.isSoldOut}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                ltdStats.isSoldOut
                  ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                  : "bg-foreground hover:bg-foreground/90 text-background hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loadingPlan === selectedLtdTier ? (
                <Loader2 className="size-4 animate-spin" />
              ) : ltdStats.isSoldOut ? (
                <span>Batch Sold Out</span>
              ) : (
                <>
                  <span>
                    Buy {selectedTierData.name} (${selectedTierData.price})
                  </span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 LTD Tiers Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          {LTD_TIERS.map((tier) => {
            const isSelected = selectedLtdTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedLtdTier(tier.id)}
                className={`relative p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-5 cursor-pointer ${
                  isSelected
                    ? "border-2 border-foreground bg-muted/30 shadow-md ring-1 ring-foreground/10"
                    : "border-border bg-card/60 hover:border-foreground/30 hover:bg-muted/20"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-foreground">{tier.name}</span>
                    {tier.popular ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#ffd439] text-[#23211a] shadow-2xs">
                        Most Popular
                      </span>
                    ) : isSelected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-foreground text-background">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-serif font-bold text-foreground">
                        ${tier.price}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">/ lifetime</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono font-medium block mt-0.5">
                      One-time payment • No monthly fees
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/80 text-xs">
                  <div className="flex items-center gap-2 text-foreground/90 font-medium">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{tier.monitors}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90 font-medium">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{tier.interval}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90 font-medium">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{tier.statusPages}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90 font-medium">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{tier.whiteLabel}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!ltdStats.isSoldOut) {
                      setSelectedLtdTier(tier.id);
                      handleLifetimeCheckout(tier.id);
                    }
                  }}
                  disabled={loadingPlan === tier.id || ltdStats.isSoldOut}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    ltdStats.isSoldOut
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : isSelected
                        ? "bg-foreground text-background hover:bg-foreground/90 shadow-xs"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                  }`}
                >
                  {loadingPlan === tier.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : ltdStats.isSoldOut ? (
                    "Sold Out"
                  ) : isSelected ? (
                    "Proceed with this tier"
                  ) : (
                    `Select Tier ${tier.name.slice(-1)}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Plan Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Current Subscription
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                {currentPlan.name}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {currentPlan.description}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Monthly telemetry checks performed this cycle:{" "}
              <span className="text-foreground font-bold">
                {usage.monthlyChecksCount.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleSyncStripe}
              disabled={syncingStripe}
              title="Sync subscription status from Stripe"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-medium transition-all shadow-sm cursor-pointer"
            >
              {syncingStripe ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5 text-muted-foreground" />
              )}
              Sync License
            </button>

            <button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-foreground hover:bg-foreground/90 text-background text-xs font-medium transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {loadingPortal ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="size-4 text-[#ffd439]" />
                  Manage Invoices & Billing
                  <ExternalLink className="size-3 text-background/70" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Usage Progress Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-6 border-t border-border">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-muted-foreground">Clients Managed</span>
              <span className="text-foreground font-bold">
                {usage.clientsUsed} /{" "}
                {usage.clientsLimit >= 999999 ? "Unlimited" : usage.clientsLimit}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-foreground h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    usage.clientsLimit >= 999999
                      ? 100
                      : Math.min(100, (usage.clientsUsed / Math.max(1, usage.clientsLimit)) * 100)
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-muted-foreground">Monitors Used</span>
              <span className="text-foreground font-bold">
                {usage.monitorsUsed} / {usage.monitorsLimit}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (usage.monitorsUsed / usage.monitorsLimit) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-muted-foreground">Status Pages</span>
              <span className="text-foreground font-bold">
                {usage.statusPagesUsed} / {usage.statusPagesLimit}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
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
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Tag className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">
            {appliedPromo
              ? `Promo code "${appliedPromo}" applied!`
              : "Have a Coupon or Promo Code?"}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. AGENCY20"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 uppercase font-mono w-full sm:w-36"
          />
          <button
            type="button"
            onClick={() => {
              if (!promoCode.trim()) return;
              setAppliedPromo(promoCode.trim());
              toast.success(`Promo code "${promoCode.trim()}" applied for checkout!`);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-foreground hover:bg-foreground/90 text-background text-xs font-medium transition-all shadow-sm shrink-0 cursor-pointer"
          >
            Apply Code
          </button>
        </div>
      </div>

      {/* Pricing Header & Cycle Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Monthly & Annual Agency Plans
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select recurring subscription plans designed for scaling agencies and consultancies.
          </p>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center bg-muted/60 p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === "annual"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annual Billing
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ffd439] text-[#23211a]">
              Save 25%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(PLANS) as PlanTier[]).map((tierKey) => {
          const plan = PLANS[tierKey];
          const isCurrent = usage.plan === tierKey;
          const isProPlan = plan.id === "NETRUNNER";
          const price = billingCycle === "annual" ? plan.annualPriceMonthly : plan.monthlyPrice;

          return (
            <div
              key={tierKey}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                isProPlan
                  ? "border-2 border-foreground bg-card shadow-lg ring-1 ring-foreground/10"
                  : isCurrent
                    ? "border-border bg-card/70 shadow-sm"
                    : "border-border bg-card shadow-sm hover:border-foreground/30 hover:shadow-md"
              }`}
            >
              {isProPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#ffd439] text-[#23211a] flex items-center gap-1.5 shadow-sm whitespace-nowrap z-10">
                  Most Popular for Agencies
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground">{plan.name}</h4>
                  <p className="text-xs text-muted-foreground min-h-[32px]">{plan.description}</p>
                </div>

                <div className="flex flex-col gap-1 py-3 border-y border-border">
                  <div className="flex items-baseline gap-1.5">
                    {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                      <span className="text-sm line-through text-muted-foreground font-mono">
                        ${plan.monthlyPrice}
                      </span>
                    )}
                    <span className="text-3xl font-extrabold text-foreground">${price}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      / mo {billingCycle === "annual" && price > 0 ? "(billed annually)" : ""}
                    </span>
                  </div>
                  {plan.monthlyPrice === 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono font-semibold uppercase tracking-wider">
                      Free Forever
                    </span>
                  )}
                  {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold uppercase tracking-wider">
                      {tierKey === "NETRUNNER"
                        ? "Billed $348 annually — Save $120/yr"
                        : "Billed $948 annually — Save $240/yr"}
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs text-foreground/90">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleCheckout(tierKey)}
                  disabled={isCurrent || loadingPlan === tierKey}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrent
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : isProPlan
                        ? "bg-foreground hover:bg-foreground/90 text-background shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-foreground border border-border"
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

      {/* Stripe Tax & VAT/GST Compliance Footer Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground font-mono text-[11px] pt-4 border-t border-border">
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Automated VAT/GST & Stripe Tax compliance enabled for all international regions</span>
      </div>
    </div>
  );
}
