/**
 * Migration utility to transition from v1 to v2 store structure
 * This extracts the clean activityState data from the old format
 * and imports it into the new unified store
 */

import type { BiasActivityData } from '@/lib/types/bias-activity';

interface OldWorkspaceStore {
  state?: {
    activityState?: BiasActivityData;
    activityId?: string;
    currentActivity?: {
      export?: () => BiasActivityData;
    };
    // Other legacy fields we're removing
    customAnnotations?: unknown;
    milestones?: unknown;
    completedActivityStages?: unknown;
    sessionId?: string;
  };
}

interface OldActivityStore {
  state?: {
    activities?: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  };
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  // Check if old stores exist
  const hasOldWorkspace = localStorage.getItem('workspace-store') !== null;
  const hasOldActivity = localStorage.getItem('activity-store') !== null;

  // Check if new store already exists with version 2
  const newStore = localStorage.getItem('bias-cards-store');
  if (newStore) {
    try {
      const parsed = JSON.parse(newStore);
      if (parsed.version === 2) {
        // Already migrated
        return false;
      }
    } catch {
      // Invalid JSON, needs migration
    }
  }

  return hasOldWorkspace || hasOldActivity;
}

/**
 * Extract clean activity data from old format
 */
function extractActivityData(
  oldWorkspace: OldWorkspaceStore
): BiasActivityData | null {
  const state = oldWorkspace.state;
  if (!state) {
    return null;
  }

  // Priority 1: Use activityState if it exists (this is the clean data)
  if (state.activityState && typeof state.activityState === 'object') {
    const activityState = state.activityState;

    // Validate it has the required structure
    if (activityState.biases && activityState.state) {
      return activityState;
    }
  }

  // Priority 2: Try to export from currentActivity if it exists
  if (
    state.currentActivity?.export &&
    typeof state.currentActivity.export === 'function'
  ) {
    try {
      const exported = state.currentActivity.export();
      if (exported?.biases && exported.state) {
        return exported;
      }
    } catch {
      // Export failed, continue to next option
    }
  }

  return null;
}

/**
 * Perform the migration from v1 to v2
 */
export function migrateToV2(): {
  success: boolean;
  message: string;
  migratedCount: number;
} {
  if (!needsMigration()) {
    return {
      success: true,
      message: 'No migration needed - already on v2',
      migratedCount: 0,
    };
  }

  try {
    // Step 1: Extract data from old stores
    const oldWorkspaceStr = localStorage.getItem('workspace-store');
    const oldActivityStr = localStorage.getItem('activity-store');

    let activityData: BiasActivityData | null = null;
    let _activityList: Array<{
      id: string;
      name: string;
      description?: string;
    }> = [];

    // Extract activity data from workspace
    if (oldWorkspaceStr) {
      try {
        const oldWorkspace = JSON.parse(oldWorkspaceStr) as OldWorkspaceStore;
        activityData = extractActivityData(oldWorkspace);
      } catch (_error) {
        // Failed to parse workspace data - continue without it
      }
    }

    // Extract activity list from activity store
    if (oldActivityStr) {
      try {
        const oldActivity = JSON.parse(oldActivityStr) as OldActivityStore;
        if (oldActivity.state?.activities) {
          _activityList = oldActivity.state.activities.map((a) => ({
            id: a.id,
            name: a.title,
            description: a.description,
          }));
        }
      } catch (_error) {
        // Failed to parse activity data - continue without it
      }
    }

    // Step 2: Create new v2 store structure
    const newStoreData = {
      state: {
        currentActivityData: activityData,
        activities: activityData
          ? [
              {
                id: activityData.id,
                name: activityData.name,
                description: activityData.description,
                lastModified: activityData.updatedAt,
                currentStage: activityData.state.currentStage,
                completedStages: activityData.state.completedStages,
                biasCount: Object.keys(activityData.biases).length,
                mitigationCount: Object.values(activityData.biases).reduce(
                  (count, bias) => {
                    return (
                      count +
                      Object.values(bias.mitigations).reduce(
                        (c, m) => c + m.length,
                        0
                      )
                    );
                  },
                  0
                ),
              },
            ]
          : [],
      },
      version: 2,
    };

    // Step 3: Save new store
    localStorage.setItem('bias-cards-store', JSON.stringify(newStoreData));

    // Step 4: Create backup of old stores before removing
    const backup = {
      timestamp: new Date().toISOString(),
      workspace: oldWorkspaceStr,
      activity: oldActivityStr,
    };
    localStorage.setItem('bias-cards-v1-backup', JSON.stringify(backup));

    // Step 5: Remove old stores
    localStorage.removeItem('workspace-store');
    localStorage.removeItem('activity-store');
    localStorage.removeItem('cards-storage'); // Also remove any other legacy keys

    return {
      success: true,
      message: `Successfully migrated to v2. ${activityData ? 'Current activity preserved.' : 'No active activity found.'}`,
      migratedCount: activityData ? 1 : 0,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Migration failed',
      migratedCount: 0,
    };
  }
}

/**
 * Restore from backup if migration failed
 */
export function restoreFromBackup(): boolean {
  const backupStr = localStorage.getItem('bias-cards-v1-backup');
  if (!backupStr) {
    return false;
  }

  try {
    const backup = JSON.parse(backupStr);

    if (backup.workspace) {
      localStorage.setItem('workspace-store', backup.workspace);
    }
    if (backup.activity) {
      localStorage.setItem('activity-store', backup.activity);
    }

    // Remove v2 store
    localStorage.removeItem('bias-cards-store');

    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up backup after successful migration
 */
export function cleanupBackup(): void {
  localStorage.removeItem('bias-cards-v1-backup');
}
