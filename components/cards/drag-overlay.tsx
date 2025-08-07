'use client';

import { DragOverlay } from '@dnd-kit/core';
import type { Card } from '@/lib/types';
import { BiasCardList } from './bias-card-list';
import { MitigationCardList } from './mitigation-card-list';

interface CardDragOverlayProps {
  activeCard: Card | null;
}

export function CardDragOverlay({ activeCard }: CardDragOverlayProps) {
  if (!activeCard) {
    return null;
  }

  return (
    <DragOverlay>
      <div className="scale-95 cursor-grabbing opacity-90">
        {activeCard.category === 'mitigation-technique' ? (
          <MitigationCardList
            card={activeCard}
            cardNumber={
              activeCard.displayNumber || String(activeCard.id).padStart(2, '0')
            }
            className="shadow-2xl"
            showCategory={false}
          />
        ) : (
          <BiasCardList
            card={activeCard as any}
            cardNumber={
              activeCard.displayNumber || String(activeCard.id).padStart(2, '0')
            }
            className="shadow-2xl"
            showCategory={false}
          />
        )}
      </div>
    </DragOverlay>
  );
}
