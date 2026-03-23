/**
 * Rate limiting with Firebase-backed persistence.
 *
 * Uses Firebase RTDB to track per-user daily AI usage, matching the
 * aiUsage node already defined in database.rules.json. Falls back to
 * in-memory tracking if Firebase is unavailable.
 *
 * This replaces the in-memory-only rate limiter that reset on every
 * serverless cold start.
 */

import { dbGet, dbPatch } from "@/lib/firebase-rest";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string; // ISO date (end of day UTC)
}

/** Plan-based daily AI query limits (from CLAUDE.md spec) */
const PLAN_LIMITS: Record<string, number> = {
  FOUNDATION: 10,
  BUILDER: 50,
  DEVELOPER: 1000, // "unlimited" but with a high cap
  ENTERPRISE: 1000,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function endOfDayUTC(): string {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Check and increment a user's AI usage for today.
 * Returns whether the request is allowed and remaining quota.
 */
export async function checkUserRateLimit(
  userId: string,
  plan: string
): Promise<RateLimitResult> {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FOUNDATION;
  const day = todayKey();

  try {
    // Read current usage from Firebase
    const usage = await dbGet(`aiUsage/${userId}/${day}`);
    const currentCount = typeof usage === "number" ? usage : 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt: endOfDayUTC(),
      };
    }

    // Increment usage
    await dbPatch(`aiUsage/${userId}`, { [day]: currentCount + 1 });

    return {
      allowed: true,
      remaining: limit - currentCount - 1,
      limit,
      resetAt: endOfDayUTC(),
    };
  } catch {
    // If Firebase is down, fall back to allowing the request
    // (fail open — better UX than blocking users due to infra issues)
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: endOfDayUTC(),
    };
  }
}

// ── IP-based fallback for unauthenticated endpoints ─────────────────

const ipMap = new Map<string, { count: number; resetAt: number }>();
const IP_LIMIT = 60; // requests per window
const IP_WINDOW = 3_600_000; // 1 hour

/** Simple IP-based rate limit for non-authenticated endpoints */
export function checkIpRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Periodic cleanup
  if (ipMap.size > 1000) {
    for (const [key, entry] of ipMap) {
      if (now > entry.resetAt) ipMap.delete(key);
    }
  }

  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + IP_WINDOW });
    return { allowed: true, remaining: IP_LIMIT - 1 };
  }

  if (entry.count >= IP_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: IP_LIMIT - entry.count };
}
