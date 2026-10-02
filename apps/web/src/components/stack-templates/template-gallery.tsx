"use client";

import { useState } from "react";
import {
  Globe,
  Database,
  ShoppingCart,
  Code,
  Container,
  FileText,
  LayoutDashboard,
  Server,
  Cpu,
  Boxes,
  Smartphone,
  Coins,
  Cloud,
  Network,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Layers,
  Activity,
  ShieldCheck,
  Heart,
  Radio,
} from "lucide-react";
import {
  stackTemplates,
  getTemplateById,
  type StackTemplate,
} from "@steadystack/shared/stack-templates";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Database,
  ShoppingCart,
  Code,
  Container,
  FileText,
  LayoutDashboard,
  Server,
  Cpu,
  Boxes,
  Smartphone,
  Coins,
  Cloud,
  Network,
};

const monitorTypeIcons: Record<string, React.ElementType> = {
  HTTP: Globe,
  PING: Activity,
  PORT: Radio,
  SSL: ShieldCheck,
  DNS: Server,
  HEARTBEAT: Heart,
};

function TemplateCard({
  template,
  onApply,
}: {
  template: StackTemplate;
  onApply: (id: string) => void;
}) {
  const Icon = iconMap[template.icon] || Globe;
  const difficultyBadge =
    template.difficulty === "beginner"
      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
      : template.difficulty === "intermediate"
        ? "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20"
        : "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20";

  return (
    <div className="group relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-muted border border-border group-hover:bg-[#ffd439]/20 group-hover:border-[#ffd439]/40 transition-colors">
            <Icon className="size-5 text-foreground" />
          </div>
          <span
            className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${difficultyBadge}`}
          >
            {template.difficulty}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-serif font-medium text-foreground tracking-tight">
            {template.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {template.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {template.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Layers className="size-3.5 text-muted-foreground" />
          <span>
            {template.monitors.length} monitor
            {template.monitors.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="border-t border-border p-4 bg-muted/20">
        <button
          onClick={() => onApply(template.id)}
          className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Apply Template
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function DifficultyFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { label: "All Stacks", value: "all" },
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs font-medium px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
            value === opt.value
              ? "bg-foreground text-background border-foreground shadow-sm"
              : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TemplateDetailModal({
  template,
  onClose,
}: {
  template: StackTemplate;
  onClose: () => void;
}) {
  const [urlMapping, setUrlMapping] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const m of template.monitors) {
      if (m.type !== "HEARTBEAT" && m.type !== "DNS") {
        const url = m.url.replace(/\/$/, "");
        map[m.name] = url;
      }
    }
    return map;
  });
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{
    created: { name: string; id: string }[];
    errors: { name: string; reason: string }[];
  } | null>(null);
  const router = useRouter();

  const handleApply = async () => {
    setApplying(true);
    setResult(null);
    try {
      const { applyTemplate } = await import("@/actions/stack-templates");
      const res = await applyTemplate(template.id, urlMapping);
      setResult(res);
      if (res.created.length > 0) {
        toast.success(`Created ${res.created.length} monitor${res.created.length > 1 ? "s" : ""}`);
        router.refresh();
      }
      if (res.errors.length > 0) {
        toast.error(`${res.errors.length} monitor${res.errors.length > 1 ? "s" : ""} failed`);
      }
    } catch (error) {
      toast.error("Failed to apply template");
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  const handleVisitMonitors = () => {
    router.push("/dashboard/monitors");
  };

  const handleVisitNew = () => {
    router.push("/dashboard/monitors/new");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-card border border-border shadow-sm">
              {(() => {
                const Icon = iconMap[template.icon] || Globe;
                return <Icon className="size-5 text-foreground" />;
              })()}
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-foreground">{template.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
            </div>
          </div>
        </div>

        {!result ? (
          <div className="p-6 flex flex-col gap-5">
            <p className="text-xs text-muted-foreground border-l-2 border-foreground/20 pl-3 leading-relaxed">
              Review the monitors this template will create. Replace the example URLs with your
              actual endpoints before applying.
            </p>

            <div className="flex flex-col gap-3">
              {template.monitors.map((monitor, idx) => {
                const TypeIcon = monitorTypeIcons[monitor.type] || Globe;
                return (
                  <div key={idx} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="p-1 rounded-md bg-card border border-border">
                        <TypeIcon className="size-3.5 text-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{monitor.name}</span>
                      <Badge variant="outline" className="text-[9px] font-mono ml-auto bg-card">
                        {monitor.type}
                      </Badge>
                    </div>
                    {monitor.type !== "HEARTBEAT" && monitor.type !== "DNS" ? (
                      <input
                        type="text"
                        value={urlMapping[monitor.name] ?? ""}
                        onChange={(e) =>
                          setUrlMapping({
                            ...urlMapping,
                            [monitor.name]: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border text-xs rounded-xl p-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors"
                        placeholder="https://your-actual-url.com"
                      />
                    ) : monitor.type === "HEARTBEAT" ? (
                      <p className="text-xs text-muted-foreground italic">
                        Heartbeat URL will be auto-generated on creation
                      </p>
                    ) : (
                      <input
                        type="text"
                        value={urlMapping[monitor.name] ?? monitor.url}
                        onChange={(e) =>
                          setUrlMapping({
                            ...urlMapping,
                            [monitor.name]: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border text-xs rounded-xl p-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors"
                        placeholder="example.com"
                      />
                    )}
                    {monitor.description && (
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        {monitor.description}
                      </p>
                    )}
                    {monitor.port && (
                      <p className="text-[11px] text-muted-foreground mt-1">Port: {monitor.port}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-3 border-t border-border">
              <button
                onClick={onClose}
                className="flex-1 border border-border text-foreground hover:bg-muted text-xs font-medium py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-foreground hover:bg-foreground/90 text-background font-medium text-xs py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {applying ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Creating Monitors...
                  </>
                ) : (
                  <>
                    <Layers className="size-3.5" />
                    Create {template.monitors.length} Monitor
                    {template.monitors.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              {result.errors.length === 0 ? (
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              ) : result.created.length > 0 ? (
                <AlertTriangle className="size-5 text-amber-500" />
              ) : (
                <AlertTriangle className="size-5 text-rose-500" />
              )}
              <span className="text-base font-serif font-medium text-foreground">
                {result.created.length > 0
                  ? `Created ${result.created.length} monitor${result.created.length > 1 ? "s" : ""}`
                  : "No monitors created"}
              </span>
            </div>

            {result.created.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Created Successfully
                </span>
                <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                  {result.created.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2.5 p-3 text-xs text-foreground"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-medium">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Failed
                </span>
                <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 text-xs">
                      <AlertTriangle className="size-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{err.name}</span>
                        <span className="text-[11px] text-rose-600 dark:text-rose-400">
                          {err.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-border">
              <button
                onClick={handleVisitMonitors}
                className="flex-1 border border-border text-foreground hover:bg-muted text-xs font-medium py-2.5 rounded-xl transition-all cursor-pointer"
              >
                View Monitors
              </button>
              <button
                onClick={handleVisitNew}
                className="flex-1 bg-foreground hover:bg-foreground/90 text-background font-medium text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Create Custom Monitor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TemplateGallery() {
  const [difficulty, setDifficulty] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filtered =
    difficulty === "all"
      ? stackTemplates
      : stackTemplates.filter((t) => t.difficulty === difficulty);

  const selected = selectedTemplate ? getTemplateById(selectedTemplate) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#ffd439]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Pre-Configured Blueprints
          </span>
        </div>
        <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground">
          Stack Templates
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
          One-click monitoring setups for your specific tech stack. Pick a template, replace the
          example URLs, and deploy in seconds.
        </p>
      </div>

      <DifficultyFilter value={difficulty} onChange={setDifficulty} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onApply={(id) => setSelectedTemplate(id)}
          />
        ))}
      </div>

      {selected && (
        <TemplateDetailModal template={selected} onClose={() => setSelectedTemplate(null)} />
      )}
    </div>
  );
}
