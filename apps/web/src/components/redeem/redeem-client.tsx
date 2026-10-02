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
  HelpCircle,
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
      toast.error("Please enter your Lifetime Deal license code");
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
        toast.success(res.message || "Lifetime license activated successfully!");
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
      c.startsWith("STEADY3-") ||
      c.startsWith("STEADY-3-") ||
      c.startsWith("FOUNDER3-") ||
      c.startsWith("FOUNDER-3-") ||
      c.startsWith("LTD-3-") ||
      c.startsWith("SUMO3-") ||
      c.startsWith("APPSUMO-3-")
    ) {
      return 3;
    }
    if (
      c.includes("-T2-") ||
      c.includes("-TIER2-") ||
      c.startsWith("STEADY2-") ||
      c.startsWith("STEADY-2-") ||
      c.startsWith("FOUNDER2-") ||
      c.startsWith("FOUNDER-2-") ||
      c.startsWith("LTD-2-") ||
      c.startsWith("SUMO2-") ||
      c.startsWith("APPSUMO-2-")
    ) {
      return 2;
    }
    return 1;
  })();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fbfbf9] text-[#23211a] font-sans">
      <LandingHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 relative z-20">
        <div className="w-full max-w-[620px]">
          {/* Header Badge */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles className="size-3.5 text-[#ffd439]" />
              <span>Lifetime License Activation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#23211a]">
              Redeem Your License
            </h1>
            <p className="text-[#5c5c5c] mt-3 text-sm sm:text-base max-w-md leading-relaxed">
              Enter your founder lifetime code to unlock edge-native multi-region uptime monitoring
              and white-label status portals.
            </p>
          </div>

          {/* Active License Already Present */}
          {activeLicense?.isAppSumo && !redeemResult && (
            <div className="mb-6 p-5 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex items-start gap-3.5">
              <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-[#23211a]">
                  Active Lifetime Tier {activeLicense.tier} License
                </p>
                <p className="text-[#5c5c5c] text-xs mt-1 leading-relaxed">
                  Your workspace is running on Lifetime Tier {activeLicense.tier} (
                  {activeLicense.limits?.maxMonitors || 150} Monitors,{" "}
                  {activeLicense.limits?.minIntervalSeconds || 60}s check intervals). Stacking
                  additional codes will automatically elevate your limits.
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {redeemResult?.success ? (
            <div className="rounded-3xl border border-[#23211a] bg-white p-8 sm:p-10 shadow-xl text-center">
              <div className="size-16 rounded-2xl bg-[#ffd439]/20 border border-[#ffd439] text-[#23211a] flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 className="size-9 text-emerald-600" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#23211a] mb-2">
                Lifetime Access Activated!
              </h2>
              <p className="text-[#5c5c5c] text-sm mb-8 leading-relaxed max-w-md mx-auto">
                {redeemResult.message}
              </p>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e6df] mb-8 text-left">
                <div className="p-2">
                  <span className="text-[10px] text-[#868279] block uppercase font-mono">Plan</span>
                  <span className="text-sm font-bold text-[#23211a]">
                    Tier {redeemResult.tier} Lifetime
                  </span>
                </div>
                <div className="p-2 border-l border-[#e8e6df]">
                  <span className="text-[10px] text-[#868279] block uppercase font-mono">
                    Check Rate
                  </span>
                  <span className="text-sm font-bold text-[#23211a]">
                    {redeemResult.tier === 3
                      ? "10s Ultra"
                      : redeemResult.tier === 2
                        ? "30s Rapid"
                        : "60s Fast"}
                  </span>
                </div>
                <div className="p-2 border-l border-[#e8e6df]">
                  <span className="text-[10px] text-[#868279] block uppercase font-mono">
                    Consensus
                  </span>
                  <span className="text-sm font-bold text-[#23211a]">
                    {redeemResult.tier === 1 ? "2-of-3 Edge" : "4-of-7 Quorum"}
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-4 px-6 rounded-xl bg-[#23211a] hover:bg-[#373428] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md text-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            /* Redemption Form Card */
            <div className="rounded-3xl border border-[#e8e6df] bg-white p-6 sm:p-10 shadow-md">
              <form onSubmit={handleRedeem} className="space-y-6">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-[#868279] mb-2"
                  >
                    Redemption License Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#868279]">
                      <Key className="size-4" />
                    </div>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. STEADY-T3-XXXX-YYYY"
                      required
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-3.5 bg-[#faf8f5] border border-[#e8e6df] focus:border-[#23211a] focus:bg-white rounded-xl text-[#23211a] font-mono text-sm tracking-wide transition-all outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-[#868279] mt-2">
                    Paste the unique license key provided in your purchase email or confirmation
                    receipt.
                  </p>
                </div>

                {/* Account Status Indicator */}
                <div className="p-4 rounded-xl border border-[#e8e6df] bg-[#faf8f5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`size-2.5 rounded-full ${isLoggedIn ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                    <span className="text-[#5c5c5c]">
                      {isLoggedIn ? (
                        <>
                          Signed in as <strong className="text-[#23211a]">{user?.email}</strong>
                        </>
                      ) : (
                        "Not signed in yet"
                      )}
                    </span>
                  </div>
                  {!isLoggedIn && (
                    <span className="text-amber-700 font-semibold text-[11px]">
                      Will prompt sign-in
                    </span>
                  )}
                </div>

                {/* What's Included Preview Box */}
                <div className="p-5 rounded-2xl border border-[#e8e6df] bg-[#faf8f5] space-y-3">
                  <div className="text-xs font-bold text-[#23211a] flex items-center gap-2 font-mono">
                    <Zap className="size-3.5 text-[#ffd439]" />
                    Estimated Level: Tier {detectedTier} Lifetime
                  </div>
                  <ul className="text-xs text-[#5c5c5c] space-y-2 pt-1 font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>
                        {detectedTier === 3
                          ? "1,500 Active Edge Monitors"
                          : detectedTier === 2
                            ? "250 Active Edge Monitors"
                            : "150 Active Edge Monitors"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>
                        {detectedTier === 3
                          ? "10s Ultra-Fast Check Rate"
                          : detectedTier === 2
                            ? "30s Rapid Check Rate"
                            : "60s Heartbeat Check Rate"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>
                        {detectedTier === 3
                          ? "100 Status Portals + Unlimited Custom Domains (CNAME)"
                          : detectedTier === 2
                            ? "10 Status Portals + Custom Domains"
                            : "3 Status Portals + Custom Domains"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>
                        {detectedTier === 1
                          ? "3-Region 2-of-3 Quorum Consensus"
                          : "7-Region 4-of-7 Quorum Consensus (Far Fewer False Alarms)"}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full py-4 px-6 rounded-xl bg-[#23211a] hover:bg-[#373428] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Validating License Code...</span>
                    </>
                  ) : isLoggedIn ? (
                    <>
                      <span>Activate Lifetime Access</span>
                      <ArrowRight className="size-4" />
                    </>
                  ) : (
                    <>
                      <span>Sign In & Activate</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Assistance Footer */}
              <div className="mt-8 pt-6 border-t border-[#e8e6df] text-center text-xs text-[#868279]">
                Need a new code or want to view tiers?{" "}
                <Link href="/ltd" className="text-[#23211a] font-semibold hover:underline">
                  View Lifetime Deal Tiers →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RedeemClient;
