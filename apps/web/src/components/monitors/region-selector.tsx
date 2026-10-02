"use client";

import { useState } from "react";
import { AVAILABLE_REGIONS, CONTINENTS } from "@steadystack/shared";
import { Check } from "lucide-react";

interface RegionSelectorProps {
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
}

export function RegionSelector({ selectedRegions, onChange }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const MAX_REGIONS = 10;

  const toggleRegion = (regionCode: string) => {
    if (selectedRegions.includes(regionCode)) {
      onChange(selectedRegions.filter((r) => r !== regionCode));
    } else {
      if (selectedRegions.length >= MAX_REGIONS) return; // Hard cap
      onChange([...selectedRegions, regionCode]);
    }
  };

  const selectAllInContinent = (continent: string) => {
    const continentRegions = AVAILABLE_REGIONS.filter((r) => r.continent === continent).map(
      (r) => r.code,
    );

    const allSelected = continentRegions.every((code) => selectedRegions.includes(code));

    if (allSelected) {
      // Deselect all from this continent
      onChange(selectedRegions.filter((code) => !continentRegions.includes(code)));
    } else {
      // Select all from this continent — but respect the 10-region cap
      const combined = [...new Set([...selectedRegions, ...continentRegions])];
      onChange(combined.slice(0, MAX_REGIONS));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
          Monitoring Regions
        </label>
        <span className="text-[11px] font-mono text-muted-foreground">
          {selectedRegions.length} / {MAX_REGIONS} selected
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Select up to {MAX_REGIONS} regions to monitor your service from. Leave empty for
        single-region monitoring.
      </p>

      {selectedRegions.length > MAX_REGIONS && (
        <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono">
          ⚠ Max {MAX_REGIONS} regions allowed on this tier. Extra regions will be ignored.
        </div>
      )}

      <div className="rounded-xl border border-border bg-background shadow-2xs relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/40 transition-colors rounded-xl font-mono text-xs font-medium"
        >
          <span className="text-foreground">
            {selectedRegions.length === 0
              ? "Select regions..."
              : `${selectedRegions.length} region${selectedRegions.length > 1 ? "s" : ""} active`}
          </span>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="border-t border-border p-4 max-h-96 overflow-y-auto custom-scrollbar bg-card rounded-b-xl space-y-4">
            {CONTINENTS.map((continent) => {
              const continentRegions = AVAILABLE_REGIONS.filter((r) => r.continent === continent);
              const allSelected = continentRegions.every((r) => selectedRegions.includes(r.code));
              const someSelected = continentRegions.some((r) => selectedRegions.includes(r.code));

              return (
                <div key={continent} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => selectAllInContinent(continent)}
                    className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-foreground/80 transition-colors uppercase tracking-wider font-mono cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        allSelected
                          ? "bg-foreground border-foreground text-background"
                          : someSelected
                            ? "bg-foreground/50 border-foreground text-background"
                            : "border-border bg-background"
                      }`}
                    >
                      {(allSelected || someSelected) && (
                        <Check className="w-3 h-3 text-background" />
                      )}
                    </div>
                    {continent}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 ml-6">
                    {continentRegions.map((region) => {
                      const isSelected = selectedRegions.includes(region.code);

                      return (
                        <button
                          key={region.code}
                          type="button"
                          onClick={() => toggleRegion(region.code)}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "bg-muted/80 text-foreground font-medium border border-border shadow-2xs"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-foreground border-foreground"
                                : "border-border bg-background"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-background" />}
                          </div>
                          <span className="text-base">{region.flag}</span>
                          <span className="flex-1 text-left truncate">{region.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name="checkRegions" value={JSON.stringify(selectedRegions)} />
    </div>
  );
}
