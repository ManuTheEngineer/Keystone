"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToContacts,
  subscribeToProject,
  subscribeToTasks,
  addContact,
  updateContact,
  deleteContact,
  type ContactData,
  type ProjectData,
  type TaskData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import {
  Plus, Phone, Mail, MessageCircle, Wrench, AlertCircle, Users,
  Pencil, Trash2, Link2, CheckCircle2, Clock, XCircle, X,
  BarChart3, ChevronUp, ChevronDown,
} from "lucide-react";
import { generateContractorLink, getProjectContractorLinks, revokeContractorLink, type ContractorLink } from "@/lib/services/contractor-service";
import { StarRating } from "@/components/ui/StarRating";
import { EmptyState } from "@/components/ui/EmptyState";
import { AIInsight } from "@/components/ui/AIInsight";
import { generateTeamInsights } from "@/lib/insights";
import { getTradesForPhase, PHASE_ORDER, PHASE_NAMES, getMarketData, formatCurrency } from "@keystone/market-data";
import type { Market, ProjectPhase, TradeDefinition } from "@keystone/market-data";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TRADE_COLORS: Record<string, { bg: string; text: string }> = {
  Plumber: { bg: "#DBEAFE", text: "#1E40AF" },
  Electrician: { bg: "#FEF3C7", text: "#92400E" },
  Carpenter: { bg: "#D1FAE5", text: "#065F46" },
  Mason: { bg: "#FEE2E2", text: "#991B1B" },
  Roofer: { bg: "#E0E7FF", text: "#3730A3" },
  Painter: { bg: "#FCE7F3", text: "#9D174D" },
  Architect: { bg: "#F3E8FF", text: "#6B21A8" },
  Engineer: { bg: "#CCFBF1", text: "#115E59" },
};

const FALLBACK_COLORS = [
  { bg: "var(--color-info-bg)", text: "var(--color-info)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning)" },
  { bg: "var(--color-danger-bg)", text: "var(--color-danger)" },
];

type TabKey = "team" | "trades" | "performance";

type SortColumn = "name" | "trade" | "total" | "completed" | "pending" | "rejected" | "avgDays" | "rating";
type SortDir = "asc" | "desc";

/* ------------------------------------------------------------------ */
/*  Helper: get color for a trade/role                                 */
/* ------------------------------------------------------------------ */

function getTradeColor(role: string | undefined, index: number) {
  if (role) {
    const match = TRADE_COLORS[role];
    if (match) return match;
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

/* ------------------------------------------------------------------ */
/*  Performance data type                                              */
/* ------------------------------------------------------------------ */

interface PerfData {
  total: number;
  completed: number;
  pendingReview: number;
  rejected: number;
  avgCompletionDays: number | null;
}

/* ------------------------------------------------------------------ */
/*  Contact Modal                                                      */
/* ------------------------------------------------------------------ */

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    role: string;
    phone: string;
    email: string;
    whatsapp: string;
    rating: number;
  }) => Promise<void>;
  title: string;
  initialData?: {
    name: string;
    role: string;
    phone: string;
    email: string;
    whatsapp: string;
    rating: number;
  };
  allTrades: TradeDefinition[];
  market: Market;
}

function ContactModal({ open, onClose, onSave, title, initialData, allTrades, market }: ContactModalProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [role, setRole] = useState(() => {
    if (!initialData?.role) return "";
    const isKnownTrade = allTrades.some(
      (t) => t.name === initialData.role || t.localName === initialData.role
    );
    return isKnownTrade ? initialData.role : "__other__";
  });
  const [customRole, setCustomRole] = useState(() => {
    if (!initialData?.role) return "";
    const isKnownTrade = allTrades.some(
      (t) => t.name === initialData.role || t.localName === initialData.role
    );
    return isKnownTrade ? "" : initialData.role;
  });
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [rating, setRating] = useState(initialData?.rating ?? 5);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      const isKnownTrade = initialData?.role
        ? allTrades.some((t) => t.name === initialData.role || t.localName === initialData.role)
        : false;
      setRole(initialData?.role ? (isKnownTrade ? initialData.role : "__other__") : "");
      setCustomRole(initialData?.role && !isKnownTrade ? initialData.role : "");
      setPhone(initialData?.phone ?? "");
      setEmail(initialData?.email ?? "");
      setWhatsapp(initialData?.whatsapp ?? "");
      setRating(initialData?.rating ?? 5);
    }
  }, [open, initialData, allTrades]);

  // Close on escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const resolvedRole = role === "__other__" ? customRole.trim() : role;
  const isWA = market === "TOGO" || market === "GHANA" || market === "BENIN";

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        role: resolvedRole,
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        rating,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-[var(--radius)] shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-[14px] font-semibold text-earth">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] hover:bg-surface-alt transition-colors text-muted"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-earth mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
              autoFocus
              className="px-3 py-2.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-earth mb-1.5">Role / Trade</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== "__other__") setCustomRole("");
              }}
              className="px-3 py-2.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
            >
              <option value="">Select a role...</option>
              {allTrades.map((trade) => (
                <option key={trade.id} value={trade.name}>
                  {trade.name}{trade.localName ? ` (${trade.localName})` : ""}
                </option>
              ))}
              <option value="__other__">Other (custom)</option>
            </select>
            {role === "__other__" && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter custom role"
                className="mt-2 px-3 py-2.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            )}
          </div>

          {/* WhatsApp first for WA markets */}
          {isWA && (
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. +228 90 12 34 56"
                className="px-3 py-2.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-earth mb-1.5">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              className="px-3 py-2.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-earth mb-1.5">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
              className="px-3 py-2.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
            />
          </div>

          {/* WhatsApp after email for USA */}
          {!isWA && (
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className="px-3 py-2.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-earth mb-1.5">Rating</label>
            <StarRating value={rating} onChange={(v) => setRating(v)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className="btn-primary"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trade Requirement List (Tab 2)                                     */
/* ------------------------------------------------------------------ */

function TradeRequirementList({
  trades,
  phaseName,
  contacts,
  market,
  onAddContact,
}: {
  trades: TradeDefinition[];
  phaseName: string;
  contacts: ContactData[];
  market: Market;
  onAddContact: (tradeName: string) => void;
}) {
  const marketData = getMarketData(market);

  if (trades.length === 0) {
    return (
      <Card padding="md" className="text-center">
        <p className="text-[12px] text-muted">
          No specific trades required for the {phaseName} phase.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-1.5 animate-stagger">
      {trades.map((trade) => {
        const matchedContact = contacts.find(
          (c) =>
            c.role?.toLowerCase() === trade.name.toLowerCase() ||
            c.role?.toLowerCase() === trade.localName?.toLowerCase()
        );
        const hasContact = !!matchedContact;

        return (
          <div
            key={trade.id}
            className={`flex items-center gap-3 p-3 border rounded-[var(--radius)] transition-all ${
              hasContact
                ? "border-emerald-200 bg-emerald-50"
                : "border-warning bg-warning-bg"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                hasContact
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-warning-bg text-warning"
              }`}
            >
              <Wrench size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-earth">
                {trade.name}
                {trade.localName && (
                  <span className="text-muted font-normal ml-1">({trade.localName})</span>
                )}
              </div>
              <div className="text-[10px] text-muted mt-0.5 line-clamp-1">
                {trade.description}
              </div>
              {trade.licensingRequired && (
                <div className="flex items-center gap-1 mt-0.5">
                  <AlertCircle size={9} className="text-warning shrink-0" />
                  <span className="text-[9px] text-warning">
                    License required{trade.licensingNotes ? `: ${trade.licensingNotes}` : ""}
                  </span>
                </div>
              )}
              {trade.typicalRateRange && (
                <div className="text-[9px] text-muted mt-0.5 font-data">
                  Typical rate: {formatCurrency(trade.typicalRateRange.low, marketData.currency)} - {formatCurrency(trade.typicalRateRange.high, marketData.currency)}/{trade.typicalRateRange.unit}
                  <span className="font-sans ml-1">(typical for {market === "USA" ? "US" : market.charAt(0) + market.slice(1).toLowerCase()} market)</span>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              {hasContact ? (
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 size={10} /> {matchedContact.name}
                </span>
              ) : (
                <button
                  onClick={() => onAddContact(trade.name)}
                  className="text-[10px] text-warning font-medium hover:underline flex items-center gap-1"
                >
                  <Plus size={10} /> Add
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Card (Tab 1)                                               */
/* ------------------------------------------------------------------ */

function ContactCard({
  contact,
  index,
  perf,
  contractorLinks,
  onEdit,
  onDelete,
  onShareAccess,
}: {
  contact: ContactData;
  index: number;
  perf: PerfData | undefined;
  contractorLinks: ContractorLink[];
  onEdit: () => void;
  onDelete: () => void;
  onShareAccess: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const color = getTradeColor(contact.role, index);
  const hasPortal = contractorLinks.some((l) => l.contactId === contact.id);
  const completionRate = perf && perf.total > 0 ? Math.round((perf.completed / perf.total) * 100) : null;
  const pending = perf ? perf.total - perf.completed : 0;

  return (
    <Card padding="sm" className="relative overflow-hidden card-hover">
      {/* Top-right action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
        <button
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] hover:bg-surface-alt transition-colors text-muted"
          title="Edit contact"
        >
          <Pencil size={13} />
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1 bg-surface border border-danger/30 rounded-[var(--radius)] px-2 py-1">
            <span className="text-[10px] text-danger whitespace-nowrap">Delete?</span>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="px-1.5 py-0.5 text-[10px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-1.5 py-0.5 text-[10px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] hover:bg-danger/5 transition-colors text-muted hover:text-danger"
            title="Delete contact"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Initials + name + role */}
        <div className="flex items-start gap-3 mb-3 pr-16">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
            style={{ background: color.bg, color: color.text }}
          >
            {contact.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-earth truncate">{contact.name}</div>
            <div className="text-[11px] text-muted">{contact.role || "No role assigned"}</div>
            {hasPortal && (
              <Badge variant="emerald" className="mt-1">Portal active</Badge>
            )}
          </div>
        </div>

        {/* Contact icons row */}
        <div className="flex items-center gap-2 mb-3">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-muted hover:text-earth bg-surface-alt rounded-[var(--radius)] transition-colors"
              title={contact.phone}
            >
              <Phone size={12} />
              <span className="hidden sm:inline truncate max-w-[100px]">{contact.phone}</span>
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-muted hover:text-earth bg-surface-alt rounded-[var(--radius)] transition-colors"
              title={contact.email}
            >
              <Mail size={12} />
              <span className="hidden sm:inline truncate max-w-[100px]">{contact.email}</span>
            </a>
          )}
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/[^0-9+]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 rounded-[var(--radius)] transition-colors"
              title={contact.whatsapp}
            >
              <MessageCircle size={12} />
              <span className="hidden sm:inline truncate max-w-[100px]">{contact.whatsapp}</span>
            </a>
          )}
        </div>

        {/* Star rating */}
        <div className="mb-3">
          <StarRating value={contact.rating} readonly size={14} />
        </div>

        {/* Task stats + completion bar */}
        {perf && perf.total > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-[11px] text-muted mb-1.5">
              <span className="font-data">{perf.total} tasks</span>
              <span className="text-[9px]">--</span>
              <span className="text-success font-data">{perf.completed} done</span>
              {pending > 0 && (
                <span className="text-warning font-data">{pending} pending</span>
              )}
            </div>
            {completionRate !== null && (
              <ProgressBar
                value={completionRate}
                color="var(--color-success)"
                height={4}
              />
            )}
          </div>
        )}

        {/* Share access button */}
        <button
          onClick={onShareAccess}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium border border-emerald-300 rounded-[var(--radius)] text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <Link2 size={12} /> Share access
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Performance Table (Tab 3)                                          */
/* ------------------------------------------------------------------ */

function PerformanceTab({
  contacts,
  contactPerformance,
}: {
  contacts: ContactData[];
  contactPerformance: Map<string, PerfData>;
}) {
  const [sortCol, setSortCol] = useState<SortColumn>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(col: SortColumn) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  // Summary stats
  const totalContacts = contacts.length;
  const avgRating = totalContacts > 0
    ? Math.round((contacts.reduce((s, c) => s + c.rating, 0) / totalContacts) * 10) / 10
    : 0;
  const totalTasksDone = Array.from(contactPerformance.values()).reduce((s, p) => s + p.completed, 0);
  const allAvgDays = (() => {
    const perfs = Array.from(contactPerformance.values()).filter((p) => p.avgCompletionDays !== null);
    if (perfs.length === 0) return null;
    return Math.round((perfs.reduce((s, p) => s + p.avgCompletionDays!, 0) / perfs.length) * 10) / 10;
  })();

  // Build sortable rows
  const rows = useMemo(() => {
    const mapped = contacts.map((c) => {
      const perf = contactPerformance.get(c.id!) ?? {
        total: 0, completed: 0, pendingReview: 0, rejected: 0, avgCompletionDays: null,
      };
      return { contact: c, perf };
    });

    mapped.sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case "name": cmp = a.contact.name.localeCompare(b.contact.name); break;
        case "trade": cmp = (a.contact.role ?? "").localeCompare(b.contact.role ?? ""); break;
        case "total": cmp = a.perf.total - b.perf.total; break;
        case "completed": cmp = a.perf.completed - b.perf.completed; break;
        case "pending": cmp = a.perf.pendingReview - b.perf.pendingReview; break;
        case "rejected": cmp = a.perf.rejected - b.perf.rejected; break;
        case "avgDays": cmp = (a.perf.avgCompletionDays ?? 999) - (b.perf.avgCompletionDays ?? 999); break;
        case "rating": cmp = a.contact.rating - b.contact.rating; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return mapped;
  }, [contacts, contactPerformance, sortCol, sortDir]);

  function SortHeader({ col, label, className }: { col: SortColumn; label: string; className?: string }) {
    const active = sortCol === col;
    return (
      <th
        className={`text-left text-[10px] font-medium text-muted py-2 px-2 cursor-pointer select-none hover:text-earth transition-colors ${className ?? ""}`}
        onClick={() => toggleSort(col)}
      >
        <span className="flex items-center gap-0.5">
          {label}
          {active && (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card padding="md" className="text-center">
          <div className="text-[20px] font-data font-semibold text-earth">{totalContacts}</div>
          <div className="text-[10px] text-muted mt-0.5">Total contacts</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-[20px] font-data font-semibold text-earth">{avgRating}</div>
          <div className="text-[10px] text-muted mt-0.5">Avg rating</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-[20px] font-data font-semibold text-earth">{totalTasksDone}</div>
          <div className="text-[10px] text-muted mt-0.5">Tasks completed</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-[20px] font-data font-semibold text-earth">
            {allAvgDays !== null ? `${allAvgDays}d` : "--"}
          </div>
          <div className="text-[10px] text-muted mt-0.5">Avg completion</div>
        </Card>
      </div>

      {/* Per-contractor table */}
      {contacts.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No performance data"
          description="Add team members and assign tasks to see performance analytics here."
        />
      ) : (
        <Card padding="sm" className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-border bg-surface-alt">
              <tr>
                <SortHeader col="name" label="Name" className="pl-3" />
                <SortHeader col="trade" label="Trade" />
                <SortHeader col="total" label="Tasks" />
                <SortHeader col="completed" label="Done" />
                <SortHeader col="pending" label="Pending" />
                <SortHeader col="rejected" label="Rejected" />
                <SortHeader col="avgDays" label="Avg Days" />
                <SortHeader col="rating" label="Rating" className="pr-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ contact, perf }) => (
                <tr key={contact.id} className="border-b border-border last:border-b-0 hover:bg-surface-alt transition-colors">
                  <td className="py-2.5 px-2 pl-3 text-[12px] text-earth font-medium">{contact.name}</td>
                  <td className="py-2.5 px-2 text-[11px] text-muted">{contact.role || "--"}</td>
                  <td className="py-2.5 px-2 text-[12px] font-data text-earth">{perf.total}</td>
                  <td className="py-2.5 px-2 text-[12px] font-data text-success">{perf.completed}</td>
                  <td className="py-2.5 px-2 text-[12px] font-data text-warning">{perf.pendingReview}</td>
                  <td className="py-2.5 px-2 text-[12px] font-data text-danger">{perf.rejected}</td>
                  <td className="py-2.5 px-2 text-[12px] font-data text-muted">
                    {perf.avgCompletionDays !== null ? `${perf.avgCompletionDays}` : "--"}
                  </td>
                  <td className="py-2.5 px-2 pr-3">
                    <StarRating value={contact.rating} readonly size={11} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Client Component                                              */
/* ------------------------------------------------------------------ */

export function TeamClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;

  // Data state
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [contractorLinks, setContractorLinks] = useState<ContractorLink[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>("team");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(null);
  const [prefillRole, setPrefillRole] = useState<string>("");

  // Subscriptions
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToContacts(user.uid, projectId, setContacts);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProject(user.uid, projectId, setProject);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTasks(user.uid, projectId, setTasks);
    return unsub;
  }, [user, projectId]);

  // Load contractor links
  useEffect(() => {
    if (!user) return;
    getProjectContractorLinks(user.uid, projectId).then(setContractorLinks).catch(() => {});
  }, [user, projectId, contacts]);

  // Topbar
  useEffect(() => {
    setTopbar(t("project.team"), `${contacts.length} contacts`, "info");
  }, [setTopbar, contacts.length, t]);

  // Market + phase
  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey: ProjectPhase = PHASE_ORDER[project?.currentPhase ?? 0];

  // All trades for role dropdown
  const allTrades = useMemo(() => {
    const tradeSet = new Map<string, TradeDefinition>();
    PHASE_ORDER.forEach((phase) => {
      const trades = getTradesForPhase(market, phase);
      trades.forEach((t) => tradeSet.set(t.id, t));
    });
    return Array.from(tradeSet.values());
  }, [market]);

  // Trades for current phase
  const currentPhaseTrades = useMemo(() => {
    return getTradesForPhase(market, currentPhaseKey);
  }, [market, currentPhaseKey]);

  // Compute per-contact performance stats
  const contactPerformance = useMemo(() => {
    const perfMap = new Map<string, PerfData>();
    for (const task of tasks) {
      if (!task.assignedTo) continue;
      const existing = perfMap.get(task.assignedTo) || {
        total: 0, completed: 0, pendingReview: 0, rejected: 0, avgCompletionDays: null,
      };
      existing.total++;
      if (task.status === "done") existing.completed++;
      if (task.status === "pending-review") existing.pendingReview++;
      if ((task.rejectionCount ?? 0) > 0) existing.rejected++;
      perfMap.set(task.assignedTo, existing);
    }
    // Calculate avg completion time
    for (const [contactId, perf] of perfMap.entries()) {
      const contactTasks = tasks.filter(
        (t) => t.assignedTo === contactId && t.status === "done" && t.completedAt && t.startDate
      );
      if (contactTasks.length > 0) {
        const totalDays = contactTasks.reduce((sum, t) => {
          const start = new Date(t.startDate!).getTime();
          const end = new Date(t.completedAt!).getTime();
          return sum + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
        }, 0);
        perf.avgCompletionDays = Math.round((totalDays / contactTasks.length) * 10) / 10;
      }
    }
    return perfMap;
  }, [tasks]);

  // Trades filled count
  const filledTrades = currentPhaseTrades.filter((trade) =>
    contacts.some(
      (c) =>
        c.role?.toLowerCase() === trade.name.toLowerCase() ||
        c.role?.toLowerCase() === trade.localName?.toLowerCase()
    )
  ).length;

  // Handlers
  function openAddModal(role?: string) {
    setEditingContact(null);
    setPrefillRole(role ?? "");
    setModalOpen(true);
  }

  function openEditModal(contact: ContactData) {
    setEditingContact(contact);
    setPrefillRole("");
    setModalOpen(true);
  }

  const handleModalSave = useCallback(async (data: {
    name: string; role: string; phone: string; email: string; whatsapp: string; rating: number;
  }) => {
    if (!user) return;
    const words = data.name.split(/\s+/);
    const initials = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : words[0].slice(0, 2).toUpperCase();

    if (editingContact) {
      // Update existing
      await updateContact(user.uid, projectId, editingContact.id!, {
        name: data.name,
        initials,
        role: data.role,
        phone: data.phone || undefined,
        email: data.email || undefined,
        whatsapp: data.whatsapp || undefined,
        rating: data.rating,
      });
      showToast("Contact updated", "success");
    } else {
      // Create new
      await addContact(user.uid, {
        projectId,
        name: data.name,
        initials,
        role: data.role,
        phone: data.phone || undefined,
        email: data.email || undefined,
        whatsapp: data.whatsapp || undefined,
        rating: data.rating,
      });
      showToast("Contact added", "success");
    }
  }, [user, projectId, editingContact, showToast]);

  async function handleDeleteContact(contactId: string) {
    if (!user) return;
    try {
      await deleteContact(user.uid, projectId, contactId);
      showToast("Contact deleted", "success");
    } catch {
      showToast("Failed to delete contact", "error");
    }
  }

  async function handleShareAccess(contact: ContactData) {
    if (!user || !profile) return;
    try {
      const result = await generateContractorLink(
        user.uid, projectId, contact.id!, contact.name, contact.role, profile.plan
      );
      if ("error" in result) {
        showToast(result.error, "error");
        return;
      }
      const url = `${window.location.origin}/contractor/${result.token}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Access link copied to clipboard.", "success");
      } catch {
        window.prompt("Copy this link and share with your contractor:", url);
      }
      // Refresh links
      const updated = await getProjectContractorLinks(user.uid, projectId);
      setContractorLinks(updated);
    } catch {
      showToast("Failed to generate link. Please try again.", "error");
    }
  }

  // Modal initial data
  const modalInitialData = editingContact
    ? {
        name: editingContact.name,
        role: editingContact.role,
        phone: editingContact.phone ?? "",
        email: editingContact.email ?? "",
        whatsapp: editingContact.whatsapp ?? "",
        rating: editingContact.rating,
      }
    : prefillRole
    ? { name: "", role: prefillRole, phone: "", email: "", whatsapp: "", rating: 5 }
    : undefined;

  // Tab definitions
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "team", label: "Team", count: contacts.length },
    { key: "trades", label: "Trades Needed", count: currentPhaseTrades.length - filledTrades },
    { key: "performance", label: "Performance" },
  ];

  return (
    <>
      <PageHeader
        title={t("project.team")}
        projectName={project?.name}
        projectId={projectId}
        action={{ label: "Add contact", onClick: () => openAddModal(), icon: <Plus size={14} /> }}
      />

      {/* Trades filled stat bar */}
      {currentPhaseTrades.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-muted">{filledTrades} of {currentPhaseTrades.length} trades filled</span>
            <span className="font-data text-earth">{Math.round((filledTrades / currentPhaseTrades.length) * 100)}%</span>
          </div>
          <ProgressBar
            value={Math.round((filledTrades / currentPhaseTrades.length) * 100)}
            color="var(--color-success)"
            height={4}
          />
        </div>
      )}

      {/* AI Insights */}
      {project && (() => {
        const teamInsights = generateTeamInsights(project, contacts, market);
        const topInsights = teamInsights.sort((a, b) => b.priority - a.priority).slice(0, 3);
        if (topInsights.length === 0) return null;
        return (
          <div className="mb-4 space-y-2">
            <SectionLabel>AI Insights</SectionLabel>
            {topInsights.map((insight, i) => (
              <AIInsight key={i} type={insight.type} title={insight.title} content={insight.content} action={insight.action} />
            ))}
          </div>
        );
      })()}

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2.5 text-[12px] font-medium transition-colors ${
              activeTab === tab.key
                ? "text-earth"
                : "text-muted hover:text-earth"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[9px] font-data px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-earth text-warm"
                      : "bg-surface-alt text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-earth rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Team grid */}
      {activeTab === "team" && (
        <>
          {contacts.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No team members yet"
              description="Add contractors, architects, and professionals as you build your construction team."
              action={{ label: "Add contact", onClick: () => openAddModal() }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-stagger">
              {contacts.map((c, i) => (
                <ContactCard
                  key={c.id}
                  contact={c}
                  index={i}
                  perf={c.id ? contactPerformance.get(c.id) : undefined}
                  contractorLinks={contractorLinks}
                  onEdit={() => openEditModal(c)}
                  onDelete={() => handleDeleteContact(c.id!)}
                  onShareAccess={() => handleShareAccess(c)}
                />
              ))}
            </div>
          )}

          {/* Tips card */}
          {contacts.length > 0 && (
            <div className="mt-5 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
              <p className="font-semibold mb-1">Managing your construction team</p>
              <p>
                Keep all contractor contact information in one place. Ratings help you track performance
                over time. Before hiring, always verify licenses, insurance, and references. For West
                African markets, WhatsApp is often the primary communication channel -- add those
                numbers here too.
              </p>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Trades Needed */}
      {activeTab === "trades" && (
        <div className="space-y-4">
          <SectionLabel>
            Trades needed this phase ({PHASE_NAMES[currentPhaseKey]})
          </SectionLabel>
          <TradeRequirementList
            trades={currentPhaseTrades}
            phaseName={PHASE_NAMES[currentPhaseKey]}
            contacts={contacts}
            market={market}
            onAddContact={(tradeName) => openAddModal(tradeName)}
          />

          {/* Contractor hiring tips */}
          {currentPhaseTrades.length > 0 && (
            <Card padding="md" className="bg-warm/30 border-sand/30">
              <p className="text-[12px] font-semibold text-earth mb-2">How to find good contractors</p>
              {market === "USA" ? (
                <ol className="text-[11px] text-muted leading-relaxed space-y-1 list-decimal list-inside">
                  <li>Ask neighbors who are building or recently built</li>
                  <li>Check with your local builders association</li>
                  <li>Visit active construction sites and ask who they recommend</li>
                  <li>Get at least 3 bids for every trade</li>
                  <li>Always verify licenses, insurance, and references before hiring</li>
                </ol>
              ) : (
                <ol className="text-[11px] text-muted leading-relaxed space-y-1 list-decimal list-inside">
                  <li>Ask your chef de quartier for recommendations</li>
                  <li>Visit active construction sites in your neighborhood</li>
                  <li>Get referrals from friends and family</li>
                  <li>Check the contractor{"'"}s recent work in person</li>
                  <li>Agree on daily rates in writing before work begins</li>
                </ol>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Performance */}
      {activeTab === "performance" && (
        <PerformanceTab
          contacts={contacts}
          contactPerformance={contactPerformance}
        />
      )}

      {/* Contact Modal (Add / Edit) */}
      <ContactModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingContact(null); setPrefillRole(""); }}
        onSave={handleModalSave}
        title={editingContact ? "Edit contact" : "Add contact"}
        initialData={modalInitialData}
        allTrades={allTrades}
        market={market}
      />
    </>
  );
}
