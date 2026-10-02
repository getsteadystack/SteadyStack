"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { TerminalView } from "@/components/dashboard/terminal-view";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-[#ffd439]/30">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col overflow-y-auto bg-background">
        <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full relative">{children}</div>
      </main>

      {/* Floating Bottom-Right Add Monitor Button */}
      <Link
        href="/dashboard/monitors/new"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#23211a] text-white font-medium text-xs tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-black/10 hover:bg-[#373428] hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
        id="floating-add-monitor-btn"
        aria-label="Add New Monitor"
      >
        <div className="size-5 rounded-full bg-[#ffd439] text-[#23211a] flex items-center justify-center font-bold">
          <Plus className="size-3 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
        </div>
        <span className="font-semibold">New Monitor</span>
      </Link>

      <CommandPalette />
      <TerminalView />
    </div>
  );
}
