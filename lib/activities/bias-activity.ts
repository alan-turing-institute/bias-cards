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
import { BiasActivityValidator } from '@/lib/validation/bias-activity-validation';
import {
  Activity,
  type ActivityMetadata, // Use the base Activity's metadata type
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
    if (!this.state) {
      return 1;
    }
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
    if (!(this.state && this.state.biases)) {
      this.state = this.initializeState();
    }
    if (!this.state.biases[biasId]) {
      this.state.biases[biasId] = this.createBiasEntry(biasId);
    }
    return this.state.biases[biasId];
  }

  getBiases(): Record<string, BiasEntry> {
    if (!(this.state && this.state.biases)) {
      return {};
    }
    return { ...this.state.biases };
  }

  getDeck(): BiasDeck {
    return this.deck;
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
  validate(strict = false): ValidationResult {
    const validator = new BiasActivityValidator(this, this.deck, { strict });
    return validator.validate();
  }

  // Check if activity can advance to next stage (delegates to validator)
  canAdvanceToNextStage(): boolean {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.canAdvanceToStage(this.state.currentStage + 1);
  }

  // Get validation warnings for current stage
  getStageWarnings(): string[] {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.getStageWarnings(this.state.currentStage);
  }

  // Get detailed progress metrics
  getProgressMetrics() {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.getProgressMetrics();
  }

  // Export
  export(): BiasActivityData {
    // Ensure state is initialized
    if (!this.state) {
      this.state = this.initializeState();
    }

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
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.getCompletionStatus();
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

  isStage1Complete(): boolean {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.isStage1Complete();
  }

  isStage2Complete(): boolean {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.isStage2Complete();
  }

  isStage3Complete(): boolean {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.isStage3Complete();
  }

  isStage4Complete(): boolean {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.isStage4Complete();
  }

  isStage5Complete(): boolean {
    const validator = new BiasActivityValidator(this, this.deck);
    return validator.isStage5Complete();
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

  // Legacy method - delegates to new canAdvanceToNextStage
  canAdvanceStage(): boolean {
    return this.canAdvanceToNextStage();
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
