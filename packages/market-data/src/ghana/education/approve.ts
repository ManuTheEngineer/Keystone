import type { EducationModule } from "../../types";

export const GHANA_EDUCATION_APPROVE: EducationModule = {
  phase: "APPROVE",
  title: "Obtain Permits",
  summary:
    "The development permit is issued by the MMDA. Building without one is illegal and can lead to demolition, especially in Greater Accra where enforcement has increased.",
  content: `In Ghana, all construction requires a development permit issued by the Physical Planning Department of the relevant Metropolitan, Municipal, or District Assembly (MMDA). Building without a permit is a criminal offense under the Local Governance Act, and in Greater Accra, enforcement has increased significantly. Several high-profile demolitions of unpermitted or non-compliant buildings have demonstrated that the authorities are serious about enforcement.

The permit application is submitted to the MMDA where your land is located. In Greater Accra, this might be the Accra Metropolitan Assembly (AMA), Tema Metropolitan Assembly, La Nkwantanang-Madina Municipal Assembly, Ga West Municipal Assembly, or others, depending on your exact location. The application package includes: a completed application form, at least 4 sets of architectural drawings, a site plan from a licensed surveyor, proof of land ownership (indenture or land certificate), and payment of processing fees.

Processing fees vary by MMDA but are typically calculated based on the building's floor area — budget GHS 2,000-10,000 for a standard residential permit. The official processing time is 3 months, but in practice it can take 6-12 months. Follow up regularly at the Physical Planning office.

For multi-storey buildings, a structural engineer's report and calculations are required. In environmentally sensitive areas (near waterways, wetlands, or the coast), an EPA clearance may be needed.

For diaspora builders, your lawyer or a local representative can submit and track the application. Insist on receiving copies of all receipts and the application reference number. Once the permit is issued, display it prominently on the construction site — this is a legal requirement.

Plan ahead for ECG (electricity) and GWCL (water) connections. These are separate applications that can take weeks to months, especially in newly developing areas.`,
  keyDecisions: [
    "Identify the correct MMDA for your plot location",
    "Whether to use an agent or submit the application directly",
    "Budget for permit fees and related costs",
    "Timing of submission to avoid delaying construction start",
    "Early application for ECG and GWCL connections",
  ],
  commonMistakes: [
    "Starting construction before the permit is issued",
    "Submitting an incomplete application that gets rejected and delays the project by months",
    "Not having drawings signed by a registered architect when required",
    "Failing to check setback and zoning requirements before finalizing plans",
    "Not keeping originals of permit receipts and the issued permit",
    "Ignoring specific planning requirements for certain zones (coastal setback, road reserves)",
  ],
  proTips: [
    "Submit the permit application as soon as your drawings are finalized to avoid delays",
    "Make certified copies of all documents before submission",
    "Visit the Physical Planning office in person regularly to check on progress",
    "Display the development permit on the construction site from day one (legal requirement)",
    "Apply for ECG and GWCL connections at least 3 months before you will need them",
    "Keep the original permit safe — it will be needed for the habitation certificate",
  ],
};
