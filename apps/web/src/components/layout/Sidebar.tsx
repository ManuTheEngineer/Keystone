"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { t, type Locale } from "@/lib/i18n";
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
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/*
 * Sidebar color tokens — always dark regardless of theme.
 * Uses CSS variables so dark mode can invert the sidebar palette.
 * Light mode: dark sidebar (earth bg, sand text)
 * Dark mode: light sidebar (cream bg, earth text) — inverted via DARK_VARS
 */
const C = {
  bg: "bg-earth",
  bgLight: "bg-earth-light",
  text: "text-sand",
  textBright: "text-warm",
  border: "border-sand",
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
  { id: "portfolio", label: "Vault", Icon: FolderOpen },
  { id: "analyze", label: "Deal Analyzer", Icon: Calculator },
  { id: "new-project", label: "New project", Icon: Plus },
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
  { label: "Planning", i18nKey: "nav.group.planning", items: ["overview", "budget", "schedule", "financials"] },
  { label: "Execution", i18nKey: "nav.group.execution", items: ["team", "documents", "photos", "daily-log"] },
  { label: "Quality", i18nKey: "nav.group.quality", items: ["inspections", "punch-list", "monitor"] },
  { label: "Tools", i18nKey: "nav.group.tools", items: ["ai-assistant", "vault"] },
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("keystone-collapsed-groups");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
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

  const PLAN_DISPLAY: Record<string, string> = { FOUNDATION: "Starter", BUILDER: "Builder", DEVELOPER: "Developer", ENTERPRISE: "Enterprise" };
  const planLabel = (PLAN_DISPLAY[userPlan] ?? userPlan.charAt(0) + userPlan.slice(1).toLowerCase()) + " plan";

  const showLangBadge = projectMarket === "TOGO" || projectMarket === "BENIN";

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[240px]";

  // Map nav item IDs to i18n keys
  const NAV_I18N: Record<string, string> = {
    dashboard: "nav.dashboard", portfolio: "project.portfolio",
    analyze: "nav.dealAnalyzer",
    "new-project": "project.newProject", learn: "nav.learn",
    overview: "nav.overview", budget: "nav.budget", schedule: "nav.schedule",
    financials: "nav.financials", team: "nav.team", documents: "nav.documents",
    photos: "nav.photos", "daily-log": "nav.dailyLog",
    inspections: "nav.inspections", "punch-list": "nav.punchList",
    "ai-assistant": "nav.aiAssistant", vault: "project.fileVault",
    monitor: "project.monitor",
  };

  function renderNavItem(item: NavItem) {
    const isActive = activeSection === item.id;
    const translatedLabel = NAV_I18N[item.id] ? t(NAV_I18N[item.id], locale ?? "en") : item.label;
    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => {
            onNavigate(item.id);
            onClose();
          }}
          className={`
            w-full flex items-center gap-2.5 py-2 text-[13px] text-left
            border-l-[3px] transition-all duration-150
            ${collapsed ? "px-0 justify-center" : "pl-4 pr-3"}
            ${
              isActive
                ? "border-l-emerald-500 rounded-r-lg bg-emerald-500/8 text-warm opacity-100"
                : "border-l-transparent text-sand opacity-50 hover:opacity-80 hover:bg-[#D4A574]/5 hover:border-l-[#D4A574]/30 hover:border-l-[2px]"
            }
          `}
          title={collapsed ? translatedLabel : undefined}
          aria-label={translatedLabel}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && <span className="flex-1">{translatedLabel}</span>}
          {!collapsed && badges?.[item.id] != null && badges[item.id] > 0 && (
            <span className="ml-auto bg-danger text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {badges[item.id]}
            </span>
          )}
        </button>
        {/* Tooltip for collapsed mode */}
        {collapsed && (
          <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-md ${C.bgLight} text-warm text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-md`}>
            {translatedLabel}
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
          className="fixed inset-0 bg-earth/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 ${sidebarWidth} ${C.bg} text-sand z-40
          flex flex-col overflow-hidden
          transition-all duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className={`px-5 pt-5 pb-4 border-b border-[#D4A574]/10 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? (
            <Link href="/dashboard" className="flex items-center justify-center">
              <KeystoneIcon size={22} className="text-sand" />
            </Link>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <KeystoneIcon size={22} className="text-sand" />
                <span className="text-[15px] font-semibold text-warm tracking-tight">
                  Keystone
                </span>
              </Link>
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded text-sand/50 hover:text-sand/80 transition-colors"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        {/* Main navigation — fixed at top */}
        <nav className="py-3 shrink-0">
          {!collapsed && (
            <p className="pl-4 pr-3 mb-1.5 text-[9px] uppercase tracking-[2px] text-sand/30 font-medium">
              {t("nav.group.main", locale ?? "en")}
            </p>
          )}
          {mainNav.map(renderNavItem)}
        </nav>

        {/* Separator between main nav and project nav */}
        {projectName && (
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#D4A574]/15 to-transparent shrink-0" />
        )}

        {/* Project navigation — scrollable middle section */}
        {projectName && (
          <nav className="py-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll">
            {!collapsed && (
              <p className="pl-4 pr-3 mb-1.5 text-[9px] uppercase tracking-[2px] text-sand/30 font-medium truncate" title={projectName}>
                {projectName}
              </p>
            )}
            {projectNavGroups.map((group) => {
              const isGroupOpen = !collapsedGroups.has(group.label);
              return (
                <div key={group.label}>
                  {!collapsed && (
                    <button
                      onClick={() => setCollapsedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.label)) next.delete(group.label);
                        else next.add(group.label);
                        try { localStorage.setItem("keystone-collapsed-groups", JSON.stringify([...next])); } catch {}
                        return next;
                      })}
                      className="w-full pl-4 pr-3 mt-3 mb-1 flex items-center justify-between text-[9px] uppercase tracking-[2px] text-sand/30 font-medium hover:text-sand/50 transition-colors"
                    >
                      {group.i18nKey ? t(group.i18nKey, locale ?? "en") : group.label}
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${isGroupOpen ? "" : "-rotate-90"}`}
                      />
                    </button>
                  )}
                  {(collapsed || isGroupOpen) && group.items.map((itemId) => {
                    const item = projectNavMap.get(itemId);
                    return item ? renderNavItem(item) : null;
                  })}
                </div>
              );
            })}
          </nav>
        )}

        {/* Spacer when no project nav */}
        {!projectName && <div className="flex-1" />}

        {/* Language indicator */}
        {showLangBadge && (
          <div className={`px-5 py-2 flex items-center gap-2 text-sand/40 ${collapsed ? "justify-center" : ""}`}>
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
            className="p-1.5 rounded text-sand/30 hover:text-sand/60 hover:bg-[#D4A574]/5 transition-all duration-150"
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
              w-full flex items-center gap-2.5 pl-4 pr-3 py-2 text-[13px]
              border-l-[3px] rounded-r-lg transition-all duration-150
              ${activeSection === "settings"
                ? "opacity-100 bg-emerald-500/8 border-l-emerald-500 text-warm"
                : "opacity-50 border-l-transparent text-sand hover:opacity-80 hover:bg-[#D4A574]/5 hover:border-l-[2px] hover:border-l-[#D4A574]/30"
              }
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title={collapsed ? t("settings.title", locale ?? "en") : undefined}
          >
            <Settings size={18} />
            {!collapsed && t("settings.title", locale ?? "en")}
          </button>

          {/* User profile */}
          <div className={`px-3 py-3 flex items-center ${collapsed ? "justify-center" : "gap-2.5 px-5"}`}>
            <div className="w-8 h-8 rounded-full bg-[#D4A574]/15 flex items-center justify-center text-[11px] font-semibold text-sand flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-warm truncate">{userName}</p>
                  <p className="text-[10px] text-sand/35">{planLabel}</p>
                </div>
                <ThemeToggle />
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded text-sand/40 hover:text-sand/80 transition-colors"
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
