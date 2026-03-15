"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/services/auth-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      if (message.includes("user-not-found") || message.includes("wrong-password") || message.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <KeystoneIcon size={44} className="text-sand mx-auto mb-3" />
        <h1 className="text-2xl text-earth">Welcome back</h1>
        <p className="text-[13px] text-muted mt-1">Sign in to your Keystone account</p>
      </div>

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

        <div>
          <label className="block text-[12px] font-medium text-earth mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Your password"
          />
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-[11px] text-info hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-[13px] font-medium rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-[12px] text-muted mt-6">
        No account yet?{" "}
        <Link href="/register" className="text-info hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
