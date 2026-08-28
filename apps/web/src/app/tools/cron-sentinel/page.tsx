import type { Metadata } from "next";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { CronSentinel } from "./builder";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cron Expression Generator, Validator & Schedule Debugger | SteadyStack",
  description:
    "Free cron expression generator and schedule debugger for infrastructure monitoring. Humanize crontab syntax, validate execution intervals, and prevent overlapping cron jobs.",
  keywords: [
    "cron expression generator",
    "crontab tester",
    "cron schedule validator",
    "cron syntax helper",
    "heartbeat monitoring",
    "cron job alert",
  ],
  alternates: {
    canonical: "/tools/cron-sentinel",
  },
  openGraph: {
    title: "Cron Expression Generator & Debugger",
    description:
      "Visualize and plan your monitoring schedule with SteadyStack's cron pulse sentinel.",
    type: "website",
  },
};

export default function CronSentinelPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="Cron Expression Generator & Debugger"
        description="Free cron expression generator and debugger for infrastructure monitoring. Visualize schedules, humanize cron strings, and plan next executions."
        url="https://steadystack.dev/tools/cron-sentinel"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-linear-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent pb-2 uppercase italic">
              Cron Pulse Sentinel
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-mono">
              [CALIBRATING EXECUTION ENGINE... ] Generate, debug, and visualize monitoring schedules
              with sub-second precision.
            </p>
          </div>

          <CronSentinel />

          <ToolContentSection
            toolName="Cron Expression Sentinel"
            overviewTitle="Crontab Syntax, Timezones & Schedule Architecture"
            overviewDescription="Cron is the standard time-based job scheduler across UNIX-like operating systems and cloud serverless triggers. A standard cron expression consists of 5 or 6 space-separated fields representing minute, hour, day of month, month, and day of week."
            howItWorks={[
              {
                title: "1. 5-Field Syntax Parsing",
                content:
                  "Our parser splits the cron string into minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-7, 0/7=Sun).",
                codeSnippet: "┌ min (0-59) ┌ hour (0-23) ┌ dom ┌ mon ┌ dow",
              },
              {
                title: "2. Expression Expansion & Humanizer",
                content:
                  "Special characters (*, /, -, ,) are parsed into natural language schedules (e.g. '*/15 * * * *' translates to 'Every 15 minutes').",
                codeSnippet: "Schedule: Every 15 minutes",
              },
              {
                title: "3. Future Iteration Projection",
                content:
                  "We calculate the next 10 consecutive UTC execution timestamps to guarantee daylight saving time (DST) and leap year schedule accuracy.",
                codeSnippet: "Next Run: 2026-08-28 22:30:00 UTC",
              },
            ]}
            useCasesTitle="Common Cron Pitfalls & How to Avoid Them"
            useCases={[
              {
                title: "Silent Job Crashes & Missing Heartbeats",
                description:
                  "Cron jobs fail silently when OOM killed or when background script exceptions occur. SteadyStack heartbeat monitors alert you if a cron job misses its scheduled window.",
                badge: "Silent Failure",
              },
              {
                title: "Overlapping Executions (Thundering Herd)",
                description:
                  "If a backup job scheduled every 5 minutes takes 7 minutes to complete, concurrent runs can exhaust server CPU and database locks without flock or lockfiles.",
                badge: "Concurrency",
              },
              {
                title: "UTC vs Local Timezone & DST Shifts",
                description:
                  "Servers running in UTC will run 0 2 * * * at 2:00 AM UTC, which shifts by an hour relative to local time when daylight saving time changes.",
                badge: "Timezone",
              },
              {
                title: "Missing PATH in Cron Environment",
                description:
                  "Cron daemon executions do not inherit your user shell's .bashrc or .zshrc PATH, causing commands like 'node' or 'docker' to fail with 'command not found'.",
                badge: "Env Gap",
              },
            ]}
            faqs={[
              {
                question: "What does */5 * * * * mean in cron?",
                answer:
                  "It runs the command every 5 minutes (at minute 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55).",
              },
              {
                question: "How do I prevent cron jobs from running simultaneously?",
                answer:
                  "Use utility wrappers like 'flock -n /var/lock/myjob.lock /path/to/script.sh' to prevent a new instance from launching if the previous one is still executing.",
              },
              {
                question: "What is a Cron Heartbeat / Dead Man's Snitch monitor?",
                answer:
                  "Instead of pinging a server, a heartbeat monitor expects your script to send an HTTP GET/POST ping to a unique URL when it completes. If the ping is not received on time, an alert is sent.",
              },
              {
                question: "Can SteadyStack monitor my scheduled tasks and cron jobs?",
                answer:
                  "Yes. SteadyStack provides Cron Heartbeat sentinels with customizable grace periods, notifying you the moment a background worker, queue consumer, or backup script fails to report in.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
