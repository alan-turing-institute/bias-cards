import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import type { ProjectInfo } from '@/lib/types/project-info';
import type {
  BiasIdentification,
  MitigationStrategy,
  Report,
  ReportExportConfig,
} from '@/lib/types/reports';

export class MarkdownReportExporter {
  private report: Report;
  private config: ReportExportConfig;

  constructor(report: Report, config: ReportExportConfig) {
    this.report = report;
    this.config = config;
  }

  generate(): string {
    const sections: string[] = [];

    // Title and metadata
    sections.push(this.createHeader());

    // Table of Contents
    sections.push(this.createTableOfContents());

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

    // Comments
    if (this.config.sections.comments) {
      sections.push(this.createCommentsSection());
    }

    // Audit Trail
    if (this.config.sections.auditTrail) {
      sections.push(this.createAuditTrail());
    }

    // Appendices
    if (this.config.sections.appendices) {
      sections.push(this.createAppendices());
    }

    return sections.join('\n\n---\n\n');
  }

  private createHeader(): string {
    const metadata = [
      `# ${this.report.projectInfo.title}`,
      '',
      '## Machine Learning Bias Analysis Report',
      '',
      '### Report Metadata',
      '',
      `- **Report ID:** ${this.report.id}`,
      `- **Status:** ${this.report.metadata.status.toUpperCase()}`,
      `- **Version:** ${this.report.metadata.version}`,
      `- **Domain:** ${this.report.projectInfo.domain}`,
      `- **Generated:** ${new Date(
        this.report.metadata.createdAt
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      `- **Last Modified:** ${new Date(
        this.report.metadata.lastModified
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    ];

    if (this.report.metadata.templateId) {
      metadata.push(`- **Template:** ${this.report.metadata.templateId}`);
    }

    return metadata.join('\n');
  }

  private createTableOfContents(): string {
    const toc = ['## Table of Contents', ''];

    let sectionNumber = 1;

    if (
      this.config.sections.executiveSummary &&
      this.report.analysis.executiveSummary
    ) {
      toc.push(`${sectionNumber}. [Executive Summary](#executive-summary)`);
      sectionNumber++;
    }

    if (this.config.sections.projectInfo) {
      toc.push(`${sectionNumber}. [Project Information](#project-information)`);
      sectionNumber++;
    }

    if (this.config.sections.biasIdentification) {
      toc.push(`${sectionNumber}. [Bias Identification](#bias-identification)`);
      sectionNumber++;
    }

    if (this.config.sections.mitigationStrategies) {
      toc.push(
        `${sectionNumber}. [Mitigation Strategies](#mitigation-strategies)`
      );
      sectionNumber++;
    }

    if (this.config.sections.tracking) {
      toc.push(
        `${sectionNumber}. [Implementation Tracking](#implementation-tracking)`
      );
      sectionNumber++;
    }

    if (this.config.sections.comments) {
      toc.push(
        `${sectionNumber}. [Comments & Annotations](#comments--annotations)`
      );
      sectionNumber++;
    }

    if (this.config.sections.auditTrail) {
      toc.push(`${sectionNumber}. [Audit Trail](#audit-trail)`);
      sectionNumber++;
    }

    if (this.config.sections.appendices) {
      toc.push(`${sectionNumber}. [Appendices](#appendices)`);
    }

    return toc.join('\n');
  }

  private createExecutiveSummary(): string {
    const summary = this.report.analysis.executiveSummary;
    if (!summary) {
      return '';
    }

    const sections = ['## Executive Summary', ''];

    // Key Findings
    if (summary.keyFindings.length > 0) {
      sections.push('### Key Findings', '');
      for (const finding of summary.keyFindings) {
        sections.push(`- ${finding}`);
      }
      sections.push('');
    }

    // Risk Assessment
    if (summary.riskAssessment) {
      sections.push('### Risk Assessment', '');
      sections.push(summary.riskAssessment);
      sections.push('');
    }

    // Recommendations
    if (summary.recommendations.length > 0) {
      sections.push('### Recommendations', '');
      let recIndex = 0;
      for (const rec of summary.recommendations) {
        sections.push(`${recIndex + 1}. ${rec}`);
        recIndex++;
      }
      sections.push('');
    }

    // Business Impact
    if (summary.businessImpact) {
      sections.push('### Business Impact', '');
      sections.push(summary.businessImpact);
    }

    return sections.join('\n');
  }

  private addProjectDescription(sections: string[], info: ProjectInfo): void {
    sections.push('### Description', '');
    sections.push(info.description);
    sections.push('');
  }

  private addProjectObjectivesAndScope(
    sections: string[],
    info: ProjectInfo
  ): void {
    if (info.objectives) {
      sections.push('### Objectives', '');
      sections.push(info.objectives);
      sections.push('');
    }

    if (info.scope) {
      sections.push('### Scope', '');
      sections.push(info.scope);
      sections.push('');
    }
  }

  private addProjectTimeline(sections: string[], info: ProjectInfo): void {
    if (
      !(info.timeline && (info.timeline.startDate || info.timeline.endDate))
    ) {
      return;
    }

    sections.push('### Timeline', '');
    if (info.timeline.startDate) {
      sections.push(`- **Start Date:** ${info.timeline.startDate}`);
    }
    if (info.timeline.endDate) {
      sections.push(`- **End Date:** ${info.timeline.endDate}`);
    }
    if (info.timeline.milestones && info.timeline.milestones.length > 0) {
      sections.push('');
      sections.push('#### Key Milestones');
      for (const milestone of info.timeline.milestones) {
        sections.push(
          `- ${milestone.targetDate}: ${milestone.name} - ${milestone.description}`
        );
      }
    }
    sections.push('');
  }

  private addProjectTeam(sections: string[], info: ProjectInfo): void {
    if (!info.team?.projectLead.name) {
      return;
    }

    sections.push('### Team Information', '');
    sections.push(
      `**Project Lead:** ${info.team.projectLead.name} (${info.team.projectLead.role})`
    );
    sections.push('');

    if (info.team.members && info.team.members.length > 0) {
      sections.push('**Team Members:**');
      for (const member of info.team.members) {
        sections.push(`- ${member.name} - ${member.role}`);
      }
      sections.push('');
    }

    if (info.team.stakeholders && info.team.stakeholders.length > 0) {
      sections.push('**Stakeholders:**');
      for (const stakeholder of info.team.stakeholders) {
        sections.push(
          `- ${stakeholder.name} - ${stakeholder.role} (${stakeholder.involvement})`
        );
      }
    }
  }

  private createProjectInfo(): string {
    const info = this.report.projectInfo;
    const sections = ['## Project Information', ''];

    this.addProjectDescription(sections, info);
    this.addProjectObjectivesAndScope(sections, info);
    this.addProjectTimeline(sections, info);
    this.addProjectTeam(sections, info);

    return sections.join('\n');
  }

  private addBiasSummary(sections: string[]): void {
    const totalBiases = this.report.analysis.biasIdentification.reduce(
      (sum, bi) => sum + bi.biases.length,
      0
    );

    sections.push(
      `A total of **${totalBiases} biases** were identified across **${this.report.analysis.biasIdentification.length} lifecycle stages**.`
    );
    sections.push('');
  }

  private addBiasTable(
    sections: string[],
    identification: BiasIdentification
  ): void {
    sections.push(
      '| Bias Type | Description | Severity | Confidence |',
      '|-----------|-------------|----------|------------|'
    );

    for (const bias of identification.biases) {
      sections.push(
        `| **${bias.biasCard.title}** | ${this.escapeMarkdown(
          bias.biasCard.description
        )} | ${this.getSeverityBadge(bias.severity)} | ${bias.confidence} |`
      );
    }

    sections.push('');
  }

  private addStageContext(
    sections: string[],
    identification: BiasIdentification
  ): void {
    const biasesWithContext = identification.biases.filter(
      (b) => b.stageContext
    );
    if (biasesWithContext.length === 0) {
      return;
    }

    sections.push('#### Stage-Specific Context', '');
    for (const bias of biasesWithContext) {
      if (!bias.stageContext) {
        continue;
      }

      sections.push(`**${bias.biasCard.title}:**`);
      if (bias.stageContext.potentialImpact) {
        sections.push(
          `- *Potential Impact:* ${bias.stageContext.potentialImpact}`
        );
      }
      if (bias.stageContext.evidence) {
        sections.push(`- *Evidence:* ${bias.stageContext.evidence}`);
      }
      sections.push('');
    }
  }

  private createBiasIdentification(): string {
    const sections = ['## Bias Identification', ''];

    this.addBiasSummary(sections);

    // For each stage
    for (const identification of this.report.analysis.biasIdentification) {
      const stageInfo = LIFECYCLE_STAGES[identification.stage];
      if (!stageInfo) {
        continue;
      }

      sections.push(`### ${stageInfo.name}`, '');
      sections.push(`*${stageInfo.description}*`);
      sections.push('');

      this.addBiasTable(sections, identification);
      this.addStageContext(sections, identification);
    }

    return sections.join('\n');
  }

  private addMitigationDetails(
    sections: string[],
    mitigation: MitigationStrategy['mitigations'][0]
  ): void {
    sections.push('**Implementation Details:**');
    sections.push(`- **Timeline:** ${mitigation.timeline}`);
    sections.push(`- **Responsible:** ${mitigation.responsible}`);
    sections.push(
      `- **Priority:** ${this.getPriorityBadge(mitigation.priority)}`
    );
    sections.push(`- **Success Criteria:** ${mitigation.successCriteria}`);
  }

  private addMitigationEffort(
    sections: string[],
    mitigation: MitigationStrategy['mitigations'][0]
  ): void {
    if (!mitigation.effort) {
      return;
    }

    sections.push('');
    sections.push('**Effort Estimation:**');
    sections.push(`- **Time Estimate:** ${mitigation.effort.timeEstimate}`);
    sections.push(`- **Complexity:** ${mitigation.effort.complexity}`);

    if (mitigation.effort.resourceRequirements.length > 0) {
      sections.push('- **Resources Required:**');
      for (const resource of mitigation.effort.resourceRequirements) {
        sections.push(`  - ${resource}`);
      }
    }
  }

  private addMitigationDependencies(
    sections: string[],
    mitigation: MitigationStrategy['mitigations'][0]
  ): void {
    if (!mitigation.dependencies || mitigation.dependencies.length === 0) {
      return;
    }

    sections.push('');
    sections.push('**Dependencies:**');
    for (const dep of mitigation.dependencies) {
      sections.push(`- ${dep}`);
    }
  }

  private addSingleMitigation(
    sections: string[],
    mitigation: MitigationStrategy['mitigations'][0],
    index: number
  ): void {
    sections.push(`#### ${index + 1}. ${mitigation.mitigationCard.title}`, '');
    sections.push(mitigation.mitigationCard.description);
    sections.push('');

    this.addMitigationDetails(sections, mitigation);
    this.addMitigationEffort(sections, mitigation);
    this.addMitigationDependencies(sections, mitigation);

    sections.push('');
  }

  private createMitigationStrategies(): string {
    const sections = ['## Mitigation Strategies', ''];

    sections.push(
      `**${this.report.analysis.mitigationStrategies.length} mitigation strategies** have been identified to address the detected biases.`
    );
    sections.push('');

    let strategyIndex = 0;
    for (const strategy of this.report.analysis.mitigationStrategies) {
      sections.push(`### Mitigation Strategy ${strategyIndex + 1}`, '');
      strategyIndex++;
      sections.push(`**Addresses Bias:** ${strategy.biasId}`);
      sections.push('');

      let mIndex = 0;
      for (const mitigation of strategy.mitigations) {
        this.addSingleMitigation(sections, mitigation, mIndex);
        mIndex++;
      }
    }

    return sections.join('\n');
  }

  private createTrackingSection(): string {
    const sections = ['## Implementation Tracking', ''];

    if (this.report.tracking.mitigationTracking.length === 0) {
      sections.push('*No mitigation tracking data available yet.*');
      return sections.join('\n');
    }

    // Summary statistics
    const stats = {
      total: this.report.tracking.mitigationTracking.length,
      completed: this.report.tracking.mitigationTracking.filter(
        (t) => t.status === 'completed'
      ).length,
      inProgress: this.report.tracking.mitigationTracking.filter(
        (t) => t.status === 'in-progress'
      ).length,
      blocked: this.report.tracking.mitigationTracking.filter(
        (t) => t.status === 'blocked'
      ).length,
      planned: this.report.tracking.mitigationTracking.filter(
        (t) => t.status === 'planned'
      ).length,
    };

    sections.push('### Summary', '');
    sections.push(
      `- **Total Tracked:** ${stats.total}`,
      `- **Completed:** ${stats.completed} (${Math.round(
        (stats.completed / stats.total) * 100
      )}%)`,
      `- **In Progress:** ${stats.inProgress}`,
      `- **Blocked:** ${stats.blocked}`,
      `- **Planned:** ${stats.planned}`
    );
    sections.push('');

    // Detailed tracking
    sections.push('### Detailed Progress', '');

    for (const tracking of this.report.tracking.mitigationTracking) {
      sections.push(`#### Mitigation: ${tracking.mitigationId}`, '');
      sections.push(
        `- **Status:** ${this.getStatusBadge(tracking.status)}`,
        `- **Progress:** ${tracking.progressPercentage}%`
      );
      sections.push('');

      if (tracking.updates.length > 0) {
        sections.push('**Recent Updates:**');
        // Show last 3 updates
        for (const update of tracking.updates.slice(-3)) {
          sections.push(
            `- ${new Date(update.date).toLocaleDateString()} - **${
              update.userName
            }**: ${update.note}`
          );
        }
        sections.push('');
      }

      if (tracking.issues && tracking.issues.length > 0) {
        sections.push('**Issues:**');
        for (const issue of tracking.issues) {
          sections.push(
            `- [${issue.severity.toUpperCase()}] ${issue.title} - ${issue.status}`
          );
        }
        sections.push('');
      }
    }

    return sections.join('\n');
  }

  private createCommentsSection(): string {
    const sections = ['## Comments & Annotations', ''];

    // This would need to be integrated with the comments store
    sections.push('*Comments section to be implemented*');

    return sections.join('\n');
  }

  private createAuditTrail(): string {
    const sections = ['## Audit Trail', ''];

    sections.push('### Recent Changes', '');

    // Show last 10 entries
    const recentEntries = this.report.auditTrail.slice(-10).reverse();

    sections.push(
      '| Date | User | Action | Description |',
      '|------|------|--------|-------------|'
    );

    for (const entry of recentEntries) {
      sections.push(
        `| ${new Date(entry.timestamp).toLocaleString()} | ${
          entry.userName
        } | ${entry.action.toUpperCase()} | ${this.escapeMarkdown(
          entry.description
        )} |`
      );
    }

    return sections.join('\n');
  }

  private createAppendices(): string {
    const sections = ['## Appendices', ''];

    sections.push('### A. Bias Categories', '');
    sections.push(
      '- **Cognitive Biases**: Mental shortcuts and patterns that affect decision-making',
      '- **Social Biases**: Biases arising from societal structures and group dynamics',
      '- **Statistical Biases**: Mathematical and data-related biases in ML systems'
    );
    sections.push('');

    sections.push('### B. Severity Levels', '');
    sections.push(
      '- **High**: Critical impact requiring immediate attention',
      '- **Medium**: Significant impact requiring planned mitigation',
      '- **Low**: Minor impact that should be monitored'
    );
    sections.push('');

    sections.push('### C. References', '');
    if (this.report.relationships?.externalReferences) {
      for (const ref of this.report.relationships.externalReferences) {
        sections.push(`- [${ref.title}](${ref.url}) - ${ref.type}`);
      }
    } else {
      sections.push('*No external references provided*');
    }

    return sections.join('\n');
  }

  private escapeMarkdown(text: string): string {
    // Escape special markdown characters
    return text
      .replace(/\|/g, '\\|')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\n/g, ' ');
  }

  private getSeverityBadge(severity: string): string {
    switch (severity) {
      case 'high':
        return '🔴 HIGH';
      case 'medium':
        return '🟡 MEDIUM';
      case 'low':
        return '🟢 LOW';
      default:
        return severity.toUpperCase();
    }
  }

  private getPriorityBadge(priority: string): string {
    switch (priority) {
      case 'high':
        return '⚡ HIGH';
      case 'medium':
        return '🔸 MEDIUM';
      case 'low':
        return '🔹 LOW';
      default:
        return priority.toUpperCase();
    }
  }

  private getStatusBadge(status: string): string {
    switch (status) {
      case 'completed':
        return '✅ Completed';
      case 'in-progress':
        return '🔄 In Progress';
      case 'blocked':
        return '🚫 Blocked';
      case 'planned':
        return '📋 Planned';
      case 'cancelled':
        return '❌ Cancelled';
      default:
        return status.toUpperCase();
    }
  }
}
