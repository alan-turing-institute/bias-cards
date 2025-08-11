import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_ACTIVITIES } from '@/lib/data/demo-content';
import type { Activity, Report } from '@/lib/types/activity';
import type { ActivityStage } from '@/lib/types/cards';
import {
  type ImportData,
  validateImportData,
  validateImportFile,
} from '@/lib/types/import';

// Helper functions for import functionality
async function parseImportFile(
  file: File
): Promise<{ success: boolean; data?: unknown; message: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return { success: true, data, message: 'File parsed successfully' };
  } catch (_parseError) {
    return {
      success: false,
      message:
        'Invalid JSON format. The file appears to be corrupted or is not valid JSON.',
    };
  }
}

function generateActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createImportedActivity(
  activity: Activity,
  newActivityId: string,
  hasWorkspace: boolean
): Activity {
  const now = new Date().toISOString();
  return {
    ...activity,
    id: newActivityId,
    createdAt: now,
    lastModified: now,
    progress: activity.progress || { completed: 0, total: 5 },
    status: hasWorkspace ? 'in-progress' : 'draft',
    currentStage: hasWorkspace ? activity.currentStage : 1,
  };
}

function importWorkspaceData(
  workspace: unknown,
  newActivityId: string
): { success: boolean; message?: string } {
  try {
    const workspaceStore = JSON.parse(
      localStorage.getItem('workspace-store') || '{}'
    );
    const now = new Date().toISOString();

    const ws = workspace as Record<string, unknown>;
    const newWorkspaceState = {
      ...ws,
      activityId: newActivityId,
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastModified: now,
      biasRiskAssignments: Array.isArray(ws.biasRiskAssignments)
        ? ws.biasRiskAssignments.map((assignment: unknown) => ({
            ...(assignment as Record<string, unknown>),
            id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }))
        : [],
      stageAssignments: Array.isArray(ws.stageAssignments)
        ? ws.stageAssignments.map((assignment: unknown) => ({
            ...(assignment as Record<string, unknown>),
            id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }))
        : [],
    };

    const updatedWorkspaceStore = {
      ...workspaceStore,
      state: newWorkspaceState,
    };

    localStorage.setItem(
      'workspace-store',
      JSON.stringify(updatedWorkspaceStore)
    );
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

function buildSuccessMessage(
  title: string,
  warnings: string[],
  activityId: string,
  hasWorkspace: boolean
): { success: boolean; message: string; activityId: string } {
  let successMessage = hasWorkspace
    ? `Successfully imported "${title}" with complete workspace data. You can now continue working on this analysis.`
    : `Successfully imported "${title}".`;

  if (warnings.length > 0) {
    successMessage += ` Note: ${warnings.length} minor issues were detected but the import completed successfully.`;
  }

  return {
    success: true,
    message: successMessage,
    activityId,
  };
}

interface ActivityStore {
  // State
  activities: Activity[];
  reports: Report[];
  demoDataInitialized: boolean;
  deletedDemoIds: string[];
  hasHydrated: boolean;

  // Actions
  createActivity: (
    activity: Omit<
      Activity,
      'id' | 'createdAt' | 'lastModified' | 'status' | 'currentStage'
    >
  ) => string;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  getActivity: (id: string) => Activity | undefined;

  // Stage management actions
  updateActivityStage: (id: string, stage: number) => void;
  completeActivityStage: (id: string, stage: number) => void;
  canAdvanceToStage: (id: string, targetStage: number) => boolean;

  // Report actions
  createReport: (activityId: string) => void;
  deleteReport: (id: string) => void;

  // Utility actions
  exportActivity: (id: string, format: 'pdf' | 'json') => void;
  importActivity: (
    file: File
  ) => Promise<{ success: boolean; message: string; activityId?: string }>;

  // Demo data actions
  initializeDemoData: () => void;

  // Hydration actions
  markAsHydrated: () => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],
      reports: [],
      demoDataInitialized: false,
      deletedDemoIds: [],
      hasHydrated: false,

      createActivity: (activityData) => {
        const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        const newActivity: Activity = {
          ...activityData,
          id,
          status: 'draft',
          currentStage: 1,
          createdAt: now,
          lastModified: now,
          progress: activityData.progress || { completed: 0, total: 5 },
          lifecycleStages: {},
        };

        set((state) => ({
          activities: [...state.activities, newActivity],
        }));

        return id;
      },

      updateActivity: (id, updates) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === id
              ? {
                  ...activity,
                  ...updates,
                  lastModified: new Date().toISOString(),
                }
              : activity
          ),
        }));
      },

      deleteActivity: (id) => {
        const activity = get().activities.find((a) => a.id === id);

        // If it's a demo activity, add to deletedDemoIds so it won't be recreated
        if (activity?.isDemo) {
          set((state) => ({
            activities: state.activities.filter((a) => a.id !== id),
            reports: state.reports.filter((report) => report.activityId !== id),
            deletedDemoIds: [...state.deletedDemoIds, id],
          }));
        } else {
          set((state) => ({
            activities: state.activities.filter((a) => a.id !== id),
            reports: state.reports.filter((report) => report.activityId !== id),
          }));
        }
      },

      getActivity: (id) => {
        return get().activities.find((activity) => activity.id === id);
      },

      // Stage management actions
      updateActivityStage: (id, stage) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === id
              ? {
                  ...activity,
                  currentStage: stage as ActivityStage,
                  lastModified: new Date().toISOString(),
                }
              : activity
          ),
        }));
      },

      completeActivityStage: (id, stage) => {
        set((state) => ({
          activities: state.activities.map((activity) => {
            if (activity.id === id) {
              const newCompleted = Math.max(
                activity.progress?.completed || 0,
                stage
              );
              const nextStage = Math.min(stage + 1, 5); // Cap at stage 5
              return {
                ...activity,
                currentStage: nextStage as ActivityStage,
                progress: {
                  ...(activity.progress || { total: 5 }),
                  completed: newCompleted,
                },
                status: newCompleted >= 5 ? 'completed' : 'in-progress',
                lastModified: new Date().toISOString(),
              };
            }
            return activity;
          }),
        }));
      },

      canAdvanceToStage: (id, targetStage) => {
        const activity = get().getActivity(id);
        if (!activity) {
          return false;
        }

        // Can always go to Stage 1
        if (targetStage === 1) {
          return true;
        }

        // Can navigate to any stage up to and including current stage
        // OR advance if previous stage is completed
        return (
          targetStage <= activity.currentStage ||
          (activity.progress?.completed || 0) >= targetStage - 1
        );
      },

      createReport: (activityId) => {
        const activity = get().getActivity(activityId);
        if (!activity) {
          return;
        }

        const report: Report = {
          id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          activityId,
          title: activity.title,
          description: activity.description,
          completedAt: new Date().toISOString(),
          exportFormats: ['pdf', 'json'],
          data: {
            activity,
            exportedAt: new Date().toISOString(),
          },
        };

        set((state) => ({
          reports: [...state.reports, report],
          activities: state.activities.map((a) =>
            a.id === activityId ? { ...a, status: 'completed' as const } : a
          ),
        }));
      },

      deleteReport: (id) => {
        set((state) => ({
          reports: state.reports.filter((report) => report.id !== id),
        }));
      },

      exportActivity: async (id, format) => {
        const activity = get().getActivity(id);
        if (!activity) {
          return;
        }

        // Get the current workspace store for activity data
        let activityData: unknown = null;
        let exportData: unknown;

        try {
          // Access workspace store to get current activity
          const workspaceStore = JSON.parse(
            localStorage.getItem('workspace-store') || '{}'
          );
          const workspaceState = workspaceStore.state;

          // If current workspace matches this activity and has currentActivity
          if (
            workspaceState?.activityId === id &&
            workspaceState.currentActivity
          ) {
            // Get the deck instance
            const { BiasDeck } = await import('@/lib/cards/decks/bias-deck');
            const deck = await BiasDeck.getInstance();

            // Export using v2.0 format with activity data
            activityData = workspaceState.currentActivity.export
              ? workspaceState.currentActivity.export()
              : workspaceState.activityData;

            exportData = {
              version: '2.0',
              deckId: deck.getMetadata().id,
              deckVersion: deck.getVersion(),
              activityData,
              exportedAt: new Date().toISOString(),
            };
          } else {
            // Fall back to legacy export format
            exportData = {
              activity,
              workspace: workspaceState,
              exportedAt: new Date().toISOString(),
              format: 'legacy-json',
            };
          }
        } catch (_error) {
          // Fall back to basic export if workspace access fails
          exportData = {
            activity,
            exportedAt: new Date().toISOString(),
            format: 'basic-json',
          };
        }

        if (format === 'json') {
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bias-analysis-${activity.title.toLowerCase().replace(/\s+/g, '-')}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
          // For now, we'll just alert that PDF export is not yet implemented
          // In a real implementation, you'd use a library like jsPDF or similar
          alert('PDF export functionality coming soon!');
        }
      },

      importActivity: async (file) => {
        const fileValidation = validateImportFile(file);
        if (!fileValidation.isValid) {
          return {
            success: false,
            message: fileValidation.errors[0] || 'Invalid file format',
          };
        }

        try {
          const importData = await parseImportFile(file);
          if (!importData.success) {
            return importData;
          }

          const validation = validateImportData(importData.data);
          if (!validation.isValid) {
            return {
              success: false,
              message: `Import validation failed: ${validation.errors.join('. ')}`,
            };
          }

          // Use FormatConverter for progressive migration
          const { FormatConverter } = await import(
            '@/lib/utils/format-converter'
          );
          const { BiasDeck } = await import('@/lib/cards/decks/bias-deck');
          const { detectDataVersion } = await import('@/lib/types/migration');

          const deck = await BiasDeck.getInstance();
          const converter = new FormatConverter();
          const version = detectDataVersion(importData.data);

          // If it's v2.0 or needs migration
          if (version === '2.0' || version === '1.5' || version === '1.0') {
            const biasActivity = await converter.migrate(importData.data, deck);
            const activityData = biasActivity.export();

            // Create activity record for the store
            const newActivityId = generateActivityId();
            const importedActivity = createImportedActivity(
              {
                id: newActivityId,
                title: activityData.name,
                description: activityData.description || '',
                projectType: 'imported',
                status: 'draft',
                currentStage: activityData.state.currentStage,
                createdAt: activityData.createdAt,
                updatedAt: activityData.updatedAt,
                lastModified: activityData.updatedAt,
                progress: { completed: 0, total: 5 },
              } as Activity,
              newActivityId,
              true
            );

            set((state) => ({
              activities: [...state.activities, importedActivity],
            }));

            // Import the activity data into workspace
            const workspaceResult = importWorkspaceData(
              { activityData },
              newActivityId
            );

            return buildSuccessMessage(
              activityData.name,
              validation.warnings,
              newActivityId,
              workspaceResult.success
            );
          }

          // Fall back to legacy import for unknown formats
          const { activity, workspace } = importData.data as ImportData;
          const newActivityId = generateActivityId();
          const importedActivity = createImportedActivity(
            activity,
            newActivityId,
            !!workspace
          );

          set((state) => ({
            activities: [...state.activities, importedActivity],
          }));

          if (workspace) {
            const workspaceResult = importWorkspaceData(
              workspace,
              newActivityId
            );
            return buildSuccessMessage(
              activity.title,
              validation.warnings,
              newActivityId,
              workspaceResult.success
            );
          }

          return buildSuccessMessage(
            activity.title,
            validation.warnings,
            newActivityId,
            false
          );
        } catch (_error) {
          return {
            success: false,
            message:
              'Failed to import activity. Please check the file and try again.',
          };
        }
      },

      initializeDemoData: () => {
        const state = get();

        // Only initialize if:
        // 1. Not already initialized
        // 2. User has no activities (new user)
        if (!state.demoDataInitialized && state.activities.length === 0) {
          const demoActivities = DEMO_ACTIVITIES.filter(
            (demo) => demo.id && !state.deletedDemoIds.includes(demo.id)
          ).map(
            (demo) =>
              ({
                ...demo,
                currentStage: demo.currentStage || 1,
                progress: demo.progress || { completed: 0, total: 5 },
              }) as Activity
          );

          set({
            activities: demoActivities,
            demoDataInitialized: true,
          });
        }
      },

      markAsHydrated: () => {
        set({ hasHydrated: true });
      },
    }),
    {
      name: 'activity-store',
      version: 1,
      onRehydrateStorage: () => (state, error) => {
        // Silently handle hydration errors in production
        if (error) {
          // no-op
        }
        // Initialize demo data and mark as hydrated after store rehydration
        if (state) {
          state.initializeDemoData();
          state.markAsHydrated();
        }
      },
    }
  )
);
