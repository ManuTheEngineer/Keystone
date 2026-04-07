"use client";

// ---------------------------------------------------------------------------
// New Project Wizard — Orchestrator Shell
// ---------------------------------------------------------------------------
// Thin ~250-line shell that wires up the two-panel layout, maps step IDs to
// components, handles navigation, project creation, and draft auto-save.
// All business logic lives in store.ts, hooks/, steps/, and helpers.ts.
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTopbar } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWizardStore, useCurrency, useDetailedCosts } from "./store";
import { useWizardNavigation } from "./hooks/useWizardNavigation";
import { LivePreview } from "./components/LivePreview";
import { MobilePreviewBar } from "./components/MobilePreviewBar";
import { ArrowRight, X, Check, AlertTriangle } from "lucide-react";
import {
  createProject,
  getUserProjects,
  generateBudgetFromSpecs,
  seedInitialTasks,
  type Market,
  type PropertyType,
} from "@/lib/services/project-service";
import { getPlanLimits } from "@/lib/stripe-config";
import type { PlanTier } from "@/lib/stripe-config";
import { needsUnitConfig } from "@/lib/config/property-details-config";
import {
  PURPOSE_MAP,
  getLandCost,
  getTotalProjectCost,
  getTotalWeeksFromMarket,
  calculateDealScore,
} from "./helpers";

// Step components — basics & financials
import { GoalStep } from "./steps/GoalStep";
import { MarketStep } from "./steps/MarketStep";
import { LocationStep } from "./steps/LocationStep";
import { PropertyTypeStep } from "./steps/PropertyTypeStep";
import { ModeStep } from "./steps/ModeStep";
import { SizeStep } from "./steps/SizeStep";
import { LandStep } from "./steps/LandStep";
import { FinancingStep } from "./steps/FinancingStep";
import { FinancialsStep } from "./steps/FinancialsStep";
import { ScoreStep } from "./steps/ScoreStep";
import { NameStep } from "./steps/NameStep";

// Step components — structure (barrel)
import {
  LayoutGroup, DuplexLayoutGroup, BuildingLayoutGroup, FloorsGroup,
  FoundationGroup, BasementGroup, RoofGroup, RooftopGroup,
  ExteriorGroup, CeilingWindowsGroup, SoundproofingGroup, EntrancesGroup,
  StairwellGroup, ElevatorGroup, AdaGroup, FireSystemGroup,
  CommercialGroundGroup, AduGroup, AduDetailsGroup, FloorPlanGroup,
} from "./steps/structure";

// Step components — interior (barrel)
import {
  KitchenGroup, KitchenFinishGroup, BathroomGroup, FlooringGroup,
  MechanicalGroup, SmartHomeGroup, FinishConsistencyGroup,
  LaundryConfigGroup, HvacConfigGroup,
} from "./steps/interior";

// Step components — site (barrel)
import {
  LotGroup, GarageGroup, DrivewayGroup, OutdoorGroup,
  LandscapingGroup, FencingGroup, SecurityGroup,
} from "./steps/site";

// Step components — units (barrel)
import {
  UnitCountGroup, UnitMixGroup, UnitSimilarityGroup, MixRatioGroup,
  OwnerOccupiedGroup, UtilitiesGroup, StorageGroup, CommonAreasGroup,
  CommonOutdoorGroup, BuildingAccessGroup, TrashGroup, ManagementGroup,
  FloorPlansGroup,
} from "./steps/units";

// ---------------------------------------------------------------------------
// Step ID -> Component map
// ---------------------------------------------------------------------------

const STEP_COMPONENTS: Record<string, React.ComponentType> = {
  // Basics
  "goal": GoalStep,
  "market": MarketStep,
  "location": LocationStep,
  "type": PropertyTypeStep,
  "mode": ModeStep,
  // Structure
  "layout": LayoutGroup,
  "duplex-layout": DuplexLayoutGroup,
  "building-layout": BuildingLayoutGroup,
  "floors": FloorsGroup,
  "foundation": FoundationGroup,
  "basement-details": BasementGroup,
  "roof": RoofGroup,
  "rooftop": RooftopGroup,
  "exterior": ExteriorGroup,
  "ceiling-windows": CeilingWindowsGroup,
  "soundproofing": SoundproofingGroup,
  "entrances": EntrancesGroup,
  "stairwell": StairwellGroup,
  "elevator": ElevatorGroup,
  "ada": AdaGroup,
  "fire-system": FireSystemGroup,
  "commercial-ground": CommercialGroundGroup,
  "adu": AduGroup,
  "adu-details": AduDetailsGroup,
  "floor-plan": FloorPlanGroup,
  // Interior
  "kitchen": KitchenGroup,
  "kitchen-finish": KitchenFinishGroup,
  "bathroom": BathroomGroup,
  "flooring": FlooringGroup,
  "mechanical": MechanicalGroup,
  "smart-home": SmartHomeGroup,
  "finish-consistency": FinishConsistencyGroup,
  "laundry-config": LaundryConfigGroup,
  "hvac-config": HvacConfigGroup,
  // Site
  "lot": LotGroup,
  "garage": GarageGroup,
  "driveway": DrivewayGroup,
  "outdoor": OutdoorGroup,
  "landscaping": LandscapingGroup,
  "fencing": FencingGroup,
  "security": SecurityGroup,
  // Units
  "unit-count": UnitCountGroup,
  "unit-mix": UnitMixGroup,
  "unit-similarity": UnitSimilarityGroup,
  "mix-ratio": MixRatioGroup,
  "owner-occupied": OwnerOccupiedGroup,
  "utilities": UtilitiesGroup,
  "storage": StorageGroup,
  "common-areas": CommonAreasGroup,
  "common-outdoor": CommonOutdoorGroup,
  "building-access": BuildingAccessGroup,
  "trash": TrashGroup,
  "management": ManagementGroup,
  "floor-plans": FloorPlansGroup,
  // Financials
  "size": SizeStep,
  "land": LandStep,
  "financing": FinancingStep,
  "financials": FinancialsStep,
  "score": ScoreStep,
  "name": NameStep,
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function NewProjectPage() {
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const router = useRouter();
  const store = useWizardStore();
  const nav = useWizardNavigation();
  const currency = useCurrency();
  const detailedCosts = useDetailedCosts();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fallback simple costs (used when detailed engine returns 0)
  const simpleCosts = useMemo(
    () => getTotalProjectCost(store.state, store.locationData),
    [store.state, store.locationData],
  );

  const dealResult = useMemo(
    () => calculateDealScore(store.state, store.locationData, detailedCosts.grandTotal),
    [store.state, store.locationData, detailedCosts.grandTotal],
  );

  const totalWeeks = useMemo(
    () => getTotalWeeksFromMarket(store.state.market),
    [store.state.market],
  );

  // ── Setup topbar ──────────────────────────────────────────────────────────
  useEffect(() => { setTopbar("New project", "Setup wizard", "info"); }, [setTopbar]);

  // ── Load draft or analyzer params on mount ────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "analyzer") {
      store.loadFromAnalyzer(params);
      const nameIdx = nav.activeSteps.findIndex(s => s.id === "name");
      if (nameIdx >= 0) store.setStep(nameIdx);
    } else {
      store.loadDraft();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save draft ───────────────────────────────────────────────────────
  useEffect(() => {
    if (store.state.fromAnalyzer) return;
    try {
      localStorage.setItem("keystone-new-project-draft", JSON.stringify({
        state: store.state,
        step: store.step,
        maxStep: store.maxStepReached,
        completedSteps: Array.from(store.completedSteps),
      }));
    } catch { /* ignore quota errors */ }
  }, [store.state, store.step, store.maxStepReached, store.completedSteps]);

  // ── Fetch project count for plan-limit checks ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    getUserProjects(user.uid)
      .then(projects => { store.setProjectCount(projects.filter((p: any) => !p.isDemo).length); })
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply smart defaults when type/market/goal are all set ────────────────
  useEffect(() => {
    if (store.state.propertyType && store.state.market && store.state.goal) {
      store.applySmartDefaults();
    }
  }, [store.state.propertyType, store.state.market, store.state.goal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Plan limit ────────────────────────────────────────────────────────────
  const planTier: PlanTier = (profile?.plan as PlanTier) ?? "FOUNDATION";
  const planLimit = getPlanLimits(planTier).projects;
  const atLimit = profile?.role !== "admin" && isFinite(planLimit) && store.projectCount >= planLimit;

  // ── Resolve current step component ────────────────────────────────────────
  const CurrentStep = nav.currentStep ? STEP_COMPONENTS[nav.currentStep.id] : null;

  // ── Project creation ──────────────────────────────────────────────────────
  async function handleCreate() {
    if (!user || store.creating) return;
    store.setPlanError("");

    // Plan limit gate (admin bypasses)
    if (profile?.role !== "admin") {
      const limits = getPlanLimits((profile?.plan as PlanTier) ?? "FOUNDATION");
      if (limits.projects !== Infinity && store.projectCount >= limits.projects) {
        store.setPlanError(
          `Your ${profile?.plan === "FOUNDATION" ? "Starter" : profile?.plan ?? "Starter"} plan allows ${limits.projects} project${limits.projects === 1 ? "" : "s"} (demo projects don't count). Upgrade your plan to create more.`,
        );
        return;
      }
    }

    store.setCreating(true);
    try {
      const s = store.state;
      const market = s.market as Market;
      const purpose = PURPOSE_MAP[s.goal] ?? "OCCUPY";
      const propertyType = s.propertyType as PropertyType;
      const curr = currency.code;
      const sizeMap: Record<string, string> = { compact: "small", standard: "medium", large: "large", estate: "xlarge", custom: "custom" };

      const projectId = await createProject({
        userId: user.uid,
        name: s.projectName.trim(),
        market,
        purpose,
        propertyType,
        sizeRange: sizeMap[s.sizeCategory] ?? "medium",
        city: s.city.trim(),
        region: s.city.trim(),
        financingType: s.financingType,
        landCost: getLandCost(s, store.locationData),
        dealScore: dealResult.score,
        currentPhase: 0,
        completedPhases: 0,
        phaseName: "Phase 0: Define",
        progress: 0,
        status: "ACTIVE",
        totalBudget: detailedCosts.grandTotal > 0 ? detailedCosts.grandTotal : simpleCosts.total,
        totalSpent: 0,
        currency: curr,
        currentWeek: 0,
        totalWeeks: totalWeeks,
        openItems: 0,
        subPhase: "Getting started",
        details: `${propertyType} / ${market} / ${s.city.trim()}`,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        stories: s.stories,
        features: s.features.length > 0 ? s.features : null,
        downPaymentPct: s.downPaymentPct,
        loanRate: s.loanRate,
        timelineMonths: s.timelineMonths,
        targetSalePrice: s.targetSalePrice > 0 ? s.targetSalePrice : 0,
        monthlyRent: s.monthlyRent > 0 ? s.monthlyRent : 0,
        specs: {
          structure: s.structure,
          interior: s.interior,
          site: s.site,
          unitConfig: needsUnitConfig(s.propertyType as any) ? s.unitConfig : undefined,
          detailedCosts: {
            grandTotal: detailedCosts.grandTotal,
            land: detailedCosts.land,
            totalHardCosts: detailedCosts.totalHardCosts,
            softCosts: detailedCosts.softCosts,
            contingency: detailedCosts.contingency,
            financing: detailedCosts.financing,
          },
        },
      });

      // Auto-generate budget + seed initial tasks in parallel
      const budgetTotal = detailedCosts.grandTotal > 0 ? detailedCosts.grandTotal : simpleCosts.total;
      await Promise.allSettled([
        generateBudgetFromSpecs(user.uid, projectId, budgetTotal, market, s.features, {
          land: detailedCosts.land > 0 ? detailedCosts.land : simpleCosts.land,
          construction: detailedCosts.totalHardCosts > 0 ? detailedCosts.totalHardCosts : simpleCosts.construction,
          softCosts: detailedCosts.softCosts > 0 ? detailedCosts.softCosts : simpleCosts.soft,
          financingCosts: detailedCosts.financing > 0 ? detailedCosts.financing : simpleCosts.financing,
          contingency: detailedCosts.contingency > 0 ? detailedCosts.contingency : simpleCosts.contingency,
        }, detailedCosts.lineItems.length > 0 ? detailedCosts.lineItems : undefined),
        seedInitialTasks(user.uid, projectId, {
          market,
          purpose,
          propertyType,
          city: s.city.trim(),
          financingType: s.financingType,
          totalBudget: budgetTotal,
          bedrooms: s.bedrooms,
          bathrooms: s.bathrooms,
          features: s.features,
          fromAnalyzer: s.fromAnalyzer,
        }),
      ]);

      // Clear draft and redirect
      try { localStorage.removeItem("keystone-new-project-draft"); } catch {}
      router.push(`/project/${projectId}/overview?welcome=1`);
    } catch (err: any) {
      store.setPlanError(err?.message || "Failed to create project. Please try again.");
    } finally {
      store.setCreating(false);
    }
  }

  // ── Cancel handler ────────────────────────────────────────────────────────
  function handleCancel() {
    if (store.step > 0) { setShowCancelConfirm(true); } else { router.push("/dashboard"); }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left panel — question flow */}
      <div className="flex-1 max-w-xl mx-auto lg:mx-0 lg:ml-auto lg:mr-0 py-8 px-4 lg:pr-8">
        {/* Plan limit banner */}
        {atLimit && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-warning/10 border border-warning/30">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-earth mb-1">Plan limit reached.</p>
              <p className="text-[12px] text-muted mb-2">
                Your {planTier} plan allows {planLimit} project{planLimit === 1 ? "" : "s"}.
              </p>
              <Link href="/settings" className="text-[12px] font-medium text-clay hover:text-earth flex items-center gap-1">
                Upgrade <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* Section progress pills */}
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {nav.sections.map(sectionLabel => {
            const isCurrent = nav.currentStep?.sectionLabel === sectionLabel;
            const sectionSteps = nav.activeSteps.filter(s => s.sectionLabel === sectionLabel);
            const allCompleted = sectionSteps.every((_, i) => {
              const globalIdx = nav.activeSteps.indexOf(sectionSteps[0]) + i;
              return store.completedSteps.has(globalIdx);
            });
            return (
              <button
                key={sectionLabel}
                onClick={() => nav.goToSection(sectionLabel)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  isCurrent
                    ? "bg-clay text-white"
                    : allCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-warm/50 text-muted hover:bg-sand/40"
                }`}
              >
                {allCompleted && !isCurrent ? <Check size={10} className="inline mr-0.5" /> : null}
                {sectionLabel}
                {isCurrent && nav.sectionProgress.total > 1 && (
                  <span className="ml-1 opacity-70">{nav.sectionProgress.current}/{nav.sectionProgress.total}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="text-center">
          {CurrentStep && <CurrentStep />}
        </div>

        {/* Errors */}
        {store.planError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-bg border border-danger/20 mt-4">
            <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
            <p className="text-[12px] text-danger">{store.planError}</p>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2.5 text-[13px] border border-border rounded-lg bg-surface text-muted hover:text-danger hover:border-danger/30 transition-colors"
          >
            <X size={14} />
          </button>
          {!nav.isFirstStep && (
            <button
              onClick={nav.goBack}
              className="px-6 py-2.5 text-[13px] border border-border rounded-lg bg-surface text-earth hover:bg-surface-alt transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={nav.isLastStep ? handleCreate : nav.goNext}
            disabled={store.creating}
            className={`px-6 py-2.5 text-[13px] rounded-lg transition-colors ${
              !store.creating
                ? "btn-earth hover:bg-earth-light"
                : "bg-warm/60 text-sand cursor-not-allowed opacity-50"
            }`}
          >
            {nav.isLastStep ? (store.creating ? "Creating..." : "Create project") : "Next"}
          </button>
        </div>

        {/* Skip remaining (detail steps only) */}
        {nav.currentStep && ["structure", "interior", "site", "units"].includes(nav.currentStep.section) && (
          <div className="text-center mt-3">
            <button
              onClick={() => { store.applySmartDefaults(); nav.skipRemaining(); }}
              className="text-[11px] text-clay/70 hover:text-clay transition-colors"
            >
              Skip remaining details
            </button>
          </div>
        )}
      </div>

      {/* Right panel — live preview (desktop only) */}
      <div className="hidden lg:block w-[40%] max-w-md border-l border-border bg-cream/50 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <LivePreview />
      </div>

      {/* Mobile preview bar */}
      <MobilePreviewBar />

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-earth/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-lg border border-border p-6 max-w-sm w-full">
            <h3 className="text-[18px] text-earth mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Discard progress?
            </h3>
            <p className="text-[13px] text-muted mb-6">
              Your wizard progress will be saved as a draft — you can continue later.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-[13px] font-medium rounded-lg border border-border text-earth hover:bg-warm"
              >
                Keep editing
              </button>
              <button
                onClick={() => { localStorage.removeItem("keystone-new-project-draft"); router.push("/dashboard"); }}
                className="px-4 py-2 text-[13px] font-medium rounded-lg bg-danger text-white hover:bg-danger/90"
              >
                Discard and leave
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-[13px] font-medium rounded-lg bg-earth text-warm hover:bg-earth/90"
              >
                Save draft and leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
