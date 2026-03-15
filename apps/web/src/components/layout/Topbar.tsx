"use client";

import { Menu } from "lucide-react";

interface TopbarProps {
  title: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "info" | "danger";
  onMenuToggle: () => void;
}

const badgeStyles = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  info: "bg-info-bg text-info",
  danger: "bg-danger-bg text-danger",
};

export function Topbar({ title, badge, badgeVariant = "info", onMenuToggle }: TopbarProps) {
  return (
    <header className="px-6 py-3.5 border-b border-border bg-surface flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-earth hover:bg-surface-alt transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h3 className="text-[15px] font-semibold text-earth">{title}</h3>
      </div>
      {badge && (
        <span
          className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badgeStyles[badgeVariant]}`}
        >
          {badge}
        </span>
      )}
    </header>
  );
}
