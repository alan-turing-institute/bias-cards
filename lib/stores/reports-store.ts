import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_REPORTS } from '@/lib/data/demo-content';
import type { BiasCard, Card, MitigationCard } from '@/lib/types/cards';
import type { ProjectInfo } from '@/lib/types/project-info';
import type {
  AuditTrailEntry,
  BiasIdentification,
  MitigationStrategy,
  Report,
  ReportExportConfig,
  ReportStatus,
  ReportSummary,
} from '@/lib/types/reports';
import type { WorkspaceState } from '@/lib/types/workspace';
import { useCardsStore } from './cards-store';
import { useWorkspaceStore } from './workspace-store';

interface ReportsStore {
  // State
  reports: Report[];
  currentReport: Report | null;
  demoReportsInitialized: boolean;
  deletedDemoReportIds: string[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - CRUD Operations
  createReport: (
    activityId: string,
    projectInfo: ProjectInfo,
    userId?: string,
    userName?: string,
    templateId?: string
  ) => string;

  updateReport: (
    reportId: string,
    updates: Partial<Report>,
    userId?: string,
    userName?: string
  ) => void;

  deleteReport: (reportId: string) => void;

  getReport: (reportId: string) => Report | undefined;

  setCurrentReport: (reportId: string | null) => void;

  // Actions - Report Management
  generateReportFromWorkspace: (
    activityId: string,
    projectInfo: ProjectInfo,
    userId?: string,
    userName?: string,
    templateId?: string
  ) => string;

  updateReportStatus: (
    reportId: string,
    status: ReportStatus,
    userId?: string,
    userName?: string
  ) => void;

  addMitigationUpdate: (
    reportId: string,
    mitigationId: string,
    update: {
      note: string;
      statusChange?: { from: string; to: string; reason: string };
      metrics?: Record<string, string | number>;
    },
    userId?: string,
    userName?: string
  ) => void;

  // Actions - Export
  exportReport: (
    reportId: string,
    config: ReportExportConfig,
    userId?: string,
    userName?: string
  ) => Promise<void>;

  // Actions - Search & Filter
  getReportSummaries: () => ReportSummary[];

  searchReports: (query: string) => ReportSummary[];

  filterReports: (filters: {
    status?: ReportStatus[];
    domain?: string[];
    dateRange?: { start: string; end: string };
    tags?: string[];
  }) => ReportSummary[];

  // Actions - Audit & History
  addAuditEntry: (
    reportId: string,
    action: AuditTrailEntry['action'],
    description: string,
    details: AuditTrailEntry['details'],
    userId?: string,
    userName?: string
  ) => void;

  // Actions - Version Management
  createReportVersion: (
    reportId: string,
    userId?: string,
    userName?: string
  ) => void;

  // Utility actions
  clearError: () => void;

  refreshReports: () => void;

  // Demo data actions
  initializeDemoReports: () => void;
}

// Default user info for when user management isn't implemented
const _getDefaultUser = () => ({
  userId: 'default-user',
  userName: 'Anonymous User',
});

// Counter for unique audit IDs
let auditCounter = 0;

// Generate unique audit entry ID
const generateAuditId = () => {
  auditCounter++;
  return `audit-${Date.now()}-${auditCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to process bias identifications
function processBiasIdentifications(
  workspaceState: WorkspaceState,
  getCardById: (id: string) => Card | undefined,
  user: { userId: string; userName: string }
): BiasIdentification[] {
  const biasIdentification: BiasIdentification[] = [];

  for (const assignment of workspaceState.stageAssignments) {
    const biasCard = getCardById(assignment.cardId);
    if (!biasCard) {
      continue;
    }

    let stageIdentification = biasIdentification.find(
      (bi) => bi.stage === assignment.stage
    );
    if (!stageIdentification) {
      stageIdentification = {
        stage: assignment.stage,
        biases: [],
      };
      biasIdentification.push(stageIdentification);
    }

    stageIdentification.biases.push({
      biasCard: biasCard as BiasCard,
      severity: 'medium',
      confidence: 'medium',
      comments: [],
      identifiedAt: assignment.timestamp || new Date().toISOString(),
      identifiedBy: user.userId,
    });
  }

  return biasIdentification;
}

// Helper function to process mitigation strategies
function processMitigationStrategies(
  workspaceState: WorkspaceState,
  getCardById: (id: string) => Card | undefined
): MitigationStrategy[] {
  const mitigationStrategies: MitigationStrategy[] = [];

  for (const pair of workspaceState.cardPairs) {
    const mitigationCard = getCardById(pair.mitigationId);
    if (!mitigationCard) {
      continue;
    }

    mitigationStrategies.push({
      biasId: pair.biasId,
      mitigations: [
        {
          mitigationCard: mitigationCard as MitigationCard,
          timeline: 'TBD',
          responsible: 'TBD',
          successCriteria: 'TBD',
          priority: 'medium',
          comments: [],
        },
      ],
    });
  }

  return mitigationStrategies;
}

export const useReportsStore = create<ReportsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      reports: [],
      currentReport: null,
      demoReportsInitialized: false,
      deletedDemoReportIds: [],
      isLoading: false,
      error: null,

      // CRUD Operations
      createReport: (activityId, projectInfo, userId, userName, templateId) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };
        const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        try {
          set({ isLoading: true, error: null });

          const newReport: Report = {
            id: reportId,
            activityId,
            projectInfo,
            metadata: {
              createdAt: now,
              lastModified: now,
              status: 'draft',
              version: 1,
              tags: [projectInfo.domain.toLowerCase()],
              templateId,
              generationConfig: {
                validationsPassed: [],
                sourceSessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                generatedAt: now,
                generatedBy: user.userId,
              },
            },
            permissions: {
              owner: user.userId,
              editors: [],
              viewers: [],
              isPublic: false,
            },
            analysis: {
              biasIdentification: [],
              mitigationStrategies: [],
            },
            tracking: {
              mitigationTracking: [],
            },
            auditTrail: [
              {
                id: generateAuditId(),
                userId: user.userId,
                userName: user.userName,
                timestamp: now,
                action: 'created',
                description: 'Report created',
                details: {
                  section: 'report',
                  reason: 'Initial report creation',
                },
              },
            ],
          };

          set((state) => ({
            reports: [...state.reports, newReport],
            isLoading: false,
          }));

          return reportId;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create report',
          });
          throw error;
        }
      },

      updateReport: (reportId, updates, userId, userName) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };
        const now = new Date().toISOString();

        set((state) => {
          const reportIndex = state.reports.findIndex((r) => r.id === reportId);
          if (reportIndex === -1) {
            return state;
          }

          const existingReport = state.reports[reportIndex];
          const updatedReport: Report = {
            ...existingReport,
            ...updates,
            metadata: {
              ...existingReport.metadata,
              ...updates.metadata,
              lastModified: now,
              version: existingReport.metadata.version + 1,
            },
            auditTrail: [
              ...existingReport.auditTrail,
              {
                id: generateAuditId(),
                userId: user.userId,
                userName: user.userName,
                timestamp: now,
                action: 'updated',
                description: 'Report updated',
                details: {
                  section: 'report',
                  previousValues: { version: existingReport.metadata.version },
                  newValues: { version: existingReport.metadata.version + 1 },
                },
              },
            ],
          };

          const newReports = [...state.reports];
          newReports[reportIndex] = updatedReport;

          return {
            ...state,
            reports: newReports,
            currentReport:
              state.currentReport?.id === reportId
                ? updatedReport
                : state.currentReport,
          };
        });
      },

      deleteReport: (reportId) => {
        const report = get().reports.find((r) => r.id === reportId);

        // If it's a demo report, add to deletedDemoReportIds so it won't be recreated
        if (report?.isDemo) {
          set((state) => ({
            reports: state.reports.filter((r) => r.id !== reportId),
            currentReport:
              state.currentReport?.id === reportId ? null : state.currentReport,
            deletedDemoReportIds: [...state.deletedDemoReportIds, reportId],
          }));
        } else {
          set((state) => ({
            reports: state.reports.filter((r) => r.id !== reportId),
            currentReport:
              state.currentReport?.id === reportId ? null : state.currentReport,
          }));
        }
      },

      getReport: (reportId) => {
        return get().reports.find((r) => r.id === reportId);
      },

      setCurrentReport: (reportId) => {
        const report = reportId ? get().getReport(reportId) : null;
        set({ currentReport: report });
      },

      // Report Generation
      generateReportFromWorkspace: (
        activityId,
        projectInfo,
        userId,
        userName,
        templateId
      ) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };

        try {
          set({ isLoading: true, error: null });

          // Get workspace data
          const workspaceState = useWorkspaceStore.getState();

          // Get cards store to lookup card data
          const { getCardById } = useCardsStore.getState();

          // Create the report first
          const reportId = get().createReport(
            activityId,
            projectInfo,
            user.userId,
            user.userName,
            templateId
          );

          // Generate analysis from workspace
          const biasIdentification = processBiasIdentifications(
            workspaceState,
            getCardById,
            user
          );
          const mitigationStrategies = processMitigationStrategies(
            workspaceState,
            getCardById
          );

          // Update the report with generated analysis
          get().updateReport(
            reportId,
            {
              analysis: {
                biasIdentification,
                mitigationStrategies,
              },
            },
            user.userId,
            user.userName
          );

          set({ isLoading: false });
          return reportId;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to generate report',
          });
          throw error;
        }
      },

      updateReportStatus: (reportId, status, userId, userName) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };
        const report = get().getReport(reportId);
        if (!report) {
          return;
        }

        const previousStatus = report.metadata.status;

        get().updateReport(
          reportId,
          {
            metadata: {
              ...report.metadata,
              status,
            },
          },
          user.userId,
          user.userName
        );

        get().addAuditEntry(
          reportId,
          'status_changed',
          `Status changed from ${previousStatus} to ${status}`,
          {
            previousValues: { status: previousStatus },
            newValues: { status },
          },
          user.userId,
          user.userName
        );
      },

      addMitigationUpdate: (
        reportId,
        mitigationId,
        update,
        userId,
        userName
      ) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };
        const report = get().getReport(reportId);
        if (!report) {
          return;
        }

        const now = new Date().toISOString();
        const trackingIndex = report.tracking.mitigationTracking.findIndex(
          (mt) => mt.mitigationId === mitigationId
        );

        const updatedTracking = [...report.tracking.mitigationTracking];

        if (trackingIndex >= 0) {
          // Update existing tracking
          updatedTracking[trackingIndex] = {
            ...updatedTracking[trackingIndex],
            updates: [
              ...updatedTracking[trackingIndex].updates,
              {
                userId: user.userId,
                userName: user.userName,
                date: now,
                note: update.note,
                statusChange: update.statusChange,
                metrics: update.metrics,
              },
            ],
          };
        } else {
          // Create new tracking entry
          updatedTracking.push({
            mitigationId,
            status: 'planned',
            progressPercentage: 0,
            updates: [
              {
                userId: user.userId,
                userName: user.userName,
                date: now,
                note: update.note,
                statusChange: update.statusChange,
                metrics: update.metrics,
              },
            ],
          });
        }

        get().updateReport(
          reportId,
          {
            tracking: {
              ...report.tracking,
              mitigationTracking: updatedTracking,
            },
          },
          user.userId,
          user.userName
        );
      },

      // Export functionality
      exportReport: async (reportId, config, userId, userName) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };
        const report = get().getReport(reportId);
        if (!report) {
          throw new Error('Report not found');
        }

        try {
          set({ isLoading: true, error: null });

          // Export functionality not yet implemented - placeholder
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Add to export history
          const exportRecord = {
            exportId: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            format: config.format,
            exportedAt: new Date().toISOString(),
            exportedBy: user.userId,
            config,
            downloadCount: 1,
          };

          get().updateReport(
            reportId,
            {
              exportHistory: [...(report.exportHistory || []), exportRecord],
            },
            user.userId,
            user.userName
          );

          get().addAuditEntry(
            reportId,
            'exported',
            `Report exported as ${config.format.toUpperCase()}`,
            {
              section: 'export',
              newValues: { format: config.format },
            },
            user.userId,
            user.userName
          );

          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Export failed',
          });
          throw error;
        }
      },

      // Search and filter
      getReportSummaries: () => {
        return get().reports.map((report) => ({
          id: report.id,
          activityId: report.activityId,
          title: report.projectInfo.title,
          status: report.metadata.status,
          createdAt: report.metadata.createdAt,
          lastModified: report.metadata.lastModified,
          version: report.metadata.version,
          owner: report.permissions.owner,
          domain: report.projectInfo.domain,
          tags: report.metadata.tags,
          biasCount: report.analysis.biasIdentification.reduce(
            (count, bi) => count + bi.biases.length,
            0
          ),
          mitigationCount: report.analysis.mitigationStrategies.reduce(
            (count, ms) => count + ms.mitigations.length,
            0
          ),
          completionPercentage: calculateCompletionPercentage(report),
          isDemo: report.isDemo,
        }));
      },

      searchReports: (query) => {
        const summaries = get().getReportSummaries();
        const lowercaseQuery = query.toLowerCase();

        return summaries.filter(
          (summary) =>
            summary.title.toLowerCase().includes(lowercaseQuery) ||
            summary.domain.toLowerCase().includes(lowercaseQuery) ||
            summary.tags.some((tag) =>
              tag.toLowerCase().includes(lowercaseQuery)
            )
        );
      },

      filterReports: (filters) => {
        const summaries = get().getReportSummaries();

        const matchesStatus = (summary: ReportSummary) =>
          !filters.status || filters.status.includes(summary.status);

        const matchesDomain = (summary: ReportSummary) =>
          !filters.domain || filters.domain.includes(summary.domain);

        const matchesTags = (summary: ReportSummary) =>
          !filters.tags ||
          filters.tags.some((tag) => summary.tags.includes(tag));

        const matchesDateRange = (summary: ReportSummary) => {
          if (!filters.dateRange) {
            return true;
          }
          const reportDate = new Date(summary.lastModified);
          const start = new Date(filters.dateRange.start);
          const end = new Date(filters.dateRange.end);
          return reportDate >= start && reportDate <= end;
        };

        return summaries.filter(
          (summary) =>
            matchesStatus(summary) &&
            matchesDomain(summary) &&
            matchesTags(summary) &&
            matchesDateRange(summary)
        );
      },

      // Audit trail
      addAuditEntry: (
        reportId,
        action,
        description,
        details,
        userId,
        userName
      ) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };
        const report = get().getReport(reportId);
        if (!report) {
          return;
        }

        const auditEntry: AuditTrailEntry = {
          id: generateAuditId(),
          userId: user.userId,
          userName: user.userName,
          timestamp: new Date().toISOString(),
          action,
          description,
          details,
        };

        get().updateReport(reportId, {
          auditTrail: [...report.auditTrail, auditEntry],
        });
      },

      // Version management
      createReportVersion: (reportId, userId, userName) => {
        const user = {
          userId: userId || 'default-user',
          userName: userName || 'Anonymous User',
        };
        const report = get().getReport(reportId);
        if (!report) {
          return;
        }

        get().addAuditEntry(
          reportId,
          'updated',
          `New version created (v${report.metadata.version + 1})`,
          {
            section: 'version',
            previousValues: { version: report.metadata.version },
            newValues: { version: report.metadata.version + 1 },
          },
          user.userId,
          user.userName
        );
      },

      // Utility
      clearError: () => set({ error: null }),

      refreshReports: () => {
        // In a real app, this would refetch from an API
        // For now, it's just a placeholder
        set({ isLoading: false, error: null });
      },

      initializeDemoReports: () => {
        const state = get();

        // Only initialize if:
        // 1. Not already initialized
        // 2. User has no reports (new user)
        if (!state.demoReportsInitialized && state.reports.length === 0) {
          const demoReports = DEMO_REPORTS.filter(
            (demo) => demo.id && !state.deletedDemoReportIds.includes(demo.id)
          ).map((demo) => demo as Report);

          set({
            reports: demoReports,
            demoReportsInitialized: true,
          });
        }
      },
    }),
    {
      name: 'bias-cards-reports',
      partialize: (state) => ({
        reports: state.reports,
        demoReportsInitialized: state.demoReportsInitialized,
        deletedDemoReportIds: state.deletedDemoReportIds,
        // Don't persist loading states or current report
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize demo reports after store rehydration if needed
        if (state) {
          state.initializeDemoReports();
        }
      },
    }
  )
);

// Helper function to calculate completion percentage
function calculateCompletionPercentage(report: Report): number {
  let completed = 0;
  let total = 0;

  // Check if project info is complete
  total += 1;
  if (report.projectInfo.title && report.projectInfo.description) {
    completed += 1;
  }

  // Check if biases are identified
  total += 1;
  if (report.analysis.biasIdentification.length > 0) {
    completed += 1;
  }

  // Check if mitigations are planned
  total += 1;
  if (report.analysis.mitigationStrategies.length > 0) {
    completed += 1;
  }

  // Check if executive summary exists
  total += 1;
  if (report.analysis.executiveSummary) {
    completed += 1;
  }

  return Math.round((completed / total) * 100);
}
