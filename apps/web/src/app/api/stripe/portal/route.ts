import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { verifyAuth, isAuthError } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const { stripeCustomerId } = await request.json();

    if (!stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    const session = await getStripeServer().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${request.nextUrl.origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    return NextResponse.json({ error: error.message || "Failed to create portal session" }, { status: 500 });
  }
}
