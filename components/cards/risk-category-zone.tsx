'use client';

import { useDroppable } from '@dnd-kit/core';
import { AlertTriangle, CheckCircle, HelpCircle, Layers } from 'lucide-react';
import { BiasCardDropped } from '@/components/cards/bias-card-dropped';
import { DraggableCardEnhanced } from '@/components/cards/draggable-card-enhanced';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  BiasCard,
  BiasRiskAssignment,
  BiasRiskCategory,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskCategoryZoneProps {
  category: BiasRiskCategory;
  assignments: BiasRiskAssignment[];
  biasCards: BiasCard[];
  onRemoveCard: (cardId: string) => void;
  isDragging?: boolean;
}

const CATEGORY_CONFIG: Record<
  BiasRiskCategory,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    colors: {
      bg: string;
      border: string;
      text: string;
      hover: string;
    };
  }
> = {
  'high-risk': {
    title: 'High Risk',
    description: 'Biases with significant potential impact on your project',
    icon: AlertTriangle,
    colors: {
      // In dark mode, use mid-tone with low alpha for clearer contrast
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-500/40',
      text: 'text-red-700 dark:text-red-300',
      hover: 'border-red-300 dark:border-red-400',
    },
  },
  'medium-risk': {
    title: 'Medium Risk',
    description: 'Biases that may impact your project under certain conditions',
    icon: AlertTriangle,
    colors: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-200 dark:border-amber-500/40',
      text: 'text-amber-700 dark:text-amber-300',
      hover: 'border-amber-300 dark:border-amber-400',
    },
  },
  'low-risk': {
    title: 'Low Risk',
    description: 'Biases with minimal impact on your specific project context',
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-200 dark:border-green-500/40',
      text: 'text-green-700 dark:text-green-300',
      hover: 'border-green-300 dark:border-green-400',
    },
  },
  'needs-discussion': {
    title: 'Needs Discussion',
    description: 'Biases requiring team input or further analysis',
    icon: HelpCircle,
    colors: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/40',
      text: 'text-blue-700 dark:text-blue-300',
      hover: 'border-blue-300 dark:border-blue-400',
    },
  },
};

export function RiskCategoryZone({
  category,
  assignments,
  biasCards,
  onRemoveCard,
}: RiskCategoryZoneProps) {
  const config = CATEGORY_CONFIG[category];
  const IconComponent = config.icon;

  const { isOver, setNodeRef } = useDroppable({
    id: `risk-category-${category}`,
    data: {
      category,
      type: 'risk-category',
    },
  });

  // Get cards for this category
  const categoryCards = assignments
    .map((assignment) => {
      const card = biasCards.find((c) => c.id === assignment.cardId);
      return card ? { card, assignment } : null;
    })
    .filter(
      (item): item is { card: BiasCard; assignment: BiasRiskAssignment } =>
        item !== null
    );

  return (
    <Card
      className={cn(
        'flex h-full flex-col transition-all duration-200',
        config.colors.bg,
        config.colors.border,
        isOver && 'shadow-lg ring-2 ring-primary/30',
        isOver && config.colors.hover
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className={cn('h-5 w-5', config.colors.text)} />
            <div>
              <h3 className={cn('font-semibold text-base', config.colors.text)}>
                {config.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {config.description}
              </p>
            </div>
          </div>
          {categoryCards.length > 0 && (
            <Badge className="text-xs" variant="secondary">
              {categoryCards.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-3 pt-0">
        <div
          className={cn(
            'relative flex-1 rounded-lg border-2 border-dashed p-0 transition-all duration-200',
            isOver
              ? cn(config.colors.border, config.colors.bg)
              : 'border-muted-foreground/25'
          )}
          ref={setNodeRef}
        >
          {categoryCards.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {categoryCards.map(({ card, assignment }) => (
                  <DraggableCardEnhanced
                    card={card}
                    id={`risk-${category}-card-${card.id}-${assignment.timestamp || 'default'}`}
                    key={assignment.id || `${card.id}-${category}`}
                  >
                    <div className="group relative">
                      <BiasCardDropped
                        card={card as BiasCard}
                        cardNumber={
                          card.displayNumber || String(card.id).padStart(2, '0')
                        }
                      />
                      {/* Remove button */}
                      <button
                        aria-label={`Remove ${card.name} from ${config.title}`}
                        className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-md border bg-background/90 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:border-destructive hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onRemoveCard(card.id);
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
                        ×
                      </button>
                    </div>
                  </DraggableCardEnhanced>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Layers
                  className={cn(
                    'mx-auto mb-2 h-8 w-8',
                    isOver ? config.colors.text : 'text-muted-foreground/40'
                  )}
                />
                <p
                  className={cn(
                    'font-medium text-sm',
                    isOver ? config.colors.text : 'text-muted-foreground'
                  )}
                >
                  Drop bias cards here
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
