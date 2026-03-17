"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-background">
      <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-danger" />
      </div>
      <h2
        className="text-[22px] text-earth mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Something went wrong
      </h2>
      <p className="text-[13px] text-muted mb-6 max-w-md leading-relaxed">
        An error occurred while loading this page. Please try again.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 text-[13px] font-medium bg-earth text-warm rounded-xl hover:bg-earth-light transition-colors"
        >
          Try again
        </button>
        <a
          href="/login"
          className="px-5 py-2.5 text-[13px] font-medium border border-border text-earth rounded-xl hover:bg-surface-alt transition-colors"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}
