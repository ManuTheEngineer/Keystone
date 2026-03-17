# Market Data API Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded 30-city US location data with live Census/HUD/BLS API coverage for every US ZIP code, and auto-inflate West African costs via World Bank CPI.

**Architecture:** Server-side API route `/api/location-data` orchestrates parallel fetches to Census ACS, HUD FMR, and BLS OES. Results are computed into the existing `LocationData` shape, cached in Firebase for 30 days, and served to the client. The existing `getClosestLocation()` becomes the fallback when APIs are unavailable. West Africa uses World Bank CPI to inflate curated costs.

**Tech Stack:** Next.js API routes, Census/HUD/BLS/FRED/World Bank REST APIs, Firebase Realtime Database (cache), TypeScript.

---

### Task 1: Environment Variables + .env.example

**Files:**
- Modify: `apps/web/.env.example` (add new API key placeholders)
- Modify: `apps/web/.env.local` (add actual keys after registration)

**Step 1: Add env var placeholders to .env.example**

```env
# Market Data APIs (all free — register at links below)
# Census Bureau: api.census.gov/data/key_signup.html
CENSUS_API_KEY=
# HUD User: huduser.gov/hudapi/public/register
HUD_API_TOKEN=
# Bureau of Labor Statistics: data.bls.gov/registrationEngine/
BLS_API_KEY=
# FRED: fredaccount.stlouisfed.org/apikeys
FRED_API_KEY=
```

**Step 2: Register for free API keys**

1. Census: https://api.census.gov/data/key_signup.html — enter email, get key instantly
2. HUD: https://www.huduser.gov/hudapi/public/register — fill form, get Bearer token via email
3. BLS: https://data.bls.gov/registrationEngine/ — enter email, get v2 API key
4. FRED: https://fredaccount.stlouisfed.org/apikeys — create account, generate key

**Step 3: Add keys to .env.local**

**Step 4: Commit**

```bash
git add apps/web/.env.example
git commit -m "chore: add market data API key placeholders to .env.example"
```

---

### Task 2: Census ACS Fetcher

**Files:**
- Create: `apps/web/src/lib/market-apis/census.ts`

**Step 1: Create the Census ACS fetcher**

This fetches median home value, median rent, median property taxes, and housing unit count for any US ZCTA (ZIP Code Tabulation Area).

```typescript
// apps/web/src/lib/market-apis/census.ts

const CENSUS_BASE = "https://api.census.gov/data/2022/acs/acs5";

export interface CensusData {
  medianHomeValue: number | null;    // B25077_001E
  medianGrossRent: number | null;    // B25064_001E
  medianRealEstateTaxes: number | null; // B25103_001E
  totalHousingUnits: number | null;  // B25001_001E
  medianRooms: number | null;        // B25018_001E
  zcta: string;
}

// National medians for computing indices (ACS 2022 5-year)
export const NATIONAL_MEDIANS = {
  homeValue: 281900,
  grossRent: 1163,
  realEstateTaxes: 2690,
  rooms: 5.5,
};

/**
 * Fetch ACS 5-year data for a specific ZCTA (ZIP code tabulation area).
 * Variables: B25077_001E (median value), B25064_001E (median rent),
 * B25103_001E (median taxes), B25001_001E (total units), B25018_001E (median rooms)
 */
export async function fetchCensusDataByZip(zip: string): Promise<CensusData | null> {
  const key = process.env.CENSUS_API_KEY;
  if (!key) return null;

  const vars = "B25077_001E,B25064_001E,B25103_001E,B25001_001E,B25018_001E";
  const url = `${CENSUS_BASE}?get=${vars}&for=zip%20code%20tabulation%20area:${zip}&key=${key}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // Census returns [[header], [values]]
    if (!data || data.length < 2) return null;
    const row = data[1];
    return {
      medianHomeValue: parseNum(row[0]),
      medianGrossRent: parseNum(row[1]),
      medianRealEstateTaxes: parseNum(row[2]),
      totalHousingUnits: parseNum(row[3]),
      medianRooms: parseNum(row[4]),
      zcta: zip,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch national-level ACS data for computing indices.
 */
export async function fetchCensusNational(): Promise<{ homeValue: number; rent: number } | null> {
  const key = process.env.CENSUS_API_KEY;
  if (!key) return null;

  const url = `${CENSUS_BASE}?get=B25077_001E,B25064_001E&for=us:*&key=${key}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length < 2) return null;
    return {
      homeValue: parseNum(data[1][0]) ?? NATIONAL_MEDIANS.homeValue,
      rent: parseNum(data[1][1]) ?? NATIONAL_MEDIANS.grossRent,
    };
  } catch {
    return null;
  }
}

function parseNum(val: string | null | undefined): number | null {
  if (val == null || val === "" || val === "-") return null;
  const n = Number(val);
  return isNaN(n) || n < 0 ? null : n;
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/census.ts
git commit -m "feat: Census ACS fetcher for ZIP-level housing data"
```

---

### Task 3: HUD Fair Market Rent Fetcher

**Files:**
- Create: `apps/web/src/lib/market-apis/hud.ts`

**Step 1: Create the HUD FMR fetcher**

```typescript
// apps/web/src/lib/market-apis/hud.ts

const HUD_BASE = "https://www.huduser.gov/hudapi/public";

export interface HudFmrData {
  efficiency: number;  // Studio
  oneBr: number;
  twoBr: number;
  threeBr: number;
  fourBr: number;
  county: string;
  metroName: string;
  year: number;
}

/**
 * Fetch Fair Market Rents by ZIP code.
 * HUD uses entity_id which can be a county FIPS or metro code.
 * The ZIP crosswalk endpoint maps ZIP → county FIPS.
 */
export async function fetchHudFmrByZip(zip: string): Promise<HudFmrData | null> {
  const token = process.env.HUD_API_TOKEN;
  if (!token) return null;

  try {
    // Step 1: Get county FIPS from ZIP
    const xwalkRes = await fetch(`${HUD_BASE}/usps?type=2&query=${zip}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!xwalkRes.ok) return null;
    const xwalkData = await xwalkRes.json();
    if (!xwalkData?.data?.results?.[0]) return null;

    const countyFips = xwalkData.data.results[0].geoid;
    const countyName = xwalkData.data.results[0].county || "";

    // Step 2: Get FMR for county
    const fmrRes = await fetch(`${HUD_BASE}/fmr/data/${countyFips}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!fmrRes.ok) return null;
    const fmrData = await fmrRes.json();
    const d = fmrData?.data;
    if (!d) return null;

    return {
      efficiency: d.efficiency ?? d.Efficiency ?? 0,
      oneBr: d.one_bedroom ?? d.One_Bedroom ?? 0,
      twoBr: d.two_bedroom ?? d.Two_Bedroom ?? 0,
      threeBr: d.three_bedroom ?? d.Three_Bedroom ?? 0,
      fourBr: d.four_bedroom ?? d.Four_Bedroom ?? 0,
      county: countyName,
      metroName: d.metro_name ?? d.areaname ?? "",
      year: d.year ?? new Date().getFullYear(),
    };
  } catch {
    return null;
  }
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/hud.ts
git commit -m "feat: HUD FMR fetcher for ZIP-level rental benchmarks"
```

---

### Task 4: BLS Construction Wages Fetcher

**Files:**
- Create: `apps/web/src/lib/market-apis/bls.ts`

**Step 1: Create the BLS OES fetcher**

```typescript
// apps/web/src/lib/market-apis/bls.ts

const BLS_BASE = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

export interface BlsWageData {
  constructionMeanWage: number;  // Annual mean wage, SOC 47-0000
  area: string;
}

// National mean annual wage for Construction & Extraction (2023)
export const NATIONAL_CONSTRUCTION_WAGE = 52520;

/**
 * Fetch mean annual wage for Construction and Extraction Occupations
 * (SOC 47-0000) for a given metro area (CBSA code).
 * Series ID format: OEUM{area}{occupation}{datatype}
 * Area: CBSA code (7 digits, padded), Occupation: 470000, Datatype: 04 (mean annual)
 */
export async function fetchBlsWageByMetro(cbsaCode: string): Promise<BlsWageData | null> {
  const key = process.env.BLS_API_KEY;
  if (!key) return null;

  // OES series: OEUM + area(7) + 470000 + 04(mean annual wage)
  const paddedCbsa = cbsaCode.padStart(7, "0");
  const seriesId = `OEUM${paddedCbsa}470000004`;

  try {
    const res = await fetch(BLS_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: [seriesId],
        startyear: String(new Date().getFullYear() - 1),
        endyear: String(new Date().getFullYear()),
        registrationkey: key,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const series = data?.Results?.series?.[0];
    if (!series?.data?.[0]) return null;

    return {
      constructionMeanWage: Number(series.data[0].value) || NATIONAL_CONSTRUCTION_WAGE,
      area: cbsaCode,
    };
  } catch {
    return null;
  }
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/bls.ts
git commit -m "feat: BLS OES fetcher for metro construction wages"
```

---

### Task 5: FRED Mortgage Rate Fetcher

**Files:**
- Create: `apps/web/src/lib/market-apis/fred.ts`

**Step 1: Create the FRED fetcher**

```typescript
// apps/web/src/lib/market-apis/fred.ts

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

/**
 * Fetch the latest 30-year fixed mortgage rate from FRED.
 * Series: MORTGAGE30US (updated weekly by Freddie Mac)
 */
export async function fetchMortgageRate(): Promise<number | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;

  try {
    const url = `${FRED_BASE}?series_id=MORTGAGE30US&api_key=${key}&file_type=json&sort_order=desc&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const val = data?.observations?.[0]?.value;
    if (!val || val === ".") return null;
    return Number(val);
  } catch {
    return null;
  }
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/fred.ts
git commit -m "feat: FRED fetcher for live 30-year mortgage rate"
```

---

### Task 6: World Bank CPI Fetcher (West Africa)

**Files:**
- Create: `apps/web/src/lib/market-apis/worldbank.ts`

**Step 1: Create the World Bank fetcher**

```typescript
// apps/web/src/lib/market-apis/worldbank.ts

const WB_BASE = "https://api.worldbank.org/v2";

export interface CpiData {
  country: string;
  latestCpi: number;
  latestYear: number;
  baselineCpi: number;
  baselineYear: number;
  inflationMultiplier: number;
}

// Baseline year = when our curated cost data was last calibrated
const BASELINE_YEAR = 2025;

const COUNTRY_CODES: Record<string, string> = {
  TOGO: "TGO",
  GHANA: "GHA",
  BENIN: "BEN",
};

/**
 * Fetch CPI data from World Bank for a given country.
 * Returns inflation multiplier to adjust curated costs.
 * Indicator: FP.CPI.TOTL (Consumer Price Index, 2010=100)
 */
export async function fetchWorldBankCpi(market: string): Promise<CpiData | null> {
  const code = COUNTRY_CODES[market.toUpperCase()];
  if (!code) return null;

  try {
    const url = `${WB_BASE}/country/${code}/indicator/FP.CPI.TOTL?format=json&date=${BASELINE_YEAR - 2}:${BASELINE_YEAR + 2}&per_page=10`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const [, records] = await res.json();
    if (!records || records.length === 0) return null;

    // Find latest available data point and baseline year
    const sorted = records
      .filter((r: any) => r.value != null)
      .sort((a: any, b: any) => Number(b.date) - Number(a.date));

    if (sorted.length === 0) return null;

    const latest = sorted[0];
    const baseline = sorted.find((r: any) => Number(r.date) <= BASELINE_YEAR) ?? sorted[sorted.length - 1];

    const latestCpi = Number(latest.value);
    const baselineCpi = Number(baseline.value);
    const multiplier = baselineCpi > 0 ? latestCpi / baselineCpi : 1.0;

    return {
      country: market.toUpperCase(),
      latestCpi,
      latestYear: Number(latest.date),
      baselineCpi,
      baselineYear: Number(baseline.date),
      inflationMultiplier: Math.round(multiplier * 1000) / 1000,
    };
  } catch {
    return null;
  }
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/worldbank.ts
git commit -m "feat: World Bank CPI fetcher for West Africa inflation adjustment"
```

---

### Task 7: Cache Layer

**Files:**
- Create: `apps/web/src/lib/market-apis/cache.ts`

**Step 1: Create the Firebase cache helper**

```typescript
// apps/web/src/lib/market-apis/cache.ts

import { dbGet, dbPatch } from "@/lib/firebase-rest";

const TTL_30_DAYS = 30 * 24 * 60 * 60 * 1000;
const TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000;
const TTL_90_DAYS = 90 * 24 * 60 * 60 * 1000;

export type CacheCategory = "location" | "mortgage" | "cpi";

const TTL_MAP: Record<CacheCategory, number> = {
  location: TTL_30_DAYS,
  mortgage: TTL_7_DAYS,
  cpi: TTL_90_DAYS,
};

/**
 * Read from Firebase cache. Returns null if expired or missing.
 */
export async function cacheGet<T>(category: CacheCategory, key: string): Promise<T | null> {
  try {
    const entry = await dbGet(`locationCache/${category}/${encodeKey(key)}`);
    if (!entry || !entry.data || !entry.fetchedAt) return null;
    const age = Date.now() - new Date(entry.fetchedAt).getTime();
    if (age > TTL_MAP[category]) return null;
    return entry.data as T;
  } catch {
    return null;
  }
}

/**
 * Read from cache even if expired (for fallback when APIs are down).
 */
export async function cacheGetStale<T>(category: CacheCategory, key: string): Promise<T | null> {
  try {
    const entry = await dbGet(`locationCache/${category}/${encodeKey(key)}`);
    if (!entry?.data) return null;
    return entry.data as T;
  } catch {
    return null;
  }
}

/**
 * Write to Firebase cache with timestamp.
 */
export async function cacheSet(category: CacheCategory, key: string, data: unknown): Promise<void> {
  try {
    await dbPatch(`locationCache/${category}/${encodeKey(key)}`, {
      data,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    // Cache write failure is non-fatal
  }
}

function encodeKey(key: string): string {
  // Firebase keys can't contain . $ # [ ] /
  return key.replace(/[.#$\[\]\/]/g, "_");
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/cache.ts
git commit -m "feat: Firebase cache layer for market data (TTL-based)"
```

---

### Task 8: ZIP-to-Metro Mapping

**Files:**
- Create: `apps/web/src/lib/market-apis/zip-to-metro.ts`

**Step 1: Create the static state→CBSA mapping for BLS lookups**

BLS data is by CBSA (metro area). We map each state to its largest metro's CBSA code. This is a lightweight fallback — HUD crosswalk gives us the exact county, and for BLS we use the metro.

```typescript
// apps/web/src/lib/market-apis/zip-to-metro.ts

/**
 * Maps US state abbreviations to their largest metro area CBSA code.
 * Used for BLS OES wage lookups when exact metro isn't known.
 */
export const STATE_TO_CBSA: Record<string, string> = {
  AL: "13820", // Birmingham
  AK: "11260", // Anchorage
  AZ: "38060", // Phoenix
  AR: "30780", // Little Rock
  CA: "31080", // Los Angeles
  CO: "19740", // Denver
  CT: "25540", // Hartford
  DE: "37980", // Philadelphia (DE part)
  FL: "33100", // Miami
  GA: "12060", // Atlanta
  HI: "46520", // Urban Honolulu
  ID: "14260", // Boise
  IL: "16980", // Chicago
  IN: "26900", // Indianapolis
  IA: "19780", // Des Moines
  KS: "28140", // Kansas City
  KY: "31140", // Louisville
  LA: "35380", // New Orleans
  ME: "38860", // Portland ME
  MD: "12580", // Baltimore
  MA: "14460", // Boston
  MI: "19820", // Detroit
  MN: "33460", // Minneapolis
  MS: "27140", // Jackson
  MO: "28140", // Kansas City
  MT: "13740", // Billings
  NE: "36540", // Omaha
  NV: "29820", // Las Vegas
  NH: "31700", // Manchester
  NJ: "35620", // New York (NJ part)
  NM: "10740", // Albuquerque
  NY: "35620", // New York
  NC: "16740", // Charlotte
  ND: "22020", // Fargo
  OH: "18140", // Columbus
  OK: "36420", // Oklahoma City
  OR: "38900", // Portland OR
  PA: "37980", // Philadelphia
  RI: "39300", // Providence
  SC: "16740", // Charlotte (SC part)
  SD: "43620", // Sioux Falls
  TN: "34980", // Nashville
  TX: "26420", // Houston
  UT: "41620", // Salt Lake City
  VT: "15540", // Burlington
  VA: "47900", // Washington DC
  WA: "42660", // Seattle
  WV: "16620", // Charleston WV
  WI: "33340", // Milwaukee
  WY: "16220", // Casper
  DC: "47900", // Washington DC
};

/**
 * Extract state abbreviation from a ZIP code's first 3 digits.
 * This is approximate — ZIP prefixes generally map to states.
 */
export function zipToState(zip: string): string | null {
  const prefix = parseInt(zip.substring(0, 3), 10);
  if (isNaN(prefix)) return null;

  // ZIP prefix ranges by state (approximate)
  if (prefix >= 35 && prefix <= 36) return "AL";
  if (prefix >= 995 && prefix <= 999) return "AK";
  if (prefix >= 850 && prefix <= 865) return "AZ";
  if (prefix >= 716 && prefix <= 729) return "AR";
  if (prefix >= 900 && prefix <= 961) return "CA";
  if (prefix >= 800 && prefix <= 816) return "CO";
  if (prefix >= 60 && prefix <= 69) return "CT";
  if (prefix >= 197 && prefix <= 199) return "DE";
  if (prefix >= 320 && prefix <= 349) return "FL";
  if (prefix >= 300 && prefix <= 319) return "GA";
  if (prefix >= 967 && prefix <= 968) return "HI";
  if (prefix >= 832 && prefix <= 838) return "ID";
  if (prefix >= 600 && prefix <= 629) return "IL";
  if (prefix >= 460 && prefix <= 479) return "IN";
  if (prefix >= 500 && prefix <= 528) return "IA";
  if (prefix >= 660 && prefix <= 679) return "KS";
  if (prefix >= 400 && prefix <= 427) return "KY";
  if (prefix >= 700 && prefix <= 714) return "LA";
  if (prefix >= 39 && prefix <= 49) return "ME";
  if (prefix >= 206 && prefix <= 219) return "MD";
  if (prefix >= 10 && prefix <= 27) return "MA";
  if (prefix >= 480 && prefix <= 499) return "MI";
  if (prefix >= 550 && prefix <= 567) return "MN";
  if (prefix >= 386 && prefix <= 397) return "MS";
  if (prefix >= 630 && prefix <= 658) return "MO";
  if (prefix >= 590 && prefix <= 599) return "MT";
  if (prefix >= 680 && prefix <= 693) return "NE";
  if (prefix >= 889 && prefix <= 898) return "NV";
  if (prefix >= 30 && prefix <= 38) return "NH";
  if (prefix >= 70 && prefix <= 89) return "NJ";
  if (prefix >= 870 && prefix <= 884) return "NM";
  if (prefix >= 100 && prefix <= 149) return "NY";
  if (prefix >= 270 && prefix <= 289) return "NC";
  if (prefix >= 580 && prefix <= 588) return "ND";
  if (prefix >= 430 && prefix <= 458) return "OH";
  if (prefix >= 730 && prefix <= 749) return "OK";
  if (prefix >= 970 && prefix <= 979) return "OR";
  if (prefix >= 150 && prefix <= 196) return "PA";
  if (prefix >= 28 && prefix <= 29) return "RI";
  if (prefix >= 290 && prefix <= 299) return "SC";
  if (prefix >= 570 && prefix <= 577) return "SD";
  if (prefix >= 370 && prefix <= 385) return "TN";
  if (prefix >= 750 && prefix <= 799) return "TX";
  if (prefix >= 840 && prefix <= 847) return "UT";
  if (prefix >= 50 && prefix <= 59) return "VT";
  if (prefix >= 220 && prefix <= 246) return "VA";
  if (prefix >= 980 && prefix <= 994) return "WA";
  if (prefix >= 247 && prefix <= 268) return "WV";
  if (prefix >= 530 && prefix <= 549) return "WI";
  if (prefix >= 820 && prefix <= 831) return "WY";
  if (prefix >= 200 && prefix <= 205) return "DC";
  return null;
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/zip-to-metro.ts
git commit -m "feat: ZIP-to-state and state-to-CBSA mapping for BLS lookups"
```

---

### Task 9: Compute LocationData from Raw API Data

**Files:**
- Create: `apps/web/src/lib/market-apis/compute.ts`

**Step 1: Create the computation module**

```typescript
// apps/web/src/lib/market-apis/compute.ts

import type { LocationData, ClimateType } from "@keystone/market-data";
import type { CensusData } from "./census";
import { NATIONAL_MEDIANS } from "./census";
import type { HudFmrData } from "./hud";
import type { BlsWageData } from "./bls";
import { NATIONAL_CONSTRUCTION_WAGE } from "./bls";

// State → climate mapping
const STATE_CLIMATE: Record<string, ClimateType> = {
  FL: "hot-humid", LA: "hot-humid", TX: "hot-humid", MS: "hot-humid",
  AL: "hot-humid", GA: "hot-humid", SC: "hot-humid", HI: "hot-humid",
  AZ: "hot-dry", NV: "hot-dry", NM: "hot-dry", UT: "hot-dry",
  CA: "hot-dry", // Southern CA; Northern is temperate
  MN: "cold", WI: "cold", MI: "cold", ND: "cold", SD: "cold",
  MT: "cold", WY: "cold", AK: "cold", ME: "cold", VT: "cold",
  NH: "cold", NY: "cold", IL: "cold", OH: "cold", IN: "cold",
  IA: "cold", NE: "cold", CO: "cold", MA: "cold", CT: "cold",
  PA: "cold", ID: "cold",
  // Everything else: temperate
};

// State → building season months
const COLD_SEASON = [2, 3, 4, 5, 6, 7, 8, 9, 10];       // Mar-Nov
const HOT_SEASON = [0, 1, 2, 3, 9, 10, 11];               // Oct-Apr
const YEAR_ROUND = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/**
 * Transform raw API responses into a LocationData object.
 */
export function computeLocationData(
  zip: string,
  state: string,
  census: CensusData | null,
  hud: HudFmrData | null,
  bls: BlsWageData | null,
): LocationData {
  const medianValue = census?.medianHomeValue ?? NATIONAL_MEDIANS.homeValue;
  const medianRent = census?.medianGrossRent ?? hud?.twoBr ?? NATIONAL_MEDIANS.grossRent;
  const medianTaxes = census?.medianRealEstateTaxes ?? NATIONAL_MEDIANS.realEstateTaxes;
  const medianRooms = census?.medianRooms ?? NATIONAL_MEDIANS.rooms;

  // Estimate sqft from median rooms (avg ~200 sqft per room)
  const estimatedSqft = Math.round(medianRooms * 200);

  // Cost index: local median home value / national median
  const costIndex = Math.round(
    Math.min(2.5, Math.max(0.5, medianValue / NATIONAL_MEDIANS.homeValue)) * 100
  ) / 100;

  // Labor index: local construction wage / national wage
  const laborIndex = bls
    ? Math.round(Math.min(2.0, Math.max(0.6, bls.constructionMeanWage / NATIONAL_CONSTRUCTION_WAGE)) * 100) / 100
    : costIndex; // fallback to costIndex

  // Property tax rate: annual taxes / home value * 100
  const propertyTaxRate = medianValue > 0
    ? Math.round((medianTaxes / medianValue) * 1000) / 10
    : 1.0;

  // Rent per sqft from HUD FMR (2BR / ~900 sqft)
  const fmr2br = hud?.twoBr ?? medianRent;
  const avgRentPerSqft = Math.round((fmr2br / 900) * 100) / 100;

  // Sale price per sqft
  const avgSalePricePerSqft = estimatedSqft > 0
    ? Math.round(medianValue / estimatedSqft)
    : Math.round(medianValue / 1600);

  // Land price estimate: ~25% of median home value, converted to per-acre
  const landMid = Math.round(medianValue * 0.25);
  const landPricePerAcre = {
    low: Math.round(landMid * 0.5),
    mid: landMid,
    high: Math.round(landMid * 2.0),
  };

  // Permit cost scales with cost index
  const permitCostEstimate = Math.round(5000 * costIndex);

  // Climate from state
  const climate: ClimateType = STATE_CLIMATE[state] ?? "temperate";

  // Building season from climate
  const buildingSeasonMonths = climate === "cold" ? COLD_SEASON
    : climate === "hot-dry" || climate === "hot-humid" ? HOT_SEASON
    : YEAR_ROUND;

  // Rainy months from climate
  const rainyMonths = climate === "hot-humid" ? [5, 6, 7, 8, 9]
    : climate === "cold" ? [3, 4, 10, 11]
    : climate === "temperate" ? [3, 4, 5, 10, 11]
    : [6, 7, 8]; // hot-dry monsoon

  const cityName = hud?.metroName?.split(",")[0] || `ZIP ${zip}`;
  const localNotes = `Data from Census ACS, HUD FMR${bls ? ", BLS OES" : ""}. ` +
    `Median home value: $${medianValue.toLocaleString()}. ` +
    (hud ? `HUD Fair Market Rent (2BR): $${fmr2br.toLocaleString()}/mo. ` : "") +
    `Cost index ${costIndex}x means ${costIndex > 1 ? `${Math.round((costIndex - 1) * 100)}% above` : `${Math.round((1 - costIndex) * 100)}% below`} the national average.`;

  return {
    city: cityName,
    state,
    country: "USA",
    region: hud?.metroName || state,
    costIndex,
    laborIndex,
    landPricePerAcre,
    propertyTaxRate,
    avgRentPerSqft,
    avgSalePricePerSqft,
    permitCostEstimate,
    climate,
    rainyMonths,
    buildingSeasonMonths,
    localNotes,
  };
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/market-apis/compute.ts
git commit -m "feat: compute LocationData from Census/HUD/BLS raw responses"
```

---

### Task 10: Location Data API Route

**Files:**
- Create: `apps/web/src/app/api/location-data/route.ts`

**Step 1: Create the orchestration route**

```typescript
// apps/web/src/app/api/location-data/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchCensusDataByZip } from "@/lib/market-apis/census";
import { fetchHudFmrByZip } from "@/lib/market-apis/hud";
import { fetchBlsWageByMetro } from "@/lib/market-apis/bls";
import { fetchWorldBankCpi } from "@/lib/market-apis/worldbank";
import { computeLocationData } from "@/lib/market-apis/compute";
import { cacheGet, cacheGetStale, cacheSet } from "@/lib/market-apis/cache";
import { zipToState, STATE_TO_CBSA } from "@/lib/market-apis/zip-to-metro";
import { getClosestLocation } from "@keystone/market-data";
import type { LocationData } from "@keystone/market-data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const market = (request.nextUrl.searchParams.get("market") ?? "USA").toUpperCase();

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  // --- West Africa: return curated data with CPI adjustment ---
  if (market !== "USA") {
    const staticData = getClosestLocation(q, market);
    if (!staticData) {
      return NextResponse.json({ data: null });
    }

    // Try to apply CPI inflation
    const cached = await cacheGet<{ multiplier: number }>("cpi", market);
    let multiplier = cached?.multiplier ?? 1.0;

    if (!cached) {
      const cpi = await fetchWorldBankCpi(market);
      if (cpi) {
        multiplier = cpi.inflationMultiplier;
        await cacheSet("cpi", market, { multiplier, ...cpi });
      }
    }

    // Apply inflation to cost-related fields
    if (multiplier !== 1.0) {
      const adjusted = { ...staticData };
      if (adjusted.landPricePerSqm) {
        adjusted.landPricePerSqm = {
          low: Math.round(adjusted.landPricePerSqm.low * multiplier),
          mid: Math.round(adjusted.landPricePerSqm.mid * multiplier),
          high: Math.round(adjusted.landPricePerSqm.high * multiplier),
        };
      }
      adjusted.landPricePerAcre = {
        low: Math.round(adjusted.landPricePerAcre.low * multiplier),
        mid: Math.round(adjusted.landPricePerAcre.mid * multiplier),
        high: Math.round(adjusted.landPricePerAcre.high * multiplier),
      };
      adjusted.permitCostEstimate = Math.round(adjusted.permitCostEstimate * multiplier);
      if (adjusted.avgRentPerSqm) {
        adjusted.avgRentPerSqm = Math.round(adjusted.avgRentPerSqm * multiplier);
      }
      adjusted.localNotes = `${adjusted.localNotes} Costs adjusted for ${((multiplier - 1) * 100).toFixed(1)}% inflation since 2025.`;
      return NextResponse.json({ data: adjusted, source: "curated+cpi" });
    }

    return NextResponse.json({ data: staticData, source: "curated" });
  }

  // --- USA: extract ZIP code ---
  const zipMatch = q.match(/\b(\d{5})\b/);
  const zip = zipMatch ? zipMatch[1] : null;

  if (!zip) {
    // No ZIP code — fall back to static fuzzy matching
    const staticData = getClosestLocation(q, "USA");
    return NextResponse.json({ data: staticData, source: "static" });
  }

  // Check cache first
  const cached = await cacheGet<LocationData>("location", zip);
  if (cached) {
    return NextResponse.json({ data: cached, source: "cache" });
  }

  // Determine state and CBSA for BLS lookup
  const state = zipToState(zip);
  const cbsa = state ? STATE_TO_CBSA[state] : null;

  // Parallel fetch from all APIs
  const [census, hud, bls] = await Promise.all([
    fetchCensusDataByZip(zip),
    fetchHudFmrByZip(zip),
    cbsa ? fetchBlsWageByMetro(cbsa) : Promise.resolve(null),
  ]);

  // If all APIs failed, try stale cache then static fallback
  if (!census && !hud) {
    const stale = await cacheGetStale<LocationData>("location", zip);
    if (stale) {
      return NextResponse.json({ data: stale, source: "stale-cache" });
    }
    const staticData = getClosestLocation(q, "USA");
    return NextResponse.json({ data: staticData, source: "static" });
  }

  // Compute LocationData from API responses
  const locationData = computeLocationData(zip, state ?? "", census, hud, bls);

  // Cache the result
  await cacheSet("location", zip, locationData);

  return NextResponse.json({ data: locationData, source: "api" });
}
```

**Step 2: Commit**

```bash
git add apps/web/src/app/api/location-data/route.ts
git commit -m "feat: /api/location-data route — orchestrates Census+HUD+BLS with cache"
```

---

### Task 11: Client Integration — Update New Project Wizard

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

**Step 1: Replace synchronous getClosestLocation with async API call**

In the new-project wizard, change the `locationData` memo to call the API route instead of the static lookup. Add a loading state and debounce.

Key changes:
1. Replace `useMemo` with `useEffect` + `useState` for `locationData`
2. Add 500ms debounce on city input
3. Show loading spinner while fetching
4. Fall back to static `getClosestLocation` if API fails

**Step 2: Add loading state to location intelligence card**

Show a subtle skeleton/spinner in the location intelligence card while the API is fetching.

**Step 3: Commit**

```bash
git add apps/web/src/app/(dashboard)/new-project/page.tsx
git commit -m "feat: new-project wizard fetches live location data from API"
```

---

### Task 12: Add Firebase Rules for Cache

**Files:**
- Modify: `apps/web/database.rules.json`

**Step 1: Add locationCache rules**

The cache is written by server-side routes (using database secret), but needs to be readable for debugging. Add rules:

```json
"locationCache": {
  ".read": false,
  ".write": false
}
```

Server-side routes use the database secret which bypasses rules. No client needs to read the cache directly.

**Step 2: Commit**

```bash
git add apps/web/database.rules.json
git commit -m "feat: Firebase rules for locationCache (server-only)"
```

---

### Task 13: Build, Verify, Push

**Step 1: Run TypeScript check**
```bash
cd apps/web && npx tsc --noEmit
```
Expected: 0 errors

**Step 2: Run Next.js build**
```bash
cd apps/web && npx next build
```
Expected: Compiled successfully

**Step 3: Manual test**
- Start dev server: `npm run dev`
- Go to /new-project, select USA market
- Type "32256" (Jacksonville FL ZIP)
- Verify location intelligence card shows Census-based data
- Type "Lomé" with TOGO market
- Verify curated data with CPI note appears

**Step 4: Push**
```bash
git push
```
