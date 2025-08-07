'use client';

import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { ActivityStage } from '@/lib/types';

const STAGE_NAMES: Record<ActivityStage, string> = {
  1: 'Risk Categorization',
  2: 'Lifecycle Assignment',
  3: 'Rationale Documentation',
  4: 'Mitigation Selection',
  5: 'Implementation Planning',
};

const STAGE_DESCRIPTIONS: Record<ActivityStage, string> = {
  1: 'Categorize bias cards by risk level for your project',
  2: 'Assign relevant biases to specific lifecycle stages',
  3: 'Document rationale for bias assignments and decisions',
  4: 'Select appropriate mitigation strategies for identified biases',
  5: 'Plan implementation timeline and responsibilities',
};

export default function StageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();

  const activityId = params.id as string;
  const currentStageNumber = Number.parseInt(
    params.stageNumber as string,
    10
  ) as ActivityStage;

  const { getActivity, updateActivityStage, canAdvanceToStage } =
    useActivityStore();
  const {
    setCurrentActivityStage,
    isActivityStageComplete,
    completedActivityStages,
  } = useWorkspaceStore();

  const activity = getActivity(activityId);

  useEffect(() => {
    if (activity && currentStageNumber) {
      // Update activity stage tracking
      updateActivityStage(activityId, currentStageNumber);
      setCurrentActivityStage(currentStageNumber);
    }
  }, [
    activity,
    activityId,
    currentStageNumber,
    updateActivityStage,
    setCurrentActivityStage,
  ]);

  if (!activity) {
    return null; // Layout handles redirect
  }

  if (
    currentStageNumber < 1 ||
    currentStageNumber > 5 ||
    Number.isNaN(currentStageNumber)
  ) {
    router.push(`/activity/${activityId}/stage/1`);
    return null;
  }

  // If on generic stage route, redirect to specific stage
  if (
    window.location.pathname ===
    `/activity/${activityId}/stage/${currentStageNumber}`
  ) {
    // This will be handled by the individual stage page imports
  }

  const canGoBack = currentStageNumber > 1;
  const canGoForward =
    currentStageNumber < 5 &&
    canAdvanceToStage(activityId, currentStageNumber + 1);
  const isCurrentStageComplete = isActivityStageComplete(currentStageNumber);
  const completedStages = completedActivityStages.length;
  const progressPercentage = (completedStages / 5) * 100;

  const handlePrevious = () => {
    if (canGoBack) {
      router.push(`/activity/${activityId}/stage/${currentStageNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      router.push(`/activity/${activityId}/stage/${currentStageNumber + 1}`);
    }
  };

  const handleStageClick = (stage: ActivityStage) => {
    if (stage <= completedStages + 1) {
      router.push(`/activity/${activityId}/stage/${stage}`);
    }
  };

  return (
    <>
      {/* Header with navigation */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/activity/${activityId}/stage/1`}>
                  {activity.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Stage {currentStageNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Stage Progress Section */}
      <div className="border-b bg-muted/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-lg">
                Stage {currentStageNumber}: {STAGE_NAMES[currentStageNumber]}
              </h1>
              {isCurrentStageComplete && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {STAGE_DESCRIPTIONS[currentStageNumber]}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Stage indicators */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((stage) => {
                const isCompleted = completedStages >= stage;
                const isCurrent = stage === currentStageNumber;
                const isAccessible = stage <= completedStages + 1;

                return (
                  <button
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-xs transition-colors ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                          ? 'bg-amber-600 text-white'
                          : isAccessible
                            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                            : 'cursor-not-allowed bg-muted/50 text-muted-foreground/50'
                    }`}
                    disabled={!isAccessible}
                    key={stage}
                    onClick={() => handleStageClick(stage as ActivityStage)}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : stage}
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <Progress className="w-24" value={progressPercentage} />
              <Badge className="text-xs" variant="secondary">
                {completedStages}/5
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">{children}</div>

      {/* Footer navigation */}
      <div className="border-t bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            disabled={!canGoBack}
            onClick={handlePrevious}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button disabled={!canGoForward} onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
