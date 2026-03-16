/**
 * Document Intelligence
 *
 * Analyzes what documents a project has versus what it needs at each phase.
 * Compares uploaded documents and vault files against phase requirements
 * and generates actionable recommendations.
 */

import type { Market } from "@keystone/market-data";
import type { DocumentData, VaultFileData } from "@/lib/services/project-service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocumentRequirement {
  name: string;
  phase: number;
  required: boolean;
  description: string;
  whereToGet: string;
  whyNeeded: string;
  templateAvailable: boolean;
  /** Keywords that help match against uploaded document names */
  matchKeywords: string[];
}

export interface DocumentCompletenessResult {
  complete: DocumentRequirement[];
  missing: DocumentRequirement[];
  completenessPercent: number;
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// USA Document Requirements
// ---------------------------------------------------------------------------

const USA_REQUIREMENTS: DocumentRequirement[] = [
  // Phase 0: Define
  {
    name: "Project brief",
    phase: 0,
    required: false,
    description: "A written summary of your project goals, timeline, budget range, and success criteria.",
    whereToGet: "Create it yourself using the Define phase steps in Keystone.",
    whyNeeded: "A project brief forces you to articulate your goals clearly. It becomes the reference point for every future decision and helps you communicate your vision to architects and contractors.",
    templateAvailable: true,
    matchKeywords: ["brief", "project brief", "project summary", "goals"],
  },
  {
    name: "Preliminary budget",
    phase: 0,
    required: false,
    description: "An initial cost estimate based on market benchmarks for your property type and size.",
    whereToGet: "Use the Deal Analyzer in Keystone to generate a preliminary budget.",
    whyNeeded: "A preliminary budget establishes the financial boundaries of your project before you make any commitments. It prevents you from designing a house you cannot afford to build.",
    templateAvailable: false,
    matchKeywords: ["preliminary budget", "budget estimate", "cost estimate", "initial budget"],
  },

  // Phase 1: Finance
  {
    name: "Loan pre-approval letter",
    phase: 1,
    required: true,
    description: "A letter from a lender confirming the loan amount you qualify for, subject to property appraisal and final underwriting.",
    whereToGet: "Apply through a bank or mortgage broker that offers construction loans. Expect 2 to 4 weeks for processing.",
    whyNeeded: "Pre-approval tells you your real budget and shows sellers and contractors you are a serious buyer. Without it, you are guessing about how much you can spend.",
    templateAvailable: false,
    matchKeywords: ["pre-approval", "preapproval", "loan approval", "pre-qualification", "prequalification"],
  },
  {
    name: "Proof of funds",
    phase: 1,
    required: true,
    description: "Bank statements or investment account statements showing your available cash for down payment and reserves.",
    whereToGet: "Download recent statements from your bank or brokerage accounts.",
    whyNeeded: "Lenders require proof that you have the down payment (typically 20 to 25 percent) and sufficient reserves. Sellers may also request proof of funds before accepting an offer on land.",
    templateAvailable: false,
    matchKeywords: ["proof of funds", "bank statement", "account statement", "financial statement"],
  },
  {
    name: "Credit report",
    phase: 1,
    required: false,
    description: "Your credit report from all three bureaus, showing your credit score and history.",
    whereToGet: "Request free copies from annualcreditreport.com or pull your score from your bank or credit card provider.",
    whyNeeded: "Construction loans typically require a credit score of 680 or higher. Reviewing your report early gives you time to dispute errors or improve your score before applying.",
    templateAvailable: false,
    matchKeywords: ["credit report", "credit score", "credit history", "fico"],
  },

  // Phase 2: Land
  {
    name: "Land survey",
    phase: 2,
    required: true,
    description: "A legal document prepared by a licensed surveyor showing exact property boundaries, easements, and topography.",
    whereToGet: "Hire a licensed land surveyor in your area. Typical cost: $300 to $800.",
    whyNeeded: "The survey defines where you can legally build. Without it, you risk encroaching on neighboring property, building over easements, or violating setback requirements.",
    templateAvailable: false,
    matchKeywords: ["survey", "land survey", "plat", "boundary", "topographic"],
  },
  {
    name: "Title report",
    phase: 2,
    required: true,
    description: "A report from a title company confirming clear ownership and identifying any liens, encumbrances, or easements.",
    whereToGet: "Order through a title company or real estate attorney. Often arranged by your real estate agent or lender.",
    whyNeeded: "A title search reveals hidden problems: unpaid taxes, contractor liens, boundary disputes, or deed restrictions. Discovering these before purchase protects your investment.",
    templateAvailable: false,
    matchKeywords: ["title", "title report", "title search", "title insurance"],
  },
  {
    name: "Soil test report",
    phase: 2,
    required: true,
    description: "A geotechnical report documenting soil bearing capacity, composition, and drainage characteristics at your building site.",
    whereToGet: "Hire a geotechnical engineering firm. They drill test borings and analyze the soil. Typical cost: $1,500 to $3,000.",
    whyNeeded: "Soil conditions determine your foundation type and cost. Expansive clay, high water table, or poor bearing capacity can add tens of thousands to your foundation costs.",
    templateAvailable: false,
    matchKeywords: ["soil", "soil test", "geotechnical", "soil report", "perc test", "percolation"],
  },
  {
    name: "Purchase agreement",
    phase: 2,
    required: true,
    description: "The signed contract between you and the land seller, specifying price, contingencies, and closing terms.",
    whereToGet: "Drafted by your real estate agent or attorney during the offer/negotiation process.",
    whyNeeded: "The purchase agreement is a legally binding contract. It protects you with contingencies (soil test, financing, survey) and defines the terms under which you can back out without losing your deposit.",
    templateAvailable: true,
    matchKeywords: ["purchase agreement", "sales contract", "offer", "contract", "land purchase"],
  },
  {
    name: "Recorded deed",
    phase: 2,
    required: true,
    description: "The legal document transferring property ownership to you, filed with the county recorder.",
    whereToGet: "Prepared by the title company or attorney at closing and recorded with the county.",
    whyNeeded: "The recorded deed is your proof of ownership. It is a public record that establishes your legal right to the property.",
    templateAvailable: false,
    matchKeywords: ["deed", "warranty deed", "closing", "closing documents"],
  },

  // Phase 3: Design
  {
    name: "Architectural plans",
    phase: 3,
    required: true,
    description: "Complete construction documents including floor plans, elevations, sections, details, and specifications.",
    whereToGet: "Your architect prepares these after you approve the design concept. Typical timeline: 6 to 12 weeks.",
    whyNeeded: "Construction documents are the legal instructions for building your home. They are required for permits, contractor bidding, lender draws, and inspections. Incomplete plans cause costly misunderstandings during construction.",
    templateAvailable: false,
    matchKeywords: ["architectural", "plans", "floor plan", "construction documents", "blueprints", "drawings"],
  },
  {
    name: "Structural engineering drawings",
    phase: 3,
    required: true,
    description: "Engineer-stamped drawings showing foundation design, framing connections, and structural details.",
    whereToGet: "Hire a licensed structural engineer. They work from the architectural plans. Typical timeline: 2 to 4 weeks.",
    whyNeeded: "The structural engineer certifies that your building will not collapse. Their stamp is a legal guarantee that the structure meets building codes. Most jurisdictions require engineered plans.",
    templateAvailable: false,
    matchKeywords: ["structural", "engineering", "structural engineering", "engineer stamp"],
  },
  {
    name: "Energy compliance report",
    phase: 3,
    required: true,
    description: "Calculations showing compliance with energy code, including Manual J (heating/cooling loads), insulation values, and window performance.",
    whereToGet: "Your architect, HVAC contractor, or an energy consultant can prepare these.",
    whyNeeded: "Energy code compliance is verified during inspection. Failing means replacing windows, adding insulation, or upgrading HVAC equipment after installation. Much cheaper to get right on paper first.",
    templateAvailable: false,
    matchKeywords: ["energy", "energy compliance", "manual j", "energy calculation", "rescheck"],
  },
  {
    name: "Material selections",
    phase: 3,
    required: false,
    description: "Documentation of all material choices: exterior cladding, roofing, windows, doors, flooring, countertops, cabinets, fixtures.",
    whereToGet: "Compiled during the design process with your architect, interior designer, or on your own.",
    whyNeeded: "Material selections drive both budget accuracy and construction timeline. Custom or special-order items can take months to arrive. Documenting selections ensures everyone is building with the right materials.",
    templateAvailable: true,
    matchKeywords: ["material", "selections", "specifications", "finishes", "fixtures"],
  },

  // Phase 4: Approve
  {
    name: "Building permit",
    phase: 4,
    required: true,
    description: "The official permit issued by your local building department authorizing construction.",
    whereToGet: "Submit your construction documents to the local building department. Timeline varies: 2 to 8 weeks typically.",
    whyNeeded: "The building permit is your legal authorization to build. Without it, construction is illegal, your home is uninsurable, and you cannot get a certificate of occupancy.",
    templateAvailable: false,
    matchKeywords: ["permit", "building permit", "construction permit"],
  },
  {
    name: "Utility confirmations",
    phase: 4,
    required: false,
    description: "Written confirmation from water, sewer, electric, and gas utilities that service is available and connection is scheduled.",
    whereToGet: "Contact each utility provider directly. Some require separate permit applications.",
    whyNeeded: "Utility delays are among the most common causes of project delays. Written confirmation ensures that services will be available when you need them during construction.",
    templateAvailable: false,
    matchKeywords: ["utility", "water", "sewer", "electric", "gas", "connection"],
  },
  {
    name: "HOA approval",
    phase: 4,
    required: false,
    description: "Written approval from the homeowners association architectural review committee for your building plans.",
    whereToGet: "Submit plans to your HOA's architectural review committee. Check your CC&Rs for submission requirements.",
    whyNeeded: "HOA violations can result in daily fines, construction stop orders, and forced modifications. Getting approval before construction starts avoids expensive conflicts.",
    templateAvailable: false,
    matchKeywords: ["hoa", "homeowner", "architectural review", "covenant"],
  },

  // Phase 5: Assemble
  {
    name: "Contractor agreements",
    phase: 5,
    required: true,
    description: "Signed contracts with your general contractor or each trade contractor, specifying scope, price, payment schedule, and timeline.",
    whereToGet: "Generate from Keystone templates or have an attorney prepare custom contracts.",
    whyNeeded: "Written contracts are your only protection if a contractor fails to perform. They define the work, the price, and the remedies if something goes wrong. Never begin work without a signed contract.",
    templateAvailable: true,
    matchKeywords: ["contract", "agreement", "contractor", "subcontractor"],
  },
  {
    name: "Insurance certificates",
    phase: 5,
    required: true,
    description: "Certificates of insurance from each contractor showing general liability and workers compensation coverage.",
    whereToGet: "Request from each contractor. They can have their insurance agent send certificates directly to you.",
    whyNeeded: "If an uninsured worker is injured on your property, you may be liable for medical costs, lost wages, and legal fees. Insurance certificates verify that this risk is covered by the contractor's policy.",
    templateAvailable: false,
    matchKeywords: ["insurance", "certificate of insurance", "coi", "liability", "workers comp"],
  },
  {
    name: "Payment schedule",
    phase: 5,
    required: false,
    description: "A documented schedule of when payments are due, tied to specific milestones and work completion.",
    whereToGet: "Negotiate with your contractor. Align payments with lender draw schedules if applicable.",
    whyNeeded: "A payment schedule tied to completed milestones ensures you never pay for work that has not been done. It also helps cash flow planning and aligns with lender draw request timing.",
    templateAvailable: true,
    matchKeywords: ["payment schedule", "draw schedule", "payment plan", "milestone payment"],
  },

  // Phase 6: Build
  {
    name: "Foundation inspection report",
    phase: 6,
    required: true,
    description: "The official inspection report confirming that the foundation was built according to plans and meets code.",
    whereToGet: "Scheduled through your local building department. The inspector visits the site before concrete is poured.",
    whyNeeded: "The foundation inspection verifies rebar placement, formwork dimensions, and soil preparation. Any errors caught after the concrete is poured are extremely expensive to fix.",
    templateAvailable: false,
    matchKeywords: ["foundation inspection", "foundation report"],
  },
  {
    name: "Framing inspection report",
    phase: 6,
    required: true,
    description: "The official inspection report confirming that framing meets structural plans and building code.",
    whereToGet: "Scheduled through your local building department after framing is complete.",
    whyNeeded: "Framing inspection verifies wall alignment, connection hardware, proper nailing patterns, and structural integrity. Framing errors discovered after drywall require demolition to fix.",
    templateAvailable: false,
    matchKeywords: ["framing inspection", "framing report"],
  },
  {
    name: "Rough-in inspection report",
    phase: 6,
    required: true,
    description: "Inspection reports for plumbing, electrical, and HVAC rough-in work installed inside walls before closing up.",
    whereToGet: "Scheduled through your local building department. Separate inspections may be required for each trade.",
    whyNeeded: "Rough-in work is sealed inside walls permanently. This inspection is the only opportunity to verify that all hidden work meets code and was installed correctly.",
    templateAvailable: false,
    matchKeywords: ["rough-in", "roughin", "mechanical inspection", "plumbing inspection", "electrical inspection"],
  },
  {
    name: "Insulation inspection report",
    phase: 6,
    required: true,
    description: "Inspection report confirming insulation meets energy code requirements before drywall installation.",
    whereToGet: "Scheduled through your local building department after insulation is installed.",
    whyNeeded: "Insulation gaps, compression, and missing sections dramatically reduce energy efficiency. This inspection catches deficiencies that would be impossible to detect after drywall.",
    templateAvailable: false,
    matchKeywords: ["insulation inspection", "insulation report", "energy inspection"],
  },
  {
    name: "Daily construction logs",
    phase: 6,
    required: false,
    description: "Daily records of work performed, crew counts, weather conditions, and any issues encountered.",
    whereToGet: "Create daily logs in the Keystone Daily Log page.",
    whyNeeded: "Daily logs create a contemporaneous record of the construction process. They are invaluable for resolving disputes, processing change orders, and documenting delays caused by weather or contractor issues.",
    templateAvailable: false,
    matchKeywords: ["daily log", "construction log", "site log", "field report"],
  },
  {
    name: "Change orders",
    phase: 6,
    required: false,
    description: "Written documentation of any changes to the original scope, including revised cost and timeline impact.",
    whereToGet: "Generate from Keystone templates whenever scope changes during construction.",
    whyNeeded: "Undocumented changes are the most common source of construction disputes and cost overruns. A signed change order ensures both parties agree on the new scope, price, and timeline impact.",
    templateAvailable: true,
    matchKeywords: ["change order", "modification", "scope change"],
  },

  // Phase 7: Verify
  {
    name: "Final inspection report",
    phase: 7,
    required: true,
    description: "The official final inspection report from the building department certifying that the completed building meets all code requirements.",
    whereToGet: "Scheduled through your local building department when all construction work is complete.",
    whyNeeded: "The final inspection is the legal gateway to occupancy. Without passing it, you cannot get a certificate of occupancy, close your permanent mortgage, or legally move in.",
    templateAvailable: false,
    matchKeywords: ["final inspection", "final report", "completion inspection"],
  },
  {
    name: "Certificate of occupancy",
    phase: 7,
    required: true,
    description: "The official document issued by the building department certifying that the building is safe for habitation.",
    whereToGet: "Issued by the building department after passing the final inspection.",
    whyNeeded: "The certificate of occupancy is the single most important document in your project. Without it, the building is not legally habitable, cannot be sold, and cannot be refinanced.",
    templateAvailable: false,
    matchKeywords: ["certificate of occupancy", "co", "occupancy certificate", "occupancy permit"],
  },
  {
    name: "Lien waivers",
    phase: 7,
    required: true,
    description: "Signed documents from all contractors and major suppliers confirming they have been paid and will not file a lien against your property.",
    whereToGet: "Request from each contractor and supplier at the time of final payment.",
    whyNeeded: "A mechanic's lien gives an unpaid contractor or supplier a legal claim against your property. Lien waivers from all parties protect you from claims even if your general contractor failed to pay a subcontractor.",
    templateAvailable: true,
    matchKeywords: ["lien waiver", "lien release", "release of lien", "final waiver"],
  },
  {
    name: "Final budget report",
    phase: 7,
    required: false,
    description: "A comprehensive financial summary comparing estimated versus actual costs across all budget categories.",
    whereToGet: "Generate from the Keystone Budget page.",
    whyNeeded: "The final budget report documents your total project cost, where overruns and savings occurred, and lessons learned. This data is invaluable for future projects and helps verify contractor performance.",
    templateAvailable: false,
    matchKeywords: ["final budget", "budget report", "financial summary", "cost summary"],
  },

  // Phase 8: Operate
  {
    name: "Warranty documents",
    phase: 8,
    required: true,
    description: "Warranty documentation for all major systems: HVAC, water heater, roofing, appliances, windows, and any trade-specific warranties.",
    whereToGet: "Collect from contractors and manufacturers at project completion.",
    whyNeeded: "Warranties cover repairs and replacements for years after construction. Having organized, accessible warranty documents saves thousands when something fails within the warranty period.",
    templateAvailable: false,
    matchKeywords: ["warranty", "guarantee", "product warranty"],
  },
  {
    name: "As-built plans",
    phase: 8,
    required: false,
    description: "Final drawings showing the building as it was actually constructed, including any changes from the original plans.",
    whereToGet: "Request from your general contractor or architect at project completion.",
    whyNeeded: "As-built plans document what is actually inside your walls. Future renovations, repairs, and insurance claims depend on knowing the true layout of plumbing, electrical, and structural elements.",
    templateAvailable: false,
    matchKeywords: ["as-built", "as built", "final plans", "record drawings"],
  },
  {
    name: "Maintenance schedule",
    phase: 8,
    required: false,
    description: "A calendar of recurring maintenance tasks with frequencies and descriptions.",
    whereToGet: "Create using the Keystone Overview page or compile from manufacturer recommendations.",
    whyNeeded: "Regular maintenance prevents premature deterioration. A documented schedule ensures nothing is missed and helps you budget for annual maintenance costs.",
    templateAvailable: true,
    matchKeywords: ["maintenance", "maintenance schedule", "maintenance plan"],
  },
];

// ---------------------------------------------------------------------------
// West Africa Document Requirements
// ---------------------------------------------------------------------------

const WA_REQUIREMENTS: DocumentRequirement[] = [
  // Phase 0: Define
  {
    name: "Project brief",
    phase: 0,
    required: false,
    description: "A written summary of your building goals, timeline, budget in CFA, and construction approach (phased or continuous).",
    whereToGet: "Create it yourself using the Define phase steps in Keystone.",
    whyNeeded: "For diaspora builders especially, a written project brief is your primary communication tool with local teams. It documents your intentions so there is no ambiguity about what you expect.",
    templateAvailable: true,
    matchKeywords: ["brief", "project brief", "project summary", "goals"],
  },
  {
    name: "Preliminary budget",
    phase: 0,
    required: false,
    description: "An initial cost estimate in CFA based on local material and labor costs for your property type.",
    whereToGet: "Use the Deal Analyzer in Keystone with West African market data.",
    whyNeeded: "A preliminary budget in CFA, with the exchange rate noted, prevents the common diaspora mistake of budgeting in dollars and discovering that costs are higher than expected when converted.",
    templateAvailable: false,
    matchKeywords: ["preliminary budget", "budget estimate", "devis preliminaire"],
  },

  // Phase 1: Finance
  {
    name: "Savings plan or transfer schedule",
    phase: 1,
    required: true,
    description: "A documented plan showing how funds will be accumulated and transferred for each construction phase.",
    whereToGet: "Create based on your income, savings rate, and planned construction phases.",
    whyNeeded: "Phased construction requires precise financial planning. Starting a phase without enough funds to finish it leaves exposed concrete and rebar that deteriorate rapidly in tropical weather.",
    templateAvailable: true,
    matchKeywords: ["savings plan", "transfer schedule", "funding plan", "financial plan"],
  },
  {
    name: "Proof of funds",
    phase: 1,
    required: false,
    description: "Bank statements showing available capital for the current construction phase.",
    whereToGet: "Download from your bank accounts (local and abroad).",
    whyNeeded: "Having documented proof of available funds helps you negotiate better material prices (cash payment discounts) and demonstrates to your construction team that you are a serious, funded project.",
    templateAvailable: false,
    matchKeywords: ["proof of funds", "bank statement", "releve bancaire"],
  },

  // Phase 2: Land
  {
    name: "Land survey (plan topographique)",
    phase: 2,
    required: true,
    description: "A survey by a licensed geometre showing plot boundaries, dimensions, and boundary markers (bornes).",
    whereToGet: "Hire a geometre expert agree registered with the national order. Cost varies by plot size.",
    whyNeeded: "Boundary disputes are the most common land-related conflict in West Africa. A survey by a licensed geometre creates a legally defensible record of your plot boundaries.",
    templateAvailable: false,
    matchKeywords: ["survey", "plan topographique", "bornage", "geometre"],
  },
  {
    name: "Titre foncier or land title verification",
    phase: 2,
    required: true,
    description: "A copy of the titre foncier (land title) with verification from the conservation fonciere that it is valid and unencumbered.",
    whereToGet: "Obtained through the land registry (conservation fonciere) in your jurisdiction.",
    whyNeeded: "The titre foncier is the only fully secure form of land ownership in West Africa. Buying land without verifying the title at the registry is the single riskiest thing you can do in the entire construction process.",
    templateAvailable: false,
    matchKeywords: ["titre foncier", "land title", "titre", "certificat", "conservation fonciere"],
  },
  {
    name: "Soil test report (etude de sol)",
    phase: 2,
    required: true,
    description: "A geotechnical report showing soil bearing capacity and recommended foundation type for your specific plot.",
    whereToGet: "Hire a geotechnical engineering firm or laboratory that does soil analysis in your area.",
    whyNeeded: "Coastal cities in West Africa have widely varying soil conditions. Sandy soil near the coast, clay inland, and sometimes fill material from previous use. The wrong foundation on the wrong soil causes structural failure.",
    templateAvailable: false,
    matchKeywords: ["soil", "etude de sol", "soil test", "geotechnique"],
  },
  {
    name: "Purchase agreement (acte de vente)",
    phase: 2,
    required: true,
    description: "The notarized purchase agreement between you and the seller, executed before a notaire.",
    whereToGet: "Prepared by a notaire who handles the transaction.",
    whyNeeded: "An acte de vente signed before a notaire is your primary proof of purchase. Unlike informal agreements, it has legal standing in courts and is required for the titre foncier transfer.",
    templateAvailable: false,
    matchKeywords: ["acte de vente", "purchase agreement", "contrat", "notaire"],
  },

  // Phase 3: Design
  {
    name: "Architectural plans",
    phase: 3,
    required: true,
    description: "Complete architectural drawings showing floor plans, elevations, column positions, and beam layouts for your building.",
    whereToGet: "Prepared by a licensed architect registered with the Ordre des Architectes.",
    whyNeeded: "Detailed plans prevent the endemic problem of buildings that do not match the owner's vision. For diaspora builders, plans are the only way to communicate exactly what should be built.",
    templateAvailable: false,
    matchKeywords: ["architectural", "plans", "floor plan", "plan architecte", "dessins"],
  },
  {
    name: "Structural engineering calculations",
    phase: 3,
    required: true,
    description: "Engineer-certified calculations for foundation sizing, column reinforcement, beam dimensions, and roof structure.",
    whereToGet: "Prepared by a licensed civil engineer (ingenieur genie civil).",
    whyNeeded: "Building collapses in West Africa are primarily caused by inadequate structural engineering. Proper calculations ensure that columns, beams, and foundations can safely carry the building's loads.",
    templateAvailable: false,
    matchKeywords: ["structural", "engineering", "calcul", "genie civil", "beton arme"],
  },
  {
    name: "Material selection list with prices",
    phase: 3,
    required: false,
    description: "A detailed list of selected materials (roofing, tiles, fixtures) with current supplier prices.",
    whereToGet: "Compiled by visiting local building material suppliers and markets.",
    whyNeeded: "Material prices in West Africa change frequently. Having a documented price list at the time of budgeting lets you identify when prices have changed and adjust your budget accordingly.",
    templateAvailable: true,
    matchKeywords: ["material", "selections", "prix", "devis materiaux"],
  },

  // Phase 4: Approve
  {
    name: "Building permit (permis de construire)",
    phase: 4,
    required: true,
    description: "The official building permit issued by the local municipal authority (mairie or prefecture).",
    whereToGet: "Submit architectural plans and application to the local mairie. Timeline varies by city.",
    whyNeeded: "A permis de construire provides legal protection against demolition orders and neighbor complaints. It also increases your property's value by confirming the construction is authorized.",
    templateAvailable: false,
    matchKeywords: ["permis de construire", "building permit", "permit", "autorisation"],
  },
  {
    name: "Utility connection confirmations",
    phase: 4,
    required: false,
    description: "Confirmation from water, electricity, and any other utility providers that service can be connected to your plot.",
    whereToGet: "Contact CEET/ECG/SBEE for electricity and TdE/GWCL for water, depending on your country.",
    whyNeeded: "Utility infrastructure is not universal in West Africa. Confirming availability before construction prevents the expensive surprise of discovering that the nearest power line or water main is far from your plot.",
    templateAvailable: false,
    matchKeywords: ["utility", "eau", "electricite", "ceet", "branchement"],
  },

  // Phase 5: Assemble
  {
    name: "Construction agreements",
    phase: 5,
    required: true,
    description: "Written agreements with your maitre macon and specialist trades specifying scope, price per phase, and payment milestones.",
    whereToGet: "Generate from Keystone templates or have a local attorney prepare custom contracts.",
    whyNeeded: "Written agreements are rare in West African construction, which is precisely why they are so valuable. A signed document gives you legal recourse and sets clear expectations for both parties.",
    templateAvailable: true,
    matchKeywords: ["contract", "agreement", "contrat", "maitre macon", "accord"],
  },
  {
    name: "Detailed devis (cost estimate)",
    phase: 5,
    required: true,
    description: "A phase-by-phase breakdown of labor and material costs from your mason or quantity surveyor.",
    whereToGet: "Request from your maitre macon or hire an independent quantity surveyor (metreur).",
    whyNeeded: "A detailed devis broken down by phase is essential for phased funding. It tells you exactly how much you need to have available before starting each phase.",
    templateAvailable: false,
    matchKeywords: ["devis", "estimate", "cost breakdown", "metreur"],
  },

  // Phase 6: Build
  {
    name: "Foundation photos and report",
    phase: 6,
    required: true,
    description: "Photographs and any available inspection documentation of the completed foundation before backfilling.",
    whereToGet: "Your site supervisor or mason should photograph all foundation work. Request architect sign-off if available.",
    whyNeeded: "Foundation photos are your permanent record that rebar was placed correctly and concrete was poured properly. For diaspora builders, these photos are your primary quality verification tool.",
    templateAvailable: false,
    matchKeywords: ["foundation", "fondation", "foundation photos"],
  },
  {
    name: "Structural milestone photos",
    phase: 6,
    required: true,
    description: "Timestamped photographs of each structural milestone: columns, beams, walls, and roof installation.",
    whereToGet: "Your site supervisor should photograph each milestone. Require photos before and after concrete pours.",
    whyNeeded: "Photo documentation at each milestone creates an evidence chain that work was completed to specification. For remote builders, these photos replace the in-person inspections that on-site owners perform daily.",
    templateAvailable: false,
    matchKeywords: ["milestone photos", "construction photos", "progress photos", "site photos"],
  },
  {
    name: "Daily construction logs",
    phase: 6,
    required: false,
    description: "Daily records of work performed, material deliveries, worker counts, and any issues encountered.",
    whereToGet: "Create daily logs in the Keystone Daily Log page or have your supervisor submit them.",
    whyNeeded: "Daily logs track material consumption (especially cement and rebar, which are commonly diverted). Comparing logs against invoices reveals discrepancies that indicate waste or theft.",
    templateAvailable: false,
    matchKeywords: ["daily log", "journal de chantier", "rapport journalier"],
  },

  // Phase 7: Verify
  {
    name: "Architect sign-off or inspection report",
    phase: 7,
    required: true,
    description: "Written confirmation from your architect that the completed building matches the approved plans.",
    whereToGet: "Schedule a final walkthrough with your architect.",
    whyNeeded: "Your architect's professional assessment catches issues that a non-expert would miss. Their written sign-off documents that the building was constructed according to the design.",
    templateAvailable: false,
    matchKeywords: ["architect sign-off", "final inspection", "inspection", "reception"],
  },
  {
    name: "Occupancy authorization",
    phase: 7,
    required: false,
    description: "Official certificate or authorization confirming the building is safe for occupancy (where applicable).",
    whereToGet: "Apply through the local building authority or prefecture after final inspection.",
    whyNeeded: "Even where not strictly enforced, having an official occupancy document increases your property's legal standing and market value.",
    templateAvailable: false,
    matchKeywords: ["occupancy", "certificate", "autorisation", "conformite"],
  },

  // Phase 8: Operate
  {
    name: "Purchase receipts and warranties",
    phase: 8,
    required: true,
    description: "Receipts for all major material purchases and any warranty documents from suppliers.",
    whereToGet: "Collect from suppliers at the time of purchase. Organize by category.",
    whyNeeded: "Receipts document your total investment and provide a basis for warranty claims. They are also essential for insurance claims if the property is damaged.",
    templateAvailable: false,
    matchKeywords: ["receipt", "warranty", "garantie", "facture"],
  },
  {
    name: "As-built plans",
    phase: 8,
    required: false,
    description: "Final drawings reflecting the building as actually constructed, including any changes from the original design.",
    whereToGet: "Request from your architect or create by marking changes on the original plans.",
    whyNeeded: "As-built plans document what is actually inside your walls. They are essential for future renovations, extensions, or property sales.",
    templateAvailable: false,
    matchKeywords: ["as-built", "plans finaux", "final plans"],
  },
];

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

const REQUIREMENTS_BY_MARKET: Record<string, DocumentRequirement[]> = {
  USA: USA_REQUIREMENTS,
  TOGO: WA_REQUIREMENTS,
  GHANA: WA_REQUIREMENTS,
  BENIN: WA_REQUIREMENTS,
};

export function getRequiredDocuments(market: Market, phase: number): DocumentRequirement[] {
  const reqs = REQUIREMENTS_BY_MARKET[market] ?? USA_REQUIREMENTS;
  return reqs.filter((r) => r.phase === phase);
}

export function getAllRequiredDocumentsUpToPhase(market: Market, phase: number): DocumentRequirement[] {
  const reqs = REQUIREMENTS_BY_MARKET[market] ?? USA_REQUIREMENTS;
  return reqs.filter((r) => r.phase <= phase);
}

// ---------------------------------------------------------------------------
// Document matching
// ---------------------------------------------------------------------------

function normalizeForMatching(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function doesDocumentMatch(
  requirement: DocumentRequirement,
  docName: string
): boolean {
  const normalized = normalizeForMatching(docName);
  return requirement.matchKeywords.some((keyword) => {
    const normalizedKeyword = normalizeForMatching(keyword);
    return normalized.includes(normalizedKeyword);
  });
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export function analyzeDocumentCompleteness(
  phase: number,
  market: Market,
  uploadedDocs: DocumentData[],
  vaultFiles: VaultFileData[]
): DocumentCompletenessResult {
  const requirements = getRequiredDocuments(market, phase);
  if (requirements.length === 0) {
    return {
      complete: [],
      missing: [],
      completenessPercent: 100,
      recommendations: [],
    };
  }

  const allDocNames = [
    ...uploadedDocs.map((d) => d.name),
    ...vaultFiles.map((f) => f.name),
  ];

  const complete: DocumentRequirement[] = [];
  const missing: DocumentRequirement[] = [];

  for (const req of requirements) {
    const matched = allDocNames.some((name) => doesDocumentMatch(req, name));
    if (matched) {
      complete.push(req);
    } else {
      missing.push(req);
    }
  }

  const total = requirements.length;
  const completenessPercent = total > 0 ? Math.round((complete.length / total) * 100) : 100;

  const recommendations: string[] = [];

  const missingRequired = missing.filter((m) => m.required);
  const missingOptional = missing.filter((m) => !m.required);

  if (missingRequired.length > 0) {
    const names = missingRequired.map((m) => m.name).join(", ");
    recommendations.push(
      `You are missing ${missingRequired.length} required document${missingRequired.length > 1 ? "s" : ""} for this phase: ${names}. Upload ${missingRequired.length > 1 ? "these" : "this"} to proceed confidently.`
    );
  }

  if (missingOptional.length > 0) {
    recommendations.push(
      `${missingOptional.length} optional document${missingOptional.length > 1 ? "s are" : " is"} not yet uploaded: ${missingOptional.map((m) => m.name).join(", ")}. These are recommended but not strictly required.`
    );
  }

  if (complete.length === total) {
    recommendations.push(
      "All documents for this phase are accounted for. You are well-prepared to proceed."
    );
  }

  // Phase-specific recommendations
  if (phase === 2 && missing.some((m) => m.matchKeywords.includes("soil"))) {
    recommendations.push(
      "A soil test is critical before purchasing land. Poor soil conditions can add significant cost to your foundation or make the lot unbuildable."
    );
  }

  if (phase === 5 && missing.some((m) => m.matchKeywords.includes("insurance") || m.matchKeywords.includes("contract"))) {
    recommendations.push(
      "Never begin construction without signed contracts and verified insurance. These documents are your primary legal and financial protection."
    );
  }

  if (phase === 7 && missing.some((m) => m.matchKeywords.includes("lien waiver") || m.matchKeywords.includes("lien release"))) {
    recommendations.push(
      "Collect lien waivers before making final payment. An unpaid subcontractor can place a lien on your property even if you paid the general contractor."
    );
  }

  return {
    complete,
    missing,
    completenessPercent,
    recommendations,
  };
}
