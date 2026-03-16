import Stripe from "stripe";

// Server-side Stripe instance (only use in API routes / server components)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
