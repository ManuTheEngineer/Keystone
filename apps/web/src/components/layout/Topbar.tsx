"use client";

import { Menu } from "lucide-react";

interface TopbarProps {
  title: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "info" | "danger";
  onMenuToggle: () => void;
}

const badgeStyles = {
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  info: "bg-info/10 text-info border border-info/20",
  danger: "bg-danger/10 text-danger border border-danger/20",
};

export function Topbar({ title, badge, badgeVariant = "info", onMenuToggle }: TopbarProps) {
  return (
    <header className="px-6 py-4 border-b border-border/40 bg-surface/80 backdrop-blur-sm flex items-center justify-between shrink-0 sticky top-0 z-30">
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
      {badge && (
        <span
          className={`text-[10px] px-3 py-1 rounded-full font-medium ${badgeStyles[badgeVariant]}`}
        >
          {badge}
        </span>
      )}
    </header>
  );
}
