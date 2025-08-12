'use client';

import { ArrowRight, Check, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ActivityCompletionDialog } from '@/components/ui/activity-completion-dialog';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import type { BiasActivity } from '@/lib/activities/bias-activity';
import {
  navigateToActivity,
  navigateToDashboard,
} from '@/lib/routing/navigation';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
import type { BiasCard, LifecycleStage, MitigationCard } from '@/lib/types';
import type { BiasEntry } from '@/lib/types/bias-activity';
import type {
  BiasIdentification,
  MitigationStrategy,
} from '@/lib/types/reports';

import { cn } from '@/lib/utils';

// Types for report generation

interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
  unassigned: number;
}

interface BiasesByCategory {
  high: Array<{ id: string; name: string; assignedAt?: string }>;
  medium: Array<{ id: string; name: string; assignedAt?: string }>;
  low: Array<{ id: string; name: string; assignedAt?: string }>;
  unassigned: Array<{ id: string; name: string }>;
}

// Helper function to create initial report structure
function createBaseReport(
  resolvedActivityId: string,
  currentActivity: BiasActivity
): string {
  const { createReport } = useReportsStore.getState();

  return createReport(
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
}

// Helper function to determine severity from risk category
function getRiskSeverity(
  riskCategory?: string | null
): 'high' | 'medium' | 'low' {
  if (riskCategory === 'high-risk') {
    return 'high';
  }
  if (riskCategory === 'medium-risk') {
    return 'medium';
  }
  return 'low';
}

// Helper function to process risk assessment data
function processRiskAssessment(
  biases: Record<string, BiasEntry>,
  biasCards: BiasCard[]
): {
  riskDistribution: RiskDistribution;
  biasesByCategory: BiasesByCategory;
} {
  const riskDistribution: RiskDistribution = {
    high: 0,
    medium: 0,
    low: 0,
    unassigned: 0,
  };
  const biasesByCategory: BiasesByCategory = {
    high: [],
    medium: [],
    low: [],
    unassigned: [],
  };

  for (const [biasId, biasData] of Object.entries(biases)) {
    const biasCard = biasCards.find((c) => c.id === biasId);
    if (!biasCard) {
      continue;
    }

    if (biasData.riskCategory) {
      const category = biasData.riskCategory.replace('-risk', '') as
        | 'high'
        | 'medium'
        | 'low';

      if (category in riskDistribution && category in biasesByCategory) {
        riskDistribution[category]++;
        biasesByCategory[category].push({
          id: biasId,
          name: biasCard.name,
          assignedAt: biasData.riskAssignedAt || undefined,
        });
      } else {
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
  }

  return { riskDistribution, biasesByCategory };
}

// Helper function to process bias identifications by lifecycle stage
function processBiasIdentifications(
  biases: Record<string, BiasEntry>,
  biasCards: BiasCard[]
): BiasIdentification[] {
  const biasIdentificationsByStage: Record<
    string,
    Array<{
      biasCard: BiasCard;
      severity: 'low' | 'medium' | 'high';
      confidence: 'low' | 'medium' | 'high';
      rationale?: string;
      comments: never[]; // Use never[] for empty Comment array
      identifiedAt: string;
      identifiedBy: string;
    }>
  > = {};

  for (const [biasId, biasData] of Object.entries(biases)) {
    const biasCard = biasCards.find((c) => c.id === biasId);
    if (!biasCard) {
      continue;
    }

    for (const stage of biasData.lifecycleAssignments || []) {
      if (!biasIdentificationsByStage[stage]) {
        biasIdentificationsByStage[stage] = [];
      }

      biasIdentificationsByStage[stage].push({
        biasCard,
        severity: getRiskSeverity(biasData.riskCategory),
        confidence: 'medium' as const,
        rationale: biasData.rationale?.[stage as LifecycleStage] || '',
        comments: [] as never[], // Cast to never[] for Comment[] compatibility
        identifiedAt: biasData.riskAssignedAt || new Date().toISOString(),
        identifiedBy: 'default-user',
      });
    }
  }

  // Convert to the expected format
  return Object.entries(biasIdentificationsByStage).map(
    ([stage, identifications]) => ({
      stage: stage as LifecycleStage,
      biases: identifications as unknown as never[], // Cast to bypass strict typing
    })
  );
}

// Helper function to create mitigation strategy entry
function createMitigationStrategy(
  biasId: string,
  biasName: string,
  stage: string
): MitigationStrategy {
  return {
    biasId,
    biasName,
    lifecycleStage: stage as LifecycleStage,
    mitigations: [],
  };
}

// Helper function to create mitigation entry
function createMitigationEntry(
  mitigationCard: MitigationCard,
  implementationNote?: { effectivenessRating?: number; notes?: string }
) {
  return {
    mitigationCard,
    timeline: 'TBD',
    responsible: 'TBD',
    successCriteria: 'TBD',
    priority: 'medium' as const,
    effectivenessRating: implementationNote?.effectivenessRating || 0,
    implementationNotes: implementationNote?.notes || '',
    comments: [],
  };
}

// Helper function to process mitigation for a specific stage
function processStageMitigations(
  biasId: string,
  biasCard: BiasCard,
  biasData: BiasEntry,
  stage: string,
  mitigationIds: string[],
  mitigationCards: MitigationCard[],
  mitigationStrategiesByBias: Record<string, MitigationStrategy>
) {
  for (const mitigationId of mitigationIds) {
    const mitigationCard = mitigationCards.find((c) => c.id === mitigationId);
    if (!mitigationCard) {
      continue;
    }

    const implementationNote = (
      biasData.implementationNotes as Record<
        string,
        Record<string, { effectivenessRating?: number; notes?: string }>
      >
    )?.[stage]?.[mitigationId];

    if (!mitigationStrategiesByBias[biasId]) {
      mitigationStrategiesByBias[biasId] = createMitigationStrategy(
        biasId,
        biasCard.name,
        stage
      );
    }

    mitigationStrategiesByBias[biasId].mitigations.push(
      createMitigationEntry(mitigationCard, implementationNote)
    );
  }
}

// Helper function to process mitigation strategies
function processMitigationStrategies(
  biases: Record<string, BiasEntry>,
  biasCards: BiasCard[],
  mitigationCards: MitigationCard[]
): Record<string, MitigationStrategy> {
  const mitigationStrategiesByBias: Record<string, MitigationStrategy> = {};

  for (const [biasId, biasData] of Object.entries(biases)) {
    const biasCard = biasCards.find((c) => c.id === biasId);
    if (!biasCard) {
      continue;
    }

    for (const [stage, mitigationIds] of Object.entries(
      biasData.mitigations || {}
    )) {
      processStageMitigations(
        biasId,
        biasCard,
        biasData,
        stage,
        mitigationIds as string[],
        mitigationCards,
        mitigationStrategiesByBias
      );
    }
  }

  return mitigationStrategiesByBias;
}

// Main helper function to create report from activity
function createReportFromActivity(
  resolvedActivityId: string,
  currentActivity: BiasActivity
): string {
  const { updateReport } = useReportsStore.getState();
  const { biasCards, mitigationCards } = useCardsStore.getState();

  const reportId = createBaseReport(resolvedActivityId, currentActivity);
  const biases = currentActivity.getBiases();

  const { riskDistribution, biasesByCategory } = processRiskAssessment(
    biases,
    biasCards
  );
  const biasIdentifications = processBiasIdentifications(biases, biasCards);
  const mitigationStrategiesByBias = processMitigationStrategies(
    biases,
    biasCards,
    mitigationCards
  );

  const totalAssessed = Object.keys(biases).length;
  const riskAssessmentSummary = {
    totalAssessed,
    distribution: riskDistribution,
    biasesByCategory,
    completionPercentage:
      totalAssessed > 0
        ? Math.round(
            ((totalAssessed - riskDistribution.unassigned) / totalAssessed) *
              100
          )
        : 0,
  };

  const mitigationStrategies = Object.values(mitigationStrategiesByBias);

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

  return reportId;
}

// Regex pattern for parsing hash routes
const HASH_ROUTE_REGEX = /#\/([^/]+)\/stage\/(\d+)/;

// Helper function to determine if a stage can be completed
function getStageCompletionStatus(
  currentActivityData: { biases?: Record<string, BiasEntry> } | null,
  currentStage: number | null
): boolean {
  if (!(currentActivityData && currentStage)) {
    return false;
  }

  switch (currentStage) {
    case 1:
      return checkStage1Completion(currentActivityData);
    case 2:
      return checkStage2Completion(currentActivityData);
    case 3:
      return checkStage3Completion(currentActivityData);
    case 4:
      return checkStage4Completion(currentActivityData);
    case 5:
      return checkStage5Completion(currentActivityData);
    default:
      return false;
  }
}

function checkStage1Completion(currentActivityData: {
  biases?: Record<string, BiasEntry>;
}): boolean {
  const biases = currentActivityData.biases || {};
  const totalAssigned = Object.values(biases).filter(
    (b: BiasEntry) => b.riskCategory !== null && b.riskCategory !== undefined
  ).length;
  return totalAssigned >= 10;
}

function checkStage2Completion(currentActivityData: {
  biases?: Record<string, BiasEntry>;
}): boolean {
  const biases = currentActivityData.biases || {};
  const biasesWithLifecycle = Object.values(biases).filter(
    (b: BiasEntry) =>
      b.lifecycleAssignments && b.lifecycleAssignments.length > 0
  ).length;
  const totalBiases = Object.keys(biases).length;
  return totalBiases > 0 && biasesWithLifecycle >= totalBiases * 0.8;
}

function checkStage3Completion(currentActivityData: {
  biases?: Record<string, BiasEntry>;
}): boolean {
  const biases = currentActivityData.biases || {};
  let totalAssignments = 0;
  let assignmentsWithRationale = 0;

  for (const b of Object.values(biases) as BiasEntry[]) {
    if (b.lifecycleAssignments) {
      for (const stage of b.lifecycleAssignments) {
        totalAssignments++;
        if (b.rationale?.[stage]) {
          assignmentsWithRationale++;
        }
      }
    }
  }

  return (
    totalAssignments > 0 && assignmentsWithRationale >= totalAssignments * 0.6
  );
}

function checkStage4Completion(currentActivityData: {
  biases?: Record<string, BiasEntry>;
}): boolean {
  const biases = currentActivityData.biases || {};
  let totalMitigations = 0;

  for (const b of Object.values(biases) as BiasEntry[]) {
    if (b.mitigations) {
      for (const mitigations of Object.values(b.mitigations)) {
        if (Array.isArray(mitigations)) {
          totalMitigations += mitigations.length;
        }
      }
    }
  }

  return totalMitigations >= 5;
}

function checkStage5Completion(currentActivityData: {
  biases?: Record<string, BiasEntry>;
}): boolean {
  const biases = currentActivityData.biases || {};
  const mitigationCounts = calculateMitigationCounts(biases);

  return (
    mitigationCounts.total > 0 &&
    mitigationCounts.withNotes >= mitigationCounts.total * 0.8
  );
}

function calculateMitigationCounts(biases: Record<string, BiasEntry>): {
  total: number;
  withNotes: number;
} {
  let total = 0;
  let withNotes = 0;

  for (const bias of Object.values(biases)) {
    const counts = countBiasMitigations(bias);
    total += counts.total;
    withNotes += counts.withNotes;
  }

  return { total, withNotes };
}

// Helper function to count mitigations in a single stage
function countStageMitigations(
  stage: string,
  mitigations: unknown,
  implementationNotes: Record<string, Record<string, unknown>>
): { total: number; withNotes: number } {
  if (!Array.isArray(mitigations)) {
    return { total: 0, withNotes: 0 };
  }

  const total = mitigations.length;
  const withNotes = mitigations.filter(
    (mitId) => implementationNotes[stage]?.[mitId]
  ).length;

  return { total, withNotes };
}

function countBiasMitigations(bias: BiasEntry): {
  total: number;
  withNotes: number;
} {
  let total = 0;
  let withNotes = 0;

  if (!(bias.mitigations && bias.implementationNotes)) {
    return { total, withNotes };
  }

  for (const [stage, mitigations] of Object.entries(bias.mitigations)) {
    const counts = countStageMitigations(
      stage,
      mitigations,
      bias.implementationNotes
    );
    total += counts.total;
    withNotes += counts.withNotes;
  }

  return { total, withNotes };
}

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
      const match = hash.match(HASH_ROUTE_REGEX);
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
  const canComplete = getStageCompletionStatus(
    currentActivityData,
    currentStage
  );

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

  const handleGenerateReport = () => {
    if (!(resolvedActivityId && currentActivity)) {
      return;
    }

    completeStage(5);

    try {
      const reportId = createReportFromActivity(
        resolvedActivityId,
        currentActivity
      );
      window.location.href = `/reports/view?id=${reportId}`;
    } catch (_error) {
      // Silent error handling - report generation failed
    }
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
  const activityState = currentActivity?.getState() as {
    completedStages?: number[];
  };
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
