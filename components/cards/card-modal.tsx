'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Card } from '@/lib/types/cards';
import { BiasCard } from './bias-card';
import { MitigationCard } from './mitigation-card';

interface CardModalProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToWorkspace?: (card: Card) => void;
  onRemoveFromWorkspace?: (card: Card) => void;
  isInWorkspace?: boolean;
}

export function CardModal({
  card,
  open,
  onOpenChange,
  onAddToWorkspace,
  onRemoveFromWorkspace,
  isInWorkspace = false,
}: CardModalProps) {
  if (!card) {
    return null;
  }

  const renderCard = () => {
    if (card.category === 'mitigation-technique') {
      return <MitigationCard card={card} className="h-auto" />;
    }
    return <BiasCard card={card} cardNumber="01" className="h-auto" />;
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>{card.name}</DialogTitle>
          <DialogDescription>
            View detailed information about {card.name}
          </DialogDescription>
        </VisuallyHidden>
        <div className="relative">
          {/* Full card display */}
          {renderCard()}

          {/* Close button overlay */}
          <Button
            aria-label="Close modal"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 p-0 shadow-lg hover:bg-white"
            onClick={() => onOpenChange(false)}
            variant="ghost"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>

          {/* Workspace actions */}
          {(onAddToWorkspace || onRemoveFromWorkspace) && (
            <div className="absolute right-4 bottom-4 flex gap-2">
              {onAddToWorkspace && !isInWorkspace && (
                <Button
                  className="bg-green-600 shadow-lg hover:bg-green-700"
                  onClick={() => onAddToWorkspace(card)}
                >
                  Add to Workspace
                </Button>
              )}
              {onRemoveFromWorkspace && isInWorkspace && (
                <Button
                  className="border-red-200 bg-white text-red-600 shadow-lg hover:bg-red-50"
                  onClick={() => onRemoveFromWorkspace(card)}
                  variant="outline"
                >
                  Remove from Workspace
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
