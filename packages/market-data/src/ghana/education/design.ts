import type { EducationModule } from "../../types";

export const GHANA_EDUCATION_DESIGN: EducationModule = {
  phase: "DESIGN",
  title: "Design the Plans",
  summary:
    "Choose between a registered architect and a draughtsman based on your budget and project complexity. Plans must comply with the Ghana Building Code and local planning schemes.",
  content: `The design phase is one that many builders in Ghana rush through or skip entirely to save money. This is a major mistake. Well-prepared drawings will save you far more than the architect's fees by preventing construction errors, costly mid-build changes, and problems with the development permit.

In Ghana, two types of professionals can prepare your building drawings. A registered architect (member of the Ghana Institute of Architects, GIA, and registered with the Architects Registration Council) provides full professional service including design, structural coordination, and construction supervision. A draughtsman can produce basic drawings at lower cost but typically provides plans only, without structural calculations or site supervision. For buildings above single-storey or with complex layouts, an architect with a structural engineer is strongly recommended.

The standard construction system in Ghana is the column-beam system in reinforced concrete with sandcrete block infill. Plans must specify: column and beam sizes with reinforcement details, wall thicknesses (6-inch or 8-inch blocks), foundation type (strip or pad footings), and roof structure (wood or steel). The Ghana Building Code (GS 1207:2018) provides standards for structural design, and the structural engineer's calculations should reference it.

Adapt your design to the tropical climate: provide cross-ventilation, adequate roof overhang (at least 600mm) to protect walls from rain, windows oriented to catch prevailing breezes, and a properly designed rainwater drainage system. In Greater Accra, where the water table can be high in some areas, verify whether you need a raised ground floor or special waterproofing.

Commission a soil investigation (geotechnical report) before finalizing foundation design. This costs GHS 3,000-8,000 but can prevent foundation failures that cost hundreds of thousands to repair.`,
  keyDecisions: [
    "Architect or draughtsman: based on building complexity and budget",
    "Structural system: standard column-beam, load-bearing walls, or hybrid",
    "Foundation type: strip footings, pad footings, or raft (based on soil investigation)",
    "Roof type: steel or wood framing, aluminum or galvanized steel roofing",
    "Building orientation: natural ventilation and solar protection",
    "Finish level: basic, standard, or premium",
  ],
  commonMistakes: [
    "Building without proper drawings — relying on a sketch or verbal description",
    "Copying a plan from the internet that is not adapted to Ghana's climate or building code",
    "Skipping the soil investigation before finalizing the foundation design",
    "Under-sizing columns and beams to save on steel reinforcement",
    "Not making provision for electrical conduits and plumbing pipes in the drawings",
    "Ignoring building orientation relative to the sun and prevailing winds",
    "Not designing an adequate rainwater drainage system",
  ],
  proTips: [
    "Invest in a soil investigation: GHS 5,000 now can prevent GHS 50,000+ in foundation repairs",
    "Ask the structural engineer for detailed reinforcement schedules for every column and beam",
    "Design roof overhangs of at least 600mm to protect walls from rain splash",
    "Include cable conduits in walls for electrical and data wiring before plastering",
    "Have the structural engineer's calculations reviewed independently if the building is multi-storey",
    "Keep digital and printed copies of all drawings — they are your reference throughout construction",
  ],
};
