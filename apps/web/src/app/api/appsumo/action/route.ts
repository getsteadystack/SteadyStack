import { NextRequest, NextResponse } from "next/server";
import db from "@steadystack/db";

/**
 * AppSumo Licensing API (v2) Webhook Handler.
 * Supports events: test, purchase, activate, upgrade, downgrade, deactivate, refund.
 * Docs: https://docs.licensing.appsumo.com/webhook/webhook__connect.html
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const appsumoSecret = process.env.APPSUMO_PARTNER_SECRET;

    if (appsumoSecret && authHeader !== `Bearer ${appsumoSecret}`) {
      return NextResponse.json({ error: "Unauthorized partner token" }, { status: 401 });
    }

    const body: any = await req.json().catch(() => ({}));

    // Normalize event/action name
    const event = (body.event || body.action || "").toString().trim().toLowerCase();

    // Normalize license key (supports v2 license_key, prev_license_key, and legacy code/uuid fields)
    const licenseKey = (
      body.license_key ||
      body.code ||
      body.invoice_item_uuid ||
      body.uuid ||
      ""
    )
      .toString()
      .trim()
      .toUpperCase();

    const prevLicenseKey = (body.prev_license_key || "").toString().trim().toUpperCase();

    // Normalize tier (1, 2, or 3)
    const tierNumber = Number(
      body.tier ||
      body.plan_id?.replace(/[^0-9]/g, "") ||
      1
    );
    const tier = Math.min(Math.max(tierNumber, 1), 3);

    // 1. Handle AppSumo Test Ping
    if (event === "test" || body.test === true) {
      return NextResponse.json({
        message: "success",
        status: "success",
        event: "test",
      });
    }

    switch (event) {
      // 2. Purchase / Activation Events
      case "purchase":
      case "activate": {
        if (!licenseKey) {
          return NextResponse.json({ message: "license_key is required" }, { status: 400 });
        }

        const existing = await db.appSumoLicense.findUnique({
          where: { code: licenseKey },
        });

        if (existing && existing.status === "REDEEMED") {
          return NextResponse.json({
            message: "success",
            status: "success",
            already_redeemed: true,
          });
        }

        if (existing) {
          await db.appSumoLicense.update({
            where: { code: licenseKey },
            data: {
              tier,
              plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
              status: "ACTIVE",
              invoiceId: body.invoice_item_uuid || null,
            },
          });
        } else {
          await db.appSumoLicense.create({
            data: {
              code: licenseKey,
              tier,
              plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
              status: "ACTIVE",
              invoiceId: body.invoice_item_uuid || null,
            },
          });
        }

        return NextResponse.json({
          message: "success",
          status: "success",
          redirect_url: `https://steadystack.dev/redeem?code=${encodeURIComponent(licenseKey)}`,
        });
      }

      // 3. Upgrade / Downgrade Events
      case "upgrade":
      case "downgrade": {
        const targetKey = licenseKey || prevLicenseKey;
        if (!targetKey) {
          return NextResponse.json({ message: "license_key is required" }, { status: 400 });
        }

        let license = await db.appSumoLicense.findUnique({
          where: { code: targetKey },
        });

        if (!license && prevLicenseKey) {
          license = await db.appSumoLicense.findUnique({
            where: { code: prevLicenseKey },
          });
        }

        // Create or update the new license record
        if (licenseKey && licenseKey !== prevLicenseKey) {
          await db.appSumoLicense.upsert({
            where: { code: licenseKey },
            create: {
              code: licenseKey,
              tier,
              plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
              status: "ACTIVE",
              userId: license?.userId || null,
            },
            update: {
              tier,
              plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
              status: "ACTIVE",
            },
          });

          // Mark previous license key as deactivated for traceability
          if (prevLicenseKey) {
            await db.appSumoLicense.updateMany({
              where: { code: prevLicenseKey },
              data: { status: "DEACTIVATED" },
            });
          }
        } else if (license) {
          await db.appSumoLicense.update({
            where: { code: targetKey },
            data: {
              tier,
              plan: tier === 3 ? "CONSTRUCT" : "NETRUNNER",
            },
          });
        }

        const activeUserId = license?.userId;
        if (activeUserId) {
          const targetPlan = tier === 3 ? "CONSTRUCT" : "NETRUNNER";
          const tierVersion = `appsumo_tier_${tier}`;

          await db.subscription.update({
            where: { userId: activeUserId },
            data: {
              plan: targetPlan,
              tierVersion,
              appsumoTier: tier,
              isLifetime: true,
            },
          });

          await db.user.update({
            where: { id: activeUserId },
            data: { tier: targetPlan },
          });
        }

        return NextResponse.json({
          message: "success",
          status: "success",
          tier,
        });
      }

      // 4. Deactivation / Refund Events
      case "deactivate":
      case "refund": {
        if (!licenseKey) {
          return NextResponse.json({ message: "license_key is required" }, { status: 400 });
        }

        const license = await db.appSumoLicense.findUnique({
          where: { code: licenseKey },
        });

        if (license) {
          await db.appSumoLicense.update({
            where: { code: licenseKey },
            data: {
              status: event === "deactivate" ? "DEACTIVATED" : "REFUNDED",
            },
          });

          if (license.userId) {
            // Check if user has any other active AppSumo licenses
            const remainingLicenses = await db.appSumoLicense.findMany({
              where: {
                userId: license.userId,
                status: "REDEEMED",
                NOT: { code: licenseKey },
              },
            });

            if (remainingLicenses.length > 0) {
              const newTier = Math.min(3, remainingLicenses.length);
              const targetPlan = newTier === 3 ? "CONSTRUCT" : "NETRUNNER";
              await db.subscription.update({
                where: { userId: license.userId },
                data: {
                  plan: targetPlan,
                  tierVersion: `appsumo_tier_${newTier}`,
                  appsumoTier: newTier,
                  isLifetime: true,
                },
              });
              await db.user.update({
                where: { id: license.userId },
                data: { tier: targetPlan },
              });
            } else {
              // Downgrade to Free Initiate plan
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
          }
        }

        return NextResponse.json({
          message: "success",
          status: "success",
        });
      }

      default:
        return NextResponse.json({ message: "success", status: "ignored" }, { status: 200 });
    }
  } catch (error: any) {
    console.error("AppSumo partner webhook error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "SteadyStack AppSumo Licensing v2 API",
    docs: "https://docs.licensing.appsumo.com",
  });
}
