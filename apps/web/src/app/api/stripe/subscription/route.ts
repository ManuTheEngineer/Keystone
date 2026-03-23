import { NextRequest } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { subscriptionSchema, parseBody } from "@/lib/validators/api-schemas";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const raw = await request.json();
    const parsed = parseBody(subscriptionSchema, raw);
    if (!parsed.success) return parsed.response;

    const { stripeSubscriptionId } = parsed.data;

    const sub = await getStripeServer().subscriptions.retrieve(stripeSubscriptionId);
    // Stripe v20 wraps in Response<T>; access fields via unknown cast
    const s = sub as unknown as Record<string, unknown>;

    return apiSuccess({
      status: s.status,
      currentPeriodEnd: s.current_period_end,
      cancelAtPeriodEnd: s.cancel_at_period_end,
      cancelAt: s.cancel_at,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch subscription";
    return apiError(message, { status: 500 });
  }
}
