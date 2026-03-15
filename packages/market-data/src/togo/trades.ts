import type { TradeDefinition } from "../types";

/**
 * Togo Construction Trades
 *
 * Workers in Togo's construction industry operate in an informal market.
 * There are no licensing requirements, trade unions with mandatory
 * membership, or formal certification systems. Hiring is based on
 * personal referral, reputation, and demonstrated skill.
 *
 * Rates are in CFA francs (XOF) per day (journalier system).
 * Most workers are paid daily or weekly in cash. Rates vary by
 * experience, reputation, and whether the project is in Lome
 * (higher rates) or the interior (lower rates).
 */
export const TOGO_TRADES: TradeDefinition[] = [
  {
    id: "togo-macon",
    name: "Mason",
    localName: "Macon",
    description:
      "The core trade in Togolese construction. Macons lay concrete blocks (agglo), mix and pour concrete, apply plaster (enduit), and handle most general masonry work. An experienced macon is often also the chef de chantier (site foreman). Quality varies enormously — a skilled macon produces straight, level walls with consistent mortar joints, while an unskilled one creates crooked walls that waste materials and compromise structural integrity.",
    phases: ["BUILD"],
    typicalRateRange: { low: 5000, high: 15000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing exists in Togo. Masons learn through apprenticeship, typically starting as manoeuvres and working their way up over 3-5 years. Hire based on referrals and by visiting their previous work.",
    criticalSkills: [
      "Concrete block laying with level and plumb accuracy",
      "Cement mortar mixing at correct ratios",
      "Concrete mixing and pouring for structural elements",
      "Plastering (enduit) interior and exterior walls",
      "Reading and interpreting architectural plans",
      "Foundation layout and excavation oversight",
    ],
  },
  {
    id: "togo-ferrailleur",
    name: "Rebar Worker",
    localName: "Ferrailleur",
    description:
      "Specializes in cutting, bending, and tying rebar (fer a beton) into cages for foundations, columns, beams, ring beams, and slabs. The ferrailleur works from the structural engineer's or architect's drawings to create the steel reinforcement that gives the poteau-poutre system its strength. This is highly skilled work — incorrect rebar placement compromises the entire structure's integrity.",
    phases: ["BUILD"],
    typicalRateRange: { low: 5000, high: 12000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Ferrailleurs learn through apprenticeship. The best ones can read structural drawings and calculate rebar quantities independently. Always have the architect verify rebar placement before concrete pours.",
    criticalSkills: [
      "Rebar cutting and bending to specified dimensions",
      "Tying rebar cages with binding wire (fil de fer recuit)",
      "Reading structural reinforcement drawings",
      "Maintaining proper concrete cover (enrobage) for rebar",
      "Calculating rebar quantities from plans",
      "Lap splice and hook detailing per structural specs",
    ],
  },
  {
    id: "togo-coffreur",
    name: "Formwork Maker",
    localName: "Coffreur",
    description:
      "Builds wooden formwork (coffrage) for concrete pours — columns, beams, ring beams, slabs, and staircases. The quality of the formwork directly determines the quality of the finished concrete. A good coffreur produces straight, smooth concrete surfaces with accurate dimensions. Formwork is typically made from planks and plywood, then dismantled (decoffrage) and reused across multiple pours.",
    phases: ["BUILD"],
    typicalRateRange: { low: 5000, high: 12000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Coffreurs learn through apprenticeship. The skill is in producing formwork that is dimensionally accurate, properly braced to withstand the pressure of wet concrete, and easy to remove without damaging the finished surface.",
    criticalSkills: [
      "Building formwork to exact dimensions from plans",
      "Bracing and shoring to support concrete weight",
      "Ensuring formwork is level, plumb, and square",
      "Proper timing and technique for decoffrage (form removal)",
      "Minimizing wood waste through careful planning and reuse",
      "Staircase and complex shape formwork construction",
    ],
  },
  {
    id: "togo-charpentier",
    name: "Carpenter / Roof Framer",
    localName: "Charpentier",
    description:
      "Builds the roof structure (charpente) from wood or coordinates with a soudeur for steel roof framing. The charpentier cuts and assembles trusses, rafters, and purlins to create the roof framework that supports the roofing sheets. For wood charpente, knowledge of tropical hardwoods and termite-resistant species is essential.",
    phases: ["BUILD"],
    typicalRateRange: { low: 6000, high: 15000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Charpentiers are specialized carpenters who focus on roof framing. The best ones understand structural loads and can adapt standard designs to unusual roof shapes.",
    criticalSkills: [
      "Roof truss and rafter design and construction",
      "Tropical hardwood selection and treatment",
      "Precise cutting and joinery for load-bearing connections",
      "Setting correct roof pitch for water runoff",
      "Purlin spacing for roofing sheet support",
      "Anti-termite treatment application",
    ],
  },
  {
    id: "togo-couvreur",
    name: "Roofer",
    localName: "Couvreur",
    description:
      "Installs roofing sheets (bac aluminium or galvanized steel tole) on the charpente, including ridge caps, flashing, and gutters. In Togo, roofing is a relatively quick phase but must be done correctly to prevent leaks during the heavy rainy season. The couvreur works at height and must handle large, sometimes sharp-edged metal sheets safely.",
    phases: ["BUILD"],
    typicalRateRange: { low: 5000, high: 12000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Couvreurs often work in pairs or small teams. Experience with the specific roofing material (bac alu vs tole) matters, as fastening methods and overlap requirements differ.",
    criticalSkills: [
      "Roofing sheet installation with proper overlap",
      "Correct fastener placement (screws with rubber washers)",
      "Ridge cap and hip installation for waterproofing",
      "Flashing installation at wall-to-roof junctions",
      "Gutter installation and downspout routing",
      "Working safely at height on roof structures",
    ],
  },
  {
    id: "togo-plombier",
    name: "Plumber",
    localName: "Plombier",
    description:
      "Installs PVC water supply pipes, drainage pipes, sanitary fixtures (toilets, sinks, showers), and connects the water storage and pumping system. Plumbing in Togo typically uses PVC for all pipe runs. The plombier also connects the building to the fosse septique (septic system) and, where available, the municipal water supply (TdE/SP-EAU).",
    phases: ["BUILD", "VERIFY"],
    typicalRateRange: { low: 6000, high: 15000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Skilled plombiers understand water pressure systems, proper drain slopes, and venting requirements. Always test all connections for leaks before covering pipes with concrete or plaster.",
    criticalSkills: [
      "PVC pipe cutting, joining, and routing",
      "Drainage slope calculation and installation",
      "Sanitary fixture installation and connection",
      "Water tank and pump system setup",
      "Fosse septique connection and drainage routing",
      "Leak testing before wall and floor closure",
    ],
  },
  {
    id: "togo-electricien",
    name: "Electrician",
    localName: "Electricien",
    description:
      "Installs all electrical wiring in conduit (gaine), switches, outlets, the breaker panel (tableau electrique), and coordinates the CEET grid connection. A competent electricien understands circuit sizing, proper grounding (mise a la terre), and safety requirements. Faulty electrical work is the leading cause of house fires in West Africa.",
    phases: ["BUILD", "VERIFY"],
    typicalRateRange: { low: 6000, high: 15000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No formal licensing, but CEET may require a certified electrician's attestation for new grid connections. The most important safety items are proper circuit breaker sizing, correct wire gauge for each circuit, and a functional earth/ground connection.",
    criticalSkills: [
      "Electrical conduit routing and installation in walls",
      "Wire sizing for circuit loads",
      "Breaker panel (tableau electrique) installation and labeling",
      "Proper earth/ground connection (mise a la terre)",
      "Switch and outlet installation",
      "CEET meter connection coordination",
    ],
  },
  {
    id: "togo-carreleur",
    name: "Tiler",
    localName: "Carreleur",
    description:
      "Lays floor and wall tiles using cement adhesive. A skilled carreleur produces level surfaces with consistent joint widths and clean cuts around obstacles. Tiling is one of the most visible finish elements in a Togolese home — poor tile work is immediately noticeable and difficult to repair after the adhesive sets.",
    phases: ["BUILD"],
    typicalRateRange: { low: 5000, high: 12000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Carreleurs are judged by the quality of their previous work. Ask to see recent projects and check for level floors, consistent joints, and clean cuts at edges and around fixtures.",
    criticalSkills: [
      "Tile layout planning and pattern alignment",
      "Cement adhesive mixing and application",
      "Precise tile cutting (with manual or electric cutter)",
      "Joint grouting and cleaning",
      "Level and flat surface verification",
      "Waterproofing under tiles in wet areas (bathrooms)",
    ],
  },
  {
    id: "togo-peintre",
    name: "Painter",
    localName: "Peintre",
    description:
      "Applies primer, interior paint (vinylique or glycero), and exterior weather-resistant paint to walls and ceilings. Painting is typically the last trade before move-in. A good peintre prepares surfaces properly (filling cracks, sanding rough spots) before applying paint — shortcuts in preparation always show through.",
    phases: ["BUILD"],
    typicalRateRange: { low: 4000, high: 10000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Painters are among the lowest-paid trades but a skilled one makes a significant difference in the finished appearance. Always insist on proper primer (sous-couche) before paint coats.",
    criticalSkills: [
      "Surface preparation (filling, sanding, cleaning)",
      "Primer (sous-couche) application",
      "Brush and roller technique for smooth finishes",
      "Interior paint selection (vinylique vs glycero)",
      "Exterior weather-resistant paint application",
      "Color mixing and consistency across surfaces",
    ],
  },
  {
    id: "togo-menuisier",
    name: "Joiner / Woodworker",
    localName: "Menuisier",
    description:
      "Custom-builds doors, windows, built-in furniture (placards), kitchen counters, and decorative wood elements. In Togo, most doors and windows are custom-made by a menuisier rather than bought off-the-shelf. The menuisier may also install aluminum window and door systems if they have the skill set.",
    phases: ["BUILD"],
    typicalRateRange: { low: 6000, high: 15000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Menuisiers typically have their own atelier (workshop) where they build doors and windows, then install them on site. Visit the workshop to assess quality before hiring.",
    criticalSkills: [
      "Door and window frame construction",
      "Tropical hardwood selection and working",
      "Precise measurement and fitting to openings",
      "Hardware installation (hinges, locks, handles)",
      "Built-in furniture and closet construction",
      "Wood finishing (varnish, stain, or paint)",
    ],
  },
  {
    id: "togo-soudeur",
    name: "Welder",
    localName: "Soudeur",
    description:
      "Fabricates and installs steel elements: gates (portails), window security grilles (grilles de defense), railings, steel roof structures (charpente metallique), and decorative metalwork. The soudeur works with arc welding equipment and angle grinders. Steel security features are essential in most Togolese neighborhoods.",
    phases: ["BUILD"],
    typicalRateRange: { low: 5000, high: 12000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing required. Soudeurs learn through apprenticeship in ateliers de soudure (welding workshops). Quality varies significantly — check weld penetration, grinding finish, and structural soundness of previous work.",
    criticalSkills: [
      "Arc welding (soudure a l'arc) for structural connections",
      "Steel cutting and grinding",
      "Gate and portail fabrication and installation",
      "Window grille design and construction",
      "Steel charpente assembly for roofing",
      "Anti-rust treatment (peinture antirouille) application",
    ],
  },
  {
    id: "togo-manoeuvre",
    name: "Laborer",
    localName: "Manoeuvre",
    description:
      "General construction laborer who performs essential support tasks: mixing concrete and mortar by hand, carrying materials (blocks, sand, cement, water), cleaning the site, and assisting skilled tradespeople. Manoeuvres are the backbone of every construction site. A typical residential project needs 2-4 manoeuvres working alongside each skilled tradesperson.",
    phases: ["BUILD"],
    typicalRateRange: { low: 2000, high: 5000, unit: "day" },
    licensingRequired: false,
    licensingNotes:
      "No licensing or experience required. Manoeuvres are entry-level workers, often young men looking to learn a trade. Many experienced macons and other tradespeople started as manoeuvres. Treat them fairly — they do the hardest physical work on site.",
    criticalSkills: [
      "Concrete and mortar mixing by hand at correct ratios",
      "Material transport and site organization",
      "Basic tool maintenance and care",
      "Following instructions from skilled tradespeople",
      "Site cleanup and waste management",
      "Water carrying and curing assistance",
    ],
  },
];
