interface StatCardProps {
  value: string;
  label: string;
  valueClassName?: string;
}

export function StatCard({ value, label, valueClassName }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius)] p-3 text-center">
      <div className={`font-data text-lg font-medium text-earth ${valueClassName ?? ""}`}>
        {value}
      </div>
      <div className="text-[9px] text-muted uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
