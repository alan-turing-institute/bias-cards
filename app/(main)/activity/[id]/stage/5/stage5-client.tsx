'use client';

import { Edit3, FileText, Star } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StageFooter } from '@/components/stage-footer';
import { StageNavigation } from '@/components/stage-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StageGroupHeader } from '@/components/ui/stage-group-header';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type {
  Card as BiasCard,
  CardPair,
  LifecycleStage,
  MitigationCard,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// Risk category colors and order
const RISK_CATEGORY_ORDER = [
  'high-risk',
  'medium-risk',
  'low-risk',
  'needs-discussion',
  'uncategorized',
];
const RISK_COLORS = {
  'high-risk': 'bg-red-100 border-red-300 text-red-800',
  'medium-risk': 'bg-amber-100 border-amber-300 text-amber-800',
  'low-risk': 'bg-green-100 border-green-300 text-green-800',
  'needs-discussion': 'bg-blue-100 border-blue-300 text-blue-800',
};

interface EnrichedCardPair extends CardPair {
  biasCard: BiasCard;
  mitigationCard: MitigationCard;
  stage?: LifecycleStage;
  riskCategory?: string;
  originalRationale?: string;
}

// Star rating component
function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          className={cn(
            'h-5 w-5 transition-colors',
            readonly && 'cursor-default',
            !readonly && 'hover:text-amber-400'
          )}
          disabled={readonly}
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          type="button"
        >
          <Star
            className={cn(
              'h-4 w-4',
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-muted-foreground text-sm">
        {value > 0 ? `${value}/5` : 'Not rated'}
      </span>
    </div>
  );
}

// Pair editing modal component
function PairEditModal({
  pair,
  open,
  onOpenChange,
  onSave,
}: {
  pair: EnrichedCardPair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: {
    effectivenessRating?: number;
    annotation?: string;
  }) => void;
}) {
  const [rating, setRating] = useState(0);
  const [annotation, setAnnotation] = useState('');

  useEffect(() => {
    if (pair) {
      setRating(pair.effectivenessRating || 0);
      setAnnotation(pair.annotation || '');
    }
  }, [pair]);

  const handleSave = () => {
    onSave({
      effectivenessRating: rating,
      annotation: annotation.trim() || undefined,
    });
    onOpenChange(false);
  };

  if (!pair) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 transition-opacity',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="mb-2 font-semibold text-xl">Edit Pair Details</h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="font-medium">{pair.biasCard.name}</span>
              <span>→</span>
              <span className="font-medium">{pair.mitigationCard.name}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Bias Card Info */}
            <div>
              <h3 className="mb-2 font-medium">Bias Card</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="font-medium">{pair.biasCard.name}</h4>
                    {pair.riskCategory && (
                      <Badge
                        className={cn(
                          'text-xs',
                          RISK_COLORS[
                            pair.riskCategory as keyof typeof RISK_COLORS
                          ]
                        )}
                      >
                        {pair.riskCategory.replace('-', ' ')}
                      </Badge>
                    )}
                    {pair.stage && (
                      <Badge className="text-xs" variant="secondary">
                        {LIFECYCLE_STAGES[pair.stage].name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {pair.biasCard.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mitigation Card Info */}
            <div>
              <h3 className="mb-2 font-medium">Mitigation Strategy</h3>
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-2 font-medium">
                    {pair.mitigationCard.name}
                  </h4>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {pair.mitigationCard.description}
                  </p>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="mb-1 font-medium text-sm">Example:</p>
                    <p className="text-sm">{pair.mitigationCard.example}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Effectiveness Rating */}
            <div>
              <Label className="font-medium text-base">
                Effectiveness Rating
              </Label>
              <p className="mb-3 text-muted-foreground text-sm">
                Rate how effective you expect this mitigation to be for this
                bias
              </p>
              <StarRating onChange={setRating} value={rating} />
            </div>

            {/* Implementation Notes */}
            <div>
              <Label className="font-medium text-base" htmlFor="annotation">
                Implementation Notes
              </Label>
              <p className="mb-3 text-muted-foreground text-sm">
                Add notes about how to implement this mitigation for this
                specific bias
              </p>
              <Textarea
                id="annotation"
                onChange={(e) => setAnnotation(e.target.value)}
                placeholder="e.g., Apply this mitigation during the data collection phase by..."
                rows={4}
                value={annotation}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-6">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card component for displaying a bias-mitigation pair
function PairCard({
  pair,
  onEdit,
}: {
  pair: EnrichedCardPair;
  onEdit: (pair: EnrichedCardPair) => void;
}) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Titles */}
          <div>
            <h4 className="font-semibold text-base">{pair.biasCard.name}</h4>
            <p className="text-muted-foreground text-sm">
              → {pair.mitigationCard.name}
            </p>
          </div>

          {/* Original Rationale */}
          {pair.originalRationale && (
            <div>
              <h5 className="mb-1 font-medium text-muted-foreground text-sm">
                Original Rationale:
              </h5>
              <p className="text-sm">{pair.originalRationale}</p>
            </div>
          )}

          {/* Effectiveness Rating */}
          <div>
            <h5 className="mb-1 font-medium text-muted-foreground text-sm">
              Effectiveness Rating:
            </h5>
            {pair.effectivenessRating && pair.effectivenessRating > 0 ? (
              <StarRating readonly value={pair.effectivenessRating} />
            ) : (
              <p className="text-muted-foreground text-sm italic">Not rated</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <h5 className="mb-1 font-medium text-muted-foreground text-sm">
              Notes:
            </h5>
            {pair.annotation?.trim() ? (
              <p className="text-sm">{pair.annotation}</p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                No notes added
              </p>
            )}
          </div>
        </div>

        {/* Edit button at bottom right */}
        <div className="mt-4 flex justify-end">
          <Button onClick={() => onEdit(pair)} size="sm" variant="outline">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Stage5Client() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;

  const { completeActivityStage } = useActivityStore();
  const { biasCards, mitigationCards, loadCards } = useCardsStore();
  const {
    stageAssignments,
    getBiasRiskAssignments,
    cardPairs,
    updateCardPair,
    removeCardPair,
    completeActivityStage: completeWorkspaceStage,
  } = useWorkspaceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPair, setSelectedPair] = useState<EnrichedCardPair | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRated, setShowRated] = useState(true);
  const [showWithNotes, setShowWithNotes] = useState(true);

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Get bias risk assignments to enrich pairs
  const biasRiskAssignments = getBiasRiskAssignments();

  // Create enriched pairs with card data and additional info
  const enrichedPairs: EnrichedCardPair[] = cardPairs
    .map((pair) => {
      const biasCard = biasCards.find((c) => c.id === pair.biasId);
      const mitigationCard = mitigationCards.find(
        (c) => c.id === pair.mitigationId
      );

      if (!(biasCard && mitigationCard)) {
        return null;
      }

      // Find stage assignment for the bias
      const stageAssignment = stageAssignments.find(
        (a) => a.cardId === pair.biasId
      );

      // Find risk category for the bias
      const riskAssignment = biasRiskAssignments.find(
        (r) => r.cardId === pair.biasId
      );

      return {
        ...pair,
        biasCard,
        mitigationCard,
        stage: stageAssignment?.stage,
        riskCategory: riskAssignment?.riskCategory,
        originalRationale: stageAssignment?.annotation,
      };
    })
    .filter(Boolean) as EnrichedCardPair[];

  // Filter pairs based on search term and toggles
  const filteredPairs = enrichedPairs.filter((pair) => {
    const matchesSearch =
      pair.biasCard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.mitigationCard.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pair.biasCard.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pair.mitigationCard.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const hasRating = pair.effectivenessRating && pair.effectivenessRating > 0;
    const hasNotes = pair.annotation && pair.annotation.trim().length > 0;

    const matchesRatingFilter = showRated ? true : !hasRating;
    const matchesNotesFilter = showWithNotes ? true : !hasNotes;

    return matchesSearch && matchesRatingFilter && matchesNotesFilter;
  });

  // Check completion status
  const pairsWithRating = enrichedPairs.filter(
    (p) => p.effectivenessRating && p.effectivenessRating > 0
  );
  const pairsWithNotes = enrichedPairs.filter(
    (p) => p.annotation && p.annotation.trim().length > 0
  );

  const completionRate =
    enrichedPairs.length > 0
      ? (pairsWithRating.length + pairsWithNotes.length) /
        (enrichedPairs.length * 2)
      : 0;
  const isStageComplete = completionRate >= 0.5; // 50% completion (either rating or notes for each pair)

  const handleCompleteStage = async () => {
    // Complete the activity
    completeActivityStage(activityId, 5);
    completeWorkspaceStage(5);

    // Get activity data for report generation
    const activity = useActivityStore.getState().getActivity(activityId);
    if (!activity) {
      router.push('/dashboard');
      return;
    }

    // Generate report in the reports system
    const { generateReportFromWorkspace } = useReportsStore.getState();
    try {
      const reportId = await generateReportFromWorkspace(activityId, {
        title: activity.title,
        description: activity.description,
        domain: activity.projectType || 'General',
        objectives: '',
        scope: '',
        status: 'testing' as const,
        timeline: {
          startDate: activity.createdAt,
          endDate: new Date().toISOString(),
          milestones: [],
        },
        team: {
          projectLead: {
            name: '',
            role: '',
            responsibilities: '',
          },
          members: [],
          stakeholders: [],
        },
      });

      // Redirect to report view
      router.push(`/reports/view?id=${reportId}`);
    } catch (_error) {
      // Fallback to activity report page
      router.push(`/activity/${activityId}/report`);
    }
  };

  const handleEditPair = (pair: EnrichedCardPair) => {
    setSelectedPair(pair);
    setIsModalOpen(true);
  };

  const handleSavePair = (updates: {
    effectivenessRating?: number;
    annotation?: string;
  }) => {
    if (selectedPair) {
      updateCardPair(selectedPair.biasId, selectedPair.mitigationId, updates);
    }
  };

  // Group pairs by stage
  const pairsByStage = filteredPairs.reduce(
    (acc, pair) => {
      const stage = pair.stage || 'unassigned';
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(pair);
      return acc;
    },
    {} as Record<string, EnrichedCardPair[]>
  );

  // Group pairs by risk category
  const pairsByRisk = filteredPairs.reduce(
    (acc, pair) => {
      const category = pair.riskCategory || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(pair);
      return acc;
    },
    {} as Record<string, EnrichedCardPair[]>
  );

  return (
    <div className="flex h-full flex-col">
      <StageNavigation
        actions={
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                className="w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pairs..."
                value={searchTerm}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="font-medium text-sm" htmlFor="rated-filter">
                  Show Rated
                </Label>
                <Switch
                  checked={showRated}
                  id="rated-filter"
                  onCheckedChange={setShowRated}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-medium text-sm" htmlFor="notes-filter">
                  Show with Notes
                </Label>
                <Switch
                  checked={showWithNotes}
                  id="notes-filter"
                  onCheckedChange={setShowWithNotes}
                />
              </div>
            </div>
          </div>
        }
        activityId={activityId}
        canComplete={isStageComplete}
        completionLabel="Complete Activity"
        currentStage={5}
        instructions="Review and refine your bias-mitigation pairs. Add effectiveness ratings and implementation notes to complete your bias management plan."
        onCompleteStage={handleCompleteStage}
        progress={{
          current: pairsWithRating.length + pairsWithNotes.length,
          total: enrichedPairs.length * 2,
          label: `${pairsWithRating.length} ratings + ${pairsWithNotes.length} notes / ${enrichedPairs.length * 2} total`,
        }}
        title="Stage 5: Review & Refinement"
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {enrichedPairs.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-2 font-semibold text-lg">
                No bias-mitigation pairs found
              </h3>
              <p className="text-muted-foreground">
                Complete Stage 4 first by assigning mitigation strategies to
                bias cards.
              </p>
            </div>
          </div>
        ) : (
          <Tabs className="w-full" defaultValue="lifecycle">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lifecycle">By Lifecycle Stage</TabsTrigger>
              <TabsTrigger value="risk">By Risk Category</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6" value="lifecycle">
              <div className="space-y-6">
                {Object.entries(pairsByStage).map(([stage, pairs]) => (
                  <Card key={stage}>
                    <StageGroupHeader
                      itemCount={pairs.length}
                      itemLabel="pairs"
                      stage={
                        stage === 'unassigned'
                          ? undefined
                          : (stage as LifecycleStage)
                      }
                      type="lifecycle"
                    />
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {pairs.map((pair) => (
                          <PairCard
                            key={`${pair.biasId}-${pair.mitigationId}`}
                            onEdit={handleEditPair}
                            pair={pair}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="risk">
              <div className="space-y-6">
                {RISK_CATEGORY_ORDER.filter(
                  (category) => pairsByRisk[category]?.length > 0
                ).map((category) => {
                  const pairs = pairsByRisk[category];
                  return (
                    <Card key={category}>
                      <StageGroupHeader
                        itemCount={pairs.length}
                        itemLabel="pairs"
                        riskCategory={category}
                        type="risk"
                      />
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {pairs.map((pair) => (
                            <PairCard
                              key={`${pair.biasId}-${pair.mitigationId}`}
                              onEdit={handleEditPair}
                              pair={pair}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Modal */}
      <PairEditModal
        onOpenChange={setIsModalOpen}
        onSave={handleSavePair}
        open={isModalOpen}
        pair={selectedPair}
      />

      {/* Footer Navigation */}
      <StageFooter
        activityId={activityId}
        canComplete={isStageComplete}
        completionLabel="Complete Activity"
        currentStage={5}
        onCompleteStage={handleCompleteStage}
      />
    </div>
  );
}
