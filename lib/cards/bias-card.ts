import type { BiasCategory, BiasRiskCategory } from '@/lib/types';
import { BaseCard, type CardData } from './base-card';

const BIAS_CATEGORIES: BiasCategory[] = [
  'cognitive-bias',
  'social-bias',
  'statistical-bias',
];

export interface BiasCardData extends CardData {
  category: BiasCategory;
  displayNumber?: string;
  tags?: string[];
}

export class BiasCard extends BaseCard {
  readonly category: BiasCategory;
  readonly type = 'bias' as const;
  readonly displayNumber?: string;
  readonly tags?: string[];

  constructor(data: BiasCardData) {
    super(data);
    this.category = data.category;
    this.displayNumber = data.displayNumber;
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
      BIAS_CATEGORIES.includes(this.category)
    );
  }

  getRiskLevel(): BiasRiskCategory | null {
    // This will be set by the BiasActivity when the user assigns risk levels
    // For now, return null as the default
    return null;
  }

  toJSON(): BiasCardData {
    return {
      ...super.toJSON(),
      category: this.category,
      displayNumber: this.displayNumber,
      tags: this.tags,
    };
  }
}
