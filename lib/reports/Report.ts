import type { Activity } from '@/lib/activities/activity';

export interface ReportSummary {
  title: string;
  description: string;
  generatedAt: Date;
  activityName: string;
  activityId: string;
  completionStatus: number;
  keyMetrics: Record<string, number | string>;
}

export interface FullReport {
  summary: ReportSummary;
  sections: ReportSection[];
  metadata: ReportMetadata;
}

export interface ReportSection {
  id: string;
  title: string;
  content: unknown;
  order: number;
}

export interface ReportMetadata {
  version: string;
  format: string;
  generatedBy: string;
  exportFormats: string[];
}

export interface ReportMetrics {
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  completionRate: number;
  customMetrics?: Record<string, number>;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  actionItems?: string[];
}

export abstract class Report {
  protected activity: Activity;
  protected generatedAt: Date;

  constructor(activity: Activity) {
    this.activity = activity;
    this.generatedAt = new Date();
  }

  abstract generateSummary(): ReportSummary;
  abstract generateFullReport(): FullReport;
  abstract exportToJSON(): object;
  abstract exportToMarkdown(): string;
  abstract exportToPDF(): Promise<Buffer>;

  // Common methods
  getMetrics(): ReportMetrics {
    return {
      totalItems: 0,
      completedItems: 0,
      pendingItems: 0,
      completionRate: this.activity.getProgress(),
    };
  }

  getRecommendations(): Recommendation[] {
    // Default implementation returns empty array
    // Subclasses should override with specific recommendations
    return [];
  }

  validate(): boolean {
    // Validate that the activity is in a valid state for reporting
    const validationResult = this.activity.validate();
    return validationResult.valid;
  }

  getGeneratedAt(): Date {
    return this.generatedAt;
  }

  getActivityName(): string {
    return this.activity.name;
  }

  getActivityId(): string {
    return this.activity.id;
  }

  // Helper methods for formatting
  protected formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  protected formatTime(date: Date): string {
    return date.toISOString().split('T')[1].split('.')[0];
  }

  protected formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  protected formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  protected formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}
