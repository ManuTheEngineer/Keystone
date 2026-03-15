"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTopbar } from "../../../layout";
import { subscribeToDailyLogs, addDailyLog, type DailyLogData } from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";

export function DailyLogClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [logs, setLogs] = useState<DailyLogData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [weather, setWeather] = useState("");
  const [crew, setCrew] = useState("1");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToDailyLogs(projectId, setLogs);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    const latestDay = logs.length > 0 ? logs[0].day : 0;
    setTopbar("Daily log", latestDay > 0 ? `Day ${latestDay}` : "No entries", "info");
  }, [setTopbar, logs]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const day = logs.length > 0 ? logs[0].day + 1 : 1;
      const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      await addDailyLog({
        projectId,
        date,
        day,
        weather: weather || "Not recorded",
        crew: Number(crew),
        content,
      });
      setWeather("");
      setCrew("1");
      setContent("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <SectionLabel>Recent entries</SectionLabel>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
        >
          <Plus size={14} />
          Add entry
        </button>
      </div>

      {showForm && (
        <Card padding="md" className="mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Weather</label>
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="e.g. Sunny 75F"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Crew size</label>
              <input
                type="number"
                min={1}
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What happened on site today?"
                rows={3}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full resize-none"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Card>
      )}
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
