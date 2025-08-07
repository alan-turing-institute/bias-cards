import type { SavedWorkspace, WorkspaceState } from '@/lib/types';

export class StorageError extends Error {
  operation?: string;

  constructor(message: string, operation?: string) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
  }
}

export class SerializationError extends Error {
  data?: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'SerializationError';
    this.data = data;
  }
}

const APP_VERSION = '1.0.0';
const STORAGE_KEY_PREFIX = 'bias-cards';

export interface StorageManager {
  // localStorage operations
  saveToLocalStorage: (key: string, data: unknown) => Promise<void>;
  loadFromLocalStorage: <T = unknown>(key: string) => Promise<T | null>;
  removeFromLocalStorage: (key: string) => Promise<void>;
  clearLocalStorage: () => Promise<void>;

  // Workspace serialization
  serializeWorkspace: (workspace: WorkspaceState) => SavedWorkspace;
  deserializeWorkspace: (savedWorkspace: SavedWorkspace) => WorkspaceState;

  // Session management
  listSavedSessions: () => Promise<string[]>;
  saveSession: (sessionId: string, workspace: WorkspaceState) => Promise<void>;
  loadSession: (sessionId: string) => Promise<WorkspaceState | null>;
  deleteSession: (sessionId: string) => Promise<void>;

  // Auto-save functionality
  enableAutoSave: (
    workspace: WorkspaceState,
    intervalSeconds: number
  ) => number;
  disableAutoSave: (timerId: number) => void;
}

class BrowserStorageManager implements StorageManager {
  private getStorageKey(key: string): string {
    return `${STORAGE_KEY_PREFIX}:${key}`;
  }

  saveToLocalStorage(key: string, data: unknown): Promise<void> {
    return Promise.resolve().then(() => {
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(this.getStorageKey(key), serialized);
      } catch (error) {
        throw new StorageError(
          `Failed to save to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'save'
        );
      }
    });
  }

  loadFromLocalStorage<T = unknown>(key: string): Promise<T | null> {
    return Promise.resolve().then(() => {
      try {
        const serialized = localStorage.getItem(this.getStorageKey(key));
        if (!serialized) {
          return null;
        }

        return JSON.parse(serialized);
      } catch (error) {
        throw new StorageError(
          `Failed to load from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'load'
        );
      }
    });
  }

  removeFromLocalStorage(key: string): Promise<void> {
    return Promise.resolve().then(() => {
      try {
        localStorage.removeItem(this.getStorageKey(key));
      } catch (error) {
        throw new StorageError(
          `Failed to remove from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'remove'
        );
      }
    });
  }

  clearLocalStorage(): Promise<void> {
    return Promise.resolve().then(() => {
      try {
        const keys = Object.keys(localStorage);
        const appKeys = keys.filter((key) =>
          key.startsWith(STORAGE_KEY_PREFIX)
        );

        for (const key of appKeys) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        throw new StorageError(
          `Failed to clear localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'clear'
        );
      }
    });
  }

  serializeWorkspace(workspace: WorkspaceState): SavedWorkspace {
    try {
      return {
        workspace,
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        metadata: {
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          appVersion: APP_VERSION,
        },
      };
    } catch (error) {
      throw new SerializationError(
        `Failed to serialize workspace: ${error instanceof Error ? error.message : 'Unknown error'}`,
        workspace
      );
    }
  }

  private getDefaultActivityProgress() {
    return {
      totalCards: 40,
      assignedCards: 0,
      pairedCards: 0,
      completionPercentage: 0,
      timeSpent: 0,
      milestones: [],
    };
  }

  private createWorkspaceFromSaved(workspace: WorkspaceState): WorkspaceState {
    const now = new Date().toISOString();
    return {
      sessionId: workspace.sessionId || `restored-${Date.now()}`,
      name: workspace.name,
      createdAt: workspace.createdAt || now,
      lastModified: workspace.lastModified || now,
      stageAssignments: workspace.stageAssignments || [],
      cardPairs: workspace.cardPairs || [],
      selectedCardIds: workspace.selectedCardIds || [],
      customAnnotations: workspace.customAnnotations || {},
      completedStages: workspace.completedStages || [],
      activityProgress:
        workspace.activityProgress || this.getDefaultActivityProgress(),
      currentStage: workspace.currentStage || 1,
      completedActivityStages: workspace.completedActivityStages || [],
      biasRiskAssignments: workspace.biasRiskAssignments || [],
    };
  }

  deserializeWorkspace(savedWorkspace: SavedWorkspace): WorkspaceState {
    try {
      // Validate required fields
      if (!savedWorkspace.workspace) {
        throw new SerializationError(
          'Invalid saved workspace: missing workspace data'
        );
      }

      return this.createWorkspaceFromSaved(savedWorkspace.workspace);
    } catch (error) {
      throw new SerializationError(
        `Failed to deserialize workspace: ${error instanceof Error ? error.message : 'Unknown error'}`,
        savedWorkspace
      );
    }
  }

  listSavedSessions(): Promise<string[]> {
    return Promise.resolve().then(() => {
      try {
        const keys = Object.keys(localStorage);
        const sessionKeys = keys
          .filter((key) => key.startsWith(this.getStorageKey('session:')))
          .map((key) => key.replace(this.getStorageKey('session:'), ''));

        return sessionKeys;
      } catch (error) {
        throw new StorageError(
          `Failed to list saved sessions: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'list'
        );
      }
    });
  }

  async saveSession(
    sessionId: string,
    workspace: WorkspaceState
  ): Promise<void> {
    const savedWorkspace = this.serializeWorkspace(workspace);
    await this.saveToLocalStorage(`session:${sessionId}`, savedWorkspace);
  }

  async loadSession(sessionId: string): Promise<WorkspaceState | null> {
    const savedWorkspace = await this.loadFromLocalStorage(
      `session:${sessionId}`
    );
    if (!savedWorkspace) {
      return null;
    }

    return this.deserializeWorkspace(savedWorkspace as SavedWorkspace);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.removeFromLocalStorage(`session:${sessionId}`);
  }

  enableAutoSave(workspace: WorkspaceState, intervalSeconds: number): number {
    return window.setInterval(async () => {
      try {
        await this.saveSession(workspace.sessionId, workspace);
      } catch (_error) {
        // Handle error silently
      }
    }, intervalSeconds * 1000);
  }

  disableAutoSave(timerId: number): void {
    window.clearInterval(timerId);
  }
}

// Singleton instance
export const storageManager: StorageManager = new BrowserStorageManager();

// Utility functions for common operations
export async function saveWorkspaceToLocalStorage(
  workspace: WorkspaceState
): Promise<void> {
  await storageManager.saveSession(workspace.sessionId, workspace);
}

export async function loadWorkspaceFromLocalStorage(
  sessionId: string
): Promise<WorkspaceState | null> {
  return await storageManager.loadSession(sessionId);
}

export async function getAllSavedSessions(): Promise<string[]> {
  return await storageManager.listSavedSessions();
}

export async function deleteWorkspaceFromLocalStorage(
  sessionId: string
): Promise<void> {
  await storageManager.deleteSession(sessionId);
}

export function createAutoSaveTimer(
  workspace: WorkspaceState,
  intervalSeconds: number
): number {
  return storageManager.enableAutoSave(workspace, intervalSeconds);
}

export function clearAutoSaveTimer(timerId: number): void {
  storageManager.disableAutoSave(timerId);
}
