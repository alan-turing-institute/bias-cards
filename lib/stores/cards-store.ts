import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  filterCards,
  findCardById,
  getCardsByIds,
  loadAllCards,
  searchCards,
  sortCardsByRelevance,
} from '@/lib/data';
import type {
  BiasCard,
  Card,
  MitigationCard,
  WorkspaceFilters,
} from '@/lib/types';

interface CardsState {
  // Data
  biasCards: BiasCard[];
  mitigationCards: MitigationCard[];
  allCards: Card[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Filters and search
  filters: WorkspaceFilters;
  searchQuery: string;
  filteredCards: Card[];

  // Actions
  loadCards: () => Promise<void>;
  setFilters: (filters: Partial<WorkspaceFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;

  // Getters
  getCardById: (id: string) => Card | undefined;
  getCardsByIds: (ids: string[]) => Card[];
  getBiasCards: () => BiasCard[];
  getMitigationCards: () => MitigationCard[];
}

const initialFilters: WorkspaceFilters = {
  category: undefined,
  stage: undefined,
  searchTerm: undefined,
  showOnlyAssigned: false,
  showOnlyPaired: false,
};

export const useCardsStore = create<CardsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        biasCards: [],
        mitigationCards: [],
        allCards: [],
        isLoading: false,
        error: null,
        filters: initialFilters,
        searchQuery: '',
        filteredCards: [],

        // Actions
        loadCards: async () => {
          set({ isLoading: true, error: null });

          try {
            const { biasCards, mitigationCards } = await loadAllCards();
            const allCards = [...biasCards, ...mitigationCards];

            set({
              biasCards,
              mitigationCards,
              allCards,
              filteredCards: allCards,
              isLoading: false,
            });

            // Apply current filters after loading
            get().applyFilters();
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to load cards';
            set({
              error: errorMessage,
              isLoading: false,
            });
          }
        },

        setFilters: (newFilters) => {
          const currentFilters = get().filters;
          const updatedFilters = { ...currentFilters, ...newFilters };

          set({ filters: updatedFilters });
          get().applyFilters();
        },

        setSearchQuery: (query) => {
          set({
            searchQuery: query,
            filters: { ...get().filters, searchTerm: query },
          });
          get().applyFilters();
        },

        clearFilters: () => {
          set({
            filters: initialFilters,
            searchQuery: '',
            filteredCards: get().allCards,
          });
        },

        // Apply filters to cards
        applyFilters: () => {
          const { allCards, filters, searchQuery } = get();
          let filtered = filterCards(allCards, filters);

          if (searchQuery.trim()) {
            filtered = sortCardsByRelevance(
              searchCards(filtered, searchQuery),
              searchQuery
            );
          }

          set({ filteredCards: filtered });
        },

        // Getters
        getCardById: (id: string) => {
          return findCardById(get().allCards, id);
        },

        getCardsByIds: (ids: string[]) => {
          return getCardsByIds(get().allCards, ids);
        },

        getBiasCards: () => {
          return get().biasCards;
        },

        getMitigationCards: () => {
          return get().mitigationCards;
        },
      }),
      {
        name: 'cards-store',
        partialize: (state) => ({
          biasCards: state.biasCards,
          mitigationCards: state.mitigationCards,
          allCards: state.allCards,
        }),
      }
    ),
    { name: 'cards-store' }
  )
);

// Add applyFilters as a private method
// This is a workaround since we can't define methods inside the store
const store = useCardsStore.getState();
(store as CardsState).applyFilters = () => {
  const state = useCardsStore.getState();
  const { allCards, filters, searchQuery } = state;
  let filtered = filterCards(allCards, filters);

  if (searchQuery.trim()) {
    filtered = sortCardsByRelevance(
      searchCards(filtered, searchQuery),
      searchQuery
    );
  }

  useCardsStore.setState({ filteredCards: filtered });
};
