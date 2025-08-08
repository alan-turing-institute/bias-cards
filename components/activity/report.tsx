'use client';

import { FileJson, FileText, FileType } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { BiasCard, MitigationCard } from '@/lib/types';
import { cn } from '@/lib/utils';

// Risk category colors
const RISK_COLORS = {
  'high-risk': 'bg-red-100 border-red-300 text-red-800',
  'medium-risk': 'bg-amber-100 border-amber-300 text-amber-800',
  'low-risk': 'bg-green-100 border-green-300 text-green-800',
  'needs-discussion': 'bg-blue-100 border-blue-300 text-blue-800',
};

// Helper function to download a file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchorEl = document.createElement('a');
  anchorEl.href = url;
  anchorEl.download = filename;
  document.body.appendChild(anchorEl);
  anchorEl.click();
  document.body.removeChild(anchorEl);
  URL.revokeObjectURL(url);
}

// Helper function to generate filename
function generateFilename(title: string, extension: string): string {
  return `bias-cards-report-${title
    .toLowerCase()
    .replace(/\s+/g, '-')}-${Date.now()}.${extension}`;
}

export default function ReportClient() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;

  const { getActivity } = useActivityStore();
  const { biasCards, mitigationCards, loadCards } = useCardsStore();
  const { stageAssignments, getBiasRiskAssignments, cardPairs } =
    useWorkspaceStore();
  const { reports, generateReportFromWorkspace } = useReportsStore();

  const [_exportFormat, _setExportFormat] = useState<
    'pdf' | 'markdown' | 'word' | 'json'
  >('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const activity = getActivity(activityId);

  // Load cards on mount
  useState(() => {
    loadCards();
  });

  // Check if report already exists for this activity
  useEffect(() => {
    const checkAndCreateReport = async () => {
      if (!activity) {
        return;
      }

      const existingReport = reports.find((r) => r.activityId === activityId);
      if (existingReport) {
        // Redirect to the reports system view
        router.push(`/reports/view?id=${existingReport.id}`);
      } else if (activity.status === 'completed') {
        // Create a report in the reports system
        try {
          const reportId = await generateReportFromWorkspace(activityId, {
            title: activity.title,
            description: activity.description,
            domain: activity.projectType || 'General',
            objectives: '',
            scope: '',
            status: 'testing' as const,
            timeline: {
              startDate: activity.createdAt,
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
          });

          // Redirect to the new report
          router.push(`/reports/view?id=${reportId}`);
        } catch (_error) {
          // Silently handle error - report generation failed
        }
      }
    };

    checkAndCreateReport();
  }, [activity, activityId, reports, generateReportFromWorkspace, router]);

  if (!activity) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">
            Activity not found
          </h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const biasRiskAssignments = getBiasRiskAssignments();

  // Calculate statistics
  const totalBiasCards = stageAssignments.length;
  const assignmentsWithRationale = stageAssignments.filter(
    (a) => a.annotation && a.annotation.trim().length > 0
  ).length;
  const totalMitigations = cardPairs.length;
  const pairsWithRating = cardPairs.filter(
    (p) => p.effectivenessRating && p.effectivenessRating > 0
  ).length;
  const pairsWithNotes = cardPairs.filter(
    (p) => p.annotation && p.annotation.trim().length > 0
  ).length;

  // Group data by stage
  const dataByStage = Object.entries(LIFECYCLE_STAGES).map(([key, stage]) => {
    const stageAssignmentsForStage = stageAssignments.filter(
      (a) => a.stage === key
    );
    const biasCardsForStage = stageAssignmentsForStage
      .map((a) => {
        const card = biasCards.find((c) => c.id === a.cardId);
        const riskAssignment = biasRiskAssignments.find(
          (r) => r.cardId === a.cardId
        );
        return card
          ? {
              ...card,
              rationale: a.annotation,
              riskCategory: riskAssignment?.riskCategory,
              mitigations: cardPairs
                .filter((p) => p.biasId === a.cardId)
                .map((p) => {
                  const mitigation = mitigationCards.find(
                    (m) => m.id === p.mitigationId
                  );
                  return mitigation
                    ? {
                        ...mitigation,
                        effectivenessRating: p.effectivenessRating,
                        notes: p.annotation,
                      }
                    : null;
                })
                .filter(Boolean) as Array<
                MitigationCard & {
                  effectivenessRating?: number;
                  notes?: string;
                }
              >,
            }
          : null;
      })
      .filter(Boolean) as Array<
      BiasCard & {
        rationale?: string;
        riskCategory?: string;
        mitigations: Array<
          MitigationCard & { effectivenessRating?: number; notes?: string }
        >;
      }
    >;

    return {
      stage: key,
      stageName: stage.name,
      biasCards: biasCardsForStage,
    };
  });

  // Helper function to export JSON data
  const exportJSON = () => {
    const exportData = {
      activity,
      stageAssignments,
      biasRiskAssignments,
      cardPairs,
      biasCards: biasCards.filter((c) =>
        stageAssignments.some((assignment) => assignment.cardId === c.id)
      ),
      mitigationCards: mitigationCards.filter((c) =>
        cardPairs.some((pair) => pair.mitigationId === c.id)
      ),
      exportedAt: new Date().toISOString(),
    };

    const content = JSON.stringify(exportData, null, 2);
    const filename = generateFilename(activity.title, 'json');
    downloadFile(content, filename, 'application/json');
  };

  // Helper functions for building markdown sections
  const buildMarkdownHeader = () => {
    return `# Bias Cards Analysis Report

## ${activity.title}

**Description:** ${activity.description || 'No description provided'}  
**Domain/Sector:** ${activity.projectType || 'Not specified'}  
**Generated:** ${new Date().toLocaleDateString()}

---
`;
  };

  const buildMarkdownSummary = () => {
    const ratioPercent = Math.round(
      (assignmentsWithRationale / totalBiasCards) * 100
    );
    return `## Summary Statistics

- **Total Bias Cards Identified:** ${totalBiasCards}
- **Cards with Rationale:** ${assignmentsWithRationale} (${ratioPercent}%)
- **Total Mitigation Strategies:** ${totalMitigations}
- **Mitigations with Effectiveness Rating:** ${pairsWithRating}
- **Mitigations with Implementation Notes:** ${pairsWithNotes}

---

## Bias Analysis by Lifecycle Stage

`;
  };

  const buildMitigationSection = (mitigation: {
    name: string;
    description: string;
    effectivenessRating?: number;
    notes?: string;
  }) => {
    let section = `- **${mitigation.name}**
  - Description: ${mitigation.description}
`;
    if (mitigation.effectivenessRating) {
      section += `  - Effectiveness Rating: ${mitigation.effectivenessRating}/5
`;
    }
    if (mitigation.notes) {
      section += `  - Implementation Notes: ${mitigation.notes}
`;
    }
    return `${section}\n`;
  };

  const buildBiasCardSection = (card: {
    name: string;
    category: string;
    riskCategory?: string;
    description: string;
    rationale?: string;
    mitigations: Array<{
      name: string;
      description: string;
      effectivenessRating?: number;
      notes?: string;
    }>;
  }) => {
    let section = `#### ${card.name}

**Category:** ${card.category}  
**Risk Level:** ${card.riskCategory || 'Not assessed'}  
**Description:** ${card.description}

`;

    if (card.rationale) {
      section += `**Rationale:** ${card.rationale}

`;
    }

    if (card.mitigations.length > 0) {
      section += `**Mitigation Strategies:**

`;
      for (const mitigation of card.mitigations) {
        section += buildMitigationSection(mitigation);
      }
    }

    return `${section}---\n\n`;
  };

  // Main export markdown function (simplified)
  const exportMarkdown = () => {
    let markdown = buildMarkdownHeader();
    markdown += buildMarkdownSummary();

    for (const { stageName, biasCards: stageCards } of dataByStage) {
      if (stageCards.length === 0) {
        continue;
      }

      markdown += `### ${stageName}\n\n`;

      for (const card of stageCards as Array<{
        name: string;
        category: string;
        riskCategory?: string;
        description: string;
        rationale?: string;
        mitigations: Array<{
          name: string;
          description: string;
          effectivenessRating?: number;
          notes?: string;
        }>;
      }>) {
        markdown += buildBiasCardSection(card);
      }
    }

    const filename = generateFilename(activity.title, 'md');
    downloadFile(markdown, filename, 'text/markdown');
  };

  const handleExport = (format: 'pdf' | 'markdown' | 'word' | 'json') => {
    setIsExporting(true);

    try {
      if (format === 'json') {
        exportJSON();
      } else if (format === 'markdown') {
        exportMarkdown();
      } else {
        // PDF and Word export not yet implemented
        alert(`${format.toUpperCase()} export functionality coming soon!`);
      }
    } catch (_error) {
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl">{activity.title}</h1>
              <p className="mt-2 text-muted-foreground">
                Bias Analysis Report - {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/activity/${activityId}/stage/${activity.currentStage}`
                  )
                }
                variant="outline"
              >
                View Activity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-6xl p-6">
          {/* Summary Statistics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>
                Overview of your bias analysis activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Bias Cards Identified
                    </span>
                    <Badge variant="secondary">{totalBiasCards}</Badge>
                  </div>
                  <Progress
                    className="mt-2"
                    value={(assignmentsWithRationale / totalBiasCards) * 100}
                  />
                  <p className="mt-1 text-muted-foreground text-xs">
                    {assignmentsWithRationale} with rationale
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Mitigation Strategies
                    </span>
                    <Badge variant="secondary">{totalMitigations}</Badge>
                  </div>
                  <Progress
                    className="mt-2"
                    value={(pairsWithRating / totalMitigations) * 100}
                  />
                  <p className="mt-1 text-muted-foreground text-xs">
                    {pairsWithRating} with effectiveness rating
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Implementation Notes
                    </span>
                    <Badge variant="secondary">{pairsWithNotes}</Badge>
                  </div>
                  <Progress
                    className="mt-2"
                    value={(pairsWithNotes / totalMitigations) * 100}
                  />
                  <p className="mt-1 text-muted-foreground text-xs">
                    {pairsWithNotes} documented
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Export Report</CardTitle>
              <CardDescription>
                Download your bias analysis report in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  className="h-24 flex-col gap-2"
                  disabled={isExporting}
                  onClick={() => handleExport('pdf')}
                  variant="outline"
                >
                  <FileText className="h-8 w-8" />
                  <span>PDF Report</span>
                  <Badge className="text-xs" variant="secondary">
                    Coming Soon
                  </Badge>
                </Button>
                <Button
                  className="h-24 flex-col gap-2"
                  disabled={isExporting}
                  onClick={() => handleExport('markdown')}
                  variant="outline"
                >
                  <FileType className="h-8 w-8" />
                  <span>Markdown</span>
                  <Badge className="text-xs" variant="default">
                    Available
                  </Badge>
                </Button>
                <Button
                  className="h-24 flex-col gap-2"
                  disabled={isExporting}
                  onClick={() => handleExport('word')}
                  variant="outline"
                >
                  <FileText className="h-8 w-8" />
                  <span>Word Document</span>
                  <Badge className="text-xs" variant="secondary">
                    Coming Soon
                  </Badge>
                </Button>
                <Button
                  className="h-24 flex-col gap-2"
                  disabled={isExporting}
                  onClick={() => handleExport('json')}
                  variant="outline"
                >
                  <FileJson className="h-8 w-8" />
                  <span>JSON Data</span>
                  <Badge className="text-xs" variant="default">
                    Available
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Review your bias analysis before exporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-6">
                <h3 className="mb-4 font-semibold text-lg">
                  Bias Analysis by Lifecycle Stage
                </h3>
                {dataByStage.map(
                  ({ stage, stageName, biasCards: stageCards }) => {
                    if (stageCards.length === 0) {
                      return null;
                    }

                    return (
                      <div className="mb-6" key={stage}>
                        <h4 className="mb-3 font-medium text-base">
                          {stageName}
                        </h4>
                        <div className="space-y-3">
                          {stageCards.map((card) => (
                            <div
                              className="rounded-md border p-4"
                              key={card.id}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <h5 className="font-medium">{card.name}</h5>
                                {card.riskCategory && (
                                  <Badge
                                    className={cn(
                                      'text-xs',
                                      RISK_COLORS[
                                        card.riskCategory as keyof typeof RISK_COLORS
                                      ]
                                    )}
                                  >
                                    {card.riskCategory.replace('-', ' ')}
                                  </Badge>
                                )}
                              </div>
                              <p className="mb-2 text-muted-foreground text-sm">
                                {card.description}
                              </p>
                              {card.rationale && (
                                <div className="mb-2">
                                  <p className="font-medium text-sm">
                                    Rationale:
                                  </p>
                                  <p className="text-sm">{card.rationale}</p>
                                </div>
                              )}
                              {card.mitigations.length > 0 && (
                                <div>
                                  <p className="mb-1 font-medium text-sm">
                                    Mitigation Strategies:
                                  </p>
                                  <ul className="list-inside list-disc space-y-1 text-sm">
                                    {card.mitigations.map((mitigation) => (
                                      <li key={mitigation.id}>
                                        <span className="font-medium">
                                          {mitigation.name}
                                        </span>
                                        {mitigation.effectivenessRating && (
                                          <span className="text-muted-foreground">
                                            {' '}
                                            (Rating:{' '}
                                            {mitigation.effectivenessRating}
                                            /5)
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
