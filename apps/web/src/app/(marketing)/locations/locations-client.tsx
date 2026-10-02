"use client";

import { useState } from "react";
import {
  CLOUDFLARE_PROBE_REGIONS,
  type Region,
  STEADYSTACK_CANONICAL_USER_AGENT,
} from "@steadystack/shared";
import {
  Copy,
  Check,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Activity,
  Terminal,
  ExternalLink,
  Globe,
  Sparkles,
} from "lucide-react";

interface LocationsClientProps {
  probes: (Region & {
    status: string;
    currentLatency: number;
    measuredColo: string;
    lastCheck?: string;
  })[];
}

export default function LocationsClient({ probes }: LocationsClientProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const healthyCount = probes.filter((p) => p.status === "ONLINE").length;
  const flappingProbes = probes.filter((p) => p.status === "FLAPPING");
  const excludedRegionText =
    flappingProbes.length > 0 ? flappingProbes.map((p) => p.code).join(", ") : null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const allowlistSnippet = `# 1. Cloudflare WAF Custom Rule (Recommended)
# Our synthetic probes run as Cloudflare Durable Objects.
# Subrequests include an authentic, un-spoofable CF-Worker header.
#
# Match Expression:
(http.request.headers["cf-worker"][0] eq "steadystack.dev")
# Action: Skip / Bypass WAF & Rate Limiting

# 2. General WAF & Reverse Proxy Headers (Fastly / AWS WAF / Nginx)
CF-Worker: steadystack.dev
User-Agent: ${STEADYSTACK_CANONICAL_USER_AGENT}`;

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#23211a] pt-32 pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#e8e6df]">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="space-y-5 text-left max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs">
            <Radio className="size-3.5 text-emerald-600 animate-pulse" />
            <span>Global Edge Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
            Every place we check from.
          </h1>

          <p className="text-base sm:text-lg text-[#5c5c5c] leading-relaxed font-sans text-balance">
            Live status of our seven Cloudflare edge regions plus out-of-band sentinel nodes on
            independent ASNs (Hetzner AS24940). Updated continuously. Multi-ASN quorum verification
            guarantees that a single-cloud provider outage never triggers false customer alerts.
          </p>
        </div>

        {/* Live Probe Table */}
        <div className="space-y-4 text-left">
          <div className="border border-[#e8e6df] bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#e8e6df]">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#e8e6df] bg-[#fbfbf9] font-mono text-xs uppercase tracking-wider text-[#868279]">
                    <th className="p-4 sm:p-5">Region</th>
                    <th className="p-4 sm:p-5">Covers</th>
                    <th className="p-4 sm:p-5">Network</th>
                    <th className="p-4 sm:p-5">Status</th>
                    <th className="p-4 sm:p-5">Last check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e6df]/70 font-sans text-xs">
                  {probes.map((probe) => {
                    const isOnline = probe.status === "ONLINE";
                    const isFlapping = probe.status === "FLAPPING";

                    return (
                      <tr key={probe.code} className="hover:bg-[#fbfbf9] transition-colors">
                        <td className="p-4 sm:p-5 font-mono font-bold text-[#23211a]">
                          <div className="flex items-center gap-2">
                            <span>{probe.flag}</span>
                            <span>{probe.code}</span>
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 text-[#23211a] font-medium">{probe.covers}</td>
                        <td className="p-4 sm:p-5 font-mono text-[#868279] text-[11px]">
                          {probe.asn} ({probe.provider})
                        </td>
                        <td className="p-4 sm:p-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isOnline
                                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                : isFlapping
                                  ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-700 border border-rose-500/20"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isOnline
                                  ? "bg-emerald-600"
                                  : isFlapping
                                    ? "bg-amber-600"
                                    : "bg-rose-600"
                              }`}
                            />
                            {probe.status}
                          </span>
                        </td>
                        <td className="p-4 sm:p-5 font-mono text-[#868279] text-[11px]">
                          {probe.lastCheck || "Just now"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Dynamic Live Quorum Note */}
            <div className="p-4 sm:p-5 bg-[#fbfbf9] border-t border-[#e8e6df] font-mono text-xs text-[#5c5c5c] flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans text-xs">
                <strong className="text-[#23211a] font-mono">Multi-ASN Quorum:</strong> 4 of 7
                sovereign edge regions (2 of 3 on Initiate free tier) plus independent ASN
                verification must confirm a failure before an incident opens.{" "}
                {excludedRegionText ? (
                  <span>
                    <strong className="text-amber-700">{excludedRegionText}</strong> is excluded
                    automatically until it stabilises — a probe that can&apos;t agree with itself
                    doesn&apos;t get a vote.
                  </span>
                ) : (
                  <span>
                    All probe nodes across Cloudflare and independent ASN sentinels are currently
                    healthy and participating in active quorum.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Allowlist Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e6df] space-y-6 shadow-xs text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-[#fbfbf9] text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="size-3 text-[#ffd439]" />
              <span>Firewall Integration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#23211a]">
              Allowlist our probes
            </h2>
            <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans max-w-3xl">
              Our synthetic probes originate from Cloudflare Durable Objects. Because serverless
              edge runtimes egress via Cloudflare&apos;s shared global edge IP pool, IP allowlisting
              is neither deterministic nor secure. Instead, configure your WAF or reverse proxy to
              match on our cryptographic{" "}
              <code className="text-[#23211a] font-mono font-bold bg-[#f4f2eb] px-1.5 py-0.5 rounded border border-[#e8e6df]">
                CF-Worker: steadystack.dev
              </code>{" "}
              header and verified{" "}
              <code className="text-[#23211a] font-mono font-bold bg-[#f4f2eb] px-1.5 py-0.5 rounded border border-[#e8e6df]">
                User-Agent
              </code>
              .
            </p>
          </div>

          <div className="relative rounded-2xl bg-[#23211a] border border-[#373428] p-5 font-mono text-xs text-[#f4f2eb] overflow-x-auto shadow-md">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-white/10 text-[11px] text-white/50">
              <span>WAF Allowlist Configuration Spec</span>
              <button
                type="button"
                onClick={() => handleCopy(allowlistSnippet, "spec")}
                className="inline-flex items-center gap-1.5 text-xs text-[#ffd439] hover:underline cursor-pointer"
              >
                {copiedSection === "spec" ? (
                  <Check className="size-3.5 text-[#ffd439]" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{copiedSection === "spec" ? "Copied" : "Copy Spec"}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all leading-relaxed text-white/90">
              {allowlistSnippet}
            </pre>
          </div>

          {/* Quick Copy Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleCopy("CF-Worker: steadystack.dev", "cf-worker")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e8e6df] text-[#23211a] text-xs font-mono font-semibold hover:bg-[#f4f2eb] transition-colors shadow-xs cursor-pointer"
            >
              {copiedSection === "cf-worker" ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copiedSection === "cf-worker" ? "Copied Header" : "Copy CF-Worker Header"}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopy("SteadyStack-Monitor/1.0 (+https://steadystack.dev/bot)", "user-agent")
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e8e6df] text-[#23211a] text-xs font-mono font-semibold hover:bg-[#f4f2eb] transition-colors shadow-xs cursor-pointer"
            >
              {copiedSection === "user-agent" ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copiedSection === "user-agent" ? "Copied User-Agent" : "Copy User-Agent"}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopy('http.request.headers["cf-worker"][0] eq "steadystack.dev"', "waf-rule")
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e8e6df] text-[#23211a] text-xs font-mono font-semibold hover:bg-[#f4f2eb] transition-colors shadow-xs cursor-pointer"
            >
              {copiedSection === "waf-rule" ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copiedSection === "waf-rule" ? "Copied WAF Rule" : "Copy Cloudflare WAF Rule"}
              </span>
            </button>

            <a
              href="/api/locations"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e8e6df] text-[#23211a] text-xs font-mono font-semibold hover:bg-[#f4f2eb] transition-colors shadow-xs"
            >
              <Terminal className="size-3.5 text-[#23211a]" />
              <span>/api/locations JSON</span>
              <ExternalLink className="size-3 text-[#868279]" />
            </a>
          </div>
        </div>

        {/* Coverage Gap & Probe Health Disclosures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Coverage Gap Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e6df] flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-xl font-serif font-medium text-[#23211a]">
                Coverage we don&apos;t have
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans">
                <p>
                  Africa, the Middle East, and parts of Central / South Asia. While our 7 sovereign
                  edge regions cover North America, Europe, Asia-Pacific, Oceania, and South
                  America, we do not currently operate dedicated edge probe workloads in Africa or
                  the Middle East — so we don&apos;t claim them.
                </p>
                <p>
                  What this means practically: a genuine outage still pages you, because your
                  endpoint will fail from all regions regardless of where it&apos;s hosted. What
                  we&apos;d miss is a localized routing issue affecting only users in those unprobed
                  regions — such as a Johannesburg or Dubai transit route anomaly. If that&apos;s a
                  real risk for your traffic, tell us; it moves our roadmap, and we&apos;ll say so
                  here when it ships.
                </p>
              </div>
            </div>
          </div>

          {/* Probe Health Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e6df] flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-[#f4f2eb] border border-[#e8e6df] flex items-center justify-center text-[#23211a]">
                <Activity className="size-5" />
              </div>
              <h3 className="text-xl font-serif font-medium text-[#23211a]">
                When a probe goes bad, we say so
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans">
                <p>
                  A monitoring probe with a bad network path reports failures that aren&apos;t real
                  — the industry&apos;s most common source of false alarms. Any probe with three or
                  more state transitions in two hours is marked Flapping and automatically removed
                  from quorum until it stabilises.
                </p>
                <p>
                  Every probe also reports on a heartbeat channel separate from its measurement
                  path, so a probe that&apos;s blocked is distinguishable from one that&apos;s
                  crashed. All of it is visible above, in real time, including when it&apos;s our
                  fault.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
