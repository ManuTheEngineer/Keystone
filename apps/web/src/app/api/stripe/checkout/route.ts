import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { PLAN_CONFIG, type PlanTier } from "@/lib/stripe-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, planTier, billingInterval, isAdmin, stripeCustomerId } = body as {
      userId: string;
      email: string;
      planTier: Exclude<PlanTier, "FOUNDATION">;
      billingInterval: "monthly" | "annual";
      isAdmin?: boolean;
      stripeCustomerId?: string;
    };

    if (!userId || !email || !planTier || !billingInterval) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isAdmin) {
      return NextResponse.json({ error: "Admin accounts do not require billing" }, { status: 400 });
    }

    const config = PLAN_CONFIG[planTier];
    if (!config) {
      return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
    }

    const priceId = billingInterval === "annual" ? config.annualPriceId : config.monthlyPriceId;

    if (!priceId) {
      return NextResponse.json({ error: "Stripe price not configured. Please contact support." }, { status: 500 });
    }

    const sessionParams: Record<string, unknown> = {
      mode: "subscription" as const,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/settings?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/settings?upgrade=canceled`,
      metadata: { userId, planTier, billingInterval },
      subscription_data: { metadata: { userId, planTier } },
    };

    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    } else {
      sessionParams.customer_email = email;
    }

    const session = await getStripeServer().checkout.sessions.create(sessionParams as any);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
