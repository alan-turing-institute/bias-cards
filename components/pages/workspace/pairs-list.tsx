'use client';

import { Link2Off, Trash2 } from 'lucide-react';
import { BiasCardCompact } from '@/components/cards/bias-card-compact';
import { MitigationCard } from '@/components/cards/mitigation-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EffectivenessRating } from '@/components/ui/effectiveness-rating';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { cn } from '@/lib/utils';

interface PairsListProps {
  className?: string;
}

export function PairsList({ className }: PairsListProps) {
  const { biasCards, mitigationCards } = useCardsStore();
  const { cardPairs, removeCardPair, updateCardPair } = useWorkspaceStore();

  if (cardPairs.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <Link2Off className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 font-semibold text-lg">No Pairs Created</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          Enter pairing mode and select a bias card to see mitigation
          suggestions
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Active Pairs</h3>
        <Badge variant="secondary">{cardPairs.length} pairs</Badge>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {cardPairs.map((pair) => {
            const bias = biasCards.find((b) => b.id === pair.biasId);
            const mitigation = mitigationCards.find(
              (m) => m.id === pair.mitigationId
            );

            if (!(bias && mitigation)) {
              return null;
            }

            return (
              <div
                className="space-y-3 rounded-lg border bg-gray-50 p-4"
                key={`${pair.biasId}-${pair.mitigationId}`}
              >
                {/* Bias Card */}
                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground text-xs">
                    BIAS
                  </div>
                  <BiasCardCompact card={bias} />
                </div>

                {/* Connection indicator */}
                <div className="flex justify-center">
                  <div className="h-8 w-0.5 bg-amber-300" />
                </div>

                {/* Mitigation Card */}
                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground text-xs">
                    MITIGATION
                  </div>
                  <MitigationCard
                    card={mitigation}
                    effectiveness={pair.effectivenessRating}
                    variant="compact"
                  />
                </div>

                {/* Effectiveness Rating */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="space-y-1">
                    <div className="font-medium text-xs">Effectiveness</div>
                    <EffectivenessRating
                      onChange={(value) =>
                        updateCardPair(pair.biasId, pair.mitigationId, {
                          effectivenessRating: value,
                        })
                      }
                      showLabel
                      size="sm"
                      value={pair.effectivenessRating || 0}
                    />
                  </div>

                  <Button
                    className="text-destructive hover:text-destructive"
                    onClick={() =>
                      removeCardPair(pair.biasId, pair.mitigationId)
                    }
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Annotation */}
                {pair.annotation && (
                  <div className="border-t pt-3">
                    <p className="text-muted-foreground text-sm">
                      {pair.annotation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
