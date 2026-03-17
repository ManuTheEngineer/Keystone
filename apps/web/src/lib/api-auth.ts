import { NextRequest, NextResponse } from "next/server";

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
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const data = await res.json();
    if (!data.users || data.users.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return { uid: data.users[0].localId };
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
