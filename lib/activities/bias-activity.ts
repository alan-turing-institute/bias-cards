import type { BiasDeck } from '@/lib/cards/decks/bias-deck';
import type { BiasRiskCategory, LifecycleStage } from '@/lib/types';
import type {
  ActivityProgress,
  BiasActivityData,
  BiasActivityState,
  BiasEntry,
  CompletionStatus,
  ImplementationNote,
} from '@/lib/types/bias-activity';
import {
  Activity,
  type ActivityMetadata, // Use the base Activity's metadata type
  type ValidationError,
  type ValidationResult,
} from './activity';

export class BiasActivity extends Activity {
  protected state!: BiasActivityState; // Use definite assignment assertion since it's initialized in parent
  protected deck: BiasDeck;

  constructor(deck: BiasDeck, metadata: ActivityMetadata) {
    super(deck, metadata);
    this.deck = deck;
  }

  initializeState(): BiasActivityState {
    return {
      currentStage: 1,
      biases: {},
      completedStages: [],
      startTime: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  }

  getCurrentStage(): number {
    return this.state.currentStage;
  }

  advanceStage(): void {
    if (this.state.currentStage < 5) {
      // Mark current stage as completed
      if (!this.state.completedStages.includes(this.state.currentStage)) {
        this.state.completedStages.push(this.state.currentStage);
      }

      this.state.currentStage++;
      this.state.lastModified = new Date().toISOString();
      this.updatedAt = new Date();
    }
  }

  isComplete(): boolean {
    return (
      this.state.completedStages.length === 5 && this.state.currentStage === 5
    );
  }

  // Stage 1: Risk Assessment
  assignBiasRisk(biasId: string, risk: BiasRiskCategory): void {
    const bias = this.getBias(biasId);
    bias.riskCategory = risk;
    bias.riskAssignedAt = new Date().toISOString();
    this.updateBias(biasId, bias);
  }

  removeBiasRisk(biasId: string): void {
    const bias = this.getBias(biasId);
    bias.riskCategory = null;
    bias.riskAssignedAt = null;
    this.updateBias(biasId, bias);
  }

  // Stage 2: Lifecycle Assignment
  assignToLifecycle(biasId: string, stage: LifecycleStage): void {
    const bias = this.getBias(biasId);
    if (!bias.lifecycleAssignments.includes(stage)) {
      bias.lifecycleAssignments.push(stage);
      this.updateBias(biasId, bias);
    }
  }

  removeFromLifecycle(biasId: string, stage: LifecycleStage): void {
    const bias = this.getBias(biasId);
    bias.lifecycleAssignments = bias.lifecycleAssignments.filter(
      (s) => s !== stage
    );
    this.updateBias(biasId, bias);
  }

  // Stage 3: Rationale
  setRationale(biasId: string, stage: LifecycleStage, rationale: string): void {
    const bias = this.getBias(biasId);
    bias.rationale[stage] = rationale;
    this.updateBias(biasId, bias);
  }

  removeRationale(biasId: string, stage: LifecycleStage): void {
    const bias = this.getBias(biasId);
    delete bias.rationale[stage];
    this.updateBias(biasId, bias);
  }

  // Stage 4: Mitigation Selection
  addMitigation(
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string
  ): void {
    const bias = this.getBias(biasId);
    if (!bias.mitigations[stage]) {
      bias.mitigations[stage] = [];
    }
    if (!bias.mitigations[stage].includes(mitigationId)) {
      bias.mitigations[stage].push(mitigationId);
      this.updateBias(biasId, bias);
    }
  }

  removeMitigation(
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string
  ): void {
    const bias = this.getBias(biasId);
    if (bias.mitigations[stage]) {
      bias.mitigations[stage] = bias.mitigations[stage].filter(
        (id) => id !== mitigationId
      );
      this.updateBias(biasId, bias);
    }
  }

  // Stage 5: Implementation Planning
  setImplementationNote(
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string,
    note: ImplementationNote
  ): void {
    const bias = this.getBias(biasId);
    if (!bias.implementationNotes[stage]) {
      bias.implementationNotes[stage] = {};
    }
    bias.implementationNotes[stage][mitigationId] = note;
    this.updateBias(biasId, bias);
  }

  removeImplementationNote(
    biasId: string,
    stage: LifecycleStage,
    mitigationId: string
  ): void {
    const bias = this.getBias(biasId);
    if (bias.implementationNotes[stage]) {
      delete bias.implementationNotes[stage][mitigationId];
      this.updateBias(biasId, bias);
    }
  }

  // Helper methods
  getBias(biasId: string): BiasEntry {
    if (!this.state.biases[biasId]) {
      this.state.biases[biasId] = this.createBiasEntry(biasId);
    }
    return this.state.biases[biasId];
  }

  getBiases(): Record<string, BiasEntry> {
    return { ...this.state.biases };
  }

  private createBiasEntry(biasId: string): BiasEntry {
    const card = this.deck.getCard(biasId);
    return {
      biasId,
      name: card?.name || biasId,
      riskCategory: null,
      riskAssignedAt: null,
      lifecycleAssignments: [],
      rationale: {} as Record<LifecycleStage, string>,
      mitigations: {} as Record<LifecycleStage, string[]>,
      implementationNotes: {} as Record<
        LifecycleStage,
        Record<string, ImplementationNote>
      >,
    };
  }

  private updateBias(biasId: string, bias: BiasEntry): void {
    this.state.biases[biasId] = bias;
    this.state.lastModified = new Date().toISOString();
    this.updatedAt = new Date();
  }

  // Validation
  validate(): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateDeck(errors);
    this.validateStageProgression(errors);
    this.validateMitigationReferences(errors);

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private validateDeck(errors: ValidationError[]): void {
    if (!this.deck || this.deck.size() === 0) {
      errors.push({
        type: 'deck',
        message: 'No deck loaded or deck is empty',
      });
    }
  }

  private validateStageProgression(errors: ValidationError[]): void {
    for (const [biasId, entry] of Object.entries(this.state.biases)) {
      this.validateBiasProgression(biasId, entry, errors);
    }
  }

  private validateBiasProgression(
    biasId: string,
    entry: BiasEntry,
    errors: ValidationError[]
  ): void {
    // Stage 2 requires Stage 1
    if (entry.lifecycleAssignments.length > 0 && !entry.riskCategory) {
      errors.push({
        type: 'progression',
        biasId,
        stage: 2,
        message: `Bias "${entry.name}" has lifecycle assignments but no risk assessment`,
      });
    }

    // Stage 3 requires Stage 2
    if (
      Object.keys(entry.rationale).length > 0 &&
      entry.lifecycleAssignments.length === 0
    ) {
      errors.push({
        type: 'progression',
        biasId,
        stage: 3,
        message: `Bias "${entry.name}" has rationale but no lifecycle assignments`,
      });
    }

    // Stage 4 requires Stage 2
    if (
      Object.keys(entry.mitigations).length > 0 &&
      entry.lifecycleAssignments.length === 0
    ) {
      errors.push({
        type: 'progression',
        biasId,
        stage: 4,
        message: `Bias "${entry.name}" has mitigations but no lifecycle assignments`,
      });
    }
  }

  private validateMitigationReferences(errors: ValidationError[]): void {
    for (const [, entry] of Object.entries(this.state.biases)) {
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

  // Export
  export(): BiasActivityData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      deckId: this.deck.getMetadata().id,
      deckVersion: this.deck.getVersion(),
      biases: this.state.biases,
      state: this.state,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      metadata: this.metadata,
    };
  }

  // Report generation (placeholder - will be implemented with BiasReport)
  generateReport(): unknown {
    // This will be replaced with actual BiasReport implementation
    return {
      activityId: this.id,
      summary: this.getProgress(),
      biases: this.state.biases,
      generatedAt: new Date().toISOString(),
    };
  }

  // Progress tracking
  getCompletionStatus(): CompletionStatus {
    return {
      stages: {
        stage1: this.isStage1Complete(),
        stage2: this.isStage2Complete(),
        stage3: this.isStage3Complete(),
        stage4: this.isStage4Complete(),
        stage5: this.isStage5Complete(),
      },
      overallProgress: this.getProgress(),
    };
  }

  getActivityProgress(): ActivityProgress {
    return {
      currentStage: this.state.currentStage,
      completionStatus: this.getCompletionStatus(),
      biasesAssessed: Object.keys(this.state.biases).length,
      mitigationsSelected: this.countMitigations(),
      lastUpdated: this.updatedAt,
    };
  }

  private isStage1Complete(): boolean {
    const biases = Object.values(this.state.biases);
    return biases.length > 0 && biases.every((b) => b.riskCategory !== null);
  }

  private isStage2Complete(): boolean {
    const biases = Object.values(this.state.biases);
    return (
      biases.length > 0 &&
      biases.every((b) => b.lifecycleAssignments.length > 0)
    );
  }

  private isStage3Complete(): boolean {
    const biases = Object.values(this.state.biases);
    return (
      biases.length > 0 &&
      biases.every((b) => {
        return b.lifecycleAssignments.every((stage) => b.rationale[stage]);
      })
    );
  }

  private isStage4Complete(): boolean {
    const biases = Object.values(this.state.biases);
    return (
      biases.length > 0 &&
      biases.every((b) => {
        return b.lifecycleAssignments.every(
          (stage) => b.mitigations[stage] && b.mitigations[stage].length > 0
        );
      })
    );
  }

  private isStage5Complete(): boolean {
    const biases = Object.values(this.state.biases);
    return (
      biases.length > 0 &&
      biases.every((b) => {
        return Object.keys(b.implementationNotes).length > 0;
      })
    );
  }

  private countMitigations(): number {
    let count = 0;
    for (const bias of Object.values(this.state.biases)) {
      for (const mitigations of Object.values(bias.mitigations)) {
        count += mitigations.length;
      }
    }
    return count;
  }

  // Utility methods
  canAdvanceStage(): boolean {
    const currentStage = this.getCurrentStage();
    switch (currentStage) {
      case 1:
        return this.isStage1Complete();
      case 2:
        return this.isStage2Complete();
      case 3:
        return this.isStage3Complete();
      case 4:
        return this.isStage4Complete();
      case 5:
        return this.isStage5Complete();
      default:
        return false;
    }
  }

  getStageCompletionPercentage(stage: number): number {
    const biases = Object.values(this.state.biases);
    if (biases.length === 0) {
      return 0;
    }

    let completed = 0;
    switch (stage) {
      case 1:
        completed = biases.filter((b) => b.riskCategory !== null).length;
        break;
      case 2:
        completed = biases.filter(
          (b) => b.lifecycleAssignments.length > 0
        ).length;
        break;
      case 3:
        completed = biases.filter((b) =>
          b.lifecycleAssignments.every((s) => b.rationale[s])
        ).length;
        break;
      case 4:
        completed = biases.filter((b) =>
          b.lifecycleAssignments.every(
            (s) => b.mitigations[s] && b.mitigations[s].length > 0
          )
        ).length;
        break;
      case 5:
        completed = biases.filter(
          (b) => Object.keys(b.implementationNotes).length > 0
        ).length;
        break;
      default:
        completed = 0;
        break;
    }

    return (completed / biases.length) * 100;
  }
}
