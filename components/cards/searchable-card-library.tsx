'use client';

import {
  LayoutGrid,
  LayoutList,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Card, CardCategory } from '@/lib/types/cards';
import { cn } from '@/lib/utils';
import { CardGrid } from './card-grid';
import { CategoryFilter } from './category-filter';

interface SearchableCardLibraryProps {
  cards: Card[];
  onAddToWorkspace?: (card: Card) => void;
  onRemoveFromWorkspace?: (card: Card) => void;
  workspaceCardIds?: string[];
  title?: string;
  description?: string;
  className?: string;
}

export function SearchableCardLibrary({
  cards,
  onAddToWorkspace,
  onRemoveFromWorkspace,
  workspaceCardIds = [],
  title = 'Card Library',
  description = 'Browse and explore bias cards and mitigation strategies',
  className,
}: SearchableCardLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CardCategory[]>(
    []
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate category counts for all cards
  const categoryCounts = useMemo(() => {
    const counts: Record<CardCategory, number> = {
      'cognitive-bias': 0,
      'social-bias': 0,
      'statistical-bias': 0,
      'mitigation-technique': 0,
    };

    for (const card of cards) {
      counts[card.category as CardCategory] =
        (counts[card.category as CardCategory] || 0) + 1;
    }

    return counts;
  }, [cards]);

  // Filter and search logic
  const filteredCards = useMemo(() => {
    let result = cards;

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((card) =>
        selectedCategories.includes(card.category as CardCategory)
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(searchLower) ||
          card.caption.toLowerCase().includes(searchLower) ||
          card.description.toLowerCase().includes(searchLower) ||
          card.example?.toLowerCase().includes(searchLower) ||
          card.prompts?.some((prompt) =>
            prompt.toLowerCase().includes(searchLower)
          )
      );
    }

    return result;
  }, [cards, selectedCategories, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSearchTerm('');
  }, []);

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedCategories.length > 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl text-gray-900 tracking-tight">
          {title}
        </h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Search and filters bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
            <Input
              className="pr-10 pl-10"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cards by name, description, or content..."
              value={searchTerm}
            />
            {searchTerm && (
              <Button
                className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7 transform p-0"
                onClick={clearSearch}
                size="sm"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* View and filter controls */}
          <div className="flex gap-2">
            <Button
              className={cn(
                'flex items-center gap-2',
                (selectedCategories.length > 0 || showFilters) &&
                  'border-blue-200 bg-blue-50'
              )}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              variant="outline"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {selectedCategories.length > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs" variant="secondary">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>

            <div className="flex rounded-md border border-gray-200">
              <Button
                className="rounded-r-none border-r"
                onClick={() => setViewMode('grid')}
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category filters - collapsible */}
        {showFilters && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <CategoryFilter
              categoryCounts={categoryCounts}
              onCategoryChange={setSelectedCategories}
              selectedCategories={selectedCategories}
              showCounts={true}
            />
          </div>
        )}

        {/* Results summary and clear filters */}
        <div className="flex items-center justify-between">
          <div className="text-gray-600 text-sm">
            Showing <span className="font-medium">{filteredCards.length}</span>{' '}
            of <span className="font-medium">{cards.length}</span> cards
            {workspaceCardIds.length > 0 && (
              <span className="ml-3 text-green-600">
                {workspaceCardIds.length} in workspace
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              className="text-gray-500 hover:text-gray-700"
              onClick={clearFilters}
              size="sm"
              variant="ghost"
            >
              <X className="mr-1 h-3 w-3" />
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      {/* Cards display */}
      <CardGrid
        cards={filteredCards}
        className={viewMode === 'list' ? 'space-y-4' : ''}
        columns={viewMode === 'list' ? 1 : 3}
        onAddToWorkspace={onAddToWorkspace}
        onRemoveFromWorkspace={onRemoveFromWorkspace}
        showCategory={true}
        showPrompts={viewMode === 'list'}
        variant={viewMode === 'list' ? 'compact' : 'standard'}
        workspaceCardIds={workspaceCardIds}
      />
    </div>
  );
}
