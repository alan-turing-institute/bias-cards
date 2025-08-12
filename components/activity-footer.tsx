'use client';

import { ArrowRight, Check, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ActivityCompletionDialog } from '@/components/ui/activity-completion-dialog';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
  navigateToActivity,
  navigateToDashboard,
} from '@/lib/routing/navigation';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ActivityFooter() {
  const { currentActivity, canAdvanceToStage, completeStage, isHydrated } =
    useUnifiedActivityStore();
  const sidebar = useSidebar();

  const [currentStage, setCurrentStage] = useState<number | null>(null);
  const [activityId, setActivityId] = useState<string>('');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

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
  if (!currentStage) {
    return null;
  }

  // Use activity ID from hash or current activity
  const resolvedActivityId = activityId || currentActivity?.id || '';

  // Get completion status for current stage
  const { currentActivityData } = useUnifiedActivityStore.getState();
  const canComplete = (() => {
    if (!currentActivityData) {
      return false;
    }

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
              if (b.rationale?.[stage]) {
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
                    if (b.implementationNotes[stage]?.[mitId]) {
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
      if (currentStage === 5) {
        // Show completion dialog for stage 5
        setShowCompletionDialog(true);
      } else {
        // Complete stage and navigate to next
        completeStage(currentStage);
        navigateToActivity(resolvedActivityId, currentStage + 1);
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!(resolvedActivityId && currentActivity)) {
      return;
    }

    // Complete the activity
    completeStage(5);

    // Generate report directly from current activity
    const { createReport, updateReport } = useReportsStore.getState();
    const { biasCards, mitigationCards } = useCardsStore.getState();

    try {
      // Create the report
      const reportId = createReport(
        resolvedActivityId,
        {
          title: currentActivity.name || '',
          description: currentActivity.description || '',
          domain: 'General',
          objectives: '',
          scope: '',
          status: 'planning' as const,
          timeline: {
            startDate: currentActivity.getState().startTime,
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
        },
        'default-user',
        'Anonymous User'
      );

      // Generate analysis from current activity
      const biases = currentActivity.getBiases();
      const biasIdentificationsByStage: Record<string, any[]> = {};
      const mitigationStrategiesByBias: Record<string, any> = {};

      // Generate risk assessment summary (Stage 1)
      const riskDistribution = { high: 0, medium: 0, low: 0, unassigned: 0 };
      const biasesByCategory: {
        high: Array<{ id: string; name: string; assignedAt?: string }>;
        medium: Array<{ id: string; name: string; assignedAt?: string }>;
        low: Array<{ id: string; name: string; assignedAt?: string }>;
        unassigned: Array<{ id: string; name: string }>;
      } = {
        high: [],
        medium: [],
        low: [],
        unassigned: [],
      };

      Object.entries(biases).forEach(([biasId, biasData]) => {
        const biasCard = biasCards.find((c) => c.id === biasId);
        if (!biasCard) {
          return;
        }

        // Process risk assessment (Stage 1)
        if (biasData.riskCategory) {
          const category = biasData.riskCategory.replace('-risk', '') as
            | 'high'
            | 'medium'
            | 'low';

          // Ensure the category exists in our objects
          if (category in riskDistribution && category in biasesByCategory) {
            riskDistribution[category]++;
            biasesByCategory[category].push({
              id: biasId,
              name: biasCard.name,
              assignedAt: biasData.riskAssignedAt || undefined,
            });
          } else {
            // Fallback to unassigned if category is invalid
            riskDistribution.unassigned++;
            biasesByCategory.unassigned.push({
              id: biasId,
              name: biasCard.name,
            });
          }
        } else {
          riskDistribution.unassigned++;
          biasesByCategory.unassigned.push({
            id: biasId,
            name: biasCard.name,
          });
        }

        // Group biases by their lifecycle stages with rationale (Stages 2 & 3)
        (biasData.lifecycleAssignments || []).forEach((stage: string) => {
          if (!biasIdentificationsByStage[stage]) {
            biasIdentificationsByStage[stage] = [];
          }

          biasIdentificationsByStage[stage].push({
            biasCard,
            severity:
              biasData.riskCategory === 'high-risk'
                ? 'high'
                : biasData.riskCategory === 'medium-risk'
                  ? 'medium'
                  : 'low',
            confidence: 'medium',
            rationale: biasData.rationale?.[stage as LifecycleStage] || '',
            comments: [],
            identifiedAt: biasData.riskAssignedAt || new Date().toISOString(),
            identifiedBy: 'default-user',
          });
        });

        // Process mitigation strategies (Stages 4 & 5)
        Object.entries(biasData.mitigations || {}).forEach(
          ([stage, mitigationIds]) => {
            (mitigationIds as string[]).forEach((mitigationId) => {
              const mitigationCard = mitigationCards.find(
                (c) => c.id === mitigationId
              );
              if (!mitigationCard) {
                return;
              }

              const implementationNote = (
                biasData.implementationNotes as any
              )?.[stage]?.[mitigationId];

              if (!mitigationStrategiesByBias[biasId]) {
                mitigationStrategiesByBias[biasId] = {
                  biasId,
                  biasName: biasCard.name,
                  lifecycleStage: stage,
                  mitigations: [],
                };
              }

              mitigationStrategiesByBias[biasId].mitigations.push({
                mitigationCard,
                timeline: 'TBD',
                responsible: 'TBD',
                successCriteria: 'TBD',
                priority: 'medium',
                effectivenessRating:
                  implementationNote?.effectivenessRating || 0,
                implementationNotes: implementationNote?.notes || '',
                comments: [],
              });
            });
          }
        );
      });

      const totalAssessed = Object.keys(biases).length;
      const riskAssessmentSummary = {
        totalAssessed,
        distribution: riskDistribution,
        biasesByCategory,
        completionPercentage:
          totalAssessed > 0
            ? Math.round(
                ((totalAssessed - riskDistribution.unassigned) /
                  totalAssessed) *
                  100
              )
            : 0,
      };

      // Convert grouped biases to proper format
      const biasIdentifications = Object.entries(
        biasIdentificationsByStage
      ).map(([stage, biases]) => ({
        stage: stage as LifecycleStage,
        biases,
      }));

      // Convert mitigation strategies to array
      const mitigationStrategies = Object.values(mitigationStrategiesByBias);

      // Update the report with analysis
      updateReport(
        reportId,
        {
          analysis: {
            riskAssessmentSummary,
            biasIdentification: biasIdentifications,
            mitigationStrategies,
            executiveSummary: {
              keyFindings: [],
              riskAssessment: `Identified ${totalAssessed} biases: ${riskDistribution.high} high-risk, ${riskDistribution.medium} medium-risk, ${riskDistribution.low} low-risk`,
              recommendations: [],
            },
          },
        },
        'default-user',
        'Anonymous User'
      );

      // Redirect to report view
      window.location.href = `/reports/view?id=${reportId}`;
    } catch (_error) {}
  };

  const handleReturnToDashboard = () => {
    if (!resolvedActivityId) {
      return;
    }

    // Complete the activity
    completeStage(5);

    // Navigate to dashboard
    navigateToDashboard();
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

  const showNext =
    !canComplete &&
    currentStage < 5 &&
    (!isHydrated ||
      (!!resolvedActivityId && canAdvanceToStage(currentStage + 1)));

  const completionLabel =
    currentStage === 5 ? 'Complete Activity' : `Complete Stage ${currentStage}`;

  const leftOffset = sidebar?.open ? 'md:left-[16rem]' : 'md:left-[3rem]';

  // Get completed stages from current activity
  const activityState = currentActivity?.getState() as any;
  const completedStages = activityState?.completedStages || [];

  const stages = [
    { num: 1, label: 'Risk Assessment' },
    { num: 2, label: 'Lifecycle Assignment' },
    { num: 3, label: 'Rationale Documentation' },
    { num: 4, label: 'Mitigation Selection' },
    { num: 5, label: 'Implementation Planning' },
  ];

  const handleStageNavigation = (targetStage: number) => {
    if (!resolvedActivityId) {
      return;
    }
    if (canAdvanceToStage(targetStage)) {
      navigateToActivity(resolvedActivityId, targetStage);
    }
  };

  // Visual layout constants for precise alignment
  const STEP_WIDTH = 140; // distance between stage centers
  const LINE_Y_CLASS = 'top-4'; // 16px -> vertical center of 32px node

  const startX = STEP_WIDTH / 2; // center of first node within its slot

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 z-40 hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block',
        leftOffset
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Stage Progress Tracker */}
        <div className="flex items-center">
          <div className="relative flex items-center">
            {/* Background line that spans between first and last circles */}
            <div
              className={cn('absolute h-[2px] bg-border', LINE_Y_CLASS)}
              style={{
                left: `${startX}px`, // Start at center of first circle
                width: `${(stages.length - 1) * STEP_WIDTH}px`, // Span to center of last circle
              }}
            />

            {/* Colored line segments for completed stages */}
            {stages.map((stage, index) => {
              const isCompleted = completedStages.includes(stage.num);
              if (!isCompleted || index === stages.length - 1) {
                return null;
              }

              // Calculate segment position and width precisely between node centers
              const segmentLeft = startX + index * STEP_WIDTH; // start at current node center
              const segmentWidth = STEP_WIDTH; // Distance between node centers

              return (
                <div
                  className={cn('absolute h-[2px] bg-primary', LINE_Y_CLASS)}
                  key={`line-${stage.num}`}
                  style={{
                    left: `${segmentLeft}px`,
                    width: `${segmentWidth}px`,
                  }}
                />
              );
            })}

            {/* Stage circles */}
            {stages.map((stage) => {
              const isCompleted = completedStages.includes(stage.num);
              const isCurrent = stage.num === currentStage;
              const canAccess = !isHydrated || canAdvanceToStage(stage.num);

              return (
                <div
                  className="flex flex-col items-center"
                  key={stage.num}
                  style={{ width: `${STEP_WIDTH}px` }}
                >
                  {/* Circle */}
                  <button
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200',
                      isCompleted &&
                        'border-primary bg-primary text-primary-foreground hover:border-primary/90 hover:bg-primary/90',
                      isCurrent &&
                        !isCompleted &&
                        'border-secondary bg-secondary text-secondary-foreground hover:border-secondary/90 hover:bg-secondary/90',
                      !(isCompleted || isCurrent) &&
                        canAccess &&
                        'border-border bg-background text-muted-foreground hover:border-border hover:bg-muted',
                      !canAccess &&
                        'cursor-not-allowed border-border bg-muted text-muted-foreground'
                    )}
                    disabled={!canAccess}
                    onClick={() => handleStageNavigation(stage.num)}
                    title={stage.label}
                    type="button"
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="font-semibold text-xs">{stage.num}</span>
                    )}
                  </button>

                  {/* Label */}
                  <span
                    className={cn(
                      'mt-2 hidden max-w-[128px] whitespace-normal text-center text-[10px] tracking-wide md:block',
                      isCurrent
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleExportReport} size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>

          {canComplete && (
            <Button
              className={cn(
                'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
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

      {/* Activity Completion Dialog */}
      <ActivityCompletionDialog
        activityName={currentActivity?.name}
        onGenerateReport={handleGenerateReport}
        onOpenChange={setShowCompletionDialog}
        onReturnToDashboard={handleReturnToDashboard}
        open={showCompletionDialog}
      />
    </div>
  );
}
