"use client";

import { useState } from "react";
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
  const [hovered, setHovered] = useState(false);
  const range = high - low;
  const midPct = range > 0 ? ((mid - low) / range) * 100 : 50;
  const actualPct = actual !== undefined && range > 0
    ? Math.min(Math.max(((actual - low) / range) * 100, 0), 100)
    : undefined;

  return (
    <div className="w-full">
      <div
        className="relative h-[3px] rounded-full bg-surface-alt overflow-visible"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Gradient bar from low to high */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-success via-warning to-danger opacity-30" />

        {/* Mid marker */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-earth/40"
          style={{ left: `${midPct}%` }}
        />

        {/* Actual value indicator */}
        {actualPct !== undefined && (
          <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${actualPct}% - 7px)` }}>
            <div
              className="w-3.5 h-3.5 rounded-full bg-earth border-[2.5px] border-surface shadow-[var(--shadow-sm)] transition-transform duration-150"
              style={hovered ? { transform: "scale(1.2)" } : undefined}
            />
            {/* Tooltip on hover */}
            {hovered && actual !== undefined && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-earth text-warm text-[10px] font-data whitespace-nowrap shadow-[var(--shadow-md)] animate-fade-in">
                {formatCurrency(actual, currency)}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "4px solid var(--color-earth)",
                  }}
                />
              </div>
            )}
          </div>
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
