import type { Metadata } from "next";
import { UptimeReportLeadMagnet } from "@/components/templates/uptime-report-lead-magnet";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Agency Uptime Report Template (Google Sheets & PDF) | SteadyStack",
  description:
    "Free agency client uptime & SLA report template in Google Sheets and printable PDF. Structure client retainer reviews, calculate SLA compliance, and justify $500–$2,500/mo contracts.",
  alternates: {
    canonical: "https://steadystack.dev/templates/uptime-report",
  },
  openGraph: {
    title: "Free Agency Uptime Report Template (Google Sheets & PDF) | SteadyStack",
    description:
      "Free agency client uptime & SLA report template in Google Sheets and printable PDF. Calculate SLA compliance and automate client reporting.",
    url: "https://steadystack.dev/templates/uptime-report",
    siteName: "SteadyStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Agency Uptime Report Template | SteadyStack",
    description:
      "Free agency client uptime & SLA report template in Google Sheets and PDF. Automate monthly client retainers with SteadyStack.",
  },
};

export default function UptimeReportTemplatePage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <UptimeReportLeadMagnet />
      </div>
    </div>
  );
}
