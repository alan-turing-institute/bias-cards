import type { BiasCategory, LifecycleStage } from '@/lib/types';
import { BiasCard, type BiasCardData } from '../bias-card';
import { Deck } from '../deck';
import { MitigationCard, type MitigationCardData } from '../mitigation-card';

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
      const deckData = await import('@/app/data/decks/bias-deck.json');
      this.loadBiasCards(deckData);
      this.loadMitigationCards(deckData);
      this.updateMetadata(deckData);
    } catch (_error) {
      await this.loadFromLegacyFiles();
    }
  }

  private loadBiasCards(deckData: { biasCards?: unknown }): void {
    if (deckData.biasCards && Array.isArray(deckData.biasCards)) {
      for (const cardData of deckData.biasCards) {
        const card = new BiasCard({
          ...cardData,
          id: cardData.title || String(cardData.id), // Use slug title as ID
          displayNumber: cardData.id, // Keep numeric ID for display only
          category: cardData.category as BiasCategory,
        } as BiasCardData);
        if (card.validate()) {
          this.addCard(card);
        }
      }
    }
  }

  private loadMitigationCards(deckData: { mitigationCards?: unknown }): void {
    if (deckData.mitigationCards && Array.isArray(deckData.mitigationCards)) {
      for (const cardData of deckData.mitigationCards) {
        const card = new MitigationCard({
          ...cardData,
          id: cardData.title || String(cardData.id), // Use slug title as ID
          displayNumber: cardData.id, // Keep numeric ID for display only
          category: 'mitigation-technique' as const,
          applicableStages: cardData.applicableStages as LifecycleStage[],
        } as MitigationCardData);
        if (card.validate()) {
          this.addCard(card);
        }
      }
    }
  }

  private updateMetadata(deckData: { metadata?: unknown }): void {
    if (deckData.metadata) {
      this.metadata = {
        ...this.metadata,
        ...deckData.metadata,
      };
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
          tags: this.generateTags(
            legacyCard as { category?: string; name?: string }
          ),
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
          tags: this.generateTags(
            legacyCard as { category?: string; name?: string }
          ),
        });
        if (card.validate()) {
          this.addCard(card);
        }
      }
    } catch (_error) {
      throw new Error('Could not load card data from any source');
    }
  }

  private generateTags(card: {
    category?: string;
    name?: string;
    [key: string]: unknown;
  }): string[] {
    const tags: string[] = [];

    // Add category as a tag
    if (card.category) {
      tags.push(card.category.replace('-', ' '));
    }

    // Extract keywords from name
    if (card.name && typeof card.name === 'string') {
      const nameWords = card.name.toLowerCase().split(' ');
      tags.push(...nameWords.filter((word: string) => word.length > 3));
    }

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
      return false;
    }

    const invalidCards = this.getAllCards().filter((card) => !card.validate());
    if (invalidCards.length > 0) {
      // Invalid cards found - validation failed
      return false;
    }

    return true;
  }

  // Reset singleton (useful for testing)
  static reset(): void {
    BiasDeck.instance = null;
  }
}
