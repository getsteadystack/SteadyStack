"use client";

import { useState } from "react";
import { Plus, Users, Upload } from "lucide-react";
import { ClientCard, CreateClientForm } from "@/components/clients/client-card";
import { UnassignedPagesSection } from "@/components/clients/unassigned-pages-section";
import { BulkImportModal } from "@/components/clients/bulk-import-modal";

interface ClientsClientProps {
  initialClients: any[];
  allMonitors: { id: string; name: string; clientId: string | null }[];
  orphanedPages?: any[];
}

export function ClientsClient({
  initialClients,
  allMonitors,
  orphanedPages = [],
}: ClientsClientProps) {
  const [showCreate, setShowCreate] = useState(initialClients.length === 0);
  const [showBulkImport, setShowBulkImport] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-serif font-medium tracking-tight text-foreground">
            Client Fleet
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organize multi-tenant client infrastructure, manage white-label portals, and view
            aggregate uptime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 border border-border bg-card hover:bg-muted text-foreground text-xs font-mono font-medium transition-all cursor-pointer rounded-xl shadow-xs"
          >
            <Upload className="size-3.5 text-muted-foreground" />
            <span>Bulk CSV</span>
          </button>
          <button
            onClick={() => setShowCreate((p) => !p)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-medium hover:bg-[#373428] transition-all cursor-pointer rounded-xl shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Bulk import modal */}
      <BulkImportModal isOpen={showBulkImport} onClose={() => setShowBulkImport(false)} />

      {/* Create form */}
      {showCreate && <CreateClientForm onDone={() => setShowCreate(false)} />}

      {/* Empty state */}
      {initialClients.length === 0 && !showCreate && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed border-border rounded-2xl bg-card/30 text-center">
          <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <Users className="size-6" />
          </div>
          <div>
            <p className="font-serif text-lg font-medium text-foreground">No clients added yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Create your first client account to group monitors, configure white-label status
              portals, and send SLA reports.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold hover:bg-[#373428] transition-all cursor-pointer rounded-xl shadow-xs"
          >
            <Plus className="size-3.5" />
            Create First Client
          </button>
        </div>
      )}

      {/* Client list */}
      {initialClients.length > 0 && (
        <div className="flex flex-col gap-4">
          {initialClients.map((client) => (
            <ClientCard key={client.id} client={client} allMonitors={allMonitors} />
          ))}
        </div>
      )}

      {/* Unassigned status pages */}
      {orphanedPages.length > 0 && (
        <UnassignedPagesSection initialPages={orphanedPages} clients={initialClients} />
      )}
    </div>
  );
}
