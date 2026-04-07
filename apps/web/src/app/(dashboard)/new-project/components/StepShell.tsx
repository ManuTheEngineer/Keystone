"use client";

import type { ReactNode } from "react";

interface StepShellProps {
  title: string;
  subtitle: string;
  breadcrumb?: string;
  children: ReactNode;
}

export function StepShell({
  title,
  subtitle,
  breadcrumb,
  children,
}: StepShellProps) {
  return (
    <div className="animate-fade-in">
      {breadcrumb && (
        <p className="text-[11px] text-clay font-medium mb-2">{breadcrumb}</p>
      )}
      <h3
        className="text-2xl text-earth mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h3>
      <p className="text-[13px] text-muted">{subtitle}</p>
      <div className="space-y-5 text-left mt-5">{children}</div>
    </div>
  );
}
