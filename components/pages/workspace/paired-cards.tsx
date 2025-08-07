'use client';

import { Edit3, Link, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EffectivenessRating } from '@/components/ui/effectiveness-rating';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { CardPair } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PairedCardsProps {
  biasId: string;
  className?: string;
}

interface PairEditDialogProps {
  pair: CardPair;
  biasName: string;
  mitigationName: string;
  onSave: (effectivenessRating?: number, annotation?: string) => void;
  onDelete: () => void;
  trigger: React.ReactNode;
}

function PairEditDialog({
  pair,
  biasName,
  mitigationName,
  onSave,
  onDelete,
  trigger,
}: PairEditDialogProps) {
  const [effectivenessRating, setEffectivenessRating] = useState(
    pair.effectivenessRating || 1
  );
  const [annotation, setAnnotation] = useState(pair.annotation || '');
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(effectivenessRating, annotation.trim() || undefined);
    setOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pair</DialogTitle>
          <DialogDescription>
            Modify the effectiveness rating and annotation for this
            bias-mitigation pair.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pair Summary */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge className="font-medium" variant="outline">
                {biasName}
              </Badge>
              <Link className="h-4 w-4 text-muted-foreground" />
              <Badge className="font-medium" variant="outline">
                {mitigationName}
              </Badge>
            </div>
          </div>

          {/* Effectiveness Rating */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              htmlFor="effectiveness-rating"
            >
              Effectiveness Rating
            </label>
            <div className="flex items-center gap-3">
              <EffectivenessRating
                id="effectiveness-rating"
                onChange={setEffectivenessRating}
                size="lg"
                value={effectivenessRating}
              />
              <span className="text-muted-foreground text-sm">
                {effectivenessRating}/5
              </span>
            </div>
          </div>

          {/* Annotation */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              htmlFor="annotation-textarea"
            >
              Annotation{' '}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="annotation-textarea"
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="Add notes about this pairing..."
              rows={3}
              value={annotation}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button onClick={handleDelete} size="sm" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Pair
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => setOpen(false)} size="sm" variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PairedCards({ biasId, className }: PairedCardsProps) {
  const { biasCards, mitigationCards } = useCardsStore();
  const { getPairsForBias, updateCardPair, removeCardPair } =
    useWorkspaceStore();

  const bias = biasCards.find((b) => b.id === biasId);
  const pairs = getPairsForBias(biasId);

  if (!bias || pairs.length === 0) {
    return null;
  }

  const handleUpdatePair = (
    pair: CardPair,
    effectivenessRating?: number,
    annotation?: string
  ) => {
    updateCardPair(pair.biasId, pair.mitigationId, {
      effectivenessRating,
      annotation,
    });
  };

  const handleDeletePair = (pair: CardPair) => {
    removeCardPair(pair.biasId, pair.mitigationId);
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-4 flex items-center gap-2">
        <Link className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold">Paired Mitigations</h3>
        <Badge className="ml-auto" variant="secondary">
          {pairs.length} {pairs.length === 1 ? 'pair' : 'pairs'}
        </Badge>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {pairs.map((pair) => {
            const mitigation = mitigationCards.find(
              (m) => m.id === pair.mitigationId
            );

            if (!mitigation) {
              return null;
            }

            return (
              <div
                className="rounded-lg border bg-blue-50 p-3 transition-all hover:bg-blue-100"
                key={`${pair.biasId}-${pair.mitigationId}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{mitigation.name}</h4>
                    </div>
                    <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                      {mitigation.caption}
                    </p>
                    {pair.annotation && (
                      <p className="mt-2 text-blue-700 text-xs italic">
                        "{pair.annotation}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <EffectivenessRating
                      readonly
                      size="sm"
                      value={pair.effectivenessRating || 1}
                    />

                    <PairEditDialog
                      biasName={bias.name}
                      mitigationName={mitigation.name}
                      onDelete={() => handleDeletePair(pair)}
                      onSave={(rating, annotation) =>
                        handleUpdatePair(pair, rating, annotation)
                      }
                      pair={pair}
                      trigger={
                        <Button
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                          size="sm"
                          variant="ghost"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-4 border-t pt-4">
        <p className="text-muted-foreground text-xs">
          Click the edit icon to modify effectiveness ratings and add
          annotations.
        </p>
      </div>
    </Card>
  );
}
