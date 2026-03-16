import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ref, update, get } from "firebase/database";
import { db } from "@/lib/firebase";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Disable body parsing — Stripe needs raw body
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
          await update(ref(db, `users/${userId}/profile`), {
            plan: planTier,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "active",
            billingInterval: billingInterval || "monthly",
            // Clear any trial data
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
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId;
          if (userId) {
            await update(ref(db, `users/${userId}/profile`), {
              subscriptionStatus: "active",
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const planTier = sub.metadata?.planTier;
        if (userId) {
          await update(ref(db, `users/${userId}/profile`), {
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
          await update(ref(db, `users/${userId}/profile`), {
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
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId;
          if (userId) {
            await update(ref(db, `users/${userId}/profile`), {
              subscriptionStatus: "past_due",
            });
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
