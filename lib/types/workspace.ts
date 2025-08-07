import type {
  ActivityStage,
  BiasRiskAssignment,
  CardPair,
  LifecycleStage,
  StageAssignment,
} from './cards';

export interface WorkspaceState {
  sessionId: string;
  name?: string;
  activityId?: string;
  createdAt: string;
  lastModified: string;
  currentStage: ActivityStage;
  completedActivityStages: ActivityStage[];
  biasRiskAssignments: BiasRiskAssignment[];
  stageAssignments: StageAssignment[];
  cardPairs: CardPair[];
  selectedCardIds: string[];
  customAnnotations: Record<string, string>; // cardId -> annotation
  completedStages: LifecycleStage[];
  activityProgress: ActivityProgress;
}

export interface WorkspaceAction {
  id: string;
  type:
    | 'ASSIGN_CARD'
    | 'REMOVE_CARD'
    | 'REMOVE_ASSIGNMENT'
    | 'CREATE_PAIR'
    | 'REMOVE_PAIR'
    | 'UPDATE_PAIR'
    | 'UPDATE_ANNOTATION';
  timestamp: string;
  description: string;
  data: Record<string, unknown>;
  inverse: WorkspaceAction | null;
}

export interface WorkspaceHistory {
  undoStack: WorkspaceAction[];
  redoStack: WorkspaceAction[];
  maxHistorySize: number;
}

export interface ActivityProgress {
  totalCards: number;
  assignedCards: number;
  pairedCards: number;
  completionPercentage: number;
  timeSpent: number; // in seconds
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  timestamp?: string;
}

export interface SavedWorkspace {
  workspace: WorkspaceState;
  version: string;
  exportedAt: string;
  metadata: {
    userAgent?: string;
    appVersion?: string;
  };
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
