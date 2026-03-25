import { NextRequest } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { dbPatch } from "@/lib/firebase-rest";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * POST /api/feedback
 *
 * Stores user feedback in the global feedbacks node using the
 * database secret (bypasses client-side Firebase rules).
 * This ensures feedback always lands in one place regardless
 * of whether Firebase rules have been deployed.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    const { type, message, page } = body;

    if (!type || !message) {
      return apiError("Type and message are required", { status: 400 });
    }

    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await dbPatch("feedbacks", {
      [feedbackId]: {
        type,
        message: String(message).slice(0, 5000),
        page: page ?? "unknown",
        userId: authResult.uid,
        userEmail: body.userEmail ?? "unknown",
        userName: body.userName ?? "unknown",
        userPlan: body.userPlan ?? "FOUNDATION",
        userAgent: body.userAgent ?? "",
        screenSize: body.screenSize ?? "",
        timestamp: new Date().toISOString(),
      },
    });

    return apiSuccess({ id: feedbackId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save feedback";
    return apiError(msg, { status: 500 });
  }
}
