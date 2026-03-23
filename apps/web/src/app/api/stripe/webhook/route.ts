import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { updateProfile } from "@/lib/firebase-rest";
import { isDuplicateEvent, markEventProcessed } from "./idempotency";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Map Stripe Price IDs to plan tiers — authoritative source of truth
const PRICE_TO_TIER: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_BUILDER_MONTHLY ?? ""]: "BUILDER",
  [process.env.NEXT_PUBLIC_STRIPE_BUILDER_ANNUAL ?? ""]: "BUILDER",
  [process.env.NEXT_PUBLIC_STRIPE_DEVELOPER_MONTHLY ?? ""]: "DEVELOPER",
  [process.env.NEXT_PUBLIC_STRIPE_DEVELOPER_ANNUAL ?? ""]: "DEVELOPER",
  [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY ?? ""]: "ENTERPRISE",
  [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL ?? ""]: "ENTERPRISE",
};

function tierFromPriceId(priceId: string): string | null {
  return PRICE_TO_TIER[priceId] || null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeServer().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Invalid signature", details: message }, { status: 400 });
  }

  // Idempotency: skip if this event was already processed
  if (await isDuplicateEvent(event.id)) {
    return NextResponse.json({ data: { received: true, duplicate: true } });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const billingInterval = session.metadata?.billingInterval;

        let planTier: string | null = null;
        if (session.subscription) {
          try {
            const subId = typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
            const sub = await getStripeServer().subscriptions.retrieve(subId);
            const priceId = sub.items?.data?.[0]?.price?.id;
            if (priceId) planTier = tierFromPriceId(priceId);
          } catch {
            // Fall through to metadata
          }
        }
        if (!planTier) planTier = session.metadata?.planTier ?? null;

        if (userId && planTier) {
          await updateProfile(userId, {
            plan: planTier,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
            subscriptionStatus: "active",
            billingInterval: billingInterval || "monthly",
            trialExpiresAt: null,
            trialCodeUsed: null,
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const rawSub = invoice.subscription;
        const subId = typeof rawSub === "string" ? rawSub : null;
        if (subId) {
          const sub = await getStripeServer().subscriptions.retrieve(subId) as unknown as Record<string, unknown>;
          const meta = sub.metadata as Record<string, string> | undefined;
          if (meta?.userId) {
            await updateProfile(meta.userId, { subscriptionStatus: "active" });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const planTier = sub.metadata?.planTier;
        if (userId) {
          const statusMap: Record<string, string> = {
            active: "active",
            past_due: "past_due",
          };
          await updateProfile(userId, {
            plan: planTier || undefined,
            subscriptionStatus: statusMap[sub.status] ?? "canceled",
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          await updateProfile(userId, {
            plan: "FOUNDATION",
            stripeSubscriptionId: null,
            subscriptionStatus: "canceled",
            billingInterval: null,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as unknown as Record<string, unknown>;
        const failedRawSub = failedInvoice.subscription;
        const failedSubId = typeof failedRawSub === "string" ? failedRawSub : null;
        if (failedSubId) {
          const sub = await getStripeServer().subscriptions.retrieve(failedSubId) as unknown as Record<string, unknown>;
          const meta = sub.metadata as Record<string, string> | undefined;
          if (meta?.userId) {
            await updateProfile(meta.userId, { subscriptionStatus: "past_due" });
          }
        }
        break;
      }
    }

    // Mark event as processed for idempotency
    await markEventProcessed(event.id);

    return NextResponse.json({ data: { received: true } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
