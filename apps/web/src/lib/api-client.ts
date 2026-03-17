import { auth } from "@/lib/firebase";

/**
 * Returns Authorization headers with the current user's Firebase ID token.
 * Call this before any authenticated API request.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return { "Content-Type": "application/json" };
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
