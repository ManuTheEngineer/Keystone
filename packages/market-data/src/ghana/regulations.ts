import type { RegulationReference } from "../types";

/**
 * Ghana Construction Regulations
 *
 * Ghana's regulatory framework for construction has been strengthening,
 * particularly with the adoption of the Ghana Building Code (GS 1207:2018)
 * and increased enforcement by Metropolitan, Municipal, and District
 * Assemblies (MMDAs). However, enforcement varies significantly between
 * urban Greater Accra (where demolitions of unpermitted structures have
 * occurred) and rural areas (where building is largely unregulated).
 *
 * Key regulatory bodies:
 * - MMDAs (local government): Building permits and enforcement
 * - Lands Commission: Land registration and title
 * - Ghana Standards Authority (GSA): Building material standards
 * - CSIR-BRRI (Building and Road Research Institute): Research and guidance
 * - Energy Commission: Electrical standards
 * - Environmental Protection Agency (EPA): Environmental compliance
 *
 * Note: Land tenure regulations are in a separate file (land-tenure.ts)
 * due to their critical importance and complexity.
 */
export const GHANA_REGULATIONS: RegulationReference[] = [
  {
    name: "Development Permit (Building Permit)",
    description:
      "A development permit is legally required before starting any construction in Ghana under the Local Governance Act, 2016 (Act 936). The permit is issued by the Physical Planning Department of the relevant MMDA after review of architectural drawings, site plan, proof of land ownership, and payment of fees. Construction started without a permit can be ordered stopped or demolished, and the owner may face prosecution.",
    phase: "APPROVE",
    authority: "Metropolitan, Municipal, or District Assembly (MMDA) / Physical Planning Department",
    notes:
      "In Greater Accra, permit enforcement has increased significantly since 2017. Several high-profile demolitions of unpermitted or non-compliant buildings have raised awareness. The application requires: completed application form, 4 sets of architectural drawings, site plan from a licensed surveyor, copy of land documents (indenture or land certificate), structural engineer's report (for multi-storey), and payment of processing fees. Fees vary by MMDA but are typically calculated based on the building's floor area. Processing time is officially 3 months but can take 6-12 months in practice.",
  },
  {
    name: "Ghana Building Code (GS 1207:2018)",
    description:
      "The Ghana Building Code, published as Ghana Standard GS 1207:2018, provides comprehensive standards for building design, construction, materials, structural safety, fire safety, plumbing, electrical installations, and accessibility. Developed with support from CSIR-BRRI (Building and Road Research Institute), it is the primary technical reference for construction in Ghana.",
    phase: "DESIGN",
    authority: "Ghana Standards Authority (GSA) / CSIR-BRRI",
    notes:
      "The Ghana Building Code covers: structural design requirements (loading, foundations, concrete, steel, masonry), fire safety provisions, plumbing and sanitation, electrical installations, accessibility for persons with disabilities, and energy efficiency. While not yet uniformly enforced, MMDAs in Greater Accra and other major cities are increasingly referencing it during permit reviews. Architects and structural engineers should design in accordance with the code. The code references British Standards (BS) and Eurocodes for detailed technical specifications.",
  },
  {
    name: "National Building Regulations (L.I. 1630)",
    description:
      "The National Building Regulations, 1996 (L.I. 1630) established the legal framework for building control in Ghana. It sets out requirements for building permits, inspections, occupancy certificates, and penalties for non-compliance. While somewhat dated, it remains the primary legislative instrument for building regulation alongside the Local Governance Act.",
    phase: "APPROVE",
    authority: "Ministry of Works and Housing",
    notes:
      "L.I. 1630 requires that: all buildings have a permit before construction begins, buildings are inspected during construction at specified stages, completed buildings receive a habitation certificate before occupation, and buildings that do not comply can be ordered modified or demolished. In practice, mid-construction inspections and habitation certificates are inconsistently enforced for residential buildings, but this is changing in major cities.",
  },
  {
    name: "Zoning and Planning Regulations",
    description:
      "Local planning schemes and zoning regulations are maintained by each MMDA's Physical Planning Department. These define land use zones (residential, commercial, industrial, mixed-use), building density, setbacks, plot coverage, and height restrictions. Plans must comply with the local planning scheme to obtain a development permit.",
    phase: "DESIGN",
    authority: "MMDA Physical Planning Department / Town and Country Planning Department",
    notes:
      "Key rules in typical residential zones include: minimum 3m setback from front property boundary (more on classified roads), minimum 1.5-3m from side boundaries, maximum 2-3 storey height in most residential areas, and maximum 50-70% plot coverage. Rules vary by MMDA and zone. Always check the specific planning requirements for your area before finalizing building drawings. Non-compliance can result in permit refusal, stop-work orders, or demolition.",
  },
  {
    name: "Environmental Regulations",
    description:
      "The Environmental Protection Agency (EPA) Act, 1994 (Act 490) and Environmental Assessment Regulations, 1999 (L.I. 1652) require environmental permits for certain development activities. For standard residential construction, a full Environmental Impact Assessment (EIA) is generally not required, but larger projects (apartments, commercial buildings) may need an environmental permit.",
    phase: "APPROVE",
    authority: "Environmental Protection Agency (EPA)",
    notes:
      "For standard single-family homes, EPA involvement is minimal. However, building in environmentally sensitive areas (near waterways, wetlands, or the coast) may require EPA clearance. The EPA also regulates waste management — septic tank placement must comply with guidelines regarding distance from water sources. For developments of more than 5 units, an Environmental Impact Assessment screening may be required. Always check with the EPA if your site is near a water body or in a flood-prone area.",
  },
  {
    name: "Professional Requirements for Architects and Engineers",
    description:
      "The Architects Registration Council regulates architectural practice in Ghana. Architects must be registered to practice. For structural work, a registered structural engineer's involvement is required for multi-storey buildings. The Ghana Institute of Architects (GIA) and Ghana Institution of Engineers (GhIE) are the professional bodies.",
    phase: "DESIGN",
    authority: "Architects Registration Council / Ghana Institution of Engineers",
    notes:
      "For simple single-storey residential buildings, some MMDAs accept drawings from draughtsmen, but an architect's stamp strengthens the permit application. For multi-storey buildings, an architect and structural engineer are effectively required. Architect fees typically range from 5-10% of construction cost for full service (design and supervision). Structural engineer fees are typically 2-3% of construction cost. Using registered professionals provides legal protection and better quality assurance.",
  },
  {
    name: "Property Rate and Land Use Charges",
    description:
      "MMDAs levy property rates on developed land under the Local Governance Act. Property rates are based on the rateable value of the property and are assessed annually. Additionally, ground rent is payable to the stool, family, or government that granted the lease (for leasehold properties).",
    phase: "OPERATE",
    authority: "MMDA / Lands Commission / Office of the Administrator of Stool Lands (OASL)",
    notes:
      "Property rate bills are issued annually by the MMDA. Rates vary by location and property value. In Greater Accra, rate collection has improved significantly. Ground rent is a separate obligation — for stool land leases, a portion goes to the stool through the Office of the Administrator of Stool Lands (OASL). Keep all payment receipts as they may be required for land-related transactions. Failure to pay property rates can result in legal action by the MMDA.",
  },
  {
    name: "Electrical Installation Standards",
    description:
      "The Energy Commission regulates electrical installations through the National Wiring Regulations. These set standards for wire sizing, circuit protection, earthing, and safety. ECG (Electricity Company of Ghana) requires a valid electrical installation certificate before connecting a new building to the grid.",
    phase: "BUILD",
    authority: "Energy Commission / Electricity Company of Ghana (ECG)",
    notes:
      "Key requirements include: proper earthing system, correctly sized circuit breakers for each circuit, appropriate wire gauge for the load, wiring in conduit (surface-mounted or embedded), and a main distribution board with an isolator switch. ECG connection requires: application form, copy of development permit, site plan, and an inspection of the installation by an ECG-approved electrical inspector. The inspection fee and connection charges vary by location and load. Plan ahead — ECG connection can take several weeks to months.",
  },
];
