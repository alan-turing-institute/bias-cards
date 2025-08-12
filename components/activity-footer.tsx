'use client';

import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
import { cn } from '@/lib/utils';

export function ActivityFooter() {
  const { currentActivity, canAdvanceToStage, completeStage, isHydrated } =
    useUnifiedActivityStore();
  const sidebar = useSidebar();

  const [currentStage, setCurrentStage] = useState<number | null>(null);
  const [activityId, setActivityId] = useState<string>('');

  useEffect(() => {
    // Parse the hash to get current stage and activity
    const parseHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/([^/]+)\/stage\/(\d+)/);
      if (match) {
        setActivityId(match[1]);
        setCurrentStage(Number.parseInt(match[2], 10));
      } else {
        setCurrentStage(null);
        setActivityId('');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Only show footer on activity stages
  if (!currentStage) return null;

  // Use activity ID from hash or current activity
  const resolvedActivityId = activityId || currentActivity?.id || '';

  // Get completion status for current stage
  const { currentActivityData } = useUnifiedActivityStore.getState();
  const canComplete = (() => {
    if (!currentActivityData) return false;

    switch (currentStage) {
      case 1: {
        const biases = currentActivityData.biases || {};
        const totalAssigned = Object.values(biases).filter(
          (b: any) => b.riskCategory !== null && b.riskCategory !== undefined
        ).length;
        return totalAssigned >= 10;
      }
      case 2: {
        // Check if 80% of biases have lifecycle assignments
        const biases = currentActivityData.biases || {};
        const biasesWithLifecycle = Object.values(biases).filter(
          (b: any) =>
            b.lifecycleAssignments && b.lifecycleAssignments.length > 0
        ).length;
        const totalBiases = Object.keys(biases).length;
        return totalBiases > 0 && biasesWithLifecycle >= totalBiases * 0.8;
      }
      case 3: {
        // Check if 60% of lifecycle assignments have rationale
        const biases = currentActivityData.biases || {};
        let totalAssignments = 0;
        let assignmentsWithRationale = 0;

        Object.values(biases).forEach((b: any) => {
          if (b.lifecycleAssignments) {
            b.lifecycleAssignments.forEach((stage: string) => {
              totalAssignments++;
              if (b.rationale && b.rationale[stage]) {
                assignmentsWithRationale++;
              }
            });
          }
        });

        return (
          totalAssignments > 0 &&
          assignmentsWithRationale >= totalAssignments * 0.6
        );
      }
      case 4: {
        // Check if at least 5 mitigation pairs exist
        const biases = currentActivityData.biases || {};
        let totalMitigations = 0;

        Object.values(biases).forEach((b: any) => {
          if (b.mitigations) {
            Object.values(b.mitigations).forEach((mitigations: any) => {
              if (Array.isArray(mitigations)) {
                totalMitigations += mitigations.length;
              }
            });
          }
        });

        return totalMitigations >= 5;
      }
      case 5: {
        // Check if 80% of mitigations have implementation notes
        const biases = currentActivityData.biases || {};
        let totalMitigations = 0;
        let mitigationsWithNotes = 0;

        Object.values(biases).forEach((b: any) => {
          if (b.mitigations && b.implementationNotes) {
            Object.entries(b.mitigations).forEach(
              ([stage, mitigations]: [string, any]) => {
                if (Array.isArray(mitigations)) {
                  mitigations.forEach((mitId: string) => {
                    totalMitigations++;
                    if (
                      b.implementationNotes[stage] &&
                      b.implementationNotes[stage][mitId]
                    ) {
                      mitigationsWithNotes++;
                    }
                  });
                }
              }
            );
          }
        });

        return (
          totalMitigations > 0 && mitigationsWithNotes >= totalMitigations * 0.8
        );
      }
      default:
        return false;
    }
  })();

  const handlePreviousStage = () => {
    if (currentStage > 1 && resolvedActivityId) {
      navigateToActivity(resolvedActivityId, currentStage - 1);
    }
  };

  const handleNextStage = () => {
    if (
      currentStage < 5 &&
      resolvedActivityId &&
      canAdvanceToStage(currentStage + 1)
    ) {
      navigateToActivity(resolvedActivityId, currentStage + 1);
    }
  };

  const handleCompleteStage = () => {
    if (resolvedActivityId && canComplete) {
      completeStage(currentStage);
      if (currentStage < 5) {
        navigateToActivity(resolvedActivityId, currentStage + 1);
      }
    }
  };

  const handleExportReport = () => {
    const activity = currentActivity;
    if (activity) {
      import('@/lib/reports/bias-report').then(({ BiasReport }) => {
        const report = new BiasReport(activity);
        const markdown = report.exportToMarkdown(true);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interim-report-stage-${currentStage}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  };

  const showPrev = currentStage > 1;
  const showNext =
    !canComplete &&
    currentStage < 5 &&
    (!isHydrated ||
      (!!resolvedActivityId && canAdvanceToStage(currentStage + 1)));

  const completionLabel =
    currentStage === 5 ? 'Complete Activity' : `Complete Stage ${currentStage}`;

  const leftOffset = sidebar?.open ? 'md:left-[16rem]' : 'md:left-[3rem]';

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 z-40 hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block',
        leftOffset
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Previous button */}
          <div className="flex items-center gap-2">
            {showPrev && (
              <Button onClick={handlePreviousStage} size="sm" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          {/* Right side - Export and Complete/Next buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={handleExportReport} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>

            {canComplete && (
              <Button
                className={cn('bg-green-600 text-white hover:bg-green-700')}
                onClick={handleCompleteStage}
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

            {showNext && (
              <Button onClick={handleNextStage} size="sm">
                Next Stage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
