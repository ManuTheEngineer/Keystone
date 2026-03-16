"use client";

import { useEffect, useState, useMemo } from "react";
import { useTopbar } from "../layout";
import { LEARN_MODULES } from "@/lib/data/mock-projects";
import { Badge } from "@/components/ui/Badge";
import { Search, X, BookOpen, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";

const PHASE_MAP: Record<string, string> = {
  "Finance": "FINANCE",
  "Design": "DESIGN",
  "Team": "ASSEMBLE",
  "Land": "LAND",
  "Build": "BUILD",
  "Quality": "VERIFY",
  "Budget": "FINANCE",
};

const LESSON_CONTENT: Record<string, {
  paragraphs: string[];
  keyDecisions?: string[];
  commonMistakes?: string[];
  proTips?: string[];
}> = {
  "Construction loan types explained": {
    paragraphs: [
      "Construction loans are specialized short-term financing products designed to fund the building of a new home. The most common type is the construction-to-permanent loan (also called a single-close loan), which converts automatically into a traditional mortgage once building is complete. This saves you from paying two sets of closing costs and simplifies the process considerably. During the construction phase, you typically make interest-only payments on the amount disbursed so far, rather than the full loan amount.",
      "A stand-alone construction loan is a separate short-term loan that covers only the building period, usually 12 to 18 months. Once construction is complete, you must refinance into a permanent mortgage through a second closing. While this means two sets of closing costs and two approval processes, it can offer more flexibility if you want to shop for the best permanent mortgage rate after building.",
      "Government-backed options include FHA construction loans (FHA 203k for renovation or FHA One-Time Close for new builds) and VA construction loans for eligible veterans. FHA loans allow down payments as low as 3.5% but require mortgage insurance. VA construction loans offer zero down payment but require VA-approved builders. Hard money loans are another option from private lenders, offering fast approval with less documentation but at significantly higher interest rates (often 10-15%) and shorter terms.",
    ],
    keyDecisions: [
      "Choose between single-close (construction-to-permanent) or two-close (stand-alone) loan structure",
      "Determine whether you qualify for government-backed programs (FHA, VA) that offer lower down payments",
      "Calculate your debt-to-income ratio (DTI) before applying to understand your borrowing capacity",
    ],
    commonMistakes: [
      "Not locking in an interest rate early, leading to higher costs if rates rise during construction",
      "Underestimating the total project cost, which can exhaust loan funds before completion",
      "Choosing a hard money loan without a clear exit strategy for refinancing",
    ],
    proTips: [
      "Get pre-approved before selecting a builder so you know your exact budget",
      "Ask lenders about their draw inspection process and timeline to avoid construction delays",
      "Compare at least three lenders because construction loan terms vary significantly",
    ],
  },
  "How to read a floor plan": {
    paragraphs: [
      "A floor plan is a scaled, two-dimensional drawing showing a building as if viewed from directly above with the roof removed. The most important element to understand first is scale. Most residential floor plans use a scale of 1/4 inch equals 1 foot, meaning every quarter inch on the paper represents one real foot. Always check the scale indicator on the drawing before measuring anything.",
      "Walls appear as parallel lines on a floor plan. Thick double lines represent exterior walls (which are wider because they contain insulation and sheathing), while thinner double lines indicate interior partition walls. Doors are shown as a line with an arc indicating the direction the door swings open. Windows are shown as thin parallel lines within a wall.",
      "When reviewing a floor plan, pay attention to traffic flow and how you move from room to room. Look for hallways that waste space, doors that collide when opened simultaneously, and whether the kitchen has a practical work triangle between the sink, stove, and refrigerator. Understanding floor plans before construction begins saves significant money, because changes on paper cost nothing compared to changes during building.",
    ],
    keyDecisions: [
      "Verify room dimensions meet your furniture and lifestyle needs before approving plans",
      "Decide on door swing directions for every room to avoid conflicts",
      "Confirm window placement for natural light, ventilation, and privacy",
    ],
    commonMistakes: [
      "Approving plans without checking that hallways are wide enough for furniture delivery",
      "Ignoring the relationship between indoor and outdoor spaces",
      "Not considering electrical outlet placement during the plan review phase",
    ],
    proTips: [
      "Tape out the room dimensions on your current floor to visualize the actual size",
      "Request 3D renderings if available to better understand spatial relationships",
      "Check that bathroom doors do not open directly into public living areas",
    ],
  },
  "The 12 trades: who does what and when": {
    paragraphs: [
      "Residential construction involves a sequence of specialized trades, each responsible for a specific building system. The work flows in a logical order because each trade builds upon the previous one. Excavation comes first, followed by concrete work (foundation footings, walls, and slab). In West African construction, the concrete crew also builds the structural columns (poteaux) and beams (poutres). The framing crew then builds the structural skeleton.",
      "Once the structure is enclosed, the roofing crew installs the roof system. With the building now weather-tight, the mechanical trades begin rough-in work: plumbers run supply and drain lines, electricians pull wire and install boxes, and HVAC technicians install ductwork. These three mechanical trades must coordinate carefully because they share the same wall and ceiling cavities.",
      "After rough-in passes inspection, insulation goes in, followed by drywall, painting, flooring, and finally trim carpentry. The plumber and electrician return for their finish phase, installing fixtures like faucets, toilets, light fixtures, and outlet covers. Understanding this sequence matters because scheduling trades out of order creates costly delays.",
    ],
    keyDecisions: [
      "Determine the order of trade scheduling to prevent conflicts and downtime",
      "Choose between hiring a general contractor or self-managing individual trades",
      "Decide on material specifications before each trade begins work",
    ],
    commonMistakes: [
      "Installing drywall before rough-in inspection passes, potentially requiring teardown",
      "Laying flooring before painting is complete, risking damage from paint drips",
      "Not having materials on-site when the trade crew arrives, wasting labor costs",
    ],
    proTips: [
      "Create a detailed trade schedule with buffer days between each phase",
      "Walk the site with each trade foreman before they start to review expectations",
      "Take photos of all rough-in work before it gets covered by drywall",
    ],
  },
  "Understanding DTI and loan qualification": {
    paragraphs: [
      "Debt-to-income ratio (DTI) is the single most important number lenders use to determine whether you can afford a mortgage or construction loan. It is calculated by dividing your total monthly debt obligations by your gross (pre-tax) monthly income, then expressing the result as a percentage. Lenders use two versions: front-end DTI (housing costs only) and back-end DTI (all debts). Back-end DTI is the more critical number.",
      "Most conventional loan programs set a maximum back-end DTI of 43%, though some lenders allow up to 45% with strong credit scores (740+) and significant cash reserves. FHA loans are more lenient, accepting DTIs up to 50% with compensating factors. VA loans have no official DTI cap but most VA lenders use 41% as a guideline.",
      "The debts included in your DTI calculation are all minimum monthly payments reported on your credit report: auto loans, student loans, personal loans, credit card minimums, child support, alimony, and any existing mortgage. Monthly expenses like utilities, groceries, and insurance premiums are not included. The projected housing payment includes principal, interest, property taxes, homeowner insurance, and any HOA dues (collectively called PITIA).",
    ],
    keyDecisions: [
      "Calculate your current DTI before approaching any lender",
      "Decide which debts to pay down first for maximum DTI improvement",
      "Choose whether adding a co-borrower would improve your qualification profile",
    ],
    commonMistakes: [
      "Opening new credit accounts or making large purchases before loan application",
      "Forgetting to include projected property tax and insurance in DTI calculations",
      "Assuming all lenders use the same DTI thresholds",
    ],
    proTips: [
      "Paying off a $200/month car loan reduces DTI far more than paying down a credit card with a $25 minimum",
      "Request your free credit report and dispute any errors before applying",
      "A difference of just 2-3 percentage points can mean approval versus denial",
    ],
  },
  "West African land tenure systems": {
    paragraphs: [
      "Land ownership in West Africa operates under a dual system that combines customary (traditional) land rights with formal legal title. Under customary tenure, land is typically held communally by families, clans, or chieftaincies. The family head or chief acts as a custodian rather than an owner in the Western sense, and land is allocated through informal agreements that do not automatically confer legal ownership recognized by the state.",
      "Formal land title, known in Francophone West Africa as the titre foncier, is the only form of land ownership that provides full legal protection and is recognized by courts and financial institutions. Without a titre foncier, you cannot use land as collateral for a bank loan, and your claim is vulnerable to disputes from family members who may assert competing customary rights.",
      "The risk of purchasing land through informal channels is substantial. Double-selling (where the same parcel is sold to multiple buyers by different family members) is common. Diaspora buyers are particularly vulnerable because they cannot easily visit the site, verify boundaries in person, or monitor whether someone else is building on their land.",
    ],
    keyDecisions: [
      "Decide whether to purchase through customary channels or insist on formal title from the start",
      "Choose between buying titled land (more expensive but safer) or untitled land with plans to formalize",
      "Determine whether to engage a local attorney before or after initial negotiations",
    ],
    commonMistakes: [
      "Trusting a single family member's authority to sell without verifying with the broader family",
      "Skipping the formal survey process to save money",
      "Not beginning the titre foncier process immediately after purchase",
    ],
    proTips: [
      "Always engage a licensed surveyor (geometre) to establish boundaries before payment",
      "Obtain witness statements from neighboring landowners confirming the boundaries",
      "For diaspora buyers, use a specific and limited-scope power of attorney for a trusted local representative",
    ],
  },
  "Concrete block vs. wood frame construction": {
    paragraphs: [
      "The two dominant residential construction methods are wood-frame construction (standard in the US) and reinforced concrete block construction (standard in West Africa). Wood framing uses dimensional lumber assembled into wall panels, floor joists, and roof trusses. This method is fast, relatively inexpensive in lumber-rich regions, and allows easy routing of electrical wires and plumbing through wall cavities.",
      "West African construction predominantly uses the poteau-poutre (post-and-beam) method: reinforced concrete columns and beams form the structural skeleton, and the spaces between are filled with concrete masonry units (parpaings). Walls are then plastered with cement render on both sides. This method is preferred in tropical climates because concrete block resists termites, humidity, and heavy rain far better than wood.",
      "Cost comparisons depend entirely on the local market. In the US, wood framing is typically 20-30% less expensive than concrete construction. In West Africa, concrete block is the more economical choice because cement and sand are locally available, while structural-quality wood is expensive and often imported.",
    ],
    keyDecisions: [
      "Select the construction method based on your market, climate, and available skilled labor",
      "Determine wall thickness and insulation strategy for your climate zone",
      "Choose between local and imported materials based on cost and quality trade-offs",
    ],
    commonMistakes: [
      "Using US cost assumptions when budgeting for West African construction or vice versa",
      "Neglecting termite protection in wood-frame construction in humid climates",
      "Skipping rebar reinforcement in concrete block walls to cut costs",
    ],
    proTips: [
      "Concrete block provides excellent thermal mass, reducing cooling costs in hot climates",
      "Wood-frame homes can be framed in 1-2 weeks versus several weeks for concrete block",
      "In hurricane-prone regions, properly reinforced concrete significantly outperforms wood frame",
    ],
  },
  "What building inspectors actually check": {
    paragraphs: [
      "Building inspections are mandatory checkpoints where an inspector verifies that work meets the applicable building code. In the US, inspections are legally required and failing one means work must stop until corrections are made. In West African markets, formal inspection systems exist in cities but enforcement varies widely. Understanding what inspectors check helps ensure quality construction even when oversight is limited.",
      "The first major inspection is the foundation inspection, which occurs after footings are dug and reinforcement is placed but before concrete is poured. After the foundation and framing, the rough-in inspection (sometimes three separate inspections) is the most detailed, covering plumbing, electrical, and HVAC systems.",
      "The final inspection is a comprehensive walk-through covering smoke detectors, GFCI outlets in wet areas, stair dimensions, handrail heights, exit door operation, and overall workmanship. Only after passing the final inspection is a certificate of occupancy issued, legally allowing you to move into the home.",
    ],
    keyDecisions: [
      "Schedule inspections in advance to avoid delays in the construction timeline",
      "Decide whether to hire a private inspector in addition to the code inspector",
      "Determine which inspections are required versus recommended in your jurisdiction",
    ],
    commonMistakes: [
      "Covering up work (like pouring concrete over rebar) before the inspector arrives",
      "Not being present at inspections to ask questions and learn about your home",
      "Assuming that passing inspection means perfect work rather than minimum code compliance",
    ],
    proTips: [
      "Take photos of all work before inspection so you have documentation regardless of outcome",
      "Ask the inspector to explain any corrections needed so you can verify the contractor fixes them properly",
      "In markets with limited formal inspection, hire an independent engineer for critical structural checkpoints",
    ],
  },
  "Payment schedules that protect you": {
    paragraphs: [
      "Construction payments work fundamentally differently from buying an existing home. Instead of one lump sum, funds are disbursed in stages called draws that correspond to completed milestones. A typical draw schedule might include: 10% at mobilization, 15% at foundation, 20% at framing, 15% at rough-in, 15% at drywall/insulation, 15% at interior finishes, and 10% at final completion. Each draw should be tied to verified, inspectable work.",
      "Retainage is a critical protection mechanism. This means withholding a percentage of each payment (typically 5-10%) until the entire project is satisfactorily completed. The accumulated retainage is only paid after final inspection, punch list completion, and a lien waiver is signed. Retainage motivates contractors to return and finish punch list items rather than moving on to their next job.",
      "For self-funded projects (common in West Africa where phased cash construction is the norm), you must act as your own inspector. Before releasing any payment, physically verify or have a trusted representative verify with timestamped photos that the claimed work is genuinely complete and matches the agreed specifications.",
    ],
    keyDecisions: [
      "Set the draw schedule percentages and tie each one to a specific, verifiable milestone",
      "Determine the retainage percentage (5-10% is standard)",
      "Decide how payment verification will work, especially for remote/diaspora builds",
    ],
    commonMistakes: [
      "Front-loading payments: a contractor asking for 50% upfront is a major warning sign",
      "Releasing retainage before the punch list is fully completed",
      "Not requiring lien waivers with every draw payment",
    ],
    proTips: [
      "Always use a written contract that specifies the exact draw schedule and milestone definitions",
      "In West African markets, create a written payment schedule signed by both parties with witnesses",
      "Document everything with photos at each payment milestone to create an evidence trail",
    ],
  },
  "Designing for tropical climates": {
    paragraphs: [
      "Building in tropical climates requires design strategies that address intense heat, high humidity, heavy rainfall, and potential storm exposure. The most fundamental principle is passive ventilation: orienting the building to capture prevailing breezes, incorporating cross-ventilation, and using high ceilings (3 meters or more) to allow hot air to rise away from occupants. In West African construction, louvered windows and ventilation blocks (claustra) are traditional solutions.",
      "Roof design is critical in tropical climates. Wide overhangs (at least 60-90 cm) protect walls from direct sun and driving rain. Light-colored or reflective roofing materials reflect solar radiation rather than absorbing it. Thermal mass from concrete block walls absorbs heat slowly during the day and releases it at night, reducing or eliminating the need for air conditioning.",
      "Material selection must account for humidity, insects, and corrosion. Use pressure-treated or naturally rot-resistant lumber for any wood elements. All metal components should be galvanized or stainless steel to resist salt air and humidity. For storm resistance, reinforce concrete block walls with vertical rebar, strap the roof structure to the walls with hurricane ties, and install impact-rated windows or shutters.",
    ],
    keyDecisions: [
      "Orient the building to maximize natural ventilation from prevailing winds",
      "Choose roofing material and color for maximum solar reflection",
      "Decide on mechanical cooling (air conditioning) versus passive cooling strategies",
    ],
    commonMistakes: [
      "Copying temperate-climate designs without adapting for tropical heat and humidity",
      "Using insufficient roof overhangs, leading to water damage on exterior walls",
      "Selecting materials that corrode quickly in humid, salt-air environments",
    ],
    proTips: [
      "Louvered windows allow ventilation even during rain, a major advantage in tropical climates",
      "A steep roof pitch (6:12 or greater) helps shed heavy rain and provides better wind resistance",
      "Plant shade trees on the west side of the building to block the intense afternoon sun",
    ],
  },
  "The titre foncier process: 6 steps": {
    paragraphs: [
      "The titre foncier (formal land title certificate) is the definitive proof of land ownership in Togo and other Francophone West African countries. It is the only document that provides full legal protection against competing claims, enables you to use the land as bank collateral, and is recognized in court without question. The process typically takes between 6 and 18 months.",
      "The six steps are: (1) Engage a licensed surveyor (geometre agree) to conduct a formal boundary survey. (2) Assemble your application file with the survey plan, proof of purchase, and identification documents. (3) Submit the application to the Direction de l'Urbanisme et de l'Habitat. (4) A public notice is posted for 30 to 90 days during which competing claims may be filed. (5) A government commission visits the site to verify boundaries. (6) The land registry (Conservation Fonciere) issues the titre foncier certificate.",
      "Total government fees for the process are typically 5-10% of the declared land value, plus surveyor fees and legal representation costs. For diaspora buyers managing this process remotely, a power of attorney (procuration) given to a trusted local representative is essential, but ensure it is specific and limited in scope.",
    ],
    keyDecisions: [
      "Begin the titre foncier process before or immediately after the land purchase",
      "Choose a licensed surveyor and attorney with experience in your specific prefecture",
      "Decide whether to manage the process personally or through a power of attorney",
    ],
    commonMistakes: [
      "Delaying the formalization process, leaving the land vulnerable to competing claims",
      "Not publishing the public notice, which is required for legal validity",
      "Paying fees without obtaining official receipts at every step",
    ],
    proTips: [
      "Retain a local attorney experienced in land transactions to manage the entire file",
      "Keep certified copies of every document submitted to government offices",
      "The upfront cost of doing this properly is a fraction of the potential loss from a land dispute",
    ],
  },
};

function estimateReadingTime(content: { paragraphs: string[]; keyDecisions?: string[]; commonMistakes?: string[]; proTips?: string[] }): number {
  let wordCount = 0;
  for (const p of content.paragraphs) {
    wordCount += p.split(/\s+/).length;
  }
  if (content.keyDecisions) {
    for (const d of content.keyDecisions) wordCount += d.split(/\s+/).length;
  }
  if (content.commonMistakes) {
    for (const m of content.commonMistakes) wordCount += m.split(/\s+/).length;
  }
  if (content.proTips) {
    for (const t of content.proTips) wordCount += t.split(/\s+/).length;
  }
  return Math.max(1, Math.ceil(wordCount / 200));
}

const STORAGE_KEY = "keystone-learn-read";

function getReadModules(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // ignore
  }
  return new Set();
}

function saveReadModules(set: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

export default function LearnPage() {
  const { setTopbar } = useTopbar();
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [readModules, setReadModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    setTopbar("Learn", "Knowledge base", "success");
  }, [setTopbar]);

  useEffect(() => {
    setReadModules(getReadModules());
  }, []);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return LEARN_MODULES.map((mod, i) => ({ mod, i }));
    const q = searchQuery.toLowerCase();
    return LEARN_MODULES
      .map((mod, i) => ({ mod, i }))
      .filter(({ mod }) =>
        mod.title.toLowerCase().includes(q) ||
        mod.category.toLowerCase().includes(q)
      );
  }, [searchQuery]);

  function handleToggle(index: number) {
    if (openModule === index) {
      setOpenModule(null);
    } else {
      setOpenModule(index);
      const next = new Set(readModules);
      next.add(index);
      setReadModules(next);
      saveReadModules(next);
    }
  }

  function handleStartFromBeginning() {
    setOpenModule(0);
    setSearchQuery("");
    const next = new Set(readModules);
    next.add(0);
    setReadModules(next);
    saveReadModules(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const readCount = readModules.size;
  const totalCount = LEARN_MODULES.length;
  const progressPct = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="mb-8">
        <h1
          className="text-[24px] text-earth"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Construction Knowledge Base
        </h1>
        <p className="text-[14px] text-muted mt-1 mb-5">
          Master every phase of building, from financing to final key.
        </p>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setOpenModule(null); }}
            placeholder="Search modules by topic or keyword..."
            className="input-base pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted opacity-50 hover:opacity-80 transition-opacity"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="mb-6 p-4 rounded-xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] text-foreground font-medium">
            You have read {readCount} of {totalCount} modules
          </p>
          <span className="text-[12px] font-data text-muted">{progressPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-full rounded-full progress-gradient transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {readCount === 0 && (
          <button
            onClick={handleStartFromBeginning}
            className="mt-3 text-[12px] text-clay font-medium hover:text-clay-light transition-colors"
          >
            Start from the beginning
          </button>
        )}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-stagger">
        {filteredModules.map(({ mod, i }) => {
          const isOpen = openModule === i;
          const content = LESSON_CONTENT[mod.title];
          const readTime = content ? estimateReadingTime(content) : 0;
          const phase = PHASE_MAP[mod.category] || "DEFINE";
          const isRead = readModules.has(i);
          const preview = content
            ? content.paragraphs[0].slice(0, 120) + "..."
            : "";

          return (
            <div
              key={i}
              className={`bg-surface rounded-xl border border-border transition-all duration-300 ${
                isOpen ? "md:col-span-2" : "card-hover"
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => handleToggle(i)}
                className="flex items-start gap-4 p-5 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-full bg-warm flex items-center justify-center shrink-0"
                >
                  <span
                    className="text-clay font-semibold text-[16px]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-[16px] font-semibold text-earth leading-tight">
                      {mod.title}
                    </h3>
                    {isRead && (
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                  {!isOpen && (
                    <p className="text-[13px] text-muted leading-relaxed line-clamp-2 mt-1">
                      {preview}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={mod.variant}>{mod.category}</Badge>
                    <span className="text-[11px] text-muted uppercase tracking-wide">
                      Phase: {phase}
                    </span>
                    {readTime > 0 && (
                      <span className="text-[11px] text-muted">
                        {readTime} min read
                      </span>
                    )}
                  </div>
                  {!isOpen && (
                    <button
                      className="mt-2 text-[12px] text-clay font-medium hover:text-clay-light transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleToggle(i); }}
                    >
                      Read more
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isOpen && content && (
                <div className="animate-expand px-5 pb-5">
                  <div className="border-t border-border pt-5">
                    {/* Main content paragraphs */}
                    {content.paragraphs.map((paragraph, j) => (
                      <p
                        key={j}
                        className="text-[13px] text-foreground mb-4"
                        style={{ lineHeight: 1.75 }}
                      >
                        {paragraph}
                      </p>
                    ))}

                    {/* Key Decisions */}
                    {content.keyDecisions && content.keyDecisions.length > 0 && (
                      <div className="mt-6 p-4 rounded-lg bg-surface-alt border border-border">
                        <h4 className="text-[14px] font-semibold text-earth mb-3 flex items-center gap-2">
                          <BookOpen size={15} className="text-clay" />
                          Key Decisions
                        </h4>
                        <ol className="space-y-2">
                          {content.keyDecisions.map((item, k) => (
                            <li key={k} className="flex gap-2 text-[13px] text-foreground" style={{ lineHeight: 1.6 }}>
                              <span className="text-clay font-data font-semibold shrink-0">{k + 1}.</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {content.commonMistakes && content.commonMistakes.length > 0 && (
                      <div className="mt-4 p-4 rounded-lg border border-border" style={{ backgroundColor: "var(--color-warning-bg)" }}>
                        <h4 className="text-[14px] font-semibold text-earth mb-3 flex items-center gap-2">
                          <AlertTriangle size={15} className="text-warning" />
                          Common Mistakes
                        </h4>
                        <ul className="space-y-2">
                          {content.commonMistakes.map((item, k) => (
                            <li key={k} className="flex gap-2 text-[13px] text-foreground" style={{ lineHeight: 1.6 }}>
                              <span className="text-warning shrink-0">--</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pro Tips */}
                    {content.proTips && content.proTips.length > 0 && (
                      <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                        <h4 className="text-[14px] font-semibold text-earth mb-3 flex items-center gap-2">
                          <Lightbulb size={15} className="text-emerald-600" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-2">
                          {content.proTips.map((item, k) => (
                            <li key={k} className="flex gap-2 text-[13px] text-foreground" style={{ lineHeight: 1.6 }}>
                              <span className="text-emerald-600 shrink-0">--</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-[11px] text-muted italic mt-5">
                      This is educational guidance. Consult a licensed professional for your specific situation.
                    </p>

                    {/* Close button */}
                    <button
                      onClick={() => setOpenModule(null)}
                      className="mt-4 btn-secondary text-[12px] py-2 px-4"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[14px] text-muted">No modules match your search.</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-[13px] text-clay hover:text-clay-light transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-warm border border-sand/30 text-[11px] text-muted leading-relaxed text-center">
        All educational content is for general informational purposes only. Always consult licensed
        professionals for advice specific to your project, location, and circumstances.
      </div>
    </div>
  );
}
