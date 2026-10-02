"use client";

interface StatusBadgePreviewProps {
  theme: {
    bgColor: string;
    textColor: string;
    borderRadius: string;
  };
  badgeText: {
    operational: string;
    partial: string;
    major: string;
  };
}

const STATUS_COLORS = {
  operational: "#10b981",
  partial: "#f59e0b",
  major: "#ef4444",
};

export function StatusBadgePreview({ theme, badgeText }: StatusBadgePreviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <h3 className="text-base font-serif font-medium text-foreground mb-1">Live Preview</h3>
      <p className="text-xs text-muted-foreground mb-6">
        This is how your widget will appear on external websites
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Operational State */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
            Operational
          </span>
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 transition-all cursor-pointer hover:opacity-90 shadow-2xs"
              style={{
                backgroundColor: theme.bgColor,
                borderRadius: theme.borderRadius,
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: STATUS_COLORS.operational }}
              />
              <span className="text-xs font-medium" style={{ color: theme.textColor }}>
                {badgeText.operational}
              </span>
            </div>
          </div>
        </div>

        {/* Partial Outage State */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
            Partial Outage
          </span>
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 transition-all cursor-pointer hover:opacity-90 shadow-2xs"
              style={{
                backgroundColor: theme.bgColor,
                borderRadius: theme.borderRadius,
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: STATUS_COLORS.partial }}
              />
              <span className="text-xs font-medium" style={{ color: theme.textColor }}>
                {badgeText.partial}
              </span>
            </div>
          </div>
        </div>

        {/* Major Outage State */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-red-700 dark:text-red-400 font-semibold">
            Major Outage
          </span>
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 transition-all cursor-pointer hover:opacity-90 shadow-2xs"
              style={{
                backgroundColor: theme.bgColor,
                borderRadius: theme.borderRadius,
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: STATUS_COLORS.major }}
              />
              <span className="text-xs font-medium" style={{ color: theme.textColor }}>
                {badgeText.major}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dark/Light background preview */}
      <div className="mt-6 pt-6 border-t border-primary/10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4 block">
          On Different Backgrounds
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Light background */}
          <div className="p-6 rounded-sm bg-white flex items-center justify-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5"
              style={{
                backgroundColor: theme.bgColor,
                borderRadius: theme.borderRadius,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: STATUS_COLORS.operational }}
              />
              <span className="text-sm font-medium" style={{ color: theme.textColor }}>
                {badgeText.operational}
              </span>
            </div>
          </div>

          {/* Dark background */}
          <div className="p-6 rounded-sm bg-zinc-900 flex items-center justify-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5"
              style={{
                backgroundColor: theme.bgColor,
                borderRadius: theme.borderRadius,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: STATUS_COLORS.operational }}
              />
              <span className="text-sm font-medium" style={{ color: theme.textColor }}>
                {badgeText.operational}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
