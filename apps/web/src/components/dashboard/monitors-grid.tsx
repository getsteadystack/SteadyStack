"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MonitorGridCard } from "./monitor-grid-card";
import { LayoutGrid, Save, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: string;
  events: any[];
  interval: number;
}

interface MonitorsGridProps {
  monitors: Monitor[];
}

interface GridItemConfig {
  id: string;
  size: "1x1" | "2x1" | "2x2";
}

export function MonitorsGrid({ monitors }: MonitorsGridProps) {
  const [layout, setLayout] = useState<GridItemConfig[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Track monitor ids separately so the layout-sync effect only re-runs when the
  // set of monitors actually changes (not on every 5s poll that returns fresh objects).
  const monitorIds = useMemo(() => monitors.map((m) => m.id).join(","), [monitors]);

  const generateDefaultLayout = useCallback(() => {
    setLayout(monitors.map((m) => ({ id: m.id, size: "1x1" as const })));
  }, [monitors]);

  // Load layout from localStorage or generate default.
  // Only re-runs when the monitor id set changes — without this, every 5s poll
  // overwrote user customizations (sizes/order) and re-triggered a full grid render.
  useEffect(() => {
    const savedLayout = localStorage.getItem("steadystack_dashboard_grid_layout");
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout) as GridItemConfig[];
        // Filter out items that are no longer in monitors list, and add new ones
        const monitorIdSet = new Set(monitors.map((m) => m.id));
        const filtered = parsed.filter((item) => monitorIdSet.has(item.id));
        const existingIds = new Set(filtered.map((item) => item.id));

        const newItems: GridItemConfig[] = [];
        for (const m of monitors) {
          if (!existingIds.has(m.id)) {
            newItems.push({ id: m.id, size: "1x1" });
          }
        }

        setLayout([...filtered, ...newItems]);
      } catch (e) {
        console.error("Failed to parse saved grid layout:", e);
        generateDefaultLayout();
      }
    } else {
      generateDefaultLayout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depends only on the id set; monitor data refreshes flow through orderedItems below
  }, [monitorIds, generateDefaultLayout]);

  const saveLayout = (newLayout: GridItemConfig[]) => {
    localStorage.setItem("steadystack_dashboard_grid_layout", JSON.stringify(newLayout));
  };

  // Shared resize callback — stable identity so memoized MonitorGridCards skip
  // re-render on unrelated 5s polls (previously a fresh arrow per card per render).
  const handleResize = useCallback((id: string, size: "1x1" | "2x1" | "2x2") => {
    setLayout((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, size } : item));
      saveLayout(updated);
      return updated;
    });
  }, []);

  const handleReset = () => {
    generateDefaultLayout();
    localStorage.removeItem("steadystack_dashboard_grid_layout");
  };

  // Drag and Drop handlers
  const handleDragStart = useCallback(
    (index: number) => {
      if (!isEditMode) return;
      setDraggedIndex(index);
    },
    [isEditMode],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index || !isEditMode) return;

      // Reorder items in state to animate via framer-motion layout prop
      const reordered = [...layout];
      const [draggedItem] = reordered.splice(draggedIndex, 1);
      reordered.splice(index, 0, draggedItem);

      setDraggedIndex(index);
      setLayout(reordered);
    },
    [draggedIndex, isEditMode, layout],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    saveLayout(layout);
  }, [layout]);

  // Map configuration back to full monitor data (memoized: re-created on every
  // poll previously, cascading re-renders through every grid card)
  const orderedItems = useMemo(() => {
    const monitorMap = new Map(monitors.map((m) => [m.id, m]));
    return layout
      .map((item) => ({
        config: item,
        data: monitorMap.get(item.id),
      }))
      .filter((item) => item.data !== undefined);
  }, [monitors, layout]);

  // Fresh-function-per-card props previously defeated memo(MonitorGridCard) on
  // every render; identity-stable props keep memoization effective.
  const onCardResize = handleResize;

  // The drag handler reads the latest ordering through a ref so dragHandleProps
  // stays identity-stable across polls (orderedItems itself changes identity
  // whenever monitor data refreshes).
  const orderedItemsRef = useRef(orderedItems);
  useEffect(() => {
    orderedItemsRef.current = orderedItems;
  }, [orderedItems]);

  const dragHandleProps = useMemo(
    () => ({
      draggable: isEditMode,
      onDragStart: (e: React.DragEvent) => {
        e.stopPropagation();
        const cardId = (e.currentTarget.closest("[data-card-id]") as HTMLElement | null)?.dataset
          .cardId;
        if (cardId) {
          const index = orderedItemsRef.current.findIndex((item) => item.config.id === cardId);
          handleDragStart(index);
        }
      },
    }),
    [isEditMode, handleDragStart],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Grid Controller Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4.5 text-primary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Operational Matrix Grid
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 font-mono text-[10px] uppercase tracking-wider"
            >
              <RotateCcw className="size-3 mr-1.5" />
              Reset Layout
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`h-8 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              isEditMode
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
            }`}
          >
            {isEditMode ? (
              <>
                <Save className="size-3 mr-1.5" />
                Done Configuring
              </>
            ) : (
              "Configure Layout"
            )}
          </Button>
        </div>
      </div>

      {isEditMode && (
        <div className="flex items-center gap-2 p-3.5 border border-primary/10 bg-primary/5 rounded-lg">
          <AlertCircle className="size-4 text-primary shrink-0" />
          <p className="text-xs text-primary/80 font-mono">
            DRAG handles to rearrange nodes. Click RESIZE controls inside cards to resize grids.
          </p>
        </div>
      )}

      {/* Responsive Custom Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
        <AnimatePresence mode="popLayout">
          {orderedItems.map(({ config, data }, index) => (
            <motion.div
              key={config.id}
              data-card-id={config.id}
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              draggable={isEditMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative ${isEditMode ? "cursor-grab active:cursor-grabbing" : ""} ${
                config.size === "1x1"
                  ? "col-span-1"
                  : config.size === "2x1"
                    ? "col-span-1 md:col-span-2"
                    : "col-span-1 md:col-span-2 row-span-2"
              }`}
            >
              <MonitorGridCard
                monitor={data}
                size={config.size}
                onResize={onCardResize}
                isEditMode={isEditMode}
                dragHandleProps={dragHandleProps}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {orderedItems.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
              No nodes detected in layout matrix.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
