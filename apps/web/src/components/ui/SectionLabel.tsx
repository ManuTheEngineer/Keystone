export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-clay/60">
      <span className="whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-sand/30" />
    </div>
  );
}
