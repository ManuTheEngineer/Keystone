"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrency } from "@keystone/market-data";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

const CATEGORY_COLORS = [
  "var(--color-earth)", // earth
  "var(--color-clay)", // clay
  "var(--color-emerald-600)", // emerald
  "var(--color-info)", // info
  "var(--color-warning)", // warning
  "var(--color-sand)", // sand
  "var(--color-success)", // success
  "var(--color-danger)", // danger
];

interface BudgetDonutItem {
  category: string;
  amount: number;
  color?: string;
}

interface BudgetDonutChartProps {
  items: BudgetDonutItem[];
  total: number;
  currency: CurrencyConfig;
  hideLegend?: boolean;
  compact?: boolean;
}

function CustomTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ payload: BudgetDonutItem & { fill: string } }>;
  currency: CurrencyConfig;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-2.5 shadow-sm">
      <p className="text-xs font-medium text-earth">{entry.category}</p>
      <p className="font-data text-sm text-foreground mt-0.5">
        {formatCurrency(entry.amount, currency)}
      </p>
    </div>
  );
}

export function BudgetDonutChart({ items, total, currency, hideLegend, compact }: BudgetDonutChartProps) {
  const isMobile = useIsMobile();

  if (!items || items.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-medium text-earth mb-3">Budget Breakdown</h3>
        <div className="flex items-center justify-center h-48 text-muted text-sm">
          No data yet
        </div>
      </div>
    );
  }

  const data = items.map((item, i) => ({
    ...item,
    fill: item.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <div className={compact ? "" : "bg-surface border border-border rounded-[var(--radius)] p-4"}>
      {!compact && <h3 className="text-sm font-medium text-earth mb-3">Budget Breakdown</h3>}
      <div className="chart-container" style={{ height: compact ? 160 : isMobile ? 200 : 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={isMobile ? "45%" : "55%"}
              outerRadius={isMobile ? "70%" : "80%"}
              dataKey="amount"
              nameKey="category"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <text
              x="50%"
              y="42%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-earth"
              style={{ fontSize: isMobile ? "11px" : "14px", fontFamily: "var(--font-data, monospace)", fontWeight: 600 }}
            >
              {formatCurrency(total, currency)}
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted"
              style={{ fontSize: isMobile ? "8px" : "10px" }}
            >
              Total Budget
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {!hideLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-xs text-muted">{entry.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
