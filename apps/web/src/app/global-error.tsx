"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "system-ui" }}>
          <h2 style={{ marginBottom: "16px" }}>Something went wrong</h2>
          <p style={{ marginBottom: "24px", color: "#6A6A6A" }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 24px",
              background: "#8B4513",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
