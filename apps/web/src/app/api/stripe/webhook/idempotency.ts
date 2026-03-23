/**
 * Webhook idempotency guard.
 *
 * Prevents duplicate processing of Stripe webhook events by tracking
 * processed event IDs in Firebase. Stripe may deliver the same event
 * multiple times, and our handler must be safe to call repeatedly.
 */

import { dbGet, dbPatch } from "@/lib/firebase-rest";

const IDEMPOTENCY_PATH = "webhookEvents";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Check if this webhook event has already been processed.
 * Returns true if it's a duplicate (should be skipped).
 */
export async function isDuplicateEvent(eventId: string): Promise<boolean> {
  try {
    const existing = await dbGet(`${IDEMPOTENCY_PATH}/${eventId}`);
    return existing !== null;
  } catch {
    // If we can't check, assume it's new (fail open)
    return false;
  }
}

/**
 * Mark an event as processed so future deliveries are skipped.
 */
export async function markEventProcessed(eventId: string): Promise<void> {
  try {
    await dbPatch(IDEMPOTENCY_PATH, {
      [eventId]: {
        processedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + TTL_MS).toISOString(),
      },
    });
  } catch {
    // Non-critical — worst case we process a duplicate
  }
}

/**
 * Clean up old processed event records (call periodically).
 * This prevents the idempotency store from growing unbounded.
 */
export async function cleanupOldEvents(): Promise<void> {
  try {
    const allEvents = await dbGet(IDEMPOTENCY_PATH);
    if (!allEvents || typeof allEvents !== "object") return;

    const now = new Date().toISOString();
    const expired: Record<string, null> = {};

    for (const [eventId, data] of Object.entries(allEvents)) {
      const record = data as { expiresAt?: string };
      if (record.expiresAt && record.expiresAt < now) {
        expired[eventId] = null; // Setting to null deletes in Firebase
      }
    }

    if (Object.keys(expired).length > 0) {
      await dbPatch(IDEMPOTENCY_PATH, expired);
    }
  } catch {
    // Non-critical cleanup
  }
}
