"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrency, formatCurrencyCompact } from "@keystone/market-data";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

interface SpendVelocityChartProps {
  planned: { week: number; amount: number }[];
  actual: { week: number; amount: number }[];
  currency: CurrencyConfig;
}

function CustomTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: number;
  currency: CurrencyConfig;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-2.5 shadow-sm">
      <p className="text-xs text-muted mb-1">Week {label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-data text-xs" style={{ color: entry.color }}>
          {entry.dataKey === "planned" ? "Planned" : "Actual"}:{" "}
          {formatCurrency(entry.value, currency)}
        </p>
      ))}
    </div>
  );
}

export function SpendVelocityChart({ planned, actual, currency }: SpendVelocityChartProps) {
  const isMobile = useIsMobile();

  if ((!planned || planned.length === 0) && (!actual || actual.length === 0)) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-medium text-earth mb-3">Spend Velocity</h3>
        <div className="flex items-center justify-center h-48 text-muted text-sm">
          No data yet
        </div>
      </div>
    );
  }

  const allWeeks = new Set([
    ...planned.map((p) => p.week),
    ...actual.map((a) => a.week),
  ]);
  const merged = Array.from(allWeeks)
    .sort((a, b) => a - b)
    .map((week) => ({
      week,
      planned: planned.find((p) => p.week === week)?.amount ?? null,
      actual: actual.find((a) => a.week === week)?.amount ?? null,
    }));

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Spend Velocity</h3>
      <div className="chart-container" style={{ height: isMobile ? 200 : 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="week"
              tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--color-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-sand)", strokeWidth: 1 }}
              tickFormatter={(v) => `W${v}`}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--color-muted)", fontFamily: "var(--font-data, monospace)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrencyCompact(v, currency)}
              width={isMobile ? 40 : 60}
              hide={isMobile}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--color-earth)"
              strokeWidth={2}
              fill="var(--color-emerald-600)"
              fillOpacity={0.15}
              connectNulls
              dot={false}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="var(--color-sand)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls
              name="Planned"
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={isMobile ? 8 : 10}
              wrapperStyle={{ fontSize: isMobile ? "9px" : "11px", color: "var(--color-muted)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
