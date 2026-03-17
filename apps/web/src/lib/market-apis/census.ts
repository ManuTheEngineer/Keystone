const CENSUS_BASE = "https://api.census.gov/data/2022/acs/acs5";

export interface CensusData {
  medianHomeValue: number | null;
  medianGrossRent: number | null;
  medianRealEstateTaxes: number | null;
  totalHousingUnits: number | null;
  medianRooms: number | null;
  zcta: string;
}

export const NATIONAL_MEDIANS = {
  homeValue: 281900,
  grossRent: 1163,
  realEstateTaxes: 2690,
  rooms: 5.5,
};

export async function fetchCensusDataByZip(zip: string): Promise<CensusData | null> {
  const key = process.env.CENSUS_API_KEY;
  if (!key) return null;

  const vars = "B25077_001E,B25064_001E,B25103_001E,B25001_001E,B25018_001E";
  const url = `${CENSUS_BASE}?get=${vars}&for=zip%20code%20tabulation%20area:${zip}&key=${key}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
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

function parseNum(val: string | null | undefined): number | null {
  if (val == null || val === "" || val === "-") return null;
  const n = Number(val);
  return isNaN(n) || n < 0 ? null : n;
}
