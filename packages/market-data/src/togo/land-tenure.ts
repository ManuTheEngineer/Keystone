import type { RegulationReference } from "../types";

/**
 * Togo Land Tenure System
 *
 * This is CRITICAL content for diaspora builders. Land fraud is
 * one of the most common and devastating problems faced by
 * Togolese diaspora members building from abroad. The same plot
 * of land is sometimes sold to multiple buyers, and without
 * proper verification and the titre foncier, you have no legal
 * protection.
 *
 * This file covers the full land acquisition and registration
 * process, the roles of key professionals, and common fraud
 * schemes to watch for.
 */
export const TOGO_LAND_TENURE: RegulationReference[] = [
  {
    name: "Titre foncier (Land Title)",
    description:
      "The titre foncier is the official registered land title issued by the Service des Domaines under the Ministry of Economy and Finance. It is the ONLY legally conclusive proof of land ownership in Togo. An acte de vente (sale deed) alone is NOT sufficient — it is merely evidence of a transaction, not proof of ownership. The titre foncier process involves: (1) filing an application with all supporting documents, (2) publication of the application in the Journal Officiel for an opposition period (typically 2 months), (3) verification by the Service des Domaines including site visit, (4) resolution of any oppositions, (5) inscription in the Livre Foncier (land register), and (6) issuance of the titre foncier certificate. The entire process can take 6 to 24 months depending on the complexity of the case, the completeness of documentation, and administrative backlog.",
    phase: "LAND",
    authority: "Service des Domaines / Conservation Fonciere",
    notes:
      "The titre foncier process has approximately 12 steps: (1) Obtain the plan cadastral from a geometre, (2) Obtain attestation from the chef de quartier confirming the sale, (3) Have the acte de vente notarized, (4) Pay registration taxes at OTR, (5) File titre foncier application at the Conservation Fonciere, (6) Publication in the Journal Officiel, (7) Wait for the opposition period (2 months minimum), (8) Service des Domaines conducts site verification, (9) Technical commission review, (10) Resolution of any oppositions, (11) Ministerial approval, (12) Issuance of titre foncier. Cost is approximately 6-8% of the declared land value in taxes and fees, plus geometre and notaire fees. Start this process immediately after purchasing the land — do not wait until after construction.",
  },
  {
    name: "Acte de vente (Sale Deed)",
    description:
      "The acte de vente is a notarized purchase agreement that records the sale of land between buyer and seller. It must be drafted and authenticated by a notaire (notary public). The acte de vente includes: identification of both parties (with valid ID or passport), description of the land (location, boundaries, area), the purchase price, payment terms, and signatures of both parties and witnesses. While essential, the acte de vente is NOT the same as a titre foncier — it proves that a transaction occurred but does not guarantee that the seller had the legal right to sell, or that the land has not been sold to someone else.",
    phase: "LAND",
    authority: "Notaire (Notary Public)",
    notes:
      "Always insist on signing the acte de vente at a notaire's office, not at the seller's home or on the land itself. The notaire is a legal professional with a duty to verify identities and witness the transaction. Costs include the notaire's fee (typically 2-5% of the transaction value) and registration taxes. The notaire should also verify that the seller's name matches the existing land documents. If the seller cannot produce proper documentation of their ownership, this is a major red flag. Never pay the full purchase price without a properly executed acte de vente — no matter how much the seller pressures you.",
  },
  {
    name: "Plan cadastral (Cadastral Survey Map)",
    description:
      "The plan cadastral is an official surveyed boundary map produced by a licensed geometre (surveyor). It shows the exact dimensions, area (in square meters), boundary coordinates, and geographic position of the plot. The plan cadastral is a required document for the titre foncier application and for the permis de construire. It establishes the legal boundaries of your property and places physical markers (bornes) at each corner.",
    phase: "LAND",
    authority: "Licensed Geometre / Direction du Cadastre",
    notes:
      "Hire a geometre who is officially registered with the Ordre des Geometres du Togo. The geometre visits the site, measures the plot using GPS and total station equipment, places boundary markers (bornes en beton), and produces the plan cadastral document with official stamp. Cost varies by plot size and location but typically ranges from 100,000 to 300,000 CFA. The plan cadastral should be done BEFORE signing the acte de vente, not after — it confirms the exact area you are buying and may reveal boundary disputes with neighbors. If neighbors contest the boundaries during the survey, resolve the dispute before purchasing.",
  },
  {
    name: "Role du geometre (Licensed Surveyor)",
    description:
      "The geometre is a licensed surveyor who plays a critical role in land transactions and construction in Togo. Their responsibilities include: measuring and mapping parcelles, producing the plan cadastral, placing boundary markers (bornes), performing the implantation (setting out building lines on the site), and providing expert testimony in land disputes. Only a registered geometre's work is accepted by the Conservation Fonciere for titre foncier applications.",
    phase: "LAND",
    authority: "Ordre des Geometres du Togo",
    notes:
      "Choose a geometre registered with the Ordre des Geometres du Togo — their stamp carries legal weight. The geometre is also needed at the start of construction to perform the implantation (marking out the building footprint on the site according to the architectural plans). This ensures the building is correctly positioned within the property boundaries and respects setback requirements. For diaspora builders, the geometre is a key professional to engage early — they can verify the plot dimensions before you commit to purchasing. Typical fees: 100,000-300,000 CFA for a plan cadastral, 50,000-150,000 CFA for an implantation.",
  },
  {
    name: "Role du notaire (Notary Public)",
    description:
      "The notaire (notary public) in Togo is a legal professional appointed by the state to authenticate legal documents, particularly land transactions. Unlike in many other countries, the Togolese notaire is not simply a witness — they have a duty to verify the legality of the transaction, ensure both parties understand the terms, and register the document with the appropriate authorities. All land sales should be conducted through a notaire.",
    phase: "LAND",
    authority: "Chambre Nationale des Notaires du Togo",
    notes:
      "The notaire's role in a land transaction includes: drafting the acte de vente, verifying the identities of buyer and seller, checking existing land documentation, collecting and remitting registration taxes, and filing the transaction with the relevant authorities. Notaire fees are typically 2-5% of the declared transaction value, plus registration taxes (approximately 7% of declared value). Some sellers may suggest bypassing the notaire to save money — this is extremely dangerous and should always be refused. The notaire's authentication is your first line of legal defense if disputes arise later.",
  },
  {
    name: "Role du chef de quartier (Neighborhood Chief)",
    description:
      "The chef de quartier is a traditional community leader who plays a key role in customary land transactions, particularly in peri-urban areas and rural zones. The chef de quartier knows the history of land ownership in their area, can attest to who has traditionally occupied and used specific parcelles, and provides an attestation (letter of confirmation) that is part of the titre foncier application. In areas where land was historically held under customary tenure, the chef de quartier's involvement is essential.",
    phase: "LAND",
    authority: "Traditional / Customary Authority",
    notes:
      "In many parts of Togo, land was traditionally owned collectively by families and allocated by chiefs. When this customary land is sold, the chef de quartier provides an attestation confirming the identity of the traditional owners and that the sale has their approval. This document is important but NOT sufficient on its own — it must be followed by a proper acte de vente at a notaire and eventually a titre foncier. Some fraud schemes involve a chef de quartier who colludes with a seller to provide false attestations. Always cross-verify land ownership through multiple independent sources: the chef de quartier, the mairie, the Direction des Affaires Domaniales, and neighboring property owners.",
  },
  {
    name: "Customary vs Registered Land Rights",
    description:
      "Togo operates a dual land tenure system: formal/registered (titre foncier system inherited from the colonial period) and customary (traditional land rights based on family ownership, community allocation, and long-term occupation). Most land in Togo, especially outside of central Lome, is still held under customary tenure. When purchasing customary land, the process is longer and riskier because there may be multiple family members who claim ownership rights, and the land history may not be formally documented.",
    phase: "LAND",
    authority: "Service des Domaines / Traditional Authorities",
    notes:
      "Key differences: Registered land (with titre foncier) has a clear, legally documented owner and is protected against competing claims. Customary land has no formal registration — ownership is based on family tradition, community recognition, and occupation. When buying customary land, you must: (1) identify ALL family members who have ownership claims (not just the person trying to sell), (2) obtain their collective agreement to the sale (ideally in writing), (3) get the chef de quartier's attestation, (4) go through the notaire for the acte de vente, and (5) immediately begin the titre foncier process. Disputes over customary land are the most common cause of land-related litigation in Togo. Budget extra time and money for the additional verification required.",
  },
  {
    name: "Common Land Fraud Schemes and Protection",
    description:
      "Land fraud is a serious and widespread problem in Togo that particularly affects diaspora buyers who cannot be physically present to verify claims. Common schemes include: (1) Double or triple sale — the same plot sold to multiple buyers, (2) Impersonation — someone posing as the landowner using forged identity documents, (3) Boundary manipulation — selling a larger area than the seller actually owns, (4) Family member disputes — one family member sells land without the consent of others who have customary rights, (5) Forged documents — fake actes de vente, fake plans cadastraux, or fake titre fonciers, (6) Chef de quartier collusion — a chief provides false attestations in exchange for a cut of the sale price.",
    phase: "LAND",
    authority: "General Advisory",
    notes:
      "Protection measures: (1) NEVER buy land without physically visiting the site (or sending a trusted, independent representative who is NOT connected to the seller), (2) ALWAYS verify ownership at the Direction des Affaires Domaniales — check if a titre foncier already exists for the parcel, (3) ALWAYS use a notaire — never accept a sous-seing prive (private agreement) for a land transaction, (4) Hire your OWN geometre to verify boundaries — do not rely on the seller's surveyor, (5) Talk to neighboring property owners independently — ask them who owns the land and if there are disputes, (6) Search for any pending litigation involving the parcel at the Tribunal de Lome, (7) If buying from a family, insist on a family meeting with all adult members present and agreeing to the sale, (8) Start the titre foncier process IMMEDIATELY after purchase — the longer you wait, the more vulnerable you are, (9) Build a visible structure (even just the cloture) as soon as possible to establish physical presence on the land.",
  },
];
