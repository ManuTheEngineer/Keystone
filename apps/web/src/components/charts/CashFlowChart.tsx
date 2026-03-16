"use client";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import type { CurrencyConfig } from "@keystone/market-data";
import { formatCurrency, formatCurrencyCompact } from "@keystone/market-data";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

interface CashFlowDataPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
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

  const labels: Record<string, string> = {
    income: "Income",
    expenses: "Expenses",
    net: "Net",
  };

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-2.5 shadow-sm">
      <p className="text-xs text-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-data text-xs" style={{ color: entry.color }}>
          {labels[entry.dataKey] ?? entry.dataKey}: {formatCurrency(entry.value, currency)}
        </p>
      ))}
    </div>
  );
}

export function CashFlowChart({ data, currency }: CashFlowChartProps) {
  const isMobile = useIsMobile();

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-medium text-earth mb-3">Cash Flow</h3>
        <div className="flex items-center justify-center h-48 text-muted text-sm">
          No data yet
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    expensesNeg: -Math.abs(d.expenses),
  }));

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Cash Flow</h3>
      <div className="chart-container" style={{ height: isMobile ? 200 : 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: isMobile ? 9 : 11, fill: "#6A6A6A" }}
              tickLine={false}
              axisLine={{ stroke: "#D4A574", strokeWidth: 1 }}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 9 : 11, fill: "#6A6A6A", fontFamily: "var(--font-data, monospace)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrencyCompact(v, currency)}
              width={isMobile ? 40 : 60}
              hide={isMobile}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <ReferenceLine y={0} stroke="#D4A574" strokeWidth={1} />
            <Bar dataKey="income" fill="#2D6A4F" radius={[3, 3, 0, 0]} name="Income" />
            <Bar dataKey="expensesNeg" fill="#9B2226" radius={[0, 0, 3, 3]} name="Expenses" />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#2C1810"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2C1810" }}
              name="Net"
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={isMobile ? 8 : 10}
              wrapperStyle={{ fontSize: isMobile ? "9px" : "11px", color: "#6A6A6A" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
