import type { BaseCard } from './BaseCard';

export interface DeckMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  categories: string[] | Record<string, any>; // Allow both array and object format
  created?: string;
  lastModified?: string;
}

export interface DeckStatistics {
  totalCards: number;
  cardsByCategory: Record<string, number>;
  cardsByType: Record<string, number>;
}

export interface DeckData {
  metadata: DeckMetadata;
  cards: unknown[];
}

export abstract class Deck<T extends BaseCard> {
  protected cards: Map<string, T>;
  protected metadata: DeckMetadata;

  constructor(metadata: DeckMetadata) {
    this.metadata = metadata;
    this.cards = new Map();
  }

  // Core abstract methods
  abstract load(): Promise<void>;
  abstract validate(): boolean;

  // Common operations
  getCard(id: string): T | undefined {
    return this.cards.get(id);
  }

  getAllCards(): T[] {
    return Array.from(this.cards.values());
  }

  getCardsByCategory(category: string): T[] {
    return this.getAllCards().filter((card) => card.category === category);
  }

  searchCards(query: string): T[] {
    if (!query || query.trim() === '') {
      return this.getAllCards();
    }
    return this.getAllCards().filter((card) => card.matches(query));
  }

  filterCards(predicate: (card: T) => boolean): T[] {
    return this.getAllCards().filter(predicate);
  }

  // Metadata
  getMetadata(): DeckMetadata {
    return { ...this.metadata };
  }

  getVersion(): string {
    return this.metadata.version;
  }

  getCategories(): string[] {
    if (Array.isArray(this.metadata.categories)) {
      return [...this.metadata.categories];
    }
    return Object.keys(this.metadata.categories);
  }

  getStatistics(): DeckStatistics {
    const cards = this.getAllCards();
    const cardsByCategory: Record<string, number> = {};
    const cardsByType: Record<string, number> = {};

    for (const card of cards) {
      // Count by category
      if (card.category) {
        cardsByCategory[card.category] =
          (cardsByCategory[card.category] || 0) + 1;
      }

      // Count by type
      if (card.type) {
        cardsByType[card.type] = (cardsByType[card.type] || 0) + 1;
      }
    }

    return {
      totalCards: cards.length,
      cardsByCategory,
      cardsByType,
    };
  }

  // Export/Import
  toJSON(): DeckData {
    const cards = this.getAllCards().map((card) => card.toJSON());
    return {
      metadata: this.getMetadata(),
      cards,
    };
  }

  // Utility methods
  hasCard(id: string): boolean {
    return this.cards.has(id);
  }

  size(): number {
    return this.cards.size;
  }

  isEmpty(): boolean {
    return this.cards.size === 0;
  }

  clear(): void {
    this.cards.clear();
  }

  // Add card to deck (protected to be used by subclasses during loading)
  protected addCard(card: T): void {
    if (card.validate()) {
      this.cards.set(card.id, card);
    } else {
      console.warn(`Invalid card skipped: ${card.id}`);
    }
  }

  // Remove card from deck (protected for potential future use)
  protected removeCard(id: string): boolean {
    return this.cards.delete(id);
  }
}
