import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { PLAN_CONFIG, type PlanTier } from "@/lib/stripe-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, planTier, billingInterval } = body as {
      userId: string;
      email: string;
      planTier: Exclude<PlanTier, "FOUNDATION">;
      billingInterval: "monthly" | "annual";
    };

    if (!userId || !email || !planTier || !billingInterval) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user is admin (skip billing)
    const profileSnap = await get(ref(db, `users/${userId}/profile`));
    if (profileSnap.exists() && profileSnap.val().role === "admin") {
      return NextResponse.json({ error: "Admin accounts do not require billing" }, { status: 400 });
    }

    const config = PLAN_CONFIG[planTier];
    if (!config) {
      return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
    }

    const priceId = billingInterval === "annual" ? config.annualPriceId : config.monthlyPriceId;

    if (!priceId) {
      return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
    }

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (profileSnap.exists() && profileSnap.val().stripeCustomerId) {
      customerId = profileSnap.val().stripeCustomerId;
    }

    const sessionParams: Record<string, unknown> = {
      mode: "subscription" as const,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/settings?upgrade=success`,
      cancel_url: `${request.nextUrl.origin}/settings?upgrade=canceled`,
      metadata: { userId, planTier, billingInterval },
      subscription_data: { metadata: { userId, planTier } },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams as any);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
