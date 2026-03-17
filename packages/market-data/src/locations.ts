// ---------------------------------------------------------------------------
// Location Intelligence System
// ---------------------------------------------------------------------------
// Provides regional cost indices, labor rates, land prices, tax rates,
// rental rates, climate data, and building season information for major
// US cities and West African cities. Used throughout Keystone to customize
// cost estimates, financial projections, and scheduling recommendations
// based on the user's selected project location.
// ---------------------------------------------------------------------------

export type ClimateType = "hot-humid" | "hot-dry" | "temperate" | "cold" | "tropical";

export interface LocationData {
  city: string;
  state?: string;
  country: string;
  region: string;
  costIndex: number;
  laborIndex: number;
  landPricePerAcre: { low: number; mid: number; high: number };
  landPricePerSqm?: { low: number; mid: number; high: number };
  propertyTaxRate: number;
  avgRentPerSqft?: number;
  avgRentPerSqm?: number;
  avgSalePricePerSqft?: number;
  avgSalePricePerSqm?: number;
  permitCostEstimate: number;
  climate: ClimateType;
  rainyMonths: number[];
  buildingSeasonMonths: number[];
  localNotes: string;
}

// ---------------------------------------------------------------------------
// USA Location Data (30 metro areas)
// ---------------------------------------------------------------------------

const USA_LOCATIONS: LocationData[] = [
  {
    city: "Houston",
    state: "TX",
    country: "USA",
    region: "Gulf Coast",
    costIndex: 0.90,
    laborIndex: 0.88,
    landPricePerAcre: { low: 50000, mid: 120000, high: 300000 },
    propertyTaxRate: 1.8,
    avgRentPerSqft: 1.10,
    avgSalePricePerSqft: 150,
    permitCostEstimate: 4500,
    climate: "hot-humid",
    rainyMonths: [4, 5, 6, 8, 9],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Strong builder-friendly market with no state income tax and year-round construction weather, though hurricane season (June through November) can cause delays.",
  },
  {
    city: "Dallas",
    state: "TX",
    country: "USA",
    region: "North Texas",
    costIndex: 0.92,
    laborIndex: 0.90,
    landPricePerAcre: { low: 60000, mid: 150000, high: 400000 },
    propertyTaxRate: 1.9,
    avgRentPerSqft: 1.15,
    avgSalePricePerSqft: 165,
    permitCostEstimate: 5000,
    climate: "hot-humid",
    rainyMonths: [3, 4, 5, 9, 10],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Rapid suburban growth drives strong demand for new construction, but high property tax rates cut into rental margins.",
  },
  {
    city: "Austin",
    state: "TX",
    country: "USA",
    region: "Central Texas",
    costIndex: 1.05,
    laborIndex: 1.00,
    landPricePerAcre: { low: 80000, mid: 200000, high: 500000 },
    propertyTaxRate: 1.8,
    avgRentPerSqft: 1.40,
    avgSalePricePerSqft: 220,
    permitCostEstimate: 6000,
    climate: "hot-humid",
    rainyMonths: [4, 5, 9, 10],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Tech-driven demand keeps prices elevated but the market has cooled from its 2021 peak, creating opportunities for well-priced new builds.",
  },
  {
    city: "San Antonio",
    state: "TX",
    country: "USA",
    region: "South Texas",
    costIndex: 0.85,
    laborIndex: 0.83,
    landPricePerAcre: { low: 40000, mid: 100000, high: 250000 },
    propertyTaxRate: 1.7,
    avgRentPerSqft: 0.95,
    avgSalePricePerSqft: 130,
    permitCostEstimate: 3500,
    climate: "hot-humid",
    rainyMonths: [4, 5, 9, 10],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "One of the most affordable Texas metros for new construction with steady military and healthcare employment anchoring demand.",
  },
  {
    city: "Atlanta",
    state: "GA",
    country: "USA",
    region: "Southeast",
    costIndex: 0.95,
    laborIndex: 0.92,
    landPricePerAcre: { low: 50000, mid: 130000, high: 350000 },
    propertyTaxRate: 1.0,
    avgRentPerSqft: 1.20,
    avgSalePricePerSqft: 175,
    permitCostEstimate: 5000,
    climate: "hot-humid",
    rainyMonths: [2, 3, 6, 7],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Strong population growth and diverse economy support steady construction demand, with lower property taxes than many comparable metros.",
  },
  {
    city: "Charlotte",
    state: "NC",
    country: "USA",
    region: "Piedmont",
    costIndex: 0.93,
    laborIndex: 0.90,
    landPricePerAcre: { low: 45000, mid: 110000, high: 280000 },
    propertyTaxRate: 0.8,
    avgRentPerSqft: 1.10,
    avgSalePricePerSqft: 160,
    permitCostEstimate: 4500,
    climate: "temperate",
    rainyMonths: [2, 3, 6, 7],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Banking hub with strong job growth and low property taxes making it attractive for build-to-rent investors.",
  },
  {
    city: "Nashville",
    state: "TN",
    country: "USA",
    region: "Mid-South",
    costIndex: 1.00,
    laborIndex: 0.95,
    landPricePerAcre: { low: 60000, mid: 160000, high: 400000 },
    propertyTaxRate: 0.7,
    avgRentPerSqft: 1.25,
    avgSalePricePerSqft: 200,
    permitCostEstimate: 5500,
    climate: "temperate",
    rainyMonths: [2, 3, 4, 11],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "No state income tax and strong tourism-driven rental demand, but land prices in desirable areas have risen sharply.",
  },
  {
    city: "Phoenix",
    state: "AZ",
    country: "USA",
    region: "Southwest",
    costIndex: 0.95,
    laborIndex: 0.92,
    landPricePerAcre: { low: 40000, mid: 100000, high: 250000 },
    propertyTaxRate: 0.6,
    avgRentPerSqft: 1.05,
    avgSalePricePerSqft: 170,
    permitCostEstimate: 5000,
    climate: "hot-dry",
    rainyMonths: [6, 7, 8],
    buildingSeasonMonths: [0, 1, 2, 3, 9, 10, 11],
    localNotes: "Extreme summer heat (115F+) limits outdoor construction work from June through September, but low humidity means minimal weather delays the rest of the year.",
  },
  {
    city: "Las Vegas",
    state: "NV",
    country: "USA",
    region: "Southwest",
    costIndex: 1.00,
    laborIndex: 0.95,
    landPricePerAcre: { low: 50000, mid: 120000, high: 300000 },
    propertyTaxRate: 0.6,
    avgRentPerSqft: 1.00,
    avgSalePricePerSqft: 165,
    permitCostEstimate: 5500,
    climate: "hot-dry",
    rainyMonths: [7, 8],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 9, 10, 11],
    localNotes: "No state income tax and very low property taxes, but extreme desert heat restricts summer construction and water availability affects landscaping.",
  },
  {
    city: "Denver",
    state: "CO",
    country: "USA",
    region: "Mountain West",
    costIndex: 1.10,
    laborIndex: 1.05,
    landPricePerAcre: { low: 70000, mid: 180000, high: 450000 },
    propertyTaxRate: 0.5,
    avgRentPerSqft: 1.30,
    avgSalePricePerSqft: 210,
    permitCostEstimate: 7000,
    climate: "cold",
    rainyMonths: [3, 4, 5],
    buildingSeasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "High altitude and cold winters shorten the building season, but strong population growth and low property taxes support solid returns.",
  },
  {
    city: "Miami",
    state: "FL",
    country: "USA",
    region: "South Florida",
    costIndex: 1.15,
    laborIndex: 1.08,
    landPricePerAcre: { low: 80000, mid: 250000, high: 600000 },
    propertyTaxRate: 0.9,
    avgRentPerSqft: 1.60,
    avgSalePricePerSqft: 250,
    permitCostEstimate: 8000,
    climate: "hot-humid",
    rainyMonths: [5, 6, 7, 8, 9],
    buildingSeasonMonths: [0, 1, 2, 3, 10, 11],
    localNotes: "Hurricane-rated construction adds 15 to 20% to building costs, but strong international demand and no state income tax support premium pricing.",
  },
  {
    city: "Orlando",
    state: "FL",
    country: "USA",
    region: "Central Florida",
    costIndex: 0.95,
    laborIndex: 0.90,
    landPricePerAcre: { low: 45000, mid: 110000, high: 280000 },
    propertyTaxRate: 0.9,
    avgRentPerSqft: 1.10,
    avgSalePricePerSqft: 170,
    permitCostEstimate: 5000,
    climate: "hot-humid",
    rainyMonths: [5, 6, 7, 8, 9],
    buildingSeasonMonths: [0, 1, 2, 3, 10, 11],
    localNotes: "Tourism and population growth drive steady rental demand, with more affordable land than South Florida.",
  },
  {
    city: "Tampa",
    state: "FL",
    country: "USA",
    region: "Gulf Coast Florida",
    costIndex: 0.95,
    laborIndex: 0.90,
    landPricePerAcre: { low: 40000, mid: 100000, high: 250000 },
    propertyTaxRate: 0.9,
    avgRentPerSqft: 1.05,
    avgSalePricePerSqft: 165,
    permitCostEstimate: 4500,
    climate: "hot-humid",
    rainyMonths: [5, 6, 7, 8, 9],
    buildingSeasonMonths: [0, 1, 2, 3, 10, 11],
    localNotes: "Flood zone verification is critical before buying land; insurance costs can significantly affect rental profitability.",
  },
  {
    city: "Chicago",
    state: "IL",
    country: "USA",
    region: "Midwest",
    costIndex: 1.10,
    laborIndex: 1.10,
    landPricePerAcre: { low: 60000, mid: 200000, high: 500000 },
    propertyTaxRate: 2.1,
    avgRentPerSqft: 1.30,
    avgSalePricePerSqft: 185,
    permitCostEstimate: 8000,
    climate: "cold",
    rainyMonths: [3, 4, 5, 6],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "Strong union labor market drives higher construction wages; harsh winters limit the effective building season to roughly April through October.",
  },
  {
    city: "Detroit",
    state: "MI",
    country: "USA",
    region: "Great Lakes",
    costIndex: 0.80,
    laborIndex: 0.85,
    landPricePerAcre: { low: 20000, mid: 60000, high: 150000 },
    propertyTaxRate: 1.5,
    avgRentPerSqft: 0.80,
    avgSalePricePerSqft: 100,
    permitCostEstimate: 3000,
    climate: "cold",
    rainyMonths: [3, 4, 5, 10],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "Lowest land and construction costs among major metros, but high property taxes and shorter building season require careful budgeting.",
  },
  {
    city: "Minneapolis",
    state: "MN",
    country: "USA",
    region: "Upper Midwest",
    costIndex: 1.05,
    laborIndex: 1.00,
    landPricePerAcre: { low: 50000, mid: 140000, high: 350000 },
    propertyTaxRate: 1.1,
    avgRentPerSqft: 1.15,
    avgSalePricePerSqft: 180,
    permitCostEstimate: 6000,
    climate: "cold",
    rainyMonths: [4, 5, 6],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9],
    localNotes: "Severe winters (sub-zero temps December through February) require insulated foundations and limit outdoor work to roughly seven months per year.",
  },
  {
    city: "Seattle",
    state: "WA",
    country: "USA",
    region: "Pacific Northwest",
    costIndex: 1.30,
    laborIndex: 1.25,
    landPricePerAcre: { low: 100000, mid: 300000, high: 800000 },
    propertyTaxRate: 1.0,
    avgRentPerSqft: 1.80,
    avgSalePricePerSqft: 300,
    permitCostEstimate: 12000,
    climate: "temperate",
    rainyMonths: [0, 1, 2, 10, 11],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9],
    localNotes: "High labor costs and lengthy permitting processes add time and expense, but strong tech employment supports premium rents and sale prices.",
  },
  {
    city: "Portland",
    state: "OR",
    country: "USA",
    region: "Pacific Northwest",
    costIndex: 1.15,
    laborIndex: 1.10,
    landPricePerAcre: { low: 70000, mid: 200000, high: 500000 },
    propertyTaxRate: 1.0,
    avgRentPerSqft: 1.40,
    avgSalePricePerSqft: 230,
    permitCostEstimate: 9000,
    climate: "temperate",
    rainyMonths: [0, 1, 2, 10, 11],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9],
    localNotes: "Strict building codes and environmental regulations add cost, but strong demand in close-in neighborhoods supports new construction.",
  },
  {
    city: "San Francisco",
    state: "CA",
    country: "USA",
    region: "Bay Area",
    costIndex: 1.50,
    laborIndex: 1.45,
    landPricePerAcre: { low: 200000, mid: 600000, high: 1500000 },
    propertyTaxRate: 0.7,
    avgRentPerSqft: 2.50,
    avgSalePricePerSqft: 450,
    permitCostEstimate: 15000,
    climate: "temperate",
    rainyMonths: [0, 1, 2, 11],
    buildingSeasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "Highest construction costs in the nation due to labor, regulations, and land scarcity; Prop 13 keeps property taxes low relative to value.",
  },
  {
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    region: "Southern California",
    costIndex: 1.35,
    laborIndex: 1.30,
    landPricePerAcre: { low: 150000, mid: 400000, high: 1000000 },
    propertyTaxRate: 0.7,
    avgRentPerSqft: 2.00,
    avgSalePricePerSqft: 350,
    permitCostEstimate: 12000,
    climate: "hot-dry",
    rainyMonths: [0, 1, 2, 11],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Year-round building weather but very high labor and material costs; fire zone and seismic requirements add to structural expenses.",
  },
  {
    city: "San Diego",
    state: "CA",
    country: "USA",
    region: "Southern California",
    costIndex: 1.30,
    laborIndex: 1.25,
    landPricePerAcre: { low: 120000, mid: 350000, high: 800000 },
    propertyTaxRate: 0.7,
    avgRentPerSqft: 1.90,
    avgSalePricePerSqft: 330,
    permitCostEstimate: 10000,
    climate: "hot-dry",
    rainyMonths: [0, 1, 2, 11],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Ideal building climate with minimal rain but high land and labor costs; military presence provides stable rental demand.",
  },
  {
    city: "Sacramento",
    state: "CA",
    country: "USA",
    region: "Central Valley",
    costIndex: 1.10,
    laborIndex: 1.05,
    landPricePerAcre: { low: 60000, mid: 150000, high: 400000 },
    propertyTaxRate: 0.7,
    avgRentPerSqft: 1.20,
    avgSalePricePerSqft: 200,
    permitCostEstimate: 7000,
    climate: "hot-dry",
    rainyMonths: [0, 1, 2, 11],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "More affordable than Bay Area with growing remote-worker demand; hot summers but year-round construction is feasible.",
  },
  {
    city: "New York",
    state: "NY",
    country: "USA",
    region: "Northeast",
    costIndex: 1.45,
    laborIndex: 1.40,
    landPricePerAcre: { low: 200000, mid: 500000, high: 2000000 },
    propertyTaxRate: 1.7,
    avgRentPerSqft: 2.20,
    avgSalePricePerSqft: 400,
    permitCostEstimate: 15000,
    climate: "cold",
    rainyMonths: [3, 4, 10, 11],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "Extremely high land and labor costs with complex permitting; outer boroughs and suburbs offer more feasible new construction opportunities.",
  },
  {
    city: "Boston",
    state: "MA",
    country: "USA",
    region: "New England",
    costIndex: 1.30,
    laborIndex: 1.25,
    landPricePerAcre: { low: 100000, mid: 300000, high: 800000 },
    propertyTaxRate: 1.2,
    avgRentPerSqft: 1.90,
    avgSalePricePerSqft: 320,
    permitCostEstimate: 10000,
    climate: "cold",
    rainyMonths: [3, 4, 10, 11],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "High demand from universities and biotech but short building season and strict historical preservation rules in many neighborhoods.",
  },
  {
    city: "Philadelphia",
    state: "PA",
    country: "USA",
    region: "Mid-Atlantic",
    costIndex: 1.05,
    laborIndex: 1.00,
    landPricePerAcre: { low: 50000, mid: 130000, high: 350000 },
    propertyTaxRate: 1.4,
    avgRentPerSqft: 1.10,
    avgSalePricePerSqft: 160,
    permitCostEstimate: 5500,
    climate: "temperate",
    rainyMonths: [3, 4, 5, 8],
    buildingSeasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Wage tax and property tax are high but land is more affordable than NYC or Boston, making it viable for new construction projects.",
  },
  {
    city: "Washington DC",
    state: "DC",
    country: "USA",
    region: "Mid-Atlantic",
    costIndex: 1.20,
    laborIndex: 1.15,
    landPricePerAcre: { low: 100000, mid: 300000, high: 700000 },
    propertyTaxRate: 0.6,
    avgRentPerSqft: 1.70,
    avgSalePricePerSqft: 280,
    permitCostEstimate: 8000,
    climate: "temperate",
    rainyMonths: [4, 5, 6, 7],
    buildingSeasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Federal employment provides recession-resistant rental demand; low property taxes compared to surrounding Maryland and Virginia suburbs.",
  },
  {
    city: "Raleigh",
    state: "NC",
    country: "USA",
    region: "Research Triangle",
    costIndex: 0.95,
    laborIndex: 0.92,
    landPricePerAcre: { low: 50000, mid: 120000, high: 300000 },
    propertyTaxRate: 0.8,
    avgRentPerSqft: 1.10,
    avgSalePricePerSqft: 170,
    permitCostEstimate: 4500,
    climate: "temperate",
    rainyMonths: [3, 4, 7, 8],
    buildingSeasonMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    localNotes: "Research Triangle tech sector drives strong demand with low taxes and year-round building weather.",
  },
  {
    city: "Columbus",
    state: "OH",
    country: "USA",
    region: "Midwest",
    costIndex: 0.90,
    laborIndex: 0.88,
    landPricePerAcre: { low: 40000, mid: 100000, high: 250000 },
    propertyTaxRate: 1.6,
    avgRentPerSqft: 0.95,
    avgSalePricePerSqft: 145,
    permitCostEstimate: 4000,
    climate: "cold",
    rainyMonths: [3, 4, 5, 6],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "Affordable construction costs and steady population growth from Ohio State University and Intel expansion.",
  },
  {
    city: "Indianapolis",
    state: "IN",
    country: "USA",
    region: "Midwest",
    costIndex: 0.85,
    laborIndex: 0.83,
    landPricePerAcre: { low: 30000, mid: 80000, high: 200000 },
    propertyTaxRate: 0.9,
    avgRentPerSqft: 0.90,
    avgSalePricePerSqft: 130,
    permitCostEstimate: 3500,
    climate: "cold",
    rainyMonths: [3, 4, 5, 6],
    buildingSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "Among the lowest construction and land costs for a major metro, with capped property tax assessments keeping ongoing costs predictable.",
  },
  {
    city: "Kansas City",
    state: "MO",
    country: "USA",
    region: "Midwest",
    costIndex: 0.88,
    laborIndex: 0.85,
    landPricePerAcre: { low: 35000, mid: 90000, high: 220000 },
    propertyTaxRate: 1.4,
    avgRentPerSqft: 0.95,
    avgSalePricePerSqft: 140,
    permitCostEstimate: 4000,
    climate: "temperate",
    rainyMonths: [3, 4, 5, 8, 9],
    buildingSeasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    localNotes: "Straddling two states (MO/KS) means tax rates vary by which side you build on; affordable land and labor make it attractive for spec builders.",
  },
];

// ---------------------------------------------------------------------------
// West Africa Location Data
// ---------------------------------------------------------------------------

const WA_LOCATIONS: LocationData[] = [
  {
    city: "Lome",
    state: undefined,
    country: "TOGO",
    region: "Maritime",
    costIndex: 1.0,
    laborIndex: 1.0,
    landPricePerSqm: { low: 15000, mid: 35000, high: 80000 },
    landPricePerAcre: { low: 60000000, mid: 140000000, high: 320000000 },
    propertyTaxRate: 0.5,
    avgRentPerSqm: 2500,
    permitCostEstimate: 250000,
    climate: "tropical",
    rainyMonths: [3, 4, 5, 6, 8, 9, 10],
    buildingSeasonMonths: [0, 1, 11],
    localNotes: "Capital city with highest land costs in Togo; verify titre foncier before purchasing and budget for notary fees of 5 to 8% of land value.",
  },
  {
    city: "Avepozo",
    state: undefined,
    country: "TOGO",
    region: "Maritime",
    costIndex: 0.80,
    laborIndex: 0.90,
    landPricePerSqm: { low: 8000, mid: 18000, high: 40000 },
    landPricePerAcre: { low: 32000000, mid: 72000000, high: 160000000 },
    propertyTaxRate: 0.3,
    avgRentPerSqm: 1500,
    permitCostEstimate: 150000,
    climate: "tropical",
    rainyMonths: [3, 4, 5, 6, 8, 9, 10],
    buildingSeasonMonths: [0, 1, 11],
    localNotes: "Growing suburb east of Lome with more affordable land; road infrastructure is improving but verify water and electricity access on any plot.",
  },
  {
    city: "Kpalime",
    state: undefined,
    country: "TOGO",
    region: "Plateaux",
    costIndex: 0.70,
    laborIndex: 0.80,
    landPricePerSqm: { low: 5000, mid: 12000, high: 30000 },
    landPricePerAcre: { low: 20000000, mid: 48000000, high: 120000000 },
    propertyTaxRate: 0.3,
    avgRentPerSqm: 1000,
    permitCostEstimate: 100000,
    climate: "tropical",
    rainyMonths: [3, 4, 5, 6, 8, 9, 10],
    buildingSeasonMonths: [0, 1, 11],
    localNotes: "Cooler highland climate and lower costs, popular for weekend homes; material transport from Lome adds 10 to 15% to material costs.",
  },
  {
    city: "Sokode",
    state: undefined,
    country: "TOGO",
    region: "Centrale",
    costIndex: 0.65,
    laborIndex: 0.75,
    landPricePerSqm: { low: 4000, mid: 10000, high: 25000 },
    landPricePerAcre: { low: 16000000, mid: 40000000, high: 100000000 },
    propertyTaxRate: 0.2,
    avgRentPerSqm: 800,
    permitCostEstimate: 80000,
    climate: "tropical",
    rainyMonths: [3, 4, 5, 6, 8, 9, 10],
    buildingSeasonMonths: [0, 1, 11],
    localNotes: "Lowest construction costs in the Togo dataset; fewer skilled tradespeople available so plan for longer build timelines.",
  },
  {
    city: "Accra",
    state: undefined,
    country: "GHANA",
    region: "Greater Accra",
    costIndex: 1.10,
    laborIndex: 1.05,
    landPricePerSqm: { low: 200, mid: 500, high: 1200 },
    landPricePerAcre: { low: 800000, mid: 2000000, high: 4800000 },
    propertyTaxRate: 0.5,
    avgRentPerSqm: 35,
    permitCostEstimate: 5000,
    climate: "tropical",
    rainyMonths: [3, 4, 5, 6, 8, 9, 10],
    buildingSeasonMonths: [0, 1, 11],
    localNotes: "Land prices in GHS per sqm; register through the Lands Commission and verify no competing stool land claims before purchase.",
  },
  {
    city: "Kumasi",
    state: undefined,
    country: "GHANA",
    region: "Ashanti",
    costIndex: 0.85,
    laborIndex: 0.85,
    landPricePerSqm: { low: 100, mid: 250, high: 600 },
    landPricePerAcre: { low: 400000, mid: 1000000, high: 2400000 },
    propertyTaxRate: 0.4,
    avgRentPerSqm: 20,
    permitCostEstimate: 3000,
    climate: "tropical",
    rainyMonths: [3, 4, 5, 6, 8, 9, 10],
    buildingSeasonMonths: [0, 1, 11],
    localNotes: "Lower costs than Accra with strong commercial activity; Ashanti stool land system requires extra due diligence on ownership.",
  },
  {
    city: "Cotonou",
    state: undefined,
    country: "BENIN",
    region: "Littoral",
    costIndex: 0.95,
    laborIndex: 0.95,
    landPricePerSqm: { low: 12000, mid: 30000, high: 70000 },
    landPricePerAcre: { low: 48000000, mid: 120000000, high: 280000000 },
    propertyTaxRate: 0.4,
    avgRentPerSqm: 2000,
    permitCostEstimate: 200000,
    climate: "tropical",
    rainyMonths: [3, 4, 5, 6, 8, 9, 10],
    buildingSeasonMonths: [0, 1, 11],
    localNotes: "CFA zone like Togo; register land through ANDF for formal ownership. Coastal flooding risk in some low-lying neighborhoods.",
  },
];

// ---------------------------------------------------------------------------
// All locations combined
// ---------------------------------------------------------------------------

const ALL_LOCATIONS: LocationData[] = [...USA_LOCATIONS, ...WA_LOCATIONS];

// ---------------------------------------------------------------------------
// Month name helper
// ---------------------------------------------------------------------------

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonthList(months: number[]): string {
  if (months.length === 0) return "None";
  if (months.length === 12) return "Year-round";

  // Group consecutive months
  const sorted = [...months].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? MONTH_NAMES[start] : `${MONTH_NAMES[start]} to ${MONTH_NAMES[end]}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? MONTH_NAMES[start] : `${MONTH_NAMES[start]} to ${MONTH_NAMES[end]}`);

  return ranges.join(", ");
}

// ---------------------------------------------------------------------------
// Lookup functions
// ---------------------------------------------------------------------------

/**
 * Returns location data for an exact city name within a given market.
 */
export function getLocationData(city: string, market: string): LocationData | null {
  const normalized = city.toLowerCase().trim();
  const marketUpper = market.toUpperCase();

  const pool = marketUpper === "USA" ? USA_LOCATIONS : WA_LOCATIONS;

  for (const loc of pool) {
    if (loc.city.toLowerCase() === normalized) return loc;
    // Also match country for WA locations
    if (loc.country.toUpperCase() === marketUpper && loc.city.toLowerCase() === normalized) return loc;
  }
  return null;
}

// US state name → abbreviation mapping for fuzzy matching
const US_STATE_NAMES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY", "district of columbia": "DC",
};

// Regional fallbacks: maps every US state to the closest metro in our dataset
const US_STATE_FALLBACKS: Record<string, string> = {
  AL: "Atlanta", AK: "Seattle", AR: "Nashville", CT: "Boston", DE: "Philadelphia",
  HI: "Los Angeles", ID: "Denver", IA: "Kansas City", KS: "Kansas City",
  KY: "Nashville", LA: "Houston", ME: "Boston", MD: "Washington DC",
  MS: "Houston", MT: "Denver", NE: "Kansas City", NH: "Boston",
  NJ: "New York", NM: "Phoenix", ND: "Minneapolis", OK: "Dallas",
  RI: "Boston", SC: "Charlotte", SD: "Minneapolis", UT: "Denver",
  VT: "Boston", VA: "Washington DC", WV: "Philadelphia", WI: "Chicago",
  WY: "Denver",
};

// WA region fallbacks: maps regions to the closest city in our dataset
const WA_REGION_FALLBACKS: Record<string, string> = {
  // Togo regions
  maritime: "Lome", plateaux: "Kpalime", centrale: "Sokode", kara: "Sokode", savanes: "Sokode",
  // Ghana regions
  "greater accra": "Accra", ashanti: "Kumasi", western: "Kumasi", eastern: "Accra",
  central: "Accra", volta: "Accra", northern: "Kumasi",
  // Benin regions
  littoral: "Cotonou", atlantique: "Cotonou", oueme: "Cotonou", zou: "Cotonou",
};

/**
 * Fuzzy-matches user input against known locations. Checks city names,
 * state names/abbreviations, region names, and falls back to the nearest
 * regional proxy when no exact match is found. This means any city in any
 * US state or WA region will get reasonable cost estimates.
 */
export function getClosestLocation(input: string, market: string): LocationData | null {
  if (!input || !market) return null;

  const normalized = input.toLowerCase().trim();
  if (normalized.length < 2) return null;

  const marketUpper = market.toUpperCase();
  const pool = marketUpper === "USA" ? USA_LOCATIONS : WA_LOCATIONS.filter((l) => l.country.toUpperCase() === marketUpper || marketUpper !== "USA");

  // 1. Exact city name match
  for (const loc of pool) {
    if (loc.city.toLowerCase() === normalized) return loc;
  }

  // 2. Input contains city name (e.g., "Houston TX" contains "Houston")
  for (const loc of pool) {
    if (normalized.includes(loc.city.toLowerCase())) return loc;
  }

  // 3. City name contains input (e.g., input "san" matches "San Antonio")
  const partialMatches = pool
    .filter((loc) => loc.city.toLowerCase().includes(normalized))
    .sort((a, b) => a.city.length - b.city.length);
  if (partialMatches.length > 0) return partialMatches[0];

  // 4. Match by state abbreviation (USA only, e.g., "Jacksonville FL")
  if (marketUpper === "USA") {
    // Check for state abbreviation in input
    const stateMatches = pool.filter((loc) => {
      if (!loc.state) return false;
      return normalized.includes(loc.state.toLowerCase());
    });
    if (stateMatches.length > 0) return stateMatches[0];

    // Check for full state name in input (e.g., "florida", "tennessee")
    for (const [stateName, abbr] of Object.entries(US_STATE_NAMES)) {
      if (normalized.includes(stateName)) {
        // Direct match in our dataset
        const directMatch = pool.find((l) => l.state === abbr);
        if (directMatch) return directMatch;
        // Fallback to regional proxy
        const fallbackCity = US_STATE_FALLBACKS[abbr];
        if (fallbackCity) {
          const fallback = pool.find((l) => l.city === fallbackCity);
          if (fallback) return fallback;
        }
      }
    }

    // 5. Try extracting a 2-letter state code from the end of input
    // e.g., "Jacksonville, FL" → "FL", "Memphis TN" → "TN"
    const stateCodeMatch = normalized.match(/\b([a-z]{2})$/);
    if (stateCodeMatch) {
      const code = stateCodeMatch[1].toUpperCase();
      const directMatch = pool.find((l) => l.state === code);
      if (directMatch) return directMatch;
      const fallbackCity = US_STATE_FALLBACKS[code];
      if (fallbackCity) {
        return pool.find((l) => l.city === fallbackCity) ?? null;
      }
    }

    // 6. Try matching comma-separated state (e.g., "Memphis, TN")
    const commaParts = normalized.split(",").map((p) => p.trim());
    if (commaParts.length >= 2) {
      const statePartUpper = commaParts[commaParts.length - 1].toUpperCase().trim();
      const directMatch = pool.find((l) => l.state === statePartUpper);
      if (directMatch) return directMatch;
      const fallbackCity = US_STATE_FALLBACKS[statePartUpper];
      if (fallbackCity) {
        return pool.find((l) => l.city === fallbackCity) ?? null;
      }
      // Check full state name after comma
      const stateAfterComma = commaParts[commaParts.length - 1].trim();
      const abbr = US_STATE_NAMES[stateAfterComma];
      if (abbr) {
        const match = pool.find((l) => l.state === abbr);
        if (match) return match;
        const fb = US_STATE_FALLBACKS[abbr];
        if (fb) return pool.find((l) => l.city === fb) ?? null;
      }
    }
  } else {
    // WA: match by region name
    for (const [regionName, fallbackCity] of Object.entries(WA_REGION_FALLBACKS)) {
      if (normalized.includes(regionName)) {
        return pool.find((l) => l.city === fallbackCity) ?? null;
      }
    }

    // WA: fallback to capital/main city for the country
    const countryDefaults: Record<string, string> = {
      TOGO: "Lome", GHANA: "Accra", BENIN: "Cotonou",
    };
    const defaultCity = countryDefaults[marketUpper];
    if (defaultCity && normalized.length >= 3) {
      return pool.find((l) => l.city === defaultCity) ?? null;
    }
  }

  return null;
}

/**
 * Adjusts a base cost by multiplying it against the location's cost index.
 * A costIndex of 1.0 means national average. 0.85 means 15% below average.
 * 1.35 means 35% above average.
 */
export function adjustCostForLocation(baseCost: number, locationData: LocationData): number {
  return Math.round(baseCost * locationData.costIndex);
}

/**
 * Returns a list of supported city names for autocomplete suggestions,
 * filtered by market.
 */
export function getLocationSuggestions(market: string): string[] {
  const marketUpper = market.toUpperCase();
  if (marketUpper === "USA") {
    return USA_LOCATIONS.map((l) => `${l.city}, ${l.state}`);
  }
  return WA_LOCATIONS
    .filter((l) => l.country.toUpperCase() === marketUpper)
    .map((l) => l.city);
}

/**
 * Returns a human-readable cost comparison string.
 * Example: "12% above the national average" or "15% below the national average"
 */
export function getCostComparisonText(costIndex: number): string {
  if (costIndex === 1.0) return "at the national average";
  const pct = Math.abs(Math.round((costIndex - 1.0) * 100));
  if (costIndex > 1.0) return `${pct}% above the national average`;
  return `${pct}% below the national average`;
}

/**
 * Returns the climate label in a user-friendly format.
 */
export function getClimateLabel(climate: ClimateType): string {
  const labels: Record<ClimateType, string> = {
    "hot-humid": "Hot and humid",
    "hot-dry": "Hot and dry",
    "temperate": "Temperate",
    "cold": "Cold",
    "tropical": "Tropical",
  };
  return labels[climate];
}
