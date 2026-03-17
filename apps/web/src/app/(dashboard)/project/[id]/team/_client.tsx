"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToContacts,
  subscribeToProject,
  addContact,
  updateContact,
  deleteContact,
  type ContactData,
  type ProjectData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Plus, Phone, Mail, MessageCircle, Wrench, AlertCircle, Users, Pencil, Trash2 } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { EmptyState } from "@/components/ui/EmptyState";
import { AIInsight } from "@/components/ui/AIInsight";
import { generateTeamInsights } from "@/lib/insights";
import { getTradesForPhase, PHASE_ORDER, PHASE_NAMES, getMarketData, formatCurrency } from "@keystone/market-data";
import type { Market, ProjectPhase, TradeDefinition } from "@keystone/market-data";

const COLORS = [
  { bg: "var(--color-info-bg)", text: "var(--color-info)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning)" },
  { bg: "var(--color-danger-bg)", text: "var(--color-danger)" },
];

const BORDER_COLORS = [
  "border-l-[var(--color-info)]",
  "border-l-[var(--color-success)]",
  "border-l-[var(--color-warning)]",
  "border-l-[var(--color-clay)]",
];

function TradeRequirementList({
  trades,
  phaseName,
  contacts,
  market,
}: {
  trades: TradeDefinition[];
  phaseName: string;
  contacts: ContactData[];
  market: Market;
}) {
  const marketData = getMarketData(market);
  if (trades.length === 0) {
    return (
      <Card padding="md" className="text-center mb-4">
        <p className="text-[12px] text-muted">
          No specific trades required for the {phaseName} phase.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-1.5 mb-4 animate-stagger">
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
                <span className="text-[10px] text-emerald-700 font-medium">
                  {matchedContact.name}
                </span>
              ) : (
                <span className="text-[10px] text-warning font-medium">Needed</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TeamClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { showToast } = useToast();
  const projectId = params.id as string;
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [rating, setRating] = useState("5");
  const [saving, setSaving] = useState(false);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editRating, setEditRating] = useState("5");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function openAddForm() {
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

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
    setTopbar("Team", `${contacts.length} contacts`, "info");
  }, [setTopbar, contacts.length]);

  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey: ProjectPhase = PHASE_ORDER[project?.currentPhase ?? 0];

  // Get all trades for all phases to populate the role dropdown
  const allTrades = useMemo(() => {
    const tradeSet = new Map<string, TradeDefinition>();
    PHASE_ORDER.forEach((phase) => {
      const trades = getTradesForPhase(market, phase);
      trades.forEach((t) => tradeSet.set(t.id, t));
    });
    return Array.from(tradeSet.values());
  }, [market]);

  // Get trades needed for the current phase
  const currentPhaseTrades = useMemo(() => {
    return getTradesForPhase(market, currentPhaseKey);
  }, [market, currentPhaseKey]);

  const resolvedRole = role === "__other__" ? customRole.trim() : role;

  async function handleSave() {
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      const words = name.trim().split(/\s+/);
      const initials =
        words.length >= 2
          ? (words[0][0] + words[1][0]).toUpperCase()
          : words[0].slice(0, 2).toUpperCase();
      await addContact(user.uid, {
        projectId,
        name: name.trim(),
        initials,
        role: resolvedRole,
        rating: Number(rating),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
      });
      setName("");
      setRole("");
      setCustomRole("");
      setPhone("");
      setEmail("");
      setWhatsapp("");
      setRating("5");
      setShowForm(false);
      showToast("Contact added", "success");
    } catch {
      showToast("Failed to add contact", "error");
    } finally {
      setSaving(false);
    }
  }

  function startEditContact(c: ContactData) {
    setEditingContactId(c.id!);
    setEditName(c.name);
    setEditRole(c.role);
    setEditPhone(c.phone ?? "");
    setEditEmail(c.email ?? "");
    setEditWhatsapp(c.whatsapp ?? "");
    setEditRating(String(c.rating));
  }

  async function handleEditContactSave(contactId: string) {
    if (!user || !editName.trim()) return;
    setEditSaving(true);
    try {
      const words = editName.trim().split(/\s+/);
      const initials =
        words.length >= 2
          ? (words[0][0] + words[1][0]).toUpperCase()
          : words[0].slice(0, 2).toUpperCase();
      await updateContact(user.uid, projectId, contactId, {
        name: editName.trim(),
        initials,
        role: editRole,
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        whatsapp: editWhatsapp.trim() || undefined,
        rating: Number(editRating),
      });
      setEditingContactId(null);
      showToast("Contact updated", "success");
    } catch {
      showToast("Failed to update contact", "error");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteContact(contactId: string) {
    if (!user) return;
    try {
      await deleteContact(user.uid, projectId, contactId);
      setDeleteConfirmId(null);
      setExpandedContact(null);
      showToast("Contact deleted", "success");
    } catch {
      showToast("Failed to delete contact", "error");
    }
  }

  // Compute trades filled count
  const filledTrades = currentPhaseTrades.filter((trade) =>
    contacts.some(
      (c) =>
        c.role?.toLowerCase() === trade.name.toLowerCase() ||
        c.role?.toLowerCase() === trade.localName?.toLowerCase()
    )
  ).length;

  return (
    <>
      <PageHeader
        title="Team"
        projectName={project?.name}
        projectId={projectId}
        action={{ label: "Add contact", onClick: openAddForm, icon: <Plus size={14} /> }}
      />

      {/* Trades filled stat */}
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

      {/* Trades needed this phase */}
      <div className="mb-2">
        <SectionLabel>
          Trades needed this phase ({PHASE_NAMES[currentPhaseKey]})
        </SectionLabel>
      </div>
      <TradeRequirementList
        trades={currentPhaseTrades}
        phaseName={PHASE_NAMES[currentPhaseKey]}
        contacts={contacts}
        market={market}
      />

      {/* Contractor hiring tips */}
      {currentPhaseTrades.length > 0 && (
        <Card padding="md" className="mb-4 bg-warm/30 border-sand/30">
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

      {/* AI Team Insights */}
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

      {/* Contacts section */}
      <div className="flex items-center justify-between">
        <SectionLabel>Active contractors and professionals</SectionLabel>
        <span
          className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
          onClick={openAddForm}
        >
          <Plus size={12} /> Add contact
        </span>
      </div>

      {showForm && (
        <div ref={formRef}>
        <Card padding="md" className="mb-3">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contact name"
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (e.target.value !== "__other__") {
                    setCustomRole("");
                  }
                }}
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
              >
                <option value="">Select a role...</option>
                {allTrades.map((trade) => (
                  <option key={trade.id} value={trade.name}>
                    {trade.name}
                    {trade.localName ? ` (${trade.localName})` : ""}
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
                  className="mt-2 px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
                />
              )}
            </div>
            {/* For West African markets, show WhatsApp before Phone */}
            {(market === "TOGO" || market === "GHANA" || market === "BENIN") && (
              <div>
                <label className="block text-[12px] font-medium text-earth mb-1.5">WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. +228 90 12 34 56"
                  className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
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
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            {/* For USA market, show WhatsApp after Email */}
            {market === "USA" && (
              <div>
                <label className="block text-[12px] font-medium text-earth mb-1.5">WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. +1 555 123 4567"
                  className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
                />
              </div>
            )}
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">Rating</label>
              <StarRating value={Number(rating)} onChange={(v) => setRating(String(v))} />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
        </div>
      )}
      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No team members yet"
          description="Add contractors, architects, and professionals as you build your construction team."
          action={{ label: "Add contact", onClick: openAddForm }}
        />
      ) : (
        <div className="space-y-1.5 animate-stagger">
          {contacts.map((c, i) => {
            const color = COLORS[i % COLORS.length];
            const isExpanded = expandedContact === c.id;
            const isEditing = editingContactId === c.id;
            const borderColor = [
              "var(--color-info)",
              "var(--color-success)",
              "var(--color-warning)",
              "var(--color-clay)",
            ][i % 4];

            return (
              <div
                key={c.id}
                className="border border-border rounded-[var(--radius)] bg-surface transition-all border-l-[3px] card-hover"
                style={{ borderLeftColor: borderColor }}
              >
                {/* Contact summary row */}
                <button
                  className="w-full flex items-center gap-3 p-3 hover:bg-surface-alt transition-colors text-left"
                  onClick={() => setExpandedContact(isExpanded ? null : c.id!)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-earth truncate">{c.name}</div>
                    <div className="text-[10px] text-muted">{c.role}</div>
                    {(c.phone || c.email || c.whatsapp) && (
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {c.whatsapp && (
                          <span className="flex items-center gap-1 text-[10px] text-muted">
                            <MessageCircle size={10} /> {c.whatsapp}
                          </span>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-1 text-[10px] text-muted">
                            <Phone size={10} /> {c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1 text-[10px] text-muted">
                            <Mail size={10} /> {c.email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <StarRating value={c.rating} readonly size={12} />
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border">
                    {isEditing ? (
                      <div className="space-y-2 pt-2">
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Role</label>
                          <input
                            type="text"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Phone</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Email</label>
                          <input
                            type="text"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">WhatsApp</label>
                          <input
                            type="text"
                            value={editWhatsapp}
                            onChange={(e) => setEditWhatsapp(e.target.value)}
                            placeholder="e.g. +228 90 12 34 56"
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Rating</label>
                          <StarRating value={Number(editRating)} onChange={(v) => setEditRating(String(v))} />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleEditContactSave(c.id!)}
                            disabled={editSaving || !editName.trim()}
                            className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                          >
                            {editSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingContactId(null)}
                            className="px-3 py-1.5 text-[11px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        {/* Full details */}
                        <div className="space-y-1 text-[11px] mb-3">
                          <div className="flex justify-between">
                            <span className="text-muted">Name</span>
                            <span className="text-earth">{c.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Role</span>
                            <span className="text-earth">{c.role}</span>
                          </div>
                          {c.phone && (
                            <div className="flex justify-between">
                              <span className="text-muted">Phone</span>
                              <span className="text-earth">{c.phone}</span>
                            </div>
                          )}
                          {c.email && (
                            <div className="flex justify-between">
                              <span className="text-muted">Email</span>
                              <span className="text-earth">{c.email}</span>
                            </div>
                          )}
                          {c.whatsapp && (
                            <div className="flex justify-between">
                              <span className="text-muted">WhatsApp</span>
                              <span className="flex items-center gap-1 text-earth">
                                <MessageCircle size={10} /> {c.whatsapp}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-muted">Rating</span>
                            <StarRating value={c.rating} readonly size={12} />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <button
                            onClick={() => startEditContact(c)}
                            className="flex items-center gap-1 px-3 py-1.5 text-[11px] border border-border rounded-[var(--radius)] text-earth hover:bg-surface-alt transition-colors"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          {deleteConfirmId === c.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-danger">Are you sure?</span>
                              <button
                                onClick={() => handleDeleteContact(c.id!)}
                                className="px-2 py-1 text-[10px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-[10px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(c.id!)}
                              className="flex items-center gap-1 px-3 py-1.5 text-[11px] border border-danger/30 rounded-[var(--radius)] text-danger hover:bg-danger/5 transition-colors"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">Managing your construction team</p>
        <p>
          Keep all contractor contact information in one place. Ratings help you track performance
          over time. Before hiring, always verify licenses, insurance, and references. For West
          African markets, WhatsApp is often the primary communication channel -- add those
          numbers here too.
        </p>
      </div>
    </>
  );
}
