import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Maximum request body size in bytes (1 MB) */
const MAX_BODY_SIZE = 1_048_576;

/**
 * Next.js middleware — adds security headers to API routes only.
 * Page routes are left untouched to avoid interfering with client-side navigation.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // ── Security headers (all routes) ─────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (request.nextUrl.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // ── API-only protections ──────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Request size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large", meta: { maxBytes: MAX_BODY_SIZE } },
        { status: 413 }
      );
    }

    // CSRF protection (skip Stripe webhooks — authenticated via signature)
    const isWebhook = pathname.startsWith("/api/stripe/webhook");
    const method = request.method.toUpperCase();
    if (!isWebhook && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return NextResponse.json(
              { error: "CSRF validation failed" },
              { status: 403 }
            );
          }
        } catch {
          // Malformed origin header — allow through
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Only run on API routes — leave page navigation completely untouched
    "/api/:path*",
  ],
};
