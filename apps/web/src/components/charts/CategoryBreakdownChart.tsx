"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrency, formatCurrencyCompact } from "@keystone/market-data";

interface CategoryBreakdownItem {
  category: string;
  estimated: number;
  actual: number;
  benchmark?: { low: number; mid: number; high: number };
}

interface CategoryBreakdownChartProps {
  items: CategoryBreakdownItem[];
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
  label?: string;
  currency: CurrencyConfig;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-2.5 shadow-sm">
      <p className="text-xs font-medium text-earth mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-data text-xs" style={{ color: entry.color }}>
          {entry.dataKey === "estimated" ? "Estimated" : "Actual"}:{" "}
          {formatCurrency(entry.value, currency)}
        </p>
      ))}
    </div>
  );
}

export function CategoryBreakdownChart({ items, currency }: CategoryBreakdownChartProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-medium text-earth mb-3">Category Breakdown</h3>
        <div className="flex items-center justify-center h-48 text-muted text-sm">
          No data yet
        </div>
      </div>
    );
  }

  const chartHeight = Math.max(200, items.length * 48 + 40);

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Category Breakdown</h3>
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={items}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barGap={2}
            barSize={14}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#6A6A6A", fontFamily: "var(--font-data, monospace)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrencyCompact(v, currency)}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 11, fill: "#6A6A6A" }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Bar dataKey="estimated" fill="#D4A574" radius={[0, 3, 3, 0]} name="Estimated" />
            <Bar dataKey="actual" radius={[0, 3, 3, 0]} name="Actual">
              {items.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={item.actual > item.estimated ? "#9B2226" : "#059669"}
                />
              ))}
            </Bar>
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={10}
              wrapperStyle={{ fontSize: "11px", color: "#6A6A6A" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
