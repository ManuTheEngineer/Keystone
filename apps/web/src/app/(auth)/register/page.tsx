"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/services/auth-service";
import { seedDemoProject } from "@/lib/services/project-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { AlertTriangle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const user = await registerUser(email, password, name);
      // Seed a demo project so the dashboard is not empty
      await seedDemoProject(user.uid);
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
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
        <h1 className="text-2xl text-earth">Create your account</h1>
        <p className="text-[13px] text-muted mt-1">Start building with confidence</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-bg text-danger text-[12px]">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div>
          <label className="block text-[12px] font-medium text-earth mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Ayo Kessington"
          />
        </div>

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
            minLength={6}
            className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Min. 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-[13px] font-medium rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-[12px] text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-info hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
