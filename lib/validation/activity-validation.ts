import type { Card, LifecycleStage, WorkspaceState } from '@/lib/types';

export interface ValidationGate {
  id: string;
  name: string;
  description: string;
  required: boolean;
  passed: boolean;
  details?: string;
}

export interface ActivityValidationResult {
  isComplete: boolean;
  completionPercentage: number;
  gates: ValidationGate[];
  missingRequirements: string[];
  canGenerateReport: boolean;
}

/**
 * Critical lifecycle stages that must have at least one bias card assigned
 */
const CRITICAL_STAGES: LifecycleStage[] = [
  'problem-formulation',
  'data-extraction-procurement',
];

/**
 * Minimum requirements for activity completion
 */
const COMPLETION_REQUIREMENTS = {
  MIN_BIAS_CARDS: 3,
  MIN_MITIGATION_PAIRS: 3,
  MIN_STAGES_USED: 2,
  MIN_CRITICAL_STAGES: 2, // Both critical stages must be used
  MIN_RATIONALE_COMMENTS: 1,
} as const;

/**
 * Validates if an activity meets the completion criteria for report generation
 */
export function validateActivityCompletion(
  workspace: WorkspaceState,
  biasCards: Card[],
  _mitigationCards: Card[]
): ActivityValidationResult {
  const gates: ValidationGate[] = [];
  const missingRequirements: string[] = [];

  // Gate 1: Minimum bias cards assigned
  const biasAssignments = workspace.stageAssignments.filter((assignment) =>
    biasCards.some((card) => card.id === assignment.cardId)
  );
  const biasCardCount = biasAssignments.length;
  const minBiasCardsPassed =
    biasCardCount >= COMPLETION_REQUIREMENTS.MIN_BIAS_CARDS;

  gates.push({
    id: 'min-bias-cards',
    name: 'Minimum Bias Cards',
    description: `At least ${COMPLETION_REQUIREMENTS.MIN_BIAS_CARDS} bias cards must be assigned to lifecycle stages`,
    required: true,
    passed: minBiasCardsPassed,
    details: `${biasCardCount}/${COMPLETION_REQUIREMENTS.MIN_BIAS_CARDS} bias cards assigned`,
  });

  if (!minBiasCardsPassed) {
    missingRequirements.push(
      `Assign ${COMPLETION_REQUIREMENTS.MIN_BIAS_CARDS - biasCardCount} more bias cards to lifecycle stages`
    );
  }

  // Gate 2: Minimum bias-mitigation pairs
  const pairCount = workspace.cardPairs.length;
  const minPairsPassed =
    pairCount >= COMPLETION_REQUIREMENTS.MIN_MITIGATION_PAIRS;

  gates.push({
    id: 'min-mitigation-pairs',
    name: 'Bias-Mitigation Pairs',
    description: `At least ${COMPLETION_REQUIREMENTS.MIN_MITIGATION_PAIRS} bias-mitigation pairs must be created`,
    required: true,
    passed: minPairsPassed,
    details: `${pairCount}/${COMPLETION_REQUIREMENTS.MIN_MITIGATION_PAIRS} pairs created`,
  });

  if (!minPairsPassed) {
    missingRequirements.push(
      `Create ${COMPLETION_REQUIREMENTS.MIN_MITIGATION_PAIRS - pairCount} more bias-mitigation pairs`
    );
  }

  // Gate 3: Critical stages populated
  const usedStages = new Set(workspace.stageAssignments.map((a) => a.stage));
  const criticalStagesUsed = CRITICAL_STAGES.filter((stage) =>
    usedStages.has(stage)
  );
  const criticalStagesPassed =
    criticalStagesUsed.length >= COMPLETION_REQUIREMENTS.MIN_CRITICAL_STAGES;

  gates.push({
    id: 'critical-stages',
    name: 'Critical Stages',
    description:
      'Key lifecycle stages (Problem Formulation, Data Extraction) must have assigned cards',
    required: true,
    passed: criticalStagesPassed,
    details: `${criticalStagesUsed.length}/${CRITICAL_STAGES.length} critical stages populated`,
  });

  if (!criticalStagesPassed) {
    const missingStages = CRITICAL_STAGES.filter(
      (stage) => !usedStages.has(stage)
    );
    missingRequirements.push(
      `Assign cards to critical stages: ${missingStages.join(', ')}`
    );
  }

  // Gate 4: Minimum diversity of stages used
  const stagesUsedCount = usedStages.size;
  const minStagesPassed =
    stagesUsedCount >= COMPLETION_REQUIREMENTS.MIN_STAGES_USED;

  gates.push({
    id: 'stage-diversity',
    name: 'Stage Diversity',
    description: 'Cards should be distributed across multiple lifecycle stages',
    required: false,
    passed: minStagesPassed,
    details: `${stagesUsedCount} different stages used`,
  });

  if (!minStagesPassed) {
    missingRequirements.push(
      `Use ${COMPLETION_REQUIREMENTS.MIN_STAGES_USED - stagesUsedCount} more lifecycle stages`
    );
  }

  // Gate 5: Rationale comments provided
  const commentCount = workspace.customAnnotations
    ? Object.keys(workspace.customAnnotations).length
    : 0;
  const assignmentComments = workspace.stageAssignments.filter((a) =>
    a.annotation?.trim()
  ).length;
  const pairComments = workspace.cardPairs.filter((p) =>
    p.annotation?.trim()
  ).length;
  const totalComments = commentCount + assignmentComments + pairComments;

  const rationalePassed =
    totalComments >= COMPLETION_REQUIREMENTS.MIN_RATIONALE_COMMENTS;

  gates.push({
    id: 'rationale-comments',
    name: 'Rationale Documentation',
    description:
      'At least one rationale or comment should be provided to document decision-making',
    required: false,
    passed: rationalePassed,
    details: `${totalComments} comments/annotations provided`,
  });

  if (!rationalePassed) {
    missingRequirements.push(
      'Add at least one comment or annotation to document your reasoning'
    );
  }

  // Calculate completion
  const requiredGates = gates.filter((g) => g.required);
  const passedRequiredGates = requiredGates.filter((g) => g.passed);
  const allGatesPassed = gates.filter((g) => g.passed);

  const isComplete = passedRequiredGates.length === requiredGates.length;
  const completionPercentage = Math.round(
    (allGatesPassed.length / gates.length) * 100
  );
  const canGenerateReport = isComplete;

  return {
    isComplete,
    completionPercentage,
    gates,
    missingRequirements,
    canGenerateReport,
  };
}

/**
 * Get a summary of what's needed to complete the activity
 */
export function getCompletionSummary(
  validation: ActivityValidationResult
): string {
  if (validation.isComplete) {
    return 'Activity is complete and ready for report generation!';
  }

  const required = validation.gates.filter((g) => g.required && !g.passed);
  if (required.length === 0) {
    return 'All required criteria met! Consider adding optional improvements.';
  }

  return `${required.length} required criteria remaining: ${required.map((g) => g.name).join(', ')}`;
}

/**
 * Get the next actionable step for the user
 */
export function getNextAction(validation: ActivityValidationResult): string {
  if (validation.isComplete) {
    return 'Generate your bias analysis report';
  }

  const failedRequired = validation.gates.find((g) => g.required && !g.passed);
  if (failedRequired) {
    switch (failedRequired.id) {
      case 'min-bias-cards':
        return 'Assign more bias cards to lifecycle stages';
      case 'min-mitigation-pairs':
        return 'Create bias-mitigation pairs by connecting related cards';
      case 'critical-stages':
        return 'Assign cards to Problem Formulation and Data Extraction stages';
      default:
        return 'Complete the required criteria';
    }
  }

  const failedOptional = validation.gates.find(
    (g) => !(g.required || g.passed)
  );
  if (failedOptional) {
    switch (failedOptional.id) {
      case 'stage-diversity':
        return 'Distribute cards across more lifecycle stages';
      case 'rationale-comments':
        return 'Add comments to document your reasoning';
      default:
        return 'Consider adding optional improvements';
    }
  }

  return 'Continue building your analysis';
}
