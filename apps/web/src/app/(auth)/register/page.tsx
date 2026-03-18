"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/services/auth-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

const quotes = [
  {
    text: "The best time to build was twenty years ago. The second best time is today.",
    author: "African proverb",
  },
  {
    text: "Every great building once began as a building plan. Every great project starts with a single step.",
    author: "Unknown",
  },
  {
    text: "A house is made of walls and beams; a home is built with love and dreams.",
    author: "Ralph Waldo Emerson",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  // Detect browser language for unauthenticated pages
  const browserLocale: Locale = typeof navigator !== "undefined"
    ? (navigator.language.startsWith("fr") ? "fr" : navigator.language.startsWith("es") ? "es" : "en")
    : "en";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [market, setMarket] = useState("USA");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    // Validate all fields (Bug #2: empty form shows no error)
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    // Bug #1: validate email format before sending to Firebase
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    // Bug #3: don't reset checkbox — just validate it
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(email.trim().toLowerCase(), password, name.trim(), market);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (message.includes("weak-password")) {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (message.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (message.includes("network-request-failed")) {
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
                {t("auth.getStarted", browserLocale)}
              </h1>
              <p className="text-[14px] text-muted mt-1.5">
                {t("auth.buildFirst", browserLocale)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-danger-bg text-danger text-[13px]">
                  <AlertTriangle size={15} />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-earth mb-1.5">
                  {t("auth.name", browserLocale)}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 text-[14px] border border-border rounded-xl bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  placeholder="Ayo Kessington"
                />
              </div>

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

              <div>
                <label className="block text-[13px] font-medium text-earth mb-1.5">
                  {t("auth.password", browserLocale)}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3.5 pr-12 text-[14px] border border-border rounded-xl bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                    placeholder={t("auth.minChars", browserLocale)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-earth transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="h-5 mt-1.5">
                  {password.length === 0 ? (
                    <p className="text-[11px] text-muted/60">{t("auth.minChars", browserLocale)}</p>
                  ) : password.length < 6 ? (
                    <p className="text-[11px] text-danger">{t("auth.tooShort", browserLocale)}</p>
                  ) : password.length < 10 ? (
                    <p className="text-[11px] text-warning">{t("auth.fair", browserLocale)}</p>
                  ) : (
                    <p className="text-[11px] text-success">{t("auth.strong", browserLocale)}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-earth mb-1.5">
                  Where are you building?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "USA", label: "USA", flag: "US" },
                    { id: "TOGO", label: "Togo", flag: "TG" },
                    { id: "GHANA", label: "Ghana", flag: "GH" },
                    { id: "BENIN", label: "Benin", flag: "BJ" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMarket(m.id)}
                      className={`py-2.5 text-[12px] font-medium rounded-lg border transition-colors ${
                        market === m.id
                          ? "border-emerald-500 bg-emerald-50 text-earth"
                          : "border-border bg-surface text-muted hover:border-sand"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted mt-1">Sets your default currency and language</p>
              </div>

              <label className="flex items-start gap-2.5 text-[12px] text-muted">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-emerald-500"
                />
                <span>
                  {t("auth.agreeTerms", browserLocale)}{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-clay underline">{t("auth.terms", browserLocale)}</a>
                  {" "}{t("auth.and", browserLocale)}{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-clay underline">{t("auth.privacy", browserLocale)}</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full py-3.5 text-[15px] font-medium rounded-xl btn-earth active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? t("auth.creating", browserLocale) : t("auth.createAccount", browserLocale)}
              </button>
            </form>

            <p className="text-center text-[13px] text-muted mt-7">
              {t("auth.haveAccount", browserLocale)}{" "}
              <Link href="/login" className="text-clay hover:text-clay-light font-medium transition-colors">
                {t("auth.signIn", browserLocale)}
              </Link>
            </p>
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
            <pattern id="archLinesReg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 L60 30" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M30 0 L30 60" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M0 0 L60 60" stroke="currentColor" strokeWidth="0.3" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#archLinesReg)" />
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
