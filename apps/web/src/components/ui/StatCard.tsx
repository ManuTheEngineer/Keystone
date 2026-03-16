interface StatCardProps {
  value: string;
  label: string;
  valueClassName?: string;
}

export function StatCard({ value, label, valueClassName }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 text-center">
      <div className={`font-data text-2xl font-semibold text-earth ${valueClassName ?? ""}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted uppercase tracking-[0.12em] mt-1 font-medium">
        {label}
      </div>
    </div>
  );
}
