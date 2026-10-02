import Stripe from "stripe";
import db from "@steadystack/db";
import { PLANS, type PlanTier } from "./billing";

// Initialize Stripe SDK instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_steadystack_key", {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  appInfo: {
    name: "SteadyStack Cloud Monitoring",
    version: "1.0.0",
  },
});

function appendQueryParams(url: string, params: Record<string, string>): string {
  const [base, query] = url.split("?");
  const searchParams = new URLSearchParams(query || "");
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, value);
  }
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Ensures a Stripe customer exists for a user and returns the Stripe customer ID.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string,
): Promise<string> {
  const existingSub = await db.subscription.findUnique({
    where: { userId },
  });

  const stripeKey = process.env.STRIPE_SECRET_KEY || "";
  const isRealStripeKey = Boolean(stripeKey) && !stripeKey.includes("mock");

  if (
    existingSub?.stripeCustomerId &&
    (!isRealStripeKey || !existingSub.stripeCustomerId.startsWith("cus_mock_"))
  ) {
    return existingSub.stripeCustomerId;
  }

  // Create Stripe customer
  let customerId = `cus_mock_${userId}`;
  if (isRealStripeKey) {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { userId },
    });
    customerId = customer.id;
  }

  // Upsert subscription record with customer ID
  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      plan: "INITIATE",
      status: "ACTIVE",
    },
    update: {
      stripeCustomerId: customerId,
    },
  });

  return customerId;
}

/**
 * Creates a Stripe Promotion Code for a Design Partner VIP (100% off for 12 months) or custom discount.
 */
export async function createStripePromotionCode({
  code,
  percentOff = 100,
  durationMonths = 12,
  maxRedemptions = 1,
  metadata = {},
}: {
  code: string;
  percentOff?: number;
  durationMonths?: number;
  maxRedemptions?: number;
  metadata?: Record<string, string>;
}): Promise<{ id: string; code: string; isMock: boolean }> {
  const cleanCode = code.trim().toUpperCase();
  const stripeKey = process.env.STRIPE_SECRET_KEY || "";

  if (!stripeKey || stripeKey.includes("mock")) {
    console.log(`[Stripe Mock] Created mock promotion code: ${cleanCode} (${percentOff}% off)`);
    return { id: `promo_mock_${cleanCode}`, code: cleanCode, isMock: true };
  }

  // 1. Ensure the underlying Stripe Coupon exists
  let couponExists = false;
  try {
    const existing = await stripe.coupons.retrieve(cleanCode);
    if (existing && existing.valid) {
      couponExists = true;
    }
  } catch (err: any) {
    // Coupon doesn't exist or retrieve returned 404/invalid_request_error
    couponExists = false;
  }

  if (!couponExists) {
    try {
      await stripe.coupons.create({
        id: cleanCode,
        name: `SteadyStack VIP (${cleanCode})`.slice(0, 40),
        percent_off: percentOff,
        duration: durationMonths > 1 ? "repeating" : "once",
        duration_in_months: durationMonths > 1 ? durationMonths : undefined,
        max_redemptions: maxRedemptions,
        metadata: {
          ...metadata,
          system: "steadystack_vip",
          vip_code: cleanCode,
          durationMonths: String(durationMonths),
        },
      });
      couponExists = true;
      console.log(`[Stripe] Successfully created coupon in Stripe: ${cleanCode}`);
    } catch (createErr: any) {
      if (
        createErr.code === "resource_already_exists" ||
        createErr.message?.includes("already exists")
      ) {
        couponExists = true;
        console.log(`[Stripe] Coupon ${cleanCode} already exists in Stripe`);
      } else {
        console.error("[Stripe] Error creating coupon %s:", cleanCode, createErr);
        throw createErr;
      }
    }
  }

  // 2. Ensure customer-facing Promotion Code linked to this coupon exists
  try {
    const promoList = await stripe.promotionCodes.list({
      code: cleanCode,
      active: true,
      limit: 1,
    });

    if (promoList.data && promoList.data.length > 0) {
      const existingPromo = promoList.data[0];
      console.log(
        `[Stripe] Found existing promotion code in Stripe: ${existingPromo.code} (ID: ${existingPromo.id})`,
      );
      return { id: existingPromo.id, code: existingPromo.code, isMock: false };
    }
  } catch (listErr: any) {
    console.warn(`[Stripe] Note checking existing promotion code ${cleanCode}:`, listErr?.message);
  }

  try {
    const promo = await stripe.promotionCodes.create({
      coupon: cleanCode,
      code: cleanCode,
      max_redemptions: maxRedemptions,
      metadata: {
        ...metadata,
        created_via: "steadystack_design_partners",
        vip_code: cleanCode,
      },
    });

    console.log(
      `[Stripe] Successfully created promotion code in Stripe: ${promo.code} (ID: ${promo.id})`,
    );
    return { id: promo.id, code: promo.code, isMock: false };
  } catch (promoErr: any) {
    console.log(`[Stripe] Promotion code creation notice for ${cleanCode}:`, promoErr?.message);
    if (
      promoErr.code === "resource_already_exists" ||
      promoErr.message?.includes("already exists")
    ) {
      try {
        const promoList = await stripe.promotionCodes.list({
          code: cleanCode,
          limit: 1,
        });
        if (promoList.data && promoList.data.length > 0) {
          return {
            id: promoList.data[0].id,
            code: promoList.data[0].code,
            isMock: false,
          };
        }
      } catch {}
      return { id: `promo_${cleanCode}`, code: cleanCode, isMock: false };
    }
    throw promoErr;
  }
}

/**
 * Creates a post-year renewal discount code (e.g. 50% off for 12 months) via Stripe SDK.
 */
export async function createStripeRenewalDiscountCode({
  applicantEmail,
  partnerId,
  percentOff = 50,
  durationMonths = 12,
}: {
  applicantEmail?: string;
  partnerId?: string;
  percentOff?: number;
  durationMonths?: number;
}): Promise<{ id: string; code: string; percentOff: number; isMock: boolean }> {
  const hex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `RENEWAL-${percentOff}-${hex}`;

  const result = await createStripePromotionCode({
    code,
    percentOff,
    durationMonths,
    maxRedemptions: 1,
    metadata: {
      applicantEmail: applicantEmail || "",
      partnerId: partnerId || "",
      type: "renewal_loyalty_discount",
    },
  });

  return {
    id: result.id,
    code: result.code,
    percentOff,
    isMock: result.isMock,
  };
}

/**
 * Creates a Stripe Checkout Session for subscription upgrade or renewal.
 */
export async function createCheckoutSession({
  userId,
  email,
  plan = "NETRUNNER",
  interval = "monthly",
  returnUrl,
  promoCode,
  deal,
}: {
  userId: string;
  email: string;
  plan?: PlanTier;
  interval?: "monthly" | "annual";
  returnUrl: string;
  promoCode?: string;
  deal?: string;
}): Promise<{ url: string }> {
  let customerId = await getOrCreateStripeCustomer(userId, email);

  // If a Lifetime Deal is requested
  const isLifetimeDeal = Boolean(deal);
  const dealTier = deal?.includes("3") ? 3 : deal?.includes("2") ? 2 : 1;
  const dealPrice = dealTier === 3 ? 199 : dealTier === 2 ? 99 : 49;
  const effectivePlan: PlanTier = isLifetimeDeal
    ? dealTier === 3
      ? "CONSTRUCT"
      : "NETRUNNER"
    : plan;
  const planDetails = PLANS[effectivePlan];

  const priceId =
    interval === "annual" ? planDetails.stripePriceIdAnnual : planDetails.stripePriceIdMonthly;

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("mock")) {
    const cleanPromo = promoCode?.trim().toUpperCase();

    // Check if the price ID is a real pre-configured Stripe price ID or placeholder
    const isPreconfiguredPriceId =
      !isLifetimeDeal &&
      Boolean(priceId) &&
      (priceId?.startsWith("price_") ?? false) &&
      !priceId?.includes("netrunner") &&
      !priceId?.includes("construct");

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = isLifetimeDeal
      ? {
          price_data: {
            currency: "usd",
            product_data: {
              name: `SteadyStack Founder Lifetime Deal Tier ${dealTier}`,
              description: `Lifetime access to SteadyStack Tier ${dealTier} (${
                dealTier === 3
                  ? "1,500 monitors, 100 status pages, 10s checks"
                  : dealTier === 2
                    ? "250 monitors, 10 status pages, 30s checks"
                    : "150 monitors, 3 status pages, 60s checks"
              })`,
              metadata: {
                deal: deal || `ltd-tier-${dealTier}`,
                dealTier: String(dealTier),
                plan: effectivePlan,
                isLifetime: "true",
              },
            },
            unit_amount: dealPrice * 100,
          },
          quantity: 1,
        }
      : isPreconfiguredPriceId && priceId
        ? { price: priceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              product_data: {
                name: `SteadyStack ${planDetails.name}`,
                description: planDetails.description,
                metadata: {
                  plan: effectivePlan,
                },
              },
              unit_amount:
                (interval === "annual"
                  ? planDetails.annualPriceMonthly * 12
                  : planDetails.monthlyPrice) * 100,
              recurring: {
                interval: interval === "annual" ? "year" : "month",
              },
            },
            quantity: 1,
          };

    let discountConfig: { promotion_code?: string; coupon?: string } | null = null;

    if (cleanPromo) {
      // 1. Check if it's an active Promotion Code in Stripe
      try {
        const promoList = await stripe.promotionCodes.list({
          code: cleanPromo,
          active: true,
          limit: 1,
        });
        if (promoList.data.length > 0) {
          discountConfig = { promotion_code: promoList.data[0].id };
        }
      } catch (err: any) {
        console.warn("[Stripe] Note on promo code lookup:", err.message);
      }

      // 2. Check if it's a direct Coupon in Stripe
      if (!discountConfig) {
        try {
          const couponObj = await stripe.coupons.retrieve(cleanPromo);
          if (couponObj && couponObj.valid) {
            discountConfig = { coupon: couponObj.id };
          }
        } catch {
          // 3. If not yet in Stripe, check if it's a VIP code from our database to create on the fly!
          try {
            const records = await db.verification.findMany({
              where: {
                identifier: "DESIGN_PARTNER",
              },
            });

            for (const r of records) {
              try {
                const partnerData = JSON.parse(r.value);
                const matchesVip =
                  partnerData.vipCode && partnerData.vipCode.trim().toUpperCase() === cleanPromo;
                const matchesRenewal =
                  partnerData.renewalDiscountCode &&
                  partnerData.renewalDiscountCode.trim().toUpperCase() === cleanPromo;
                const matchesId = r.id.trim().toUpperCase() === cleanPromo;

                if (matchesVip || matchesRenewal || matchesId) {
                  const isRenewal = matchesRenewal;
                  const percent = isRenewal ? partnerData.renewalDiscountPercent || 50 : 100;
                  const promoResult = await createStripePromotionCode({
                    code: cleanPromo,
                    percentOff: percent,
                    durationMonths: 12,
                    maxRedemptions: 1,
                    metadata: {
                      partnerId: r.id,
                      applicantEmail: partnerData.email || "",
                    },
                  });

                  if (
                    promoResult.id &&
                    promoResult.id.startsWith("promo_") &&
                    !promoResult.isMock &&
                    promoResult.id !== `promo_${cleanPromo}`
                  ) {
                    discountConfig = { promotion_code: promoResult.id };
                  } else {
                    discountConfig = { coupon: cleanPromo };
                  }

                  // Update verification record to reflect Stripe sync
                  partnerData.stripePromoId = promoResult.id;
                  partnerData.stripeSynced = !promoResult.isMock;
                  if (!partnerData.vipCode && !isRenewal) {
                    partnerData.vipCode = cleanPromo;
                  }
                  await db.verification.update({
                    where: { id: r.id },
                    data: { value: JSON.stringify(partnerData) },
                  });
                  break;
                }
              } catch {}
            }
          } catch (dbErr: any) {
            console.warn("[Stripe] On-demand VIP coupon creation check:", dbErr?.message);
          }
        }
      }
    }

    const buildSessionParams = (
      includeTax: boolean,
      custId: string,
      includeDiscount: boolean = true,
    ): Stripe.Checkout.SessionCreateParams => {
      const metadata = {
        userId,
        plan: effectivePlan,
        interval,
        promoCode: cleanPromo || "",
        deal: deal || "",
        isLifetime: isLifetimeDeal ? "true" : "false",
        dealTier: isLifetimeDeal ? String(dealTier) : "",
      };

      const params: Stripe.Checkout.SessionCreateParams = {
        customer: custId,
        payment_method_types: ["card"],
        customer_update: { name: "auto", address: "auto" },
        line_items: [lineItem],
        mode: isLifetimeDeal ? "payment" : "subscription",
        success_url: appendQueryParams(returnUrl, {
          session_id: "{CHECKOUT_SESSION_ID}",
          success: "true",
          deal: deal || "",
        }),
        cancel_url: appendQueryParams(returnUrl, {
          canceled: "true",
        }),
        metadata,
      };

      if (!isLifetimeDeal) {
        params.subscription_data = {
          metadata,
        };
      }

      if (includeTax) {
        params.automatic_tax = { enabled: true };
        params.tax_id_collection = { enabled: true };
      }

      if (includeDiscount && discountConfig) {
        params.discounts = [discountConfig];
      } else {
        params.allow_promotion_codes = true;
      }

      return params;
    };

    // Helper to attempt creation with intelligent retry
    const tryCreate = async (
      withTax: boolean,
      custId: string,
      withDiscount: boolean = true,
    ): Promise<Stripe.Checkout.Session> => {
      const params = buildSessionParams(withTax, custId, withDiscount);
      return await stripe.checkout.sessions.create(params);
    };

    try {
      const session = await tryCreate(true, customerId, Boolean(discountConfig));
      return { url: session.url || returnUrl };
    } catch (err: any) {
      console.warn(
        "[Stripe] Initial checkout session creation failed, analyzing fallback:",
        err.message,
      );

      // If customer doesn't exist in current Stripe account, recreate customer and retry
      if (err.message?.includes("No such customer") || err.code === "resource_missing") {
        console.log("[Stripe] Recreating customer for user:", userId);
        const newCustomer = await stripe.customers.create({
          email,
          metadata: { userId },
        });
        customerId = newCustomer.id;
        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: customerId,
            plan: "INITIATE",
            status: "ACTIVE",
          },
          update: {
            stripeCustomerId: customerId,
          },
        });

        const retrySession = await tryCreate(false, customerId, Boolean(discountConfig));
        return { url: retrySession.url || returnUrl };
      }

      // If coupon doesn't exist in Stripe, retry without preset discount and enable manual promo code entry
      if (err.message?.includes("No such coupon") || err.message?.includes("coupon")) {
        console.log("[Stripe] Retrying checkout session without invalid preset coupon...");
        const retrySession = await tryCreate(false, customerId, false);
        return { url: retrySession.url || returnUrl };
      }

      // If automatic tax is not configured in Stripe dashboard, retry without automatic tax
      if (err.message?.includes("automatic tax") || err.message?.includes("tax")) {
        console.log("[Stripe] Retrying without automatic tax requirement...");
        const retrySession = await tryCreate(false, customerId, Boolean(discountConfig));
        return { url: retrySession.url || returnUrl };
      }

      throw err;
    }
  }

  // Fallback demo/mock mode response when STRIPE_SECRET_KEY is not configured
  const mockParams: Record<string, string> = {
    mock_checkout: "true",
    plan: effectivePlan,
    interval,
  };
  if (deal) {
    mockParams.deal = deal;
  }
  if (promoCode) {
    mockParams.promo_code = promoCode;
  }
  return {
    url: appendQueryParams(returnUrl, mockParams),
  };
}

/**
 * Creates a Stripe Customer Portal session URL.
 */
export async function createPortalSession({
  userId,
  email,
  returnUrl,
}: {
  userId: string;
  email: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const customerId = await getOrCreateStripeCustomer(userId, email);

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("mock")) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: portalSession.url };
  }

  // Fallback demo/mock mode portal URL
  return {
    url: appendQueryParams(returnUrl, { mock_portal: "true" }),
  };
}

/**
 * Synchronously resolves the internal PlanTier from a Stripe Subscription object.
 */
export function resolvePlanFromStripeSubscription(
  subscription: any,
  fallbackPlan: string = "INITIATE",
): PlanTier {
  if (!subscription) return (fallbackPlan as PlanTier) || "INITIATE";
  if (subscription.status === "canceled") return "INITIATE";

  // 1. Check subscription metadata
  const metaPlan = subscription.metadata?.plan?.toUpperCase();
  if (metaPlan && metaPlan in PLANS) {
    return metaPlan as PlanTier;
  }

  // 2. Check price ID from subscription items against known PLANS
  const priceItem = subscription.items?.data?.[0]?.price;
  const priceId = priceItem?.id;
  if (priceId) {
    for (const [tier, details] of Object.entries(PLANS)) {
      if (details.stripePriceIdMonthly === priceId || details.stripePriceIdAnnual === priceId) {
        return tier as PlanTier;
      }
    }
  }

  // 3. Check price metadata
  const priceMetaPlan = priceItem?.metadata?.plan?.toUpperCase();
  if (priceMetaPlan && priceMetaPlan in PLANS) {
    return priceMetaPlan as PlanTier;
  }

  // 4. Check price lookup_key or nickname
  const lookupKey = priceItem?.lookup_key?.toUpperCase();
  if (lookupKey?.includes("CONSTRUCT")) return "CONSTRUCT";
  if (lookupKey?.includes("NETRUNNER")) return "NETRUNNER";

  const nickname = priceItem?.nickname?.toUpperCase();
  if (nickname?.includes("CONSTRUCT")) return "CONSTRUCT";
  if (nickname?.includes("NETRUNNER")) return "NETRUNNER";

  // 5. Check product name or metadata if product is populated as an object
  const product = priceItem?.product;
  if (typeof product === "object" && product !== null) {
    const prodPlan = product.metadata?.plan?.toUpperCase();
    if (prodPlan && prodPlan in PLANS) return prodPlan as PlanTier;

    const prodName = (product.name || "").toUpperCase();
    if (prodName.includes("CONSTRUCT")) return "CONSTRUCT";
    if (prodName.includes("NETRUNNER")) return "NETRUNNER";
  }

  // 6. Check price unit_amount (78000 = $780 Construct annual, 7900 = $79 Construct monthly, 6500 = $65, 18000 = $180 Netrunner annual, 1900 = $19 Netrunner monthly, 1500 = $15)
  const unitAmount = priceItem?.unit_amount;
  if (unitAmount === 7900 || unitAmount === 78000 || unitAmount === 6500 || unitAmount === 79) {
    return "CONSTRUCT";
  }
  if (unitAmount === 1900 || unitAmount === 18000 || unitAmount === 1500 || unitAmount === 19) {
    return "NETRUNNER";
  }

  return fallbackPlan in PLANS ? (fallbackPlan as PlanTier) : "INITIATE";
}

/**
 * Asynchronously resolves the internal PlanTier from a Stripe Subscription object,
 * fetching underlying Product details from Stripe if necessary.
 */
export async function resolvePlanFromStripeSubscriptionAsync(
  subscription: any,
  fallbackPlan: string = "INITIATE",
): Promise<PlanTier> {
  const syncResult = resolvePlanFromStripeSubscription(subscription, fallbackPlan);
  if (syncResult !== "INITIATE" && syncResult !== fallbackPlan) {
    return syncResult;
  }

  // If synchronous check couldn't identify and product is a string ID, fetch product from Stripe
  const priceItem = subscription?.items?.data?.[0]?.price;
  const productId =
    typeof priceItem?.product === "string" ? priceItem.product : priceItem?.product?.id;

  if (
    productId &&
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("mock")
  ) {
    try {
      const prodObj = await stripe.products.retrieve(productId);
      const prodPlan = prodObj.metadata?.plan?.toUpperCase();
      if (prodPlan && prodPlan in PLANS) return prodPlan as PlanTier;

      const prodName = (prodObj.name || "").toUpperCase();
      if (prodName.includes("CONSTRUCT")) return "CONSTRUCT";
      if (prodName.includes("NETRUNNER")) return "NETRUNNER";
    } catch (err: any) {
      console.warn("[Stripe] Failed to retrieve product for tier resolution:", err?.message);
    }
  }

  return syncResult;
}

/**
 * Synchronizes a user's subscription and tier directly against Stripe.
 */
export async function syncUserSubscriptionFromStripe(userId: string): Promise<{
  success: boolean;
  plan: PlanTier;
  status: string;
  error?: string;
}> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return {
        success: false,
        plan: "INITIATE",
        status: "NOT_FOUND",
        error: "User not found",
      };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || "";
    if (!stripeKey || stripeKey.includes("mock")) {
      const plan = (user.subscription?.plan || user.tier || "INITIATE") as PlanTier;
      return {
        success: true,
        plan,
        status: user.subscription?.status || "ACTIVE",
      };
    }

    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId && user.email) {
      const customerList = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customerList.data.length > 0) {
        customerId = customerList.data[0].id;
      }
    }

    if (!customerId) {
      const plan = (user.subscription?.plan || user.tier || "INITIATE") as PlanTier;
      return {
        success: true,
        plan,
        status: user.subscription?.status || "NO_STRIPE_CUSTOMER",
      };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.items.data.price.product"],
      limit: 10,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing",
    );

    if (activeSub) {
      const plan = await resolvePlanFromStripeSubscriptionAsync(
        activeSub,
        user.subscription?.plan || "CONSTRUCT",
      );
      const effectiveStatus = activeSub.status === "active" ? "ACTIVE" : "TRIALING";
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const subAny = activeSub as any;
      const periodStart = subAny.current_period_start
        ? new Date(subAny.current_period_start * 1000)
        : new Date();
      const periodEnd = subAny.current_period_end
        ? new Date(subAny.current_period_end * 1000)
        : oneYearFromNow;

      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: activeSub.id,
          plan,
          status: effectiveStatus,
          trialEndsAt: null,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          tierVersion: "stripe_live",
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: activeSub.id,
          plan,
          status: effectiveStatus,
          trialEndsAt: null,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          tierVersion: "stripe_live",
        },
      });

      await db.user.update({
        where: { id: userId },
        data: { tier: plan },
      });

      return { success: true, plan, status: effectiveStatus };
    }

    const plan = (user.subscription?.plan || user.tier || "INITIATE") as PlanTier;
    return {
      success: true,
      plan,
      status: user.subscription?.status || "NO_ACTIVE_SUB",
    };
  } catch (err: any) {
    console.error("[Stripe] Failed to sync user subscription:", err);
    return {
      success: false,
      plan: "INITIATE",
      status: "ERROR",
      error: err?.message || "Sync failed",
    };
  }
}

/**
 * Verifies a completed Stripe checkout session by ID and updates the user's subscription in DB.
 */
export async function verifyAndApplyCheckoutSession({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}): Promise<{ success: boolean; plan?: string; error?: string }> {
  try {
    if (!sessionId || !sessionId.startsWith("cs_")) {
      return { success: false, error: "Invalid session ID" };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || "";
    if (!stripeKey || stripeKey.includes("mock")) {
      return { success: false, error: "Stripe in mock mode" };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer", "line_items.data.price.product"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return {
        success: false,
        error: `Checkout not completed: ${session.status}`,
      };
    }

    // Verify user ID matches if present in session metadata
    const sessionUserId = session.metadata?.userId;
    if (sessionUserId && sessionUserId !== userId) {
      return { success: false, error: "Session does not belong to this user" };
    }

    const isLifetime = session.metadata?.isLifetime === "true" || Boolean(session.metadata?.deal);
    const dealTier = session.metadata?.dealTier
      ? Number.parseInt(session.metadata.dealTier)
      : session.metadata?.deal?.includes("3")
        ? 3
        : session.metadata?.deal?.includes("2")
          ? 2
          : 1;

    let plan: PlanTier = isLifetime ? (dealTier === 3 ? "CONSTRUCT" : "NETRUNNER") : "CONSTRUCT";
    const rawPlan = session.metadata?.plan?.toUpperCase();
    if (rawPlan && rawPlan in PLANS) {
      plan = rawPlan as PlanTier;
    } else if (session.subscription && typeof session.subscription === "object") {
      plan = await resolvePlanFromStripeSubscriptionAsync(session.subscription, "CONSTRUCT");
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    console.log(
      `[Stripe] Syncing checkout session ${sessionId} for user ${userId} -> Plan: ${plan} (Lifetime: ${isLifetime})`,
    );

    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: customerId || undefined,
        stripeSubscriptionId: subscriptionId || undefined,
        plan,
        status: "ACTIVE",
        isLifetime,
        appsumoTier: isLifetime ? dealTier : null,
        tierVersion: isLifetime ? `appsumo_tier_${dealTier}` : "stripe_live",
        trialEndsAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: isLifetime ? null : oneYearFromNow,
      },
      update: {
        stripeCustomerId: customerId || undefined,
        stripeSubscriptionId: subscriptionId || undefined,
        plan,
        status: "ACTIVE",
        isLifetime,
        appsumoTier: isLifetime ? dealTier : null,
        tierVersion: isLifetime ? `appsumo_tier_${dealTier}` : "stripe_live",
        trialEndsAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: isLifetime ? null : oneYearFromNow,
      },
    });

    await db.user.update({
      where: { id: userId },
      data: { tier: plan },
    });

    return { success: true, plan };
  } catch (error: any) {
    console.error("[Stripe] Failed to verify and apply checkout session:", error);
    return {
      success: false,
      error: error?.message || "Failed to verify session",
    };
  }
}
