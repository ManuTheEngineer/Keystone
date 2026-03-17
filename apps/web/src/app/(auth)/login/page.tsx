"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/services/auth-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { AlertTriangle } from "lucide-react";

const quotes = [
  {
    text: "The foundation of every great structure is laid long before the first brick. Planning is where profit is made or lost.",
    author: "Keystone Principle",
  },
  {
    text: "Real estate cannot be lost or stolen, nor can it be carried away. Managed with reasonable care, it is about the safest investment in the world.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "Do not wait to buy real estate. Buy real estate and wait. The best developers started before they felt ready.",
    author: "Will Rogers (adapted)",
  },
  {
    text: "Every wall you raise, every foundation you pour, every key you hand over brings you closer to financial freedom.",
    author: "Keystone Principle",
  },
  {
    text: "The difference between a builder and a developer is simple. A builder constructs a house. A developer creates wealth.",
    author: "Keystone Principle",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      await signIn(email.trim().toLowerCase(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      if (
        message.includes("user-not-found") ||
        message.includes("wrong-password") ||
        message.includes("invalid-credential")
      ) {
        setError("Invalid email or password.");
      } else if (message.includes("too-many-requests")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (message.includes("user-disabled")) {
        setError("This account has been disabled. Please contact support.");
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
                Welcome back
              </h1>
              <p className="text-[14px] text-muted mt-1.5">
                Sign in to continue building
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium text-earth">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] text-clay hover:text-clay-light transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 text-[14px] border border-border rounded-xl bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  placeholder="Your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-[15px] font-medium rounded-xl btn-earth active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-center text-[13px] text-muted mt-7">
              New to Keystone?{" "}
              <Link href="/register" className="text-clay hover:text-clay-light font-medium transition-colors">
                Create an account
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
            <pattern id="archLines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 L60 30" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M30 0 L30 60" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M0 0 L60 60" stroke="currentColor" strokeWidth="0.3" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#archLines)" />
        </svg>

        {/* Quote content */}
        <div className="relative z-10 max-w-md text-center">
          <div
            className="transition-opacity duration-400"
            style={{ opacity: fadeIn ? 1 : 0 }}
          >
            <p
              className="text-[24px] leading-relaxed italic text-warm font-heading"
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
