import { NextRequest } from "next/server";
import { fetchCensusDataByZip } from "@/lib/market-apis/census";
import { fetchHudFmrByZip } from "@/lib/market-apis/hud";
import { fetchBlsWageByMetro } from "@/lib/market-apis/bls";
import { fetchWorldBankCpi } from "@/lib/market-apis/worldbank";
import { computeLocationData } from "@/lib/market-apis/compute";
import { cacheGet, cacheGetStale, cacheSet } from "@/lib/market-apis/cache";
import { zipToState, STATE_TO_CBSA } from "@/lib/market-apis/zip-to-metro";
import { getClosestLocation } from "@keystone/market-data";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { LocationData } from "@keystone/market-data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const market = (request.nextUrl.searchParams.get("market") ?? "USA").toUpperCase();
  const fresh = request.nextUrl.searchParams.get("fresh") === "1";

  if (!q) {
    return apiError("Missing query parameter", { status: 400 });
  }

  if (q.length > 200) {
    return apiError("Query too long", { status: 400 });
  }

  // --- West Africa: curated data with CPI adjustment ---
  if (market !== "USA") {
    const staticData = getClosestLocation(q, market);
    if (!staticData) {
      return apiSuccess(null, { meta: { source: "none" } });
    }

    const cached = await cacheGet<{ multiplier: number }>("cpi", market);
    let multiplier = cached?.multiplier ?? 1.0;

    if (!cached) {
      const cpi = await fetchWorldBankCpi(market);
      if (cpi) {
        multiplier = cpi.inflationMultiplier;
        await cacheSet("cpi", market, { multiplier, ...cpi });
      }
    }

    if (multiplier !== 1.0 && Math.abs(multiplier - 1.0) > 0.005) {
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
      return apiSuccess(adjusted, { meta: { source: "curated+cpi" } });
    }

    return apiSuccess(staticData, { meta: { source: "curated" } });
  }

  // --- USA: extract or resolve ZIP code ---
  let zip: string | null = q.match(/\b(\d{5})\b/)?.[1] ?? null;

  if (!zip) {
    try {
      const searchAddr = q.includes(",") ? q : `${q}, USA`;
      const geoUrl = `https://geocoding.geo.census.gov/geocoder/addresses/onelineaddress?address=${encodeURIComponent(searchAddr)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const match = geoData?.result?.addressMatches?.[0];
        const matchedAddr = match?.matchedAddress ?? "";
        const addrZip = matchedAddr.match(/(\d{5})/)?.[1];
        if (addrZip) zip = addrZip;
      }
    } catch {
      // Geocoder failed or timed out — fall through to static
    }
  }

  if (!zip) {
    const staticData = getClosestLocation(q, "USA");
    return apiSuccess(staticData, { meta: { source: "static" } });
  }

  if (!fresh) {
    const cached = await cacheGet<LocationData>("location", zip);
    if (cached) {
      return apiSuccess(cached, { meta: { source: "cache" } });
    }
  }

  const state = zipToState(zip);
  const cbsa = state ? STATE_TO_CBSA[state] : null;

  const [censusResult, hudResult, blsResult] = await Promise.allSettled([
    fetchCensusDataByZip(zip),
    fetchHudFmrByZip(zip),
    cbsa ? fetchBlsWageByMetro(cbsa) : Promise.resolve(null),
  ]);
  const census = censusResult.status === "fulfilled" ? censusResult.value : null;
  const hud = hudResult.status === "fulfilled" ? hudResult.value : null;
  const bls = blsResult.status === "fulfilled" ? blsResult.value : null;

  if (!census && !hud) {
    const stale = await cacheGetStale<LocationData>("location", zip);
    if (stale) {
      return apiSuccess(stale, { meta: { source: "stale-cache" } });
    }
    const staticData = getClosestLocation(q, "USA")
      ?? (state ? getClosestLocation(state, "USA") : null);
    return apiSuccess(staticData, { meta: { source: "static" } });
  }

  const locationData = computeLocationData(zip, state ?? "", census, hud, bls);
  await cacheSet("location", zip, locationData);

  return apiSuccess(locationData, { meta: { source: "api" } });
}
