/**
 * Export Styles
 *
 * Shared CSS for all PDF / HTML export templates.
 * Professional, print-optimized styles using Keystone brand colors.
 */

export function getExportCSS(): string {
  return `
    /* Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* Page */
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #2C1810; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 40px; font-size: 12px; }

    @media print {
      body { padding: 20px; }
      .page-break { page-break-before: always; }
      .no-print { display: none; }
    }

    /* Typography */
    h1 { font-family: Georgia, serif; font-size: 28px; color: #2C1810; margin-bottom: 8px; }
    h2 { font-family: Georgia, serif; font-size: 18px; color: #2C1810; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #D4A574; }
    h3 { font-family: Georgia, serif; font-size: 14px; color: #8B4513; margin: 16px 0 8px; }
    p { margin-bottom: 8px; }

    /* Cover Page */
    .cover { text-align: center; padding: 80px 40px; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .cover h1 { font-size: 36px; margin-bottom: 12px; }
    .cover .subtitle { font-size: 16px; color: #8B4513; margin-bottom: 4px; }
    .cover .date { font-size: 13px; color: #6A6A6A; margin-top: 16px; }
    .cover .market-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 12px; }
    .cover .market-usa { background: #1B4965; color: white; }
    .cover .market-wa { background: #6B4226; color: #F5E6D3; }

    /* Logo */
    .logo-row { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 24px; }
    .org-logo { max-height: 60px; max-width: 200px; object-fit: contain; }
    .keystone-brand { font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #2C1810; letter-spacing: 1px; }
    .powered-by { font-size: 10px; color: #6A6A6A; }

    /* Metric Grid */
    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .metric-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
    .metric-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
    .metric-box { background: #FDF8F0; border: 1px solid #D4A574; border-radius: 8px; padding: 12px; text-align: center; }
    .metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6A6A6A; margin-bottom: 4px; }
    .metric-value { font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #2C1810; }
    .metric-value.small { font-size: 14px; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
    thead th { background: #2C1810; color: #F5E6D3; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    tbody td { padding: 7px 10px; border-bottom: 1px solid #e8e0d4; }
    tbody tr:nth-child(even) { background: #faf6f0; }
    tbody tr:hover { background: #F5E6D3; }
    .totals-row td { font-weight: 700; border-top: 2px solid #2C1810; background: #FDF8F0; }
    .currency { font-family: 'Courier New', monospace; text-align: right; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }

    /* Status Badges */
    .status { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-on-track { background: #d1fae5; color: #065f46; }
    .status-over { background: #fee2e2; color: #991b1b; }
    .status-under { background: #dbeafe; color: #1e40af; }
    .status-not-started { background: #f3f4f6; color: #6b7280; }
    .status-critical { background: #fee2e2; color: #991b1b; }
    .status-major { background: #fef3c7; color: #92400e; }
    .status-minor { background: #dbeafe; color: #1e40af; }
    .status-open { background: #fef3c7; color: #92400e; }
    .status-resolved { background: #d1fae5; color: #065f46; }
    .status-in-progress { background: #dbeafe; color: #1e40af; }

    /* Phase Timeline */
    .phase-timeline { display: flex; gap: 4px; margin: 16px 0; }
    .phase-block { flex: 1; padding: 8px 4px; text-align: center; border-radius: 6px; font-size: 9px; font-weight: 600; }
    .phase-completed { background: #2D6A4F; color: white; }
    .phase-current { background: #8B4513; color: white; }
    .phase-upcoming { background: #e8e0d4; color: #6A6A6A; }

    /* Progress Bar */
    .progress-bar { background: #e8e0d4; border-radius: 6px; height: 12px; overflow: hidden; margin: 8px 0; }
    .progress-fill { height: 100%; border-radius: 6px; background: #2D6A4F; transition: width 0.3s; }
    .progress-fill.warning { background: #BC6C25; }
    .progress-fill.danger { background: #9B2226; }

    /* Donut Chart (CSS conic-gradient) */
    .donut-container { display: flex; align-items: center; gap: 24px; margin: 16px 0; }
    .donut { width: 160px; height: 160px; border-radius: 50%; position: relative; }
    .donut-hole { position: absolute; top: 25%; left: 25%; width: 50%; height: 50%; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700; }
    .donut-legend { flex: 1; }
    .legend-item { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 11px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    /* Risk Cards */
    .risk-card { padding: 10px 14px; border-radius: 8px; margin: 8px 0; border-left: 4px solid; }
    .risk-critical { border-color: #9B2226; background: #fef2f2; }
    .risk-warning { border-color: #BC6C25; background: #fffbeb; }
    .risk-info { border-color: #1B4965; background: #eff6ff; }
    .risk-title { font-weight: 600; font-size: 12px; margin-bottom: 2px; }
    .risk-detail { font-size: 11px; color: #6A6A6A; }

    /* Photo Grid */
    .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
    .photo-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
    .photo-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
    .photo-item { border-radius: 6px; overflow: hidden; border: 1px solid #e8e0d4; }
    .photo-item img { width: 100%; height: 120px; object-fit: cover; display: block; }
    .photo-caption { padding: 4px 6px; font-size: 9px; color: #6A6A6A; background: #faf6f0; }

    /* Section Header */
    .section-header { display: flex; align-items: center; gap: 8px; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #D4A574; }
    .section-icon { width: 24px; height: 24px; background: #F5E6D3; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #8B4513; }

    /* Header/Footer */
    .page-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 1px solid #e8e0d4; font-size: 10px; color: #6A6A6A; }
    .page-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; margin-top: 24px; border-top: 1px solid #e8e0d4; font-size: 9px; color: #6A6A6A; }

    /* Disclaimer */
    .disclaimer { margin-top: 24px; padding: 12px; background: #faf6f0; border-radius: 8px; font-size: 9px; color: #6A6A6A; line-height: 1.4; }

    /* AI Summary */
    .ai-summary { padding: 16px; background: #FDF8F0; border: 1px solid #D4A574; border-radius: 8px; margin: 16px 0; font-size: 13px; line-height: 1.6; color: #3A3A3A; font-style: italic; }

    /* Utility */
    .flex-row { display: flex; gap: 16px; }
    .flex-col { flex: 1; }
    .muted { color: #6A6A6A; }
    .bold { font-weight: 700; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }
    .mb-2 { margin-bottom: 8px; }
  `;
}
