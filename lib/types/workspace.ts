import type { BiasActivity } from '@/lib/activities/bias-activity';
import type { BiasDeck } from '@/lib/cards/decks/bias-deck';
import type { BiasActivityData } from './bias-activity';
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

  // Deck and Activity management (v2.0)
  currentDeck?: BiasDeck | null;
  currentActivity?: BiasActivity | null;
  activities?: BiasActivityData[];

  // Legacy fields (v1.0 - will be deprecated)
  biasRiskAssignments: BiasRiskAssignment[];
  stageAssignments: StageAssignment[];
  cardPairs: CardPair[];
  selectedCardIds: string[];
  customAnnotations: Record<string, string>; // cardId -> annotation
  completedStages: LifecycleStage[];
  activityProgress: WorkspaceProgress;

  // Version tracking
  dataVersion?: '1.0' | '1.5' | '2.0';
  migrationStatus?: 'pending' | 'in-progress' | 'completed';
}

type WorkspaceActionData =
  | {
      assignmentId: string;
      cardId: string;
      stage: LifecycleStage;
      annotation?: string;
    }
  | { cardId: string }
  | { assignmentId: string }
  | {
      biasId: string;
      mitigationId: string;
      annotation?: string;
      effectivenessRating?: number;
    }
  | { biasId: string; mitigationId: string }
  | { biasId: string; mitigationId: string; updates: Record<string, unknown> }
  | { cardId: string; annotation: string };

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
  data: WorkspaceActionData;
  inverse: WorkspaceAction | null;
}

export interface WorkspaceHistory {
  undoStack: WorkspaceAction[];
  redoStack: WorkspaceAction[];
  maxHistorySize: number;
}

export interface WorkspaceProgress {
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
