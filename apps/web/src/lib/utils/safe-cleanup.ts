/**
 * Safely unsubscribe from all Firebase listeners.
 *
 * Uses for-of with try/catch so one failed unsubscribe doesn't
 * prevent the rest from cleaning up. Without this, if unsubs[3]
 * throws, unsubs[4-13] never execute → memory leak at scale.
 */
export function safeUnsubscribeAll(unsubs: (() => void)[]): void {
  for (const unsub of unsubs) {
    try {
      unsub();
    } catch {
      // Silently ignore — unsubscribe failures are non-critical
    }
  }
}
