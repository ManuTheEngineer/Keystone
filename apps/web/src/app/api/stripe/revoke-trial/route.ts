import { NextRequest, NextResponse } from "next/server";

const DB_URL = "https://keystone-21811-default-rtdb.firebaseio.com";

function authUrl(path: string): string {
  const secret = process.env.FIREBASE_DATABASE_SECRET;
  const authParam = secret ? `?auth=${secret}` : "";
  return `${DB_URL}/${path}.json${authParam}`;
}

async function dbGet(path: string) {
  const res = await fetch(authUrl(path));
  if (!res.ok) return null;
  return res.json();
}

async function dbPatch(path: string, data: Record<string, unknown>) {
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
