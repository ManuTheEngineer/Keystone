"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: ReactNode;
  title: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "info" | "danger";
  activeSection: string;
  onNavigate: (section: string) => void;
  projectName?: string;
}

export function AppShell({
  children,
  title,
  badge,
  badgeVariant,
  activeSection,
  onNavigate,
  projectName,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onNavigate={onNavigate}
        projectName={projectName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <Topbar
          title={title}
          badge={badge}
          badgeVariant={badgeVariant}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-5 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
