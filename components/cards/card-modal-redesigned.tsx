'use client';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { Card } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface CardModalRedesignedProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToWorkspace?: (card: Card) => void;
  onRemoveFromWorkspace?: (card: Card) => void;
  isInWorkspace?: boolean;
}

export function CardModalRedesigned({
  card,
  open,
  onOpenChange,
  onAddToWorkspace,
  onRemoveFromWorkspace,
  isInWorkspace = false,
}: CardModalRedesignedProps) {
  if (!card) {
    return null;
  }

  const IconComponent = getCardIcon(card);
  const colors = getCategoryColors(card.category);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogTitle className="sr-only">{card.name}</DialogTitle>

        {/* Header with icon and title */}
        <div className={cn('relative p-8', colors.bg)}>
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/20">
              <IconComponent className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-3xl text-white">{card.name}</h2>
              <p className="mt-1 text-white/80">
                {card.category
                  .replace('-', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-8 p-8">
            {/* Caption */}
            <div className="text-gray-600 text-lg leading-relaxed">
              {card.caption}
            </div>

            {/* Description */}
            <div>
              <h3 className={cn('mb-3 font-semibold text-xl', colors.text)}>
                Description
              </h3>
              <div className={cn('border-l-4 pl-4', colors.border)}>
                <p className="text-gray-700 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Example */}
            {card.example && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                  Example
                </h3>
                <div className="rounded-lg bg-gray-50 p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {card.example}
                  </p>
                </div>
              </div>
            )}

            {/* Prompts */}
            {card.prompts && card.prompts.length > 0 && (
              <div>
                <h3 className="mb-4 font-semibold text-gray-900 text-xl">
                  {card.category === 'mitigation-technique'
                    ? 'Implementation Guidance'
                    : 'Deliberative Prompts'}
                </h3>
                <ul className="space-y-3">
                  {card.prompts.map((prompt, index) => (
                    <li className="flex gap-3" key={index}>
                      <ChevronRight
                        className={cn(
                          'mt-0.5 h-5 w-5 flex-shrink-0',
                          colors.text
                        )}
                      />
                      <span className="text-gray-700 leading-relaxed">
                        {prompt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Workspace actions */}
            {(onAddToWorkspace || onRemoveFromWorkspace) && (
              <div className="flex gap-3 border-t pt-4">
                {onAddToWorkspace && !isInWorkspace && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onAddToWorkspace(card)}
                  >
                    Add to Workspace
                  </Button>
                )}
                {onRemoveFromWorkspace && isInWorkspace && (
                  <Button
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => onRemoveFromWorkspace(card)}
                    variant="outline"
                  >
                    Remove from Workspace
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
