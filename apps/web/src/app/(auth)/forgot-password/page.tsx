"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/services/auth-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

const quotes = [
  {
    text: "Every great building once began as a building plan. Every great project starts with a single step.",
    author: "Unknown",
  },
  {
    text: "A house is made of walls and beams; a home is built with love and dreams.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "The best time to build was twenty years ago. The second best time is today.",
    author: "African proverb",
  },
];

export default function ForgotPasswordPage() {
  // Detect browser language for unauthenticated pages
  const browserLocale: Locale = typeof navigator !== "undefined"
    ? (navigator.language.startsWith("fr") ? "fr" : navigator.language.startsWith("es") ? "es" : "en")
    : "en";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFadeIn(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("network-request-failed")) {
        setError("Network error. Check your connection and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left half - Form */}
      <div className="w-full lg:w-[55%] bg-background flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-8 pt-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <KeystoneIcon size={24} className="text-earth" />
            <span className="text-[15px] font-semibold text-earth tracking-tight">
              KEYSTONE
            </span>
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-[380px]">
            <div className="mb-8">
              <h1
                className="text-[28px] text-earth leading-tight"
              >
                {t("auth.resetPassword", browserLocale)}
              </h1>
              <p className="text-[14px] text-muted mt-1.5">
                {t("auth.resetInstructions", browserLocale)}
              </p>
            </div>

            {sent ? (
              <div>
                <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-success-bg text-success text-[14px]">
                  <CheckCircle size={18} />
                  {t("auth.checkInbox", browserLocale)}
                </div>
                <p className="text-center text-[13px] text-muted mt-7">
                  <Link href="/login" className="text-clay hover:text-clay-light font-medium transition-colors">
                    {t("auth.backToSignIn", browserLocale)}
                  </Link>
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-danger-bg text-danger text-[13px]">
                      <AlertTriangle size={15} />
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-[13px] font-medium text-earth mb-1.5">
                      {t("auth.email", browserLocale)}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 text-[14px] border border-border rounded-xl bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 text-[15px] font-medium rounded-xl btn-earth active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loading ? t("auth.sending", browserLocale) : t("auth.sendResetLink", browserLocale)}
                  </button>
                </form>

                <p className="text-center text-[13px] text-muted mt-7">
                  <Link href="/login" className="text-clay hover:text-clay-light font-medium transition-colors">
                    {t("auth.backToSignIn", browserLocale)}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right half - Gradient with quote */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, var(--color-earth) 0%, var(--color-clay) 100%)" }}
      >
        {/* Architectural line pattern */}
        <svg
          className="absolute inset-0 w-full h-full text-warm"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.1 }}
        >
          <defs>
            <pattern id="archLinesFp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 L60 30" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M30 0 L30 60" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M0 0 L60 60" stroke="currentColor" strokeWidth="0.3" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#archLinesFp)" />
        </svg>

        {/* Quote content */}
        <div className="relative z-10 max-w-md text-center">
          <div
            className="transition-opacity duration-400"
            style={{ opacity: fadeIn ? 1 : 0 }}
          >
            <p
              className="text-[24px] leading-relaxed text-warm italic font-heading"
            >
              &ldquo;{quotes[quoteIndex].text}&rdquo;
            </p>
            <p
              className="mt-4 text-[12px] text-sand tracking-wide"
            >
              - {quotes[quoteIndex].author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
