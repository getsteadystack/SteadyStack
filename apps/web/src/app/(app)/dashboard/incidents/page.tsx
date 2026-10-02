import { getIncidents } from "@/actions/incidents";
import { getIncidentTemplates } from "@/actions/incident-templates";
import { getMonitors } from "@/actions/monitors";
import { IncidentTable } from "@/components/incidents/incident-table";
import { IncidentTemplateManager } from "@/components/incidents/incident-template-manager";
import { CreateIncidentModal } from "@/components/incidents/create-incident-modal";
import { getUserPreferences } from "@/actions/user";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Incidents | SteadyStack",
  description: "Manage system incidents",
};

export default async function IncidentsPage() {
  const [incidents, templates, monitors, preferences] = await Promise.all([
    getIncidents(),
    getIncidentTemplates(),
    getMonitors(),
    getUserPreferences(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">
            Incidents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage service outages, investigations, and incident notifications.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-border bg-card hover:bg-muted/60 text-xs font-medium h-9"
              >
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border-border shadow-xl">
              <DialogTitle className="sr-only">Incident Templates</DialogTitle>
              <IncidentTemplateManager templates={templates} />
            </DialogContent>
          </Dialog>

          <CreateIncidentModal monitors={monitors} templates={templates} />
        </div>
      </div>

      <IncidentTable
        incidents={incidents}
        userTimezone={preferences.timezone}
        userTimeFormat={preferences.timeFormat}
      />
    </div>
  );
}
