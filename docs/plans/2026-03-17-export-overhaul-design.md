# Export System Overhaul — Design

**Date:** 2026-03-17
**Status:** Approved
**Goal:** Every export uses the full project dataset. Standardized professional templates. AI-generated narrative summaries. Enterprise custom branding.

---

## Architecture

### Data Layer: `gatherFullProjectData()`

One function that fetches ALL data for a project from Firebase. Every export format consumes this same complete dataset — no more cherry-picking.

```typescript
interface FullProjectExportData {
  // Core
  project: ProjectData;
  market: MarketConfig;
  currency: CurrencyConfig;
  locationData: LocationData | null;

  // Financial
  budgetItems: BudgetItemData[];        // ALL items, no limit
  materials: MaterialData[];            // ALL materials
  financingSummary: {
    type: string;
    landCost: number;
    dealScore: number | null;
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    contingencyUsed: number;
    contingencyBudget: number;
    burnRate: number;                   // spent per week
    projectedFinalCost: number;
  };

  // People
  contacts: ContactData[];             // ALL contacts

  // Activity
  dailyLogs: DailyLogData[];          // ALL logs
  tasks: TaskData[];                   // ALL tasks
  photos: PhotoData[];                 // ALL photos, sorted by phase then date

  // Quality
  inspectionResults: InspectionResultData[];
  punchListItems: PunchListItemData[];

  // Documents
  documents: DocumentData[];
  vaultFiles: VaultFileData[];

  // Computed
  phaseTimeline: {
    phase: number;
    name: string;
    status: "completed" | "in-progress" | "upcoming";
    tasksTotal: number;
    tasksDone: number;
  }[];
  riskAssessment: {
    level: "critical" | "warning" | "info";
    title: string;
    detail: string;
  }[];
  weeklyActivity: {
    weekLabel: string;
    logCount: number;
    crewDays: number;
    photosAdded: number;
    tasksCompleted: number;
  }[];

  // AI-generated
  aiSummary: string;                    // Narrative project overview

  // Branding
  orgLogo: string | null;               // Enterprise: base64 data URL or null
  generatedAt: string;
}
```

### AI Summary Generation

Call Claude (claude-sonnet) with full project context to generate a 3-4 sentence narrative:

```
"This 2,400 sqft single-family home in Houston is 67% complete and
tracking 4% under budget. Foundation and framing completed on schedule.
The current electrical rough-in phase is 2 weeks behind due to permit
delays. Three punch list items remain open from the framing inspection."
```

Input: project metadata + budget summary + recent logs + task status + punch list
Output: Human-readable paragraph for the Executive Summary section

Rate-limited: one AI call per export generation, cached for 1 hour.

### Enterprise Custom Branding

**Storage:** `users/{uid}/profile/orgLogo` (base64 data URL, max 500KB)

**Settings UI:** Enterprise users see a "Organization Logo" upload in Settings:
- File picker (PNG/SVG, max 500KB)
- Preview with current logo
- Remove button

**In exports:**
- FOUNDATION/BUILDER/DEVELOPER: Keystone logo only
- ENTERPRISE: Org logo on left, "Powered by Keystone" small text on right

**Firebase rules:** `orgLogo` field writable only by the user (same as other profile fields).

---

## Export Formats

### 1. Full Project Report (PDF) — 15-20 pages

| Section | Pages | Data Used |
|---------|-------|-----------|
| Cover page | 1 | Project name, market, phase, date, logo(s) |
| Executive Summary | 1 | AI narrative + 6-metric dashboard |
| Budget Overview | 1-2 | ALL budget items with variance, donut chart |
| Materials & Procurement | 0-1 | ALL materials with delivery status |
| Timeline & Phases | 1 | Phase timeline, task completion, weekly activity |
| Team & Contacts | 1 | ALL contacts grouped by role/trade |
| Daily Log Summary | 1-2 | ALL logs grouped by week (condensed) |
| Inspection Results | 0-1 | ALL inspection checklists with pass/fail |
| Punch List | 0-1 | ALL items by severity |
| Photo Evidence | 1-3 | ALL photos organized by phase |
| Risk Assessment | 1 | Dynamic risks + recommendations |
| Financial Projections | 1 | ROI/yield/cost analysis per project purpose |
| Document Inventory | 0-1 | List of all documents + vault files |
| Disclaimer & Footer | 0.5 | Standard legal text |

Sections with 0 items are auto-hidden (e.g., no materials = no materials page).

### 2. Investor Deck (PDF) — 10-12 slides

Same as current but enhanced:
- Slide 1: Cover with org logo (Enterprise) or Keystone logo
- Slide 2: AI Executive Summary + 6 metrics
- Slide 3: Budget donut chart + category table (ALL categories)
- Slide 4: Phase timeline with completion % per phase
- Slide 5: Financial projections (ROI/cap rate/sale estimate)
- Slide 6: Weekly activity chart (last 8 weeks)
- Slide 7: Risk assessment with severity
- Slide 8: Team overview (ALL contacts)
- Slide 9: Photo evidence (up to 12, organized by phase)
- Slide 10: Inspection & punch list summary
- Slide 11: Next steps + milestones
- Slide 12: Thank you / contact

### 3. Weekly Update (PDF) — 3-5 pages

- Cover: Project name, week number, date range
- This week: Daily logs, photos added, tasks completed, crew summary
- Budget check: Spent this week, total utilization, any overages
- Issues: Open punch list items, failed inspections
- Next week: Upcoming tasks, scheduled inspections, materials expected

### 4. Budget Export (CSV)

Enhanced multi-section:
- Section 1: Budget items (Category | Estimated | Actual | Variance | Status)
- Section 2: Materials (Name | Qty Ordered | Qty Delivered | Unit Price | Total | Supplier | Status)
- Section 3: Summary (Total Budget | Total Spent | Remaining | Contingency | Burn Rate)

### 5. Complete Backup (JSON)

Full FullProjectExportData object, importable for project restoration.

---

## Template Design System

### Shared CSS

All PDF exports use a single shared CSS module (`export-styles.ts`) with:

```css
/* Brand colors */
--export-earth: #2C1810;
--export-clay: #8B4513;
--export-sand: #D4A574;
--export-warm: #F5E6D3;
--export-success: #2D6A4F;
--export-warning: #BC6C25;
--export-danger: #9B2226;

/* Typography */
font-family: Georgia, serif;           /* Headings */
font-family: 'Segoe UI', system-ui;    /* Body */
font-family: 'Courier New', monospace; /* Numbers/currency */

/* Layout */
max-width: 800px;
margin: 0 auto;
padding: 40px;
```

### Shared Components

Reusable HTML generators:

| Component | Used in |
|-----------|---------|
| `renderCoverPage(project, logo, reportType)` | All PDFs |
| `renderMetricGrid(metrics[])` | All PDFs |
| `renderBudgetTable(items, currency)` | Full Report, Investor, Weekly |
| `renderPhaseTimeline(phases[])` | Full Report, Investor, Progress |
| `renderDonutChart(categories[])` | Full Report, Investor, Budget Report |
| `renderContactsTable(contacts[])` | Full Report, Investor, Team |
| `renderDailyLogTable(logs[], limit?)` | Full Report, Weekly, Progress |
| `renderPhotoGrid(photos[], columns)` | Full Report, Investor, Progress |
| `renderRiskCards(risks[])` | Full Report, Investor, Weekly |
| `renderPunchListTable(items[])` | Full Report, Investor, Weekly |
| `renderInspectionResults(results[])` | Full Report |
| `renderMaterialsTable(materials[])` | Full Report, Budget |
| `renderDocumentInventory(docs[], vault[])` | Full Report |
| `renderDisclaimer()` | All PDFs |
| `renderHeader(project, pageTitle)` | Every page |
| `renderFooter(generatedAt)` | Every page |

### Logo Handling

```typescript
function renderLogo(orgLogo: string | null): string {
  if (orgLogo) {
    // Enterprise: org logo + small Keystone attribution
    return `
      <div class="logo-row">
        <img src="${orgLogo}" class="org-logo" />
        <span class="powered-by">Powered by Keystone</span>
      </div>`;
  }
  // Default: Keystone branding
  return `<div class="logo-row"><span class="keystone-brand">Keystone</span></div>`;
}
```

---

## Implementation Phases

### Phase 1: Data Gatherer + Shared Components
- Create `gatherFullProjectData()` in a new `lib/services/export-data-gatherer.ts`
- Create `lib/services/export-styles.ts` with shared CSS
- Create `lib/services/export-components.ts` with all reusable HTML renderers

### Phase 2: AI Summary
- Add AI summary generation to the data gatherer
- Call Claude with project context, cache result
- Graceful fallback if AI unavailable (use a static template)

### Phase 3: Rewrite Export Templates
- Rewrite `exportProjectPDF()` using shared components + full data
- Rewrite all 4 presentation types using shared components
- Add new Weekly Update format
- Enhance CSV exports with materials + summary sections

### Phase 4: Enterprise Logo Upload
- Add `orgLogo` field to UserProfile type
- Add upload UI in Settings (Enterprise tier only)
- Pass logo through to all export renderers

### Phase 5: Client Integration
- Update ExportModal to call `gatherFullProjectData()` once
- Show loading state during data gathering
- Pass complete dataset to all export functions
- Add "Generating AI summary..." indicator
