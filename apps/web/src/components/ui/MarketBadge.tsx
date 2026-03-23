import type { Market } from "@keystone/market-data";

interface MarketBadgeProps {
  market: Market;
}

interface MarketVisual {
  label: string;
  bg: string;
  text: string;
  bars: string[];
}

const MARKET_CONFIG: Record<Market, MarketVisual> = {
  USA: {
    label: "USA",
    bg: "bg-accent-usa-light",
    text: "text-accent-usa",
    bars: ["#1B4965", "#9B2226"],
  },
  TOGO: {
    label: "Togo",
    bg: "bg-accent-wa-light",
    text: "text-accent-wa",
    bars: ["#2D6A4F", "#BC6C25"],
  },
  GHANA: {
    label: "Ghana",
    bg: "bg-accent-wa-light",
    text: "text-accent-wa",
    bars: ["#9B2226", "#BC6C25", "#2D6A4F"],
  },
  BENIN: {
    label: "Benin",
    bg: "bg-accent-wa-light",
    text: "text-accent-wa",
    bars: ["#2D6A4F", "#BC6C25"],
  },
  IVORY_COAST: {
    label: "Ivory Coast",
    bg: "bg-accent-wa-light",
    text: "text-accent-wa",
    bars: ["#FF8C00", "#FFFFFF", "#009E60"],
  },
  SENEGAL: {
    label: "Senegal",
    bg: "bg-accent-wa-light",
    text: "text-accent-wa",
    bars: ["#009639", "#FDEF42", "#E31B23"],
  },
};

function FlagBars({ colors }: { colors: string[] }) {
  const barWidth = 3;
  const totalWidth = colors.length * barWidth;
  return (
    <svg
      width={totalWidth}
      height={12}
      viewBox={`0 0 ${totalWidth} 12`}
      className="shrink-0"
      aria-hidden="true"
    >
      {colors.map((color, i) => (
        <rect
          key={i}
          x={i * barWidth}
          y={0}
          width={barWidth}
          height={12}
          rx={1}
          fill={color}
        />
      ))}
    </svg>
  );
}

export function MarketBadge({ market }: MarketBadgeProps) {
  const cfg = MARKET_CONFIG[market];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
      <FlagBars colors={cfg.bars} />
      {cfg.label}
    </span>
  );
}
