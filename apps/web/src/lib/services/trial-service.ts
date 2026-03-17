import { ref, get, set, update, onValue, push } from "firebase/database";
import { db } from "@/lib/firebase";

export interface TrialCode {
  id: string;
  code: string;
  tier: "BUILDER" | "DEVELOPER";
  durationHours: number;
  maxUses: number;
  usedCount: number;
  usedBy: string[];
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  createdBy: string;
}

// Generate a random alphanumeric code
function randomCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Duration label for code format
function durationLabel(hours: number): string {
  if (hours <= 48) return "48H";
  if (hours <= 72) return "3D";
  return "7D";
}

// Generate a trial code (admin only)
export async function generateTrialCode(
  adminUid: string,
  tier: "BUILDER" | "DEVELOPER",
  durationHours: number,
  maxUses: number
): Promise<string> {
  const code = `KEY-${durationLabel(durationHours)}-${tier.slice(0, 3)}-${randomCode(4)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  const codeRef = ref(db, `trialCodes/${code}`);
  await set(codeRef, {
    code,
    tier,
    durationHours,
    maxUses,
    usedCount: 0,
    usedBy: [],
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
    createdBy: adminUid,
  });

  return code;
}

// Redeem a trial code
export async function redeemTrialCode(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string; tier?: string; expiresAt?: string }> {
  const codeRef = ref(db, `trialCodes/${code}`);
  const snapshot = await get(codeRef);

  if (!snapshot.exists()) {
    return { success: false, error: "Invalid code. Please check and try again." };
  }

  const data = snapshot.val() as TrialCode;

  // Check if revoked
  if (data.revokedAt) {
    return { success: false, error: "This code has been revoked." };
  }

  // Check if expired
  if (new Date(data.expiresAt) < new Date()) {
    return { success: false, error: "This code has expired." };
  }

  // Check max uses
  if (data.maxUses > 0 && data.usedCount >= data.maxUses) {
    return { success: false, error: "This code has reached its maximum number of uses." };
  }

  // Check if user already used this code
  const usedBy = data.usedBy || [];
  if (usedBy.includes(userId)) {
    return { success: false, error: "You have already used this code." };
  }

  // Calculate trial expiry for this user
  const trialExpiresAt = new Date(Date.now() + data.durationHours * 60 * 60 * 1000).toISOString();

  // Update code usage
  await update(codeRef, {
    usedCount: data.usedCount + 1,
    usedBy: [...usedBy, userId],
  });

  // Update user profile with trial
  await update(ref(db, `users/${userId}/profile`), {
    plan: data.tier,
    trialExpiresAt,
    trialCodeUsed: code,
    subscriptionStatus: "trialing",
  });

  return { success: true, tier: data.tier, expiresAt: trialExpiresAt };
}

// Subscribe to all trial codes (admin only)
export function subscribeToTrialCodes(
  callback: (codes: TrialCode[]) => void
): () => void {
  const codesRef = ref(db, "trialCodes");
  return onValue(codesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const codes: TrialCode[] = Object.entries(data).map(([id, val]) => ({
      id,
      ...(val as Omit<TrialCode, "id">),
    }));
    // Sort by creation date, newest first
    codes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(codes);
  }, (error) => {
    console.error("Subscription error (trial codes):", error);
  });
}

// Revoke a trial code and revert all users who redeemed it (admin only)
// Uses an API route to bypass Firebase security rules for cross-user writes
export async function revokeTrialCode(
  code: string
): Promise<{ revokedUsers: number; warning?: string }> {
  const { getAuthHeaders } = await import("@/lib/api-client");
  const headers = await getAuthHeaders();
  const res = await fetch("/api/stripe/revoke-trial", {
    method: "POST",
    headers,
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok && res.status !== 207) {
    throw new Error(data.error || "Failed to revoke trial code");
  }
  return { revokedUsers: data.revokedUsers, warning: data.warning };
}

// Check if user's trial has expired and revert to Foundation
export async function checkAndRevertExpiredTrial(userId: string): Promise<boolean> {
  const profileRef = ref(db, `users/${userId}/profile`);
  const snapshot = await get(profileRef);
  if (!snapshot.exists()) return false;

  const profile = snapshot.val();
  if (!profile.trialExpiresAt) return false;
  if (profile.subscriptionStatus !== "trialing") return false;

  if (new Date(profile.trialExpiresAt) < new Date()) {
    await update(profileRef, {
      plan: "FOUNDATION",
      trialExpiresAt: null,
      trialCodeUsed: null,
      subscriptionStatus: null,
    });
    return true; // trial was expired and reverted
  }

  return false; // trial still active
}
