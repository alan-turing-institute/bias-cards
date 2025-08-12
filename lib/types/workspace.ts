import type { LifecycleStage } from './cards';

// Simplified workspace types for v2 architecture
// Most state is now managed directly by BiasActivity

export interface WorkspaceFilters {
  category?: string;
  stage?: LifecycleStage;
  searchTerm?: string;
  showOnlyAssigned?: boolean;
  showOnlyPaired?: boolean;
}

export interface WorkspaceSettings {
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in seconds
  showTooltips: boolean;
  confirmationPrompts: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface SavedWorkspace {
  workspace: WorkspaceState;
  version: string;
  exportedAt: string;
  metadata?: {
    userAgent?: string;
    appVersion: string;
  };
}

// Legacy type kept temporarily for migration compatibility
// TO BE REMOVED after all components are updated
export interface WorkspaceState {
  sessionId?: string;
  name?: string;
  activityId?: string;
  createdAt?: string;
  lastModified?: string;
  currentStage?: number;

  // These fields are computed from BiasActivity in v2
  biasRiskAssignments?: any[];
  stageAssignments?: any[];
  cardPairs?: any[];
  selectedCardIds?: string[];
  customAnnotations?: Record<string, string>;
  completedStages?: LifecycleStage[];
  activityProgress?: any;
}
