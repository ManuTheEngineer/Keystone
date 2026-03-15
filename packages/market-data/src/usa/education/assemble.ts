import type { EducationModule } from "../../types";

export const USA_EDUCATION_ASSEMBLE: EducationModule = {
  phase: "ASSEMBLE",
  title: "Building Your Team",
  summary:
    "Your contractor is the single biggest factor in whether your project comes in on time, on budget, and at the quality you expect. Choosing the right team deserves serious effort.",
  content: `Building a home requires coordinating dozens of skilled tradespeople, and how you organize that effort is one of the most consequential decisions of the project. You have two primary paths: hiring a general contractor who manages everything, or acting as your own general contractor, known as owner-building.

A general contractor, or GC, is a licensed professional who hires and coordinates all subcontractors, orders materials, manages the schedule, handles inspections, and takes responsibility for the quality and completion of the work. A GC typically charges 10 to 20 percent of construction cost as their fee, which covers their overhead, profit, and project management. This fee is well earned when you consider that a good GC brings relationships with reliable subcontractors, volume pricing on materials, and experience solving the problems that inevitably arise during construction.

Owner-building means you take on the GC role yourself. You save the GC markup but accept full responsibility for hiring, scheduling, quality control, code compliance, and problem-solving. Owner-building is significantly more work than most first-time builders expect, and mistakes in scheduling or subcontractor management often cost more than the GC fee would have been. If you choose this path, you must be available to be on-site or on-call every working day.

When interviewing contractors, look beyond price. Ask for references from projects similar in size and style to yours, and actually call those references. Verify their license and insurance: a GC should carry general liability insurance of at least $1 million and workers compensation coverage for their employees. Ask for proof of both and verify directly with the insurance company.

When comparing bids, make sure you are comparing the same scope. A bid that is $30,000 lower might exclude items the other bids include, such as appliances, landscaping, or driveway paving. Create a detailed scope of work document and require all bidders to price against the same specification.

The contract is your most important document. It should clearly define the scope, price, payment schedule tied to milestones, timeline with start and completion dates, change order process, warranty terms, insurance requirements, dispute resolution method, and termination conditions. Never sign a contract that requires more than 10 percent down or that front-loads payments ahead of completed work.

Lien waivers are a critical protection. Every time you pay a contractor or subcontractor, collect a lien waiver, which is a document where they acknowledge payment and waive their right to place a lien on your property for that amount. Without lien waivers, you can pay your GC in full and still have a subcontractor place a lien on your home because the GC failed to pay them.`,
  keyDecisions: [
    "Decide whether to hire a general contractor or act as your own owner-builder based on your experience, availability, and risk tolerance.",
    "Select your general contractor based on references, experience with your project type, communication style, and total value, not just lowest price.",
    "Negotiate a contract that protects you with milestone-based payments, clear change order procedures, and defined warranty terms.",
    "Determine your payment structure: fixed price, cost-plus with a cap, or cost-plus with open book.",
    "Establish a clear process for collecting lien waivers with every payment.",
  ],
  commonMistakes: [
    "Choosing the lowest bidder without verifying that the scope, timeline, and quality specifications match the other bids.",
    "Paying too much money upfront. Never pay more than 10 percent as a deposit, and tie all subsequent payments to verified completion of milestones.",
    "Not verifying contractor insurance. If an uninsured worker is injured on your property, you can be held liable.",
    "Signing a vague contract that does not clearly define scope, timeline, payment schedule, or change order procedures.",
    "Skipping reference checks. A 10-minute phone call with a previous client reveals more than any interview or website.",
  ],
  proTips: [
    "Get at least three bids, but five is better. The spread between bids tells you as much as the bids themselves. If one bid is dramatically lower, that contractor is either missing scope or planning to make it up in change orders.",
    "Ask each contractor who their subcontractors are for key trades like framing, plumbing, and electrical. A GC is only as good as the subs they use.",
    "Include a liquidated damages clause in your contract that specifies a daily penalty for late completion. This aligns incentives around your timeline.",
    "Require your contractor to provide a detailed construction schedule before starting. This becomes the baseline against which you measure progress.",
    "Meet your contractor at one of their active job sites, not in their office. How they run a current project tells you how they will run yours.",
  ],
};
