import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import type {
  Card,
  CardPair,
  StageAssignment,
  WorkspaceState,
} from '@/lib/types';

export interface ReportConfig {
  includeExecutiveSummary: boolean;
  includeStageAnalysis: boolean;
  includeMitigationStrategies: boolean;
  includeAnnotations: boolean;
  includeRecommendations: boolean;
  includeVisualization: boolean;
  authorName?: string;
  projectName?: string;
}

export interface ReportData {
  workspace: WorkspaceState;
  biasCards: Card[];
  mitigationCards: Card[];
  config: ReportConfig;
}

export class BiasCardReportGenerator {
  private pdf: jsPDF;
  private currentY = 20;
  private pageHeight = 297; // A4 height in mm
  private pageWidth = 210; // A4 width in mm
  private margin = 20;
  private contentWidth: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.contentWidth = this.pageWidth - this.margin * 2;
  }

  async generateReport(data: ReportData): Promise<Blob> {
    const { workspace, biasCards, mitigationCards, config } = data;

    // Reset PDF state
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.currentY = 20;

    // Generate report sections
    this.addTitle(
      config.projectName || workspace.name || 'ML Bias Analysis Report'
    );
    this.addMetadata(workspace, config);

    if (config.includeExecutiveSummary) {
      this.addExecutiveSummary(workspace, biasCards, mitigationCards);
    }

    if (config.includeStageAnalysis) {
      this.addStageAnalysis(workspace, biasCards, mitigationCards);
    }

    if (config.includeMitigationStrategies) {
      this.addMitigationStrategies(workspace, biasCards, mitigationCards);
    }

    if (config.includeAnnotations) {
      this.addAnnotations(workspace, biasCards, mitigationCards);
    }

    if (config.includeRecommendations) {
      this.addRecommendations(workspace, biasCards, mitigationCards);
    }

    if (config.includeVisualization) {
      await this.addVisualization();
    }

    return this.pdf.output('blob');
  }

  private addTitle(title: string): void {
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 15;

    // Add subtitle
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      'Machine Learning Bias Analysis Report',
      this.margin,
      this.currentY
    );
    this.currentY += 20;
  }

  private addMetadata(workspace: WorkspaceState, config: ReportConfig): void {
    this.checkPageBreak(30);

    this.pdf.setFontSize(10);
    this.pdf.setTextColor(60, 60, 60);

    const metadata = [
      `Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      `Session ID: ${workspace.sessionId?.split('-')[1] || 'N/A'}`,
      `Cards Assigned: ${workspace.stageAssignments || []?.length || 0}`,
      `Mitigation Pairs: ${workspace.cardPairs || []?.length || 0}`,
    ];

    if (config.authorName) {
      metadata.unshift(`Author: ${config.authorName}`);
    }

    for (const line of metadata) {
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += 4;
    }

    this.currentY += 10;
    this.addSeparator();
  }

  private addExecutiveSummary(
    workspace: WorkspaceState,
    biasCards: Card[],
    mitigationCards: Card[]
  ): void {
    this.addSectionHeader('Executive Summary');

    const stageCount = new Set(
      (workspace.stageAssignments || []).map((a) => a.stage)
    ).size;
    const biasCount = (workspace.stageAssignments || []).filter((a) =>
      biasCards.some((b) => b.id === a.cardId)
    ).length;
    const mitigationCount = (workspace.stageAssignments || []).filter((a) =>
      mitigationCards.some((m) => m.id === a.cardId)
    ).length;
    const pairCount = (workspace.cardPairs || []).length;

    const summary = [
      `This analysis examined ${biasCount} potential biases across ${stageCount} stages of the machine learning lifecycle.`,
      `${mitigationCount} mitigation strategies were identified and ${pairCount} bias-mitigation pairs were established.`,
      '',
      'Key findings:',
      `• Bias hotspots identified in ${stageCount} lifecycle stages`,
      `• ${pairCount} targeted mitigation strategies recommended`,
      `• ${workspace.customAnnotations ? Object.keys(workspace.customAnnotations).length : 0} custom annotations documented`,
    ];

    if (workspace.activityProgress) {
      summary.push(
        `• Activity completion: ${workspace.activityProgress.completionPercentage}%`
      );
    }

    this.addParagraphs(summary);
    this.currentY += 10;
  }

  private renderStageHeader(stageInfo: {
    name: string;
    phase: string;
    order: number;
    description: string;
  }): void {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(stageInfo.name, this.margin, this.currentY);
    this.currentY += 6;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(80, 80, 80);
    const description = this.wrapText(
      stageInfo.description,
      this.contentWidth - 10
    );
    for (const line of description) {
      this.pdf.text(line, this.margin + 5, this.currentY);
      this.currentY += 4;
    }
    this.currentY += 3;
  }

  private renderAssignmentCard(
    assignment: StageAssignment,
    biasCards: Card[],
    mitigationCards: Card[]
  ): void {
    const card = [...biasCards, ...mitigationCards].find(
      (c) => c.id === assignment.cardId
    );
    if (!card) {
      return;
    }

    this.pdf.setFontSize(9);
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text(`• ${card.name}`, this.margin + 10, this.currentY);
    this.currentY += 4;

    if (assignment.annotation) {
      this.pdf.setTextColor(100, 100, 100);
      const annotationLines = this.wrapText(
        `  "${assignment.annotation}"`,
        this.contentWidth - 20
      );
      for (const line of annotationLines) {
        this.pdf.text(line, this.margin + 15, this.currentY);
        this.currentY += 3.5;
      }
    }
  }

  private addStageAnalysis(
    workspace: WorkspaceState,
    biasCards: Card[],
    mitigationCards: Card[]
  ): void {
    this.addSectionHeader('Lifecycle Stage Analysis');

    // Group assignments by stage
    const stageGroups = (workspace.stageAssignments || []).reduce(
      (groups, assignment) => {
        if (!groups[assignment.stage]) {
          groups[assignment.stage] = [];
        }
        groups[assignment.stage].push(assignment);
        return groups;
      },
      {} as Record<string, StageAssignment[]>
    );

    for (const [stage, assignments] of Object.entries(stageGroups) as [
      string,
      StageAssignment[],
    ][]) {
      const stageInfo =
        LIFECYCLE_STAGES[stage as keyof typeof LIFECYCLE_STAGES];
      if (!stageInfo) {
        continue;
      }

      this.checkPageBreak(40);
      this.renderStageHeader(stageInfo);

      // List assigned cards
      for (const assignment of assignments) {
        this.renderAssignmentCard(assignment, biasCards, mitigationCards);
      }

      this.currentY += 5;
    }
  }

  private addMitigationStrategies(
    workspace: WorkspaceState,
    biasCards: Card[],
    mitigationCards: Card[]
  ): void {
    this.addSectionHeader('Mitigation Strategies');

    if (workspace.cardPairs || [].length === 0) {
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(
        'No bias-mitigation pairs have been established.',
        this.margin,
        this.currentY
      );
      this.currentY += 15;
      return;
    }

    for (const [index, pair] of (
      workspace.cardPairs || ([] as CardPair[])
    ).entries()) {
      this.checkPageBreak(25);

      const biasCard = biasCards.find((b) => b.id === pair.biasId);
      const mitigationCard = mitigationCards.find(
        (m) => m.id === pair.mitigationId
      );

      if (!(biasCard && mitigationCard)) {
        return;
      }

      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(
        `${index + 1}. ${biasCard.name} → ${mitigationCard.name}`,
        this.margin,
        this.currentY
      );
      this.currentY += 6;

      if (pair.effectivenessRating) {
        this.pdf.setFontSize(9);
        this.pdf.setTextColor(80, 80, 80);
        this.pdf.text(
          `Effectiveness Rating: ${pair.effectivenessRating}/5`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += 4;
      }

      if (pair.annotation) {
        this.pdf.setFontSize(9);
        this.pdf.setTextColor(60, 60, 60);
        const annotationLines = this.wrapText(
          pair.annotation,
          this.contentWidth - 10
        );
        for (const line of annotationLines) {
          this.pdf.text(line, this.margin + 5, this.currentY);
          this.currentY += 4;
        }
      }

      this.currentY += 5;
    }
  }

  private addAnnotations(
    workspace: WorkspaceState,
    biasCards: Card[],
    mitigationCards: Card[]
  ): void {
    if (
      !workspace.customAnnotations ||
      Object.keys(workspace.customAnnotations).length === 0
    ) {
      return;
    }

    this.addSectionHeader('Custom Annotations');

    for (const [cardId, annotation] of Object.entries(
      workspace.customAnnotations
    )) {
      this.checkPageBreak(15);

      const card = [...biasCards, ...mitigationCards].find(
        (c) => c.id === cardId
      );
      if (!card) {
        return;
      }

      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(card.name, this.margin, this.currentY);
      this.currentY += 5;

      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(60, 60, 60);
      const annotationLines = this.wrapText(annotation, this.contentWidth - 10);
      for (const line of annotationLines) {
        this.pdf.text(line, this.margin + 5, this.currentY);
        this.currentY += 4;
      }

      this.currentY += 5;
    }
  }

  private addRecommendations(
    _workspace: WorkspaceState,
    _biasCards: Card[],
    _mitigationCards: Card[]
  ): void {
    this.addSectionHeader('Next Steps & Recommendations');

    const recommendations = [
      '1. Implementation Planning',
      '   • Prioritize mitigation strategies based on effectiveness ratings',
      '   • Develop implementation timeline for each mitigation',
      '   • Assign ownership and responsibilities',
      '',
      '2. Monitoring and Evaluation',
      '   • Establish metrics to measure bias reduction',
      '   • Set up regular bias auditing processes',
      '   • Create feedback loops for continuous improvement',
      '',
      '3. Stakeholder Engagement',
      '   • Share findings with relevant teams and stakeholders',
      '   • Conduct training on identified biases and mitigations',
      '   • Establish bias review processes for future projects',
      '',
      '4. Documentation and Knowledge Sharing',
      '   • Document lessons learned and best practices',
      '   • Create bias awareness materials for the organization',
      '   • Contribute to organizational bias mitigation frameworks',
    ];

    this.addParagraphs(recommendations);
  }

  private async addVisualization(): Promise<void> {
    this.addSectionHeader('Project Lifecycle Visualization');

    try {
      // Attempt to capture the lifecycle diagram
      const lifecycleElement = document.querySelector(
        '[data-testid="lifecycle-diagram"]'
      ) as HTMLElement;

      if (lifecycleElement) {
        const canvas = await html2canvas(lifecycleElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = this.contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a page break for the image
        this.checkPageBreak(imgHeight + 10);

        this.pdf.addImage(
          imgData,
          'PNG',
          this.margin,
          this.currentY,
          imgWidth,
          Math.min(imgHeight, 150) // Cap height at 150mm
        );

        this.currentY += Math.min(imgHeight, 150) + 10;
      } else {
        // Fallback if element not found
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(100, 100, 100);
        this.pdf.text(
          'Lifecycle diagram not available for capture.',
          this.margin,
          this.currentY
        );
        this.currentY += 10;
      }
    } catch (_error) {
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(
        'Visualization capture failed.',
        this.margin,
        this.currentY
      );
      this.currentY += 10;
    }
  }

  private addSectionHeader(title: string): void {
    this.checkPageBreak(20);

    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addParagraphs(lines: string[]): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(40, 40, 40);

    for (const line of lines) {
      if (line === '') {
        this.currentY += 3;
        return;
      }

      this.checkPageBreak(8);
      const wrappedLines = this.wrapText(line, this.contentWidth);
      for (const wrappedLine of wrappedLines) {
        this.pdf.text(wrappedLine, this.margin, this.currentY);
        this.currentY += 4.5;
      }
    }
  }

  private addSeparator(): void {
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY
    );
    this.currentY += 10;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = this.pdf.getTextWidth(testLine);

      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}

export async function generateBiasReport(data: ReportData): Promise<Blob> {
  const generator = new BiasCardReportGenerator();
  return await generator.generateReport(data);
}

export function downloadReport(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
