import type { CostBenchmark } from "../types";

/**
 * Togo Residential Construction Cost Benchmarks
 *
 * All costs are expressed in CFA francs (XOF) per square meter of built area
 * unless the unit is "lump" (fixed cost regardless of size).
 *
 * Low  = basic / economique build (simple finishes, local materials)
 * Mid  = standard / standing build (decent finishes, mixed materials)
 * High = premium / haut standing (imported finishes, architect-designed)
 *
 * An empty `propertyTypes` array means the benchmark applies to all property
 * types (SFH, DUPLEX, TRIPLEX, FOURPLEX, APARTMENT).
 *
 * Prices reflect Lome and surrounding areas as of 2025-2026. Costs in
 * interior regions (Kara, Sokode, Atakpame) may be 10-20% lower for labor
 * but higher for materials due to transport.
 */
export const TOGO_COST_BENCHMARKS: CostBenchmark[] = [
  // -- 1. Terrassement (earthwork) ----------------------------------------
  {
    category: "Terrassement",
    subcategory: "Earthwork",
    unit: "sqm",
    lowRange: 5000,
    midRange: 8000,
    highRange: 15000,
    notes:
      "Clearing, leveling, and compaction for the building footprint. " +
      "Costs depend on vegetation density, soil type (laterite vs clay), " +
      "and whether the terrain is flat or sloped. In Lome coastal areas, " +
      "sandy soil is easier to work but may require imported laterite fill " +
      "for compaction. Always verify the parcelle boundaries with a " +
      "geometre before starting earthwork.",
    propertyTypes: [],
  },

  // -- 2. Fondation (foundation) ------------------------------------------
  {
    category: "Fondation",
    subcategory: "Foundation",
    unit: "sqm",
    lowRange: 25000,
    midRange: 40000,
    highRange: 65000,
    notes:
      "Strip or pad foundation with reinforced concrete. Includes " +
      "excavation of trenches (fouilles), rebar cage (ferraillage), " +
      "formwork (coffrage), and concrete pour. Foundation depth depends " +
      "on soil bearing capacity — typically 80cm to 1.2m in Lome. " +
      "Laterite soils in northern Togo may need deeper footings. " +
      "Always have the architect or an experienced macon verify the " +
      "trench depth before pouring. The rebar must be inspected before " +
      "concrete is placed — this is the most critical quality checkpoint " +
      "in the entire build.",
    propertyTypes: [],
  },

  // -- 3. Soubassement (sub-base) -----------------------------------------
  {
    category: "Soubassement",
    subcategory: "Sub-base walls",
    unit: "sqm",
    lowRange: 15000,
    midRange: 25000,
    highRange: 40000,
    notes:
      "Below-ground walls from the top of the foundation to ground " +
      "level. Built with concrete blocks (agglo de 20) and mortar, " +
      "then backfilled and compacted. The soubassement raises the " +
      "structure above ground to protect against flooding and moisture. " +
      "In Lome, where flooding is common during rainy season (June-September), " +
      "building the soubassement higher (60-80cm above natural ground) " +
      "is strongly recommended. Waterproofing the exterior face with " +
      "bituminous coating adds cost but prevents long-term moisture damage.",
    propertyTypes: [],
  },

  // -- 4. Elevation murs (walls) ------------------------------------------
  {
    category: "Elevation murs",
    subcategory: "Walls",
    unit: "sqm",
    lowRange: 20000,
    midRange: 35000,
    highRange: 55000,
    notes:
      "Concrete block walls (agglo 15 or agglo 20) laid with cement " +
      "mortar. Agglo 15 (15cm thick) is used for interior partitions; " +
      "agglo 20 (20cm thick) for exterior load-bearing walls. The " +
      "blocks are infill between the poteau-poutre (column-beam) " +
      "structural frame. Quality of blocks varies enormously — " +
      "factory-pressed blocks are stronger than hand-molded ones. " +
      "Always test block quality by dropping one from chest height: " +
      "a good block should not shatter. Budget blocks with too much " +
      "sand and not enough cement will crack and crumble over time.",
    propertyTypes: [],
  },

  // -- 5. Poteaux et poutres (columns and beams) -------------------------
  {
    category: "Poteaux et poutres",
    subcategory: "Columns and beams",
    unit: "sqm",
    lowRange: 18000,
    midRange: 30000,
    highRange: 50000,
    notes:
      "Reinforced concrete structural frame — the skeleton of a " +
      "Togolese building. Poteaux (columns) are typically 20x20cm " +
      "or 25x25cm with 4 to 6 vertical rebar (fer de 10 or 12), " +
      "tied with horizontal stirrups (cadres) every 15-20cm. Poutres " +
      "(beams) span between columns to support the slab above. This " +
      "is the poteau-poutre system used throughout West Africa. The " +
      "rebar quality and concrete mix ratio (typically 350kg cement " +
      "per cubic meter) are critical for structural integrity. Never " +
      "allow the workers to reduce the rebar or use a weaker mix to " +
      "save money — this is a life-safety issue.",
    propertyTypes: [],
  },

  // -- 6. Chainage (ring beams) -------------------------------------------
  {
    category: "Chainage",
    subcategory: "Ring beams",
    unit: "sqm",
    lowRange: 8000,
    midRange: 15000,
    highRange: 25000,
    notes:
      "Horizontal reinforced concrete bands (chainages) that tie " +
      "walls together at the lintel level and at the top of walls " +
      "(chainage haut). Chainages prevent walls from separating and " +
      "distribute loads evenly. They are poured after the block walls " +
      "reach the required height. A building without proper chainages " +
      "is vulnerable to cracking and structural failure. The chainage " +
      "bas (low ring beam) sits on top of the soubassement, and the " +
      "chainage haut runs along the top of all walls before the roof " +
      "structure is installed.",
    propertyTypes: [],
  },

  // -- 7. Dalle/plancher (floor slab) -------------------------------------
  {
    category: "Dalle/plancher",
    subcategory: "Floor slab",
    unit: "sqm",
    lowRange: 20000,
    midRange: 35000,
    highRange: 55000,
    notes:
      "Reinforced concrete slab, either at ground level (dallage) or " +
      "as an upper floor (plancher). Upper-floor slabs often use the " +
      "hourdis system — hollow clay or polystyrene blocks placed " +
      "between concrete ribs (poutrelles), then topped with a thin " +
      "concrete layer (table de compression). Hourdis slabs are " +
      "lighter and use less concrete than full solid slabs. The " +
      "ground-floor slab is poured over compacted fill with a " +
      "polyethylene moisture barrier. Slab rebar must be inspected " +
      "before the pour — once the concrete sets, there is no way to " +
      "fix errors. Plan concrete deliveries for early morning to " +
      "avoid the midday heat, which causes concrete to set too quickly.",
    propertyTypes: [],
  },

  // -- 8. Charpente (roof structure) --------------------------------------
  {
    category: "Charpente",
    subcategory: "Roof structure",
    unit: "sqm",
    lowRange: 12000,
    midRange: 20000,
    highRange: 35000,
    notes:
      "Wood or steel trusses and rafters forming the roof frame. " +
      "Traditional wood charpente uses iroko, teak, or other " +
      "tropical hardwoods resistant to termites, but these are " +
      "increasingly expensive due to deforestation. Steel (metallic) " +
      "charpente is becoming more common — it is termite-proof and " +
      "lighter, but requires a soudeur (welder) for assembly. Roof " +
      "pitch should allow good water runoff during the heavy rains " +
      "of the rainy season. Budget for anti-termite treatment if " +
      "using wood — untreated wood in the Togolese climate will be " +
      "attacked within a few years.",
    propertyTypes: [],
  },

  // -- 9. Couverture (roofing) --------------------------------------------
  {
    category: "Couverture",
    subcategory: "Roofing sheets",
    unit: "sqm",
    lowRange: 8000,
    midRange: 15000,
    highRange: 25000,
    notes:
      "Bac aluminium (aluminum sheets) or galvanized steel roofing " +
      "sheets (tole). Bac alu is lighter, does not rust, and " +
      "reflects more heat, making it the preferred choice for " +
      "comfort, but it costs more. Galvanized tole is cheaper " +
      "but heats up more and will rust over time if the zinc " +
      "coating is scratched. Sheets are fixed to the charpente " +
      "with roofing screws and rubber washers (not nails, which " +
      "cause leaks). Include a ridge cap (faitiere) and valley " +
      "flashings. Consider adding a thermal insulation layer " +
      "(faux plafond or reflective barrier) to reduce heat " +
      "transfer into living spaces.",
    propertyTypes: [],
  },

  // -- 10. Enduit (plastering) --------------------------------------------
  {
    category: "Enduit",
    subcategory: "Plastering",
    unit: "sqm",
    lowRange: 5000,
    midRange: 8000,
    highRange: 15000,
    notes:
      "Cement render applied to interior and exterior walls. " +
      "Typically two coats: a rough coat (gobetis/corps d'enduit) " +
      "and a finishing coat (enduit de finition). Exterior enduit " +
      "protects blocks from rain erosion and gives a clean appearance. " +
      "Interior enduit provides a smooth surface for painting. " +
      "Quality depends on the correct sand-to-cement ratio and " +
      "proper curing — the wall must be kept wet for several days " +
      "after application to prevent cracking. Some builders skip " +
      "exterior enduit to save money, but exposed blocks deteriorate " +
      "quickly in the tropical climate.",
    propertyTypes: [],
  },

  // -- 11. Carrelage (tiling) ---------------------------------------------
  {
    category: "Carrelage",
    subcategory: "Tiling",
    unit: "sqm",
    lowRange: 8000,
    midRange: 15000,
    highRange: 30000,
    notes:
      "Floor and wall tiles. Locally manufactured tiles (from " +
      "Ghana or Nigeria) are cheapest; Chinese imports are mid-range; " +
      "European or premium tiles (porcelain, large format) are at " +
      "the high end. Price per square meter includes the tile, " +
      "cement adhesive (colle), joint filler, and labor. The " +
      "carreleur's skill matters enormously — poor tile work with " +
      "uneven joints and lippage is very visible and expensive " +
      "to redo. Always buy 10-15% extra tiles to account for " +
      "cuts, breakage, and future repairs (the same batch may " +
      "not be available later).",
    propertyTypes: [],
  },

  // -- 12. Plomberie (plumbing) -------------------------------------------
  {
    category: "Plomberie",
    subcategory: "Plumbing",
    unit: "sqm",
    lowRange: 10000,
    midRange: 18000,
    highRange: 30000,
    notes:
      "PVC supply and drainage pipes, fixtures (robinetterie), " +
      "water tank connection, and sanitary ware (WC, lavabo, " +
      "douche). Municipal water supply in Lome (TdE/SP-EAU) is " +
      "unreliable, so most homes include a citerne (water storage " +
      "tank) on the roof or ground level with an electric pump. " +
      "PVC pipes are standard — avoid galvanized steel pipes which " +
      "corrode in the humid climate. Drainage connects to the " +
      "fosse septique (septic tank). Budget for a bache a eau " +
      "(ground-level water storage) of at least 1000 liters if " +
      "you are in an area with irregular supply.",
    propertyTypes: [],
  },

  // -- 13. Electricite (electrical) ---------------------------------------
  {
    category: "Electricite",
    subcategory: "Electrical",
    unit: "sqm",
    lowRange: 8000,
    midRange: 15000,
    highRange: 25000,
    notes:
      "Wiring, switches, outlets, and breaker panel (tableau " +
      "electrique). The electrical system connects to the CEET " +
      "(Compagnie Energie Electrique du Togo) grid via a meter " +
      "(compteur). Power outages are common, so many homeowners " +
      "also install a generator transfer switch or an inverter " +
      "with battery backup. Wiring should be run in conduit " +
      "(gaine) embedded in walls before enduit is applied. " +
      "Use a qualified electricien — faulty wiring is a fire " +
      "hazard and the most common cause of house fires in " +
      "West Africa. A proper earth/ground connection (mise a " +
      "la terre) is essential but often skipped by budget " +
      "electricians.",
    propertyTypes: [],
  },

  // -- 14. Menuiserie (joinery/doors/windows) -----------------------------
  {
    category: "Menuiserie",
    subcategory: "Doors and windows",
    unit: "sqm",
    lowRange: 12000,
    midRange: 22000,
    highRange: 40000,
    notes:
      "Doors, windows, and built-in elements. Options include " +
      "wood (bois massif — iroko, teck, or samba), aluminum, " +
      "or steel. Aluminum sliding windows are increasingly popular " +
      "for their low maintenance and modern appearance. Wood doors " +
      "are traditional and can be beautifully carved but require " +
      "treatment against termites and humidity. Steel doors and " +
      "window guards (grilles) provide security — essential in " +
      "most neighborhoods. The menuisier typically works from the " +
      "architect's plans to custom-build all elements. Factory-made " +
      "aluminum systems are faster to install but more expensive.",
    propertyTypes: [],
  },

  // -- 15. Peinture (painting) --------------------------------------------
  {
    category: "Peinture",
    subcategory: "Painting",
    unit: "sqm",
    lowRange: 3000,
    midRange: 6000,
    highRange: 12000,
    notes:
      "Interior and exterior painting. Exterior walls need " +
      "weather-resistant paint (peinture facade) that can " +
      "withstand heavy rains and intense sun. Interior walls " +
      "use latex (peinture vinylique) or oil-based (peinture " +
      "glycero) paint — glycero is more durable and washable " +
      "but has stronger fumes. Two coats minimum over a primer " +
      "(sous-couche) are recommended. Local paint brands " +
      "(Seigneurie, Colorin) are available alongside imports. " +
      "Painting is one of the last trades and is often where " +
      "budget overruns become visible — do not skimp on quality " +
      "paint as it protects the enduit beneath.",
    propertyTypes: [],
  },

  // -- 16. Cloture (perimeter wall) ---------------------------------------
  {
    category: "Cloture",
    subcategory: "Perimeter wall",
    unit: "lump",
    lowRange: 500000,
    midRange: 1500000,
    highRange: 3000000,
    notes:
      "Block perimeter wall with gate (portail). In Togo, the " +
      "cloture is not optional — it is essential for security " +
      "and privacy, and in many neighborhoods it is the first " +
      "thing built (even before the house) to establish presence " +
      "on the parcelle. Typically 2-2.5m high using agglo de 15, " +
      "with reinforced concrete posts every 3m. Includes a " +
      "vehicular gate (portail) and a pedestrian gate (portillon). " +
      "Steel gates are standard; decorative wrought iron is " +
      "premium. The cloture also prevents material theft during " +
      "construction — an important consideration when the site " +
      "is unattended at night.",
    propertyTypes: [],
  },

  // -- 17. Forage ou puits (well/borehole) --------------------------------
  {
    category: "Forage ou puits",
    subcategory: "Well or borehole",
    unit: "lump",
    lowRange: 500000,
    midRange: 1200000,
    highRange: 2000000,
    notes:
      "Water source when municipal supply is unavailable or " +
      "unreliable. A forage (borehole) is drilled 30-80m deep " +
      "depending on the water table, with a submersible pump. " +
      "A puits (traditional well) is cheaper but shallower and " +
      "may dry up in the dry season. In Lome's coastal zones, " +
      "the water table is relatively shallow (10-20m), but " +
      "water quality may require filtration due to salinity. " +
      "In the Plateaux and northern regions, deeper boreholes " +
      "are often necessary. The forage company should provide " +
      "a water quality test result. Budget for a chateau d'eau " +
      "(elevated water tank) or a pompe surpresseur (pressure " +
      "pump) to distribute water throughout the house.",
    propertyTypes: [],
  },

  // -- 18. Fosse septique (septic system) ---------------------------------
  {
    category: "Fosse septique",
    subcategory: "Septic system",
    unit: "lump",
    lowRange: 300000,
    midRange: 600000,
    highRange: 1000000,
    notes:
      "Required where there is no municipal sewer network — " +
      "which is most of Togo outside of central Lome. A standard " +
      "fosse septique is a reinforced concrete underground tank " +
      "with two or three compartments for solid/liquid separation. " +
      "Size depends on the number of occupants (typically 2-3 " +
      "cubic meters for a family home). Must be accessible for " +
      "periodic vidange (pumping out) by a specialized truck. " +
      "Position the fosse at least 5m from the house and " +
      "downhill from any water source. A soak-away pit (puits " +
      "perdu) handles the liquid effluent. Poorly built or " +
      "undersized fosses are a major public health issue — " +
      "do not cut corners on this item.",
    propertyTypes: [],
  },

  // -- 19. Faux plafond (ceiling) -----------------------------------------
  {
    category: "Faux plafond",
    subcategory: "Ceiling",
    unit: "sqm",
    lowRange: 5000,
    midRange: 10000,
    highRange: 18000,
    notes:
      "Suspended ceiling installed below the roof structure. " +
      "PVC panels (lambris PVC) are the most common and " +
      "affordable option — they are moisture-resistant and easy " +
      "to clean. Plaster (staff) ceilings are more elegant but " +
      "heavier and more expensive. The faux plafond creates an " +
      "insulating air gap between the roof and the living space, " +
      "significantly reducing heat transfer from the metal " +
      "roofing sheets. Without a faux plafond, rooms under a " +
      "metal roof become extremely hot during the day. The " +
      "ceiling also hides electrical wiring and provides a " +
      "finished appearance.",
    propertyTypes: [],
  },

  // -- 20. Cuisine amenagee (kitchen fit-out) -----------------------------
  {
    category: "Cuisine amenagee",
    subcategory: "Kitchen fit-out",
    unit: "lump",
    lowRange: 500000,
    midRange: 1500000,
    highRange: 3000000,
    notes:
      "Counters (plan de travail), sink, storage, and basic " +
      "kitchen infrastructure. At the low end, this is a simple " +
      "tiled counter with an inset sink and open shelving. Mid-range " +
      "includes custom-built cabinets from a menuisier, a granite " +
      "or tiled countertop, and a stainless steel sink with mixer " +
      "tap. High-end includes imported modular kitchen systems " +
      "(available in Lome from Lebanese and Chinese suppliers), " +
      "built-in appliances, and premium finishes. Most Togolese " +
      "kitchens also include provision for a gas cooker (cuisiniere " +
      "a gaz) with a butane bottle, as natural gas is not piped " +
      "to residences.",
    propertyTypes: [],
  },
];
