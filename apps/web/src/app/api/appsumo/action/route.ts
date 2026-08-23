import { NextRequest, NextResponse } from "next/server";
import db from "@steadystack/db";

/**
 * AppSumo Partner Actions Webhook API.
 * Handles automatic activations, upgrades, downgrades, and refunds from AppSumo's platform.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const appsumoSecret = process.env.APPSUMO_PARTNER_SECRET;

    if (appsumoSecret && authHeader !== `Bearer ${appsumoSecret}`) {
      return NextResponse.json({ error: "Unauthorized partner token" }, { status: 401 });
    }

    const body: any = await req.json().catch(() => ({}));
    const { action, plan_id, invoice_item_uuid, uuid } = body;

    // Supported AppSumo payload formats
    const code = (body.code || invoice_item_uuid || uuid || "").toString().trim().toUpperCase();
    const tierNumber = Number(plan_id?.replace(/[^0-9]/g, "") || body.tier || 1);
    const tier = Math.min(Math.max(tierNumber, 1), 3);

    switch (action) {
      case "activate": {
        if (!code) {
          return NextResponse.json({ message: "Activation code is required" }, { status: 400 });
        }

        const existing = await db.appSumoLicense.findUnique({
          where: { code },
        });

        if (existing && existing.status === "REDEEMED") {
          return NextResponse.json(
            { message: "License already activated", status: "success" },
            { status: 200 },
          );
        }

        if (existing) {
          await db.appSumoLicense.update({
            where: { code },
            data: {
              tier,
              plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
              status: "ACTIVE",
              invoiceId: invoice_item_uuid || null,
            },
          });
        } else {
          await db.appSumoLicense.create({
            data: {
              code,
              tier,
              plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
              status: "ACTIVE",
              invoiceId: invoice_item_uuid || null,
            },
          });
        }

        return NextResponse.json({
          status: "success",
          message: `AppSumo Tier ${tier} code ready for redemption`,
          redirect_url: `https://steadystack.dev/redeem?code=${encodeURIComponent(code)}`,
        });
      }

      case "upgrade":
      case "downgrade": {
        const license = await db.appSumoLicense.findUnique({
          where: { code },
        });

        if (!license) {
          return NextResponse.json({ message: "License code not found" }, { status: 404 });
        }

        await db.appSumoLicense.update({
          where: { code },
          data: {
            tier,
            plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
          },
        });

        if (license.userId) {
          const targetPlan = tier === 3 ? "CONSTRUCT" : "NETRUNNER";
          const tierVersion = `appsumo_tier_${tier}`;

          await db.subscription.update({
            where: { userId: license.userId },
            data: {
              plan: targetPlan,
              tierVersion,
              appsumoTier: tier,
              isLifetime: true,
            },
          });

          await db.user.update({
            where: { id: license.userId },
            data: { tier: targetPlan },
          });
        }

        return NextResponse.json({
          status: "success",
          message: `License updated to Tier ${tier}`,
        });
      }

      case "refund": {
        const license = await db.appSumoLicense.findUnique({
          where: { code },
        });

        if (!license) {
          return NextResponse.json({ message: "License code not found" }, { status: 404 });
        }

        await db.appSumoLicense.update({
          where: { code },
          data: {
            status: "REFUNDED",
          },
        });

        if (license.userId) {
          await db.subscription.update({
            where: { userId: license.userId },
            data: {
              plan: "INITIATE",
              tierVersion: "v1_launch",
              appsumoTier: null,
              isLifetime: false,
              status: "CANCELED",
            },
          });

          await db.user.update({
            where: { id: license.userId },
            data: { tier: "INITIATE" },
          });
        }

        return NextResponse.json({
          status: "success",
          message: "License refunded and workspace downgraded to free tier",
        });
      }

      default:
        return NextResponse.json({ message: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("AppSumo partner webhook error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
