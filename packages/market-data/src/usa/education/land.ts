import type { EducationModule } from "../../types";

export const USA_EDUCATION_LAND: EducationModule = {
  phase: "LAND",
  title: "Finding and Buying Land",
  summary:
    "The land you choose determines what you can build, what it will cost, and how long it will take. Thorough due diligence before closing can save tens of thousands of dollars.",
  content: `Finding the right building lot is not the same as finding the right house to buy. A beautiful piece of land can hide expensive problems that only reveal themselves after you own it. Your job during this phase is to investigate thoroughly before you commit.

Start with zoning. Every parcel of land in the United States is assigned a zoning classification by the local government. Zoning determines what you can build (single-family, multi-family, mixed use), how tall it can be, how much of the lot you can cover, and how far the structure must sit from property lines. These setback requirements, front yard, side yard, and rear yard, can dramatically reduce the buildable area on a small lot. Call the local planning or zoning office and ask for the specific requirements for your parcel.

Next, evaluate the physical characteristics. Topography matters: a sloped lot costs more to build on because it may require retaining walls, engineered fill, or a stepped foundation. Soil conditions matter even more. A percolation test, called a perc test, determines whether the soil can support a septic system if public sewer is not available. A geotechnical report tells you the soil bearing capacity, which affects foundation design. Clay-heavy soils, high water tables, and rocky ground all add cost.

Utility availability is another critical factor. Confirm that public water, sewer, electricity, natural gas, and internet service reach the property or can be extended to it. Extending a water main or installing a well and septic system can cost $15,000 to $50,000 or more.

Before closing, hire a licensed surveyor to produce a boundary survey. This confirms the exact property lines, identifies easements (areas where utility companies or neighbors have the right to access your land), and reveals any encroachments. A title search and title insurance protect you from claims or liens against the property from previous owners.

Other due diligence items include checking flood zone status through FEMA maps, verifying there are no environmental contamination issues, confirming road access and whether the road is publicly or privately maintained, and reviewing any deed restrictions, covenants, or HOA rules that might limit your building plans.`,
  keyDecisions: [
    "Determine whether the lot's zoning allows your intended property type and whether you need a variance or rezoning.",
    "Decide between a lot with public utilities already available versus a rural lot requiring well and septic, and budget accordingly.",
    "Evaluate topography and soil conditions to understand their impact on foundation cost and site work.",
    "Choose between purchasing a finished lot in a developed subdivision and purchasing raw land that needs clearing and grading.",
  ],
  commonMistakes: [
    "Buying land without confirming zoning allows your planned use. Rezoning requests are expensive, slow, and not guaranteed.",
    "Skipping the perc test on a lot without public sewer. If the land cannot support a septic system, it may be unbuildable.",
    "Assuming utility connections are free or inexpensive. Connection fees, impact fees, and line extensions can total $10,000 to $50,000.",
    "Not getting a survey before closing. Fence lines and descriptions in old deeds are often inaccurate.",
    "Overlooking easements that cross the best buildable area of the lot, forcing an awkward or expensive building layout.",
  ],
  proTips: [
    "Visit the lot during and after a heavy rain to see how water drains across the property. Poor drainage is expensive to fix and impossible to ignore.",
    "Ask the building department about impact fees and tap fees before you buy. In some jurisdictions, these add $5,000 to $20,000 to the cost of a new home.",
    "If the lot is in a flood zone, get a flood insurance quote before closing. Flood insurance costs can make an otherwise affordable lot financially impractical.",
    "Talk to the neighbors. They can tell you about drainage issues, noise, traffic, and neighborhood dynamics that you will never find in public records.",
    "Consider hiring a builder to walk the lot with you before you buy. An experienced builder can spot grading challenges, access problems, and utility issues that save you from a bad purchase.",
  ],
  disclaimer:
    "This content is educational guidance about land acquisition. Zoning laws, environmental regulations, and real estate procedures vary by jurisdiction. Consult a licensed real estate attorney and conduct professional due diligence before purchasing any property.",
};
