import { NextResponse } from "next/server";

/**
 * Standardized API response helpers.
 *
 * All API routes should return { data?, error?, meta? } for consistency.
 * This matches the CLAUDE.md specification.
 */

interface ApiSuccessOptions {
  status?: number;
  meta?: Record<string, unknown>;
}

interface ApiErrorOptions {
  status?: number;
  meta?: Record<string, unknown>;
  details?: unknown;
}

/** Return a success response with the standard { data, meta } shape */
export function apiSuccess<T>(data: T, options: ApiSuccessOptions = {}) {
  const { status = 200, meta } = options;
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status });
}

/** Return an error response with the standard { error, meta } shape */
export function apiError(message: string, options: ApiErrorOptions = {}) {
  const { status = 500, meta, details } = options;
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}), ...(meta ? { meta } : {}) },
    { status }
  );
}
