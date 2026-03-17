"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTopbar } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { createProject, type Market, type BuildPurpose, type PropertyType } from "@/lib/services/project-service";
import { Home, Building2, TrendingUp, MapPin, Search } from "lucide-react";
import {
  getUSStates,
  getUSCitiesByState,
  getWARegions,
  getWACities,
  findUSCity,
  findWACity,
  formatLocation,
} from "@/lib/data/geo";
import { getCostBenchmark, formatCostPerUnit, formatMultiplier } from "@/lib/data/costs";

interface WizardOption {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PURPOSE_OPTIONS: WizardOption[] = [
  {
    id: "occupy",
    title: "Build to occupy",
    description: "A home for you and your family to live in",
    icon: <Home size={18} />,
  },
  {
    id: "rent",
    title: "Build to rent",
    description: "Investment property generating rental income",
    icon: <Building2 size={18} />,
  },
  {
    id: "sell",
    title: "Build to sell",
    description: "Spec home built for resale profit",
    icon: <TrendingUp size={18} />,
  },
];

const MARKET_OPTIONS: WizardOption[] = [
  {
    id: "usa",
    title: "United States",
    description: "Wood-frame construction, institutional lending, IRC building codes",
  },
  {
    id: "togo",
    title: "Togo",
    description: "Reinforced concrete block, CFA zone, titre foncier system",
  },
  {
    id: "ghana",
    title: "Ghana",
    description: "Concrete block, cedi currency, Lands Commission registration",
  },
  {
    id: "benin",
    title: "Benin",
    description: "Concrete block, CFA zone, ANDF land registry",
  },
];

const PROPERTY_OPTIONS: WizardOption[] = [
  { id: "sfh", title: "Single-family home", description: "One dwelling unit on one lot" },
  { id: "duplex", title: "Duplex", description: "Two dwelling units in one structure" },
  { id: "triplex", title: "Triplex", description: "Three dwelling units" },
  { id: "fourplex", title: "Fourplex", description: "Four dwelling units" },
  { id: "apartment", title: "Apartment building", description: "Five or more units" },
];

const SIZE_OPTIONS: WizardOption[] = [
  { id: "small", title: "Under 1,500 sf / 140 m2", description: "Compact, efficient layout" },
  { id: "medium", title: "1,500 - 2,500 sf / 140 - 230 m2", description: "Mid-size family home" },
  { id: "large", title: "2,500 - 4,000 sf / 230 - 370 m2", description: "Larger family home" },
  { id: "xlarge", title: "Over 4,000 sf / 370 m2", description: "Estate or multi-family" },
];

/** Step indices:
 * 0 = Purpose
 * 1 = Market
 * 2 = State/Region (location)
 * 3 = City (location)
 * 4 = Property type
 * 5 = Size range
 * 6 = Project name
 */
const TOTAL_STEPS = 7;

const MARKET_MAP: Record<string, Market> = { usa: "USA", togo: "TOGO", ghana: "GHANA", benin: "BENIN" };
const PURPOSE_MAP: Record<string, BuildPurpose> = { occupy: "OCCUPY", rent: "RENT", sell: "SELL" };
const PROPERTY_MAP: Record<string, PropertyType> = { sfh: "SFH", duplex: "DUPLEX", triplex: "TRIPLEX", fourplex: "FOURPLEX", apartment: "APARTMENT" };
const CURRENCY_MAP: Record<string, string> = { usa: "USD", togo: "XOF", ghana: "GHS", benin: "XOF" };

// Fixed option steps (steps that use the card-select pattern)
const OPTION_STEPS: Record<number, { title: string; subtitle: string; options: WizardOption[] }> = {
  0: { title: "What are you building for?", subtitle: "This determines your financing options, tax treatment, and design priorities.", options: PURPOSE_OPTIONS },
  1: { title: "Where are you building?", subtitle: "Sets your cost benchmarks, regulations, templates, and construction method.", options: MARKET_OPTIONS },
  4: { title: "What type of property?", subtitle: "Defines your floor plan options and structural requirements.", options: PROPERTY_OPTIONS },
  5: { title: "What size are you planning?", subtitle: "Helps us estimate budget ranges and timelines for your market.", options: SIZE_OPTIONS },
};

export default function NewProjectPage() {
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setTopbar("New project", "Setup wizard", "info");
  }, [setTopbar]);

  // Derived market for location steps
  const selectedMarket = MARKET_MAP[selections[1]] ?? "USA";
  const isUSA = selectedMarket === "USA";

  // State/Region options (step 2)
  const stateOptions = useMemo(() => {
    if (isUSA) {
      return getUSStates().map((s) => ({
        id: s.code,
        title: s.name,
        description: s.region,
      }));
    }
    return getWARegions(selectedMarket).map((r) => ({
      id: r.name,
      title: r.name,
      description: r.capital ? `Capital: ${r.capital}` : "",
    }));
  }, [selectedMarket, isUSA]);

  // City options (step 3)
  const cityOptions = useMemo(() => {
    const stateOrRegion = selections[2];
    if (!stateOrRegion) return [];
    if (isUSA) {
      return getUSCitiesByState(stateOrRegion).map((c) => ({
        id: c.name,
        title: c.name,
        description: `${c.county} County — pop. ${c.population.toLocaleString()}`,
      }));
    }
    return getWACities(selectedMarket, stateOrRegion).map((c) => ({
      id: c.name,
      title: c.name,
      description: `${c.district}${c.population ? ` — pop. ${c.population.toLocaleString()}` : ""}`,
    }));
  }, [selectedMarket, isUSA, selections[2]]);

  // Cost benchmark for selected location
  const costBenchmark = useMemo(() => {
    const stateOrRegion = selections[2];
    if (!stateOrRegion) return undefined;
    return getCostBenchmark(selectedMarket, stateOrRegion);
  }, [selectedMarket, selections[2]]);

  // Determine if current step can proceed
  const canProceed = (() => {
    if (step === 6) return projectName.trim().length > 0;
    if (step in OPTION_STEPS) return !!selections[step];
    if (step === 2) return !!selections[2]; // state/region
    if (step === 3) return !!selections[3]; // city
    return false;
  })();

  function handleSelect(id: string) {
    setSelections((prev) => {
      const updated = { ...prev, [step]: id };
      // When market changes, reset location selections
      if (step === 1 && prev[1] !== id) {
        delete updated[2];
        delete updated[3];
      }
      // When state/region changes, reset city
      if (step === 2 && prev[2] !== id) {
        delete updated[3];
      }
      return updated;
    });
    setSearchQuery("");
  }

  async function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      setSearchQuery("");
    } else {
      // Final step — create project
      if (!user || creating) return;
      setCreating(true);
      try {
        const market = selectedMarket;
        const purpose = PURPOSE_MAP[selections[0]] ?? "OCCUPY";
        const propertyType = PROPERTY_MAP[selections[4]] ?? "SFH";
        const currency = CURRENCY_MAP[selections[1]] ?? "USD";
        const stateOrRegion = selections[2] ?? "";
        const cityName = selections[3] ?? "";

        // Look up geographic coordinates
        let lat: number | undefined;
        let lng: number | undefined;
        let county: string | undefined;
        let zips: string[] | undefined;

        if (isUSA && stateOrRegion && cityName) {
          const found = findUSCity(stateOrRegion, cityName);
          if (found) {
            lat = found.lat;
            lng = found.lng;
            county = found.county;
            zips = found.zips;
          }
        } else if (!isUSA && stateOrRegion && cityName) {
          const found = findWACity(market, stateOrRegion, cityName);
          if (found) {
            lat = found.lat;
            lng = found.lng;
            county = found.district;
          }
        }

        const locationStr = formatLocation(market, stateOrRegion, cityName, county);

        const projectId = await createProject({
          userId: user.uid,
          name: projectName.trim(),
          market,
          purpose,
          propertyType,
          sizeRange: selections[5] ?? "medium",
          currentPhase: 0,
          completedPhases: 0,
          phaseName: "Phase 0: Define",
          progress: 0,
          status: "ACTIVE",
          totalBudget: 0,
          totalSpent: 0,
          currency,
          currentWeek: 0,
          totalWeeks: 0,
          openItems: 0,
          subPhase: "Getting started",
          details: `${propertyType} / ${locationStr}`,
          state: stateOrRegion || undefined,
          county: county || undefined,
          city: cityName || undefined,
          zipCode: zips?.[0] || undefined,
          latitude: lat,
          longitude: lng,
          costPerUnit: costBenchmark?.costPerUnit,
          costUnit: costBenchmark?.unit,
        });
        router.push(`/project/${projectId}/overview`);
      } catch (err) {
        console.error("Failed to create project:", err);
        setCreating(false);
      }
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
      setSearchQuery("");
    } else {
      router.push("/");
    }
  }

  // Render a searchable location list (for steps 2 and 3)
  function renderLocationStep(
    title: string,
    subtitle: string,
    options: { id: string; title: string; description: string }[],
    educationNote: string,
  ) {
    const query = searchQuery.toLowerCase();
    const filtered = query
      ? options.filter(
          (o) =>
            o.title.toLowerCase().includes(query) ||
            o.description.toLowerCase().includes(query),
        )
      : options;

    return (
      <>
        <h3 className="text-xl font-semibold text-earth mb-1">{title}</h3>
        <p className="text-[13px] text-muted mb-4">{subtitle}</p>

        {/* Search input */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${options.length} locations...`}
            className="w-full pl-8 pr-4 py-2.5 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Scrollable list */}
        <div className="max-h-[280px] overflow-y-auto space-y-1.5 text-left pr-1">
          {filtered.length === 0 && (
            <p className="text-[12px] text-muted text-center py-4">No results found for &quot;{searchQuery}&quot;</p>
          )}
          {filtered.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`
                w-full px-3 py-2.5 rounded-[var(--radius)] border text-left transition-all
                ${
                  selections[step] === opt.id
                    ? "border-earth border-2 bg-surface-alt"
                    : "border-border bg-surface hover:border-border-dark hover:bg-surface-alt"
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className={selections[step] === opt.id ? "text-emerald-600" : "text-muted"} />
                <div className="min-w-0">
                  <h5 className="text-[13px] font-semibold text-earth">{opt.title}</h5>
                  {opt.description && (
                    <p className="text-[10px] text-muted mt-0.5 truncate">{opt.description}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Cost benchmark preview */}
        {costBenchmark && step === 2 && selections[2] && (
          <div className="mt-3 p-3 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-left">
            <p className="text-[11px] font-semibold text-emerald-800 mb-1">Regional cost estimate</p>
            <p className="text-[12px] text-emerald-700 font-data">
              {formatCostPerUnit(costBenchmark)} — {formatMultiplier(costBenchmark.multiplier)}
            </p>
          </div>
        )}

        {/* Education note */}
        <p className="text-[10px] text-muted mt-3 text-left leading-relaxed">{educationNote}</p>
      </>
    );
  }

  // Render the appropriate step content
  function renderStep() {
    // Option card steps (0, 1, 4, 5)
    if (step in OPTION_STEPS) {
      const cfg = OPTION_STEPS[step];
      return (
        <>
          <h3 className="text-xl font-semibold text-earth mb-1">{cfg.title}</h3>
          <p className="text-[13px] text-muted mb-6">{cfg.subtitle}</p>
          <div className="space-y-2 text-left">
            {cfg.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`
                  w-full p-4 rounded-[var(--radius)] border text-left transition-all
                  ${
                    selections[step] === opt.id
                      ? "border-earth border-2 bg-surface-alt"
                      : "border-border bg-surface hover:border-border-dark hover:bg-surface-alt"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {opt.icon && (
                    <span className={`${selections[step] === opt.id ? "text-emerald-600" : "text-muted"}`}>
                      {opt.icon}
                    </span>
                  )}
                  <div>
                    <h5 className="text-[14px] font-semibold text-earth">{opt.title}</h5>
                    <p className="text-[11px] text-muted mt-0.5">{opt.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      );
    }

    // State/Region step (2)
    if (step === 2) {
      return renderLocationStep(
        isUSA ? "Which state or territory?" : "Which region?",
        isUSA
          ? "Construction costs, permits, and building codes vary by state."
          : "Regional costs and regulations differ across the country.",
        stateOptions,
        isUSA
          ? "Your state determines local building codes (IRC/IBC), permit requirements, contractor licensing, and typical construction costs. States in the South and Midwest generally have lower costs; Northeast and West Coast are higher."
          : "Your region affects material transport costs, available labor, and local building practices. Coastal/urban regions like Maritime (Togo), Greater Accra (Ghana), or Littoral (Benin) tend to have higher construction costs.",
      );
    }

    // City step (3)
    if (step === 3) {
      return renderLocationStep(
        isUSA ? "Which city?" : "Which city or town?",
        isUSA
          ? "Select the city closest to your build site."
          : "Select the city or town nearest your construction site.",
        cityOptions,
        isUSA
          ? "City-level data helps us estimate costs more accurately. If your exact location is not listed, select the nearest city — costs within the same county are generally similar."
          : "If your town is not listed, select the nearest city. Construction costs within the same district are generally comparable. You can always adjust estimates later.",
      );
    }

    // Name step (6)
    return (
      <>
        <h3 className="text-xl font-semibold text-earth mb-1">Name your project</h3>
        <p className="text-[13px] text-muted mb-6">
          Give it a name you will recognize. You can change this later.
        </p>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Robinson residence"
          className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <p className="text-[10px] text-muted mt-2 text-left">
          Tip: Use a descriptive name like the property address, family name, or location.
        </p>
      </>
    );
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="max-w-md mx-auto py-8 text-center">
      {/* Step dots */}
      <div className="flex gap-1.5 justify-center mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? "bg-earth" : i < step ? "bg-emerald-500" : "bg-border"
            }`}
          />
        ))}
      </div>

      {renderStep()}

      {/* Nav buttons */}
      <div className="flex justify-center gap-2 mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2.5 text-[13px] border border-border-dark rounded-[var(--radius)] bg-surface text-earth hover:bg-surface-alt transition-colors"
        >
          {step === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-6 py-2.5 text-[13px] rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLastStep ? (creating ? "Creating..." : "Create project") : "Next"}
        </button>
      </div>
    </div>
  );
}
