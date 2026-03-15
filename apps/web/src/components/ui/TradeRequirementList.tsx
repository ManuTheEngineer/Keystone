import type { TradeDefinition, CurrencyConfig } from "@keystone/market-data";
import { formatCurrency } from "@keystone/market-data";
import { Badge } from "./Badge";

interface TradeRequirementListProps {
  trades: TradeDefinition[];
  currency: CurrencyConfig;
}

export function TradeRequirementList({ trades, currency }: TradeRequirementListProps) {
  if (trades.length === 0) {
    return (
      <p className="text-[11px] text-muted py-2">No specific trades required for this phase.</p>
    );
  }

  return (
    <div className="space-y-1.5">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="flex items-start gap-3 p-2.5 border border-border rounded-[var(--radius)] bg-surface"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-earth">{trade.name}</span>
              {trade.localName && (
                <span className="text-[10px] text-muted italic">({trade.localName})</span>
              )}
              {trade.licensingRequired && (
                <Badge variant="info">Licensed</Badge>
              )}
            </div>
            <p className="text-[10px] text-muted mt-0.5">{trade.description}</p>
            {trade.criticalSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {trade.criticalSkills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-alt text-muted">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-data text-earth">
              {formatCurrency(trade.typicalRateRange.low, currency)} - {formatCurrency(trade.typicalRateRange.high, currency)}
            </p>
            <p className="text-[9px] text-muted">/{trade.typicalRateRange.unit}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
