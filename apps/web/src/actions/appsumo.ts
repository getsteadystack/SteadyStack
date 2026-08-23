"use server";

import { auth } from "@steadystack/auth";
import db from "@steadystack/db";
import { headers } from "next/headers";
import { PLANS, getPlanLimits, type PlanTier } from "@/lib/billing";
import { revalidatePath } from "next/cache";

export interface RedeemResult {
  success: boolean;
  error?: string;
  tier?: number;
  plan?: PlanTier;
  tierVersion?: string;
  message?: string;
}

/**
 * Validates and redeems an AppSumo lifetime deal code for the authenticated user.
 */
export async function redeemAppSumoCode(codeRaw: string): Promise<RedeemResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to redeem an AppSumo license code.",
    };
  }

  const userId = session.user.id;
  const code = (codeRaw || "").trim().toUpperCase();

  if (!code || code.length < 5) {
    return {
      success: false,
      error: "Please enter a valid AppSumo redemption code.",
    };
  }

  try {
    // 1. Look up if code already exists in DB
    let license = await db.appSumoLicense.findUnique({
      where: { code },
    });

    let tier = 1;

    if (license) {
      if (license.status === "REDEEMED") {
        if (license.userId === userId) {
          return {
            success: true,
            tier: license.tier,
            plan: license.tier === 3 ? "CONSTRUCT" : "NETRUNNER",
            tierVersion: `appsumo_tier_${license.tier}`,
            message: `You have already activated this AppSumo Tier ${license.tier} license.`,
          };
        }
        return {
          success: false,
          error: "This AppSumo code has already been redeemed by another account.",
        };
      }

      if (license.status === "REVOKED" || license.status === "REFUNDED") {
        return {
          success: false,
          error: "This AppSumo code has been refunded or deactivated.",
        };
      }

      tier = license.tier;
    } else {
      // 2. If code wasn't pre-loaded, detect tier from code naming convention or accept valid pattern
      // Supported patterns: SUMO-T3-XXXX, SUMO-T2-XXXX, SUMO-T1-XXXX, APPSUMO-3-XXXX, etc.
      if (
        code.includes("-T3-") ||
        code.includes("-TIER3-") ||
        code.startsWith("SUMO3-") ||
        code.startsWith("APPSUMO-3-")
      ) {
        tier = 3;
      } else if (
        code.includes("-T2-") ||
        code.includes("-TIER2-") ||
        code.startsWith("SUMO2-") ||
        code.startsWith("APPSUMO-2-")
      ) {
        tier = 2;
      } else {
        tier = 1;
      }

      // Create the license record dynamically
      license = await db.appSumoLicense.create({
        data: {
          code,
          tier,
          plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
          status: "ACTIVE",
        },
      });
    }

    // 3. Calculate stacked tier if user is adding multiple codes
    const previousRedeemedCount = await db.appSumoLicense.count({
      where: { userId, status: "REDEEMED" },
    });

    const stackedTier = Math.min(3, Math.max(tier, previousRedeemedCount + 1));
    const targetPlan: PlanTier = stackedTier === 3 ? "CONSTRUCT" : "NETRUNNER";
    const tierVersion = `appsumo_tier_${stackedTier}`;

    // 4. Update or create user subscription with lifetime flags
    const existingSubscription = await db.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      await db.subscription.update({
        where: { userId },
        data: {
          plan: targetPlan,
          status: "ACTIVE",
          tierVersion,
          appsumoTier: stackedTier,
          isLifetime: true,
          currentPeriodEnd: null,
          trialEndsAt: null,
          cancelAtPeriodEnd: false,
        },
      });
    } else {
      await db.subscription.create({
        data: {
          userId,
          plan: targetPlan,
          status: "ACTIVE",
          tierVersion,
          appsumoTier: stackedTier,
          isLifetime: true,
          currentPeriodEnd: null,
          trialEndsAt: null,
          cancelAtPeriodEnd: false,
        },
      });
    }

    // 5. Update user tier
    await db.user.update({
      where: { id: userId },
      data: {
        tier: targetPlan,
      },
    });

    // 6. Mark license as redeemed
    await db.appSumoLicense.update({
      where: { id: license.id },
      data: {
        status: "REDEEMED",
        userId,
        redeemedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/redeem");

    const message =
      previousRedeemedCount > 0
        ? `Code stacked successfully! Your account is upgraded to AppSumo Tier ${stackedTier} Lifetime (${previousRedeemedCount + 1} codes applied).`
        : `AppSumo Tier ${stackedTier} Lifetime Deal redeemed successfully!`;

    return {
      success: true,
      tier: stackedTier,
      plan: targetPlan,
      tierVersion,
      message,
    };
  } catch (error: any) {
    console.error("Failed to redeem AppSumo code:", error);
    return {
      success: false,
      error: error?.message || "An unexpected error occurred while redeeming your code.",
    };
  }
}

/**
 * Returns current user's AppSumo lifetime license information, if any.
 */
export async function getAppSumoLicenseDetails() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { isAppSumo: false, license: null };
  }

  const userId = session.user.id;

  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    const license = await db.appSumoLicense.findFirst({
      where: { userId, status: "REDEEMED" },
      orderBy: { redeemedAt: "desc" },
    });

    if (subscription?.isLifetime || subscription?.appsumoTier || license) {
      const tier = subscription?.appsumoTier || license?.tier || 1;
      const plan = (subscription?.plan || (tier === 3 ? "CONSTRUCT" : "NETRUNNER")) as PlanTier;
      const limits = getPlanLimits(plan, `appsumo_tier_${tier}`);

      return {
        isAppSumo: true,
        tier,
        code: license?.code || "LIFETIME_DEAL",
        redeemedAt: license?.redeemedAt || subscription?.createdAt,
        plan,
        limits,
      };
    }

    return { isAppSumo: false, license: null };
  } catch (error) {
    console.error("Failed to fetch AppSumo license details:", error);
    return { isAppSumo: false, license: null };
  }
}

/**
 * Batch generate redemption codes for AppSumo CSV upload (Admin only).
 */
export async function generateAppSumoBatchCodes(params: {
  tier: number;
  count: number;
  prefix?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, tier: true },
  });

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin =
    user?.tier === "ADMIN" || (user?.email && adminEmails.includes(user.email.toLowerCase()));

  if (!isAdmin) {
    throw new Error("Forbidden: Admin privileges required.");
  }

  const { tier, count, prefix = "SUMO" } = params;
  const codes: string[] = [];

  const crypto = await import("crypto");

  for (let i = 0; i < count; i++) {
    const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
    const code = `${prefix}-T${tier}-${rand}`;
    codes.push(code);
  }

  await db.appSumoLicense.createMany({
    data: codes.map((code) => ({
      code,
      tier,
      plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
      status: "ACTIVE",
    })),
    skipDuplicates: true,
  });

  return { success: true, count: codes.length, codes };
}
