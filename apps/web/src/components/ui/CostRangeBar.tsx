import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrency } from "@keystone/market-data";

interface CostRangeBarProps {
  low: number;
  mid: number;
  high: number;
  actual?: number;
  currency: CurrencyConfig;
}

export function CostRangeBar({ low, mid, high, actual, currency }: CostRangeBarProps) {
  const range = high - low;
  const midPct = range > 0 ? ((mid - low) / range) * 100 : 50;
  const actualPct = actual !== undefined && range > 0
    ? Math.min(Math.max(((actual - low) / range) * 100, 0), 100)
    : undefined;

  return (
    <div className="w-full">
      <div className="relative h-2 rounded-full bg-surface-alt overflow-visible">
        {/* Gradient bar from low to high */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-success via-warning to-danger opacity-30" />

        {/* Mid marker */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-earth/40"
          style={{ left: `${midPct}%` }}
        />

        {/* Actual value indicator */}
        {actualPct !== undefined && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-surface bg-earth shadow-[var(--shadow-sm)]"
            style={{ left: `calc(${actualPct}% - 6px)` }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1 text-[9px] text-muted font-data">
        <span>{formatCurrency(low, currency)}</span>
        <span>{formatCurrency(high, currency)}</span>
      </div>
    </div>
  );
}
