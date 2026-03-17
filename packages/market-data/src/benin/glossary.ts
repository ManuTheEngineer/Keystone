import type { GlossaryTerm } from "../types";

/**
 * Benin Construction Glossary
 *
 * French construction terminology used in Benin and West Africa,
 * with Fon translations where applicable. Fon is the most widely
 * spoken local language in southern Benin (Cotonou, Porto-Novo,
 * Abomey, Ouidah).
 *
 * Many terms are shared with Togo (same poteau-poutre system
 * and French construction vocabulary), but Benin-specific legal
 * terms reflect the 2013 Code Foncier and ANDF system.
 */
export const BENIN_GLOSSARY: GlossaryTerm[] = [
  // === Land and Legal Terms ===
  {
    term: "Certificat de Propriete Fonciere (CPF)",
    definition:
      "The official registered land title introduced by Benin's 2013 Code Foncier et Domanial. It replaces the older titre foncier system. The CPF is the ONLY legally conclusive proof of land ownership in Benin. It is issued by ANDF after a registration process that includes publication, opposition period, and commission verification. Processing takes 6-18 months.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Certificat de Propriete Fonciere", fon: "Wema-nuwiwa" },
  },
  {
    term: "ANDF",
    definition:
      "Agence Nationale du Domaine et du Foncier — the central government agency created by the 2013 Code Foncier to manage all land registration in Benin. ANDF has bureau communaux (local offices) throughout the country. All land transactions and CPF applications go through ANDF.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Agence Nationale du Domaine et du Foncier" },
  },
  {
    term: "Convention de vente",
    definition:
      "A notarized purchase agreement recording the sale of land between buyer and seller. Required by the 2013 Code Foncier for all land transactions. The convention de vente is important but NOT equivalent to a CPF — it proves a transaction occurred but does not guarantee the seller had full legal right to sell.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Convention de vente", fon: "Ayi-sasaxa" },
  },
  {
    term: "Attestation de Detention Coutumiere (ADC)",
    definition:
      "A document formally recognizing customary land rights, issued by the mairie after verification by the Section Villageoise de Gestion Fonciere (SVGF). The ADC is an intermediate step between informal customary rights and a full CPF. Valid for 10 years, it must be converted to a CPF within that period for permanent legal protection.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Attestation de Detention Coutumiere" },
  },
  {
    term: "Plan Foncier Rural (PFR)",
    definition:
      "A systematic land mapping and registration program for rural areas. The PFR maps all parcelles in a commune, identifies rights holders, and creates a georeferenced register. Where completed, the PFR significantly speeds up the CPF application process because baseline survey data already exists.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Plan Foncier Rural" },
  },
  {
    term: "Plan topographique",
    definition:
      "An official surveyed boundary map produced by a geometre agree. Shows exact plot dimensions, area in square meters, boundary coordinates, and positions of boundary markers (bornes). Required for the CPF application and the permis de construire. In Benin, this is called plan topographique rather than plan cadastral as in Togo.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Plan topographique" },
  },
  {
    term: "Geometre agree",
    definition:
      "A licensed surveyor registered with the Ordre des Geometres-Experts du Benin. Measures land parcels, places boundary markers (bornes), produces the plan topographique, and performs the building implantation. Only a registered geometre's work is accepted by ANDF for CPF applications.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Geometre agree" },
  },
  {
    term: "Notaire",
    definition:
      "A state-appointed legal professional who authenticates land transactions and drafts the convention de vente. Under the 2013 Code Foncier, all land transactions in Benin must be notarized. The notaire verifies identities, ensures legality, collects registration taxes, and files with ANDF.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Notaire" },
  },
  {
    term: "Mairie",
    definition:
      "The municipal government (town hall). Benin has 77 communes, each with a mairie. The mairie issues building permits (permis de construire), participates in land registration through the SVGF, and enforces urban planning regulations. In the Grand Nokoue area, several mairies serve the Cotonou metropolitan region.",
    phase: "APPROVE",
    marketSpecific: true,
    localTerms: { fr: "Mairie", fon: "Axosu-xwe" },
  },
  {
    term: "Parcelle",
    definition:
      "A plot or parcel of land. In urban areas, parcelles are typically part of a lotissement (planned subdivision) with defined lot numbers. In rural areas, parcelles are identified through the Plan Foncier Rural (PFR) or customary boundaries recognized by the community.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Parcelle", fon: "Ayi-godo" },
  },
  {
    term: "Permis de construire",
    definition:
      "Building permit issued by the mairie authorizing construction. Legally required in urban areas of Benin. The application requires architectural plans, proof of land ownership (CPF or ANDF registration receipt), and a plan topographique. Typically valid for 2-3 years.",
    phase: "APPROVE",
    marketSpecific: true,
    localTerms: { fr: "Permis de construire" },
  },
  {
    term: "Section Villageoise de Gestion Fonciere (SVGF)",
    definition:
      "A village-level committee established by the 2013 Code Foncier to participate in land management at the local level. The SVGF includes traditional leaders (chef de village), elected representatives, and community members. It verifies customary land rights claims and participates in the ADC and CPF processes.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { fr: "Section Villageoise de Gestion Fonciere" },
  },

  // === Structural Terms ===
  {
    term: "Poteau-poutre",
    definition:
      "The reinforced concrete column-and-beam structural system used throughout West Africa. Poteaux (columns) and poutres (beams) form a rigid frame that carries all structural loads, with concrete blocks filling the spaces between as non-load-bearing infill walls.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Poteau-poutre", en: "Column-beam system", fon: "Atin-kanlin" },
  },
  {
    term: "Chainage",
    definition:
      "A horizontal reinforced concrete ring beam that ties walls together and distributes loads evenly. The chainage bas runs at the top of the soubassement, and the chainage haut runs along the top of all walls before the roof. Essential for structural integrity.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Chainage", en: "Ring beam" },
  },
  {
    term: "Dalle",
    definition:
      "A reinforced concrete floor slab, either at ground level (dallage) or as an upper floor (plancher). Can be solid (dalle pleine) or a hourdis (ribbed) slab system. The dalle pour is one of the largest concrete operations in the build.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Dalle", en: "Floor slab" },
  },
  {
    term: "Soubassement",
    definition:
      "The below-ground walls that rise from the top of the foundation to ground level. Built with concrete blocks (agglo de 20) and topped with a chainage bas. Raises the building above ground level to protect against flooding — especially important in Cotonou and the lagoonal zone.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Soubassement", en: "Sub-base / Stem wall" },
  },
  {
    term: "Agglo / Parpaing",
    definition:
      "Concrete block (also called parpaing or bloc de ciment). The primary wall building material in Benin. Agglo 15 (15cm thick) for interior partitions; agglo 20 (20cm thick) for exterior walls. Quality varies — blocks from established Beninese manufacturers (using cement from NOCIBE, SCB, or Dangote) are preferred.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Agglomere / Parpaing", en: "Concrete block / CMU", fon: "Amonkoun" },
  },
  {
    term: "Fer / Armature",
    definition:
      "Rebar (reinforcing steel bars, also called fer a beton). Comes in different diameters: fer de 6, 8, 10, 12, 14, 16 mm. Used in all structural concrete elements. Rebar imported through the Port of Cotonou is available from multiple distributors.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Fer a beton / Armature", en: "Rebar / Reinforcing steel", fon: "Ga" },
  },
  {
    term: "Ciment",
    definition:
      "Portland cement, sold in 50kg bags. Major producers in Benin include NOCIBE (Nouvelle Cimenterie du Benin), SCB (Societe des Ciments du Benin), and Dangote Cement Benin. A standard structural concrete mix uses approximately 350kg of cement per cubic meter. Prices fluctuate with international markets.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Ciment", en: "Cement", fon: "Cimanti" },
  },
  {
    term: "Terre de barre",
    definition:
      "A distinctive reddish-brown clay soil found across southern Benin's plateau region (from Allada to Abomey). Terre de barre offers excellent bearing capacity for foundations and is one of the best natural soils for construction in West Africa. However, it becomes very slippery when wet and can swell.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Terre de barre", fon: "Ayi-vovo" },
  },
  {
    term: "Coffrage",
    definition:
      "Wooden formwork used to contain and shape wet concrete during pouring. Built from planks, plywood, and bracing. Good coffrage produces straight, smooth concrete surfaces with accurate dimensions.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Coffrage", en: "Formwork / Shuttering" },
  },
  {
    term: "Ferraillage",
    definition:
      "The process of cutting, bending, and tying rebar into cages for structural elements. Also refers to the assembled rebar cage itself. Proper ferraillage is the most critical quality factor in reinforced concrete construction — always inspect before every pour.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Ferraillage", en: "Rebar assembly / Reinforcement work" },
  },

  // === Roofing and Finishing Terms ===
  {
    term: "Bac alu / Tole",
    definition:
      "Roofing sheets. Bac aluminium is the premium option (lighter, no rust, reflects heat). Tole is galvanized steel (cheaper but heats up more and eventually rusts). Both are widely available from hardware suppliers in Cotonou's commercial districts.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Bac aluminium / Tole ondulee", en: "Roofing sheet", fon: "Gandotin" },
  },
  {
    term: "Charpente",
    definition:
      "The roof structure or framework. Can be tropical hardwood or welded steel (charpente metallique). Benin's forestry regulations restrict certain timber species, making steel increasingly popular.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Charpente", en: "Roof structure / Roof framing" },
  },
  {
    term: "Enduit",
    definition:
      "Cement plaster or render applied to block walls. Two coats: a rough base coat (gobetis) and a smooth finishing coat (enduit de finition). Must be kept wet during curing to prevent cracking. Essential in Benin's humid climate to protect blocks from moisture.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Enduit / Crepi", en: "Plaster / Render" },
  },
  {
    term: "Carrelage",
    definition:
      "Floor and wall tiling. Tiles are laid with cement adhesive and joints filled with grout. Widely available at Dantokpa market in Cotonou and from specialized tile shops. Always buy 10-15% extra for cuts and future repairs.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Carrelage", en: "Tiling / Tilework" },
  },
  {
    term: "Menuiserie",
    definition:
      "Joinery work: doors, windows, built-in furniture. Typically custom-made by a menuisier. Aluminum frames are increasingly popular. Established workshops in Akpakpa, Godomey, and Porto-Novo.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Menuiserie", en: "Joinery / Doors and windows" },
  },
  {
    term: "Faux plafond",
    definition:
      "A suspended ceiling installed below the roof structure. Usually PVC panels (lambris PVC) or plaster (staff). Creates insulating air gap essential for comfort under metal roofing in Benin's hot, humid climate.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Faux plafond", en: "Suspended ceiling / Drop ceiling" },
  },
  {
    term: "Cloture",
    definition:
      "A perimeter wall around the property, essential for security and establishing physical presence on the parcelle. Typically 2-2.5m high using agglo de 15. Often built first, before the house, to prevent encroachment.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Cloture / Mur de cloture", en: "Perimeter wall / Compound wall", fon: "Gli" },
  },
  {
    term: "Portail",
    definition:
      "The main gate in the perimeter wall, large enough for vehicle access. Typically welded steel fabricated by a soudeur. A significant cost and visual element of the property.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Portail", en: "Main gate", fon: "Honto" },
  },

  // === Infrastructure Terms ===
  {
    term: "Fosse septique",
    definition:
      "Septic tank — an underground wastewater treatment structure. Reinforced concrete with 2-3 compartments. Connected to a soak-away pit (puits perdu). Must be periodically pumped out (vidange). Position at least 5m from the house.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Fosse septique", en: "Septic tank" },
  },
  {
    term: "Forage",
    definition:
      "A drilled borehole for water supply. Typically 30-80m deep with submersible pump. Regulated by the Direction Generale de l'Eau. In Cotonou's coastal zone, shallow water table (8-15m) but may have salinity issues.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Forage", en: "Borehole / Drilled well", fon: "Sin-do" },
  },
  {
    term: "SONEB",
    definition:
      "Societe Nationale des Eaux du Benin — the national water utility. SONEB supplies piped water in urban areas. Coverage is improving but intermittent in many neighborhoods, making water storage tanks essential for most homes.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Societe Nationale des Eaux du Benin" },
  },
  {
    term: "SBEE",
    definition:
      "Societe Beninoise d'Energie Electrique — the national electricity utility. SBEE supplies grid power and manages meter (compteur) installations. Power outages are common. Many homeowners install generators, inverters, or increasingly, solar panel systems.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Societe Beninoise d'Energie Electrique" },
  },
  {
    term: "Compteur",
    definition:
      "A utility meter for electricity (compteur SBEE) or water (compteur SONEB). Obtaining a compteur requires an application, payment of connection fees, and installation visit. The process can take several weeks.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Compteur", en: "Utility meter" },
  },

  // === Financial and Administrative Terms ===
  {
    term: "Tontine",
    definition:
      "A traditional rotating savings group (also called asusu in Fon). Members contribute a fixed amount at regular intervals and each receives the pooled amount in rotation. Tontines are a major financing mechanism for construction in Benin. Some are organized specifically for building projects.",
    phase: "FINANCE",
    marketSpecific: true,
    localTerms: { fr: "Tontine", fon: "Asusu", en: "Rotating savings group / ROSCA" },
  },
  {
    term: "Journalier",
    definition:
      "The daily wage system for paying construction workers. Most workers are paid a fixed daily amount in cash. No formal employment contracts in most cases. Rates vary by trade, skill, and location.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Journalier", en: "Daily wage / Day labor system" },
  },
  {
    term: "Devis",
    definition:
      "A detailed cost estimate or quotation. Lists all work items with descriptions, quantities, unit prices, and totals. Serves as both a bid document and budget reference. Always obtain at least 3 devis for comparison.",
    phase: "ASSEMBLE",
    marketSpecific: true,
    localTerms: { fr: "Devis / Devis estimatif", en: "Cost estimate / Quote" },
  },
  {
    term: "Quittance",
    definition:
      "A payment receipt signed by the recipient. Essential in Benin's cash-based construction economy for tracking payments, resolving disputes, and (for diaspora builders) verifying fund usage. Keep signed quittances for every payment.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Quittance", en: "Payment receipt" },
  },
  {
    term: "Taxe Fonciere Unique (TFU)",
    definition:
      "The unified property tax in Benin, collected annually by the Direction Generale des Impots (DGI). Assessed based on the rental value of the property. Benin has modernized TFU collection through digital platforms. Keep all TFU receipts as they may be needed for property transactions.",
    phase: "OPERATE",
    marketSpecific: true,
    localTerms: { fr: "Taxe Fonciere Unique" },
  },

  // === People and Roles ===
  {
    term: "Maitre d'ouvrage",
    definition:
      "The owner or client who commissions and finances the construction project. Makes all major decisions and is responsible for payment. For diaspora builders, a mandataire (representative with notarized power of attorney) may act on behalf of the maitre d'ouvrage.",
    phase: "DEFINE",
    marketSpecific: true,
    localTerms: { fr: "Maitre d'ouvrage (MO)", en: "Owner / Client", fon: "Xwe-to" },
  },
  {
    term: "Chef de chantier",
    definition:
      "The site foreman who manages day-to-day construction operations. Supervises workers, coordinates materials, and reports progress. The most important hiring decision on a Beninese residential project.",
    phase: "ASSEMBLE",
    marketSpecific: true,
    localTerms: { fr: "Chef de chantier", en: "Site foreman / Site manager" },
  },
  {
    term: "Manoeuvre",
    definition:
      "A general construction laborer. Performs support tasks: mixing concrete and mortar, carrying materials, cleaning the site. The lowest-paid but indispensable workers. Many skilled tradespeople began as manoeuvres.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Manoeuvre", en: "Laborer / Helper" },
  },
  {
    term: "Dessinateur",
    definition:
      "A draftsperson who produces building plans. Less expensive than a registered architect but provides plans only, without construction supervision. Suitable for simple single-story homes; for multi-story or complex projects, a registered architect is recommended.",
    phase: "DESIGN",
    marketSpecific: true,
    localTerms: { fr: "Dessinateur", en: "Draftsperson / Building designer" },
  },

  // === Additional Construction Terms ===
  {
    term: "Hourdis",
    definition:
      "A ribbed floor slab system using hollow blocks placed between concrete ribs (poutrelles), topped with a thin concrete layer. Lighter and more economical than solid slabs. Common for upper floors in multi-story Beninese buildings.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Hourdis / Plancher hourdis", en: "Ribbed slab / Block-and-rib floor" },
  },
  {
    term: "Implantation",
    definition:
      "Marking out the building footprint on the ground according to architectural plans, using stakes and string lines. Performed by the geometre or architect at construction start. Ensures correct positioning and setback compliance.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Implantation", en: "Setting out / Layout marking" },
  },
  {
    term: "Terrasse",
    definition:
      "A covered outdoor living area integral to Beninese residential design. Provides shaded space for socializing, eating, and receiving guests — essential in the tropical climate. Most Beninese homes have at least one terrasse.",
    phase: "DESIGN",
    marketSpecific: true,
    localTerms: { fr: "Terrasse", en: "Covered patio / Veranda", fon: "Agbasa" },
  },
  {
    term: "Fondation",
    definition:
      "The foundation system — underground structural elements transferring building loads to the soil. In Benin's poteau-poutre construction, typically strip footings (semelles filantes) or pad footings (semelles isolees) in reinforced concrete. Depth depends on soil conditions — the terre de barre soils of the plateau offer excellent bearing capacity.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { fr: "Fondation", en: "Foundation", fon: "Dotentin" },
  },
];
