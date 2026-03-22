"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import {
  Plus,
  ClipboardList,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Search,
  X,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { VoiceNote } from "@/components/ui/VoiceNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useTopbar } from "../../../layout";
import {
  subscribeToDailyLogs,
  subscribeToProject,
  subscribeToPhotos,
  addDailyLog,
  updateDailyLog,
  deleteDailyLog,
  type DailyLogData,
  type ProjectData,
  type PhotoData,
} from "@/lib/services/project-service";
import type { Market } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Weather presets
// ---------------------------------------------------------------------------

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

const QUICK_TAGS = [
  "Concrete poured",
  "Framing completed",
  "Inspection passed",
  "Weather delay",
  "Material delivered",
  "Change order",
  "No work today",
];

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday start
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${weekStart.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", opts)}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseEntryDate(dateStr: string): Date | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DailyLogClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;

  // Data
  const [logs, setLogs] = useState<DailyLogData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [showDayTooltip, setShowDayTooltip] = useState(false);

  // New entry form
  const [weatherPreset, setWeatherPreset] = useState("");
  const [temperature, setTemperature] = useState("");
  const [crew, setCrew] = useState("1");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editWeather, setEditWeather] = useState("");
  const [editCrew, setEditCrew] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  // Deep-link scroll
  const searchParams = useSearchParams();
  const highlightDay = searchParams.get("day");
  const scrolledRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!user) return;
    return subscribeToDailyLogs(user.uid, projectId, setLogs);
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToProject(user.uid, projectId, setProject);
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToPhotos(user.uid, projectId, setPhotos);
  }, [user, projectId]);

  // Deep-link scroll
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

  // Topbar
  useEffect(() => {
    const latestDay = logs.length > 0 ? logs[0].day : 0;
    setTopbar(
      project?.name || t("project.dailyLog"),
      `${t("project.dailyLog")} — ${latestDay > 0 ? `Day ${latestDay}` : "No entries"}`,
      "info"
    );
  }, [setTopbar, logs, project]);

  // ---------------------------------------------------------------------------
  // Market-dependent config
  // ---------------------------------------------------------------------------

  const market = (project?.market ?? "USA") as Market;
  const isUSAMarket = market === "USA";
  const tempUnit = isUSAMarket ? "F" : "C";
  const tempSymbol = isUSAMarket ? "\u00b0F" : "\u00b0C";
  const weatherPresets = isUSAMarket ? WEATHER_PRESETS_EN : WEATHER_PRESETS_FR;

  // ---------------------------------------------------------------------------
  // Photo counts per date
  // ---------------------------------------------------------------------------

  const photoCountsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of photos) {
      if (!p.date) continue;
      const d = new Date(p.date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [photos]);

  function getPhotoCountForDate(dateStr: string): number {
    const d = parseEntryDate(dateStr);
    if (!d) return 0;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return photoCountsByDate.get(key) || 0;
  }

  // ---------------------------------------------------------------------------
  // Week strip data
  // ---------------------------------------------------------------------------

  const currentWeekStart = useMemo(() => {
    const now = new Date();
    const base = startOfWeek(now);
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const datesWithEntries = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) {
      const d = parseEntryDate(log.date);
      if (d) set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
    return set;
  }, [logs]);

  function dayHasEntry(d: Date): boolean {
    return datesWithEntries.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const isToday = useCallback(
    (d: Date) => isSameDay(d, new Date()),
    []
  );

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const total = logs.length;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const thisWeek = logs.filter((l) => {
      const d = parseEntryDate(l.date);
      return d && d >= weekStart;
    }).length;
    const avgCrew =
      total > 0
        ? Math.round(logs.reduce((s, l) => s + (Number(l.crew) || 0), 0) / total)
        : 0;

    let daysSinceLast = -1; // -1 means no entries
    if (total > 0) {
      // logs[0] is the most recent (sorted desc from subscription)
      const lastDate = parseEntryDate(logs[0].date);
      if (lastDate) {
        daysSinceLast = Math.floor(
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLast < 0) daysSinceLast = 0;
      }
    }

    return { total, thisWeek, avgCrew, daysSinceLast };
  }, [logs]);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by selected date
    if (selectedDate) {
      result = result.filter((l) => {
        const d = parseEntryDate(l.date);
        return d && isSameDay(d, selectedDate);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.content.toLowerCase().includes(q) ||
          l.weather.toLowerCase().includes(q) ||
          l.date.toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, selectedDate, searchQuery]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

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
      const day =
        logs.length > 0 ? Math.max(...logs.map((l) => l.day)) + 1 : 1;
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

  function getWeatherBorderColor(weather: string): string {
    const w = weather.toLowerCase();
    if (w.includes("storm") || w.includes("orage"))
      return "var(--color-danger)";
    if (w.includes("rain") || w.includes("pluie")) return "var(--color-info)";
    if (w.includes("sunny") || w.includes("ensoleille"))
      return "var(--color-warning)";
    return "var(--color-muted)";
  }

  function truncate(str: string, len: number): string {
    return str.length > len ? str.slice(0, len) + "..." : str;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <PageHeader
        title={t("project.dailyLog")}
        projectName={project?.name}
        projectId={projectId}
        action={{
          label: "Add entry",
          onClick: () => setShowForm(true),
          icon: <Plus size={14} />,
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Stats strip                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: "Total entries", value: stats.total },
          { label: "This week", value: stats.thisWeek },
          { label: "Avg crew", value: stats.avgCrew },
          {
            label: "Since last entry",
            value: stats.daysSinceLast < 0 ? "N/A" : stats.daysSinceLast === 0 ? "Today" : `${stats.daysSinceLast}d`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="px-2.5 py-1.5 bg-surface border border-border rounded-[var(--radius)]"
          >
            <div className="text-[9px] uppercase tracking-wider text-muted font-medium">
              {s.label}
            </div>
            <div className="text-[14px] font-data font-semibold text-earth leading-tight">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Week strip + search                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-2 mb-3">
        {/* Week nav */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-[var(--radius)] px-1.5 py-1 flex-1 min-w-0">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-0.5 text-muted hover:text-earth transition-colors shrink-0"
            title="Previous week"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="text-[9px] text-muted font-medium tracking-wide shrink-0">
            {formatWeekRange(currentWeekStart)}
          </span>

          <div className="flex items-center gap-0.5 mx-1 flex-1 justify-center">
            {weekDays.map((day, i) => {
              const hasEntry = dayHasEntry(day);
              const today = isToday(day);
              const isSelected =
                selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={i}
                  onClick={() =>
                    setSelectedDate(
                      isSelected ? null : day
                    )
                  }
                  className={`flex flex-col items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors ${
                    isSelected
                      ? "bg-earth text-warm"
                      : today
                        ? "bg-warm/60 text-earth"
                        : "hover:bg-surface-alt text-muted"
                  }`}
                  title={day.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                >
                  <span className="text-[8px] uppercase font-medium leading-none">
                    {DAY_LABELS[i]}
                  </span>
                  <span className="text-[10px] font-data leading-none">
                    {day.getDate()}
                  </span>
                  <span
                    className={`w-1 h-1 rounded-full ${
                      hasEntry
                        ? isSelected
                          ? "bg-warm"
                          : "bg-earth"
                        : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-0.5 text-muted hover:text-earth transition-colors shrink-0"
            title="Next week"
          >
            <ChevronRight size={14} />
          </button>

          {weekOffset !== 0 && (
            <button
              onClick={() => {
                setWeekOffset(0);
                setSelectedDate(null);
              }}
              className="text-[8px] text-muted hover:text-earth px-1 shrink-0"
            >
              Today
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="pl-6 pr-6 py-1.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-earth w-36"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-earth"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Active filters indicator */}
      {(selectedDate || searchQuery) && (
        <div className="flex items-center gap-2 mb-2 text-[9px] text-muted">
          <span>Filtered:</span>
          {selectedDate && (
            <span className="px-1.5 py-0.5 bg-warm/50 text-earth rounded-full inline-flex items-center gap-1">
              {selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              <button onClick={() => setSelectedDate(null)}>
                <X size={8} />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="px-1.5 py-0.5 bg-warm/50 text-earth rounded-full inline-flex items-center gap-1">
              &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery("")}>
                <X size={8} />
              </button>
            </span>
          )}
          <span className="text-muted/60">
            {filteredLogs.length} result{filteredLogs.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Add entry form                                                      */}
      {/* ------------------------------------------------------------------ */}
      {showForm && (
        <div className="mb-3 px-2.5 py-2 bg-surface border border-border rounded-[var(--radius)] animate-expand">
          {/* Row 1: Weather presets | Temp | Crew */}
          <div className="flex items-end gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <label className="block text-[8px] uppercase tracking-wider text-muted font-medium mb-0.5">
                Weather
              </label>
              <div className="flex flex-wrap gap-1">
                {weatherPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setWeatherPreset(
                        weatherPreset === preset.id ? "" : preset.id
                      )
                    }
                    className={`px-2 py-0.5 text-[9px] rounded-full border transition-colors ${
                      weatherPreset === preset.id
                        ? "border-earth bg-surface-alt text-earth font-medium"
                        : "border-border bg-surface text-muted hover:border-border-dark"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <label className="block text-[8px] uppercase tracking-wider text-muted font-medium mb-0.5">
                Temp
              </label>
              <div className="flex items-center gap-0.5">
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder={isUSAMarket ? "75" : "28"}
                  className="px-1.5 py-0.5 text-[10px] font-data border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-earth w-12"
                />
                <span className="text-[9px] text-muted font-data">
                  {tempSymbol}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <label className="block text-[8px] uppercase tracking-wider text-muted font-medium mb-0.5">
                Crew
              </label>
              <input
                type="number"
                min={1}
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="px-1.5 py-0.5 text-[10px] font-data border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-earth w-12"
              />
            </div>
          </div>

          {/* Row 2: Notes textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happened on site today?"
            rows={2}
            className="px-2 py-1 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-earth w-full resize-none mb-1"
          />

          {/* Row 3: Quick tags */}
          <div className="flex flex-wrap gap-1 mb-1.5">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setContent((prev) =>
                    prev ? prev + " " + tag + "." : tag + "."
                  )
                }
                className="px-1.5 py-0.5 text-[8px] rounded-full border border-border bg-surface text-muted hover:border-earth hover:text-earth transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Row 4: Voice + actions */}
          <div className="flex items-center justify-between">
            <VoiceNote
              onTranscript={(text) =>
                setContent((prev) => (prev ? prev + " " + text : text))
              }
              placeholder="Dictate entry"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary text-[10px] px-2.5 py-0.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="btn-primary text-[10px] px-2.5 py-0.5"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Entry list                                                          */}
      {/* ------------------------------------------------------------------ */}
      {logs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="No daily log entries yet"
          description="Document your construction progress with daily entries tracking weather, crew size, and work completed."
          action={{
            label: "Add first entry",
            onClick: () => setShowForm(true),
          }}
        />
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-6 text-[11px] text-muted">
          No entries match your filters.
        </div>
      ) : (
        <div className="space-y-0.5 animate-stagger">
          {filteredLogs.map((entry) => {
            const isEditing = editingLogId === entry.id;
            const isDeleteConfirm = deleteConfirmId === entry.id;
            const isExpanded = expandedEntryId === entry.id;
            const photoCount = getPhotoCountForDate(entry.date);
            const entryDate = parseEntryDate(entry.date);
            const shortDate = entryDate
              ? entryDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : entry.date;

            return (
              <div
                key={entry.id}
                id={`daily-log-day-${entry.day}`}
                className={`border border-border rounded-[var(--radius)] bg-surface border-l-[3px] transition-colors ${
                  isExpanded ? "bg-surface-alt" : "hover:bg-surface-alt"
                }`}
                style={{
                  borderLeftColor: getWeatherBorderColor(entry.weather),
                }}
              >
                {isEditing ? (
                  /* ---- Edit mode ---- */
                  <div className="px-2.5 py-2 space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider text-muted font-medium mb-0.5">
                          Weather
                        </label>
                        <input
                          type="text"
                          value={editWeather}
                          onChange={(e) => setEditWeather(e.target.value)}
                          className="px-1.5 py-0.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-earth w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider text-muted font-medium mb-0.5">
                          Crew
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editCrew}
                          onChange={(e) => setEditCrew(e.target.value)}
                          className="px-1.5 py-0.5 text-[10px] font-data border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-earth w-full"
                        />
                      </div>
                    </div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="px-1.5 py-0.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-earth w-full resize-none"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditLogSave(entry.id!)}
                        disabled={editSaving || !editContent.trim()}
                        className="px-2.5 py-0.5 text-[9px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
                      >
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingLogId(null)}
                        className="px-2.5 py-0.5 text-[9px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- Display mode ---- */
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedEntryId(
                          isExpanded ? null : entry.id!
                        )
                      }
                      className="w-full text-left px-2.5 py-1.5 flex items-center gap-2"
                    >
                      {/* Day number with tooltip */}
                      <span
                        className="relative text-[12px] font-data font-semibold text-earth w-10 shrink-0 text-center"
                        onMouseEnter={() => setShowDayTooltip(true)}
                        onMouseLeave={() => setShowDayTooltip(false)}
                      >
                        Day {entry.day}
                        {showDayTooltip && (
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-earth text-warm text-[8px] rounded whitespace-nowrap z-10 shadow-sm">
                            Construction day {entry.day} since project start
                          </span>
                        )}
                      </span>

                      <span className="text-[9px] text-muted font-data w-12 shrink-0">
                        {shortDate}
                      </span>

                      <span className="text-[9px] text-muted/60 shrink-0">
                        |
                      </span>

                      <span className="text-[9px] text-muted font-data shrink-0 w-20 truncate">
                        {entry.weather}
                      </span>

                      <span className="text-[9px] text-muted/60 shrink-0">
                        |
                      </span>

                      <span className="text-[9px] text-muted font-data shrink-0">
                        Crew: {entry.crew}
                      </span>

                      <span className="text-[9px] text-muted/60 shrink-0">
                        |
                      </span>

                      {/* Truncated content */}
                      <span className="text-[10px] text-slate truncate flex-1 min-w-0">
                        &ldquo;{truncate(entry.content, 60)}&rdquo;
                      </span>

                      {/* Photo count */}
                      {photoCount > 0 && (
                        <Link
                          href={`/project/${projectId}/photos?from=${entryDate?.toISOString().split("T")[0] || ""}&to=${entryDate?.toISOString().split("T")[0] || ""}`}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          className="flex items-center gap-0.5 text-[9px] text-clay hover:text-earth font-data shrink-0 transition-colors"
                          title={`View ${photoCount} photo${photoCount !== 1 ? "s" : ""} from this date`}
                        >
                          <Camera size={10} />
                          {photoCount}
                        </Link>
                      )}

                      {/* Expand indicator */}
                      <span className="text-muted/40 shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                      </span>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-2.5 pb-2 pt-0 border-t border-border/50">
                        <p className="text-[10px] text-slate leading-relaxed py-1.5">
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditLog(entry);
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] text-muted hover:text-earth border border-border rounded-[var(--radius)] hover:bg-surface transition-colors"
                          >
                            <Pencil size={10} />
                            Edit
                          </button>

                          {isDeleteConfirm ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-muted">
                                Delete?
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLog(entry.id!);
                                }}
                                disabled={deletingLogId === entry.id}
                                className="px-1.5 py-0.5 text-[9px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors disabled:opacity-40"
                              >
                                {deletingLogId === entry.id ? "..." : "Yes"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="px-1.5 py-0.5 text-[9px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(entry.id!);
                              }}
                              className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] text-muted hover:text-danger border border-border rounded-[var(--radius)] hover:bg-surface transition-colors"
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          )}

                          {photoCount > 0 && (
                            <Link
                              href={`/project/${projectId}/photos?from=${entryDate?.toISOString().split("T")[0] || ""}&to=${entryDate?.toISOString().split("T")[0] || ""}`}
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] text-clay hover:text-earth border border-border rounded-[var(--radius)] hover:bg-surface transition-colors"
                            >
                              <Camera size={10} />
                              View {photoCount} photo
                              {photoCount !== 1 ? "s" : ""}
                            </Link>
                          )}

                          <span className="ml-auto text-[8px] text-muted/50 font-data">
                            {entry.createdAt
                              ? new Date(entry.createdAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
