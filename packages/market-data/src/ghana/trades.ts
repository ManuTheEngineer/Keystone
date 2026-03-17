import type { TradeDefinition } from "../types";

/**
 * Ghana Construction Trades
 *
 * Workers in Ghana's construction industry operate in a largely informal
 * market, though there are some trade associations and NVTI (National
 * Vocational Training Institute) certification programs. Hiring is
 * primarily based on personal referral, reputation, and demonstrated skill.
 *
 * Rates are in Ghana Cedis (GHS) per day.
 * Most workers are paid daily or weekly in cash or via mobile money.
 * Rates vary by experience, reputation, and location (Greater Accra
 * has the highest rates; northern regions have the lowest).
 */
export const GHANA_TRADES: TradeDefinition[] = [
  {
    id: "ghana-mason",
    name: "Mason",
    localName: "Mason (Twi: Odan dwumadini)",
    description:
      "The core trade in Ghanaian construction. Masons lay sandcrete blocks, mix and pour concrete, apply plaster (rendering), and handle most general masonry work. An experienced mason is often also the site foreman. Quality varies enormously — a skilled mason produces straight, level walls with consistent mortar joints, while an unskilled one creates crooked walls that waste materials and compromise structural integrity.",
    phases: ["BUILD"],
    typicalRateRange: { low: 80, high: 200, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required, though NVTI offers masonry certificates. Masons learn through apprenticeship, typically starting as laborers and working their way up over 3-5 years. Hire based on referrals and by visiting their previous work.",
    criticalSkills: [
      "Sandcrete block laying with level and plumb accuracy",
      "Cement mortar mixing at correct ratios",
      "Concrete mixing and pouring for structural elements",
      "Rendering (plastering) interior and exterior walls",
      "Reading and interpreting architectural drawings",
      "Foundation layout and excavation oversight",
    ],
  },
  {
    id: "ghana-steel-bender",
    name: "Steel Bender",
    localName: "Iron bender",
    description:
      "Specializes in cutting, bending, and tying reinforcement steel bars (rebar) into cages for foundations, columns, beams, ring beams, and slabs. The steel bender works from the structural engineer's drawings to create the steel reinforcement that gives the column-beam system its strength. This is highly skilled work — incorrect rebar placement compromises the entire structure.",
    phases: ["BUILD"],
    typicalRateRange: { low: 80, high: 180, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required. Steel benders learn through apprenticeship. The best ones can read structural drawings and calculate rebar quantities independently. Always have the architect or engineer verify rebar placement before concrete pours.",
    criticalSkills: [
      "Rebar cutting and bending to specified dimensions",
      "Tying rebar cages with binding wire",
      "Reading structural reinforcement drawings",
      "Maintaining proper concrete cover for rebar",
      "Calculating rebar quantities from drawings",
      "Lap splice and hook detailing per structural specs",
    ],
  },
  {
    id: "ghana-carpenter",
    name: "Carpenter",
    localName: "Carpenter (Twi: Dua dwumadini)",
    description:
      "Builds wooden formwork for concrete pours (columns, beams, slabs, and staircases), and also handles roof framing (trusses and rafters). Some carpenters specialize in either formwork or roofing. The quality of formwork directly determines the quality of finished concrete. A good carpenter produces straight, smooth concrete surfaces with accurate dimensions.",
    phases: ["BUILD"],
    typicalRateRange: { low: 80, high: 200, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required, though NVTI offers carpentry certificates. Carpenters learn through apprenticeship. The skill is in producing formwork that is dimensionally accurate, properly braced, and easy to remove.",
    criticalSkills: [
      "Building formwork to exact dimensions from drawings",
      "Bracing and shoring to support concrete weight",
      "Ensuring formwork is level, plumb, and square",
      "Roof truss and rafter construction",
      "Tropical hardwood selection and treatment",
      "Precise cutting and joinery for load-bearing connections",
    ],
  },
  {
    id: "ghana-roofer",
    name: "Roofer",
    localName: "Roofing fitter",
    description:
      "Installs roofing sheets (aluminum or galvanized steel) on the roof framing, including ridge caps, flashing, and gutters. In Ghana, roofing is a relatively quick phase but must be done correctly to prevent leaks during the heavy rainy season. Step-tile aluminum roofing profiles are very popular in Ghana for their aesthetic appeal.",
    phases: ["BUILD"],
    typicalRateRange: { low: 80, high: 180, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required. Roofers often work in teams. Experience with the specific roofing profile (long-span, step-tile, or corrugated) matters as installation methods differ.",
    criticalSkills: [
      "Roofing sheet installation with proper overlap",
      "Correct fastener placement (self-drilling screws with neoprene washers)",
      "Ridge cap and hip installation for waterproofing",
      "Flashing installation at wall-to-roof junctions",
      "Gutter installation and downspout routing",
      "Working safely at height on roof structures",
    ],
  },
  {
    id: "ghana-plumber",
    name: "Plumber",
    localName: "Plumber",
    description:
      "Installs PVC water supply pipes, drainage pipes, sanitary fixtures (toilets, basins, showers), and connects the water storage (polytank) and pumping system. Plumbing in Ghana typically uses PVC for all pipe runs. The plumber also connects the building to the septic tank and, where available, the GWCL municipal water supply.",
    phases: ["BUILD", "VERIFY"],
    typicalRateRange: { low: 100, high: 220, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required, though NVTI offers plumbing certificates. Skilled plumbers understand water pressure systems, proper drain slopes, and venting requirements. Always test all connections for leaks before covering pipes with concrete or plaster.",
    criticalSkills: [
      "PVC pipe cutting, joining, and routing",
      "Drainage slope calculation and installation",
      "Sanitary fixture installation and connection",
      "Polytank and pump system setup",
      "Septic tank connection and drainage routing",
      "Leak testing before wall and floor closure",
    ],
  },
  {
    id: "ghana-electrician",
    name: "Electrician",
    localName: "Electrician",
    description:
      "Installs all electrical wiring in conduit, switches, outlets, and the distribution board (DB box). Coordinates the ECG grid connection. A competent electrician understands circuit sizing, proper earthing, and safety requirements. Faulty electrical work is a leading cause of house fires.",
    phases: ["BUILD", "VERIFY"],
    typicalRateRange: { low: 100, high: 220, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing for residential work, but ECG may require a licensed electrical contractor's certificate for new grid connections. NVTI offers electrical installation certificates. The Energy Commission regulates electrical standards under the National Wiring Regulations.",
    criticalSkills: [
      "Electrical conduit routing and installation in walls",
      "Wire sizing for circuit loads",
      "Distribution board installation and circuit labeling",
      "Proper earth connection installation",
      "Switch and outlet installation",
      "ECG meter connection coordination",
    ],
  },
  {
    id: "ghana-tiler",
    name: "Tiler",
    localName: "Tiler",
    description:
      "Lays floor and wall tiles using cement adhesive. A skilled tiler produces level surfaces with consistent joint widths and clean cuts around obstacles. Tiling is one of the most visible finish elements — poor tile work is immediately noticeable and difficult to repair after the adhesive sets.",
    phases: ["BUILD"],
    typicalRateRange: { low: 80, high: 180, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required. Tilers are judged by the quality of their previous work. Ask to see recent projects and check for level floors, consistent joints, and clean cuts at edges.",
    criticalSkills: [
      "Tile layout planning and pattern alignment",
      "Cement adhesive mixing and application",
      "Precise tile cutting (manual or electric cutter)",
      "Joint grouting and cleaning",
      "Level and flat surface verification",
      "Waterproofing under tiles in wet areas (bathrooms)",
    ],
  },
  {
    id: "ghana-painter",
    name: "Painter",
    localName: "Painter",
    description:
      "Applies undercoat/primer, interior paint (emulsion or gloss), and exterior weather-resistant paint to walls and ceilings. Painting is typically the last trade before move-in. A good painter prepares surfaces properly (filling cracks, sanding rough spots) before applying paint.",
    phases: ["BUILD"],
    typicalRateRange: { low: 60, high: 150, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required. Painters are among the lowest-paid trades but a skilled one makes a significant difference in the finished appearance. Always insist on proper undercoat/primer before topcoats.",
    criticalSkills: [
      "Surface preparation (filling, sanding, cleaning)",
      "Undercoat/primer application",
      "Brush and roller technique for smooth finishes",
      "Interior paint selection (emulsion vs gloss)",
      "Exterior weather-resistant paint application",
      "Color mixing and consistency across surfaces",
    ],
  },
  {
    id: "ghana-fitter",
    name: "Fitter / Joiner",
    localName: "Fitter (Twi: Dua dwumadini)",
    description:
      "Custom-builds and installs doors, windows, built-in wardrobes, kitchen cabinets, and decorative wood elements. In Ghana, many doors and windows are custom-made. The fitter may also install aluminum window and door systems. Some specialize in wood, others in aluminum.",
    phases: ["BUILD"],
    typicalRateRange: { low: 100, high: 220, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required. Fitters typically have their own workshop where they build doors and windows, then install them on site. Visit the workshop to assess quality before hiring.",
    criticalSkills: [
      "Door and window frame construction",
      "Tropical hardwood selection and working",
      "Precise measurement and fitting to openings",
      "Hardware installation (hinges, locks, handles)",
      "Built-in furniture and wardrobe construction",
      "Wood finishing (varnish, stain, or paint)",
    ],
  },
  {
    id: "ghana-welder",
    name: "Welder",
    localName: "Welder (Twi: Nnade dwumadini)",
    description:
      "Fabricates and installs steel elements: gates, burglar-proof window bars, railings, steel roof structures, and decorative metalwork. The welder works with arc welding equipment and angle grinders. Steel security features (burglar-proofing) are essential in most Ghanaian neighborhoods.",
    phases: ["BUILD"],
    typicalRateRange: { low: 80, high: 180, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing required, though NVTI offers welding certificates. Welders learn through apprenticeship in welding shops. Quality varies significantly — check weld penetration, grinding finish, and structural soundness of previous work.",
    criticalSkills: [
      "Arc welding for structural connections",
      "Steel cutting and grinding",
      "Gate fabrication and installation",
      "Burglar-proof bar design and construction",
      "Steel roof truss assembly",
      "Anti-rust treatment (red oxide primer) application",
    ],
  },
  {
    id: "ghana-laborer",
    name: "Laborer",
    localName: "Laborer (Twi: Adwumayefo)",
    description:
      "General construction laborer who performs essential support tasks: mixing concrete and mortar by hand or with a mixer, carrying materials (blocks, sand, cement, water), cleaning the site, and assisting skilled tradespeople. Laborers are the backbone of every construction site. A typical residential project needs 2-4 laborers working alongside each skilled tradesperson.",
    phases: ["BUILD"],
    typicalRateRange: { low: 40, high: 80, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing or experience required. Laborers are entry-level workers. Many experienced masons and other tradespeople started as laborers. Treat them fairly — they do the hardest physical work on site.",
    criticalSkills: [
      "Concrete and mortar mixing at correct ratios",
      "Material transport and site organization",
      "Basic tool maintenance and care",
      "Following instructions from skilled tradespeople",
      "Site cleanup and waste management",
      "Water carrying and concrete curing assistance",
    ],
  },
];
