import type {
  BiasRiskAssignment,
  CardPair,
  LifecycleStage,
  StageAssignment,
} from './cards';

// Simplified workspace types for v2 architecture
// Most state is now managed directly by BiasActivity

// Progress tracking interfaces
export interface SimpleMilestone {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
}

export interface WorkspaceProgress {
  totalCards: number;
  assignedCards: number;
  pairedCards: number;
  completionPercentage: number;
  timeSpent: number;
  milestones: SimpleMilestone[];
}

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
  biasRiskAssignments?: BiasRiskAssignment[];
  stageAssignments?: StageAssignment[];
  cardPairs?: CardPair[];
  selectedCardIds?: string[];
  customAnnotations?: Record<string, string>;
  completedStages?: LifecycleStage[];
  activityProgress?: WorkspaceProgress;
}
