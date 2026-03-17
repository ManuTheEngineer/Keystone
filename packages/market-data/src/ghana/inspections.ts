import type { InspectionRequirement } from "../types";

/**
 * Ghana Construction Inspections
 *
 * Ghana's formal building inspection system is developing. The
 * Metropolitan, Municipal, and District Assemblies (MMDAs) have
 * the authority to inspect buildings during and after construction,
 * and some (especially in Greater Accra) are increasingly active.
 * However, for most residential projects, quality control still
 * relies on:
 *
 * 1. The architect (if engaged) performing periodic site visits
 * 2. The owner or their representative checking work at critical points
 * 3. The contractor/foreman's own quality standards
 * 4. MMDA building inspectors (inconsistently enforced)
 *
 * The inspections listed here represent the critical quality
 * checkpoints that SHOULD be performed. For diaspora builders
 * managing remotely, these checkpoints are essential — require
 * timestamped photos of rebar before every concrete pour as a
 * minimum verification standard.
 */
export const GHANA_INSPECTIONS: InspectionRequirement[] = [
  {
    id: "ghana-insp-foundation-rebar",
    name: "Foundation Rebar Check",
    phase: "BUILD",
    milestone: "Foundation poured",
    description:
      "Verify that foundation trench rebar cages are correctly assembled before concrete is poured. This is the single most important quality checkpoint in the entire build — once concrete covers the rebar, errors cannot be corrected. The rebar layout must match the structural drawings, with correct bar sizes, spacing, and overlap at splices.",
    inspector: "Architect, structural engineer, or owner",
    checklistItems: [
      "Rebar sizes match structural drawings (typically Y10 or Y12)",
      "Vertical and horizontal spacing per structural drawings",
      "Lap splices at least 40 times the bar diameter (400mm for Y10)",
      "Stirrups (links) tied at specified intervals",
      "Minimum concrete cover maintained (50-75mm from soil, 25-40mm elsewhere)",
      "Rebar cages elevated on spacer blocks, not resting on soil",
      "Trench bottom is clean, compacted, and free of standing water",
      "Trench dimensions match foundation drawing",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "ghana-insp-column-rebar",
    name: "Column Rebar Check",
    phase: "BUILD",
    milestone: "Columns poured",
    description:
      "Inspect all column rebar cages and formwork before pouring concrete. Columns are the primary structural elements in the column-beam system — they carry the entire weight of the building. Verify that each column has the correct number and size of vertical bars, and that stirrups are tied at the correct spacing (closer together at the top and bottom where stress is highest).",
    inspector: "Architect, structural engineer, or owner",
    checklistItems: [
      "Number of vertical bars per column matches structural drawing (typically 4-6 bars)",
      "Vertical bar size correct (typically Y10 or Y12)",
      "Stirrups (links) tied at specified spacing (typically 150-200mm, closer at ends)",
      "Column dimensions match drawing (typically 225x225mm or 300x300mm)",
      "Formwork is plumb (vertical), properly braced, and dimensionally accurate",
      "Adequate concrete cover on all sides (minimum 25-30mm)",
      "Rebar extends above pour level for connection to beams or upper columns",
      "Formwork joints sealed to prevent concrete leakage",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "ghana-insp-ring-beam-rebar",
    name: "Ring Beam Rebar Check",
    phase: "BUILD",
    milestone: "Top ring beam poured",
    description:
      "Verify the rebar and formwork for horizontal ring beams that tie all walls together at lintel level and at the top of walls. Ring beams are critical structural elements that prevent walls from separating and distribute loads evenly.",
    inspector: "Architect, structural engineer, or owner",
    checklistItems: [
      "Rebar continuous around all corners (no breaks at corners)",
      "Bar sizes and number match structural drawing",
      "Stirrups tied at specified spacing along the full length",
      "Proper connection to column rebar at intersections",
      "Formwork level and properly supported along its length",
      "Adequate concrete cover maintained on all sides",
      "Provision for roof tie-down bolts or inserts if specified",
      "No debris or loose material inside formwork",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "ghana-insp-slab-rebar",
    name: "Slab Rebar Check",
    phase: "BUILD",
    milestone: "Slab poured",
    description:
      "Inspect the reinforcement for the floor slab before the concrete pour. For solid slabs, verify the rebar mesh spacing and bar sizes. For hollow-pot slab systems, verify the ribs, hollow blocks, and top reinforcement mesh. The slab pour is typically the largest single concrete operation in the project.",
    inspector: "Architect, structural engineer, or owner",
    checklistItems: [
      "Rebar mesh spacing and bar sizes match structural drawing",
      "For hollow-pot: ribs correctly spaced and supported at bearings",
      "For hollow-pot: blocks properly placed with no gaps between ribs",
      "Top mesh (BRC or fabric) laid over hollow-pot before pour",
      "Adequate concrete cover under bottom rebar (spacers in place)",
      "Reinforcement around openings for stairs and service pipes",
      "Shoring and formwork properly braced to support wet concrete weight",
      "Electrical conduits and plumbing sleeves positioned before pour",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "ghana-insp-roof-structure",
    name: "Roof Structure Check",
    phase: "BUILD",
    milestone: "Roof structure installed",
    description:
      "Inspect the roof structure before roofing sheets are installed. Verify that trusses or rafters are properly sized, spaced, and connected to the ring beam or slab. For wood framing, check for anti-termite treatment. For steel framing, check weld quality.",
    inspector: "Architect or owner",
    checklistItems: [
      "Truss or rafter spacing matches architectural drawing",
      "All members properly connected to supporting ring beam",
      "Purlins correctly spaced for roofing sheet span",
      "For wood: anti-termite treatment applied to all members",
      "For wood: no visible rot, splits, or insect damage",
      "For steel: welds are solid with good penetration, no cracks",
      "Roof pitch correct for adequate water runoff",
      "Overhang sufficient to protect walls from rain splash",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "ghana-insp-plumbing-test",
    name: "Plumbing Pressure Test",
    phase: "BUILD",
    milestone: "Plumbing installed",
    description:
      "Test all plumbing connections for leaks before pipes are covered by concrete, plaster, or tiling. Fill the water system and check every joint and fixture for leaks. Verify that drainage pipes have correct slope for gravity flow to the septic tank.",
    inspector: "Architect or owner",
    checklistItems: [
      "All supply pipe joints tested under water pressure (no leaks)",
      "Drainage pipes slope correctly toward septic tank (minimum 1-2%)",
      "All sanitary fixtures connected and functional (WC flushes, taps work)",
      "Polytank and pump system operational",
      "Hot water system functional (if installed)",
      "No water hammer or pressure issues in the supply system",
      "Septic tank connection sealed and properly routed",
      "Overflow and vent pipes correctly positioned",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "ghana-insp-electrical-safety",
    name: "Electrical Safety Check",
    phase: "BUILD",
    milestone: "Electrical installed",
    description:
      "Verify the electrical installation before walls are closed and before ECG connection. Test all circuits, verify proper earthing, and confirm that the distribution board is correctly wired with appropriate circuit breaker sizing.",
    inspector: "Architect, licensed electrician, or owner",
    checklistItems: [
      "Earth connection installed and functional",
      "Distribution board properly wired with labeled circuits",
      "Circuit breaker sizes appropriate for wire gauge on each circuit",
      "All outlets and switches functional and properly wired",
      "Wiring run in conduit throughout — no exposed wires",
      "Dedicated circuits for high-draw appliances (water heater, AC, cooker)",
      "No loose connections or exposed wire ends anywhere in the system",
      "Generator or inverter changeover switch correctly wired (if installed)",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "ghana-insp-mmda",
    name: "MMDA Building Inspection",
    phase: "BUILD",
    milestone: "Roofing complete",
    description:
      "In some MMDAs (especially in Greater Accra), building inspectors may visit the site at key milestones to verify compliance with the approved plans and the Ghana Building Code. While not consistently enforced for all residential buildings, cooperation with MMDA inspectors is important for obtaining a habitation certificate later.",
    inspector: "MMDA Building Inspector",
    checklistItems: [
      "Building footprint matches approved site plan",
      "Setbacks from property boundaries match approved drawings",
      "Building height does not exceed permitted levels",
      "Structural system matches approved structural drawings",
      "Building materials meet Ghana Standards Authority requirements",
      "Development permit displayed on site",
      "No encroachment on neighboring properties or public land",
      "Drainage provisions adequate and not redirecting water to neighbors",
    ],
    requiredBeforeNext: false,
    formal: true,
  },
  {
    id: "ghana-insp-final-completion",
    name: "Final Completion Inspection",
    phase: "VERIFY",
    milestone: "Completion certificate signed",
    description:
      "The comprehensive final inspection of the completed building by the owner, ideally with the architect present. The architect inspects all work and documents findings. Any deficiencies are listed on a snag list for the contractor to correct. This marks the handover from contractor to owner.",
    inspector: "Architect (if engaged) or owner with technical advisor",
    checklistItems: [
      "All rooms match the approved architectural drawings in dimensions and layout",
      "Structural elements (columns, beams, slab) show no cracks or defects",
      "All doors and windows open, close, and lock properly",
      "Every electrical outlet, switch, and light fixture is operational",
      "Every plumbing fixture functions without leaks",
      "Floor tiles are level with consistent joints, no loose tiles",
      "Interior and exterior paint is uniform with no drips or bare spots",
      "Compound wall and gates are complete and functional",
      "Septic tank accessible and properly connected",
      "Water supply system (GWCL and/or polytank) fully operational",
      "Roof has no leaks (best tested during or after rain)",
      "All snag items documented in writing with photos",
    ],
    requiredBeforeNext: false,
    formal: true,
  },
];
