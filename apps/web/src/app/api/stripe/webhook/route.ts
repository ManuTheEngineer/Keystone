import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

const DB_URL = "https://keystone-21811-default-rtdb.firebaseio.com";

// Update user profile via Firebase REST API (no client SDK needed in serverless)
async function updateProfile(userId: string, data: Record<string, unknown>) {
  const res = await fetch(`${DB_URL}/users/${userId}/profile.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.error("Firebase update failed:", await res.text());
  }
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
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planTier = session.metadata?.planTier;
        const billingInterval = session.metadata?.billingInterval;
        if (userId && planTier) {
          await updateProfile(userId, {
            plan: planTier,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "active",
            billingInterval: billingInterval || "monthly",
            trialExpiresAt: null,
            trialCodeUsed: null,
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string;
        if (subId) {
          const sub = await getStripeServer().subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId;
          if (userId) {
            await updateProfile(userId, { subscriptionStatus: "active" });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const planTier = sub.metadata?.planTier;
        if (userId) {
          await updateProfile(userId, {
            plan: planTier || undefined,
            subscriptionStatus: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
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
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string;
        if (subId) {
          const sub = await getStripeServer().subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId;
          if (userId) {
            await updateProfile(userId, { subscriptionStatus: "past_due" });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
