"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PunchListDonutProps {
  open: number;
  inProgress: number;
  resolved: number;
}

const SEGMENTS = [
  { key: "open", label: "Open", color: "#9B2226" },
  { key: "inProgress", label: "In Progress", color: "#BC6C25" },
  { key: "resolved", label: "Resolved", color: "#2D6A4F" },
] as const;

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; fill: string } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-2 shadow-sm">
      <p className="text-xs" style={{ color: entry.fill }}>
        {entry.name}: {entry.value}
      </p>
    </div>
  );
}

export function PunchListDonut({ open, inProgress, resolved }: PunchListDonutProps) {
  const total = open + inProgress + resolved;

  if (total === 0) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-medium text-earth mb-3">Punch List</h3>
        <div className="flex items-center justify-center h-40 text-muted text-sm">
          No data yet
        </div>
      </div>
    );
  }

  const data = [
    { name: "Open", value: open, fill: SEGMENTS[0].color },
    { name: "In Progress", value: inProgress, fill: SEGMENTS[1].color },
    { name: "Resolved", value: resolved, fill: SEGMENTS[2].color },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Punch List</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-earth"
              style={{ fontSize: "20px", fontFamily: "var(--font-data, monospace)", fontWeight: 600 }}
            >
              {total}
            </text>
            <text
              x="50%"
              y="57%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted"
              style={{ fontSize: "10px" }}
            >
              Items
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-1">
        {SEGMENTS.map((seg) => {
          const value = seg.key === "open" ? open : seg.key === "inProgress" ? inProgress : resolved;
          if (value === 0) return null;
          return (
            <div key={seg.key} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-muted">
                {seg.label} ({value})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
