"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { subscribeToContacts, addContact, type ContactData } from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { Plus, Phone, Mail } from "lucide-react";

const COLORS = [
  { bg: "var(--color-info-bg)", text: "var(--color-info)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning)" },
  { bg: "var(--color-danger-bg)", text: "var(--color-danger)" },
];

export function TeamClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToContacts(projectId, setContacts);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    setTopbar("Team", `${contacts.length} contacts`, "info");
  }, [setTopbar, contacts.length]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const words = name.trim().split(/\s+/);
      const initials = words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : words[0].slice(0, 2).toUpperCase();
      await addContact({
        projectId,
        name: name.trim(),
        initials,
        role: role.trim(),
        rating: Number(rating),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      setName("");
      setRole("");
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
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Electrician, Architect"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
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
              <label className="block text-[11px] text-muted font-medium mb-1">Rating (1-5)</label>
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
        <Card padding="md" className="text-center">
          <p className="text-[12px] text-muted">No team members yet. Add contractors and professionals as you build your team.</p>
        </Card>
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
