# Phase 3: Visual Intelligence Layer — Design

**Date:** 2026-03-15
**Status:** Approved
**Scope:** Data visualizations (Recharts), phase-adaptive dashboard, enhanced AI wizard, diaspora monitoring, budget/schedule redesign

---

## 1. Add Recharts

Install `recharts` in `apps/web`. 9 new chart components using the app's color palette.

## 2. Phase-Adaptive Dashboard

The project overview page transforms based on current phase:

- **Define/Finance (0-1):** Education + loan qualification + budget preview donut
- **Land/Design/Approve (2-4):** Document checklist + budget builder + timeline
- **Assemble (5):** Bid comparison + team roster + contract tracker
- **Build (6):** Construction command center — daily pulse, burn chart, S-curve, inspections, photo feed, risk alerts, milestone tracker
- **Verify/Operate (7-8):** Punch list donut + inspection status + rental/sale tracking

## 3. Chart Components

| Component | Chart Type | Data Source |
|-----------|-----------|-------------|
| BudgetDonutChart | Pie/donut | Budget items by category |
| SpendVelocityChart | Area chart | Cumulative spend over time vs planned |
| ProgressSCurve | Dual line | Planned % vs actual % over weeks |
| CashFlowChart | Bar (pos/neg) | Income minus expenses per month |
| CategoryBreakdownChart | Horizontal bar | Budget categories with benchmark ranges |
| MilestoneTimeline | Custom SVG | Phase milestones with status markers |
| PunchListDonut | Donut | Open/in-progress/resolved items |
| RiskIndicator | Radial gauge | Overall project risk score |
| DailyPulseBar | Custom | Weather, crew, trades, last log time |

Colors: earth (#2C1810), clay (#8B4513), sand (#D4A574), emerald (#059669), success/warning/danger for status.

## 4. Enhanced AI Wizard

Replace 5-step form with conversational AI interview:
- Step 1: Purpose + Market (keep existing)
- Step 2: AI chat interview (15-25 adaptive questions about budget, land, experience, timeline)
- Step 3: AI generates Project Brief with budget chart, timeline, risk assessment
- One-click create with pre-filled data

## 5. Diaspora Monitoring Panel

New route: `/project/[id]/monitor`

- Photo feed with timestamp/geolocation verification
- Milestone-gated payment tracker (photo proof required before payment release)
- Weekly AI-generated progress summary
- Contractor activity log
- Material delivery tracker
- Alert feed for anomalies

## 6. Budget Page Redesign

- Top: Budget donut chart (live updating)
- Categories as cards (not table rows) with benchmark indicators
- Expandable cards for line items and transactions
- Floating summary bar: Total | Spent | Remaining | Contingency

## 7. Schedule Page Redesign

- Horizontal scrollable phase cards timeline
- Current phase expanded with milestone checklist
- Critical path indicators
- Weather/rainy season overlay for West Africa
