/**
 * Export Service
 *
 * Client-side export generation for project data in multiple formats:
 * PDF (via print API), CSV (for Excel/Sheets), and JSON (full backup).
 */

import type {
  ProjectData,
  BudgetItemData,
  ContactData,
  DailyLogData,
  DocumentData,
  PhotoData,
  TaskData,
  InspectionResultData,
  PunchListItemData,
  MaterialData,
} from "./project-service";

// ---------------------------------------------------------------------------
// ExportData interface
// ---------------------------------------------------------------------------

export interface ExportData {
  budgetItems: BudgetItemData[];
  contacts: ContactData[];
  dailyLogs: DailyLogData[];
  documents: DocumentData[];
  photos: PhotoData[];
  tasks: TaskData[];
  inspectionResults: InspectionResultData[];
  punchListItems: PunchListItemData[];
  materials: MaterialData[];
}

// ---------------------------------------------------------------------------
// CSV utilities
// ---------------------------------------------------------------------------

function generateCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const headerRow = headers.map(escape).join(",");
  const dataRows = rows.map((row) => row.map(escape).join(","));
  return [headerRow, ...dataRows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Print window helper using DOM manipulation (no document.write)
// ---------------------------------------------------------------------------

function openPrintWindow(htmlContent: string, title: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const doc = printWindow.document;
  doc.open();

  // Build the document using DOM APIs
  const doctype = doc.implementation.createDocumentType("html", "", "");
  if (doc.doctype) {
    doc.replaceChild(doctype, doc.doctype);
  }

  doc.title = title;

  // Parse the HTML content safely by setting innerHTML on the root
  const parser = new DOMParser();
  const parsed = parser.parseFromString(htmlContent, "text/html");

  // Clear and rebuild head
  while (doc.head.firstChild) {
    doc.head.removeChild(doc.head.firstChild);
  }
  Array.from(parsed.head.childNodes).forEach((node) => {
    doc.head.appendChild(doc.importNode(node, true));
  });

  // Clear and rebuild body
  while (doc.body.firstChild) {
    doc.body.removeChild(doc.body.firstChild);
  }
  Array.from(parsed.body.childNodes).forEach((node) => {
    doc.body.appendChild(doc.importNode(node, true));
  });

  doc.close();

  // Trigger print after a brief delay for rendering
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// ---------------------------------------------------------------------------
// Currency formatting helpers
// ---------------------------------------------------------------------------

function fmtCurrency(value: number, currency?: string): string {
  const c = currency || "USD";
  if (c === "XOF" || c === "CFA") {
    return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
  }
  if (c === "GHS") {
    return `GH\u20B5${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function safeDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
}

// ---------------------------------------------------------------------------
// Phase label mapping
// ---------------------------------------------------------------------------

const PHASE_LABELS: Record<number, string> = {
  0: "Phase 0: Define",
  1: "Phase 1: Finance",
  2: "Phase 2: Land",
  3: "Phase 3: Design",
  4: "Phase 4: Approve",
  5: "Phase 5: Assemble",
  6: "Phase 6: Build",
  7: "Phase 7: Verify",
  8: "Phase 8: Operate",
};

// ---------------------------------------------------------------------------
// CSS for printed reports
// ---------------------------------------------------------------------------

function getReportCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      color: #3A3A3A;
      font-size: 11px;
      line-height: 1.5;
    }
    h1, h2, h3, h4 {
      font-family: Georgia, "Times New Roman", serif;
      color: #2C1810;
    }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      page-break-after: always;
    }
    .cover h1 { font-size: 32px; margin-bottom: 8px; }
    .cover .market { font-size: 14px; color: #8B4513; margin-bottom: 4px; }
    .cover .phase { font-size: 16px; color: #6A6A6A; margin-bottom: 24px; }
    .cover .date { font-size: 12px; color: #6A6A6A; }
    .cover .branding {
      margin-top: 48px;
      font-size: 14px;
      color: #8B4513;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .section { padding: 24px 32px; }
    .section h2 {
      font-size: 18px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #D4A574;
    }
    .section h3 {
      font-size: 14px;
      margin-bottom: 8px;
      color: #8B4513;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 10px;
    }
    th {
      background: #F5E6D3;
      color: #2C1810;
      font-weight: 600;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #D4A574;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #e5e5e5;
    }
    tr:nth-child(even) td { background: #FAFAF8; }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .metric-box {
      border: 1px solid #D4A574;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    .metric-box .value {
      font-size: 20px;
      font-weight: 700;
      color: #2C1810;
      font-family: "Courier New", monospace;
    }
    .metric-box .label {
      font-size: 9px;
      color: #6A6A6A;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-on-track { background: #D1FAE5; color: #065F46; }
    .status-over { background: #FEE2E2; color: #991B1B; }
    .status-under { background: #DBEAFE; color: #1E40AF; }
    .status-not-started { background: #F3F4F6; color: #6B7280; }
    .risk-alert {
      padding: 8px 12px;
      border-left: 3px solid #BC6C25;
      background: #FFF7ED;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .risk-alert.danger {
      border-left-color: #9B2226;
      background: #FEF2F2;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .photo-thumb {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #e5e5e5;
    }
    .log-entry {
      padding: 8px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .log-entry .log-header {
      font-weight: 600;
      color: #2C1810;
      margin-bottom: 2px;
    }
    .log-entry .log-meta {
      font-size: 10px;
      color: #6A6A6A;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px 32px;
      font-size: 8px;
      color: #6A6A6A;
      border-top: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
    }
    .disclaimer {
      margin-top: 24px;
      padding: 12px;
      background: #F5E6D3;
      border-radius: 6px;
      font-size: 9px;
      color: #6A6A6A;
    }
    .page-break { page-break-before: always; }
    @media print {
      .no-print { display: none; }
      body { font-size: 10px; }
    }
  `;
}

// ---------------------------------------------------------------------------
// Sanitize text for safe HTML output
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// PDF Export (full project report)
// ---------------------------------------------------------------------------

export function exportProjectPDF(project: ProjectData, data: ExportData): void {
  const budgetUtilization =
    project.totalBudget > 0
      ? Math.round((project.totalSpent / project.totalBudget) * 100)
      : 0;
  const timelineProgress =
    project.totalWeeks > 0
      ? Math.round((project.currentWeek / project.totalWeeks) * 100)
      : 0;
  const remaining = project.totalBudget - project.totalSpent;

  const totalEstimated = data.budgetItems.reduce((s, b) => s + b.estimated, 0);
  const totalActual = data.budgetItems.reduce((s, b) => s + b.actual, 0);

  const openPunchList = data.punchListItems.filter((p) => p.status !== "resolved").length;
  const completedTasks = data.tasks.filter((t) => t.done).length;
  const totalTasks = data.tasks.length;
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Risk alerts
  const risks: { level: string; text: string }[] = [];
  if (budgetUtilization > 90) {
    risks.push({
      level: "danger",
      text: `Budget is ${budgetUtilization}% spent with ${100 - project.progress}% of work remaining.`,
    });
  }
  if (budgetUtilization > 75 && project.progress < 50) {
    risks.push({
      level: "danger",
      text: "Spend rate exceeds progress rate. Review scope and costs.",
    });
  }
  if (openPunchList > 5) {
    risks.push({
      level: "warning",
      text: `${openPunchList} open punch list items require resolution.`,
    });
  }
  if (risks.length === 0) {
    risks.push({
      level: "info",
      text: "No significant risks identified at this time.",
    });
  }

  // Build budget table rows
  const budgetRowsHTML = data.budgetItems
    .map(
      (b) => `
    <tr>
      <td>${escapeHtml(b.category)}</td>
      <td style="text-align:right; font-family: monospace;">${fmtCurrency(b.estimated, project.currency)}</td>
      <td style="text-align:right; font-family: monospace;">${fmtCurrency(b.actual, project.currency)}</td>
      <td style="text-align:right; font-family: monospace;">${fmtCurrency(b.estimated - b.actual, project.currency)}</td>
      <td><span class="status-badge status-${escapeHtml(b.status)}">${escapeHtml(b.status)}</span></td>
    </tr>`
    )
    .join("");

  // Phase status rows
  const phaseHTML = Array.from({ length: 9 }, (_, i) => {
    const label = PHASE_LABELS[i] || `Phase ${i}`;
    let status = "Not started";
    if (i < project.currentPhase) status = "Completed";
    else if (i === project.currentPhase) status = "In progress";
    return `<tr><td>${escapeHtml(label)}</td><td>${status}</td></tr>`;
  }).join("");

  // Team roster
  const teamHTML = data.contacts
    .map(
      (c) => `
    <tr>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.role)}</td>
      <td>${escapeHtml(c.phone || "N/A")}</td>
      <td>${escapeHtml(c.email || "N/A")}</td>
      <td>${c.rating}/5</td>
    </tr>`
    )
    .join("");

  // Daily logs (last 10)
  const recentLogs = data.dailyLogs.slice(0, 10);
  const logsHTML = recentLogs
    .map(
      (l) => `
    <div class="log-entry">
      <div class="log-header">Day ${l.day} - ${escapeHtml(l.date)}</div>
      <div class="log-meta">Weather: ${escapeHtml(l.weather)} | Crew: ${l.crew}</div>
      <div style="margin-top: 4px;">${escapeHtml(l.content)}</div>
    </div>`
    )
    .join("");

  // Photo gallery
  const photosHTML = data.photos
    .slice(0, 12)
    .map(
      (p) => `
    <div>
      <img class="photo-thumb" src="${escapeHtml(p.fileUrl)}" alt="${escapeHtml(p.caption || "Site photo")}" />
      ${p.caption ? `<div style="font-size: 9px; color: #6A6A6A; margin-top: 2px;">${escapeHtml(p.caption)}</div>` : ""}
    </div>`
    )
    .join("");

  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(project.name)} - Project Report</title>
  <style>${getReportCSS()}</style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div class="branding">Keystone</div>
    <h1>${escapeHtml(project.name)}</h1>
    <div class="market">Market: ${escapeHtml(project.market)}</div>
    <div class="phase">${escapeHtml(PHASE_LABELS[project.currentPhase] || project.phaseName)}</div>
    <div class="date">Report generated: ${dateStr}</div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <h2>Executive Summary</h2>
    <div class="metric-grid">
      <div class="metric-box">
        <div class="value">${project.progress}%</div>
        <div class="label">Progress</div>
      </div>
      <div class="metric-box">
        <div class="value">${budgetUtilization}%</div>
        <div class="label">Budget used</div>
      </div>
      <div class="metric-box">
        <div class="value">Wk ${project.currentWeek}/${project.totalWeeks}</div>
        <div class="label">Timeline</div>
      </div>
      <div class="metric-box">
        <div class="value">${project.openItems}</div>
        <div class="label">Open items</div>
      </div>
    </div>

    <h3>Budget Overview</h3>
    <table>
      <tr>
        <td><strong>Total Budget</strong></td>
        <td style="font-family: monospace;">${fmtCurrency(project.totalBudget, project.currency)}</td>
        <td><strong>Total Spent</strong></td>
        <td style="font-family: monospace;">${fmtCurrency(project.totalSpent, project.currency)}</td>
        <td><strong>Remaining</strong></td>
        <td style="font-family: monospace;">${fmtCurrency(remaining, project.currency)}</td>
      </tr>
    </table>

    <h3>Task Progress</h3>
    <p>${completedTasks} of ${totalTasks} tasks completed (${taskPct}%)</p>
  </div>

  <!-- Budget Breakdown -->
  <div class="section page-break">
    <h2>Budget Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th style="text-align:right;">Estimated</th>
          <th style="text-align:right;">Actual</th>
          <th style="text-align:right;">Variance</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${budgetRowsHTML}
        <tr style="font-weight: 700; background: #F5E6D3;">
          <td>TOTAL</td>
          <td style="text-align:right; font-family: monospace;">${fmtCurrency(totalEstimated, project.currency)}</td>
          <td style="text-align:right; font-family: monospace;">${fmtCurrency(totalActual, project.currency)}</td>
          <td style="text-align:right; font-family: monospace;">${fmtCurrency(totalEstimated - totalActual, project.currency)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Timeline / Phase Status -->
  <div class="section">
    <h2>Timeline and Phases</h2>
    <p style="margin-bottom: 12px;">
      Week ${project.currentWeek} of estimated ${project.totalWeeks} weeks (${timelineProgress}% elapsed)
    </p>
    <table>
      <thead>
        <tr><th>Phase</th><th>Status</th></tr>
      </thead>
      <tbody>${phaseHTML}</tbody>
    </table>
  </div>

  <!-- Team Roster -->
  <div class="section page-break">
    <h2>Team Roster</h2>
    ${
      data.contacts.length > 0
        ? `<table>
      <thead>
        <tr><th>Name</th><th>Role</th><th>Phone</th><th>Email</th><th>Rating</th></tr>
      </thead>
      <tbody>${teamHTML}</tbody>
    </table>`
        : "<p>No team members added yet.</p>"
    }
  </div>

  <!-- Daily Logs -->
  <div class="section">
    <h2>Recent Daily Logs</h2>
    ${recentLogs.length > 0 ? logsHTML : "<p>No daily logs recorded yet.</p>"}
  </div>

  <!-- Photos -->
  ${
    data.photos.length > 0
      ? `<div class="section page-break">
    <h2>Photo Gallery</h2>
    <div class="photo-grid">${photosHTML}</div>
  </div>`
      : ""
  }

  <!-- Risk Assessment -->
  <div class="section">
    <h2>Risk Assessment</h2>
    ${risks.map((r) => `<div class="risk-alert ${r.level === "danger" ? "danger" : ""}">${escapeHtml(r.text)}</div>`).join("")}
  </div>

  <!-- Disclaimer -->
  <div class="section">
    <div class="disclaimer">
      This report was generated by Keystone on ${dateStr}.
      All financial figures are based on user-entered data and may not reflect final costs. This report is for informational
      purposes only and does not constitute professional construction, financial, or legal advice. Consult licensed professionals
      for decisions related to your project.
    </div>
  </div>

  <!-- Print footer -->
  <div class="footer">
    <span>Keystone -- From First Idea to Final Key</span>
    <span>${escapeHtml(project.name)} -- ${new Date().toLocaleDateString()}</span>
  </div>
</body>
</html>`;

  openPrintWindow(html, `${project.name} - Project Report`);
}

// ---------------------------------------------------------------------------
// Quick Summary PDF (one-page)
// ---------------------------------------------------------------------------

export function exportQuickSummary(project: ProjectData, data: ExportData): void {
  const budgetUtilization =
    project.totalBudget > 0
      ? Math.round((project.totalSpent / project.totalBudget) * 100)
      : 0;
  const remaining = project.totalBudget - project.totalSpent;
  const openPunchList = data.punchListItems.filter((p) => p.status !== "resolved").length;
  const activeTasks = data.tasks.filter((t) => !t.done).length;

  const risks: string[] = [];
  if (budgetUtilization > 90) {
    risks.push(`Budget at ${budgetUtilization}% utilization with ${100 - project.progress}% of work remaining.`);
  }
  if (project.currentWeek > project.totalWeeks * 0.9 && project.progress < 90) {
    risks.push("Timeline nearing end with significant work remaining.");
  }
  if (openPunchList > 0) {
    risks.push(`${openPunchList} open punch list items.`);
  }

  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(project.name)} - Quick Summary</title>
  <style>${getReportCSS()}
    body { max-width: 800px; margin: 0 auto; padding: 32px; }
    @page { size: letter; margin: 0.5in; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="font-size: 11px; color: #8B4513; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Keystone</div>
    <h1 style="font-size: 24px; margin-bottom: 4px;">${escapeHtml(project.name)}</h1>
    <div style="font-size: 12px; color: #6A6A6A;">${dateStr} | ${escapeHtml(project.market)} | ${escapeHtml(PHASE_LABELS[project.currentPhase] || project.phaseName)}</div>
  </div>

  <div class="metric-grid">
    <div class="metric-box">
      <div class="value">${project.progress}%</div>
      <div class="label">Progress</div>
    </div>
    <div class="metric-box">
      <div class="value">${budgetUtilization}%</div>
      <div class="label">Budget used</div>
    </div>
    <div class="metric-box">
      <div class="value">Wk ${project.currentWeek}/${project.totalWeeks}</div>
      <div class="label">Timeline</div>
    </div>
    <div class="metric-box">
      <div class="value">${activeTasks}</div>
      <div class="label">Open tasks</div>
    </div>
  </div>

  <h3 style="margin-top: 20px;">Budget Summary</h3>
  <table>
    <tr>
      <th>Total Budget</th>
      <th>Spent to Date</th>
      <th>Remaining</th>
      <th>Utilization</th>
    </tr>
    <tr>
      <td style="font-family: monospace;">${fmtCurrency(project.totalBudget, project.currency)}</td>
      <td style="font-family: monospace;">${fmtCurrency(project.totalSpent, project.currency)}</td>
      <td style="font-family: monospace;">${fmtCurrency(remaining, project.currency)}</td>
      <td>${budgetUtilization}%</td>
    </tr>
  </table>

  <h3>Current Phase</h3>
  <p style="margin-bottom: 8px;">${escapeHtml(PHASE_LABELS[project.currentPhase] || project.phaseName)}</p>
  <div style="background: #e5e5e5; border-radius: 4px; height: 8px; overflow: hidden; margin-bottom: 16px;">
    <div style="background: #2D6A4F; height: 100%; width: ${project.progress}%; border-radius: 4px;"></div>
  </div>

  ${
    risks.length > 0
      ? `<h3>Risks and Alerts</h3>
    ${risks.map((r) => `<div class="risk-alert">${escapeHtml(r)}</div>`).join("")}`
      : ""
  }

  <div class="disclaimer" style="margin-top: 32px;">
    Generated by Keystone on ${new Date().toLocaleDateString()}. For informational purposes only. Consult licensed professionals for project decisions.
  </div>
</body>
</html>`;

  openPrintWindow(html, `${project.name} - Quick Summary`);
}

// ---------------------------------------------------------------------------
// Budget CSV
// ---------------------------------------------------------------------------

export function exportBudgetCSV(items: BudgetItemData[], project: ProjectData): void {
  const headers = ["Category", "Estimated", "Actual", "Variance", "Status"];
  const rows = items.map((b) => [
    b.category,
    b.estimated.toFixed(2),
    b.actual.toFixed(2),
    (b.estimated - b.actual).toFixed(2),
    b.status,
  ]);

  // Add totals row
  const totalEstimated = items.reduce((s, b) => s + b.estimated, 0);
  const totalActual = items.reduce((s, b) => s + b.actual, 0);
  rows.push(["TOTAL", totalEstimated.toFixed(2), totalActual.toFixed(2), (totalEstimated - totalActual).toFixed(2), ""]);

  const csv = generateCSV(headers, rows);
  const filename = `${safeFilename(project.name)}_budget_${safeDateStr()}.csv`;
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

// ---------------------------------------------------------------------------
// Contacts CSV
// ---------------------------------------------------------------------------

export function exportContactsCSV(contacts: ContactData[]): void {
  const headers = ["Name", "Role", "Phone", "Email", "WhatsApp", "Rating"];
  const rows = contacts.map((c) => [
    c.name,
    c.role,
    c.phone || "",
    c.email || "",
    c.whatsapp || "",
    String(c.rating),
  ]);

  const csv = generateCSV(headers, rows);
  downloadFile(csv, `contacts_${safeDateStr()}.csv`, "text/csv;charset=utf-8;");
}

// ---------------------------------------------------------------------------
// Daily Logs CSV
// ---------------------------------------------------------------------------

export function exportDailyLogsCSV(logs: DailyLogData[]): void {
  const headers = ["Date", "Day", "Weather", "Crew Size", "Notes"];
  const rows = logs.map((l) => [
    l.date,
    String(l.day),
    l.weather,
    String(l.crew),
    l.content,
  ]);

  const csv = generateCSV(headers, rows);
  downloadFile(csv, `daily_logs_${safeDateStr()}.csv`, "text/csv;charset=utf-8;");
}

// ---------------------------------------------------------------------------
// Full Project CSV (multi-section)
// ---------------------------------------------------------------------------

export function exportFullProjectCSV(project: ProjectData, data: ExportData): void {
  let output = "";

  // Project info section
  output += generateCSV(
    ["Field", "Value"],
    [
      ["Project Name", project.name],
      ["Market", project.market],
      ["Purpose", project.purpose],
      ["Property Type", project.propertyType],
      ["Current Phase", PHASE_LABELS[project.currentPhase] || project.phaseName],
      ["Progress", `${project.progress}%`],
      ["Total Budget", project.totalBudget.toFixed(2)],
      ["Total Spent", project.totalSpent.toFixed(2)],
      ["Remaining", (project.totalBudget - project.totalSpent).toFixed(2)],
      ["Week", `${project.currentWeek} of ${project.totalWeeks}`],
      ["Open Items", String(project.openItems)],
      ["Details", project.details],
    ]
  );
  output += "\n\n";

  // Budget section
  output += "BUDGET ITEMS\n";
  output += generateCSV(
    ["Category", "Estimated", "Actual", "Variance", "Status"],
    data.budgetItems.map((b) => [
      b.category,
      b.estimated.toFixed(2),
      b.actual.toFixed(2),
      (b.estimated - b.actual).toFixed(2),
      b.status,
    ])
  );
  output += "\n\n";

  // Contacts section
  output += "CONTACTS\n";
  output += generateCSV(
    ["Name", "Role", "Phone", "Email", "Rating"],
    data.contacts.map((c) => [c.name, c.role, c.phone || "", c.email || "", String(c.rating)])
  );
  output += "\n\n";

  // Daily logs section
  output += "DAILY LOGS\n";
  output += generateCSV(
    ["Date", "Day", "Weather", "Crew", "Content"],
    data.dailyLogs.map((l) => [l.date, String(l.day), l.weather, String(l.crew), l.content])
  );
  output += "\n\n";

  // Tasks section
  output += "TASKS\n";
  output += generateCSV(
    ["Task", "Status", "Done"],
    data.tasks.map((t) => [t.label, t.status, t.done ? "Yes" : "No"])
  );
  output += "\n\n";

  // Punch list section
  if (data.punchListItems.length > 0) {
    output += "PUNCH LIST\n";
    output += generateCSV(
      ["Description", "Trade", "Severity", "Status"],
      data.punchListItems.map((p) => [p.description, p.trade, p.severity, p.status])
    );
    output += "\n\n";
  }

  // Materials section
  if (data.materials.length > 0) {
    output += "MATERIALS\n";
    output += generateCSV(
      ["Name", "Ordered", "Delivered", "Unit Price", "Supplier", "Status"],
      data.materials.map((m) => [
        m.name,
        String(m.quantityOrdered),
        String(m.quantityDelivered),
        m.unitPrice.toFixed(2),
        m.supplier || "",
        m.status,
      ])
    );
  }

  const filename = `${safeFilename(project.name)}_full_export_${safeDateStr()}.csv`;
  downloadFile(output, filename, "text/csv;charset=utf-8;");
}

// ---------------------------------------------------------------------------
// JSON Export (full backup)
// ---------------------------------------------------------------------------

export function exportProjectJSON(project: ProjectData, data: ExportData): void {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    platform: "Keystone",
    project,
    budgetItems: data.budgetItems,
    contacts: data.contacts,
    dailyLogs: data.dailyLogs,
    documents: data.documents,
    photos: data.photos,
    tasks: data.tasks,
    inspectionResults: data.inspectionResults,
    punchListItems: data.punchListItems,
    materials: data.materials,
  };

  const json = JSON.stringify(backup, null, 2);
  const filename = `${safeFilename(project.name)}_backup_${safeDateStr()}.json`;
  downloadFile(json, filename, "application/json");
}
