/**
 * Zod schemas for API route request validation.
 *
 * Every API route that accepts user input should validate with these
 * schemas at the boundary before processing.
 */
import { z } from "zod";

// ── Stripe Checkout ─────────────────────────────────────────────────

export const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  planTier: z.enum(["BUILDER", "DEVELOPER", "ENTERPRISE"], {
    message: "Plan must be BUILDER, DEVELOPER, or ENTERPRISE",
  }),
  billingInterval: z.enum(["monthly", "annual"], {
    message: "Billing interval must be monthly or annual",
  }),
  isAdmin: z.boolean().optional(),
  stripeCustomerId: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Stripe Portal ───────────────────────────────────────────────────

export const portalSchema = z.object({
  stripeCustomerId: z.string().min(1, "Stripe customer ID is required"),
});

export type PortalInput = z.infer<typeof portalSchema>;

// ── Stripe Subscription ─────────────────────────────────────────────

export const subscriptionSchema = z.object({
  stripeSubscriptionId: z.string().min(1, "Subscription ID is required"),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

// ── Stripe Verify ───────────────────────────────────────────────────

export const verifySchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export type VerifyInput = z.infer<typeof verifySchema>;

// ── Revoke Trial ────────────────────────────────────────────────────

export const revokeTrialSchema = z.object({
  code: z.string().min(1, "Trial code is required"),
});

export type RevokeTrialInput = z.infer<typeof revokeTrialSchema>;

// ── AI Chat ─────────────────────────────────────────────────────────

export const aiChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10_000),
      })
    )
    .min(1, "At least one message is required")
    .max(50, "Too many messages"),
  projectContext: z
    .record(z.string(), z.unknown())
    .optional(),
  mode: z
    .enum(["general", "budget", "schedule", "risk", "contract"])
    .default("general"),
});

export type AiChatInput = z.infer<typeof aiChatSchema>;

// ── Location Data ───────────────────────────────────────────────────

export const locationQuerySchema = z.object({
  q: z.string().min(1).max(200),
  market: z.string().max(20).default("USA"),
  fresh: z.enum(["0", "1"]).default("0"),
});

// ── Clear Cache ─────────────────────────────────────────────────────
// (no body — authenticated POST is sufficient)

// ── Helper: parse and return typed result or error response ─────────

import { NextResponse } from "next/server";

export function parseBody<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Validation failed", details: issues },
        { status: 400 }
      ),
    };
  }
  return { success: true, data: result.data };
}
