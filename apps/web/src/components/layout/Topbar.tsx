"use client";

import { memo } from "react";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import type { AppNotification } from "@/lib/notifications";

interface TopbarProps {
  title: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "info" | "danger";
  onMenuToggle: () => void;
  notifications?: AppNotification[];
  onDismissNotification?: (id: string) => void;
  onDismissAllNotifications?: () => void;
  onOpenNotifications?: () => void;
}

const badgeStyles = {
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  info: "bg-info/10 text-info border border-info/20",
  danger: "bg-danger/10 text-danger border border-danger/20",
};

export const Topbar = memo(function Topbar({
  title,
  badge,
  badgeVariant = "info",
  onMenuToggle,
  notifications = [],
  onDismissNotification,
  onDismissAllNotifications,
  onOpenNotifications,
}: TopbarProps) {
  return (
    <header className="px-4 sm:px-6 py-4 bg-background flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-earth hover:bg-warm transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-[17px] text-earth">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <GlobalSearch />
        {badge && (
          <span
            className={`text-[10px] px-3 py-1 rounded-full font-medium ${badgeStyles[badgeVariant]}`}
          >
            {badge}
          </span>
        )}
        <NotificationBell
          notifications={notifications}
          onDismiss={onDismissNotification ?? (() => {})}
          onDismissAll={onDismissAllNotifications ?? (() => {})}
          onOpen={onOpenNotifications}
        />
      </div>
    </header>
  );
});
