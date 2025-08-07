'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Info, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  getCardIcon,
  getCardNumber,
  getCategoryColors,
} from '@/lib/config/card-config';
import { useCardsStore } from '@/lib/stores/cards-store';
import type { Card, StageAssignment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CardDetailsModalProps {
  card: Card | null;
  assignment?: StageAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveRationale: (rationale: string) => void;
}

export function CardDetailsModal({
  card,
  assignment,
  open,
  onOpenChange,
  onSaveRationale,
}: CardDetailsModalProps) {
  const [rationale, setRationale] = useState(assignment?.annotation || '');
  const [hasChanges, setHasChanges] = useState(false);
  const { biasCards, mitigationCards } = useCardsStore();

  if (!card) {
    return null;
  }

  const handleRationaleChange = (value: string) => {
    setRationale(value);
    setHasChanges(value !== (assignment?.annotation || ''));
  };

  const handleSave = () => {
    onSaveRationale(rationale);
    setHasChanges(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) {
        return;
      }
    }
    onOpenChange(newOpen);
    if (!newOpen) {
      setRationale(assignment?.annotation || '');
      setHasChanges(false);
    }
  };

  const allCards = [...biasCards, ...mitigationCards];
  const cardNumber = getCardNumber(card.id, allCards);
  const colors = getCategoryColors(card.category);
  const Icon = getCardIcon(card);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>{card.name} Details</DialogTitle>
          <DialogDescription>
            View detailed information about {card.name} and document your
            rationale for including it
          </DialogDescription>
        </VisuallyHidden>
        {/* Colored header section */}
        <div className={cn('relative', colors.bg)}>
          <div className="flex items-start p-6 text-white">
            {/* Number and Icon stacked vertically */}
            <div className="mr-6 flex flex-col items-center">
              <span className="mb-2 font-bold text-2xl">{cardNumber}</span>
              <div className="rounded-lg bg-white/20 p-3">
                <Icon className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Title and caption */}
            <div className="flex-1">
              <h2 className="font-bold text-2xl text-white">{card.name}</h2>
              <p className="mt-1 text-white/90">{card.caption}</p>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="p-6">
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className="flex items-center gap-2" value="info">
                <Info className="h-4 w-4" />
                Information
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2"
                value="rationale"
              >
                <MessageSquare className="h-4 w-4" />
                Rationale
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-4 space-y-4" value="info">
              <div>
                <h4 className="mb-2 font-semibold">Description</h4>
                <p className="text-muted-foreground text-sm">
                  {card.description}
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Example</h4>
                <p className="text-muted-foreground text-sm">{card.example}</p>
              </div>

              {card.prompts && card.prompts.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Discussion Prompts</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {card.prompts.map((prompt, index) => (
                      <li className="text-muted-foreground text-sm" key={index}>
                        {prompt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent className="mt-4 space-y-4" value="rationale">
              <div>
                <Label htmlFor="rationale">
                  Document your rationale for including this{' '}
                  {card.category.includes('bias') ? 'bias' : 'mitigation'} in
                  this stage
                </Label>
                <Textarea
                  className="mt-2 min-h-[200px]"
                  id="rationale"
                  onChange={(e) => handleRationaleChange(e.target.value)}
                  placeholder="Explain why this card is relevant to this lifecycle stage and how it might impact your project..."
                  value={rationale}
                />
                <p className="mt-2 text-muted-foreground text-sm">
                  This documentation will be included in your final report and
                  helps demonstrate thorough analysis.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button onClick={() => handleOpenChange(false)} variant="outline">
              Cancel
            </Button>
            {hasChanges && <Button onClick={handleSave}>Save Rationale</Button>}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
