import type { BiasActivity } from '@/lib/activities/bias-activity';
import type { BiasRiskCategory, LifecycleStage } from '@/lib/types';
import type { BiasEntry } from '@/lib/types/bias-activity';
import {
  type FullReport,
  type Recommendation,
  Report,
  type ReportMetrics,
  type ReportSection,
  type ReportSummary,
} from './report';

export interface BiasReportSummary extends ReportSummary {
  totalBiases: number;
  highRiskBiases: number;
  mediumRiskBiases: number;
  lowRiskBiases: number;
  mitigationsSelected: number;
  completionRate: number;
  topLifecycleStages: string[];
  effectivenessScore: number;
}

export interface BiasFullReport extends FullReport {
  summary: BiasReportSummary;
  biasDetails: BiasDetail[];
  mitigationPlan: MitigationPlan;
  implementationTimeline: Timeline;
  riskMatrix: RiskMatrix;
  recommendations: Recommendation[];
}

export interface BiasDetail {
  biasId: string;
  name: string;
  riskCategory: BiasRiskCategory | null;
  lifecycleStages: LifecycleStage[];
  mitigationCount: number;
  implementationStatus: string;
}

export interface MitigationPlan {
  totalMitigations: number;
  byStage: Record<string, string[]>;
  byEffectiveness: Record<number, string[]>;
  estimatedEffort: string;
}

export interface Timeline {
  phases: TimelinePhase[];
  estimatedDuration: string;
  criticalPath: string[];
}

export interface TimelinePhase {
  stage: string;
  startDate?: string;
  endDate?: string;
  status: string;
  dependencies: string[];
}

export interface RiskMatrix {
  high: string[];
  medium: string[];
  low: string[];
  unassessed: string[];
}

export class BiasReport extends Report {
  protected activity: BiasActivity;
  protected deck: any; // Will be the deck from BiasActivity

  constructor(activity: BiasActivity) {
    super(activity);
    this.activity = activity;
    this.deck = activity.getDeck();
  }

  generateSummary(): BiasReportSummary {
    const biases = this.activity.getBiases();
    const biasEntries = Object.values(biases);

    return {
      title: 'Bias Assessment Report',
      description: `Comprehensive bias assessment for ${this.activity.name}`,
      generatedAt: this.generatedAt,
      activityName: this.activity.name,
      activityId: this.activity.id,
      completionStatus: this.activity.getProgress(),
      totalBiases: biasEntries.length,
      highRiskBiases: this.countByRisk(biasEntries, 'high-risk'),
      mediumRiskBiases: this.countByRisk(biasEntries, 'medium-risk'),
      lowRiskBiases: this.countByRisk(biasEntries, 'low-risk'),
      mitigationsSelected: this.countMitigations(biasEntries),
      completionRate: this.calculateCompletionRate(),
      topLifecycleStages: this.getTopLifecycleStages(biasEntries),
      effectivenessScore: this.calculateEffectivenessScore(biasEntries),
      keyMetrics: {
        totalBiases: biasEntries.length,
        mitigationsSelected: this.countMitigations(biasEntries),
        completionRate: `${Math.round(this.calculateCompletionRate())}%`,
      },
    };
  }

  generateFullReport(): BiasFullReport {
    const summary = this.generateSummary();
    const biases = this.activity.getBiases();
    const biasEntries = Object.values(biases);

    return {
      summary,
      sections: this.generateReportSections(biasEntries),
      metadata: {
        version: '1.0.0',
        format: 'BiasReport',
        generatedBy: 'BiasCards System',
        exportFormats: ['json', 'markdown', 'pdf'],
      },
      biasDetails: this.getBiasDetails(biasEntries),
      mitigationPlan: this.getMitigationPlan(biasEntries),
      implementationTimeline: this.getTimeline(biasEntries),
      riskMatrix: this.generateRiskMatrix(biasEntries),
      recommendations: this.getRecommendations(),
    };
  }

  generateInterimReport(maxStage?: number): BiasFullReport {
    const currentStage = maxStage || this.activity.getCurrentStage();
    const report = this.generateFullReport();

    // Add interim indicators
    report.metadata.isInterim = true;
    report.metadata.maxStage = currentStage;

    // Filter sections based on completed stages
    report.sections = report.sections.filter((section) =>
      this.isSectionAvailableForStage(section.id, currentStage)
    );

    // Update summary to reflect interim status
    report.summary.activityName += ` (Interim Report - Stage ${currentStage})`;

    return report;
  }

  private isSectionAvailableForStage(
    sectionId: string,
    maxStage: number
  ): boolean {
    const stageRequirements: Record<string, number> = {
      overview: 1,
      'risk-assessment': 1,
      'mitigation-plan': 4,
      timeline: 5,
    };

    return maxStage >= (stageRequirements[sectionId] || 1);
  }

  exportToJSON(): object {
    return this.generateFullReport();
  }

  exportToMarkdown(interim = false): string {
    const report = interim
      ? this.generateInterimReport()
      : this.generateFullReport();

    return `# Bias Assessment Report

## Executive Summary
- **Activity**: ${report.summary.activityName}
- **Generated**: ${this.formatDateTime(report.summary.generatedAt)}
- **Total Biases Identified**: ${report.summary.totalBiases}
- **Completion Rate**: ${report.summary.completionRate}%

## Risk Distribution
- **High Risk**: ${report.summary.highRiskBiases} biases
- **Medium Risk**: ${report.summary.mediumRiskBiases} biases
- **Low Risk**: ${report.summary.lowRiskBiases} biases

## Risk Matrix
${this.formatRiskMatrix(report.riskMatrix)}

## Mitigation Strategy
- **Total Mitigations Selected**: ${report.mitigationPlan.totalMitigations}
- **Estimated Effort**: ${report.mitigationPlan.estimatedEffort}
- **Effectiveness Score**: ${report.summary.effectivenessScore}/5

## Top Lifecycle Stages
${report.summary.topLifecycleStages.map((stage) => `- ${stage}`).join('\n')}

## Bias Details
${report.biasDetails.map((bias) => this.formatBiasDetail(bias)).join('\n\n')}

## Recommendations
${report.recommendations.map((rec) => this.formatRecommendation(rec)).join('\n\n')}

---
*Generated: ${this.formatDateTime(this.generatedAt)}*
*Activity ID: ${this.activity.id}*
`;
  }

  exportToPDF(): Promise<Buffer> {
    // PDF export would require a PDF library
    // This is a placeholder implementation
    const markdown = this.exportToMarkdown();
    return Promise.resolve(Buffer.from(markdown, 'utf-8'));
  }

  // Helper methods
  private countByRisk(biases: BiasEntry[], risk: BiasRiskCategory): number {
    return biases.filter((b) => b.riskCategory === risk).length;
  }

  private countMitigations(biases: BiasEntry[]): number {
    let count = 0;
    for (const bias of biases) {
      for (const mitigations of Object.values(bias.mitigations)) {
        count += mitigations.length;
      }
    }
    return count;
  }

  private calculateCompletionRate(): number {
    return this.activity.getProgress();
  }

  private getTopLifecycleStages(biases: BiasEntry[]): string[] {
    const stageCounts: Record<string, number> = {};

    for (const bias of biases) {
      for (const stage of bias.lifecycleAssignments) {
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      }
    }

    return Object.entries(stageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([stage]) => stage);
  }

  private calculateEffectivenessScore(biases: BiasEntry[]): number {
    let totalRating = 0;
    let ratingCount = 0;

    for (const bias of biases) {
      for (const notes of Object.values(bias.implementationNotes)) {
        for (const note of Object.values(notes)) {
          if (note.effectivenessRating) {
            totalRating += note.effectivenessRating;
            ratingCount++;
          }
        }
      }
    }

    return ratingCount > 0 ? Math.round(totalRating / ratingCount) : 3;
  }

  private generateReportSections(biases: BiasEntry[]): ReportSection[] {
    return [
      {
        id: 'overview',
        title: 'Overview',
        content: {
          totalBiases: biases.length,
          assessedBiases: biases.filter((b) => b.riskCategory).length,
          mitigatedBiases: biases.filter(
            (b) => Object.keys(b.mitigations).length > 0
          ).length,
        },
        order: 1,
      },
      {
        id: 'risk-assessment',
        title: 'Risk Assessment',
        content: this.generateRiskMatrix(biases),
        order: 2,
      },
      {
        id: 'mitigation-plan',
        title: 'Mitigation Plan',
        content: this.getMitigationPlan(biases),
        order: 3,
      },
      {
        id: 'timeline',
        title: 'Implementation Timeline',
        content: this.getTimeline(biases),
        order: 4,
      },
    ];
  }

  private getBiasDetails(biases: BiasEntry[]): BiasDetail[] {
    return biases.map((bias) => ({
      biasId: bias.biasId,
      name: bias.name,
      riskCategory: bias.riskCategory,
      lifecycleStages: bias.lifecycleAssignments,
      mitigationCount: Object.values(bias.mitigations).flat().length,
      implementationStatus: this.getImplementationStatus(bias),
    }));
  }

  private getImplementationStatus(bias: BiasEntry): string {
    const hasNotes = Object.keys(bias.implementationNotes).length > 0;
    const hasMitigations = Object.keys(bias.mitigations).length > 0;

    if (!hasMitigations) {
      return 'Not Started';
    }
    if (!hasNotes) {
      return 'Planned';
    }

    // Check implementation note statuses
    const statuses = new Set<string>();
    for (const notes of Object.values(bias.implementationNotes)) {
      for (const note of Object.values(notes)) {
        statuses.add(note.status);
      }
    }

    if (statuses.has('implemented')) {
      return 'Partially Implemented';
    }
    if (statuses.has('in-progress')) {
      return 'In Progress';
    }
    return 'Planned';
  }

  private getMitigationPlan(biases: BiasEntry[]): MitigationPlan {
    const byStage: Record<string, string[]> = {};
    const byEffectiveness: Record<number, string[]> = {};
    let totalMitigations = 0;

    for (const bias of biases) {
      for (const [stage, mitigations] of Object.entries(bias.mitigations)) {
        if (!byStage[stage]) {
          byStage[stage] = [];
        }
        byStage[stage].push(...mitigations);
        totalMitigations += mitigations.length;
      }

      for (const [_stage, notes] of Object.entries(bias.implementationNotes)) {
        for (const [mitigationId, note] of Object.entries(notes)) {
          const rating = note.effectivenessRating;
          if (!byEffectiveness[rating]) {
            byEffectiveness[rating] = [];
          }
          byEffectiveness[rating].push(mitigationId);
        }
      }
    }

    return {
      totalMitigations,
      byStage,
      byEffectiveness,
      estimatedEffort: this.estimateEffort(totalMitigations),
    };
  }

  private estimateEffort(mitigationCount: number): string {
    if (mitigationCount < 5) {
      return 'Low (1-2 weeks)';
    }
    if (mitigationCount < 10) {
      return 'Medium (2-4 weeks)';
    }
    if (mitigationCount < 20) {
      return 'High (1-2 months)';
    }
    return 'Very High (2+ months)';
  }

  private getTimeline(biases: BiasEntry[]): Timeline {
    const stages = new Set<string>();
    for (const bias of biases) {
      for (const stage of bias.lifecycleAssignments) {
        stages.add(stage);
      }
    }

    const phases: TimelinePhase[] = Array.from(stages).map((stage) => ({
      stage,
      status: 'planned',
      dependencies: [],
    }));

    return {
      phases,
      estimatedDuration: this.estimateEffort(phases.length * 3),
      criticalPath: Array.from(stages).slice(0, 3),
    };
  }

  private generateRiskMatrix(biases: BiasEntry[]): RiskMatrix {
    return {
      high: biases
        .filter((b) => b.riskCategory === 'high-risk')
        .map((b) => b.name),
      medium: biases
        .filter((b) => b.riskCategory === 'medium-risk')
        .map((b) => b.name),
      low: biases
        .filter((b) => b.riskCategory === 'low-risk')
        .map((b) => b.name),
      unassessed: biases.filter((b) => !b.riskCategory).map((b) => b.name),
    };
  }

  override getRecommendations(): Recommendation[] {
    const biases = Object.values(this.activity.getBiases());
    const recommendations: Recommendation[] = [];

    // Check for high-risk biases without mitigations
    const highRiskUnmitigated = biases.filter(
      (b) =>
        b.riskCategory === 'high-risk' &&
        Object.keys(b.mitigations).length === 0
    );

    if (highRiskUnmitigated.length > 0) {
      recommendations.push({
        id: 'high-risk-mitigation',
        priority: 'high',
        category: 'Risk Management',
        description: `${highRiskUnmitigated.length} high-risk biases lack mitigation strategies`,
        actionItems: [
          'Prioritize mitigation selection for high-risk biases',
          'Consider multiple mitigation techniques per bias',
          'Document implementation plans',
        ],
      });
    }

    // Check for incomplete assessments
    const unassessed = biases.filter((b) => !b.riskCategory);
    if (unassessed.length > 0) {
      recommendations.push({
        id: 'complete-assessment',
        priority: 'medium',
        category: 'Assessment Completion',
        description: `${unassessed.length} biases have not been risk-assessed`,
        actionItems: [
          'Complete risk assessment for all identified biases',
          'Review and validate existing assessments',
        ],
      });
    }

    // Check for implementation planning
    const noImplementation = biases.filter(
      (b) =>
        Object.keys(b.implementationNotes).length === 0 &&
        Object.keys(b.mitigations).length > 0
    );
    if (noImplementation.length > 0) {
      recommendations.push({
        id: 'implementation-planning',
        priority: 'medium',
        category: 'Implementation',
        description: `${noImplementation.length} biases have mitigations but no implementation plans`,
        actionItems: [
          'Create detailed implementation plans',
          'Assign team members to each mitigation',
          'Set realistic timelines',
        ],
      });
    }

    return recommendations;
  }

  override getMetrics(): ReportMetrics {
    const biases = Object.values(this.activity.getBiases());
    const totalItems = biases.length * 5; // 5 stages per bias
    const completedItems = this.countCompletedItems(biases);

    return {
      totalItems,
      completedItems,
      pendingItems: totalItems - completedItems,
      completionRate: this.activity.getProgress(),
      customMetrics: {
        biasesIdentified: biases.length,
        mitigationsSelected: this.countMitigations(biases),
        averageEffectiveness: this.calculateEffectivenessScore(biases),
      },
    };
  }

  private countCompletedItems(biases: BiasEntry[]): number {
    let completed = 0;
    for (const bias of biases) {
      if (bias.riskCategory) {
        completed++;
      }
      if (bias.lifecycleAssignments.length > 0) {
        completed++;
      }
      if (Object.keys(bias.rationale).length > 0) {
        completed++;
      }
      if (Object.keys(bias.mitigations).length > 0) {
        completed++;
      }
      if (Object.keys(bias.implementationNotes).length > 0) {
        completed++;
      }
    }
    return completed;
  }

  private formatRiskMatrix(matrix: RiskMatrix): string {
    return `
### High Risk (${matrix.high.length})
${matrix.high.map((b) => `- ${b}`).join('\n') || '- None'}

### Medium Risk (${matrix.medium.length})
${matrix.medium.map((b) => `- ${b}`).join('\n') || '- None'}

### Low Risk (${matrix.low.length})
${matrix.low.map((b) => `- ${b}`).join('\n') || '- None'}

### Unassessed (${matrix.unassessed.length})
${matrix.unassessed.map((b) => `- ${b}`).join('\n') || '- None'}
`;
  }

  private formatBiasDetail(bias: BiasDetail): string {
    // Get the full BiasEntry to access rationale and implementation notes
    const biases = this.activity.getBiases();
    const biasEntry = biases[bias.biasId];

    if (!biasEntry) {
      return `### ${bias.name}
- **Risk Level**: ${bias.riskCategory || 'Unassessed'}
- **Lifecycle Stages**: ${bias.lifecycleStages.join(', ') || 'None assigned'}
- **Mitigations**: ${bias.mitigationCount} selected
- **Status**: ${bias.implementationStatus}`;
    }

    let section = `### ${bias.name}
- **Risk Level**: ${bias.riskCategory || 'Unassessed'}
- **Lifecycle Stages**: ${bias.lifecycleStages.join(', ') || 'None assigned'}
- **Mitigations**: ${bias.mitigationCount} selected
- **Status**: ${bias.implementationStatus}

`;

    // Add Stage 3 rationale
    const hasRationale = Object.values(biasEntry.rationale).some(
      (r) => r && r.trim()
    );
    if (hasRationale) {
      section += '#### Rationale by Stage\n';
      for (const [stage, rationale] of Object.entries(biasEntry.rationale)) {
        if (rationale && rationale.trim()) {
          section += `**${stage}**: ${rationale}\n\n`;
        }
      }
    }

    // Add Stage 5 implementation notes
    const hasNotes = Object.keys(biasEntry.implementationNotes).length > 0;
    if (hasNotes) {
      section += '#### Implementation Notes\n';
      for (const [stage, notes] of Object.entries(
        biasEntry.implementationNotes
      )) {
        for (const [mitigationId, note] of Object.entries(notes)) {
          // Get mitigation name if possible
          const mitigationName = this.getMitigationName(mitigationId);
          section += `**${mitigationName} (${stage})**:
- Status: ${note.status}
- Effectiveness: ${note.effectivenessRating}/5
- Notes: ${note.notes || 'No notes'}
${note.dueDate ? `- Due Date: ${note.dueDate}` : ''}
${note.assignedTo ? `- Assigned To: ${note.assignedTo}` : ''}

`;
        }
      }
    }

    return section.trim();
  }

  private getMitigationName(mitigationId: string): string {
    // Try to get mitigation name from deck
    if (this.deck) {
      const card = this.deck.getCard(mitigationId);
      if (card) {
        return card.name;
      }
    }
    return mitigationId;
  }

  private formatRecommendation(rec: Recommendation): string {
    return `### ${rec.description}
- **Priority**: ${rec.priority}
- **Category**: ${rec.category}
${rec.actionItems ? `- **Actions**:\n${rec.actionItems.map((a) => `  - ${a}`).join('\n')}` : ''}`;
  }
}
