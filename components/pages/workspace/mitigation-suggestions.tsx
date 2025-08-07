'use client';

import { CheckCircle, Info, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EffectivenessRating } from '@/components/ui/effectiveness-rating';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMatchQuality } from '@/lib/data/mitigation-matching';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { cn } from '@/lib/utils';

interface MitigationSuggestionsProps {
  biasId: string;
  className?: string;
}

function getScoreColorClass(score: number): string {
  if (score >= 80) {
    return 'text-green-700';
  }
  if (score >= 60) {
    return 'text-amber-700';
  }
  if (score >= 40) {
    return 'text-orange-700';
  }
  return 'text-gray-700';
}

export function MitigationSuggestions({
  biasId,
  className,
}: MitigationSuggestionsProps) {
  const { biasCards } = useCardsStore();
  const { getSuggestedMitigationsForBias, createCardPair, getPairsForBias } =
    useWorkspaceStore();

  const bias = biasCards.find((b) => b.id === biasId);
  const suggestions = getSuggestedMitigationsForBias(biasId);
  const existingPairs = getPairsForBias(biasId);
  const pairedMitigationIds = new Set(existingPairs.map((p) => p.mitigationId));

  if (!bias || suggestions.length === 0) {
    return null;
  }

  const handleCreatePair = (
    mitigationId: string,
    predictedEffectiveness: number
  ) => {
    createCardPair(biasId, mitigationId, undefined, predictedEffectiveness);
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Suggested Mitigations</h3>
        <Badge className="ml-auto" variant="secondary">
          {suggestions.length} matches
        </Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {suggestions.map(
            ({ mitigation, score, reasons, predictedEffectiveness }) => {
              const isPaired = pairedMitigationIds.has(mitigation.id);
              const matchQuality = getMatchQuality(score);

              return (
                <div
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    isPaired
                      ? 'border-green-200 bg-green-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                  key={mitigation.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">
                          {mitigation.name}
                        </h4>
                        {isPaired && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                        {mitigation.caption}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={cn(
                            'font-medium text-xs',
                            getScoreColorClass(score)
                          )}
                        >
                          {matchQuality}
                        </span>
                      </div>

                      <EffectivenessRating
                        readonly
                        size="sm"
                        value={predictedEffectiveness}
                      />
                    </div>
                  </div>

                  {/* Match reasons */}
                  <div className="mt-2 space-y-1">
                    {reasons.slice(0, 2).map((reason, idx) => (
                      <div
                        className="flex items-start gap-1"
                        key={`${mitigation.id}-reason-${idx}`}
                      >
                        <Info className="mt-0.5 h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">
                          {reason}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  {!isPaired && (
                    <Button
                      className="mt-3 w-full"
                      onClick={() =>
                        handleCreatePair(mitigation.id, predictedEffectiveness)
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Create Pair
                    </Button>
                  )}
                </div>
              );
            }
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 border-t pt-4">
        <p className="text-muted-foreground text-xs">
          Suggestions are based on keyword matching, category relevance, and
          lifecycle stage alignment.
        </p>
      </div>
    </Card>
  );
}
