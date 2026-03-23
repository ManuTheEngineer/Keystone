/**
 * Environment variable validation.
 *
 * Validates required env vars at import time so the app fails fast with
 * a clear message instead of crashing on the first request that needs them.
 */

interface EnvVar {
  key: string;
  required: boolean;
  /** If true, this is a client-side NEXT_PUBLIC_ var (always available) */
  public?: boolean;
}

const ENV_VARS: EnvVar[] = [
  // Firebase (public — embedded in client bundle)
  { key: "NEXT_PUBLIC_FIREBASE_API_KEY", required: true, public: true },
  { key: "NEXT_PUBLIC_FIREBASE_DATABASE_URL", required: false, public: true },

  // Stripe
  { key: "STRIPE_SECRET_KEY", required: true },
  { key: "STRIPE_WEBHOOK_SECRET", required: true },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, public: true },

  // Stripe Price IDs
  { key: "NEXT_PUBLIC_STRIPE_BUILDER_MONTHLY", required: false, public: true },
  { key: "NEXT_PUBLIC_STRIPE_BUILDER_ANNUAL", required: false, public: true },
  { key: "NEXT_PUBLIC_STRIPE_DEVELOPER_MONTHLY", required: false, public: true },
  { key: "NEXT_PUBLIC_STRIPE_DEVELOPER_ANNUAL", required: false, public: true },
  { key: "NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY", required: false, public: true },
  { key: "NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL", required: false, public: true },

  // AI
  { key: "CLAUDE_API_KEY", required: false },

  // Market data APIs
  { key: "CENSUS_API_KEY", required: false },
  { key: "HUD_API_TOKEN", required: false },
  { key: "BLS_API_KEY", required: false },
  { key: "FRED_API_KEY", required: false },

  // Firebase server-side
  { key: "FIREBASE_DATABASE_SECRET", required: false },
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { key, required } of ENV_VARS) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      if (required) {
        missing.push(key);
      } else {
        warnings.push(key);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Log environment validation results on server startup.
 * Call this from the root layout's server component.
 */
export function logEnvValidation(): void {
  // Only run on the server
  if (typeof window !== "undefined") return;

  const result = validateEnv();

  if (result.missing.length > 0) {
    console.error(
      `[Keystone] Missing required environment variables:\n  ${result.missing.join("\n  ")}`
    );
  }

  if (result.warnings.length > 0) {
    console.warn(
      `[Keystone] Optional environment variables not set (some features may be unavailable):\n  ${result.warnings.join("\n  ")}`
    );
  }
}
