"use client";

import { useIsMobile } from "@/lib/hooks/use-is-mobile";

interface MilestoneItem {
  name: string;
  status: "completed" | "current" | "upcoming";
  paymentPct?: number;
}

interface MilestoneTimelineProps {
  milestones: MilestoneItem[];
}

const STATUS_STYLES = {
  completed: {
    fill: "var(--color-success)",
    stroke: "var(--color-success)",
    textColor: "text-success",
  },
  current: {
    fill: "var(--color-accent)",
    stroke: "var(--color-accent)",
    textColor: "text-emerald-600",
  },
  upcoming: {
    fill: "transparent",
    stroke: "var(--color-muted)",
    textColor: "text-muted",
  },
};

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  const isMobile = useIsMobile();

  if (!milestones || milestones.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-medium text-earth mb-3">Milestone Timeline</h3>
        <div className="flex items-center justify-center h-24 text-muted text-sm">
          No data yet
        </div>
      </div>
    );
  }

  const dotSize = isMobile ? 10 : 14;
  const padding = isMobile ? 20 : 32;
  const lineY = isMobile ? 32 : 40;
  const itemSpacing = isMobile ? 80 : 120;
  const itemWidth = isMobile ? 64 : 100;

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Milestone Timeline</h3>
      <div className="overflow-x-auto scroll-touch">
        <div
          className="relative"
          style={{
            minWidth: milestones.length * itemSpacing + padding * 2,
            height: isMobile ? 80 : 100,
          }}
        >
          {/* Connecting line */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${milestones.length * itemSpacing + padding * 2} ${isMobile ? 80 : 100}`}
          >
            <line
              x1={padding}
              y1={lineY}
              x2={milestones.length * itemSpacing + padding}
              y2={lineY}
              stroke="var(--color-sand)"
              strokeWidth={2}
            />
          </svg>

          {/* Milestones */}
          <div
            className="absolute flex justify-between items-start"
            style={{
              left: padding,
              right: padding,
              top: 0,
            }}
          >
            {milestones.map((milestone, index) => {
              const style = STATUS_STYLES[milestone.status];
              const displayName = isMobile && milestone.name.length > 15
                ? milestone.name.slice(0, 15) + "..."
                : milestone.name;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: itemWidth }}
                >
                  {/* Payment % label */}
                  <div className="h-5 flex items-end justify-center mb-1">
                    {milestone.paymentPct != null && (
                      <span className="font-data text-[10px] text-muted">
                        {milestone.paymentPct}%
                      </span>
                    )}
                  </div>

                  {/* Dot */}
                  <div className="relative">
                    <svg
                      width={dotSize + 8}
                      height={dotSize + 8}
                      viewBox={`0 0 ${dotSize + 8} ${dotSize + 8}`}
                    >
                      <circle
                        cx={(dotSize + 8) / 2}
                        cy={(dotSize + 8) / 2}
                        r={dotSize / 2}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={2}
                      />
                    </svg>
                    {/* Pulse ring for current milestone */}
                    {milestone.status === "current" && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          opacity: 0.3,
                        }}
                      />
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={`text-[10px] text-center mt-1.5 leading-tight ${style.textColor}`}
                    style={{ maxWidth: itemWidth - 10 }}
                  >
                    {displayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
