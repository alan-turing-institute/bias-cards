import { saveAs } from 'file-saver';
import { generateBiasReport } from '@/lib/reports/report-generator';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type {
  Report,
  ReportExportConfig,
  ReportFormat,
} from '@/lib/types/reports';
import { DocxReportExporter } from './docx-exporter';
import { MarkdownReportExporter } from './markdown-exporter';

/**
 * Generate a filename for the report
 */
function generateFilename(report: Report, format: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const projectName = report.projectInfo.title
    ? report.projectInfo.title.toLowerCase().replace(/\s+/g, '-')
    : 'bias-report';
  return `${projectName}-${timestamp}.${format}`;
}

/**
 * Get PDF content for a report
 */
function getPDFContent(report: Report, _config: ReportExportConfig): Blob {
  // Here you would use a PDF generation library like jsPDF or puppeteer
  // For now, returning a placeholder
  const content = JSON.stringify(report, null, 2);
  return new Blob([content], { type: 'application/pdf' });
}

/**
 * Get DOCX content for a report
 */
async function getDocxContent(
  report: Report,
  config: ReportExportConfig
): Promise<Blob> {
  const exporter = new DocxReportExporter(report, config);
  return await exporter.generate();
}

/**
 * Get Markdown content for a report
 */
function getMarkdownContent(
  report: Report,
  config: ReportExportConfig
): string {
  const exporter = new MarkdownReportExporter(report, config);
  return exporter.generate();
}

/**
 * Get JSON content for a report
 */
function getJSONContent(report: Report, config: ReportExportConfig): string {
  return JSON.stringify(
    {
      report,
      exportConfig: config,
      exportDate: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Export to PDF using BiasReport
 */
async function exportPDF(
  report: Report,
  config: ReportExportConfig,
  filename: string
): Promise<void> {
  const workspaceState = useWorkspaceStore.getState();

  // Get the current BiasActivity from workspace
  const currentActivity = workspaceState.getCurrentActivity();
  if (!currentActivity) {
    throw new Error('No active bias activity found');
  }

  // Import BiasReport dynamically to avoid circular dependencies
  const { BiasReport } = await import('@/lib/reports/bias-report');

  // Create BiasReport instance
  const biasReport = new BiasReport(currentActivity);

  // Generate PDF content
  const pdfContent = await biasReport.exportToPDF();

  // Save the file
  saveAs(new Blob([pdfContent]), filename);
}

/**
 * Export to DOCX format
 */
async function exportDocx(
  report: Report,
  config: ReportExportConfig,
  filename: string
): Promise<void> {
  const content = await getDocxContent(report, config);
  saveAs(content, filename);
}

/**
 * Export to Markdown format
 */
async function exportMarkdown(
  report: Report,
  config: ReportExportConfig,
  filename: string
): Promise<void> {
  const workspaceState = useWorkspaceStore.getState();

  // Get the current BiasActivity from workspace
  const currentActivity = workspaceState.getCurrentActivity();
  if (!currentActivity) {
    // Fallback to old method if no activity
    const content = getMarkdownContent(report, config);
    const blob = new Blob([content], { type: 'text/markdown' });
    saveAs(blob, filename);
    return;
  }

  // Import BiasReport dynamically to avoid circular dependencies
  const { BiasReport } = await import('@/lib/reports/bias-report');

  // Create BiasReport instance
  const biasReport = new BiasReport(currentActivity);

  // Generate markdown content with interim flag if activity not complete
  const isInterim = currentActivity.getCurrentStage() < 5;
  const content = biasReport.exportToMarkdown(isInterim);

  const blob = new Blob([content], { type: 'text/markdown' });
  saveAs(blob, filename);
}

/**
 * Export to JSON format
 */
async function exportJSON(
  report: Report,
  config: ReportExportConfig,
  filename: string
): Promise<void> {
  const workspaceState = useWorkspaceStore.getState();

  // Get the current BiasActivity from workspace
  const currentActivity = workspaceState.getCurrentActivity();
  if (!currentActivity) {
    // Fallback to old method if no activity
    const content = getJSONContent(report, config);
    const blob = new Blob([content], { type: 'application/json' });
    saveAs(blob, filename);
    return;
  }

  // Import BiasReport dynamically to avoid circular dependencies
  const { BiasReport } = await import('@/lib/reports/bias-report');

  // Create BiasReport instance
  const biasReport = new BiasReport(currentActivity);

  // Generate JSON content
  const jsonData = biasReport.exportToJSON();
  const content = JSON.stringify(
    {
      report: jsonData,
      exportConfig: config,
      exportDate: new Date().toISOString(),
    },
    null,
    2
  );

  const blob = new Blob([content], { type: 'application/json' });
  saveAs(blob, filename);
}

/**
 * Export a report in the specified format
 */
export async function exportReport(
  report: Report,
  config: ReportExportConfig
): Promise<void> {
  const filename = generateFilename(report, config.format);

  switch (config.format) {
    case 'pdf':
      await exportPDF(report, config, filename);
      break;
    case 'docx':
      await exportDocx(report, config, filename);
      break;
    case 'markdown':
      await exportMarkdown(report, config, filename);
      break;
    case 'json':
      await exportJSON(report, config, filename);
      break;
    default:
      throw new Error(`Unsupported export format: ${config.format}`);
  }
}

/**
 * Export multiple reports in a batch
 */
export async function exportBatch(
  reports: Report[],
  config: ReportExportConfig
): Promise<void> {
  // For batch export, we'll create a zip file
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Process reports in parallel
  const promises = reports.map(async (report) => {
    const filename = generateFilename(report, config.format);
    let content: Blob | Buffer | string | null = null;

    switch (config.format) {
      case 'pdf':
        content = getPDFContent(report, config);
        break;
      case 'docx':
        content = await getDocxContent(report, config);
        break;
      case 'markdown':
        content = getMarkdownContent(report, config);
        break;
      case 'json':
        content = getJSONContent(report, config);
        break;
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }

    if (content) {
      return { filename, content };
    }
    return null;
  });

  const results = await Promise.all(promises);

  for (const result of results) {
    if (result) {
      zip.file(result.filename, result.content);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `bias-reports-batch-${Date.now()}.zip`);
}

/**
 * Get available export formats
 */
export function getAvailableFormats(): Array<{
  value: string;
  label: string;
  description: string;
}> {
  return [
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format - Best for printing and sharing',
    },
    {
      value: 'docx',
      label: 'Word Document',
      description: 'Microsoft Word - Best for editing and collaboration',
    },
    {
      value: 'markdown',
      label: 'Markdown',
      description: 'Plain text format - Best for version control',
    },
    {
      value: 'json',
      label: 'JSON',
      description: 'Data format - Best for programmatic processing',
    },
  ];
}

/**
 * Get default export configuration
 */
export function getDefaultConfig(format: string): ReportExportConfig {
  const baseConfig: ReportExportConfig = {
    format: format as ReportFormat,
    sections: {
      executiveSummary: true,
      projectInfo: true,
      biasIdentification: true,
      mitigationStrategies: true,
      implementation: true,
      tracking: true,
      comments: true,
      auditTrail: false,
      appendices: false,
    },
    options: {
      includeSensitiveData: false,
      includeBranding: true,
    },
  };

  // Format-specific adjustments
  switch (format) {
    case 'markdown':
      // Markdown doesn't support charts/images in the same way
      break;
    case 'json':
      baseConfig.sections = {
        executiveSummary: false,
        projectInfo: true,
        biasIdentification: true,
        mitigationStrategies: true,
        implementation: true,
        tracking: true,
        comments: true,
        auditTrail: true,
        appendices: true,
      };
      break;
    default:
      break;
  }

  return baseConfig;
}
export function exportToFormat(_report: Report, _format: string): void {
  // Export not yet implemented
}

export function getDefaultExportConfig(): ReportExportConfig {
  return {
    format: 'pdf',
    sections: {
      executiveSummary: true,
      projectInfo: true,
      biasIdentification: true,
      mitigationStrategies: true,
      implementation: true,
      tracking: true,
      comments: false,
      auditTrail: false,
      appendices: false,
    },
    options: {
      includeSensitiveData: false,
      includeBranding: true,
      pageLayout: 'portrait',
      colorScheme: 'full',
      locale: 'en-US',
    },
  };
}

export function getSupportedExportFormats(): string[] {
  return ['pdf', 'json', 'markdown', 'docx'];
}
