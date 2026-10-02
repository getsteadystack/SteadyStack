import { NextRequest, NextResponse } from "next/server";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { buildClientSlaReportData } from "@/actions/client-reports";
import { renderSlaReportToBuffer } from "@steadystack/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  const range = (req.nextUrl.searchParams.get("range") as any) || "30d";

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  try {
    const { client, reportData } = await buildClientSlaReportData(clientId, session.user.id, {
      range,
    });

    const pdfBuffer = await renderSlaReportToBuffer(reportData);

    const safeName = client.name.replaceAll(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `SLA-Report-${safeName}-${reportData.startDate}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[client-pdf API] Error generating PDF:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate client PDF" },
      { status: 500 },
    );
  }
}
