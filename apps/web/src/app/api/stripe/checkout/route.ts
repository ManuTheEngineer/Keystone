import { NextRequest } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { PLAN_CONFIG } from "@/lib/stripe-config";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { checkoutSchema, parseBody } from "@/lib/validators/api-schemas";
import { apiSuccess, apiError } from "@/lib/api-response";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const raw = await request.json();
    const parsed = parseBody(checkoutSchema, raw);
    if (!parsed.success) return parsed.response;

    const { email, planTier, billingInterval, isAdmin, stripeCustomerId } = parsed.data;
    const userId = authResult.uid;

    if (isAdmin) {
      return apiError("Admin accounts do not require billing", { status: 400 });
    }

    const config = PLAN_CONFIG[planTier];
    if (!config) {
      return apiError("Invalid plan tier", { status: 400 });
    }

    const priceId = billingInterval === "annual" ? config.annualPriceId : config.monthlyPriceId;

    if (!priceId) {
      return apiError("Stripe price not configured. Please contact support.", { status: 500 });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
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

    const session = await getStripeServer().checkout.sessions.create(sessionParams);

    return apiSuccess({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return apiError(message, { status: 500 });
  }
}
