import type { PhaseDefinition } from "../types";

/**
 * Togo Construction Phases
 *
 * Adapted for the Togolese construction context: reinforced concrete
 * poteau-poutre (column-beam) system with block infill, cash-based
 * financing, and informal inspection processes.
 *
 * Key differences from USA:
 * - No institutional lending — projects are funded by cash savings,
 *   diaspora remittances, and tontine groups
 * - Land acquisition involves the titre foncier process (6-24 months)
 * - Construction is often done in phases over months or years as funds
 *   become available
 * - Inspections are largely informal (no building department system)
 * - The BUILD phase follows the poteau-poutre construction sequence
 */
export const TOGO_PHASES: PhaseDefinition[] = [
  // -------------------------------------------------------
  // Phase 0: DEFINE
  // -------------------------------------------------------
  {
    phase: "DEFINE",
    name: "Definir",
    description:
      "Set your goals, research plot availability in your target area, and make an initial assessment of your savings and budget capacity.",
    typicalDurationWeeks: { min: 2, max: 4 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "This phase is about clarity. You will define what you want to build, where, and whether your financial situation realistically supports the project. In Togo, building is a major family investment — take the time to research thoroughly before committing any money.",
    requiredDocuments: [
      "Project goals worksheet",
      "Preliminary budget estimate in CFA",
      "Target neighborhood research notes",
      "Family needs assessment",
    ],
    milestones: [
      {
        name: "Goals and purpose defined",
        description:
          "Document the purpose of the build (personal residence, rental income, or future sale) and key requirements such as number of rooms, location preferences, and must-have features.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Preliminary budget range set",
        description:
          "Establish a realistic budget range in CFA based on current construction costs per square meter in your target area, your available savings, and expected diaspora contributions or tontine payouts.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Target area researched",
        description:
          "Research target neighborhoods for plot availability, price per square meter of land, access to roads, water, and electricity, and proximity to markets, schools, and health facilities.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 3,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 1: FINANCE
  // -------------------------------------------------------
  {
    phase: "FINANCE",
    name: "Financer",
    description:
      "Plan your financing strategy using cash savings, diaspora transfers, tontine groups, and phased building. There are no construction loans in Togo — your building speed is determined by your cash flow.",
    typicalDurationWeeks: { min: 4, max: 16 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "In Togo, construction is self-financed. There are no bank construction loans available to most individuals. You build as fast as your money comes in. Many people build over 2-5 years, completing each phase as funds become available. This is normal and expected — plan for it rather than fighting it.",
    requiredDocuments: [
      "Savings plan and timeline",
      "Diaspora transfer schedule",
      "Tontine participation records",
      "Phase-by-phase budget breakdown",
      "Currency exchange rate tracking",
    ],
    milestones: [
      {
        name: "Savings and income assessed",
        description:
          "Calculate your total available savings, monthly income allocation for construction, and expected diaspora remittances. If participating in a tontine, note your expected payout schedule.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Phased building strategy developed",
        description:
          "Create a realistic phase-by-phase building plan that matches your cash flow. Identify which construction phases you can fund immediately and which will require saving periods in between.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Transfer channels established",
        description:
          "Set up reliable money transfer channels (Wave, Western Union, MoneyGram, or bank transfer) and identify a trusted local representative to receive and manage funds if you are building from abroad.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 3,
      },
      {
        name: "Phase budget finalized",
        description:
          "Lock in a detailed budget for each construction phase with a contingency reserve of at least 15-20%. Construction costs in Togo can fluctuate with cement prices and exchange rates.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 4,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 2: LAND
  // -------------------------------------------------------
  {
    phase: "LAND",
    name: "Terrain",
    description:
      "Identify, verify, and purchase a plot of land, then begin the critical titre foncier (land title) process. This is the highest-risk phase — land fraud is common and the verification process is essential.",
    typicalDurationWeeks: { min: 8, max: 24 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "Land acquisition in Togo is the most dangerous phase for fraud. You must verify the ownership chain, hire a geometre (surveyor) for the plan cadastral, and go through the formal titre foncier process. Never buy land based solely on a verbal agreement or a simple acte de vente — the titre foncier is the only legally conclusive proof of ownership.",
    requiredDocuments: [
      "Parcelle identification details",
      "Ownership chain verification documents",
      "Plan cadastral from geometre",
      "Acte de vente (notarized sale deed)",
      "Titre foncier application",
      "Chef de quartier attestation",
      "Payment receipts for all transactions",
    ],
    milestones: [
      {
        name: "Parcelle identified",
        description:
          "Locate a suitable plot in your target area. Visit the site in person (or send a trusted representative), verify access roads, check for flooding risk, and confirm utility availability (CEET electricity, TdE water).",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Ownership chain verified",
        description:
          "Investigate the full ownership history of the land. Check with the chef de quartier, verify at the Direction des Affaires Domaniales, and confirm no competing claims or litigation exists. This step prevents the most common land fraud.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Geometre hired and plan cadastral obtained",
        description:
          "Hire a licensed geometre (surveyor) to measure the plot, establish boundaries with markers (bornes), and produce a plan cadastral (official boundary map) required for the titre foncier application.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 2,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Price negotiated and agreed",
        description:
          "Negotiate the purchase price with the seller. Land prices in Lome vary enormously by quartier — from 15,000 CFA/sqm in peri-urban areas to over 100,000 CFA/sqm in prime neighborhoods like Cite OUA or Tokoin.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 4,
      },
      {
        name: "Acte de vente signed at notaire",
        description:
          "Sign the official sale deed (acte de vente) at a notaire's office. Both buyer and seller must be present with valid ID. The notaire verifies identities, witnesses the transaction, and records the sale. Payment is typically made at this point.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 15,
        verificationRequired: true,
        order: 5,
      },
      {
        name: "Titre foncier application filed",
        description:
          "Submit the titre foncier (land title) application to the Service des Domaines with all supporting documents. This begins the official registration process, which includes publication, opposition period, and final issuance. The process takes 6-24 months.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: true,
        order: 6,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 3: DESIGN
  // -------------------------------------------------------
  {
    phase: "DESIGN",
    name: "Conception",
    description:
      "Work with an architect or dessinateur to create building plans adapted to your plot, budget, and the Togolese climate. Most residential designs follow established layouts suited to tropical living.",
    typicalDurationWeeks: { min: 4, max: 8 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "In Togo, you can work with a registered architect (architecte agree) for a full professional service, or with a dessinateur (draftsperson) for a simpler, less expensive plan. Most residential homes follow standard tropical layouts with cross-ventilation, covered terrasses, and the poteau-poutre structural system.",
    requiredDocuments: [
      "Architectural plans (plan de masse, plans de niveaux, facades, coupes)",
      "Structural calculations (note de calcul)",
      "Devis estimatif (cost estimate)",
      "Descriptif technique (technical specifications)",
    ],
    milestones: [
      {
        name: "Architect or dessinateur engaged",
        description:
          "Select and hire an architect or dessinateur. An architect provides full professional oversight; a dessinateur produces plans only. For buildings over R+1 (ground + 1 floor) or complex projects, an architect is strongly recommended.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Preliminary plans (avant-projet) approved",
        description:
          "Review and approve the preliminary design showing room layout, dimensions, facade appearance, and site positioning. This is your opportunity to request changes before detailed plans are drawn.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Construction plans finalized",
        description:
          "Final architectural and structural plans are complete, including the plan de masse (site plan), floor plans, cross-sections, facades, and structural details for columns, beams, and slab.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Devis estimatif prepared",
        description:
          "A detailed cost estimate (devis estimatif) broken down by construction phase and material quantities. This is your budget reference document for the entire build.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 4,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 4: APPROVE
  // -------------------------------------------------------
  {
    phase: "APPROVE",
    name: "Autorisation",
    description:
      "Obtain the permis de construire (building permit) from the mairie. In Lome, this is a formal requirement; in rural areas, the process may be less rigorous or not enforced.",
    typicalDurationWeeks: { min: 2, max: 6 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "The permis de construire is legally required for all construction in urban areas of Togo. In Lome, the process goes through the mairie (city hall) and requires architectural plans, proof of land ownership, and payment of fees. In rural areas, the requirement exists on paper but is rarely enforced — however, obtaining one protects you legally.",
    requiredDocuments: [
      "Demande de permis de construire (application form)",
      "Architectural plans (4 copies minimum)",
      "Titre foncier or acte de vente",
      "Plan cadastral",
      "Tax receipts (quittances fiscales)",
      "Permis de construire (issued permit)",
    ],
    milestones: [
      {
        name: "Permit application submitted",
        description:
          "Submit the permis de construire application to the mairie with all required documents: architectural plans, proof of land ownership (titre foncier or acte de vente), plan cadastral, and payment of fees.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 1,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Municipal review completed",
        description:
          "The mairie technical services review the plans for compliance with urban planning rules (setbacks, height limits, building density). They may request modifications or additional documents.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Permis de construire issued",
        description:
          "The mairie issues the permis de construire, authorizing construction to begin. The permit is typically valid for 2-3 years. Display the permit visibly on the construction site.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 5: ASSEMBLE
  // -------------------------------------------------------
  {
    phase: "ASSEMBLE",
    name: "Equipe",
    description:
      "Hire your chef de chantier (site foreman), masons, and key workers. In Togo, hiring is primarily through personal referral and reputation in the community.",
    typicalDurationWeeks: { min: 2, max: 4 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "Your chef de chantier is the most important hire. This person manages daily operations on the construction site, supervises workers, and coordinates material deliveries. Finding a reliable chef de chantier through trusted referrals is more important than finding the cheapest one. Workers are hired on a daily wage (journalier) basis — there are no formal employment contracts in most cases.",
    requiredDocuments: [
      "Contrat de construction (construction agreement)",
      "Devis from chef de chantier",
      "Material price quotes from suppliers",
      "Contact list for all workers and suppliers",
    ],
    milestones: [
      {
        name: "Chef de chantier hired",
        description:
          "Identify and hire a chef de chantier (site foreman) through personal referrals. Visit their previous construction sites, talk to previous clients, and agree on daily or weekly rate, responsibilities, and reporting expectations.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Key workers identified",
        description:
          "Identify the core team: experienced macon (mason), ferrailleur (rebar worker), and manoeuvres (laborers). The chef de chantier typically brings their own trusted team.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Material suppliers selected",
        description:
          "Identify reliable suppliers for cement (the largest single material cost), rebar (fer), sand (sable), gravel (gravier), and blocks (agglo). Compare prices and verify quality. Establish credit terms if possible.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Construction agreement signed",
        description:
          "Sign a written agreement with the chef de chantier or entreprise (construction company) covering scope, daily rates, payment schedule, material procurement responsibilities, and timeline expectations.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 2,
        verificationRequired: true,
        order: 4,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 6: BUILD
  // -------------------------------------------------------
  {
    phase: "BUILD",
    name: "Construction",
    description:
      "Physical construction following the poteau-poutre sequence. This phase is often done incrementally as funds become available, and may span several months to several years.",
    typicalDurationWeeks: { min: 24, max: 52 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "Construction in Togo follows the poteau-poutre (column-beam) sequence: earthwork, foundation, sub-base, columns, walls, ring beams, slab, roof structure, roofing, then interior finishes. Each concrete pour (foundation, columns, ring beams, slab) is a critical quality checkpoint — rebar must be inspected before concrete is placed. Many builders pause between phases to accumulate funds. Avoid pouring concrete during heavy rainstorms as water dilutes the mix and weakens the result.",
    requiredDocuments: [
      "Daily work log with photos",
      "Material purchase receipts",
      "Payment receipts for workers",
      "Progress photos (timestamped)",
      "Concrete pour records",
      "Rebar inspection notes",
    ],
    milestones: [
      {
        name: "Terrassement complete",
        description:
          "Site cleared, leveled, and compacted. Building lines (implantation) marked out by the geometre or architect according to the plan de masse. Boundary alignment confirmed.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 2,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Foundation poured",
        description:
          "Foundation trenches excavated, rebar cages placed and inspected, formwork set, and concrete poured. Allow minimum 7 days curing before loading. Take photos of rebar before concrete pour as evidence.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 8,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Soubassement complete",
        description:
          "Sub-base walls built from foundation level to ground level using agglo de 20. Backfilled and compacted. Chainage bas (low ring beam) poured on top of soubassement.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Columns poured (poteaux)",
        description:
          "All reinforced concrete columns poured up to lintel or slab level. Rebar must be inspected before each column pour. Columns must be plumb (vertical) — check with a level. Allow proper curing time.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 4,
      },
      {
        name: "Walls up (elevation)",
        description:
          "Concrete block walls (agglo) laid between columns to full height. Lintels poured above door and window openings. Provision left for electrical conduits and plumbing pipes.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 8,
        verificationRequired: true,
        order: 5,
      },
      {
        name: "Ring beams poured (chainage haut)",
        description:
          "Horizontal reinforced concrete ring beams poured along the top of all walls, tying the structure together. This is a critical structural element — inspect rebar before pouring.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 6,
      },
      {
        name: "Slab poured (dalle)",
        description:
          "Upper floor slab (if multi-story) or roof slab poured. For hourdis slab systems, blocks and poutrelles are placed, rebar mesh laid, and concrete poured. This is the largest single pour — coordinate enough workers, a concrete mixer or delivery, and good weather.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 10,
        verificationRequired: true,
        order: 7,
      },
      {
        name: "Roof structure installed (charpente)",
        description:
          "Wood or steel roof trusses and rafters installed on top of the chainage haut or slab. Roof pitch and overhang set according to the architectural plans.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 8,
      },
      {
        name: "Roofing complete (couverture)",
        description:
          "Roofing sheets (bac alu or tole) installed with proper fixings. Ridge cap (faitiere) and flashing installed. The building is now protected from rain — a major milestone.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 9,
      },
      {
        name: "Plastering complete (enduit)",
        description:
          "Interior and exterior walls rendered with cement plaster. Electrical conduits must be installed in walls before plastering. Walls must be kept wet during curing to prevent cracking.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 10,
      },
      {
        name: "Tiling complete (carrelage)",
        description:
          "Floor tiles laid throughout the house, wall tiles in bathrooms and kitchen. Joints grouted and cleaned. Check for level and alignment before grout sets.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 11,
      },
      {
        name: "Plumbing installed",
        description:
          "All PVC supply and drainage pipes installed, sanitary fixtures (WC, lavabo, douche) connected, water tank and pump system operational. Test all connections for leaks before closing walls.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 12,
      },
      {
        name: "Electrical installed",
        description:
          "All wiring run in conduit, switches, outlets, and breaker panel installed. Connection to CEET grid via compteur. Test all circuits before closing up. Verify proper earth/ground connection.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 13,
      },
      {
        name: "Doors and windows installed (menuiserie)",
        description:
          "All doors, windows, and security grilles installed. Frames sealed against water infiltration. Locks and hardware functional.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 14,
      },
      {
        name: "Painting complete (peinture)",
        description:
          "Interior and exterior walls primed and painted. At least two coats applied over primer. Exterior paint must be weather-grade. Touch-ups completed after all other trades finish.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: true,
        order: 15,
      },
      {
        name: "Perimeter wall and gate complete (cloture)",
        description:
          "Perimeter wall built, rendered, and painted. Vehicular and pedestrian gates installed. This may be done earlier in the project to secure the site.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 16,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 7: VERIFY
  // -------------------------------------------------------
  {
    phase: "VERIFY",
    name: "Verification",
    description:
      "Informal inspection by the architect, detailed owner walkthrough, and preparation of the proces-verbal de reception. Togo does not have a formal certificate of occupancy system for most residential buildings.",
    typicalDurationWeeks: { min: 1, max: 3 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "Unlike the USA, Togo does not have a formal building inspection system for most residential construction. The verification phase relies on your architect (if you hired one) doing a final review, and you personally walking through every room checking for defects. Document everything with photos and create a written punch list for the chef de chantier to correct.",
    requiredDocuments: [
      "Proces-verbal de reception provisoire",
      "Punch list (liste des reserves)",
      "Final progress photos",
      "Attestation de conformite (if architect involved)",
    ],
    milestones: [
      {
        name: "Architect walkthrough completed",
        description:
          "If an architect was involved, they perform a final inspection of the building to verify it matches the approved plans and meets basic quality standards. They note any deficiencies for correction.",
        requiresInspection: true,
        requiresPayment: false,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Owner walkthrough completed",
        description:
          "Walk through every room with the chef de chantier. Test every switch, outlet, faucet, and door. Check for cracks, uneven tiles, paint defects, and water leaks. Document all issues with photos.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Punch list items corrected",
        description:
          "The chef de chantier corrects all deficiencies identified during the walkthrough. Verify each correction before signing off. Withhold final payment until all items are resolved.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Proces-verbal de reception signed",
        description:
          "Sign the proces-verbal de reception provisoire — a formal document recording that the building has been received by the owner, with or without reserves (pending corrections). This triggers the start of the garantie decennale (10-year warranty) if an architect is involved.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 4,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 8: OPERATE
  // -------------------------------------------------------
  {
    phase: "OPERATE",
    name: "Exploitation",
    description:
      "Move in, begin renting, or continue finishing the property over time. Establish property management and maintenance routines, especially important for diaspora owners managing from abroad.",
    typicalDurationWeeks: { min: 4, max: 52 },
    constructionMethod: "Poteau-poutre (reinforced concrete column-beam frame with block infill)",
    educationSummary:
      "Your building is complete but the work is not over. In Togo, many owners continue adding finishes, building annexes, or improving the property over years. If you are renting, you need a reliable property manager — especially if you live abroad. Tropical climate maintenance (painting, waterproofing, termite treatment) is an ongoing requirement.",
    requiredDocuments: [
      "Contrat de bail (rental lease, if applicable)",
      "Property management agreement (if applicable)",
      "Utility connection confirmations (CEET, TdE)",
      "Maintenance schedule",
      "Insurance policy (if applicable)",
      "Titre foncier (final, when issued)",
    ],
    milestones: [
      {
        name: "Move-in or tenant placed",
        description:
          "The owner moves in, or a tenant is found and a contrat de bail (lease agreement) is signed. Utilities (CEET electricity, TdE water) are transferred to the occupant's name.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Property manager appointed (if diaspora)",
        description:
          "If the owner lives abroad, appoint a trusted local property manager to handle tenant relations, collect rent, manage repairs, and provide regular photo updates of the property's condition.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Maintenance schedule established",
        description:
          "Set up a recurring maintenance schedule: annual exterior repaint inspection, gutter cleaning before rainy season, septic tank pumping every 2-3 years, termite inspection, and generator/inverter servicing.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 3,
      },
      {
        name: "Titre foncier received",
        description:
          "Follow up on the titre foncier application filed during the LAND phase. The final titre foncier document is the definitive proof of land ownership and should be stored securely (bank vault or with your notaire).",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 4,
      },
    ],
  },
];
