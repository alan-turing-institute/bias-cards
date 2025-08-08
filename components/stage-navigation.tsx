'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Settings2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useActivityStore } from '@/lib/stores/activity-store';
import { cn } from '@/lib/utils';

interface StageNavigationProps {
  activityId: string;
  currentStage: number;
  title: string;
  instructions: string;
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  actions?: React.ReactNode;
  onCompleteStage?: () => void;
  canComplete?: boolean;
  completionLabel?: string;
}

const STAGE_NAMES = {
  1: 'Risk Assessment',
  2: 'Lifecycle Assignment',
  3: 'Rationale Documentation',
  4: 'Mitigation Selection',
  5: 'Implementation Planning',
};

export function StageNavigation({
  activityId,
  currentStage,
  title,
  instructions,
  progress,
  actions,
  onCompleteStage,
  canComplete = false,
  completionLabel = 'Complete Stage',
}: StageNavigationProps) {
  const { getActivity, canAdvanceToStage } = useActivityStore();

  const activity = getActivity(activityId);
  const completedStages = activity?.progress.completed || 0;
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  const handleStageNavigation = (targetStage: number) => {
    if (canAdvanceToStage(activityId, targetStage)) {
      navigateToActivity(activityId, targetStage);
    }
  };

  const handlePreviousStage = () => {
    if (currentStage > 1) {
      handleStageNavigation(currentStage - 1);
    }
  };

  const handleNextStage = () => {
    if (currentStage < 5 && canAdvanceToStage(activityId, currentStage + 1)) {
      handleStageNavigation(currentStage + 1);
    }
  };

  const progressPercentage = (() => {
    if (progress) {
      return progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
    }
    return (completedStages / 5) * 100;
  })();

  return (
    <div className="border-b bg-background">
      {/* Stage Progress Indicator */}
      <div className="border-b">
        <ScrollArea className="w-full">
          <div className="flex items-center justify-center px-2 py-3 md:px-6">
            <div className="flex items-center rounded-full bg-gray-200 p-1 shadow-sm">
              {[1, 2, 3, 4, 5].map((stage, index) => {
                const isCompleted = stage <= completedStages;
                const isCurrent = stage === currentStage;
                const canAccess = canAdvanceToStage(activityId, stage);
                const _isFirst = index === 0;
                const isLast = index === 4;

                return (
                  <div className="flex items-center" key={stage}>
                    <button
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-1.5 font-medium text-xs transition-all duration-200 md:gap-2 md:px-3 md:py-2 md:text-sm',
                        'min-w-[48px] justify-center md:min-w-[140px]',
                        isCurrent &&
                          'scale-105 bg-amber-500 text-white shadow-md',
                        isCompleted &&
                          !isCurrent &&
                          'bg-green-500 text-white hover:bg-green-600',
                        !(isCompleted || isCurrent) &&
                          canAccess &&
                          'bg-white text-gray-700 shadow-sm hover:bg-gray-50',
                        !canAccess &&
                          'cursor-not-allowed bg-gray-100 text-gray-400'
                      )}
                      disabled={!canAccess}
                      onClick={() => handleStageNavigation(stage)}
                      type="button"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <Circle
                          className={cn(
                            'h-3 w-3 md:h-4 md:w-4',
                            isCurrent && 'fill-current'
                          )}
                        />
                      )}
                      <span className="hidden md:inline">
                        {STAGE_NAMES[stage as keyof typeof STAGE_NAMES]}
                      </span>
                      <span className="font-bold md:hidden">{stage}</span>
                    </button>

                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className={cn(
                          'mx-0.5 h-0.5 w-1 md:mx-1 md:w-2',
                          isCompleted || stage < currentStage
                            ? 'bg-green-400'
                            : 'bg-gray-300'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Current Stage Header */}
      <div className="space-y-4 px-4 py-4 md:px-6">
        {/* Title and Progress */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 font-bold text-xl md:text-2xl">{title}</h1>

            {/* Collapsible Instructions for Mobile */}
            <Collapsible
              className="md:hidden"
              onOpenChange={setInstructionsOpen}
              open={instructionsOpen}
            >
              <CollapsibleTrigger className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground">
                <span className="line-clamp-1">{instructions}</span>
                {instructionsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="mt-2 text-muted-foreground text-sm">
                  {instructions}
                </p>
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop Instructions */}
            <p className="hidden text-base text-muted-foreground md:block">
              {instructions}
            </p>

            {/* Progress indicator if provided */}
            {progress && (
              <div className="mt-3">
                <div className="max-w-sm">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground text-xs md:text-sm">
                      {progress.label || 'Progress'}
                    </span>
                    <span className="font-medium text-xs md:text-sm">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress className="h-2" value={progressPercentage} />
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons - Desktop */}
          <div className="hidden items-center gap-2 md:flex">
            {currentStage > 1 && (
              <Button onClick={handlePreviousStage} size="sm" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}

            {/* Complete stage button */}
            {onCompleteStage && (
              <Button
                className={cn(
                  canComplete && 'bg-green-600 text-white hover:bg-green-700'
                )}
                disabled={!canComplete}
                onClick={onCompleteStage}
                size="sm"
              >
                {currentStage < 5 ? (
                  <>
                    {completionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  completionLabel
                )}
              </Button>
            )}

            {/* Next stage button (only if no complete handler) */}
            {!onCompleteStage &&
              currentStage < 5 &&
              canAdvanceToStage(activityId, currentStage + 1) && (
                <Button onClick={handleNextStage} size="sm">
                  Next Stage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
          </div>
        </div>

        {/* Action Controls Section */}
        {actions && (
          <>
            {/* Desktop Actions */}
            <div className="hidden rounded-lg border bg-gray-50 p-4 md:block">
              {actions}
            </div>

            {/* Mobile Actions - Dropdown Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[calc(100vw-32px)] max-w-[400px]"
                >
                  <DropdownMenuLabel>Stage Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">{actions}</div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}

        {/* Mobile Navigation Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          {currentStage > 1 && (
            <Button
              className="flex-1"
              onClick={handlePreviousStage}
              size="sm"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}

          {/* Complete stage button */}
          {onCompleteStage && (
            <Button
              className={cn(
                'flex-1',
                canComplete && 'bg-green-600 text-white hover:bg-green-700'
              )}
              disabled={!canComplete}
              onClick={onCompleteStage}
              size="sm"
            >
              {currentStage < 5 ? (
                <>
                  {completionLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                completionLabel
              )}
            </Button>
          )}

          {/* Next stage button (only if no complete handler) */}
          {!onCompleteStage &&
            currentStage < 5 &&
            canAdvanceToStage(activityId, currentStage + 1) && (
              <Button className="flex-1" onClick={handleNextStage} size="sm">
                Next Stage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
