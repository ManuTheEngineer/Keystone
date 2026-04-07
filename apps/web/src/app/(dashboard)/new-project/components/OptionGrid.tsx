"use client";

import type { ReactNode } from "react";

interface OptionGridProps {
  label: string;
  description?: string;
  columns?: 2 | 3;
  children: ReactNode;
}

export function OptionGrid({
  label,
  description,
  columns = 2,
  children,
}: OptionGridProps) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-earth mb-1">{label}</p>
      {description && (
        <p className="text-[11px] text-muted mb-2">{description}</p>
      )}
      <div
        className={`grid gap-2 ${
          columns === 3 ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
