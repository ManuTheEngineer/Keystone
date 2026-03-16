"use client";

interface RiskIndicatorProps {
  score: number;
  label: string;
}

function getColorForScore(score: number): string {
  if (score <= 30) return "#2D6A4F";   // success / low risk
  if (score <= 60) return "#BC6C25";   // warning / medium risk
  return "#9B2226";                    // danger / high risk
}

function getRiskLevel(score: number): string {
  if (score <= 30) return "Low Risk";
  if (score <= 60) return "Medium Risk";
  return "High Risk";
}

export function RiskIndicator({ score, label }: RiskIndicatorProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getColorForScore(clampedScore);
  const riskLevel = getRiskLevel(clampedScore);

  // SVG arc calculations
  const size = 160;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = 58;
  const strokeWidth = 12;

  // Arc spans 240 degrees (from 150 deg to 390 deg, i.e., -210 to 30 in standard)
  const startAngle = 150;
  const endAngle = 390;
  const totalArc = endAngle - startAngle; // 240 degrees

  const scoreAngle = startAngle + (clampedScore / 100) * totalArc;

  function polarToCartesian(angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function describeArc(startA: number, endA: number) {
    const start = polarToCartesian(startA);
    const end = polarToCartesian(endA);
    const largeArcFlag = endA - startA > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }

  const bgArc = describeArc(startAngle, endAngle);
  const fgArc =
    clampedScore > 0 ? describeArc(startAngle, scoreAngle) : "";

  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-4">
      <h3 className="text-sm font-medium text-earth mb-2">{label}</h3>
      <div className="flex justify-center">
        <svg width={size} height={size - 20} viewBox={`0 0 ${size} ${size - 10}`}>
          {/* Background track */}
          <path
            d={bgArc}
            fill="none"
            stroke="#F5F0E8"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Score arc */}
          {clampedScore > 0 && (
            <path
              d={fgArc}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
          {/* Score number */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            style={{
              fontSize: "28px",
              fontFamily: "var(--font-data, monospace)",
              fontWeight: 700,
            }}
          >
            {clampedScore}
          </text>
          {/* Risk level label */}
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#6A6A6A"
            style={{ fontSize: "11px" }}
          >
            {riskLevel}
          </text>
        </svg>
      </div>
    </div>
  );
}
