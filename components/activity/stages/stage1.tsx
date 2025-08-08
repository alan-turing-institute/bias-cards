'use client';

import {
  type Active,
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Layers, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BiasCardList } from '@/components/cards/bias-card-list';
import { CardDragOverlay } from '@/components/cards/drag-overlay';
import { DraggableCardEnhanced } from '@/components/cards/draggable-card-enhanced';
import { RiskCategoryZone } from '@/components/cards/risk-category-zone';
import { StageFooter } from '@/components/stage-footer';
import { StageNavigation } from '@/components/stage-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useHashRouter } from '@/lib/routing/hash-router';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { BiasCard, BiasRiskCategory, Card } from '@/lib/types';

// Regex pattern for extracting card IDs from drag element IDs
const CARD_ID_REGEX = /-card-([^-]+)-/;

// Helper function to extract card from drag event
function extractCardFromDragEvent(
  active: Active,
  biasCards: BiasCard[]
): Card | null {
  // Get card from drag event data
  let card = active.data.current?.card as Card | undefined;

  // If card not found in drag data, try to find it by ID
  if (!card && active.id) {
    const activeIdStr = active.id.toString();
    let cardId: string | null = null;

    if (activeIdStr.startsWith('card-')) {
      cardId = activeIdStr.replace('card-', '');
    } else if (activeIdStr.includes('-card-')) {
      const match = activeIdStr.match(CARD_ID_REGEX);
      if (match) {
        cardId = match[1];
      }
    }

    if (cardId) {
      card = biasCards.find((c) => c.id === cardId);
    }
  }

  return card || null;
}

export default function Stage1Client() {
  const { currentRoute } = useHashRouter();
  const workspaceActivityId = useWorkspaceStore((s) => s.activityId);
  const activityId = (currentRoute.activityId || workspaceActivityId) as string;

  const { completeActivityStage } = useActivityStore();
  const { biasCards, setSearchQuery, filteredCards, loadCards } =
    useCardsStore();

  const {
    assignBiasRisk,
    removeBiasRisk,
    getBiasRiskByCategory,
    completeActivityStage: completeWorkspaceStage,
  } = useWorkspaceStore();

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load cards on mount and ensure client-side only rendering
  useEffect(() => {
    setIsClient(true);
    loadCards();
  }, [loadCards]);

  // Get risk assignments by category
  const highRiskCards = getBiasRiskByCategory('high-risk');
  const mediumRiskCards = getBiasRiskByCategory('medium-risk');
  const lowRiskCards = getBiasRiskByCategory('low-risk');
  const needsDiscussionCards = getBiasRiskByCategory('needs-discussion');

  // Check completion status
  const totalBiasCards = biasCards.length;
  const assignedCards =
    highRiskCards.length +
    mediumRiskCards.length +
    lowRiskCards.length +
    needsDiscussionCards.length;

  const MINIMUM_REQUIRED = 10;
  const hasMinimumCards = assignedCards >= MINIMUM_REQUIRED;
  const unassignedCards = totalBiasCards - assignedCards;

  const handleCompleteStage = () => {
    if (!hasMinimumCards) {
      setShowWarningDialog(true);
      return;
    }

    if (unassignedCards > 0) {
      setShowConfirmationDialog(true);
      return;
    }

    // Proceed to next stage
    proceedToNextStage();
  };

  const proceedToNextStage = () => {
    completeActivityStage(activityId, 1);
    completeWorkspaceStage(1);
    navigateToActivity(activityId, 2);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = extractCardFromDragEvent(active, biasCards);

    if (card) {
      setActiveCard(card);
      setIsDragging(true);
      setIsSheetOpen(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id.toString().startsWith('risk-category-')) {
      const card = extractCardFromDragEvent(active, biasCards);

      if (card) {
        const targetCategory = over.id
          .toString()
          .replace('risk-category-', '') as BiasRiskCategory;

        assignBiasRisk(card.id, targetCategory);
        setIsSheetOpen(false);
      }
    }

    setActiveCard(null);
    setIsDragging(false);
  };

  // Filter to only bias cards (no mitigation cards)
  const biasOnlyCards = filteredCards.filter(
    (card): card is BiasCard => card.category !== 'mitigation-technique'
  );

  // Get all assigned card IDs for filtering
  const assignedCardIds = [
    ...highRiskCards,
    ...mediumRiskCards,
    ...lowRiskCards,
    ...needsDiscussionCards,
  ].map((assignment) => assignment.cardId);

  // Separate assigned and unassigned cards
  const unassignedBiasCards = biasOnlyCards.filter(
    (card) => !assignedCardIds.includes(card.id)
  );
  const assignedBiasCards = biasOnlyCards.filter((card) =>
    assignedCardIds.includes(card.id)
  );

  // Group unassigned bias cards by category for the accordion
  const groupedBiasCards = unassignedBiasCards.reduce(
    (acc, card) => {
      const category = card.category.replace('-bias', '');
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(card);
      return acc;
    },
    {} as Record<string, Card[]>
  );

  // Group assigned cards by category for display
  const groupedAssignedCards = assignedBiasCards.reduce(
    (acc, card) => {
      const category = card.category.replace('-bias', '');
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(card);
      return acc;
    },
    {} as Record<string, Card[]>
  );

  const getCardNumber = (card: Card) =>
    card.displayNumber || String(card.id).padStart(2, '0');

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">Loading...</h2>
          <p className="text-gray-600 text-sm">Preparing Stage 1</p>
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
      <div className="flex h-full flex-col">
        <StageNavigation
          actions={
            <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline">
                  <Layers className="mr-2 h-4 w-4" />
                  View All Bias Cards
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] p-4 sm:w-[540px]">
                <SheetHeader className="p-0">
                  <SheetTitle>Bias Card Library</SheetTitle>
                  <SheetDescription>
                    Drag bias cards to risk categories to assess their potential
                    impact
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search bias cards..."
                    />
                  </div>

                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="pr-3">
                      {/* Available Cards Section */}
                      <div className="mb-6">
                        <h3 className="mb-3 font-medium text-green-600 text-sm">
                          Available Cards ({unassignedBiasCards.length})
                        </h3>
                        <Accordion
                          defaultValue={Object.keys(groupedBiasCards)}
                          type="multiple"
                        >
                          {Object.entries(groupedBiasCards).map(
                            ([category, cards]) => (
                              <AccordionItem key={category} value={category}>
                                <AccordionTrigger className="font-medium text-base capitalize hover:no-underline">
                                  {category} Biases ({cards.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {cards.map((card, _index) => (
                                      <DraggableCardEnhanced
                                        card={card}
                                        id={`card-${card.id}`}
                                        key={card.id}
                                      >
                                        <BiasCardList
                                          card={card as BiasCard}
                                          cardNumber={getCardNumber(card)}
                                          showCategory={false}
                                        />
                                      </DraggableCardEnhanced>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          )}
                        </Accordion>
                      </div>

                      {/* Already Assigned Cards Section */}
                      {assignedBiasCards.length > 0 && (
                        <div>
                          <h3 className="mb-3 font-medium text-muted-foreground text-sm">
                            Already Assigned ({assignedBiasCards.length})
                          </h3>
                          <Accordion type="multiple">
                            {Object.entries(groupedAssignedCards).map(
                              ([category, cards]) => (
                                <AccordionItem
                                  key={`assigned-${category}`}
                                  value={`assigned-${category}`}
                                >
                                  <AccordionTrigger className="font-medium text-base text-muted-foreground capitalize hover:no-underline">
                                    {category} Biases ({cards.length})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-2">
                                      {cards.map((card, _index) => (
                                        <div
                                          className="pointer-events-none opacity-50"
                                          key={card.id}
                                        >
                                          <BiasCardList
                                            card={card as BiasCard}
                                            cardNumber={getCardNumber(card)}
                                            showCategory={false}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )
                            )}
                          </Accordion>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
          }
          activityId={activityId}
          canComplete={hasMinimumCards}
          completionLabel="Complete Stage 1"
          currentStage={1}
          instructions="Categorise bias cards by their potential risk level for your project. Drag cards from the library to the appropriate risk categories below."
          onCompleteStage={handleCompleteStage}
          progress={{
            current: assignedCards,
            total: totalBiasCards,
            label: `${assignedCards}/${totalBiasCards} biases assessed (minimum = ${MINIMUM_REQUIRED})`,
          }}
          title="Stage 1: Risk Assessment"
        />

        {/* Risk categorization canvas */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <RiskCategoryZone
              assignments={highRiskCards}
              biasCards={biasCards}
              category="high-risk"
              isDragging={isDragging}
              onRemoveCard={removeBiasRisk}
            />
            <RiskCategoryZone
              assignments={mediumRiskCards}
              biasCards={biasCards}
              category="medium-risk"
              isDragging={isDragging}
              onRemoveCard={removeBiasRisk}
            />
            <RiskCategoryZone
              assignments={lowRiskCards}
              biasCards={biasCards}
              category="low-risk"
              isDragging={isDragging}
              onRemoveCard={removeBiasRisk}
            />
            <RiskCategoryZone
              assignments={needsDiscussionCards}
              biasCards={biasCards}
              category="needs-discussion"
              isDragging={isDragging}
              onRemoveCard={removeBiasRisk}
            />
          </div>
        </div>
      </div>

      <CardDragOverlay activeCard={activeCard} />

      {/* Warning Dialog - Less than minimum cards */}
      <Dialog onOpenChange={setShowWarningDialog} open={showWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minimum Cards Required</DialogTitle>
            <DialogDescription>
              You need to categorize at least {MINIMUM_REQUIRED} bias cards
              before proceeding to Stage 2. Currently, you have categorized{' '}
              {assignedCards} cards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWarningDialog(false)}>
              Continue Categorizing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Unassigned cards */}
      <Dialog
        onOpenChange={setShowConfirmationDialog}
        open={showConfirmationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proceed with Unassigned Cards?</DialogTitle>
            <DialogDescription>
              You have {unassignedCards} bias cards that haven't been
              categorized yet. These will be marked as "Ignored" and won't be
              considered in the next stages. Do you want to proceed or go back
              to categorize more cards?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowConfirmationDialog(false)}
              variant="outline"
            >
              Go Back
            </Button>
            <Button onClick={proceedToNextStage}>Proceed to Stage 2</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Navigation */}
      <StageFooter
        activityId={activityId}
        canComplete={hasMinimumCards}
        completionLabel="Complete Stage 1"
        currentStage={1}
        onCompleteStage={handleCompleteStage}
      />
    </DndContext>
  );
}
