"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapPin, Info } from "lucide-react";
import {
  getClosestLocation,
  getLocationSuggestions,
  formatCurrency,
  getCostComparisonText,
  getClimateLabel,
  formatMonthList,
} from "@keystone/market-data";
import type { LocationData } from "@keystone/market-data";
import { useWizardStore, useCurrency } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";

export function LocationStep() {
  const market = useWizardStore((s) => s.state.market);
  const city = useWizardStore((s) => s.state.city);
  const update = useWizardStore((s) => s.update);
  const locationData = useWizardStore((s) => s.locationData);
  const locationLoading = useWizardStore((s) => s.locationLoading);
  const setLocationData = useWizardStore((s) => s.setLocationData);
  const setLocationLoading = useWizardStore((s) => s.setLocationLoading);
  const currency = useCurrency();

  const [locationSource, setLocationSource] = useState("");
  const locationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isUSA = market === "USA";

  // Location intelligence: debounced API call with static fallback
  useEffect(() => {
    if (!market || !city || city.trim().length < 2) {
      setLocationData(null);
      setLocationLoading(false);
      return;
    }

    // Immediate static fallback
    const staticFallback = getClosestLocation(city, market);
    if (staticFallback) {
      setLocationData(staticFallback);
    }

    // Debounced API call (500ms)
    if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    setLocationLoading(true);
    locationTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/location-data?q=${encodeURIComponent(city.trim())}&market=${market}`,
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setLocationData(json.data);
            setLocationSource(json.meta?.source ?? json.source ?? "unknown");
          } else if (!staticFallback) {
            setLocationData(null);
          }
        }
      } catch {
        // Keep whatever we have (static or null)
      } finally {
        setLocationLoading(false);
      }
    }, 500);

    return () => {
      if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, city]);

  const locationSuggestions = useMemo(() => {
    if (!market) return [];
    return getLocationSuggestions(market);
  }, [market]);

  // Filter suggestions for WA autocomplete
  const filteredSuggestions =
    !isUSA && city.trim().length > 0
      ? locationSuggestions.filter((s) =>
          s.toLowerCase().includes(city.toLowerCase().trim()),
        )
      : [];

  const showSuggestions =
    filteredSuggestions.length > 0 &&
    !filteredSuggestions.some(
      (s) => s.toLowerCase() === city.toLowerCase().trim(),
    );

  const handleRefresh = useCallback(async () => {
    setLocationLoading(true);
    try {
      const res = await fetch(
        `/api/location-data?q=${encodeURIComponent(city.trim())}&market=${market}&fresh=1`,
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setLocationData(json.data);
          setLocationSource(json.meta?.source ?? json.source ?? "unknown");
        }
      }
    } catch {
      // keep existing data
    } finally {
      setLocationLoading(false);
    }
  }, [city, market, setLocationData, setLocationLoading]);

  const waPlaceholder =
    market === "TOGO"
      ? "Enter your city or quartier (e.g., Lome, Avepozo, Kpalime)"
      : market === "GHANA"
        ? "Enter your city or area (e.g., Accra, Tema, Kumasi)"
        : "Enter your city or area";

  return (
    <StepShell
      title="Narrow down your location"
      subtitle="Location affects your costs, regulations, and market demand."
    >
      <div className="text-left">
        {isUSA ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-clay" />
              <label className="text-[13px] font-medium text-earth">
                ZIP code
              </label>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={city}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d-]/g, "").slice(0, 10);
                update("city", val);
              }}
              placeholder="Enter 5-digit ZIP code (e.g., 95350)"
              className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-data tracking-wider"
            />
            <p className="text-[10px] text-muted mt-1.5">
              ZIP code gives you the most accurate cost data for your area. We
              pull real data from Census, HUD, and BLS.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-clay" />
              <label className="text-[13px] font-medium text-earth">
                City or region
              </label>
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => update("city", e.target.value)}
              placeholder={waPlaceholder}
              className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </>
        )}

        {/* Autocomplete suggestions (WA only) */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filteredSuggestions.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => update("city", suggestion)}
                className="px-3 py-1.5 text-[11px] rounded-full border border-border bg-surface text-earth hover:border-emerald-400 hover:bg-emerald-50 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Loading spinner */}
        {locationLoading && !locationData && (
          <div className="mt-4 p-3 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left animate-fade-in flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-emerald-700">
              Loading location data...
            </span>
          </div>
        )}

        {/* Location Intelligence Card */}
        {locationData &&
          (() => {
            const inputCity = city
              .trim()
              .toLowerCase()
              .split(",")[0]
              .trim();
            const isProxy =
              !inputCity.includes(locationData.city.toLowerCase()) &&
              !locationData.city.toLowerCase().includes(inputCity);
            return (
              <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-emerald-700 shrink-0" />
                  <span className="text-[12px] font-semibold text-emerald-800">
                    {isProxy
                      ? `Regional estimate based on ${locationData.city}${locationData.state ? `, ${locationData.state}` : ""}`
                      : `Location intelligence: ${locationData.city}${locationData.state ? `, ${locationData.state}` : ""}`}
                  </span>
                </div>
                {isProxy && (
                  <p className="text-[10px] text-emerald-700 mb-2">
                    We use the nearest major metro as a proxy. You can adjust all
                    costs later.
                  </p>
                )}
                {locationSource && (
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[9px] text-emerald-600/50">
                      {locationSource === "api"
                        ? "Live data (Census/HUD/BLS)"
                        : locationSource === "cache"
                          ? "Cached data"
                          : locationSource === "curated+cpi"
                            ? "Curated + CPI adjusted"
                            : "Static estimates"}
                    </p>
                    {(locationSource === "cache" ||
                      locationSource === "static" ||
                      locationSource === "stale-cache") && (
                      <button
                        onClick={handleRefresh}
                        className="text-[9px] text-emerald-600 hover:text-emerald-800 underline transition-colors"
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                )}
                <div className="space-y-2 text-[11px] text-emerald-800">
                  <div className="flex justify-between">
                    <span className="text-muted">Cost index</span>
                    <span className="font-medium font-data">
                      {locationData.costIndex.toFixed(2)}x (
                      {getCostComparisonText(locationData.costIndex)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Labor index</span>
                    <span className="font-medium font-data">
                      {locationData.laborIndex.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Typical lot prices</span>
                    <span className="font-medium font-data">
                      {market === "USA"
                        ? `$${(locationData.landPricePerAcre.low / 1000).toFixed(0)}K to $${(locationData.landPricePerAcre.high / 1000).toFixed(0)}K per acre`
                        : locationData.landPricePerSqm
                          ? `${locationData.landPricePerSqm.low.toLocaleString()} to ${locationData.landPricePerSqm.high.toLocaleString()} ${currency.code} per sqm`
                          : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Property tax rate</span>
                    <span className="font-medium font-data">
                      {locationData.propertyTaxRate}% annually
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Permit cost estimate</span>
                    <span className="font-medium font-data">
                      {formatCurrency(
                        locationData.permitCostEstimate,
                        currency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Climate</span>
                    <span className="font-medium">
                      {getClimateLabel(locationData.climate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Best building months</span>
                    <span className="font-medium">
                      {formatMonthList(locationData.buildingSeasonMonths)}
                    </span>
                  </div>
                  {locationData.avgRentPerSqft && (
                    <div className="flex justify-between">
                      <span className="text-muted">Avg rent</span>
                      <span className="font-medium font-data">
                        ${locationData.avgRentPerSqft.toFixed(2)}/sqft/mo
                      </span>
                    </div>
                  )}
                  {locationData.avgRentPerSqm &&
                    !locationData.avgRentPerSqft && (
                      <div className="flex justify-between">
                        <span className="text-muted">Avg rent</span>
                        <span className="font-medium font-data">
                          {locationData.avgRentPerSqm.toLocaleString()}/sqm/mo
                        </span>
                      </div>
                    )}
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200">
                  <p className="text-[10px] text-emerald-700 leading-relaxed">
                    {locationData.localNotes}
                  </p>
                </div>
              </div>
            );
          })()}

        <MentorTip>
          {market === "USA"
            ? "Construction costs vary significantly by city. A project in San Francisco costs roughly 50% more than the same build in Houston. Location also determines which building codes and inspectors apply to your project."
            : "In Lome, construction costs vary significantly between central quartiers and peripheral areas like Avepozo or Baguida. Land near the coast tends to be more expensive."}
        </MentorTip>
      </div>
    </StepShell>
  );
}
