import type { BaseCard } from '@/lib/cards/base-card';
import type { Deck } from '@/lib/cards/deck';

export interface ActivityMetadata {
  id?: string;
  name: string;
  description?: string;
  createdBy?: string;
  tags?: string[];
}

export interface ActivityState {
  currentStage: number;
  completedStages: number[];
  startTime: string;
  lastModified: string;
  [key: string]: unknown; // Allow extending state with additional properties
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  type: 'deck' | 'progression' | 'reference' | 'data' | 'other';
  message: string;
  biasId?: string;
  stage?: number;
  field?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  suggestion?: string;
}

export interface ActivityData {
  id: string;
  name: string;
  description?: string;
  state: ActivityState;
  metadata: ActivityMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

function generateId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export abstract class Activity {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  protected deck: Deck<BaseCard>;
  protected state: ActivityState;
  protected metadata: ActivityMetadata;

  constructor(deck: Deck<BaseCard>, metadata: ActivityMetadata) {
    this.deck = deck;
    this.id = metadata.id || generateId();
    this.name = metadata.name;
    this.description = metadata.description;
    this.metadata = metadata;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.state = this.initializeState();
  }

  // Abstract methods that must be implemented by subclasses
  abstract initializeState(): ActivityState;
  abstract getCurrentStage(): number;
  abstract advanceStage(): void;
  abstract isComplete(): boolean;
  abstract validate(): ValidationResult;
  abstract export(): ActivityData;
  abstract generateReport(): unknown; // Will be typed as Report once created

  // Common methods
  updateState(updates: Partial<ActivityState>): void {
    this.state = {
      ...this.state,
      ...updates,
      lastModified: new Date().toISOString(),
    };
    this.updatedAt = new Date();
  }

  getState(): ActivityState {
    return { ...this.state };
  }

  save(): void {
    // Implementation would depend on persistence layer
    // For now, this is a placeholder
    const data = this.export();
    // localStorage or other persistence mechanism
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = `activity-${this.id}`;
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  }

  load(data: ActivityData): void {
    this.state = data.state;
    this.updatedAt = new Date(data.updatedAt);
    if (data.completedAt) {
      this.completedAt = new Date(data.completedAt);
    }
  }

  getDeck(): Deck<BaseCard> {
    return this.deck;
  }

  getMetadata(): ActivityMetadata {
    return { ...this.metadata };
  }

  markComplete(): void {
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  isExpired(maxAge?: number): boolean {
    if (!maxAge) {
      return false;
    }
    const age = Date.now() - this.createdAt.getTime();
    return age > maxAge;
  }

  getDuration(): number {
    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.createdAt.getTime();
  }

  getProgress(): number {
    const totalStages = this.getTotalStages();
    const completedStages = this.state.completedStages?.length || 0;
    return totalStages > 0 ? (completedStages / totalStages) * 100 : 0;
  }

  protected getTotalStages(): number {
    // Default implementation, can be overridden
    return 5; // Default to 5 stages for bias assessment
  }

  protected generateExportData(): ActivityData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      state: this.getState(),
      metadata: this.getMetadata(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
    };
  }
}
