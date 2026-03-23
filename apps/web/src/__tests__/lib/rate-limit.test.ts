import { describe, it, expect } from "vitest";
import { checkIpRateLimit } from "@/lib/rate-limit";

describe("checkIpRateLimit", () => {
  it("allows first request from an IP", () => {
    const result = checkIpRateLimit("test-ip-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("tracks requests per IP", () => {
    const ip = "test-ip-track-" + Date.now();
    const first = checkIpRateLimit(ip);
    const second = checkIpRateLimit(ip);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(first.remaining - 1);
  });

  it("isolates different IPs", () => {
    const suffix = Date.now();
    const a = checkIpRateLimit(`ip-a-${suffix}`);
    const b = checkIpRateLimit(`ip-b-${suffix}`);

    expect(a.remaining).toBe(b.remaining);
  });
});
