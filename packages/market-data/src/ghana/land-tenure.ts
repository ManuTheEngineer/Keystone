import type { RegulationReference } from "../types";

/**
 * Ghana Land Tenure System
 *
 * This is CRITICAL content for diaspora builders. Land disputes
 * are among the most common legal cases in Ghana. The country
 * has a complex system of customary and statutory land tenure
 * that includes stool lands (held by chiefs), family lands,
 * government-acquired lands, and vested lands.
 *
 * About 80% of land in Ghana is held under customary tenure
 * (stool or family ownership). Understanding this system is
 * essential to avoid losing your investment.
 */
export const GHANA_LAND_TENURE: RegulationReference[] = [
  {
    name: "Land Title Registration",
    description:
      "Ghana's land registration system is managed by the Lands Commission. The Land Title Registration Act, 1986 (PNDC Law 152) established a system for registering land titles in designated areas (Greater Accra and parts of Kumasi). In non-designated areas, the Land Registry Act, 1962 (Act 122) provides for registration of deeds (instruments). Title registration provides the strongest legal protection — it certifies ownership and is backed by a state guarantee. Deed registration merely records that a document exists but does not guarantee the validity of the underlying transaction.",
    phase: "LAND",
    authority: "Lands Commission / Land Title Registry",
    notes:
      "The registration process involves: (1) Conduct a land title search at the Lands Commission, (2) Obtain a site plan from a licensed surveyor, (3) Have a lawyer prepare the indenture (conveyance deed or lease), (4) Pay stamp duty at the Internal Revenue Service (0.5% of property value), (5) Submit the stamped indenture and supporting documents to the Lands Commission, (6) The Commission publishes a caution in the newspapers for 21 days, (7) Site inspection by Lands Commission surveyor, (8) If no objections, the land certificate is issued. The entire process can take 3-12 months. Cost includes stamp duty, Lands Commission fees, surveyor fees, and lawyer fees — budget approximately 5-8% of the land value in total.",
  },
  {
    name: "Stool Lands",
    description:
      "Stool lands are held by a chief (or queen mother in some cases) in trust for the community. About 80% of all land in Ghana is stool land. The chief (who occupies the 'stool') has the authority to allocate land to community members and outsiders, but this authority is exercised on behalf of the community. Stool land cannot be sold outright — it can only be leased. Leases are typically for 99 years for Ghanaian citizens and 50 years for non-citizens. The allocation requires the consent of principal elders, and the lease must be registered at the Lands Commission.",
    phase: "LAND",
    authority: "Traditional Authority (Chief and Elders) / Office of the Administrator of Stool Lands (OASL)",
    notes:
      "When acquiring stool land: (1) Approach the chief or his designated land agent, (2) Negotiate the 'drink money' (purchase price for the lease interest) and annual ground rent, (3) Obtain an allocation note signed by the chief and principal elders, (4) Have a lawyer prepare the lease document, (5) The chief and elders must sign the lease, (6) Register the lease at the Lands Commission. CRITICAL: Verify that the person claiming to be the chief is the legitimate, gazetted chief — impostor chiefs who allocate land they have no authority over are a major fraud vector. Check with the National House of Chiefs or the Regional House of Chiefs. In Ashanti Region, the Asantehene's Land Secretariat maintains records for all Kumasi-area stool lands.",
  },
  {
    name: "Family Lands",
    description:
      "Family lands are held collectively by extended families under customary law. The family head (abusuapanyin in Akan areas) manages the land on behalf of all family members. Disposal of family land requires the consent of the principal family members — a single individual cannot validly sell family land alone. Family land disputes are among the most common land cases in Ghanaian courts.",
    phase: "LAND",
    authority: "Family Head / Family Council",
    notes:
      "When acquiring family land: (1) Identify the legitimate family head and principal family members, (2) Attend a family meeting where the sale is discussed and agreed upon by principal members, (3) Obtain a written resolution signed by the family head and principal members authorizing the sale, (4) Have a lawyer prepare the indenture, (5) All necessary family signatories must execute the document, (6) Register at the Lands Commission. CRITICAL: One family member selling without the others' consent is the most common cause of family land disputes. Demand proof that the seller has authority — a family resolution, headman's confirmation, or court order. If the family is disputing internally, do NOT proceed until the dispute is resolved.",
  },
  {
    name: "Government-Acquired Lands",
    description:
      "Government-acquired lands were compulsorily acquired by the state under various instruments (State Lands Act, 1962, Act 125 and Administration of Lands Act, 1962, Act 123). These lands are managed by the Lands Commission. Some government-acquired lands have been released back to original owners or are available for allocation. Others remain under government control for public purposes.",
    phase: "LAND",
    authority: "Lands Commission / Government",
    notes:
      "Exercise extreme caution with government-acquired lands. Some parcels have been released back to the original customary owners, creating confusion about who has authority to grant interests. Others are being occupied informally without legal basis. Always conduct a thorough search at the Lands Commission to determine the current status of any government-acquired land. If the land is still vested in the government, only the Lands Commission can grant a valid lease. If it has been released, verify the release documents and the authority of the person now managing the land.",
  },
  {
    name: "Indenture (Conveyance / Lease)",
    description:
      "An indenture is the legal instrument that conveys an interest in land from one party to another. For freehold land (family land that is being sold outright), a deed of conveyance is used. For stool land or government land (which can only be leased), a lease document is used. The indenture must be prepared by a lawyer, signed by all parties, witnessed, and registered at the Lands Commission to have legal effect against third parties.",
    phase: "LAND",
    authority: "Lawyer / Lands Commission",
    notes:
      "The indenture should include: full names and addresses of grantor and grantee, description of the land (referencing the site plan), the interest being conveyed (freehold or leasehold with term), the consideration (purchase price or 'drink money'), covenants by both parties, and execution clauses with signatures and witnesses. Always insist on a lawyer preparing the indenture — do NOT accept a handwritten or typed document prepared by a land agent or the seller. After execution, the indenture must be stamped at the Ghana Revenue Authority (stamp duty is 0.5% of the declared value) and registered at the Lands Commission.",
  },
  {
    name: "Role of the Licensed Surveyor",
    description:
      "A licensed surveyor (member of the Ghana Institution of Surveyors, GhIS) plays a critical role in land transactions and construction. Their responsibilities include: surveying and mapping plots, producing the official site plan, placing boundary pillars, performing the building setting-out on site, and providing expert testimony in boundary disputes. Only a licensed surveyor's site plan is accepted by the Lands Commission and MMDAs.",
    phase: "LAND",
    authority: "Survey and Mapping Division of the Lands Commission / Ghana Institution of Surveyors",
    notes:
      "Choose a surveyor registered with the Survey and Mapping Division of the Lands Commission — their stamp carries legal weight. The surveyor is also needed at the start of construction to set out the building footprint on the site. For diaspora builders, the surveyor is a key professional to engage early — they can verify plot dimensions and boundaries before you commit to purchasing. Typical fees: GHS 2,000-8,000 for a site plan depending on plot size and location; GHS 1,000-3,000 for building setting-out.",
  },
  {
    name: "Role of the Lawyer in Land Transactions",
    description:
      "A lawyer experienced in land and property law is essential for every land transaction in Ghana. The lawyer's role includes: conducting a search at the Lands Commission to verify ownership, drafting the indenture, advising on the nature of the interest being acquired, ensuring proper execution of documents, and handling registration. Using a lawyer is not a luxury — it is a necessity given the complexity of Ghana's land tenure system.",
    phase: "LAND",
    authority: "Ghana Bar Association",
    notes:
      "Choose a lawyer who specializes in property and land law, preferably one familiar with the specific area where you are buying. The lawyer should: (1) Conduct a search at the Lands Commission before you pay any money, (2) Verify the identity and authority of the seller, (3) For stool land — verify the chief's legitimacy with the Regional House of Chiefs, (4) For family land — ensure the family resolution authorizing the sale is genuine, (5) Draft the indenture with proper protective clauses, (6) Ensure stamping and registration. Legal fees are typically 1-3% of the transaction value, plus the search fee at the Lands Commission.",
  },
  {
    name: "Common Land Fraud Schemes and Protection",
    description:
      "Land fraud is a serious and widespread problem in Ghana that particularly affects diaspora buyers. Common schemes include: (1) Multiple sales of the same plot to different buyers, (2) Impersonation — someone posing as a chief, family head, or landowner, (3) Selling land that is subject to government acquisition, (4) Selling a larger area than the seller actually controls, (5) Family members selling without the consent of others who have customary rights, (6) Forged documents — fake site plans, indentures, or allocation notes, (7) Land guard intimidation — hiring thugs to occupy and defend disputed land.",
    phase: "LAND",
    authority: "General Advisory",
    notes:
      "Protection measures: (1) NEVER buy land without a search at the Lands Commission — this is non-negotiable, (2) ALWAYS use a lawyer for the entire transaction, (3) Hire your OWN surveyor to verify boundaries — do not rely on the seller's surveyor, (4) For stool land: verify the chief's legitimacy with the Regional House of Chiefs, (5) For family land: attend the family meeting and get a signed resolution, (6) Talk to neighboring property owners independently, (7) Visit the site personally or send a trusted representative, (8) Start the registration process IMMEDIATELY after execution of the indenture, (9) Build a compound wall or visible structure as soon as possible to establish physical presence, (10) NEVER pay in full before completing your due diligence — use staged payments tied to verification milestones. Land guard activity (using thugs to claim or defend land) is a criminal offense under the Vigilantism and Related Offences Act, 2019 (Act 999).",
  },
];
