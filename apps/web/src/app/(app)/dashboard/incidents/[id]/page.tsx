import { getIncident } from "@/actions/incidents";
import { DashboardHeader } from "@/components/dashboard/header";
import { IncidentStatusBadge } from "@/components/incidents/incident-status-badge";
import { IncidentActions } from "@/components/incidents/incident-actions";
import { IncidentTimeline } from "@/components/incidents/incident-timeline";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Book } from "lucide-react";

import { getUserPreferences } from "@/actions/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPostMortem } from "@/actions/post-mortem";
import { PostMortemEditor } from "@/components/incidents/post-mortem/post-mortem-editor";
import { formatDate } from "@/lib/format";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = await getIncident(id);
  const postMortem = await getPostMortem(id);
  const preferences = await getUserPreferences();
  const locale = await getLocale();

  if (!incident) {
    notFound();
  }

  const formatDateTime = (date: Date) => formatDate(date, { locale, style: "datetime" });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/incidents"
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm mb-4 w-fit"
        >
          <ArrowLeft className="size-4" /> Back to Incidents
        </Link>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="post-mortem">Post-Mortem</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Actions moved here or kept in Overview? kept in Overview usually, but Status is global.
                 Actually, usually Actions are specific to the entity.
                 The existing code had IncidentActions at the top. I'll keep them effectively, 
                 but maybe visually distinct. 
                 Let's put IncidentActions inside the Overview tab or outside?
                 Outside makes sense for global control.
             */}
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <IncidentActions incidentId={incident.id} currentStatus={incident.status} />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-md border p-6 bg-card">
                <h3 className="font-semibold mb-2 text-lg">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {incident.description || "No description provided."}
                </p>
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground font-mono">
                  Monitor URL: <span className="text-foreground">{incident.monitor.url}</span>
                </div>
              </div>

              {incident.monitor.runbookUrl && (
                <div className="rounded-md border p-6 bg-primary/5 border-primary/20 backdrop-blur-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-primary/10 group-hover:border-primary/30 transition-colors"></div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-sm border border-primary/20">
                      <Book className="size-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-foreground font-mono uppercase tracking-tight flex items-center gap-2">
                        Immediate Remediation Runbook
                      </h3>
                      <p className="text-sm text-primary/60 font-mono">
                        Follow the predefined steps to resolve this incident.
                      </p>
                      <a
                        href={incident.monitor.runbookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider font-mono rounded-sm hover:bg-primary/90 transition-all group/btn"
                      >
                        <ExternalLink className="size-4" />
                        Execute Remediation Steps
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-md border p-6 bg-card">
                <IncidentTimeline
                  events={incident.events}
                  userTimezone={preferences.timezone}
                  userTimeFormat={preferences.timeFormat}
                />
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <div className="rounded-md border p-6 bg-card space-y-4">
                <h3 className="font-semibold text-lg">Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <IncidentStatusBadge status={incident.status} />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Severity</span>
                    <span className="font-medium text-destructive">{incident.severity}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-mono">{formatDateTime(new Date(incident.startedAt))}</span>
                  </div>
                  {incident.resolvedAt && (
                    <div className="flex justify-between items-center py-2 border-b bg-green-500/5 -mx-2 px-2">
                      <span className="text-muted-foreground">Resolved</span>
                      <span className="font-mono text-green-500">
                        {formatDateTime(new Date(incident.resolvedAt))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="post-mortem">
          <PostMortemEditor
            incidentId={incident.id}
            incidentTitle={incident.title}
            initialData={postMortem}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
