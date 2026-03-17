import type { CostBenchmark } from "../types";

/**
 * Benin Residential Construction Cost Benchmarks
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
 * Prices reflect Cotonou and surrounding areas as of 2025-2026. Costs in
 * northern regions (Parakou, Natitingou, Djougou) may be 10-20% lower for
 * labor but higher for materials due to transport distances. Benin
 * construction costs are generally 5-10% higher than Togo for materials
 * due to port logistics via Cotonou and higher import taxes.
 */
export const BENIN_COST_BENCHMARKS: CostBenchmark[] = [
  // -- 1. Terrassement (earthwork) ----------------------------------------
  {
    category: "Terrassement",
    subcategory: "Earthwork",
    unit: "sqm",
    lowRange: 5500,
    midRange: 9000,
    highRange: 16000,
    notes:
      "Clearing, leveling, and compaction for the building footprint. " +
      "Costs depend on vegetation density, soil type (terre de barre " +
      "clay in southern Benin vs laterite in the north), and terrain " +
      "slope. In Cotonou, the sandy coastal soil is easy to work but " +
      "may require imported laterite fill for proper compaction. " +
      "In Abomey-Calavi and Seme-Podji, verify drainage before " +
      "starting — these areas are prone to seasonal flooding. " +
      "Always confirm parcelle boundaries with a geometre agree " +
      "before earthwork begins.",
    propertyTypes: [],
  },

  // -- 2. Fondation (foundation) ------------------------------------------
  {
    category: "Fondation",
    subcategory: "Foundation",
    unit: "sqm",
    lowRange: 27000,
    midRange: 43000,
    highRange: 70000,
    notes:
      "Strip or pad foundation with reinforced concrete. Includes " +
      "excavation of trenches (fouilles), rebar cage (ferraillage), " +
      "formwork (coffrage), and concrete pour. Foundation depth " +
      "depends on soil bearing capacity — typically 80cm to 1.2m " +
      "in Cotonou. The terre de barre soils in the Plateau " +
      "d'Abomey region offer excellent bearing capacity. In " +
      "Cotonou's coastal and lagoonal zones, high water tables " +
      "may require dewatering during excavation. The rebar must " +
      "be inspected before concrete is placed — this is the most " +
      "critical quality checkpoint in the entire build.",
    propertyTypes: [],
  },

  // -- 3. Soubassement (sub-base) -----------------------------------------
  {
    category: "Soubassement",
    subcategory: "Sub-base walls",
    unit: "sqm",
    lowRange: 16000,
    midRange: 27000,
    highRange: 43000,
    notes:
      "Below-ground walls from the top of the foundation to ground " +
      "level. Built with concrete blocks (agglo de 20) and mortar, " +
      "then backfilled and compacted. The soubassement raises the " +
      "structure above ground to protect against flooding and " +
      "moisture. In Cotonou and the lacustrine zone around " +
      "Ganvie/Abomey-Calavi, building the soubassement higher " +
      "(60-100cm above natural ground) is essential due to " +
      "seasonal flooding during the rainy season (April-July " +
      "and September-November). Waterproofing the exterior face " +
      "with bituminous coating is strongly recommended.",
    propertyTypes: [],
  },

  // -- 4. Elevation murs (walls) ------------------------------------------
  {
    category: "Elevation murs",
    subcategory: "Walls",
    unit: "sqm",
    lowRange: 22000,
    midRange: 38000,
    highRange: 60000,
    notes:
      "Concrete block walls (agglo 15 or agglo 20) laid with cement " +
      "mortar. Agglo 15 (15cm thick) is used for interior partitions; " +
      "agglo 20 (20cm thick) for exterior load-bearing walls. The " +
      "blocks are infill between the poteau-poutre (column-beam) " +
      "structural frame. Quality of blocks varies — factory-pressed " +
      "blocks from established manufacturers in Cotonou, Porto-Novo, " +
      "or Parakou are stronger than hand-molded ones. Test block " +
      "quality by dropping one from chest height: a good block " +
      "should not shatter. Benin has several large cement producers " +
      "(NOCIBE, SCB, Dangote Cement Benin) supplying local block " +
      "manufacturers.",
    propertyTypes: [],
  },

  // -- 5. Poteaux et poutres (columns and beams) -------------------------
  {
    category: "Poteaux et poutres",
    subcategory: "Columns and beams",
    unit: "sqm",
    lowRange: 20000,
    midRange: 33000,
    highRange: 55000,
    notes:
      "Reinforced concrete structural frame — the skeleton of a " +
      "Beninese building. Poteaux (columns) are typically 20x20cm " +
      "or 25x25cm with 4 to 6 vertical rebar (fer de 10 or 12), " +
      "tied with horizontal stirrups (cadres) every 15-20cm. Poutres " +
      "(beams) span between columns to support the slab above. This " +
      "is the poteau-poutre system used throughout West Africa. The " +
      "rebar quality and concrete mix ratio (typically 350kg cement " +
      "per cubic meter) are critical for structural integrity. Rebar " +
      "imported through the Port of Cotonou is available from " +
      "multiple suppliers — verify quality and bar diameter on " +
      "delivery.",
    propertyTypes: [],
  },

  // -- 6. Chainage (ring beams) -------------------------------------------
  {
    category: "Chainage",
    subcategory: "Ring beams",
    unit: "sqm",
    lowRange: 9000,
    midRange: 16000,
    highRange: 27000,
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
    lowRange: 22000,
    midRange: 38000,
    highRange: 60000,
    notes:
      "Reinforced concrete slab, either at ground level (dallage) or " +
      "as an upper floor (plancher). Upper-floor slabs often use the " +
      "hourdis system — hollow clay or polystyrene blocks placed " +
      "between concrete ribs (poutrelles), then topped with a thin " +
      "concrete layer (table de compression). Hourdis slabs are " +
      "lighter and use less concrete than full solid slabs. In " +
      "Cotonou, ready-mix concrete delivery is available from " +
      "several batching plants, which is faster and more consistent " +
      "than site-mixed concrete. Plan concrete deliveries for early " +
      "morning to avoid the midday heat, which causes concrete to " +
      "set too quickly.",
    propertyTypes: [],
  },

  // -- 8. Charpente (roof structure) --------------------------------------
  {
    category: "Charpente",
    subcategory: "Roof structure",
    unit: "sqm",
    lowRange: 13000,
    midRange: 22000,
    highRange: 38000,
    notes:
      "Wood or steel trusses and rafters forming the roof frame. " +
      "Traditional wood charpente uses iroko, teak (teck), or other " +
      "tropical hardwoods resistant to termites, but these are " +
      "increasingly expensive due to deforestation regulations in " +
      "Benin (forestry code). Steel (metallic) charpente is becoming " +
      "more common — it is termite-proof and lighter, but requires " +
      "a soudeur (welder) for assembly. Roof pitch should allow good " +
      "water runoff during the heavy rains of the two rainy seasons. " +
      "Budget for anti-termite treatment if using wood.",
    propertyTypes: [],
  },

  // -- 9. Couverture (roofing) --------------------------------------------
  {
    category: "Couverture",
    subcategory: "Roofing sheets",
    unit: "sqm",
    lowRange: 9000,
    midRange: 16000,
    highRange: 27000,
    notes:
      "Bac aluminium (aluminum sheets) or galvanized steel roofing " +
      "sheets (tole). Bac alu is lighter, does not rust, and " +
      "reflects more heat, making it the preferred choice for " +
      "comfort, but it costs more. Galvanized tole is cheaper " +
      "but heats up more and will rust over time. Sheets are " +
      "fixed to the charpente with roofing screws and rubber " +
      "washers. Include a ridge cap (faitiere) and valley flashings. " +
      "Roofing materials are widely available in Cotonou at " +
      "Dantokpa market area and along the Route de l'Aeroport " +
      "from major hardware distributors.",
    propertyTypes: [],
  },

  // -- 10. Enduit (plastering) --------------------------------------------
  {
    category: "Enduit",
    subcategory: "Plastering",
    unit: "sqm",
    lowRange: 5500,
    midRange: 9000,
    highRange: 16000,
    notes:
      "Cement render applied to interior and exterior walls. " +
      "Typically two coats: a rough coat (gobetis/corps d'enduit) " +
      "and a finishing coat (enduit de finition). Exterior enduit " +
      "protects blocks from rain erosion and gives a clean appearance. " +
      "Interior enduit provides a smooth surface for painting. " +
      "Quality depends on the correct sand-to-cement ratio and " +
      "proper curing — the wall must be kept wet for several days " +
      "after application to prevent cracking. In the humid Beninese " +
      "climate, exterior enduit is essential to protect blocks from " +
      "moisture penetration during the long rainy seasons.",
    propertyTypes: [],
  },

  // -- 11. Carrelage (tiling) ---------------------------------------------
  {
    category: "Carrelage",
    subcategory: "Tiling",
    unit: "sqm",
    lowRange: 9000,
    midRange: 16000,
    highRange: 33000,
    notes:
      "Floor and wall tiles. Locally manufactured tiles (from " +
      "Ghana or Nigeria) are cheapest; Chinese imports are mid-range; " +
      "European or premium tiles (porcelain, large format) are at " +
      "the high end. Price per square meter includes the tile, " +
      "cement adhesive (colle), joint filler, and labor. Cotonou's " +
      "Dantokpa market and specialized tile shops in Ganhi and " +
      "Akpakpa offer wide selections. Always buy 10-15% extra " +
      "tiles to account for cuts, breakage, and future repairs " +
      "(the same batch may not be available later).",
    propertyTypes: [],
  },

  // -- 12. Plomberie (plumbing) -------------------------------------------
  {
    category: "Plomberie",
    subcategory: "Plumbing",
    unit: "sqm",
    lowRange: 11000,
    midRange: 20000,
    highRange: 33000,
    notes:
      "PVC supply and drainage pipes, fixtures (robinetterie), " +
      "water tank connection, and sanitary ware (WC, lavabo, " +
      "douche). Municipal water supply in Cotonou (SONEB — " +
      "Societe Nationale des Eaux du Benin) can be intermittent, " +
      "so most homes include a citerne (water storage tank) on " +
      "the roof or ground level with an electric pump. PVC pipes " +
      "are standard. Drainage connects to the fosse septique " +
      "(septic tank). Budget for a bache a eau (ground-level " +
      "water storage) of at least 1000 liters if you are in an " +
      "area with irregular supply.",
    propertyTypes: [],
  },

  // -- 13. Electricite (electrical) ---------------------------------------
  {
    category: "Electricite",
    subcategory: "Electrical",
    unit: "sqm",
    lowRange: 9000,
    midRange: 16000,
    highRange: 27000,
    notes:
      "Wiring, switches, outlets, and breaker panel (tableau " +
      "electrique). The electrical system connects to the SBEE " +
      "(Societe Beninoise d'Energie Electrique) grid via a meter " +
      "(compteur). Power outages are common in Benin, so many " +
      "homeowners install a generator transfer switch or an " +
      "inverter with battery backup. Solar panels are becoming " +
      "increasingly popular, especially in northern Benin where " +
      "grid coverage is limited. Wiring should be run in conduit " +
      "(gaine) embedded in walls before enduit is applied. " +
      "A proper earth/ground connection (mise a la terre) is " +
      "essential but often skipped by budget electricians.",
    propertyTypes: [],
  },

  // -- 14. Menuiserie (joinery/doors/windows) -----------------------------
  {
    category: "Menuiserie",
    subcategory: "Doors and windows",
    unit: "sqm",
    lowRange: 13000,
    midRange: 24000,
    highRange: 43000,
    notes:
      "Doors, windows, and built-in elements. Options include " +
      "wood (bois massif — iroko, teck, or samba), aluminum, " +
      "or steel. Aluminum sliding windows are increasingly popular " +
      "for their low maintenance and modern appearance. Wood doors " +
      "are traditional and can be beautifully carved but require " +
      "treatment against termites and humidity. Steel doors and " +
      "window guards (grilles) provide security. The menuisier " +
      "typically works from the architect's plans to custom-build " +
      "all elements. Cotonou and Porto-Novo have established " +
      "menuiserie workshops concentrated in Akpakpa, Godomey, " +
      "and along the Route de Porto-Novo.",
    propertyTypes: [],
  },

  // -- 15. Peinture (painting) --------------------------------------------
  {
    category: "Peinture",
    subcategory: "Painting",
    unit: "sqm",
    lowRange: 3500,
    midRange: 7000,
    highRange: 13000,
    notes:
      "Interior and exterior painting. Exterior walls need " +
      "weather-resistant paint (peinture facade) that can " +
      "withstand heavy rains and intense sun. Interior walls " +
      "use latex (peinture vinylique) or oil-based (peinture " +
      "glycero) paint. Two coats minimum over a primer " +
      "(sous-couche) are recommended. Paint brands available " +
      "in Benin include Seigneurie, SPC (Societe de Peintures " +
      "et Chimie), and various imported brands. Painting is " +
      "one of the last trades and is often where budget overruns " +
      "become visible — do not skimp on quality paint as it " +
      "protects the enduit beneath.",
    propertyTypes: [],
  },

  // -- 16. Cloture (perimeter wall) ---------------------------------------
  {
    category: "Cloture",
    subcategory: "Perimeter wall",
    unit: "lump",
    lowRange: 550000,
    midRange: 1650000,
    highRange: 3300000,
    notes:
      "Block perimeter wall with gate (portail). In Benin, the " +
      "cloture is essential for security, privacy, and establishing " +
      "presence on the parcelle. Many owners build the cloture " +
      "first, even before the house, to prevent encroachment. " +
      "Typically 2-2.5m high using agglo de 15, with reinforced " +
      "concrete posts every 3m. Includes a vehicular gate (portail) " +
      "and a pedestrian gate (portillon). Steel gates are standard; " +
      "decorative wrought iron is premium. The cloture also " +
      "prevents material theft during construction.",
    propertyTypes: [],
  },

  // -- 17. Forage ou puits (well/borehole) --------------------------------
  {
    category: "Forage ou puits",
    subcategory: "Well or borehole",
    unit: "lump",
    lowRange: 550000,
    midRange: 1300000,
    highRange: 2200000,
    notes:
      "Water source when municipal supply (SONEB) is unavailable " +
      "or unreliable. A forage (borehole) is drilled 30-80m deep " +
      "depending on the water table, with a submersible pump. " +
      "In Cotonou's coastal zone, the water table is relatively " +
      "shallow (8-15m), but water quality may require filtration " +
      "due to salinity. In the north (Borgou, Alibori, Atacora), " +
      "deeper boreholes are often necessary. The Direction " +
      "Generale de l'Eau regulates borehole drilling. Budget for " +
      "a chateau d'eau (elevated water tank) or a pompe " +
      "surpresseur (pressure pump) to distribute water.",
    propertyTypes: [],
  },

  // -- 18. Fosse septique (septic system) ---------------------------------
  {
    category: "Fosse septique",
    subcategory: "Septic system",
    unit: "lump",
    lowRange: 350000,
    midRange: 650000,
    highRange: 1100000,
    notes:
      "Required where there is no municipal sewer network — " +
      "which is most of Benin outside of select areas in Cotonou. " +
      "A standard fosse septique is a reinforced concrete " +
      "underground tank with two or three compartments for " +
      "solid/liquid separation. Size depends on the number of " +
      "occupants (typically 2-3 cubic meters for a family home). " +
      "Must be accessible for periodic vidange (pumping out) by " +
      "a specialized truck. Position the fosse at least 5m from " +
      "the house and downhill from any water source. The " +
      "Direction de l'Assainissement oversees sanitation " +
      "standards in Benin.",
    propertyTypes: [],
  },

  // -- 19. Faux plafond (ceiling) -----------------------------------------
  {
    category: "Faux plafond",
    subcategory: "Ceiling",
    unit: "sqm",
    lowRange: 5500,
    midRange: 11000,
    highRange: 20000,
    notes:
      "Suspended ceiling installed below the roof structure. " +
      "PVC panels (lambris PVC) are the most common and " +
      "affordable option — they are moisture-resistant and easy " +
      "to clean. Plaster (staff) ceilings are more elegant but " +
      "heavier and more expensive. The faux plafond creates an " +
      "insulating air gap between the roof and the living space, " +
      "significantly reducing heat transfer from the metal " +
      "roofing sheets. Without a faux plafond, rooms under a " +
      "metal roof become extremely hot during the day. This is " +
      "especially important in Benin's hot, humid climate.",
    propertyTypes: [],
  },

  // -- 20. Cuisine amenagee (kitchen fit-out) -----------------------------
  {
    category: "Cuisine amenagee",
    subcategory: "Kitchen fit-out",
    unit: "lump",
    lowRange: 550000,
    midRange: 1650000,
    highRange: 3300000,
    notes:
      "Counters (plan de travail), sink, storage, and basic " +
      "kitchen infrastructure. At the low end, this is a simple " +
      "tiled counter with an inset sink and open shelving. Mid-range " +
      "includes custom-built cabinets from a menuisier, a granite " +
      "or tiled countertop, and a stainless steel sink with mixer " +
      "tap. High-end includes imported modular kitchen systems " +
      "(available in Cotonou from Lebanese and Chinese suppliers " +
      "in Ganhi and Cadjehoun). Most Beninese kitchens include " +
      "provision for a gas cooker (cuisiniere a gaz) with a " +
      "butane bottle, as natural gas is not piped to residences.",
    propertyTypes: [],
  },
];
