import { ref, get, set, update, onValue, push } from "firebase/database";
import { db } from "@/lib/firebase";

export interface ContractorLink {
  token: string;
  userId: string;
  projectId: string;
  contactId: string;
  contactName: string;
  contactRole: string;
  createdAt: string;
  revokedAt?: string | null;
}

// Tier limits for contractor links
const TIER_LIMITS: Record<string, number> = {
  FOUNDATION: 1,
  BUILDER: 3,
  DEVELOPER: 999,
  ENTERPRISE: 999,
};

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * Generate a magic link for a contractor.
 * Returns the token (append to /contractor/{token} URL).
 */
export async function generateContractorLink(
  userId: string,
  projectId: string,
  contactId: string,
  contactName: string,
  contactRole: string,
  userPlan: string
): Promise<{ token: string } | { error: string }> {
  // Check tier limit
  const limit = TIER_LIMITS[userPlan] ?? 1;
  const activeLinks = await getActiveContractorLinks(userId);
  if (activeLinks.length >= limit) {
    return {
      error: `Your ${userPlan} plan allows ${limit} contractor link${limit !== 1 ? "s" : ""}. Upgrade to add more.`,
    };
  }

  // Check if contact already has an active link
  const existing = activeLinks.find(
    (l) => l.contactId === contactId && l.projectId === projectId
  );
  if (existing) {
    return { token: existing.token }; // Return existing link
  }

  const token = generateToken();
  const linkData = {
    token,
    userId,
    projectId,
    contactId,
    contactName,
    contactRole,
    createdAt: new Date().toISOString(),
  };

  try {
    await set(ref(db, `contractorLinks/${token}`), linkData);
    return { token };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { error: `Failed to create link: ${msg}` };
  }
}

/**
 * Revoke a contractor link.
 */
export async function revokeContractorLink(token: string): Promise<void> {
  await update(ref(db, `contractorLinks/${token}`), {
    revokedAt: new Date().toISOString(),
  });
}

/**
 * Get all active (non-revoked) contractor links for a user.
 */
export async function getActiveContractorLinks(
  userId: string
): Promise<ContractorLink[]> {
  const snap = await get(ref(db, "contractorLinks"));
  if (!snap.exists()) return [];

  const all = snap.val() as Record<string, ContractorLink>;
  return Object.values(all).filter(
    (l) => l.userId === userId && !l.revokedAt
  );
}

/**
 * Get contractor links for a specific project.
 */
export async function getProjectContractorLinks(
  userId: string,
  projectId: string
): Promise<ContractorLink[]> {
  const all = await getActiveContractorLinks(userId);
  return all.filter((l) => l.projectId === projectId);
}

/**
 * Subscribe to contractor links for a specific project (real-time).
 */
export function subscribeToProjectContractorLinks(
  userId: string,
  projectId: string,
  callback: (links: ContractorLink[]) => void
): () => void {
  const linksRef = ref(db, "contractorLinks");
  return onValue(linksRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const all = snap.val() as Record<string, ContractorLink>;
    const filtered = Object.values(all).filter(
      (l) => l.userId === userId && l.projectId === projectId && !l.revokedAt
    );
    callback(filtered);
  });
}

/**
 * Validate a contractor token. Returns the link data if valid.
 */
export async function validateContractorToken(
  token: string
): Promise<ContractorLink | null> {
  const snap = await get(ref(db, `contractorLinks/${token}`));
  if (!snap.exists()) return null;
  const link = snap.val() as ContractorLink;
  if (link.revokedAt) return null;
  return link;
}

/**
 * Contractor: submit task completion with optional photos and note.
 * If task requires approval, goes to "pending-review". Otherwise "done".
 */
export async function contractorSubmitTask(
  token: string,
  userId: string,
  projectId: string,
  taskId: string,
  data: {
    completionNote?: string;
    completionPhotos?: { url: string; caption?: string; latitude?: number; longitude?: number; timestamp?: string }[];
    timeSpent?: number;
  },
  requiresApproval: boolean
): Promise<void> {
  const link = await validateContractorToken(token);
  if (!link || link.userId !== userId || link.projectId !== projectId) {
    throw new Error("Invalid or expired link");
  }
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), {
    completedBy: link.contactName,
    completedAt: new Date().toISOString(),
    completionNote: data.completionNote || null,
    completionPhotos: data.completionPhotos || null,
    timeSpent: data.timeSpent || null,
    status: requiresApproval ? "pending-review" : "done",
    done: !requiresApproval,
  });
}

/**
 * Contractor: start working on a task (move to in-progress).
 */
export async function contractorStartTask(
  token: string,
  userId: string,
  projectId: string,
  taskId: string
): Promise<void> {
  const link = await validateContractorToken(token);
  if (!link || link.userId !== userId || link.projectId !== projectId) {
    throw new Error("Invalid or expired link");
  }
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), {
    status: "in-progress",
  });
}

/**
 * Contractor: add a comment to a task thread.
 */
export async function contractorAddComment(
  token: string,
  userId: string,
  projectId: string,
  taskId: string,
  content: string
): Promise<void> {
  const link = await validateContractorToken(token);
  if (!link || link.userId !== userId || link.projectId !== projectId) {
    throw new Error("Invalid or expired link");
  }
  const commentsRef = ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}/comments`);
  await push(commentsRef, {
    authorName: link.contactName,
    authorRole: "contractor",
    content,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Contractor: upload a photo to the project.
 */
export async function contractorAddPhoto(
  token: string,
  userId: string,
  projectId: string,
  photoData: {
    fileUrl: string;
    caption: string;
    phase?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<void> {
  const link = await validateContractorToken(token);
  if (!link || link.userId !== userId || link.projectId !== projectId) {
    throw new Error("Invalid or expired link");
  }
  const photosRef = ref(db, `users/${userId}/projects/${projectId}/photos`);
  await push(photosRef, {
    ...photoData,
    uploadedBy: link.contactName,
    uploadedRole: link.contactRole,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
}
