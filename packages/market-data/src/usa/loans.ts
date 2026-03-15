import type { FinancingOption } from "../types";

export const USA_FINANCING: FinancingOption[] = [
  {
    id: "usa-fin-construction-to-perm",
    name: "Construction-to-Permanent Loan",
    description:
      "A single-close loan that covers both the construction phase and converts automatically into a permanent mortgage when the home is complete. The most popular option for owner-builders who want a streamlined process with one set of closing costs.",
    type: "CONSTRUCTION_LOAN",
    requirements: [
      "Credit score of 680 or higher (700+ for best rates)",
      "Down payment of 20-25% of total project cost",
      "Debt-to-income ratio (DTI) below 43%",
      "Approved building plans and specifications",
      "Licensed and insured general contractor (owner-builder exceptions are rare)",
      "Detailed construction budget reviewed by the lender",
      "Buildable lot owned or under contract",
      "Builder's risk insurance policy",
    ],
    typicalTerms:
      "12-18 month construction period with interest-only draws, then converts to a 15 or 30-year fixed or adjustable-rate mortgage. Rates are typically 0.5-1% above standard mortgage rates during construction.",
    pros: [
      "Single closing saves on fees (one set of closing costs)",
      "Rate lock available for the permanent phase at closing",
      "Streamlined process with one lender throughout",
      "Interest-only payments during construction reduce cash flow pressure",
      "Automatic conversion to permanent mortgage with no requalification",
    ],
    cons: [
      "Higher credit score requirements than standard mortgages",
      "Larger down payment required (20-25%)",
      "Limited lender options compared to standard mortgages",
      "Must select permanent loan terms upfront before construction begins",
      "Cost overruns can create issues with the approved loan amount",
    ],
  },
  {
    id: "usa-fin-standalone-construction",
    name: "Stand-Alone Construction Loan",
    description:
      "A short-term loan that covers only the construction phase. When the home is complete, you must obtain a separate permanent mortgage to pay off the construction loan. Offers more flexibility in choosing your permanent financing.",
    type: "CONSTRUCTION_LOAN",
    requirements: [
      "Credit score of 680 or higher",
      "Down payment of 20-30% of total project cost",
      "Debt-to-income ratio (DTI) below 43%",
      "Approved building plans, permits, and licensed contractor",
      "Detailed construction budget and timeline",
      "Proof of ability to qualify for permanent financing after construction",
    ],
    typicalTerms:
      "6-18 month term, interest-only payments on drawn amounts. Variable rate based on prime or SOFR plus a margin. Full balance due at maturity, requiring permanent financing or payoff.",
    pros: [
      "Flexibility to shop for the best permanent mortgage after construction",
      "Can take advantage of potentially lower rates at project completion",
      "More lenders offer this product than construction-to-perm",
      "Can choose different permanent loan terms based on financial situation at completion",
    ],
    cons: [
      "Two separate closings mean two sets of closing costs",
      "Risk of not qualifying for permanent financing if financial situation changes",
      "Interest rate risk: permanent rates may be higher when construction ends",
      "Must manage the transition from construction to permanent loan",
      "Higher total transaction costs compared to single-close options",
    ],
  },
  {
    id: "usa-fin-fha-203k",
    name: "FHA 203(k) Renovation Loan",
    description:
      "A government-backed loan that allows you to finance both the purchase of a home and the cost of major renovations in a single mortgage. Best for buyers purchasing a fixer-upper rather than building new from the ground up.",
    type: "RENOVATION_LOAN",
    requirements: [
      "Credit score of 580 or higher (620+ recommended for better rates)",
      "Down payment as low as 3.5% of total acquisition plus renovation cost",
      "Property must be 1-4 unit residential and at least one year old",
      "Renovations must be completed within 6 months",
      "Must use an FHA-approved 203(k) consultant",
      "HUD-approved contractor required for Standard 203(k)",
      "Mortgage insurance premium (MIP) required for life of loan if under 10% down",
    ],
    typicalTerms:
      "15 or 30-year fixed rate. Loan amount includes purchase price plus renovation costs, up to FHA loan limits for the county. Standard 203(k) for renovations over $35,000; Limited 203(k) for renovations under $35,000.",
    pros: [
      "Low down payment (3.5%) makes it accessible for first-time buyers",
      "Lower credit score requirements than conventional construction loans",
      "Single loan covers purchase and renovation",
      "Can finance structural repairs and major systems replacement",
      "Government-backed rates are competitive",
    ],
    cons: [
      "Not available for new ground-up construction",
      "Mandatory mortgage insurance adds to monthly payment",
      "FHA loan limits may be insufficient in high-cost areas",
      "Extensive paperwork and bureaucratic process",
      "Required 203(k) consultant adds cost and time",
      "Six-month renovation timeline can be tight for major projects",
    ],
  },
  {
    id: "usa-fin-va-construction",
    name: "VA Construction Loan",
    description:
      "A construction loan backed by the Department of Veterans Affairs, available to eligible veterans, active-duty service members, and qualifying surviving spouses. Offers the unique advantage of zero down payment for new construction.",
    type: "CONSTRUCTION_LOAN",
    requirements: [
      "Valid Certificate of Eligibility (COE) from the VA",
      "Active duty, veteran, or eligible surviving spouse status",
      "Credit score of 620 or higher (lender-specific, not VA-mandated)",
      "Sufficient residual income per VA guidelines",
      "VA-registered builder required",
      "Property must be the borrower's primary residence",
      "Approved building plans and VA-compliant specifications",
    ],
    typicalTerms:
      "Construction phase of 12-18 months converts to a 15 or 30-year VA permanent mortgage. Zero down payment. No private mortgage insurance (PMI). VA funding fee of 1.25-3.3% can be financed into the loan.",
    pros: [
      "Zero down payment, the only no-money-down construction option",
      "No private mortgage insurance (PMI) required",
      "Competitive interest rates backed by federal guarantee",
      "No prepayment penalty",
      "VA limits on closing costs protect the borrower",
    ],
    cons: [
      "Very few lenders offer VA construction loans",
      "Must use a VA-registered builder (limits contractor choices)",
      "Primary residence only, cannot use for investment property",
      "VA funding fee adds to loan cost (waived for disabled veterans)",
      "Longer processing times due to VA requirements",
      "Inspection and appraisal requirements are more stringent",
    ],
  },
  {
    id: "usa-fin-usda-construction",
    name: "USDA Construction Loan",
    description:
      "A government-backed loan through the USDA Rural Development program for building a home in an eligible rural area. Offers zero down payment for qualifying borrowers who meet income limits.",
    type: "CONSTRUCTION_LOAN",
    requirements: [
      "Property must be in a USDA-eligible rural area",
      "Household income must not exceed 115% of area median income",
      "Credit score of 640 or higher",
      "Property must be the borrower's primary residence",
      "Must use a USDA-approved contractor",
      "Home must meet USDA size and value guidelines (modest, not luxury)",
      "Debt-to-income ratio below 41% (some flexibility with compensating factors)",
    ],
    typicalTerms:
      "Single-close construction-to-permanent loan. 30-year fixed rate. Zero down payment. Annual guarantee fee of 0.35% and upfront guarantee fee of 1% (can be financed).",
    pros: [
      "Zero down payment for eligible rural properties",
      "Below-market interest rates",
      "Low annual guarantee fee compared to FHA mortgage insurance",
      "Single-close process reduces total costs",
      "Closing costs can be financed or paid by the seller",
    ],
    cons: [
      "Strict geographic eligibility limits (rural areas only)",
      "Household income limits exclude many borrowers",
      "Very few lenders offer the construction-to-perm version",
      "Home size and features are limited (no luxury finishes)",
      "Longer approval timelines due to USDA processing",
      "Cannot be used for investment properties or second homes",
    ],
  },
  {
    id: "usa-fin-hard-money",
    name: "Hard Money/Bridge Loan",
    description:
      "A short-term, asset-based loan from private lenders. Approval is based primarily on the property or project value rather than the borrower's creditworthiness. Commonly used by investors, flippers, and borrowers who cannot qualify for traditional financing.",
    type: "HARD_MONEY",
    requirements: [
      "Significant equity or down payment (25-40% of project value)",
      "Clear project plan with realistic budget and timeline",
      "Property or completed project must have strong resale value",
      "Exit strategy (permanent financing, sale, or refinance plan)",
      "Personal guarantee typically required",
      "Some lenders require prior construction or investment experience",
    ],
    typicalTerms:
      "6-24 month term. Interest rates of 8-15% depending on risk. 1-3 origination points at closing. Interest-only payments with balloon payment at maturity. Loan-to-value (LTV) typically maxes out at 65-75% of after-repair value (ARV).",
    pros: [
      "Fast approval and funding (days, not weeks)",
      "Credit score is less important than project viability",
      "Flexible terms negotiable with private lenders",
      "Can finance unconventional projects banks will not touch",
      "Useful as bridge financing when timing is critical",
    ],
    cons: [
      "Very high interest rates (8-15%+)",
      "Significant origination fees (1-3 points)",
      "Short repayment timeline creates pressure",
      "Large down payment or equity required",
      "Risk of losing the property if unable to refinance or sell in time",
      "Less regulatory protection than bank loans",
    ],
  },
  {
    id: "usa-fin-cash-self-fund",
    name: "Cash Self-Fund",
    description:
      "Building your home entirely with personal savings, investments, or other cash resources without any construction loan. Eliminates interest costs and lender requirements but requires substantial liquid capital available throughout the project.",
    type: "CASH",
    requirements: [
      "Total project funds available in liquid or near-liquid accounts",
      "Cash reserves beyond the construction budget for contingencies (15-20% recommended)",
      "Ability to manage cash flow and pay contractors on schedule",
      "Personal financial planning to avoid depleting retirement or emergency funds",
      "May still need proof of funds for permit applications in some jurisdictions",
    ],
    typicalTerms:
      "No loan terms. Pay contractors and suppliers directly. Can phase spending over time. No interest costs. Recommend keeping a 15-20% contingency reserve beyond the base budget.",
    pros: [
      "Zero interest costs (can save tens of thousands over the project)",
      "No lender approval, appraisals, or draw inspections required",
      "Complete control over timeline and spending decisions",
      "No monthly payments during or after construction",
      "Simplifies the build process by removing lender requirements",
      "Can serve as your own general contractor more easily",
    ],
    cons: [
      "Requires very large amount of liquid capital upfront",
      "Opportunity cost of tying up cash that could be invested elsewhere",
      "No leverage benefit (using other people's money)",
      "Risk of depleting savings if costs overrun significantly",
      "No lender oversight means you must self-manage quality and budget",
      "May miss tax deduction benefits of mortgage interest (consult a CPA)",
    ],
  },
];
