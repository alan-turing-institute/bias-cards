import type { LifecycleStage } from '@/lib/types';
import { BaseCard, type CardData } from './BaseCard';

export interface MitigationCardData extends CardData {
  category: 'mitigation-technique';
  displayNumber?: string;
  applicableStages?: LifecycleStage[];
  tags?: string[];
}

export class MitigationCard extends BaseCard {
  readonly category = 'mitigation-technique' as const;
  readonly type = 'mitigation' as const;
  readonly displayNumber?: string;
  readonly applicableStages?: LifecycleStage[];
  readonly tags?: string[];

  constructor(data: MitigationCardData) {
    super(data);
    this.displayNumber = data.displayNumber;
    this.applicableStages = data.applicableStages;
    this.tags = data.tags;
  }

  validate(): boolean {
    return (
      typeof this.id === 'string' &&
      this.id.length > 0 &&
      typeof this.name === 'string' &&
      this.name.length > 0 &&
      typeof this.title === 'string' &&
      this.title.length > 0 &&
      typeof this.description === 'string' &&
      this.description.length > 0 &&
      typeof this.example === 'string' &&
      this.example.length > 0 &&
      Array.isArray(this.prompts) &&
      this.prompts.length > 0 &&
      typeof this.icon === 'string' &&
      this.icon.length > 0 &&
      typeof this.caption === 'string' &&
      this.caption.length > 0 &&
      this.category === 'mitigation-technique'
    );
  }

  getEffectiveness(): number {
    // Default effectiveness rating (1-5 scale)
    // This will be overridden when users provide ratings in activities
    return 3;
  }

  isApplicableToStage(stage: LifecycleStage): boolean {
    if (!this.applicableStages) {
      // If no stages specified, applicable to all
      return true;
    }
    return this.applicableStages.includes(stage);
  }

  toJSON(): MitigationCardData {
    return {
      ...super.toJSON(),
      category: 'mitigation-technique',
      displayNumber: this.displayNumber,
      applicableStages: this.applicableStages,
      tags: this.tags,
    };
  }
}
