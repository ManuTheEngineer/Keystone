import type { GlossaryTerm } from "../types";

/**
 * Ghana Construction Glossary
 *
 * English construction terminology used in Ghana, with Twi
 * equivalents where commonly used. Many terms overlap with
 * the broader West African construction vocabulary but are
 * adapted to the Ghanaian context, regulatory system, and
 * building practices.
 */
export const GHANA_GLOSSARY: GlossaryTerm[] = [
  // === Land and Legal Terms ===
  {
    term: "Indenture",
    definition:
      "The legal instrument (deed) that conveys an interest in land from one party to another. For outright purchases of family land, it is a deed of conveyance. For stool land or government land, it is a lease document. The indenture must be prepared by a lawyer, signed by all parties, stamped at the Ghana Revenue Authority, and registered at the Lands Commission to be legally effective against third parties.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { en: "Indenture / Deed of conveyance / Lease" },
  },
  {
    term: "Land title certificate",
    definition:
      "The official certificate of land ownership issued by the Lands Commission under the Land Title Registration Act. Available in designated registration areas (Greater Accra and parts of Kumasi). It certifies ownership and is backed by a state guarantee — the strongest form of land documentation in Ghana. Not to be confused with deed registration, which merely records a document.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { en: "Land certificate / Title certificate" },
  },
  {
    term: "Stool land",
    definition:
      "Land held by a chief (occupant of a 'stool') in trust for the community. About 80% of Ghana's land is stool land. Stool land cannot be sold outright — it can only be leased, typically for 99 years for Ghanaian citizens and 50 years for non-citizens. Allocation requires the consent of the chief and principal elders. The Office of the Administrator of Stool Lands (OASL) collects ground rent on behalf of stools.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { twi: "Ahennua asase", en: "Stool land" },
  },
  {
    term: "Family land",
    definition:
      "Land held collectively by an extended family under customary law. The family head (abusuapanyin in Akan areas) manages the land, but disposal requires the consent of principal family members. A single family member cannot validly sell family land without the agreement of the family council. Family land disputes are extremely common in Ghana.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { twi: "Abusua asase", en: "Family land" },
  },
  {
    term: "Drink money",
    definition:
      "The payment made to a stool (chief) or family for a lease interest in their land. Despite the name, it is the actual purchase price for the land interest. The term originates from the customary practice of presenting drinks to the chief to initiate a land negotiation. Drink money is a one-time payment, separate from annual ground rent.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { twi: "Nsa tow", en: "Drink money / Purchase consideration" },
  },
  {
    term: "Ground rent",
    definition:
      "An annual payment made by a leaseholder to the grantor (stool, family, or government) for the continued use of leasehold land. For stool lands, ground rent is collected and distributed by the Office of the Administrator of Stool Lands (OASL). Failure to pay ground rent can theoretically lead to lease forfeiture, though this is rarely enforced.",
    phase: "OPERATE",
    marketSpecific: true,
    localTerms: { en: "Ground rent / Annual rent" },
  },
  {
    term: "Allocation note",
    definition:
      "A document issued by a chief or family head confirming the allocation of a plot of land to a buyer. The allocation note is the first formal document in a stool or family land acquisition, but it is NOT sufficient on its own — it must be followed by a proper indenture prepared by a lawyer and registration at the Lands Commission.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { en: "Allocation note / Allocation letter" },
  },
  {
    term: "Site plan",
    definition:
      "An official surveyed boundary map of a plot, produced by a licensed surveyor. Shows exact plot dimensions, area, boundary coordinates, and positions of boundary pillars. Required for the development permit application and land registration at the Lands Commission.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { en: "Site plan / Survey plan" },
  },
  {
    term: "Lands Commission",
    definition:
      "The government body responsible for land administration in Ghana. The Lands Commission manages: land title registration, deed registration, public and vested land management, survey and mapping, and the land valuation division. All land transactions should be searched and registered at the Lands Commission.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { en: "Lands Commission" },
  },
  {
    term: "Development permit",
    definition:
      "The building permit issued by the MMDA (Metropolitan, Municipal, or District Assembly) authorizing construction. Legally required for all building in Ghana. The application requires architectural drawings, site plan, proof of land ownership, and payment of fees. The permit is valid for 2-5 years.",
    phase: "APPROVE",
    marketSpecific: true,
    localTerms: { en: "Development permit / Building permit" },
  },
  {
    term: "MMDA",
    definition:
      "Metropolitan, Municipal, or District Assembly — the local government unit in Ghana responsible for, among other things, issuing development permits, enforcing building regulations, and collecting property rates. Greater Accra has several MMDAs including Accra Metropolitan Assembly (AMA), Tema Metropolitan Assembly, and La Nkwantanang-Madina Municipal Assembly.",
    phase: "APPROVE",
    marketSpecific: true,
    localTerms: { en: "Assembly / District Assembly / Municipal Assembly / Metropolitan Assembly" },
  },
  {
    term: "Land guard",
    definition:
      "Individuals (often armed thugs) illegally employed by land claimants to occupy, protect, or intimidate others off disputed land. Land guard activity is a criminal offense under the Vigilantism and Related Offences Act, 2019 (Act 999). If you encounter land guards on a plot you are considering, treat it as a major red flag — there is likely a dispute over the land. Report land guard activity to the police.",
    phase: "LAND",
    marketSpecific: true,
    localTerms: { en: "Land guard" },
  },

  // === Structural Terms ===
  {
    term: "Column-beam system",
    definition:
      "The reinforced concrete column-and-beam structural system used throughout Ghana and West Africa. Columns and beams form a rigid frame that carries all structural loads, with sandcrete blocks filling the spaces between as non-load-bearing infill walls. This system is the standard for residential and commercial construction in Ghana.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Column-beam / Post-and-beam / Frame structure" },
  },
  {
    term: "Sandcrete block",
    definition:
      "The primary wall building material in Ghana, made from a mixture of sand and cement, compressed in a mould. Available in 4-inch (100mm), 6-inch (150mm), and 8-inch (200mm) widths. 6-inch blocks are used for interior partitions; 8-inch for exterior and load-bearing walls. Quality varies enormously — buy from reputable manufacturers or test by dropping from chest height. The Ghana Standards Authority (GSA) standard GS 298 covers sandcrete block specifications.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { twi: "Block", en: "Sandcrete block / Cement block" },
  },
  {
    term: "Ring beam",
    definition:
      "A horizontal reinforced concrete beam that runs along the top of all walls, tying them together and distributing roof loads evenly. The bottom ring beam sits on top of the sub-base, and the top ring beam runs at the top of all walls before the roof. Ring beams prevent walls from cracking and separating — essential for structural integrity.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Ring beam / Lintel band / Bond beam" },
  },
  {
    term: "Hollow-pot slab",
    definition:
      "A ribbed floor slab system using hollow clay or polystyrene blocks placed between concrete ribs, then topped with a thin reinforced concrete layer. Lighter, more economical, and faster to construct than a solid slab. Commonly used for upper floors in multi-storey buildings in Ghana. Also known as a rib-and-block slab.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Hollow-pot slab / Rib-and-block slab / Hourdis" },
  },
  {
    term: "Rebar / Iron rod",
    definition:
      "Reinforcing steel bars used in all structural concrete elements — foundations, columns, beams, ring beams, and slabs. Available in different diameters: Y8, Y10, Y12, Y16, Y20, Y25. The 'Y' indicates high-yield deformed bar. Bars are typically 12 meters long. Major rebar suppliers in Ghana include Sentuo Steel, B5 Plus, and imported Turkish steel. Always check that bars are the correct diameter and free from excessive rust.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { twi: "Dade", en: "Rebar / Iron rod / Reinforcement bar" },
  },
  {
    term: "Cement",
    definition:
      "Portland cement, sold in 50kg bags. The single most expensive material by cumulative volume in Ghanaian construction. Major brands include GHACEM (Ghana Cement, local manufacturer), Diamond Cement (from the Vicat Group, manufactured in Ghana), and Dangote Cement. A standard structural concrete mix uses approximately 350kg of cement per cubic meter. Prices fluctuate and should be monitored closely.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { twi: "Sementu", en: "Cement" },
  },
  {
    term: "Chippings",
    definition:
      "Crushed granite aggregate (gravel) used in concrete mixes. Available in various sizes — typically 10mm, 14mm, and 20mm. Clean, properly graded chippings free of clay and organic matter are essential for strong concrete. Major sources include quarries around Accra (Shai Hills area), Nsawam, and the Ashanti region.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Chippings / Aggregate / Gravel" },
  },

  // === Roofing and Finishing Terms ===
  {
    term: "Step-tile roofing",
    definition:
      "Aluminum roofing sheets profiled to resemble traditional clay roof tiles. Very popular in Ghana for their aesthetic appeal and durability. More expensive than standard long-span corrugated roofing but does not rust and provides better heat reflection. Available from manufacturers like Aluminum Products Ltd and various importers.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Step-tile / Metrotile / Aluminum step-tile" },
  },
  {
    term: "Long-span roofing",
    definition:
      "Corrugated or ribbed aluminum or galvanized steel roofing sheets that span the full distance from ridge to eave without joints. Standard roofing material in Ghana. Aluminum long-span is preferred (no rust, lighter, better heat reflection) but galvanized steel is a cheaper alternative.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Long-span / Aluminum roofing sheets" },
  },
  {
    term: "Rendering / Plastering",
    definition:
      "Cement plaster applied to sandcrete block walls. Protects blocks from rain erosion and provides a smooth surface for painting. Applied in two coats: a rough base coat (scratch coat) and a smooth finishing coat. Must be kept wet for several days during curing.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Rendering / Plastering" },
  },
  {
    term: "Burglar-proofing",
    definition:
      "Steel bars or grilles welded and installed over windows (and sometimes doors) to prevent break-ins. A standard security feature in most Ghanaian homes. Fabricated by a welder from steel bars, angle iron, or flat bars. Designs range from simple vertical bars to decorative patterns. Essential in most neighborhoods.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Burglar-proof / Burglar bars / Window grilles" },
  },
  {
    term: "Compound wall",
    definition:
      "A perimeter wall around the property, essential for security and privacy in Ghana. Typically 2-2.5m high using 6-inch sandcrete blocks with reinforced concrete columns every 3m. Often the first structure built on a new plot to establish physical presence. Also called a fence wall.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { twi: "Bampanyin", en: "Compound wall / Fence wall / Perimeter wall" },
  },

  // === Infrastructure Terms ===
  {
    term: "Polytank",
    definition:
      "A polyethylene (plastic) water storage tank, ubiquitous in Ghana. Mounted on a steel stand (polytank stand) for gravity-fed water distribution, or at ground level with an electric pump. Essential because GWCL (Ghana Water Company) supply is intermittent in most areas. Standard residential sizes range from 500 to 5,000 liters. Major brands include Duraplast and Polytank (the brand that became the generic name).",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Polytank / Water tank / Overhead tank" },
  },
  {
    term: "Septic tank",
    definition:
      "An underground wastewater treatment structure required where there is no municipal sewer. Typically reinforced concrete with 2-3 compartments. Connected to a soakaway pit. Must be periodically desludged (pumped out) by a vacuum tanker. Position at least 5m from the house and away from any water source. Required by the EPA and local MMDA regulations.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Septic tank / Soak-pit system" },
  },
  {
    term: "ECG meter",
    definition:
      "An electricity meter installed by the Electricity Company of Ghana (ECG) or Northern Electricity Distribution Company (NEDCo). Prepaid meters (where you buy credit in advance) are now standard for new connections. Obtaining a meter requires: application, copy of development permit, site plan, electrical installation inspection, and payment of connection fees. The process can take weeks to months.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "ECG meter / Prepaid meter / Light meter" },
  },
  {
    term: "Dumsor",
    definition:
      "A Twi word literally meaning 'off-on,' used to describe the intermittent power supply (load-shedding) that has historically affected Ghana. While the severity has reduced, power outages still occur. Many homeowners install backup power systems: generator with changeover switch, inverter with battery bank, or solar panels. Budget for backup power when planning your build.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { twi: "Dumsor", en: "Power outage / Load-shedding" },
  },

  // === Financial and Administrative Terms ===
  {
    term: "Susu",
    definition:
      "A traditional savings system in Ghana. In its simplest form, a susu collector visits daily to collect a fixed amount and returns the total at the end of the month (minus one day's collection as their fee). Susu groups (similar to tontines) are rotating savings groups where members contribute regularly and each member receives the pooled amount in rotation. A useful savings and construction financing mechanism.",
    phase: "FINANCE",
    marketSpecific: true,
    localTerms: { twi: "Susu", en: "Susu / Rotating savings group" },
  },
  {
    term: "Bill of Quantities (BOQ)",
    definition:
      "A detailed document listing every item of work in a construction project with its description, unit of measurement, quantity, and provision for pricing. Prepared by a quantity surveyor or architect. The BOQ is the standard basis for contractor bidding and payment in Ghana. Send the same unpriced BOQ to multiple contractors to get comparable quotes.",
    phase: "ASSEMBLE",
    marketSpecific: true,
    localTerms: { en: "BOQ / Bill of Quantities" },
  },
  {
    term: "Day work / Daily rate",
    definition:
      "The system of paying construction workers a fixed amount per day of work. Most workers in Ghanaian construction are paid daily or weekly, often in cash or via mobile money (MTN MoMo or Vodafone Cash). Rates vary by trade, skill level, and location. Some contractors prefer lump-sum or per-task payment arrangements.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Day work / Daily rate / Journeyman rate" },
  },
  {
    term: "Retention",
    definition:
      "A percentage (typically 5-10%) of each payment withheld from the contractor until the defects liability period ends. This provides financial leverage to ensure the contractor returns to fix any defects that appear after practical completion. The retention is released when the defects liability certificate is issued.",
    phase: "VERIFY",
    marketSpecific: true,
    localTerms: { en: "Retention / Holdback / Defects retention" },
  },
  {
    term: "Practical completion",
    definition:
      "The point at which the building is substantially complete and fit for its intended purpose, even if minor defects remain. Practical completion triggers: handover of the building to the owner, start of the defects liability period, and release of a portion of the retention. Documented by a completion certificate.",
    phase: "VERIFY",
    marketSpecific: true,
    localTerms: { en: "Practical completion / Substantial completion" },
  },
  {
    term: "Snag list",
    definition:
      "A list of minor defects, unfinished items, and corrections identified during the final inspection walkthrough. The contractor is responsible for addressing all snag list items within an agreed timeframe. Each item should be documented with a photo and specific description. Do not release final payment until the snag list is cleared.",
    phase: "VERIFY",
    marketSpecific: true,
    localTerms: { en: "Snag list / Punch list / Defects list" },
  },

  // === People and Roles ===
  {
    term: "Quantity surveyor",
    definition:
      "A construction professional who specializes in cost management: preparing bills of quantities, cost estimates, valuations, and final accounts. In Ghana, quantity surveyors are registered with the Ghana Institution of Surveyors (Quantity Surveying Division). Engaging a QS provides better cost control and fair contractor payment.",
    phase: "DESIGN",
    marketSpecific: true,
    localTerms: { en: "QS / Quantity surveyor" },
  },
  {
    term: "Foreman / Mason foreman",
    definition:
      "The site foreman who manages day-to-day construction operations. Supervises workers, coordinates material deliveries, ensures quality of workmanship, and reports progress to the owner. In Ghana, the mason foreman is often an experienced mason who has graduated to a supervisory role. The foreman is the most important hiring decision for owner-managed builds.",
    phase: "ASSEMBLE",
    marketSpecific: true,
    localTerms: { twi: "Panyin", en: "Foreman / Site supervisor / Mason foreman" },
  },
  {
    term: "Iron bender / Steel bender",
    definition:
      "A specialized worker who cuts, bends, and ties reinforcement steel bars (rebar) into cages for structural concrete elements. Called 'iron bender' in Ghanaian construction parlance. Their work is critical — incorrect rebar placement compromises the entire building's structural integrity. Always inspect their work before every concrete pour.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Iron bender / Steel bender / Steel fixer" },
  },
  {
    term: "Fitter",
    definition:
      "In Ghanaian construction, a fitter is a skilled craftsperson who makes and installs doors, windows, built-in furniture, and other joinery items. The term covers both wood and aluminum work. Some fitters specialize in wood (traditional carpentry), while others focus on aluminum windows and doors.",
    phase: "BUILD",
    marketSpecific: true,
    localTerms: { en: "Fitter / Carpenter / Joiner" },
  },
];
