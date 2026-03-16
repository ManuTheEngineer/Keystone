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
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

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
  const isMobile = useIsMobile();

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

  const barHeight = isMobile ? 36 : 48;
  const chartHeight = Math.max(isMobile ? 180 : 200, items.length * barHeight + 40);

  // Truncate category names on mobile
  const displayItems = isMobile
    ? items.map((item) => ({
        ...item,
        category: item.category.length > 12 ? item.category.slice(0, 12) + "..." : item.category,
      }))
    : items;

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Category Breakdown</h3>
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayItems}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barGap={2}
            barSize={isMobile ? 10 : 14}
          >
            <XAxis
              type="number"
              tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--color-muted)", fontFamily: "var(--font-data, monospace)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrencyCompact(v, currency)}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--color-muted)" }}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 70 : 100}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Bar dataKey="estimated" fill="var(--color-sand)" radius={[0, 3, 3, 0]} name="Estimated" />
            <Bar dataKey="actual" radius={[0, 3, 3, 0]} name="Actual">
              {items.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={item.actual > item.estimated ? "var(--color-danger)" : "var(--color-emerald-600)"}
                />
              ))}
            </Bar>
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={isMobile ? 8 : 10}
              wrapperStyle={{ fontSize: isMobile ? "9px" : "11px", color: "var(--color-muted)" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
