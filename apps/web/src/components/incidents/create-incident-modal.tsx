"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createIncident } from "@/actions/incidents";
import type { IncidentTemplateData } from "@/actions/incident-templates";

const formSchema = z.object({
  monitorId: z.string().min(1, "Monitor is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
  templateId: z.string().optional(), // For logic only
});

interface CreateIncidentModalProps {
  monitors: { id: string; name: string }[];
  templates: (IncidentTemplateData & { id: string })[];
}

export function CreateIncidentModal({ monitors, templates }: CreateIncidentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monitorId: "",
      title: "",
      description: "",
      severity: "HIGH",
      status: "INVESTIGATING",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await createIncident({
        monitorId: values.monitorId,
        title: values.title,
        description: values.description,
        severity: values.severity,
        status: values.status,
      });

      if (result.success) {
        toast.success("Incident reported successfully");
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      form.setValue("title", template.title);
      form.setValue("description", template.description);
      form.setValue("severity", template.severity);
      form.setValue("status", template.status);
      toast.info(`Applied template: ${template.name}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-foreground hover:bg-foreground/90 text-background font-medium text-xs rounded-xl shadow-xs h-9 px-4 cursor-pointer">
          <AlertTriangle className="mr-2 h-3.5 w-3.5 text-[#ffd439]" />
          Report Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-medium text-foreground">
            Report New Incident
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a manual incident report for a monitor. Alert notifications will be sent.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monitorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground">Monitor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border bg-background text-xs">
                        <SelectValue placeholder="Select affected monitor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {monitors.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {templates.length > 0 && (
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">
                      Load Template (Optional)
                    </FormLabel>
                    <Select onValueChange={handleTemplateChange}>
                      <FormControl>
                        <SelectTrigger className="border-dashed rounded-xl border-border bg-background text-xs">
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[11px] text-muted-foreground">
                      Selecting a template will auto-fill the fields below.
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. API Connectivity Issues"
                      className="rounded-xl border-border bg-background text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Severity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border bg-background text-xs">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="HIGH" className="text-xs">
                          High
                        </SelectItem>
                        <SelectItem value="MEDIUM" className="text-xs">
                          Medium
                        </SelectItem>
                        <SelectItem value="LOW" className="text-xs">
                          Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border bg-background text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="INVESTIGATING" className="text-xs">
                          Investigating
                        </SelectItem>
                        <SelectItem value="IDENTIFIED" className="text-xs">
                          Identified
                        </SelectItem>
                        <SelectItem value="MONITORING" className="text-xs">
                          Monitoring
                        </SelectItem>
                        <SelectItem value="RESOLVED" className="text-xs">
                          Resolved
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Markdown description..."
                      className="min-h-[100px] rounded-xl border-border bg-background text-xs resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-foreground text-background hover:bg-foreground/90 font-medium text-xs rounded-xl shadow-xs px-5"
              >
                {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Create Report
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
