import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import type { Report, ReportExportConfig } from '@/lib/types/reports';

export class DocxReportExporter {
  private doc: Document;
  private report: Report;
  private config: ReportExportConfig;

  constructor(report: Report, config: ReportExportConfig) {
    this.report = report;
    this.config = config;
    this.doc = new Document({
      sections: [],
      styles: {
        default: {
          heading1: {
            run: {
              size: 32,
              bold: true,
              color: '2E3F4F',
            },
            paragraph: {
              spacing: { after: 240 },
            },
          },
          heading2: {
            run: {
              size: 26,
              bold: true,
              color: '2E3F4F',
            },
            paragraph: {
              spacing: { before: 240, after: 120 },
            },
          },
          heading3: {
            run: {
              size: 22,
              bold: true,
              color: '4A5568',
            },
            paragraph: {
              spacing: { before: 120, after: 120 },
            },
          },
        },
      },
      creator: 'Bias Cards Report Generator',
      title: this.report.projectInfo.title,
      description: this.report.projectInfo.description,
    });
  }

  async generate(): Promise<Blob> {
    const sections = [];

    // Title Page
    sections.push(this.createTitlePage());

    // Executive Summary
    if (
      this.config.sections.executiveSummary &&
      this.report.analysis.executiveSummary
    ) {
      sections.push(this.createExecutiveSummary());
    }

    // Project Information
    if (this.config.sections.projectInfo) {
      sections.push(this.createProjectInfo());
    }

    // Bias Identification
    if (this.config.sections.biasIdentification) {
      sections.push(this.createBiasIdentification());
    }

    // Mitigation Strategies
    if (this.config.sections.mitigationStrategies) {
      sections.push(this.createMitigationStrategies());
    }

    // Implementation & Tracking
    if (this.config.sections.tracking) {
      sections.push(this.createTrackingSection());
    }

    // Audit Trail
    if (this.config.sections.auditTrail) {
      sections.push(this.createAuditTrail());
    }

    this.doc = new Document({
      ...this.doc,
      sections: sections.map((children) => ({
        properties: {},
        children,
      })),
    });

    return await Packer.toBlob(this.doc);
  }

  private createTitlePage(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Title
    paragraphs.push(
      new Paragraph({
        text: this.report.projectInfo.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );

    // Subtitle
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
        children: [
          new TextRun({
            text: 'Machine Learning Bias Analysis Report',
            size: 28,
            color: '666666',
          }),
        ],
      })
    );

    // Project Domain
    paragraphs.push(
      new Paragraph({
        text: `Domain: ${this.report.projectInfo.domain}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );

    // Report Metadata
    const metadata = [
      `Report ID: ${this.report.id}`,
      `Status: ${this.report.metadata.status.toUpperCase()}`,
      `Version: ${this.report.metadata.version}`,
      `Generated: ${new Date(this.report.metadata.createdAt).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )}`,
    ];

    metadata.forEach((item) => {
      paragraphs.push(
        new Paragraph({
          text: item,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        })
      );
    });

    // Page break
    paragraphs.push(new Paragraph({ text: '', pageBreakBefore: true }));

    return paragraphs;
  }

  private createExecutiveSummary(): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const summary = this.report.analysis.executiveSummary;

    if (!summary) {
      return paragraphs;
    }

    paragraphs.push(
      new Paragraph({
        text: 'Executive Summary',
        heading: HeadingLevel.HEADING_1,
      })
    );

    // Key Findings
    if (summary.keyFindings.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: 'Key Findings',
          heading: HeadingLevel.HEADING_2,
        })
      );

      summary.keyFindings.forEach((finding) => {
        paragraphs.push(
          new Paragraph({
            text: finding,
            bullet: { level: 0 },
            spacing: { after: 120 },
          })
        );
      });
    }

    // Risk Assessment
    if (summary.riskAssessment) {
      paragraphs.push(
        new Paragraph({
          text: 'Risk Assessment',
          heading: HeadingLevel.HEADING_2,
        })
      );

      paragraphs.push(
        new Paragraph({
          text: summary.riskAssessment,
          spacing: { after: 240 },
        })
      );
    }

    // Recommendations
    if (summary.recommendations.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: 'Recommendations',
          heading: HeadingLevel.HEADING_2,
        })
      );

      summary.recommendations.forEach((rec, index) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. `,
                bold: true,
              }),
              new TextRun(rec),
            ],
            spacing: { after: 120 },
          })
        );
      });
    }

    paragraphs.push(new Paragraph({ text: '', pageBreakBefore: true }));

    return paragraphs;
  }

  private createProjectInfo(): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const info = this.report.projectInfo;

    paragraphs.push(
      new Paragraph({
        text: 'Project Information',
        heading: HeadingLevel.HEADING_1,
      })
    );

    // Description
    paragraphs.push(
      new Paragraph({
        text: 'Description',
        heading: HeadingLevel.HEADING_2,
      })
    );
    paragraphs.push(
      new Paragraph({
        text: info.description,
        spacing: { after: 240 },
      })
    );

    // Objectives
    if (info.objectives) {
      paragraphs.push(
        new Paragraph({
          text: 'Objectives',
          heading: HeadingLevel.HEADING_2,
        })
      );
      paragraphs.push(
        new Paragraph({
          text: info.objectives,
          spacing: { after: 240 },
        })
      );
    }

    // Scope
    if (info.scope) {
      paragraphs.push(
        new Paragraph({
          text: 'Scope',
          heading: HeadingLevel.HEADING_2,
        })
      );
      paragraphs.push(
        new Paragraph({
          text: info.scope,
          spacing: { after: 240 },
        })
      );
    }

    // Team Information
    if (info.team?.projectLead.name) {
      paragraphs.push(
        new Paragraph({
          text: 'Team Information',
          heading: HeadingLevel.HEADING_2,
        })
      );

      // Project Lead
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Project Lead: ',
              bold: true,
            }),
            new TextRun(
              `${info.team.projectLead.name} (${info.team.projectLead.role})`
            ),
          ],
          spacing: { after: 120 },
        })
      );

      // Team Members
      if (info.team.members && info.team.members.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: 'Team Members:', bold: true })],
            spacing: { after: 60 },
          })
        );

        info.team.members.forEach((member) => {
          paragraphs.push(
            new Paragraph({
              text: `${member.name} - ${member.role}`,
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        });
      }
    }

    paragraphs.push(new Paragraph({ text: '', pageBreakBefore: true }));

    return paragraphs;
  }

  private createBiasIdentification(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: 'Bias Identification',
        heading: HeadingLevel.HEADING_1,
      })
    );

    paragraphs.push(
      new Paragraph({
        text: `A total of ${this.report.analysis.biasIdentification.reduce(
          (sum, bi) => sum + bi.biases.length,
          0
        )} biases were identified across ${
          this.report.analysis.biasIdentification.length
        } lifecycle stages.`,
        spacing: { after: 240 },
      })
    );

    // For each stage
    this.report.analysis.biasIdentification.forEach((identification) => {
      const stageInfo = LIFECYCLE_STAGES[identification.stage];
      if (!stageInfo) {
        return;
      }

      paragraphs.push(
        new Paragraph({
          text: stageInfo.name,
          heading: HeadingLevel.HEADING_2,
        })
      );

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: stageInfo.description,
              italics: true,
            }),
          ],
          spacing: { after: 180 },
        })
      );

      // Create table for biases
      const tableRows: TableRow[] = [];

      // Header row
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Bias Type',
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                color: 'E5E7EB',
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Description',
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                color: 'E5E7EB',
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Severity',
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                color: 'E5E7EB',
              },
            }),
          ],
        })
      );

      // Data rows
      identification.biases.forEach((bias) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    text: bias.biasCard.title,
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: bias.biasCard.description,
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: bias.severity.toUpperCase(),
                        color: this.getSeverityColor(bias.severity),
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      });

      const table = new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      paragraphs.push(table as any); // Type assertion needed due to docx typing
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 240 } }));
    });

    paragraphs.push(new Paragraph({ text: '', pageBreakBefore: true }));

    return paragraphs;
  }

  private createMitigationStrategies(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: 'Mitigation Strategies',
        heading: HeadingLevel.HEADING_1,
      })
    );

    paragraphs.push(
      new Paragraph({
        text: `${this.report.analysis.mitigationStrategies.length} mitigation strategies have been identified to address the detected biases.`,
        spacing: { after: 240 },
      })
    );

    this.report.analysis.mitigationStrategies.forEach((strategy, index) => {
      paragraphs.push(
        new Paragraph({
          text: `Strategy ${index + 1}`,
          heading: HeadingLevel.HEADING_3,
        })
      );

      strategy.mitigations.forEach((mitigation) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Mitigation: ',
                bold: true,
              }),
              new TextRun(mitigation.mitigationCard.title),
            ],
            spacing: { after: 60 },
          })
        );

        paragraphs.push(
          new Paragraph({
            text: mitigation.mitigationCard.description,
            spacing: { after: 120 },
          })
        );

        // Implementation details
        const details = [
          { label: 'Timeline', value: mitigation.timeline },
          { label: 'Responsible', value: mitigation.responsible },
          { label: 'Priority', value: mitigation.priority },
          { label: 'Success Criteria', value: mitigation.successCriteria },
        ];

        details.forEach((detail) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${detail.label}: `,
                  bold: true,
                }),
                new TextRun(detail.value),
              ],
              indent: { left: 720 }, // 0.5 inch indent
              spacing: { after: 60 },
            })
          );
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 180 } }));
      });
    });

    return paragraphs;
  }

  private createTrackingSection(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: 'Implementation Tracking',
        heading: HeadingLevel.HEADING_1,
      })
    );

    if (this.report.tracking.mitigationTracking.length === 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'No mitigation tracking data available yet.',
              italics: true,
            }),
          ],
          spacing: { after: 240 },
        })
      );
      return paragraphs;
    }

    this.report.tracking.mitigationTracking.forEach((tracking) => {
      paragraphs.push(
        new Paragraph({
          text: `Mitigation ID: ${tracking.mitigationId}`,
          heading: HeadingLevel.HEADING_3,
        })
      );

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Status: ',
              bold: true,
            }),
            new TextRun(tracking.status.toUpperCase()),
            new TextRun({
              text: ` (${tracking.progressPercentage}% complete)`,
              italics: true,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      if (tracking.updates.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Updates:',
                bold: true,
              }),
            ],
            spacing: { after: 60 },
          })
        );

        tracking.updates.forEach((update) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${new Date(update.date).toLocaleDateString()} - `,
                  bold: true,
                }),
                new TextRun(`${update.userName}: ${update.note}`),
              ],
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        });
      }

      paragraphs.push(new Paragraph({ text: '', spacing: { after: 240 } }));
    });

    return paragraphs;
  }

  private createAuditTrail(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: 'Audit Trail',
        heading: HeadingLevel.HEADING_1,
      })
    );

    paragraphs.push(
      new Paragraph({
        text: 'Recent changes and updates to this report:',
        spacing: { after: 180 },
      })
    );

    // Take last 10 entries
    const recentEntries = this.report.auditTrail.slice(-10).reverse();

    recentEntries.forEach((entry) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${new Date(entry.timestamp).toLocaleString()} - `,
              bold: true,
            }),
            new TextRun({
              text: `${entry.action.toUpperCase()} - `,
              underline: { type: UnderlineType.SINGLE },
            }),
            new TextRun(entry.description),
            new TextRun({
              text: ` (by ${entry.userName})`,
              italics: true,
            }),
          ],
          spacing: { after: 60 },
        })
      );
    });

    return paragraphs;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'high':
        return 'DC2626'; // Red
      case 'medium':
        return 'D97706'; // Orange
      case 'low':
        return '059669'; // Green
      default:
        return '6B7280'; // Gray
    }
  }
}
