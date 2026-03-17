import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { verifyAuth, isAuthError } from "@/lib/api-auth";

const DB_URL = "https://keystone-21811-default-rtdb.firebaseio.com";

async function updateProfile(userId: string, data: Record<string, unknown>) {
  const authParam = process.env.FIREBASE_DATABASE_SECRET ? `?auth=${process.env.FIREBASE_DATABASE_SECRET}` : "";
  const res = await fetch(`${DB_URL}/users/${userId}/profile.json${authParam}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Firebase update failed:", res.status, errorText);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await getStripeServer().checkout.sessions.retrieve(sessionId) as any;

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    const planTier = session.metadata?.planTier;
    const billingInterval = session.metadata?.billingInterval;

    if (!userId || !planTier) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Verify the authenticated user matches the session's userId
    if (authResult.uid !== userId) {
      return NextResponse.json({ error: "Session does not belong to you" }, { status: 403 });
    }

    // Update Firebase profile directly
    await updateProfile(userId, {
      plan: planTier,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: "active",
      billingInterval: billingInterval || "monthly",
      trialExpiresAt: null,
      trialCodeUsed: null,
    });

    return NextResponse.json({ success: true, plan: planTier });
  } catch (error: any) {
    console.error("Verify session error:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
