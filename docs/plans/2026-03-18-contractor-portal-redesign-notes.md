# Contractor Portal — Redesign Notes

**Status:** Needs full redesign before launch. Current implementation is a scaffold.

## What exists now (scaffold)
- Service layer: token generation, validation, tier limits
- Team page: "Share access" button generates magic link
- /contractor/[token]: basic page showing all tasks + recent logs
- Firebase rules for contractorLinks node

## What's wrong with current implementation
- Shows ALL tasks to every contractor (not trade-specific)
- No concept of task assignment (who does what)
- No difference between a framing contractor and an electrician
- Tasks come from a flat list — no connection to milestones or phases
- Portal UX is bare-bones, needs real design thinking

## Open design questions for next session
1. **Task assignment model**: Should tasks be assigned to specific contacts?
   - Add `assignedTo: contactId` field to TaskData?
   - Or create a separate "contractor tasks" collection?

2. **Task source**: Where do contractor tasks come from?
   - Option A: Owner creates tasks and assigns them to contacts
   - Option B: Tasks auto-generated from phase milestones based on trade
   - Option C: Owner picks from milestone checklist items and assigns

3. **Trade-specific views**: Should an electrician see only electrical tasks?
   - Filter tasks by contact's trade/role
   - Show relevant phase milestones for their trade

4. **Workflow**: What's the actual flow?
   - Owner creates task → assigns to contractor → contractor sees it
   - Contractor marks complete → owner verifies → milestone progresses
   - Photo required for completion? (verification layer)

5. **Communication**: Is the portal just task tracking or also messaging?
   - Current: no messaging (use WhatsApp)
   - Could add: simple comment thread per task

## Decision needed before redesign
The fundamental question: Is this a **task assignment system** (owner tells contractor what to do) or a **progress reporting system** (contractor reports what they did)?

These are different products with different UX.
