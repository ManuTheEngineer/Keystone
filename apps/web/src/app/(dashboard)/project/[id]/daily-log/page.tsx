"use client";

import { useEffect } from "react";
import { useTopbar } from "../../../layout";
import { ROBINSON_DAILY_LOG } from "@/lib/data/mock-projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DailyLogPage() {
  const { setTopbar } = useTopbar();
  const params = useParams();

  useEffect(() => {
    setTopbar("Daily log", "Day 142", "info");
  }, [setTopbar]);

  return (
    <>
      <SectionLabel>Recent entries</SectionLabel>
      <Card padding="sm">
        {ROBINSON_DAILY_LOG.map((entry, i) => (
          <div
            key={i}
            className={`py-3 ${i < ROBINSON_DAILY_LOG.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="text-[10px] text-muted font-data mb-1">
              {entry.date} -- Day {entry.day} -- {entry.weather} -- Crew: {entry.crew}
            </div>
            <div className="text-[12px] text-muted leading-relaxed">
              {entry.content}
            </div>
          </div>
        ))}
      </Card>

      <div className="mt-4">
        <Link
          href={`/project/${params.id}/ai-assistant`}
          className="inline-flex px-4 py-2 text-[12px] border border-border-dark rounded-[var(--radius)] bg-surface text-earth hover:bg-surface-alt transition-colors"
        >
          Add today's entry with AI assist
        </Link>
      </div>
    </>
  );
}
