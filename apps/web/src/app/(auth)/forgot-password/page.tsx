"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/services/auth-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <KeystoneIcon size={44} className="text-sand mx-auto mb-3" />
        <h1 className="text-2xl text-earth">Reset password</h1>
        <p className="text-[13px] text-muted mt-1">
          Enter your email and we will send a reset link
        </p>
      </div>

      {sent ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-success-bg text-success text-[13px] mb-4">
            <CheckCircle size={16} />
            Reset link sent. Check your inbox.
          </div>
          <Link href="/login" className="text-[12px] text-info hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-bg text-danger text-[12px]">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-earth mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-[13px] font-medium rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <p className="text-center">
            <Link href="/login" className="text-[12px] text-info hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
