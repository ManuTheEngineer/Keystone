"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { getProject, ROBINSON_CONTACTS } from "@/lib/data/mock-projects";
import { SectionLabel } from "@/components/ui/SectionLabel";

export default function TeamPage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const project = getProject(params.id as string);

  useEffect(() => {
    setTopbar("Team", "26 contacts", "info");
  }, [setTopbar]);

  if (!project) return <p className="text-muted text-sm">Project not found.</p>;

  return (
    <>
      <SectionLabel>Active contractors and professionals</SectionLabel>
      <div className="space-y-1.5">
        {ROBINSON_CONTACTS.map((c, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3 p-3 border border-border rounded-[var(--radius)] bg-surface hover:border-border-dark hover:shadow-[var(--shadow-sm)] transition-all text-left"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
              style={{ background: c.bgColor, color: c.textColor }}
            >
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-earth truncate">{c.name}</div>
              <div className="text-[10px] text-muted">{c.role}</div>
            </div>
            <div className="text-[10px] text-muted font-data">{c.rating}/5</div>
          </button>
        ))}
      </div>

      {/* Educational callout */}
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
