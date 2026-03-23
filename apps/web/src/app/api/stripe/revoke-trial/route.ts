import { NextRequest } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { dbGet, dbPatch } from "@/lib/firebase-rest";
import { revokeTrialSchema, parseBody } from "@/lib/validators/api-schemas";
import { apiSuccess, apiError } from "@/lib/api-response";

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

    const raw = await request.json();
    const parsed = parseBody(revokeTrialSchema, raw);
    if (!parsed.success) return parsed.response;

    const { code } = parsed.data;

    const codeData = await dbGet(`trialCodes/${code}`);
    if (!codeData) {
      return apiError("Code not found", { status: 404 });
    }

    const usedBy = normalizeUsedBy(codeData.usedBy);
    let revokedCount = 0;
    const errors: string[] = [];

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
      } catch {
        errors.push(uid);
      }
    }

    await dbPatch(`trialCodes/${code}`, {
      revokedAt: new Date().toISOString(),
    });

    if (errors.length > 0) {
      return apiSuccess(
        { revokedUsers: revokedCount },
        {
          status: 207,
          meta: { warning: `Failed to revert ${errors.length} user(s): ${errors.join(", ")}` },
        }
      );
    }

    return apiSuccess({ revokedUsers: revokedCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Revocation failed";
    return apiError(message, { status: 500 });
  }
}
