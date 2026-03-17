import type { EducationModule } from "../../types";

export const GHANA_EDUCATION_BUILD: EducationModule = {
  phase: "BUILD",
  title: "The Construction",
  summary:
    "Construction follows the column-beam sequence. Respect concrete curing times, monitor material quality, and plan around the rainy season.",
  content: `Construction in Ghana follows the column-beam system (reinforced concrete columns and beams with sandcrete block infill). The sequence is rigorous and each step depends on the quality of the previous one. Do not let anyone convince you to skip or rush a stage.

The standard sequence for a single-storey house is: site clearing and setting out, foundation trench excavation, footing rebar and concrete pour, sub-base block work, backfilling and compaction, ground floor slab, column rebar and formwork and concrete pour, block wall construction, lintels and window sills, top ring beam, roof structure, and roofing sheets. For a multi-storey building, add the upper floor slab (hollow-pot or solid) and repeat the column-beam-wall sequence for each floor.

Concrete quality is the heart of your structure. Insist on the correct mix ratio: 1:2:4 (cement:sand:chippings) for structural elements, which gives approximately Grade 25 concrete. Sand should be clean, sharp sand — not sea sand (which contains salt that corrodes rebar) and not fine beach sand. Chippings should be clean crushed granite, typically 20mm for columns and beams. Rebar should be high-yield deformed bar (Y-bar) from reputable suppliers: Sentuo Steel, B5 Plus, or imported Turkish steel.

Concrete curing time is critical. Columns and beams must be watered for at least 7 days after pouring to prevent cracking. Do not remove formwork from beams before 21 days minimum. Concrete reaches its design strength at 28 days. During the rainy season (April-July and September-October), protect freshly poured concrete with polythene sheets and avoid pouring just before a heavy downpour.

Monitor sandcrete block quality. Good blocks are machine-vibrated, dense, and consistent in size. Test by dropping one from chest height — if it shatters into many pieces, reject the batch. Poor-quality blocks from roadside factories are a widespread problem in Ghana. Buy from established manufacturers (Regimanuel, B5 Plus, Multico) or invest in making your own blocks on site with a good vibrating machine.

Keep a daily site diary: work done, materials used, number of workers present, weather conditions, and any problems. This diary is your record and your protection in case of disputes.`,
  keyDecisions: [
    "Material suppliers: cement brand (GHACEM, Diamond, Dangote), rebar source, chippings quarry",
    "Block source: factory blocks from a reputable manufacturer or self-made on site",
    "Construction schedule: plan major concrete pours for the dry season if possible",
    "Material storage: provide a secure lockable store on site",
    "Quality checkpoints: inspect rebar before every concrete pour (foundation, columns, ring beam, slab)",
  ],
  commonMistakes: [
    "Using dirty or salty sand in the concrete mix",
    "Under-dosing cement to save money (compromises structural strength)",
    "Removing formwork from beams and lintels too early (before 21 days)",
    "Not watering concrete during curing (7 days minimum)",
    "Buying cheap sandcrete blocks that crumble and crack",
    "Pouring concrete just before a heavy rainstorm without protection",
    "Not respecting the stirrup/link spacing in column rebar",
    "Making changes to the drawings during construction without consulting the architect",
  ],
  proTips: [
    "Buy cement in bulk directly from distributors (GHACEM, Diamond, Dangote depots) for better prices",
    "Consider making your own blocks on site with a vibrating block machine for quality control",
    "Schedule the structural work (foundation to roofing) during the dry season (November-March) if possible",
    "Photograph every rebar assembly BEFORE the concrete pour — once poured, you cannot see the steel",
    "Keep sample concrete cubes (test cubes) from each major pour for strength testing if there are concerns",
    "Check rebar deliveries: bars should be 12 meters long and the correct diameter (Y10, Y12, Y16 etc.)",
    "Hire a night watchman for the site: theft of cement, rebar, and roofing sheets is common",
  ],
};
