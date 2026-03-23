import { NextRequest } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { portalSchema, parseBody } from "@/lib/validators/api-schemas";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const raw = await request.json();
    const parsed = parseBody(portalSchema, raw);
    if (!parsed.success) return parsed.response;

    const { stripeCustomerId } = parsed.data;

    const session = await getStripeServer().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${request.nextUrl.origin}/settings`,
    });

    return apiSuccess({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create portal session";
    return apiError(message, { status: 500 });
  }
}
