import { useActivityStore } from '@/lib/stores/activity-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { Activity } from '@/lib/types/activity';
import type { Report } from '@/lib/types/reports';
import { googleDriveService } from './google-drive';

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: Date;
  errors?: string[];
}

export interface SyncOptions {
  activities?: boolean;
  workspaces?: boolean;
  reports?: boolean;
  force?: boolean;
}

class SyncManager {
  private static instance: SyncManager;
  private isSyncing = false;
  private lastSyncTime: Date | null = null;

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private async syncActivities(
    folderId: string | null,
    errors: string[]
  ): Promise<void> {
    try {
      const activityStore = useActivityStore.getState();
      const activities = activityStore.activities;

      if (activities.length > 0) {
        await googleDriveService.saveFile({
          fileName: 'activities-backup.json',
          content: JSON.stringify(activities, null, 2),
          folderId: folderId || undefined,
        });
      }
    } catch (error) {
      errors.push(`Failed to sync activities: ${error}`);
    }
  }

  private async syncWorkspaces(
    folderId: string | null,
    errors: string[]
  ): Promise<void> {
    try {
      const workspaceStore = useWorkspaceStore.getState();
      // Save the current workspace state
      const workspaceData = {
        sessionId: workspaceStore.sessionId,
        name: workspaceStore.name,
        createdAt: workspaceStore.createdAt,
        lastModified: workspaceStore.lastModified,
        activityId: workspaceStore.activityId,
        currentStage: workspaceStore.currentStage,
        // completedActivityStages: workspaceStore.completedActivityStages,
        biasRiskAssignments: workspaceStore.biasRiskAssignments,
        stageAssignments: workspaceStore.stageAssignments,
        cardPairs: workspaceStore.cardPairs,
        selectedCardIds: workspaceStore.selectedCardIds,
        customAnnotations: workspaceStore.customAnnotations,
        completedStages: workspaceStore.completedStages,
        activityProgress: workspaceStore.activityProgress,
      };

      await googleDriveService.saveFile({
        fileName: 'workspace-backup.json',
        content: JSON.stringify(workspaceData, null, 2),
        folderId: folderId || undefined,
      });
    } catch (error) {
      errors.push(`Failed to sync workspaces: ${error}`);
    }
  }

  private async syncReports(
    folderId: string | null,
    errors: string[]
  ): Promise<void> {
    try {
      const reportsStore = useReportsStore.getState();
      const reports = reportsStore.reports;

      if (reports.length > 0) {
        await googleDriveService.saveFile({
          fileName: 'reports-backup.json',
          content: JSON.stringify(reports, null, 2),
          folderId: folderId || undefined,
        });
      }
    } catch (error) {
      errors.push(`Failed to sync reports: ${error}`);
    }
  }

  async syncToGoogleDrive(
    accessToken: string,
    options: SyncOptions = {
      activities: true,
      workspaces: true,
      reports: true,
    }
  ): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        message: 'Sync already in progress',
        timestamp: new Date(),
      };
    }

    this.isSyncing = true;
    const errors: string[] = [];

    try {
      googleDriveService.setAccessToken(accessToken);

      // Create folders for organization
      const activitiesFolder = await googleDriveService
        .createFolder('activities')
        .catch(() => null);
      const workspacesFolder = await googleDriveService
        .createFolder('workspaces')
        .catch(() => null);
      const reportsFolder = await googleDriveService
        .createFolder('reports')
        .catch(() => null);

      // Sync activities
      if (options.activities) {
        await this.syncActivities(activitiesFolder, errors);
      }

      // Sync workspaces
      if (options.workspaces) {
        await this.syncWorkspaces(workspacesFolder, errors);
      }

      // Sync reports
      if (options.reports) {
        await this.syncReports(reportsFolder, errors);
      }

      // Save sync metadata
      await googleDriveService.saveFile({
        fileName: 'sync-metadata.json',
        content: JSON.stringify(
          {
            lastSyncTime: new Date().toISOString(),
            syncedItems: {
              activities: options.activities,
              workspaces: options.workspaces,
              reports: options.reports,
            },
            version: '1.0.0',
          },
          null,
          2
        ),
      });

      this.lastSyncTime = new Date();

      return {
        success: errors.length === 0,
        message:
          errors.length === 0
            ? 'All data synced successfully'
            : `Sync completed with ${errors.length} error(s)`,
        timestamp: this.lastSyncTime,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error}`,
        timestamp: new Date(),
        errors: [String(error)],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  private async loadActivities(errors: string[]): Promise<void> {
    try {
      const activitiesData = await googleDriveService.loadFile({
        fileName: 'activities-backup.json',
      });

      if (activitiesData) {
        const activities = JSON.parse(activitiesData);
        const activityStore = useActivityStore.getState();

        // Merge or replace activities based on timestamp
        for (const activity of activities as Activity[]) {
          const existing = activityStore.getActivity(activity.id);
          if (
            !existing ||
            new Date(activity.lastModified) > new Date(existing.lastModified)
          ) {
            activityStore.updateActivity(activity.id, activity);
          }
        }
      }
    } catch (error) {
      errors.push(`Failed to load activities: ${error}`);
    }
  }

  private async loadWorkspaces(errors: string[]): Promise<void> {
    try {
      const workspaceData = await googleDriveService.loadFile({
        fileName: 'workspace-backup.json',
      });

      if (workspaceData) {
        const workspace = JSON.parse(workspaceData);
        const workspaceStore = useWorkspaceStore.getState();

        // Update the workspace if the backup is newer
        if (
          !workspaceStore.lastModified ||
          new Date(workspace.lastModified) >
            new Date(workspaceStore.lastModified)
        ) {
          // Reset and restore workspace state
          workspaceStore.resetWorkspace();
          Object.assign(workspaceStore, workspace);
        }
      }
    } catch (error) {
      errors.push(`Failed to load workspaces: ${error}`);
    }
  }

  private async loadReports(errors: string[]): Promise<void> {
    try {
      const reportsData = await googleDriveService.loadFile({
        fileName: 'reports-backup.json',
      });

      if (reportsData) {
        const reports = JSON.parse(reportsData);
        const reportsStore = useReportsStore.getState();

        // Merge or replace reports
        for (const report of reports as Report[]) {
          const existing = reportsStore.getReport(report.id);
          if (!existing) {
            // Add report if it doesn't exist
            reportsStore.reports.push(report);
          }
        }
      }
    } catch (error) {
      errors.push(`Failed to load reports: ${error}`);
    }
  }

  async loadFromGoogleDrive(
    accessToken: string,
    options: SyncOptions = {
      activities: true,
      workspaces: true,
      reports: true,
    }
  ): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        message: 'Sync already in progress',
        timestamp: new Date(),
      };
    }

    this.isSyncing = true;
    const errors: string[] = [];

    try {
      googleDriveService.setAccessToken(accessToken);

      if (options.activities) {
        await this.loadActivities(errors);
      }

      if (options.workspaces) {
        await this.loadWorkspaces(errors);
      }

      if (options.reports) {
        await this.loadReports(errors);
      }

      this.lastSyncTime = new Date();

      return {
        success: errors.length === 0,
        message:
          errors.length === 0
            ? 'All data loaded successfully'
            : `Load completed with ${errors.length} error(s)`,
        timestamp: this.lastSyncTime,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: `Load failed: ${error}`,
        timestamp: new Date(),
        errors: [String(error)],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  performAutoSync(accessToken: string): Promise<SyncResult> {
    // Check last sync time
    if (this.lastSyncTime) {
      const timeSinceLastSync = Date.now() - this.lastSyncTime.getTime();
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (timeSinceLastSync < FIVE_MINUTES) {
        return Promise.resolve({
          success: true,
          message: 'Skipping auto-sync (synced recently)',
          timestamp: this.lastSyncTime,
        });
      }
    }

    return this.syncToGoogleDrive(accessToken);
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();
