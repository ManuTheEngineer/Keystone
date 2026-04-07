"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrencyCompact } from "@keystone/market-data";

interface OptionCardProps {
  id: string;
  label: string;
  subtitle?: string;
  Icon?: LucideIcon;
  selected: boolean;
  multiSelect?: boolean;
  costHint?: string;
  costDelta?: number;
  currency?: CurrencyConfig;
  onClick: () => void;
}

export function OptionCard({
  id,
  label,
  subtitle,
  Icon,
  selected,
  multiSelect,
  costHint,
  costDelta,
  currency,
  onClick,
}: OptionCardProps) {
  const showDelta =
    !selected && costDelta !== undefined && Math.abs(costDelta) > 100 && currency;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
        selected
          ? "border-emerald-500 border-2 bg-emerald-50/30 text-emerald-800 shadow-sm"
          : "border-border/50 text-muted hover:bg-warm/20 hover:border-sand"
      }`}
    >
      {/* Icon */}
      {Icon && (
        <Icon
          size={16}
          className={`shrink-0 ${selected ? "text-emerald-600" : "text-clay"}`}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="block text-[13px] font-medium leading-tight">
          {label}
        </span>
        {subtitle && (
          <span className="block text-[10px] text-muted leading-snug mt-0.5">
            {subtitle}
          </span>
        )}
        {costHint && (
          <span className="block text-[10px] font-data text-clay/70 leading-snug mt-0.5">
            {costHint}
          </span>
        )}
      </div>

      {/* Right side */}
      {multiSelect && selected && (
        <Check size={14} className="shrink-0 text-emerald-600" />
      )}
      {showDelta && currency && costDelta !== undefined && (
        <span
          className={`shrink-0 text-[10px] font-data font-medium ${
            costDelta > 0 ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          {costDelta > 0 ? "+" : ""}
          {formatCurrencyCompact(costDelta, currency)}
        </span>
      )}
    </button>
  );
}
