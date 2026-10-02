"use client";

import { useState } from "react";
import { MonitorForm } from "./monitor-form";
import { MaintenanceManager } from "./maintenance-manager";
import { Settings, Construction } from "lucide-react";

export function MonitorSettingsView({
  monitor,
  windows,
  hasProtocolCredentials = false,
}: {
  monitor: any;
  windows: any[];
  hasProtocolCredentials?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"general" | "maintenance">("general");

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-primary/20">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "general"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-primary/50 hover:text-primary hover:bg-primary/5"
          }`}
        >
          <Settings className="size-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "maintenance"
              ? "border-amber-500 text-amber-500 bg-amber-500/5"
              : "border-transparent text-primary/50 hover:text-amber-500 hover:bg-amber-500/5"
          }`}
        >
          <Construction className="size-4" />
          Maintenance
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === "general" ? (
          <MonitorForm monitor={monitor} hasProtocolCredentials={hasProtocolCredentials} />
        ) : (
          <MaintenanceManager monitorId={monitor.id} windows={windows} />
        )}
      </div>
    </div>
  );
}
