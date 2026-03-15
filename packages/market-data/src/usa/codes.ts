import type { RegulationReference } from "../types";

export const USA_REGULATIONS: RegulationReference[] = [
  {
    name: "International Residential Code (IRC)",
    description:
      "The primary model code governing the construction of one- and two-family dwellings and townhouses up to three stories. Covers structural, fire safety, plumbing, mechanical, and energy provisions in a single document. Most U.S. jurisdictions adopt the IRC with local amendments.",
    phase: "DESIGN",
    authority: "International Code Council (ICC), adopted by state and local jurisdictions",
    url: "https://www.iccsafe.org/products-and-services/i-codes/2021-i-codes/irc/",
    notes:
      "Check which edition your jurisdiction has adopted (2018, 2021, or 2024). Local amendments can significantly modify the base code. Your building department can provide the locally adopted version and any amendments.",
  },
  {
    name: "International Building Code (IBC)",
    description:
      "The model code for all buildings not covered by the IRC, including multi-family residential (apartments, condominiums with more than two units) and mixed-use structures. More complex structural and fire safety requirements than the IRC.",
    phase: "DESIGN",
    authority: "International Code Council (ICC), adopted by state and local jurisdictions",
    url: "https://www.iccsafe.org/products-and-services/i-codes/2021-i-codes/ibc/",
    notes:
      "Applies to duplexes and multi-family projects in some jurisdictions. If you are building a fourplex or apartment building, the IBC applies instead of (or in addition to) the IRC. Consult your building department for applicability.",
  },
  {
    name: "National Electrical Code (NEC / NFPA 70)",
    description:
      "The standard for safe electrical installation in residential and commercial buildings. Covers wiring methods, circuit protection, grounding, outlet and switch placement, and special equipment requirements. Updated on a three-year cycle.",
    phase: "BUILD",
    authority: "National Fire Protection Association (NFPA), adopted by state and local jurisdictions",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
    notes:
      "Key residential requirements include GFCI protection in wet areas, AFCI protection in living spaces, tamper-resistant receptacles, and smoke/CO detector interconnection. Your electrician and inspector will reference the locally adopted NEC edition.",
  },
  {
    name: "Uniform Plumbing Code (UPC)",
    description:
      "One of two major plumbing codes used in the United States, governing the installation of plumbing systems including water supply, drainage, waste, venting, and fixtures. Widely adopted in western and some central states.",
    phase: "BUILD",
    authority: "International Association of Plumbing and Mechanical Officials (IAPMO)",
    url: "https://www.iapmo.org/uniform-plumbing-code",
    notes:
      "Some states and jurisdictions adopt the International Plumbing Code (IPC) instead of the UPC. Check with your local building department to determine which plumbing code applies. The two codes differ in venting requirements and fixture unit calculations.",
  },
  {
    name: "International Energy Conservation Code (IECC)",
    description:
      "Sets minimum energy efficiency requirements for new residential and commercial construction, including insulation R-values, window U-factors, air leakage limits, and mechanical system efficiency. Requirements vary by climate zone.",
    phase: "DESIGN",
    authority: "International Code Council (ICC), adopted by state and local jurisdictions",
    url: "https://www.iccsafe.org/products-and-services/i-codes/2021-i-codes/iecc/",
    notes:
      "The IECC divides the U.S. into climate zones 1 through 8, each with different insulation and efficiency requirements. Some states (California Title 24, Washington, Oregon) have their own energy codes that exceed the IECC. Manual J load calculations are typically required for HVAC permit approval.",
  },
  {
    name: "Local Zoning Ordinances",
    description:
      "Municipal or county regulations that control how land can be used, including allowed building types, setback distances from property lines, maximum building height, lot coverage limits, and parking requirements. Zoning must be verified before purchasing land or beginning design.",
    phase: "LAND",
    authority: "City or county planning and zoning department",
    notes:
      "Zoning determines whether you can build a single-family home, duplex, or multi-family structure on a given lot. Setback requirements (front, side, rear) define the buildable area. Height limits and floor area ratio (FAR) cap the building size. Variance requests are possible but not guaranteed and can take months.",
  },
  {
    name: "ADA Accessibility Requirements",
    description:
      "The Americans with Disabilities Act and Fair Housing Act set accessibility requirements for multi-family residential construction. Single-family homes are generally exempt unless receiving federal funding, but accessibility features add value and future-proof the home.",
    phase: "DESIGN",
    authority: "U.S. Department of Justice, U.S. Department of Housing and Urban Development (HUD)",
    url: "https://www.ada.gov/",
    notes:
      "The Fair Housing Act requires accessibility features in multi-family buildings with four or more units built after March 1991. Single-family homes are exempt but consider universal design principles (wider doorways, zero-step entries, blocking for future grab bars) for aging-in-place flexibility.",
  },
  {
    name: "HOA/CC&R Compliance",
    description:
      "Homeowners Association rules and Covenants, Conditions, and Restrictions (CC&Rs) are private legal agreements that may impose additional requirements beyond building codes, including architectural style, exterior materials, color palettes, fence types, and landscaping standards.",
    phase: "DESIGN",
    authority: "Homeowners Association (HOA) or property developer",
    notes:
      "CC&Rs are recorded on the land deed and are legally binding. HOA architectural review committees must approve building plans before construction begins. Violations can result in fines, forced modifications, or legal action. Review all CC&Rs before purchasing a lot in a planned community.",
  },
  {
    name: "Environmental Regulations (Wetlands, Stormwater, Erosion)",
    description:
      "Federal, state, and local environmental regulations that protect wetlands, waterways, and water quality. May require environmental impact assessments, stormwater management plans, erosion control measures, and wetland buffer zones before construction can begin.",
    phase: "APPROVE",
    authority: "U.S. Army Corps of Engineers, EPA, state environmental agencies, local agencies",
    url: "https://www.epa.gov/cwa-404/permit-program-under-cwa-section-404",
    notes:
      "Section 404 of the Clean Water Act regulates filling or disturbing wetlands. The NPDES program requires stormwater pollution prevention plans (SWPPP) for sites disturbing one or more acres. Many localities require on-site stormwater detention or retention for new impervious surfaces. Environmental violations carry severe penalties.",
  },
  {
    name: "OSHA Construction Safety Standards",
    description:
      "Occupational Safety and Health Administration regulations that govern safety on construction sites. Apply to all employers and contractors, covering fall protection, scaffolding, excavation safety, electrical safety, and personal protective equipment.",
    phase: "BUILD",
    authority: "U.S. Department of Labor, Occupational Safety and Health Administration (OSHA)",
    url: "https://www.osha.gov/construction",
    notes:
      "OSHA standards apply to your general contractor and all subcontractors on site. As the property owner, you can be held liable for unsafe conditions. Ensure your GC has a written safety program, carries workers compensation insurance, and conducts regular safety meetings. OSHA can inspect any active construction site without advance notice.",
  },
  {
    name: "Floodplain Regulations (FEMA/NFIP)",
    description:
      "Federal Emergency Management Agency floodplain mapping and National Flood Insurance Program (NFIP) requirements. Properties in designated flood zones must meet elevated construction standards and carry flood insurance.",
    phase: "LAND",
    authority: "Federal Emergency Management Agency (FEMA), local floodplain administrators",
    url: "https://www.fema.gov/flood-maps",
    notes:
      "Check FEMA flood maps before purchasing land. Properties in Zone A or V require the lowest floor to be elevated above the Base Flood Elevation (BFE). Flood insurance is mandatory for federally-backed mortgages in high-risk zones. Elevation certificates are required to determine insurance rates. Building in a floodplain significantly increases construction costs.",
  },
  {
    name: "Title and Survey Requirements",
    description:
      "Legal requirements for establishing clear ownership and accurate boundaries before construction. Includes title insurance, boundary surveys, easement identification, and right-of-way verification.",
    phase: "LAND",
    authority: "State real estate law, county recorder's office, licensed surveyors",
    notes:
      "A boundary survey by a licensed surveyor is essential before construction to confirm property lines, identify easements, and locate setback boundaries. Title insurance protects against ownership disputes, undisclosed liens, and encumbrances. Utility easements may restrict where you can build. Always get a survey before finalizing your site plan.",
  },
];
