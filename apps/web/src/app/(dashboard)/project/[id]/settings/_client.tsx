"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  updateProject,
  deleteProject,
  type ProjectData,
  type Market,
  type BuildPurpose,
  type PropertyType,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  getUSStates,
  getUSCitiesByState,
  getWARegions,
  getWACities,
  formatLocation,
} from "@/lib/data/geo";
import { getCostBenchmark, formatCostPerUnit, formatMultiplier } from "@/lib/data/costs";

const PHASE_LABELS: Record<number, string> = {
  0: "0 -- Define",
  1: "1 -- Finance",
  2: "2 -- Land",
  3: "3 -- Design",
  4: "4 -- Approve",
  5: "5 -- Assemble",
  6: "6 -- Build",
  7: "7 -- Verify",
  8: "8 -- Operate",
};

const inputClass =
  "px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full";

const labelClass = "text-[11px] text-muted font-medium mb-1";

export function SettingsClient() {
  const params = useParams();
  const router = useRouter();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [market, setMarket] = useState<Market>("USA");
  const [purpose, setPurpose] = useState<BuildPurpose>("OCCUPY");
  const [propertyType, setPropertyType] = useState<PropertyType>("SFH");
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [locationState, setLocationState] = useState("");
  const [locationCity, setLocationCity] = useState("");

  useEffect(() => {
    const unsub = subscribeToProject(projectId, (data) => {
      setProject(data);
      if (data) {
        setName(data.name);
        setDetails(data.details ?? "");
        setMarket(data.market);
        setPurpose(data.purpose);
        setPropertyType(data.propertyType);
        setCurrentPhase(data.currentPhase);
        setProgress(data.progress);
        setCurrentWeek(data.currentWeek);
        setTotalWeeks(data.totalWeeks);
        setTotalBudget(data.totalBudget);
        setTotalSpent(data.totalSpent);
        setCurrency(data.currency);
        setLocationState(data.state ?? "");
        setLocationCity(data.city ?? "");
      }
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setTopbar("Settings", project.name, "info");
    }
  }, [project, setTopbar]);

  const handleSave = useCallback(async () => {
    if (!project) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const benchmark = locationState ? getCostBenchmark(market, locationState) : undefined;
      await updateProject(projectId, {
        name,
        details,
        market,
        purpose,
        propertyType,
        currentPhase,
        progress,
        currentWeek,
        totalWeeks,
        totalBudget,
        totalSpent,
        currency,
        state: locationState || undefined,
        city: locationCity || undefined,
        costPerUnit: benchmark?.costPerUnit,
        costUnit: benchmark?.unit,
        phaseName: `Phase ${currentPhase}: ${PHASE_LABELS[currentPhase]?.split(" -- ")[1] ?? ""}`,
      });
      setSaveMessage("Changes saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [
    project, projectId, name, details, market, purpose, propertyType,
    currentPhase, progress, currentWeek, totalWeeks, totalBudget, totalSpent, currency,
    locationState, locationCity,
  ]);

  const handleDelete = useCallback(async () => {
    if (!project || confirmName !== project.name) return;
    setDeleting(true);
    try {
      await deleteProject(projectId);
      router.push("/");
    } catch {
      setDeleting(false);
    }
  }, [project, projectId, confirmName, router]);

  if (!project) {
    return <p className="text-muted text-sm">Loading project...</p>;
  }

  return (
    <div className="max-w-3xl">
      {/* Project info */}
      <SectionLabel>Project info</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
          />
        </div>
        <div>
          <label className={labelClass}>Details</label>
          <input
            type="text"
            className={inputClass}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. 4 bed / 3 bath / 2,200 sf"
          />
        </div>
      </div>

      {/* Classification */}
      <SectionLabel>Classification</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>Market</label>
          <select
            className={inputClass}
            value={market}
            onChange={(e) => setMarket(e.target.value as Market)}
          >
            <option value="USA">USA</option>
            <option value="TOGO">TOGO</option>
            <option value="GHANA">GHANA</option>
            <option value="BENIN">BENIN</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Purpose</label>
          <select
            className={inputClass}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as BuildPurpose)}
          >
            <option value="OCCUPY">OCCUPY</option>
            <option value="RENT">RENT</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Property type</label>
          <select
            className={inputClass}
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
          >
            <option value="SFH">SFH</option>
            <option value="DUPLEX">DUPLEX</option>
            <option value="TRIPLEX">TRIPLEX</option>
            <option value="FOURPLEX">FOURPLEX</option>
            <option value="APARTMENT">APARTMENT</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <SectionLabel>Location</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>{market === "USA" ? "State" : "Region"}</label>
          <select
            className={inputClass}
            value={locationState}
            onChange={(e) => {
              setLocationState(e.target.value);
              setLocationCity("");
            }}
          >
            <option value="">Select {market === "USA" ? "state" : "region"}...</option>
            {market === "USA"
              ? getUSStates().map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))
              : getWARegions(market).map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))
            }
          </select>
        </div>
        <div>
          <label className={labelClass}>City</label>
          <select
            className={inputClass}
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            disabled={!locationState}
          >
            <option value="">Select city...</option>
            {locationState && (
              market === "USA"
                ? getUSCitiesByState(locationState).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))
                : getWACities(market, locationState).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))
            )}
          </select>
        </div>
      </div>
      {locationState && (() => {
        const benchmark = getCostBenchmark(market, locationState);
        if (!benchmark) return null;
        return (
          <div className="mb-6 p-3 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200">
            <p className="text-[11px] font-semibold text-emerald-800 mb-1">Regional cost benchmark</p>
            <p className="text-[12px] text-emerald-700 font-data">
              {formatCostPerUnit(benchmark)} — {formatMultiplier(benchmark.multiplier)}
            </p>
            <p className="text-[10px] text-muted mt-1">Source: {benchmark.source} ({benchmark.lastUpdated})</p>
          </div>
        );
      })()}

      {/* Progress */}
      <SectionLabel>Progress</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>Current phase</label>
          <select
            className={inputClass}
            value={currentPhase}
            onChange={(e) => setCurrentPhase(Number(e.target.value))}
          >
            {Object.entries(PHASE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Progress percentage</label>
          <input
            type="number"
            className={inputClass}
            value={progress}
            onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
            min={0}
            max={100}
          />
        </div>
        <div>
          <label className={labelClass}>Current week</label>
          <input
            type="number"
            className={inputClass}
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Math.max(0, Number(e.target.value)))}
            min={0}
          />
        </div>
        <div>
          <label className={labelClass}>Total weeks</label>
          <input
            type="number"
            className={inputClass}
            value={totalWeeks}
            onChange={(e) => setTotalWeeks(Math.max(0, Number(e.target.value)))}
            min={0}
          />
        </div>
      </div>

      {/* Budget */}
      <SectionLabel>Budget</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>Total budget</label>
          <input
            type="number"
            className={inputClass}
            value={totalBudget}
            onChange={(e) => setTotalBudget(Math.max(0, Number(e.target.value)))}
            min={0}
          />
        </div>
        <div>
          <label className={labelClass}>Total spent</label>
          <input
            type="number"
            className={inputClass}
            value={totalSpent}
            onChange={(e) => setTotalSpent(Math.max(0, Number(e.target.value)))}
            min={0}
          />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select
            className={inputClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="XOF">XOF (CFA)</option>
            <option value="GHS">GHS</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saveMessage && (
          <span className="text-[12px] text-success">{saveMessage}</span>
        )}
      </div>

      {/* Danger zone */}
      <div className="border border-danger/30 rounded-[var(--radius)] p-4 mt-8">
        <SectionLabel>Danger zone</SectionLabel>
        <p className="text-[12px] text-muted mb-3">
          Deleting a project is permanent and cannot be undone. All project data,
          budget items, contacts, documents, photos, and logs will be removed.
        </p>
        <label className={labelClass}>
          Type &quot;{project.name}&quot; to confirm deletion
        </label>
        <input
          type="text"
          className={`${inputClass} mb-3 max-w-sm`}
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={project.name}
        />
        <div>
          <button
            onClick={handleDelete}
            disabled={deleting || confirmName !== project.name}
            className="px-4 py-2 text-[12px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/80 transition-colors disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete project"}
          </button>
        </div>
      </div>
    </div>
  );
}
