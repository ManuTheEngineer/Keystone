/**
 * Returns market-specific construction context that is injected into AI prompts.
 * This provides the model with essential background on construction practices,
 * regulatory environment, financial systems, and cultural context for each market.
 */
export function getMarketContext(market: string): string {
  const normalized = market.toUpperCase();

  switch (normalized) {
    case "USA":
      return `MARKET CONTEXT: UNITED STATES

Construction methodology: Wood-frame platform construction is standard for residential buildings up to 3 stories. Light-gauge steel framing used in some regions. Engineered wood products (LVL beams, floor trusses, I-joists) increasingly common.

Building codes: International Residential Code (IRC) for 1-2 family dwellings; International Building Code (IBC) for multifamily. State and local amendments apply. Energy code compliance required (IECC or state equivalent). All work must meet or exceed code minimums.

Trades and licensing: All major trades (electrical, plumbing, HVAC, gas) require state or local licensing. General contractors typically must be licensed and bonded. Workers' compensation insurance is mandatory in most states.

Inspection process: Municipal building inspectors conduct inspections at defined milestones: foundation/footing, framing/sheathing, rough mechanical (plumbing, electrical, HVAC), insulation, final. Each inspection must pass before work proceeds. Failed inspections require correction and re-inspection.

Financing: Construction loans are the primary financing vehicle. Funds disbursed through a draw schedule tied to construction milestones. Lender inspections verify work completion before releasing draws. Permanent financing (mortgage) replaces the construction loan upon completion. FHA, VA, USDA, and conventional loan programs available.

Payment practices: Contractors paid on net-30 terms or per draw schedule. Lien waiver required with each payment. Retainage (5-10%) held until substantial completion. Mechanic's lien laws protect subcontractors and suppliers.

Typical timeline: Single-family home construction typically takes 6-12 months depending on size, complexity, weather, and market conditions. Permit processing adds 2-12 weeks depending on jurisdiction.`;

    case "TOGO":
      return `MARKET CONTEXT: TOGO

Construction methodology: Poteau-poutre (reinforced concrete column-beam) construction is the standard system. Concrete block (agglo/parpaing) infill walls between structural columns. Foundations are typically semelle filante (strip foundations) or semelle isolee (pad foundations) with reinforced concrete. Roof structures use charpente metallique (steel trusses) or hardwood timber, covered with tole bac aluminium (aluminum roofing sheets).

Materials: Cement from CIM TOGO or CIMCO (typically CEM II 32.5 or 42.5). Rebar (fers a beton) in standard sizes: HA 6, HA 8, HA 10, HA 12, HA 14. Concrete dosing: 350 kg/m3 for structural elements, 300 kg/m3 for non-structural. Aggregates: sable de riviere (river sand, preferred for concrete) and gravier (crushed granite gravel). Blocks: standard sizes 10cm, 15cm, 20cm thickness.

Regulatory environment: Building permits (permis de construire) required from the municipal authority. Enforcement varies significantly by location -- strictly enforced in Lome, loosely in smaller cities and rural areas. No formal inspection regime equivalent to the US system. The owner or their maitre d'oeuvre is responsible for quality control.

Land tenure: The titre foncier (land title) system coexists with coutumier (customary) land ownership. Securing a clean titre foncier is critical before construction. The process involves: achat du terrain (purchase), bornage (surveying), convention de vente (sale agreement), demande de titre foncier (title application). This process can take 6-24 months.

Labor and payment: Workers are typically paid as journaliers (daily wage workers) or tacherons (task-based subcontractors who bring their own crew). Daily wages range from 2,000-5,000 FCFA for laborers, 5,000-15,000 FCFA for skilled workers (macons, ferrailleurs, charpentiers). Payment by mobile money (Flooz, T-Money) is increasingly common alongside cash.

Financing: Primarily cash self-funded, often built in phases over months or years as funds become available. Bank construction loans exist but require significant collateral and have high interest rates (8-15%). Diaspora remittances are a major funding source, sent via Western Union, MoneyGram, World Remit, or direct bank transfer.

Climate considerations: Two rainy seasons -- major (April to July) and minor (September to November). Concrete work should be planned for dry seasons. Extreme heat (February to April) requires early morning concrete pours and adequate curing water. Harmattan dust (December to February) can affect paint adhesion and finishing work.

Typical timeline: A standard 3-bedroom house can take 12-36 months depending on funding availability. Phase-by-phase construction is common -- foundation in one season, walls in the next, roofing when funds allow.`;

    case "GHANA":
      return `MARKET CONTEXT: GHANA

Construction methodology: Sandcrete block construction with reinforced concrete columns and ring beams is standard for residential buildings. Similar to the Togo poteau-poutre system but with locally produced sandcrete blocks (cement-sand mix) rather than agglo. Foundation types include strip foundations and pad foundations. Roofing typically uses aluminum roofing sheets on steel or timber trusses.

Materials: Cement from Ghacem (CEM II 32.5R or 42.5R) or Diamond Cement. Sandcrete blocks produced locally in standard sizes (4-inch, 5-inch, 6-inch, 9-inch). Reinforcement steel in standard sizes. Aggregates sourced from local quarries. Quality varies significantly by supplier -- testing is recommended.

Regulatory environment: Building permits required from Metropolitan, Municipal, and District Assemblies (MMDAs). The Ghana Building Code provides standards, and the Ghana Institution of Engineers oversees structural standards. Building inspection is conducted by MMDA building inspectors, but enforcement varies. Environmental Impact Assessment may be required for larger developments.

Land tenure: Ghana has a complex land tenure system involving stool lands (controlled by traditional authorities), family lands, government lands, and vested lands. The Lands Commission processes land registration. Due diligence is essential -- conduct a search at the Lands Commission, verify with the traditional authority (chief or queen mother), and check for encumbrances. Land disputes are common and can halt construction.

Labor and payment: Artisans (masons, carpenters, electricians) typically work on a labor-only basis with the owner supplying materials. Payment may be daily, weekly, or task-based. Wages paid in Ghana Cedis (GHS). Mobile money (MTN MoMo, Vodafone Cash, AirtelTigo Money) widely used for payments. Quantity surveyors play an important role in cost estimation and management.

Financing: Primarily self-funded in phases. Mortgage penetration is low but growing (HFC Bank, Republic Bank, Stanbic). Interest rates are high (20-30% in GHS terms). The National Housing and Mortgage Fund is expanding access. Diaspora Ghanaians often fund construction through remittances.

Climate considerations: Two rainy seasons in the south (April to July major, September to November minor). Single rainy season in the north (May to October). Construction scheduling should account for these periods, especially for foundation and concrete work. The Harmattan season (November to March) brings dry, dusty conditions.

Typical timeline: A standard 3-bedroom house takes 12-24 months with consistent funding. Phased construction over several years is common.`;

    case "BENIN":
      return `MARKET CONTEXT: BENIN

Construction methodology: Very similar to Togo -- poteau-poutre (reinforced concrete column-beam) construction with concrete block (agglo) infill walls. The two countries share construction traditions, materials, and many of the same trade practices. Foundations are strip or pad type in reinforced concrete. Roofing with tole bac on steel (charpente metallique) or timber trusses.

Materials: Cement from SCB Lafarge (CEM II 32.5 or 42.5) or imported from Togo/Nigeria. Local block production (agglo) with variable quality -- insist on blocks with adequate cement content and proper curing. Rebar and aggregates sourced from local suppliers. Materials in southern Benin often sourced from the Dantokpa market in Cotonou (the largest open-air market in West Africa) or from specialized building material depots.

Regulatory environment: Building permits (permis de construire) required from the mairie (municipal authority). The Direction de l'Urbanisme et de la Construction oversees building regulation. Enforcement is stricter in Cotonou and Porto-Novo than in secondary cities. The Code Foncier et Domanial (2013) governs land and property law.

Land tenure: Benin has made significant progress in land formalization through the Plan Foncier Rural (PFR) program and the Code Foncier et Domanial. The Certificat de Propriete Fonciere (CPF) is the definitive title. Process: identify land, conduct due diligence at the mairie, sign convention de vente before a notary, apply for CPF. Urban land may also have a Permis d'Habiter (occupancy permit) as an intermediate document.

Labor and payment: Similar to Togo -- journaliers (daily wage workers) and tacherons (task-based subcontractors). Payment in CFA Francs (XOF), same currency as Togo (both in the UEMOA zone). Mobile money (MTN MoMo, Moov Money) increasingly used. Wages comparable to Togo with slight variations by region.

Financing: Primarily cash self-funded in phases. Banking options include BCEAO-regulated commercial banks with construction loan products at high interest rates. Microfinance institutions offer smaller construction loans. Diaspora funding is significant, particularly from Beninese communities in France, the US, and neighboring West African countries.

Climate considerations: Two rainy seasons in the south (April to July, September to November), single rainy season in the north (June to October). Coastal areas near Cotonou face flooding risk during heavy rains. Same concrete-work scheduling considerations as Togo.

Typical timeline: Similar to Togo -- 12-36 months for a standard house depending on funding flow. Phase-by-phase construction is the norm for self-funded builds.`;

    default:
      return `MARKET CONTEXT: ${market}

No specific market data available for this location. General construction best practices apply. The user should consult local building authorities, contractors, and professionals familiar with construction practices in their area.`;
  }
}
