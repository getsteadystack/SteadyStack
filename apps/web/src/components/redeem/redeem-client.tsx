"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Server,
  ArrowRight,
  Loader2,
  Sparkles,
  Key,
  AlertCircle,
} from "lucide-react";
import LandingHeader from "@/components/landing/header";
import { redeemAppSumoCode, type RedeemResult } from "@/actions/appsumo";
import { toast } from "@/components/ui/sonner";

export interface RedeemClientProps {
  initialCode?: string;
  initialTier?: string;
  isLoggedIn: boolean;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  activeLicense: {
    isAppSumo: boolean;
    tier?: number;
    code?: string;
    redeemedAt?: any;
    plan?: string;
    limits?: any;
  } | null;
}

export function RedeemClient({
  initialCode = "",
  isLoggedIn,
  user,
  activeLicense,
}: RedeemClientProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      toast.error("Please enter your AppSumo code");
      return;
    }

    if (!isLoggedIn) {
      // Redirect to login with callback URL
      const callbackUrl = encodeURIComponent(`/redeem?code=${encodeURIComponent(cleanCode)}`);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    setLoading(true);
    try {
      const res = await redeemAppSumoCode(cleanCode);
      if (res.success) {
        setRedeemResult(res);
        toast.success(res.message || "AppSumo license redeemed successfully!");
      } else {
        toast.error(res.error || "Failed to redeem code");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const detectedTier = (() => {
    const c = code.trim().toUpperCase();
    if (
      c.includes("-T3-") ||
      c.includes("-TIER3-") ||
      c.startsWith("SUMO3-") ||
      c.startsWith("APPSUMO-3-")
    ) {
      return 3;
    }
    if (
      c.includes("-T2-") ||
      c.includes("-TIER2-") ||
      c.startsWith("SUMO2-") ||
      c.startsWith("APPSUMO-2-")
    ) {
      return 2;
    }
    return 1;
  })();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] text-foreground font-sans selection:bg-emerald-500/20">
      <LandingHeader />

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-20">
        <div className="w-full max-w-[560px]">
          {/* Header Badge */}
          <div className="mb-6 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="size-3.5" />
              AppSumo Lifetime Deal Activation
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Redeem Your License
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-md">
              Activate your lifetime access to SteadyStack&apos;s edge-native synthetic monitoring
              and status pages.
            </p>
          </div>

          {/* Active License Already Present */}
          {activeLicense?.isAppSumo && !redeemResult && (
            <div className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md flex items-start gap-3">
              <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-300">
                  Active AppSumo Tier {activeLicense.tier} License
                </p>
                <p className="text-emerald-400/80 text-xs mt-0.5">
                  Your workspace is currently running on Lifetime Tier {activeLicense.tier} (
                  {activeLicense.limits?.maxMonitors || 50} Monitors,{" "}
                  {activeLicense.limits?.minIntervalSeconds || 60}s checks).
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {redeemResult?.success ? (
            <div className="relative rounded-3xl border border-emerald-500/40 bg-[#0E1512]/90 p-8 shadow-2xl backdrop-blur-xl text-center overflow-hidden">
              <div className="size-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <CheckCircle2 className="size-9" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Lifetime Access Activated!</h2>
              <p className="text-emerald-300 text-sm mb-6 font-medium">{redeemResult.message}</p>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10 mb-6 text-left">
                <div className="p-2">
                  <span className="text-[11px] text-muted-foreground block uppercase font-mono">
                    Plan
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Tier {redeemResult.tier} Lifetime
                  </span>
                </div>
                <div className="p-2 border-l border-white/10">
                  <span className="text-[11px] text-muted-foreground block uppercase font-mono">
                    Check Rate
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {redeemResult.tier === 3
                      ? "10s Ultra"
                      : redeemResult.tier === 2
                        ? "30s Rapid"
                        : "60s Fast"}
                  </span>
                </div>
                <div className="p-2 border-l border-white/10">
                  <span className="text-[11px] text-muted-foreground block uppercase font-mono">
                    Consensus
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {redeemResult.tier === 1 ? "2-of-3 Edge" : "4-of-7 Quorum"}
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                Go to Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            /* Redemption Form Card */
            <div className="relative rounded-3xl border border-white/10 bg-[#0E0E0E]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
              {/* Card Top Highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />

              <form onSubmit={handleRedeem} className="space-y-5">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
                  >
                    AppSumo Redemption Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Key className="size-4" />
                    </div>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SUMO-XXXX-YYYY-ZZZZ"
                      required
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/15 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white font-mono text-sm tracking-wide transition-all outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Paste the unique license key provided in your AppSumo purchase email or account.
                  </p>
                </div>

                {/* Account Status Indicator */}
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full ${isLoggedIn ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                    />
                    <span className="text-muted-foreground">
                      {isLoggedIn ? (
                        <>
                          Signed in as <strong className="text-white">{user?.email}</strong>
                        </>
                      ) : (
                        "Not signed in yet"
                      )}
                    </span>
                  </div>
                  {!isLoggedIn && (
                    <span className="text-amber-400 font-medium">Will prompt sign-in</span>
                  )}
                </div>

                {/* What's Included Preview */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <Zap className="size-3.5 text-emerald-400" />
                    Estimated Plan: Tier {detectedTier} Lifetime
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {detectedTier === 3
                          ? "500 Active Monitors"
                          : detectedTier === 2
                            ? "150 Active Monitors"
                            : "50 Active Monitors"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {detectedTier === 3
                          ? "10s Ultra-Fast Checks"
                          : detectedTier === 2
                            ? "30s Rapid Checks"
                            : "60s Heartbeat Checks"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {detectedTier === 3
                          ? "Unlimited Status Pages & Custom Domains"
                          : detectedTier === 2
                            ? "10 Status Pages + Custom Domains"
                            : "3 Status Pages + Custom Domains"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {detectedTier === 1
                          ? "3-Region 2-of-3 Quorum Consensus"
                          : "7-Region 4-of-7 Quorum Consensus (Zero False Alarms)"}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Validating Code...
                    </>
                  ) : isLoggedIn ? (
                    <>
                      Redeem Lifetime Access
                      <ArrowRight className="size-4" />
                    </>
                  ) : (
                    <>
                      Sign In & Redeem
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Assistance Footer */}
              <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-muted-foreground">
                Need help with your redemption? Contact{" "}
                <a
                  href="mailto:support@steadystack.dev"
                  className="text-emerald-400 hover:underline"
                >
                  support@steadystack.dev
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RedeemClient;
