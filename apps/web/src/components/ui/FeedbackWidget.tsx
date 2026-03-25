"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquarePlus, X, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePathname } from "next/navigation";

type FeedbackType = "bug" | "feature" | "general";

const TYPE_OPTIONS: { value: FeedbackType; label: string; description: string }[] = [
  { value: "bug", label: "Bug report", description: "Something is broken or not working right" },
  { value: "feature", label: "Feature request", description: "Something you wish Keystone could do" },
  { value: "general", label: "General feedback", description: "Thoughts, questions, or suggestions" },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  const pathname = usePathname();

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Reset form when reopened
  useEffect(() => {
    if (open) {
      setSent(false);
      setMessage("");
      setType("bug");
    }
  }, [open]);

  async function handleSubmit() {
    if (!message.trim()) return;
    setSending(true);
    setSubmitError(null);

    try {
      // Store feedback in Firebase under a global feedbacks node
      const { ref, push, set } = await import("firebase/database");
      const { db } = await import("@/lib/firebase");

      await set(push(ref(db, "feedbacks")), {
        type,
        message: message.trim(),
        page: pathname,
        userId: user?.uid ?? "anonymous",
        userEmail: profile?.email ?? user?.email ?? "unknown",
        userName: profile?.name ?? "unknown",
        userPlan: profile?.plan ?? "FOUNDATION",
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      });

      setSent(true);
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch {
      // Store under user's own node as fallback (always writable by the user)
      try {
        const { ref, push, set } = await import("firebase/database");
        const { db } = await import("@/lib/firebase");

        if (user?.uid) {
          await set(push(ref(db, `users/${user.uid}/feedbacks`)), {
            type,
            message: message.trim(),
            page: pathname,
            timestamp: new Date().toISOString(),
          });
          setSent(true);
          setTimeout(() => setOpen(false), 2000);
          return;
        }
      } catch {
        // Both paths failed
      }
      setSubmitError("Could not send feedback. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  // Success state
  if (open && sent) {
    return (
      <div ref={formRef} className="fixed bottom-28 right-5 z-50 w-80 bg-surface border border-border/60 rounded-2xl shadow-xl p-6 text-center animate-fade-in">
        <CheckCircle size={32} className="text-success mx-auto mb-3" />
        <p className="text-[14px] font-medium text-earth" style={{ fontFamily: "var(--font-heading)" }}>
          Thank you for your feedback
        </p>
        <p className="text-[12px] text-muted mt-1">
          We read every submission and will follow up if needed.
        </p>
      </div>
    );
  }

  // Form state
  if (open) {
    return (
      <div ref={formRef} className="fixed bottom-28 right-5 z-50 w-80 bg-surface border border-border/60 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <p className="text-[13px] font-medium text-earth">Send feedback</p>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-earth transition-colors" aria-label="Close feedback">
            <X size={16} />
          </button>
        </div>

        {/* Type selector */}
        <div className="px-4 pt-3 flex gap-1.5">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                type === opt.value
                  ? "bg-clay/10 text-clay border border-clay/30"
                  : "bg-warm/20 text-muted hover:bg-warm/40 border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Description hint */}
        <p className="px-4 pt-1.5 text-[10px] text-muted">
          {TYPE_OPTIONS.find((o) => o.value === type)?.description}
        </p>

        {/* Message */}
        <div className="px-4 pt-2 pb-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === "bug"
                ? "What happened? What did you expect?"
                : type === "feature"
                ? "What would you like Keystone to do?"
                : "What's on your mind?"
            }
            className="w-full h-24 px-3 py-2 text-[12px] bg-warm/20 border border-border/30 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-clay/30 text-earth placeholder:text-muted/50"
            autoFocus
          />

          {submitError && (
            <p className="text-[10px] text-danger mb-2">{submitError}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-[9px] text-muted/50">
              Page: {pathname}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || sending}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium bg-earth text-warm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send size={12} />
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed button
  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-16 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-earth text-warm rounded-xl shadow-lg hover:opacity-90 transition-opacity text-[11px] font-medium"
      aria-label="Send feedback"
    >
      <MessageSquarePlus size={14} />
      Feedback
    </button>
  );
}
