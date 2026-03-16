"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Plus, Filter, ListChecks, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToPunchListItems,
  addPunchListItem,
  updatePunchListItem,
  type ProjectData,
  type PunchListItemData,
} from "@/lib/services/project-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getMarketData, getTradesForPhase, PHASE_ORDER } from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";

const SEVERITY_ORDER: Record<string, number> = { critical: 0, major: 1, minor: 2 };
const STATUS_ORDER: Record<string, number> = { open: 0, "in-progress": 1, resolved: 2 };

const SEVERITY_BADGE: Record<string, "danger" | "warning" | "info"> = {
  critical: "danger",
  major: "warning",
  minor: "info",
};

const STATUS_BADGE: Record<string, "danger" | "warning" | "success"> = {
  open: "danger",
  "in-progress": "warning",
  resolved: "success",
};

export function PunchListClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [items, setItems] = useState<PunchListItemData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [description, setDescription] = useState("");
  const [trade, setTrade] = useState("");
  const [severity, setSeverity] = useState<"critical" | "major" | "minor">("major");
  const [notes, setNotes] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProject(user.uid, projectId, setProject);
    const unsub2 = subscribeToPunchListItems(user.uid, projectId, setItems);
    return () => {
      unsub1();
      unsub2();
    };
  }, [user, projectId]);

  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey = PHASE_ORDER[project?.currentPhase ?? 0] ?? "DEFINE";

  // Get all trades for dropdown (across all phases for flexibility)
  const allTrades = useMemo(() => {
    const marketData = getMarketData(market);
    return marketData.trades;
  }, [market]);

  // Stats
  const openCount = items.filter((i) => i.status === "open").length;
  const inProgressCount = items.filter((i) => i.status === "in-progress").length;
  const resolvedCount = items.filter((i) => i.status === "resolved").length;

  useEffect(() => {
    setTopbar(
      "Punch list",
      items.length > 0 ? `${openCount} open` : "No items",
      openCount > 0 ? "warning" : "success"
    );
  }, [setTopbar, items, openCount]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...items];
    if (filterStatus !== "all") {
      filtered = filtered.filter((i) => i.status === filterStatus);
    }
    if (filterSeverity !== "all") {
      filtered = filtered.filter((i) => i.severity === filterSeverity);
    }
    filtered.sort((a, b) => {
      const sevDiff = (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2);
      if (sevDiff !== 0) return sevDiff;
      return (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2);
    });
    return filtered;
  }, [items, filterStatus, filterSeverity]);

  async function handleAddItem() {
    if (!description.trim() || !user) return;
    setSaving(true);
    try {
      await addPunchListItem(user.uid, {
        projectId,
        description: description.trim(),
        trade: trade || "General",
        severity,
        status: "open",
        notes: notes.trim() || undefined,
      });
      setDescription("");
      setTrade("");
      setSeverity("major");
      setNotes("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    item: PunchListItemData,
    newStatus: "open" | "in-progress" | "resolved"
  ) {
    if (!item.id || !user) return;
    await updatePunchListItem(user.uid, projectId, item.id, {
      status: newStatus,
      resolvedAt: newStatus === "resolved" ? new Date().toISOString() : undefined,
    });
  }

  return (
    <>
      <PageHeader
        title="Punch List"
        projectName={project?.name}
        projectId={projectId}
        action={{ label: "Add item", onClick: () => setShowForm(true), icon: <Plus size={14} /> }}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Card padding="sm">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">Total</p>
          <p className="text-[16px] font-semibold text-earth font-data">{items.length}</p>
        </Card>
        <Card padding="sm">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">Open</p>
          <p className="text-[16px] font-semibold text-danger font-data">{openCount}</p>
        </Card>
        <Card padding="sm">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">In progress</p>
          <p className="text-[16px] font-semibold text-warning font-data">{inProgressCount}</p>
        </Card>
        <Card padding="sm">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">Resolved</p>
          <p className="text-[16px] font-semibold text-success font-data">{resolvedCount}</p>
        </Card>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[11px] px-2 py-1.5 border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-[11px] px-2 py-1.5 border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
        >
          <Plus size={14} />
          Add item
        </button>
      </div>

      {/* Add item form */}
      {showForm && (
        <Card padding="md" className="mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or deficiency..."
                rows={2}
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-earth mb-1.5">Trade</label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
                >
                  <option value="">Select trade...</option>
                  {allTrades.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-earth mb-1.5">Severity</label>
                <div className="flex gap-1.5">
                  {(["critical", "major", "minor"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`flex-1 px-2 py-2 text-[11px] rounded-[var(--radius)] border transition-colors capitalize ${
                        severity === s
                          ? s === "critical"
                            ? "bg-danger-bg border-danger text-danger"
                            : s === "major"
                            ? "bg-warning-bg border-warning text-warning"
                            : "bg-info-bg border-info text-info"
                          : "border-border text-muted hover:bg-surface-alt"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted mt-1.5 leading-relaxed">
                  {severity === "critical"
                    ? "Safety hazard or code violation. Must be fixed before occupancy. Examples: missing handrail, faulty wiring, plumbing leak."
                    : severity === "major"
                    ? "Significant quality issue. Should be fixed before final payment. Examples: uneven flooring, poorly fitted cabinets, paint defects visible from 5 feet."
                    : "Cosmetic issue. Can be fixed during the warranty period. Examples: small nail pops, touch-up paint needed, minor caulking gaps."}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">
                Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional context or location details..."
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={saving || !description.trim()}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Add item"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Items list */}
      <SectionLabel>
        Items ({filteredItems.length})
      </SectionLabel>

      {filteredItems.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={28} />}
            title="No punch list items"
            description="Add deficiency items found during inspections or walkthroughs to track them through resolution."
            action={{ label: "Add item", onClick: () => setShowForm(true) }}
          />
        ) : (
          <Card padding="md" className="text-center">
            <p className="text-[12px] text-muted">
              No items match the current filters.
            </p>
          </Card>
        )
      ) : (
        <div className="space-y-2 animate-stagger">
          {filteredItems.map((item) => (
            <Card key={item.id} padding="sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={SEVERITY_BADGE[item.severity]}><span className={item.severity === "critical" ? "animate-gentle-pulse" : ""}>{item.severity}</span></Badge>
                    <Badge variant={STATUS_BADGE[item.status]}>{item.status}</Badge>
                    <span className="text-[10px] text-muted font-data">{item.trade}</span>
                  </div>
                  <p className="text-[12px] text-earth leading-relaxed">{item.description}</p>
                  {item.notes && (
                    <p className="text-[10px] text-muted mt-1">{item.notes}</p>
                  )}
                  {item.createdAt && (
                    <p className="text-[10px] text-muted/50 mt-1 font-data">
                      Added{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {item.resolvedAt &&
                        ` -- Resolved ${new Date(item.resolvedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}`}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        item,
                        e.target.value as "open" | "in-progress" | "resolved"
                      )
                    }
                    className="text-[10px] px-2 py-1 border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Educational footer */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[var(--radius)] p-4 mt-5">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-medium mb-1">What is a punch list?</p>
            <p className="text-[11px] leading-relaxed opacity-80">
              A punch list (sometimes called a snag list) is a document that tracks deficiencies,
              incomplete work, or items that need correction before a construction project can be
              considered complete. Items are typically identified during walk-throughs and
              inspections. Each item should be assigned to the responsible trade so
              the right contractor can address it. Critical items must be resolved before
              proceeding to the next phase or obtaining occupancy approval. Tracking severity
              helps prioritize which items to address first -- critical safety or structural
              issues always take precedence over cosmetic concerns.
            </p>
            <p className="text-[10px] mt-2 opacity-60">
              This is educational guidance. Consult a licensed professional for your specific situation.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
