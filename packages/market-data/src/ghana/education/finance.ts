import type { EducationModule } from "../../types";

export const GHANA_EDUCATION_FINANCE: EducationModule = {
  phase: "FINANCE",
  title: "Finance Your Build",
  summary:
    "Plan your construction financing through personal savings, diaspora transfers, and susu groups. Mortgage options exist but are expensive.",
  content: `Construction financing in Ghana works differently from Western countries. While mortgage products exist (from banks like GCB, Stanbic, Absa, Republic Bank, and the Home Finance Company/HFC), interest rates of 25-35% per annum make them prohibitively expensive for most individuals. The vast majority of Ghanaians build through self-financing.

The most common strategy is phased construction. You build what you can afford, then pause until you have accumulated enough for the next phase. A typical project can span 2-5 years: first the land and registration, then the foundation and structural work, then the roof, and finally the finishes. Each phase needs a fully committed budget before you start it.

For diaspora members, money transfers are the primary funding source. Services like WorldRemit, Sendwave, and Remitly offer competitive rates for sending money to Ghana. MTN Mobile Money (MoMo) and Vodafone Cash are widely accepted for local payments. Set up a dedicated local bank account for the project to track every expenditure.

Susu (rotating savings groups) remain a powerful savings mechanism. A group of people contributes regularly and each member receives the pooled amount in rotation. This is a useful supplement but unpredictable in timing — do not base your construction schedule solely on expected susu payouts.

Some builders combine sources: personal savings for the land, diaspora remittances for the structural work, and susu or micro-loans for the finishes. The key principle is to never start a construction phase without having the full budget for that phase in hand. Starting a slab pour without enough money to finish it is a costly mistake — partially cured concrete degrades quickly.`,
  keyDecisions: [
    "Financing strategy: lump-sum savings, phased construction, or combination",
    "Funding sources: salary, diaspora transfers, susu, savings, or bank loan",
    "Transfer channel for diaspora: WorldRemit, Sendwave, MTN MoMo, bank transfer",
    "Dedicated project bank account: choice of bank and signatories",
    "Budget per phase: precise allocation of available funds to each stage",
  ],
  commonMistakes: [
    "Relying on a bank mortgage that will not be approved or is too expensive",
    "Starting a construction phase without having the full budget for that phase",
    "Sending money without a system for tracking expenditures",
    "Giving the entire budget to the contractor or foreman without milestone-based controls",
    "Ignoring transfer fees that can amount to 3-5% of the total",
    "Basing the construction timeline on susu payouts that have not yet been received",
  ],
  proTips: [
    "Open a dedicated bank account solely for the construction project",
    "Compare transfer services: WorldRemit, Sendwave, and Remitly often beat bank wire fees",
    "Lock in the full budget for each phase before starting it — never during",
    "Keep a contingency reserve of 15-20% per phase for price increases and unforeseen costs",
    "Demand receipts for EVERY material purchase and worker payment",
    "Compare material prices from multiple suppliers in Accra (Abossey Okai, Kaneshie, Circle) before buying",
  ],
  disclaimer:
    "Financial information presented is indicative and based on common practices in Ghana. Bank interest rates, transfer fees, and material costs fluctuate. Consult a financial advisor or accountant for your specific situation.",
};
