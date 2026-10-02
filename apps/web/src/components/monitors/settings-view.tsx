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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold font-mono uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
            activeTab === "general"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="size-3.5" />
          General
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold font-mono uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
            activeTab === "maintenance"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Construction className="size-3.5" />
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
