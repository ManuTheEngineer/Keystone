"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2
          className="text-[22px] text-earth mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Something went wrong
        </h2>
        <p className="text-[13px] text-muted mb-6 leading-relaxed">
          An unexpected error occurred. Your data is safe. Try refreshing the page, or go back to the dashboard.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 text-[13px] font-medium bg-earth text-warm rounded-xl hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 text-[13px] font-medium border border-border text-earth rounded-xl hover:bg-warm/30 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
