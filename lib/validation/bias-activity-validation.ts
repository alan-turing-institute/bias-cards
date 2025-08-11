import type {
  ValidationError,
  ValidationResult,
} from '@/lib/activities/activity';
import type { BiasActivity } from '@/lib/activities/bias-activity';
import type { BiasDeck } from '@/lib/cards/decks/bias-deck';
import type { LifecycleStage } from '@/lib/types';
import type { BiasEntry, CompletionStatus } from '@/lib/types/bias-activity';

export interface StageCompletionCriteria {
  stage1: {
    minBiases: number;
    allMustHaveRisk: boolean;
  };
  stage2: {
    minLifecycleAssignments: number;
    requireAllBiasesAssigned: boolean;
  };
  stage3: {
    requireRationaleForAll: boolean;
    minRationaleLength: number;
  };
  stage4: {
    requireMitigationsForHighRisk: boolean;
    minMitigationsPerBias: number;
  };
  stage5: {
    requireImplementationNotes: boolean;
    minEffectivenessRating: number;
  };
}

export interface ValidationOptions {
  strict: boolean;
  checkDeckCompatibility: boolean;
  checkStageProgression: boolean;
  checkReferenceIntegrity: boolean;
  completionCriteria?: Partial<StageCompletionCriteria>;
}

const DEFAULT_COMPLETION_CRITERIA: StageCompletionCriteria = {
  stage1: {
    minBiases: 1,
    allMustHaveRisk: true,
  },
  stage2: {
    minLifecycleAssignments: 1,
    requireAllBiasesAssigned: false,
  },
  stage3: {
    requireRationaleForAll: false,
    minRationaleLength: 10,
  },
  stage4: {
    requireMitigationsForHighRisk: true,
    minMitigationsPerBias: 0,
  },
  stage5: {
    requireImplementationNotes: false,
    minEffectivenessRating: 1,
  },
};

export class BiasActivityValidator {
  private activity: BiasActivity;
  private deck: BiasDeck;
  private options: ValidationOptions;
  private completionCriteria: StageCompletionCriteria;

  constructor(
    activity: BiasActivity,
    deck: BiasDeck,
    options: Partial<ValidationOptions> = {}
  ) {
    this.activity = activity;
    this.deck = deck;
    this.options = {
      strict: false,
      checkDeckCompatibility: true,
      checkStageProgression: true,
      checkReferenceIntegrity: true,
      ...options,
    };
    this.completionCriteria = {
      ...DEFAULT_COMPLETION_CRITERIA,
      ...options.completionCriteria,
    };
  }

  validate(): ValidationResult {
    const errors: ValidationError[] = [];

    if (this.options.checkDeckCompatibility) {
      this.validateDeckCompatibility(errors);
    }

    if (this.options.checkStageProgression) {
      this.validateStageProgression(errors);
    }

    if (this.options.checkReferenceIntegrity) {
      this.validateReferenceIntegrity(errors);
    }

    if (this.options.strict) {
      this.validateStrictRules(errors);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private validateDeckCompatibility(errors: ValidationError[]): void {
    // Check if deck is loaded and compatible
    if (!this.deck || this.deck.size() === 0) {
      errors.push({
        type: 'deck',
        message: 'No deck loaded or deck is empty',
      });
      return;
    }

    // Check if deck version matches activity expectations
    const activityData = this.activity.export();
    if (
      activityData.deckId &&
      activityData.deckId !== this.deck.getMetadata().id
    ) {
      errors.push({
        type: 'deck',
        message: `Activity expects deck ${activityData.deckId} but ${this.deck.getMetadata().id} is loaded`,
      });
    }
  }

  private validateStageProgression(errors: ValidationError[]): void {
    const biases = this.activity.getBiases();

    for (const [biasId, entry] of Object.entries(biases)) {
      this.validateBiasProgression(biasId, entry, errors);
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Multiple stage dependencies to validate
  private validateBiasProgression(
    biasId: string,
    entry: BiasEntry,
    errors: ValidationError[]
  ): void {
    // Stage 2 requires Stage 1 (risk assessment before lifecycle assignment)
    if (entry.lifecycleAssignments.length > 0 && !entry.riskCategory) {
      errors.push({
        type: 'progression',
        biasId,
        stage: 2,
        message: `Bias "${entry.name}" has lifecycle assignments but no risk assessment (Stage 1 incomplete)`,
      });
    }

    // Stage 3 requires Stage 2 (lifecycle assignment before rationale)
    if (
      Object.keys(entry.rationale).length > 0 &&
      entry.lifecycleAssignments.length === 0
    ) {
      errors.push({
        type: 'progression',
        biasId,
        stage: 3,
        message: `Bias "${entry.name}" has rationale but no lifecycle assignments (Stage 2 incomplete)`,
      });
    }

    // Stage 4 requires Stage 2 (lifecycle assignment before mitigations)
    if (
      Object.keys(entry.mitigations).length > 0 &&
      entry.lifecycleAssignments.length === 0
    ) {
      errors.push({
        type: 'progression',
        biasId,
        stage: 4,
        message: `Bias "${entry.name}" has mitigations but no lifecycle assignments (Stage 2 incomplete)`,
      });
    }

    // Stage 5 requires Stage 4 (mitigations before implementation notes)
    for (const [stage, notes] of Object.entries(entry.implementationNotes)) {
      const stageKey = stage as LifecycleStage;
      const mitigationsForStage = entry.mitigations[stageKey] || [];
      for (const mitigationId of Object.keys(notes)) {
        if (!mitigationsForStage.includes(mitigationId)) {
          errors.push({
            type: 'progression',
            biasId,
            stage: 5,
            message: `Bias "${entry.name}" has implementation notes for mitigation "${mitigationId}" that is not selected in stage "${stage}"`,
          });
        }
      }
    }

    // Validate rationale exists for assigned stages (warning level)
    if (this.options.strict) {
      for (const stage of entry.lifecycleAssignments) {
        if (!entry.rationale[stage]) {
          errors.push({
            type: 'data',
            biasId,
            stage: 3,
            message: `Bias "${entry.name}" assigned to "${stage}" but lacks rationale`,
          });
        }
      }
    }
  }

  private validateReferenceIntegrity(errors: ValidationError[]): void {
    const biases = this.activity.getBiases();

    for (const [biasId, entry] of Object.entries(biases)) {
      // Check if bias card exists in deck
      if (!this.deck.getCard(biasId)) {
        errors.push({
          type: 'reference',
          biasId,
          message: `Bias card "${biasId}" not found in deck`,
        });
      }

      // Check if mitigation cards exist in deck
      for (const [stage, mitigationIds] of Object.entries(entry.mitigations)) {
        for (const mitigationId of mitigationIds) {
          if (!this.deck.getCard(mitigationId)) {
            errors.push({
              type: 'reference',
              message: `Mitigation "${mitigationId}" not found in deck for bias "${entry.name}" at stage "${stage}"`,
            });
          }
        }
      }
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Multiple strict validation rules
  private validateStrictRules(errors: ValidationError[]): void {
    const biases = this.activity.getBiases();

    // Check for high-risk biases without mitigations
    for (const [biasId, entry] of Object.entries(biases)) {
      if (entry.riskCategory === 'high-risk') {
        const totalMitigations = Object.values(entry.mitigations).flat().length;
        if (totalMitigations === 0) {
          errors.push({
            type: 'data',
            biasId,
            message: `High-risk bias "${entry.name}" has no mitigations selected`,
          });
        }
      }
    }

    // Check for incomplete implementation notes
    for (const [biasId, entry] of Object.entries(biases)) {
      for (const [stage, mitigationIds] of Object.entries(entry.mitigations)) {
        for (const mitigationId of mitigationIds) {
          const stageKey = stage as LifecycleStage;
          const note = entry.implementationNotes[stageKey]?.[mitigationId];
          if (!note || note.status === 'planned') {
            errors.push({
              type: 'data',
              biasId,
              message: `Mitigation "${mitigationId}" for bias "${entry.name}" lacks implementation details or is still planned`,
            });
          }
        }
      }
    }
  }

  getCompletionStatus(): CompletionStatus {
    const stages = {
      stage1: this.isStage1Complete(),
      stage2: this.isStage2Complete(),
      stage3: this.isStage3Complete(),
      stage4: this.isStage4Complete(),
      stage5: this.isStage5Complete(),
    };

    const completedCount = Object.values(stages).filter(Boolean).length;
    const overallProgress = completedCount / 5;

    return { stages, overallProgress };
  }

  isStage1Complete(): boolean {
    const biases = Object.values(this.activity.getBiases());
    const criteria = this.completionCriteria.stage1;

    if (biases.length < criteria.minBiases) {
      return false;
    }

    if (criteria.allMustHaveRisk) {
      return biases.every((b) => b.riskCategory !== null);
    }

    return biases.some((b) => b.riskCategory !== null);
  }

  isStage2Complete(): boolean {
    const biases = Object.values(this.activity.getBiases());
    const criteria = this.completionCriteria.stage2;

    if (biases.length === 0) {
      return false;
    }

    if (criteria.requireAllBiasesAssigned) {
      return biases.every(
        (b) => b.lifecycleAssignments.length >= criteria.minLifecycleAssignments
      );
    }

    return biases.some(
      (b) => b.lifecycleAssignments.length >= criteria.minLifecycleAssignments
    );
  }

  isStage3Complete(): boolean {
    const biases = Object.values(this.activity.getBiases());
    const criteria = this.completionCriteria.stage3;

    if (biases.length === 0) {
      return false;
    }

    return biases.every((bias) => {
      // Check if bias has any lifecycle assignments
      if (bias.lifecycleAssignments.length === 0) {
        return true; // Skip if not assigned
      }

      if (criteria.requireRationaleForAll) {
        // All assigned stages must have rationale
        return bias.lifecycleAssignments.every((stage) => {
          const rationale = bias.rationale[stage];
          return rationale && rationale.length >= criteria.minRationaleLength;
        });
      }
      // At least one stage should have rationale
      return bias.lifecycleAssignments.some((stage) => {
        const rationale = bias.rationale[stage];
        return rationale && rationale.length >= criteria.minRationaleLength;
      });
    });
  }

  isStage4Complete(): boolean {
    const biases = Object.values(this.activity.getBiases());
    const criteria = this.completionCriteria.stage4;

    if (biases.length === 0) {
      return false;
    }

    return biases.every((bias) => {
      const totalMitigations = Object.values(bias.mitigations).flat().length;

      // High-risk biases must have mitigations if required
      if (
        criteria.requireMitigationsForHighRisk &&
        bias.riskCategory === 'high-risk'
      ) {
        return totalMitigations > 0;
      }

      // Check minimum mitigations per bias
      if (criteria.minMitigationsPerBias > 0) {
        return totalMitigations >= criteria.minMitigationsPerBias;
      }

      return true;
    });
  }

  isStage5Complete(): boolean {
    const biases = Object.values(this.activity.getBiases());
    const criteria = this.completionCriteria.stage5;

    if (biases.length === 0) {
      return false;
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex stage 5 validation
    return biases.every((bias) => {
      // If no mitigations, stage 5 doesn't apply
      const hasMitigations = Object.values(bias.mitigations).flat().length > 0;
      if (!hasMitigations) {
        return true;
      }

      if (criteria.requireImplementationNotes) {
        // Check all mitigations have implementation notes
        for (const [stage, mitigationIds] of Object.entries(bias.mitigations)) {
          for (const mitigationId of mitigationIds) {
            const note =
              bias.implementationNotes[stage as LifecycleStage]?.[mitigationId];
            if (!note) {
              return false;
            }
            if (note.effectivenessRating < criteria.minEffectivenessRating) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }

  canAdvanceToStage(targetStage: number): boolean {
    const currentStage = this.activity.getCurrentStage();

    // Can't go backwards
    if (targetStage <= currentStage) {
      return true;
    }

    // Can only advance one stage at a time
    if (targetStage > currentStage + 1) {
      return false;
    }

    // Check if current stage is complete
    switch (currentStage) {
      case 1:
        return this.isStage1Complete();
      case 2:
        return this.isStage2Complete();
      case 3:
        return this.isStage3Complete();
      case 4:
        return this.isStage4Complete();
      default:
        return true;
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex validation logic with multiple stages
  getStageWarnings(stage: number): string[] {
    const warnings: string[] = [];
    const biases = Object.values(this.activity.getBiases());

    switch (stage) {
      case 1: {
        if (biases.length === 0) {
          warnings.push('No biases have been identified yet');
        }
        const unassessedCount = biases.filter((b) => !b.riskCategory).length;
        if (unassessedCount > 0) {
          warnings.push(
            `${unassessedCount} bias(es) still need risk assessment`
          );
        }
        break;
      }

      case 2: {
        const unassignedCount = biases.filter(
          (b) => b.lifecycleAssignments.length === 0
        ).length;
        if (unassignedCount > 0) {
          warnings.push(
            `${unassignedCount} bias(es) not assigned to any lifecycle stages`
          );
        }
        break;
      }

      case 3:
        for (const bias of biases) {
          const missingRationale = bias.lifecycleAssignments.filter(
            (s) => !bias.rationale[s]
          );
          if (missingRationale.length > 0) {
            warnings.push(
              `${bias.name} lacks rationale for ${missingRationale.length} stage(s)`
            );
          }
        }
        break;

      case 4: {
        const highRiskWithoutMitigation = biases.filter(
          (b) =>
            b.riskCategory === 'high-risk' &&
            Object.values(b.mitigations).flat().length === 0
        );
        if (highRiskWithoutMitigation.length > 0) {
          warnings.push(
            `${highRiskWithoutMitigation.length} high-risk bias(es) have no mitigations`
          );
        }
        break;
      }

      case 5: {
        let missingNotes = 0;
        for (const bias of biases) {
          for (const [s, mitigationIds] of Object.entries(bias.mitigations)) {
            for (const mitigationId of mitigationIds) {
              const stageKey = s as LifecycleStage;
              if (!bias.implementationNotes[stageKey]?.[mitigationId]) {
                missingNotes++;
              }
            }
          }
        }
        if (missingNotes > 0) {
          warnings.push(
            `${missingNotes} mitigation(s) lack implementation notes`
          );
        }
        break;
      }
      default:
        // No warnings for other stages
        break;
    }

    return warnings;
  }

  getProgressMetrics(): {
    totalBiases: number;
    assessedBiases: number;
    assignedBiases: number;
    biasesWithRationale: number;
    biasesWithMitigations: number;
    implementedMitigations: number;
    overallCompleteness: number;
  } {
    const biases = Object.values(this.activity.getBiases());
    const totalBiases = biases.length;

    const assessedBiases = biases.filter((b) => b.riskCategory !== null).length;
    const assignedBiases = biases.filter(
      (b) => b.lifecycleAssignments.length > 0
    ).length;
    const biasesWithRationale = biases.filter(
      (b) => Object.keys(b.rationale).length > 0
    ).length;
    const biasesWithMitigations = biases.filter(
      (b) => Object.values(b.mitigations).flat().length > 0
    ).length;

    let implementedMitigations = 0;
    for (const bias of biases) {
      for (const [, notes] of Object.entries(bias.implementationNotes)) {
        for (const [, note] of Object.entries(notes)) {
          if (note.status === 'implemented') {
            implementedMitigations++;
          }
        }
      }
    }

    // Calculate overall completeness as weighted average
    const weights = {
      assessed: 0.2,
      assigned: 0.2,
      rationale: 0.2,
      mitigations: 0.2,
      implemented: 0.2,
    };

    let overallCompleteness = 0;
    if (totalBiases > 0) {
      overallCompleteness =
        (assessedBiases / totalBiases) * weights.assessed +
        (assignedBiases / totalBiases) * weights.assigned +
        (biasesWithRationale / totalBiases) * weights.rationale +
        (biasesWithMitigations / totalBiases) * weights.mitigations +
        (implementedMitigations / Math.max(1, biasesWithMitigations)) *
          weights.implemented;
    }

    return {
      totalBiases,
      assessedBiases,
      assignedBiases,
      biasesWithRationale,
      biasesWithMitigations,
      implementedMitigations,
      overallCompleteness: Math.round(overallCompleteness * 100),
    };
  }
}
