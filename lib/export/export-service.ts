import { saveAs } from 'file-saver';
import { generateBiasReport } from '@/lib/reports/report-generator';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { Report, ReportExportConfig } from '@/lib/types/reports';
import { DocxReportExporter } from './docx-exporter';
import { MarkdownReportExporter } from './markdown-exporter';

/**
 * Generate a filename for the report
 */
function generateFilename(report: Report, format: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const projectName = report.metadata.projectName
    ? report.metadata.projectName.toLowerCase().replace(/\s+/g, '-')
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
  const exporter = new DocxReportExporter();
  return await exporter.export(report, config);
}

/**
 * Get Markdown content for a report
 */
function getMarkdownContent(
  report: Report,
  config: ReportExportConfig
): string {
  const exporter = new MarkdownReportExporter();
  return exporter.export(report, config);
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
 * Export to PDF using existing report generator
 */
async function exportPDF(
  _report: Report,
  config: ReportExportConfig,
  filename: string
): Promise<void> {
  const workspaceState = useWorkspaceStore.getState();
  const reportData = {
    workspace: workspaceState,
    biasCards: [], // These would need to be loaded from the report data
    mitigationCards: [], // These would need to be loaded from the report data
    config: {
      includeExecutiveSummary: config.sections.executiveSummary,
      includeStageAnalysis: config.sections.biasIdentification,
      includeMitigationStrategies: config.sections.mitigationStrategies,
      includeAnnotations: config.sections.comments,
      includeRecommendations: config.sections.appendices,
      includeVisualization: false,
      authorName: config.metadata?.author || '',
      projectName: config.metadata?.project || '',
    },
  };

  // This would integrate with the existing PDF generation
  const pdfContent = await generateBiasReport(reportData);
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
function exportMarkdown(
  report: Report,
  config: ReportExportConfig,
  filename: string
): void {
  const content = getMarkdownContent(report, config);
  const blob = new Blob([content], { type: 'text/markdown' });
  saveAs(blob, filename);
}

/**
 * Export to JSON format
 */
function exportJSON(
  report: Report,
  config: ReportExportConfig,
  filename: string
): void {
  const content = getJSONContent(report, config);
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
      exportMarkdown(report, config, filename);
      break;
    case 'json':
      exportJSON(report, config, filename);
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
    format,
    sections: {
      executiveSummary: true,
      biasIdentification: true,
      mitigationStrategies: true,
      recommendations: true,
      appendices: false,
      comments: true,
    },
    styling: {
      theme: 'professional',
      includeCharts: true,
      includeImages: true,
    },
    metadata: {
      author: '',
      project: '',
      date: new Date().toISOString(),
      version: '1.0',
    },
  };

  // Format-specific adjustments
  switch (format) {
    case 'markdown':
      baseConfig.styling.includeCharts = false;
      baseConfig.styling.includeImages = false;
      break;
    case 'json':
      baseConfig.sections = {
        executiveSummary: false,
        biasIdentification: true,
        mitigationStrategies: true,
        recommendations: true,
        appendices: true,
        comments: true,
      };
      break;
    default:
      break;
  }

  return baseConfig;
}
