"use client";

import Link from "next/link";

interface PageHeaderProps {
  title: string;
  projectName?: string;
  projectId?: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, projectName, projectId, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1
          className="text-[22px] text-earth leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {projectName || title}
        </h1>
        <p className="text-[12px] text-muted mt-0.5">
          {projectName ? title : subtitle}
          {projectName && subtitle && ` -- ${subtitle}`}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary shrink-0"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
