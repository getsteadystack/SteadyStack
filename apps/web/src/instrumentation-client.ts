/**
 * Client-side instrumentation — runs before React hydration on every page load.
 *
 * React 19.2 emits a dev error for the inline <script> that next-themes
 * renders to restore the saved theme before paint
 * (pacocoursey/next-themes#385, shadcn-ui/ui#10104). The script only executes
 * during SSR, so it's a false positive — but the warning fires *during
 * hydration*, before any component effect can run, so a console filter must
 * be installed here rather than inside ThemeProvider's useEffect.
 *
 * Dev-only: production consoles are left untouched.
 */
if (process.env.NODE_ENV === "development") {
  const WIN = globalThis as typeof globalThis & {
    __steadystackConsolePatched?: boolean;
  };

  // Guard against double-wrapping if this module re-executes (e.g. HMR).
  if (!WIN.__steadystackConsolePatched) {
    WIN.__steadystackConsolePatched = true;

    const originalError = console.error.bind(console);

    console.error = (...args: unknown[]) => {
      // False positive: next-themes' inline theme-restore script (see #385).
      if (
        typeof args[0] === "string" &&
        args[0].includes("Encountered a script tag while rendering React component")
      ) {
        return;
      }
      originalError(...args);
    };
  }
}
