import { useActivityStore } from '@/lib/stores/activity-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
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
        try {
          const activityStore = useActivityStore.getState();
          const activities = activityStore.activities;

          if (activities.length > 0) {
            await googleDriveService.saveFile({
              fileName: 'activities-backup.json',
              content: JSON.stringify(activities, null, 2),
              folderId: activitiesFolder || undefined,
            });
          }
        } catch (error) {
          errors.push(`Failed to sync activities: ${error}`);
        }
      }

      // Sync workspaces
      if (options.workspaces) {
        try {
          const workspaceStore = useWorkspaceStore.getState();
          const workspaces = workspaceStore.workspaces;

          if (workspaces.length > 0) {
            await googleDriveService.saveFile({
              fileName: 'workspaces-backup.json',
              content: JSON.stringify(workspaces, null, 2),
              folderId: workspacesFolder || undefined,
            });
          }
        } catch (error) {
          errors.push(`Failed to sync workspaces: ${error}`);
        }
      }

      // Sync reports
      if (options.reports) {
        try {
          const reportsStore = useReportsStore.getState();
          const reports = reportsStore.reports;

          if (reports.length > 0) {
            await googleDriveService.saveFile({
              fileName: 'reports-backup.json',
              content: JSON.stringify(reports, null, 2),
              folderId: reportsFolder || undefined,
            });
          }
        } catch (error) {
          errors.push(`Failed to sync reports: ${error}`);
        }
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

      // Load activities
      if (options.activities) {
        try {
          const activitiesData = await googleDriveService.loadFile({
            fileName: 'activities-backup.json',
          });

          if (activitiesData) {
            const activities = JSON.parse(activitiesData);
            const activityStore = useActivityStore.getState();

            // Merge or replace activities based on timestamp
            activities.forEach((activity: any) => {
              const existing = activityStore.getActivity(activity.id);
              if (
                !existing ||
                new Date(activity.lastModified) >
                  new Date(existing.lastModified)
              ) {
                activityStore.updateActivity(activity.id, activity);
              }
            });
          }
        } catch (error) {
          errors.push(`Failed to load activities: ${error}`);
        }
      }

      // Load workspaces
      if (options.workspaces) {
        try {
          const workspacesData = await googleDriveService.loadFile({
            fileName: 'workspaces-backup.json',
          });

          if (workspacesData) {
            const workspaces = JSON.parse(workspacesData);
            const workspaceStore = useWorkspaceStore.getState();

            // Merge or replace workspaces
            workspaces.forEach((workspace: any) => {
              const existing = workspaceStore.getWorkspace(workspace.id);
              if (
                !existing ||
                new Date(workspace.lastModified) >
                  new Date(existing.lastModified)
              ) {
                workspaceStore.updateWorkspace(workspace.id, workspace);
              }
            });
          }
        } catch (error) {
          errors.push(`Failed to load workspaces: ${error}`);
        }
      }

      // Load reports
      if (options.reports) {
        try {
          const reportsData = await googleDriveService.loadFile({
            fileName: 'reports-backup.json',
          });

          if (reportsData) {
            const reports = JSON.parse(reportsData);
            const reportsStore = useReportsStore.getState();

            // Merge or replace reports
            reports.forEach((report: any) => {
              const existing = reportsStore.getReport(report.id);
              if (!existing) {
                // Add report if it doesn't exist
                reportsStore.reports.push(report);
              }
            });
          }
        } catch (error) {
          errors.push(`Failed to load reports: ${error}`);
        }
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

  async performAutoSync(accessToken: string): Promise<SyncResult> {
    // Check last sync time
    if (this.lastSyncTime) {
      const timeSinceLastSync = Date.now() - this.lastSyncTime.getTime();
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (timeSinceLastSync < FIVE_MINUTES) {
        return {
          success: true,
          message: 'Skipping auto-sync (synced recently)',
          timestamp: this.lastSyncTime,
        };
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
