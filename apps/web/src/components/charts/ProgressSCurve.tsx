"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

interface ProgressSCurveProps {
  planned: { week: number; pct: number }[];
  actual: { week: number; pct: number }[];
  currentWeek: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-2.5 shadow-sm">
      <p className="text-xs text-muted mb-1">Week {label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-data text-xs" style={{ color: entry.color }}>
          {entry.dataKey === "planned" ? "Planned" : "Actual"}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

export function ProgressSCurve({ planned, actual, currentWeek }: ProgressSCurveProps) {
  const isMobile = useIsMobile();

  if ((!planned || planned.length === 0) && (!actual || actual.length === 0)) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-medium text-earth mb-3">Progress S-Curve</h3>
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
      planned: planned.find((p) => p.week === week)?.pct ?? null,
      actual: actual.find((a) => a.week === week)?.pct ?? null,
    }));

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Progress S-Curve</h3>
      <div className="chart-container" style={{ height: isMobile ? 200 : 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="week"
              tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--color-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-sand)", strokeWidth: 1 }}
              tickFormatter={(v) => `W${v}`}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--color-muted)", fontFamily: "var(--font-data, monospace)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={isMobile ? 30 : 45}
              hide={isMobile}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={currentWeek}
              stroke="var(--color-danger)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              label={{
                value: "Now",
                position: "top",
                fill: "var(--color-danger)",
                fontSize: 10,
              }}
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
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              name="Actual"
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={isMobile ? 8 : 10}
              wrapperStyle={{ fontSize: isMobile ? "9px" : "11px", color: "var(--color-muted)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
