import type { EducationModule } from "../../types";

export const USA_EDUCATION_BUILD: EducationModule = {
  phase: "BUILD",
  title: "Construction Phase",
  summary:
    "This is where your plans become a physical structure. Understanding the build sequence, inspection checkpoints, and how to manage change orders will keep your project on track.",
  content: `Construction follows a specific sequence, and understanding that sequence helps you anticipate what comes next, ask better questions, and catch problems early. While the exact order varies by region and builder, the general flow for wood-frame residential construction in the United States follows a predictable pattern.

Site work comes first: clearing, grading the lot to establish proper drainage, and excavating for the foundation. Next is the foundation, which may be a slab-on-grade, a crawl space, or a full basement depending on your design and regional norms. After the foundation is poured and cured, a foundation inspection confirms it meets the engineered specifications.

Framing is the most visually dramatic phase. The floor system, walls, and roof structure go up in a matter of weeks, transforming a concrete pad into the recognizable shape of a house. A framing inspection verifies that the structure matches the approved plans and structural engineering. After framing, the "dry-in" milestone is reached when the roof is sheathed, exterior walls are wrapped with a weather-resistant barrier, and windows and exterior doors are installed. At this point, the interior is protected from weather.

Rough-in is the next major stage. Plumbers, electricians, and HVAC contractors install their systems inside the walls, floors, and ceilings while everything is still open and accessible. Each trade gets its own inspection before the walls are closed up: a plumbing rough-in inspection, an electrical rough-in inspection, and a mechanical (HVAC) rough-in inspection. These inspections are critical because once drywall goes up, these systems are hidden.

After rough-in inspections pass, insulation is installed and inspected, followed by drywall hanging, taping, and finishing. From here, the project moves into the finish phase: interior trim, cabinetry, countertops, flooring, painting, plumbing fixtures, electrical fixtures, and appliances. Exterior work including siding, trim, and final grading happens in parallel with interior finishes.

Throughout construction, your draw schedule governs when the lender releases funds. Each draw requires an inspection by the lender's representative to verify that work is complete before disbursing money. Staying ahead of draw paperwork prevents cash flow gaps that can halt construction.

Change orders are modifications to the original contract scope. They happen on every project, but managing them well is essential. Every change order should be documented in writing with the scope change, cost impact, and timeline impact before the work is done. Verbal agreements about changes are the leading cause of disputes between builders and owners.

Keep a daily log. Note the weather, which trades were on site, what work was performed, any issues or decisions that arose, and any photos taken. This log becomes an invaluable record if disputes arise and helps you track progress against the schedule.`,
  keyDecisions: [
    "Approve or request changes to the construction schedule as conditions change, balancing speed against quality and cost.",
    "Decide on material selections that were left as allowances during the design phase, such as light fixtures, plumbing fixtures, and flooring.",
    "Evaluate and approve or reject change orders based on whether the change is necessary, the price is fair, and the timeline impact is acceptable.",
    "Determine when draw requests are submitted and ensure inspection and documentation requirements are met for each disbursement.",
  ],
  commonMistakes: [
    "Approving change orders verbally without a written price and timeline impact. This leads to surprise bills and finger-pointing.",
    "Falling behind on draw requests, which creates cash flow problems for your contractor and causes work stoppages.",
    "Making finish selections too late. Cabinets, countertops, and specialty tile can have 6 to 12 week lead times. Order early.",
    "Not attending inspections or reviewing inspection reports. Failed inspections that are not addressed properly create hidden defects.",
    "Visiting the site and directing subcontractors directly. All communication should go through your GC to avoid confusion and conflicting instructions.",
  ],
  proTips: [
    "Visit the site at least twice a week, ideally at different times of day. Take photos of every visit, focusing on work in progress and anything that looks different from the plans.",
    "Before drywall goes up, take extensive photos of every wall showing plumbing, electrical, and HVAC rough-in locations. These photos are invaluable for future renovations and for locating pipes and wires behind finished walls.",
    "Build a 2-week buffer into your schedule for weather delays. In most of the United States, rain delays are a matter of when, not if.",
    "Establish a weekly meeting with your contractor to review progress, upcoming work, any issues, and pending decisions. Consistent communication prevents small problems from becoming large ones.",
    "Track your contingency fund carefully. If you are spending contingency in the first half of the project, you are likely heading for a budget overrun and need to make adjustments now.",
  ],
};
