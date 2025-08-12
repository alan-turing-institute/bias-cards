'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Info, Layers, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BiasCardDropped } from '@/components/cards/bias-card-dropped';
import { BiasCardList } from '@/components/cards/bias-card-list';
import { CardDragOverlay } from '@/components/cards/drag-overlay';
import { DraggableCardEnhanced } from '@/components/cards/draggable-card-enhanced';
import { StageNavigation } from '@/components/stage-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardDetailsModal } from '@/components/ui/card-details-modal';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import { useHashRouter } from '@/lib/routing/hash-router';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
import type { BiasCard, LifecycleStage, StageAssignment } from '@/lib/types';
import { cn } from '@/lib/utils';

// Map stage to image file
const getStageImage = (stage: LifecycleStage): string => {
  const stageImages: Record<LifecycleStage, string> = {
    'project-planning': '/01_project planning.jpg',
    'problem-formulation': '/02_problem formulation.jpg',
    'data-extraction-procurement': '/03_Data extraction.jpg',
    'data-analysis': '/04_data analysis.jpg',
    'preprocessing-feature-engineering': '/05_preprocessing.jpg',
    'model-selection-training': '/06_Model selection and training.jpg',
    'model-testing-validation': '/07_model testing.jpg',
    'model-reporting': '/08_model reporting.jpg',
    'system-implementation': '/09_system implementation.jpg',
    'system-use-monitoring': '/11_System use & Monitoring.jpg',
    'model-updating-deprovisioning': '/12_Model Updating & Deprovisioning.jpg',
    'user-training': '/10_User training.jpg',
  };
  return stageImages[stage] || '';
};

// Regex patterns for drag and drop operations - updated to handle slug-based card IDs
const CARD_ID_REGEX = /-card-([^-]+(?:-[^-]+)*)-/; // Updated to capture slug IDs like "confirmation-bias"
const STAGE_CARD_REGEX =
  /^stage-([^-]+(?:-[^-]+)*)-card-([^-]+(?:-[^-]+)*)-(.+)$/; // Updated to handle slug-based card IDs

// Define lifecycle stages array at module level
const lifecycleStages: LifecycleStage[] = [
  'project-planning',
  'problem-formulation',
  'data-extraction-procurement',
  'data-analysis',
  'preprocessing-feature-engineering',
  'model-selection-training',
  'model-testing-validation',
  'model-reporting',
  'system-implementation',
  'system-use-monitoring',
  'model-updating-deprovisioning',
  'user-training',
];

// Risk category colors for filtering
const _RISK_COLORS = {
  'high-risk': 'bg-red-100 border-red-300 text-red-800',
  'medium-risk': 'bg-amber-100 border-amber-300 text-amber-800',
  'low-risk': 'bg-green-100 border-green-300 text-green-800',
  'needs-discussion': 'bg-blue-100 border-blue-300 text-blue-800',
};
// RISK_COLORS are used for potential future risk-based styling

// Component for each lifecycle stage column
function StageColumn({
  stage,
  cards,
  onRemoveCard,
  onCardClick,
}: {
  stage: LifecycleStage;
  cards: Array<{ card: BiasCard; assignment: StageAssignment }>;
  onRemoveCard: (cardId: string) => void;
  onCardClick: (card: BiasCard, assignment: StageAssignment) => void;
  draggedCard?: BiasCard | null;
  isDragging?: boolean;
}) {
  const stageInfo = LIFECYCLE_STAGES[stage];

  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stage}`,
    data: {
      stage,
    },
  });

  return (
    <Card
      className={cn(
        'flex h-full flex-col transition-all duration-200',
        isOver && 'shadow-lg ring-2 ring-amber-500'
      )}
    >
      <CardHeader className="pb-3">
        {/* Header with larger image and title */}
        <div className="flex gap-3">
          <Image
            alt={`${stageInfo.name} illustration`}
            className="h-16 w-16 rounded-md object-cover shadow-sm"
            height={64}
            src={getStageImage(stage)}
            width={64}
          />
          <div className="flex min-w-0 flex-1 items-center">
            <h3 className="flex-1 font-semibold text-base leading-tight">
              {stageInfo.name}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
                    type="button"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" side="top">
                  <p className="text-sm">{stageInfo.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex flex-1 flex-col p-3 pt-0">
        <div
          className="relative flex-1"
          data-stage={stage}
          id={`stage-${stage}`}
          ref={setNodeRef}
        >
          {cards.length > 0 ? (
            <ScrollArea className="h-full pr-1">
              <div className="space-y-1.5">
                {cards.map(({ card, assignment }) => (
                  <DraggableCardEnhanced
                    card={card}
                    id={`stage-${stage}-card-${card.id}-${assignment.timestamp}`}
                    key={assignment.id}
                  >
                    <div className="group relative">
                      <BiasCardDropped
                        card={card as BiasCard}
                        cardNumber={
                          card.displayNumber || String(card.id).padStart(2, '0')
                        }
                      />
                      {/* Action buttons grouped in top right */}
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {/* Info button */}
                        <button
                          aria-label={`View details for ${card.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:border-amber-500 hover:bg-amber-500 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onCardClick(card, assignment);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          title="View details and add rationale"
                          type="button"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                        {/* Remove button */}
                        <button
                          aria-label={`Remove ${card.name} from ${stageInfo.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onRemoveCard(assignment.id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          type="button"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </DraggableCardEnhanced>
                ))}
              </div>
            </ScrollArea>
          ) : (
            /* Full-height drop zone */
            <div
              className={`flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
                isOver
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-muted-foreground/25'
              }`}
            >
              <div className="text-center">
                <Layers
                  className={`mx-auto mb-2 h-8 w-8 ${
                    isOver ? 'text-amber-500' : 'text-muted-foreground/40'
                  }`}
                />
                <p
                  className={`font-medium text-sm ${
                    isOver
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  Drop bias cards here
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Card count in bottom right */}
        {cards.length > 0 && (
          <div className="absolute right-2 bottom-2">
            <Badge className="text-xs" variant="secondary">
              {cards.length}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Stage2Client() {
  const { currentRoute } = useHashRouter();

  const {
    currentActivity,
    assignToLifecycle,
    removeFromLifecycle,
    setRationale,
    completeStage,
    setCurrentStage,
    isHydrated,
    initialize,
  } = useUnifiedActivityStore();

  const activityId = currentRoute.activityId || currentActivity?.id;

  const { biasCards, setSearchQuery, loadCards } = useCardsStore();

  const [activeCard, setActiveCard] = useState<BiasCard | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [accordionOpenItems, setAccordionOpenItems] = useState<string[]>([]);

  // Modal state for card details
  const [selectedCard, setSelectedCard] = useState<BiasCard | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<StageAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Activity-aware helper methods
  const getAssignments = (biasId: string): LifecycleStage[] => {
    if (!currentActivity) return [];
    const bias = currentActivity.getBias(biasId);
    return bias?.lifecycleAssignments || [];
  };

  const isActivityReady = (): boolean => {
    return currentActivity !== null;
  };

  // Get stage assignments from activity
  const stageAssignments = currentActivity
    ? Object.entries(currentActivity.getBiases()).flatMap(([biasId, bias]) =>
        bias.lifecycleAssignments.map(
          (stage) =>
            ({
              id: `${biasId}-${stage}`,
              cardId: biasId,
              stage,
              annotation: bias.rationale[stage],
              timestamp: new Date().toISOString(),
            }) as StageAssignment
        )
      )
    : [];

  // Ensure we only render on client to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    loadCards();
    setIsInitializing(false);
  }, [loadCards]);

  // Get bias risk assignments from current activity
  const getBiasRiskAssignments = () => {
    if (!currentActivity) return [];
    const biases = currentActivity.getBiases();
    return Object.entries(biases)
      .filter(([_, bias]) => bias.riskCategory)
      .map(([biasId, bias]) => ({
        cardId: biasId,
        riskCategory: bias.riskCategory,
      }));
  };

  const biasRiskAssignments = getBiasRiskAssignments();

  // Filter cards to only show those categorized in Stage 1
  const categorizedBiasIds = new Set(
    biasRiskAssignments.map((a: any) => a.cardId)
  );
  const availableBiasCards = biasCards.filter((card) =>
    categorizedBiasIds.has(card.id)
  );

  // Create enriched bias cards with risk category info
  const enrichedBiasCards = availableBiasCards.map((card) => {
    const riskAssignment = biasRiskAssignments.find(
      (a: any) => a.cardId === card.id
    );
    return {
      ...card,
      riskCategory: riskAssignment?.riskCategory,
    };
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to extract card from drag event
  const extractCardFromActive = (active: {
    data: { current?: { card?: BiasCard; cardId?: string } };
    id: string | number;
  }): BiasCard | null => {
    // Get card from drag event data
    let card = active.data.current?.card as BiasCard | undefined;

    // Try getting card from cardId in data
    if (!card && active.data.current?.cardId) {
      const cardId = active.data.current.cardId as string;
      card = enrichedBiasCards.find((c) => c.id === cardId);
    }

    // Extract cardId from active.id
    if (!card && active.id) {
      const activeIdStr = active.id.toString();
      const cardId = extractCardIdFromString(activeIdStr);
      if (cardId) {
        card = enrichedBiasCards.find((c) => c.id === cardId);
      }
    }

    return card || null;
  };

  // Helper function to extract card ID from string
  const extractCardIdFromString = (idStr: string): string | null => {
    if (idStr.startsWith('card-')) {
      return idStr.replace('card-', '');
    }
    if (idStr.includes('-card-')) {
      const match = idStr.match(CARD_ID_REGEX);
      return match ? match[1] : null;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = extractCardFromActive(active);

    if (card) {
      setActiveCard(card);
      setIsDragging(true);
      setIsSheetOpen(false);
    }
  };

  // Helper function to handle card movement between stages
  const handleCardMovement = (
    card: BiasCard,
    active: { id: string | number },
    targetStage: LifecycleStage
  ) => {
    const activeIdStr = active.id.toString();

    if (activeIdStr.startsWith('stage-')) {
      // Handle moving between stages
      const match = activeIdStr.match(STAGE_CARD_REGEX);
      if (match) {
        const sourceStage = match[1] as LifecycleStage;
        const cardId = match[2]; // This is now the card ID from the regex

        if (sourceStage !== targetStage) {
          removeFromLifecycle(cardId, sourceStage);
          assignToLifecycle(cardId, targetStage);
        }
      }
    } else {
      // New card from library
      assignToLifecycle(card.id, targetStage);
      setIsSheetOpen(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id.toString().startsWith('stage-')) {
      const card = extractCardFromActive(active);

      if (card) {
        const targetStage = over.id
          .toString()
          .replace('stage-', '') as LifecycleStage;

        handleCardMovement(card, active, targetStage);
      }
    }

    setActiveCard(null);
    setIsDragging(false);
  };

  // Get cards assigned to a specific stage
  const getCardsForStage = (stage: LifecycleStage) => {
    const assignments = stageAssignments.filter((a) => a.stage === stage);

    const result = assignments
      .map((assignment) => {
        const card = enrichedBiasCards.find((c) => c.id === assignment.cardId);
        return { card, assignment };
      })
      .filter((item) => item.card) as Array<{
      card: BiasCard;
      assignment: StageAssignment;
    }>;

    return result;
  };

  // Handle card click to open modal
  const handleCardClick = (card: BiasCard, assignment: StageAssignment) => {
    setSelectedCard(card);
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  // Handle saving rationale
  const handleSaveRationale = (rationale: string) => {
    if (selectedAssignment && selectedAssignment.stage) {
      setRationale(
        selectedAssignment.cardId,
        selectedAssignment.stage,
        rationale
      );
    }
    setIsModalOpen(false);
  };

  // Function to render bias cards grouped by risk category
  const renderBiasCards = () => {
    // Group all cards by risk category
    const groupedCards = enrichedBiasCards.reduce(
      (acc, card) => {
        const category = card.riskCategory || 'uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(card);
        return acc;
      },
      {} as Record<string, typeof enrichedBiasCards>
    );

    // Sort cards within each category by displayNumber
    Object.keys(groupedCards).forEach((category) => {
      groupedCards[category].sort((a, b) => {
        const aNum = Number.parseInt(a.displayNumber || '999', 10);
        const bNum = Number.parseInt(b.displayNumber || '999', 10);
        return aNum - bNum;
      });
    });

    const getCardNumber = (card: BiasCard) =>
      card.displayNumber || String(card.id).padStart(2, '0');

    // Helper to get count of stages a card is assigned to
    const getAssignmentCount = (cardId: string) => {
      return stageAssignments.filter((a) => a.cardId === cardId).length;
    };

    // Define the order of risk categories
    const categoryOrder = [
      'high-risk',
      'medium-risk',
      'low-risk',
      'needs-discussion',
      'uncategorized',
    ];

    // Sort entries based on predefined order
    const sortedEntries = Object.entries(groupedCards).sort(([a], [b]) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      // If both are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one is in the list, it comes first
      if (indexA !== -1) {
        return -1;
      }
      if (indexB !== -1) {
        return 1;
      }
      // Otherwise, sort alphabetically
      return a.localeCompare(b);
    });

    return (
      <div>
        {/* All Categorised Cards */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium text-green-600 text-sm">
            Categorised Cards ({enrichedBiasCards.length})
          </h3>
          <p className="mb-3 text-muted-foreground text-xs">
            Cards can be assigned to multiple lifecycle stages where relevant
          </p>
          <Accordion
            className="pr-4"
            onValueChange={setAccordionOpenItems}
            type="multiple"
            value={accordionOpenItems}
          >
            {sortedEntries.map(([category, cards]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="font-medium text-base capitalize hover:no-underline">
                  <span>
                    {category.replace('-', ' ')} ({cards.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {cards.map((card, _index) => {
                      const assignmentCount = getAssignmentCount(card.id);
                      return (
                        <DraggableCardEnhanced
                          card={card}
                          id={`card-${card.id}`}
                          key={card.id}
                        >
                          <div className="relative">
                            <BiasCardList
                              card={card}
                              cardNumber={getCardNumber(card)}
                              showCategory={false}
                            />
                            {assignmentCount > 0 && (
                              <Badge
                                className="absolute top-2 right-2 text-xs"
                                variant="secondary"
                              >
                                {assignmentCount} stage
                                {assignmentCount > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </DraggableCardEnhanced>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    );
  };

  // Check completion status - count unique cards assigned that are actually available in Stage 1
  const availableCardIds = new Set(enrichedBiasCards.map((card) => card.id));
  const validAssignments = stageAssignments.filter((a) =>
    availableCardIds.has(a.cardId)
  );
  const uniqueAssignedCards = new Set(validAssignments.map((a) => a.cardId))
    .size;
  const isStageComplete =
    uniqueAssignedCards >= Math.min(5, enrichedBiasCards.length); // At least 5 unique cards or all available

  const handleCompleteStage = () => {
    if (activityId) {
      completeStage(2);
      navigateToActivity(activityId, 3);
    }
  };

  // Show loading state during hydration to prevent mismatch
  if (!isClient || isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">Loading...</h2>
          <p className="text-gray-600 text-sm">Preparing Stage 2</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="flex min-h-screen flex-col">
        <StageNavigation
          actions={
            <div className="flex justify-end">
              <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Layers className="mr-2 h-4 w-4" />
                    View Categorised Cards
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] p-4 sm:w-[540px]">
                  <SheetHeader className="p-0">
                    <SheetTitle>Categorised Bias Cards</SheetTitle>
                    <SheetDescription>
                      Drag bias cards to lifecycle stages based on their risk
                      category from Stage 1
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categorised cards..."
                      />
                    </div>

                    <ScrollArea className="h-[calc(100vh-12rem)]">
                      <div className="pr-3">
                        {enrichedBiasCards.length > 0 ? (
                          renderBiasCards()
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">
                            No categorised cards from Stage 1.
                            <br />
                            Complete Stage 1 first to see cards here.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          }
          activityId={activityId || ''}
          canComplete={isStageComplete}
          completionLabel="Complete Stage 2"
          currentStage={2}
          instructions="Assign categorised bias cards to relevant project lifecycle stages. Consider when each bias is most likely to occur or have impact."
          onCompleteStage={handleCompleteStage}
          progress={{
            current: uniqueAssignedCards,
            total: enrichedBiasCards.length,
            label: `${uniqueAssignedCards}/${enrichedBiasCards.length} unique biases assigned (${validAssignments.length} total assignments)`,
          }}
          title="Stage 2: Lifecycle Assignment"
        />

        {/* Lifecycle stages */}
        <div className="flex-1 overflow-auto p-4">
          <Tabs className="w-full" defaultValue="project-design">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="project-design">Project Design</TabsTrigger>
              <TabsTrigger value="model-development">
                Model Development
              </TabsTrigger>
              <TabsTrigger value="system-deployment">
                System Deployment
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6" value="project-design">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {lifecycleStages.slice(0, 4).map((stage) => (
                  <div className="min-h-[400px]" key={stage}>
                    <StageColumn
                      cards={getCardsForStage(stage)}
                      draggedCard={activeCard}
                      isDragging={isDragging}
                      onCardClick={handleCardClick}
                      onRemoveCard={(assignmentId) => {
                        const assignment = stageAssignments.find(
                          (a) => a.id === assignmentId
                        );
                        if (assignment) {
                          removeFromLifecycle(
                            assignment.cardId,
                            assignment.stage
                          );
                        }
                      }}
                      stage={stage}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="model-development">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {lifecycleStages.slice(4, 8).map((stage) => (
                  <div className="min-h-[400px]" key={stage}>
                    <StageColumn
                      cards={getCardsForStage(stage)}
                      draggedCard={activeCard}
                      isDragging={isDragging}
                      onCardClick={handleCardClick}
                      onRemoveCard={(assignmentId) => {
                        const assignment = stageAssignments.find(
                          (a) => a.id === assignmentId
                        );
                        if (assignment) {
                          removeFromLifecycle(
                            assignment.cardId,
                            assignment.stage
                          );
                        }
                      }}
                      stage={stage}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="system-deployment">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {lifecycleStages.slice(8, 12).map((stage) => (
                  <div className="min-h-[400px]" key={stage}>
                    <StageColumn
                      cards={getCardsForStage(stage)}
                      draggedCard={activeCard}
                      isDragging={isDragging}
                      onCardClick={handleCardClick}
                      onRemoveCard={(assignmentId) => {
                        const assignment = stageAssignments.find(
                          (a) => a.id === assignmentId
                        );
                        if (assignment) {
                          removeFromLifecycle(
                            assignment.cardId,
                            assignment.stage
                          );
                        }
                      }}
                      stage={stage}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CardDragOverlay activeCard={activeCard} />

      <CardDetailsModal
        assignment={selectedAssignment || undefined}
        card={selectedCard}
        onOpenChange={setIsModalOpen}
        onSaveRationale={handleSaveRationale}
        open={isModalOpen}
      />
    </DndContext>
  );
}
