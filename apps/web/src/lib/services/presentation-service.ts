/**
 * Presentation Service
 *
 * Generates HTML-based slide presentations from project data.
 * Each "slide" is a full-page section designed for print-to-PDF output.
 * Supports four presentation types: investor, team, progress, and budget.
 */

import type {
  ProjectData,
  BudgetItemData,
  ContactData,
  DailyLogData,
  TaskData,
  PhotoData,
  PunchListItemData,
} from "./project-service";
import type { CurrencyConfig } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresentationData {
  project: ProjectData;
  budgetItems: BudgetItemData[];
  contacts: ContactData[];
  dailyLogs: DailyLogData[];
  tasks: TaskData[];
  photos: PhotoData[];
  punchListItems: PunchListItemData[];
  currency: CurrencyConfig;
  marketName: string;
  constructionMethod: string;
}

export type PresentationType = "investor" | "team" | "progress" | "budget";

// ---------------------------------------------------------------------------
// Currency formatting (standalone, no external dependency for the HTML output)
// ---------------------------------------------------------------------------

function fmtCurrency(amount: number, cfg: CurrencyConfig): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  let formatted: string;
  if (cfg.decimals === 0) {
    formatted = Math.round(abs)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, cfg.groupSeparator);
  } else {
    const parts = abs.toFixed(cfg.decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, cfg.groupSeparator);
    formatted = parts.join(".");
  }
  if (cfg.position === "prefix") return `${sign}${cfg.symbol}${formatted}`;
  return `${sign}${formatted} ${cfg.symbol}`;
}

function fmtCompact(amount: number, cfg: CurrencyConfig): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  let compact: string;
  if (abs >= 1_000_000) {
    compact = `${(abs / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    compact = `${(abs / 1_000).toFixed(0)}K`;
  } else {
    return fmtCurrency(amount, cfg);
  }
  if (cfg.position === "prefix") return `${sign}${cfg.symbol}${compact}`;
  return `${sign}${compact} ${cfg.symbol}`;
}

function pct(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

// ---------------------------------------------------------------------------
// Shared CSS
// ---------------------------------------------------------------------------

const SHARED_CSS = `
  @page { margin: 0; size: letter; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #3A3A3A;
    font-size: 14px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h1, h2, h3 {
    font-family: Georgia, 'Times New Roman', serif;
    color: #2C1810;
    font-weight: normal;
  }
  .slide {
    width: 100%;
    min-height: 100vh;
    padding: 60px 80px;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    background: #FFFFFF;
  }
  .slide:last-child { page-break-after: auto; }
  .slide-header {
    border-top: 4px solid #059669;
    padding-top: 20px;
    margin-bottom: 40px;
  }
  .slide-header h2 {
    font-size: 28px;
    margin-bottom: 4px;
  }
  .slide-header .subtitle {
    font-size: 13px;
    color: #6A6A6A;
  }
  .slide-footer {
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #E0D5C8;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #6A6A6A;
  }
  .slide-body { flex: 1; }
  .cover-slide {
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .cover-slide .accent-line {
    width: 80px;
    height: 4px;
    background: #059669;
    margin: 0 auto 32px auto;
  }
  .cover-slide h1 {
    font-size: 42px;
    margin-bottom: 12px;
    line-height: 1.2;
  }
  .cover-slide .cover-subtitle {
    font-size: 18px;
    color: #6A6A6A;
    margin-bottom: 8px;
  }
  .cover-slide .cover-meta {
    font-size: 13px;
    color: #8B4513;
    margin-top: 20px;
  }
  .cover-slide .market-badge {
    display: inline-block;
    padding: 4px 16px;
    border: 1px solid #D4A574;
    border-radius: 20px;
    font-size: 12px;
    color: #8B4513;
    margin-top: 16px;
    letter-spacing: 0.5px;
  }
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 32px;
  }
  .metric-card {
    border: 1px solid #E0D5C8;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }
  .metric-card .metric-value {
    font-family: 'Courier New', monospace;
    font-size: 26px;
    font-weight: bold;
    color: #2C1810;
    margin-bottom: 4px;
  }
  .metric-card .metric-label {
    font-size: 11px;
    color: #6A6A6A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .metrics-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 32px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  th {
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6A6A6A;
    padding: 8px 12px;
    border-bottom: 2px solid #E0D5C8;
  }
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #F0E8DF;
    font-size: 13px;
  }
  tr:last-child td { border-bottom: none; }
  .td-right { text-align: right; font-family: 'Courier New', monospace; }
  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }
  .status-on-track { background: #2D6A4F; }
  .status-over { background: #9B2226; }
  .status-under { background: #1B4965; }
  .status-not-started { background: #D4A574; }
  .progress-bar-bg {
    width: 100%;
    height: 8px;
    background: #F0E8DF;
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: #059669;
    border-radius: 4px;
    transition: width 0.3s;
  }
  .phase-timeline {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
  }
  .phase-block {
    flex: 1;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .phase-done { background: #059669; color: white; }
  .phase-current { background: #2C1810; color: white; }
  .phase-upcoming { background: #F0E8DF; color: #6A6A6A; }
  .risk-card {
    border-left: 4px solid #BC6C25;
    background: #FFFBF5;
    padding: 14px 18px;
    margin-bottom: 12px;
    border-radius: 0 8px 8px 0;
  }
  .risk-card.critical { border-left-color: #9B2226; background: #FFF5F5; }
  .risk-card .risk-title {
    font-weight: 600;
    font-size: 14px;
    color: #2C1810;
    margin-bottom: 4px;
  }
  .risk-card .risk-body { font-size: 12px; color: #3A3A3A; }
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .photo-box {
    aspect-ratio: 4/3;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #E0D5C8;
    position: relative;
    background: #F5E6D3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .photo-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .photo-caption {
    font-size: 11px;
    color: #6A6A6A;
    margin-top: 6px;
    text-align: center;
  }
  .photo-placeholder {
    font-size: 12px;
    color: #8B4513;
    text-align: center;
    padding: 16px;
  }
  .item-list { list-style: none; padding: 0; }
  .item-list li {
    padding: 10px 0;
    border-bottom: 1px solid #F0E8DF;
    font-size: 13px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .item-list li:last-child { border-bottom: none; }
  .item-bullet {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #059669;
    margin-top: 6px;
    flex-shrink: 0;
  }
  .section-title {
    font-size: 18px;
    color: #2C1810;
    margin-bottom: 16px;
    font-family: Georgia, 'Times New Roman', serif;
  }
  .subsection {
    margin-bottom: 28px;
  }
  .note-block {
    background: #FDF8F0;
    border: 1px solid #E0D5C8;
    border-radius: 8px;
    padding: 16px;
    font-size: 13px;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  .thank-you-slide {
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .thank-you-slide h2 {
    font-size: 32px;
    margin-bottom: 16px;
  }
  .thank-you-slide p {
    font-size: 14px;
    color: #6A6A6A;
    margin-bottom: 4px;
  }
  .donut-container {
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 28px;
  }
  .budget-donut {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;
  }
  .budget-donut::after {
    content: '';
    width: 120px;
    height: 120px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 40px;
    left: 40px;
  }
  .legend { flex: 1; }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
  }
  .legend-swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .legend-label { flex: 1; color: #3A3A3A; }
  .legend-value { font-family: 'Courier New', monospace; color: #2C1810; font-weight: 600; }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .photo-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .highlight-number {
    font-family: 'Courier New', monospace;
    font-size: 20px;
    font-weight: bold;
    color: #059669;
  }
`;

// ---------------------------------------------------------------------------
// Slide building helpers
// ---------------------------------------------------------------------------

const PHASE_NAMES = ["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"];

const DONUT_COLORS = [
  "#2C1810", "#8B4513", "#059669", "#D4A574", "#1B4965",
  "#BC6C25", "#6B4226", "#2D6A4F", "#9B2226", "#3A3A3A",
];

function todayFormatted(): string {
  const d = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function slideOpen(slideNum: number, totalSlides: number, extraClass?: string): string {
  return `<div class="slide ${extraClass || ""}">`;
}

function slideFooter(slideNum: number, totalSlides: number): string {
  return `
    <div class="slide-footer">
      <span>Generated by Keystone</span>
      <span>${todayFormatted()}</span>
      <span>${slideNum} / ${totalSlides}</span>
    </div>
  </div>`;
}

function slideHeader(title: string, subtitle?: string): string {
  return `
    <div class="slide-header">
      <h2>${escHtml(title)}</h2>
      ${subtitle ? `<div class="subtitle">${escHtml(subtitle)}</div>` : ""}
    </div>
    <div class="slide-body">`;
}

function slideBodyClose(): string {
  return `</div>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDonutGradient(items: { label: string; value: number }[]): string {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return "background: #F0E8DF;";
  const segments: string[] = [];
  let cumulative = 0;
  items.forEach((item, idx) => {
    const startPct = (cumulative / total) * 100;
    cumulative += item.value;
    const endPct = (cumulative / total) * 100;
    segments.push(`${DONUT_COLORS[idx % DONUT_COLORS.length]} ${startPct.toFixed(1)}% ${endPct.toFixed(1)}%`);
  });
  return `background: conic-gradient(${segments.join(", ")});`;
}

function buildLegend(items: { label: string; value: number }[], cfg: CurrencyConfig): string {
  return items
    .map(
      (item, idx) => `
      <div class="legend-item">
        <div class="legend-swatch" style="background:${DONUT_COLORS[idx % DONUT_COLORS.length]};"></div>
        <span class="legend-label">${escHtml(item.label)}</span>
        <span class="legend-value">${fmtCompact(item.value, cfg)}</span>
      </div>`
    )
    .join("");
}

function buildPhaseTimeline(currentPhase: number): string {
  return `
    <div class="phase-timeline">
      ${PHASE_NAMES.map((name, idx) => {
        const phaseNum = idx;
        let cls = "phase-upcoming";
        if (phaseNum < currentPhase) cls = "phase-done";
        if (phaseNum === currentPhase) cls = "phase-current";
        return `<div class="phase-block ${cls}">${name}</div>`;
      }).join("")}
    </div>`;
}

function statusDot(status: string): string {
  const cls =
    status === "over" ? "status-over" :
    status === "under" ? "status-under" :
    status === "not-started" ? "status-not-started" :
    "status-on-track";
  return `<span class="status-dot ${cls}"></span>`;
}

// ---------------------------------------------------------------------------
// Investor Briefing (10 slides)
// ---------------------------------------------------------------------------

function generateInvestorBriefing(data: PresentationData): string {
  const { project: p, budgetItems, contacts, dailyLogs, tasks, photos, punchListItems, currency: cfg } = data;
  const totalSlides = 10;
  const remaining = p.totalBudget - p.totalSpent;
  const variance = remaining;
  const burnRate = p.currentWeek > 0 ? p.totalSpent / p.currentWeek : 0;
  const weeksRemaining = p.totalWeeks - p.currentWeek;

  const topCategories = [...budgetItems]
    .sort((a, b) => b.estimated - a.estimated)
    .slice(0, 5);

  const donutItems = topCategories.map((b) => ({ label: b.category, value: b.estimated }));
  const otherTotal = budgetItems
    .filter((b) => !topCategories.includes(b))
    .reduce((s, b) => s + b.estimated, 0);
  if (otherTotal > 0) donutItems.push({ label: "Other", value: otherTotal });

  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;

  const risks: { title: string; body: string; critical: boolean }[] = [];
  const overBudgetItems = budgetItems.filter((b) => b.status === "over");
  if (overBudgetItems.length > 0) {
    const overTotal = overBudgetItems.reduce((s, b) => b.actual - b.estimated, 0);
    risks.push({
      title: `${overBudgetItems.length} budget ${overBudgetItems.length === 1 ? "category" : "categories"} over budget`,
      body: `Categories exceeding estimates: ${overBudgetItems.map((b) => b.category).join(", ")}. Total overage: ${fmtCurrency(overTotal, cfg)}.`,
      critical: overTotal > p.totalBudget * 0.05,
    });
  }
  if (burnRate > 0 && weeksRemaining > 0) {
    const projectedTotal = p.totalSpent + burnRate * weeksRemaining;
    if (projectedTotal > p.totalBudget) {
      risks.push({
        title: "Budget burn rate exceeds plan",
        body: `At the current weekly spend of ${fmtCompact(burnRate, cfg)}/week, projected total cost is ${fmtCompact(projectedTotal, cfg)}, which exceeds the ${fmtCompact(p.totalBudget, cfg)} budget.`,
        critical: true,
      });
    }
  }
  const criticalPunch = punchListItems.filter((pl) => pl.severity === "critical" && pl.status !== "resolved");
  if (criticalPunch.length > 0) {
    risks.push({
      title: `${criticalPunch.length} critical punch list ${criticalPunch.length === 1 ? "item" : "items"} open`,
      body: criticalPunch.map((pl) => pl.description).join("; "),
      critical: true,
    });
  }
  if (risks.length === 0) {
    risks.push({ title: "No significant risks identified", body: "Project is tracking within acceptable tolerances.", critical: false });
  }

  const tradesHired = new Set(contacts.map((c) => c.role)).size;
  const recentPhotos = [...photos].slice(-4);

  let slides = "";

  // Slide 1: Cover
  slides += slideOpen(1, totalSlides, "cover-slide");
  slides += `
    <div class="accent-line"></div>
    <h1>${escHtml(p.name)}</h1>
    <div class="cover-subtitle">Investment Briefing</div>
    <div class="cover-meta">${escHtml(p.phaseName)} | ${p.progress}% Complete</div>
    <div class="market-badge">${escHtml(data.marketName)} Market</div>
  `;
  slides += slideFooter(1, totalSlides);

  // Slide 2: Executive Summary
  slides += slideOpen(2, totalSlides);
  slides += slideHeader("Executive Summary");
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(p.totalBudget, cfg)}</div>
        <div class="metric-label">Total Budget</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(p.totalSpent, cfg)}</div>
        <div class="metric-label">Spent to Date</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${p.progress}%</div>
        <div class="metric-label">Progress</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${p.currentWeek}/${p.totalWeeks}</div>
        <div class="metric-label">Weeks Elapsed</div>
      </div>
    </div>
    <div class="note-block">
      ${escHtml(p.name)} is a ${escHtml(p.propertyType)} project in the ${escHtml(data.marketName)} market, currently in ${escHtml(p.phaseName)}.
      The project is ${p.progress}% complete with ${fmtCurrency(remaining, cfg)} remaining in the budget.
      Construction method: ${escHtml(data.constructionMethod)}.
      ${p.details ? `Project details: ${escHtml(p.details)}.` : ""}
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(2, totalSlides);

  // Slide 3: Budget Overview
  slides += slideOpen(3, totalSlides);
  slides += slideHeader("Budget Overview");
  slides += `
    <div class="donut-container">
      <div class="budget-donut" style="${buildDonutGradient(donutItems)}"></div>
      <div class="legend">
        ${buildLegend(donutItems, cfg)}
      </div>
    </div>
    <table>
      <thead><tr><th>Category</th><th style="text-align:right">Estimated</th><th style="text-align:right">Actual</th><th style="text-align:right">Variance</th></tr></thead>
      <tbody>
        ${topCategories
          .map(
            (b) => `<tr>
              <td>${statusDot(b.status)}${escHtml(b.category)}</td>
              <td class="td-right">${fmtCurrency(b.estimated, cfg)}</td>
              <td class="td-right">${fmtCurrency(b.actual, cfg)}</td>
              <td class="td-right">${fmtCurrency(b.estimated - b.actual, cfg)}</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
  slides += slideBodyClose();
  slides += slideFooter(3, totalSlides);

  // Slide 4: Timeline Status
  slides += slideOpen(4, totalSlides);
  slides += slideHeader("Timeline Status");
  slides += buildPhaseTimeline(p.currentPhase);
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${escHtml(p.phaseName.replace(/^Phase \d+: ?/, ""))}</div>
        <div class="metric-label">Current Phase</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${p.currentWeek}</div>
        <div class="metric-label">Weeks Elapsed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${weeksRemaining > 0 ? weeksRemaining : "N/A"}</div>
        <div class="metric-label">Weeks Remaining</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${completedTasks}/${totalTasks}</div>
        <div class="metric-label">Tasks Done</div>
      </div>
    </div>
    <div class="subsection">
      <div class="section-title">Progress</div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
      <div style="text-align:right;font-size:12px;color:#6A6A6A;margin-top:4px;">${p.progress}% complete</div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(4, totalSlides);

  // Slide 5: Financial Projections
  slides += slideOpen(5, totalSlides);
  slides += slideHeader("Financial Projections");
  slides += `<div class="subsection">`;
  if (p.purpose === "RENT") {
    const estimatedMonthlyRent = p.totalBudget * 0.008;
    const annualRent = estimatedMonthlyRent * 12;
    const capRate = p.totalBudget > 0 ? (annualRent / p.totalBudget) * 100 : 0;
    slides += `
      <div class="section-title">Rental Yield Analysis</div>
      <div class="metrics-grid-2">
        <div class="metric-card">
          <div class="metric-value">${fmtCurrency(estimatedMonthlyRent, cfg)}</div>
          <div class="metric-label">Est. Monthly Rent</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${capRate.toFixed(1)}%</div>
          <div class="metric-label">Cap Rate</div>
        </div>
      </div>
      <div class="note-block">
        Based on typical market yields for ${escHtml(p.propertyType)} properties in the ${escHtml(data.marketName)} market.
        Estimated annual gross income: ${fmtCurrency(annualRent, cfg)}.
        Break-even timeline depends on vacancy rates, maintenance costs, and financing terms.
        Consult a licensed financial advisor for detailed investment analysis.
      </div>
    `;
  } else if (p.purpose === "SELL") {
    const lowEstimate = p.totalBudget * 1.1;
    const highEstimate = p.totalBudget * 1.35;
    slides += `
      <div class="section-title">Sale Price Estimate</div>
      <div class="metrics-grid-2">
        <div class="metric-card">
          <div class="metric-value">${fmtCompact(lowEstimate, cfg)}</div>
          <div class="metric-label">Conservative Estimate</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${fmtCompact(highEstimate, cfg)}</div>
          <div class="metric-label">Optimistic Estimate</div>
        </div>
      </div>
      <div class="note-block">
        Estimated sale price range based on total project cost plus typical builder margins.
        Actual sale price depends on local market conditions, comparable sales, and property finishes.
        Consult a licensed real estate professional for a formal appraisal.
      </div>
    `;
  } else {
    slides += `
      <div class="section-title">Total Cost of Ownership</div>
      <div class="metrics-grid-2">
        <div class="metric-card">
          <div class="metric-value">${fmtCompact(p.totalBudget, cfg)}</div>
          <div class="metric-label">Construction Cost</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${fmtCompact(remaining, cfg)}</div>
          <div class="metric-label">Remaining to Fund</div>
        </div>
      </div>
      <div class="note-block">
        Total construction cost covers all phases from site preparation through final finishes and occupancy.
        Additional costs to consider: property taxes, insurance, utility connections, landscaping, and furnishing.
      </div>
    `;
  }
  slides += `</div>`;
  slides += slideBodyClose();
  slides += slideFooter(5, totalSlides);

  // Slide 6: Risk Assessment
  slides += slideOpen(6, totalSlides);
  slides += slideHeader("Risk Assessment");
  slides += risks
    .slice(0, 3)
    .map(
      (r) => `
      <div class="risk-card ${r.critical ? "critical" : ""}">
        <div class="risk-title">${escHtml(r.title)}</div>
        <div class="risk-body">${escHtml(r.body)}</div>
      </div>`
    )
    .join("");
  if (burnRate > 0) {
    slides += `
      <div class="subsection" style="margin-top:24px;">
        <div class="section-title">Budget Burn Rate</div>
        <div class="note-block">
          Weekly average spend: ${fmtCurrency(burnRate, cfg)}/week over ${p.currentWeek} weeks.
          Budget utilization: ${pct(p.totalSpent, p.totalBudget)} of total budget consumed.
        </div>
      </div>
    `;
  }
  slides += slideBodyClose();
  slides += slideFooter(6, totalSlides);

  // Slide 7: Team
  slides += slideOpen(7, totalSlides);
  slides += slideHeader("Team Overview");
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${contacts.length}</div>
        <div class="metric-label">Total Contacts</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${tradesHired}</div>
        <div class="metric-label">Trades Hired</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${contacts.filter((c) => c.rating >= 4.5).length}</div>
        <div class="metric-label">Top Rated (4.5+)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${contacts.length > 0 ? (contacts.reduce((s, c) => s + c.rating, 0) / contacts.length).toFixed(1) : "N/A"}</div>
        <div class="metric-label">Avg Rating</div>
      </div>
    </div>
    <table>
      <thead><tr><th>Name</th><th>Trade/Role</th><th>Rating</th></tr></thead>
      <tbody>
        ${contacts
          .slice(0, 8)
          .map(
            (c) => `<tr>
              <td>${escHtml(c.name)}</td>
              <td>${escHtml(c.role)}</td>
              <td>${c.rating.toFixed(1)}</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
  slides += slideBodyClose();
  slides += slideFooter(7, totalSlides);

  // Slide 8: Next Steps
  slides += slideOpen(8, totalSlides);
  slides += slideHeader("Next Steps");
  const upcomingTasks = tasks.filter((t) => !t.done).slice(0, 5);
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").slice(0, 3);
  slides += `
    <div class="subsection">
      <div class="section-title">In Progress</div>
      <ul class="item-list">
        ${inProgressTasks.length > 0
          ? inProgressTasks.map((t) => `<li><div class="item-bullet" style="background:#BC6C25;"></div>${escHtml(t.label)}</li>`).join("")
          : `<li><div class="item-bullet"></div>No tasks currently in progress</li>`}
      </ul>
    </div>
    <div class="subsection">
      <div class="section-title">Upcoming Priorities</div>
      <ul class="item-list">
        ${upcomingTasks.length > 0
          ? upcomingTasks.map((t) => `<li><div class="item-bullet"></div>${escHtml(t.label)}</li>`).join("")
          : `<li><div class="item-bullet"></div>No upcoming tasks defined</li>`}
      </ul>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(8, totalSlides);

  // Slide 9: Photo Evidence
  slides += slideOpen(9, totalSlides);
  slides += slideHeader("Photo Evidence");
  slides += `<div class="photo-grid">`;
  if (recentPhotos.length > 0) {
    for (const photo of recentPhotos) {
      if (photo.fileUrl) {
        slides += `
          <div>
            <div class="photo-box"><img src="${escHtml(photo.fileUrl)}" alt="${escHtml(photo.caption || "Construction photo")}" /></div>
            <div class="photo-caption">${escHtml(photo.caption || photo.phase)} | ${escHtml(photo.date)}</div>
          </div>`;
      } else {
        slides += `
          <div>
            <div class="photo-box"><div class="photo-placeholder">${escHtml(photo.caption || photo.phase)}<br/>${escHtml(photo.date)}</div></div>
            <div class="photo-caption">${escHtml(photo.caption || "Photo pending upload")}</div>
          </div>`;
      }
    }
  } else {
    for (let i = 0; i < 4; i++) {
      slides += `
        <div>
          <div class="photo-box"><div class="photo-placeholder">No photos uploaded yet</div></div>
          <div class="photo-caption">Photo ${i + 1}</div>
        </div>`;
    }
  }
  slides += `</div>`;
  slides += slideBodyClose();
  slides += slideFooter(9, totalSlides);

  // Slide 10: Thank You
  slides += slideOpen(10, totalSlides, "cover-slide thank-you-slide");
  slides += `
    <div class="accent-line"></div>
    <h2>Thank you for your consideration</h2>
    <p>${escHtml(p.name)}</p>
    <p style="margin-top:12px;color:#8B4513;">${escHtml(data.marketName)} Market | ${escHtml(p.propertyType)}</p>
    <p style="margin-top:24px;font-size:12px;">For questions or additional information, please contact the project owner.</p>
  `;
  slides += slideFooter(10, totalSlides);

  return wrapHtml(`${p.name} - Investment Briefing`, slides);
}

// ---------------------------------------------------------------------------
// Team Briefing (9 slides)
// ---------------------------------------------------------------------------

function generateTeamBriefing(data: PresentationData): string {
  const { project: p, budgetItems, contacts, dailyLogs, tasks, punchListItems, currency: cfg } = data;
  const totalSlides = 9;
  const remaining = p.totalBudget - p.totalSpent;

  // Determine "this week" logs (last 7 entries as approximation)
  const recentLogs = dailyLogs.slice(0, 7);
  const totalCrew = recentLogs.reduce((s, l) => s + l.crew, 0);
  const weatherSummary = recentLogs.length > 0
    ? recentLogs.map((l) => l.weather).filter((w, i, a) => a.indexOf(w) === i).join(", ")
    : "No data";

  let slides = "";

  // Slide 1: Cover
  slides += slideOpen(1, totalSlides, "cover-slide");
  slides += `
    <div class="accent-line"></div>
    <h1>${escHtml(p.name)}</h1>
    <div class="cover-subtitle">Team Briefing</div>
    <div class="cover-meta">${todayFormatted()}</div>
  `;
  slides += slideFooter(1, totalSlides);

  // Slide 2: Current Status
  slides += slideOpen(2, totalSlides);
  slides += slideHeader("Current Status");
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${escHtml(p.phaseName.replace(/^Phase \d+: ?/, ""))}</div>
        <div class="metric-label">Current Phase</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${p.progress}%</div>
        <div class="metric-label">Progress</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${pct(p.totalSpent, p.totalBudget)}</div>
        <div class="metric-label">Budget Used</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(remaining, cfg)}</div>
        <div class="metric-label">Remaining</div>
      </div>
    </div>
    ${buildPhaseTimeline(p.currentPhase)}
    ${p.subPhase ? `<div class="note-block">Current sub-phase: ${escHtml(p.subPhase)}</div>` : ""}
  `;
  slides += slideBodyClose();
  slides += slideFooter(2, totalSlides);

  // Slide 3: This Week's Activity
  slides += slideOpen(3, totalSlides);
  slides += slideHeader("This Week's Activity");
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${recentLogs.length}</div>
        <div class="metric-label">Log Entries</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${totalCrew}</div>
        <div class="metric-label">Total Crew Days</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${recentLogs.length > 0 ? Math.round(totalCrew / recentLogs.length) : 0}</div>
        <div class="metric-label">Avg Daily Crew</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="font-size:14px;">${escHtml(weatherSummary.substring(0, 30))}</div>
        <div class="metric-label">Weather</div>
      </div>
    </div>
    <div class="subsection">
      <div class="section-title">Recent Log Entries</div>
      <ul class="item-list">
        ${recentLogs.slice(0, 4).map((l) => `
          <li>
            <div class="item-bullet"></div>
            <div>
              <div style="font-weight:600;font-size:12px;color:#2C1810;">Day ${l.day} | ${escHtml(l.date)}</div>
              <div style="font-size:12px;margin-top:2px;">${escHtml(l.content.substring(0, 180))}${l.content.length > 180 ? "..." : ""}</div>
            </div>
          </li>`).join("")}
        ${recentLogs.length === 0 ? `<li><div class="item-bullet"></div>No daily logs recorded this period</li>` : ""}
      </ul>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(3, totalSlides);

  // Slide 4: Active Tasks
  slides += slideOpen(4, totalSlides);
  slides += slideHeader("Active Tasks");
  const inProgress = tasks.filter((t) => t.status === "in-progress");
  const upcoming = tasks.filter((t) => t.status === "upcoming").slice(0, 5);
  const done = tasks.filter((t) => t.done);
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${done.length}</div>
        <div class="metric-label">Completed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${inProgress.length}</div>
        <div class="metric-label">In Progress</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${upcoming.length}</div>
        <div class="metric-label">Upcoming</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${tasks.length}</div>
        <div class="metric-label">Total</div>
      </div>
    </div>
    <div class="two-col">
      <div class="subsection">
        <div class="section-title">In Progress</div>
        <ul class="item-list">
          ${inProgress.map((t) => `<li><div class="item-bullet" style="background:#BC6C25;"></div>${escHtml(t.label)}</li>`).join("")}
          ${inProgress.length === 0 ? `<li><div class="item-bullet"></div>None</li>` : ""}
        </ul>
      </div>
      <div class="subsection">
        <div class="section-title">Upcoming</div>
        <ul class="item-list">
          ${upcoming.map((t) => `<li><div class="item-bullet"></div>${escHtml(t.label)}</li>`).join("")}
          ${upcoming.length === 0 ? `<li><div class="item-bullet"></div>None</li>` : ""}
        </ul>
      </div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(4, totalSlides);

  // Slide 5: Budget Check
  slides += slideOpen(5, totalSlides);
  slides += slideHeader("Budget Check");
  const overItems = budgetItems.filter((b) => b.status === "over");
  const underItems = budgetItems.filter((b) => b.status === "under");
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(p.totalBudget, cfg)}</div>
        <div class="metric-label">Total Budget</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(p.totalSpent, cfg)}</div>
        <div class="metric-label">Spent</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(remaining, cfg)}</div>
        <div class="metric-label">Remaining</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${pct(p.totalSpent, p.totalBudget)}</div>
        <div class="metric-label">Utilization</div>
      </div>
    </div>
    <div class="two-col">
      <div class="subsection">
        <div class="section-title">Over Budget (${overItems.length})</div>
        ${overItems.length > 0
          ? `<table>
              <thead><tr><th>Category</th><th style="text-align:right">Overage</th></tr></thead>
              <tbody>${overItems.map((b) => `<tr><td>${statusDot("over")}${escHtml(b.category)}</td><td class="td-right">${fmtCurrency(b.actual - b.estimated, cfg)}</td></tr>`).join("")}</tbody>
            </table>`
          : `<div class="note-block">No categories over budget</div>`}
      </div>
      <div class="subsection">
        <div class="section-title">Under Budget (${underItems.length})</div>
        ${underItems.length > 0
          ? `<table>
              <thead><tr><th>Category</th><th style="text-align:right">Savings</th></tr></thead>
              <tbody>${underItems.map((b) => `<tr><td>${statusDot("under")}${escHtml(b.category)}</td><td class="td-right">${fmtCurrency(b.estimated - b.actual, cfg)}</td></tr>`).join("")}</tbody>
            </table>`
          : `<div class="note-block">No categories under budget</div>`}
      </div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(5, totalSlides);

  // Slide 6: Inspections Due
  slides += slideOpen(6, totalSlides);
  slides += slideHeader("Inspections Due");
  const inspectionTasks = tasks.filter(
    (t) => !t.done && (t.label.toLowerCase().includes("inspection") || t.label.toLowerCase().includes("inspect"))
  );
  slides += `
    <div class="subsection">
      <div class="section-title">Upcoming Inspections</div>
      <ul class="item-list">
        ${inspectionTasks.length > 0
          ? inspectionTasks.map((t) => `<li><div class="item-bullet" style="background:#BC6C25;"></div>${escHtml(t.label)}</li>`).join("")
          : `<li><div class="item-bullet"></div>No inspections currently scheduled in the task list</li>`}
      </ul>
    </div>
    <div class="note-block">
      Review local inspection requirements for the current phase.
      Ensure all rough-in work is accessible and uncovered before scheduling inspections.
      Have approved plans and permits available on site for the inspector.
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(6, totalSlides);

  // Slide 7: Issues and Risks
  slides += slideOpen(7, totalSlides);
  slides += slideHeader("Issues and Risks");
  const openPunch = punchListItems.filter((pl) => pl.status !== "resolved");
  slides += `
    <div class="subsection">
      <div class="section-title">Open Punch List Items (${openPunch.length})</div>
      ${openPunch.length > 0
        ? openPunch.slice(0, 6).map((pl) => `
          <div class="risk-card ${pl.severity === "critical" ? "critical" : ""}">
            <div class="risk-title">${escHtml(pl.description)}</div>
            <div class="risk-body">Trade: ${escHtml(pl.trade)} | Severity: ${escHtml(pl.severity)} | Status: ${escHtml(pl.status)}</div>
          </div>`).join("")
        : `<div class="note-block">No open punch list items. All issues resolved.</div>`}
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(7, totalSlides);

  // Slide 8: Schedule Look-Ahead
  slides += slideOpen(8, totalSlides);
  slides += slideHeader("Schedule Look-Ahead");
  const allUpcoming = tasks.filter((t) => !t.done).slice(0, 8);
  slides += `
    <div class="subsection">
      <div class="section-title">Next 2 to 4 Weeks</div>
      <table>
        <thead><tr><th>#</th><th>Task</th><th>Status</th></tr></thead>
        <tbody>
          ${allUpcoming.map((t, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${escHtml(t.label)}</td>
              <td>${escHtml(t.status)}</td>
            </tr>`).join("")}
          ${allUpcoming.length === 0 ? `<tr><td colspan="3">No upcoming tasks defined</td></tr>` : ""}
        </tbody>
      </table>
    </div>
    <div class="note-block">
      Coordinate trade scheduling to avoid conflicts.
      Confirm material deliveries at least one week ahead of planned installation dates.
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(8, totalSlides);

  // Slide 9: Safety / Notes
  slides += slideOpen(9, totalSlides);
  slides += slideHeader("Safety and Notes");
  slides += `
    <div class="subsection">
      <div class="section-title">General Notes</div>
      <div class="note-block">
        ${recentLogs.length > 0
          ? `Latest log (Day ${recentLogs[0].day}): ${escHtml(recentLogs[0].content.substring(0, 300))}${recentLogs[0].content.length > 300 ? "..." : ""}`
          : "No recent daily log entries available."}
      </div>
    </div>
    <div class="subsection">
      <div class="section-title">Weather Conditions</div>
      <div class="note-block">
        Recent conditions: ${escHtml(weatherSummary)}.
        Plan outdoor work around weather forecasts. Protect exposed materials from moisture.
      </div>
    </div>
    <div class="subsection">
      <div class="section-title">Safety Reminders</div>
      <ul class="item-list">
        <li><div class="item-bullet"></div>Maintain clear walkways and work areas at all times</li>
        <li><div class="item-bullet"></div>Verify all electrical circuits are de-energized before work begins</li>
        <li><div class="item-bullet"></div>Personal protective equipment required on site at all times</li>
        <li><div class="item-bullet"></div>Report hazards immediately to the project lead</li>
      </ul>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(9, totalSlides);

  return wrapHtml(`${p.name} - Team Briefing`, slides);
}

// ---------------------------------------------------------------------------
// Progress Report (7 slides)
// ---------------------------------------------------------------------------

function generateProgressReport(data: PresentationData): string {
  const { project: p, budgetItems, dailyLogs, tasks, photos, currency: cfg } = data;
  const totalSlides = 7;
  const remaining = p.totalBudget - p.totalSpent;
  const recentPhotos = [...photos].slice(-6);
  const completedTasks = tasks.filter((t) => t.done);
  const upcomingTasks = tasks.filter((t) => !t.done).slice(0, 5);

  let slides = "";

  // Slide 1: Cover
  slides += slideOpen(1, totalSlides, "cover-slide");
  slides += `
    <div class="accent-line"></div>
    <h1>${escHtml(p.name)}</h1>
    <div class="cover-subtitle">Progress Report</div>
    <div class="cover-meta">${todayFormatted()}</div>
    <div class="market-badge">${escHtml(data.marketName)} Market</div>
  `;
  slides += slideFooter(1, totalSlides);

  // Slide 2: Dashboard
  slides += slideOpen(2, totalSlides);
  slides += slideHeader("Dashboard");
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${p.progress}%</div>
        <div class="metric-label">Overall Progress</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(p.totalSpent, cfg)}</div>
        <div class="metric-label">Total Spent</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(remaining, cfg)}</div>
        <div class="metric-label">Remaining</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">Week ${p.currentWeek}</div>
        <div class="metric-label">of ${p.totalWeeks}</div>
      </div>
    </div>
    <div class="subsection">
      <div style="margin-bottom:8px;font-size:12px;color:#6A6A6A;">Overall Progress</div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
      <div style="text-align:right;font-size:11px;color:#6A6A6A;margin-top:4px;">${p.progress}%</div>
    </div>
    <div class="subsection">
      <div style="margin-bottom:8px;font-size:12px;color:#6A6A6A;">Budget Utilization</div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${p.totalBudget > 0 ? Math.round((p.totalSpent / p.totalBudget) * 100) : 0}%;background:#8B4513;"></div></div>
      <div style="text-align:right;font-size:11px;color:#6A6A6A;margin-top:4px;">${pct(p.totalSpent, p.totalBudget)} spent</div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(2, totalSlides);

  // Slide 3: Phase Progress
  slides += slideOpen(3, totalSlides);
  slides += slideHeader("Phase Progress");
  slides += buildPhaseTimeline(p.currentPhase);
  slides += `
    <div class="note-block">
      Currently in <strong>${escHtml(p.phaseName)}</strong>.
      ${p.subPhase ? `Sub-phase: ${escHtml(p.subPhase)}.` : ""}
      ${p.completedPhases} of ${PHASE_NAMES.length} phases completed.
      ${p.details ? `Project: ${escHtml(p.details)}.` : ""}
    </div>
    <div class="subsection" style="margin-top:24px;">
      <div class="section-title">Task Completion</div>
      <div class="metrics-grid-2">
        <div class="metric-card">
          <div class="metric-value">${completedTasks.length}/${tasks.length}</div>
          <div class="metric-label">Tasks Completed</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</div>
          <div class="metric-label">Task Completion Rate</div>
        </div>
      </div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(3, totalSlides);

  // Slide 4: Budget vs Plan
  slides += slideOpen(4, totalSlides);
  slides += slideHeader("Budget vs Plan");
  slides += `
    <table>
      <thead><tr><th>Category</th><th style="text-align:right">Estimated</th><th style="text-align:right">Actual</th><th style="text-align:right">Variance</th><th>Status</th></tr></thead>
      <tbody>
        ${budgetItems.map((b) => `
          <tr>
            <td>${escHtml(b.category)}</td>
            <td class="td-right">${fmtCurrency(b.estimated, cfg)}</td>
            <td class="td-right">${fmtCurrency(b.actual, cfg)}</td>
            <td class="td-right">${fmtCurrency(b.estimated - b.actual, cfg)}</td>
            <td>${statusDot(b.status)}${escHtml(b.status)}</td>
          </tr>`).join("")}
        <tr style="font-weight:600;border-top:2px solid #E0D5C8;">
          <td>Total</td>
          <td class="td-right">${fmtCurrency(budgetItems.reduce((s, b) => s + b.estimated, 0), cfg)}</td>
          <td class="td-right">${fmtCurrency(budgetItems.reduce((s, b) => s + b.actual, 0), cfg)}</td>
          <td class="td-right">${fmtCurrency(budgetItems.reduce((s, b) => s + (b.estimated - b.actual), 0), cfg)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  `;
  slides += slideBodyClose();
  slides += slideFooter(4, totalSlides);

  // Slide 5: Photo Gallery
  slides += slideOpen(5, totalSlides);
  slides += slideHeader("Photo Gallery");
  slides += `<div class="photo-grid-3">`;
  if (recentPhotos.length > 0) {
    for (const photo of recentPhotos) {
      if (photo.fileUrl) {
        slides += `
          <div>
            <div class="photo-box"><img src="${escHtml(photo.fileUrl)}" alt="${escHtml(photo.caption || "Photo")}" /></div>
            <div class="photo-caption">${escHtml(photo.caption || photo.phase)} | ${escHtml(photo.date)}</div>
          </div>`;
      } else {
        slides += `
          <div>
            <div class="photo-box"><div class="photo-placeholder">${escHtml(photo.caption || photo.phase)}</div></div>
            <div class="photo-caption">${escHtml(photo.date)}</div>
          </div>`;
      }
    }
  } else {
    for (let i = 0; i < 6; i++) {
      slides += `
        <div>
          <div class="photo-box"><div class="photo-placeholder">No photos uploaded</div></div>
        </div>`;
    }
  }
  slides += `</div>`;
  slides += slideBodyClose();
  slides += slideFooter(5, totalSlides);

  // Slide 6: Milestones
  slides += slideOpen(6, totalSlides);
  slides += slideHeader("Milestones");
  slides += `
    <div class="two-col">
      <div class="subsection">
        <div class="section-title">Completed (${completedTasks.length})</div>
        <ul class="item-list">
          ${completedTasks.slice(0, 8).map((t) => `<li><div class="item-bullet"></div>${escHtml(t.label)}</li>`).join("")}
          ${completedTasks.length === 0 ? `<li><div class="item-bullet"></div>None completed yet</li>` : ""}
          ${completedTasks.length > 8 ? `<li><div class="item-bullet"></div>... and ${completedTasks.length - 8} more</li>` : ""}
        </ul>
      </div>
      <div class="subsection">
        <div class="section-title">Upcoming (${upcomingTasks.length})</div>
        <ul class="item-list">
          ${upcomingTasks.map((t) => `<li><div class="item-bullet" style="background:#D4A574;"></div>${escHtml(t.label)}</li>`).join("")}
          ${upcomingTasks.length === 0 ? `<li><div class="item-bullet"></div>No upcoming tasks</li>` : ""}
        </ul>
      </div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(6, totalSlides);

  // Slide 7: Daily Log Summary
  slides += slideOpen(7, totalSlides);
  slides += slideHeader("Daily Log Summary");
  const logEntries = dailyLogs.slice(0, 5);
  slides += `
    <table>
      <thead><tr><th>Day</th><th>Date</th><th>Weather</th><th>Crew</th><th>Summary</th></tr></thead>
      <tbody>
        ${logEntries.map((l) => `
          <tr>
            <td>${l.day}</td>
            <td>${escHtml(l.date)}</td>
            <td>${escHtml(l.weather)}</td>
            <td>${l.crew}</td>
            <td style="max-width:300px;">${escHtml(l.content.substring(0, 120))}${l.content.length > 120 ? "..." : ""}</td>
          </tr>`).join("")}
        ${logEntries.length === 0 ? `<tr><td colspan="5">No daily logs recorded</td></tr>` : ""}
      </tbody>
    </table>
  `;
  slides += slideBodyClose();
  slides += slideFooter(7, totalSlides);

  return wrapHtml(`${p.name} - Progress Report`, slides);
}

// ---------------------------------------------------------------------------
// Budget Report (7 slides)
// ---------------------------------------------------------------------------

function generateBudgetReport(data: PresentationData): string {
  const { project: p, budgetItems, punchListItems, currency: cfg } = data;
  const totalSlides = 7;
  const totalEstimated = budgetItems.reduce((s, b) => s + b.estimated, 0);
  const totalActual = budgetItems.reduce((s, b) => s + b.actual, 0);
  const totalVariance = totalEstimated - totalActual;
  const remaining = p.totalBudget - p.totalSpent;

  const overItems = budgetItems.filter((b) => b.status === "over");
  const contingencyItem = budgetItems.find((b) => b.category.toLowerCase().includes("contingency"));
  const burnRate = p.currentWeek > 0 ? p.totalSpent / p.currentWeek : 0;
  const weeksRemaining = p.totalWeeks - p.currentWeek;

  const donutItems = budgetItems
    .filter((b) => b.estimated > 0)
    .sort((a, b) => b.estimated - a.estimated)
    .map((b) => ({ label: b.category, value: b.estimated }));

  let slides = "";

  // Slide 1: Cover
  slides += slideOpen(1, totalSlides, "cover-slide");
  slides += `
    <div class="accent-line"></div>
    <h1>${escHtml(p.name)}</h1>
    <div class="cover-subtitle">Budget Report</div>
    <div class="cover-meta">${todayFormatted()}</div>
  `;
  slides += slideFooter(1, totalSlides);

  // Slide 2: Summary
  slides += slideOpen(2, totalSlides);
  slides += slideHeader("Budget Summary");
  slides += `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(p.totalBudget, cfg)}</div>
        <div class="metric-label">Total Budget</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(totalActual, cfg)}</div>
        <div class="metric-label">Total Spent</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(remaining, cfg)}</div>
        <div class="metric-label">Remaining</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color:${totalVariance >= 0 ? "#2D6A4F" : "#9B2226"};">${totalVariance >= 0 ? "+" : ""}${fmtCompact(totalVariance, cfg)}</div>
        <div class="metric-label">Variance</div>
      </div>
    </div>
    <div class="subsection">
      <div style="margin-bottom:8px;font-size:12px;color:#6A6A6A;">Budget Utilization</div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${p.totalBudget > 0 ? Math.round((totalActual / p.totalBudget) * 100) : 0}%;background:#8B4513;"></div></div>
      <div style="text-align:right;font-size:11px;color:#6A6A6A;margin-top:4px;">${pct(totalActual, p.totalBudget)} of budget used at ${p.progress}% project completion</div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(2, totalSlides);

  // Slide 3: Category Breakdown
  slides += slideOpen(3, totalSlides);
  slides += slideHeader("Category Breakdown");
  slides += `
    <div class="donut-container">
      <div class="budget-donut" style="${buildDonutGradient(donutItems)}"></div>
      <div class="legend">
        ${buildLegend(donutItems.slice(0, 8), cfg)}
        ${donutItems.length > 8 ? `<div class="legend-item"><span class="legend-label" style="font-style:italic;">+ ${donutItems.length - 8} more categories</span></div>` : ""}
      </div>
    </div>
    <table>
      <thead><tr><th>Category</th><th style="text-align:right">Estimated</th><th style="text-align:right">Actual</th><th style="text-align:right">Variance</th><th>Status</th></tr></thead>
      <tbody>
        ${budgetItems.map((b) => `
          <tr>
            <td>${statusDot(b.status)}${escHtml(b.category)}</td>
            <td class="td-right">${fmtCurrency(b.estimated, cfg)}</td>
            <td class="td-right">${fmtCurrency(b.actual, cfg)}</td>
            <td class="td-right" style="color:${b.estimated - b.actual >= 0 ? "#2D6A4F" : "#9B2226"};">${fmtCurrency(b.estimated - b.actual, cfg)}</td>
            <td>${escHtml(b.status)}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
  slides += slideBodyClose();
  slides += slideFooter(3, totalSlides);

  // Slide 4: Trend Analysis
  slides += slideOpen(4, totalSlides);
  slides += slideHeader("Trend Analysis");
  slides += `
    <div class="metrics-grid-2">
      <div class="metric-card">
        <div class="metric-value">${fmtCompact(burnRate, cfg)}</div>
        <div class="metric-label">Weekly Burn Rate</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${weeksRemaining > 0 && burnRate > 0 ? fmtCompact(burnRate * weeksRemaining, cfg) : "N/A"}</div>
        <div class="metric-label">Projected Remaining Spend</div>
      </div>
    </div>
    <div class="subsection">
      <div class="section-title">Budget Utilization by Phase</div>
      <div class="note-block">
        Week ${p.currentWeek} of ${p.totalWeeks} (${pct(p.currentWeek, p.totalWeeks)} of timeline elapsed).<br/>
        ${pct(totalActual, p.totalBudget)} of budget consumed at ${p.progress}% project completion.<br/>
        ${totalActual / p.totalBudget > p.progress / 100
          ? "Budget consumption is ahead of project progress. Review spending and consider cost controls."
          : "Budget consumption is aligned with or trailing project progress."}
      </div>
    </div>
    <div class="subsection">
      <div class="section-title">Projected Final Cost</div>
      <div class="metrics-grid-2">
        <div class="metric-card">
          <div class="metric-value">${burnRate > 0 && weeksRemaining > 0 ? fmtCompact(totalActual + burnRate * weeksRemaining, cfg) : fmtCompact(p.totalBudget, cfg)}</div>
          <div class="metric-label">Projected at Current Rate</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${fmtCompact(p.totalBudget, cfg)}</div>
          <div class="metric-label">Original Budget</div>
        </div>
      </div>
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(4, totalSlides);

  // Slide 5: Risk Items
  slides += slideOpen(5, totalSlides);
  slides += slideHeader("Risk Items");
  if (overItems.length > 0) {
    slides += `
      <div class="subsection">
        <div class="section-title">Categories Over Budget</div>
        ${overItems.map((b) => `
          <div class="risk-card critical">
            <div class="risk-title">${escHtml(b.category)}</div>
            <div class="risk-body">
              Estimated: ${fmtCurrency(b.estimated, cfg)} | Actual: ${fmtCurrency(b.actual, cfg)} | Overage: ${fmtCurrency(b.actual - b.estimated, cfg)}
            </div>
          </div>`).join("")}
      </div>
    `;
  } else {
    slides += `<div class="note-block">No categories are currently over budget. All spending is within estimated amounts.</div>`;
  }
  const notStarted = budgetItems.filter((b) => b.status === "not-started");
  if (notStarted.length > 0) {
    slides += `
      <div class="subsection" style="margin-top:20px;">
        <div class="section-title">Not Yet Started (${notStarted.length})</div>
        <div class="note-block">
          Remaining unstarted categories: ${notStarted.map((b) => b.category).join(", ")}.
          Total estimated for unstarted work: ${fmtCurrency(notStarted.reduce((s, b) => s + b.estimated, 0), cfg)}.
        </div>
      </div>
    `;
  }
  slides += slideBodyClose();
  slides += slideFooter(5, totalSlides);

  // Slide 6: Contingency Status
  slides += slideOpen(6, totalSlides);
  slides += slideHeader("Contingency Status");
  if (contingencyItem) {
    const contingencyUsed = contingencyItem.actual;
    const contingencyRemaining = contingencyItem.estimated - contingencyItem.actual;
    const contingencyPct = contingencyItem.estimated > 0 ? Math.round((contingencyUsed / contingencyItem.estimated) * 100) : 0;
    slides += `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${fmtCurrency(contingencyItem.estimated, cfg)}</div>
          <div class="metric-label">Contingency Budget</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${fmtCurrency(contingencyUsed, cfg)}</div>
          <div class="metric-label">Used</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${fmtCurrency(contingencyRemaining, cfg)}</div>
          <div class="metric-label">Remaining</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${contingencyPct}%</div>
          <div class="metric-label">Utilized</div>
        </div>
      </div>
      <div class="subsection">
        <div style="margin-bottom:8px;font-size:12px;color:#6A6A6A;">Contingency Utilization</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${contingencyPct}%;background:${contingencyPct > 75 ? "#9B2226" : contingencyPct > 50 ? "#BC6C25" : "#059669"};"></div></div>
      </div>
      <div class="note-block">
        ${contingencyPct > 75
          ? "Contingency is more than 75% consumed. Consider increasing the contingency reserve or identifying cost savings in remaining categories."
          : contingencyPct > 50
          ? "Contingency is more than half consumed. Monitor upcoming expenses closely and control scope changes."
          : "Contingency reserves are healthy. Continue monitoring for unexpected costs."}
      </div>
    `;
  } else {
    slides += `
      <div class="note-block">
        No contingency line item found in the budget. It is strongly recommended to maintain a 10% to 15% contingency reserve for unexpected costs.
      </div>
    `;
  }
  slides += slideBodyClose();
  slides += slideFooter(6, totalSlides);

  // Slide 7: Recommendations
  slides += slideOpen(7, totalSlides);
  slides += slideHeader("Recommendations");
  const recommendations: string[] = [];
  if (overItems.length > 0) {
    recommendations.push(`Review spending in over-budget categories (${overItems.map((b) => b.category).join(", ")}) and identify cost reduction opportunities.`);
  }
  if (burnRate > 0 && weeksRemaining > 0) {
    const projected = totalActual + burnRate * weeksRemaining;
    if (projected > p.totalBudget) {
      recommendations.push(`Reduce weekly spending from ${fmtCompact(burnRate, cfg)}/week to stay within budget. Target weekly spend: ${fmtCompact(remaining / weeksRemaining, cfg)}/week.`);
    }
  }
  if (contingencyItem && contingencyItem.actual > contingencyItem.estimated * 0.5) {
    recommendations.push("Contingency reserves are running low. Minimize scope changes and negotiate fixed pricing with remaining contractors.");
  }
  if (notStarted.length > 0) {
    recommendations.push(`Get competitive bids for unstarted categories (${notStarted.map((b) => b.category).join(", ")}) to lock in pricing before costs increase.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("Budget is on track. Continue current spending patterns and maintain regular financial reviews.");
    recommendations.push("Request updated quotes from contractors for upcoming phases to validate remaining estimates.");
  }
  slides += `
    <ul class="item-list">
      ${recommendations.map((r) => `<li><div class="item-bullet"></div>${escHtml(r)}</li>`).join("")}
    </ul>
    <div class="note-block" style="margin-top:24px;">
      These recommendations are generated from project data analysis. Consult a licensed financial advisor or construction professional for decisions involving significant budget changes.
    </div>
  `;
  slides += slideBodyClose();
  slides += slideFooter(7, totalSlides);

  return wrapHtml(`${p.name} - Budget Report`, slides);
}

// ---------------------------------------------------------------------------
// HTML wrapper
// ---------------------------------------------------------------------------

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generatePresentation(type: PresentationType, data: PresentationData): string {
  switch (type) {
    case "investor":
      return generateInvestorBriefing(data);
    case "team":
      return generateTeamBriefing(data);
    case "progress":
      return generateProgressReport(data);
    case "budget":
      return generateBudgetReport(data);
    default:
      return generateInvestorBriefing(data);
  }
}

export function openPresentation(type: PresentationType, data: PresentationData): void {
  const html = generatePresentation(type, data);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 500);
}
