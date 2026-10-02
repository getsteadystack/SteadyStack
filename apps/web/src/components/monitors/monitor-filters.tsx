"use client";

import { Search, Filter, ArrowUpDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientOption {
  id: string;
  name: string;
  color: string;
}

interface MonitorFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  sort: string;
  setSort: (s: string) => void;
  availableTags: string[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  // Client filter (optional — only shown when clients exist)
  availableClients?: ClientOption[];
  selectedClientId?: string | null;
  setSelectedClientId?: (id: string | null) => void;
}

export function MonitorFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sort,
  setSort,
  availableTags,
  selectedTag,
  setSelectedTag,
  availableClients = [],
  selectedClientId,
  setSelectedClientId,
}: MonitorFiltersProps) {
  const tabs = [
    { label: "All", value: "ALL" },
    { label: "Up", value: "UP" },
    { label: "Down", value: "DOWN" },
    { label: "Paused", value: "PAUSED" },
    { label: "Maint.", value: "MAINTENANCE" },
  ];

  const selectedClient = availableClients.find((c) => c.id === selectedClientId);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-3 shadow-xs">
      {/* LEFT: Search */}
      <div className="relative group w-full md:w-auto">
        <Search className="absolute left-3.5 top-3 text-muted-foreground size-4 group-focus-within:text-foreground transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search monitors..."
          className="bg-muted/40 border border-border pl-10 pr-4 py-2.5 w-full md:w-64 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:bg-card transition-all rounded-xl shadow-2xs"
        />
      </div>

      {/* RIGHT: Tabs + Divider + Actions */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* TABS */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-2 text-[11px] uppercase font-mono font-semibold tracking-wider transition-all whitespace-nowrap rounded-xl border cursor-pointer",
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/30 text-muted-foreground border-transparent hover:border-border hover:text-foreground hover:bg-muted/70",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block h-6 w-px bg-border" />

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {/* Client filter — only shown when clients exist */}
          {availableClients.length > 0 && setSelectedClientId && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 border text-xs font-semibold transition-all rounded-xl outline-none cursor-pointer shadow-xs",
                  selectedClientId
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-card",
                )}
              >
                {selectedClient && (
                  <span
                    className="inline-block size-2 rounded-full shrink-0"
                    style={{ backgroundColor: selectedClient.color }}
                  />
                )}
                {!selectedClient && <Users className="size-3.5" />}
                <span>{selectedClient ? selectedClient.name : "Client"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 bg-popover border border-border text-foreground text-xs rounded-2xl p-1.5 shadow-md"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="uppercase tracking-wider text-muted-foreground text-[10px] font-mono font-bold px-2 py-1.5">
                    Filter by Client
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/60" />
                  {selectedClientId && (
                    <>
                      <DropdownMenuItem
                        onClick={() => setSelectedClientId(null)}
                        className="focus:bg-muted cursor-pointer text-red-600 focus:text-red-600 rounded-xl px-2 py-1.5"
                      >
                        Clear Filter
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/60" />
                    </>
                  )}
                  {availableClients.map((client) => (
                    <DropdownMenuItem
                      key={client.id}
                      onClick={() =>
                        setSelectedClientId(client.id === selectedClientId ? null : client.id)
                      }
                      className={cn(
                        "focus:bg-muted cursor-pointer flex items-center gap-2 rounded-xl px-2 py-1.5 font-medium",
                        client.id === selectedClientId
                          ? "bg-muted text-foreground font-semibold"
                          : "",
                      )}
                    >
                      <span
                        className="inline-block size-2 rounded-full shrink-0"
                        style={{ backgroundColor: client.color }}
                      />
                      {client.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Tag filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 border text-xs font-semibold transition-all rounded-xl outline-none cursor-pointer shadow-xs",
                selectedTag
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-card",
              )}
            >
              <Filter className="size-3.5" />
              <span>{selectedTag ? `Tag: ${selectedTag}` : "Tags"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-popover border border-border text-foreground text-xs rounded-2xl p-1.5 shadow-md"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="uppercase tracking-wider text-muted-foreground text-[10px] font-mono font-bold px-2 py-1.5">
                  Filter by Tag
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60" />
                {selectedTag && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setSelectedTag(null)}
                      className="focus:bg-muted cursor-pointer text-red-600 focus:text-red-600 rounded-xl px-2 py-1.5"
                    >
                      Clear Filter
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/60" />
                  </>
                )}
                {availableTags.length === 0 ? (
                  <div className="px-2 py-3 text-center text-[10px] text-muted-foreground uppercase font-mono">
                    No tags defined
                  </div>
                ) : (
                  availableTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={cn(
                        "focus:bg-muted cursor-pointer uppercase rounded-xl px-2 py-1.5",
                        tag === selectedTag ? "bg-muted text-foreground font-semibold" : "",
                      )}
                    >
                      {tag}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3.5 py-2 text-muted-foreground hover:text-foreground border border-border hover:bg-muted bg-card text-xs font-semibold transition-all rounded-xl outline-none cursor-pointer shadow-xs">
              <ArrowUpDown className="size-3.5" />
              <span>Sort: {sort}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-popover border border-border text-foreground text-xs rounded-2xl p-1.5 shadow-md"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="uppercase tracking-wider text-muted-foreground text-[10px] font-mono font-bold px-2 py-1.5">
                  Sort Order
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem
                  onClick={() => setSort("name")}
                  className="focus:bg-muted cursor-pointer rounded-xl px-2 py-1.5"
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSort("status")}
                  className="focus:bg-muted cursor-pointer rounded-xl px-2 py-1.5"
                >
                  Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSort("uptime")}
                  className="focus:bg-muted cursor-pointer rounded-xl px-2 py-1.5"
                >
                  Uptime (High-Low)
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
