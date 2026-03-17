"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Bell, X, Check } from "lucide-react";
import type { AppNotification } from "@/lib/notifications";

interface NotificationBellProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

const typeBorderColor: Record<string, string> = {
  urgent: "border-l-danger",
  warning: "border-l-warning",
  reminder: "border-l-blue-500",
  info: "border-l-muted",
};

const typeDotColor: Record<string, string> = {
  urgent: "bg-danger",
  warning: "bg-warning",
  reminder: "bg-blue-500",
  info: "bg-muted",
};

function formatNotificationTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export const NotificationBell = memo(function NotificationBell({ notifications, onDismiss, onDismissAll }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg text-earth hover:bg-warm transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-danger text-white text-[9px] font-bold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-[360px] max-h-[400px] bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h4
              className="text-[14px] font-semibold text-earth"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Notifications
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onDismissAll();
                }}
                className="flex items-center gap-1 text-[11px] text-clay hover:text-earth transition-colors"
              >
                <Check size={12} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-[340px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto text-muted/40 mb-2" />
                <p className="text-[12px] text-muted">
                  No new notifications. Your projects are on track.
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      flex items-start gap-3 px-4 py-3 border-l-[3px] border-b border-b-border/40
                      ${typeBorderColor[notification.type] ?? "border-l-muted"}
                      ${notification.read ? "opacity-60" : "bg-warm/20"}
                      hover:bg-warm/30 transition-colors
                    `}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeDotColor[notification.type] ?? "bg-muted"}`}
                    />
                    <div className="flex-1 min-w-0">
                      {notification.href ? (
                        <a
                          href={notification.href}
                          className="block"
                          onClick={() => setOpen(false)}
                        >
                          <p className="text-[12px] font-medium text-earth leading-snug">
                            {notification.title}
                          </p>
                          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                            {notification.message}
                          </p>
                        </a>
                      ) : (
                        <>
                          <p className="text-[12px] font-medium text-earth leading-snug">
                            {notification.title}
                          </p>
                          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                            {notification.message}
                          </p>
                        </>
                      )}
                      <p className="text-[10px] text-muted/60 font-data mt-1">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDismiss(notification.id)}
                      className="p-1 rounded text-muted/40 hover:text-muted hover:bg-surface-alt transition-colors shrink-0"
                      aria-label="Dismiss notification"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
