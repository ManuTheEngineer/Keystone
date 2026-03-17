import type { CostBenchmark } from "../types";

/**
 * Ghana Residential Construction Cost Benchmarks
 *
 * All costs are expressed in Ghana Cedis (GHS) per square meter of built area
 * unless the unit is "lump" (fixed cost regardless of size).
 *
 * Low  = basic / budget build (simple finishes, local materials)
 * Mid  = standard build (decent finishes, mixed materials)
 * High = premium / luxury build (imported finishes, architect-designed)
 *
 * An empty `propertyTypes` array means the benchmark applies to all property
 * types (SFH, DUPLEX, TRIPLEX, FOURPLEX, APARTMENT).
 *
 * Prices reflect Greater Accra and surrounding areas as of 2025-2026.
 * Costs in northern regions (Tamale, Bolgatanga) may be 10-20% lower for
 * labor but higher for materials due to transport. Kumasi and Ashanti
 * region costs are typically 5-10% below Accra.
 */
export const GHANA_COST_BENCHMARKS: CostBenchmark[] = [
  // -- 1. Earthwork / Site Preparation ------------------------------------
  {
    category: "Earthwork",
    subcategory: "Site preparation",
    unit: "sqm",
    lowRange: 60,
    midRange: 100,
    highRange: 180,
    notes:
      "Clearing, leveling, and compaction for the building footprint. " +
      "Costs depend on vegetation density, soil type, and whether the " +
      "terrain is flat or sloped. In Accra coastal areas, sandy soil " +
      "is easier to work but may require imported laterite fill for " +
      "compaction. In the Ashanti region, dense tropical vegetation " +
      "increases clearing costs. Always verify plot boundaries with " +
      "a licensed surveyor before starting earthwork.",
    propertyTypes: [],
  },

  // -- 2. Foundation -------------------------------------------------------
  {
    category: "Foundation",
    subcategory: "Foundation",
    unit: "sqm",
    lowRange: 300,
    midRange: 480,
    highRange: 780,
    notes:
      "Strip or pad foundation with reinforced concrete. Includes " +
      "excavation of trenches, rebar cage, formwork, and concrete " +
      "pour. Foundation depth depends on soil bearing capacity — " +
      "typically 80cm to 1.2m in Greater Accra. Laterite soils in " +
      "the Ashanti and northern regions may need deeper footings. " +
      "In Accra's Weija, Kasoa, and Tema areas, the water table " +
      "can be high, requiring dewatering during excavation. Always " +
      "have the structural engineer or architect verify trench depth " +
      "before pouring. Rebar must be inspected before concrete is " +
      "placed — this is the most critical quality checkpoint.",
    propertyTypes: [],
  },

  // -- 3. Sub-base walls ---------------------------------------------------
  {
    category: "Sub-base walls",
    subcategory: "Sub-base / stem walls",
    unit: "sqm",
    lowRange: 180,
    midRange: 300,
    highRange: 480,
    notes:
      "Below-ground walls from top of foundation to ground level. " +
      "Built with concrete blocks (6-inch or 8-inch) and mortar, " +
      "then backfilled and compacted. The sub-base raises the " +
      "structure above ground to protect against flooding and " +
      "moisture. In flood-prone areas of Accra (Kaneshie, Odawna, " +
      "parts of Madina), building the sub-base higher (60-80cm " +
      "above natural ground) is strongly recommended. Waterproofing " +
      "the exterior face with bituminous coating prevents long-term " +
      "moisture damage.",
    propertyTypes: [],
  },

  // -- 4. Walls -------------------------------------------------------------
  {
    category: "Walls",
    subcategory: "Block walls",
    unit: "sqm",
    lowRange: 240,
    midRange: 420,
    highRange: 660,
    notes:
      "Sandcrete block walls (6-inch for partitions, 8-inch for " +
      "exterior load-bearing walls) laid with cement mortar. Blocks " +
      "are infill between the column-beam structural frame. Quality " +
      "of sandcrete blocks varies enormously — factory-vibrated " +
      "blocks from reputable manufacturers (Regimanuel, B5 Plus, " +
      "Multico) are stronger than hand-molded ones from roadside " +
      "block factories. Always test block quality: a good block " +
      "should not crumble when dropped from chest height. The Ghana " +
      "Standards Authority (GSA) sets standards for sandcrete blocks " +
      "but enforcement is limited.",
    propertyTypes: [],
  },

  // -- 5. Columns and beams ------------------------------------------------
  {
    category: "Columns and beams",
    subcategory: "Structural frame",
    unit: "sqm",
    lowRange: 220,
    midRange: 360,
    highRange: 600,
    notes:
      "Reinforced concrete structural frame — columns and beams " +
      "forming the skeleton of the building. Columns are typically " +
      "225x225mm or 300x300mm with 4 to 6 vertical rebar (Y10 or " +
      "Y12), tied with stirrups every 150-200mm. Beams span between " +
      "columns to support the slab above. This is the column-beam " +
      "system used throughout Ghana and West Africa. The rebar " +
      "quality (high-yield steel from Sentuo Steel, B5 Plus, or " +
      "imported Turkish steel) and concrete mix ratio (typically " +
      "1:2:4 or Grade 25 for structural elements) are critical for " +
      "structural integrity.",
    propertyTypes: [],
  },

  // -- 6. Ring beams -------------------------------------------------------
  {
    category: "Ring beams",
    subcategory: "Ring beams / lintels",
    unit: "sqm",
    lowRange: 100,
    midRange: 180,
    highRange: 300,
    notes:
      "Horizontal reinforced concrete bands that tie walls together " +
      "at lintel level and at the top of walls. Ring beams prevent " +
      "walls from separating and distribute loads evenly. They are " +
      "poured after block walls reach the required height. A building " +
      "without proper ring beams is vulnerable to cracking and " +
      "structural failure. The bottom ring beam sits on top of the " +
      "sub-base, and the top ring beam runs along all walls before " +
      "the roof structure is installed.",
    propertyTypes: [],
  },

  // -- 7. Floor slab -------------------------------------------------------
  {
    category: "Floor slab",
    subcategory: "Concrete slab",
    unit: "sqm",
    lowRange: 240,
    midRange: 420,
    highRange: 660,
    notes:
      "Reinforced concrete slab, either at ground level or as an " +
      "upper floor. Upper-floor slabs often use the hollow-pot " +
      "(hourdis) system — hollow clay or polystyrene blocks placed " +
      "between concrete ribs, then topped with a thin concrete " +
      "layer. Hollow-pot slabs are lighter and use less concrete " +
      "than full solid slabs. The ground-floor slab is poured over " +
      "compacted fill with a polythene moisture barrier. Slab rebar " +
      "must be inspected before pouring — once concrete sets, there " +
      "is no way to fix errors. Plan concrete deliveries for early " +
      "morning to avoid midday heat which causes premature setting.",
    propertyTypes: [],
  },

  // -- 8. Roof structure ---------------------------------------------------
  {
    category: "Roof structure",
    subcategory: "Roof framing",
    unit: "sqm",
    lowRange: 150,
    midRange: 240,
    highRange: 420,
    notes:
      "Wood or steel trusses and rafters forming the roof framework. " +
      "Traditional wood roof framing uses wawa, odum, or mahogany, " +
      "but these are increasingly expensive due to deforestation " +
      "restrictions. Steel (metallic) roof framing is becoming more " +
      "common — it is termite-proof and lighter but requires a " +
      "skilled welder for assembly. Roof pitch should allow good " +
      "water runoff during the heavy rains of the wet season " +
      "(April-July and September-October). Budget for anti-termite " +
      "treatment if using wood.",
    propertyTypes: [],
  },

  // -- 9. Roofing sheets ---------------------------------------------------
  {
    category: "Roofing sheets",
    subcategory: "Roof covering",
    unit: "sqm",
    lowRange: 100,
    midRange: 180,
    highRange: 300,
    notes:
      "Aluminum roofing sheets (aluzinc or aluminum step-tile) or " +
      "galvanized steel roofing sheets. Aluminum roofing is lighter, " +
      "does not rust, and reflects more heat, making it preferred " +
      "for comfort. Galvanized steel is cheaper but heats up more " +
      "and will rust over time. Step-tile profile aluminum roofing " +
      "is very popular in Ghana for its aesthetic appeal. Sheets " +
      "are fixed to the roof framing with roofing screws and rubber " +
      "washers. Include ridge cap and valley flashings. Consider " +
      "ceiling insulation to reduce heat transfer.",
    propertyTypes: [],
  },

  // -- 10. Plastering ------------------------------------------------------
  {
    category: "Plastering",
    subcategory: "Rendering",
    unit: "sqm",
    lowRange: 60,
    midRange: 100,
    highRange: 180,
    notes:
      "Cement render applied to interior and exterior walls. " +
      "Typically two coats: a rough base coat and a smooth finishing " +
      "coat. Exterior rendering protects blocks from rain erosion " +
      "and gives a clean appearance. Interior rendering provides a " +
      "smooth surface for painting. Quality depends on correct " +
      "sand-to-cement ratio and proper curing — walls must be kept " +
      "wet for several days after application to prevent cracking. " +
      "Some builders skip exterior rendering to save money, but " +
      "exposed sandcrete blocks deteriorate quickly in Ghana's " +
      "tropical climate.",
    propertyTypes: [],
  },

  // -- 11. Tiling ----------------------------------------------------------
  {
    category: "Tiling",
    subcategory: "Floor and wall tiles",
    unit: "sqm",
    lowRange: 100,
    midRange: 180,
    highRange: 360,
    notes:
      "Floor and wall tiles. Locally manufactured tiles from " +
      "Twyford (Ghana), Keda Ceramics, and other local factories " +
      "are most affordable. Chinese imports are mid-range; European " +
      "or premium tiles (porcelain, large format) are high-end. " +
      "Price per square meter includes tile, cement adhesive, grout, " +
      "and labor. The tiler's skill matters enormously — poor tile " +
      "work with uneven joints and lippage is very visible and " +
      "expensive to redo. Always buy 10-15% extra tiles for cuts, " +
      "breakage, and future repairs.",
    propertyTypes: [],
  },

  // -- 12. Plumbing --------------------------------------------------------
  {
    category: "Plumbing",
    subcategory: "Water supply and drainage",
    unit: "sqm",
    lowRange: 120,
    midRange: 220,
    highRange: 360,
    notes:
      "PVC supply and drainage pipes, fixtures, water tank " +
      "connection, and sanitary ware (WC, basin, shower). Ghana " +
      "Water Company Limited (GWCL) supply is unreliable in many " +
      "areas, so most homes include a polytank (polyethylene water " +
      "storage tank) on a steel stand or at ground level with an " +
      "electric pump. PVC pipes are standard — avoid galvanized " +
      "steel pipes which corrode in the humid climate. Drainage " +
      "connects to the septic tank or in some parts of Accra to " +
      "the municipal sewer. Budget for at least a 1,000-liter " +
      "polytank for areas with irregular GWCL supply.",
    propertyTypes: [],
  },

  // -- 13. Electrical ------------------------------------------------------
  {
    category: "Electrical",
    subcategory: "Wiring and fittings",
    unit: "sqm",
    lowRange: 100,
    midRange: 180,
    highRange: 300,
    notes:
      "Wiring, switches, outlets, and distribution board (DB box). " +
      "The electrical system connects to the Electricity Company " +
      "of Ghana (ECG) or Northern Electricity Distribution Company " +
      "(NEDCo) grid via a meter. Power outages (dumsor) have been " +
      "historically common, so many homeowners install a generator " +
      "changeover switch or an inverter with battery backup. Wiring " +
      "should be run in conduit embedded in walls before plastering. " +
      "Use a qualified electrician — faulty wiring is a fire hazard. " +
      "A proper earth connection is essential but often skipped by " +
      "budget electricians. The Energy Commission regulates " +
      "electrical standards.",
    propertyTypes: [],
  },

  // -- 14. Doors and windows -----------------------------------------------
  {
    category: "Doors and windows",
    subcategory: "Joinery",
    unit: "sqm",
    lowRange: 150,
    midRange: 260,
    highRange: 480,
    notes:
      "Doors, windows, and built-in elements. Options include wood " +
      "(mahogany, odum, or wawa), aluminum, or steel. Aluminum " +
      "sliding windows are increasingly popular for their low " +
      "maintenance and modern appearance. Wood doors are traditional " +
      "and can be beautifully carved but require treatment against " +
      "termites and humidity. Steel doors and burglar-proof window " +
      "bars provide security — essential in most neighborhoods. " +
      "Factory-made aluminum systems (from Aluworks or Chinese " +
      "imports) are faster to install. Custom carpentry is done " +
      "by a fitter or carpenter working from the architect's plans.",
    propertyTypes: [],
  },

  // -- 15. Painting --------------------------------------------------------
  {
    category: "Painting",
    subcategory: "Interior and exterior paint",
    unit: "sqm",
    lowRange: 36,
    midRange: 72,
    highRange: 144,
    notes:
      "Interior and exterior painting. Exterior walls need " +
      "weather-resistant paint (textured or smooth masonry paint) " +
      "that can withstand heavy rains and intense sun. Interior " +
      "walls use emulsion (water-based) or gloss (oil-based) " +
      "paint. Two coats minimum over an undercoat/primer are " +
      "recommended. Local paint brands include Colormaster, Azar, " +
      "and Paintchem; international brands like Dulux and Berger " +
      "are also available. Painting is one of the last trades and " +
      "is often where budget overruns become visible.",
    propertyTypes: [],
  },

  // -- 16. Perimeter wall --------------------------------------------------
  {
    category: "Perimeter wall",
    subcategory: "Compound wall and gate",
    unit: "lump",
    lowRange: 8000,
    midRange: 22000,
    highRange: 45000,
    notes:
      "Block perimeter wall (compound wall) with gate. In Ghana, " +
      "the compound wall is essential for security and privacy. In " +
      "some neighborhoods it is built first to establish presence " +
      "on the plot. Typically 2-2.5m high using 6-inch sandcrete " +
      "blocks with reinforced concrete columns every 3m. Includes " +
      "a vehicular gate and pedestrian gate. Steel gates are " +
      "standard; decorative wrought iron is premium. The compound " +
      "wall also prevents material theft during construction.",
    propertyTypes: [],
  },

  // -- 17. Borehole / Well -------------------------------------------------
  {
    category: "Borehole",
    subcategory: "Water borehole",
    unit: "lump",
    lowRange: 8000,
    midRange: 18000,
    highRange: 30000,
    notes:
      "Water source when GWCL supply is unavailable or unreliable. " +
      "A borehole is drilled 30-100m deep depending on the water " +
      "table, with a submersible pump. In Greater Accra coastal " +
      "areas, the water table is relatively shallow but water " +
      "quality may require filtration due to salinity. In the " +
      "Ashanti and northern regions, deeper boreholes are often " +
      "necessary. The drilling company should provide a water " +
      "quality test. Budget for a polytank on a raised stand for " +
      "gravity-fed distribution throughout the house. Community " +
      "Water and Sanitation Agency (CWSA) provides guidelines.",
    propertyTypes: [],
  },

  // -- 18. Septic system ---------------------------------------------------
  {
    category: "Septic system",
    subcategory: "Septic tank and soakaway",
    unit: "lump",
    lowRange: 5000,
    midRange: 9000,
    highRange: 15000,
    notes:
      "Required where there is no municipal sewer network — which " +
      "is most of Ghana outside of a few areas of central Accra. A " +
      "standard septic tank is a reinforced concrete underground " +
      "tank with two or three compartments for solid/liquid " +
      "separation. Size depends on the number of occupants " +
      "(typically 2-3 cubic meters for a family home). Must be " +
      "accessible for periodic desludging by a vacuum truck. " +
      "Position the tank at least 5m from the house and downhill " +
      "from any water source. A soakaway pit handles the liquid " +
      "effluent. The Environmental Protection Agency (EPA) sets " +
      "standards for domestic waste management.",
    propertyTypes: [],
  },

  // -- 19. Ceiling ---------------------------------------------------------
  {
    category: "Ceiling",
    subcategory: "Suspended ceiling",
    unit: "sqm",
    lowRange: 60,
    midRange: 120,
    highRange: 220,
    notes:
      "Suspended ceiling installed below the roof structure. PVC " +
      "ceiling panels (T&G PVC) are the most common and affordable " +
      "option — moisture-resistant and easy to clean. Plasterboard " +
      "(gypsum board) ceilings are more elegant but heavier and " +
      "more expensive. The suspended ceiling creates an insulating " +
      "air gap between the roof and the living space, significantly " +
      "reducing heat transfer from the metal roofing sheets. " +
      "Without a ceiling, rooms under a metal roof become extremely " +
      "hot during the day.",
    propertyTypes: [],
  },

  // -- 20. Kitchen fit-out -------------------------------------------------
  {
    category: "Kitchen fit-out",
    subcategory: "Kitchen installation",
    unit: "lump",
    lowRange: 8000,
    midRange: 22000,
    highRange: 45000,
    notes:
      "Counters (worktop), sink, storage, and basic kitchen " +
      "infrastructure. At the low end, this is a simple tiled " +
      "counter with an inset sink and open shelving. Mid-range " +
      "includes custom-built cabinets from a carpenter, a granite " +
      "or tiled countertop, and a stainless steel sink with mixer " +
      "tap. High-end includes imported modular kitchen systems " +
      "(available in Accra from Chinese and Lebanese suppliers), " +
      "built-in appliances, and premium finishes. Most Ghanaian " +
      "kitchens include provision for a gas cooker with an LPG " +
      "cylinder, as piped gas is not available to residences.",
    propertyTypes: [],
  },
];
