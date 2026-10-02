"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // next-themes injects a <script> tag for FOUC prevention. React 19 warns
  // about script tags inside components, but the script executes correctly.
  // Suppress this specific false-positive warning in dev.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const original = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (msg.includes("script") && msg.includes("template")) return;
      original(...args);
    };
    return () => {
      console.error = original;
    };
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
