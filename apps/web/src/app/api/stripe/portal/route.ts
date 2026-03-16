import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const profileSnap = await get(ref(db, `users/${userId}/profile`));
    if (!profileSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = profileSnap.val();
    if (!profile.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${request.nextUrl.origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    return NextResponse.json({ error: error.message || "Failed to create portal session" }, { status: 500 });
  }
}
