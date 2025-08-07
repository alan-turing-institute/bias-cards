import { z } from 'zod';

// Import existing lifecycle stages for validation
// Note: We'll need to define these constants if they don't exist
export const LIFECYCLE_STAGES = [
  'project-planning',
  'problem-formulation',
  'data-extraction-procurement',
  'data-analysis',
  'preprocessing-feature-engineering',
  'model-selection-training',
  'model-testing-validation',
  'model-reporting',
  'system-implementation',
  'user-training',
  'system-use-monitoring',
  'model-updating-deprovisioning',
] as const;

/**
 * Base schemas for common types
 */
export const LifecycleStageSchema = z.enum(LIFECYCLE_STAGES);
export const CommentCategorySchema = z.enum([
  'rationale',
  'implementation',
  'general',
]);
export const ReportStatusSchema = z.enum([
  'draft',
  'final',
  'updated',
  'archived',
]);
export const ReportFormatSchema = z.enum(['pdf', 'json', 'docx', 'markdown']);

/**
 * Comment validation schemas
 */
export const CommentSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().min(1),
  cardType: z.enum(['bias', 'mitigation']),
  stageContext: LifecycleStageSchema.optional(),
  userId: z.string().min(1),
  userName: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  content: z.string().min(1).max(5000),
  category: CommentCategorySchema,
  isEdited: z.boolean(),
  editHistory: z
    .array(
      z.object({
        timestamp: z.string().datetime(),
        previousContent: z.string(),
        editReason: z.string().optional(),
      })
    )
    .optional(),
  metadata: z
    .object({
      pairContext: z
        .object({
          biasId: z.string(),
          mitigationId: z.string(),
        })
        .optional(),
      assignmentContext: z
        .object({
          assignmentId: z.string(),
          stage: LifecycleStageSchema,
        })
        .optional(),
    })
    .optional(),
});

export const CommentSummarySchema = z.object({
  cardId: z.string(),
  totalComments: z.number().min(0),
  commentsByCategory: z.record(CommentCategorySchema, z.number().min(0)),
  lastCommentTimestamp: z.string().datetime().optional(),
  hasUnreadComments: z.boolean().optional(),
});

export const CommentFiltersSchema = z.object({
  cardIds: z.array(z.string()).optional(),
  categories: z.array(CommentCategorySchema).optional(),
  stages: z.array(LifecycleStageSchema).optional(),
  userId: z.string().optional(),
  dateRange: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .optional(),
  searchQuery: z.string().optional(),
});

/**
 * Project Info validation schemas
 */
export const TeamMemberSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  responsibilities: z.string().min(1).max(500),
  email: z.string().email().optional(),
  department: z.string().max(100).optional(),
});

export const StakeholderSchema = z.object({
  name: z.string().min(1).max(100),
  organization: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  involvement: z.enum(['high', 'medium', 'low']),
  email: z.string().email().optional(),
});

export const ProjectMilestoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  targetDate: z.string().datetime(),
  completedDate: z.string().datetime().optional(),
  status: z.enum([
    'planned',
    'in-progress',
    'completed',
    'delayed',
    'cancelled',
  ]),
  dependencies: z.array(z.string()).optional(),
});

export const TechnicalContextSchema = z.object({
  dataTypes: z.array(z.string().min(1)).min(1),
  modelTypes: z.array(z.string().min(1)).min(1),
  deploymentEnvironment: z.string().min(1).max(100),
  userBase: z.string().min(1).max(500),
  sensitiveDataCategories: z.array(z.string().min(1)),
  complianceRequirements: z.array(z.string().min(1)),
  externalDependencies: z.array(z.string().min(1)).optional(),
  scale: z
    .object({
      dataVolume: z.string().min(1),
      userCount: z.string().min(1),
      transactionVolume: z.string().min(1),
    })
    .optional(),
});

export const ProjectInfoSchema = z.object({
  // Basic information
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  domain: z.string().min(1).max(100),

  // Extended details
  objectives: z.string().min(1).max(2000),
  scope: z.string().min(1).max(2000),
  status: z.enum([
    'planning',
    'development',
    'testing',
    'deployed',
    'maintenance',
  ]),

  // Timeline
  timeline: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    milestones: z.array(ProjectMilestoneSchema),
    currentPhase: z.string().max(100).optional(),
  }),

  // Team
  team: z.object({
    projectLead: TeamMemberSchema,
    members: z.array(TeamMemberSchema),
    stakeholders: z.array(StakeholderSchema),
    governance: z
      .object({
        reviewBoard: z.array(z.string()).optional(),
        approvalProcess: z.string().optional(),
        escalationPath: z.array(z.string()).optional(),
      })
      .optional(),
  }),

  // Technical context
  technicalContext: TechnicalContextSchema.optional(),

  // Business context
  businessContext: z
    .object({
      businessDriver: z.string().min(1).max(500),
      expectedImpact: z.string().min(1).max(500),
      successMetrics: z.array(z.string().min(1)),
      risks: z.array(
        z.object({
          risk: z.string().min(1),
          impact: z.enum(['low', 'medium', 'high']),
          probability: z.enum(['low', 'medium', 'high']),
          mitigation: z.string().min(1),
        })
      ),
    })
    .optional(),

  // Compliance
  compliance: z
    .object({
      regulations: z.array(z.string().min(1)),
      status: z.enum(['pending', 'in-review', 'compliant', 'non-compliant']),
      certifications: z.array(z.string()).optional(),
      dataProtection: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Report validation schemas
 */
export const ReportPermissionsSchema = z.object({
  owner: z.string().min(1),
  editors: z.array(z.string()),
  viewers: z.array(z.string()),
  isPublic: z.boolean(),
  shareLink: z.string().optional(),
  organizationAccess: z
    .object({
      level: z.enum(['none', 'view', 'edit']),
      departments: z.array(z.string()),
    })
    .optional(),
});

export const BiasIdentificationSchema = z.object({
  stage: LifecycleStageSchema,
  biases: z.array(
    z.object({
      biasCard: z.any(), // Will be validated against BiasCard schema if available
      severity: z.enum(['low', 'medium', 'high']),
      confidence: z.enum(['low', 'medium', 'high']),
      comments: z.array(CommentSchema),
      identifiedAt: z.string().datetime(),
      identifiedBy: z.string().min(1),
      stageContext: z
        .object({
          applicableActivities: z.array(z.string()),
          potentialImpact: z.string(),
          evidence: z.string(),
        })
        .optional(),
    })
  ),
});

export const MitigationStrategySchema = z.object({
  biasId: z.string().min(1),
  mitigations: z.array(
    z.object({
      mitigationCard: z.any(), // Will be validated against MitigationCard schema if available
      timeline: z.string().min(1),
      responsible: z.string().min(1),
      successCriteria: z.string().min(1),
      priority: z.enum(['low', 'medium', 'high']),
      effort: z
        .object({
          timeEstimate: z.string(),
          resourceRequirements: z.array(z.string()),
          complexity: z.enum(['low', 'medium', 'high']),
        })
        .optional(),
      comments: z.array(CommentSchema),
      dependencies: z.array(z.string()).optional(),
    })
  ),
});

export const MitigationTrackingSchema = z.object({
  mitigationId: z.string().min(1),
  status: z.enum([
    'planned',
    'in-progress',
    'completed',
    'blocked',
    'cancelled',
  ]),
  progressPercentage: z.number().min(0).max(100),
  updates: z.array(
    z.object({
      userId: z.string().min(1),
      userName: z.string().min(1),
      date: z.string().datetime(),
      note: z.string().min(1),
      evidence: z.string().optional(),
      statusChange: z
        .object({
          from: z.string(),
          to: z.string(),
          reason: z.string(),
        })
        .optional(),
      metrics: z
        .record(z.string(), z.union([z.string(), z.number()]))
        .optional(),
    })
  ),
  issues: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        severity: z.enum(['low', 'medium', 'high']),
        status: z.enum(['open', 'in-progress', 'resolved']),
        assignedTo: z.string().optional(),
        createdAt: z.string().datetime(),
        resolvedAt: z.string().datetime().optional(),
      })
    )
    .optional(),
});

export const AuditTrailEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  userName: z.string().min(1),
  timestamp: z.string().datetime(),
  action: z.enum([
    'created',
    'updated',
    'commented',
    'shared',
    'exported',
    'status_changed',
    'deleted',
  ]),
  description: z.string().min(1),
  details: z.object({
    section: z.string().optional(),
    previousValues: z.record(z.string(), z.any()).optional(),
    newValues: z.record(z.string(), z.any()).optional(),
    reason: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  }),
});

export const ReportExportConfigSchema = z.object({
  format: ReportFormatSchema,
  sections: z.object({
    executiveSummary: z.boolean(),
    projectInfo: z.boolean(),
    biasIdentification: z.boolean(),
    mitigationStrategies: z.boolean(),
    implementation: z.boolean(),
    tracking: z.boolean(),
    comments: z.boolean(),
    auditTrail: z.boolean(),
    appendices: z.boolean(),
  }),
  options: z.object({
    includeSensitiveData: z.boolean(),
    includeBranding: z.boolean(),
    pageLayout: z.enum(['portrait', 'landscape']).optional(),
    colorScheme: z.enum(['full', 'grayscale', 'high-contrast']).optional(),
    locale: z.string().optional(),
  }),
  template: z
    .object({
      id: z.string(),
      name: z.string(),
      customization: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
});

export const ReportSchema = z.object({
  id: z.string().uuid(),
  activityId: z.string().min(1),
  projectInfo: ProjectInfoSchema,
  metadata: z.object({
    createdAt: z.string().datetime(),
    lastModified: z.string().datetime(),
    status: ReportStatusSchema,
    version: z.number().min(1),
    tags: z.array(z.string()),
    templateId: z.string().optional(),
    generationConfig: z
      .object({
        validationsPassed: z.array(z.string()),
        sourceSessionId: z.string(),
        generatedAt: z.string().datetime(),
        generatedBy: z.string(),
      })
      .optional(),
  }),
  permissions: ReportPermissionsSchema,
  analysis: z.object({
    biasIdentification: z.array(BiasIdentificationSchema),
    mitigationStrategies: z.array(MitigationStrategySchema),
    executiveSummary: z
      .object({
        keyFindings: z.array(z.string()),
        riskAssessment: z.string(),
        recommendations: z.array(z.string()),
        businessImpact: z.string().optional(),
      })
      .optional(),
  }),
  tracking: z.object({
    mitigationTracking: z.array(MitigationTrackingSchema),
    healthMetrics: z
      .object({
        implementationProgress: z.number().min(0).max(100),
        riskReduction: z.number().min(0).max(100),
        complianceStatus: z.string(),
        lastAssessment: z.string().datetime(),
      })
      .optional(),
  }),
  auditTrail: z.array(AuditTrailEntrySchema),
  exportHistory: z
    .array(
      z.object({
        exportId: z.string(),
        format: ReportFormatSchema,
        exportedAt: z.string().datetime(),
        exportedBy: z.string(),
        config: ReportExportConfigSchema,
        downloadCount: z.number().min(0),
      })
    )
    .optional(),
  relationships: z
    .object({
      parentReportId: z.string().optional(),
      childReportIds: z.array(z.string()),
      relatedReportIds: z.array(z.string()),
      externalReferences: z
        .array(
          z.object({
            title: z.string(),
            url: z.string().url(),
            type: z.enum([
              'documentation',
              'research',
              'standard',
              'regulation',
            ]),
          })
        )
        .optional(),
    })
    .optional(),
});

export const ReportSummarySchema = z.object({
  id: z.string().uuid(),
  activityId: z.string(),
  title: z.string(),
  status: ReportStatusSchema,
  createdAt: z.string().datetime(),
  lastModified: z.string().datetime(),
  version: z.number().min(1),
  owner: z.string(),
  domain: z.string(),
  tags: z.array(z.string()),
  biasCount: z.number().min(0),
  mitigationCount: z.number().min(0),
  completionPercentage: z.number().min(0).max(100),
  hasUnreadUpdates: z.boolean().optional(),
});

/**
 * Validation helper functions
 */

/**
 * Validates a comment object and returns detailed error information
 */
export function validateComment(comment: unknown) {
  try {
    return {
      success: true as const,
      data: CommentSchema.parse(comment),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        data: null,
        errors: error.issues,
      };
    }
    return {
      success: false as const,
      data: null,
      errors: [{ message: 'Unknown validation error', path: [] }],
    };
  }
}

/**
 * Validates project info and returns detailed error information
 */
export function validateProjectInfo(projectInfo: unknown) {
  try {
    return {
      success: true as const,
      data: ProjectInfoSchema.parse(projectInfo),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        data: null,
        errors: error.issues,
      };
    }
    return {
      success: false as const,
      data: null,
      errors: [{ message: 'Unknown validation error', path: [] }],
    };
  }
}

/**
 * Validates a report object and returns detailed error information
 */
export function validateReport(report: unknown) {
  try {
    return {
      success: true as const,
      data: ReportSchema.parse(report),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        data: null,
        errors: error.issues,
      };
    }
    return {
      success: false as const,
      data: null,
      errors: [{ message: 'Unknown validation error', path: [] }],
    };
  }
}

/**
 * Validates partial data for form validation (allows incomplete objects)
 */
export function validatePartialProjectInfo(projectInfo: unknown) {
  const PartialProjectInfoSchema = ProjectInfoSchema.partial();
  try {
    return {
      success: true as const,
      data: PartialProjectInfoSchema.parse(projectInfo),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        data: null,
        errors: error.issues,
      };
    }
    return {
      success: false as const,
      data: null,
      errors: [{ message: 'Unknown validation error', path: [] }],
    };
  }
}
