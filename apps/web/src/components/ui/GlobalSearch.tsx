"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FolderOpen, DollarSign, Users, FileText, ClipboardList, Camera } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTranslation } from "@/lib/hooks/use-translation";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

interface SearchResult {
  type: "project" | "budget" | "contact" | "task" | "document" | "photo";
  title: string;
  subtitle: string;
  href: string;
  projectName?: string;
}

const TYPE_ICONS = {
  project: FolderOpen,
  budget: DollarSign,
  contact: Users,
  task: ClipboardList,
  document: FileText,
  photo: Camera,
};

const TYPE_LABELS = {
  project: "Project",
  budget: "Budget item",
  contact: "Contact",
  task: "Task",
  document: "Document",
  photo: "Photo",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2 || !user) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchAllData(user.uid, query.trim().toLowerCase());
        setResults(found);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].href);
    }
  }, [results, selectedIndex]);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-muted border border-border rounded-lg hover:bg-surface-alt transition-colors"
        aria-label="Search"
      >
        <Search size={13} />
        <span className="hidden sm:inline">{t("common.search")}</span>
        <kbd className="hidden sm:inline text-[9px] text-muted/50 ml-1 px-1 py-0.5 rounded bg-surface-alt border border-border">
          Ctrl K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-earth/30 backdrop-blur-sm z-[70]"
        onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
      />

      {/* Search dialog */}
      <div
        ref={containerRef}
        className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[71] animate-fade-in"
      >
        <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden mx-4">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search size={18} className="text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("search.placeholder")}
              className="flex-1 text-[14px] text-earth bg-transparent placeholder:text-muted/50 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); }}
                className="p-1 text-muted hover:text-earth transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {searching && (
              <div className="px-4 py-6 text-center">
                <div className="w-4 h-4 border-2 border-clay border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {!searching && query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-[12px] text-muted">{t("search.noResults")} &quot;{query}&quot;</p>
              </div>
            )}

            {results.map((result, idx) => {
              const Icon = TYPE_ICONS[result.type];
              return (
                <button
                  key={`${result.type}-${idx}`}
                  onClick={() => navigate(result.href)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    idx === selectedIndex ? "bg-warm" : "hover:bg-surface-alt"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-clay" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-earth font-medium truncate">{result.title}</p>
                    <p className="text-[10px] text-muted truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-[9px] text-muted/50 shrink-0">{TYPE_LABELS[result.type]}</span>
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-border bg-surface-alt/50 flex items-center gap-4 text-[9px] text-muted/50">
            <span>{t("search.navigate")}</span>
            <span>{t("search.select")}</span>
            <span>{t("search.close")}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// Search across all project data in Firebase
async function searchAllData(userId: string, query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const projectsSnap = await get(ref(db, `users/${userId}/projects`));
    if (!projectsSnap.exists()) return results;

    const projects = projectsSnap.val() as Record<string, any>;

    for (const [projectId, project] of Object.entries(projects)) {
      const pName = project.name || "Untitled";

      // Match project name
      if (pName.toLowerCase().includes(query)) {
        results.push({
          type: "project",
          title: pName,
          subtitle: `${project.market} / ${project.phaseName || "Phase " + project.currentPhase}`,
          href: `/project/${projectId}/overview`,
        });
      }

      // Match budget items
      if (project.budgetItems) {
        for (const [, item] of Object.entries(project.budgetItems as Record<string, any>)) {
          if (item.category?.toLowerCase().includes(query)) {
            results.push({
              type: "budget",
              title: item.category,
              subtitle: `${pName} · Est: $${item.estimated?.toLocaleString() ?? 0}`,
              href: `/project/${projectId}/budget`,
              projectName: pName,
            });
          }
        }
      }

      // Match contacts
      if (project.contacts) {
        for (const [, contact] of Object.entries(project.contacts as Record<string, any>)) {
          const name = contact.name || "";
          const role = contact.role || contact.trade || "";
          if (name.toLowerCase().includes(query) || role.toLowerCase().includes(query)) {
            results.push({
              type: "contact",
              title: name,
              subtitle: `${pName} · ${role}`,
              href: `/project/${projectId}/team`,
              projectName: pName,
            });
          }
        }
      }

      // Match tasks
      if (project.tasks) {
        for (const [, task] of Object.entries(project.tasks as Record<string, any>)) {
          if (task.label?.toLowerCase().includes(query)) {
            results.push({
              type: "task",
              title: task.label,
              subtitle: `${pName} · ${task.done ? "Completed" : "Open"}`,
              href: `/project/${projectId}/overview`,
              projectName: pName,
            });
          }
        }
      }

      // Match documents
      if (project.documents) {
        for (const [, doc] of Object.entries(project.documents as Record<string, any>)) {
          if (doc.name?.toLowerCase().includes(query)) {
            results.push({
              type: "document",
              title: doc.name,
              subtitle: pName,
              href: `/project/${projectId}/documents`,
              projectName: pName,
            });
          }
        }
      }
    }
  } catch {
    // Search failed silently
  }

  // Limit results
  return results.slice(0, 15);
}
