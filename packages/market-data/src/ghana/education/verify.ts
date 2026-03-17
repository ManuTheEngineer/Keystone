import type { EducationModule } from "../../types";

export const GHANA_EDUCATION_VERIFY: EducationModule = {
  phase: "VERIFY",
  title: "Verification and Handover",
  summary:
    "Systematically inspect every aspect of the construction before paying the final balance. The completion certificate formalizes the handover.",
  content: `The verification phase is when you inspect the completed construction before formally accepting the work and paying the final balance. In Ghana, this step is often skipped by owners eager to move in, leaving them with no recourse when defects are discovered later.

The handover should be done in the presence of the building owner (or their representative), the contractor or foreman, and ideally the architect. The inspection must be systematic and cover every trade. Prepare a written snag list that documents all defects, unfinished items, and corrections needed. Each item should include a photo and a clear description.

For the structural work, check: walls are plumb and level (use a spirit level), no cracks in columns or beams, the slab is flat, and the roof does not leak (best tested during or just after rain). For finishes, check: rendering quality (no bubbles, cracks, or hollow spots), tile work (adhesion, alignment, consistent joints), all doors and windows (open, close, lock correctly), and paint quality.

For plumbing, do a full water test: turn on every tap, flush every toilet, check under every basin and sink for leaks, and verify the polytank and pump system works. For electrical, test every socket, every switch, every light point. Check the distribution board and verify the earth connection is functional. If possible, bring an independent electrician to do a quick safety check.

Check exterior works as well: compound wall, gates, drains and channels, septic tank, and utility connections (ECG, GWCL). Poorly designed drains are a frequent cause of compound flooding during the rainy season.

List every defect on the snag list. The contractor typically has 15-30 days to address all items. Retain 5-10% of the final payment until every item is corrected and verified. Only sign the completion certificate after you are satisfied with the corrections.`,
  keyDecisions: [
    "Whether to engage an independent professional (architect or clerk of works) for the final inspection",
    "Checklist of items to inspect by trade",
    "Amount to retain from final payment pending snag list completion (5-10%)",
    "Deadline for contractor to correct snag list items",
    "Document archival: completion certificate, final drawings, receipts",
  ],
  commonMistakes: [
    "Accepting the building without a detailed inspection out of eagerness to move in",
    "Paying the full final balance before the snag list is cleared",
    "Not documenting defects in writing with photos",
    "Inspecting only in dry weather without checking for roof leaks during rain",
    "Forgetting to test plumbing and electrical systems systematically",
    "Not checking the rainwater drainage and gutter system",
    "Accepting poor-quality finishes under the assumption that 'this is how it is done in Ghana'",
  ],
  proTips: [
    "Inspect the roof during or just after a heavy rain to detect leaks",
    "Take photos of every defect with a clear description written on paper held next to it",
    "If you are in the diaspora, commission an architect for an independent inspection (GHS 1,000-3,000)",
    "Test every electrical socket with a simple socket tester (available at Kaneshie or Abossey Okai for GHS 30-50)",
    "Check that drains and gutters direct water AWAY from the building and off the compound",
    "Keep the signed completion certificate — it is your legal document if disputes arise later",
    "Request a defects liability period of at least 6 months for finishes and 12 months for structural work",
  ],
};
