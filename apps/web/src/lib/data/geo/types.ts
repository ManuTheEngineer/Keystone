import type { Market } from "@/lib/services/project-service";

export interface USState {
  code: string;
  name: string;
  /** Census region: Northeast, Midwest, South, West, Territory */
  region: string;
}

export interface USCounty {
  name: string;
  stateCode: string;
}

export interface USCity {
  name: string;
  stateCode: string;
  county: string;
  lat: number;
  lng: number;
  population: number;
  /** Associated zip codes (up to 5 for reference) */
  zips: string[];
}

export interface WARegion {
  name: string;
  country: Market;
  capital?: string;
}

export interface WADistrict {
  name: string;
  regionName: string;
  country: Market;
  capital?: string;
}

export interface WACity {
  name: string;
  district: string;
  region: string;
  country: Market;
  lat: number;
  lng: number;
  population?: number;
}

/** Unified location object stored on a project */
export interface ProjectLocation {
  /** US state code or WA region name */
  state: string;
  /** US county name or WA district/prefecture */
  county?: string;
  /** City or town name */
  city?: string;
  /** US zip code */
  zipCode?: string;
  lat?: number;
  lng?: number;
}
