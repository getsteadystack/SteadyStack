import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import type { PlanTier } from "@/lib/billing";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      plan = "NETRUNNER",
      interval = "monthly",
      promoCode,
      deal,
    } = body as {
      plan?: PlanTier;
      interval?: "monthly" | "annual";
      promoCode?: string;
      deal?: string;
    };

    const host = (await headers()).get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const returnUrl = `${protocol}://${host}/dashboard/settings?tab=billing`;

    const checkout = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
      plan,
      interval,
      returnUrl,
      promoCode,
      deal,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
