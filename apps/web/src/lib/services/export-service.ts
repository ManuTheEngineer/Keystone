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
import type { FullProjectExportData } from "./export-data-gatherer";
import { getExportCSS } from "./export-styles";
import {
  renderCoverPage,
  renderAISummary,
  renderMetricGrid,
  renderBudgetTable,
  renderDonutChart,
  renderMaterialsTable,
  renderPhaseTimeline,
  renderContactsTable,
  renderDailyLogTable,
  renderInspectionResults,
  renderPunchListTable,
  renderPhotoGrid,
  renderRiskCards,
  renderFinancialProjections,
  renderDocumentInventory,
  renderTasksTable,
  renderDisclaimer,
} from "./export-components";

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

function openPrintWindow(htmlContent: string, _title: string): void {
  // Use a hidden iframe to avoid popup blockers
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    // Fallback: download as HTML file
    downloadFile(htmlContent, `${_title}.html`, "text/html");
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait for content to render then print
  setTimeout(() => {
    iframe.contentWindow?.print();
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
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
// PDF Export (full project report) — uses shared components
// ---------------------------------------------------------------------------

export function exportProjectPDF(exportData: FullProjectExportData): void {
  const { project, currency, financingSummary, phaseTimeline, riskAssessment,
    budgetItems, contacts, dailyLogs, tasks, photos, inspectionResults,
    punchListItems, materials, documents, vaultFiles } = exportData;

  const budgetUtilization =
    financingSummary.totalBudget > 0
      ? Math.round((financingSummary.totalSpent / financingSummary.totalBudget) * 100)
      : 0;
  const remaining = financingSummary.remaining;
  const openPunchCount = punchListItems.filter((p) => p.status !== "resolved").length;

  // Build donut chart categories from budget items
  const categoryMap = new Map<string, number>();
  for (const b of budgetItems) {
    categoryMap.set(b.category, (categoryMap.get(b.category) ?? 0) + b.actual);
  }
  const DONUT_COLORS = [
    "#2D6A4F", "#8B4513", "#1B4965", "#BC6C25", "#D4A574",
    "#9B2226", "#6B4226", "#3A3A3A", "#2563eb", "#7c3aed",
  ];
  const donutCategories = Array.from(categoryMap.entries())
    .filter(([, v]) => v > 0)
    .map(([label, value], i) => ({
      label,
      value,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));

  const sections: string[] = [];

  // 1. Cover page
  sections.push(renderCoverPage(project, "Full Project Report", exportData.orgLogo, exportData.generatedAt));

  // 2. AI Summary
  sections.push('<div class="page-break"></div>');
  sections.push("<h2>Executive Summary</h2>");
  sections.push(renderAISummary(exportData.aiSummary));

  // 3. Metric grid (6 metrics)
  sections.push(renderMetricGrid([
    { label: "Progress", value: `${project.progress}%` },
    { label: "Budget Used", value: `${budgetUtilization}%` },
    { label: "Remaining", value: fmtCurrency(remaining, project.currency) },
    { label: "Week", value: `${project.currentWeek}/${project.totalWeeks}` },
    { label: "Phase", value: PHASE_LABELS[project.currentPhase] || project.phaseName },
    { label: "Open Items", value: String(openPunchCount) },
  ], 6));

  // 4. Budget table
  sections.push('<div class="page-break"></div>');
  sections.push("<h2>Budget Breakdown</h2>");
  sections.push(renderBudgetTable(budgetItems, currency, true));

  // 5. Donut chart (budget by category)
  if (donutCategories.length > 0) {
    sections.push("<h3>Budget by Category</h3>");
    sections.push(renderDonutChart(
      donutCategories,
      fmtCurrency(financingSummary.totalSpent, project.currency)
    ));
  }

  // 6. Materials table
  if (materials.length > 0) {
    sections.push('<div class="page-break"></div>');
    sections.push("<h2>Materials Tracker</h2>");
    sections.push(renderMaterialsTable(materials, currency));
  }

  // 7. Phase timeline
  sections.push('<div class="page-break"></div>');
  sections.push("<h2>Phase Timeline</h2>");
  sections.push(renderPhaseTimeline(phaseTimeline));

  // 7b. Tasks table
  if (tasks.length > 0) {
    sections.push('<div class="page-break"></div>');
    sections.push(renderTasksTable(tasks));
  }

  // 8. Contacts table
  sections.push('<div class="page-break"></div>');
  sections.push("<h2>Team Roster</h2>");
  sections.push(renderContactsTable(contacts, true));

  // 9. Daily log table (limit 30)
  sections.push('<div class="page-break"></div>');
  sections.push("<h2>Daily Logs</h2>");
  sections.push(renderDailyLogTable(dailyLogs, 30));

  // 10. Inspection results
  if (inspectionResults.length > 0) {
    sections.push('<div class="page-break"></div>');
    sections.push("<h2>Inspection Results</h2>");
    sections.push(renderInspectionResults(inspectionResults));
  }

  // 11. Punch list
  if (punchListItems.length > 0) {
    sections.push('<div class="page-break"></div>');
    sections.push("<h2>Punch List</h2>");
    sections.push(renderPunchListTable(punchListItems));
  }

  // 12. Photo grid (limit 24, organized by phase)
  if (photos.length > 0) {
    sections.push('<div class="page-break"></div>');
    sections.push("<h2>Photo Gallery</h2>");
    sections.push(renderPhotoGrid(photos, 4, 24));
  }

  // 13. Risk cards
  sections.push('<div class="page-break"></div>');
  sections.push("<h2>Risk Assessment</h2>");
  sections.push(renderRiskCards(riskAssessment));

  // 14. Financial projections
  sections.push('<div class="page-break"></div>');
  sections.push("<h2>Financial Projections</h2>");
  sections.push(renderFinancialProjections(project, financingSummary, currency));

  // 15. Document inventory
  if (documents.length > 0 || vaultFiles.length > 0) {
    sections.push('<div class="page-break"></div>');
    sections.push("<h2>Document Inventory</h2>");
    sections.push(renderDocumentInventory(documents, vaultFiles));
  }

  // 16. Disclaimer
  sections.push('<div class="page-break"></div>');
  sections.push(renderDisclaimer());

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(project.name)} - Full Project Report</title>
  <style>${getExportCSS()}</style>
</head>
<body>
  ${sections.join("\n")}
</body>
</html>`;

  openPrintWindow(html, `${project.name} - Full Project Report`);
}

// ---------------------------------------------------------------------------
// Quick Summary PDF (1-2 pages) — uses shared components
// ---------------------------------------------------------------------------

export function exportQuickSummary(exportData: FullProjectExportData): void {
  const { project, currency, financingSummary, riskAssessment, budgetItems } = exportData;

  const budgetUtilization =
    financingSummary.totalBudget > 0
      ? Math.round((financingSummary.totalSpent / financingSummary.totalBudget) * 100)
      : 0;
  const openPunchCount = exportData.punchListItems.filter((p) => p.status !== "resolved").length;

  const sections: string[] = [];

  // Cover page
  sections.push(renderCoverPage(project, "Quick Summary", exportData.orgLogo, exportData.generatedAt));

  // Metric grid (4 metrics)
  sections.push('<div class="page-break"></div>');
  sections.push(renderMetricGrid([
    { label: "Progress", value: `${project.progress}%` },
    { label: "Budget Used", value: `${budgetUtilization}%` },
    { label: "Week", value: `${project.currentWeek}/${project.totalWeeks}` },
    { label: "Open Items", value: String(openPunchCount) },
  ], 4));

  // AI summary
  sections.push("<h2>Summary</h2>");
  sections.push(renderAISummary(exportData.aiSummary));

  // Budget summary table (top-level only, no full breakdown)
  sections.push("<h2>Budget Summary</h2>");
  sections.push(renderBudgetTable(budgetItems, currency, true));

  // Risk cards
  sections.push("<h2>Risk Assessment</h2>");
  sections.push(renderRiskCards(riskAssessment));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(project.name)} - Quick Summary</title>
  <style>${getExportCSS()}
    @page { size: letter; margin: 0.5in; }
  </style>
</head>
<body>
  ${sections.join("\n")}
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

// ---------------------------------------------------------------------------
// Deal Analysis PDF Export
// ---------------------------------------------------------------------------

interface AnalysisExportData {
  name: string;
  input: {
    goal: string;
    market: string;
    city: string;
    propertyType: string;
    sizeCategory: string;
    bedrooms: number;
    bathrooms: number;
    stories: number;
    features: string[];
    landOption: string;
    financingType: string;
    timelineMonths: number;
  };
  results: {
    dealScore: number;
    dealScoreSummary: string;
    totalCost: number;
    constructionCost: number;
    landCost: number;
    softCosts: number;
    financingCosts: number;
    contingency: number;
    monthlyCost: number;
    roi: number;
    dtiRatio: number | null;
    ltvRatio: number;
    costPerUnit: number;
    riskFlags: { level: string; title: string; detail: string }[];
  };
  currency: { code: string; symbol: string };
  sizeUnit: string;
  buildSize: number;
}

export function exportAnalysisPDF(data: AnalysisExportData): void {
  const { name, input, results, currency, sizeUnit, buildSize } = data;
  const sym = currency.symbol;
  const fmtNum = (n: number) => n.toLocaleString();

  const scoreColor = results.dealScore >= 80 ? "#2D6A4F" : results.dealScore >= 65 ? "#059669" : results.dealScore >= 50 ? "#BC6C25" : results.dealScore >= 35 ? "#EA580C" : "#9B2226";

  const sections: string[] = [];

  // Cover
  sections.push(`
    <div style="text-align:center; padding:40px 0 30px;">
      <h1 style="font-size:22px; color:#2C1810; margin:0;">Deal Analysis Report</h1>
      <p style="font-size:14px; color:#6A6A6A; margin:6px 0 0;">${name || "Untitled Analysis"}</p>
      <p style="font-size:11px; color:#999; margin:4px 0 0;">Generated ${new Date().toLocaleDateString()} by Keystone</p>
    </div>
  `);

  // Deal Score
  sections.push(`
    <div style="text-align:center; padding:20px; margin:0 auto 20px; max-width:300px; border:2px solid ${scoreColor}; border-radius:12px;">
      <div style="font-size:48px; font-weight:bold; color:${scoreColor};">${results.dealScore}</div>
      <div style="font-size:13px; font-weight:600; color:${scoreColor}; margin-bottom:6px;">${results.dealScore >= 80 ? "Strong Deal" : results.dealScore >= 65 ? "Good Deal" : results.dealScore >= 50 ? "Fair Deal" : results.dealScore >= 35 ? "Caution" : "High Risk"}</div>
      <div style="font-size:11px; color:#6A6A6A;">${results.dealScoreSummary}</div>
    </div>
  `);

  // Property Overview
  sections.push(`
    <h2 style="font-size:15px; color:#2C1810; border-bottom:1px solid #ddd; padding-bottom:6px;">Property Overview</h2>
    <table style="width:100%; font-size:12px; border-collapse:collapse; margin-bottom:16px;">
      <tr><td style="padding:4px 8px; color:#6A6A6A;">Goal</td><td style="padding:4px 8px; font-weight:500;">${input.goal}</td>
          <td style="padding:4px 8px; color:#6A6A6A;">Market</td><td style="padding:4px 8px; font-weight:500;">${input.market}</td></tr>
      <tr><td style="padding:4px 8px; color:#6A6A6A;">Location</td><td style="padding:4px 8px; font-weight:500;">${input.city || "Not specified"}</td>
          <td style="padding:4px 8px; color:#6A6A6A;">Type</td><td style="padding:4px 8px; font-weight:500;">${input.propertyType}</td></tr>
      <tr><td style="padding:4px 8px; color:#6A6A6A;">Size</td><td style="padding:4px 8px; font-weight:500;">${fmtNum(buildSize)} ${sizeUnit}</td>
          <td style="padding:4px 8px; color:#6A6A6A;">Bedrooms</td><td style="padding:4px 8px; font-weight:500;">${input.bedrooms}</td></tr>
      <tr><td style="padding:4px 8px; color:#6A6A6A;">Bathrooms</td><td style="padding:4px 8px; font-weight:500;">${input.bathrooms}</td>
          <td style="padding:4px 8px; color:#6A6A6A;">Stories</td><td style="padding:4px 8px; font-weight:500;">${input.stories}</td></tr>
      <tr><td style="padding:4px 8px; color:#6A6A6A;">Financing</td><td style="padding:4px 8px; font-weight:500;">${input.financingType || "Not specified"}</td>
          <td style="padding:4px 8px; color:#6A6A6A;">Timeline</td><td style="padding:4px 8px; font-weight:500;">${input.timelineMonths} months</td></tr>
    </table>
  `);

  // Cost Breakdown
  const costItems = [
    { label: "Construction", value: results.constructionCost },
    { label: "Land", value: results.landCost },
    { label: "Soft costs (permits, design)", value: results.softCosts },
    { label: "Contingency", value: results.contingency },
    ...(results.financingCosts > 0 ? [{ label: "Financing costs", value: results.financingCosts }] : []),
  ];
  sections.push(`
    <h2 style="font-size:15px; color:#2C1810; border-bottom:1px solid #ddd; padding-bottom:6px;">Cost Breakdown</h2>
    <table style="width:100%; font-size:12px; border-collapse:collapse; margin-bottom:8px;">
      ${costItems.map((c) => `<tr><td style="padding:4px 8px; color:#6A6A6A;">${c.label}</td><td style="padding:4px 8px; text-align:right; font-family:monospace;">${sym}${fmtNum(c.value)}</td></tr>`).join("")}
      <tr style="border-top:2px solid #2C1810; font-weight:bold;">
        <td style="padding:6px 8px;">Total Project Cost</td>
        <td style="padding:6px 8px; text-align:right; font-family:monospace;">${sym}${fmtNum(results.totalCost)}</td>
      </tr>
    </table>
  `);

  // Financial Metrics
  sections.push(`
    <h2 style="font-size:15px; color:#2C1810; border-bottom:1px solid #ddd; padding-bottom:6px;">Financial Metrics</h2>
    <table style="width:100%; font-size:12px; border-collapse:collapse; margin-bottom:16px;">
      <tr><td style="padding:4px 8px; color:#6A6A6A;">Cost per ${sizeUnit}</td><td style="padding:4px 8px; font-family:monospace;">${sym}${fmtNum(results.costPerUnit)}</td></tr>
      ${results.monthlyCost > 0 ? `<tr><td style="padding:4px 8px; color:#6A6A6A;">Monthly payment</td><td style="padding:4px 8px; font-family:monospace;">${sym}${fmtNum(results.monthlyCost)}</td></tr>` : ""}
      ${results.dtiRatio !== null ? `<tr><td style="padding:4px 8px; color:#6A6A6A;">Debt-to-income ratio</td><td style="padding:4px 8px; font-family:monospace; ${results.dtiRatio > 43 ? "color:#9B2226;" : ""}">${results.dtiRatio}%</td></tr>` : ""}
      <tr><td style="padding:4px 8px; color:#6A6A6A;">Loan-to-value ratio</td><td style="padding:4px 8px; font-family:monospace;">${results.ltvRatio}%</td></tr>
      ${results.roi !== 0 ? `<tr><td style="padding:4px 8px; color:#6A6A6A;">${input.goal === "rent" ? "Annual rental yield" : "Expected ROI"}</td><td style="padding:4px 8px; font-family:monospace; color:${results.roi > 0 ? "#2D6A4F" : "#9B2226"};">${results.roi}%</td></tr>` : ""}
    </table>
  `);

  // Risk Flags
  if (results.riskFlags.length > 0) {
    const flagColors: Record<string, string> = { critical: "#9B2226", warning: "#BC6C25", info: "#1B4965" };
    sections.push(`
      <h2 style="font-size:15px; color:#2C1810; border-bottom:1px solid #ddd; padding-bottom:6px;">Risk Analysis</h2>
      ${results.riskFlags.map((f) => `
        <div style="padding:8px 12px; margin-bottom:6px; border-left:3px solid ${flagColors[f.level] || "#999"}; background:#fafafa; border-radius:4px;">
          <div style="font-size:12px; font-weight:600; color:${flagColors[f.level] || "#333"};">${f.title}</div>
          <div style="font-size:11px; color:#6A6A6A; margin-top:2px;">${f.detail}</div>
        </div>
      `).join("")}
    `);
  }

  // Features
  if (input.features.length > 0) {
    sections.push(`
      <h2 style="font-size:15px; color:#2C1810; border-bottom:1px solid #ddd; padding-bottom:6px;">Selected Features</h2>
      <p style="font-size:12px; color:#3A3A3A;">${input.features.join(", ")}</p>
    `);
  }

  // Disclaimer
  sections.push(`
    <div style="margin-top:30px; padding:12px; background:#f5f5f5; border-radius:6px; font-size:10px; color:#999; line-height:1.5;">
      This report is for educational guidance only. Actual costs vary significantly by location,
      materials, labor availability, and market conditions. Consult licensed professionals before
      making financial commitments. Generated by Keystone (keystonebuild.vercel.app).
    </div>
  `);

  const css = getExportCSS();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Deal Analysis - ${name}</title><style>${css}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2C1810;max-width:700px;margin:0 auto;padding:20px;}</style></head><body>${sections.join("")}</body></html>`;

  openPrintWindow(html, `Deal Analysis - ${name || "Untitled"}`);
}
