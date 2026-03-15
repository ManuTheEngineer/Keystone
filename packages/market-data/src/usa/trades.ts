import type { TradeDefinition } from "../types";

export const USA_TRADES: TradeDefinition[] = [
  {
    id: "usa-general-contractor",
    name: "General Contractor",
    description:
      "Oversees the entire construction project, coordinates subcontractors, manages schedules, and ensures work meets code requirements. Acts as the single point of accountability for the build.",
    phases: ["ASSEMBLE", "BUILD", "VERIFY"],
    typicalRateRange: { low: 35, high: 75, unit: "hr" },
    licensingRequired: true,
    licensingNotes:
      "Most states require a general contractor license. Requirements vary: some states require exams, bonding, and proof of insurance. Check your state licensing board for specific requirements.",
    criticalSkills: [
      "Project scheduling and coordination",
      "Building code knowledge",
      "Subcontractor management",
      "Budget tracking and cost control",
      "Permit process navigation",
      "Quality control and inspection readiness",
    ],
  },
  {
    id: "usa-excavation",
    name: "Excavation/Grading Contractor",
    description:
      "Prepares the building site by clearing land, grading for proper drainage, excavating for foundations, and managing soil conditions. Critical for ensuring a stable building platform.",
    phases: ["BUILD"],
    typicalRateRange: { low: 40, high: 80, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Licensing varies by state. Some states require an earthwork or site-work specialty license. Heavy equipment operators may need separate certification.",
    criticalSkills: [
      "Heavy equipment operation",
      "Grading and drainage planning",
      "Soil assessment and compaction",
      "Erosion control measures",
      "Utility line location awareness",
      "Blueprint and site plan reading",
    ],
  },
  {
    id: "usa-concrete-foundation",
    name: "Concrete/Foundation Contractor",
    description:
      "Constructs the building foundation including footings, slabs, stem walls, and basement walls. Responsible for formwork, rebar placement, concrete pouring, and curing.",
    phases: ["BUILD"],
    typicalRateRange: { low: 40, high: 70, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Some states require a concrete or masonry specialty license. Foundation work typically requires a building permit and footing inspection before pouring.",
    criticalSkills: [
      "Formwork construction",
      "Rebar layout and placement",
      "Concrete mixing and pouring",
      "Foundation waterproofing",
      "Level and square verification",
      "Curing process management",
    ],
  },
  {
    id: "usa-framing-carpenter",
    name: "Framing Carpenter",
    description:
      "Builds the structural skeleton of the house including walls, floors, roof trusses, and sheathing. Framing defines the shape, layout, and structural integrity of the building.",
    phases: ["BUILD"],
    typicalRateRange: { low: 30, high: 60, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Generally not licensed as a separate trade, though some states require registration. Framing must pass a structural framing inspection before covering walls.",
    criticalSkills: [
      "Blueprint reading and layout",
      "Wall and roof framing techniques",
      "Load-bearing wall identification",
      "Truss and rafter installation",
      "Sheathing and bracing",
      "Window and door rough opening sizing",
    ],
  },
  {
    id: "usa-roofing",
    name: "Roofing Contractor",
    description:
      "Installs roofing systems including underlayment, shingles, metal panels, flashing, gutters, and ventilation. Ensures the building envelope is watertight from the top.",
    phases: ["BUILD"],
    typicalRateRange: { low: 35, high: 65, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Several states require a roofing specialty license. Manufacturer certifications (GAF, CertainTeed) may be needed for warranty coverage on materials.",
    criticalSkills: [
      "Roofing material installation",
      "Flashing and valley waterproofing",
      "Ventilation system installation",
      "Ice and water shield application",
      "Gutter and downspout installation",
      "Roof deck inspection and repair",
    ],
  },
  {
    id: "usa-plumber",
    name: "Plumber",
    description:
      "Installs all water supply lines, drain/waste/vent (DWV) piping, fixtures, and water heater. Work occurs in two phases: rough-in (before walls close) and finish (after drywall).",
    phases: ["BUILD", "VERIFY"],
    typicalRateRange: { low: 45, high: 90, unit: "hr" },
    licensingRequired: true,
    licensingNotes:
      "All states require plumbing licenses. Typically a journeyman or master plumber license is needed. Plumbing work requires separate rough and final inspections by the authority having jurisdiction.",
    criticalSkills: [
      "Water supply system design and installation",
      "Drain, waste, and vent (DWV) piping",
      "Fixture installation and connection",
      "Water heater installation",
      "Code-compliant pipe sizing",
      "Pressure testing and leak detection",
    ],
  },
  {
    id: "usa-electrician",
    name: "Electrician",
    description:
      "Installs the complete electrical system including service panel, wiring, outlets, switches, lighting, and low-voltage systems. Work occurs in rough-in and finish phases.",
    phases: ["BUILD", "VERIFY"],
    typicalRateRange: { low: 45, high: 85, unit: "hr" },
    licensingRequired: true,
    licensingNotes:
      "All states require electrician licenses. A journeyman or master electrician license is needed for permit-pulling. Electrical work requires rough and final inspections per the National Electrical Code (NEC).",
    criticalSkills: [
      "Service panel sizing and installation",
      "Branch circuit wiring and layout",
      "NEC code compliance",
      "GFCI and AFCI protection installation",
      "Low-voltage and data wiring",
      "Load calculation and circuit balancing",
    ],
  },
  {
    id: "usa-hvac",
    name: "HVAC Technician",
    description:
      "Designs and installs heating, ventilation, and air conditioning systems including ductwork, furnaces, air handlers, condensers, and thermostats. Ensures proper load calculations and airflow.",
    phases: ["BUILD", "VERIFY"],
    typicalRateRange: { low: 40, high: 80, unit: "hr" },
    licensingRequired: true,
    licensingNotes:
      "Most states require HVAC contractor licensing. EPA Section 608 certification is mandatory for handling refrigerants. Many jurisdictions require Manual J load calculations before permit approval.",
    criticalSkills: [
      "Manual J/S/D load and duct calculations",
      "Ductwork fabrication and installation",
      "Equipment sizing and selection",
      "Refrigerant line installation",
      "Thermostat and controls wiring",
      "Airflow balancing and testing",
    ],
  },
  {
    id: "usa-insulation",
    name: "Insulation Installer",
    description:
      "Installs thermal and sound insulation in walls, ceilings, floors, and crawl spaces. Material types include fiberglass batts, blown-in cellulose, spray foam, and rigid board.",
    phases: ["BUILD"],
    typicalRateRange: { low: 25, high: 45, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Generally no license required. Spray foam installers may need manufacturer certification. Insulation must meet energy code R-value requirements for the climate zone.",
    criticalSkills: [
      "R-value requirements by climate zone",
      "Batt, blown-in, and spray foam installation",
      "Air sealing techniques",
      "Vapor barrier installation",
      "Energy code compliance",
      "Thermal bridging mitigation",
    ],
  },
  {
    id: "usa-drywall",
    name: "Drywall/Taper",
    description:
      "Hangs, tapes, muds, and finishes drywall (gypsum board) on walls and ceilings. Responsible for smooth, paint-ready surfaces at the specified finish level (typically Level 4 or 5).",
    phases: ["BUILD"],
    typicalRateRange: { low: 30, high: 55, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Rarely requires a specific license. Some jurisdictions require registration. Fire-rated assemblies (garage walls, multi-family separations) must use specified drywall types.",
    criticalSkills: [
      "Drywall hanging and fastening",
      "Joint taping and mudding",
      "Finish levels 1 through 5",
      "Fire-rated assembly installation",
      "Moisture-resistant board placement",
      "Corner bead and trim finishing",
    ],
  },
  {
    id: "usa-painter",
    name: "Painter",
    description:
      "Applies primers, paints, stains, and protective coatings to interior and exterior surfaces. Includes surface preparation, caulking, and finish application for walls, trim, doors, and cabinetry.",
    phases: ["BUILD"],
    typicalRateRange: { low: 25, high: 50, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Generally no license required. EPA Lead-Safe certification (RRP rule) is required when working on homes built before 1978. Some states require contractor registration.",
    criticalSkills: [
      "Surface preparation and priming",
      "Brush, roller, and spray application",
      "Interior and exterior coating systems",
      "Caulking and gap filling",
      "Color matching and consistency",
      "Lead-safe work practices for older structures",
    ],
  },
  {
    id: "usa-flooring",
    name: "Flooring Installer",
    description:
      "Installs finished flooring materials including hardwood, laminate, luxury vinyl plank (LVP), tile, and carpet. Handles subfloor preparation, underlayment, and transitions between materials.",
    phases: ["BUILD"],
    typicalRateRange: { low: 30, high: 55, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "No license typically required. Tile installers may hold voluntary certifications from the Ceramic Tile Education Foundation (CTEF). Subfloor moisture testing is critical before installation.",
    criticalSkills: [
      "Subfloor assessment and preparation",
      "Hardwood, LVP, and laminate installation",
      "Tile setting and grouting",
      "Carpet stretching and seaming",
      "Transition strip installation",
      "Moisture testing and underlayment selection",
    ],
  },
  {
    id: "usa-trim-carpenter",
    name: "Trim Carpenter",
    description:
      "Installs interior finish carpentry including baseboards, crown molding, window and door casings, wainscoting, built-in shelving, and stair railings. Focuses on precision and visible finish quality.",
    phases: ["BUILD"],
    typicalRateRange: { low: 35, high: 65, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "No specific license required in most jurisdictions. Finish carpentry is a skill-intensive trade; quality varies widely. Request portfolio examples before hiring.",
    criticalSkills: [
      "Precision measuring and cutting",
      "Miter and cope joint techniques",
      "Baseboard and crown molding installation",
      "Window and door casing",
      "Stair railing and baluster installation",
      "Built-in shelving and closet systems",
    ],
  },
  {
    id: "usa-cabinet-installer",
    name: "Cabinet Installer",
    description:
      "Installs kitchen and bathroom cabinetry, countertops, and associated hardware. Ensures level, plumb, and properly aligned installation that accommodates appliances and plumbing connections.",
    phases: ["BUILD"],
    typicalRateRange: { low: 35, high: 60, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "No specific license required. Many cabinet installers are also finish carpenters. Factory-certified installers may be required to maintain cabinet manufacturer warranties.",
    criticalSkills: [
      "Cabinet layout and leveling",
      "Wall and base cabinet mounting",
      "Countertop templating and installation",
      "Hardware and soft-close hinge adjustment",
      "Appliance clearance and cutout coordination",
      "Scribe fitting to uneven walls",
    ],
  },
  {
    id: "usa-landscaper",
    name: "Landscaper",
    description:
      "Handles exterior grading, irrigation system installation, planting, hardscaping (patios, walkways, retaining walls), sod or seed, and final site cleanup. Completes the project curb appeal.",
    phases: ["BUILD", "OPERATE"],
    typicalRateRange: { low: 25, high: 50, unit: "hr" },
    licensingRequired: false,
    licensingNotes:
      "Pesticide and herbicide application requires state-level licensing. Irrigation system installation may require a plumbing permit in some jurisdictions. Landscape contractors may need general contractor registration.",
    criticalSkills: [
      "Grading and drainage management",
      "Irrigation system design and installation",
      "Plant selection for climate zone",
      "Hardscape construction (patios, walkways)",
      "Retaining wall construction",
      "Erosion control and stormwater management",
    ],
  },
];
