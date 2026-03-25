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

  // 0. ZIP code matching (USA only) — map ZIP prefix to state, then find best city
  if (marketUpper === "USA" && /^\d{5}(-\d{4})?$/.test(normalized)) {
    const zip3 = normalized.slice(0, 3);
    const ZIP_PREFIX_TO_STATE: Record<string, string> = {
      "006": "PR", "007": "PR", "008": "PR", "009": "PR",
      "010": "MA", "011": "MA", "012": "MA", "013": "MA", "014": "MA",
      "015": "MA", "016": "MA", "017": "MA", "018": "MA", "019": "MA",
      "020": "MA", "021": "MA", "022": "MA", "023": "MA", "024": "MA",
      "025": "MA", "026": "MA", "027": "MA",
      "028": "RI", "029": "RI",
      "030": "NH", "031": "NH", "032": "NH", "033": "NH", "034": "NH",
      "035": "VT", "036": "VT", "037": "VT", "038": "VT",
      "039": "ME", "040": "ME", "041": "ME", "042": "ME", "043": "ME", "044": "ME", "045": "ME", "046": "ME", "047": "ME", "048": "ME", "049": "ME",
      "050": "VT", "051": "VT", "052": "VT", "053": "VT", "054": "VT", "056": "VT", "057": "VT", "058": "VT", "059": "VT",
      "060": "CT", "061": "CT", "062": "CT", "063": "CT", "064": "CT", "065": "CT", "066": "CT", "067": "CT", "068": "CT", "069": "CT",
      "070": "NJ", "071": "NJ", "072": "NJ", "073": "NJ", "074": "NJ", "075": "NJ", "076": "NJ", "077": "NJ", "078": "NJ", "079": "NJ",
      "080": "NJ", "081": "NJ", "082": "NJ", "083": "NJ", "084": "NJ", "085": "NJ", "086": "NJ", "087": "NJ", "088": "NJ", "089": "NJ",
      "100": "NY", "101": "NY", "102": "NY", "103": "NY", "104": "NY", "105": "NY", "106": "NY", "107": "NY", "108": "NY", "109": "NY",
      "110": "NY", "111": "NY", "112": "NY", "113": "NY", "114": "NY", "115": "NY", "116": "NY", "117": "NY", "118": "NY", "119": "NY",
      "120": "NY", "121": "NY", "122": "NY", "123": "NY", "124": "NY", "125": "NY", "126": "NY", "127": "NY", "128": "NY", "129": "NY",
      "130": "NY", "131": "NY", "132": "NY", "133": "NY", "134": "NY", "135": "NY", "136": "NY", "137": "NY", "138": "NY", "139": "NY",
      "140": "NY", "141": "NY", "142": "NY", "143": "NY", "144": "NY", "145": "NY", "146": "NY", "147": "NY", "148": "NY", "149": "NY",
      "150": "PA", "151": "PA", "152": "PA", "153": "PA", "154": "PA", "155": "PA", "156": "PA", "157": "PA", "158": "PA", "159": "PA",
      "160": "PA", "161": "PA", "162": "PA", "163": "PA", "164": "PA", "165": "PA", "166": "PA", "167": "PA", "168": "PA", "169": "PA",
      "170": "PA", "171": "PA", "172": "PA", "173": "PA", "174": "PA", "175": "PA", "176": "PA", "177": "PA", "178": "PA", "179": "PA",
      "180": "PA", "181": "PA", "182": "PA", "183": "PA", "184": "PA", "185": "PA", "186": "PA", "187": "PA", "188": "PA", "189": "PA",
      "190": "PA", "191": "PA", "192": "PA", "193": "PA", "194": "PA", "195": "PA", "196": "PA",
      "197": "DE", "198": "DE", "199": "DE",
      "200": "DC", "201": "MD", "202": "DC", "203": "DC", "204": "DC", "205": "DC",
      "206": "MD", "207": "MD", "208": "MD", "209": "MD", "210": "MD", "211": "MD", "212": "MD",
      "214": "MD", "215": "MD", "216": "MD", "217": "MD", "218": "MD", "219": "MD",
      "220": "VA", "221": "VA", "222": "VA", "223": "VA", "224": "VA", "225": "VA", "226": "VA", "227": "VA", "228": "VA", "229": "VA",
      "230": "VA", "231": "VA", "232": "VA", "233": "VA", "234": "VA", "235": "VA", "236": "VA", "237": "VA", "238": "VA", "239": "VA",
      "240": "VA", "241": "VA", "242": "VA", "243": "VA", "244": "VA", "245": "VA", "246": "WV",
      "247": "WV", "248": "WV", "249": "WV", "250": "WV", "251": "WV", "252": "WV", "253": "WV", "254": "WV", "255": "WV", "256": "WV", "257": "WV", "258": "WV", "259": "WV", "260": "WV", "261": "WV", "262": "WV", "263": "WV", "264": "WV", "265": "WV", "266": "WV", "267": "WV", "268": "WV",
      "270": "NC", "271": "NC", "272": "NC", "273": "NC", "274": "NC", "275": "NC", "276": "NC", "277": "NC", "278": "NC", "279": "NC",
      "280": "NC", "281": "NC", "282": "NC", "283": "NC", "284": "NC", "285": "NC", "286": "NC", "287": "NC", "288": "NC", "289": "NC",
      "290": "SC", "291": "SC", "292": "SC", "293": "SC", "294": "SC", "295": "SC", "296": "SC", "297": "SC", "298": "SC", "299": "SC",
      "300": "GA", "301": "GA", "302": "GA", "303": "GA", "304": "GA", "305": "FL", "306": "FL",
      "307": "FL", "308": "GA", "309": "GA", "310": "GA", "311": "GA", "312": "GA", "313": "GA", "314": "GA", "315": "GA", "316": "GA", "317": "GA", "318": "GA", "319": "GA",
      "320": "FL", "321": "FL", "322": "FL", "323": "FL", "324": "FL", "325": "FL", "326": "FL", "327": "FL", "328": "FL", "329": "FL",
      "330": "FL", "331": "FL", "332": "FL", "333": "FL", "334": "FL", "335": "FL", "336": "FL", "337": "FL", "338": "FL", "339": "FL",
      "340": "FL",
      "350": "AL", "351": "AL", "352": "AL", "354": "AL", "355": "AL", "356": "AL", "357": "AL", "358": "AL", "359": "AL",
      "360": "AL", "361": "AL", "362": "AL", "363": "AL", "364": "AL", "365": "AL", "366": "AL", "367": "AL", "368": "AL", "369": "AL",
      "370": "TN", "371": "TN", "372": "TN", "373": "TN", "374": "TN", "375": "TN", "376": "TN", "377": "TN", "378": "TN", "379": "TN",
      "380": "TN", "381": "TN", "382": "TN", "383": "TN", "384": "TN", "385": "TN",
      "386": "MS", "387": "MS", "388": "MS", "389": "MS", "390": "MS", "391": "MS", "392": "MS", "393": "MS", "394": "MS", "395": "MS", "396": "MS", "397": "MS",
      "400": "KY", "401": "KY", "402": "KY", "403": "KY", "404": "KY", "405": "KY", "406": "KY", "407": "KY", "408": "KY", "409": "KY",
      "410": "KY", "411": "KY", "412": "KY", "413": "KY", "414": "KY", "415": "KY", "416": "KY", "417": "KY", "418": "KY",
      "430": "OH", "431": "OH", "432": "OH", "433": "OH", "434": "OH", "435": "OH", "436": "OH", "437": "OH", "438": "OH", "439": "OH",
      "440": "OH", "441": "OH", "442": "OH", "443": "OH", "444": "OH", "445": "OH", "446": "OH", "447": "OH", "448": "OH", "449": "OH",
      "450": "OH", "451": "OH", "452": "OH", "453": "OH", "454": "OH", "455": "OH", "456": "OH", "457": "OH", "458": "OH",
      "460": "IN", "461": "IN", "462": "IN", "463": "IN", "464": "IN", "465": "IN", "466": "IN", "467": "IN", "468": "IN", "469": "IN",
      "470": "IN", "471": "IN", "472": "IN", "473": "IN", "474": "IN", "475": "IN", "476": "IN", "477": "IN", "478": "IN", "479": "IN",
      "480": "MI", "481": "MI", "482": "MI", "483": "MI", "484": "MI", "485": "MI", "486": "MI", "487": "MI", "488": "MI", "489": "MI",
      "490": "MI", "491": "MI", "492": "MI", "493": "MI", "494": "MI", "495": "MI", "496": "MI", "497": "MI", "498": "MI", "499": "MI",
      "500": "IA", "501": "IA", "502": "IA", "503": "IA", "504": "IA", "505": "IA", "506": "IA", "507": "IA", "508": "IA", "509": "IA",
      "510": "IA", "511": "IA", "512": "IA", "513": "IA", "514": "IA", "515": "IA", "516": "IA", "520": "IA", "521": "IA", "522": "IA", "523": "IA", "524": "IA", "525": "IA", "526": "IA", "527": "IA", "528": "IA",
      "530": "WI", "531": "WI", "532": "WI", "534": "WI", "535": "WI", "537": "WI", "538": "WI", "539": "WI",
      "540": "MN", "541": "MN", "543": "MN", "544": "MN", "545": "MN", "546": "MN", "547": "MN", "548": "MN", "549": "MN",
      "550": "MN", "551": "MN", "553": "MN", "554": "MN", "555": "MN", "556": "MN", "557": "MN", "558": "MN", "559": "MN",
      "560": "SD", "561": "SD", "562": "SD", "563": "SD", "564": "SD", "565": "SD", "566": "SD", "567": "SD",
      "570": "SD", "571": "SD", "572": "SD", "573": "SD", "574": "SD", "575": "SD", "576": "SD", "577": "SD",
      "580": "ND", "581": "ND", "582": "ND", "583": "ND", "584": "ND", "585": "ND", "586": "ND", "587": "ND", "588": "ND",
      "590": "MT", "591": "MT", "592": "MT", "593": "MT", "594": "MT", "595": "MT", "596": "MT", "597": "MT", "598": "MT", "599": "MT",
      "600": "IL", "601": "IL", "602": "IL", "603": "IL", "604": "IL", "605": "IL", "606": "IL", "607": "IL", "608": "IL", "609": "IL",
      "610": "IL", "611": "IL", "612": "IL", "613": "IL", "614": "IL", "615": "IL", "616": "IL", "617": "IL", "618": "IL", "619": "IL",
      "620": "IL", "622": "IL", "623": "IL", "624": "IL", "625": "IL", "626": "IL", "627": "IL", "628": "IL", "629": "IL",
      "630": "MO", "631": "MO", "633": "MO", "634": "MO", "635": "MO", "636": "MO", "637": "MO", "638": "MO", "639": "MO",
      "640": "KS", "641": "KS", "644": "KS", "645": "KS", "646": "KS", "647": "KS", "648": "KS", "649": "KS",
      "650": "MO", "651": "MO", "652": "MO", "653": "MO", "654": "MO", "655": "MO", "656": "MO", "657": "MO", "658": "MO",
      "660": "KS", "661": "KS", "662": "KS", "664": "KS", "665": "KS", "666": "KS", "667": "KS", "668": "KS", "669": "KS", "670": "KS", "671": "KS", "672": "KS", "673": "KS",
      "680": "NE", "681": "NE", "683": "NE", "684": "NE", "685": "NE", "686": "NE", "687": "NE", "688": "NE", "689": "NE", "690": "NE", "691": "NE", "692": "NE", "693": "NE",
      "700": "LA", "701": "LA", "703": "LA", "704": "LA", "705": "LA", "706": "LA", "707": "LA", "708": "LA", "710": "LA", "711": "LA", "712": "LA", "713": "LA", "714": "LA",
      "716": "AR", "717": "AR", "718": "AR", "719": "AR", "720": "AR", "721": "AR", "722": "AR", "723": "AR", "724": "AR", "725": "AR", "726": "AR", "727": "AR", "728": "AR", "729": "AR",
      "730": "OK", "731": "OK", "734": "OK", "735": "OK", "736": "OK", "737": "OK", "738": "OK", "739": "OK", "740": "OK", "741": "OK", "743": "OK", "744": "OK", "745": "OK", "746": "OK", "747": "OK", "748": "OK", "749": "OK",
      "750": "TX", "751": "TX", "752": "TX", "753": "TX", "754": "TX", "755": "TX", "756": "TX", "757": "TX", "758": "TX", "759": "TX",
      "760": "TX", "761": "TX", "762": "TX", "763": "TX", "764": "TX", "765": "TX", "766": "TX", "767": "TX", "768": "TX", "769": "TX",
      "770": "TX", "771": "TX", "772": "TX", "773": "TX", "774": "TX", "775": "TX", "776": "TX", "777": "TX", "778": "TX", "779": "TX",
      "780": "TX", "781": "TX", "782": "TX", "783": "TX", "784": "TX", "785": "TX", "786": "TX", "787": "TX", "788": "TX", "789": "TX",
      "790": "TX", "791": "TX", "792": "TX", "793": "TX", "794": "TX", "795": "TX", "796": "TX", "797": "TX", "798": "TX", "799": "TX",
      "800": "CO", "801": "CO", "802": "CO", "803": "CO", "804": "CO", "805": "CO", "806": "CO", "807": "CO", "808": "CO", "809": "CO",
      "810": "CO", "811": "CO", "812": "CO", "813": "CO", "814": "CO", "815": "CO", "816": "CO",
      "820": "WY", "821": "WY", "822": "WY", "823": "WY", "824": "WY", "825": "WY", "826": "WY", "827": "WY", "828": "WY", "829": "WY", "830": "WY", "831": "WY",
      "832": "ID", "833": "ID", "834": "ID", "835": "ID", "836": "ID", "837": "ID", "838": "ID",
      "840": "UT", "841": "UT", "842": "UT", "843": "UT", "844": "UT", "845": "UT", "846": "UT", "847": "UT",
      "850": "AZ", "851": "AZ", "852": "AZ", "853": "AZ", "855": "AZ", "856": "AZ", "857": "AZ",
      "859": "AZ", "860": "AZ",
      "863": "NM", "864": "NM", "865": "NM", "870": "NM", "871": "NM", "872": "NM", "873": "NM", "874": "NM", "875": "NM", "877": "NM", "878": "NM", "879": "NM",
      "880": "TX", "881": "TX", "882": "TX", "883": "TX", "884": "TX", "885": "TX",
      "889": "NV", "890": "NV", "891": "NV", "893": "NV", "894": "NV", "895": "NV", "896": "NV", "897": "NV", "898": "NV",
      "900": "CA", "901": "CA", "902": "CA", "903": "CA", "904": "CA", "905": "CA", "906": "CA", "907": "CA", "908": "CA", "910": "CA", "911": "CA", "912": "CA", "913": "CA", "914": "CA", "915": "CA", "916": "CA", "917": "CA", "918": "CA",
      "919": "CA", "920": "CA", "921": "CA", "922": "CA", "923": "CA", "924": "CA", "925": "CA", "926": "CA", "927": "CA", "928": "CA",
      "930": "CA", "931": "CA", "932": "CA", "933": "CA", "934": "CA", "935": "CA", "936": "CA", "937": "CA", "938": "CA", "939": "CA",
      "940": "CA", "941": "CA", "942": "CA", "943": "CA", "944": "CA", "945": "CA", "946": "CA", "947": "CA", "948": "CA", "949": "CA",
      "950": "CA", "951": "CA", "952": "CA", "953": "CA", "954": "CA", "955": "CA", "956": "CA", "957": "CA", "958": "CA", "959": "CA",
      "960": "CA", "961": "CA",
      "967": "HI", "968": "HI",
      "970": "OR", "971": "OR", "972": "OR", "973": "OR", "974": "OR", "975": "OR", "976": "OR", "977": "OR", "978": "OR", "979": "OR",
      "980": "WA", "981": "WA", "982": "WA", "983": "WA", "984": "WA", "985": "WA", "986": "WA",
      "988": "WA", "989": "WA", "990": "WA", "991": "WA", "992": "WA", "993": "WA", "994": "WA",
      "995": "AK", "996": "AK", "997": "AK", "998": "AK", "999": "AK",
    };
    // Also check 2-digit prefix for broader coverage
    const zip2 = normalized.slice(0, 2);
    const state = ZIP_PREFIX_TO_STATE[zip3] ?? ZIP_PREFIX_TO_STATE[zip2 + "0"];
    if (state) {
      // Find the best location in that state
      const stateLocations = pool.filter((l) => l.state === state);
      if (stateLocations.length > 0) return stateLocations[0];
      // Fallback to state fallback mapping
      const fallbackCity = US_STATE_FALLBACKS[state];
      if (fallbackCity) {
        const fallback = pool.find((l) => l.city === fallbackCity);
        if (fallback) return fallback;
      }
    }
  }

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
