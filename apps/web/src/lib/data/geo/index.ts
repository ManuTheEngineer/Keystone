import type { Market } from "@/lib/services/project-service";
import type { USState, USCity, WARegion, WADistrict, WACity } from "./types";
import { US_STATES } from "./us-states";
import { US_CITIES } from "./us-cities";
import { TOGO_REGIONS, TOGO_DISTRICTS, TOGO_CITIES } from "./togo-regions";
import { GHANA_REGIONS, GHANA_DISTRICTS, GHANA_CITIES } from "./ghana-regions";
import { BENIN_REGIONS, BENIN_DISTRICTS, BENIN_CITIES } from "./benin-regions";

export type { USState, USCity, WARegion, WADistrict, WACity } from "./types";
export type { ProjectLocation } from "./types";

// --- US lookups ---

export function getUSStates(): USState[] {
  return US_STATES;
}

export function getUSCitiesByState(stateCode: string): USCity[] {
  return US_CITIES.filter((c) => c.stateCode === stateCode);
}

export function findUSCity(stateCode: string, cityName: string): USCity | undefined {
  return US_CITIES.find(
    (c) => c.stateCode === stateCode && c.name === cityName,
  );
}

// --- West Africa lookups ---

export function getWARegions(market: Market): WARegion[] {
  switch (market) {
    case "TOGO": return TOGO_REGIONS;
    case "GHANA": return GHANA_REGIONS;
    case "BENIN": return BENIN_REGIONS;
    default: return [];
  }
}

export function getWADistricts(market: Market, regionName: string): WADistrict[] {
  let all: WADistrict[];
  switch (market) {
    case "TOGO": all = TOGO_DISTRICTS; break;
    case "GHANA": all = GHANA_DISTRICTS; break;
    case "BENIN": all = BENIN_DISTRICTS; break;
    default: return [];
  }
  return all.filter((d) => d.regionName === regionName);
}

export function getWACities(market: Market, regionName: string): WACity[] {
  let all: WACity[];
  switch (market) {
    case "TOGO": all = TOGO_CITIES; break;
    case "GHANA": all = GHANA_CITIES; break;
    case "BENIN": all = BENIN_CITIES; break;
    default: return [];
  }
  return all.filter((c) => c.region === regionName);
}

export function findWACity(market: Market, regionName: string, cityName: string): WACity | undefined {
  let all: WACity[];
  switch (market) {
    case "TOGO": all = TOGO_CITIES; break;
    case "GHANA": all = GHANA_CITIES; break;
    case "BENIN": all = BENIN_CITIES; break;
    default: return undefined;
  }
  return all.find(
    (c) => c.region === regionName && c.name === cityName,
  );
}

// --- Unified helpers ---

/** Get a formatted location string for display */
export function formatLocation(
  market: Market,
  state?: string,
  city?: string,
  county?: string,
): string {
  if (market === "USA") {
    const parts: string[] = [];
    if (city) parts.push(city);
    if (county) parts.push(county);
    if (state) {
      const stateObj = US_STATES.find((s) => s.code === state);
      parts.push(stateObj ? stateObj.code : state);
    }
    return parts.join(", ") || "United States";
  }
  // West Africa
  const parts: string[] = [];
  if (city) parts.push(city);
  if (county) parts.push(county);
  if (state) parts.push(state);
  const countryName = market === "TOGO" ? "Togo" : market === "GHANA" ? "Ghana" : "Benin";
  parts.push(countryName);
  return parts.join(", ");
}

/** Get display name for a state code or region */
export function getStateName(market: Market, stateOrRegion: string): string {
  if (market === "USA") {
    const s = US_STATES.find((st) => st.code === stateOrRegion);
    return s ? s.name : stateOrRegion;
  }
  return stateOrRegion;
}
