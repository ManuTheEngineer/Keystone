import type { GlossaryTerm } from "../types";

export const USA_GLOSSARY: GlossaryTerm[] = [
  {
    term: "DTI",
    definition:
      "Debt-to-income ratio. The percentage of your gross monthly income that goes toward paying debts, including your projected mortgage payment. Most lenders require a DTI below 43 percent for construction loans. Calculated by dividing total monthly debt payments by gross monthly income.",
    phase: "FINANCE",
    marketSpecific: true,
  },
  {
    term: "LTC",
    definition:
      "Loan-to-cost ratio. The percentage of the total project cost that a lender is willing to finance. For example, if your total project cost is $400,000 and the lender offers 80 percent LTC, the maximum loan is $320,000. The remainder is your required down payment.",
    phase: "FINANCE",
    marketSpecific: false,
  },
  {
    term: "LTV",
    definition:
      "Loan-to-value ratio. The percentage of the appraised value of the finished home that a lender is willing to finance. If the appraised value of your completed home is $500,000 and the lender offers 80 percent LTV, the maximum permanent mortgage is $400,000.",
    phase: "FINANCE",
    marketSpecific: false,
  },
  {
    term: "Rough-in",
    definition:
      "The installation of mechanical systems (plumbing pipes, electrical wiring, HVAC ductwork) inside the walls, floors, and ceilings while the framing is still exposed and accessible. Rough-in happens after framing and before insulation and drywall. Each system is inspected separately before the walls are closed.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Top-out",
    definition:
      "The milestone when the framing of the structure is complete, including all walls, the roof structure, and sheathing. Also called 'framing complete.' This is typically when the framing inspection occurs.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Dry-in",
    definition:
      "The milestone when the building is protected from weather. The roof is sheathed and covered with underlayment or finished roofing, exterior walls are sheathed and wrapped with a weather-resistant barrier, and windows and exterior doors are installed. Also called 'dried in' or 'under roof.'",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Sheathing",
    definition:
      "Flat panels, usually plywood or oriented strand board (OSB), nailed to the outside of the wall framing and roof framing to provide structural rigidity and a surface for attaching weather barriers and exterior finishes. Wall sheathing is typically 7/16-inch or 1/2-inch OSB; roof sheathing is typically 1/2-inch or 5/8-inch plywood or OSB.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "R-value",
    definition:
      "A measure of a material's resistance to heat flow. The higher the R-value, the better the insulation. Building codes specify minimum R-values for walls, ceilings, and floors based on climate zone. For example, a typical code requirement might be R-20 for walls and R-49 for attic insulation in a cold climate.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Load-bearing wall",
    definition:
      "A wall that carries the weight of the structure above it (roof, upper floors) down to the foundation. Load-bearing walls cannot be removed or modified without engineering analysis and proper structural support. All exterior walls are typically load-bearing; some interior walls are load-bearing depending on the design.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "IRC",
    definition:
      "International Residential Code. The model building code used for one- and two-family dwellings and townhouses up to three stories. Most US jurisdictions adopt a version of the IRC, sometimes with local amendments. The IRC covers structural, fire safety, plumbing, mechanical, and energy requirements.",
    phase: "APPROVE",
    marketSpecific: true,
  },
  {
    term: "NEC",
    definition:
      "National Electrical Code, formally known as NFPA 70. The standard for electrical installation safety in the United States. Updated every three years, the NEC governs how wiring, outlets, panels, and electrical equipment must be installed. Your local jurisdiction adopts a specific edition of the NEC.",
    phase: "BUILD",
    marketSpecific: true,
  },
  {
    term: "Permit",
    definition:
      "An official authorization from the local building department that allows you to begin construction. A building permit is required before any structural work begins. The permit process involves submitting plans for review, paying fees, and receiving approval that your plans comply with local building codes.",
    phase: "APPROVE",
    marketSpecific: false,
  },
  {
    term: "Certificate of Occupancy",
    definition:
      "A document issued by the local building department after the final inspection confirms the home is built according to the approved plans and meets all code requirements. Often abbreviated as CO. You cannot legally move into the home or close your permanent mortgage without a CO.",
    phase: "VERIFY",
    marketSpecific: false,
  },
  {
    term: "Lien waiver",
    definition:
      "A document signed by a contractor, subcontractor, or material supplier acknowledging they have been paid and waiving their right to file a mechanic's lien against your property for that payment. Partial lien waivers are collected with progress payments; final lien waivers are collected with the last payment.",
    phase: "BUILD",
    marketSpecific: true,
  },
  {
    term: "Draw schedule",
    definition:
      "A predetermined schedule that defines when the construction lender will release funds during the building process. Each draw is tied to a construction milestone, such as foundation complete, framing complete, or dry-in. The lender typically sends an inspector to verify the milestone before releasing funds.",
    phase: "FINANCE",
    marketSpecific: false,
  },
  {
    term: "Draw request",
    definition:
      "A formal request submitted to the construction lender asking for the release of funds for a completed construction milestone. The draw request includes documentation of completed work, an updated cost breakdown, and usually requires a lender inspection before funds are disbursed.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Punch list",
    definition:
      "A detailed list of all items that are incomplete, defective, or do not meet the contract specifications, compiled near the end of construction during a walkthrough by the owner and contractor. A typical new home punch list has 50 to 150 items. All items must be corrected before final payment.",
    phase: "VERIFY",
    marketSpecific: false,
  },
  {
    term: "Change order",
    definition:
      "A written agreement between the owner and contractor to modify the original contract scope, price, or timeline. Change orders should document the change description, the cost impact (addition or credit), the timeline impact, and be signed by both parties before the changed work begins.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "GC (General Contractor)",
    definition:
      "The licensed professional responsible for managing the overall construction project. The GC hires and coordinates subcontractors, orders materials, manages the construction schedule, ensures code compliance, and serves as the primary point of contact between the owner and the building team. GC fees typically range from 10 to 20 percent of construction cost.",
    phase: "ASSEMBLE",
    marketSpecific: false,
  },
  {
    term: "Subcontractor",
    definition:
      "A specialized tradesperson or company hired to perform a specific portion of the construction work, such as plumbing, electrical, HVAC, roofing, or concrete. Subcontractors are typically hired by the general contractor but may be hired directly by an owner-builder. Most trades require a state or local license.",
    phase: "ASSEMBLE",
    marketSpecific: false,
  },
  {
    term: "Plat",
    definition:
      "A legal map of a subdivision or development that shows individual lot boundaries, street layouts, easements, and dedicated public spaces. The plat is recorded with the county and establishes the official boundaries of each lot. When buying land in a subdivision, the plat is the definitive reference for your property boundaries.",
    phase: "LAND",
    marketSpecific: true,
  },
  {
    term: "Easement",
    definition:
      "A legal right for someone other than the property owner to use a specific portion of the land for a defined purpose. Common examples include utility easements (allowing power or water companies to access their lines), drainage easements, and access easements (allowing a neighbor to cross your property to reach theirs). You cannot build permanent structures on an easement.",
    phase: "LAND",
    marketSpecific: false,
  },
  {
    term: "Setback",
    definition:
      "The minimum distance that a building must be placed from a property line, road, or other feature as required by local zoning regulations. Front, side, and rear setbacks reduce the buildable area of your lot. For example, a lot might require a 25-foot front setback, 10-foot side setbacks, and a 20-foot rear setback.",
    phase: "LAND",
    marketSpecific: false,
  },
  {
    term: "Right-of-way",
    definition:
      "A strip of land reserved for public use, typically for roads, sidewalks, or utilities. The right-of-way often extends beyond the paved road surface onto your property. You own the land but the public has the right to use it. You generally cannot place permanent structures, fences, or landscaping within the right-of-way without permission.",
    phase: "LAND",
    marketSpecific: false,
  },
  {
    term: "FOB",
    definition:
      "Free on board. A shipping term that specifies the point at which ownership and liability for materials transfers from the seller to the buyer. 'FOB jobsite' means the supplier is responsible for delivering materials to your construction site. 'FOB warehouse' means you are responsible for pickup and transportation.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "PEX",
    definition:
      "Cross-linked polyethylene. A flexible plastic tubing used for water supply lines in residential plumbing. PEX has largely replaced copper piping in new construction because it is less expensive, easier to install, resistant to freezing and corrosion, and requires fewer fittings. Available in red (hot water), blue (cold water), and white (either).",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Romex",
    definition:
      "A brand name that has become the common term for non-metallic sheathed electrical cable used in residential wiring. Romex consists of two or more insulated copper conductors wrapped in a plastic jacket. Different sizes (gauge) carry different amounts of current: 14-gauge for 15-amp circuits, 12-gauge for 20-amp circuits.",
    phase: "BUILD",
    marketSpecific: true,
  },
  {
    term: "GFCI",
    definition:
      "Ground fault circuit interrupter. A safety device that quickly shuts off electrical power when it detects current flowing through an unintended path, such as through water or a person. Building codes require GFCI protection in bathrooms, kitchens, garages, outdoors, laundry rooms, and other wet or damp locations. Recognizable by the 'test' and 'reset' buttons on the outlet.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "AFCI",
    definition:
      "Arc fault circuit interrupter. A safety device installed in the electrical panel that detects dangerous electrical arcs (sparks) caused by damaged wiring, loose connections, or overheated cords, and shuts off the circuit before a fire can start. Current building codes require AFCI protection in most living areas of a home.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Header",
    definition:
      "A horizontal structural beam placed above a window, door, or other opening in a wall to carry the weight from above and transfer it to the framing on either side of the opening. Headers are typically made from doubled-up lumber, engineered wood products, or steel, and their size depends on the span of the opening and the load above.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "King stud",
    definition:
      "A full-length wall stud that runs from the bottom plate to the top plate on either side of a window or door opening. The king stud provides a nailing surface and structural support for the header assembly. It works together with the jack stud to frame the opening.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Jack stud",
    definition:
      "A shortened wall stud that runs from the bottom plate up to the underside of the header above a window or door opening. The jack stud, also called a trimmer stud, directly supports the weight of the header. It is nailed to the king stud beside it.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Cripple",
    definition:
      "A short stud used above or below a window or door opening to maintain the standard stud spacing for attaching sheathing and drywall. Cripple studs above a header transfer loads from the top plate to the header. Cripple studs below a window sill fill the space between the sill and the bottom plate.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Joist",
    definition:
      "A horizontal framing member that supports a floor or ceiling. Floor joists span between foundation walls or beams and carry the weight of the floor above. Ceiling joists span between walls and support the ceiling below. Common joist materials include dimensional lumber (2x8, 2x10, 2x12), engineered I-joists, and floor trusses.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Rafter",
    definition:
      "A sloped framing member that forms the structure of the roof, running from the ridge (peak) down to the exterior wall. Rafters are cut and installed individually on site, as opposed to trusses which are pre-fabricated. Rafter construction allows for vaulted ceilings and attic living space.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Truss",
    definition:
      "A pre-engineered and factory-built roof framing assembly made of lumber connected by metal plates. Trusses are designed to span the full width of the house without interior load-bearing walls, giving more flexibility in floor plan layout. They are delivered to the site and lifted into place by crane. Trusses cannot be cut or modified in the field without engineering approval.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Ridge beam",
    definition:
      "The horizontal framing member at the peak (highest point) of a roof where the rafters meet. In a structural ridge beam system, the beam carries the weight of the rafters. In a non-structural ridge board system, the ridge simply provides a nailing surface while the ceiling joists or collar ties resist the outward thrust of the rafters.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Soffit",
    definition:
      "The finished underside of the roof overhang, the horizontal surface between the exterior wall and the edge of the roof. Soffits typically include vents that allow air to flow into the attic for proper ventilation. Soffit materials include vinyl, aluminum, wood, and fiber cement.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Fascia",
    definition:
      "The vertical board that runs along the lower edge of the roof, covering the ends of the rafters or trusses. The fascia provides a finished appearance and serves as the attachment point for gutters. Fascia materials include wood, composite, aluminum, and PVC.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Flashing",
    definition:
      "Thin pieces of metal or other waterproof material installed at joints, transitions, and penetrations in the building envelope to direct water away from the structure. Common flashing locations include roof valleys, where the roof meets a wall, around chimneys, around windows and doors, and at the base of exterior walls. Improper flashing is one of the leading causes of water damage in homes.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Weep hole",
    definition:
      "A small opening left in masonry or brick veneer walls near the bottom of the wall that allows moisture trapped behind the wall to drain out. Weep holes are a critical part of the drainage system in brick and stone exteriors. They should never be sealed or blocked, even though they may look like defects.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Vapor barrier",
    definition:
      "A sheet material, typically polyethylene plastic, installed to prevent moisture from passing through walls, floors, or ceilings. In cold climates, the vapor barrier is installed on the warm (interior) side of the insulation to prevent indoor moisture from condensing inside the wall cavity. Placement varies by climate zone and must follow local code requirements.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Sill plate",
    definition:
      "The horizontal lumber member that sits directly on top of the foundation wall and serves as the base for the wall framing above. The sill plate is typically pressure-treated wood because it is in contact with concrete. It is anchored to the foundation with anchor bolts or hold-down straps to resist wind uplift forces.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Anchor bolt",
    definition:
      "A steel bolt embedded in the top of the foundation wall with the threaded end protruding upward. The sill plate is placed over the anchor bolts and secured with washers and nuts, creating a structural connection between the wood framing and the concrete foundation. Spacing and size are specified by the structural engineer.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Rebar",
    definition:
      "Reinforcing steel bar embedded in concrete to add tensile strength. Concrete is strong in compression but weak in tension, so rebar handles the tension forces. Rebar is specified by number, which indicates its diameter in eighths of an inch: a number 4 bar is 4/8 or 1/2 inch in diameter. Used in footings, foundations, slabs, and retaining walls.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Footing",
    definition:
      "The bottom-most part of the foundation, a wide, flat concrete element that spreads the weight of the structure over a larger area of soil. Footings sit below the frost line to prevent heaving from freeze-thaw cycles. The size and depth of footings are determined by the structural engineer based on the building loads and the soil bearing capacity.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Stem wall",
    definition:
      "The vertical concrete wall that sits on top of the footing and extends up to the level of the first floor. In a crawl space foundation, the stem wall creates the perimeter of the space beneath the house. The height of the stem wall determines the clearance in the crawl space and how high the house sits above the surrounding grade.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Slab-on-grade",
    definition:
      "A foundation type where a concrete slab is poured directly on the ground to serve as both the foundation and the floor of the home. The slab typically includes a thickened edge (turned-down edge) that acts as the footing. Slab-on-grade construction is common in warm climates where frost depth is not a concern and in areas with high water tables.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Crawl space",
    definition:
      "A foundation type that creates a shallow space, typically 18 to 48 inches high, between the ground and the first floor of the home. Crawl spaces provide access to plumbing, electrical, and HVAC systems beneath the floor. They must be properly ventilated or encapsulated with a vapor barrier to prevent moisture problems.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Bearing capacity",
    definition:
      "The maximum weight per unit area that soil can support without failing. Measured in pounds per square foot (psf), bearing capacity determines how large the footings need to be. Sandy soil might have a bearing capacity of 2,000 psf, while clay might be 1,500 psf. A geotechnical engineer tests the soil and provides this value.",
    phase: "LAND",
    marketSpecific: false,
  },
  {
    term: "Compaction",
    definition:
      "The process of mechanically compressing soil to increase its density and load-bearing capacity. All fill soil placed on a construction site must be compacted in layers (called lifts) and tested to verify it meets the engineered specification, typically 95 percent of maximum density. Improper compaction leads to settling, which can crack foundations and damage structures.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Backfill",
    definition:
      "Soil or gravel placed back against the foundation walls after the foundation is built and waterproofed. Backfill must be placed carefully to avoid damaging the foundation and should be compacted in layers. The grade of the backfill should slope away from the house to direct water away from the foundation.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Grade (verb)",
    definition:
      "To shape the surface of the ground to achieve the desired drainage pattern, elevation, and slope. Grading is performed at the beginning of construction to prepare the building pad and at the end to establish final drainage away from the foundation. Proper grading prevents water from pooling against the house.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Grade (noun)",
    definition:
      "The level or elevation of the ground surface at a specific point. 'At grade' means at ground level. 'Below grade' means below ground level, as in a basement. 'Above grade' means above ground level. The 'finish grade' is the final ground surface after all grading and landscaping is complete.",
    phase: "BUILD",
    marketSpecific: false,
  },
  {
    term: "Scope of work",
    definition:
      "A detailed written description of all the work a contractor or subcontractor is expected to perform, including specific tasks, materials to be used, quality standards, and what is explicitly excluded. A clear scope of work is the most important part of any construction contract because it defines exactly what you are paying for.",
    phase: "ASSEMBLE",
    marketSpecific: false,
  },
  {
    term: "Allowance",
    definition:
      "A dollar amount included in the construction contract for items that have not yet been selected by the owner, such as light fixtures, plumbing fixtures, flooring, or countertops. If the actual cost of the selected item exceeds the allowance, you pay the difference as a change order. If the actual cost is less, you receive a credit.",
    phase: "ASSEMBLE",
    marketSpecific: false,
  },
  {
    term: "Contingency",
    definition:
      "A percentage of the total budget set aside to cover unexpected costs, changes, and problems that arise during construction. A contingency of 10 to 15 percent is standard for new construction. The contingency is not a slush fund for upgrades; it exists to cover genuine surprises like rock removal, code changes, or material price increases.",
    phase: "FINANCE",
    marketSpecific: false,
  },
];
