import type { RegulationReference } from "../types";

/**
 * Benin Construction Regulations
 *
 * Benin's regulatory framework for construction has been
 * significantly modernized since the 2013 Code Foncier et
 * Domanial, which reformed land tenure and created the ANDF
 * (Agence Nationale du Domaine et du Foncier). However,
 * enforcement varies between urban Cotonou/Porto-Novo (where
 * regulations are more strictly enforced) and rural areas.
 *
 * Note: Land tenure regulations are in a separate file
 * (land-tenure.ts) due to their critical importance and complexity.
 */
export const BENIN_REGULATIONS: RegulationReference[] = [
  {
    name: "Permis de construire (Building Permit)",
    description:
      "A building permit is legally required before starting any construction in urban areas of Benin. The permit is issued by the mairie (municipal government) after review of architectural plans, proof of land ownership or registration, and payment of fees. The permit is typically valid for 2-3 years. Construction without a permit can be ordered stopped and the structure demolished.",
    phase: "APPROVE",
    authority: "Mairie / Direction departementale du Cadre de Vie et du Developpement Durable",
    notes:
      "In Cotonou, Porto-Novo, and Parakou, the permit process is relatively structured and takes 4-8 weeks. In smaller communes, the process exists but may be less rigorous. The application requires: completed forms, 4 copies of architectural plans signed by a registered architect (for buildings above certain thresholds), copy of Certificat de Propriete Fonciere (CPF) or convention de vente with ANDF receipt, plan topographique, and payment of review fees. Benin has 77 communes, each with its own mairie processing permits.",
  },
  {
    name: "Code de l'urbanisme et de la construction",
    description:
      "Benin's urban planning and construction code establishes rules for land use, building density, setbacks, and building heights in urban areas. The code defines different zones (residential, commercial, industrial, mixed) with specific rules for each. The Agence d'Amenagement du Territoire (AAT) oversees national spatial planning.",
    phase: "DESIGN",
    authority: "Ministere du Cadre de Vie et du Developpement Durable",
    notes:
      "Key rules in residential zones typically include: minimum 3m setback from front property line (more on classified roads), minimum 1.5-2m from side boundaries, maximum height limits depending on zone classification, and maximum lot coverage percentages. The Grand Nokoue (Cotonou-Abomey-Calavi-Porto-Novo-Seme-Podji metropolitan area) has its own planning authority and specific development guidelines. Always verify the rules for your commune at the mairie before finalizing building plans.",
  },
  {
    name: "Code Foncier et Domanial (2013 Land Code)",
    description:
      "Benin's comprehensive land law (Loi No. 2013-01 du 14 aout 2013) reformed the entire land tenure system. It established the Certificat de Propriete Fonciere (CPF) as the definitive proof of land ownership, created the ANDF to centralize land registration, and introduced the Plan Foncier Rural (PFR) for rural land mapping. This law is the cornerstone of property rights in Benin.",
    phase: "LAND",
    authority: "ANDF (Agence Nationale du Domaine et du Foncier)",
    notes:
      "The 2013 Code Foncier replaced the older colonial-era titre foncier system. Key principles: the Certificat de Propriete Fonciere (CPF) is the only conclusive proof of ownership; all land transactions must be registered with ANDF; the Attestation de Detention Coutumiere (ADC) formalizes customary rights but must be converted to CPF for full legal protection; the Code established transitional provisions for existing titres fonciers and permits en cours. ANDF has bureau communaux (local offices) throughout the country to process registrations.",
  },
  {
    name: "Building Setback Rules",
    description:
      "Minimum distances that buildings must maintain from property boundaries, roads, and neighboring structures. Setbacks ensure light, air circulation, privacy, and emergency access. They vary by zone and road classification.",
    phase: "DESIGN",
    authority: "Mairie / Direction departementale du Cadre de Vie",
    notes:
      "Typical setbacks in Cotonou residential zones: 3-5m from the front boundary (depending on road classification), 1.5-3m from side boundaries, 3m from the rear boundary. Along classified national roads, larger setbacks apply (up to 15m from the road axis). In planned subdivisions (lotissements), setback rules are defined in the lot documentation. Non-compliance can result in the mairie refusing the permis de construire or ordering partial demolition.",
  },
  {
    name: "Height Restrictions",
    description:
      "Maximum building heights in Benin are regulated by zone. Most residential areas are limited to R+1 (ground floor plus one upper floor) or R+2 (ground plus two). Taller buildings require special authorization and structural engineering certification.",
    phase: "DESIGN",
    authority: "Mairie / Direction departementale du Cadre de Vie",
    notes:
      "The height limit depends on zone classification and structural capacity. Poteau-poutre construction can safely reach R+2 or R+3 with proper engineering. Buildings above R+1 require structural calculations from a qualified engineer. In the Cotonou CBD and along major arteries, higher buildings may be permitted. The building must not create shadow or nuisance problems for neighboring properties.",
  },
  {
    name: "Environmental Regulations",
    description:
      "Benin has environmental protection regulations that affect construction, particularly regarding waste management, tree removal, construction near waterways, lagoons (Lac Nokoue), and coastal zones, and noise control during construction.",
    phase: "APPROVE",
    authority: "Agence Beninoise pour l'Environnement (ABE)",
    notes:
      "For standard residential construction, environmental regulations primarily affect fosse septique placement (minimum distance from water sources), site drainage (must not redirect water onto neighbors), and construction in sensitive zones. Larger projects may require an Etude d'Impact Environnemental (EIE). Construction in the coastal zone between Cotonou and Seme-Podji is subject to erosion setback requirements. Near Lac Nokoue and the lagoon system, additional restrictions apply to protect the aquatic ecosystem.",
  },
  {
    name: "Municipal Construction Taxes",
    description:
      "Municipal governments levy taxes and fees related to construction, including permit fees, property taxes (impot foncier), and development contributions. The Office National des Recettes (ONR) and Direction Generale des Impots (DGI) handle tax collection.",
    phase: "APPROVE",
    authority: "Mairie / Direction Generale des Impots (DGI)",
    notes:
      "The permis de construire fee is calculated based on the estimated construction cost and building area. Upon completion, the property is subject to the Taxe Fonciere Unique (TFU), a unified property tax collected by the DGI. The TFU is assessed annually based on the rental value of the property. Benin has modernized tax collection through digital platforms. Keep all tax receipts (quittances) — they are required for ANDF registration, property transactions, and utility connections.",
  },
  {
    name: "Professional Requirements for Architects",
    description:
      "Benin requires that buildings above certain size or complexity thresholds be designed by a registered architect. The Ordre des Architectes du Benin regulates the profession and maintains a registry of qualified practitioners.",
    phase: "DESIGN",
    authority: "Ordre des Architectes du Benin",
    notes:
      "Registered architects must sign plans for multi-story buildings, public buildings, and commercial projects. For simple single-story residential buildings, a dessinateur may suffice, but an architect provides legal protection and professional oversight. Architect fees typically range from 5-10% of construction cost for full service (design + supervision). The Ordre des Architectes du Benin publishes a directory of registered members. Using a registered architect enables the formal garantie decennale (10-year structural warranty) upon reception.",
  },
];
