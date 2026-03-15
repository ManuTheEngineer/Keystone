"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { subscribeToContacts, type ContactData } from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";

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

  useEffect(() => {
    const unsub = subscribeToContacts(projectId, setContacts);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    setTopbar("Team", `${contacts.length} contacts`, "info");
  }, [setTopbar, contacts.length]);

  return (
    <>
      <SectionLabel>Active contractors and professionals</SectionLabel>
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
