"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Globe,
  Layers,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
  Server,
  FileText,
  Lock,
  Cpu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function LandingHeader() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full bg-[#fbfbf9]/95 backdrop-blur-md border-b border-[#e8e6df]">
      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="size-8 rounded-xl bg-[#ffd439] text-[#23211a] flex items-center justify-center font-bold font-serif text-lg shadow-xs group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight text-[#23211a]">
            SteadyStack
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5c5c5c]">
          {/* Lifetime Deal Highlight Pill */}
          <Link
            href="/ltd"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffd439]/20 border border-[#ffd439]/40 text-[#23211a] font-semibold text-xs hover:bg-[#ffd439]/30 transition-all"
          >
            <Sparkles className="size-3 text-[#23211a]" />
            <span>Lifetime Deal</span>
            <span className="text-[10px] font-mono bg-[#23211a] text-white px-1.5 py-0.2 rounded-full">
              $49
            </span>
          </Link>

          {/* Product Dropdown */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "product" ? null : "product")}
              className="flex items-center gap-1 hover:text-[#23211a] transition-colors py-2"
            >
              <span>Product</span>
              <ChevronDown className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className="absolute top-full left-0 w-72 rounded-2xl bg-white border border-[#e8e6df] shadow-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
              <div className="space-y-1">
                <Link
                  href="/#how-it-works"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8f5] transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-[#ffd439]/20 text-[#23211a] mt-0.5">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#23211a]">Edge Quorum Engine</div>
                    <div className="text-[11px] text-[#78756e]">Zero false alarm verification</div>
                  </div>
                </Link>

                <Link
                  href="/locations"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8f5] transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-[#ffd439]/20 text-[#23211a] mt-0.5">
                    <Globe className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#23211a]">7 Global Edge Probes</div>
                    <div className="text-[11px] text-[#78756e]">Global latency distribution</div>
                  </div>
                </Link>

                <Link
                  href="/#solution"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8f5] transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-[#ffd439]/20 text-[#23211a] mt-0.5">
                    <Server className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#23211a]">
                      White-Label Status Portals
                    </div>
                    <div className="text-[11px] text-[#78756e]">Custom CNAME client pages</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/agencies" className="hover:text-[#23211a] transition-colors">
            Solutions
          </Link>
          <Link href="/#sample-report" className="hover:text-[#23211a] transition-colors">
            SLA Reports
          </Link>
          <Link href="/#pricing" className="hover:text-[#23211a] transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-[#23211a] transition-colors">
            Docs
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#23211a] text-white text-xs font-semibold px-4 py-2.5 hover:bg-[#373428] transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-xs font-semibold text-[#5c5c5c] hover:text-[#23211a] transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#23211a] text-white text-xs font-semibold px-4.5 py-2.5 shadow-sm hover:bg-[#373428] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Try SteadyStack For Free</span>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#23211a] hover:bg-black/5"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e6df] bg-[#fbfbf9] px-4 py-6 space-y-4">
          <div className="p-3 rounded-2xl bg-[#ffd439]/20 border border-[#ffd439]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#23211a]" />
              <span className="text-xs font-bold text-[#23211a]">Founder Lifetime Deal</span>
            </div>
            <Link
              href="/ltd"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs font-bold bg-[#23211a] text-white px-3 py-1.5 rounded-lg"
            >
              From $49 →
            </Link>
          </div>

          <div className="flex flex-col gap-3 font-medium text-sm text-[#23211a]">
            <Link
              href="/ltd"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-[#23211a]"
            >
              ⚡ Lifetime Deal Overview
            </Link>
            <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
              Edge Quorum Engine
            </Link>
            <Link href="/agencies" onClick={() => setIsMobileMenuOpen(false)}>
              Solutions for Agencies
            </Link>
            <Link href="/#sample-report" onClick={() => setIsMobileMenuOpen(false)}>
              SLA Reports
            </Link>
            <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/docs" onClick={() => setIsMobileMenuOpen(false)}>
              Documentation
            </Link>
            <Link
              href="/redeem"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs font-mono text-[#5c5c5c]"
            >
              Redeem Lifetime License Code →
            </Link>
          </div>

          <div className="pt-4 border-t border-[#e8e6df] flex flex-col gap-2">
            <Link
              href="/signup"
              className="w-full text-center py-3 rounded-xl bg-[#23211a] text-white font-semibold text-xs shadow-sm"
            >
              Try SteadyStack For Free
            </Link>
            <Link
              href="/login"
              className="w-full text-center py-2.5 rounded-xl border border-[#e8e6df] text-[#23211a] font-semibold text-xs"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
