import { NextRequest } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { updateProfile } from "@/lib/firebase-rest";
import { verifySchema, parseBody } from "@/lib/validators/api-schemas";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const raw = await request.json();
    const parsed = parseBody(verifySchema, raw);
    if (!parsed.success) return parsed.response;

    const { sessionId } = parsed.data;

    const session = await getStripeServer().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return apiError("Payment not completed", { status: 400 });
    }

    const userId = session.metadata?.userId;
    const planTier = session.metadata?.planTier;
    const billingInterval = session.metadata?.billingInterval;

    if (!userId || !planTier) {
      return apiError("Missing metadata", { status: 400 });
    }

    if (authResult.uid !== userId) {
      return apiError("Session does not belong to you", { status: 403 });
    }

    await updateProfile(userId, {
      plan: planTier,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.toString() ?? null,
      stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.toString() ?? null,
      subscriptionStatus: "active",
      billingInterval: billingInterval || "monthly",
      trialExpiresAt: null,
      trialCodeUsed: null,
    });

    return apiSuccess({ plan: planTier });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return apiError(message, { status: 500 });
  }
}
