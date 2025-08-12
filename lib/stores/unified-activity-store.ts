import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BiasActivity } from '@/lib/activities/bias-activity';
import type { BiasRiskCategory, LifecycleStage } from '@/lib/types';
import type {
  BiasActivityData,
  ImplementationNote,
} from '@/lib/types/bias-activity';

// Lightweight metadata for activity list
interface ActivityMetadata {
  id: string;
  name: string;
  description?: string;
  lastModified: string;
  currentStage: number;
  completedStages: number[];
  biasCount: number;
  mitigationCount: number;
}

interface UnifiedActivityStore {
  // Core state
  currentActivity: BiasActivity | null;
  currentActivityData: BiasActivityData | null; // For persistence
  activities: ActivityMetadata[];

  // Hydration state
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;

  // Core actions
  initialize: () => Promise<void>;
  createActivity: (name: string, description?: string) => Promise<string>;
  loadActivity: (id: string) => Promise<void>;
  saveCurrentActivity: () => void;
  deleteActivity: (id: string) => void;

  // BiasActivity delegated actions (Stage 1)
  assignBiasRisk: (biasId: string, risk: BiasRiskCategory) => void;
  removeBiasRisk: (biasId: string) => void;

  // BiasActivity delegated actions (Stage 2)
  assignToLifecycle: (biasId: string, stage: LifecycleStage) => void;
  removeFromLifecycle: (biasId: string, stage: LifecycleStage) => void;

  // BiasActivity delegated actions (Stage 3)
  setRationale: (
    biasId: string,
    stage: LifecycleStage,
    rationale: string
  ) => void;
  removeRationale: (biasId: string, stage: LifecycleStage) => void;

  // BiasActivity delegated actions (Stage 4)
  addMitigation: (
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string
  ) => void;
  removeMitigation: (
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string
  ) => void;

  // BiasActivity delegated actions (Stage 5)
  setImplementationNote: (
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string,
    note: ImplementationNote
  ) => void;
  removeImplementationNote: (
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string
  ) => void;

  // Stage navigation
  setCurrentStage: (stage: number) => void;
  completeStage: (stage: number) => void;
  canAdvanceToStage: (stage: number) => boolean;

  // Export/Import
  exportActivity: (id?: string) => Promise<void>;
  importActivity: (
    file: File
  ) => Promise<{ success: boolean; message: string; activityId?: string }>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

// Helper to generate activity ID
function generateActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to create metadata from BiasActivity
function createMetadataFromActivity(activity: BiasActivity): ActivityMetadata {
  const data = activity.export();
  const biasCount = Object.keys(data.biases).length;
  const mitigationCount = Object.values(data.biases).reduce((count, bias) => {
    return (
      count + Object.values(bias.mitigations).reduce((c, m) => c + m.length, 0)
    );
  }, 0);

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    lastModified: data.updatedAt,
    currentStage: data.state.currentStage,
    completedStages: data.state.completedStages,
    biasCount,
    mitigationCount,
  };
}

// Helper to retrieve full activity data by ID from localStorage
function getFullActivityDataById(id: string): BiasActivityData | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const stored = localStorage.getItem('unified-activity-store');
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    const activitiesData = parsed.state?.activitiesData;

    if (activitiesData?.[id]) {
      return activitiesData[id] as BiasActivityData;
    }

    // Fallback: check if it's the current activity data
    const currentData = parsed.state?.currentActivityData;
    if (currentData && currentData.id === id) {
      return currentData as BiasActivityData;
    }

    return null;
  } catch (_error) {
    return null;
  }
}

export const useUnifiedActivityStore = create<UnifiedActivityStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentActivity: null,
      currentActivityData: null,
      activities: [],
      isHydrated: false,
      isLoading: false,
      error: null,

      // Initialize the store (load deck and restore activity if needed)
      initialize: async () => {
        set({ isLoading: true, error: null });

        try {
          const { BiasDeck } = await import('@/lib/cards/decks/bias-deck');
          const { BiasActivity: BiasActivityClass } = await import(
            '@/lib/activities/bias-activity'
          );

          const deck = await BiasDeck.getInstance();

          // Check if we have persisted activity data to restore
          const { currentActivityData } = get();
          if (currentActivityData) {
            const activity = new BiasActivityClass(deck, {
              name: currentActivityData.name,
              description: currentActivityData.description,
            });
            activity.load(currentActivityData);

            set({
              currentActivity: activity,
              isLoading: false,
              isHydrated: true,
            });
          } else {
            set({
              isLoading: false,
              isHydrated: true,
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to initialize',
            isLoading: false,
            isHydrated: true,
          });
        }
      },

      // Create a new activity
      createActivity: async (name, description) => {
        set({ isLoading: true, error: null });

        try {
          const { BiasDeck } = await import('@/lib/cards/decks/bias-deck');
          const { BiasActivity: BiasActivityClass } = await import(
            '@/lib/activities/bias-activity'
          );

          const deck = await BiasDeck.getInstance();
          const id = generateActivityId();

          const activity = new BiasActivityClass(deck, {
            id,
            name,
            description,
          });

          const metadata = createMetadataFromActivity(activity);

          set((state) => ({
            currentActivity: activity,
            currentActivityData: activity.export(),
            activities: [...state.activities, metadata],
            isLoading: false,
          }));

          return id;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create activity',
            isLoading: false,
          });
          throw error;
        }
      },

      // Load an existing activity
      loadActivity: async (id) => {
        const metadata = get().activities.find((a) => a.id === id);
        if (!metadata) {
          set({ error: 'Activity not found' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Get the full data from localStorage
          const stored = localStorage.getItem('bias-cards-store');
          if (stored) {
            const parsed = JSON.parse(stored);

            // Try to get activity data from multiple possible locations
            let activityData = parsed.state?.activitiesData?.[id];

            // If not found in activitiesData, check if it's the current activity
            if (!activityData && parsed.state?.currentActivityData?.id === id) {
              activityData = parsed.state.currentActivityData;
            }

            if (activityData) {
              const { BiasDeck } = await import('@/lib/cards/decks/bias-deck');
              const { BiasActivity: BiasActivityClass } = await import(
                '@/lib/activities/bias-activity'
              );

              const deck = await BiasDeck.getInstance();
              const activity = new BiasActivityClass(deck, {
                id: activityData.id,
                name: activityData.name,
                description: activityData.description,
              });
              activity.load(activityData);

              set({
                currentActivity: activity,
                currentActivityData: activityData,
                isLoading: false,
              });

              return; // Success
            }
          }

          // If we couldn't find the activity data, set an error
          set({
            error: 'Activity data not found in storage',
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load activity',
            isLoading: false,
          });
        }
      },

      // Save current activity
      saveCurrentActivity: () => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        const activityData = currentActivity.export();
        const metadata = createMetadataFromActivity(currentActivity);

        // Force a new object reference to ensure Zustand detects the change
        set((state) => ({
          currentActivityData: { ...activityData },
          activities: state.activities.map((a) =>
            a.id === metadata.id ? metadata : a
          ),
        }));
      },

      // Delete an activity
      deleteActivity: (id) => {
        set((state) => {
          const isCurrentActivity = state.currentActivity?.id === id;

          return {
            activities: state.activities.filter((a) => a.id !== id),
            currentActivity: isCurrentActivity ? null : state.currentActivity,
            currentActivityData: isCurrentActivity
              ? null
              : state.currentActivityData,
          };
        });
      },

      // Stage 1: Risk Assessment
      assignBiasRisk: (biasId, risk) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }
        currentActivity.assignBiasRisk(biasId, risk);
        get().saveCurrentActivity();
      },

      removeBiasRisk: (biasId) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.removeBiasRisk(biasId);
        get().saveCurrentActivity();
      },

      // Stage 2: Lifecycle Assignment
      assignToLifecycle: (biasId, stage) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.assignToLifecycle(biasId, stage);
        get().saveCurrentActivity();
      },

      removeFromLifecycle: (biasId, stage) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.removeFromLifecycle(biasId, stage);
        get().saveCurrentActivity();
      },

      // Stage 3: Rationale
      setRationale: (biasId, stage, rationale) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.setRationale(biasId, stage, rationale);
        get().saveCurrentActivity();
      },

      removeRationale: (biasId, stage) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.removeRationale(biasId, stage);
        get().saveCurrentActivity();
      },

      // Stage 4: Mitigation Selection
      addMitigation: (biasId, stage, mitigationId) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.addMitigation(biasId, stage, mitigationId);
        get().saveCurrentActivity();
      },

      removeMitigation: (biasId, stage, mitigationId) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.removeMitigation(biasId, stage, mitigationId);
        get().saveCurrentActivity();
      },

      // Stage 5: Implementation Planning
      setImplementationNote: (biasId, stage, mitigationId, note) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.setImplementationNote(
          biasId,
          stage,
          mitigationId,
          note
        );
        get().saveCurrentActivity();
      },

      removeImplementationNote: (biasId, stage, mitigationId) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        currentActivity.removeImplementationNote(biasId, stage, mitigationId);
        get().saveCurrentActivity();
      },

      // Stage navigation
      setCurrentStage: (stage) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        const activityData = currentActivity.export();
        activityData.state.currentStage = stage;
        currentActivity.load(activityData);

        get().saveCurrentActivity();
      },

      completeStage: (stage) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return;
        }

        const activityData = currentActivity.export();
        if (!activityData.state.completedStages.includes(stage)) {
          activityData.state.completedStages.push(stage);
        }
        currentActivity.load(activityData);

        get().saveCurrentActivity();
      },

      canAdvanceToStage: (stage) => {
        const { currentActivity } = get();
        if (!currentActivity) {
          return false;
        }

        const activityData = currentActivity.export();
        const completedStages = activityData.state.completedStages;

        // Can always go to stage 1
        if (stage === 1) {
          return true;
        }

        // Can go to any completed stage or the next stage
        return (
          completedStages.includes(stage - 1) || completedStages.includes(stage)
        );
      },

      // Export activity
      exportActivity: async (id) => {
        const activityId = id || get().currentActivity?.id;
        if (!activityId) {
          return;
        }

        // Get full activity data - either current or from localStorage
        let exportData: BiasActivityData | null = null;

        if (!id || id === get().currentActivity?.id) {
          // Exporting current activity
          exportData = get().currentActivityData;
        } else {
          // Exporting specific activity by ID - get full data from localStorage
          exportData = getFullActivityDataById(id);
        }

        if (!exportData) {
          return;
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bias-activity-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      // Import activity
      importActivity: async (file) => {
        try {
          const text = await file.text();
          const data = JSON.parse(text) as BiasActivityData;

          // Validate the data structure
          if (!(data.biases && data.state)) {
            return {
              success: false,
              message: 'Invalid activity data format',
            };
          }

          const { BiasDeck } = await import('@/lib/cards/decks/bias-deck');
          const { BiasActivity: BiasActivityClass } = await import(
            '@/lib/activities/bias-activity'
          );

          const deck = await BiasDeck.getInstance();
          const activity = new BiasActivityClass(deck, {
            name: data.name,
            description: data.description,
          });
          activity.load(data);

          const metadata = createMetadataFromActivity(activity);

          set((state) => ({
            currentActivity: activity,
            currentActivityData: data,
            activities: [...state.activities, metadata],
          }));

          return {
            success: true,
            message: `Successfully imported "${data.name}"`,
            activityId: data.id,
          };
        } catch (error) {
          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to import activity',
          };
        }
      },

      // Utility
      clearError: () => set({ error: null }),

      reset: () =>
        set({
          currentActivity: null,
          currentActivityData: null,
          activities: [],
          error: null,
          isLoading: false,
        }),
    }),
    {
      name: 'bias-cards-store',
      version: 2, // Clean break from v1
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Create a map of all activity data for persistence
        const activitiesData: Record<string, BiasActivityData> = {};

        // Always include current activity data if it exists
        if (state.currentActivityData) {
          activitiesData[state.currentActivityData.id] =
            state.currentActivityData;
        }

        return {
          // Persist the data, not the BiasActivity instances
          currentActivityData: state.currentActivityData,
          activities: state.activities,
          activitiesData, // Store all activity data
        };
      },
      onRehydrateStorage: () => (state) => {
        // After rehydration, initialize to restore BiasActivity instances
        if (state) {
          state.isHydrated = true;
          // Automatically initialize if we have persisted data
          if (state.currentActivityData) {
            setTimeout(() => {
              state.initialize().catch(console.error);
            }, 0);
          }
        }
      },
    }
  )
);
