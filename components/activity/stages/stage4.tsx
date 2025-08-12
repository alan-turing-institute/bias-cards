'use client';

import { ChevronDown, ChevronUp, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MitigationCardList } from '@/components/cards/mitigation-card-list';
import { StageNavigation } from '@/components/stage-navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MitigationSelectionDialog } from '@/components/ui/mitigation-selection-dialog';
import { StageGroupHeader } from '@/components/ui/stage-group-header';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import { useHashRouter } from '@/lib/routing/hash-router';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
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

interface StageAssignmentWithCard {
  id: string;
  cardId: string;
  stage: LifecycleStage;
  annotation?: string;
  timestamp: string;
  card: BiasCard;
  riskCategory?: string;
}

interface AssignmentCardProps {
  assignment: StageAssignmentWithCard;
  viewMode: 'lifecycle' | 'risk';
  showDescriptions: boolean;
  pairsForBias: (CardPair & { stage: LifecycleStage })[];
  mitigationCards: MitigationCard[];
  onSelectMitigations: (biasId: string, mitigationIds: string[]) => void;
  onRemovePair: (biasId: string, mitigationId: string) => void;
}

// Helper component for rendering assignment cards
const AssignmentCard = ({
  assignment,
  viewMode,
  showDescriptions,
  pairsForBias,
  mitigationCards,
  onSelectMitigations,
  onRemovePair,
}: AssignmentCardProps) => {
  const [rationaleOpen, setRationaleOpen] = useState(false);

  return (
    <Card className="transition-all" key={assignment.id}>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          {/* Card header */}
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-base sm:text-lg">
                {assignment.card.name}
              </h4>
              {/* Conditional badge based on view mode */}
              {viewMode === 'lifecycle' && assignment.riskCategory && (
                <Badge
                  className={cn(
                    'text-xs',
                    RISK_COLORS[
                      assignment.riskCategory as keyof typeof RISK_COLORS
                    ]
                  )}
                >
                  {assignment.riskCategory.replace('-', ' ')}
                </Badge>
              )}
              {viewMode === 'risk' && (
                <Badge className="text-xs" variant="secondary">
                  {LIFECYCLE_STAGES[assignment.stage].name}
                </Badge>
              )}
            </div>
            {showDescriptions && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                {assignment.card.description}
              </p>
            )}
          </div>

          {/* Rationale section (collapsible on mobile) */}
          {assignment.annotation && assignment.annotation.trim().length > 0 && (
            <>
              {/* Mobile collapsible */}
              <Collapsible
                className="md:hidden"
                onOpenChange={setRationaleOpen}
                open={rationaleOpen}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
                  <h5 className="font-semibold text-sm">Rationale</h5>
                  {rationaleOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="mt-2 rounded-md bg-muted/50 p-3 text-xs leading-relaxed sm:text-sm">
                    {assignment.annotation}
                  </p>
                </CollapsibleContent>
              </Collapsible>

              {/* Desktop visible */}
              <div className="hidden space-y-2 md:block">
                <h5 className="font-semibold text-sm">Rationale:</h5>
                <p className="rounded-md bg-muted/50 p-3 text-sm leading-relaxed">
                  {assignment.annotation}
                </p>
              </div>
            </>
          )}

          {/* Mitigation selection */}
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Mitigation Strategies:</h5>
            <SelectedMitigations
              existingPairs={pairsForBias}
              mitigationCards={mitigationCards}
              onRemovePair={(mitigationId) =>
                onRemovePair(assignment.cardId, mitigationId)
              }
            />
            <MitigationSelectionDialog
              biasCardId={assignment.cardId}
              biasCardName={assignment.card.name}
              mitigationCards={mitigationCards}
              onSelectMitigations={(mitigationIds) =>
                onSelectMitigations(assignment.cardId, mitigationIds)
              }
              selectedMitigations={pairsForBias.map((p) => p.mitigationId)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for displaying selected mitigation cards
function SelectedMitigations({
  existingPairs,
  onRemovePair,
  mitigationCards,
}: {
  existingPairs: (CardPair & { stage: LifecycleStage })[];
  onRemovePair: (mitigationId: string) => void;
  mitigationCards: MitigationCard[];
}) {
  if (existingPairs.length === 0) {
    return (
      <div className="min-h-[60px] rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/20 p-3">
        <p className="text-center text-muted-foreground text-sm">
          No mitigation strategies selected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {existingPairs.map((pair) => {
        const mitigationCard = mitigationCards.find(
          (c) => c.id === pair.mitigationId
        );
        if (!mitigationCard) {
          return null;
        }

        return (
          <div
            className="relative"
            key={`${pair.biasId}-${pair.mitigationId}-${pair.stage}`}
          >
            <MitigationCardList
              card={mitigationCard}
              cardNumber={mitigationCard.displayNumber || '00'}
              showCategory={false}
            />
            <button
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePair(pair.mitigationId);
              }}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function Stage4Client() {
  const { currentRoute } = useHashRouter();

  const {
    currentActivity,
    addMitigation,
    removeMitigation,
    completeStage,
    isHydrated,
  } = useUnifiedActivityStore();

  const activityId = currentRoute.activityId || currentActivity?.id;

  const { biasCards, mitigationCards, loadCards } = useCardsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyNeedingMitigation, setShowOnlyNeedingMitigation] =
    useState(false);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Get stage assignments from current activity
  const getStageAssignments = (): StageAssignmentWithCard[] => {
    if (!currentActivity) return [];

    const assignments: StageAssignmentWithCard[] = [];
    const biases = currentActivity.getBiases();

    Object.entries(biases).forEach(([biasId, bias]) => {
      bias.lifecycleAssignments.forEach((stage) => {
        const card = biasCards.find((c) => c.id === biasId);
        if (card) {
          assignments.push({
            id: `${biasId}-${stage}`,
            cardId: biasId,
            stage,
            annotation: bias.rationale[stage],
            timestamp: new Date().toISOString(),
            card,
            riskCategory: bias.riskCategory || undefined,
          });
        }
      });
    });

    return assignments;
  };

  // Get card pairs (bias-mitigation mappings) from current activity
  const getCardPairs = (): (CardPair & { stage: LifecycleStage })[] => {
    if (!currentActivity) return [];

    const pairs: (CardPair & { stage: LifecycleStage })[] = [];
    const biases = currentActivity.getBiases();

    Object.entries(biases).forEach(([biasId, bias]) => {
      Object.entries(bias.mitigations).forEach(([stage, mitigationIds]) => {
        mitigationIds.forEach((mitigationId) => {
          pairs.push({
            biasId,
            mitigationId,
            stage: stage as LifecycleStage,
            timestamp: new Date().toISOString(),
          });
        });
      });
    });

    return pairs;
  };

  // Load cards on mount
  useEffect(() => {
    setIsClient(true);
    loadCards();
    setIsInitializing(false);
  }, [loadCards]);

  // Get enriched assignments from current activity
  const enrichedAssignments = getStageAssignments();
  const cardPairs = getCardPairs();

  // Filter assignments based on search term and mitigation filter
  const filteredAssignments = enrichedAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.card.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      LIFECYCLE_STAGES[assignment.stage].name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const pairsForBias = cardPairs.filter(
      (p) => p.biasId === assignment.cardId
    );
    const hasMitigation = pairsForBias.length > 0;
    const matchesMitigationFilter = showOnlyNeedingMitigation
      ? !hasMitigation
      : true;

    return matchesSearch && matchesMitigationFilter;
  });

  // Group assignments by lifecycle stage
  const assignmentsByStage = filteredAssignments.reduce(
    (acc, assignment) => {
      if (!acc[assignment.stage]) {
        acc[assignment.stage] = [];
      }
      acc[assignment.stage].push(assignment);
      return acc;
    },
    {} as Record<LifecycleStage, StageAssignmentWithCard[]>
  );

  // Group assignments by risk category
  const assignmentsByRisk = filteredAssignments.reduce(
    (acc, assignment) => {
      const category = assignment.riskCategory || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(assignment);
      return acc;
    },
    {} as Record<string, StageAssignmentWithCard[]>
  );

  // Check completion status
  const assignmentsWithMitigation = enrichedAssignments.filter((a) =>
    cardPairs.some((p) => p.biasId === a.cardId)
  );
  const completionRate =
    enrichedAssignments.length > 0
      ? assignmentsWithMitigation.length / enrichedAssignments.length
      : 0;
  const isStageComplete = completionRate >= 0.6; // 60% of assignments need mitigation

  const handleCompleteStage = () => {
    if (activityId) {
      completeStage(4);
      navigateToActivity(activityId, 5);
    }
  };

  // Get pairs for a specific bias
  const getPairsForBias = (
    biasId: string
  ): (CardPair & { stage: LifecycleStage })[] => {
    return cardPairs.filter((p) => p.biasId === biasId);
  };

  // Handle selecting mitigations for a bias card
  const handleSelectMitigations = (biasId: string, mitigationIds: string[]) => {
    if (!currentActivity) return;

    // Get the bias object
    const bias = currentActivity.getBias(biasId);
    if (!bias) return;

    // Get the lifecycle stage(s) for this bias
    const stages = bias.lifecycleAssignments;

    // For each stage, update the mitigations
    stages.forEach((stage) => {
      // Remove all existing mitigations for this stage
      const currentMitigations = bias.mitigations[stage] || [];
      currentMitigations.forEach((mitigationId) => {
        if (!mitigationIds.includes(mitigationId)) {
          removeMitigation(biasId, stage, mitigationId);
        }
      });

      // Add new mitigations
      mitigationIds.forEach((mitigationId) => {
        if (!currentMitigations.includes(mitigationId)) {
          addMitigation(biasId, stage, mitigationId);
        }
      });
    });
  };

  // Show loading state during hydration to prevent mismatch
  if (!isClient || isInitializing || !isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">Loading...</h2>
          <p className="text-gray-600 text-sm">Preparing Stage 4</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StageNavigation
        actions={
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                className="w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assignments..."
                value={searchTerm}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label
                  className="font-medium text-sm"
                  htmlFor="mitigation-filter"
                >
                  Need Mitigation
                </Label>
                <Switch
                  checked={showOnlyNeedingMitigation}
                  id="mitigation-filter"
                  onCheckedChange={setShowOnlyNeedingMitigation}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label
                  className="font-medium text-sm"
                  htmlFor="description-toggle"
                >
                  Show Descriptions
                </Label>
                <Switch
                  checked={showDescriptions}
                  id="description-toggle"
                  onCheckedChange={setShowDescriptions}
                />
              </div>
            </div>
          </div>
        }
        activityId={activityId || ''}
        canComplete={isStageComplete}
        completionLabel="Complete Stage 4"
        currentStage={4}
        instructions="Assign mitigation strategies to bias cards based on their rationale and lifecycle stage. Multiple mitigations can be assigned to the same bias."
        onCompleteStage={handleCompleteStage}
        progress={{
          current: assignmentsWithMitigation.length,
          total: enrichedAssignments.length,
          label: `${assignmentsWithMitigation.length}/${enrichedAssignments.length} biases have mitigation strategies assigned`,
        }}
        title="Stage 4: Mitigation Selection"
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        {enrichedAssignments.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-2 font-semibold text-lg">
                No assignments to work with
              </h3>
              <p className="text-muted-foreground">
                Complete Stage 3 first by adding rationale to bias assignments.
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
                {Object.entries(assignmentsByStage).map(
                  ([stage, assignments]) => (
                    <Card key={stage}>
                      <StageGroupHeader
                        itemCount={assignments.length}
                        itemLabel="cards"
                        stage={stage as LifecycleStage}
                        type="lifecycle"
                      />
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {assignments.map((assignment) => (
                            <AssignmentCard
                              assignment={assignment}
                              key={assignment.id}
                              mitigationCards={mitigationCards}
                              onRemovePair={(mitigationId) => {
                                if (assignment.stage) {
                                  removeMitigation(
                                    assignment.cardId,
                                    assignment.stage,
                                    mitigationId
                                  );
                                }
                              }}
                              onSelectMitigations={handleSelectMitigations}
                              pairsForBias={getPairsForBias(assignment.cardId)}
                              showDescriptions={showDescriptions}
                              viewMode="lifecycle"
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="risk">
              <div className="space-y-6">
                {RISK_CATEGORY_ORDER.filter(
                  (category) => assignmentsByRisk[category]?.length > 0
                ).map((category) => {
                  const assignments = assignmentsByRisk[category];
                  return (
                    <Card key={category}>
                      <StageGroupHeader
                        itemCount={assignments.length}
                        itemLabel="cards"
                        riskCategory={category}
                        type="risk"
                      />
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {assignments.map((assignment) => (
                            <AssignmentCard
                              assignment={assignment}
                              key={assignment.id}
                              mitigationCards={mitigationCards}
                              onRemovePair={(mitigationId) => {
                                if (assignment.stage) {
                                  removeMitigation(
                                    assignment.cardId,
                                    assignment.stage,
                                    mitigationId
                                  );
                                }
                              }}
                              onSelectMitigations={handleSelectMitigations}
                              pairsForBias={getPairsForBias(assignment.cardId)}
                              showDescriptions={showDescriptions}
                              viewMode="risk"
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

      {/* Footer Navigation */}
    </div>
  );
}
