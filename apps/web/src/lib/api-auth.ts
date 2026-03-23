import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./firebase-admin";

/**
 * Verifies a Firebase ID token from the Authorization header.
 * Returns the authenticated user's UID, or a 401 NextResponse on failure.
 */
export async function verifyAuth(
  request: NextRequest
): Promise<{ uid: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { uid: decodedToken.uid };
  } catch {
    return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
  }
}

/** Type guard: true if verifyAuth returned an error response */
export function isAuthError(
  result: { uid: string } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
