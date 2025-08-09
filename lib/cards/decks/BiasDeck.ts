import type { BiasCategory, LifecycleStage } from '@/lib/types';
import type { BaseCard } from '../BaseCard';
import { BiasCard, type BiasCardData } from '../BiasCard';
import { Deck } from '../Deck';
import { MitigationCard, type MitigationCardData } from '../MitigationCard';

type BiasDeckCard = BiasCard | MitigationCard;

export class BiasDeck extends Deck<BiasDeckCard> {
  private static instance: BiasDeck | null = null;

  private constructor() {
    super({
      id: 'bias-deck-v1',
      name: 'Bias and Mitigation Cards',
      version: '1.0.0',
      description: 'Core deck for bias identification and mitigation',
      categories: [
        'cognitive-bias',
        'social-bias',
        'statistical-bias',
        'mitigation-technique',
      ],
    });
  }

  static async getInstance(): Promise<BiasDeck> {
    if (!BiasDeck.instance) {
      BiasDeck.instance = new BiasDeck();
      await BiasDeck.instance.load();
    }
    return BiasDeck.instance;
  }

  async load(): Promise<void> {
    try {
      // Import the deck data
      const deckData = await import('@/app/data/decks/bias-deck.json');

      // Load bias cards
      if (deckData.biasCards && Array.isArray(deckData.biasCards)) {
        for (const cardData of deckData.biasCards) {
          const card = new BiasCard({
            ...cardData,
            id: String(cardData.id), // Ensure ID is a string
            category: cardData.category as BiasCategory,
          } as BiasCardData);
          if (card.validate()) {
            this.addCard(card);
          }
        }
      }

      // Load mitigation cards
      if (deckData.mitigationCards && Array.isArray(deckData.mitigationCards)) {
        for (const cardData of deckData.mitigationCards) {
          const card = new MitigationCard({
            ...cardData,
            id: String(cardData.id), // Ensure ID is a string
            category: 'mitigation-technique' as const,
            applicableStages: cardData.applicableStages as LifecycleStage[],
          } as MitigationCardData);
          if (card.validate()) {
            this.addCard(card);
          }
        }
      }

      // Update metadata if provided
      if (deckData.metadata) {
        this.metadata = {
          ...this.metadata,
          ...deckData.metadata,
        };
      }
    } catch (error) {
      console.error('Failed to load BiasDeck:', error);
      // Fallback to loading from individual files if deck doesn't exist yet
      await this.loadFromLegacyFiles();
    }
  }

  private async loadFromLegacyFiles(): Promise<void> {
    try {
      // Use the existing card loader as fallback
      const { loadAllCards } = await import('@/lib/data/card-loader');
      const { biasCards, mitigationCards } = await loadAllCards();

      // Convert and add bias cards
      for (const legacyCard of biasCards) {
        const card = new BiasCard({
          ...legacyCard,
          id: legacyCard.id,
          tags: this.generateTags(legacyCard),
        });
        if (card.validate()) {
          this.addCard(card);
        }
      }

      // Convert and add mitigation cards
      for (const legacyCard of mitigationCards) {
        const card = new MitigationCard({
          ...legacyCard,
          id: legacyCard.id,
          category: 'mitigation-technique' as const,
          tags: this.generateTags(legacyCard),
        });
        if (card.validate()) {
          this.addCard(card);
        }
      }
    } catch (error) {
      console.error('Failed to load from legacy files:', error);
      throw new Error('Could not load card data from any source');
    }
  }

  private generateTags(card: any): string[] {
    const tags: string[] = [];

    // Add category as a tag
    if (card.category) {
      tags.push(card.category.replace('-', ' '));
    }

    // Extract keywords from name
    const nameWords = card.name.toLowerCase().split(' ');
    tags.push(...nameWords.filter((word: string) => word.length > 3));

    return [...new Set(tags)]; // Remove duplicates
  }

  getBiasCards(): BiasCard[] {
    const cards = this.getAllCards();
    return cards.filter((card): card is BiasCard => card.type === 'bias');
  }

  getMitigationCards(): MitigationCard[] {
    const cards = this.getAllCards();
    return cards.filter(
      (card): card is MitigationCard => card.type === 'mitigation'
    );
  }

  getBiasCardsByCategory(category: string): BiasCard[] {
    return this.getBiasCards().filter((card) => card.category === category);
  }

  getCardByTitle(title: string): BiasDeckCard | undefined {
    return this.getAllCards().find((card) => card.title === title);
  }

  validate(): boolean {
    if (this.cards.size === 0) {
      console.warn('BiasDeck validation failed: No cards loaded');
      return false;
    }

    const invalidCards = this.getAllCards().filter((card) => !card.validate());
    if (invalidCards.length > 0) {
      console.warn(
        `BiasDeck validation failed: ${invalidCards.length} invalid cards found`
      );
      invalidCards.forEach((card) => {
        console.warn(`  - Invalid card: ${card.id} (${card.name})`);
      });
      return false;
    }

    return true;
  }

  // Reset singleton (useful for testing)
  static reset(): void {
    BiasDeck.instance = null;
  }
}
