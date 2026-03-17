import type { RegulationReference } from "../types";

/**
 * Benin Land Tenure System
 *
 * This is CRITICAL content for diaspora builders. Benin's 2013 Code
 * Foncier et Domanial significantly reformed the land tenure system,
 * creating the ANDF (Agence Nationale du Domaine et du Foncier) and
 * introducing the Certificat de Propriete Fonciere (CPF) as the
 * definitive title document. Despite these reforms, land fraud
 * remains a serious risk, particularly for diaspora buyers.
 *
 * Key institutions:
 * - ANDF: Central land registration agency with bureau communaux
 * - PFR (Plan Foncier Rural): Rural land mapping and registration
 * - Notaires: Authenticate land transactions
 * - Geometres agrees: Licensed surveyors
 */
export const BENIN_LAND_TENURE: RegulationReference[] = [
  {
    name: "Certificat de Propriete Fonciere (CPF)",
    description:
      "The Certificat de Propriete Fonciere is the official registered land title introduced by Benin's 2013 Code Foncier et Domanial. It replaces the older titre foncier system. The CPF is the ONLY legally conclusive proof of land ownership in Benin. The registration process goes through ANDF (Agence Nationale du Domaine et du Foncier) and involves: (1) filing an application with supporting documents at the bureau communal de l'ANDF, (2) publication for an opposition period (2 months minimum), (3) commission de reconnaissance des droits fonciers verifies claims on site, (4) resolution of any oppositions, (5) inscription in the Registre Foncier Communal, (6) issuance of the CPF. The process takes 6 to 18 months.",
    phase: "LAND",
    authority: "ANDF (Agence Nationale du Domaine et du Foncier)",
    notes:
      "The CPF process has these key steps: (1) Obtain a plan topographique from a geometre agree, (2) Obtain attestation from the chef de quartier or chef de village, (3) Have the convention de vente notarized, (4) Pay registration taxes at the DGI, (5) File CPF application at the ANDF bureau communal, (6) Publication in the commune for the opposition period (2 months), (7) Commission de reconnaissance visits the site, (8) Resolution of any oppositions, (9) Inscription in the Registre Foncier Communal, (10) CPF issued. Cost is approximately 6-10% of the declared land value in taxes and fees, plus geometre and notaire fees. Start this process immediately after purchasing — do not wait until after construction.",
  },
  {
    name: "Convention de vente (Sale Agreement)",
    description:
      "The convention de vente is a notarized purchase agreement that records the sale of land between buyer and seller. It must be drafted and authenticated by a notaire. The convention de vente includes: identification of both parties (with CIP — Carte d'Identite Personnelle — or passport), description of the land (location, boundaries, area), the purchase price, payment terms, and signatures. While essential, the convention de vente is NOT the same as a CPF — it proves a transaction occurred but does not guarantee that the seller had full legal right to sell.",
    phase: "LAND",
    authority: "Notaire (Notary Public)",
    notes:
      "Always sign the convention de vente at a notaire's office. The notaire verifies identities and witnesses the transaction. Costs include the notaire's fee (typically 2-5% of the transaction value) and registration taxes. The notaire should verify that the seller's name matches existing land documents. Under the 2013 Code, all land transactions are supposed to be registered with ANDF. If the seller cannot produce proper documentation, this is a major red flag. Never pay without a properly executed convention de vente.",
  },
  {
    name: "Attestation de Detention Coutumiere (ADC)",
    description:
      "The Attestation de Detention Coutumiere is a document introduced by the 2013 Code Foncier that formally recognizes customary land rights. It is issued by the mairie after verification by the Section Villageoise de Gestion Fonciere (SVGF) or the Commission communale. The ADC is an intermediate step — it recognizes your customary right but must eventually be converted to a CPF for full legal protection. The ADC is valid for 10 years and must be converted to a CPF within that period.",
    phase: "LAND",
    authority: "Mairie / Section Villageoise de Gestion Fonciere (SVGF)",
    notes:
      "The ADC was a major innovation of the 2013 Code Foncier, designed to bridge the gap between customary land rights and formal registration. In rural areas where the Plan Foncier Rural (PFR) has been completed, the ADC is based on the PFR data. The ADC provides more security than a simple verbal agreement or traditional attestation, but less than a CPF. For construction projects, having at minimum an ADC (and preferably a CPF) is strongly recommended before investing in building. The ADC process is faster and cheaper than a full CPF.",
  },
  {
    name: "Plan Foncier Rural (PFR)",
    description:
      "The Plan Foncier Rural is a systematic land mapping and registration program for rural areas of Benin. Introduced before the 2013 Code and reinforced by it, the PFR maps all rural parcelles in a commune, identifies occupants and rights holders, and creates a communal land register. The PFR provides the baseline data for issuing ADCs and eventually CPFs in rural areas. It has been implemented in many communes across Benin with international donor support.",
    phase: "LAND",
    authority: "ANDF / Commune",
    notes:
      "The PFR process involves systematic surveying of all parcelles in a village or commune, public consultation to identify rights holders, and creation of a georeferenced map and register. If your target land is in a rural commune where the PFR has been completed, the registration process is significantly faster because the baseline data already exists. Check with the ANDF bureau communal or the mairie to see if the PFR has been completed in your target area. In communes without PFR data, the process requires more individual verification.",
  },
  {
    name: "Plan topographique (Topographic Survey Map)",
    description:
      "The plan topographique is an official surveyed boundary map produced by a geometre agree (licensed surveyor). It shows the exact dimensions, area (in square meters), boundary coordinates, and geographic position of the plot. The plan topographique is required for the CPF application and for the permis de construire. It establishes legal boundaries and places physical markers (bornes) at each corner.",
    phase: "LAND",
    authority: "Geometre agree / Ordre des Geometres-Experts du Benin",
    notes:
      "Hire a geometre agree registered with the Ordre des Geometres-Experts du Benin. The geometre visits the site, measures the plot using GPS and total station equipment, places boundary markers (bornes en beton), and produces the plan topographique with official stamp. Cost varies by plot size and location but typically ranges from 100,000 to 350,000 CFA. The plan topographique should ideally be done BEFORE signing the convention de vente — it confirms the exact area and may reveal boundary disputes with neighbors.",
  },
  {
    name: "Role du notaire (Notary Public)",
    description:
      "The notaire in Benin is a state-appointed legal professional who authenticates legal documents, particularly land transactions. The notaire drafts the convention de vente, verifies identities, ensures both parties understand the terms, and registers the document with ANDF. All land sales should be conducted through a notaire — this is legally required under the 2013 Code Foncier.",
    phase: "LAND",
    authority: "Chambre Nationale des Notaires du Benin",
    notes:
      "The notaire's role includes: drafting the convention de vente, verifying identities of buyer and seller, checking existing land documentation at ANDF, collecting and remitting registration taxes, and filing the transaction. Notaire fees are typically 2-5% of the declared value plus registration taxes (approximately 6-8% of declared value). Under the 2013 Code, all land transactions must be notarized and registered with ANDF. Bypassing the notaire is not only dangerous but illegal for land transfers.",
  },
  {
    name: "Role du chef de quartier / chef de village",
    description:
      "The chef de quartier (urban) or chef de village (rural) is a traditional community leader who plays a key role in customary land transactions. They know the history of land ownership in their area and provide an attestation confirming the seller's rights. In areas governed by customary tenure, the chef's involvement is essential for the ADC and CPF processes.",
    phase: "LAND",
    authority: "Traditional / Customary Authority",
    notes:
      "Under the 2013 Code, the Section Villageoise de Gestion Fonciere (SVGF) — which includes the chef de village — plays a formal role in land registration by verifying customary rights claims. The chef's attestation is important but NOT sufficient on its own. It must be followed by notarized convention de vente and ANDF registration. Cross-verify ownership through multiple sources: the chef, the mairie, the ANDF bureau communal, and neighboring landowners. Some fraud involves complicit chefs providing false attestations.",
  },
  {
    name: "Common Land Fraud Schemes and Protection",
    description:
      "Land fraud remains a significant problem in Benin despite the 2013 reforms. Common schemes include: (1) Double sale — the same plot sold to multiple buyers, (2) Impersonation — someone posing as the landowner, (3) Boundary manipulation — selling a larger area than owned, (4) Family disputes — one family member selling without consent of all heirs, (5) Forged documents — fake conventions de vente or fake CPFs, (6) Selling land under litigation, (7) Selling government or community land as private land.",
    phase: "LAND",
    authority: "General Advisory",
    notes:
      "Protection measures: (1) NEVER buy land without physically visiting or sending a trusted independent representative, (2) ALWAYS verify at the ANDF bureau communal — check if a CPF already exists for the parcel, (3) ALWAYS use a notaire — the 2013 Code requires notarized transactions, (4) Hire your OWN geometre agree to verify boundaries, (5) Talk to neighboring landowners independently, (6) Search for pending litigation at the Tribunal de premiere instance, (7) If buying from a family, insist on a family meeting with all adult heirs present and consenting, (8) Start the CPF process IMMEDIATELY after purchase, (9) Build the cloture (perimeter wall) as soon as possible to establish physical presence. The 2013 Code provides stronger legal protections than before, but only if you follow the formal registration process.",
  },
];
