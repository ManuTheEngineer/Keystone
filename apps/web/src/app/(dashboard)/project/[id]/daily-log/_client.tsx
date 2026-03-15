"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
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
    const unsub = subscribeToDailyLogs(projectId, setLogs);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    const unsub = subscribeToProject(projectId, setProject);
    return unsub;
  }, [projectId]);

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
    if (!content.trim()) return;
    setSaving(true);
    try {
      const day = logs.length > 0 ? logs[0].day + 1 : 1;
      const date = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      await addDailyLog({
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
        <Card padding="md" className="text-center">
          <p className="text-[12px] text-muted">
            No daily log entries yet. Start documenting your construction progress.
          </p>
        </Card>
      ) : (
        <Card padding="sm">
          {logs.map((entry, i) => (
            <div
              key={entry.id}
              className={`py-3 ${i < logs.length - 1 ? "border-b border-border" : ""}`}
            >
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
