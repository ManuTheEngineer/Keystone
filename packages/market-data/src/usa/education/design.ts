import type { EducationModule } from "../../types";

export const USA_EDUCATION_DESIGN: EducationModule = {
  phase: "DESIGN",
  title: "Designing Your Home",
  summary:
    "The design phase translates your vision into buildable plans. Decisions made here lock in the majority of your construction cost, so invest the time to get it right.",
  content: `Design is where your project goes from abstract idea to concrete plan. The documents produced during this phase, architectural drawings, structural engineering, and material specifications, become the instructions that your contractor follows and your building department reviews. Getting these right is critical.

You have three main paths for obtaining house plans. Stock plans are pre-designed plans purchased online or from a plan book, typically costing $1,000 to $3,000. They offer proven designs at low cost but may need modifications to fit your lot, local codes, or preferences. Modified stock plans start with an existing design but are customized by a designer or architect, usually costing $3,000 to $10,000. Fully custom plans are designed from scratch by an architect for your specific lot and needs, typically costing 5 to 15 percent of construction cost.

Regardless of which path you choose, you will need structural engineering. A structural engineer calculates the loads your building must carry and specifies the size and type of framing members, foundation design, and connection details. This is especially important in areas with seismic, wind, or snow load requirements. Most building departments require stamped structural engineering drawings.

Material selections made during design directly impact cost and timeline. Choosing between wood framing and steel framing, between asphalt shingles and standing seam metal roofing, between vinyl windows and fiberglass windows, these decisions cascade through the budget. A good designer helps you understand the cost implications of each choice.

Energy code compliance is now a major design consideration. The International Energy Conservation Code, adopted in varying editions across states, sets requirements for insulation values, air sealing, window performance, and mechanical system efficiency. These requirements are not optional and they affect wall thickness, window specifications, and HVAC sizing.

Value engineering is the process of reviewing the design to find places where cost can be reduced without sacrificing quality or function. Simplifying the roofline, reducing the number of corners, standardizing window sizes, and choosing cost-effective materials with similar performance are all value engineering strategies. This process works best when your builder reviews the plans before they are finalized.`,
  keyDecisions: [
    "Choose between stock plans, modified stock plans, or a fully custom design based on your budget and complexity needs.",
    "Select your primary structural system and exterior materials, as these lock in a significant portion of construction cost.",
    "Decide on your energy efficiency strategy: code minimum, above-code performance, or net-zero goals.",
    "Determine which finish selections to specify now versus leaving as allowances for later decision.",
    "Review the design with your builder before finalizing to identify constructability issues and value engineering opportunities.",
  ],
  commonMistakes: [
    "Finalizing plans without input from a builder. Architects design beautiful spaces, but builders know what costs extra to construct. Collaboration saves money.",
    "Underestimating the cost of complex rooflines. Every hip, valley, and change in ridge height adds labor and material cost.",
    "Skipping structural engineering to save money. This leads to plan review rejections and expensive redesign during permitting.",
    "Selecting all premium finishes without pricing them first. A kitchen with custom cabinets, quartz countertops, and designer tile can cost three times the budget alternative.",
    "Not designing for your specific lot conditions, such as ignoring the slope, sun orientation, prevailing wind, or views.",
  ],
  proTips: [
    "Ask your designer to provide plans in both PDF and CAD format. CAD files make future modifications much cheaper.",
    "Visit model homes and open houses to see materials and layouts in person. Photos and samples never tell the full story.",
    "Design rooms in 2-foot increments to align with standard lumber and sheathing dimensions. A 12-foot room is cheaper to frame than a 13-foot room.",
    "Include detailed electrical and lighting plans in your drawings. Relocating outlets and switches during construction is a common and expensive change order.",
    "Consider future needs: aging-in-place features, a potential accessory dwelling unit, or pre-wiring for solar panels and EV charging are inexpensive to include during design but costly to retrofit.",
  ],
};
