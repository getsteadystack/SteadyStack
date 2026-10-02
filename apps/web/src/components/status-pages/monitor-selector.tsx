"use client";

import { Check, Square, CheckSquare } from "lucide-react";

interface Monitor {
  id: string;
  monitorId: string;
  displayName: string | null;
  monitor: {
    id: string;
    name: string;
  };
}

interface MonitorSelectorProps {
  monitors: Monitor[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function MonitorSelector({ monitors, selectedIds, onChange }: MonitorSelectorProps) {
  const allSelected = selectedIds.length === monitors.length;
  const noneSelected = selectedIds.length === 0;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(monitors.map((m) => m.monitorId));
    }
  };

  const toggleMonitor = (monitorId: string) => {
    if (selectedIds.includes(monitorId)) {
      onChange(selectedIds.filter((id) => id !== monitorId));
    } else {
      onChange([...selectedIds, monitorId]);
    }
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-background">
      {/* Select All Header */}
      <button
        type="button"
        onClick={toggleAll}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border text-left"
      >
        <div
          className={`size-4 rounded-md flex items-center justify-center border transition-colors ${
            allSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/40 text-transparent"
          }`}
        >
          {allSelected && <Check className="size-3 stroke-[3]" />}
        </div>
        <span className="text-xs font-medium text-foreground">
          {allSelected ? "Deselect All" : "Select All"}
        </span>
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {selectedIds.length}/{monitors.length}
        </span>
      </button>

      {/* Monitor List */}
      <div className="max-h-48 overflow-y-auto divide-y divide-border">
        {monitors.map((item) => {
          const isSelected = selectedIds.includes(item.monitorId);
          const name = item.displayName || item.monitor.name;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleMonitor(item.monitorId)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left cursor-pointer"
            >
              <div
                className={`size-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/40 text-transparent"
                }`}
              >
                <Check className="size-3 stroke-[3]" />
              </div>
              <span
                className={`text-xs truncate ${
                  isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {monitors.length === 0 && (
        <div className="p-4 text-center text-muted-foreground text-xs font-mono">
          No monitors available
        </div>
      )}
    </div>
  );
}
