/**
 * Claude tool definitions for construction financial calculators.
 * These tools enable the AI to perform calculations within a conversation
 * using Claude's function calling capability.
 */

export const CALCULATOR_TOOLS = [
  {
    name: "calculate_loan_qualification",
    description:
      "Calculate loan qualification for a US construction loan, including debt-to-income (DTI) ratio, maximum loan amount based on income, and estimated monthly payment. This tool applies to US market projects only -- West African projects are typically cash-funded.",
    input_schema: {
      type: "object" as const,
      properties: {
        annualIncome: {
          type: "number" as const,
          description: "Annual gross income in USD before taxes and deductions",
        },
        monthlyDebts: {
          type: "number" as const,
          description:
            "Total monthly debt payments including car loans, student loans, credit card minimums, and other recurring obligations (in USD)",
        },
        downPaymentPct: {
          type: "number" as const,
          description:
            "Down payment as a percentage of total project cost (e.g., 20 for 20%). Construction loans typically require 20-25%.",
        },
        interestRate: {
          type: "number" as const,
          description:
            "Annual interest rate as a percentage (e.g., 7.5 for 7.5%). This is the construction loan rate, which is typically higher than a permanent mortgage rate.",
        },
        loanTermYears: {
          type: "number" as const,
          description:
            "Loan term in years for the permanent mortgage after construction (e.g., 30). The construction phase is typically 12-18 months interest-only before converting.",
        },
      },
      required: [
        "annualIncome",
        "monthlyDebts",
        "downPaymentPct",
        "interestRate",
        "loanTermYears",
      ],
    },
  },
  {
    name: "estimate_budget",
    description:
      "Estimate a construction budget based on property size, type, market, and quality level. Returns a breakdown by major category (foundation, structure, roofing, mechanical, finishes, etc.) with estimated ranges. Costs are based on regional benchmarks and should be verified with local contractors.",
    input_schema: {
      type: "object" as const,
      properties: {
        squareFootage: {
          type: "number" as const,
          description:
            "Total living area in square feet (for USA) or square meters (for West Africa). Specify which unit using the unit parameter.",
        },
        unit: {
          type: "string" as const,
          enum: ["sqft", "sqm"],
          description:
            "Unit of measurement: 'sqft' for square feet (USA), 'sqm' for square meters (West Africa)",
        },
        market: {
          type: "string" as const,
          enum: ["USA", "TOGO", "GHANA", "BENIN"],
          description: "Target construction market",
        },
        propertyType: {
          type: "string" as const,
          enum: [
            "SFH",
            "DUPLEX",
            "TRIPLEX",
            "FOURPLEX",
            "APARTMENT",
            "CUSTOM",
          ],
          description:
            "Property type: SFH (single-family home), DUPLEX, TRIPLEX, FOURPLEX, APARTMENT, or CUSTOM",
        },
        qualityLevel: {
          type: "string" as const,
          enum: ["economy", "standard", "premium", "luxury"],
          description:
            "Construction quality level: economy (basic finishes, minimal features), standard (mid-range finishes, common features), premium (upgraded finishes, added features), luxury (high-end finishes, custom features)",
        },
        stories: {
          type: "number" as const,
          description: "Number of stories (1, 2, or 3). Multi-story adds structural complexity and cost.",
        },
        currency: {
          type: "string" as const,
          description:
            "Currency code for the estimate (USD, XOF, GHS). Defaults to USD for USA, XOF for Togo/Benin, GHS for Ghana.",
        },
      },
      required: [
        "squareFootage",
        "unit",
        "market",
        "propertyType",
        "qualityLevel",
        "stories",
      ],
    },
  },
  {
    name: "calculate_rental_yield",
    description:
      "Calculate expected rental yield and return on investment for a construction project intended for rental income. Computes gross yield, net yield (after expenses), cash-on-cash return, and estimated payback period. Useful for investors and diaspora builders planning income properties.",
    input_schema: {
      type: "object" as const,
      properties: {
        totalProjectCost: {
          type: "number" as const,
          description:
            "Total project cost including land, construction, permits, and all fees",
        },
        monthlyRent: {
          type: "number" as const,
          description:
            "Expected monthly rental income. For multi-unit properties, this should be the total monthly rent across all units.",
        },
        annualExpenses: {
          type: "number" as const,
          description:
            "Estimated annual expenses including property tax, insurance, maintenance, management fees, and vacancy allowance",
        },
        currency: {
          type: "string" as const,
          description: "Currency code (USD, XOF, GHS)",
        },
        vacancyRatePct: {
          type: "number" as const,
          description:
            "Expected vacancy rate as a percentage (e.g., 5 for 5%). Typical: 5-8% for USA, 3-5% for West Africa urban areas.",
        },
        financingCostAnnual: {
          type: "number" as const,
          description:
            "Annual financing cost (mortgage payments, loan interest) if the property is financed. Enter 0 for cash-purchased properties.",
        },
      },
      required: [
        "totalProjectCost",
        "monthlyRent",
        "annualExpenses",
        "currency",
        "vacancyRatePct",
      ],
    },
  },
  {
    name: "convert_currency",
    description:
      "Convert between currencies commonly used in Keystone markets: USD (US Dollar), XOF (CFA Franc, used in Togo and Benin), GHS (Ghana Cedi), and EUR (Euro). Uses approximate exchange rates -- actual rates vary. Useful for diaspora builders comparing costs across markets or estimating remittance amounts.",
    input_schema: {
      type: "object" as const,
      properties: {
        amount: {
          type: "number" as const,
          description: "The amount to convert",
        },
        fromCurrency: {
          type: "string" as const,
          enum: ["USD", "XOF", "GHS", "EUR"],
          description: "Source currency code",
        },
        toCurrency: {
          type: "string" as const,
          enum: ["USD", "XOF", "GHS", "EUR"],
          description: "Target currency code",
        },
      },
      required: ["amount", "fromCurrency", "toCurrency"],
    },
  },
];
