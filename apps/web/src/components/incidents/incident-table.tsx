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
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">No incidents recorded</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">Everything is running smoothly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Monitor</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium">{incident.monitor.name}</TableCell>
              <TableCell>{incident.title}</TableCell>
              <TableCell>
                <IncidentStatusBadge status={incident.status} />
              </TableCell>
              <TableCell>
                {f.formatDate(incident.startedAt, { style: "datetime" })}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/dashboard/incidents/${incident.id}`}>
                  <Button variant="ghost" size="sm">
                    Details
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
