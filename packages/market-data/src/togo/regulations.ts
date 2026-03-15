import type { RegulationReference } from "../types";

/**
 * Togo Construction Regulations
 *
 * Togo's regulatory framework for construction is less developed
 * than in the USA. Enforcement varies significantly between urban
 * Lome (where regulations exist and are sometimes enforced) and
 * rural areas (where building is largely unregulated).
 *
 * The most important regulatory areas for builders are:
 * 1. Land ownership (titre foncier system)
 * 2. Building permits (permis de construire)
 * 3. Urban planning rules (setbacks, height, density)
 *
 * Note: Land tenure regulations are in a separate file
 * (land-tenure.ts) due to their critical importance and complexity.
 */
export const TOGO_REGULATIONS: RegulationReference[] = [
  {
    name: "Permis de construire (Building Permit)",
    description:
      "A building permit is legally required before starting any construction in urban areas of Togo. The permit is issued by the mairie (municipal government) after review of architectural plans, proof of land ownership, and payment of fees. The permit is typically valid for 2-3 years from the date of issuance. Construction started without a permit can be ordered demolished, and the owner may face fines.",
    phase: "APPROVE",
    authority: "Mairie (Municipal Government) / Direction de l'Urbanisme",
    notes:
      "In Lome, the permit process is relatively structured and takes 2-6 weeks. In smaller cities (Kara, Sokode, Atakpame), the process exists but may be less rigorous. In rural areas, the requirement is rarely enforced, but obtaining a permit still provides legal protection. The application requires: completed forms, 4 copies of architectural plans, copy of titre foncier or acte de vente, plan cadastral, and payment of review fees (typically 0.5-1% of estimated construction cost).",
  },
  {
    name: "Code de l'urbanisme (Urban Planning Code)",
    description:
      "Togo's urban planning code establishes rules for land use, building density, setbacks, and building heights in urban areas. The code defines different zones (residential, commercial, industrial, mixed) with specific rules for each. In residential zones, common requirements include minimum setbacks from property lines, maximum lot coverage percentages, and height restrictions.",
    phase: "DESIGN",
    authority: "Ministere de l'Urbanisme, de l'Habitat et du Cadre de Vie",
    notes:
      "Key rules in Lome residential zones typically include: minimum 3m setback from front property line (more on major roads), minimum 1.5-2m from side boundaries, maximum 2-3 story height (R+1 or R+2) in most residential areas, and maximum 60-70% lot coverage. These rules are enforced inconsistently, but non-compliance can block future title registration or create legal problems with neighbors. Always verify the specific rules for your quartier at the mairie before finalizing building plans.",
  },
  {
    name: "Loi fonciere (Land Law)",
    description:
      "Togo's land law governs the ownership, transfer, and registration of land. The law establishes the titre foncier (registered land title) as the definitive proof of land ownership. It also recognizes customary land rights but requires their formalization through the titre foncier process for full legal protection. All land transactions should be conducted through a notaire (notary) and registered with the Service des Domaines.",
    phase: "LAND",
    authority: "Ministere de l'Economie et des Finances / Direction des Affaires Domaniales",
    notes:
      "The 2018 land law reform (Loi No. 2018-005) was intended to modernize and simplify land registration in Togo, but implementation remains challenging. Key principles: the titre foncier is the only conclusive proof of ownership; an acte de vente (sale deed) alone does not transfer ownership until registered; multiple sales of the same parcel are unfortunately common (the first person to obtain a titre foncier prevails). Always work with a notaire and verify ownership at the Direction des Affaires Domaniales before purchasing.",
  },
  {
    name: "Building Setback Rules",
    description:
      "Minimum distances that buildings must maintain from property boundaries, roads, and neighboring structures. Setbacks ensure light, air circulation, privacy, and emergency access. They vary by zone and road type — buildings on major boulevards may need larger front setbacks than those on residential streets.",
    phase: "DESIGN",
    authority: "Mairie / Direction de l'Urbanisme",
    notes:
      "Typical setbacks in Lome residential zones: 3-5m from the front boundary (depending on road classification), 1.5-3m from side boundaries, 3m from the rear boundary. On parcelles in lotissements (planned subdivisions), setback rules are usually clearly defined in the lot documentation. On customary land being developed for the first time, setback requirements may be less clear — check with the mairie. Non-compliance can result in the mairie refusing the permis de construire or ordering partial demolition.",
  },
  {
    name: "Height Restrictions",
    description:
      "Maximum building heights in Togo are regulated by zone. Most residential areas in Lome are limited to R+1 (ground floor plus one upper floor) or R+2 (ground plus two). Taller buildings require special authorization and typically must be designed by a registered architect with structural engineering calculations.",
    phase: "DESIGN",
    authority: "Mairie / Direction de l'Urbanisme",
    notes:
      "In practice, the height limit is determined by the zone classification and the structural capacity of the building. Poteau-poutre construction can safely reach R+2 or R+3 with proper engineering, but most residential projects are R+0 (single story) or R+1 (two stories). Buildings above R+1 must have structural calculations stamped by a qualified engineer. The mairie may also consider factors like neighborhood character, road width, and proximity to government buildings or military installations.",
  },
  {
    name: "Environmental Regulations",
    description:
      "Togo has environmental protection regulations that may affect construction, particularly regarding waste management (fosse septique requirements), tree removal on building sites, construction near waterways or lagoons, and dust and noise control during construction in urban areas.",
    phase: "APPROVE",
    authority: "Agence Nationale de Gestion de l'Environnement (ANGE)",
    notes:
      "For standard residential construction, environmental regulations primarily affect fosse septique placement (minimum distance from water sources and property lines) and site drainage (construction must not redirect water onto neighboring properties). Larger projects (apartments, commercial buildings) may require an environmental impact assessment (etude d'impact environnemental). In coastal areas of Lome, building too close to the ocean may be restricted due to erosion risks. Near lagoons (Lac Togo), additional setbacks may apply.",
  },
  {
    name: "Municipal Construction Taxes",
    description:
      "Municipal governments in Togo levy taxes and fees related to construction, including the permit fee (taxe de permis de construire), occupation tax (taxe fonciere), and in some cases a development contribution. These taxes fund local infrastructure and services.",
    phase: "APPROVE",
    authority: "Mairie / Office Togolais des Recettes (OTR)",
    notes:
      "The permis de construire fee is typically calculated as a percentage of the estimated construction cost (0.5-1.5%). Upon completion, the property becomes subject to the taxe fonciere (property tax), which is assessed annually based on the rental value of the property. In Lome, property tax collection has been improving through the OTR's modernization efforts. Keep all tax receipts (quittances) — they may be required when applying for the titre foncier, selling the property, or obtaining utility connections.",
  },
  {
    name: "Professional Requirements for Architects",
    description:
      "Togo requires that buildings above a certain size or complexity be designed by a registered architect (architecte agree). The Ordre des Architectes du Togo regulates the profession and maintains a registry of qualified practitioners. For simple residential buildings (single-story, standard layout), a dessinateur (draftsperson) may be sufficient, but an architect provides better legal protection.",
    phase: "DESIGN",
    authority: "Ordre des Architectes du Togo",
    notes:
      "The requirement for a registered architect is technically mandatory for multi-story buildings, public buildings, and projects above certain size thresholds. In practice, many residential projects are designed by dessinateurs or even by the chef de chantier working from informal sketches. However, using a registered architect provides several benefits: their stamp on the plans strengthens the permis de construire application, they provide professional oversight during construction, and their involvement enables the formal proces-verbal de reception which triggers warranty protections. Architect fees are typically 5-10% of construction cost for full service (design + supervision).",
  },
];
