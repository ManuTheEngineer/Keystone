"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { VoiceNote } from "@/components/ui/VoiceNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useTopbar } from "../../../layout";
import {
  subscribeToDailyLogs,
  subscribeToProject,
  addDailyLog,
  updateDailyLog,
  deleteDailyLog,
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
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;
  const [logs, setLogs] = useState<DailyLogData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weatherPreset, setWeatherPreset] = useState("");
  const [temperature, setTemperature] = useState("");
  const [crew, setCrew] = useState("1");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editWeather, setEditWeather] = useState("");
  const [editCrew, setEditCrew] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const highlightDay = searchParams.get("day");
  const scrolledRef = useRef(false);

  // Scroll to the targeted day when logs load
  useEffect(() => {
    if (!highlightDay || logs.length === 0 || scrolledRef.current) return;
    const dayNum = parseInt(highlightDay, 10);
    if (isNaN(dayNum)) return;
    const el = document.getElementById(`daily-log-day-${dayNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-clay/40");
      scrolledRef.current = true;
      setTimeout(() => el.classList.remove("ring-2", "ring-clay/40"), 3000);
    }
  }, [highlightDay, logs]);

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
    setTopbar(project?.name || t("project.dailyLog"), `${t("project.dailyLog")} — ${latestDay > 0 ? `Day ${latestDay}` : "No entries"}`, "info");
  }, [setTopbar, logs, project]);

  const market = (project?.market ?? "USA") as Market;
  const isUSAMarket = market === "USA";
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
      const day = logs.length > 0 ? Math.max(...logs.map(l => l.day)) + 1 : 1;
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
      showToast("Daily log entry saved", "success");
    } catch {
      showToast("Failed to save daily log entry", "error");
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

  function startEditLog(entry: DailyLogData) {
    setEditingLogId(entry.id!);
    setEditContent(entry.content);
    setEditWeather(entry.weather);
    setEditCrew(String(entry.crew));
  }

  async function handleEditLogSave(logId: string) {
    if (!user || !editContent.trim()) return;
    setEditSaving(true);
    try {
      await updateDailyLog(user.uid, projectId, logId, {
        content: editContent.trim(),
        weather: editWeather,
        crew: Number(editCrew),
      });
      setEditingLogId(null);
      showToast("Daily log entry updated", "success");
    } catch {
      showToast("Failed to update daily log entry", "error");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteLog(logId: string) {
    if (!user || deletingLogId) return;
    setDeletingLogId(logId);
    try {
      await deleteDailyLog(user.uid, projectId, logId);
      setDeleteConfirmId(null);
      showToast("Daily log entry deleted", "success");
    } catch {
      showToast("Failed to delete daily log entry", "error");
    } finally {
      setDeletingLogId(null);
    }
  }

  return (
    <>
      <PageHeader
        title={t("project.dailyLog")}
        projectName={project?.name}
        projectId={projectId}
        action={{ label: "Add entry", onClick: () => setShowForm(true), icon: <Plus size={14} /> }}
      />

      <SectionLabel>Recent entries</SectionLabel>

      {showForm && (
        <Card padding="md" className="mb-4 animate-expand">
          <div className="space-y-4">
            {/* Weather preset buttons */}
            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">Weather</label>
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
              <label className="block text-[12px] font-medium text-earth mb-1.5">
                Temperature ({tempSymbol})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder={isUSAMarket ? "e.g. 75" : "e.g. 28"}
                  className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-24"
                />
                <span className="text-[11px] text-muted">{tempSymbol}</span>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-earth mb-1.5">Crew size</label>
              <input
                type="number"
                min={1}
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] font-medium text-earth">Content</label>
                <span className="text-[10px] text-muted">Or use voice</span>
              </div>
              {/* Quick tags */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "Concrete poured",
                  "Framing completed",
                  "Inspection passed",
                  "Weather delay",
                  "Material delivered",
                  "Change order",
                  "No work today",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setContent((prev) => prev ? prev + " " + tag + "." : tag + ".")}
                    className="px-2 py-1 text-[10px] rounded-full border border-border bg-surface text-muted hover:border-earth hover:text-earth transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"What happened on site today? Consider noting:\n- Which trades were working and what they completed\n- Any materials delivered\n- Problems or delays encountered\n- Decisions made\n- Photos taken (reference by description)"}
                rows={4}
                className="px-3 py-3 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full resize-none"
              />
              <div className="mt-2">
                <VoiceNote
                  onTranscript={(text) => setContent((prev) => prev ? prev + " " + text : text)}
                  placeholder="Tap to dictate your daily log entry"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="btn-primary"
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
        <div className="space-y-2 animate-stagger">
          {logs.map((entry, i) => {
            const isEditing = editingLogId === entry.id;
            const isDeleteConfirm = deleteConfirmId === entry.id;

            return (
              <div
                key={entry.id}
                id={`daily-log-day-${entry.day}`}
                className="p-3 border border-border rounded-[var(--radius)] bg-surface border-l-[3px] hover:shadow-[var(--shadow-sm)] transition-shadow"
                style={{ borderLeftColor: getWeatherBorderColor(entry.weather) }}
              >
                <div className="flex gap-3">
                  {/* Day badge */}
                  <div className="shrink-0 w-10 h-10 rounded-[var(--radius)] bg-warm flex flex-col items-center justify-center">
                    <span className="text-[8px] uppercase tracking-wider text-muted leading-none">Day</span>
                    <span className="text-[14px] font-data font-semibold text-earth leading-tight">{entry.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-muted font-medium mb-0.5">Weather</label>
                            <input
                              type="text"
                              value={editWeather}
                              onChange={(e) => setEditWeather(e.target.value)}
                              className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-muted font-medium mb-0.5">Crew size</label>
                            <input
                              type="number"
                              min={0}
                              value={editCrew}
                              onChange={(e) => setEditCrew(e.target.value)}
                              className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-medium mb-0.5">Content</label>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="px-2 py-1.5 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full resize-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditLogSave(entry.id!)}
                            disabled={editSaving || !editContent.trim()}
                            className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                          >
                            {editSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingLogId(null)}
                            className="px-3 py-1.5 text-[11px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-[10px] text-muted font-data mb-1">
                          {entry.date} | {entry.weather} | Crew: {entry.crew}
                        </div>
                        <div className="text-[12px] text-muted leading-relaxed">{entry.content}</div>
                      </>
                    )}
                  </div>

                  {/* Edit / Delete buttons */}
                  {!isEditing && (
                    <div className="flex items-start gap-1 shrink-0">
                      <button
                        onClick={() => startEditLog(entry)}
                        className="p-1 text-muted hover:text-earth transition-colors"
                        title="Edit entry"
                      >
                        <Pencil size={14} />
                      </button>
                      {isDeleteConfirm ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteLog(entry.id!)}
                            disabled={deletingLogId === entry.id}
                            className="px-2 py-1 text-[10px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {deletingLogId === entry.id ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-[10px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(entry.id!)}
                          className="p-1 text-muted hover:text-danger transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
