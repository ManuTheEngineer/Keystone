"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTopbar } from "../../../layout";
import { subscribeToDailyLogs, type DailyLogData } from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";

export function DailyLogClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [logs, setLogs] = useState<DailyLogData[]>([]);

  useEffect(() => {
    const unsub = subscribeToDailyLogs(projectId, setLogs);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    const latestDay = logs.length > 0 ? logs[0].day : 0;
    setTopbar("Daily log", latestDay > 0 ? `Day ${latestDay}` : "No entries", "info");
  }, [setTopbar, logs]);

  return (
    <>
      <SectionLabel>Recent entries</SectionLabel>
      {logs.length === 0 ? (
        <Card padding="md" className="text-center">
          <p className="text-[12px] text-muted">No daily log entries yet. Start documenting your construction progress.</p>
        </Card>
      ) : (
        <Card padding="sm">
          {logs.map((entry, i) => (
            <div key={entry.id} className={`py-3 ${i < logs.length - 1 ? "border-b border-border" : ""}`}>
              <div className="text-[10px] text-muted font-data mb-1">
                {entry.date} -- Day {entry.day} -- {entry.weather} -- Crew: {entry.crew}
              </div>
              <div className="text-[12px] text-muted leading-relaxed">{entry.content}</div>
            </div>
          ))}
        </Card>
      )}

      <div className="mt-4">
        <Link
          href={`/project/${projectId}/ai-assistant`}
          className="inline-flex px-4 py-2 text-[12px] border border-border-dark rounded-[var(--radius)] bg-surface text-earth hover:bg-surface-alt transition-colors"
        >
          Add today's entry with AI assist
        </Link>
      </div>
    </>
  );
}
