import ExcelJS from 'exceljs';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import type { Report, ReportExportConfig } from '@/lib/types/reports';

export class ExcelReportExporter {
  private workbook: ExcelJS.Workbook;
  private report: Report;
  private config: ReportExportConfig;

  constructor(report: Report, config: ReportExportConfig) {
    this.report = report;
    this.config = config;
    this.workbook = new ExcelJS.Workbook();

    // Set workbook properties
    this.workbook.creator = 'Bias Cards Report Generator';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.lastModifiedBy = 'Bias Cards';
    // Set workbook properties (only properties that exist in the type)
    if (this.workbook.properties) {
      (this.workbook.properties as any).subject =
        'Machine Learning Bias Analysis';
      (this.workbook.properties as any).title = this.report.projectInfo.title;
      (this.workbook.properties as any).description =
        this.report.projectInfo.description;
    }
  }

  async generate(): Promise<any> {
    // Create sheets based on config
    if (this.config.sections.projectInfo) {
      this.createProjectInfoSheet();
    }

    if (
      this.config.sections.executiveSummary &&
      this.report.analysis.executiveSummary
    ) {
      this.createExecutiveSummarySheet();
    }

    if (this.config.sections.biasIdentification) {
      this.createBiasIdentificationSheet();
    }

    if (this.config.sections.mitigationStrategies) {
      this.createMitigationStrategiesSheet();
    }

    if (this.config.sections.tracking) {
      this.createTrackingSheet();
    }

    if (this.config.sections.auditTrail) {
      this.createAuditTrailSheet();
    }

    // Generate buffer
    return await this.workbook.xlsx.writeBuffer();
  }

  private createProjectInfoSheet(): void {
    const worksheet = this.workbook.addWorksheet('Project Information');

    // Title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Project Information';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add project details
    const info = [
      ['Field', 'Value'],
      ['Title', this.report.projectInfo.title],
      ['Description', this.report.projectInfo.description],
      ['Domain', this.report.projectInfo.domain],
      ['Objectives', this.report.projectInfo.objectives || 'N/A'],
      ['Scope', this.report.projectInfo.scope || 'N/A'],
      ['Project Lead', this.report.projectInfo.team?.projectLead.name || 'N/A'],
      ['Lead Role', this.report.projectInfo.team?.projectLead.role || 'N/A'],
      ['Start Date', this.report.projectInfo.timeline?.startDate || 'N/A'],
      ['End Date', this.report.projectInfo.timeline?.endDate || 'N/A'],
    ];

    // Add data starting from row 3
    worksheet.addRows(info);

    // Style the header row
    worksheet.getRow(3).font = { bold: true };
    worksheet.getRow(3).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };

    // Auto-fit columns
    worksheet.columns = [
      { key: 'field', width: 20 },
      { key: 'value', width: 60 },
    ];

    // Add borders
    const dataRange =
      worksheet.getCell('A3').address +
      ':' +
      worksheet.getCell(`B${info.length + 2}`).address;
    worksheet.getCell(dataRange).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  }

  private createExecutiveSummarySheet(): void {
    const worksheet = this.workbook.addWorksheet('Executive Summary');
    const summary = this.report.analysis.executiveSummary;

    if (!summary) {
      return;
    }

    // Title
    worksheet.mergeCells('A1:C1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Executive Summary';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    let currentRow = 3;

    // Key Findings
    if (summary.keyFindings.length > 0) {
      worksheet.getCell(`A${currentRow}`).value = 'Key Findings';
      worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
      currentRow++;

      summary.keyFindings.forEach((finding, index) => {
        worksheet.getCell(`A${currentRow}`).value = `${index + 1}.`;
        worksheet.getCell(`B${currentRow}`).value = finding;
        worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
        currentRow++;
      });
      currentRow++;
    }

    // Risk Assessment
    if (summary.riskAssessment) {
      worksheet.getCell(`A${currentRow}`).value = 'Risk Assessment';
      worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = summary.riskAssessment;
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      worksheet.getRow(currentRow).alignment = {
        wrapText: true,
        vertical: 'top',
      };
      currentRow += 2;
    }

    // Recommendations
    if (summary.recommendations.length > 0) {
      worksheet.getCell(`A${currentRow}`).value = 'Recommendations';
      worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
      currentRow++;

      summary.recommendations.forEach((rec, index) => {
        worksheet.getCell(`A${currentRow}`).value = `${index + 1}.`;
        worksheet.getCell(`B${currentRow}`).value = rec;
        worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
        worksheet.getRow(currentRow).alignment = { wrapText: true };
        currentRow++;
      });
    }

    // Auto-fit columns
    worksheet.columns = [
      { key: 'num', width: 5 },
      { key: 'content', width: 80 },
    ];
  }

  private createBiasIdentificationSheet(): void {
    const worksheet = this.workbook.addWorksheet('Bias Identification');

    // Title
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Bias Identification Analysis';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Headers
    const headers = [
      'Lifecycle Stage',
      'Bias Type',
      'Description',
      'Severity',
      'Confidence',
      'Identified By',
    ];

    worksheet.addRow([]);
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    headerRow.alignment = { horizontal: 'center' };

    // Add data
    this.report.analysis.biasIdentification.forEach((identification) => {
      const stageInfo = LIFECYCLE_STAGES[identification.stage];
      identification.biases.forEach((bias) => {
        worksheet.addRow([
          stageInfo?.name || identification.stage,
          bias.biasCard.title,
          bias.biasCard.description,
          bias.severity.toUpperCase(),
          bias.confidence.toUpperCase(),
          bias.identifiedBy,
        ]);
      });
    });

    // Apply conditional formatting for severity
    const dataRows = worksheet.rowCount - 3;
    if (dataRows > 0) {
      const severityColumn = 'D';
      for (let i = 4; i <= worksheet.rowCount; i++) {
        const cell = worksheet.getCell(`${severityColumn}${i}`);
        switch (cell.value) {
          case 'HIGH':
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEE2E2' }, // Light red
            };
            cell.font = { color: { argb: 'FFDC2626' } }; // Dark red
            break;
          case 'MEDIUM':
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' }, // Light orange
            };
            cell.font = { color: { argb: 'FFD97706' } }; // Dark orange
            break;
          case 'LOW':
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' }, // Light green
            };
            cell.font = { color: { argb: 'FF059669' } }; // Dark green
            break;
        }
      }
    }

    // Set column widths
    worksheet.columns = [
      { key: 'stage', width: 25 },
      { key: 'bias', width: 25 },
      { key: 'description', width: 50 },
      { key: 'severity', width: 12 },
      { key: 'confidence', width: 12 },
      { key: 'identifiedBy', width: 20 },
    ];

    // Add filters
    worksheet.autoFilter = {
      from: 'A3',
      to: 'F3',
    };
  }

  private createMitigationStrategiesSheet(): void {
    const worksheet = this.workbook.addWorksheet('Mitigation Strategies');

    // Title
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Mitigation Strategies';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Headers
    const headers = [
      'Bias ID',
      'Mitigation',
      'Description',
      'Timeline',
      'Responsible',
      'Priority',
      'Success Criteria',
    ];

    worksheet.addRow([]);
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };

    // Add data
    this.report.analysis.mitigationStrategies.forEach((strategy) => {
      strategy.mitigations.forEach((mitigation) => {
        worksheet.addRow([
          strategy.biasId,
          mitigation.mitigationCard.title,
          mitigation.mitigationCard.description,
          mitigation.timeline,
          mitigation.responsible,
          mitigation.priority.toUpperCase(),
          mitigation.successCriteria,
        ]);
      });
    });

    // Apply conditional formatting for priority
    const dataRows = worksheet.rowCount - 3;
    if (dataRows > 0) {
      const priorityColumn = 'F';
      for (let i = 4; i <= worksheet.rowCount; i++) {
        const cell = worksheet.getCell(`${priorityColumn}${i}`);
        switch (cell.value) {
          case 'HIGH':
            cell.font = { bold: true, color: { argb: 'FFDC2626' } };
            break;
          case 'MEDIUM':
            cell.font = { bold: true, color: { argb: 'FFD97706' } };
            break;
          case 'LOW':
            cell.font = { bold: true, color: { argb: 'FF059669' } };
            break;
        }
      }
    }

    // Set column widths
    worksheet.columns = [
      { key: 'biasId', width: 15 },
      { key: 'mitigation', width: 25 },
      { key: 'description', width: 40 },
      { key: 'timeline', width: 15 },
      { key: 'responsible', width: 20 },
      { key: 'priority', width: 10 },
      { key: 'criteria', width: 30 },
    ];

    // Add filters
    worksheet.autoFilter = {
      from: 'A3',
      to: 'G3',
    };
  }

  private createTrackingSheet(): void {
    const worksheet = this.workbook.addWorksheet('Implementation Tracking');

    // Title
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Implementation Tracking';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Summary statistics
    const totalMitigations = this.report.analysis.mitigationStrategies.reduce(
      (sum, s) => sum + s.mitigations.length,
      0
    );
    const trackedMitigations = this.report.tracking.mitigationTracking.length;
    const completedMitigations = this.report.tracking.mitigationTracking.filter(
      (t) => t.status === 'completed'
    ).length;

    worksheet.addRow([]);
    worksheet.addRow(['Summary Statistics']);
    worksheet.getRow(3).font = { bold: true, size: 14 };

    worksheet.addRow(['Total Mitigations', totalMitigations]);
    worksheet.addRow(['Tracked Mitigations', trackedMitigations]);
    worksheet.addRow(['Completed', completedMitigations]);
    worksheet.addRow([
      'In Progress',
      this.report.tracking.mitigationTracking.filter(
        (t) => t.status === 'in-progress'
      ).length,
    ]);
    worksheet.addRow([
      'Blocked',
      this.report.tracking.mitigationTracking.filter(
        (t) => t.status === 'blocked'
      ).length,
    ]);

    // Detailed tracking
    worksheet.addRow([]);
    worksheet.addRow(['Detailed Tracking']);
    worksheet.getRow(10).font = { bold: true, size: 14 };

    const trackingHeaders = [
      'Mitigation ID',
      'Status',
      'Progress %',
      'Last Update',
      'Updated By',
      'Notes',
    ];

    worksheet.addRow(trackingHeaders);
    const headerRow = worksheet.getRow(11);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };

    // Add tracking data
    this.report.tracking.mitigationTracking.forEach((tracking) => {
      const lastUpdate = tracking.updates.at(-1);
      worksheet.addRow([
        tracking.mitigationId,
        tracking.status.toUpperCase(),
        tracking.progressPercentage,
        lastUpdate ? new Date(lastUpdate.date).toLocaleDateString() : 'N/A',
        lastUpdate ? lastUpdate.userName : 'N/A',
        lastUpdate ? lastUpdate.note : 'No updates',
      ]);
    });

    // Set column widths
    worksheet.columns = [
      { key: 'id', width: 20 },
      { key: 'status', width: 15 },
      { key: 'progress', width: 12 },
      { key: 'date', width: 15 },
      { key: 'user', width: 20 },
      { key: 'notes', width: 40 },
    ];

    // Add conditional formatting for progress
    const progressColumn = 'C';
    for (let i = 12; i <= worksheet.rowCount; i++) {
      const cell = worksheet.getCell(`${progressColumn}${i}`);
      if (typeof cell.value === 'number') {
        if (cell.value >= 80) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' }, // Light green
          };
        } else if (cell.value >= 50) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }, // Light orange
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' }, // Light red
          };
        }
      }
    }
  }

  private createAuditTrailSheet(): void {
    const worksheet = this.workbook.addWorksheet('Audit Trail');

    // Title
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Audit Trail';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Headers
    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Description',
      'Section',
      'Details',
    ];

    worksheet.addRow([]);
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };

    // Add audit data (most recent first)
    const auditEntries = [...this.report.auditTrail].reverse();
    auditEntries.forEach((entry) => {
      worksheet.addRow([
        new Date(entry.timestamp).toLocaleString(),
        entry.userName,
        entry.action.toUpperCase(),
        entry.description,
        entry.details.section || 'N/A',
        entry.details.reason || 'N/A',
      ]);
    });

    // Set column widths
    worksheet.columns = [
      { key: 'timestamp', width: 20 },
      { key: 'user', width: 20 },
      { key: 'action', width: 15 },
      { key: 'description', width: 40 },
      { key: 'section', width: 20 },
      { key: 'details', width: 30 },
    ];

    // Add filters
    worksheet.autoFilter = {
      from: 'A3',
      to: 'F3',
    };
  }
}
