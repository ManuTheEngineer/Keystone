import type { EducationModule } from "../../types";

export const USA_EDUCATION_APPROVE: EducationModule = {
  phase: "APPROVE",
  title: "Permits and Approvals",
  summary:
    "Building without proper permits is illegal and can result in fines, forced demolition, or unsellable property. The permit process protects you by ensuring your plans meet safety codes.",
  content: `Every city and county in the United States requires a building permit before you can start construction on a new home. The permit process exists to ensure that what gets built is safe, structurally sound, and compliant with local building codes. While the process can feel bureaucratic, it is one of the most important protections you have as a homeowner.

The building permit application typically requires a complete set of construction documents: architectural drawings, structural engineering, a site plan showing the building location on your lot, and energy compliance documentation. Some jurisdictions also require a grading plan, a stormwater management plan, or a tree survey. The building department reviews these documents against the locally adopted building codes, usually a version of the International Residential Code for single-family homes.

Plan review timelines vary dramatically by jurisdiction. In smaller towns, you might receive approval in 2 to 4 weeks. In busy metropolitan areas, 6 to 12 weeks is common, and some cities can take even longer. During review, the plan examiner may issue correction comments requiring changes to your drawings. Each round of corrections can add 2 to 4 weeks. This is why having complete, code-compliant drawings from the start is so important.

Permit fees are another budget item to plan for. Most jurisdictions charge fees based on the estimated construction value, typically ranging from $3,000 to $15,000 for a single-family home. Additional fees may include plan review fees, impact fees for schools and parks, utility connection fees, and driveway permit fees.

If your lot is in a homeowners association, you may also need architectural review board approval, which is a separate process with its own requirements for exterior materials, colors, roof pitch, and landscaping. HOA review can take 2 to 8 weeks and may require changes that differ from or exceed building code requirements.

Other approvals you may need include a septic system permit from the health department, a well permit, a driveway access permit from the public works or transportation department, and an environmental or wetland permit if your lot is near sensitive areas. Identify all required approvals early so you can pursue them in parallel rather than discovering them sequentially.`,
  keyDecisions: [
    "Determine all permits and approvals required for your specific lot and project before submitting anything.",
    "Decide whether to pull permits yourself or have your general contractor pull them. Whoever pulls the permit is legally the responsible party.",
    "Plan your submission timeline to account for review periods and potential correction cycles.",
    "Budget for all permit fees, impact fees, and utility connection fees as part of your soft costs.",
  ],
  commonMistakes: [
    "Submitting incomplete drawings and triggering multiple rounds of corrections, each adding weeks to the timeline.",
    "Not researching impact fees in advance. In some jurisdictions, school and park impact fees alone can exceed $10,000.",
    "Starting construction before the permit is issued. Work done without a permit may need to be torn out and redone, and you face fines.",
    "Forgetting about HOA architectural review. An HOA can require design changes even after the building department approves your plans.",
    "Assuming the permit process is just a formality. Plan examiners often catch real problems that would cause issues during construction.",
  ],
  proTips: [
    "Visit the building department in person before you submit. Ask the intake staff what the current review timeline is and whether there are any common rejection reasons you can address proactively.",
    "Submit your permit application as early as possible. You do not need to start construction immediately after approval, and most permits are valid for 6 to 12 months.",
    "Keep a copy of every document you submit and every communication from the building department. You will reference these throughout construction.",
    "Ask about expedited review options. Some jurisdictions offer faster processing for an additional fee, which can be worthwhile if time is critical.",
    "If your plans receive correction comments, address every single item clearly and resubmit with a response letter noting each correction and how it was resolved.",
  ],
};
