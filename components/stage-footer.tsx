'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useActivityStore } from '@/lib/stores/activity-store';

interface StageFooterProps {
  activityId: string;
  currentStage: number;
  onCompleteStage?: () => void;
  canComplete?: boolean;
  completionLabel?: string;
}

export function StageFooter({
  activityId,
  currentStage,
  onCompleteStage,
  canComplete = false,
  completionLabel = 'Complete Stage',
}: StageFooterProps) {
  const { canAdvanceToStage } = useActivityStore();

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

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          {currentStage > 1 && (
            <Button onClick={handlePreviousStage} size="sm" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Complete stage button */}
          {onCompleteStage && (
            <Button disabled={!canComplete} onClick={onCompleteStage} size="sm">
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
    </div>
  );
}
