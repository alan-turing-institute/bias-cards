import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { BiasActivity } from '@/lib/activities/bias-activity';
import type { BiasDeck } from '@/lib/cards/decks/bias-deck';
import {
  calculateMatchingScore,
  getSuggestedMitigations,
} from '@/lib/data/mitigation-matching';
import { useCardsStore } from '@/lib/stores/cards-store';
import type {
  ActivityStage,
  BiasRiskAssignment,
  BiasRiskCategory,
  CardPair,
  LifecycleStage,
  MitigationCard,
  SimpleMilestone,
  StageAssignment,
  WorkspaceProgress,
  WorkspaceState,
} from '@/lib/types';
import type { BiasEntry } from '@/lib/types/bias-activity';
import {
  type ActivityValidationResult,
  validateActivityCompletion,
} from '@/lib/validation/activity-validation';

// Interface for persisted activity state
interface PersistedActivityState {
  id?: string;
  name?: string;
  state?: { biases?: Record<string, BiasEntry> } & Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

// Extended workspace state with activity state
interface WorkspaceStoreStateWithActivity extends WorkspaceState {
  activityState?: PersistedActivityState;
}

interface WorkspaceStoreState extends WorkspaceState {
  // Core instances
  currentActivity: BiasActivity | null;
  currentDeck: BiasDeck | null;

  // History management
  history: WorkspaceHistory;

  // Hydration state
  hasHydrated: boolean;

  // Computed properties for backward compatibility
  get stageAssignments(): StageAssignment[];
  get cardPairs(): CardPair[];

  // Actions - History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  applyAction: (action: WorkspaceAction, addToHistory?: boolean) => void;

  // Actions - Activity stage management
  setCurrentActivityStage: (stage: ActivityStage) => void;
  completeActivityStage: (stage: ActivityStage) => void;
  isActivityStageComplete: (stage: ActivityStage) => boolean;

  // Actions - Bias risk assignment (Stage 1)
  assignBiasRisk: (
    cardId: string,
    riskCategory: BiasRiskCategory,
    annotation?: string
  ) => void;
  removeBiasRisk: (cardId: string) => void;
  updateBiasRisk: (
    cardId: string,
    updates: Partial<BiasRiskAssignment>
  ) => void;
  getBiasRiskAssignments: () => BiasRiskAssignment[];
  getBiasRiskByCategory: (category: BiasRiskCategory) => BiasRiskAssignment[];

  // Actions - Stage management (Stage 2)
  assignCardToStage: (
    cardId: string,
    stage: LifecycleStage,
    annotation?: string
  ) => void;
  removeCardFromStage: (cardId: string) => void;
  updateStageAssignment: (
    assignmentId: string,
    updates: Partial<StageAssignment>
  ) => void;
  getCardsInStage: (stage: LifecycleStage) => string[];

  // Actions - Card pairing
  createCardPair: (
    biasId: string,
    mitigationId: string,
    annotation?: string,
    effectivenessRating?: number
  ) => void;
  removeCardPair: (biasId: string, mitigationId: string) => void;
  updateCardPair: (
    biasId: string,
    mitigationId: string,
    updates: Partial<CardPair>
  ) => void;
  getPairsForBias: (biasId: string) => CardPair[];
  getPairsForMitigation: (mitigationId: string) => CardPair[];

  // Actions - Card selection
  selectCard: (cardId: string) => void;
  deselectCard: (cardId: string) => void;
  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;
  isCardSelected: (cardId: string) => boolean;

  // Actions - Annotations
  setCardAnnotation: (cardId: string, annotation: string) => void;
  removeCardAnnotation: (cardId: string) => void;
  getCardAnnotation: (cardId: string) => string | undefined;

  // Actions - Progress tracking
  markStageComplete: (stage: LifecycleStage) => void;
  unmarkStageComplete: (stage: LifecycleStage) => void;
  isStageComplete: (stage: LifecycleStage) => boolean;

  // Actions - Workspace management
  initialize: (activityName?: string) => Promise<void>;
  resetWorkspace: () => void;
  updateWorkspaceName: (name: string) => void;
  updateLastModified: () => void;
  setActivityId: (activityId: string) => void;
  exportWorkspaceData: () => WorkspaceState | null;
  importWorkspaceData: (
    workspaceData: Partial<WorkspaceState>,
    activityId: string
  ) => boolean;

  // Computed properties
  getProgress: () => WorkspaceProgress;

  // Matching methods
  getSuggestedMitigationsForBias: (
    biasId: string,
    limit?: number
  ) => Array<{
    mitigation: MitigationCard;
    score: number;
    reasons: string[];
    predictedEffectiveness: number;
  }>;
  getMatchingScore: (biasId: string, mitigationId: string) => number;
  getPredictedEffectiveness: (biasId: string, mitigationId: string) => number;

  // Validation methods
  validateActivityCompletion: () => ActivityValidationResult;
  canGenerateReport: () => boolean;
  getCompletionPercentage: () => number;

  // Internal helpers used during initialization
  createActivityFromPersistedState: (
    deck: unknown,
    BiasActivityClass: unknown,
    persistedState: PersistedActivityState,
    activityName: string
  ) => BiasActivity;
  createNewActivity: (
    deck: unknown,
    BiasActivityClass: unknown,
    activityName: string
  ) => BiasActivity;

  // Activity state getters (Phase 3)
  getCurrentActivity: () => BiasActivity | null;
  getCurrentDeck: () => BiasDeck | null;
  getBiasEntry: (biasId: string) => BiasEntry | null;
  getBiasRiskFromActivity: (biasId: string) => BiasRiskCategory | null;
  getLifecycleAssignmentsFromActivity: (biasId: string) => LifecycleStage[];
  getRationaleFromActivity: (
    biasId: string,
    stage: LifecycleStage
  ) => string | null;
  getMitigationsFromActivity: (
    biasId: string,
    stage: LifecycleStage
  ) => string[];
  getImplementationNoteFromActivity: (
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string
  ) => import('@/lib/types/bias-activity').ImplementationNote | null;
}

// Simplified interfaces for legacy compatibility

// Simple action interface for workspace history
interface WorkspaceAction {
  type: string;
  description?: string;
  payload?: Record<string, unknown>;
  data?: Record<string, unknown>;
  timestamp: string;
  inverse?: WorkspaceAction;
}

// Simple history interface
interface WorkspaceHistory {
  actions: WorkspaceAction[];
  currentIndex: number;
  maxSize: number;
  undoStack: WorkspaceAction[];
  redoStack: WorkspaceAction[];
}

// Simple progress interface

const createInitialMilestones = (): SimpleMilestone[] => [
  {
    id: 'first-card-assigned',
    name: 'First Card Assigned',
    description: 'Assigned your first bias card to a lifecycle stage',
    achieved: false,
  },
  {
    id: 'first-pair-created',
    name: 'First Pair Created',
    description: 'Created your first bias-mitigation pair',
    achieved: false,
  },
  {
    id: 'all-stages-used',
    name: 'All Stages Used',
    description: 'Assigned cards to all lifecycle stages',
    achieved: false,
  },
  {
    id: 'five-pairs-created',
    name: 'Five Pairs Created',
    description: 'Created five bias-mitigation pairs',
    achieved: false,
  },
  {
    id: 'activity-completed',
    name: 'Activity Completed',
    description: 'Completed the full bias cards activity',
    achieved: false,
  },
];

const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateAssignmentId = (): string => {
  return `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createInitialHistory = (): WorkspaceHistory => ({
  actions: [],
  currentIndex: 0,
  maxSize: 50,
  undoStack: [],
  redoStack: [],
});

const createInitialState = (): WorkspaceState => ({
  sessionId: generateSessionId(),
  name: undefined,
  activityId: undefined,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  currentStage: 1,
  biasRiskAssignments: [],
  stageAssignments: [],
  cardPairs: [],
  selectedCardIds: [],
  customAnnotations: {},
  completedStages: [],
  activityProgress: {
    totalCards: 0,
    assignedCards: 0,
    pairedCards: 0,
    completionPercentage: 0,
    timeSpent: 0,
    milestones: createInitialMilestones(),
  } as WorkspaceProgress,
});

const _generateActionId = (): string => {
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

const addActionToHistory = (
  history: WorkspaceHistory,
  action: WorkspaceAction
): WorkspaceHistory => {
  const newUndoStack = [...history.undoStack, action];

  // Limit history size
  if (newUndoStack.length > history.maxSize) {
    newUndoStack.shift();
  }

  return {
    ...history,
    undoStack: newUndoStack,
    redoStack: [], // Clear redo stack when new action is performed
  };
};

// Helper function to create stage assignments from activity
const createStageAssignmentsFromActivity = (
  currentActivity: BiasActivity | null,
  customAnnotations: Record<string, string>
): StageAssignment[] => {
  if (!currentActivity) {
    return [];
  }

  const biases = currentActivity.getBiases();
  const assignments: StageAssignment[] = [];

  for (const [biasId, bias] of Object.entries(biases)) {
    for (const stage of bias.lifecycleAssignments) {
      assignments.push({
        id: generateAssignmentId(),
        cardId: biasId,
        stage,
        annotation: customAnnotations[biasId],
        timestamp: bias.riskAssignedAt || new Date().toISOString(),
      });
    }
  }

  return assignments;
};

// Helper function to create card pairs from activity
const createCardPairsFromActivity = (
  currentActivity: BiasActivity | null
): CardPair[] => {
  if (!currentActivity) {
    return [];
  }

  const biases = currentActivity.getBiases();
  const pairs: CardPair[] = [];

  for (const [biasId, bias] of Object.entries(biases)) {
    for (const stage of bias.lifecycleAssignments) {
      const mitigations = bias.mitigations[stage] || [];
      for (const mitigationId of mitigations) {
        const note = bias.implementationNotes[stage]?.[mitigationId];
        pairs.push({
          biasId,
          mitigationId,
          annotation: note?.notes,
          effectivenessRating: note?.effectivenessRating,
          timestamp: bias.riskAssignedAt || new Date().toISOString(),
        });
      }
    }
  }

  return pairs;
};

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createInitialState(),
        currentActivity: null,
        currentDeck: null,
        history: createInitialHistory(),
        hasHydrated: false,

        // Computed properties for backward compatibility
        get stageAssignments(): StageAssignment[] {
          const { currentActivity, customAnnotations } = get();
          return createStageAssignmentsFromActivity(
            currentActivity,
            customAnnotations || {}
          );
        },

        get cardPairs(): CardPair[] {
          const { currentActivity } = get();
          return createCardPairsFromActivity(currentActivity);
        },

        // Activity stage management
        setCurrentActivityStage: (stage) => {
          set((_state) => ({
            currentStage: stage,
            lastModified: new Date().toISOString(),
          }));
        },

        completeActivityStage: (_stage) => {
          // Legacy function - now handled by unified activity store
          set((state) => ({
            ...state,
            lastModified: new Date().toISOString(),
          }));
        },

        isActivityStageComplete: (_stage) => {
          // Legacy function - now handled by unified activity store
          return false;
        },

        // Bias risk assignment (Stage 1)
        assignBiasRisk: (cardId, riskCategory, annotation) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            // No current activity - should call initialize() first
            return;
          }

          // Delegate to activity
          currentActivity.assignBiasRisk(cardId, riskCategory);

          // Handle annotation separately for now (TODO: add method to BiasActivity)
          if (annotation) {
            set((state) => ({
              customAnnotations: {
                ...state.customAnnotations,
                [cardId]: annotation,
              } as Record<string, string>,
            }));
          }

          // Force re-render and persistence by creating a new activity reference
          // This ensures Zustand's persist middleware detects the change
          set((state) => {
            // Create a proper deep clone of the activity to ensure persistence
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            // Update the updatedAt timestamp
            clonedActivity.updatedAt = new Date();
            return {
              currentActivity: clonedActivity,
              lastModified: new Date().toISOString(),
            };
          });
        },

        removeBiasRisk: (cardId) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          currentActivity.removeBiasRisk(cardId);

          // Force re-render and persistence
          set((state) => {
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            clonedActivity.updatedAt = new Date();
            return {
              currentActivity: clonedActivity,
              lastModified: new Date().toISOString(),
            };
          });
        },

        updateBiasRisk: (cardId, updates) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          if (updates.riskCategory) {
            currentActivity.assignBiasRisk(cardId, updates.riskCategory);
          }
          if (updates.annotation) {
            set((state) => ({
              customAnnotations: {
                ...state.customAnnotations,
                [cardId]: updates.annotation,
              } as Record<string, string>,
              lastModified: new Date().toISOString(),
            }));
          }

          set((state) => ({
            currentActivity: state.currentActivity,
            lastModified: new Date().toISOString(),
          }));
        },

        getBiasRiskAssignments: () => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return [];
          }

          // Convert activity biases to workspace format
          const biases = currentActivity.getBiases();
          return Object.values(biases)
            .filter((bias) => bias.riskCategory)
            .map((bias) => ({
              id: bias.biasId,
              cardId: bias.biasId,
              riskCategory: bias.riskCategory as BiasRiskCategory,
              timestamp: bias.riskAssignedAt || new Date().toISOString(),
            }));
        },

        getBiasRiskByCategory: (category) => {
          const assignments = get().getBiasRiskAssignments();
          return assignments.filter((a) => a.riskCategory === category);
        },

        // Stage management
        assignCardToStage: (cardId, stage, annotation) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          // Delegate to activity
          currentActivity.assignToLifecycle(cardId, stage);

          // Generate assignment ID and timestamp
          const assignmentId = generateAssignmentId();
          const timestamp = new Date().toISOString();

          // Handle annotation separately for now
          if (annotation) {
            set((state) => ({
              customAnnotations: {
                ...state.customAnnotations,
                [cardId]: annotation,
              } as Record<string, string>,
            }));
          }

          // Force re-render and persistence - UPDATE BOTH currentActivity AND stageAssignments
          set((state) => {
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            clonedActivity.updatedAt = new Date();

            // Create new assignment for the stageAssignments array
            const newAssignment: StageAssignment = {
              id: assignmentId,
              cardId,
              stage,
              annotation,
              timestamp,
            };

            return {
              currentActivity: clonedActivity,
              stageAssignments: [...state.stageAssignments, newAssignment],
              lastModified: timestamp,
            };
          });
        },

        removeCardFromStage: (cardIdOrAssignmentId) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          // For backward compatibility, support both cardId and assignmentId
          // In activity-based approach, we need cardId and stage
          const existingAssignment = get().stageAssignments.find(
            (a) =>
              a.id === cardIdOrAssignmentId || a.cardId === cardIdOrAssignmentId
          );

          if (existingAssignment) {
            currentActivity.removeFromLifecycle(
              existingAssignment.cardId,
              existingAssignment.stage
            );
          } else {
            // Fallback: try to use it as cardId directly
            const biases = currentActivity.getBiases();
            const bias = biases[cardIdOrAssignmentId];
            if (bias) {
              // Remove from all lifecycle stages
              for (const stage of bias.lifecycleAssignments) {
                currentActivity.removeFromLifecycle(
                  cardIdOrAssignmentId,
                  stage
                );
              }
            }
          }

          // Force re-render and persistence - UPDATE BOTH currentActivity AND stageAssignments
          set((state) => {
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            clonedActivity.updatedAt = new Date();

            // Remove from stageAssignments array
            const updatedAssignments = state.stageAssignments.filter(
              (a) =>
                a.id !== cardIdOrAssignmentId &&
                a.cardId !== cardIdOrAssignmentId
            );

            return {
              currentActivity: clonedActivity,
              stageAssignments: updatedAssignments,
              lastModified: new Date().toISOString(),
            };
          });
        },

        updateStageAssignment: (assignmentId, updates) => {
          // For activity-based approach, we need to find the assignment and update accordingly
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          // Find the existing assignment in legacy format
          const existingAssignment = get().stageAssignments.find(
            (a) => a.id === assignmentId
          );

          if (!existingAssignment) {
            return;
          }

          if (updates.stage) {
            // Update the lifecycle assignment
            currentActivity.removeFromLifecycle(
              existingAssignment.cardId,
              existingAssignment.stage
            );
            currentActivity.assignToLifecycle(
              existingAssignment.cardId,
              updates.stage as LifecycleStage
            );
          }

          // Handle annotation/rationale updates - FIX: Also update BiasActivity rationale
          if (updates.annotation !== undefined) {
            // Update BiasActivity rationale
            currentActivity.setRationale(
              existingAssignment.cardId,
              existingAssignment.stage,
              updates.annotation
            );

            // Update customAnnotations for backward compatibility
            set((state) => ({
              customAnnotations: {
                ...state.customAnnotations,
                [existingAssignment.cardId]: updates.annotation as string,
              } as Record<string, string>,
              lastModified: new Date().toISOString(),
            }));
          }

          // Force re-render and persistence - FIX: Update stageAssignments array
          set((state) => {
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            clonedActivity.updatedAt = new Date();

            // Update the assignment in the array
            const updatedAssignments = state.stageAssignments.map((a) =>
              a.id === assignmentId
                ? { ...a, ...updates, timestamp: new Date().toISOString() }
                : a
            );

            return {
              currentActivity: clonedActivity,
              stageAssignments: updatedAssignments,
              lastModified: new Date().toISOString(),
            };
          });
        },

        getCardsInStage: (stage) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return [];
          }

          const biases = currentActivity.getBiases();
          const cardIds: string[] = [];

          // Find all biases assigned to this lifecycle stage
          for (const [biasId, bias] of Object.entries(biases)) {
            if (bias.lifecycleAssignments.includes(stage)) {
              cardIds.push(biasId);
            }
          }

          return cardIds;
        },

        // Card pairing
        createCardPair: (
          biasId,
          mitigationId,
          annotation,
          effectivenessRating
        ) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          // In activity-based approach, mitigations are added per lifecycle stage
          // Get the bias and add mitigation to all its assigned stages
          const biases = currentActivity.getBiases();
          const bias = biases[biasId];

          if (!bias) {
            return;
          }

          // If bias has no lifecycle assignments, we can't add mitigations
          if (bias.lifecycleAssignments.length === 0) {
            return;
          }

          // Add mitigation to all stages where this bias is assigned
          for (const stage of bias.lifecycleAssignments) {
            currentActivity.addMitigation(biasId, stage, mitigationId);

            // Set implementation note with effectiveness rating
            if (effectivenessRating) {
              currentActivity.setImplementationNote(
                biasId,
                stage,
                mitigationId,
                {
                  effectivenessRating,
                  notes: annotation || '',
                  status: 'planned',
                }
              );
            }
          }

          // Force re-render and persistence - FIX: Update cardPairs array
          set((state) => {
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            clonedActivity.updatedAt = new Date();

            // Create new pair for the array
            const newPair: CardPair = {
              biasId,
              mitigationId,
              annotation,
              effectivenessRating,
              timestamp: new Date().toISOString(),
            };

            return {
              currentActivity: clonedActivity,
              cardPairs: [...state.cardPairs, newPair],
              lastModified: new Date().toISOString(),
            };
          });
        },

        removeCardPair: (biasId, mitigationId) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          // Remove mitigation from all stages for this bias
          const biases = currentActivity.getBiases();
          const bias = biases[biasId];

          if (!bias) {
            return;
          }

          // Remove mitigation from all stages where it exists
          for (const stage of bias.lifecycleAssignments) {
            currentActivity.removeMitigation(biasId, stage, mitigationId);
            currentActivity.removeImplementationNote(
              biasId,
              stage,
              mitigationId
            );
          }

          // Force re-render and persistence - FIX: Update cardPairs array
          set((state) => {
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            clonedActivity.updatedAt = new Date();

            // Remove the pair from array
            const updatedPairs = state.cardPairs.filter(
              (p) => !(p.biasId === biasId && p.mitigationId === mitigationId)
            );

            return {
              currentActivity: clonedActivity,
              cardPairs: updatedPairs,
              lastModified: new Date().toISOString(),
            };
          });
        },

        updateCardPair: (biasId, mitigationId, updates) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return;
          }

          // In activity-based approach, update implementation notes for all stages
          const biases = currentActivity.getBiases();
          const bias = biases[biasId];

          if (!bias) {
            return;
          }

          // Update implementation notes for all stages where this mitigation exists
          for (const stage of bias.lifecycleAssignments) {
            const stageMitigations = bias.mitigations[stage] || [];
            if (stageMitigations.includes(mitigationId)) {
              const currentNote = bias.implementationNotes[stage]?.[
                mitigationId
              ] || {
                effectivenessRating: 3,
                notes: '',
                status: 'planned' as const,
              };

              const updatedNote = {
                ...currentNote,
                ...(updates.effectivenessRating && {
                  effectivenessRating: updates.effectivenessRating as number,
                }),
                ...(updates.annotation && {
                  notes: updates.annotation as string,
                }),
              };

              currentActivity.setImplementationNote(
                biasId,
                stage,
                mitigationId,
                updatedNote
              );
            }
          }

          // Force re-render and persistence - FIX: Update cardPairs array
          set((state) => {
            const clonedActivity = Object.assign(
              Object.create(Object.getPrototypeOf(state.currentActivity)),
              state.currentActivity
            );
            clonedActivity.updatedAt = new Date();

            // Update the pair in the array
            const updatedPairs = state.cardPairs.map((p) =>
              p.biasId === biasId && p.mitigationId === mitigationId
                ? { ...p, ...updates, timestamp: new Date().toISOString() }
                : p
            );

            return {
              currentActivity: clonedActivity,
              cardPairs: updatedPairs,
              lastModified: new Date().toISOString(),
            };
          });
        },

        getPairsForBias: (biasId) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return [];
          }

          const biases = currentActivity.getBiases();
          const bias = biases[biasId];

          if (!bias) {
            return [];
          }

          // Convert activity mitigations to workspace CardPair format
          const pairs: CardPair[] = [];
          for (const stage of bias.lifecycleAssignments) {
            const mitigations = bias.mitigations[stage] || [];
            for (const mitigationId of mitigations) {
              const note = bias.implementationNotes[stage]?.[mitigationId];
              pairs.push({
                biasId,
                mitigationId,
                annotation: note?.notes,
                effectivenessRating: note?.effectivenessRating,
                timestamp: new Date().toISOString(),
              });
            }
          }

          return pairs;
        },

        getPairsForMitigation: (mitigationId) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return [];
          }

          const biases = currentActivity.getBiases();
          const pairs: CardPair[] = [];

          // Search through all biases for this mitigation
          for (const [biasId, bias] of Object.entries(biases)) {
            for (const stage of bias.lifecycleAssignments) {
              const mitigations = bias.mitigations[stage] || [];
              if (mitigations.includes(mitigationId)) {
                const note = bias.implementationNotes[stage]?.[mitigationId];
                pairs.push({
                  biasId,
                  mitigationId,
                  annotation: note?.notes,
                  effectivenessRating: note?.effectivenessRating,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }

          return pairs;
        },

        // Card selection
        selectCard: (cardId) => {
          set((state) => ({
            selectedCardIds: [
              ...new Set([...(state.selectedCardIds || []), cardId]),
            ],
          }));
        },

        deselectCard: (cardId) => {
          set((state) => ({
            selectedCardIds: (state.selectedCardIds || []).filter(
              (id) => id !== cardId
            ),
          }));
        },

        toggleCardSelection: (cardId) => {
          const isSelected = get().isCardSelected(cardId);
          if (isSelected) {
            get().deselectCard(cardId);
          } else {
            get().selectCard(cardId);
          }
        },

        clearSelection: () => {
          set({ selectedCardIds: [] });
        },

        isCardSelected: (cardId) => {
          return (get().selectedCardIds || []).includes(cardId);
        },

        // Annotations
        setCardAnnotation: (cardId, annotation) => {
          set((state) => ({
            customAnnotations: {
              ...state.customAnnotations,
              [cardId]: annotation,
            } as Record<string, string>,
            lastModified: new Date().toISOString(),
          }));
        },

        removeCardAnnotation: (cardId) => {
          set((state) => {
            const { [cardId]: _, ...rest } = state.customAnnotations || {};
            return {
              customAnnotations: rest,
              lastModified: new Date().toISOString(),
            };
          });
        },

        getCardAnnotation: (cardId) => {
          return get().customAnnotations?.[cardId];
        },

        // Progress tracking
        markStageComplete: (stage) => {
          set((state) => {
            if ((state.completedStages || []).includes(stage)) {
              return state;
            }

            return {
              completedStages: [...(state.completedStages || []), stage],
              lastModified: new Date().toISOString(),
            };
          });
        },

        unmarkStageComplete: (stage) => {
          set((state) => ({
            completedStages: (state.completedStages || []).filter(
              (s) => s !== stage
            ),
            lastModified: new Date().toISOString(),
          }));
        },

        isStageComplete: (stage) => {
          return (get().completedStages || []).includes(stage);
        },

        // Helper to create activity with persisted state
        createActivityFromPersistedState: (
          deck: unknown,
          BiasActivityClass: unknown,
          persistedState: PersistedActivityState,
          activityName: string
        ) => {
          const ActivityConstructor = BiasActivityClass as new (
            deck: unknown,
            options: { name: string; id?: string }
          ) => BiasActivity;
          const activity = new ActivityConstructor(deck, {
            name: persistedState.name || activityName,
            id: get().activityId || persistedState.id,
          });

          Object.assign(activity, {
            state: persistedState.state,
            createdAt: new Date(persistedState.createdAt || Date.now()),
            updatedAt: new Date(persistedState.updatedAt || Date.now()),
          });

          return activity;
        },

        // Helper to create new activity
        createNewActivity: (
          deck: unknown,
          BiasActivityClass: unknown,
          activityName: string
        ) => {
          const ActivityConstructor = BiasActivityClass as new (
            deck: unknown,
            options: { name: string; id?: string }
          ) => BiasActivity;
          return new ActivityConstructor(deck, {
            name: activityName,
            id: get().activityId,
          });
        },

        // Workspace management
        initialize: async (activityName = 'New Activity') => {
          try {
            const { BiasActivity: BiasActivityClass } = await import(
              '@/lib/activities/bias-activity'
            );
            const { BiasDeck: BiasDeckClass } = await import(
              '@/lib/cards/decks/bias-deck'
            );

            const deck = await BiasDeckClass.getInstance();

            const persistedState = (get() as WorkspaceStoreStateWithActivity)
              .activityState;

            let activity: BiasActivity;
            if (persistedState?.state?.biases) {
              activity = get().createActivityFromPersistedState(
                deck,
                BiasActivityClass,
                persistedState,
                activityName
              );

              // Restore bias risk assignments if needed
              const biasRiskAssignments = get().biasRiskAssignments || [];
              for (const assignment of biasRiskAssignments) {
                const bias = activity.getBias(assignment.cardId);
                if (!bias.riskCategory) {
                  activity.assignBiasRisk(
                    assignment.cardId,
                    assignment.riskCategory
                  );
                }
              }
            } else {
              activity = get().createNewActivity(
                deck,
                BiasActivityClass,
                activityName
              );
            }

            set((_state) => ({
              currentDeck: deck,
              currentActivity: activity,
              activityId: activity.id,
              name: activity.name,
              lastModified: new Date().toISOString(),
            }));
          } catch (_error) {
            // Silently handle errors during initialization
          }
        },

        resetWorkspace: () => {
          set({
            ...createInitialState(),
            currentActivity: null,
            currentDeck: null,
            history: createInitialHistory(),
          });
        },

        updateWorkspaceName: (name) => {
          set({
            name,
            lastModified: new Date().toISOString(),
          });
        },

        updateLastModified: () => {
          set({
            lastModified: new Date().toISOString(),
          });
        },

        setActivityId: (activityId) => {
          set({
            activityId,
            lastModified: new Date().toISOString(),
          });
        },

        exportWorkspaceData: () => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return null;
          }

          // Export the activity data directly
          const activityData = currentActivity.export();
          const state = get();

          // Return workspace state with activity data
          return {
            sessionId: state.sessionId,
            name: activityData.name,
            activityId: activityData.id,
            createdAt: activityData.createdAt,
            lastModified: activityData.updatedAt,
            currentStage: state.currentStage,
            // Convert activity data to workspace format for compatibility
            biasRiskAssignments: state.getBiasRiskAssignments(),
            stageAssignments: Object.entries(activityData.biases).flatMap(
              ([biasId, bias]) =>
                bias.lifecycleAssignments.map((stage) => ({
                  id: generateAssignmentId(),
                  cardId: biasId,
                  stage,
                  annotation: state.customAnnotations?.[biasId],
                  timestamp: bias.riskAssignedAt || new Date().toISOString(),
                }))
            ),
            cardPairs: state.getPairsForBias
              ? Object.keys(activityData.biases).flatMap((biasId) =>
                  state.getPairsForBias(biasId)
                )
              : [],
            selectedCardIds: state.selectedCardIds,
            customAnnotations: state.customAnnotations,
            completedStages: state.completedStages,
            activityProgress: state.activityProgress,
            activityData, // Include the full activity data
          };
        },

        importWorkspaceData: (workspaceData, activityId) => {
          try {
            const now = new Date().toISOString();
            const newSessionId = generateSessionId();

            // Import via activity-based approach if activity data exists
            const importData = workspaceData as typeof workspaceData & {
              activityData?: import('@/lib/types/bias-activity').BiasActivityData;
            };

            if (importData.activityData) {
              // Use BiasActivity.load() for proper v2.0 import
              get()
                .initialize(importData.activityData.name || 'Imported Activity')
                .then(() => {
                  const { currentActivity } = get();
                  if (currentActivity && importData.activityData) {
                    // Use the load method to properly import activity data
                    currentActivity.load(importData.activityData);

                    // Update workspace state to reflect loaded data
                    set((state) => ({
                      ...state,
                      activityId,
                      sessionId: newSessionId,
                      name: importData.activityData?.name,
                      lastModified: importData.activityData?.updatedAt || now,
                      currentStage: (importData.activityData?.state
                        .currentStage || 1) as ActivityStage,
                      completedActivityStages: (importData.activityData?.state
                        .completedStages || []) as ActivityStage[],
                    }));
                  }
                })
                .catch(() => {
                  // Failed to initialize activity, fall back to legacy import
                });

              return true;
            }

            // Legacy import for backward compatibility
            const sanitizedData: Partial<WorkspaceState> = {
              sessionId: newSessionId,
              activityId,
              lastModified: now,
              name: workspaceData.name,
              createdAt: workspaceData.createdAt || now,
              currentStage: workspaceData.currentStage || 1,
              biasRiskAssignments:
                workspaceData.biasRiskAssignments?.map((assignment) => ({
                  ...assignment,
                  id: generateAssignmentId(),
                  timestamp: assignment.timestamp || now,
                })) || [],
              stageAssignments:
                workspaceData.stageAssignments?.map((assignment) => ({
                  ...assignment,
                  id: generateAssignmentId(),
                  timestamp: assignment.timestamp || now,
                })) || [],
              cardPairs:
                workspaceData.cardPairs?.map((pair) => ({
                  ...pair,
                  timestamp: pair.timestamp || now,
                })) || [],
              selectedCardIds: workspaceData.selectedCardIds || [],
              customAnnotations: workspaceData.customAnnotations || {},
              completedStages: workspaceData.completedStages || [],
              activityProgress: workspaceData.activityProgress || {
                totalCards: 0,
                assignedCards: 0,
                pairedCards: 0,
                completionPercentage: 0,
                timeSpent: 0,
                milestones: createInitialMilestones(),
              },
            };

            // Set the new workspace state
            set(() => ({
              ...createInitialState(),
              ...sanitizedData,
              currentActivity: null,
              currentDeck: null,
              history: createInitialHistory(),
            }));

            return true;
          } catch (_error) {
            return false;
          }
        },

        // Computed properties
        getProgress: () => {
          const { currentActivity } = get();
          const state = get();

          if (currentActivity) {
            // Use activity-based progress calculation
            const progress = currentActivity.getProgress();
            return {
              totalCards: 40, // Keep this for UI consistency
              assignedCards: Object.keys(currentActivity.getBiases()).length,
              pairedCards: Object.values(currentActivity.getBiases()).reduce(
                (count, bias) => {
                  let newCount = count;
                  for (const mitigations of Object.values(bias.mitigations)) {
                    newCount += mitigations.length;
                  }
                  return newCount;
                },
                0
              ),
              completionPercentage: progress,
              timeSpent: state.activityProgress?.timeSpent || 0,
              milestones: state.activityProgress?.milestones || [],
            };
          }

          // Fallback to legacy calculation
          const totalCards = 40;
          const assignedCards = state.stageAssignments.length;
          const pairedCards = new Set(state.cardPairs.map((p) => p.biasId))
            .size;

          const completionPercentage = Math.round(
            ((assignedCards + pairedCards) / (totalCards * 2)) * 100
          );

          return {
            totalCards,
            assignedCards,
            pairedCards,
            completionPercentage,
            timeSpent: state.activityProgress?.timeSpent || 0,
            milestones: state.activityProgress?.milestones || [],
          };
        },

        // Matching methods
        getSuggestedMitigationsForBias: (biasId, limit = 5) => {
          const { biasCards, mitigationCards } = useCardsStore.getState();
          const bias = biasCards.find((b) => b.id === biasId);
          if (!bias) {
            return [];
          }

          // Get current stage if bias is assigned
          const assignment = get().stageAssignments.find(
            (a) => a.cardId === biasId
          );
          const currentStage = assignment?.stage;

          // Get matching scores
          const suggestions = getSuggestedMitigations(
            bias,
            mitigationCards,
            currentStage,
            limit
          );

          return suggestions
            .map((suggestion) => {
              const mitigation = mitigationCards.find(
                (m) => m.id === suggestion.mitigationId
              );
              if (!mitigation) {
                return null;
              }
              return {
                mitigation,
                score: suggestion.score,
                reasons: suggestion.reasons,
                predictedEffectiveness: suggestion.predictedEffectiveness,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
        },

        getMatchingScore: (biasId, mitigationId) => {
          const { biasCards, mitigationCards } = useCardsStore.getState();
          const bias = biasCards.find((b) => b.id === biasId);
          const mitigation = mitigationCards.find((m) => m.id === mitigationId);

          if (!(bias && mitigation)) {
            return 0;
          }

          const assignment = get().stageAssignments.find(
            (a) => a.cardId === biasId
          );
          const currentStage = assignment?.stage;

          const result = calculateMatchingScore(bias, mitigation, currentStage);
          return result.score;
        },

        getPredictedEffectiveness: (biasId, mitigationId) => {
          const { biasCards, mitigationCards } = useCardsStore.getState();
          const bias = biasCards.find((b) => b.id === biasId);
          const mitigation = mitigationCards.find((m) => m.id === mitigationId);

          if (!(bias && mitigation)) {
            return 1;
          }

          const assignment = get().stageAssignments.find(
            (a) => a.cardId === biasId
          );
          const currentStage = assignment?.stage;

          const result = calculateMatchingScore(bias, mitigation, currentStage);
          return result.predictedEffectiveness;
        },

        // Validation methods
        validateActivityCompletion: () => {
          const state = get();
          const { biasCards, mitigationCards } = useCardsStore.getState();
          return validateActivityCompletion(state, biasCards, mitigationCards);
        },

        canGenerateReport: () => {
          return get().validateActivityCompletion().canGenerateReport;
        },

        getCompletionPercentage: () => {
          return get().validateActivityCompletion().completionPercentage;
        },

        // Activity state getters (Phase 3)
        getCurrentActivity: () => {
          const state = get();

          // If no current activity but we have persisted state, attempt to restore
          if (
            !state.currentActivity &&
            (state as WorkspaceStoreStateWithActivity).activityState
          ) {
            // Trigger restoration asynchronously (won't be available on this call but will on next)
            state.initialize().catch((_error) => {
              // Silently handle restoration errors
            });
            return null; // Will be available on next call after restoration completes
          }

          return state.currentActivity;
        },
        getCurrentDeck: () => get().currentDeck,

        getBiasEntry: (biasId: string) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return null;
          }
          return currentActivity.getBias(biasId);
        },

        getBiasRiskFromActivity: (biasId: string) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return null;
          }
          const bias = currentActivity.getBias(biasId);
          return bias?.riskCategory || null;
        },

        getLifecycleAssignmentsFromActivity: (biasId: string) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return [];
          }
          const bias = currentActivity.getBias(biasId);
          return bias?.lifecycleAssignments || [];
        },

        getRationaleFromActivity: (biasId: string, stage: LifecycleStage) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return null;
          }
          const bias = currentActivity.getBias(biasId);
          return bias?.rationale?.[stage] || null;
        },

        getMitigationsFromActivity: (biasId: string, stage: LifecycleStage) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return [];
          }
          const bias = currentActivity.getBias(biasId);
          return bias?.mitigations?.[stage] || [];
        },

        getImplementationNoteFromActivity: (
          biasId: string,
          stage: LifecycleStage,
          mitigationId: string
        ) => {
          const { currentActivity } = get();
          if (!currentActivity) {
            return null;
          }
          const bias = currentActivity.getBias(biasId);
          return bias?.implementationNotes?.[stage]?.[mitigationId] || null;
        },

        // History methods
        undo: () => {
          const state = get();
          if (state.history.undoStack.length === 0) {
            return;
          }

          const actionToUndo = state.history.undoStack.at(-1);
          if (!actionToUndo) {
            return;
          }

          const newUndoStack = state.history.undoStack.slice(0, -1);
          const newRedoStack = [...state.history.redoStack, actionToUndo];

          // Apply the inverse action
          if (actionToUndo.inverse) {
            get().applyAction(actionToUndo.inverse, false);
          }

          set((prevState) => ({
            history: {
              ...prevState.history,
              undoStack: newUndoStack,
              redoStack: newRedoStack,
            },
          }));
        },

        redo: () => {
          const state = get();
          if (state.history.redoStack.length === 0) {
            return;
          }

          const actionToRedo = state.history.redoStack.at(-1);
          if (!actionToRedo) {
            return;
          }

          const newRedoStack = state.history.redoStack.slice(0, -1);
          const newUndoStack = [...state.history.undoStack, actionToRedo];

          // Apply the action
          get().applyAction(actionToRedo, false);

          set((prevState) => ({
            history: {
              ...prevState.history,
              undoStack: newUndoStack,
              redoStack: newRedoStack,
            },
          }));
        },

        canUndo: () => {
          return get().history.undoStack.length > 0;
        },

        canRedo: () => {
          return get().history.redoStack.length > 0;
        },

        clearHistory: () => {
          set((_state) => ({
            history: createInitialHistory(),
          }));
        },

        // Internal method to apply actions
        applyAction: (action: WorkspaceAction, addToHistory = true) => {
          const timestamp = new Date().toISOString();

          switch (action.type) {
            case 'ASSIGN_CARD': {
              const { assignmentId, cardId, stage, annotation } =
                action.data as {
                  assignmentId: string;
                  cardId: string;
                  stage: LifecycleStage;
                  annotation?: string;
                };
              set((state) => ({
                stageAssignments: [
                  ...state.stageAssignments,
                  { id: assignmentId, cardId, stage, annotation, timestamp },
                ],
                lastModified: timestamp,
                history: addToHistory
                  ? addActionToHistory(state.history, action)
                  : state.history,
              }));
              break;
            }
            case 'REMOVE_CARD': {
              const { cardId } = action.data as { cardId: string };
              set((state) => ({
                stageAssignments: state.stageAssignments.filter(
                  (a) => a.cardId !== cardId
                ),
                lastModified: timestamp,
                history: addToHistory
                  ? addActionToHistory(state.history, action)
                  : state.history,
              }));
              break;
            }
            case 'REMOVE_ASSIGNMENT': {
              const { assignmentId } = action.data as { assignmentId: string };
              set((state) => ({
                stageAssignments: state.stageAssignments.filter(
                  (a) => a.id !== assignmentId
                ),
                lastModified: timestamp,
                history: addToHistory
                  ? addActionToHistory(state.history, action)
                  : state.history,
              }));
              break;
            }
            case 'CREATE_PAIR': {
              const { biasId, mitigationId, annotation, effectivenessRating } =
                action.data as {
                  biasId: string;
                  mitigationId: string;
                  annotation?: string;
                  effectivenessRating?: number;
                };
              set((state) => ({
                cardPairs: [
                  ...state.cardPairs,
                  {
                    biasId,
                    mitigationId,
                    annotation,
                    effectivenessRating,
                    timestamp,
                  },
                ],
                lastModified: timestamp,
                history: addToHistory
                  ? addActionToHistory(state.history, action)
                  : state.history,
              }));
              break;
            }
            case 'REMOVE_PAIR': {
              const { biasId, mitigationId } = action.data as {
                biasId: string;
                mitigationId: string;
              };
              set((state) => ({
                cardPairs: state.cardPairs.filter(
                  (p) =>
                    !(p.biasId === biasId && p.mitigationId === mitigationId)
                ),
                lastModified: timestamp,
                history: addToHistory
                  ? addActionToHistory(state.history, action)
                  : state.history,
              }));
              break;
            }
            case 'UPDATE_PAIR': {
              const { biasId, mitigationId, updates } = action.data as {
                biasId: string;
                mitigationId: string;
                updates: Record<string, unknown>;
              };
              set((state) => ({
                cardPairs: state.cardPairs.map((p) =>
                  p.biasId === biasId && p.mitigationId === mitigationId
                    ? { ...p, ...updates, timestamp }
                    : p
                ),
                lastModified: timestamp,
                history: addToHistory
                  ? addActionToHistory(state.history, action)
                  : state.history,
              }));
              break;
            }
            case 'UPDATE_ANNOTATION': {
              const { cardId, annotation } = action.data as {
                cardId: string;
                annotation: string;
              };
              set((state) => ({
                customAnnotations: {
                  ...state.customAnnotations,
                  [cardId]: annotation,
                } as Record<string, string>,
                lastModified: timestamp,
                history: addToHistory
                  ? addActionToHistory(state.history, action)
                  : state.history,
              }));
              break;
            }
            default: {
              // Exhaustive check - this should never be reached
              const unknownAction = action as { type: string };
              throw new Error(`Unknown action type: ${unknownAction.type}`);
            }
          }
        },
      }),
      {
        name: 'workspace-store',
        partialize: (state) => ({
          sessionId: state.sessionId,
          name: state.name,
          activityId: state.activityId,
          createdAt: state.createdAt,
          lastModified: state.lastModified,
          currentStage: state.currentStage,
          biasRiskAssignments: state.biasRiskAssignments,
          selectedCardIds: state.selectedCardIds,
          customAnnotations: state.customAnnotations,
          completedStages: state.completedStages,
          activityProgress: state.activityProgress,
          // Exclude computed properties to avoid serialization issues
          // stageAssignments: computed from currentActivity
          // cardPairs: computed from currentActivity
          // Persist the BiasActivity state for restoration
          activityState: (() => {
            try {
              return state.currentActivity
                ? state.currentActivity.export()
                : null;
            } catch (_error) {
              return null;
            }
          })(),
        }),
        migrate: (persistedState: unknown, _version: number) => {
          // Type guard for persisted state
          const state = persistedState as Partial<
            WorkspaceState & { activityState?: unknown }
          >;

          // Add IDs to existing assignments that don't have them
          if (state?.stageAssignments) {
            state.stageAssignments = state.stageAssignments.map(
              (assignment) => {
                if (!assignment.id) {
                  return {
                    ...assignment,
                    id: generateAssignmentId(),
                  };
                }
                return assignment;
              }
            );
          }

          // Preserve activityState if it exists (no-op but kept for future state migration logic)
          const stateWithActivity = state as WorkspaceStoreStateWithActivity;
          if (stateWithActivity.activityState) {
            // Activity state is already preserved during rehydration
          }

          return state;
        },
        onRehydrateStorage: () => (state) => {
          // Mark as hydrated
          if (state) {
            state.hasHydrated = true;
          }

          // After rehydration, check if we have activityState but no currentActivity
          if (
            state &&
            (state as WorkspaceStoreStateWithActivity).activityState &&
            !state.currentActivity
          ) {
            // Automatically restore the BiasActivity
            // We need to call initialize after a small delay to ensure all stores are ready
            setTimeout(() => {
              state.initialize().catch((_error: unknown) => {
                // Silently handle delayed initialization errors
              });
            }, 100);
          }
        },
      }
    ),
    { name: 'workspace-store' }
  )
);
