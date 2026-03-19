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
        {projectName && (
          <div className="flex items-center gap-1 text-[11px] text-muted mb-1">
            {projectId ? (
              <Link
                href={`/project/${projectId}/overview`}
                className="hover:text-earth transition-colors"
              >
                {projectName}
              </Link>
            ) : (
              <span>{projectName}</span>
            )}
            <span className="text-muted/50">{">"}</span>
            <span>{title}</span>
          </div>
        )}
        <h1
          className="text-[22px] text-earth leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>
        )}
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
