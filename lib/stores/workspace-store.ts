import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  calculateMatchingScore,
  getSuggestedMitigations,
} from '@/lib/data/mitigation-matching';
import { useCardsStore } from '@/lib/stores/cards-store';
import type {
  ActivityProgress,
  ActivityStage,
  BiasRiskAssignment,
  BiasRiskCategory,
  CardPair,
  LifecycleStage,
  Milestone,
  MitigationCard,
  StageAssignment,
  WorkspaceAction,
  WorkspaceHistory,
  WorkspaceState,
} from '@/lib/types';
import {
  type ActivityValidationResult,
  validateActivityCompletion,
} from '@/lib/validation/activity-validation';

interface WorkspaceStoreState extends WorkspaceState {
  // History management
  history: WorkspaceHistory;

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
  resetWorkspace: () => void;
  updateWorkspaceName: (name: string) => void;
  updateLastModified: () => void;
  setActivityId: (activityId: string) => void;

  // Computed properties
  getProgress: () => ActivityProgress;

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
}

const createInitialMilestones = (): Milestone[] => [
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
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,
});

const createInitialState = (): WorkspaceState => ({
  sessionId: generateSessionId(),
  name: undefined,
  activityId: undefined,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  currentStage: 1,
  completedActivityStages: [],
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
  },
});

const generateActionId = (): string => {
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

const addActionToHistory = (
  history: WorkspaceHistory,
  action: WorkspaceAction
): WorkspaceHistory => {
  const newUndoStack = [...history.undoStack, action];

  // Limit history size
  if (newUndoStack.length > history.maxHistorySize) {
    newUndoStack.shift();
  }

  return {
    ...history,
    undoStack: newUndoStack,
    redoStack: [], // Clear redo stack when new action is performed
  };
};

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createInitialState(),
        history: createInitialHistory(),

        // Activity stage management
        setCurrentActivityStage: (stage) => {
          set((_state) => ({
            currentStage: stage,
            lastModified: new Date().toISOString(),
          }));
        },

        completeActivityStage: (stage) => {
          set((state) => {
            if (state.completedActivityStages.includes(stage)) {
              return state;
            }

            return {
              completedActivityStages: [
                ...state.completedActivityStages,
                stage,
              ],
              lastModified: new Date().toISOString(),
            };
          });
        },

        isActivityStageComplete: (stage) => {
          return get().completedActivityStages.includes(stage);
        },

        // Bias risk assignment (Stage 1)
        assignBiasRisk: (cardId, riskCategory, annotation) => {
          const assignmentId = generateAssignmentId();

          set((state) => ({
            biasRiskAssignments: [
              ...state.biasRiskAssignments.filter((a) => a.cardId !== cardId),
              {
                id: assignmentId,
                cardId,
                riskCategory,
                annotation,
                timestamp: new Date().toISOString(),
              },
            ],
            lastModified: new Date().toISOString(),
          }));
        },

        removeBiasRisk: (cardId) => {
          set((state) => ({
            biasRiskAssignments: state.biasRiskAssignments.filter(
              (a) => a.cardId !== cardId
            ),
            lastModified: new Date().toISOString(),
          }));
        },

        updateBiasRisk: (cardId, updates) => {
          set((state) => ({
            biasRiskAssignments: state.biasRiskAssignments.map((a) =>
              a.cardId === cardId
                ? { ...a, ...updates, timestamp: new Date().toISOString() }
                : a
            ),
            lastModified: new Date().toISOString(),
          }));
        },

        getBiasRiskAssignments: () => {
          return get().biasRiskAssignments;
        },

        getBiasRiskByCategory: (category) => {
          return get().biasRiskAssignments.filter(
            (a) => a.riskCategory === category
          );
        },

        // Stage management
        assignCardToStage: (cardId, stage, annotation) => {
          const assignmentId = generateAssignmentId();

          const action: WorkspaceAction = {
            id: generateActionId(),
            type: 'ASSIGN_CARD',
            timestamp: new Date().toISOString(),
            description: `Assigned card to ${stage}`,
            data: { assignmentId, cardId, stage, annotation },
            inverse: {
              id: generateActionId(),
              type: 'REMOVE_ASSIGNMENT',
              timestamp: new Date().toISOString(),
              description: `Removed card from ${stage}`,
              data: { assignmentId },
              inverse: null,
            },
          };

          get().applyAction(action);
        },

        removeCardFromStage: (assignmentId) => {
          const existingAssignment = get().stageAssignments.find(
            (a) => a.id === assignmentId
          );

          if (!existingAssignment) {
            return;
          }

          const action: WorkspaceAction = {
            id: generateActionId(),
            type: 'REMOVE_ASSIGNMENT',
            timestamp: new Date().toISOString(),
            description: `Removed card from ${existingAssignment.stage}`,
            data: { assignmentId },
            inverse: {
              id: generateActionId(),
              type: 'ASSIGN_CARD',
              timestamp: new Date().toISOString(),
              description: `Restored card to ${existingAssignment.stage}`,
              data: {
                assignmentId: existingAssignment.id,
                cardId: existingAssignment.cardId,
                stage: existingAssignment.stage,
                annotation: existingAssignment.annotation,
              },
              inverse: null,
            },
          };

          get().applyAction(action);
        },

        updateStageAssignment: (assignmentId, updates) => {
          set((state) => ({
            stageAssignments: state.stageAssignments.map((a) =>
              a.id === assignmentId
                ? { ...a, ...updates, timestamp: new Date().toISOString() }
                : a
            ),
            lastModified: new Date().toISOString(),
          }));
        },

        getCardsInStage: (stage) => {
          return get()
            .stageAssignments.filter((a) => a.stage === stage)
            .map((a) => a.cardId);
        },

        // Card pairing
        createCardPair: (
          biasId,
          mitigationId,
          annotation,
          effectivenessRating
        ) => {
          const existingPair = get().cardPairs.find(
            (p) => p.biasId === biasId && p.mitigationId === mitigationId
          );

          if (existingPair) {
            return; // Pair already exists
          }

          const action: WorkspaceAction = {
            id: generateActionId(),
            type: 'CREATE_PAIR',
            timestamp: new Date().toISOString(),
            description: 'Created pair between bias and mitigation',
            data: { biasId, mitigationId, annotation, effectivenessRating },
            inverse: {
              id: generateActionId(),
              type: 'REMOVE_PAIR',
              timestamp: new Date().toISOString(),
              description: 'Removed pair between bias and mitigation',
              data: { biasId, mitigationId },
              inverse: null,
            },
          };

          get().applyAction(action);
        },

        removeCardPair: (biasId, mitigationId) => {
          const existingPair = get().cardPairs.find(
            (p) => p.biasId === biasId && p.mitigationId === mitigationId
          );

          if (!existingPair) {
            return;
          }

          const action: WorkspaceAction = {
            id: generateActionId(),
            type: 'REMOVE_PAIR',
            timestamp: new Date().toISOString(),
            description: 'Removed pair between bias and mitigation',
            data: { biasId, mitigationId },
            inverse: {
              id: generateActionId(),
              type: 'CREATE_PAIR',
              timestamp: new Date().toISOString(),
              description: 'Restored pair between bias and mitigation',
              data: {
                biasId,
                mitigationId,
                annotation: existingPair.annotation,
                effectivenessRating: existingPair.effectivenessRating,
              },
              inverse: null,
            },
          };

          get().applyAction(action);
        },

        updateCardPair: (biasId, mitigationId, updates) => {
          const existingPair = get().cardPairs.find(
            (p) => p.biasId === biasId && p.mitigationId === mitigationId
          );

          if (!existingPair) {
            return;
          }

          const action: WorkspaceAction = {
            id: generateActionId(),
            type: 'UPDATE_PAIR',
            timestamp: new Date().toISOString(),
            description: 'Updated pair between bias and mitigation',
            data: { biasId, mitigationId, updates },
            inverse: {
              id: generateActionId(),
              type: 'UPDATE_PAIR',
              timestamp: new Date().toISOString(),
              description: 'Reverted pair update',
              data: {
                biasId,
                mitigationId,
                updates: {
                  annotation: existingPair.annotation,
                  effectivenessRating: existingPair.effectivenessRating,
                },
              },
              inverse: null,
            },
          };

          get().applyAction(action);
        },

        getPairsForBias: (biasId) => {
          return get().cardPairs.filter((p) => p.biasId === biasId);
        },

        getPairsForMitigation: (mitigationId) => {
          return get().cardPairs.filter((p) => p.mitigationId === mitigationId);
        },

        // Card selection
        selectCard: (cardId) => {
          set((state) => ({
            selectedCardIds: [...new Set([...state.selectedCardIds, cardId])],
          }));
        },

        deselectCard: (cardId) => {
          set((state) => ({
            selectedCardIds: state.selectedCardIds.filter(
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
          return get().selectedCardIds.includes(cardId);
        },

        // Annotations
        setCardAnnotation: (cardId, annotation) => {
          set((state) => ({
            customAnnotations: {
              ...state.customAnnotations,
              [cardId]: annotation,
            },
            lastModified: new Date().toISOString(),
          }));
        },

        removeCardAnnotation: (cardId) => {
          set((state) => {
            const { [cardId]: _, ...rest } = state.customAnnotations;
            return {
              customAnnotations: rest,
              lastModified: new Date().toISOString(),
            };
          });
        },

        getCardAnnotation: (cardId) => {
          return get().customAnnotations[cardId];
        },

        // Progress tracking
        markStageComplete: (stage) => {
          set((state) => {
            if (state.completedStages.includes(stage)) {
              return state;
            }

            return {
              completedStages: [...state.completedStages, stage],
              lastModified: new Date().toISOString(),
            };
          });
        },

        unmarkStageComplete: (stage) => {
          set((state) => ({
            completedStages: state.completedStages.filter((s) => s !== stage),
            lastModified: new Date().toISOString(),
          }));
        },

        isStageComplete: (stage) => {
          return get().completedStages.includes(stage);
        },

        // Workspace management
        resetWorkspace: () => {
          set(createInitialState());
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

        // Computed properties
        getProgress: () => {
          const state = get();
          const totalCards = 40; // 24 bias + 16 mitigation cards
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
            timeSpent: state.activityProgress.timeSpent,
            milestones: state.activityProgress.milestones,
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
              const { assignmentId, cardId, stage, annotation } = action.data;
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
              const { cardId } = action.data;
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
              const { assignmentId } = action.data;
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
                action.data;
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
              const { biasId, mitigationId } = action.data;
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
              const { biasId, mitigationId, updates } = action.data;
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
            default: {
              // Exhaustive check
              const _exhaustiveCheck: never = action;
              throw new Error(`Unknown action type: ${_exhaustiveCheck}`);
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
          completedActivityStages: state.completedActivityStages,
          biasRiskAssignments: state.biasRiskAssignments,
          stageAssignments: state.stageAssignments,
          cardPairs: state.cardPairs,
          selectedCardIds: state.selectedCardIds,
          customAnnotations: state.customAnnotations,
          completedStages: state.completedStages,
          activityProgress: state.activityProgress,
        }),
        migrate: (persistedState: unknown, _version: number) => {
          // Type guard for persisted state
          const state = persistedState as Partial<WorkspaceState>;

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
          return state;
        },
      }
    ),
    { name: 'workspace-store' }
  )
);
