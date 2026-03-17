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
  CA: "hot-dry",
  MN: "cold", WI: "cold", MI: "cold", ND: "cold", SD: "cold",
  MT: "cold", WY: "cold", AK: "cold", ME: "cold", VT: "cold",
  NH: "cold", NY: "cold", IL: "cold", OH: "cold", IN: "cold",
  IA: "cold", NE: "cold", CO: "cold", MA: "cold", CT: "cold",
  PA: "cold", ID: "cold",
};

const COLD_SEASON = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const HOT_SEASON = [0, 1, 2, 3, 9, 10, 11];
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

  const estimatedSqft = Math.round(medianRooms * 200);

  // Cost index: local median home value / national median
  const costIndex = Math.round(
    Math.min(2.5, Math.max(0.5, medianValue / NATIONAL_MEDIANS.homeValue)) * 100
  ) / 100;

  // Labor index: local construction wage / national wage
  const laborIndex = bls
    ? Math.round(Math.min(2.0, Math.max(0.6, bls.constructionMeanWage / NATIONAL_CONSTRUCTION_WAGE)) * 100) / 100
    : costIndex;

  // Property tax rate
  const propertyTaxRate = medianValue > 0
    ? Math.round((medianTaxes / medianValue) * 1000) / 10
    : 1.0;

  // Rent per sqft from HUD FMR
  const fmr2br = hud?.twoBr ?? medianRent;
  const avgRentPerSqft = Math.round((fmr2br / 900) * 100) / 100;

  // Sale price per sqft
  const avgSalePricePerSqft = estimatedSqft > 0
    ? Math.round(medianValue / estimatedSqft)
    : Math.round(medianValue / 1600);

  // Land price estimate
  const landMid = Math.round(medianValue * 0.25);
  const landPricePerAcre = {
    low: Math.round(landMid * 0.5),
    mid: landMid,
    high: Math.round(landMid * 2.0),
  };

  const permitCostEstimate = Math.round(5000 * costIndex);

  const climate: ClimateType = STATE_CLIMATE[state] ?? "temperate";

  const buildingSeasonMonths = climate === "cold" ? COLD_SEASON
    : climate === "hot-dry" || climate === "hot-humid" ? HOT_SEASON
    : YEAR_ROUND;

  const rainyMonths = climate === "hot-humid" ? [5, 6, 7, 8, 9]
    : climate === "cold" ? [3, 4, 10, 11]
    : climate === "temperate" ? [3, 4, 5, 10, 11]
    : [6, 7, 8];

  const cityName = hud?.metroName?.split(",")[0] || `ZIP ${zip}`;

  const sources = ["Census ACS"];
  if (hud) sources.push("HUD FMR");
  if (bls) sources.push("BLS OES");

  const localNotes = `Data from ${sources.join(", ")}. ` +
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
