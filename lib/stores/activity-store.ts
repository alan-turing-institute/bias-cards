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

      exportActivity: (id, format) => {
        const activity = get().getActivity(id);
        if (!activity) {
          return;
        }

        // Check if there's workspace data for this activity
        let workspaceData = null;
        try {
          // Access workspace store data from localStorage
          const workspaceStore = JSON.parse(
            localStorage.getItem('workspace-store') || '{}'
          );
          const workspaceState = workspaceStore.state;

          // If current workspace matches this activity, include the workspace data
          if (workspaceState && workspaceState.activityId === id) {
            workspaceData = workspaceState;
          }
        } catch (error) {
          console.warn('Could not access workspace data for export:', error);
        }

        const exportData = {
          activity,
          workspace: workspaceData,
          exportedAt: new Date().toISOString(),
          format: workspaceData ? 'complete-workspace-json' : format,
        };

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
        // First validate the file itself
        const fileValidation = validateImportFile(file);
        if (!fileValidation.isValid) {
          return {
            success: false,
            message: fileValidation.errors[0] || 'Invalid file format',
          };
        }

        try {
          const text = await file.text();
          let importData;

          try {
            importData = JSON.parse(text);
          } catch (parseError) {
            return {
              success: false,
              message:
                'Invalid JSON format. The file appears to be corrupted or is not valid JSON.',
            };
          }

          // Comprehensive validation of import data
          const validation = validateImportData(importData);
          if (!validation.isValid) {
            const errorDetails = validation.errors.join('. ');
            return {
              success: false,
              message: `Import validation failed: ${errorDetails}`,
            };
          }

          const { activity, workspace } = importData as ImportData;

          // Generate new IDs to avoid conflicts
          const newActivityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();

          // Create the imported activity with new ID
          const importedActivity: Activity = {
            ...activity,
            id: newActivityId,
            createdAt: now,
            lastModified: now,
            // Ensure progress is initialized
            progress: activity.progress || { completed: 0, total: 5 },
            // Reset progress to allow re-completion
            status: workspace ? 'in-progress' : 'draft',
            currentStage: workspace ? activity.currentStage : 1,
          };

          // Add to activities store
          set((state) => ({
            activities: [...state.activities, importedActivity],
          }));

          // If there's workspace data, we'll import it separately
          if (workspace) {
            try {
              // Access workspace store and import the data
              const workspaceStore = JSON.parse(
                localStorage.getItem('workspace-store') || '{}'
              );
              const newWorkspaceState = {
                ...workspace,
                activityId: newActivityId,
                sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                lastModified: now,
                // Regenerate assignment IDs to avoid conflicts
                biasRiskAssignments:
                  workspace.biasRiskAssignments?.map((assignment: any) => ({
                    ...assignment,
                    id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  })) || [],
                stageAssignments:
                  workspace.stageAssignments?.map((assignment: any) => ({
                    ...assignment,
                    id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  })) || [],
              };

              // Update workspace store
              const updatedWorkspaceStore = {
                ...workspaceStore,
                state: newWorkspaceState,
              };
              localStorage.setItem(
                'workspace-store',
                JSON.stringify(updatedWorkspaceStore)
              );

              // Build success message with any validation warnings
              let successMessage = `Successfully imported "${activity.title}" with complete workspace data. You can now continue working on this analysis.`;
              if (validation.warnings.length > 0) {
                successMessage += ` Note: ${validation.warnings.length} minor issues were detected but the import completed successfully.`;
              }

              return {
                success: true,
                message: successMessage,
                activityId: newActivityId,
              };
            } catch (workspaceError) {
              console.warn(
                'Failed to import workspace data, but activity was imported:',
                workspaceError
              );
              return {
                success: true,
                message: `Imported "${activity.title}" but could not restore workspace data. You can still access the activity.`,
                activityId: newActivityId,
              };
            }
          }

          // Build success message with any validation warnings
          let successMessage = `Successfully imported "${activity.title}".`;
          if (validation.warnings.length > 0) {
            successMessage += ` Note: ${validation.warnings.length} minor issues were detected but the import completed successfully.`;
          }

          return {
            success: true,
            message: successMessage,
            activityId: newActivityId,
          };
        } catch (error) {
          console.error('Error importing activity:', error);
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
      name: 'bias-cards-activities',
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
