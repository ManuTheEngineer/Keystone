import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Maximum request body size in bytes (1 MB) */
const MAX_BODY_SIZE = 1_048_576;

/**
 * Next.js middleware — runs on every request.
 * Adds security headers + basic request-size guard.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ── Security headers ──────────────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(self), interest-cohort=()"
  );

  // HSTS — only on production (Vercel handles TLS)
  if (request.nextUrl.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // CSP in report-only mode — logs violations without blocking anything.
  // Move to enforcing "Content-Security-Policy" once all violations are resolved.
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.firebasestorage.app https://*.googleapis.com",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.anthropic.com https://api.stripe.com https://geocoding.geo.census.gov https://api.census.gov https://www.huduser.gov https://api.bls.gov https://api.stlouisfed.org https://api.worldbank.org wss://*.firebaseio.com",
      "frame-src 'self' https://js.stripe.com https://*.firebaseapp.com",
      "child-src 'self'",
      "worker-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // ── Request size guard for API routes ─────────────────────────────
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large", meta: { maxBytes: MAX_BODY_SIZE } },
        { status: 413 }
      );
    }

    // ── CSRF protection for mutating API requests ───────────────────
    // Stripe webhooks are authenticated via signature, not CSRF token
    const isWebhook = request.nextUrl.pathname.startsWith("/api/stripe/webhook");
    const method = request.method.toUpperCase();
    if (!isWebhook && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (origin && host) {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "CSRF validation failed" },
            { status: 403 }
          );
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Only match page routes and API routes — skip all Next.js internals and static assets
    "/((?!_next|favicon|icons|sw\\.js|manifest\\.json|offline).*)",
  ],
};
