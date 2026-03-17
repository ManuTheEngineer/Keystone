/**
 * Shared Firebase Realtime Database REST API helpers for server-side routes.
 * Used by Stripe webhook, verify, and revoke-trial routes that need to
 * write to user profiles without the Firebase client SDK.
 */

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  || "https://keystone-21811-default-rtdb.firebaseio.com";

function authUrl(path: string): string {
  const secret = process.env.FIREBASE_DATABASE_SECRET;
  const authParam = secret ? `?auth=${secret}` : "";
  return `${DB_URL}/${path}.json${authParam}`;
}

export async function dbGet(path: string) {
  const res = await fetch(authUrl(path));
  if (!res.ok) return null;
  return res.json();
}

export async function dbPatch(path: string, data: Record<string, unknown>) {
  const res = await fetch(authUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Firebase write failed:", res.status, errorText);
    throw new Error(`Firebase write to ${path} failed: ${res.status}`);
  }
}

export async function updateProfile(userId: string, data: Record<string, unknown>) {
  await dbPatch(`users/${userId}/profile`, data);
}
