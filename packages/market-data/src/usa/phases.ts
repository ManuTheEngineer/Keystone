import type { PhaseDefinition } from "../types";

export const USA_PHASES: PhaseDefinition[] = [
  // -------------------------------------------------------
  // Phase 0: DEFINE
  // -------------------------------------------------------
  {
    phase: "DEFINE",
    name: "Define",
    description:
      "Set project goals, research your options, and establish a preliminary budget range before committing any money.",
    typicalDurationWeeks: { min: 2, max: 4 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "This phase is about clarity. You will define what you want to build, why you want to build it, and whether the numbers make rough sense before spending a dollar.",
    requiredDocuments: [
      "Project goals worksheet",
      "Preliminary budget spreadsheet",
      "Location research notes",
      "Needs vs. wants checklist",
    ],
    milestones: [
      {
        name: "Goals and purpose defined",
        description:
          "Document the purpose of the build (primary residence, rental income, resale) and key requirements such as size, bedrooms, and must-have features.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Preliminary budget range set",
        description:
          "Establish a realistic high-low budget range based on local cost benchmarks, your financial capacity, and the scope of the project.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Market and location research complete",
        description:
          "Research target areas for land availability, zoning compatibility, school districts, utilities access, and neighborhood comps.",
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
      "Secure financing by reviewing your credit, getting pre-approved, selecting a loan product, and documenting proof of funds.",
    typicalDurationWeeks: { min: 4, max: 8 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "Financing a new-construction home is different from buying an existing one. You will likely need a construction loan that converts to a permanent mortgage, and lenders will scrutinize your plans and builder qualifications.",
    requiredDocuments: [
      "Credit report",
      "Tax returns (2 years)",
      "Bank statements (2-3 months)",
      "Pay stubs or income documentation",
      "Pre-approval letter",
      "Loan estimate (LE)",
      "Proof of funds for down payment",
    ],
    milestones: [
      {
        name: "Credit and finances reviewed",
        description:
          "Pull your credit report, calculate your debt-to-income ratio (DTI), and identify any issues that need to be resolved before applying for a loan.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Lender pre-approval obtained",
        description:
          "Submit a loan application to one or more lenders and receive a pre-approval letter stating the maximum amount you qualify to borrow.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Loan type selected",
        description:
          "Choose the financing product that best fits your situation: construction-to-permanent loan, FHA construction loan, VA construction loan, or cash self-funding.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 3,
      },
      {
        name: "Final budget established",
        description:
          "Lock in a detailed project budget that aligns with your approved loan amount, including contingency reserves of at least 10-15%.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 4,
      },
      {
        name: "Proof of funds documented",
        description:
          "Compile and verify all documentation proving you have the required down payment, closing costs, and contingency reserves available.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 5,
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
      "Find, evaluate, and purchase a buildable lot that meets your project requirements and passes all due-diligence checks.",
    typicalDurationWeeks: { min: 4, max: 12 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "Not every piece of land is buildable. You must verify zoning, utilities access, soil conditions, flood zone status, and clear title before purchasing.",
    requiredDocuments: [
      "Property listing or MLS sheet",
      "Boundary survey / plat",
      "Title search report",
      "Title insurance commitment",
      "Soil / geotechnical report",
      "Percolation test results (if septic)",
      "Flood zone determination",
      "Purchase and sale agreement",
      "Closing disclosure (CD)",
      "Recorded deed",
    ],
    milestones: [
      {
        name: "Lot identified and evaluated",
        description:
          "Select a candidate lot and perform initial evaluation: zoning verification, flood zone check, setback requirements, utility availability, and access.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Survey completed",
        description:
          "Hire a licensed surveyor to produce a boundary survey showing property lines, easements, setbacks, and topographic features.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 2,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Title search clear",
        description:
          "A title company has searched public records and confirmed the property has no outstanding liens, encumbrances, or ownership disputes.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Soil/perc test passed",
        description:
          "A geotechnical engineer has tested soil bearing capacity, and (if on septic) a percolation test confirms the lot can support a septic system.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 1,
        verificationRequired: true,
        order: 4,
      },
      {
        name: "Purchase agreement signed",
        description:
          "Buyer and seller have executed a purchase and sale agreement with appropriate contingencies (financing, inspection, survey).",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 5,
      },
      {
        name: "Closing completed",
        description:
          "Title has transferred, deed is recorded, and you are the legal owner of the lot. Funds have been disbursed through escrow.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
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
      "Develop architectural plans, structural engineering, material selections, and energy calculations for your home.",
    typicalDurationWeeks: { min: 6, max: 12 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "During the design phase an architect or designer translates your requirements into construction documents that builders can price and build from, and that the building department will review for code compliance.",
    requiredDocuments: [
      "Schematic design drawings",
      "Construction documents (full plan set)",
      "Structural engineering calculations and drawings",
      "Energy compliance report (Title 24, IECC, or state equivalent)",
      "Material specification sheets",
      "Interior finish schedule",
      "Site plan with grading",
    ],
    milestones: [
      {
        name: "Schematic design approved",
        description:
          "The architect has produced floor plans, elevations, and a site plan that you have reviewed and approved before moving to detailed drawings.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 3,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Construction documents completed",
        description:
          "A complete set of construction documents (CDs) is ready, including architectural, structural, mechanical, electrical, and plumbing sheets.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Structural engineering signed",
        description:
          "A licensed structural engineer has designed and stamped the foundation, framing, and lateral-load systems for your specific site conditions.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Material selections finalized",
        description:
          "All major materials have been selected: roofing, siding, windows, doors, flooring, countertops, cabinetry, fixtures, and appliances.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 4,
      },
      {
        name: "Energy calculations completed",
        description:
          "Energy compliance documentation (Manual J, Manual D, IECC compliance, or state-specific equivalent) has been prepared and is ready for permit submittal.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 5,
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
      "Submit plans for review, address corrections, and obtain all required permits and approvals before breaking ground.",
    typicalDurationWeeks: { min: 4, max: 8 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "Your local building department must review and approve your plans before construction can begin. This process ensures your design meets safety codes and zoning requirements.",
    requiredDocuments: [
      "Building permit application",
      "Plan review comment letter",
      "Plan review correction responses",
      "Issued building permit",
      "Utility connection applications",
      "Stormwater management plan (if required)",
      "HOA architectural review application (if applicable)",
      "HOA approval letter (if applicable)",
      "Driveway / curb cut permit (if required)",
    ],
    milestones: [
      {
        name: "Permit application submitted",
        description:
          "Construction documents and all required supplemental documents have been submitted to the building department for plan review.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 1,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Plan review corrections addressed",
        description:
          "Any comments or corrections from the plan reviewer have been resolved with your architect/engineer and resubmitted.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Building permit issued",
        description:
          "The building department has approved your plans and issued a building permit, authorizing construction to begin.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 2,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Utility connections confirmed",
        description:
          "Water, sewer (or septic approval), electric, and gas providers have confirmed availability and scheduled connection or tap fees are paid.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 1,
        verificationRequired: true,
        order: 4,
      },
      {
        name: "HOA approval obtained (if applicable)",
        description:
          "If the lot is within a homeowners association, the architectural review committee has approved your exterior design, materials, and colors.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 5,
      },
    ],
  },

  // -------------------------------------------------------
  // Phase 5: ASSEMBLE
  // -------------------------------------------------------
  {
    phase: "ASSEMBLE",
    name: "Assemble",
    description:
      "Hire your general contractor or subcontractors, finalize contracts, obtain insurance, and prepare for the start of construction.",
    typicalDurationWeeks: { min: 4, max: 8 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "Before breaking ground you need a signed contract with your builder, proof of insurance, a detailed construction schedule, and long-lead materials ordered so work is not delayed.",
    requiredDocuments: [
      "Bid comparison spreadsheet",
      "General contractor agreement or subcontractor contracts",
      "Scope of work documents",
      "Builder's risk insurance policy",
      "General liability insurance certificate",
      "Workers' compensation certificate",
      "Construction schedule / Gantt chart",
      "Material purchase orders",
      "Lien waiver templates",
    ],
    milestones: [
      {
        name: "GC or subcontractors contracted",
        description:
          "You have collected bids, checked references and licenses, and signed a construction contract that includes scope, schedule, payment terms, and change-order process.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Builder's risk insurance obtained",
        description:
          "A builder's risk insurance policy is in place to cover the structure, materials, and equipment on site during construction.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 1,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Construction schedule finalized",
        description:
          "The builder has produced a detailed construction schedule showing every major task, milestone, inspection, and payment draw from start to completion.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Pre-construction meeting held",
        description:
          "A formal pre-construction meeting has been conducted with the builder, key subcontractors, and you to review the scope, schedule, communication plan, and site logistics.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 4,
      },
      {
        name: "Material orders placed",
        description:
          "Long-lead-time materials (windows, trusses, custom cabinetry, specialty items) have been ordered to prevent construction delays.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 5,
        verificationRequired: true,
        order: 5,
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
      "Physical construction of the home from site work through finishing, including all inspections and payment draws.",
    typicalDurationWeeks: { min: 20, max: 40 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "This is the longest and most expensive phase. Work proceeds in a specific sequence because each trade depends on the one before it. Inspections are mandatory at key points before work can be covered up.",
    requiredDocuments: [
      "Daily construction logs",
      "Inspection reports / green tags",
      "Draw request forms",
      "Lien waivers (conditional and unconditional)",
      "Change order documents",
      "Material delivery receipts",
      "Progress photos (timestamped, geotagged)",
      "Subcontractor invoices",
      "Testing reports (concrete, compaction, etc.)",
    ],
    milestones: [
      {
        name: "Site cleared and graded",
        description:
          "Trees removed, topsoil stripped and stockpiled, rough grading completed to plan elevations, erosion control measures installed.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Foundation poured and cured",
        description:
          "Footings and foundation walls (or slab) poured per structural plans. Concrete has cured to required strength. Foundation survey confirms dimensions.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 10,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Framing complete and dried-in",
        description:
          "All walls, floors, roof structure, and sheathing are installed. Roof underlayment and house wrap are on, making the structure weather-tight.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 20,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Rough plumbing installed",
        description:
          "All supply and drain lines are roughed in within walls and floors, including tub/shower valves set, and water heater connections stubbed.",
        requiresInspection: true,
        requiresPayment: false,
        verificationRequired: true,
        order: 4,
      },
      {
        name: "Rough electrical installed",
        description:
          "All wiring, boxes, panel, and low-voltage rough-in (data, cable, security) are installed per electrical plans before walls are closed.",
        requiresInspection: true,
        requiresPayment: false,
        verificationRequired: true,
        order: 5,
      },
      {
        name: "Rough HVAC installed",
        description:
          "Ductwork, refrigerant lines, and gas piping are installed. Equipment pads and flue venting are in place.",
        requiresInspection: true,
        requiresPayment: false,
        verificationRequired: true,
        order: 6,
      },
      {
        name: "Rough-in inspection passed",
        description:
          "The building inspector has verified all rough plumbing, electrical, HVAC, and framing and issued approval to close walls.",
        requiresInspection: true,
        requiresPayment: true,
        paymentPct: 15,
        verificationRequired: true,
        order: 7,
      },
      {
        name: "Insulation installed",
        description:
          "Wall, ceiling, and floor insulation installed per energy calculations. Insulation inspection passed before drywall may begin.",
        requiresInspection: true,
        requiresPayment: false,
        verificationRequired: true,
        order: 8,
      },
      {
        name: "Drywall hung and finished",
        description:
          "Drywall sheets installed, joints taped and mudded, sanded to smooth finish, and ready for primer and paint.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 10,
        verificationRequired: true,
        order: 9,
      },
      {
        name: "Exterior complete (siding, roofing, windows)",
        description:
          "Final roofing material, siding, exterior trim, windows, and exterior doors are fully installed and flashed.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 10,
      },
      {
        name: "Interior trim and doors installed",
        description:
          "Interior doors hung, baseboards, casing, crown molding, and other millwork installed throughout the home.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 11,
      },
      {
        name: "Cabinets and countertops installed",
        description:
          "Kitchen and bathroom cabinets set and leveled, countertops templated (or pre-ordered) and installed, hardware attached.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 12,
      },
      {
        name: "Flooring installed",
        description:
          "All finish flooring (hardwood, tile, carpet, LVP) installed per the interior finish schedule. Transitions and thresholds in place.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 13,
      },
      {
        name: "Paint complete",
        description:
          "Interior walls and ceilings primed and painted to final color selections. Touch-ups completed after trim and flooring installation.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 14,
      },
      {
        name: "Fixtures and appliances installed",
        description:
          "Plumbing fixtures (sinks, toilets, faucets), light fixtures, electrical devices (outlets, switches), and all appliances installed and tested.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 20,
        verificationRequired: true,
        order: 15,
      },
      {
        name: "Final grading and landscaping",
        description:
          "Finish grading around the foundation for proper drainage, topsoil replaced, driveway poured or paved, and initial landscaping installed.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 16,
      },
      {
        name: "Punch list walkthrough",
        description:
          "Walk the entire home with the builder to document any deficient, incomplete, or damaged items that must be corrected before final payment.",
        requiresInspection: false,
        requiresPayment: true,
        paymentPct: 25,
        verificationRequired: true,
        order: 17,
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
      "Complete final inspections, obtain the certificate of occupancy, resolve punch list items, and close out the construction loan.",
    typicalDurationWeeks: { min: 2, max: 4 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "Before you can legally occupy the home, the building department must perform a final inspection and issue a Certificate of Occupancy (CO). All punch list items and financial close-out must also be resolved.",
    requiredDocuments: [
      "Final inspection report",
      "Certificate of occupancy (CO)",
      "Punch list with resolution notes",
      "Final lien waivers (unconditional) from all subs",
      "Final draw request",
      "Warranty documentation from builder",
      "Manufacturer warranties for major systems",
      "As-built drawings (if changes were made)",
    ],
    milestones: [
      {
        name: "Final building inspection scheduled",
        description:
          "All construction work is complete and the builder has requested a final inspection from the building department.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 1,
      },
      {
        name: "Final inspection passed",
        description:
          "The building inspector has verified that all work complies with the approved plans and applicable building codes.",
        requiresInspection: true,
        requiresPayment: false,
        verificationRequired: true,
        order: 2,
      },
      {
        name: "Certificate of occupancy issued",
        description:
          "The building department has issued a Certificate of Occupancy (CO), legally authorizing the home to be occupied.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 3,
      },
      {
        name: "Punch list items resolved",
        description:
          "All items identified during the punch list walkthrough have been corrected, verified, and signed off by the owner.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 4,
      },
      {
        name: "Final lien waivers collected",
        description:
          "Unconditional lien waivers have been collected from the general contractor and all subcontractors, confirming they have been paid in full.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: true,
        order: 5,
      },
      {
        name: "Final draw released",
        description:
          "The final payment draw (retainage) has been released to the builder after all punch list items are resolved and lien waivers collected.",
        requiresInspection: false,
        requiresPayment: true,
        verificationRequired: true,
        order: 6,
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
      "Move in, set up rental operations, or prepare for sale. Organize warranties, establish a maintenance schedule, and file as-built documents.",
    typicalDurationWeeks: { min: 4, max: 52 },
    constructionMethod: "Wood-frame (platform framing)",
    educationSummary:
      "Your home is complete but your responsibilities as an owner are just beginning. Proper warranty tracking, scheduled maintenance, and organized documentation will protect your investment for decades.",
    requiredDocuments: [
      "Homeowner's insurance policy",
      "Warranty binder (builder and manufacturer warranties)",
      "Maintenance schedule and checklists",
      "As-built drawings and specifications",
      "Appliance manuals and registration cards",
      "Utility account confirmations",
      "Property tax assessment",
      "Rental lease agreement (if applicable)",
      "Property management agreement (if applicable)",
    ],
    milestones: [
      {
        name: "Move-in or tenant placed",
        description:
          "The home is occupied by the owner, or a qualified tenant has signed a lease and moved in. Utilities are transferred to the occupant.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 1,
      },
      {
        name: "Warranty documentation organized",
        description:
          "All builder, subcontractor, and manufacturer warranties are compiled into a single binder or digital folder with expiration dates tracked.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 2,
      },
      {
        name: "Maintenance schedule established",
        description:
          "A recurring maintenance schedule is set up covering HVAC filter changes, gutter cleaning, exterior caulking, pest inspections, and other routine items.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 3,
      },
      {
        name: "As-built documents filed",
        description:
          "Final as-built drawings, specifications, permits, inspection records, and contractor contact information are filed for long-term reference.",
        requiresInspection: false,
        requiresPayment: false,
        verificationRequired: false,
        order: 4,
      },
    ],
  },
];
