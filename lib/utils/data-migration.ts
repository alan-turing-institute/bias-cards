import type { BiasActivity } from '@/lib/activities/bias-activity';
import type { BiasDeck } from '@/lib/cards/decks/bias-deck';
import type {
  BiasRiskCategory,
  CardPair,
  LifecycleStage,
  WorkspaceState,
} from '@/lib/types';
import type { BiasEntry, ImplementationNote } from '@/lib/types/bias-activity';

/**
 * Migrates legacy workspace data to a BiasActivity instance
 */
export async function migrateWorkspaceToActivity(
  workspaceData: Partial<WorkspaceState>,
  deck: BiasDeck,
  activityName?: string
): Promise<BiasActivity> {
  const { BiasActivity: BiasActivityClass } = await import(
    '@/lib/activities/bias-activity'
  );

  const activity = new BiasActivityClass(deck, {
    name: activityName || workspaceData.name || 'Migrated Activity',
    description: `Migrated from workspace session ${workspaceData.sessionId}`,
  });

  const state = activity.initializeState();

  // Migrate bias risk assignments
  migrateBiasRiskAssignments(workspaceData, state, deck);

  // Migrate stage assignments (lifecycle assignments)
  migrateStageAssignments(workspaceData, state, deck);

  // Migrate card pairs to mitigations
  if (workspaceData.cardPairs) {
    migrateCardPairs(state.biases, workspaceData.cardPairs);
  }

  // Migrate custom annotations
  migrateCustomAnnotations(workspaceData, state, deck);

  // Set completion status
  migrateCompletionStatus(workspaceData, state);

  // Update timestamps
  state.startTime = workspaceData.createdAt || new Date().toISOString();
  state.lastModified = workspaceData.lastModified || new Date().toISOString();

  return activity;
}

/**
 * Validates whether workspace data can be migrated
 */
export function validateMigrationData(workspaceData: Partial<WorkspaceState>): {
  canMigrate: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for required data
  if (!(workspaceData.sessionId || workspaceData.activityId)) {
    warnings.push('No session or activity ID found');
  }

  // Check for data consistency
  validateDataConsistency(workspaceData, warnings, errors);

  return {
    canMigrate: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Creates a backup of workspace data before migration
 */
export function createMigrationBackup(
  workspaceData: Partial<WorkspaceState>
): string {
  const backup = {
    ...workspaceData,
    migrationTimestamp: new Date().toISOString(),
    originalFormat: 'workspace-v1',
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Estimates the complexity of the migration
 */
export function estimateMigrationComplexity(
  workspaceData: Partial<WorkspaceState>
): {
  complexity: 'low' | 'medium' | 'high';
  estimatedTimeMs: number;
  itemCounts: {
    riskAssignments: number;
    stageAssignments: number;
    cardPairs: number;
    annotations: number;
  };
} {
  const itemCounts = {
    riskAssignments: workspaceData.biasRiskAssignments?.length || 0,
    stageAssignments: workspaceData.stageAssignments?.length || 0,
    cardPairs: workspaceData.cardPairs?.length || 0,
    annotations: Object.keys(workspaceData.customAnnotations || {}).length,
  };

  const totalItems = Object.values(itemCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  let complexity: 'low' | 'medium' | 'high';
  let estimatedTimeMs: number;

  if (totalItems < 20) {
    complexity = 'low';
    estimatedTimeMs = 100;
  } else if (totalItems < 100) {
    complexity = 'medium';
    estimatedTimeMs = 500;
  } else {
    complexity = 'high';
    estimatedTimeMs = 1000;
  }

  return {
    complexity,
    estimatedTimeMs,
    itemCounts,
  };
}

// Helper functions to reduce complexity

function migrateBiasRiskAssignments(
  workspaceData: Partial<WorkspaceState>,
  state: { biases: Record<string, BiasEntry> },
  deck: BiasDeck
): void {
  if (!workspaceData.biasRiskAssignments) {
    return;
  }

  for (const assignment of workspaceData.biasRiskAssignments) {
    state.biases[assignment.cardId] = createBiasEntry(
      assignment.cardId,
      deck,
      assignment.riskCategory,
      assignment.timestamp
    );
  }
}

function migrateStageAssignments(
  workspaceData: Partial<WorkspaceState>,
  state: { biases: Record<string, BiasEntry> },
  deck: BiasDeck
): void {
  if (!workspaceData.stageAssignments) {
    return;
  }

  for (const assignment of workspaceData.stageAssignments) {
    const bias = ensureBiasEntry(state.biases, assignment.cardId, deck);
    if (!bias.lifecycleAssignments.includes(assignment.stage)) {
      bias.lifecycleAssignments.push(assignment.stage);
    }
  }
}

function migrateCustomAnnotations(
  workspaceData: Partial<WorkspaceState>,
  state: { biases: Record<string, BiasEntry> },
  deck: BiasDeck
): void {
  if (!workspaceData.customAnnotations) {
    return;
  }

  for (const [cardId, annotation] of Object.entries(
    workspaceData.customAnnotations
  )) {
    const bias = ensureBiasEntry(state.biases, cardId, deck);
    bias.customAnnotations = annotation;
  }
}

function migrateCompletionStatus(
  workspaceData: Partial<WorkspaceState>,
  state: { completedStages: number[]; currentStage: number }
): void {
  if (workspaceData.completedActivityStages) {
    state.completedStages = workspaceData.completedActivityStages;
    state.currentStage =
      Math.max(...workspaceData.completedActivityStages, 0) + 1;
  }
}

function validateDataConsistency(
  workspaceData: Partial<WorkspaceState>,
  warnings: string[],
  errors: string[]
): void {
  if (!(workspaceData.biasRiskAssignments && workspaceData.stageAssignments)) {
    return;
  }

  const riskCardIds = new Set(
    workspaceData.biasRiskAssignments.map((a) => a.cardId)
  );
  const stageCardIds = new Set(
    workspaceData.stageAssignments.map((a) => a.cardId)
  );

  const orphanedStageAssignments = Array.from(stageCardIds).filter(
    (id) => !riskCardIds.has(id)
  );

  if (orphanedStageAssignments.length > 0) {
    warnings.push(
      `Found ${orphanedStageAssignments.length} stage assignments without risk assessments`
    );
  }

  // Check for data loss potential
  if (workspaceData.cardPairs) {
    const pairsWithoutStages = workspaceData.cardPairs.filter((pair) => {
      const hasStageAssignment = workspaceData.stageAssignments?.some(
        (assignment) => assignment.cardId === pair.biasId
      );
      return !hasStageAssignment;
    });

    if (pairsWithoutStages.length > 0) {
      errors.push(
        `Found ${pairsWithoutStages.length} card pairs without stage assignments - these will be lost`
      );
    }
  }
}

/**
 * Helper to create a bias entry from legacy data
 */
function createBiasEntry(
  biasId: string,
  deck: BiasDeck,
  riskCategory?: BiasRiskCategory,
  timestamp?: string
): BiasEntry {
  const card = deck.getCard(biasId);
  return {
    biasId,
    name: card?.name || biasId,
    riskCategory: riskCategory || null,
    riskAssignedAt: timestamp || null,
    lifecycleAssignments: [],
    rationale: {} as Record<LifecycleStage, string>,
    mitigations: {} as Record<LifecycleStage, string[]>,
    implementationNotes: {} as Record<
      LifecycleStage,
      Record<string, ImplementationNote>
    >,
  };
}

/**
 * Helper to ensure bias entry exists
 */
function ensureBiasEntry(
  biases: Record<string, BiasEntry>,
  cardId: string,
  deck: BiasDeck
): BiasEntry {
  if (!biases[cardId]) {
    biases[cardId] = createBiasEntry(cardId, deck);
  }
  return biases[cardId];
}

/**
 * Migrates card pairs to the activity's mitigation structure
 * Split into smaller functions to reduce complexity
 */
function migrateCardPairs(
  biases: Record<string, BiasEntry>,
  cardPairs: CardPair[]
): void {
  for (const pair of cardPairs) {
    migrateCardPair(biases, pair);
  }
}

function migrateCardPair(
  biases: Record<string, BiasEntry>,
  pair: CardPair
): void {
  const bias = biases[pair.biasId];
  if (!bias) {
    return;
  }

  ensureLifecycleAssignments(bias);
  addMitigationToAllStages(bias, pair);
}

function ensureLifecycleAssignments(bias: BiasEntry): void {
  // If no lifecycle assignments, create a default one
  if (bias.lifecycleAssignments.length === 0) {
    bias.lifecycleAssignments.push('data-extraction-procurement');
  }
}

function addMitigationToAllStages(bias: BiasEntry, pair: CardPair): void {
  for (const stage of bias.lifecycleAssignments) {
    addMitigationToStage(bias, stage, pair);
  }
}

function addMitigationToStage(
  bias: BiasEntry,
  stage: LifecycleStage,
  pair: CardPair
): void {
  if (!bias.mitigations[stage]) {
    bias.mitigations[stage] = [];
  }

  if (!bias.mitigations[stage].includes(pair.mitigationId)) {
    bias.mitigations[stage].push(pair.mitigationId);
  }

  // Create implementation note if we have additional data
  if (pair.effectivenessRating || pair.annotation) {
    createImplementationNote(bias, stage, pair);
  }
}

function createImplementationNote(
  bias: BiasEntry,
  stage: LifecycleStage,
  pair: CardPair
): void {
  if (!bias.implementationNotes[stage]) {
    bias.implementationNotes[stage] = {};
  }

  bias.implementationNotes[stage][pair.mitigationId] = {
    effectivenessRating: pair.effectivenessRating || 3,
    notes: pair.annotation || '',
    status: 'planned',
  };
}

/**
 * Migration status tracking
 */
export interface MigrationStatus {
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  itemsMigrated: number;
  totalItems: number;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  activity?: BiasActivity;
  error?: string;
  warnings: string[];
  backup?: string;
  status: MigrationStatus;
}
