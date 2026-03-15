import type { CostBenchmark } from "../types";

/**
 * USA Residential Construction Cost Benchmarks
 *
 * All costs are expressed per square foot (unit: "sqft") of finished living
 * area unless otherwise noted.  Ranges reflect national averages for 2024-2026
 * and will vary by region, material grade, and labor market conditions.
 *
 * Low  = budget / value-engineered build
 * Mid  = standard / market-rate build
 * High = premium / custom build
 *
 * An empty `propertyTypes` array means the benchmark applies to all property
 * types (SFH, DUPLEX, TRIPLEX, FOURPLEX, APARTMENT).
 */
export const USA_COST_BENCHMARKS: CostBenchmark[] = [
  // ── Site preparation ────────────────────────────────────────────────
  {
    category: "Site Work & Grading",
    unit: "sqft",
    lowRange: 2.5,
    midRange: 4.0,
    highRange: 7.0,
    notes:
      "Clearing, rough grading, soil compaction, and erosion control. " +
      "Costs are higher on sloped or wooded lots that require more " +
      "extensive clearing, tree removal, or retaining walls. Flat, " +
      "previously cleared lots are at the low end.",
    propertyTypes: [],
  },

  // ── Foundation options ──────────────────────────────────────────────
  {
    category: "Foundation",
    subcategory: "Slab-on-Grade",
    unit: "sqft",
    lowRange: 5.0,
    midRange: 7.5,
    highRange: 12.0,
    notes:
      "Monolithic or stem-wall slab with rebar reinforcement and anchor " +
      "bolts. This is the most economical foundation type, common in warm " +
      "climates where frost depth is shallow. Costs increase with thicker " +
      "slabs, post-tension cables, or expansive-soil mitigation.",
    propertyTypes: [],
  },
  {
    category: "Foundation",
    subcategory: "Crawl Space",
    unit: "sqft",
    lowRange: 8.0,
    midRange: 12.0,
    highRange: 18.0,
    notes:
      "Poured concrete or block walls with piers, vapor barrier, and " +
      "ventilation. Provides access to plumbing and HVAC runs under the " +
      "house. Higher costs come from deeper frost footings, encapsulated " +
      "crawl spaces, or difficult soil conditions.",
    propertyTypes: [],
  },
  {
    category: "Foundation",
    subcategory: "Basement",
    unit: "sqft",
    lowRange: 15.0,
    midRange: 22.0,
    highRange: 35.0,
    notes:
      "Full basement with poured walls, waterproofing membrane, perimeter " +
      "drain tile, and sump pump. Common in northern climates where deep " +
      "frost footings are already required. The high end includes " +
      "finished-basement prep, egress windows, and extensive waterproofing " +
      "in high water-table areas.",
    propertyTypes: [],
  },

  // ── Structural ──────────────────────────────────────────────────────
  {
    category: "Framing",
    unit: "sqft",
    lowRange: 12.0,
    midRange: 18.0,
    highRange: 28.0,
    notes:
      "Walls, floor joists or trusses, roof structure, sheathing (OSB or " +
      "plywood), and structural hardware. This is typically the largest " +
      "single line item in a build. Costs vary with lumber prices, " +
      "complexity of the roof design, story count, and engineering " +
      "requirements for wind or seismic zones.",
    propertyTypes: [],
  },

  // ── Building envelope ───────────────────────────────────────────────
  {
    category: "Roofing",
    unit: "sqft",
    lowRange: 3.5,
    midRange: 5.5,
    highRange: 9.0,
    notes:
      "Asphalt shingles (30-year architectural), synthetic underlayment, " +
      "flashing at penetrations and valleys, and ridge vent. Premium " +
      "materials such as standing-seam metal, tile, or slate will push " +
      "costs well above the high range. Complex roof lines with dormers " +
      "or multiple valleys also increase labor.",
    propertyTypes: [],
  },
  {
    category: "Siding & Exterior Trim",
    unit: "sqft",
    lowRange: 4.0,
    midRange: 7.0,
    highRange: 14.0,
    notes:
      "Vinyl siding is at the low end; fiber cement (e.g., HardiePlank) " +
      "is mid-range; brick veneer or stone accents push toward the high " +
      "end. Includes exterior trim boards, soffit, fascia, and house " +
      "wrap. Multi-story homes cost more per square foot due to " +
      "scaffolding and access.",
    propertyTypes: [],
  },
  {
    category: "Windows & Exterior Doors",
    unit: "sqft",
    lowRange: 3.0,
    midRange: 6.0,
    highRange: 12.0,
    notes:
      "Vinyl or aluminum-frame windows with low-E double-pane glass. " +
      "Includes the entry door, garage service door, and sliding or " +
      "French patio doors. Costs depend heavily on window count, size, " +
      "and frame material. Wood-clad or triple-pane windows, and custom " +
      "sizes, drive costs toward the high end.",
    propertyTypes: [],
  },

  // ── Plumbing ────────────────────────────────────────────────────────
  {
    category: "Plumbing",
    subcategory: "Rough-In",
    unit: "sqft",
    lowRange: 4.0,
    midRange: 6.0,
    highRange: 9.0,
    notes:
      "Supply lines (typically PEX), drain-waste-vent piping (PVC or " +
      "ABS), water heater rough connections, and gas piping if applicable. " +
      "Rough-in means all piping installed inside walls and under slabs " +
      "before drywall. More bathrooms, longer runs, and multi-story " +
      "layouts increase cost.",
    propertyTypes: [],
  },
  {
    category: "Plumbing",
    subcategory: "Finish",
    unit: "sqft",
    lowRange: 2.0,
    midRange: 3.5,
    highRange: 6.0,
    notes:
      "Fixtures (toilets, sinks, tubs/showers), faucets, water heater " +
      "installation, garbage disposal, and final connections. Builder-grade " +
      "fixtures keep costs low; designer fixtures, tankless water heaters, " +
      "and high-end shower systems push toward the high range.",
    propertyTypes: [],
  },

  // ── Electrical ──────────────────────────────────────────────────────
  {
    category: "Electrical",
    subcategory: "Rough-In",
    unit: "sqft",
    lowRange: 3.5,
    midRange: 5.5,
    highRange: 8.0,
    notes:
      "Main panel (typically 200A for new construction), branch circuits, " +
      "outlet and switch boxes, low-voltage wiring (data, coax, speaker " +
      "pre-wire), and EV charger circuit if included. Higher circuit " +
      "counts, smart-home pre-wire, and generator transfer switches add " +
      "cost.",
    propertyTypes: [],
  },
  {
    category: "Electrical",
    subcategory: "Finish",
    unit: "sqft",
    lowRange: 1.5,
    midRange: 2.5,
    highRange: 4.0,
    notes:
      "Devices (outlets, switches, dimmers), light fixtures, trim " +
      "plates, and smart switches or home automation controllers. " +
      "Builder-grade devices and basic fixtures are at the low end; " +
      "designer fixtures, whole-home automation, and under-cabinet " +
      "lighting push costs higher.",
    propertyTypes: [],
  },

  // ── HVAC ────────────────────────────────────────────────────────────
  {
    category: "HVAC",
    unit: "sqft",
    lowRange: 6.0,
    midRange: 9.0,
    highRange: 15.0,
    notes:
      "Furnace or heat pump, AC condenser, ductwork, registers, and " +
      "thermostat. A standard single-zone forced-air system is at the " +
      "low end. Geothermal, multi-zone mini-splits, or dual-fuel " +
      "systems with zoned ductwork approach the high end. Energy code " +
      "requirements (SEER2 ratings, Manual J calculations) are " +
      "tightening nationally.",
    propertyTypes: [],
  },

  // ── Interior finishes ──────────────────────────────────────────────
  {
    category: "Insulation",
    unit: "sqft",
    lowRange: 2.0,
    midRange: 3.0,
    highRange: 5.0,
    notes:
      "Fiberglass batt in walls, blown fiberglass or cellulose in the " +
      "attic. Open-cell or closed-cell spray foam is at the higher end " +
      "and is increasingly required by energy codes in certain climate " +
      "zones. Costs depend on R-value targets and local code minimums.",
    propertyTypes: [],
  },
  {
    category: "Drywall",
    unit: "sqft",
    lowRange: 3.0,
    midRange: 4.5,
    highRange: 7.0,
    notes:
      "Hang, tape, mud, and finish. Includes standard 1/2-inch drywall " +
      "on walls and 5/8-inch on ceilings (code-required for fire rating " +
      "in garages). Smooth (Level 5) finish costs more than standard " +
      "orange-peel or knockdown texture. High ceilings and complex " +
      "layouts with many corners increase labor.",
    propertyTypes: [],
  },
  {
    category: "Interior Trim & Doors",
    unit: "sqft",
    lowRange: 2.5,
    midRange: 4.0,
    highRange: 8.0,
    notes:
      "Baseboards, door and window casings, crown molding, and interior " +
      "doors (hollow-core to solid-core). MDF trim with paint-grade " +
      "finish is budget-friendly; stain-grade hardwood trim, wainscoting, " +
      "and custom built-ins push costs higher.",
    propertyTypes: [],
  },
  {
    category: "Flooring",
    unit: "sqft",
    lowRange: 3.0,
    midRange: 6.0,
    highRange: 12.0,
    notes:
      "Luxury vinyl plank (LVP) is the most common budget option; " +
      "ceramic or porcelain tile for bathrooms and entries is mid-range; " +
      "engineered or solid hardwood floors are at the high end. " +
      "Costs vary significantly by material choice and room-by-room " +
      "mix. Includes underlayment, transitions, and installation labor.",
    propertyTypes: [],
  },
  {
    category: "Painting",
    subcategory: "Interior",
    unit: "sqft",
    lowRange: 2.0,
    midRange: 3.0,
    highRange: 5.0,
    notes:
      "Walls, ceilings, and trim, typically two coats plus primer. " +
      "Builder-grade single-color schemes are at the low end; multiple " +
      "accent colors, high ceilings requiring lifts, and premium paints " +
      "(low-VOC, washable) increase cost. Trim painting (especially " +
      "stain-grade) is labor-intensive.",
    propertyTypes: [],
  },
  {
    category: "Painting",
    subcategory: "Exterior",
    unit: "sqft",
    lowRange: 1.0,
    midRange: 2.0,
    highRange: 3.5,
    notes:
      "Applicable when siding material requires paint (wood, fiber " +
      "cement, stucco). Pre-finished siding like vinyl does not need " +
      "painting. Includes prep, primer, and two coats of exterior-grade " +
      "paint. Multi-story homes and extensive trim detail increase " +
      "labor costs.",
    propertyTypes: [],
  },

  // ── Kitchen & bath ─────────────────────────────────────────────────
  {
    category: "Cabinets & Countertops",
    unit: "sqft",
    lowRange: 5.0,
    midRange: 10.0,
    highRange: 25.0,
    notes:
      "Kitchen and bathroom cabinets plus countertops. Stock cabinets " +
      "with laminate countertops are at the low end; semi-custom cabinets " +
      "with quartz or granite are mid-range; fully custom cabinetry with " +
      "premium stone or butcher block is at the high end. This category " +
      "is one of the widest cost ranges in residential construction.",
    propertyTypes: [],
  },
  {
    category: "Appliances",
    unit: "sqft",
    lowRange: 1.5,
    midRange: 3.0,
    highRange: 6.0,
    notes:
      "Standard builder package: range/oven, refrigerator, dishwasher, " +
      "microwave, and washer/dryer hookups or units. Budget brands at " +
      "the low end; name-brand stainless steel mid-range; professional " +
      "or panel-ready appliances at the high end. Washer/dryer units " +
      "included in estimate.",
    propertyTypes: [],
  },

  // ── Exterior & site finish ─────────────────────────────────────────
  {
    category: "Landscaping",
    unit: "sqft",
    lowRange: 2.0,
    midRange: 4.0,
    highRange: 8.0,
    notes:
      "Final grading, topsoil, sod or seed, basic irrigation system, " +
      "and foundation plantings. Costs depend heavily on lot size and " +
      "local requirements (many jurisdictions require minimum " +
      "landscaping). Hardscaping (patios, retaining walls) and mature " +
      "tree planting push toward the high end.",
    propertyTypes: [],
  },
  {
    category: "Driveway & Walkways",
    unit: "sqft",
    lowRange: 1.5,
    midRange: 3.0,
    highRange: 6.0,
    notes:
      "Concrete, asphalt, or pavers for the driveway and front walkway. " +
      "A basic concrete driveway is at the low end; stamped or colored " +
      "concrete is mid-range; natural stone or permeable pavers are at " +
      "the high end. Driveway length and local frost-depth requirements " +
      "for sub-base affect cost.",
    propertyTypes: [],
  },
  {
    category: "Gutters & Downspouts",
    unit: "sqft",
    lowRange: 0.75,
    midRange: 1.25,
    highRange: 2.0,
    notes:
      "Seamless aluminum gutters, professionally installed, with " +
      "downspouts and splash blocks or underground drainage ties. " +
      "Copper gutters or half-round profiles are at the premium end. " +
      "Gutter guards add to cost but reduce maintenance. Linear footage " +
      "of roof edge drives the total.",
    propertyTypes: [],
  },

  // ── Soft costs ─────────────────────────────────────────────────────
  {
    category: "Permits & Impact Fees",
    unit: "sqft",
    lowRange: 2.0,
    midRange: 4.0,
    highRange: 8.0,
    notes:
      "Building permit, plan review fees, utility tap/connection fees, " +
      "and impact fees (schools, roads, parks). These are set by local " +
      "government and vary dramatically by jurisdiction. Rural areas " +
      "tend to be lower; high-growth suburban areas with impact fees can " +
      "be very expensive. Always verify with your local building " +
      "department before budgeting.",
    propertyTypes: [],
  },
  {
    category: "Architecture & Engineering",
    unit: "sqft",
    lowRange: 3.0,
    midRange: 5.0,
    highRange: 10.0,
    notes:
      "Architectural plans, structural engineering, land survey, soil/ " +
      "geotechnical report, and energy calculations (Manual J, Title 24, " +
      "or local equivalent). Stock plans with minor modifications are at " +
      "the low end; fully custom architectural design with 3D renderings " +
      "and interior design is at the high end. Most jurisdictions require " +
      "stamped structural engineering drawings.",
    propertyTypes: [],
  },
];
