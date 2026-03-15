import type { GlossaryTerm } from "../types";

/**
 * Togo Construction Glossary
 *
 * French construction terminology used in Togo and West Africa.
 * Many terms are specific to the poteau-poutre (column-beam)
 * construction system and the Togolese legal/administrative context.
 *
 * All terms are marked as marketSpecific: true since they are
 * specific to the Togolese/West African construction context.
 */
export const TOGO_GLOSSARY: GlossaryTerm[] = [
  // === Land and Legal Terms ===
  {
    term: "Titre foncier",
    definition:
      "The official registered land title issued by the government. It is the only legally conclusive proof of land ownership in Togo. Without a titre foncier, your claim to land is legally vulnerable, no matter what other documents you hold. The process to obtain one takes 6-24 months and involves approximately 12 administrative steps.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Titre foncier" },
  },
  {
    term: "Acte de vente",
    definition:
      "A notarized sale deed recording the purchase of land between buyer and seller. Important but NOT equivalent to a titre foncier — it proves a transaction occurred but does not guarantee that the seller had the legal right to sell, or that the land has not been sold to someone else.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Acte de vente" },
  },
  {
    term: "Plan cadastral",
    definition:
      "An official surveyed boundary map produced by a licensed geometre (surveyor). Shows exact plot dimensions, area in square meters, boundary coordinates, and positions of boundary markers (bornes). Required for the titre foncier application and the permis de construire.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Plan cadastral" },
  },
  {
    term: "Geometre",
    definition:
      "A licensed surveyor who measures land parcels, places boundary markers (bornes), produces the plan cadastral, and performs the building implantation (setting out building lines on the site). Only a registered geometre's work is accepted for official purposes at the Conservation Fonciere.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Geometre agree" },
  },
  {
    term: "Notaire",
    definition:
      "A state-appointed legal professional who authenticates land transactions, drafts the acte de vente, verifies identities, collects registration taxes, and ensures the transaction is properly recorded. All land purchases should go through a notaire — never accept a private agreement (sous-seing prive) for a land transaction.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Notaire" },
  },
  {
    term: "Mairie",
    definition:
      "The municipal government (city hall). The mairie issues building permits (permis de construire), enforces urban planning regulations, and maintains local land-use records. In Lome, there are several arrondissements, each with its own mairie.",
    phase: "APPROVE",
    marketSpecific: true,
    localTerms: { fr: "Mairie" },
  },
  {
    term: "Parcelle",
    definition:
      "A plot or parcel of land. In urban areas, parcelles are typically part of a lotissement (planned subdivision) with defined lot numbers, dimensions, and boundaries. In rural areas, parcelles may be defined by customary boundaries recognized by the community.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Parcelle" },
  },
  {
    term: "Lotissement",
    definition:
      "A planned land subdivision where a larger area has been divided into individual plots (parcelles) with defined roads, drainage infrastructure, and lot numbers. Buying in a lotissement is generally safer because boundaries are clearly established and documented.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Lotissement" },
  },
  {
    term: "Permis de construire",
    definition:
      "Building permit issued by the mairie authorizing construction. Legally required in urban areas of Togo. The application requires architectural plans, proof of land ownership (titre foncier or acte de vente), and a plan cadastral. Typically valid for 2-3 years from the date of issuance.",
    phase: "APPROVE",
    marketSpecific: true,
    localTerms: { fr: "Permis de construire" },
  },
  {
    term: "Certificat de conformite",
    definition:
      "A certificate issued by an architect confirming that the completed building conforms to the approved plans and meets acceptable quality standards. Provides legal protection for the owner and may be required for future property transactions.",
    phase: "VERIFY",
    marketSpecific: true,
    localTerms: { fr: "Certificat de conformite", en: "Certificate of conformity" },
  },
  {
    term: "Chef de quartier",
    definition:
      "Traditional neighborhood chief who serves as a local authority figure in customary land matters. The chef de quartier can attest to the history of land ownership in their area and provides an attestation that is part of the titre foncier application. Their endorsement alone does not prove ownership.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Chef de quartier" },
  },

  // === Structural Terms ===
  {
    term: "Poteau-poutre",
    definition:
      "The reinforced concrete column-and-beam structural system used throughout West Africa. Poteaux (columns) and poutres (beams) form a rigid frame that carries all structural loads, with concrete blocks filling the spaces between as non-load-bearing infill walls. This system is strong, durable, and well-suited to the tropical climate.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Poteau-poutre", en: "Column-beam system" },
  },
  {
    term: "Chainage",
    definition:
      "A horizontal reinforced concrete ring beam that ties walls together and distributes loads evenly. The chainage bas runs at the top of the soubassement, and the chainage haut runs along the top of all walls before the roof. Chainages prevent walls from cracking and separating — a building without proper chainages is structurally compromised.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Chainage", en: "Ring beam" },
  },
  {
    term: "Dalle",
    definition:
      "A reinforced concrete floor slab, either at ground level (dallage) or as an upper floor (plancher). Can be a solid slab (dalle pleine) or a hourdis (ribbed) slab system. The dalle pour is one of the largest and most critical concrete operations in the build — coordinate labor, materials, and weather carefully.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Dalle", en: "Floor slab" },
  },
  {
    term: "Soubassement",
    definition:
      "The below-ground walls that rise from the top of the foundation to ground level. Built with concrete blocks (agglo de 20) and topped with a chainage bas (low ring beam). The soubassement raises the building above the natural ground level to protect against flooding and moisture infiltration.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Soubassement", en: "Sub-base / Stem wall" },
  },
  {
    term: "Agglo / Parpaing",
    definition:
      "Concrete block (also called parpaing or bloc de ciment). The primary wall building material in Togo. Agglo 15 (15cm thick) is used for interior partitions; agglo 20 (20cm thick) for exterior and load-bearing walls. Quality depends on the cement-to-sand ratio and compaction during manufacturing — test by dropping from chest height.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Agglomere / Parpaing", en: "Concrete block / CMU" },
  },
  {
    term: "Fer / Armature",
    definition:
      "Rebar (reinforcing steel bars, also called fer a beton). Comes in different diameters measured in millimeters: fer de 6, fer de 8, fer de 10, fer de 12, fer de 14, fer de 16. The number indicates the bar diameter. Used in all structural concrete elements — foundations, columns, beams, ring beams, and slabs.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Fer a beton / Armature", en: "Rebar / Reinforcing steel" },
  },
  {
    term: "Ciment",
    definition:
      "Portland cement, sold in 50kg bags. The single most expensive material in Togolese construction on a cumulative basis. Common brands include CIMTOGO (local), Diamond (Ghana), and Dangote (Nigeria). A standard structural concrete mix uses approximately 350kg of cement per cubic meter. Prices fluctuate and should be monitored.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Ciment", en: "Cement" },
  },
  {
    term: "Sable",
    definition:
      "Sand used in concrete and mortar mixes. Available as sable de mer (sea sand — must be washed to remove salt which corrodes rebar), sable de riviere (river sand — preferred for concrete), and sable de carriere (quarry sand). Sand quality significantly affects concrete and mortar strength.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Sable", en: "Sand" },
  },
  {
    term: "Gravier",
    definition:
      "Gravel or coarse aggregate used in concrete mixes. Typically crushed granite in various sizes (5-15mm and 15-25mm). Clean, properly graded gravier free of clay and organic matter is essential for strong concrete. Available from quarries around Lome and in the Plateaux region.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Gravier", en: "Gravel / Aggregate" },
  },
  {
    term: "Coffrage",
    definition:
      "Wooden formwork used to contain and shape wet concrete during pouring. Built from planks, plywood, and bracing. The coffrage shapes columns, beams, slabs, and other structural elements. Good coffrage produces straight, smooth concrete surfaces with accurate dimensions.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Coffrage", en: "Formwork / Shuttering" },
  },
  {
    term: "Decoffrage",
    definition:
      "The removal of formwork after concrete has cured sufficiently. Timing is critical — decoffrage too early (before concrete reaches adequate strength) can cause cracking or structural failure. Minimum 24-48 hours for columns, 7-14 days for beams, and 14-21 days for slabs depending on the span and load.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Decoffrage", en: "Formwork removal / Stripping" },
  },
  {
    term: "Ferraillage",
    definition:
      "The process of cutting, bending, and tying rebar (reinforcing steel) into cages for structural concrete elements. Also refers to the assembled rebar cage itself. Proper ferraillage is the most critical quality factor in reinforced concrete construction — always inspect before every concrete pour.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Ferraillage", en: "Rebar assembly / Reinforcement work" },
  },

  // === Roofing and Finishing Terms ===
  {
    term: "Bac alu / Tole",
    definition:
      "Roofing sheets. Bac aluminium (bac alu) is aluminum sheet roofing — lighter, does not rust, and reflects heat better, making it the premium option. Tole is galvanized steel sheet roofing — cheaper but heavier, conducts more heat into the building, and will eventually rust, especially in coastal areas.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Bac aluminium / Tole ondulee", en: "Roofing sheet" },
  },
  {
    term: "Charpente",
    definition:
      "The roof structure or framework that supports the roofing sheets. Can be made of tropical hardwood (bois — iroko, teck, or samba) or welded steel (charpente metallique). Includes trusses or rafters, purlins (pannes), and bracing members.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Charpente", en: "Roof structure / Roof framing" },
  },
  {
    term: "Couverture",
    definition:
      "The roof covering — the installed roofing sheets, as distinct from the charpente (supporting structure). Includes the roofing sheets, ridge cap (faitiere), hip and valley flashings, and gutter system.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Couverture", en: "Roofing / Roof cladding" },
  },
  {
    term: "Enduit",
    definition:
      "Cement plaster or render applied to block walls. Protects the blocks from rain erosion and provides a smooth surface for painting. Applied in two coats: a rough base coat (gobetis/corps d'enduit) and a smooth finishing coat (enduit de finition). Must be kept wet for several days during curing to prevent cracking.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Enduit / Crepi", en: "Plaster / Render" },
  },
  {
    term: "Carrelage",
    definition:
      "Floor and wall tiling, including both the tiles and the installation process. Tiles are laid with cement adhesive (colle a carrelage) and joints filled with grout. Quality ranges from locally-made tiles to imported porcelain. Always buy 10-15% extra for cuts, breakage, and future repairs.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Carrelage", en: "Tiling / Tilework" },
  },
  {
    term: "Menuiserie",
    definition:
      "Joinery work encompassing doors, windows, built-in furniture, and closets. In Togo, these are typically custom-made by a menuisier (joiner) in their atelier (workshop). Materials include tropical hardwood, aluminum frames, and steel. Aluminum sliding windows are increasingly popular.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Menuiserie", en: "Joinery / Doors and windows" },
  },
  {
    term: "Faux plafond",
    definition:
      "A suspended ceiling installed below the roof structure. Usually PVC panels (lambris PVC) or plaster panels (staff). Creates an insulating air gap that significantly reduces heat from the metal roof — essential for comfort in the tropical climate. Also hides wiring and provides a finished appearance.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Faux plafond", en: "Suspended ceiling / Drop ceiling" },
  },
  {
    term: "Cloture",
    definition:
      "A perimeter wall around the property, essential for security and privacy in Togo. Typically 2-2.5m high using concrete blocks (agglo de 15), with reinforced concrete posts every 3m. Often the first thing built on a new parcelle to establish physical presence and prevent encroachment.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Cloture / Mur de cloture", en: "Perimeter wall / Compound wall" },
  },
  {
    term: "Portail",
    definition:
      "The main gate in the perimeter wall, large enough for vehicle access. Typically fabricated from welded steel by a soudeur (welder). May be sliding (coulissant) or swinging (battant). A significant cost item and a prominent visual element of the property.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Portail", en: "Main gate" },
  },

  // === Infrastructure Terms ===
  {
    term: "Fosse septique",
    definition:
      "Septic tank — an underground wastewater treatment structure required where there is no municipal sewer network (most of Togo). Typically reinforced concrete with 2-3 compartments for solid/liquid separation. Connected to a soak-away pit (puits perdu). Must be periodically pumped out (vidange) and positioned at least 5m from the house.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Fosse septique", en: "Septic tank" },
  },
  {
    term: "Forage",
    definition:
      "A drilled borehole for water supply. Typically 30-80m deep depending on the water table, equipped with a submersible electric pump. Necessary when municipal water supply (TdE/SP-EAU) is unavailable or unreliable. A water quality test should always be performed after drilling.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Forage", en: "Borehole / Drilled well" },
  },
  {
    term: "Citerne",
    definition:
      "A water storage tank for domestic use. Can be elevated (chateau d'eau) for gravity-fed distribution, or ground-level (bache a eau) with an electric pump. Essential in Togo where municipal water is intermittent. Typical residential capacity is 1,000-5,000 liters. Plastic tanks are common; concrete tanks are more durable.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Citerne / Bache a eau / Chateau d'eau", en: "Water tank / Water storage" },
  },
  {
    term: "Compteur",
    definition:
      "A utility meter for electricity (compteur CEET) or water (compteur TdE). Obtaining a compteur requires an application to the utility company, payment of connection fees, and an on-site installation visit. The process can take several weeks. The compteur is registered in the property owner's or tenant's name.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Compteur", en: "Utility meter" },
  },
  {
    term: "Branchement",
    definition:
      "A utility connection — the physical connection from the main utility line (electricity or water) running along the road to your property. Involves trenching, running cable or pipe, and installing the compteur. Applied for through the utility company (CEET for electricity, TdE/SP-EAU for water).",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Branchement", en: "Utility connection / Service connection" },
  },

  // === Financial and Administrative Terms ===
  {
    term: "Tontine",
    definition:
      "A traditional rotating savings group where members contribute a fixed amount at regular intervals (weekly or monthly) and each member receives the entire pooled amount in rotation. Tontines are a major source of construction financing in Togo, particularly for those without access to bank loans. Some tontines are specifically organized for building projects.",
    phase: "FINANCE",
    marketSpecific: true,
    localTerms: { fr: "Tontine", en: "Rotating savings group / ROSCA" },
  },
  {
    term: "Journalier",
    definition:
      "The daily wage system used for paying construction workers. Most workers in Togolese construction are paid a fixed amount per day of work, in cash, at the end of each day or week. There are no formal employment contracts in most cases. Rates vary by trade, skill level, and location.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Journalier", en: "Daily wage / Day labor system" },
  },
  {
    term: "Devis",
    definition:
      "A detailed cost estimate or quotation prepared by a contractor, chef de chantier, or architect. The devis lists all work items with descriptions, quantities, unit prices, and totals. It serves as both a bid document for contractor selection and a budget reference throughout the build. Always obtain at least 3 devis for comparison.",
    phase: "ASSEMBLE",
    marketSpecific: true,
    localTerms: { fr: "Devis / Devis estimatif", en: "Cost estimate / Quote" },
  },
  {
    term: "Bordereau",
    definition:
      "A price schedule or bill of quantities listing unit prices for each type of work. Different from a devis in that it shows per-unit rates rather than total costs. Used for standardized bid comparison between contractors and for calculating payment based on actual work quantities performed.",
    phase: "ASSEMBLE",
    marketSpecific: true,
    localTerms: { fr: "Bordereau de prix", en: "Price schedule / Bill of quantities" },
  },
  {
    term: "Quittance",
    definition:
      "A payment receipt signed by the person receiving money. In Togo's predominantly cash-based construction economy, keeping signed quittances for every payment is essential for financial tracking, dispute resolution, and (for diaspora builders) verifying that funds sent from abroad are being used correctly.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Quittance", en: "Payment receipt" },
  },
  {
    term: "Reception provisoire",
    definition:
      "The provisional acceptance of a completed building by the owner, typically with the architect present. A formal proces-verbal (written report) is prepared documenting the condition of the building and listing any reserves (defects to be corrected). This event marks the start of the guarantee period.",
    phase: "VERIFY",
    marketSpecific: true,
    localTerms: { fr: "Reception provisoire", en: "Provisional acceptance / Practical completion" },
  },
  {
    term: "Reception definitive",
    definition:
      "The final acceptance of the building, typically 1 year after the reception provisoire. Confirms that all reserves (defects) from the provisional acceptance have been corrected and no new hidden defects have appeared. Releases the contractor's retention money (retenue de garantie).",
    phase: "OPERATE",
    marketSpecific: true,
    localTerms: { fr: "Reception definitive", en: "Final acceptance" },
  },
  {
    term: "Retenue de garantie",
    definition:
      "A retention or holdback amount, typically 5-10% of the total contract value, withheld from the contractor's payments until the reception definitive. This provides financial leverage to ensure the contractor returns to correct any defects that appear during the 1-year guarantee period after completion.",
    phase: "VERIFY",
    marketSpecific: true,
    localTerms: { fr: "Retenue de garantie", en: "Retention / Holdback / Defects liability retention" },
  },
  {
    term: "Avenant",
    definition:
      "A formal amendment or addendum to the construction contract. Used when there are changes to the scope of work, price, timeline, or other terms that both parties must agree to. Any significant change should be documented in a signed avenant before the additional work is performed.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Avenant", en: "Contract amendment / Change order" },
  },

  // === People and Roles ===
  {
    term: "Maitre d'ouvrage",
    definition:
      "The owner or client who commissions and finances the construction project. The maitre d'ouvrage makes all major decisions, approves the budget and design, and is ultimately responsible for paying for the work. For diaspora builders, a trusted local representative may act on behalf of the maitre d'ouvrage.",
    phase: "DEFINE",
    marketSpecific: true,
    localTerms: { fr: "Maitre d'ouvrage (MO)", en: "Owner / Client / Building owner" },
  },
  {
    term: "Maitre d'oeuvre",
    definition:
      "The project manager or lead professional responsible for overseeing the design and construction on behalf of the owner. In Togo, this role is usually filled by the architect (for larger or more complex projects) or effectively by the chef de chantier (for simpler residential builds). The maitre d'oeuvre ensures the work matches the plans and coordinates all trades.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Maitre d'oeuvre (MOE)", en: "Project manager / Lead professional" },
  },
  {
    term: "Chef de chantier",
    definition:
      "The site foreman who manages day-to-day construction operations on the ground. Supervises workers, coordinates material deliveries, ensures quality of workmanship, and reports progress to the owner. The chef de chantier is arguably the most important hiring decision on a Togolese residential construction project.",
    phase: "ASSEMBLE",
    marketSpecific: true,
    localTerms: { fr: "Chef de chantier", en: "Site foreman / Site manager" },
  },
  {
    term: "Manoeuvre",
    definition:
      "A general construction laborer who performs essential support tasks: mixing concrete and mortar by hand, carrying blocks and materials, fetching water, and cleaning the site. Manoeuvres are the lowest-paid but indispensable workers on every construction site. Many skilled tradespeople began their careers as manoeuvres.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Manoeuvre", en: "Laborer / Helper" },
  },
  {
    term: "Sous-traitant",
    definition:
      "A subcontractor — a specialized tradesperson or team hired for a specific scope of work (plumbing, electrical, tiling, welding, etc.) rather than for the entire project. The chef de chantier or maitre d'oeuvre typically coordinates sous-traitants, who come and go as their specific phase of work requires.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Sous-traitant", en: "Subcontractor" },
  },
  {
    term: "Dessinateur",
    definition:
      "A draftsperson who produces building plans. Less expensive than a registered architect but typically provides plans only, without structural calculations or construction supervision. Suitable for simple single-story residential buildings; for multi-story or complex projects, a full architect is recommended.",
    phase: "DESIGN",
    marketSpecific: true,
    localTerms: { fr: "Dessinateur", en: "Draftsperson / Building designer" },
  },

  // === Additional Construction Terms ===
  {
    term: "Foyer ameliore",
    definition:
      "An improved cooking stove, typically built into the outdoor kitchen area. Uses less charcoal or wood than traditional three-stone fires and produces less smoke. Some modern Togolese homes include provision for both a foyer ameliore for traditional cooking and a gas cooker (cuisiniere a gaz) for daily use.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Foyer ameliore", en: "Improved cookstove" },
  },
  {
    term: "Peinture",
    definition:
      "Paint and the painting process. Interior options include peinture vinylique (latex/water-based, easy to apply) and peinture glycero (oil-based, more durable and washable but with stronger fumes). Exterior walls require peinture facade (weather-resistant formulation). Always apply a sous-couche (primer) before topcoats.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Peinture", en: "Paint / Painting" },
  },
  {
    term: "Hourdis",
    definition:
      "A ribbed floor slab system using hollow blocks (hourdis, also called corps creux) placed between precast or in-situ concrete ribs (poutrelles), then topped with a thin concrete layer (table de compression). Lighter, more economical, and faster to construct than a solid slab. Commonly used for upper floors in Togolese multi-story buildings.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Hourdis / Plancher hourdis", en: "Ribbed slab / Block-and-rib floor" },
  },
  {
    term: "Implantation",
    definition:
      "The process of marking out the building footprint on the ground according to the architectural plans, using stakes and string lines. Performed by the geometre or architect at the start of construction. Ensures the building is correctly positioned on the parcelle, properly oriented, and respects all setback requirements.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Implantation", en: "Setting out / Layout marking" },
  },
  {
    term: "Terrasse",
    definition:
      "A covered outdoor living area, integral to Togolese residential design. The terrasse provides shaded outdoor space essential in the tropical climate for socializing, eating, receiving guests, and daily activities. Most Togolese homes have at least one terrasse, commonly at the front entrance.",
    phase: "DESIGN",
    marketSpecific: true,
    localTerms: { fr: "Terrasse", en: "Covered patio / Veranda" },
  },
  {
    term: "Semelle",
    definition:
      "A footing — the widened base of a foundation that spreads the building load over a larger area of soil. Can be continuous (semelle filante, running under walls) or isolated (semelle isolee, under individual columns). Made of reinforced concrete and sized based on the soil bearing capacity and building loads.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Semelle", en: "Footing / Foundation base" },
  },
  {
    term: "Fondation",
    definition:
      "The foundation system — the underground structural elements that transfer building loads to the soil. In Togolese poteau-poutre construction, this typically consists of strip footings (semelles filantes) or pad footings (semelles isolees) under columns, all made of reinforced concrete. Foundation depth depends on soil conditions.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Fondation", en: "Foundation" },
  },
];
