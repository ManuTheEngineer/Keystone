/**
 * Phase Steps Definition
 *
 * Every construction phase has specific, actionable steps. Each step teaches
 * the user WHY it matters, not just WHAT to do. Steps can be completed
 * in-app, by uploading proof, or by simple confirmation.
 */

import type { Market } from "@keystone/market-data";

export interface PhaseStep {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  actionType: "in-app" | "upload" | "both" | "confirm";
  inAppRoute?: string;
  requiredDocuments?: string[];
  estimatedTime?: string;
  order: number;
}

// ---------------------------------------------------------------------------
// Phase 0: DEFINE
// ---------------------------------------------------------------------------

const DEFINE_STEPS_USA: PhaseStep[] = [
  {
    id: "define-1",
    title: "Clarify your building purpose",
    description:
      "Decide whether you are building to live in, rent out, or sell. This single decision shapes every choice that follows: budget, design, materials, and financing strategy.",
    whyItMatters:
      "A home you plan to occupy has different requirements than a rental property. Rentals need durable, low-maintenance finishes and may have different code requirements. A flip prioritizes market appeal and fast construction. Getting this wrong means spending money on the wrong things.",
    actionType: "confirm",
    estimatedTime: "30 minutes",
    order: 0,
  },
  {
    id: "define-2",
    title: "Research your target market",
    description:
      "Study construction costs, timelines, and methods in your target location. Read the educational content in the Learn section to understand what building looks like in your chosen market.",
    whyItMatters:
      "Construction in Houston, Texas looks nothing like construction in Lome, Togo. Materials, labor costs, building codes, and even the structure of the walls differ completely. Understanding your market prevents unrealistic expectations and costly surprises.",
    actionType: "in-app",
    inAppRoute: "/learn",
    estimatedTime: "2 to 3 hours",
    order: 1,
  },
  {
    id: "define-3",
    title: "Set preliminary budget range",
    description:
      "Use the Deal Analyzer to estimate total project costs based on your property type, size, and location. This gives you a realistic starting number before you talk to banks or start saving.",
    whyItMatters:
      "Most first-time builders underestimate costs by 30 to 50 percent. Running the numbers early prevents you from committing to a project you cannot finish. An incomplete building is worth less than the land it sits on.",
    actionType: "in-app",
    inAppRoute: "/new-project",
    estimatedTime: "1 hour",
    order: 2,
  },
  {
    id: "define-4",
    title: "Evaluate 3 potential locations",
    description:
      "Identify at least three possible building locations. For each one, note the lot size, zoning, access to utilities, neighborhood quality, and asking price. Upload your comparison notes or photos.",
    whyItMatters:
      "Land is the one thing you cannot change about your project. A beautiful house in a bad location is a bad investment. Comparing multiple options forces you to think critically about what matters most: school district, commute, resale value, or proximity to family.",
    actionType: "upload",
    requiredDocuments: ["Location comparison notes", "Site photos"],
    estimatedTime: "1 to 2 weeks",
    order: 3,
  },
  {
    id: "define-5",
    title: "Define success criteria",
    description:
      "Write down what a successful project looks like for you. Include your target completion date, maximum budget, quality expectations, and any non-negotiable features.",
    whyItMatters:
      "Without written success criteria, scope creep is inevitable. Every contractor will suggest upgrades. Every family member will have opinions. Having clear, documented goals gives you a framework for saying no to changes that do not serve your objectives.",
    actionType: "confirm",
    estimatedTime: "1 hour",
    order: 4,
  },
  {
    id: "define-6",
    title: "Create your project in Keystone",
    description:
      "Start the new project wizard and enter your basic project details: market, property type, purpose, and preliminary budget. This creates your project workspace.",
    whyItMatters:
      "Having a centralized project record from day one means every document, photo, and decision is tracked. Months from now, when you need to recall why you made a specific choice, the record will be there.",
    actionType: "in-app",
    inAppRoute: "/new-project",
    estimatedTime: "15 minutes",
    order: 5,
  },
];

const DEFINE_STEPS_WA: PhaseStep[] = [
  {
    id: "define-1",
    title: "Clarify your building purpose",
    description:
      "Decide whether you are building to live in, rent out, or sell. If you are in the diaspora, determine whether this is a personal retirement home, a family home, or an income property.",
    whyItMatters:
      "In West Africa, many diaspora builders start without a clear purpose and end up with a house that does not match any market need. A rental property in Lome needs different room configurations than a family compound. Clarity here saves years of regret.",
    actionType: "confirm",
    estimatedTime: "30 minutes",
    order: 0,
  },
  {
    id: "define-2",
    title: "Research your target market",
    description:
      "Study construction costs, timelines, and methods in your target country. Read the educational content to understand poteau-poutre construction, local material costs, and the phased building approach.",
    whyItMatters:
      "West African construction uses reinforced concrete block and column-beam (poteau-poutre) methods, not wood framing. Material costs fluctuate with import prices and currency exchange rates. Understanding these realities prevents budget disasters.",
    actionType: "in-app",
    inAppRoute: "/learn",
    estimatedTime: "2 to 3 hours",
    order: 1,
  },
  {
    id: "define-3",
    title: "Set preliminary budget range",
    description:
      "Use the Deal Analyzer to estimate total project costs. Factor in the CFA/USD exchange rate if you are funding from abroad. Include a buffer for currency fluctuations.",
    whyItMatters:
      "Exchange rate swings can change your effective budget by 10 to 20 percent overnight. Setting your budget in both CFA and USD helps you understand your true exposure. Many diaspora projects stall because the builder did not account for this.",
    actionType: "in-app",
    inAppRoute: "/new-project",
    estimatedTime: "1 hour",
    order: 2,
  },
  {
    id: "define-4",
    title: "Evaluate 3 potential locations",
    description:
      "Identify at least three possible building sites. For each, assess road access, water availability, electricity proximity, neighborhood security, and land title status. Upload photos or notes from site visits.",
    whyItMatters:
      "In many West African cities, infrastructure varies dramatically between neighborhoods. A plot that is cheap may have no water main for kilometers. A plot near a main road may be subject to road-widening plans that could claim part of your land.",
    actionType: "upload",
    requiredDocuments: ["Location comparison notes", "Site photos"],
    estimatedTime: "1 to 3 weeks",
    order: 3,
  },
  {
    id: "define-5",
    title: "Define success criteria",
    description:
      "Write down your goals: target completion date, maximum total spend, quality level, and must-have features. If building from abroad, include your visit schedule and remote monitoring plan.",
    whyItMatters:
      "Diaspora builders who do not set written expectations often discover that the building on the ground does not match what they imagined. Clear criteria give your local representative something concrete to enforce on your behalf.",
    actionType: "confirm",
    estimatedTime: "1 hour",
    order: 4,
  },
  {
    id: "define-6",
    title: "Create your project in Keystone",
    description:
      "Start the new project wizard and enter your basic project details: country, property type, purpose, and preliminary budget in CFA.",
    whyItMatters:
      "Tracking everything from the start is critical for remote builders. When you cannot visit the site daily, your digital project record becomes your primary source of truth about what has happened and what has been spent.",
    actionType: "in-app",
    inAppRoute: "/new-project",
    estimatedTime: "15 minutes",
    order: 5,
  },
];

// ---------------------------------------------------------------------------
// Phase 1: FINANCE
// ---------------------------------------------------------------------------

const FINANCE_STEPS_USA: PhaseStep[] = [
  {
    id: "finance-1",
    title: "Calculate your total available capital",
    description:
      "Add up all sources: savings, investment accounts, retirement funds (if applicable), gift funds from family, and any other liquid assets you can dedicate to this project.",
    whyItMatters:
      "Lenders want to see that you have skin in the game. Most construction loans require 20 to 25 percent down. Knowing your exact capital position tells you the maximum project size you can realistically pursue.",
    actionType: "in-app",
    inAppRoute: "/new-project",
    estimatedTime: "2 hours",
    order: 0,
  },
  {
    id: "finance-2",
    title: "Determine financing strategy",
    description:
      "Choose between cash build, construction-to-permanent loan, FHA construction loan, VA loan (if eligible), or a hard money / private lender arrangement. Each has different requirements and timelines.",
    whyItMatters:
      "Your financing type determines your entire project timeline. A construction loan requires plans, permits, and a builder before funding. Cash gives you flexibility but limits your budget. Choosing wrong means months of wasted effort.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 1,
  },
  {
    id: "finance-3",
    title: "Get loan pre-approval",
    description:
      "Apply for construction loan pre-approval with at least two lenders. Upload the pre-approval letter when received. Compare interest rates, draw schedules, and inspection requirements.",
    whyItMatters:
      "Pre-approval tells you exactly how much the bank will lend, which sets your real budget. It also reveals any credit issues you need to fix before you can proceed. Without pre-approval, everything else is speculation.",
    actionType: "upload",
    requiredDocuments: ["Loan pre-approval letter"],
    estimatedTime: "2 to 4 weeks",
    order: 2,
  },
  {
    id: "finance-4",
    title: "Establish construction budget",
    description:
      "Load market benchmarks into the Budget page. Break down costs by category: site prep, foundation, framing, roofing, plumbing, electrical, HVAC, interior finishes, exterior, and permits.",
    whyItMatters:
      "A line-item budget is the single most important financial tool in construction. It lets you compare bids accurately, track spending by category, and catch overruns before they cascade. Lump-sum budgets hide problems until it is too late.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "3 to 5 hours",
    order: 3,
  },
  {
    id: "finance-5",
    title: "Set contingency reserve (15 to 20 percent)",
    description:
      "Add a contingency line item to your budget equal to 15 to 20 percent of your total construction cost. This is not optional. It is required by most lenders and essential for project survival.",
    whyItMatters:
      "No construction project in history has gone exactly to plan. Hidden site conditions, material price increases, design changes, and weather delays all cost money. Without contingency, the first surprise becomes a crisis that can stop your entire project.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "30 minutes",
    order: 4,
  },
  {
    id: "finance-6",
    title: "Open construction bank account",
    description:
      "Open a dedicated checking account for construction funds. All project income goes in, all project payments go out. Never mix construction funds with personal accounts.",
    whyItMatters:
      "Commingling funds makes it impossible to track true project costs. It also creates problems with lender draw requests, tax deductions, and financial audits. A separate account is basic financial hygiene for any construction project.",
    actionType: "confirm",
    estimatedTime: "1 to 2 hours",
    order: 5,
  },
];

const FINANCE_STEPS_WA: PhaseStep[] = [
  {
    id: "finance-1",
    title: "Calculate your total available capital",
    description:
      "Determine how much money you can commit to this project, in both your home currency and CFA. Include savings, tontine contributions, family pledges, and any other sources.",
    whyItMatters:
      "In West Africa, most residential construction is self-funded in phases. You build what you can afford, then pause until you save more. Knowing your exact capital determines which phases you can complete now and which must wait.",
    actionType: "in-app",
    inAppRoute: "/new-project",
    estimatedTime: "2 hours",
    order: 0,
  },
  {
    id: "finance-2",
    title: "Determine financing strategy",
    description:
      "Choose between full cash build, phased construction (build as funds are available), or a combination with family contributions. Formal construction loans are rare in West Africa, so plan accordingly.",
    whyItMatters:
      "Phased construction is the norm, but poor planning leads to half-finished structures that deteriorate. Planning which phases to fund first ensures you protect completed work and maintain structural integrity between building seasons.",
    actionType: "confirm",
    estimatedTime: "1 week",
    order: 1,
  },
  {
    id: "finance-3",
    title: "Set up savings plan or transfer schedule",
    description:
      "If funding from abroad, establish a regular transfer schedule to your local construction account. Research the best transfer services for your corridor. Upload your savings plan or transfer schedule.",
    whyItMatters:
      "Transfer fees can consume 5 to 10 percent of your funds if you use the wrong service. Planning regular transfers also prevents the common trap of sending large lump sums that are difficult to account for once they reach the local market.",
    actionType: "upload",
    requiredDocuments: ["Savings plan or transfer schedule"],
    estimatedTime: "1 to 2 weeks",
    order: 2,
  },
  {
    id: "finance-4",
    title: "Establish construction budget",
    description:
      "Build a detailed budget in CFA using local cost benchmarks. Include: terrain preparation, foundation, columns and beams, walls, roofing, plumbing, electrical, plastering, tiling, and painting.",
    whyItMatters:
      "Material prices in West Africa can change monthly due to import costs and currency fluctuations. A detailed budget lets you lock in prices by buying materials early for upcoming phases, which is one of the most effective cost-saving strategies.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "3 to 5 hours",
    order: 3,
  },
  {
    id: "finance-5",
    title: "Set contingency reserve (15 to 20 percent)",
    description:
      "Add a contingency line to your budget. Material shortages, price spikes, and unexpected site conditions are common. This reserve is your safety net.",
    whyItMatters:
      "Cement prices alone can spike 20 percent during rainy season when demand surges. Steel rebar prices follow global commodity markets. Without a contingency buffer, a single price increase can stall your entire project for months.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "30 minutes",
    order: 4,
  },
  {
    id: "finance-6",
    title: "Open construction bank account",
    description:
      "Open a dedicated account at a local bank for construction funds. If you are abroad, arrange for a trusted local representative to have co-signing authority. Never use a personal account.",
    whyItMatters:
      "Financial accountability is the biggest challenge for diaspora builders. A dedicated account with transaction records creates an audit trail. It also makes it harder for funds to be diverted to non-project expenses.",
    actionType: "confirm",
    estimatedTime: "1 to 3 days",
    order: 5,
  },
];

// ---------------------------------------------------------------------------
// Phase 2: LAND
// ---------------------------------------------------------------------------

const LAND_STEPS_USA: PhaseStep[] = [
  {
    id: "land-1",
    title: "Identify 3 potential lots",
    description:
      "Find at least three buildable lots that match your budget, location preferences, and building goals. Upload listings, photos, or map screenshots for comparison.",
    whyItMatters:
      "Comparing multiple lots forces you to evaluate trade-offs: price versus location, lot size versus neighborhood, flat versus sloped. Buying the first lot you see is one of the most common and most expensive mistakes in residential construction.",
    actionType: "upload",
    requiredDocuments: ["Lot listings", "Site photos or maps"],
    estimatedTime: "2 to 4 weeks",
    order: 0,
  },
  {
    id: "land-2",
    title: "Evaluate zoning and restrictions",
    description:
      "Confirm that your intended use (single family, duplex, etc.) is allowed under the lot's zoning classification. Check for setback requirements, height limits, and any deed restrictions or HOA covenants.",
    whyItMatters:
      "Zoning violations can force you to demolish what you have built. Setback requirements determine where on the lot you can actually place the building. Discovering restrictions after purchase can make your plans impossible to execute.",
    actionType: "upload",
    requiredDocuments: ["Zoning confirmation or certificate"],
    estimatedTime: "1 to 2 weeks",
    order: 1,
  },
  {
    id: "land-3",
    title: "Commission land survey",
    description:
      "Hire a licensed surveyor to mark exact property boundaries, identify easements, and confirm the legal description. Upload the completed survey document.",
    whyItMatters:
      "Building even one foot over your property line can trigger a lawsuit and forced demolition. Easements can prevent you from building in certain areas. A survey is a legal document that protects your investment for the life of the property.",
    actionType: "upload",
    requiredDocuments: ["Land survey document"],
    estimatedTime: "1 to 2 weeks",
    order: 2,
  },
  {
    id: "land-4",
    title: "Conduct soil and percolation test",
    description:
      "Hire a geotechnical engineer to test soil bearing capacity and drainage characteristics. If the lot uses a septic system, a percolation test determines if the soil can handle it. Upload the soil report.",
    whyItMatters:
      "Soil conditions determine your foundation type and cost. Clay soil expands and contracts, requiring engineered foundations. Poor drainage or failed perc tests can add tens of thousands in site work or make the lot unbuildable.",
    actionType: "upload",
    requiredDocuments: ["Soil test report", "Percolation test results"],
    estimatedTime: "1 to 3 weeks",
    order: 3,
  },
  {
    id: "land-5",
    title: "Complete title search",
    description:
      "Have a title company or attorney search public records to confirm clear ownership, no outstanding liens, no boundary disputes, and no encumbrances that would affect your use. Upload the title report.",
    whyItMatters:
      "A lien from a previous owner can become your problem. An unresolved boundary dispute can halt construction. Title insurance protects you, but only if you identify issues before closing. Skipping this step is gambling with your entire investment.",
    actionType: "upload",
    requiredDocuments: ["Title search report"],
    estimatedTime: "1 to 2 weeks",
    order: 4,
  },
  {
    id: "land-6",
    title: "Negotiate purchase price",
    description:
      "Make an offer based on comparable sales, lot condition, and your budget. Include contingencies for soil test results, survey, and financing. Document the agreed price and terms.",
    whyItMatters:
      "The purchase agreement is a legally binding contract. Contingencies protect you if the soil test fails or financing falls through. Without contingencies, you could lose your earnest money on a lot you cannot build on.",
    actionType: "confirm",
    estimatedTime: "1 to 3 weeks",
    order: 5,
  },
  {
    id: "land-7",
    title: "Close on land purchase",
    description:
      "Complete the closing process: sign documents, transfer funds, and receive the deed. Upload closing documents and the recorded deed.",
    whyItMatters:
      "The deed is your proof of ownership. Recording it with the county makes it a matter of public record and protects against future claims. Keep both digital and physical copies in a secure location.",
    actionType: "upload",
    requiredDocuments: ["Closing documents", "Recorded deed"],
    estimatedTime: "1 to 2 weeks",
    order: 6,
  },
];

const LAND_STEPS_WA: PhaseStep[] = [
  {
    id: "land-1",
    title: "Identify 3 potential plots",
    description:
      "Find at least three buildable plots. Consider proximity to paved roads, water mains, and electrical lines. In Lome and Accra, verify the neighborhood is not in a flood zone or government development corridor. Upload photos and details.",
    whyItMatters:
      "Land fraud is common in West Africa. Verifying multiple options and doing thorough due diligence protects you from buying disputed land. Location also determines your infrastructure costs, which can exceed the land price itself.",
    actionType: "upload",
    requiredDocuments: ["Plot comparison notes", "Site photos"],
    estimatedTime: "2 to 6 weeks",
    order: 0,
  },
  {
    id: "land-2",
    title: "Evaluate zoning and local regulations",
    description:
      "Check with the local prefecture or municipality for land use restrictions, building height limits, and required setbacks from roads and neighbors. Upload any written confirmations.",
    whyItMatters:
      "Municipal plans for road widening or public projects can claim part of your plot. Some areas restrict commercial use or multi-story buildings. Discovering this after you have bought and started building can result in forced demolition.",
    actionType: "upload",
    requiredDocuments: ["Zoning or regulatory confirmation"],
    estimatedTime: "1 to 3 weeks",
    order: 1,
  },
  {
    id: "land-3",
    title: "Commission land survey (bornage)",
    description:
      "Hire a licensed surveyor (geometre expert agree) to survey and mark the plot boundaries with concrete posts (bornes). This creates an official plan that the land registry recognizes.",
    whyItMatters:
      "Boundary disputes are one of the most common causes of construction delays in West Africa. A bornage by a licensed surveyor creates a legally defensible boundary record. Without it, neighbors can (and do) claim parts of your plot.",
    actionType: "upload",
    requiredDocuments: ["Survey plan (plan topographique)"],
    estimatedTime: "1 to 3 weeks",
    order: 2,
  },
  {
    id: "land-4",
    title: "Conduct soil test",
    description:
      "Hire an engineer to test soil bearing capacity. In coastal areas (Lome, Accra, Cotonou), soil conditions vary dramatically. Sandy soil near the coast may require deep foundations. Upload the soil report.",
    whyItMatters:
      "The poteau-poutre (column-beam) construction method used in West Africa relies on columns carrying loads down to foundations. If the soil cannot support those point loads, columns sink unevenly, causing cracking and structural failure. Soil testing costs little but prevents catastrophic foundation problems.",
    actionType: "upload",
    requiredDocuments: ["Soil test report (etude de sol)"],
    estimatedTime: "1 to 2 weeks",
    order: 3,
  },
  {
    id: "land-5",
    title: "Verify titre foncier (land title)",
    description:
      "Confirm the seller has a valid titre foncier (formal land title) or at minimum a certificat administratif. Check at the land registry (conservation fonciere) that the title has no liens or competing claims. Upload verification documents.",
    whyItMatters:
      "In Togo and much of West Africa, many land transactions happen informally. A titre foncier is the only fully secure form of ownership. Buying land with only a customary title or verbal agreement puts your entire investment at risk of competing claims that can surface years later.",
    actionType: "upload",
    requiredDocuments: ["Titre foncier copy", "Land registry verification"],
    estimatedTime: "2 to 6 weeks",
    order: 4,
  },
  {
    id: "land-6",
    title: "Negotiate purchase price",
    description:
      "Agree on a price with the seller. In West Africa, always negotiate through a notary (notaire) who can verify both parties' identities and the legality of the transaction. Document the agreed terms.",
    whyItMatters:
      "Having a notaire involved creates a legal record of the transaction and provides some protection against fraud. The notaire also handles the transfer of the titre foncier to your name, which is the critical legal step.",
    actionType: "confirm",
    estimatedTime: "1 to 4 weeks",
    order: 5,
  },
  {
    id: "land-7",
    title: "Complete land purchase (acte de vente)",
    description:
      "Sign the acte de vente before a notaire. Pay the transfer taxes. Begin the titre foncier transfer process if applicable. Upload all closing documents.",
    whyItMatters:
      "The acte de vente signed before a notaire is your primary proof of purchase. The titre foncier transfer can take months, so starting it immediately after purchase protects your ownership. Keep certified copies in multiple secure locations.",
    actionType: "upload",
    requiredDocuments: ["Acte de vente", "Payment receipts", "Titre foncier transfer receipt"],
    estimatedTime: "1 to 2 weeks",
    order: 6,
  },
];

// ---------------------------------------------------------------------------
// Phase 3: DESIGN
// ---------------------------------------------------------------------------

const DESIGN_STEPS_USA: PhaseStep[] = [
  {
    id: "design-1",
    title: "Select architect or designer",
    description:
      "Interview at least three architects or residential designers. Review their portfolios for projects similar to yours. Add your selected professional to the Team page.",
    whyItMatters:
      "Your architect translates your vision into buildable plans. A poor match means endless revisions, missed requirements, and wasted money. An architect who has never designed your property type will make expensive mistakes that contractors inherit.",
    actionType: "both",
    inAppRoute: "",
    requiredDocuments: ["Architect agreement or letter of engagement"],
    estimatedTime: "2 to 4 weeks",
    order: 0,
  },
  {
    id: "design-2",
    title: "Review 3 floor plan options",
    description:
      "Work with your architect to develop at least three conceptual floor plans. Compare room sizes, flow, natural light, and construction cost implications. Upload the draft plans.",
    whyItMatters:
      "Floor plan changes during construction are extremely expensive. Every wall that moves after framing costs thousands. Reviewing multiple options now, when changes cost nothing, prevents painful and costly changes later.",
    actionType: "upload",
    requiredDocuments: ["Draft floor plans (minimum 3 options)"],
    estimatedTime: "3 to 6 weeks",
    order: 1,
  },
  {
    id: "design-3",
    title: "Finalize architectural plans",
    description:
      "Approve the final floor plans, elevations, sections, and details. These become the construction documents that contractors bid on and build from. Upload the complete set.",
    whyItMatters:
      "Construction documents are the legal instructions for your project. Incomplete or ambiguous plans lead to contractor disputes, change orders, and quality problems. Every detail not specified in the plans becomes a decision someone else makes for you.",
    actionType: "upload",
    requiredDocuments: ["Final construction documents (full set)"],
    estimatedTime: "4 to 8 weeks",
    order: 2,
  },
  {
    id: "design-4",
    title: "Complete structural engineering",
    description:
      "Hire a structural engineer to design the foundation, framing connections, and any specialized structural elements. The engineer stamps (certifies) the structural drawings. Upload the stamped plans.",
    whyItMatters:
      "The structural engineer ensures your building will not collapse. Their stamp is a legal certification that the structure meets building codes. Most jurisdictions require engineered plans for anything beyond the simplest structures. This is not optional.",
    actionType: "upload",
    requiredDocuments: ["Stamped structural engineering drawings"],
    estimatedTime: "2 to 4 weeks",
    order: 3,
  },
  {
    id: "design-5",
    title: "Make material selections",
    description:
      "Choose your exterior cladding, roofing material, windows, doors, flooring, countertops, cabinets, fixtures, and appliances. Document all selections with model numbers and prices.",
    whyItMatters:
      "Material selections directly impact both budget and timeline. Custom windows can take 12 weeks to arrive. Backordered tile can delay your entire finishing schedule. Making selections now lets you order long-lead items early and lock in prices.",
    actionType: "upload",
    requiredDocuments: ["Material selection sheets"],
    estimatedTime: "2 to 4 weeks",
    order: 4,
  },
  {
    id: "design-6",
    title: "Complete energy calculations",
    description:
      "Have your architect or an energy consultant complete the energy code compliance calculations (Manual J, Manual S, Manual D for HVAC sizing). Upload the energy compliance report.",
    whyItMatters:
      "Energy codes are enforced during inspection. Failing energy compliance means ripping out insulation, replacing windows, or upgrading HVAC equipment after installation. Compliance is easier and cheaper to achieve during design than during construction.",
    actionType: "upload",
    requiredDocuments: ["Energy compliance report", "Manual J calculation"],
    estimatedTime: "1 to 2 weeks",
    order: 5,
  },
  {
    id: "design-7",
    title: "Get construction cost estimate from plans",
    description:
      "With completed plans, get a detailed cost estimate from at least one estimator or general contractor. Update your Budget page with actual numbers based on your specific design.",
    whyItMatters:
      "Preliminary budgets are educated guesses. A cost estimate from actual plans is the first real number. If it exceeds your budget, this is the last opportunity to make changes cheaply. After permits, changes become expensive.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 to 3 weeks",
    order: 6,
  },
];

const DESIGN_STEPS_WA: PhaseStep[] = [
  {
    id: "design-1",
    title: "Select architect or designer",
    description:
      "Find an architect familiar with local construction methods (poteau-poutre, parpaing). If you are in the diaspora, verify their license with the Ordre des Architectes. Add them to your Team page.",
    whyItMatters:
      "An architect who understands both your aesthetic preferences and local construction realities is essential. Many diaspora builders hire architects from abroad whose designs cannot be built with local methods and materials, causing expensive redesigns.",
    actionType: "both",
    inAppRoute: "",
    requiredDocuments: ["Architect agreement"],
    estimatedTime: "2 to 4 weeks",
    order: 0,
  },
  {
    id: "design-2",
    title: "Review 3 floor plan options",
    description:
      "Work with your architect to create at least three plan options. Consider cross-ventilation (critical in tropical climates), room orientation for heat management, and local building conventions. Upload drafts.",
    whyItMatters:
      "In tropical climates, orientation and ventilation are not luxuries. They determine whether your home is livable without constant air conditioning. Getting the floor plan right is the single biggest factor in long-term comfort and operating costs.",
    actionType: "upload",
    requiredDocuments: ["Draft floor plans (minimum 3 options)"],
    estimatedTime: "3 to 6 weeks",
    order: 1,
  },
  {
    id: "design-3",
    title: "Finalize architectural plans",
    description:
      "Approve the final plans including room layouts, column positions, beam spans, and roof design. These plans will be submitted for any required permits and used by your construction team. Upload the complete set.",
    whyItMatters:
      "Clear, detailed plans reduce disputes with your mason (maitre macon) and prevent the common problem of work being done differently than you intended. For diaspora builders, approved plans are your primary tool for quality control from a distance.",
    actionType: "upload",
    requiredDocuments: ["Final architectural plans"],
    estimatedTime: "3 to 6 weeks",
    order: 2,
  },
  {
    id: "design-4",
    title: "Complete structural engineering",
    description:
      "Have a structural engineer (ingenieur genie civil) design the foundation, column reinforcement, beam sizing, and roof structure. Their calculations ensure the building can withstand local conditions. Upload the stamped plans.",
    whyItMatters:
      "Structural failures in West Africa are tragically common when buildings are constructed without engineering calculations. Column reinforcement, foundation depth, and beam sizing all require engineering based on your specific soil conditions and building height.",
    actionType: "upload",
    requiredDocuments: ["Structural engineering calculations and drawings"],
    estimatedTime: "2 to 4 weeks",
    order: 3,
  },
  {
    id: "design-5",
    title: "Make material selections",
    description:
      "Choose your roofing material (aluminium or tile), window type, door style, floor finish (carrelage or granito), and paint. Get prices from at least two suppliers for each major material.",
    whyItMatters:
      "Material availability and pricing in West Africa are volatile. Imported materials can double in price or become unavailable without warning. Making selections early and sourcing from reliable suppliers prevents delays and budget overruns.",
    actionType: "upload",
    requiredDocuments: ["Material selection list with prices"],
    estimatedTime: "2 to 3 weeks",
    order: 4,
  },
  {
    id: "design-6",
    title: "Get construction cost estimate from plans",
    description:
      "With completed plans, get a detailed devis (estimate) from your maitre macon or a quantity surveyor. Break it down by phase so you can plan your funding accordingly. Update your Budget page.",
    whyItMatters:
      "A phase-by-phase devis is essential for phased construction. It tells you exactly how much each stage will cost, so you can plan your transfers and avoid starting a phase you cannot afford to finish.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 to 2 weeks",
    order: 5,
  },
];

// ---------------------------------------------------------------------------
// Phase 4: APPROVE
// ---------------------------------------------------------------------------

const APPROVE_STEPS_USA: PhaseStep[] = [
  {
    id: "approve-1",
    title: "Submit building permit application",
    description:
      "Submit your construction documents, site plan, and permit application to the local building department. Pay the permit fees. Upload the application receipt.",
    whyItMatters:
      "Building without a permit is illegal and makes your home uninsurable, unfinanceable, and potentially unsellable. The permit process also catches design errors that could cause safety problems. It exists to protect you.",
    actionType: "upload",
    requiredDocuments: ["Permit application receipt"],
    estimatedTime: "1 day to submit",
    order: 0,
  },
  {
    id: "approve-2",
    title: "Address plan review comments",
    description:
      "The building department will review your plans and may issue correction requests. Work with your architect to address each comment and resubmit if needed. Upload revised plans.",
    whyItMatters:
      "Plan review comments are not optional suggestions. They are required corrections. Addressing them thoroughly and promptly prevents delays. Incomplete responses create back-and-forth cycles that can add weeks to your timeline.",
    actionType: "upload",
    requiredDocuments: ["Revised plans (if applicable)", "Response letter"],
    estimatedTime: "2 to 6 weeks",
    order: 1,
  },
  {
    id: "approve-3",
    title: "Receive building permit",
    description:
      "Once your plans are approved, the building department issues your permit. Upload the approved permit. Post the original on your job site as required by law.",
    whyItMatters:
      "The building permit is your legal authorization to construct. It specifies what you are allowed to build and triggers the inspection schedule. Your permit number is referenced in every inspection, loan draw, and insurance claim.",
    actionType: "upload",
    requiredDocuments: ["Approved building permit"],
    estimatedTime: "1 to 2 days after approval",
    order: 2,
  },
  {
    id: "approve-4",
    title: "Confirm utility connections",
    description:
      "Contact water, sewer, electric, and gas utilities to confirm service availability and schedule connection. Some utilities require separate permits or fees. Confirm all are arranged.",
    whyItMatters:
      "Utility connection delays are a common cause of project delays. Some utilities require months of lead time, especially for new service in developing areas. Discovering a utility is unavailable after construction starts is a costly surprise.",
    actionType: "confirm",
    estimatedTime: "1 to 4 weeks",
    order: 3,
  },
  {
    id: "approve-5",
    title: "Get HOA approval (if applicable)",
    description:
      "If your lot is in a community with a homeowners association, submit your architectural plans for HOA review and approval. Upload the approval letter.",
    whyItMatters:
      "HOA architectural review can be surprisingly strict. Exterior colors, materials, roof pitch, fence height, and even mailbox style may be regulated. Building without HOA approval can result in fines and forced modifications at your expense.",
    actionType: "upload",
    requiredDocuments: ["HOA approval letter"],
    estimatedTime: "2 to 6 weeks",
    order: 4,
  },
];

const APPROVE_STEPS_WA: PhaseStep[] = [
  {
    id: "approve-1",
    title: "Submit building permit application (permis de construire)",
    description:
      "Submit your architectural plans, site plan, and permit application to the local mairie (city hall) or prefecture. Pay the required fees. Upload the application receipt.",
    whyItMatters:
      "While enforcement varies by location, a permis de construire protects you legally if neighbors or authorities challenge your construction. It also confirms that your building meets local regulations and will not be subject to demolition orders.",
    actionType: "upload",
    requiredDocuments: ["Permit application receipt"],
    estimatedTime: "1 day to submit",
    order: 0,
  },
  {
    id: "approve-2",
    title: "Address review comments (if any)",
    description:
      "The municipal authority may request changes to your plans. Work with your architect to address any comments. In some areas, this process is informal. Upload any revised documents.",
    whyItMatters:
      "Even in areas where enforcement is less rigorous, addressing official comments creates a paper trail that protects your legal right to build. This documentation becomes important if disputes arise with neighbors or future authorities.",
    actionType: "upload",
    requiredDocuments: ["Revised plans (if applicable)"],
    estimatedTime: "1 to 4 weeks",
    order: 1,
  },
  {
    id: "approve-3",
    title: "Receive building permit",
    description:
      "Once approved, collect your permis de construire. Upload a copy and keep the original in a safe location. Display a copy at your construction site.",
    whyItMatters:
      "Your permis de construire is a legal document with an expiration date. Construction must begin within the validity period. It also specifies the approved building parameters. Any changes beyond what is approved technically require a modification permit.",
    actionType: "upload",
    requiredDocuments: ["Approved permis de construire"],
    estimatedTime: "1 to 8 weeks after submission",
    order: 2,
  },
  {
    id: "approve-4",
    title: "Confirm utility connections",
    description:
      "Verify water main proximity, arrange for electrical service (CEET in Togo, ECG in Ghana, SBEE in Benin), and plan for sewage (often a septic system in West Africa). Confirm arrangements.",
    whyItMatters:
      "Utility infrastructure in many West African neighborhoods is limited. A water connection may require extending the main hundreds of meters at your expense. Electrical service may require a transformer. Knowing this before construction starts prevents costly surprises.",
    actionType: "confirm",
    estimatedTime: "1 to 4 weeks",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Phase 5: ASSEMBLE
// ---------------------------------------------------------------------------

const ASSEMBLE_STEPS_USA: PhaseStep[] = [
  {
    id: "assemble-1",
    title: "Get 3 bids for each major trade",
    description:
      "Request detailed bids from at least three contractors for each major scope: general contractor (or separate trades for framing, plumbing, electrical, HVAC, roofing). Track bids in the Team page.",
    whyItMatters:
      "Without competitive bids, you have no way to know if a price is fair. The difference between the highest and lowest bid for the same work is typically 30 to 50 percent. Three bids give you a reliable market price.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "2 to 4 weeks",
    order: 0,
  },
  {
    id: "assemble-2",
    title: "Compare bids and select contractors",
    description:
      "Compare bids on an apples-to-apples basis. Check scope of work, exclusions, allowances, and payment terms. Verify references. The lowest bid is not always the best value. Review bids in the Team page.",
    whyItMatters:
      "A low bid with vague scope leads to expensive change orders. A contractor who excludes cleanup, dumpsters, or permits is not really cheaper. Understanding what is and is not included in each bid prevents financial surprises during construction.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 to 2 weeks",
    order: 1,
  },
  {
    id: "assemble-3",
    title: "Execute construction contracts",
    description:
      "Sign written contracts with each selected contractor. Use the Documents page to generate contracts from templates. Every contract should specify scope, price, payment schedule, timeline, and dispute resolution.",
    whyItMatters:
      "A handshake agreement is unenforceable. Written contracts protect both you and the contractor. They define what work is included, when payment is due, and what happens when things go wrong. Never pay a contractor without a signed contract.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 to 2 weeks",
    order: 2,
  },
  {
    id: "assemble-4",
    title: "Verify contractor insurance",
    description:
      "Request and verify certificates of insurance from every contractor: general liability, workers compensation, and auto insurance. Upload certificates.",
    whyItMatters:
      "If an uninsured worker is injured on your property, you are liable. If an uninsured contractor damages a neighbor's property, you may be liable. Certificates of insurance transfer these risks to the contractor's insurance company where they belong.",
    actionType: "upload",
    requiredDocuments: ["Certificates of insurance for each contractor"],
    estimatedTime: "1 week",
    order: 3,
  },
  {
    id: "assemble-5",
    title: "Obtain builder's risk insurance",
    description:
      "Purchase a builder's risk insurance policy to cover the structure during construction against fire, theft, vandalism, and weather damage. Upload the policy.",
    whyItMatters:
      "Your homeowner's insurance does not cover a building under construction. A fire, tornado, or theft of materials during the build can wipe out your entire investment. Builder's risk insurance typically costs 1 to 3 percent of construction value and is essential protection.",
    actionType: "upload",
    requiredDocuments: ["Builder's risk insurance policy"],
    estimatedTime: "1 week",
    order: 4,
  },
  {
    id: "assemble-6",
    title: "Hold pre-construction meeting",
    description:
      "Gather your general contractor (or all trade contractors), architect, and lender for a pre-construction meeting. Review the schedule, communication plan, payment process, and site access rules.",
    whyItMatters:
      "Misaligned expectations cause most construction disputes. A pre-construction meeting puts everyone on the same page about how the project will run. It establishes communication protocols so problems are addressed immediately, not discovered weeks later.",
    actionType: "confirm",
    estimatedTime: "2 to 3 hours",
    order: 5,
  },
  {
    id: "assemble-7",
    title: "Place initial material orders",
    description:
      "Order long-lead items: custom windows, special-order doors, trusses, and any materials with extended delivery times. Confirm delivery dates align with your construction schedule.",
    whyItMatters:
      "Long-lead items can take 8 to 16 weeks to manufacture and deliver. If you wait until you need them, your entire project stops. Ordering early is one of the simplest ways to prevent schedule delays.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 6,
  },
];

const ASSEMBLE_STEPS_WA: PhaseStep[] = [
  {
    id: "assemble-1",
    title: "Get bids from 3 masons (maitres macons)",
    description:
      "Request detailed devis from at least three experienced masons. Each devis should break down costs by phase: foundation, columns/beams, walls, roofing. Track bids in the Team page.",
    whyItMatters:
      "The maitre macon is the most critical hire in West African construction. They manage the entire build process. A bad mason means structural problems, wasted materials, and inflated costs. Competitive devis help you identify fair pricing.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "2 to 4 weeks",
    order: 0,
  },
  {
    id: "assemble-2",
    title: "Compare bids and select your team",
    description:
      "Compare devis carefully. Check if cement, steel, and labor costs are itemized separately. Verify past projects by visiting buildings they have completed. Select your mason and any specialist trades.",
    whyItMatters:
      "In West Africa, the most common source of budget overruns is material waste by unskilled masons. Visiting completed projects lets you see the quality of their work. Cracks in walls, uneven surfaces, and poor finishing are signs of bad workmanship.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 to 2 weeks",
    order: 1,
  },
  {
    id: "assemble-3",
    title: "Execute construction agreements",
    description:
      "Sign written agreements with your mason and all trade workers. Define scope, price per phase, payment milestones tied to completed work, and quality standards. Use the Documents page to generate contracts.",
    whyItMatters:
      "Verbal agreements are the norm in West Africa, and they are the primary cause of disputes. A written contract protects both parties and gives you legal recourse if work quality or timeline commitments are not met.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 week",
    order: 2,
  },
  {
    id: "assemble-4",
    title: "Appoint a site supervisor (if building from abroad)",
    description:
      "If you cannot be on site daily, appoint a trusted local representative to supervise construction. This person verifies material delivery, checks work quality, and sends you daily photo updates.",
    whyItMatters:
      "Diaspora builders who do not have eyes on the ground consistently report material theft, work done below specification, and inflated invoices. A dedicated supervisor is your most important quality control tool when building remotely.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 3,
  },
  {
    id: "assemble-5",
    title: "Place initial material orders",
    description:
      "Purchase cement, steel rebar, and gravel for the foundation phase. Buy in bulk for better prices but only what you can store securely. Confirm delivery to the site.",
    whyItMatters:
      "Material prices fluctuate weekly in West African markets. Buying cement and steel when prices are favorable can save 10 to 15 percent. But storing materials on an unsecured site invites theft. Balance bulk purchasing with site security.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 4,
  },
  {
    id: "assemble-6",
    title: "Hold pre-construction meeting",
    description:
      "Meet with your mason, architect, supervisor, and any specialist trades. Walk the site together. Review the plans, construction sequence, and payment milestones. If you are abroad, hold this meeting by video call.",
    whyItMatters:
      "Getting everyone aligned before the first shovel hits the ground prevents costly misunderstandings. The mason needs to understand the architect's intent. The supervisor needs to know what to verify. You need to know what to expect at each milestone.",
    actionType: "confirm",
    estimatedTime: "2 to 3 hours",
    order: 5,
  },
];

// ---------------------------------------------------------------------------
// Phase 6: BUILD
// ---------------------------------------------------------------------------

const BUILD_STEPS_USA: PhaseStep[] = [
  {
    id: "build-1",
    title: "Complete site preparation",
    description:
      "Clear the lot, grade for drainage, install erosion control, and mark the building footprint. Upload site photos showing the prepared lot.",
    whyItMatters:
      "Proper grading ensures water flows away from your foundation, not toward it. Erosion control is required by law in most jurisdictions. A well-prepared site prevents water intrusion problems for the life of the building.",
    actionType: "upload",
    requiredDocuments: ["Site preparation photos"],
    estimatedTime: "1 to 2 weeks",
    order: 0,
  },
  {
    id: "build-2",
    title: "Pour foundation",
    description:
      "Excavate and pour the foundation per engineered plans. Schedule and pass the foundation inspection before any work is covered. Upload the inspection report and photos.",
    whyItMatters:
      "The foundation supports everything above it for the next hundred years. A foundation error is nearly impossible to fix after the fact. The inspection verifies rebar placement, concrete strength, and proper dimensions before you pour.",
    actionType: "upload",
    requiredDocuments: ["Foundation inspection report", "Foundation photos"],
    estimatedTime: "1 to 3 weeks",
    order: 1,
  },
  {
    id: "build-3",
    title: "Complete framing",
    description:
      "Erect walls, install floor and roof trusses, and sheathe the exterior. Schedule and pass the framing inspection. Upload the inspection report and framing photos.",
    whyItMatters:
      "Framing is when your house takes physical shape. The framing inspection verifies that walls are plumb, connections are properly nailed, and the structure matches the approved plans. Framing errors caught now are fixable. Framing errors found after drywall are a nightmare.",
    actionType: "upload",
    requiredDocuments: ["Framing inspection report", "Framing photos"],
    estimatedTime: "2 to 4 weeks",
    order: 2,
  },
  {
    id: "build-4",
    title: "Install roof",
    description:
      "Install roofing underlayment, flashing, and final roofing material. The roof must be watertight before interior work begins. Upload roof completion photos.",
    whyItMatters:
      "Once the roof is on, your building is 'dried in' and protected from weather. Interior finishes cannot begin until this is complete. Rain damage to exposed framing, insulation, or drywall is expensive to repair and can cause hidden mold problems.",
    actionType: "upload",
    requiredDocuments: ["Roof installation photos"],
    estimatedTime: "1 to 2 weeks",
    order: 3,
  },
  {
    id: "build-5",
    title: "Complete rough-in (plumbing, electrical, HVAC)",
    description:
      "Install all plumbing pipes, electrical wiring, and HVAC ductwork inside walls and ceilings. Schedule and pass the rough-in inspection for each trade. Upload inspection reports.",
    whyItMatters:
      "Rough-in work is hidden inside walls forever after drywall goes up. The rough-in inspection is the only opportunity to verify that all plumbing, electrical, and HVAC work meets code. Failures found later require tearing out finished walls.",
    actionType: "upload",
    requiredDocuments: ["Rough-in inspection report (mechanical)", "Rough-in photos"],
    estimatedTime: "2 to 4 weeks",
    order: 4,
  },
  {
    id: "build-6",
    title: "Install insulation",
    description:
      "Install insulation in exterior walls, attic, and any conditioned spaces. Schedule and pass the insulation inspection. Upload the inspection report.",
    whyItMatters:
      "Insulation quality directly determines your energy bills for the life of the building. Gaps, compression, and missing sections reduce effectiveness dramatically. The insulation inspection catches these problems before they are sealed behind drywall.",
    actionType: "upload",
    requiredDocuments: ["Insulation inspection report"],
    estimatedTime: "1 week",
    order: 5,
  },
  {
    id: "build-7",
    title: "Complete drywall",
    description:
      "Hang, tape, mud, and sand all drywall. This closes up the wall cavities and creates the interior surfaces for painting and finishing. Confirm completion.",
    whyItMatters:
      "Drywall marks a major psychological milestone: your house starts looking like a house. But it also means everything behind the walls is now permanently sealed. Any changes after drywall are expensive because you must cut it open, make the change, and then repair the drywall.",
    actionType: "confirm",
    estimatedTime: "2 to 3 weeks",
    order: 6,
  },
  {
    id: "build-8",
    title: "Install finishes (flooring, cabinets, paint)",
    description:
      "Install all interior finishes: flooring, cabinets, countertops, trim, paint, fixtures, and appliances. Upload progress photos as each area is completed.",
    whyItMatters:
      "Finishes are the most visible part of your home and represent a large portion of your budget. Sequencing matters: paint before flooring, cabinets before countertops, trim after paint. Incorrect sequencing creates damage and rework.",
    actionType: "upload",
    requiredDocuments: ["Finish installation progress photos"],
    estimatedTime: "3 to 6 weeks",
    order: 7,
  },
  {
    id: "build-9",
    title: "Complete exterior",
    description:
      "Install siding, exterior trim, gutters, driveway, walkways, and landscaping. Upload exterior completion photos.",
    whyItMatters:
      "The exterior envelope protects your investment from weather and defines your curb appeal. Proper flashing, siding installation, and grading prevent water intrusion, which is the number one cause of building damage and the most expensive to repair.",
    actionType: "upload",
    requiredDocuments: ["Exterior completion photos"],
    estimatedTime: "2 to 4 weeks",
    order: 8,
  },
  {
    id: "build-10",
    title: "Final punch list walkthrough",
    description:
      "Walk every room with your contractor and create a list of items that need correction, completion, or touch-up. Use the Punch List page to track each item.",
    whyItMatters:
      "The punch list walkthrough is your opportunity to document everything that is not right before you make final payment. Items you do not catch now become your problem and your expense to fix. Be thorough, be specific, and document with photos.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "3 to 5 hours",
    order: 9,
  },
];

const BUILD_STEPS_WA: PhaseStep[] = [
  {
    id: "build-1",
    title: "Complete site preparation",
    description:
      "Clear the plot, level the terrain, and mark the building footprint. Install temporary fencing if possible to secure materials. Upload site photos.",
    whyItMatters:
      "Proper site preparation prevents foundation drainage problems. In West Africa, many plots have vegetation, debris, or existing informal structures that must be cleared. Leveling ensures your foundation is on solid, undisturbed ground.",
    actionType: "upload",
    requiredDocuments: ["Site preparation photos"],
    estimatedTime: "1 to 2 weeks",
    order: 0,
  },
  {
    id: "build-2",
    title: "Pour foundation (fondation)",
    description:
      "Excavate foundation trenches, place rebar cages, and pour concrete. In the poteau-poutre system, foundation footings must support the column point loads specified by your engineer. Upload photos and any inspection documentation.",
    whyItMatters:
      "Foundation quality in West Africa is the most common point of structural failure. Inadequate rebar, insufficient concrete depth, or building on uncompacted fill leads to differential settlement that cracks walls and threatens the entire structure.",
    actionType: "upload",
    requiredDocuments: ["Foundation photos", "Foundation inspection report (if available)"],
    estimatedTime: "2 to 4 weeks",
    order: 1,
  },
  {
    id: "build-3",
    title: "Build columns and beams (poteaux et poutres)",
    description:
      "Erect the reinforced concrete columns, pour the ring beams (chainage), and create the structural frame. Upload photos showing rebar placement before and after concrete pour.",
    whyItMatters:
      "The column-beam system is the skeleton of your building. Every column must have the correct rebar configuration and concrete cover as specified by your engineer. Photos of rebar before pouring are your verification that the work was done correctly.",
    actionType: "upload",
    requiredDocuments: ["Column and beam photos (before and after pour)"],
    estimatedTime: "2 to 4 weeks",
    order: 2,
  },
  {
    id: "build-4",
    title: "Build walls (maconnerie)",
    description:
      "Lay concrete blocks (parpaings) between the columns. Ensure horizontal and vertical alignment. The walls are infill between the structural frame. Upload progress photos.",
    whyItMatters:
      "While walls in poteau-poutre construction are not load-bearing, poor masonry leads to cracking, water infiltration, and a building that looks poorly made. Block alignment and mortar quality directly affect the finished appearance and durability.",
    actionType: "upload",
    requiredDocuments: ["Wall construction progress photos"],
    estimatedTime: "2 to 4 weeks",
    order: 3,
  },
  {
    id: "build-5",
    title: "Install roof (toiture)",
    description:
      "Install the roof structure (charpente), either steel or wood trusses, followed by the roofing sheets. Upload photos of the completed roof.",
    whyItMatters:
      "The roof protects everything below it. In tropical climates with heavy seasonal rains, roof quality is critical. Leaks damage walls, ceilings, and finishes. The roof must be completed before interior finishing can begin safely.",
    actionType: "upload",
    requiredDocuments: ["Roof installation photos"],
    estimatedTime: "1 to 3 weeks",
    order: 4,
  },
  {
    id: "build-6",
    title: "Complete rough-in (plumbing and electrical)",
    description:
      "Install all plumbing pipes (often PVC) and electrical conduits inside walls before plastering. Pressure test plumbing lines. Upload photos of the installed systems.",
    whyItMatters:
      "Plumbing and electrical work must be done before walls are plastered. Fixing a plumbing leak or adding an outlet after plastering means destroying finished walls. Pressure testing plumbing now catches leaks that would otherwise be hidden.",
    actionType: "upload",
    requiredDocuments: ["Rough-in photos (plumbing and electrical)"],
    estimatedTime: "1 to 3 weeks",
    order: 5,
  },
  {
    id: "build-7",
    title: "Plaster walls (enduit and crepissage)",
    description:
      "Apply cement plaster to interior and exterior walls. This creates the smooth surface for painting. Confirm completion.",
    whyItMatters:
      "Plastering quality determines the appearance of your finished walls. Uneven plaster is visible after painting and expensive to fix. Good plastering also protects the concrete block from moisture penetration.",
    actionType: "confirm",
    estimatedTime: "1 to 3 weeks",
    order: 6,
  },
  {
    id: "build-8",
    title: "Install finishes (tiling, painting, fixtures)",
    description:
      "Install floor tiles (carrelage), paint walls and ceilings, install doors and windows, and connect plumbing and electrical fixtures. Upload progress photos.",
    whyItMatters:
      "Finishes are what you see and touch every day. They also represent a significant portion of your budget. Tiling must be done on a flat, cured surface. Painting must be done on dry, clean plaster. Rushing finishes creates visible defects that are expensive to correct.",
    actionType: "upload",
    requiredDocuments: ["Finish installation progress photos"],
    estimatedTime: "3 to 6 weeks",
    order: 7,
  },
  {
    id: "build-9",
    title: "Complete exterior (compound wall, gate, landscaping)",
    description:
      "Build the compound wall (cloture), install the gate, and complete any exterior work including drainage channels and landscaping. Upload exterior photos.",
    whyItMatters:
      "In West Africa, the compound wall provides security and privacy. Drainage channels (caniveaux) prevent flooding during rainy season. These are not optional extras; they are essential infrastructure for your property.",
    actionType: "upload",
    requiredDocuments: ["Exterior completion photos"],
    estimatedTime: "2 to 4 weeks",
    order: 8,
  },
  {
    id: "build-10",
    title: "Final walkthrough and punch list",
    description:
      "Walk every room and check for defects: cracks, uneven tiles, leaking faucets, non-working outlets, and poor paint finish. Use the Punch List page to document everything.",
    whyItMatters:
      "This is your last chance to have the mason fix problems at their expense. Once you accept the building and make final payment, fixing defects is your responsibility. Be thorough. Take photos of every issue. Do not accept the building until the punch list is complete.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "3 to 5 hours",
    order: 9,
  },
];

// ---------------------------------------------------------------------------
// Phase 7: VERIFY
// ---------------------------------------------------------------------------

const VERIFY_STEPS_USA: PhaseStep[] = [
  {
    id: "verify-1",
    title: "Schedule final inspection",
    description:
      "Contact the building department to schedule the final inspection. All work must be complete, including landscaping and driveway, before the inspector arrives. Confirm the scheduled date.",
    whyItMatters:
      "The final inspection is the last step before you can legally occupy the building. Failing the final inspection means additional work, another inspection fee, and more time. Being fully prepared prevents costly delays.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 0,
  },
  {
    id: "verify-2",
    title: "Pass final inspection",
    description:
      "The building inspector verifies that all work meets the approved plans and building code. If corrections are needed, address them and schedule a re-inspection. Upload the inspection report.",
    whyItMatters:
      "Passing the final inspection is the legal gateway to occupancy. It certifies that your building is safe to inhabit. Failing creates a cascade: you cannot get a certificate of occupancy, cannot close your permanent mortgage, and cannot move in.",
    actionType: "upload",
    requiredDocuments: ["Final inspection report"],
    estimatedTime: "1 to 3 weeks",
    order: 1,
  },
  {
    id: "verify-3",
    title: "Obtain certificate of occupancy",
    description:
      "After passing the final inspection, apply for and receive your certificate of occupancy (CO). This document certifies that the building is safe and legal for habitation. Upload the CO.",
    whyItMatters:
      "The CO is the single most important document in your project. Without it, you cannot legally live in the building, sell it, or refinance it. Mortgage lenders require it before converting your construction loan to a permanent mortgage.",
    actionType: "upload",
    requiredDocuments: ["Certificate of occupancy"],
    estimatedTime: "1 to 2 weeks",
    order: 2,
  },
  {
    id: "verify-4",
    title: "Complete punch list items",
    description:
      "Ensure every item on your punch list has been corrected by the responsible contractor. Verify each fix in person and mark items as resolved in the Punch List page.",
    whyItMatters:
      "Open punch list items are leverage for final payment. Once you pay the final amount, contractors have little incentive to return. Holding reasonable retainage until the punch list is complete is standard practice and protects your interests.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 to 4 weeks",
    order: 3,
  },
  {
    id: "verify-5",
    title: "Collect final lien waivers",
    description:
      "Obtain signed lien waivers from every contractor and major supplier. A lien waiver confirms they have been paid in full and will not file a lien against your property. Upload signed waivers.",
    whyItMatters:
      "A mechanic's lien allows an unpaid contractor or supplier to claim a legal interest in your property. Even if you paid your general contractor, a subcontractor they failed to pay can lien your house. Lien waivers from all parties protect you.",
    actionType: "upload",
    requiredDocuments: ["Signed lien waivers from all contractors and suppliers"],
    estimatedTime: "1 to 2 weeks",
    order: 4,
  },
  {
    id: "verify-6",
    title: "Process final payments",
    description:
      "Release final payment to all contractors after the punch list is complete and lien waivers are received. Confirm all payments are processed.",
    whyItMatters:
      "Final payment closes out the financial relationship with each contractor. Processing it properly, with lien waivers in hand and punch list complete, ensures you have no outstanding obligations and no one can claim you owe them money.",
    actionType: "confirm",
    estimatedTime: "1 week",
    order: 5,
  },
];

const VERIFY_STEPS_WA: PhaseStep[] = [
  {
    id: "verify-1",
    title: "Schedule final walkthrough with architect",
    description:
      "Have your architect conduct a final inspection of the completed building. They verify that construction matches the approved plans. Confirm the scheduled date.",
    whyItMatters:
      "Your architect designed the building and knows what it should look like. Their professional assessment catches structural and finishing issues that a non-expert would miss. This is your quality assurance checkpoint.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 0,
  },
  {
    id: "verify-2",
    title: "Pass final review",
    description:
      "Address any issues identified by the architect or any municipal inspector. In areas with formal inspection processes, schedule and pass the official inspection. Upload any reports or documentation.",
    whyItMatters:
      "Even in areas without rigorous official inspection, having your architect sign off on the completed building creates a professional record that the construction meets the design specifications. This protects you if quality issues arise later.",
    actionType: "upload",
    requiredDocuments: ["Architect sign-off or inspection report"],
    estimatedTime: "1 to 3 weeks",
    order: 1,
  },
  {
    id: "verify-3",
    title: "Obtain occupancy authorization",
    description:
      "If your local jurisdiction issues certificates of occupancy or conformity certificates, apply for and obtain one. Upload the document.",
    whyItMatters:
      "While not universally required in West Africa, having official documentation that your building was inspected and approved provides legal protection and can increase property value. It also helps if you plan to insure or sell the property.",
    actionType: "upload",
    requiredDocuments: ["Occupancy authorization or conformity certificate"],
    estimatedTime: "1 to 4 weeks",
    order: 2,
  },
  {
    id: "verify-4",
    title: "Complete punch list items",
    description:
      "Verify that every defect identified during the walkthrough has been corrected. Check every room, every fixture, and every surface. Use the Punch List page to track resolution.",
    whyItMatters:
      "In West Africa, once you make final payment and the mason's crew leaves, getting them back to fix defects is extremely difficult. Complete all corrections before releasing the final payment.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 to 3 weeks",
    order: 3,
  },
  {
    id: "verify-5",
    title: "Process final payments",
    description:
      "Release final payment to your mason and all trade workers after the punch list is complete and you have accepted the building. Obtain receipts for all final payments.",
    whyItMatters:
      "Final payment receipts are your proof that all obligations have been met. In the event of any future dispute about payment or workmanship, these receipts document the completed financial transaction.",
    actionType: "confirm",
    estimatedTime: "1 week",
    order: 4,
  },
];

// ---------------------------------------------------------------------------
// Phase 8: OPERATE
// ---------------------------------------------------------------------------

const OPERATE_STEPS_USA: PhaseStep[] = [
  {
    id: "operate-1",
    title: "Complete move-in or listing preparation",
    description:
      "If occupying: complete your move-in checklist including utility account setup, address change, and homeowner insurance activation. If renting or selling: list the property with appropriate marketing.",
    whyItMatters:
      "The transition from construction to occupancy involves critical administrative steps. Missing utility setup means no water or power on moving day. Missing insurance activation means you are unprotected from the moment you own the property.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 0,
  },
  {
    id: "operate-2",
    title: "Document all warranties",
    description:
      "Collect warranty documents for every major system and appliance: HVAC, water heater, roofing, appliances, windows, siding, and any trade-specific warranties. Upload all warranty documents.",
    whyItMatters:
      "Warranties protect you from defects for years after construction. But only if you can find the warranty document and prove the installation date. Organizing them now, while everything is fresh, saves you from costly repairs later.",
    actionType: "upload",
    requiredDocuments: ["Warranty documents for all major systems and appliances"],
    estimatedTime: "2 to 4 hours",
    order: 1,
  },
  {
    id: "operate-3",
    title: "Set maintenance schedule",
    description:
      "Create a maintenance calendar for your new home. Key items: HVAC filter changes (every 3 months), gutter cleaning (twice yearly), water heater flush (annually), roof inspection (annually).",
    whyItMatters:
      "A new home requires less maintenance, but skipping it accelerates wear. A clogged HVAC filter reduces efficiency and shortens equipment life. Clogged gutters cause foundation damage. Regular maintenance protects your investment.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 hour",
    order: 2,
  },
  {
    id: "operate-4",
    title: "File as-built documents",
    description:
      "Request as-built drawings from your contractor showing any changes from the original plans. Upload these along with your final plans, survey, and permits as the permanent record of what was built.",
    whyItMatters:
      "As-built drawings show what was actually constructed, including any changes made during construction. Future renovation, repair, or insurance claims all depend on knowing what is inside your walls. These documents are invaluable.",
    actionType: "upload",
    requiredDocuments: ["As-built drawings", "Final plans", "All permits"],
    estimatedTime: "1 to 2 weeks",
    order: 3,
  },
  {
    id: "operate-5",
    title: "Review project financials",
    description:
      "Generate a final budget report comparing estimated versus actual costs for every category. Note lessons learned. This data helps you (and the Keystone community) build better next time.",
    whyItMatters:
      "Understanding where you went over and under budget is the most valuable data in construction. It improves cost estimates for future projects and helps identify which contractors delivered on their bids versus which ones hit you with change orders.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "2 to 3 hours",
    order: 4,
  },
];

const OPERATE_STEPS_WA: PhaseStep[] = [
  {
    id: "operate-1",
    title: "Complete move-in or listing preparation",
    description:
      "If occupying: set up utility accounts (CEET, TdE or equivalent), activate any security systems, and arrange for furniture. If renting: list the property and screen tenants. If this is a diaspora property: arrange for a property manager.",
    whyItMatters:
      "An empty building in West Africa deteriorates quickly and attracts squatters. Whether you occupy, rent, or leave the property with a manager, it needs to be actively maintained and monitored from day one.",
    actionType: "confirm",
    estimatedTime: "1 to 2 weeks",
    order: 0,
  },
  {
    id: "operate-2",
    title: "Document all warranties and receipts",
    description:
      "Collect receipts for all major purchases (roofing, plumbing fixtures, electrical equipment) and any warranty documents from suppliers. Upload everything.",
    whyItMatters:
      "While formal warranty programs are less common in West Africa, many material suppliers do offer replacement guarantees. Having receipts with dates and supplier information gives you a basis for warranty claims if materials fail prematurely.",
    actionType: "upload",
    requiredDocuments: ["All purchase receipts and warranty documents"],
    estimatedTime: "2 to 4 hours",
    order: 1,
  },
  {
    id: "operate-3",
    title: "Set maintenance schedule",
    description:
      "Create a maintenance plan: septic tank pumping (annually), water tank cleaning (every 6 months), roof inspection after rainy season, electrical system check (annually), exterior repainting (every 3 to 5 years).",
    whyItMatters:
      "Tropical climate is hard on buildings. Heavy rains, intense sun, and humidity cause faster deterioration than temperate climates. Regular maintenance prevents small problems from becoming structural issues that require major repairs.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "1 hour",
    order: 2,
  },
  {
    id: "operate-4",
    title: "File as-built documents",
    description:
      "Store your final architectural plans, structural drawings, and all permits in a safe location. Upload digital copies to your Keystone vault.",
    whyItMatters:
      "These documents are essential for any future renovation, extension, or property sale. In West Africa, where informal construction is common, having complete documentation significantly increases your property's legal standing and market value.",
    actionType: "upload",
    requiredDocuments: ["Final plans", "All permits and approvals"],
    estimatedTime: "1 to 2 hours",
    order: 3,
  },
  {
    id: "operate-5",
    title: "Review project financials",
    description:
      "Generate a final report comparing your budgeted versus actual costs for each phase. Calculate total cost per square meter. This data helps you plan future projects and provides valuable benchmarks.",
    whyItMatters:
      "Understanding your actual cost per square meter is the most useful data point in West African construction. It lets you accurately estimate future projects, verify contractor quotes, and contribute to the community knowledge base.",
    actionType: "in-app",
    inAppRoute: "",
    estimatedTime: "2 to 3 hours",
    order: 4,
  },
];

// ---------------------------------------------------------------------------
// Lookup function
// ---------------------------------------------------------------------------

const PHASE_STEPS: Record<string, Record<number, PhaseStep[]>> = {
  USA: {
    0: DEFINE_STEPS_USA,
    1: FINANCE_STEPS_USA,
    2: LAND_STEPS_USA,
    3: DESIGN_STEPS_USA,
    4: APPROVE_STEPS_USA,
    5: ASSEMBLE_STEPS_USA,
    6: BUILD_STEPS_USA,
    7: VERIFY_STEPS_USA,
    8: OPERATE_STEPS_USA,
  },
  TOGO: {
    0: DEFINE_STEPS_WA,
    1: FINANCE_STEPS_WA,
    2: LAND_STEPS_WA,
    3: DESIGN_STEPS_WA,
    4: APPROVE_STEPS_WA,
    5: ASSEMBLE_STEPS_WA,
    6: BUILD_STEPS_WA,
    7: VERIFY_STEPS_WA,
    8: OPERATE_STEPS_WA,
  },
  GHANA: {
    0: DEFINE_STEPS_WA,
    1: FINANCE_STEPS_WA,
    2: LAND_STEPS_WA,
    3: DESIGN_STEPS_WA,
    4: APPROVE_STEPS_WA,
    5: ASSEMBLE_STEPS_WA,
    6: BUILD_STEPS_WA,
    7: VERIFY_STEPS_WA,
    8: OPERATE_STEPS_WA,
  },
  BENIN: {
    0: DEFINE_STEPS_WA,
    1: FINANCE_STEPS_WA,
    2: LAND_STEPS_WA,
    3: DESIGN_STEPS_WA,
    4: APPROVE_STEPS_WA,
    5: ASSEMBLE_STEPS_WA,
    6: BUILD_STEPS_WA,
    7: VERIFY_STEPS_WA,
    8: OPERATE_STEPS_WA,
  },
};

export function getPhaseSteps(market: Market, phase: number): PhaseStep[] {
  const marketSteps = PHASE_STEPS[market];
  if (!marketSteps) return PHASE_STEPS.USA[phase] ?? [];
  return marketSteps[phase] ?? [];
}
