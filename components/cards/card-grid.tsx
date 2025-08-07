'use client';

import { useState } from 'react';
import type {
  BiasCard as BiasCardType,
  Card,
  MitigationCard as MitigationCardType,
} from '@/lib/types/cards';
import { cn } from '@/lib/utils';
import { BiasCard } from './bias-card';
import { CardModal } from './card-modal';
import { MitigationCard } from './mitigation-card';

interface CardGridProps {
  cards: Card[];
  variant?: 'compact' | 'standard' | 'expanded';
  columns?: 1 | 2 | 3 | 4;
  showCategory?: boolean;
  showPrompts?: boolean;
  onCardClick?: (card: Card) => void;
  onAddToWorkspace?: (card: Card) => void;
  onRemoveFromWorkspace?: (card: Card) => void;
  workspaceCardIds?: string[];
  className?: string;
}

export function CardGrid({
  cards,
  variant = 'standard',
  columns = 3,
  showCategory = true,
  showPrompts = false,
  onCardClick,
  onAddToWorkspace,
  onRemoveFromWorkspace,
  workspaceCardIds = [],
  className,
}: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (card: Card) => {
    if (onCardClick) {
      onCardClick(card);
    } else {
      // Default behavior: open modal
      setSelectedCard(card);
      setModalOpen(true);
    }
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const renderCard = (card: Card) => {
    const isInWorkspace = workspaceCardIds.includes(card.id);
    const commonProps = {
      variant,
      showCategory,
      showPrompts,
      onClick: () => handleCardClick(card),
      className: cn(
        'transition-all duration-200',
        isInWorkspace && 'ring-2 ring-green-500 ring-opacity-50'
      ),
    };

    if (card.category === 'mitigation-technique') {
      return (
        <MitigationCard
          key={card.id}
          {...commonProps}
          card={card as MitigationCardType}
        />
      );
    }
    return (
      <BiasCard key={card.id} {...commonProps} card={card as BiasCardType} />
    );
  };

  if (cards.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="font-medium text-lg">No cards found</p>
          <p className="text-sm">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'grid auto-rows-min gap-6',
          columnClasses[columns],
          className
        )}
      >
        {cards.map(renderCard)}
      </div>

      {/* Card detail modal */}
      <CardModal
        card={selectedCard}
        isInWorkspace={
          selectedCard ? workspaceCardIds.includes(selectedCard.id) : false
        }
        onAddToWorkspace={onAddToWorkspace}
        onOpenChange={setModalOpen}
        onRemoveFromWorkspace={onRemoveFromWorkspace}
        open={modalOpen}
      />
    </>
  );
}
