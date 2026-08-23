import React from "react";
import { Info, Lightbulb, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export type CalloutType = "note" | "tip" | "warning" | "danger" | "info";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const getCalloutStyles = () => {
    switch (type) {
      case "tip":
        return {
          container: "bg-emerald-500/5 border-emerald-500/20 text-emerald-300",
          icon: <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />,
          defaultTitle: "Tip",
          titleColor: "text-emerald-400",
        };
      case "warning":
        return {
          container: "bg-amber-500/5 border-amber-500/20 text-amber-300",
          icon: <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />,
          defaultTitle: "Warning",
          titleColor: "text-amber-400",
        };
      case "danger":
        return {
          container: "bg-rose-500/5 border-rose-500/20 text-rose-300",
          icon: <ShieldAlert className="size-4 text-rose-400 shrink-0 mt-0.5" />,
          defaultTitle: "Danger",
          titleColor: "text-rose-400",
        };
      case "info":
        return {
          container: "bg-cyan-500/5 border-cyan-500/20 text-cyan-300",
          icon: <Lightbulb className="size-4 text-cyan-400 shrink-0 mt-0.5" />,
          defaultTitle: "Info",
          titleColor: "text-cyan-400",
        };
      case "note":
      default:
        return {
          container: "bg-primary/5 border-primary/20 text-primary-foreground/90",
          icon: <Info className="size-4 text-primary shrink-0 mt-0.5" />,
          defaultTitle: "Note",
          titleColor: "text-primary",
        };
    }
  };

  const styles = getCalloutStyles();

  return (
    <div
      className={`my-6 rounded-xl border p-4.5 flex gap-3 text-xs leading-relaxed ${styles.container}`}
    >
      {styles.icon}
      <div className="flex flex-col gap-1 w-full">
        <span className={`font-bold tracking-tight text-xs ${styles.titleColor}`}>
          {title || styles.defaultTitle}
        </span>
        <div className="text-muted-foreground text-xs leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}
