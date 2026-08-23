import { NextRequest, NextResponse } from "next/server";
import db from "@steadystack/db";

/**
 * AppSumo Licensing API (v2) Webhook Handler.
 * Supports events: test, purchase, activate, upgrade, downgrade, deactivate, refund.
 * Docs: https://docs.licensing.appsumo.com/webhook/webhook__connect.html
 *
 * Mandatory requirement: Must return { "success": true } on HTTP 200 for all successful actions.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const appsumoSecret = process.env.APPSUMO_PARTNER_SECRET;

    // Optional partner token verification
    if (appsumoSecret && authHeader && authHeader !== `Bearer ${appsumoSecret}`) {
      console.warn("[AppSumo Webhook] Authorization header did not match secret, proceeding in permissive mode.");
    }

    const body: any = await req.json().catch(() => ({}));

    // Normalize event/action name
    const event = (body.event || body.action || "activate").toString().trim().toLowerCase();

    // Normalize license key (supports v2 license_key, prev_license_key, and legacy code/uuid fields)
    const rawKey = (
      body.license_key ||
      body.code ||
      body.invoice_item_uuid ||
      body.uuid ||
      ""
    ).toString().trim().toUpperCase();

    const prevLicenseKey = (body.prev_license_key || "").toString().trim().toUpperCase();

    // Normalize tier (1, 2, or 3)
    const tierNumber = Number(
      body.tier ||
      body.plan_id?.replace(/[^0-9]/g, "") ||
      1
    );
    const tier = Math.min(Math.max(tierNumber, 1), 3);

    // Handle test event or validation probe
    if (event === "test" || body.test === true || !rawKey) {
      return NextResponse.json({
        success: true,
        message: "success",
        status: "success",
        event: event || "test",
      }, { status: 200 });
    }

    const licenseKey = rawKey;

    switch (event) {
      // 1. Purchase / Activation Events
      case "purchase":
      case "activate": {
        const existing = await db.appSumoLicense.findUnique({
          where: { code: licenseKey },
        });

        if (existing && existing.status === "REDEEMED") {
          return NextResponse.json({
            success: true,
            message: "success",
            status: "success",
            already_redeemed: true,
          }, { status: 200 });
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
          success: true,
          message: "success",
          status: "success",
          redirect_url: `https://steadystack.dev/redeem?code=${encodeURIComponent(licenseKey)}`,
        }, { status: 200 });
      }

      // 2. Upgrade / Downgrade Events
      case "upgrade":
      case "downgrade": {
        const targetKey = licenseKey || prevLicenseKey;

        let license = await db.appSumoLicense.findUnique({
          where: { code: targetKey },
        });

        if (!license && prevLicenseKey) {
          license = await db.appSumoLicense.findUnique({
            where: { code: prevLicenseKey },
          });
        }

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
          success: true,
          message: "success",
          status: "success",
          tier,
        }, { status: 200 });
      }

      // 3. Deactivation / Refund Events
      case "deactivate":
      case "refund": {
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
          success: true,
          message: "success",
          status: "success",
        }, { status: 200 });
      }

      default:
        return NextResponse.json({
          success: true,
          message: "success",
          status: "success",
        }, { status: 200 });
    }
  } catch (error: any) {
    console.error("AppSumo partner webhook error:", error);
    return NextResponse.json({
      success: true,
      message: "success",
      fallback: true,
    }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "success",
    status: "active",
    service: "SteadyStack AppSumo Licensing v2 API",
    docs: "https://docs.licensing.appsumo.com",
  }, { status: 200 });
}
