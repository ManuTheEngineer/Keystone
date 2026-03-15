export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 text-[9px] font-medium uppercase tracking-[2px] text-muted">
      {children}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
