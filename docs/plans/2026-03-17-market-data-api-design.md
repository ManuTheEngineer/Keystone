# Market Data API Integration Design

**Date:** 2026-03-17
**Status:** Approved
**Goal:** Replace hardcoded 30-city US data with live API coverage for every US ZIP code. Auto-inflate West African costs using World Bank CPI. Cache aggressively.

---

## APIs Used

### US (all free, all government)

| API | Data | Auth | Endpoint |
|-----|------|------|----------|
| Census ACS 5-Year | Median home value, median rent, property taxes, housing units | Free API key | `api.census.gov/data/2022/acs/acs5` |
| HUD Fair Market Rents | Official rental benchmarks (0-4 BR) by ZIP | Free Bearer token | `huduser.gov/hudapi/public/fmr` |
| BLS OES | Construction trade wages by metro | Free API key (v2) | `api.bls.gov/publicAPI/v2/timeseries/data/` |
| FRED | 30-year mortgage rate | Free API key | `api.stlouisfed.org/fred/series/observations` |

### West Africa

| API | Data | Auth | Endpoint |
|-----|------|------|----------|
| World Bank | CPI, exchange rates, GDP for TGO/GHA/BEN | None | `api.worldbank.org/v2/` |

---

## Architecture

### New Files

```
apps/web/src/
  app/api/location-data/
    route.ts              # Main API route — orchestrates all lookups
  lib/
    market-apis/
      census.ts           # Census ACS fetcher (median value, rent, taxes)
      hud.ts              # HUD FMR fetcher (fair market rents by ZIP)
      bls.ts              # BLS OES fetcher (construction wages by metro)
      fred.ts             # FRED fetcher (mortgage rate)
      worldbank.ts        # World Bank fetcher (CPI for WA inflation)
      cache.ts            # Firebase cache read/write with TTL
      zip-to-metro.ts     # ZIP → CBSA/FIPS mapping (static lookup)
      compute.ts          # Transform raw API data → LocationData
```

### Data Flow

```
User types "32256" or "Jacksonville FL"
  → Client calls /api/location-data?q=32256&market=USA
  → Server: check Firebase cache (key: "loc:USA:32256")
    → HIT (< 30 days old): return cached LocationData
    → MISS: parallel fetch Census + HUD + BLS
      → Compute costIndex, laborIndex, land/rent/sale prices
      → Cache to Firebase, return LocationData
```

### Environment Variables (all free)

```env
# Census Bureau (api.census.gov/data/key_signup.html)
CENSUS_API_KEY=

# HUD User (huduser.gov/hudapi/public/register)
HUD_API_TOKEN=

# BLS (data.bls.gov/registrationEngine/)
BLS_API_KEY=

# FRED (fredaccount.stlouisfed.org)
FRED_API_KEY=
```

---

## US: How Raw API Data Maps to LocationData

### costIndex (construction cost relative to national average)

**Source:** Census ACS variable `B25077_001E` (median home value)
- Fetch median home value for target ZCTA
- Fetch national median home value
- `costIndex = local_median / national_median`
- Clamp between 0.50 and 2.50

**Why this works:** Median home value strongly correlates with construction cost. Markets where homes sell for 2x the national median have proportionally higher material + labor costs.

### laborIndex

**Source:** BLS OES series for "47-0000 Construction and Extraction Occupations" mean annual wage
- Fetch metro-area mean wage for construction trades
- Fetch national mean wage
- `laborIndex = local_wage / national_wage`
- Fallback: use costIndex if no BLS data for that metro

### landPricePerAcre

**Source:** Census ACS `B25077_001E` (median home value) minus estimated construction cost
- `estimatedLandValue = medianHomeValue - (medianSqft * nationalCostPerSqft)`
- Convert to per-acre using typical lot size for the area
- Provide low/mid/high as 0.6x / 1.0x / 1.8x of estimate

### propertyTaxRate

**Source:** Census ACS `B25103_001E` (median real estate taxes paid) / `B25077_001E` (median home value)
- `propertyTaxRate = (medianTaxes / medianValue) * 100`

### avgRentPerSqft

**Source:** HUD Fair Market Rent for 2-bedroom unit / typical 2BR sqft (900 sqft)
- `avgRentPerSqft = fmr_2br / 900`
- Also store raw FMR values for display

### avgSalePricePerSqft

**Source:** Census ACS `B25077_001E` / Census ACS `B25018_001E` (median rooms → estimated sqft)
- `avgSalePricePerSqft = medianValue / estimatedSqft`

### permitCostEstimate

**Source:** Scaled from costIndex
- `permitCostEstimate = baseCost * costIndex` where baseCost = $5,000 (national avg)

### climate, rainyMonths, buildingSeasonMonths

**Source:** Static lookup table by state (not API-dependent)
- Map each state to a climate zone
- Pre-defined rainy months and building season per zone

---

## West Africa: CPI Auto-Inflation

### How it works

1. Fetch World Bank CPI for TGO/GHA/BEN (indicator `FP.CPI.TOTL`, base year = our curated data year)
2. Calculate inflation multiplier: `cpiCurrent / cpiBaseYear`
3. Apply to all curated cost benchmarks: `adjustedCost = curatedCost * inflationMultiplier`
4. Cache the multiplier for 30 days

### What stays curated (no API available)

- City-level costIndex (Lome vs Kpalime vs Sokode)
- Land prices per sqm
- Trade wages
- Permit costs
- Climate/building season data
- All education content

### What gets auto-adjusted

- All cost benchmarks (foundation, walls, roofing, etc.) via CPI multiplier
- Rental estimates via CPI multiplier

---

## Cache Strategy

### Firebase Realtime Database

```
locationCache/
  USA/
    32256/
      data: { ...LocationData }
      fetchedAt: "2026-03-17T..."
      ttl: 2592000000  (30 days in ms)
  WA_CPI/
    TGO/
      multiplier: 1.087
      fetchedAt: "2026-03-17T..."
      baseYear: 2025
```

### TTL Policy

| Data type | TTL | Reason |
|-----------|-----|--------|
| US location data | 30 days | Census/HUD update annually |
| BLS wages | 90 days | Updated annually |
| FRED mortgage rate | 7 days | Updated weekly |
| World Bank CPI | 90 days | Updated annually |

---

## Client-Side Changes

### New project wizard (location step)

1. User types city/ZIP → debounced call to `/api/location-data?q=...&market=...`
2. Loading state while fetching
3. LocationData returned → populate the existing intelligence card
4. If API fails → fall back to static hardcoded data (current behavior)
5. ZIP code input: accept 5-digit ZIP and look up directly
6. City input: use Census geocoder or partial match to find ZCTA

### Budget page

- When loading benchmarks, apply `costIndex` from cached location data
- No change to existing logic — just better costIndex values

### Financials page

- Mortgage rate from FRED (cached) instead of user-input-only
- Pre-fill with current 30-year rate

---

## Fallback Chain

```
1. Try API route /api/location-data
2. If API fails → try Firebase cache (even if expired)
3. If no cache → fall back to static locations.ts data
4. If no static match → use national averages (costIndex: 1.0)
```

The app never breaks. It just gets more accurate as APIs respond.

---

## Implementation Phases

### Phase 1: API Infrastructure (server-side)
- Create market-apis/ module with Census, HUD, BLS, FRED, WorldBank fetchers
- Create /api/location-data route with cache
- Add env vars to .env.example

### Phase 2: US Coverage
- Wire Census ACS for median values at ZCTA level
- Wire HUD FMR for rental data
- Wire BLS for labor index
- Compute LocationData from raw API responses
- ZIP-to-metro mapping for BLS lookups

### Phase 3: West Africa CPI
- Wire World Bank API for TGO/GHA/BEN CPI
- Apply inflation multiplier to curated cost data
- Cache multipliers

### Phase 4: Client Integration
- Update location step to call /api/location-data
- Add loading/error states
- Debounce input
- Pre-fill mortgage rate from FRED
- Graceful fallback to static data

### Phase 5: Enrichment
- Add FRED mortgage rate to financials pre-fill
- Show data freshness indicator ("Updated March 2026")
- Add "powered by Census/HUD/BLS" attribution (required by some APIs)
