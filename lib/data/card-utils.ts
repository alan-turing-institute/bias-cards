import type {
  BiasCard,
  Card,
  LifecycleStage,
  MitigationCard,
  WorkspaceFilters,
} from '@/lib/types';

export function filterCards(cards: Card[], filters: WorkspaceFilters): Card[] {
  let filteredCards = [...cards];

  // Category filter
  if (filters.category) {
    filteredCards = filteredCards.filter(
      (card) => card.category === filters.category
    );
  }

  // Search term filter
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    filteredCards = filteredCards.filter(
      (card) =>
        card.name.toLowerCase().includes(searchTerm) ||
        card.caption.toLowerCase().includes(searchTerm) ||
        card.description.toLowerCase().includes(searchTerm) ||
        card.example.toLowerCase().includes(searchTerm) ||
        card.prompts.some((prompt) => prompt.toLowerCase().includes(searchTerm))
    );
  }

  return filteredCards;
}

export function searchCards(cards: Card[], query: string): Card[] {
  if (!query.trim()) {
    return cards;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  return cards.filter((card) => {
    const searchableText = [
      card.name,
      card.caption,
      card.description,
      card.example,
      ...card.prompts,
    ]
      .join(' ')
      .toLowerCase();

    // Check if all query words are found in the searchable text
    return queryWords.every((word) => searchableText.includes(word));
  });
}

export function groupCardsByCategory(cards: Card[]): Record<string, Card[]> {
  return cards.reduce(
    (groups, card) => {
      const category = card.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(card);
      return groups;
    },
    {} as Record<string, Card[]>
  );
}

export function getBiasCards(cards: Card[]): BiasCard[] {
  return cards.filter(
    (card): card is BiasCard =>
      card.category === 'cognitive-bias' ||
      card.category === 'social-bias' ||
      card.category === 'statistical-bias'
  );
}

export function getMitigationCards(cards: Card[]): MitigationCard[] {
  return cards.filter(
    (card): card is MitigationCard => card.category === 'mitigation-technique'
  );
}

export function findCardById(cards: Card[], id: string): Card | undefined {
  return cards.find((card) => card.id === id);
}

export function getCardsByIds(cards: Card[], ids: string[]): Card[] {
  return ids.map((id) => findCardById(cards, id)).filter(Boolean) as Card[];
}

export function getUniqueCategories(cards: Card[]): string[] {
  const categories = new Set(cards.map((card) => card.category));
  return Array.from(categories).sort();
}

export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'cognitive-bias': 'Cognitive Bias',
    'social-bias': 'Social Bias',
    'statistical-bias': 'Statistical Bias',
    'mitigation-technique': 'Mitigation Technique',
  };

  return categoryNames[category] || category;
}

export function getLifecycleStageDisplayName(stage: LifecycleStage): string {
  // Import from lifecycle-constants to ensure consistency
  const { LIFECYCLE_STAGES } = require('./lifecycle-constants');
  return LIFECYCLE_STAGES[stage]?.name || stage;
}

export function getCardRelevanceScore(card: Card, query: string): number {
  if (!query.trim()) {
    return 0;
  }

  const normalizedQuery = query.toLowerCase();
  let score = 0;

  // Higher scores for matches in more important fields
  if (card.name.toLowerCase().includes(normalizedQuery)) {
    score += 10;
  }
  if (card.caption.toLowerCase().includes(normalizedQuery)) {
    score += 5;
  }
  if (card.description.toLowerCase().includes(normalizedQuery)) {
    score += 3;
  }
  if (card.example.toLowerCase().includes(normalizedQuery)) {
    score += 2;
  }

  card.prompts.forEach((prompt) => {
    if (prompt.toLowerCase().includes(normalizedQuery)) {
      score += 1;
    }
  });

  return score;
}

export function sortCardsByRelevance(cards: Card[], query: string): Card[] {
  if (!query.trim()) {
    return cards;
  }

  return [...cards].sort((a, b) => {
    const scoreA = getCardRelevanceScore(a, query);
    const scoreB = getCardRelevanceScore(b, query);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Fallback to alphabetical sorting
    return a.name.localeCompare(b.name);
  });
}
