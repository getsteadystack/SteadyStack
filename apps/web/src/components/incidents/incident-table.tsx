"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IncidentStatusBadge } from "./incident-status-badge";
import { Button } from "@/components/ui/button";
import { useFormatters } from "@/lib/format";

interface IncidentTableProps {
  incidents: any[];
  userTimezone?: string;
  userTimeFormat?: string;
}

export function IncidentTable({
  incidents,
  userTimezone = "UTC",
  userTimeFormat = "HH:mm",
}: IncidentTableProps) {
  const f = useFormatters();
  if (incidents.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center animate-in fade-in duration-300">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="p-3.5 bg-muted rounded-2xl border border-border text-foreground mb-3">
            <span className="text-xl">✨</span>
          </div>
          <h3 className="text-lg font-serif font-medium text-foreground">No incidents recorded</h3>
          <p className="mb-4 mt-1.5 text-xs text-muted-foreground font-sans">
            All monitored systems and endpoints are running smoothly without interruptions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-medium text-xs text-muted-foreground uppercase font-mono py-3">
              Monitor
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground uppercase font-mono py-3">
              Title
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground uppercase font-mono py-3">
              Status
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground uppercase font-mono py-3">
              Started
            </TableHead>
            <TableHead className="text-right font-medium text-xs text-muted-foreground uppercase font-mono py-3">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/60">
          {incidents.map((incident) => (
            <TableRow
              key={incident.id}
              className="border-border hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-medium text-sm text-foreground">
                {incident.monitor.name}
              </TableCell>
              <TableCell className="text-sm font-sans text-foreground">{incident.title}</TableCell>
              <TableCell>
                <IncidentStatusBadge status={incident.status} />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {f.formatDate(incident.startedAt, { style: "datetime" })}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/dashboard/incidents/${incident.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs hover:bg-muted font-medium"
                  >
                    Details →
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
