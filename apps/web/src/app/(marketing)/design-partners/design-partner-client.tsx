"use client";

import { useState, useEffect, useId } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Zap,
  Sparkles,
  ArrowRight,
  Loader2,
  Award,
  Users,
  Copy,
  Check,
  Clock,
  ExternalLink,
  Activity,
  Globe2,
  Server,
  DollarSign,
  Search,
  KeyRound,
  HelpCircle,
  ChevronDown,
  Terminal,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCheck,
  AlertTriangle,
  Layers,
  Flame,
  Radio,
  FileCode2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import {
  submitDesignPartnerApplication,
  getDesignPartnerSpots,
  checkDesignPartnerStatus,
  redeemDesignPartnerCode,
} from "@/actions/design-partners";
import type { DesignPartnerSpotsInfo } from "@/actions/design-partners";

interface DesignPartnerClientProps {
  initialSpotsInfo?: DesignPartnerSpotsInfo;
  initialSpots?: number;
}

export default function DesignPartnerClient({
  initialSpotsInfo,
  initialSpots = 15,
}: DesignPartnerClientProps) {
  const [spotsInfo, setSpotsInfo] = useState<DesignPartnerSpotsInfo>(
    initialSpotsInfo || {
      totalSpots: 15,
      claimedSpots: 0,
      approvedSpots: 0,
      pendingSpots: 0,
      redeemedSpots: 0,
      remainingSpots: initialSpots,
    },
  );

  // Form state
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    monitorsCount: "10-50",
    currentTool: "UptimeRobot",
    techStack: "Next.js / Cloudflare / Node",
    socialHandle: "",
    painPoint: "",
    feedbackCommitment: true,
  });

  // Interactive ROI Calculator state
  const [calcMonitors, setCalcMonitors] = useState(50);
  const [calcInterval, setCalcInterval] = useState(30);

  // Status lookup & VIP key redemption state
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    record?: {
      id: string;
      name: string;
      company: string;
      website: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      vipCode?: string;
      redeemedAt?: string | null;
      createdAt: string;
    };
    error?: string;
  } | null>(null);

  const [redeemingKey, setRedeemingKey] = useState(false);
  const [copiedVip, setCopiedVip] = useState(false);
  const [activeTab, setActiveTab] = useState<"apply" | "calculator" | "perks" | "status">("apply");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const endpointsInputId = useId();
  const currentToolInputId = useId();
  const techStackInputId = useId();

  // Periodically refresh spots info
  useEffect(() => {
    getDesignPartnerSpots()
      .then((info) => {
        if (info && typeof info.remainingSpots === "number") {
          setSpotsInfo(info);
        }
      })
      .catch((err) => console.warn("Failed to fetch spots info:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.website) {
      toast.error("Please fill in your Name, Work Email, and Project URL");
      return;
    }

    if (!formData.website.startsWith("http://") && !formData.website.startsWith("https://")) {
      toast.error("Please enter a valid website URL starting with https://");
      return;
    }

    setLoading(true);
    const res = await submitDesignPartnerApplication(formData);
    setLoading(false);

    if (res.success) {
      setSubmittedId(res.vipCode || `dp_${Date.now()}`);
      if (typeof res.remainingSpots === "number") {
        setSpotsInfo((prev) => ({
          ...prev,
          remainingSpots: res.remainingSpots!,
        }));
      }
      setSubmitted(true);
      toast.success(res.message || "Application submitted successfully!");
    } else {
      toast.error(res.error || "Failed to submit application. Please check your inputs.");
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) {
      toast.error("Please enter your email or Application Reference ID");
      return;
    }

    setLookupLoading(true);
    const res = await checkDesignPartnerStatus(lookupQuery);
    setLookupLoading(false);
    setLookupResult(res);

    if (res.found) {
      toast.success("Application record retrieved!");
    } else {
      toast.error(res.error || "No application found for this query");
    }
  };

  const handleRedeemVipKey = async (code: string) => {
    if (!code) return;
    setRedeemingKey(true);
    const res = await redeemDesignPartnerCode(code);
    setRedeemingKey(false);

    if (res.success) {
      toast.success(res.message || "1-Year Agency Plan activated successfully!");
      if (lookupResult?.record) {
        setLookupResult({
          ...lookupResult,
          record: {
            ...lookupResult.record,
            redeemedAt: new Date().toISOString(),
          },
        });
      }
    } else {
      toast.error(res.error || "Failed to activate VIP code");
    }
  };

  const handleCopy = (text: string, type: "id" | "vip") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      toast.success("Application Reference ID copied to clipboard!");
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedVip(true);
      toast.success("VIP License Key copied to clipboard!");
      setTimeout(() => setCopiedVip(false), 2000);
    }
  };

  // ROI Calculator Calculations
  const betterStackEstimatedCost = Math.round(
    calcMonitors > 50 ? 29 * 12 + (calcMonitors - 50) * 1.2 * 12 : 29 * 12,
  );
  const netrunnerProRetailValue = 348;
  const annualSavings = Math.max(netrunnerProRetailValue, betterStackEstimatedCost);

  const faqs = [
    {
      q: "Who is eligible for the Design Partner Program?",
      a: "Any web development agency, dev shop, consultancy, or engineering team managing production client services, APIs, or infrastructure. We evaluate applications based on active client workloads and commitment to provide launch-day feedback.",
    },
    {
      q: "Is a credit card required during application?",
      a: "No. Absolutely zero credit card, payment details, or pre-authorizations are ever required. Approved design partners receive a 100% complimentary VIP license key for 365 days of full Agency Plan access.",
    },
    {
      q: "What is expected in exchange for the 1-Year Agency license ($348 Value)?",
      a: "Only two things: (1) Set up and use SteadyStack to monitor real client projects, and (2) Provide a brief 15-minute feedback session or an honest 2-sentence testimonial on launch day for our agency directory.",
    },
    {
      q: "What happens after the 1-year complimentary period ends?",
      a: "You will NEVER be automatically billed or trapped. At the end of the year, you can choose to continue on a grandfathered founding-partner discount or downgrade to our generous free tier with zero disruption to your client monitors.",
    },
    {
      q: "How fast are applications reviewed?",
      a: "Our founding engineering team reviews applications every 12 to 24 hours. Once approved, your VIP code is issued automatically, and you can look up or redeem it directly on this page.",
    },
    {
      q: "How does SteadyStack's multi-region edge verification work?",
      a: "When an endpoint times out or returns an error, our Cloudflare edge quorum immediately triggers secondary and tertiary validation checks across North America, Europe, and Asia-Pacific before paging on-call. This eliminates 99.4% of false alarms caused by localized transit blips.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#fbfbf9] text-[#23211a] font-sans overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col gap-14 sm:gap-20">
        {/* ================= TELEMETRY TOP BAR & SPOTS BADGE ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e8e6df] shadow-xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-[#5c5c5c]">
              <span className="text-[#23211a] font-semibold">SteadyStack Edge Mesh:</span>
              <span className="hidden sm:inline">7 Sovereign Regions Operational</span>
              <span className="sm:hidden">7 Regions</span>
              <span className="text-[#e8e6df]">|</span>
              <span className="text-[#23211a] font-bold">4-of-7 Quorum Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ffd439]/20 border border-[#ffd439]/50 text-xs font-mono">
              <Flame className="size-3.5 text-[#23211a] fill-[#ffd439]" />
              <span className="font-bold text-[#23211a]">
                {spotsInfo.remainingSpots} of {spotsInfo.totalSpots}
              </span>
              <span className="text-[#5c5c5c] text-[11px]">Spots Remaining</span>
            </div>

            <button
              onClick={() => {
                setActiveTab("status");
                const el = document.getElementById("status-tab");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5c5c5c] hover:text-[#23211a] px-3 py-1.5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] hover:bg-[#f0ede6] transition-colors cursor-pointer"
            >
              <Search className="size-3.5" />
              <span>Lookup Status</span>
            </button>
          </div>
        </div>

        {/* ================= HERO SECTION ================= */}
        <section className="text-center flex flex-col items-center gap-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
            <Award className="size-3.5 text-[#ffd439]" />
            <span>Exclusive Agency Founding Partner Program</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
            Deploy 1 Year of Enterprise Agency Monitoring — On Us.
          </h1>

          <p className="text-base sm:text-lg text-[#5c5c5c] leading-relaxed max-w-2xl font-sans text-balance">
            We are selecting{" "}
            <strong className="text-[#23211a] font-semibold">
              15 web development agencies and dev shops
            </strong>{" "}
            to receive{" "}
            <strong className="text-[#23211a] font-semibold">
              1 full year of Agency Plan ($348 value)
            </strong>{" "}
            at zero cost. Monitor your client fleet, test white-label status pages, and help us
            shape v2.0.
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full pt-4">
            <div className="p-4 rounded-2xl bg-white border border-[#e8e6df] flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a]">
                250
              </span>
              <span className="text-[11px] font-mono text-[#868279] uppercase tracking-wider mt-0.5">
                Active Monitors
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e8e6df] flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a]">
                30s
              </span>
              <span className="text-[11px] font-mono text-[#868279] uppercase tracking-wider mt-0.5">
                Global Edge Checks
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e8e6df] flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a]">$0</span>
              <span className="text-[11px] font-mono text-[#868279] uppercase tracking-wider mt-0.5">
                Full 365-Day License
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#ffd439] bg-[#ffd439]/10 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a]">
                {spotsInfo.remainingSpots}
              </span>
              <span className="text-[11px] font-mono text-[#23211a] uppercase font-bold tracking-wider mt-0.5">
                Slots Remaining
              </span>
            </div>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
            <a
              href="#application-cockpit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <span>Apply for Partner License (60s)</span>
              <ArrowRight className="size-4" />
            </a>

            <button
              onClick={() => {
                setActiveTab("calculator");
                const el = document.getElementById("calculator-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 bg-white hover:bg-[#f0ede6] border border-[#e8e6df] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <DollarSign className="size-4 text-emerald-600" />
              <span>Calculate Margin ROI</span>
            </button>
          </div>
        </section>

        {/* ================= INTERACTIVE NAVIGATION TABS ================= */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap p-1.5 bg-white border border-[#e8e6df] rounded-2xl shadow-xs max-w-fit mx-auto">
          <button
            onClick={() => setActiveTab("apply")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "apply"
                ? "bg-[#23211a] text-white font-semibold shadow-xs"
                : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
            }`}
          >
            <FileCode2 className="size-3.5" />
            <span>Application Cockpit</span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "calculator"
                ? "bg-[#23211a] text-white font-semibold shadow-xs"
                : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
            }`}
          >
            <Sliders className="size-3.5" />
            <span>Savings Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab("perks")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "perks"
                ? "bg-[#23211a] text-white font-semibold shadow-xs"
                : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
            }`}
          >
            <Zap className="size-3.5" />
            <span>Agency Perks Matrix</span>
          </button>

          <button
            id="status-tab"
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "status"
                ? "bg-[#23211a] text-white font-semibold shadow-xs"
                : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
            }`}
          >
            <KeyRound className="size-3.5" />
            <span>Lookup / Redeem Key</span>
          </button>
        </div>

        {/* ================= CONDITIONAL TAB: STATUS LOOKUP & REDEEM ================= */}
        {activeTab === "status" && (
          <section className="bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e6df]">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#f0ede6] text-[#23211a] text-[11px] font-mono font-semibold uppercase mb-1.5">
                  <KeyRound className="size-3" />
                  <span>Applicant Self-Service</span>
                </div>
                <h2 className="text-2xl font-serif font-medium text-[#23211a]">
                  Check Status & Redeem VIP Partner License
                </h2>
                <p className="text-xs text-[#5c5c5c] mt-0.5">
                  Enter your work email or Application Reference ID to check review status or
                  activate your 1-Year Agency license.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("apply")}
                className="text-xs font-mono text-[#5c5c5c] hover:text-[#23211a] underline cursor-pointer self-start sm:self-auto"
              >
                Back to Application
              </button>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#868279]" />
                <input
                  type="text"
                  placeholder="Enter email (e.g. founder@agency.com) or Reference ID..."
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] placeholder:text-[#868279] focus:outline-none focus:border-[#23211a]"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
              >
                {lookupLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Search className="size-3.5" />
                )}
                <span>Check Status</span>
              </button>
            </form>

            {lookupResult && (
              <div className="p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] flex flex-col gap-4">
                {lookupResult.found && lookupResult.record ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-serif font-medium text-[#23211a]">
                        {lookupResult.record.company} ({lookupResult.record.name})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          lookupResult.record.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : lookupResult.record.status === "PENDING"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {lookupResult.record.status}
                      </span>
                    </div>

                    {lookupResult.record.status === "APPROVED" && lookupResult.record.vipCode && (
                      <div className="p-4 rounded-xl bg-[#ffd439]/15 border border-[#ffd439]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-mono text-[#23211a] font-bold">
                            VIP License Code:
                          </span>
                          <p className="text-sm font-mono font-bold text-[#23211a]">
                            {lookupResult.record.vipCode}
                          </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleCopy(lookupResult.record!.vipCode!, "vip")}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e8e6df] text-xs font-mono rounded-lg hover:bg-[#f0ede6]"
                          >
                            {copiedVip ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                            <span>Copy Code</span>
                          </button>
                          {!lookupResult.record.redeemedAt && (
                            <button
                              onClick={() => handleRedeemVipKey(lookupResult.record!.vipCode!)}
                              disabled={redeemingKey}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#23211a] text-[#ffd439] font-mono text-xs font-semibold uppercase rounded-lg hover:bg-black"
                            >
                              {redeemingKey ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Sparkles className="size-3" />
                              )}
                              <span>Activate Agency Plan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-[#868279]">
                    {lookupResult.error || "No matching design partner record found."}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= CONDITIONAL TAB: ROI CALCULATOR ================= */}
        {activeTab === "calculator" && (
          <section
            id="calculator-section"
            className="bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6 animate-in fade-in duration-300"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#f0ede6] text-[#23211a] text-[11px] font-mono font-semibold uppercase">
                <Sliders className="size-3" />
                <span>Annual Agency ROI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a]">
                Calculate your client fleet savings
              </h2>
              <p className="text-xs sm:text-sm text-[#5c5c5c]">
                Compare your current monitoring bills against 100% complimentary access to
                SteadyStack Agency Plan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9]">
                <span className="text-[11px] font-mono text-[#868279] uppercase font-semibold">
                  Competitor Fleet Cost
                </span>
                <p className="text-3xl font-serif font-medium text-[#868279] mt-1">
                  ${betterStackEstimatedCost}/yr
                </p>
                <span className="text-xs font-mono text-[#868279]">
                  Better Stack / Pingdom equivalent
                </span>
              </div>

              <div className="p-5 rounded-xl border border-[#ffd439] bg-[#ffd439]/15">
                <span className="text-[11px] font-mono text-[#23211a] uppercase font-bold">
                  Design Partner Cost
                </span>
                <p className="text-3xl font-serif font-medium text-[#23211a] mt-1">$0 / year</p>
                <span className="text-xs font-mono text-[#23211a] font-semibold">
                  100% Free VIP license key
                </span>
              </div>

              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <span className="text-[11px] font-mono text-emerald-800 uppercase font-bold">
                  Total Annual Savings
                </span>
                <p className="text-3xl font-serif font-medium text-emerald-900 mt-1">
                  +${annualSavings}
                </p>
                <span className="text-xs font-mono text-emerald-700">100% margin retained</span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9]">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono font-semibold text-[#23211a]">
                  Fleet Size:{" "}
                  <span className="px-2 py-0.5 rounded bg-[#ffd439] font-bold">
                    {calcMonitors} Monitors
                  </span>
                </label>
                <span className="text-xs font-mono text-[#868279]">Up to 250 on Agency Plan</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                value={calcMonitors}
                onChange={(e) => setCalcMonitors(parseInt(e.target.value, 10))}
                className="w-full accent-[#23211a] h-2 bg-[#e8e6df] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </section>
        )}

        {/* ================= CONDITIONAL TAB: PERKS MATRIX ================= */}
        {activeTab === "perks" && (
          <section className="bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#f0ede6] text-[#23211a] text-[11px] font-mono font-semibold uppercase">
                <Zap className="size-3" />
                <span>What&apos;s Included</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a]">
                Everything unlocked in the 1-Year Partner License ($348 Value)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <h3 className="font-serif font-medium text-base text-[#23211a]">
                    250 Active Edge Monitors
                  </h3>
                </div>
                <p className="text-xs text-[#5c5c5c] leading-relaxed">
                  Monitor up to 250 production endpoints, SSL certs, DNS records, and TCP sockets
                  with 30-second multi-region checks.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <h3 className="font-serif font-medium text-base text-[#23211a]">
                    Multi-Client Workspace Hub
                  </h3>
                </div>
                <p className="text-xs text-[#5c5c5c] leading-relaxed">
                  Provision up to 10 isolated client sub-accounts with individual team permissions,
                  billing tags, and custom alert channels.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <h3 className="font-serif font-medium text-base text-[#23211a]">
                    White-Label Status Pages & CNAMEs
                  </h3>
                </div>
                <p className="text-xs text-[#5c5c5c] leading-relaxed">
                  Host custom status pages on custom client domains with custom logos, tailored
                  colorways, and zero SteadyStack branding.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#e8e6df] bg-[#fbfbf9] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <h3 className="font-serif font-medium text-base text-[#23211a]">
                    Founder VIP Direct Line
                  </h3>
                </div>
                <p className="text-xs text-[#5c5c5c] leading-relaxed">
                  Direct Slack/Discord access to our core engineering team for roadmap requests,
                  custom probe features, and priority support.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ================= APPLICATION FORM SECTION ================= */}
        <section
          id="application-cockpit"
          className="bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col gap-8"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-[#fbfbf9] text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="size-3 text-[#ffd439]" />
              <span>Direct Application · 60 Seconds</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#23211a]">
              Apply for Design Partner Status
            </h2>
            <p className="text-sm text-[#5c5c5c] leading-relaxed font-sans max-w-2xl">
              Tell us briefly about your agency or production stack. We review applications within
              24 hours and issue VIP license keys directly.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-[#ffd439]/15 border border-[#ffd439] flex flex-col items-center text-center gap-4">
              <div className="size-12 rounded-full bg-[#ffd439] text-[#23211a] flex items-center justify-center">
                <Check className="size-6 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-[#23211a]">
                Application Received!
              </h3>
              <p className="text-xs sm:text-sm text-[#5c5c5c] max-w-md font-sans">
                Your application has been registered. Save your Reference ID below to look up status
                or redeem your key once approved:
              </p>
              <div className="p-3 bg-white border border-[#e8e6df] rounded-xl font-mono text-xs font-bold text-[#23211a] flex items-center gap-3">
                <span>{submittedId}</span>
                <button
                  onClick={() => handleCopy(submittedId, "id")}
                  className="hover:text-[#868279]"
                >
                  {copiedId ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#23211a]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] focus:outline-none focus:border-[#23211a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#23211a]">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@agency.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] focus:outline-none focus:border-[#23211a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#23211a]">
                    Agency / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Apex Studio / HyperScale Media"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] focus:outline-none focus:border-[#23211a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#23211a]">
                    Website / Project URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://apexstudio.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] focus:outline-none focus:border-[#23211a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor={endpointsInputId}
                    className="text-xs font-mono font-semibold text-[#23211a]"
                  >
                    Estimated Monitor Fleet Size
                  </label>
                  <select
                    id={endpointsInputId}
                    value={formData.monitorsCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monitorsCount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] focus:outline-none focus:border-[#23211a]"
                  >
                    <option value="1-10">1-10 Monitors (Indie Developer)</option>
                    <option value="10-50">10-50 Monitors (Boutique Agency)</option>
                    <option value="50-100">50-100 Monitors (Growth Dev Shop)</option>
                    <option value="100+">100+ Monitors (Enterprise MSP)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={currentToolInputId}
                    className="text-xs font-mono font-semibold text-[#23211a]"
                  >
                    Current Monitoring Tool
                  </label>
                  <select
                    id={currentToolInputId}
                    value={formData.currentTool}
                    onChange={(e) => setFormData({ ...formData, currentTool: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] focus:outline-none focus:border-[#23211a]"
                  >
                    <option value="UptimeRobot">UptimeRobot</option>
                    <option value="Better Stack">Better Stack / Better Uptime</option>
                    <option value="Uptime Kuma">Uptime Kuma (Self-Hosted)</option>
                    <option value="Pingdom">Pingdom / Datadog</option>
                    <option value="Checkly">Checkly / In-house scripts</option>
                    <option value="None">None yet / Starting fresh</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#23211a]">
                  Biggest Uptime / Client Alerting Pain Point (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. False alarms waking on-call at 3 AM, manual monthly SLA client reporting, lack of white-label status pages..."
                  value={formData.painPoint}
                  onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] focus:outline-none focus:border-[#23211a]"
                />
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df]">
                <input
                  type="checkbox"
                  id="commitment"
                  checked={formData.feedbackCommitment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      feedbackCommitment: e.target.checked,
                    })
                  }
                  className="mt-0.5 accent-[#23211a] size-4 rounded"
                />
                <label
                  htmlFor="commitment"
                  className="text-xs font-sans text-[#5c5c5c] leading-relaxed cursor-pointer"
                >
                  I agree to provide brief product feedback or an honest launch-day review in
                  exchange for 365 days of complimentary Agency Plan access ($348 value).
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                <span>Submit Design Partner Application</span>
              </button>
            </form>
          )}
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <HelpCircle className="size-4" />
              <span>Program Details</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-[#23211a]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-[#e8e6df] bg-white space-y-2 shadow-xs"
              >
                <h3 className="font-serif font-medium text-base text-[#23211a]">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= BOTTOM CTA ================= */}
        <section className="rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-16 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Flame className="size-3.5 text-[#ffd439]" />
            <span>Limited to 15 Verified Agencies</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-white mb-4 max-w-2xl text-balance">
            Claim your 1-year complimentary Agency license
          </h2>

          <p className="text-white/80 text-sm sm:text-base max-w-xl mb-8 font-sans leading-relaxed text-balance">
            Zero credit card required. Up to 250 monitors, 10 client seats, and white-label status
            pages for 365 days.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
            <a
              href="#application-cockpit"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto cursor-pointer"
            >
              <span>Apply Now (60s)</span>
              <ArrowRight className="size-4" />
            </a>
            <Link
              href="/agencies"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              <span>Explore Agency Features</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>365-Day VIP License</span>
            </div>
            <span>·</span>
            <span>Zero automatic renewals</span>
            <span>·</span>
            <span>24-Hour Review Turnaround</span>
          </div>
        </section>
      </div>
    </div>
  );
}
