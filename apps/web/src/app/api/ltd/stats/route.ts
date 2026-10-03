import { NextResponse } from "next/server";
import { getLtdStatsAction } from "@/actions/ltd";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const stats = await getLtdStatsAction();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
