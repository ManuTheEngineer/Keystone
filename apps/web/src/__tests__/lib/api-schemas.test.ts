import { describe, it, expect } from "vitest";
import {
  checkoutSchema,
  portalSchema,
  subscriptionSchema,
  verifySchema,
  revokeTrialSchema,
  aiChatSchema,
} from "@/lib/validators/api-schemas";

describe("checkoutSchema", () => {
  it("accepts valid input", () => {
    const result = checkoutSchema.safeParse({
      email: "user@example.com",
      planTier: "BUILDER",
      billingInterval: "monthly",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = checkoutSchema.safeParse({
      email: "not-an-email",
      planTier: "BUILDER",
      billingInterval: "monthly",
    });
    expect(result.success).toBe(false);
  });

  it("rejects FOUNDATION tier", () => {
    const result = checkoutSchema.safeParse({
      email: "user@example.com",
      planTier: "FOUNDATION",
      billingInterval: "monthly",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid billing interval", () => {
    const result = checkoutSchema.safeParse({
      email: "user@example.com",
      planTier: "BUILDER",
      billingInterval: "weekly",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional stripeCustomerId", () => {
    const result = checkoutSchema.safeParse({
      email: "user@example.com",
      planTier: "DEVELOPER",
      billingInterval: "annual",
      stripeCustomerId: "cus_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stripeCustomerId).toBe("cus_abc123");
    }
  });
});

describe("portalSchema", () => {
  it("accepts valid input", () => {
    const result = portalSchema.safeParse({ stripeCustomerId: "cus_abc" });
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = portalSchema.safeParse({ stripeCustomerId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing field", () => {
    const result = portalSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("subscriptionSchema", () => {
  it("accepts valid subscription ID", () => {
    const result = subscriptionSchema.safeParse({ stripeSubscriptionId: "sub_xyz" });
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = subscriptionSchema.safeParse({ stripeSubscriptionId: "" });
    expect(result.success).toBe(false);
  });
});

describe("verifySchema", () => {
  it("accepts valid session ID", () => {
    const result = verifySchema.safeParse({ sessionId: "cs_test_abc" });
    expect(result.success).toBe(true);
  });

  it("rejects empty session ID", () => {
    const result = verifySchema.safeParse({ sessionId: "" });
    expect(result.success).toBe(false);
  });
});

describe("revokeTrialSchema", () => {
  it("accepts valid code", () => {
    const result = revokeTrialSchema.safeParse({ code: "TRIAL2025" });
    expect(result.success).toBe(true);
  });

  it("rejects empty code", () => {
    const result = revokeTrialSchema.safeParse({ code: "" });
    expect(result.success).toBe(false);
  });
});

describe("aiChatSchema", () => {
  it("accepts valid chat input", () => {
    const result = aiChatSchema.safeParse({
      messages: [{ role: "user", content: "How do I pour a foundation?" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("general"); // default
    }
  });

  it("accepts mode override", () => {
    const result = aiChatSchema.safeParse({
      messages: [{ role: "user", content: "Review my budget" }],
      mode: "budget",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("budget");
    }
  });

  it("rejects empty messages array", () => {
    const result = aiChatSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = aiChatSchema.safeParse({
      messages: [{ role: "system", content: "test" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects oversized content", () => {
    const result = aiChatSchema.safeParse({
      messages: [{ role: "user", content: "x".repeat(10_001) }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many messages", () => {
    const messages = Array.from({ length: 51 }, () => ({
      role: "user" as const,
      content: "msg",
    }));
    const result = aiChatSchema.safeParse({ messages });
    expect(result.success).toBe(false);
  });
});
