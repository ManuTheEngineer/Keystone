import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env";

describe("validateEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reports missing required vars", () => {
    // Clear required vars
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const result = validateEnv();

    expect(result.valid).toBe(false);
    expect(result.missing).toContain("NEXT_PUBLIC_FIREBASE_API_KEY");
    expect(result.missing).toContain("STRIPE_SECRET_KEY");
  });

  it("passes when all required vars are set", () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_123";

    const result = validateEnv();

    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("lists optional missing vars as warnings", () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_123";
    delete process.env.CLAUDE_API_KEY;

    const result = validateEnv();

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain("CLAUDE_API_KEY");
  });
});
