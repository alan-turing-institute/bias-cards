import type { BiasCard, LifecycleStage, MitigationCard } from './cards';
import type { Comment } from './comments';
import type { ProjectInfo } from './project-info';

/**
 * Report status tracking through its lifecycle
 */
export type ReportStatus = 'draft' | 'final' | 'updated' | 'archived';

/**
 * Report export formats supported by the system
 */
export type ReportFormat = 'pdf' | 'json' | 'docx' | 'markdown';

/**
 * User permissions for report access and modification
 */
export interface ReportPermissions {
  /** User ID who owns/created the report */
  owner: string;

  /** User IDs who can edit the report */
  editors: string[];

  /** User IDs who can view the report */
  viewers: string[];

  /** Whether anyone with the link can view */
  isPublic: boolean;

  /** Unique share link ID for public access */
  shareLink?: string;

  /** Organization-level permissions */
  organizationAccess?: {
    level: 'none' | 'view' | 'edit';
    departments: string[];
  };
}

/**
 * Bias identification with contextual information and comments
 */
export interface BiasIdentification {
  /** Lifecycle stage where bias was identified */
  stage: LifecycleStage;

  /** Biases identified at this stage */
  biases: Array<{
    /** The bias card that was identified */
    biasCard: BiasCard;

    /** Assessed severity of this bias in context */
    severity: 'low' | 'medium' | 'high';

    /** Confidence level in this identification */
    confidence: 'low' | 'medium' | 'high';

    /** All comments related to this bias in this stage */
    comments: Comment[];

    /** When this bias was first identified */
    identifiedAt: string;

    /** User who identified this bias */
    identifiedBy: string;

    /** Rationale for assigning this bias to this stage (from Stage 3) */
    rationale?: string;

    /** Stage-specific context for this bias */
    stageContext?: {
      /** Specific activities where bias applies */
      applicableActivities: string[];

      /** Potential impact assessment */
      potentialImpact: string;

      /** Evidence or reasoning for identification */
      evidence: string;
    };
  }>;
}

/**
 * Mitigation strategy with implementation details and tracking
 */
export interface MitigationStrategy {
  /** ID of the bias this mitigation addresses */
  biasId: string;

  /** Name of the bias for display */
  biasName?: string;

  /** Lifecycle stage where this mitigation is applied */
  lifecycleStage?: LifecycleStage;

  /** Mitigation approaches for this bias */
  mitigations: Array<{
    /** The mitigation card being applied */
    mitigationCard: MitigationCard;

    /** Implementation timeline */
    timeline: string;

    /** Person/team responsible for implementation */
    responsible: string;

    /** Criteria for measuring success */
    successCriteria: string;

    /** Priority level for implementation */
    priority: 'low' | 'medium' | 'high';

    /** Effectiveness rating from Stage 5 (1-5 stars) */
    effectivenessRating?: number;

    /** Implementation notes from Stage 5 */
    implementationNotes?: string;

    /** Estimated effort required */
    effort?: {
      timeEstimate: string;
      resourceRequirements: string[];
      complexity: 'low' | 'medium' | 'high';
    };

    /** Implementation-related comments */
    comments: Comment[];

    /** Dependencies on other mitigations or project elements */
    dependencies?: string[];
  }>;
}

/**
 * Tracking information for mitigation implementation progress
 */
export interface MitigationTracking {
  /** ID of the mitigation being tracked */
  mitigationId: string;

  /** Current implementation status */
  status: 'planned' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';

  /** Progress percentage (0-100) */
  progressPercentage: number;

  /** Status updates and progress notes */
  updates: Array<{
    /** User who made the update */
    userId: string;

    /** Display name of user */
    userName: string;

    /** Date of the update */
    date: string;

    /** Update notes */
    note: string;

    /** Supporting evidence or documentation */
    evidence?: string;

    /** Changed status (if applicable) */
    statusChange?: {
      from: string;
      to: string;
      reason: string;
    };

    /** Metrics or measurements */
    metrics?: Record<string, string | number>;
  }>;

  /** Issues or blockers encountered */
  issues?: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    status: 'open' | 'in-progress' | 'resolved';
    assignedTo?: string;
    createdAt: string;
    resolvedAt?: string;
  }>;
}

/**
 * Audit trail entry for report changes
 */
export interface AuditTrailEntry {
  /** Unique identifier for this audit entry */
  id: string;

  /** User who performed the action */
  userId: string;

  /** Display name of the user */
  userName: string;

  /** Timestamp of the action */
  timestamp: string;

  /** Type of action performed */
  action:
    | 'created'
    | 'updated'
    | 'commented'
    | 'shared'
    | 'exported'
    | 'status_changed'
    | 'deleted';

  /** Detailed description of what changed */
  description: string;

  /** Additional structured data about the change */
  details: {
    /** Section of report that was modified */
    section?: string;

    /** Previous values (for updates) */
    previousValues?: Record<string, unknown>;

    /** New values (for updates) */
    newValues?: Record<string, unknown>;

    /** Reason for the change */
    reason?: string;

    /** IP address (for security tracking) */
    ipAddress?: string;

    /** User agent (for security tracking) */
    userAgent?: string;
  };
}

/**
 * Report export configuration options
 */
export interface ReportExportConfig {
  /** Format to export to */
  format: ReportFormat;

  /** Sections to include in export */
  sections: {
    executiveSummary: boolean;
    projectInfo: boolean;
    biasIdentification: boolean;
    mitigationStrategies: boolean;
    implementation: boolean;
    tracking: boolean;
    comments: boolean;
    auditTrail: boolean;
    appendices: boolean;
  };

  /** Export-specific options */
  options: {
    /** Include sensitive information */
    includeSensitiveData: boolean;

    /** Watermark or branding */
    includeBranding: boolean;

    /** Page layout (for PDF) */
    pageLayout?: 'portrait' | 'landscape';

    /** Color scheme */
    colorScheme?: 'full' | 'grayscale' | 'high-contrast';

    /** Language/locale */
    locale?: string;
  };

  /** Custom template or styling */
  template?: {
    id: string;
    name: string;
    customization?: Record<string, unknown>;
  };
}

/**
 * Risk assessment summary from Stage 1
 */
export interface RiskAssessmentSummary {
  /** Total number of biases assessed */
  totalAssessed: number;

  /** Distribution by risk category */
  distribution: {
    high: number;
    medium: number;
    low: number;
    unassigned: number;
  };

  /** Biases by risk category with details */
  biasesByCategory: {
    high: Array<{ id: string; name: string; assignedAt?: string }>;
    medium: Array<{ id: string; name: string; assignedAt?: string }>;
    low: Array<{ id: string; name: string; assignedAt?: string }>;
    unassigned: Array<{ id: string; name: string }>;
  };

  /** Completion percentage for Stage 1 */
  completionPercentage: number;
}

/**
 * Complete report data structure with all components
 */
export interface Report {
  /** Unique report identifier */
  id: string;

  /** Associated activity ID */
  activityId: string;

  /** Flag to identify demo reports */
  isDemo?: boolean;

  /** Comprehensive project information */
  projectInfo: ProjectInfo;

  /** Report metadata */
  metadata: {
    /** Report creation timestamp */
    createdAt: string;

    /** Last modification timestamp */
    lastModified: string;

    /** Current report status */
    status: ReportStatus;

    /** Version number for tracking changes */
    version: number;

    /** Tags for organization and search */
    tags: string[];

    /** Report template used (if any) */
    templateId?: string;

    /** Report generation configuration */
    generationConfig?: {
      /** Validation requirements that were met */
      validationsPassed: string[];

      /** Source workspace session ID */
      sourceSessionId: string;

      /** Generation timestamp */
      generatedAt: string;

      /** User who generated the report */
      generatedBy: string;
    };
  };

  /** Access control and permissions */
  permissions: ReportPermissions;

  /** Core analysis content */
  analysis: {
    /** Risk assessment summary from Stage 1 */
    riskAssessmentSummary?: RiskAssessmentSummary;

    /** Bias identification across lifecycle stages */
    biasIdentification: BiasIdentification[];

    /** Mitigation strategies and planning */
    mitigationStrategies: MitigationStrategy[];

    /** Executive summary and key findings */
    executiveSummary?: {
      /** Key findings summary */
      keyFindings: string[];

      /** Risk assessment summary */
      riskAssessment: string;

      /** Recommended actions */
      recommendations: string[];

      /** Business impact assessment */
      businessImpact?: string;
    };
  };

  /** Implementation tracking and progress */
  tracking: {
    /** Mitigation implementation progress */
    mitigationTracking: MitigationTracking[];

    /** Overall project health metrics */
    healthMetrics?: {
      /** Percentage of mitigations implemented */
      implementationProgress: number;

      /** Risk reduction achieved */
      riskReduction: number;

      /** Compliance status */
      complianceStatus: string;

      /** Last assessment date */
      lastAssessment: string;
    };
  };

  /** Audit trail for all report changes */
  auditTrail: AuditTrailEntry[];

  /** Export history */
  exportHistory?: Array<{
    exportId: string;
    format: ReportFormat;
    exportedAt: string;
    exportedBy: string;
    config: ReportExportConfig;
    downloadCount: number;
  }>;

  /** Related reports or references */
  relationships?: {
    /** Parent report (if this is an update) */
    parentReportId?: string;

    /** Child reports (updates based on this report) */
    childReportIds: string[];

    /** Related activity reports */
    relatedReportIds: string[];

    /** External references */
    externalReferences?: Array<{
      title: string;
      url: string;
      type: 'documentation' | 'research' | 'standard' | 'regulation';
    }>;
  };
}

/**
 * Report summary for list views and dashboards
 */
export interface ReportSummary {
  id: string;
  activityId: string;
  title: string;
  status: ReportStatus;
  createdAt: string;
  lastModified: string;
  version: number;
  owner: string;
  domain: string;
  tags: string[];
  biasCount: number;
  mitigationCount: number;
  completionPercentage: number;
  hasUnreadUpdates?: boolean;
  isDemo?: boolean;
}

/**
 * Report template for generating reports with predefined structure
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  version: string;
  isActive: boolean;

  /** Template structure definition */
  structure: {
    sections: Array<{
      id: string;
      title: string;
      required: boolean;
      order: number;
      subsections?: Array<{
        id: string;
        title: string;
        required: boolean;
        order: number;
      }>;
    }>;

    /** Default export configuration */
    defaultExportConfig: Partial<ReportExportConfig>;

    /** Required project info fields */
    requiredProjectFields: string[];

    /** Validation rules */
    validationRules: Record<string, unknown>;
  };

  /** Template metadata */
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified: string;
    usageCount: number;
    tags: string[];
  };
}
