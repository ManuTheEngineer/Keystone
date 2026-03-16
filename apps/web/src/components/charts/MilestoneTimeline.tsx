"use client";

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
    fill: "#2D6A4F",
    stroke: "#2D6A4F",
    textColor: "text-success",
  },
  current: {
    fill: "#059669",
    stroke: "#059669",
    textColor: "text-emerald-600",
  },
  upcoming: {
    fill: "transparent",
    stroke: "#6A6A6A",
    textColor: "text-muted",
  },
};

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
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

  const dotSize = 14;
  const padding = 32;
  const lineY = 40;

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-3">Milestone Timeline</h3>
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{
            minWidth: milestones.length * 120 + padding * 2,
            height: 100,
          }}
        >
          {/* Connecting line */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <line
              x1={padding}
              y1={lineY}
              x2={`calc(100% - ${padding}px)`}
              y2={lineY}
              stroke="#D4A574"
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
              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: 100 }}
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
                          backgroundColor: "#059669",
                          opacity: 0.3,
                        }}
                      />
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={`text-[10px] text-center mt-1.5 leading-tight ${style.textColor}`}
                    style={{ maxWidth: 90 }}
                  >
                    {milestone.name}
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
