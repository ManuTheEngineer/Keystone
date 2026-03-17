import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { dbGet, dbPatch } from "@/lib/firebase-rest";

// Firebase stores JS arrays as objects with numeric keys.
// Normalize to a proper string array regardless of shape.
function normalizeUsedBy(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === "string");
  if (typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>).filter(
      (v) => typeof v === "string"
    ) as string[];
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Get the trial code data
    const codeData = await dbGet(`trialCodes/${code}`);
    if (!codeData) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    const usedBy = normalizeUsedBy(codeData.usedBy);
    let revokedCount = 0;
    const errors: string[] = [];

    // Revert each user who used this code back to Foundation
    // (only if they're still on a trial, not if they've since paid)
    for (const uid of usedBy) {
      try {
        const profile = await dbGet(`users/${uid}/profile`);
        if (
          profile &&
          profile.subscriptionStatus === "trialing" &&
          profile.trialCodeUsed === code
        ) {
          await dbPatch(`users/${uid}/profile`, {
            plan: "FOUNDATION",
            trialExpiresAt: null,
            trialCodeUsed: null,
            subscriptionStatus: null,
          });
          revokedCount++;
        }
      } catch (err: any) {
        console.error(`Failed to revert user ${uid}:`, err.message);
        errors.push(uid);
      }
    }

    // Mark the code as revoked
    await dbPatch(`trialCodes/${code}`, {
      revokedAt: new Date().toISOString(),
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: true,
          revokedUsers: revokedCount,
          warning: `Failed to revert ${errors.length} user(s): ${errors.join(", ")}`,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true, revokedUsers: revokedCount });
  } catch (error: any) {
    console.error("Revoke trial error:", error);
    return NextResponse.json({ error: error.message || "Revocation failed" }, { status: 500 });
  }
}
