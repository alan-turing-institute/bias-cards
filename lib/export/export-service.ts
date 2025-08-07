import { saveAs } from 'file-saver';
import { generateBiasReport } from '@/lib/reports/report-generator';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { Report, ReportExportConfig } from '@/lib/types/reports';
import { DocxReportExporter } from './docx-exporter';
import { MarkdownReportExporter } from './markdown-exporter';

export class ReportExportService {
  /**
   * Export a report in the specified format
   */
  static async exportReport(
    report: Report,
    config: ReportExportConfig
  ): Promise<void> {
    const filename = ReportExportService.generateFilename(
      report,
      config.format
    );

    switch (config.format) {
      case 'pdf':
        await ReportExportService.exportPDF(report, config, filename);
        break;
      case 'docx':
        await ReportExportService.exportDocx(report, config, filename);
        break;
      case 'markdown':
        await ReportExportService.exportMarkdown(report, config, filename);
        break;
      case 'json':
        await ReportExportService.exportJSON(report, config, filename);
        break;
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  /**
   * Export multiple reports in a batch
   */
  static async exportBatch(
    reports: Report[],
    config: ReportExportConfig
  ): Promise<void> {
    // For batch export, we'll create a zip file
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const report of reports) {
      const filename = ReportExportService.generateFilename(
        report,
        config.format
      );
      let content: Blob | Buffer | string | null = null;

      switch (config.format) {
        case 'pdf':
          content = await ReportExportService.getPDFContent(report, config);
          break;
        case 'docx':
          content = await ReportExportService.getDocxContent(report, config);
          break;
        case 'markdown':
          content = ReportExportService.getMarkdownContent(report, config);
          break;
        case 'json':
          content = ReportExportService.getJSONContent(report, config);
          break;
      }

      if (content) {
        zip.file(filename, content);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `bias-reports-batch-${Date.now()}.zip`);
  }

  /**
   * Export to PDF using existing report generator
   */
  private static async exportPDF(
    report: Report,
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
        projectName: report.projectInfo.title,
      },
    };
    const blob = await generateBiasReport(reportData);
    saveAs(blob, filename);
  }

  private static async getPDFContent(
    report: Report,
    config: ReportExportConfig
  ): Promise<Blob> {
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
        projectName: report.projectInfo.title,
      },
    };
    return await generateBiasReport(reportData);
  }

  /**
   * Export to Word/DOCX format
   */
  private static async exportDocx(
    report: Report,
    config: ReportExportConfig,
    filename: string
  ): Promise<void> {
    const exporter = new DocxReportExporter(report, config);
    const blob = await exporter.generate();
    saveAs(blob, filename);
  }

  private static async getDocxContent(
    report: Report,
    config: ReportExportConfig
  ): Promise<Blob> {
    const exporter = new DocxReportExporter(report, config);
    return await exporter.generate();
  }

  /**
   * Export to Markdown format
   */
  private static async exportMarkdown(
    report: Report,
    config: ReportExportConfig,
    filename: string
  ): Promise<void> {
    const exporter = new MarkdownReportExporter(report, config);
    const content = exporter.generate();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);
  }

  private static getMarkdownContent(
    report: Report,
    config: ReportExportConfig
  ): string {
    const exporter = new MarkdownReportExporter(report, config);
    return exporter.generate();
  }

  /**
   * Export to JSON format
   */
  private static async exportJSON(
    report: Report,
    config: ReportExportConfig,
    filename: string
  ): Promise<void> {
    const content = ReportExportService.getJSONContent(report, config);
    const blob = new Blob([content], {
      type: 'application/json;charset=utf-8',
    });
    saveAs(blob, filename);
  }

  private static getJSONContent(
    report: Report,
    config: ReportExportConfig
  ): string {
    // Filter report data based on config
    const exportData: any = {
      metadata: report.metadata,
      projectInfo: report.projectInfo,
    };

    if (config.sections.executiveSummary) {
      exportData.executiveSummary = report.analysis.executiveSummary;
    }

    if (config.sections.biasIdentification) {
      exportData.biasIdentification = report.analysis.biasIdentification;
    }

    if (config.sections.mitigationStrategies) {
      exportData.mitigationStrategies = report.analysis.mitigationStrategies;
    }

    if (config.sections.tracking) {
      exportData.tracking = report.tracking;
    }

    if (config.sections.auditTrail) {
      exportData.auditTrail = report.auditTrail;
    }

    // Handle sensitive data
    if (!config.options.includeSensitiveData) {
      // Remove sensitive fields
      if (exportData.projectInfo?.team) {
        exportData.projectInfo.team = {
          ...exportData.projectInfo.team,
          members: exportData.projectInfo.team.members?.map((m: any) => ({
            ...m,
            email: undefined,
            contact: undefined,
          })),
        };
      }
      if (exportData.auditTrail) {
        exportData.auditTrail = exportData.auditTrail.map((entry: any) => ({
          ...entry,
          details: {
            ...entry.details,
            ipAddress: undefined,
            userAgent: undefined,
          },
        }));
      }
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate a filename for the export
   */
  private static generateFilename(report: Report, format: string): string {
    const sanitizedTitle = report.projectInfo.title
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const version = `v${report.metadata.version}`;

    return `${sanitizedTitle}-bias-report-${version}-${timestamp}.${format}`;
  }

  /**
   * Get available export formats
   */
  static getAvailableFormats(): Array<{
    value: string;
    label: string;
    description: string;
  }> {
    return [
      {
        value: 'pdf',
        label: 'PDF',
        description: 'Portable Document Format - Best for sharing and printing',
      },
      {
        value: 'docx',
        label: 'Word',
        description: 'Microsoft Word - Editable document format',
      },
      {
        value: 'markdown',
        label: 'Markdown',
        description: 'Plain text format - Best for documentation systems',
      },
      {
        value: 'json',
        label: 'JSON',
        description: 'Raw data format - Best for integrations',
      },
    ];
  }

  /**
   * Get default export configuration
   */
  static getDefaultConfig(format: string): ReportExportConfig {
    return {
      format: format as any,
      sections: {
        executiveSummary: true,
        projectInfo: true,
        biasIdentification: true,
        mitigationStrategies: true,
        implementation: true,
        tracking: true,
        comments: true,
        auditTrail: format === 'pdf' || format === 'json',
        appendices: true,
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
}
