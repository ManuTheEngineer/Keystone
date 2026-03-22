/**
 * AI query quota tracking via localStorage.
 *
 * Tracks daily AI query usage per client and exposes remaining quota
 * based on the user's plan tier.
 */

import { useState, useCallback, useEffect } from "react";
import { getPlanLimits, type PlanTier } from "@/lib/stripe-config";

const STORAGE_KEY_COUNT = "keystone-ai-queries-today";
const STORAGE_KEY_DATE = "keystone-ai-queries-date";

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Read current count, resetting if the date has changed. */
function readCount(): number {
  if (typeof window === "undefined") return 0;
  const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
  if (storedDate !== todayString()) {
    // New day -- reset
    localStorage.setItem(STORAGE_KEY_COUNT, "0");
    localStorage.setItem(STORAGE_KEY_DATE, todayString());
    return 0;
  }
  return parseInt(localStorage.getItem(STORAGE_KEY_COUNT) ?? "0", 10);
}

/** Increment the counter (call after a successful AI send). */
export function incrementAiQueryCount(): number {
  const current = readCount();
  const next = current + 1;
  localStorage.setItem(STORAGE_KEY_COUNT, String(next));
  localStorage.setItem(STORAGE_KEY_DATE, todayString());
  return next;
}

export interface AiQuota {
  used: number;
  limit: number;
  /** true when the plan has unlimited queries (DEVELOPER / ENTERPRISE) */
  unlimited: boolean;
  /** Increment counter -- returns new count */
  increment: () => number;
  /** Force a re-read from localStorage */
  refresh: () => void;
}

export function useAiQuota(plan: PlanTier | undefined): AiQuota {
  const effectivePlan: PlanTier = plan ?? "FOUNDATION";
  const limits = getPlanLimits(effectivePlan);
  const unlimited = !isFinite(limits.aiPerDay);

  const [used, setUsed] = useState<number>(0);

  // Sync on mount and when plan changes
  useEffect(() => {
    setUsed(readCount());
  }, [effectivePlan]);

  const increment = useCallback(() => {
    const next = incrementAiQueryCount();
    setUsed(next);
    return next;
  }, []);

  const refresh = useCallback(() => {
    setUsed(readCount());
  }, []);

  return {
    used,
    limit: limits.aiPerDay,
    unlimited,
    increment,
    refresh,
  };
}
