"use client";

import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <div
      style={{
        fontFamily: '"DM Sans", system-ui, sans-serif',
        background: "#FDF8F0",
        color: "#3A3A3A",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", padding: "2rem", maxWidth: "420px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(188, 108, 37, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <WifiOff size={32} color="#BC6C25" />
        </div>

        <h1
          style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: "1.75rem",
            color: "#2C1810",
            marginBottom: "0.75rem",
          }}
        >
          You are offline
        </h1>

        <p
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "#6A6A6A",
            marginBottom: "2rem",
          }}
        >
          Your internet connection is unavailable. Any changes you made while
          connected are saved. When your connection returns, everything will
          sync automatically.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => window.location.reload()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.5rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
              background: "#2C1810",
              color: "#F5E6D3",
            }}
          >
            <RefreshCw size={16} />
            Try again
          </button>

          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.5rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              borderRadius: "0.75rem",
              border: "1px solid #D4A574",
              cursor: "pointer",
              background: "transparent",
              color: "#2C1810",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            Go home
          </a>
        </div>

        <p
          style={{
            marginTop: "2rem",
            fontSize: "0.75rem",
            color: "#9A9A9A",
          }}
        >
          Pages you have visited before may still be available offline.
        </p>
      </div>
    </div>
  );
}
