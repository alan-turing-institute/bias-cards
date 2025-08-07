import { saveAs } from 'file-saver';
import type { SavedWorkspace, WorkspaceState } from '@/lib/types';
import { storageManager } from './storage';

export class FileOperationError extends Error {
  operation?: string;

  constructor(message: string, operation?: string) {
    super(message);
    this.name = 'FileOperationError';
    this.operation = operation;
  }
}

export interface FileOperations {
  downloadWorkspace: (
    workspace: WorkspaceState,
    filename?: string
  ) => Promise<void>;
  uploadWorkspace: (file: File) => Promise<WorkspaceState>;
  generateFilename: (workspace: WorkspaceState) => string;
  validateWorkspaceFile: (data: unknown) => SavedWorkspace;
}

class BrowserFileOperations implements FileOperations {
  downloadWorkspace(
    workspace: WorkspaceState,
    filename?: string
  ): Promise<void> {
    return Promise.resolve().then(() => {
      try {
        const savedWorkspace = storageManager.serializeWorkspace(workspace);
        const jsonString = JSON.stringify(savedWorkspace, null, 2);
        const blob = new Blob([jsonString], {
          type: 'application/json;charset=utf-8',
        });

        const finalFilename = filename || this.generateFilename(workspace);
        saveAs(blob, finalFilename);
      } catch (error) {
        throw new FileOperationError(
          `Failed to download workspace: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'download'
        );
      }
    });
  }

  uploadWorkspace(file: File): Promise<WorkspaceState> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new FileOperationError('No file provided', 'upload'));
        return;
      }

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        reject(new FileOperationError('File must be a JSON file', 'upload'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          if (!jsonString) {
            reject(
              new FileOperationError('Failed to read file contents', 'upload')
            );
            return;
          }

          const data = JSON.parse(jsonString);
          const validatedWorkspace = this.validateWorkspaceFile(data);
          const workspace =
            storageManager.deserializeWorkspace(validatedWorkspace);

          resolve(workspace);
        } catch (error) {
          reject(
            new FileOperationError(
              `Failed to parse workspace file: ${error instanceof Error ? error.message : 'Unknown error'}`,
              'upload'
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new FileOperationError('Failed to read file', 'upload'));
      };

      reader.readAsText(file);
    });
  }

  generateFilename(workspace: WorkspaceState): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5);
    const workspaceName = workspace.name
      ? workspace.name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
      : 'untitled';

    return `bias-cards-workspace-${workspaceName}-${timestamp}.json`;
  }

  validateWorkspaceFile(data: unknown): SavedWorkspace {
    this.validateDataStructure(data);
    this.validateTopLevelFields(data as Record<string, unknown>);
    this.validateWorkspaceData((data as Record<string, unknown>).workspace);

    return data as SavedWorkspace;
  }

  private validateDataStructure(data: unknown): void {
    if (typeof data !== 'object' || data === null) {
      throw new FileOperationError('Invalid file format: not a JSON object');
    }
  }

  private validateTopLevelFields(data: Record<string, unknown>): void {
    if (!data.workspace) {
      throw new FileOperationError(
        'Invalid workspace file: missing workspace data'
      );
    }

    if (!data.version) {
      throw new FileOperationError(
        'Invalid workspace file: missing version information'
      );
    }
  }

  private validateWorkspaceData(workspace: unknown): void {
    if (typeof workspace !== 'object') {
      throw new FileOperationError(
        'Invalid workspace file: workspace data is not an object'
      );
    }

    const workspaceObj = workspace as Record<string, unknown>;
    this.validateRequiredFields(workspaceObj);
    this.validateArrayFields(workspaceObj);
    this.validateObjectFields(workspaceObj);
  }

  private validateRequiredFields(workspace: Record<string, unknown>): void {
    const requiredFields = ['sessionId', 'createdAt', 'lastModified'];
    for (const field of requiredFields) {
      if (!(field in workspace)) {
        throw new FileOperationError(
          `Invalid workspace file: missing field '${field}'`
        );
      }
    }
  }

  private validateArrayFields(workspace: Record<string, unknown>): void {
    const arrayFields = [
      'stageAssignments',
      'cardPairs',
      'selectedCardIds',
      'completedStages',
    ];
    for (const field of arrayFields) {
      if (workspace[field] && !Array.isArray(workspace[field])) {
        throw new FileOperationError(
          `Invalid workspace file: '${field}' must be an array`
        );
      }
    }
  }

  private validateObjectFields(workspace: Record<string, unknown>): void {
    if (
      workspace.customAnnotations &&
      typeof workspace.customAnnotations !== 'object'
    ) {
      throw new FileOperationError(
        "Invalid workspace file: 'customAnnotations' must be an object"
      );
    }

    if (
      workspace.activityProgress &&
      typeof workspace.activityProgress !== 'object'
    ) {
      throw new FileOperationError(
        "Invalid workspace file: 'activityProgress' must be an object"
      );
    }
  }
}

// Singleton instance
export const fileOperations: FileOperations = new BrowserFileOperations();

// Utility functions for common operations
export async function downloadWorkspaceAsFile(
  workspace: WorkspaceState,
  customFilename?: string
): Promise<void> {
  await fileOperations.downloadWorkspace(workspace, customFilename);
}

export async function uploadWorkspaceFromFile(
  file: File
): Promise<WorkspaceState> {
  return await fileOperations.uploadWorkspace(file);
}

export function generateWorkspaceFilename(workspace: WorkspaceState): string {
  return fileOperations.generateFilename(workspace);
}

// File input handler helper
export function createFileInputHandler(
  onSuccess: (workspace: WorkspaceState) => void,
  onError: (error: Error) => void
): (event: Event) => void {
  return async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const workspace = await uploadWorkspaceFromFile(file);
      onSuccess(workspace);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      // Reset the input so the same file can be selected again
      input.value = '';
    }
  };
}

// Drag and drop handler helper
export function createDropHandler(
  onSuccess: (workspace: WorkspaceState) => void,
  onError: (error: Error) => void
): {
  onDragOver: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
} {
  return {
    onDragOver: (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    },

    onDrop: async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];

      try {
        const workspace = await uploadWorkspaceFromFile(file);
        onSuccess(workspace);
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    },
  };
}
