"use client";

import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import type { Locale } from "@/lib/i18n";
import {
  LayoutGrid,
  Plus,
  BookOpen,
  Clock,
  CheckSquare,
  DollarSign,
  Calculator,
  Calendar,
  Users,
  FileText,
  Image,
  ClipboardList,
  ClipboardCheck,
  ListChecks,
  HelpCircle,
  X,
  LogOut,
  Globe,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const mainNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutGrid size={16} /> },
  { id: "new-project", label: "New project", icon: <Plus size={16} /> },
  { id: "learn", label: "Learn", icon: <BookOpen size={16} /> },
];

const projectNav: NavItem[] = [
  { id: "overview", label: "Overview", icon: <Clock size={16} /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare size={16} /> },
  { id: "budget", label: "Budget", icon: <DollarSign size={16} /> },
  { id: "financials", label: "Financials", icon: <Calculator size={16} /> },
  { id: "schedule", label: "Schedule", icon: <Calendar size={16} /> },
  { id: "team", label: "Team", icon: <Users size={16} /> },
  { id: "documents", label: "Documents", icon: <FileText size={16} /> },
  { id: "photos", label: "Photos", icon: <Image size={16} /> },
  { id: "daily-log", label: "Daily log", icon: <ClipboardList size={16} /> },
  { id: "inspections", label: "Inspections", icon: <ClipboardCheck size={16} /> },
  { id: "punch-list", label: "Punch list", icon: <ListChecks size={16} /> },
  { id: "ai-assistant", label: "AI assistant", icon: <HelpCircle size={16} /> },
];

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
}: SidebarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const planLabel = userPlan.charAt(0) + userPlan.slice(1).toLowerCase() + " plan";
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-earth/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-[260px] bg-earth text-sand z-50
          flex flex-col overflow-y-auto
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-sand/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeystoneIcon size={28} className="text-sand" />
            <div>
              <h2 className="text-[15px] font-semibold text-warm tracking-tight">
                Keystone
              </h2>
              <p className="text-[9px] uppercase tracking-[2px] text-sand/30">
                Build with confidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-sand/50 hover:text-sand/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="py-3">
          <p className="px-5 mb-1.5 text-[9px] uppercase tracking-[2px] text-sand/25 font-medium">
            Main
          </p>
          {mainNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-2.5 px-5 py-2 text-[13px]
                border-l-[2.5px] transition-all duration-150
                ${
                  activeSection === item.id
                    ? "opacity-100 bg-sand/8 border-l-sand text-warm"
                    : "opacity-40 border-l-transparent text-sand hover:opacity-65 hover:bg-sand/5"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Project navigation */}
        {projectName && (
          <nav className="py-3 border-t border-sand/10">
            <p className="px-5 mb-1.5 text-[9px] uppercase tracking-[2px] text-sand/25 font-medium">
              {projectName}
            </p>
            {projectNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-2.5 px-5 py-2 text-[13px]
                  border-l-[2.5px] transition-all duration-150
                  ${
                    activeSection === item.id
                      ? "opacity-100 bg-sand/8 border-l-sand text-warm"
                      : "opacity-40 border-l-transparent text-sand hover:opacity-65 hover:bg-sand/5"
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Language indicator */}
        <div className="mt-auto px-5 py-2 flex items-center gap-2 text-sand/40">
          <Globe size={12} />
          <span className="text-[10px] uppercase tracking-[1.5px] font-medium">
            {locale === "fr" ? "FR" : "EN"}
          </span>
        </div>

        {/* User footer */}
        <div className="px-5 py-3.5 border-t border-sand/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sand/15 flex items-center justify-center text-[11px] font-semibold text-sand">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-warm truncate">{userName}</p>
            <p className="text-[10px] text-sand/35">{planLabel}</p>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-1.5 rounded text-sand/40 hover:text-sand/80 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
