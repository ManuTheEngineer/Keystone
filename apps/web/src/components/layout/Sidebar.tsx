"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import type { Locale } from "@/lib/i18n";
import {
  LayoutGrid,
  Plus,
  BookOpen,
  Settings,
  Clock,
  DollarSign,
  Calculator,
  Calendar,
  Users,
  FileText,
  FolderOpen,
  Image,
  ClipboardList,
  ClipboardCheck,
  ListChecks,
  HelpCircle,
  Eye,
  X,
  LogOut,
  Globe,
  ChevronLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/*
 * Sidebar color tokens — always dark regardless of theme.
 * Using fixed Tailwind arbitrary values so dark mode doesn't invert them.
 */
const C = {
  bg: "bg-[#2C1810]",
  bgLight: "bg-[#3D2215]",
  text: "text-[#D4A574]",        // sand equivalent
  textBright: "text-[#F5E6D3]",  // warm equivalent
  border: "border-[#D4A574]",
} as const;

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconCollapsed: React.ReactNode;
}

function makeNav(items: { id: string; label: string; Icon: React.ComponentType<{ size: number }> }[]): NavItem[] {
  return items.map(({ id, label, Icon }) => ({
    id,
    label,
    icon: <Icon size={18} />,
    iconCollapsed: <Icon size={18} />,
  }));
}

const mainNav = makeNav([
  { id: "dashboard", label: "Dashboard", Icon: LayoutGrid },
  { id: "new-project", label: "New project", Icon: Plus },
  { id: "learn", label: "Learn", Icon: BookOpen },
]);

const projectNav = makeNav([
  { id: "overview", label: "Overview", Icon: Clock },
  { id: "budget", label: "Budget", Icon: DollarSign },
  { id: "schedule", label: "Schedule", Icon: Calendar },
  { id: "financials", label: "Financials", Icon: Calculator },
  { id: "team", label: "Team", Icon: Users },
  { id: "documents", label: "Documents", Icon: FileText },
  { id: "vault", label: "File Vault", Icon: FolderOpen },
  { id: "photos", label: "Photos", Icon: Image },
  { id: "daily-log", label: "Daily log", Icon: ClipboardList },
  { id: "inspections", label: "Inspections", Icon: ClipboardCheck },
  { id: "punch-list", label: "Punch list", Icon: ListChecks },
  { id: "monitor", label: "Monitor", Icon: Eye },
  { id: "ai-assistant", label: "AI assistant", Icon: HelpCircle },
]);

const projectNavGroups = [
  { label: "Planning", items: ["overview", "budget", "schedule", "financials"] },
  { label: "Execution", items: ["team", "documents", "photos", "daily-log"] },
  { label: "Quality", items: ["inspections", "punch-list", "monitor"] },
  { label: "Tools", items: ["ai-assistant", "vault"] },
];

const projectNavMap = new Map(projectNav.map((item) => [item.id, item]));

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  projectName?: string;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userPlan?: string;
  onSignOut?: () => void;
  locale?: Locale;
  projectMarket?: string;
  badges?: Record<string, number>;
}

export function Sidebar({
  activeSection,
  onNavigate,
  projectName,
  isOpen,
  onClose,
  userName = "User",
  userPlan = "FOUNDATION",
  onSignOut,
  locale = "en",
  projectMarket,
  badges,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("keystone-sidebar-collapsed") === "true";
  });

  // Sync with keyboard shortcut (Ctrl+B) from layout
  useEffect(() => {
    function handleStorage() {
      setCollapsed(localStorage.getItem("keystone-sidebar-collapsed") === "true");
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleCollapse(value: boolean) {
    setCollapsed(value);
    localStorage.setItem("keystone-sidebar-collapsed", String(value));
    window.dispatchEvent(new Event("storage"));
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const planLabel = userPlan.charAt(0) + userPlan.slice(1).toLowerCase() + " plan";

  const showLangBadge = projectMarket === "TOGO" || projectMarket === "BENIN";

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[240px]";

  function renderNavItem(item: NavItem) {
    const isActive = activeSection === item.id;
    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => {
            onNavigate(item.id);
            onClose();
          }}
          className={`
            w-full flex items-center gap-2.5 py-2 text-[13px]
            border-l-[3px] transition-all duration-150
            ${collapsed ? "px-0 justify-center" : "px-5"}
            ${
              isActive
                ? "border-l-emerald-500 rounded-r-lg bg-emerald-500/8 text-[#F5E6D3] opacity-100"
                : "border-l-transparent text-[#D4A574] opacity-50 hover:opacity-80 hover:bg-[#D4A574]/5 hover:border-l-[#D4A574]/30 hover:border-l-[2px]"
            }
          `}
          title={collapsed ? item.label : undefined}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && <span className="flex-1">{item.label}</span>}
          {!collapsed && badges?.[item.id] != null && badges[item.id] > 0 && (
            <span className="ml-auto bg-danger text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {badges[item.id]}
            </span>
          )}
        </button>
        {/* Tooltip for collapsed mode */}
        {collapsed && (
          <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-md ${C.bgLight} text-[#F5E6D3] text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-md`}>
            {item.label}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 ${sidebarWidth} ${C.bg} text-[#D4A574] z-40
          flex flex-col overflow-y-auto overflow-x-hidden
          transition-all duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className={`px-5 pt-5 pb-4 border-b border-[#D4A574]/10 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? (
            <Link href="/dashboard" className="flex items-center justify-center">
              <KeystoneIcon size={22} className="text-[#D4A574]" />
            </Link>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <KeystoneIcon size={22} className="text-[#D4A574]" />
                <span className="text-[15px] font-semibold text-[#F5E6D3] tracking-tight">
                  Keystone
                </span>
              </Link>
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded text-[#D4A574]/50 hover:text-[#D4A574]/80 transition-colors"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        {/* Main navigation */}
        <nav className="py-3">
          {!collapsed && (
            <p className="px-5 mb-1.5 text-[9px] uppercase tracking-[2px] text-[#D4A574]/30 font-medium">
              Main
            </p>
          )}
          {mainNav.map(renderNavItem)}
        </nav>

        {/* Separator between main nav and project nav */}
        {projectName && (
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#D4A574]/15 to-transparent" />
        )}

        {/* Project navigation */}
        {projectName && (
          <nav className="py-3">
            {!collapsed && (
              <p className="px-5 mb-1.5 text-[9px] uppercase tracking-[2px] text-[#D4A574]/30 font-medium truncate">
                {projectName}
              </p>
            )}
            {projectNavGroups.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="px-5 mt-3 mb-1 text-[9px] uppercase tracking-[2px] text-[#D4A574]/30 font-medium">
                    {group.label}
                  </p>
                )}
                {group.items.map((itemId) => {
                  const item = projectNavMap.get(itemId);
                  return item ? renderNavItem(item) : null;
                })}
              </div>
            ))}
          </nav>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Language indicator */}
        {showLangBadge && (
          <div className={`px-5 py-2 flex items-center gap-2 text-[#D4A574]/40 ${collapsed ? "justify-center" : ""}`}>
            <Globe size={12} />
            {!collapsed && (
              <span className="text-[10px] uppercase tracking-[1.5px] font-medium">
                {locale === "fr" ? "FR" : "EN"}
              </span>
            )}
          </div>
        )}

        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:flex px-3 py-2 justify-center">
          <button
            onClick={() => handleCollapse(!collapsed)}
            className="p-1.5 rounded text-[#D4A574]/30 hover:text-[#D4A574]/60 hover:bg-[#D4A574]/5 transition-all duration-150"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Parameters + User footer */}
        <div
          className="mt-auto"
          style={{ borderTop: "1px solid transparent", borderImage: "linear-gradient(90deg, transparent, rgba(212,165,116,0.15), transparent) 1" }}
        >
          {/* Parameters link */}
          <button
            onClick={() => { onNavigate("settings"); onClose(); }}
            className={`
              w-full flex items-center gap-2.5 px-5 py-2 text-[13px]
              border-l-[3px] rounded-r-lg transition-all duration-150
              ${activeSection === "settings"
                ? "opacity-100 bg-emerald-500/8 border-l-emerald-500 text-[#F5E6D3]"
                : "opacity-50 border-l-transparent text-[#D4A574] hover:opacity-80 hover:bg-[#D4A574]/5 hover:border-l-[2px] hover:border-l-[#D4A574]/30"
              }
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title={collapsed ? "Parameters" : undefined}
          >
            <Settings size={18} />
            {!collapsed && "Parameters"}
          </button>

          {/* User profile */}
          <div className={`px-3 py-3 flex items-center ${collapsed ? "justify-center" : "gap-2.5 px-5"}`}>
            <div className="w-8 h-8 rounded-full bg-[#D4A574]/15 flex items-center justify-center text-[11px] font-semibold text-[#D4A574] flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#F5E6D3] truncate">{userName}</p>
                  <p className="text-[10px] text-[#D4A574]/35">{planLabel}</p>
                </div>
                <ThemeToggle />
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded text-[#D4A574]/40 hover:text-[#D4A574]/80 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
