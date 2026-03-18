// TODO: Add Zod schema validation for request body
import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { verifyAuth, isAuthError } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const { stripeSubscriptionId } = await request.json();

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: "No subscription ID" }, { status: 400 });
    }

    const sub = await getStripeServer().subscriptions.retrieve(stripeSubscriptionId) as any;

    return NextResponse.json({
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelAt: sub.cancel_at,
    });
  } catch (error: any) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch subscription" }, { status: 500 });
  }
}
