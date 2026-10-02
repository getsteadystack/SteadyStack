"use server";

import { z } from "zod";
import prisma from "@steadystack/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@steadystack/auth";
import { getAdminStatus } from "./admin";
import { createStripePromotionCode, createStripeRenewalDiscountCode } from "@/lib/stripe";

const designPartnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid work email"),
  company: z.string().optional().default("Indie / Personal"),
  website: z.string().url("Please enter a valid URL (e.g. https://yourcompany.com)"),
  monitorsCount: z.string().default("10-50"),
  currentTool: z.string().default("UptimeRobot"),
  techStack: z.string().optional().default("Next.js / Cloudflare / Node"),
  socialHandle: z.string().optional().default(""),
  painPoint: z.string().optional().default(""),
  feedbackCommitment: z.boolean().refine((val) => val === true, {
    message: "You must agree to the feedback commitment to join",
  }),
});

export type DesignPartnerInput = z.infer<typeof designPartnerSchema>;

export interface DesignPartnerRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  monitorsCount: string;
  currentTool: string;
  techStack?: string;
  socialHandle?: string;
  painPoint?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  vipCode?: string;
  stripePromoId?: string;
  stripeSynced?: boolean;
  renewalDiscountCode?: string;
  renewalDiscountPercent?: number;
  userId?: string | null;
  redeemedAt?: string | null;
  redeemedByUserId?: string | null;
  redeemedByEmail?: string | null;
  createdAt: string;
}

export interface DesignPartnerResponse {
  success: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  vipCode?: string;
  remainingSpots?: number;
  message?: string;
  error?: string;
}

export interface DesignPartnerSpotsInfo {
  totalSpots: number;
  claimedSpots: number;
  approvedSpots: number;
  pendingSpots: number;
  redeemedSpots: number;
  remainingSpots: number;
}

const TOTAL_PARTNER_SPOTS = 15;
const DESIGN_PARTNER_IDENTIFIER = "design_partner_application";

/**
 * Get count of spots remaining, approved, pending, and redeemed
 */
export async function getDesignPartnerSpots(): Promise<DesignPartnerSpotsInfo> {
  try {
    const records = await prisma.verification.findMany({
      where: { identifier: DESIGN_PARTNER_IDENTIFIER },
    });

    let approvedCount = 0;
    let pendingCount = 0;
    let redeemedCount = 0;

    for (const record of records) {
      try {
        const data = JSON.parse(record.value) as DesignPartnerRecord;
        if (data.status === "APPROVED") {
          approvedCount++;
          if (data.redeemedAt || data.redeemedByUserId) {
            redeemedCount++;
          }
        } else if (data.status === "PENDING") {
          pendingCount++;
        }
      } catch {}
    }

    const remainingSpots = Math.max(1, TOTAL_PARTNER_SPOTS - approvedCount);

    return {
      totalSpots: TOTAL_PARTNER_SPOTS,
      claimedSpots: approvedCount,
      approvedSpots: approvedCount,
      pendingSpots: pendingCount,
      redeemedSpots: redeemedCount,
      remainingSpots,
    };
  } catch (error) {
    console.error("Failed to query design partner spots from DB:", error);
    return {
      totalSpots: TOTAL_PARTNER_SPOTS,
      claimedSpots: 0,
      approvedSpots: 0,
      pendingSpots: 0,
      redeemedSpots: 0,
      remainingSpots: TOTAL_PARTNER_SPOTS,
    };
  }
}

function generateVipCode(): string {
  const hex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VIP-PARTNER-2026-${hex}`;
}

/**
 * Submit a new Design Partner application (Status defaults to PENDING under review)
 */
export async function submitDesignPartnerApplication(
  input: DesignPartnerInput,
): Promise<DesignPartnerResponse> {
  try {
    const parsed = designPartnerSchema.parse(input);

    let session: any = null;
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    } catch {}

    const recordId = `dp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload: DesignPartnerRecord = {
      id: recordId,
      name: parsed.name,
      email: parsed.email,
      company: parsed.company || "Indie / Personal",
      website: parsed.website,
      monitorsCount: parsed.monitorsCount,
      currentTool: parsed.currentTool,
      techStack: parsed.techStack || "Next.js / Cloudflare / Node",
      socialHandle: parsed.socialHandle || "",
      painPoint: parsed.painPoint || "",
      status: "PENDING",
      userId: session?.user?.id || null,
      createdAt: new Date().toISOString(),
    };

    // Persist PENDING application in Prisma database
    await prisma.verification.create({
      data: {
        id: recordId,
        identifier: DESIGN_PARTNER_IDENTIFIER,
        value: JSON.stringify(payload),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    const spotsInfo = await getDesignPartnerSpots();

    console.log(`[DesignPartner] New Application Submitted (PENDING):`, payload);

    revalidatePath("/design-partners");
    revalidatePath("/dashboard/design-partners");

    return {
      success: true,
      status: "PENDING",
      vipCode: recordId,
      remainingSpots: spotsInfo.remainingSpots,
      message:
        "Application submitted successfully! Our founding team will review your application within 24 hours.",
    };
  } catch (error: any) {
    console.error("Failed to submit design partner application:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return {
      success: false,
      error: error.message || "Failed to process application. Please try again.",
    };
  }
}

/**
 * Fetch all design partner applications for admin review
 */
export async function getAllDesignPartnerApplications(): Promise<DesignPartnerRecord[]> {
  try {
    const records = await prisma.verification.findMany({
      where: { identifier: DESIGN_PARTNER_IDENTIFIER },
      orderBy: { createdAt: "desc" },
    });

    const list: DesignPartnerRecord[] = [];
    for (const r of records) {
      try {
        const data = JSON.parse(r.value);
        list.push({
          id: r.id,
          name: data.name || "Unknown",
          email: data.email || "",
          company: data.company || "Indie / Personal",
          website: data.website || "",
          monitorsCount: data.monitorsCount || "10-50",
          currentTool: data.currentTool || "UptimeRobot",
          techStack: data.techStack || "Next.js / Cloudflare / Node",
          socialHandle: data.socialHandle || "",
          painPoint: data.painPoint || "",
          status: data.status || "PENDING",
          vipCode: data.vipCode,
          stripePromoId: data.stripePromoId,
          stripeSynced: data.stripeSynced ?? Boolean(data.stripePromoId),
          renewalDiscountCode: data.renewalDiscountCode,
          renewalDiscountPercent: data.renewalDiscountPercent,
          userId: data.userId,
          redeemedAt: data.redeemedAt || null,
          redeemedByUserId: data.redeemedByUserId || null,
          redeemedByEmail: data.redeemedByEmail || null,
          createdAt: data.createdAt || r.createdAt.toISOString(),
        });
      } catch {}
    }

    return list;
  } catch (error) {
    console.error("Failed to fetch design partner applications:", error);
    return [];
  }
}

/**
 * Check application status by email, applicant ID, or VIP Code
 */
export async function checkDesignPartnerStatus(query: string): Promise<{
  found: boolean;
  record?: {
    id: string;
    name: string;
    company: string;
    website: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    vipCode?: string;
    redeemedAt?: string | null;
    createdAt: string;
  };
  error?: string;
}> {
  try {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return {
        found: false,
        error: "Please enter your email or application reference ID",
      };
    }

    const records = await prisma.verification.findMany({
      where: { identifier: DESIGN_PARTNER_IDENTIFIER },
    });

    for (const r of records) {
      try {
        const data = JSON.parse(r.value) as DesignPartnerRecord;
        const matchesEmail = data.email?.toLowerCase() === cleanQuery;
        const matchesId =
          r.id.toLowerCase() === cleanQuery || data.id?.toLowerCase() === cleanQuery;
        const matchesVip = data.vipCode?.toLowerCase() === cleanQuery;

        if (matchesEmail || matchesId || matchesVip) {
          return {
            found: true,
            record: {
              id: r.id,
              name: data.name,
              company: data.company,
              website: data.website,
              status: data.status,
              vipCode: data.vipCode,
              redeemedAt: data.redeemedAt,
              createdAt: data.createdAt || r.createdAt.toISOString(),
            },
          };
        }
      } catch {}
    }

    return {
      found: false,
      error: "No matching application found. Please check your email or ID.",
    };
  } catch (error: any) {
    console.error("Failed to lookup design partner status:", error);
    return { found: false, error: "Failed to search applications" };
  }
}

/**
 * Approve a pending design partner application (Requires Admin role)
 */
export async function approveDesignPartnerApplication(
  id: string,
): Promise<{ success: boolean; vipCode?: string; error?: string }> {
  try {
    const admin = await getAdminStatus();
    if (!admin.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required to approve design partners",
      };
    }

    const record = await prisma.verification.findUnique({
      where: { id },
    });

    if (!record) {
      return { success: false, error: "Application not found" };
    }

    const data: DesignPartnerRecord = JSON.parse(record.value);
    const vipCode = data.vipCode || generateVipCode();

    // Automatically synchronize promotion code in Stripe via Stripe SDK
    let stripePromoId: string | undefined = data.stripePromoId;
    let stripeSynced = data.stripeSynced ?? false;

    try {
      const stripePromo = await createStripePromotionCode({
        code: vipCode,
        percentOff: 100,
        durationMonths: 12,
        maxRedemptions: 1,
        metadata: {
          partnerId: record.id,
          applicantEmail: data.email,
          applicantName: data.name,
        },
      });
      stripePromoId = stripePromo.id;
      stripeSynced = !stripePromo.isMock;
    } catch (stripeErr) {
      console.warn("[DesignPartner] Note on Stripe promotion code sync:", stripeErr);
    }

    data.status = "APPROVED";
    data.vipCode = vipCode;
    data.stripePromoId = stripePromoId;
    data.stripeSynced = stripeSynced;

    // Update database verification record
    await prisma.verification.update({
      where: { id },
      data: {
        value: JSON.stringify(data),
      },
    });

    // If there is an associated registered user, upgrade their tier to NETRUNNER (Pro) for 1 year
    if (data.userId) {
      try {
        await prisma.user.update({
          where: { id: data.userId },
          data: { tier: "NETRUNNER" },
        });

        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await prisma.subscription.upsert({
          where: { userId: data.userId },
          create: {
            userId: data.userId,
            plan: "NETRUNNER",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: oneYearFromNow,
            tierVersion: "design_partner_vip",
          },
          update: {
            plan: "NETRUNNER",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: oneYearFromNow,
            tierVersion: "design_partner_vip",
          },
        });
      } catch (err) {
        console.warn("Failed to upgrade user tier on approval:", err);
      }
    }

    console.log(
      `[DesignPartner] Application APPROVED for ${data.email}. VIP Code: ${vipCode} (Stripe: ${stripeSynced ? "LIVE SYNCED" : "MOCK/SAVED"})`,
    );

    revalidatePath("/dashboard/design-partners");
    revalidatePath("/design-partners");
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      vipCode,
    };
  } catch (error: any) {
    console.error("Failed to approve application:", error);
    return {
      success: false,
      error: error.message || "Failed to approve application",
    };
  }
}

/**
 * Generate a post-year renewal loyalty discount code via Stripe SDK (Admin only)
 */
export async function generatePartnerRenewalDiscount(
  id: string,
  percentOff: number = 50,
): Promise<{
  success: boolean;
  discountCode?: string;
  percentOff?: number;
  isMock?: boolean;
  error?: string;
}> {
  try {
    const admin = await getAdminStatus();
    if (!admin.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required to generate renewal codes",
      };
    }

    const record = await prisma.verification.findUnique({
      where: { id },
    });

    if (!record) {
      return { success: false, error: "Partner application not found" };
    }

    const data: DesignPartnerRecord = JSON.parse(record.value);
    if (data.status !== "APPROVED") {
      return {
        success: false,
        error: "Renewal discount codes can only be generated for APPROVED design partners",
      };
    }

    const renewalResult = await createStripeRenewalDiscountCode({
      applicantEmail: data.email,
      partnerId: record.id,
      percentOff,
      durationMonths: 12,
    });

    data.renewalDiscountCode = renewalResult.code;
    data.renewalDiscountPercent = percentOff;

    await prisma.verification.update({
      where: { id },
      data: {
        value: JSON.stringify(data),
      },
    });

    console.log(
      `[DesignPartner] Generated Renewal Discount Code ${renewalResult.code} (${percentOff}% off) for ${data.email}`,
    );

    revalidatePath("/dashboard/design-partners");

    return {
      success: true,
      discountCode: renewalResult.code,
      percentOff,
      isMock: renewalResult.isMock,
    };
  } catch (error: any) {
    console.error("Failed to generate renewal discount code:", error);
    return {
      success: false,
      error: error.message || "Failed to generate renewal discount code",
    };
  }
}

/**
 * Reject a design partner application (Requires Admin role)
 */
export async function rejectDesignPartnerApplication(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminStatus();
    if (!admin.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required to reject design partners",
      };
    }

    const record = await prisma.verification.findUnique({
      where: { id },
    });

    if (!record) {
      return { success: false, error: "Application not found" };
    }

    const data: DesignPartnerRecord = JSON.parse(record.value);
    data.status = "REJECTED";

    await prisma.verification.update({
      where: { id },
      data: {
        value: JSON.stringify(data),
      },
    });

    console.log(`[DesignPartner] Application REJECTED for ${data.email}`);

    revalidatePath("/dashboard/design-partners");
    revalidatePath("/design-partners");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject application:", error);
    return {
      success: false,
      error: error.message || "Failed to reject application",
    };
  }
}

/**
 * Delete a design partner application (Requires Admin role)
 */
export async function deleteDesignPartnerApplication(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminStatus();
    if (!admin.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required to delete applications",
      };
    }

    await prisma.verification.delete({
      where: { id },
    });

    revalidatePath("/dashboard/design-partners");
    revalidatePath("/design-partners");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete application:", error);
    return {
      success: false,
      error: error.message || "Failed to delete application",
    };
  }
}

/**
 * Redeem a VIP Design Partner License Code to activate 1-Year Netrunner Pro
 */
export async function redeemDesignPartnerCode(
  rawCode: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to redeem a VIP Partner license key.",
      };
    }

    const code = rawCode.trim().toUpperCase();
    if (!code || !code.startsWith("VIP-PARTNER-")) {
      return {
        success: false,
        error: "Invalid VIP Code format. Must start with 'VIP-PARTNER-'",
      };
    }

    // Find the verification application with this VIP code
    const records = await prisma.verification.findMany({
      where: { identifier: DESIGN_PARTNER_IDENTIFIER },
    });

    let matchedRecord: (typeof records)[0] | null = null;
    let matchedData: DesignPartnerRecord | null = null;

    for (const r of records) {
      try {
        const d = JSON.parse(r.value) as DesignPartnerRecord;
        if (d.vipCode && d.vipCode.trim().toUpperCase() === code) {
          matchedRecord = r;
          matchedData = d;
          break;
        }
      } catch {}
    }

    if (!matchedRecord || !matchedData) {
      return {
        success: false,
        error: "VIP license key not found. Please verify your code or contact support.",
      };
    }

    if (matchedData.status !== "APPROVED") {
      return {
        success: false,
        error: `This application status is currently ${matchedData.status}. Only APPROVED codes can be redeemed.`,
      };
    }

    // Check if already redeemed by another user
    if (matchedData.redeemedByUserId && matchedData.redeemedByUserId !== session.user.id) {
      return {
        success: false,
        error: "This VIP license key has already been activated by another account.",
      };
    }

    // Grant 1 Year (365 days) Netrunner Pro to the current user
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Update User model tier
    await prisma.user.update({
      where: { id: session.user.id },
      data: { tier: "NETRUNNER" },
    });

    // Upsert subscription record with ACTIVE status for 365 days
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: "NETRUNNER",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: oneYearFromNow,
        tierVersion: "design_partner_vip",
      },
      update: {
        plan: "NETRUNNER",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: oneYearFromNow,
        tierVersion: "design_partner_vip",
      },
    });

    // Update verification record metadata to record redemption
    matchedData.redeemedAt = new Date().toISOString();
    matchedData.redeemedByUserId = session.user.id;
    matchedData.redeemedByEmail = session.user.email || null;

    await prisma.verification.update({
      where: { id: matchedRecord.id },
      data: {
        value: JSON.stringify(matchedData),
      },
    });

    console.log(
      `[DesignPartner] VIP Code ${code} REDEEMED by User ${session.user.id} (${session.user.email}). 1-Year Netrunner Pro granted until ${oneYearFromNow.toISOString()}.`,
    );

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/design-partners");

    return {
      success: true,
      message:
        "VIP Partner License activated successfully! 1-Year Agency Plan ($348 Value) is now active on your account.",
    };
  } catch (error: any) {
    console.error("Failed to redeem VIP design partner code:", error);
    return {
      success: false,
      error: error.message || "Failed to redeem VIP code. Please try again.",
    };
  }
}

/**
 * Force sync/re-sync a partner's VIP code into Stripe as a live Coupon and Promotion Code
 */
export async function syncPartnerToStripe(id: string): Promise<{
  success: boolean;
  stripePromoId?: string;
  isMock?: boolean;
  error?: string;
}> {
  try {
    const admin = await getAdminStatus();
    if (!admin.isAdmin) {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    const record = await prisma.verification.findUnique({
      where: { id },
    });

    if (!record) {
      return { success: false, error: "Application not found" };
    }

    const data: DesignPartnerRecord = JSON.parse(record.value);
    const vipCode = data.vipCode || generateVipCode();

    const stripePromo = await createStripePromotionCode({
      code: vipCode,
      percentOff: 100,
      durationMonths: 12,
      maxRedemptions: 1,
      metadata: {
        partnerId: record.id,
        applicantEmail: data.email,
        applicantName: data.name,
      },
    });

    data.vipCode = vipCode;
    data.stripePromoId = stripePromo.id;
    data.stripeSynced = !stripePromo.isMock;

    await prisma.verification.update({
      where: { id },
      data: {
        value: JSON.stringify(data),
      },
    });

    revalidatePath("/dashboard/design-partners");

    return {
      success: true,
      stripePromoId: stripePromo.id,
      isMock: stripePromo.isMock,
    };
  } catch (error: any) {
    console.error("Failed to sync partner to Stripe:", error);
    return {
      success: false,
      error: error.message || "Failed to sync coupon to Stripe",
    };
  }
}

/**
 * Force sync all approved partners' VIP codes into Stripe in batch
 */
export async function syncAllPartnersToStripe(): Promise<{
  success: boolean;
  syncedCount: number;
  failedCount: number;
  error?: string;
}> {
  try {
    const admin = await getAdminStatus();
    if (!admin.isAdmin) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        error: "Unauthorized: Admin access required",
      };
    }

    const records = await prisma.verification.findMany({
      where: { identifier: DESIGN_PARTNER_IDENTIFIER },
    });

    let syncedCount = 0;
    let failedCount = 0;

    for (const record of records) {
      try {
        const data: DesignPartnerRecord = JSON.parse(record.value);
        if (data.status === "APPROVED") {
          const vipCode = data.vipCode || generateVipCode();
          const stripePromo = await createStripePromotionCode({
            code: vipCode,
            percentOff: 100,
            durationMonths: 12,
            maxRedemptions: 1,
            metadata: {
              partnerId: record.id,
              applicantEmail: data.email,
              applicantName: data.name,
            },
          });

          data.vipCode = vipCode;
          data.stripePromoId = stripePromo.id;
          data.stripeSynced = !stripePromo.isMock;

          await prisma.verification.update({
            where: { id: record.id },
            data: {
              value: JSON.stringify(data),
            },
          });
          syncedCount++;
        }
      } catch (err) {
        console.error(`Failed to sync partner ${record.id} to Stripe:`, err);
        failedCount++;
      }
    }

    revalidatePath("/dashboard/design-partners");
    return { success: true, syncedCount, failedCount };
  } catch (error: any) {
    console.error("Failed to batch sync partners to Stripe:", error);
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      error: error.message || "Failed to batch sync to Stripe",
    };
  }
}
