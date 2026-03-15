import type { Market } from "@keystone/market-data";

interface MarketBadgeProps {
  market: Market;
}

const MARKET_CONFIG: Record<Market, { label: string; bg: string; text: string }> = {
  USA: { label: "USA", bg: "bg-accent-usa-light", text: "text-accent-usa" },
  TOGO: { label: "Togo", bg: "bg-accent-wa-light", text: "text-accent-wa" },
  GHANA: { label: "Ghana", bg: "bg-accent-wa-light", text: "text-accent-wa" },
  BENIN: { label: "Benin", bg: "bg-accent-wa-light", text: "text-accent-wa" },
};

export function MarketBadge({ market }: MarketBadgeProps) {
  const config = MARKET_CONFIG[market];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
