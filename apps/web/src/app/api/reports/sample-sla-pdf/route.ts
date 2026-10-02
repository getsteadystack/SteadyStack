import { NextResponse } from "next/server";
import { renderSlaReportToBuffer, type SlaReportData } from "@steadystack/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sampleData: SlaReportData = {
      reportId: "SLA-SAMPLE-202609-APEX",
      generatedAt: "2026-09-30 18:00:00 UTC",
      agencyName: "Apex Digital Agency",
      clientName: "Acme Commerce LLC",
      scopeName: "Production Infrastructure & API Mesh",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      targetSla: 99.9,
      actualUptime: 99.982,
      isSlaMet: true,
      totalMonitoredMinutes: 43200,
      allowedDowntimeMinutes: 43.2,
      consumedDowntimeMinutes: 7.8,
      remainingErrorBudgetPct: 81.9,
      totalChecks: 172800,
      totalIncidents: 1,
      mttrMinutes: 4.2,
      mttdSeconds: 12,
      avgLatencyMs: 38.4,
      p95LatencyMs: 72.1,
      p99LatencyMs: 118.6,
      notes:
        "All client SLA thresholds were exceeded during the September 2026 audit window. Quorum consensus in 4-of-7 regions prevented 2 false alarm triggers from regional upstream transit blips.",
      services: [
        {
          id: "srv-storefront",
          name: "Web Storefront & Landing Pages",
          type: "HTTP/HTTPS",
          checks: 43200,
          uptimePct: 99.992,
          downtimeMinutes: 3.5,
          status: "PASS",
        },
        {
          id: "srv-checkout",
          name: "Checkout & Cart Engine",
          type: "HTTP/HTTPS",
          checks: 43200,
          uptimePct: 100.0,
          downtimeMinutes: 0.0,
          status: "PASS",
        },
        {
          id: "srv-auth",
          name: "Customer Auth & Accounts API",
          type: "HTTP/JSON",
          checks: 43200,
          uptimePct: 99.981,
          downtimeMinutes: 4.3,
          status: "PASS",
        },
        {
          id: "srv-payment",
          name: "Stripe & Payment Webhook Ingress",
          type: "WEBHOOK",
          checks: 43200,
          uptimePct: 100.0,
          downtimeMinutes: 0.0,
          status: "PASS",
        },
      ],
      incidents: [
        {
          id: "INC-20260918-01",
          startedAt: "2026-09-18 14:22 UTC",
          durationMinutes: 4.2,
          serviceName: "Customer Auth & Accounts API",
          reason:
            "Postgres connection pool saturation during midday flash sale. Auto-scaling pool expanded capacity; 5-of-7 regional probes confirmed recovery.",
          status: "RESOLVED",
        },
      ],
      dailyBreakdown: Array.from({ length: 30 }).map((_, idx) => {
        const day = (idx + 1).toString().padStart(2, "0");
        const isIncidentDay = idx === 17;
        return {
          date: `2026-09-${day}`,
          checksTotal: 5760,
          uptimePct: isIncidentDay ? 99.71 : 100.0,
          downDuration: isIncidentDay ? 4.2 : 0,
        };
      }),
    };

    const pdfBuffer = await renderSlaReportToBuffer(sampleData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="steadystack-sample-client-sla-report.pdf"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[Sample-SLA-PDF-API] Error generating sample PDF:", error);
    return new NextResponse(
      JSON.stringify({
        error: error?.message || "Failed to render sample SLA report PDF",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
