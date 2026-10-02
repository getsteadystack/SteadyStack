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
          container: "bg-emerald-50 border-emerald-200 text-emerald-950",
          icon: <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />,
          defaultTitle: "Tip",
          titleColor: "text-emerald-900",
        };
      case "warning":
        return {
          container: "bg-amber-50 border-amber-200 text-amber-950",
          icon: <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />,
          defaultTitle: "Warning",
          titleColor: "text-amber-900",
        };
      case "danger":
        return {
          container: "bg-rose-50 border-rose-200 text-rose-950",
          icon: <ShieldAlert className="size-4 text-rose-600 shrink-0 mt-0.5" />,
          defaultTitle: "Danger",
          titleColor: "text-rose-900",
        };
      case "info":
        return {
          container: "bg-sky-50 border-sky-200 text-sky-950",
          icon: <Lightbulb className="size-4 text-sky-600 shrink-0 mt-0.5" />,
          defaultTitle: "Info",
          titleColor: "text-sky-900",
        };
      case "note":
      default:
        return {
          container: "bg-[#f0ede6] border-[#e8e6df] text-[#23211a]",
          icon: <Info className="size-4 text-[#23211a] shrink-0 mt-0.5" />,
          defaultTitle: "Note",
          titleColor: "text-[#23211a]",
        };
    }
  };

  const styles = getCalloutStyles();

  return (
    <div
      className={`my-6 rounded-2xl border p-4.5 sm:p-5 flex gap-3 text-xs leading-relaxed shadow-xs ${styles.container}`}
    >
      {styles.icon}
      <div className="flex flex-col gap-1 w-full">
        <span
          className={`font-mono font-bold tracking-wider text-xs uppercase ${styles.titleColor}`}
        >
          {title || styles.defaultTitle}
        </span>
        <div className="text-[#383630] text-xs sm:text-sm leading-relaxed space-y-2 font-sans">
          {children}
        </div>
      </div>
    </div>
  );
}
