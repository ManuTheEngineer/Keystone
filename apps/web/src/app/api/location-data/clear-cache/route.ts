import { NextRequest } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  || "https://keystone-21811-default-rtdb.firebaseio.com";

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if (isAuthError(authResult)) return authResult;

  const secret = process.env.FIREBASE_DATABASE_SECRET;
  if (!secret) {
    return apiError("No database secret configured", { status: 500 });
  }

  try {
    const res = await fetch(`${DB_URL}/locationCache.json?auth=${secret}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return apiError("Failed to clear cache", { status: 500 });
    }
    return apiSuccess({ message: "Location cache cleared" });
  } catch {
    return apiError("Cache clear failed", { status: 500 });
  }
}
