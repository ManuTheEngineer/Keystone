"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTopbar } from "../../../layout";
import {
  subscribeToDailyLogs,
  subscribeToProject,
  addDailyLog,
  type DailyLogData,
  type ProjectData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { getMarketData } from "@keystone/market-data";
import type { Market } from "@keystone/market-data";

const WEATHER_PRESETS_EN = [
  { id: "sunny", label: "Sunny" },
  { id: "partly-cloudy", label: "Partly Cloudy" },
  { id: "cloudy", label: "Cloudy" },
  { id: "rain", label: "Rain" },
  { id: "storm", label: "Storm" },
];

const WEATHER_PRESETS_FR = [
  { id: "sunny", label: "Ensoleille" },
  { id: "partly-cloudy", label: "Partiellement nuageux" },
  { id: "cloudy", label: "Nuageux" },
  { id: "rain", label: "Pluie" },
  { id: "storm", label: "Orage" },
];

export function DailyLogClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const projectId = params.id as string;
  const [logs, setLogs] = useState<DailyLogData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weatherPreset, setWeatherPreset] = useState("");
  const [temperature, setTemperature] = useState("");
  const [crew, setCrew] = useState("1");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToDailyLogs(user.uid, projectId, setLogs);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProject(user.uid, projectId, setProject);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    const latestDay = logs.length > 0 ? logs[0].day : 0;
    setTopbar("Daily log", latestDay > 0 ? `Day ${latestDay}` : "No entries", "info");
  }, [setTopbar, logs]);

  const market = (project?.market ?? "USA") as Market;
  const isUSAMarket = market === "USA" || market === "GHANA";
  const tempUnit = isUSAMarket ? "F" : "C";
  const tempSymbol = isUSAMarket ? "°F" : "°C";
  const weatherPresets = isUSAMarket ? WEATHER_PRESETS_EN : WEATHER_PRESETS_FR;

  function buildWeatherString(): string {
    const parts: string[] = [];
    if (weatherPreset) {
      const preset = weatherPresets.find((p) => p.id === weatherPreset);
      if (preset) parts.push(preset.label);
    }
    if (temperature.trim()) {
      parts.push(`${temperature.trim()}${tempSymbol}`);
    }
    return parts.length > 0 ? parts.join(" ") : "Not recorded";
  }

  async function handleSave() {
    if (!content.trim() || !user) return;
    setSaving(true);
    try {
      const day = logs.length > 0 ? logs[0].day + 1 : 1;
      const date = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      await addDailyLog(user.uid, {
        projectId,
        date,
        day,
        weather: buildWeatherString(),
        crew: Number(crew),
        content,
      });
      setWeatherPreset("");
      setTemperature("");
      setCrew("1");
      setContent("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function getWeatherBorderColor(weather: string): string {
    const w = weather.toLowerCase();
    if (w.includes("storm") || w.includes("orage")) return "var(--color-danger)";
    if (w.includes("rain") || w.includes("pluie")) return "var(--color-info)";
    if (w.includes("sunny") || w.includes("ensoleille")) return "var(--color-warning)";
    return "var(--color-muted)";
  }

  return (
    <>
      <PageHeader
        title="Daily Log"
        projectName={project?.name}
        projectId={projectId}
        action={{ label: "Add entry", onClick: () => setShowForm(true), icon: <Plus size={14} /> }}
      />

      <SectionLabel>Recent entries</SectionLabel>

      {showForm && (
        <Card padding="md" className="mb-4">
          <div className="space-y-3">
            {/* Weather preset buttons */}
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1.5">Weather</label>
              <div className="flex flex-wrap gap-1.5">
                {weatherPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setWeatherPreset(weatherPreset === preset.id ? "" : preset.id)
                    }
                    className={`px-3 py-1.5 text-[11px] rounded-full border transition-colors ${
                      weatherPreset === preset.id
                        ? "border-earth border-2 bg-surface-alt text-earth font-medium"
                        : "border-border bg-surface text-muted hover:border-border-dark"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature input */}
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">
                Temperature ({tempSymbol})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder={isUSAMarket ? "e.g. 75" : "e.g. 28"}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-24"
                />
                <span className="text-[11px] text-muted">{tempSymbol}</span>
              </div>
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
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="No daily log entries yet"
          description="Document your construction progress with daily entries tracking weather, crew size, and work completed."
          action={{ label: "Add first entry", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-2">
          {logs.map((entry, i) => (
            <div
              key={entry.id}
              className="flex gap-3 p-3 border border-border rounded-[var(--radius)] bg-surface border-l-[3px]"
              style={{ borderLeftColor: getWeatherBorderColor(entry.weather) }}
            >
              {/* Day badge */}
              <div className="shrink-0 w-10 h-10 rounded-[var(--radius)] bg-warm flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase tracking-wider text-muted leading-none">Day</span>
                <span className="text-[14px] font-data font-semibold text-earth leading-tight">{entry.day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-muted font-data mb-1">
                  {entry.date} | {entry.weather} | Crew: {entry.crew}
                </div>
                <div className="text-[12px] text-muted leading-relaxed">{entry.content}</div>
              </div>
            </div>
          ))}
        </div>
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
