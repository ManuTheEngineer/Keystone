"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/services/auth-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await registerUser(email.trim().toLowerCase(), password, name.trim());
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
                Create your account
              </h1>
              <p className="text-[14px] text-muted mt-1.5">
                Start building with confidence
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
                  Full name
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
                  Email address
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
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3.5 pr-12 text-[14px] border border-border rounded-xl bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                    placeholder="Min. 6 characters"
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
                    <p className="text-[11px] text-muted/60">Minimum 6 characters</p>
                  ) : password.length < 6 ? (
                    <p className="text-[11px] text-danger">Too short — {6 - password.length} more needed</p>
                  ) : password.length < 10 ? (
                    <p className="text-[11px] text-warning">Fair — add numbers or symbols for a stronger password</p>
                  ) : (
                    <p className="text-[11px] text-success">Strong password</p>
                  )}
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-[12px] text-muted">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-emerald-500"
                />
                <span>
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-clay underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-clay underline">Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full py-3.5 text-[15px] font-medium rounded-xl btn-earth active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-[13px] text-muted mt-7">
              Already have an account?{" "}
              <Link href="/login" className="text-clay hover:text-clay-light font-medium transition-colors">
                Sign in
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
