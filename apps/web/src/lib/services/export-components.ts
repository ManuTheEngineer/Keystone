/**
 * Export Components
 *
 * Reusable HTML rendering functions for all export formats (PDF, HTML reports,
 * presentations). Each function takes data and returns an HTML string fragment.
 * Compose these together in export templates to build complete documents.
 */

import type {
  ProjectData,
  BudgetItemData,
  ContactData,
  DailyLogData,
  TaskData,
  PhotoData,
  PunchListItemData,
  InspectionResultData,
  MaterialData,
  DocumentData,
  VaultFileData,
} from "./project-service";
import type { FullProjectExportData } from "./export-data-gatherer";
import type { CurrencyConfig } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DONUT_COLORS = [
  "#2D6A4F",
  "#8B4513",
  "#1B4965",
  "#BC6C25",
  "#D4A574",
  "#9B2226",
  "#6B4226",
  "#3A3A3A",
  "#2563eb",
  "#7c3aed",
];

const PHASE_LABELS: Record<number, string> = {
  0: "Define",
  1: "Finance",
  2: "Land",
  3: "Design",
  4: "Approve",
  5: "Assemble",
  6: "Build",
  7: "Verify",
  8: "Operate",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCurrency(amount: number, currency: CurrencyConfig): string {
  if (currency.position === "suffix") {
    return `${Math.round(amount).toLocaleString()} ${currency.symbol}`;
  }
  return `${currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  })}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

function ratingStars(rating: number): string {
  const full = Math.min(Math.max(Math.round(rating), 0), 5);
  const empty = 5 - full;
  return "&#9733;".repeat(full) + "&#9734;".repeat(empty);
}

// ---------------------------------------------------------------------------
// 1. Cover Page
// ---------------------------------------------------------------------------

export function renderCoverPage(
  project: ProjectData,
  reportType: string,
  orgLogo: string | null,
  generatedAt: string
): string {
  const isWA = project.market !== "USA";
  const marketClass = isWA ? "market-wa" : "market-usa";
  const marketLabel = isWA ? project.market : "United States";
  const dateStr = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div class="cover">
      <div class="logo-row">
        ${orgLogo ? `<img class="org-logo" src="${escapeHtml(orgLogo)}" alt="Organization logo" />` : ""}
        <div>
          <div class="keystone-brand">Keystone</div>
          ${orgLogo ? '<div class="powered-by">Powered by Keystone</div>' : ""}
        </div>
      </div>
      <h1>${escapeHtml(project.name)}</h1>
      <div class="subtitle">${escapeHtml(reportType)}</div>
      <div class="subtitle">${escapeHtml(project.propertyType)} &mdash; ${escapeHtml(project.sizeRange)}</div>
      <span class="market-badge ${marketClass}">${escapeHtml(marketLabel)}</span>
      <div class="date">Generated ${dateStr}</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// 2. Metric Grid
// ---------------------------------------------------------------------------

export function renderMetricGrid(
  metrics: { label: string; value: string }[],
  cols?: number
): string {
  const colsClass = cols ? `cols-${cols}` : "";
  const boxes = metrics
    .map(
      (m) => `
      <div class="metric-box">
        <div class="metric-label">${escapeHtml(m.label)}</div>
        <div class="metric-value${m.value.length > 8 ? " small" : ""}">${escapeHtml(m.value)}</div>
      </div>`
    )
    .join("");

  return `<div class="metric-grid ${colsClass}">${boxes}</div>`;
}

// ---------------------------------------------------------------------------
// 3. AI Summary
// ---------------------------------------------------------------------------

export function renderAISummary(summary: string): string {
  const content =
    summary && summary.trim()
      ? escapeHtml(summary)
      : "Summary not available. AI analysis was not generated for this export.";

  return `<div class="ai-summary">${content}</div>`;
}

// ---------------------------------------------------------------------------
// 4. Budget Table
// ---------------------------------------------------------------------------

export function renderBudgetTable(
  items: BudgetItemData[],
  currency: CurrencyConfig,
  showTotals: boolean = true
): string {
  if (items.length === 0) {
    return '<p class="muted">No budget items recorded.</p>';
  }

  const rows = items
    .map((b) => {
      const variance = b.estimated - b.actual;
      return `
      <tr>
        <td>${escapeHtml(b.category)}</td>
        <td class="currency">${fmtCurrency(b.estimated, currency)}</td>
        <td class="currency">${fmtCurrency(b.actual, currency)}</td>
        <td class="currency">${fmtCurrency(variance, currency)}</td>
        <td><span class="status status-${escapeHtml(b.status)}">${escapeHtml(b.status)}</span></td>
      </tr>`;
    })
    .join("");

  const totalEstimated = items.reduce((s, b) => s + b.estimated, 0);
  const totalActual = items.reduce((s, b) => s + b.actual, 0);
  const totalVariance = totalEstimated - totalActual;

  const totalsRow = showTotals
    ? `
      <tr class="totals-row">
        <td>TOTAL</td>
        <td class="currency">${fmtCurrency(totalEstimated, currency)}</td>
        <td class="currency">${fmtCurrency(totalActual, currency)}</td>
        <td class="currency">${fmtCurrency(totalVariance, currency)}</td>
        <td></td>
      </tr>`
    : "";

  return `
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Estimated</th>
          <th class="text-right">Actual</th>
          <th class="text-right">Variance</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${totalsRow}
      </tbody>
    </table>`;
}

// ---------------------------------------------------------------------------
// 5. Phase Timeline
// ---------------------------------------------------------------------------

export function renderPhaseTimeline(
  phases: { phase: number; name: string; status: string }[]
): string {
  if (phases.length === 0) {
    return '<p class="muted">No phase data available.</p>';
  }

  const blocks = phases
    .map((p) => {
      let css = "phase-upcoming";
      if (p.status === "completed") css = "phase-completed";
      else if (p.status === "in-progress") css = "phase-current";

      return `<div class="phase-block ${css}">${p.phase}. ${escapeHtml(p.name)}</div>`;
    })
    .join("");

  return `<div class="phase-timeline">${blocks}</div>`;
}

// ---------------------------------------------------------------------------
// 6. Progress Bar
// ---------------------------------------------------------------------------

export function renderProgressBar(percent: number): string {
  const clamped = Math.max(0, Math.min(percent, 200));
  const displayWidth = Math.min(clamped, 100);
  let fillClass = "";
  if (clamped > 100) fillClass = "danger";
  else if (clamped >= 80) fillClass = "warning";

  return `
    <div class="progress-bar">
      <div class="progress-fill ${fillClass}" style="width: ${displayWidth}%;"></div>
    </div>
    <p style="font-size: 11px; color: #6A6A6A; text-align: right;">${Math.round(percent)}%</p>`;
}

// ---------------------------------------------------------------------------
// 7. Donut Chart
// ---------------------------------------------------------------------------

export function renderDonutChart(
  categories: { label: string; value: number; color: string }[],
  centerLabel: string
): string {
  if (categories.length === 0) {
    return '<p class="muted">No data for chart.</p>';
  }

  const total = categories.reduce((s, c) => s + c.value, 0);
  if (total === 0) {
    return '<p class="muted">All values are zero.</p>';
  }

  // Build conic-gradient stops
  const stops: string[] = [];
  let cumulative = 0;
  for (const cat of categories) {
    const startPct = (cumulative / total) * 100;
    cumulative += cat.value;
    const endPct = (cumulative / total) * 100;
    stops.push(`${cat.color} ${startPct.toFixed(1)}% ${endPct.toFixed(1)}%`);
  }

  const gradient = `conic-gradient(${stops.join(", ")})`;

  const legendItems = categories
    .map((cat) => {
      const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
      return `
        <div class="legend-item">
          <span class="legend-dot" style="background: ${cat.color};"></span>
          <span>${escapeHtml(cat.label)} (${pct}%)</span>
        </div>`;
    })
    .join("");

  return `
    <div class="donut-container">
      <div class="donut" style="background: ${gradient};">
        <div class="donut-hole">${escapeHtml(centerLabel)}</div>
      </div>
      <div class="donut-legend">${legendItems}</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// 8. Contacts Table
// ---------------------------------------------------------------------------

export function renderContactsTable(
  contacts: ContactData[],
  showAll: boolean = false
): string {
  if (contacts.length === 0) {
    return '<p class="muted">No team contacts recorded.</p>';
  }

  const list = showAll ? contacts : contacts.slice(0, 15);

  const rows = list
    .map(
      (c) => `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.role)}</td>
        <td>${escapeHtml(c.phone || "N/A")}</td>
        <td>${escapeHtml(c.email || "N/A")}</td>
        <td style="color: #BC6C25; letter-spacing: 1px;">${ratingStars(c.rating)}</td>
      </tr>`
    )
    .join("");

  const truncNote =
    !showAll && contacts.length > 15
      ? `<p class="muted mt-2">${contacts.length - 15} additional contacts not shown.</p>`
      : "";

  return `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role / Trade</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${truncNote}`;
}

// ---------------------------------------------------------------------------
// 9. Daily Log Table
// ---------------------------------------------------------------------------

export function renderDailyLogTable(
  logs: DailyLogData[],
  limit?: number
): string {
  if (logs.length === 0) {
    return '<p class="muted">No daily logs recorded.</p>';
  }

  const list = limit ? logs.slice(0, limit) : logs;

  const rows = list
    .map(
      (l) => `
      <tr>
        <td>${escapeHtml(l.date)}</td>
        <td class="text-center">Day ${l.day}</td>
        <td>${escapeHtml(l.weather)}</td>
        <td class="text-center">${l.crew}</td>
        <td>${escapeHtml(truncate(l.content, 100))}</td>
      </tr>`
    )
    .join("");

  const truncNote =
    limit && logs.length > limit
      ? `<p class="muted mt-2">Showing ${limit} of ${logs.length} log entries.</p>`
      : "";

  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th class="text-center">Day</th>
          <th>Weather</th>
          <th class="text-center">Crew</th>
          <th>Content</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${truncNote}`;
}

// ---------------------------------------------------------------------------
// 10. Photo Grid
// ---------------------------------------------------------------------------

export function renderPhotoGrid(
  photos: PhotoData[],
  columns: number = 4,
  limit?: number
): string {
  if (photos.length === 0) {
    return '<p class="muted">No photos recorded.</p>';
  }

  const list = limit ? photos.slice(0, limit) : photos;
  const colsClass = columns !== 4 ? `cols-${columns}` : "";

  const items = list
    .map((p) => {
      const caption = p.caption ? escapeHtml(truncate(p.caption, 40)) : "";
      const phaseLabel = p.phase ? escapeHtml(p.phase) : "";
      const sub = [phaseLabel, caption].filter(Boolean).join(" &mdash; ");

      return `
      <div class="photo-item">
        <img src="${escapeHtml(p.fileUrl)}" alt="${escapeHtml(p.caption || "Site photo")}" />
        ${sub ? `<div class="photo-caption">${sub}</div>` : ""}
      </div>`;
    })
    .join("");

  const truncNote =
    limit && photos.length > limit
      ? `<p class="muted mt-2">${photos.length - limit} additional photos not shown.</p>`
      : "";

  return `
    <div class="photo-grid ${colsClass}">${items}</div>
    ${truncNote}`;
}

// ---------------------------------------------------------------------------
// 11. Risk Cards
// ---------------------------------------------------------------------------

export function renderRiskCards(
  risks: { level: string; title: string; detail: string }[]
): string {
  if (risks.length === 0) {
    return '<div class="risk-card risk-info"><div class="risk-title">No Risks Identified</div><div class="risk-detail">No significant risks at this time.</div></div>';
  }

  return risks
    .map(
      (r) => `
      <div class="risk-card risk-${escapeHtml(r.level)}">
        <div class="risk-title">${escapeHtml(r.title)}</div>
        <div class="risk-detail">${escapeHtml(r.detail)}</div>
      </div>`
    )
    .join("");
}

// ---------------------------------------------------------------------------
// 12. Punch List Table
// ---------------------------------------------------------------------------

export function renderPunchListTable(items: PunchListItemData[]): string {
  if (items.length === 0) {
    return '<p class="muted">No punch list items recorded.</p>';
  }

  const rows = items
    .map(
      (p) => `
      <tr>
        <td>${escapeHtml(truncate(p.description, 80))}</td>
        <td>${escapeHtml(p.trade)}</td>
        <td><span class="status status-${escapeHtml(p.severity)}">${escapeHtml(p.severity)}</span></td>
        <td><span class="status status-${escapeHtml(p.status)}">${escapeHtml(p.status)}</span></td>
      </tr>`
    )
    .join("");

  return `
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Trade</th>
          <th>Severity</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ---------------------------------------------------------------------------
// 13. Inspection Results
// ---------------------------------------------------------------------------

export function renderInspectionResults(
  results: InspectionResultData[]
): string {
  if (results.length === 0) {
    return '<p class="muted">No inspection results recorded.</p>';
  }

  const rows = results
    .map((r) => {
      const total = r.completedItems.length;
      const passed = r.completedItems.filter(Boolean).length;
      const checkmarks = r.completedItems
        .map((done) => (done ? "&#10003;" : "&#10007;"))
        .join(" ");

      return `
      <tr>
        <td>${escapeHtml(r.inspectionId)}</td>
        <td>${escapeHtml(r.phase)}</td>
        <td class="text-center">${passed} / ${total}</td>
        <td><span class="status ${r.passed ? "status-on-track" : "status-over"}">${r.passed ? "PASS" : "FAIL"}</span></td>
        <td style="font-size: 10px; letter-spacing: 2px;">${checkmarks}</td>
      </tr>`;
    })
    .join("");

  return `
    <table>
      <thead>
        <tr>
          <th>Inspection</th>
          <th>Phase</th>
          <th class="text-center">Completed</th>
          <th>Result</th>
          <th>Items</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ---------------------------------------------------------------------------
// 14. Materials Table
// ---------------------------------------------------------------------------

export function renderMaterialsTable(
  materials: MaterialData[],
  currency: CurrencyConfig
): string {
  if (materials.length === 0) {
    return '<p class="muted">No materials tracked.</p>';
  }

  const rows = materials
    .map((m) => {
      const total = m.quantityOrdered * m.unitPrice;
      return `
      <tr>
        <td>${escapeHtml(m.name)}</td>
        <td class="text-center">${m.quantityOrdered}</td>
        <td class="text-center">${m.quantityDelivered}</td>
        <td class="currency">${fmtCurrency(m.unitPrice, currency)}</td>
        <td class="currency">${fmtCurrency(total, currency)}</td>
        <td>${escapeHtml(m.supplier || "N/A")}</td>
        <td><span class="status status-${m.status === "delivered" || m.status === "verified" ? "on-track" : m.status === "partial" ? "in-progress" : "open"}">${escapeHtml(m.status)}</span></td>
      </tr>`;
    })
    .join("");

  const grandTotal = materials.reduce(
    (s, m) => s + m.quantityOrdered * m.unitPrice,
    0
  );

  return `
    <table>
      <thead>
        <tr>
          <th>Material</th>
          <th class="text-center">Qty Ordered</th>
          <th class="text-center">Qty Delivered</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
          <th>Supplier</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="totals-row">
          <td colspan="4">TOTAL</td>
          <td class="currency">${fmtCurrency(grandTotal, currency)}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>`;
}

// ---------------------------------------------------------------------------
// 15. Document Inventory
// ---------------------------------------------------------------------------

export function renderDocumentInventory(
  docs: DocumentData[],
  vaultFiles: VaultFileData[]
): string {
  if (docs.length === 0 && vaultFiles.length === 0) {
    return '<p class="muted">No documents or files recorded.</p>';
  }

  // Combine into a unified list
  interface DocRow {
    source: string;
    type: string;
    name: string;
    date: string;
  }

  const rows: DocRow[] = [];

  for (const d of docs) {
    rows.push({
      source: "Document",
      type: d.type || "Other",
      name: d.name,
      date: d.date || d.generatedAt || "",
    });
  }

  for (const v of vaultFiles) {
    rows.push({
      source: "Vault",
      type: v.category,
      name: v.name,
      date: v.uploadedAt || "",
    });
  }

  // Sort by date descending
  rows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const tableRows = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.source)}</td>
        <td>${escapeHtml(r.type)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${r.date ? escapeHtml(r.date.split("T")[0]) : "N/A"}</td>
      </tr>`
    )
    .join("");

  return `
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th>Type</th>
          <th>Name</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`;
}

// ---------------------------------------------------------------------------
// 16. Page Header
// ---------------------------------------------------------------------------

export function renderPageHeader(
  projectName: string,
  sectionTitle: string
): string {
  return `
    <div class="page-header">
      <span>${escapeHtml(projectName)}</span>
      <span>${escapeHtml(sectionTitle)}</span>
    </div>`;
}

// ---------------------------------------------------------------------------
// 17. Page Footer
// ---------------------------------------------------------------------------

export function renderPageFooter(
  generatedAt: string,
  pageNum?: number
): string {
  const dateStr = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const pageLabel = pageNum != null ? `Page ${pageNum}` : "";

  return `
    <div class="page-footer">
      <span>Generated by Keystone &mdash; ${dateStr}</span>
      <span>${pageLabel}</span>
    </div>`;
}

// ---------------------------------------------------------------------------
// 18. Disclaimer
// ---------------------------------------------------------------------------

export function renderDisclaimer(): string {
  return `
    <div class="disclaimer">
      <strong>Disclaimer:</strong> This report is generated from user-entered data and AI-assisted
      analysis. All financial figures, timelines, and projections are estimates and should not be
      treated as guarantees. Budget and schedule variances may occur due to market conditions,
      material availability, and unforeseen circumstances. Consult licensed professionals
      (architects, engineers, attorneys, financial advisors) for decisions involving structural
      design, legal compliance, and financial commitments. Keystone is an educational and
      organizational tool and does not replace professional consultation.
    </div>`;
}

// ---------------------------------------------------------------------------
// 19. Financial Projections
// ---------------------------------------------------------------------------

export function renderFinancialProjections(
  project: ProjectData,
  financingSummary: FullProjectExportData["financingSummary"],
  currency: CurrencyConfig
): string {
  const { totalBudget, totalSpent, remaining, projectedFinalCost, burnRate } =
    financingSummary;

  // Base metrics shown for all purposes
  let html = `
    <h3>Cost Summary</h3>
    <table>
      <tbody>
        <tr><td>Total Budget</td><td class="currency">${fmtCurrency(totalBudget, currency)}</td></tr>
        <tr><td>Total Spent to Date</td><td class="currency">${fmtCurrency(totalSpent, currency)}</td></tr>
        <tr><td>Remaining</td><td class="currency">${fmtCurrency(remaining, currency)}</td></tr>
        <tr><td>Projected Final Cost</td><td class="currency">${fmtCurrency(projectedFinalCost, currency)}</td></tr>
        <tr><td>Financing Type</td><td>${escapeHtml(financingSummary.type || "N/A")}</td></tr>
        ${financingSummary.landCost > 0 ? `<tr><td>Land Cost</td><td class="currency">${fmtCurrency(financingSummary.landCost, currency)}</td></tr>` : ""}
        ${burnRate > 0 ? `<tr><td>Weekly Burn Rate</td><td class="currency">${fmtCurrency(burnRate, currency)}/wk</td></tr>` : ""}
      </tbody>
    </table>`;

  // Purpose-specific projections
  if (project.purpose === "RENT") {
    // Estimate rental yield based on projected cost
    const estimatedMonthlyRent = projectedFinalCost * 0.008; // 0.8% rule rough estimate
    const annualRent = estimatedMonthlyRent * 12;
    const grossYield =
      projectedFinalCost > 0
        ? ((annualRent / projectedFinalCost) * 100).toFixed(1)
        : "0.0";

    html += `
      <h3 class="mt-4">Rental Yield Projection (Estimate)</h3>
      <table>
        <tbody>
          <tr><td>Estimated Monthly Rent</td><td class="currency">${fmtCurrency(estimatedMonthlyRent, currency)}</td></tr>
          <tr><td>Estimated Annual Rent</td><td class="currency">${fmtCurrency(annualRent, currency)}</td></tr>
          <tr><td>Gross Rental Yield</td><td class="bold">${grossYield}%</td></tr>
        </tbody>
      </table>
      <p class="muted mt-2" style="font-size: 10px;">
        Rental estimate uses a 0.8% monthly rule-of-thumb. Actual rents vary by location, condition, and market demand.
      </p>`;
  } else if (project.purpose === "SELL") {
    // Estimate sale proceeds
    const estimatedSalePrice = projectedFinalCost * 1.2; // 20% markup estimate
    const grossProfit = estimatedSalePrice - projectedFinalCost;
    const roi =
      projectedFinalCost > 0
        ? ((grossProfit / projectedFinalCost) * 100).toFixed(1)
        : "0.0";

    html += `
      <h3 class="mt-4">Sale Projection (Estimate)</h3>
      <table>
        <tbody>
          <tr><td>Projected Total Cost</td><td class="currency">${fmtCurrency(projectedFinalCost, currency)}</td></tr>
          <tr><td>Estimated Sale Price (1.2x)</td><td class="currency">${fmtCurrency(estimatedSalePrice, currency)}</td></tr>
          <tr><td>Estimated Gross Profit</td><td class="currency">${fmtCurrency(grossProfit, currency)}</td></tr>
          <tr><td>Estimated ROI</td><td class="bold">${roi}%</td></tr>
        </tbody>
      </table>
      <p class="muted mt-2" style="font-size: 10px;">
        Sale estimate uses a 1.2x cost multiplier. Actual sale prices depend on location, market conditions, and comparable sales.
      </p>`;
  } else {
    // OCCUPY - focus on cost-to-own
    const weeksRemaining = Math.max(
      0,
      project.totalWeeks - project.currentWeek
    );
    const estimatedCompletion =
      weeksRemaining > 0 ? `~${weeksRemaining} weeks` : "Complete";

    html += `
      <h3 class="mt-4">Owner-Occupant Summary</h3>
      <table>
        <tbody>
          <tr><td>Projected Total Investment</td><td class="currency">${fmtCurrency(projectedFinalCost, currency)}</td></tr>
          <tr><td>Budget Variance</td><td class="currency">${fmtCurrency(totalBudget - projectedFinalCost, currency)}</td></tr>
          <tr><td>Estimated Time to Completion</td><td>${escapeHtml(estimatedCompletion)}</td></tr>
        </tbody>
      </table>`;
  }

  return html;
}

/** Render tasks table — shows all tasks grouped by status */
export function renderTasksTable(tasks: TaskData[]): string {
  if (!tasks || tasks.length === 0) return "";
  const done = tasks.filter((t) => t.done);
  const pending = tasks.filter((t) => !t.done);
  const rows = (list: TaskData[]) =>
    list.map((t) => `
      <tr>
        <td>${escapeHtml(t.label)}</td>
        <td>${t.assignedName ? escapeHtml(t.assignedName) : "<span class='muted'>Unassigned</span>"}</td>
        <td>${t.trade ? escapeHtml(t.trade) : ""}</td>
        <td><span class="status status-${t.status === "done" ? "on-track" : t.status === "pending-review" ? "in-progress" : t.status === "rejected" ? "critical" : "not-started"}">${escapeHtml(t.status)}</span></td>
        <td class="currency">${t.price ? `${t.currency ?? "$"}${t.price.toLocaleString()}` : ""}</td>
        <td>${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ""}</td>
      </tr>`).join("");

  return `
    <h2>Tasks (${done.length} of ${tasks.length} complete)</h2>
    ${pending.length > 0 ? `
      <h3>Active and Upcoming (${pending.length})</h3>
      <table>
        <thead><tr><th>Task</th><th>Assigned To</th><th>Trade</th><th>Status</th><th>Price</th><th>Due</th></tr></thead>
        <tbody>${rows(pending)}</tbody>
      </table>` : ""}
    ${done.length > 0 ? `
      <h3>Completed (${done.length})</h3>
      <table>
        <thead><tr><th>Task</th><th>Completed By</th><th>Trade</th><th>Status</th><th>Price</th><th>Due</th></tr></thead>
        <tbody>${rows(done)}</tbody>
      </table>` : ""}`;
}
