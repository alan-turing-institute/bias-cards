import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_ACTIVITIES } from '@/lib/data/demo-content';
import type { Activity, Report } from '@/lib/types/activity';

interface ActivityStore {
  // State
  activities: Activity[];
  reports: Report[];
  demoDataInitialized: boolean;
  deletedDemoIds: string[];

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

  // Demo data actions
  initializeDemoData: () => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],
      reports: [],
      demoDataInitialized: false,
      deletedDemoIds: [],

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
                  currentStage: stage as unknown,
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
              const newCompleted = Math.max(activity.progress.completed, stage);
              const nextStage = Math.min(stage + 1, 5); // Cap at stage 5
              return {
                ...activity,
                currentStage: nextStage as unknown,
                progress: {
                  ...activity.progress,
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

        // Can advance if previous stage is completed
        return activity.progress.completed >= targetStage - 1;
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

        const exportData = {
          activity,
          exportedAt: new Date().toISOString(),
          format,
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
    }),
    {
      name: 'bias-cards-activities',
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Initialize demo data after store rehydration if needed
        if (state) {
          state.initializeDemoData();
        }
      },
    }
  )
);
