import type { InspectionRequirement } from "../types";

/**
 * Togo Construction Inspections
 *
 * Togo does not have a formal building inspection system comparable
 * to the USA. There is no building department that dispatches
 * inspectors at each phase. Instead, quality control relies on:
 *
 * 1. The architect (if engaged) performing periodic site visits
 * 2. The owner or their representative checking work at critical points
 * 3. The chef de chantier's own quality standards
 *
 * The inspections listed here represent the critical quality
 * checkpoints that SHOULD be performed, even though most are
 * informal. The single formal inspection is the "reception"
 * when an architect issues a proces-verbal.
 *
 * For diaspora builders managing remotely, these checkpoints
 * are essential — require timestamped photos of rebar before
 * every concrete pour as a minimum verification standard.
 */
export const TOGO_INSPECTIONS: InspectionRequirement[] = [
  {
    id: "togo-insp-foundation-rebar",
    name: "Foundation Rebar Check",
    phase: "BUILD",
    milestone: "Foundation poured",
    description:
      "Verify that foundation trench rebar cages are correctly assembled before concrete is poured. This is the single most important quality checkpoint in the entire build — once concrete covers the rebar, errors cannot be corrected. The rebar layout must match the structural drawings, with correct bar sizes, spacing, and overlap at splices.",
    inspector: "Architect or owner",
    checklistItems: [
      "Rebar sizes match structural drawings (typically fer de 10 or 12)",
      "Vertical and horizontal spacing per structural plan",
      "Lap splices at least 40 times the bar diameter (40cm for fer de 10)",
      "Stirrups (cadres) tied at specified intervals",
      "Minimum concrete cover maintained (5-7cm from soil, 3-5cm elsewhere)",
      "Rebar cages elevated on spacer blocks (cales), not resting on soil",
      "Trench bottom is clean, compacted, and free of standing water",
      "Trench dimensions match foundation plan",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "togo-insp-column-rebar",
    name: "Column Rebar Check",
    phase: "BUILD",
    milestone: "Columns poured (poteaux)",
    description:
      "Inspect all column rebar cages and formwork before pouring concrete. Columns are the primary structural elements in the poteau-poutre system — they carry the entire weight of the building. Verify that each column has the correct number and size of vertical bars, and that horizontal stirrups are tied at the correct spacing (closer together at the top and bottom where stress is highest).",
    inspector: "Architect or owner",
    checklistItems: [
      "Number of vertical bars per column matches structural plan (typically 4-6 bars)",
      "Vertical bar size correct (typically fer de 10 or fer de 12)",
      "Stirrups (cadres) tied at specified spacing (typically 15-20cm, closer at ends)",
      "Column dimensions match plan (typically 20x20cm or 25x25cm)",
      "Formwork is plumb (vertical), properly braced, and dimensionally accurate",
      "Adequate concrete cover on all sides (minimum 2.5-3cm)",
      "Rebar extends above pour level for connection to beams or upper columns",
      "Formwork joints sealed to prevent concrete leakage (laitance)",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "togo-insp-ring-beam-rebar",
    name: "Ring Beam Rebar Check",
    phase: "BUILD",
    milestone: "Ring beams poured (chainage haut)",
    description:
      "Verify the rebar and formwork for horizontal ring beams (chainages) that tie all walls together at lintel level and at the top of walls. Ring beams are critical structural elements that prevent walls from separating and distribute loads evenly. Both the chainage bas (at soubassement level) and chainage haut (at wall top) must be checked.",
    inspector: "Architect or owner",
    checklistItems: [
      "Rebar continuous around all corners (no breaks at corners)",
      "Bar sizes and number match structural plan",
      "Stirrups tied at specified spacing along the full length",
      "Proper connection (ancrage) to column rebar at intersections",
      "Formwork level and properly supported along its length",
      "Adequate concrete cover maintained on all sides",
      "Provision for roof tie-down bolts or inserts if specified",
      "No debris or loose material inside formwork",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "togo-insp-slab-rebar",
    name: "Slab Rebar Check",
    phase: "BUILD",
    milestone: "Slab poured (dalle)",
    description:
      "Inspect the reinforcement for the floor slab (dalle) or upper-floor slab (plancher) before the concrete pour. For solid slabs, verify the rebar mesh spacing and bar sizes. For hourdis (ribbed slab) systems, verify the poutrelles (ribs), hourdis blocks, and the top reinforcement mesh (treillis soude). The slab pour is typically the largest single concrete operation in the project.",
    inspector: "Architect or owner",
    checklistItems: [
      "Rebar mesh spacing and bar sizes match structural plan",
      "For hourdis: poutrelles correctly spaced and supported at bearings",
      "For hourdis: blocks properly placed with no gaps between ribs",
      "Top mesh (treillis soude) laid over hourdis before pour",
      "Adequate concrete cover under bottom rebar (cales/spacers in place)",
      "Reinforcement around openings (tremies) for stairs and pipes",
      "Shoring and formwork properly braced to support wet concrete weight",
      "Electrical conduits and plumbing sleeves positioned before pour",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "togo-insp-roof-structure",
    name: "Roof Structure Check",
    phase: "BUILD",
    milestone: "Roof structure installed (charpente)",
    description:
      "Inspect the roof structure (charpente) before roofing sheets are installed. Verify that trusses or rafters are properly sized, spaced, and connected to the ring beam or slab. For wood charpente, check for anti-termite treatment. For steel charpente, check weld quality and connections.",
    inspector: "Architect or owner",
    checklistItems: [
      "Truss or rafter spacing matches architectural plan",
      "All members properly connected to supporting walls or ring beam",
      "Purlins (pannes) correctly spaced for roofing sheet span",
      "For wood: anti-termite treatment applied to all members",
      "For wood: no visible rot, splits, or insect damage",
      "For steel: welds are solid with good penetration, no cracks",
      "Roof pitch correct for adequate water runoff",
      "Overhang (debord) sufficient to protect walls from rain splash",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "togo-insp-plumbing-test",
    name: "Plumbing Pressure Test",
    phase: "BUILD",
    milestone: "Plumbing installed",
    description:
      "Test all plumbing connections for leaks before pipes are covered by concrete, plaster, or tiling. Fill the water system and check every joint, connection, and fixture for leaks under pressure. Also verify that drainage pipes have correct slope for gravity flow to the fosse septique.",
    inspector: "Architect or owner",
    checklistItems: [
      "All supply pipe joints tested under water pressure (no leaks)",
      "Drainage pipes slope correctly toward fosse septique (minimum 1-2%)",
      "All sanitary fixtures connected and functional (WC flushes, taps work)",
      "Water tank and pump system operational",
      "Hot water system functional (if installed)",
      "No water hammer or pressure issues in the supply system",
      "Fosse septique connection sealed and properly routed",
      "Overflow and vent pipes correctly positioned",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "togo-insp-electrical-safety",
    name: "Electrical Safety Check",
    phase: "BUILD",
    milestone: "Electrical installed",
    description:
      "Verify the electrical installation before walls are closed and before CEET connection. Test all circuits, verify proper grounding (mise a la terre), and confirm that the breaker panel (tableau electrique) is correctly wired with appropriate circuit breaker sizing for each circuit.",
    inspector: "Architect or owner",
    checklistItems: [
      "Earth/ground connection (mise a la terre) installed and functional",
      "Breaker panel (tableau) properly wired with labeled circuits",
      "Circuit breaker sizes appropriate for wire gauge on each circuit",
      "All outlets and switches functional and properly wired",
      "Wiring run in conduit (gaine) throughout — no exposed wires",
      "Dedicated circuits for high-draw appliances (water heater, AC, cooker)",
      "No loose connections or exposed wire ends anywhere in the system",
      "Generator or inverter transfer switch correctly wired (if installed)",
    ],
    requiredBeforeNext: true,
    formal: false,
  },
  {
    id: "togo-insp-final-reception",
    name: "Final Reception (Proces-verbal de reception)",
    phase: "VERIFY",
    milestone: "Proces-verbal de reception signed",
    description:
      "The formal reception of the completed building by the owner, ideally witnessed by the architect. The architect performs a comprehensive inspection and documents all findings in a proces-verbal de reception. Any deficiencies are listed as reserves that the builder must correct. This document has legal significance — it marks the transfer of responsibility from builder to owner and starts warranty periods.",
    inspector: "Architect (if engaged) or owner with technical advisor",
    checklistItems: [
      "All rooms match the approved architectural plans in dimensions and layout",
      "Structural elements (columns, beams, slab) show no cracks or defects",
      "All doors and windows open, close, and lock properly",
      "Every electrical outlet, switch, and light fixture is operational",
      "Every plumbing fixture functions without leaks",
      "Floor tiles are level with consistent joints, no loose tiles",
      "Interior and exterior paint is uniform with no drips or bare spots",
      "Perimeter wall and gates are complete and functional",
      "Fosse septique accessible and properly connected",
      "Water supply system (municipal and/or tank) fully operational",
      "Roof has no leaks (best tested during or after rain)",
      "All reserves (deficiencies) documented in writing with photos",
    ],
    requiredBeforeNext: false,
    formal: true,
  },
];
