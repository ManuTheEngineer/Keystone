"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToContacts,
  subscribeToProject,
  addContact,
  type ContactData,
  type ProjectData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { Plus, Phone, Mail, Wrench, AlertCircle, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getTradesForPhase, PHASE_ORDER, PHASE_NAMES } from "@keystone/market-data";
import type { Market, ProjectPhase, TradeDefinition } from "@keystone/market-data";

const COLORS = [
  { bg: "var(--color-info-bg)", text: "var(--color-info)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning)" },
  { bg: "var(--color-danger-bg)", text: "var(--color-danger)" },
];

function TradeRequirementList({
  trades,
  phaseName,
  contacts,
}: {
  trades: TradeDefinition[];
  phaseName: string;
  contacts: ContactData[];
}) {
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
    <div className="space-y-1.5 mb-4">
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
  const projectId = params.id as string;
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [saving, setSaving] = useState(false);

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
      });
      setName("");
      setRole("");
      setCustomRole("");
      setPhone("");
      setEmail("");
      setRating("5");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
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
      />

      {/* Contacts section */}
      <div className="flex items-center justify-between">
        <SectionLabel>Active contractors and professionals</SectionLabel>
        <span
          className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
          onClick={() => setShowForm(true)}
        >
          <Plus size={12} /> Add contact
        </span>
      </div>

      {showForm && (
        <Card padding="md" className="mb-3">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contact name"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (e.target.value !== "__other__") {
                    setCustomRole("");
                  }
                }}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
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
                  className="mt-2 px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
                />
              )}
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">
                Rating (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}
      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No team members yet"
          description="Add contractors, architects, and professionals as you build your construction team."
          action={{ label: "Add contact", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-1.5">
          {contacts.map((c, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <button
                key={c.id}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-[var(--radius)] bg-surface hover:border-border-dark hover:shadow-[var(--shadow-sm)] transition-all text-left"
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
                  {(c.phone || c.email) && (
                    <div className="flex items-center gap-3 mt-0.5">
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
                <div className="text-[10px] text-muted font-data">{c.rating}/5</div>
              </button>
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
