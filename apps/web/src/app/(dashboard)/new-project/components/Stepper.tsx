"use client";

import type { LucideIcon } from "lucide-react";
import { Minus, Plus } from "lucide-react";
import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrencyCompact } from "@keystone/market-data";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  Icon?: LucideIcon;
  onChange: (value: number) => void;
  costPerUnit?: number;
  currency?: CurrencyConfig;
}

export function Stepper({
  label,
  value,
  min,
  max,
  Icon,
  onChange,
  costPerUnit,
  currency,
}: StepperProps) {
  return (
    <div className="p-3 rounded-xl border border-border bg-surface text-center">
      {Icon && <Icon size={16} className="mx-auto text-clay mb-1" />}
      <p className="text-[10px] text-muted mb-1">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={12} />
        </button>
        <span className="font-data text-[15px] font-semibold text-earth min-w-[2ch] tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
      {costPerUnit !== undefined && currency && (
        <p className="text-[9px] font-data text-clay/60 mt-1">
          {formatCurrencyCompact(costPerUnit, currency)}/ea
        </p>
      )}
    </div>
  );
}
