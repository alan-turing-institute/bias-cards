import jsPDF from 'jspdf';
import type { Report, ReportExportConfig } from '@/lib/types/reports';

export class PDFReportExporter {
  private report: Report;
  private config: ReportExportConfig;
  private doc: jsPDF;
  private currentY = 20;
  private pageWidth = 210;
  private pageHeight = 297;
  private margin = 20;
  private lineHeight = 7;

  constructor(report: Report, config: ReportExportConfig) {
    this.report = report;
    this.config = config;
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }

  async generate(): Promise<Blob> {
    // Set default font
    this.doc.setFont('helvetica');

    // Title page
    this.addTitlePage();

    // Executive Summary
    if (
      this.config.sections.executiveSummary &&
      this.report.analysis.executiveSummary
    ) {
      this.addPageIfNeeded();
      this.addExecutiveSummary();
    }

    // Project Information
    if (this.config.sections.projectInfo) {
      this.addPageIfNeeded();
      this.addProjectInfo();
    }

    // Risk Assessment Summary
    if (this.report.analysis.riskAssessmentSummary) {
      this.addPageIfNeeded();
      this.addRiskAssessment();
    }

    // Bias Identification
    if (
      this.config.sections.biasIdentification &&
      this.report.analysis.biasIdentification.length > 0
    ) {
      this.addPageIfNeeded();
      this.addBiasIdentification();
    }

    // Mitigation Strategies
    if (
      this.config.sections.mitigationStrategies &&
      this.report.analysis.mitigationStrategies.length > 0
    ) {
      this.addPageIfNeeded();
      this.addMitigationStrategies();
    }

    // Audit Trail
    if (this.config.sections.auditTrail && this.report.auditTrail.length > 0) {
      this.addPageIfNeeded();
      this.addAuditTrail();
    }

    // Return as blob
    return this.doc.output('blob');
  }

  private addTitlePage(): void {
    // Center align for title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const title = this.report.projectInfo.title || 'Bias Analysis Report';
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, (this.pageWidth - titleWidth) / 2, 60);

    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    const subtitle = 'Machine Learning Bias Analysis Report';
    const subtitleWidth = this.doc.getTextWidth(subtitle);
    this.doc.text(subtitle, (this.pageWidth - subtitleWidth) / 2, 75);

    // Description
    if (this.report.projectInfo.description) {
      this.doc.setFontSize(12);
      const lines = this.doc.splitTextToSize(
        this.report.projectInfo.description,
        this.pageWidth - 2 * this.margin
      );
      this.doc.text(lines, this.margin, 95);
    }

    // Metadata
    this.currentY = 140;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    this.addText(`Status: ${this.report.metadata.status.toUpperCase()}`);
    this.addText(`Version: ${this.report.metadata.version}`);
    this.addText(`Domain: ${this.report.projectInfo.domain}`);
    this.addText(
      `Generated: ${new Date(this.report.metadata.createdAt).toLocaleDateString()}`
    );
    this.addText(
      `Last Modified: ${new Date(this.report.metadata.lastModified).toLocaleDateString()}`
    );

    this.doc.addPage();
    this.currentY = 20;
  }

  private addExecutiveSummary(): void {
    this.addSectionTitle('Executive Summary');

    const summary = this.report.analysis.executiveSummary!;

    // Key Findings
    if (summary.keyFindings && summary.keyFindings.length > 0) {
      this.addSubsection('Key Findings');
      summary.keyFindings.forEach((finding) => {
        this.addBulletPoint(finding);
      });
    }

    // Risk Assessment
    if (summary.riskAssessment) {
      this.addSubsection('Risk Assessment');
      this.addText(summary.riskAssessment);
    }

    // Recommendations
    if (summary.recommendations && summary.recommendations.length > 0) {
      this.addSubsection('Recommendations');
      summary.recommendations.forEach((rec) => {
        this.addBulletPoint(rec);
      });
    }
  }

  private addProjectInfo(): void {
    this.addSectionTitle('Project Information');

    this.addSubsection('Overview');
    this.addText(`Title: ${this.report.projectInfo.title}`);
    this.addText(`Domain: ${this.report.projectInfo.domain}`);

    if (this.report.projectInfo.objectives) {
      this.addText(`Objectives: ${this.report.projectInfo.objectives}`);
    }

    if (this.report.projectInfo.scope) {
      this.addText(`Scope: ${this.report.projectInfo.scope}`);
    }
  }

  private addRiskAssessment(): void {
    this.addSectionTitle('Risk Assessment Summary');

    const summary = this.report.analysis.riskAssessmentSummary!;

    this.addText(`Total Biases Assessed: ${summary.totalAssessed}`);
    this.addText(`Completion: ${summary.completionPercentage}%`);

    this.addSubsection('Risk Distribution');
    this.addText(`High Risk: ${summary.distribution.high} biases`);
    this.addText(`Medium Risk: ${summary.distribution.medium} biases`);
    this.addText(`Low Risk: ${summary.distribution.low} biases`);
    this.addText(`Unassigned: ${summary.distribution.unassigned} biases`);
  }

  private addBiasIdentification(): void {
    this.addSectionTitle('Bias Identification');

    this.report.analysis.biasIdentification.forEach((identification) => {
      const stageName =
        identification.stage?.replace(/-/g, ' ') || 'Unknown Stage';
      this.addSubsection(`Stage: ${stageName}`);

      identification.biases?.forEach((bias) => {
        this.addText(
          `• ${bias.biasCard?.name || 'Unknown Bias'} (${bias.severity} risk)`
        );
        if (bias.rationale) {
          this.doc.setFontSize(9);
          this.doc.setFont('helvetica', 'italic');
          const lines = this.doc.splitTextToSize(
            `  Rationale: ${bias.rationale}`,
            this.pageWidth - 2 * this.margin - 10
          );
          lines.forEach((line: string) => {
            this.addText(line);
          });
          this.doc.setFont('helvetica', 'normal');
          this.doc.setFontSize(10);
        }
      });
    });
  }

  private addMitigationStrategies(): void {
    this.addSectionTitle('Mitigation Strategies');

    this.report.analysis.mitigationStrategies.forEach((strategy) => {
      this.addSubsection(strategy.biasName || 'Unknown Bias');

      strategy.mitigations?.forEach((mitigation) => {
        const name = mitigation.mitigationCard?.name || 'Unknown Mitigation';
        const rating = mitigation.effectivenessRating || 0;
        this.addText(`• ${name} (Effectiveness: ${rating}/5)`);

        if (mitigation.implementationNotes) {
          this.doc.setFontSize(9);
          this.doc.setFont('helvetica', 'italic');
          this.addText(`  Notes: ${mitigation.implementationNotes}`);
          this.doc.setFont('helvetica', 'normal');
          this.doc.setFontSize(10);
        }
      });
    });
  }

  private addAuditTrail(): void {
    this.addSectionTitle('Audit Trail');

    const recentEntries = this.report.auditTrail.slice(-10).reverse();
    recentEntries.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      this.addText(`• ${date} - ${entry.action}: ${entry.description}`);
      this.addText(`  By: ${entry.userName}`);
    });
  }

  private addSectionTitle(title: string): void {
    this.addPageIfNeeded(40);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.addText(title);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.currentY += 3;
  }

  private addSubsection(title: string): void {
    this.addPageIfNeeded(20);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.addText(title);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
  }

  private addText(text: string): void {
    this.addPageIfNeeded();
    const lines = this.doc.splitTextToSize(
      text,
      this.pageWidth - 2 * this.margin
    );
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * this.lineHeight;
  }

  private addBulletPoint(text: string): void {
    this.addPageIfNeeded();
    const lines = this.doc.splitTextToSize(
      `• ${text}`,
      this.pageWidth - 2 * this.margin
    );
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * this.lineHeight;
  }

  private addPageIfNeeded(requiredSpace = 15): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }
}
