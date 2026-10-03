"use server";

import db from "@steadystack/db";
import { LTD_CONFIG } from "@/lib/ltd-config";

export interface LtdStatsResponse {
  totalCap: number;
  claimedCount: number;
  remaining: number;
  isSoldOut: boolean;
  percentage: number;
}

/**
 * Returns dynamic live statistics on claimed Lifetime Deal slots from the database.
 */
export async function getLtdStatsAction(): Promise<LtdStatsResponse> {
  try {
    // Count active lifetime subscriptions from Stripe
    const lifetimeSubs = await db.subscription.count({
      where: {
        isLifetime: true,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
    });

    // Count redeemed AppSumo lifetime codes
    const redeemedLicenses = await db.appSumoLicense.count({
      where: {
        status: "REDEEMED",
      },
    });

    // Optional environment-configured baseline offset if desired
    const baseline = Number.parseInt(process.env.LTD_CLAIMED_BASELINE || "0", 10);
    const totalClaimed = Math.min(LTD_CONFIG.totalCap, baseline + lifetimeSubs + redeemedLicenses);

    const isSoldOut =
      process.env.NEXT_PUBLIC_LTD_SOLD_OUT === "true" || totalClaimed >= LTD_CONFIG.totalCap;

    return {
      totalCap: LTD_CONFIG.totalCap,
      claimedCount: totalClaimed,
      remaining: Math.max(0, LTD_CONFIG.totalCap - totalClaimed),
      isSoldOut,
      percentage: Math.min(100, Math.round((totalClaimed / LTD_CONFIG.totalCap) * 100)),
    };
  } catch (error) {
    console.error("[LTD Stats Action] Failed to compute live stats:", error);
    const isSoldOut = process.env.NEXT_PUBLIC_LTD_SOLD_OUT === "true";
    return {
      totalCap: LTD_CONFIG.totalCap,
      claimedCount: 0,
      remaining: LTD_CONFIG.totalCap,
      isSoldOut,
      percentage: 0,
    };
  }
}
