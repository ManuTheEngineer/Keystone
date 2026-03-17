import type { PhaseDefinition } from "../types";

/**
 * Ghana Construction Phases
 *
 * Adapted for the Ghanaian construction context: reinforced concrete
 * column-beam system with sandcrete block infill, predominantly cash-based
 * financing with some mortgage options emerging, and a mix of formal
 * and informal inspection processes.
 *
 * Key differences from Togo:
 * - Land acquisition uses the Lands Commission system (not titre foncier)
 * - Stool lands and family lands add complexity in Ashanti and other regions
 * - Building permits are issued by District/Municipal/Metropolitan Assemblies
 * - Some institutional lending exists but is limited and expensive
 * - The Ghana Building Code (GS 1207:2018) provides formal standards
 * - English is the official language, simplifying documentation
 */
export const GHANA_PHASES: PhaseDefinition[] = [
  // -------------------------------------------------------
  // Phase 0: DEFINE
  // -------------------------------------------------------
  {
    phase: "DEFINE",
    name: "Define",
    description:
      "Set your goals, research plot availability in your target area, and make an initial assessment of your savings and budget capacity.",
    typicalDurationWeeks: { min: 2, max: 4 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "This phase is about clarity. You will define what you want to build, where, and whether your financial situation realistically supports the project. In Ghana, building is a major family investment — take the time to research thoroughly before committing any money.",
    requiredDocuments: [
      "Project goals worksheet",
      "Preliminary budget estimate in GHS",
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
          "Establish a realistic budget range in GHS based on current construction costs per square meter in your target area, your available savings, and expected diaspora contributions or susu payouts.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Target area researched",
        description:
          "Research target neighborhoods for plot availability, price per plot or per acre, access to roads, water (GWCL), and electricity (ECG), and proximity to markets, schools, and health facilities.",
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
    name: "Finance",
    description:
      "Plan your financing strategy using cash savings, diaspora transfers, susu groups, and phased building. Mortgage options exist in Ghana but are limited and expensive.",
    typicalDurationWeeks: { min: 4, max: 16 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "In Ghana, most residential construction is self-financed. While mortgage products exist (from banks like GCB, Stanbic, Absa, Republic Bank, and the Home Finance Company), interest rates of 25-35% make them prohibitively expensive for most people. You build as fast as your money comes in. Many people build over 2-5 years, completing each phase as funds become available.",
    requiredDocuments: [
      "Savings plan and timeline",
      "Diaspora transfer schedule",
      "Susu or savings group records",
      "Phase-by-phase budget breakdown",
      "Mortgage pre-qualification letter (if applicable)",
    ],
    milestones: [
      {
        name: "Savings and income assessed",
        description:
          "Calculate your total available savings, monthly income allocation for construction, and expected diaspora remittances. If participating in a susu, note your expected payout schedule.",
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
          "Set up reliable money transfer channels (MTN Mobile Money, Vodafone Cash, WorldRemit, Sendwave, or bank transfer) and identify a trusted local representative to receive and manage funds if you are building from abroad.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 3,
      },
      {
        name: "Phase budget finalized",
        description:
          "Lock in a detailed budget for each construction phase with a contingency reserve of at least 15-20%. Construction costs in Ghana can fluctuate with cement prices, exchange rates, and inflation.",
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
    name: "Land",
    description:
      "Identify, verify, and purchase a plot of land, then register it at the Lands Commission. This is the highest-risk phase — land disputes are extremely common in Ghana and thorough verification is essential.",
    typicalDurationWeeks: { min: 8, max: 24 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "Land acquisition in Ghana is the most dangerous phase for disputes and fraud. Ghana operates a complex dual system of customary and statutory land tenure. Stool lands (held by chiefs on behalf of communities), family lands, and government-acquired lands each have different processes. You must conduct thorough due diligence at the Lands Commission, hire a licensed surveyor for a site plan, and register the land. Never buy land based solely on a verbal agreement or unregistered document.",
    requiredDocuments: [
      "Plot identification details",
      "Land title search report from Lands Commission",
      "Licensed surveyor's site plan",
      "Indenture (conveyance deed) or lease agreement",
      "Allocation note from stool/family (if applicable)",
      "Stamped indenture from Lands Commission",
      "Land registration certificate",
    ],
    milestones: [
      {
        name: "Plot identified",
        description:
          "Locate a suitable plot in your target area. Visit the site in person (or send a trusted representative), verify access roads, check for flooding risk, and confirm utility availability (ECG electricity, GWCL water).",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Land title search completed",
        description:
          "Conduct a search at the Lands Commission to verify ownership history, check for existing encumbrances, litigation, or competing claims. This is the most critical verification step. Engage a lawyer experienced in land matters to conduct the search.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Licensed surveyor engaged and site plan obtained",
        description:
          "Hire a licensed surveyor registered with the Ghana Institution of Surveyors to survey the plot, establish boundaries with pillars, and produce a site plan. The site plan is required for the building permit and land registration.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 2,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Price negotiated and agreed",
        description:
          "Negotiate the purchase price with the seller. Land prices in Greater Accra vary enormously — from GHS 30,000-80,000 per plot in peri-urban areas (Kasoa, Dodowa, Afienya) to GHS 200,000-1,000,000+ in prime areas (East Legon, Airport Residential, Cantonments).",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 4,
      },
      {
        name: "Indenture executed and stamped",
        description:
          "Have a lawyer draft the indenture (deed of conveyance or lease). Both buyer and seller sign before witnesses. The indenture is then taken to the Lands Commission for stamping and registration. Payment of stamp duty (typically 0.5% of property value) is required.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 15,
        verificationRequired: true,
        order: 5,
      },
      {
        name: "Land registration at Lands Commission",
        description:
          "Submit the stamped indenture, site plan, and supporting documents to the Lands Commission for registration. The process involves publication in the local newspapers for an opposition period, site inspection, and final registration. This can take 3-12 months.",
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
    name: "Design",
    description:
      "Work with an architect or draughtsman to create building plans adapted to your plot, budget, and Ghana's tropical climate. Most residential designs use the column-beam system with sandcrete block infill.",
    typicalDurationWeeks: { min: 4, max: 8 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "In Ghana, you can work with a registered architect (member of the Ghana Institute of Architects) for full professional service, or with a draughtsman for a simpler, less expensive plan. For buildings above single-storey, an architect and structural engineer are strongly recommended. The Ghana Building Code (GS 1207:2018) provides standards for structural design, materials, and safety.",
    requiredDocuments: [
      "Architectural drawings (site plan, floor plans, elevations, sections)",
      "Structural engineer's drawings and calculations",
      "Bill of quantities (BOQ)",
      "Technical specifications",
    ],
    milestones: [
      {
        name: "Architect or draughtsman engaged",
        description:
          "Select and hire an architect (GIA member) or draughtsman. An architect provides full professional oversight; a draughtsman produces plans only. For buildings over one storey or complex projects, an architect with a structural engineer is strongly recommended.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Preliminary design approved",
        description:
          "Review and approve the preliminary design showing room layout, dimensions, elevation appearance, and site positioning. This is your opportunity to request changes before detailed drawings are produced.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Construction drawings finalized",
        description:
          "Final architectural and structural drawings are complete, including site plan, floor plans, cross-sections, elevations, and structural details for columns, beams, and slab.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Bill of quantities prepared",
        description:
          "A detailed bill of quantities (BOQ) broken down by construction phase and material quantities. This is your budget reference document for the entire build and is essential for getting comparable quotes from contractors.",
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
    name: "Approve",
    description:
      "Obtain the building permit (development permit) from the District/Municipal/Metropolitan Assembly. In Greater Accra and other cities, this is a formal requirement enforced with increasing rigor.",
    typicalDurationWeeks: { min: 2, max: 8 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "A building permit (officially called a development permit) is legally required for all construction in Ghana under the Local Governance Act. The permit is issued by the Physical Planning Department of the relevant Metropolitan, Municipal, or District Assembly (MMDA). In Greater Accra, enforcement has increased significantly — buildings without permits can be demolished. The process requires architectural drawings, site plan, proof of land ownership, and payment of fees.",
    requiredDocuments: [
      "Permit application form",
      "Architectural drawings (minimum 4 copies)",
      "Site plan from licensed surveyor",
      "Proof of land ownership (indenture or land certificate)",
      "Structural engineer's report (for multi-storey)",
      "Environmental impact assessment (for large projects)",
      "Development permit (issued permit)",
    ],
    milestones: [
      {
        name: "Permit application submitted",
        description:
          "Submit the development permit application to the MMDA Physical Planning Department with all required documents: architectural drawings, site plan, proof of land ownership, and payment of processing fees.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 1,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Assembly review completed",
        description:
          "The MMDA Physical Planning Department and Technical Sub-Committee review the plans for compliance with local planning schemes, zoning rules, setbacks, and the Ghana Building Code. They may request modifications or additional documents.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Development permit issued",
        description:
          "The MMDA issues the development permit authorizing construction. The permit is valid for 2-5 years depending on the Assembly. Display the permit on the construction site as required by law.",
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
    name: "Assemble Team",
    description:
      "Hire your site foreman or contractor, masons, and key workers. In Ghana, hiring is primarily through personal referral, contractor associations, and word of mouth.",
    typicalDurationWeeks: { min: 2, max: 4 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "Your foreman or contractor is the most important hire. This person manages daily operations on the construction site, supervises workers, and coordinates material deliveries. In Ghana, you can hire a contractor (who provides a full team) or manage the build yourself with a foreman and individual tradespeople. Finding reliable people through trusted referrals is more important than finding the cheapest option.",
    requiredDocuments: [
      "Construction contract or agreement",
      "Bill of quantities with contractor pricing",
      "Material price quotes from suppliers",
      "Contact list for all workers and suppliers",
    ],
    milestones: [
      {
        name: "Contractor or foreman hired",
        description:
          "Identify and hire a contractor or site foreman through personal referrals. Visit their previous construction sites, talk to previous clients, and agree on rates, responsibilities, and reporting expectations.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Key workers identified",
        description:
          "Identify the core team: experienced mason, steel bender (iron bender), and laborers. The contractor or foreman typically brings their own trusted team.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Material suppliers selected",
        description:
          "Identify reliable suppliers for cement (the largest single material cost), steel reinforcement bars, sand, chippings (gravel), and sandcrete blocks. Compare prices and verify quality. Major cement brands in Ghana include GHACEM, Diamond Cement, and Dangote.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Construction agreement signed",
        description:
          "Sign a written agreement with the contractor covering scope of work, rates, payment schedule tied to milestones, material procurement responsibilities, and timeline expectations.",
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
    name: "Build",
    description:
      "Physical construction following the column-beam sequence. This phase is often done incrementally as funds become available, and may span several months to several years.",
    typicalDurationWeeks: { min: 24, max: 52 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "Construction in Ghana follows the column-beam sequence: earthwork, foundation, sub-base, columns, walls, ring beams, slab, roof structure, roofing, then interior finishes. Each concrete pour (foundation, columns, ring beams, slab) is a critical quality checkpoint — rebar must be inspected before concrete is placed. Many builders pause between phases to accumulate funds. Avoid pouring concrete during heavy rainstorms as water dilutes the mix and weakens the result.",
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
        name: "Earthwork complete",
        description:
          "Site cleared, leveled, and compacted. Building lines set out by the surveyor or architect according to the site plan. Boundary alignment confirmed.",
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
        name: "Sub-base complete",
        description:
          "Sub-base walls built from foundation level to ground level using 8-inch sandcrete blocks. Backfilled and compacted. Bottom ring beam poured on top of sub-base.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Columns poured",
        description:
          "All reinforced concrete columns poured up to lintel or slab level. Rebar must be inspected before each column pour. Columns must be plumb — check with a spirit level. Allow proper curing time.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 4,
      },
      {
        name: "Walls up (block work)",
        description:
          "Sandcrete block walls laid between columns to full height. Lintels poured above door and window openings. Provision left for electrical conduits and plumbing pipes.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 8,
        verificationRequired: true,
        order: 5,
      },
      {
        name: "Top ring beam poured",
        description:
          "Horizontal reinforced concrete ring beam poured along the top of all walls, tying the structure together. Inspect rebar before pouring — this is a critical structural element.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 6,
      },
      {
        name: "Slab poured",
        description:
          "Upper floor slab (if multi-storey) or roof slab poured. For hollow-pot slab systems, blocks and ribs are placed, rebar mesh laid, and concrete poured. This is the largest single pour — coordinate enough workers, concrete mixer or ready-mix delivery, and good weather.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 10,
        verificationRequired: true,
        order: 7,
      },
      {
        name: "Roof structure installed",
        description:
          "Wood or steel roof trusses and rafters installed on top of the ring beam or slab. Roof pitch and overhang set according to the architectural drawings.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 8,
      },
      {
        name: "Roofing complete",
        description:
          "Roofing sheets (aluminum or galvanized steel) installed with proper fixings. Ridge cap and flashing installed. The building is now protected from rain — a major milestone.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 9,
      },
      {
        name: "Plastering complete",
        description:
          "Interior and exterior walls rendered with cement plaster. Electrical conduits must be installed in walls before plastering. Walls must be kept wet during curing to prevent cracking.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 10,
      },
      {
        name: "Tiling complete",
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
          "All PVC supply and drainage pipes installed, sanitary fixtures (WC, basin, shower) connected, polytank and pump system operational. Test all connections for leaks before closing walls.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 12,
      },
      {
        name: "Electrical installed",
        description:
          "All wiring run in conduit, switches, outlets, and distribution board installed. Connection to ECG grid via meter. Test all circuits. Verify proper earth connection.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 13,
      },
      {
        name: "Doors and windows installed",
        description:
          "All doors, windows, and burglar-proof bars installed. Frames sealed against water infiltration. Locks and hardware functional.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 14,
      },
      {
        name: "Painting complete",
        description:
          "Interior and exterior walls primed and painted. At least two coats applied over undercoat. Exterior paint must be weather-grade. Touch-ups completed after all other trades finish.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: true,
        order: 15,
      },
      {
        name: "Compound wall and gate complete",
        description:
          "Perimeter (compound) wall built, rendered, and painted. Vehicular and pedestrian gates installed. This may be done earlier in the project to secure the site.",
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
    name: "Verify",
    description:
      "Final inspection by the architect, detailed owner walkthrough, and preparation of a completion certificate. Ghana's formal inspection system is developing but most residential buildings rely on architect and owner verification.",
    typicalDurationWeeks: { min: 1, max: 3 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "Ghana's formal building inspection system is still developing. The MMDA may conduct inspections during construction, but for most residential buildings the verification phase relies on your architect (if you hired one) doing a final review and you personally walking through every room checking for defects. Document everything with photos and create a written snag list for the contractor to correct.",
    requiredDocuments: [
      "Completion certificate from architect",
      "Snag list (defects list)",
      "Final progress photos",
      "Habitation certificate from MMDA (where required)",
    ],
    milestones: [
      {
        name: "Architect walkthrough completed",
        description:
          "If an architect was involved, they perform a final inspection of the building to verify it matches the approved plans and meets quality standards. They note any deficiencies for correction.",
        requiresInspection: true,
        requiresPayment: false,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Owner walkthrough completed",
        description:
          "Walk through every room with the contractor or foreman. Test every switch, outlet, tap, and door. Check for cracks, uneven tiles, paint defects, and water leaks. Document all issues with photos.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Snag list items corrected",
        description:
          "The contractor corrects all deficiencies identified during the walkthrough. Verify each correction before signing off. Withhold final payment until all items are resolved.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Completion certificate signed",
        description:
          "Sign a completion certificate documenting that the building has been received by the owner, with or without outstanding items. This triggers the start of any warranty period. Apply for a habitation certificate from the MMDA if required in your area.",
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
    name: "Operate",
    description:
      "Move in, begin renting, or continue finishing the property over time. Establish property management and maintenance routines, especially important for diaspora owners managing from abroad.",
    typicalDurationWeeks: { min: 4, max: 52 },
    constructionMethod: "Column-beam (reinforced concrete frame with sandcrete block infill)",
    educationSummary:
      "Your building is complete but the work continues. In Ghana, many owners continue adding finishes, building extensions, or improving the property over years. If you are renting, you need a reliable property manager or agent — especially if you live abroad. Tropical climate maintenance (painting, waterproofing, termite treatment) is an ongoing requirement.",
    requiredDocuments: [
      "Tenancy agreement (if renting)",
      "Property management agreement (if applicable)",
      "Utility connection confirmations (ECG, GWCL)",
      "Maintenance schedule",
      "Insurance policy (if applicable)",
      "Land title certificate (when issued)",
    ],
    milestones: [
      {
        name: "Move-in or tenant placed",
        description:
          "The owner moves in, or a tenant is found and a tenancy agreement is signed. Utilities (ECG electricity, GWCL water) are connected or transferred to the occupant's name.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Property manager appointed (if diaspora)",
        description:
          "If the owner lives abroad, appoint a trusted local property manager or estate agent to handle tenant relations, collect rent, manage repairs, and provide regular photo updates of the property's condition.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Maintenance schedule established",
        description:
          "Set up a recurring maintenance schedule: annual exterior paint inspection, gutter cleaning before rainy season, septic tank desludging every 2-3 years, termite inspection, and generator/inverter servicing.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 3,
      },
      {
        name: "Land title certificate received",
        description:
          "Follow up on the land registration submitted during the LAND phase. The land title certificate is the definitive proof of land ownership and should be stored securely (bank safe deposit box or with your lawyer).",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 4,
      },
    ],
  },
];
