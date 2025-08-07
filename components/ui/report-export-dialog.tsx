'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  FileType,
  Settings,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  downloadReport,
  generateBiasReport,
  type ReportConfig,
} from '@/lib/reports/report-generator';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import {
  getCompletionSummary,
  getNextAction,
  type ValidationGate,
  validateActivityCompletion,
} from '@/lib/validation/activity-validation';

interface ReportExportDialogProps {
  trigger: React.ReactNode;
}

const DEFAULT_CONFIG: ReportConfig = {
  includeExecutiveSummary: true,
  includeStageAnalysis: true,
  includeMitigationStrategies: true,
  includeAnnotations: true,
  includeRecommendations: true,
  includeVisualization: true,
  authorName: '',
  projectName: '',
};

// Component to render validation gates
function ValidationGatesList({ gates }: { gates: ValidationGate[] }) {
  return (
    <div className="space-y-3">
      {gates.map((gate) => {
        let icon: React.ReactNode;
        if (gate.passed) {
          icon = <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (gate.required) {
          icon = <AlertCircle className="h-4 w-4 text-red-500" />;
        } else {
          icon = <Clock className="h-4 w-4 text-amber-500" />;
        }

        return (
          <div
            className="flex items-start gap-3 rounded-lg border p-3"
            key={gate.id}
          >
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{gate.name}</h4>
                {gate.required && (
                  <Badge className="text-xs" variant="secondary">
                    Required
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                {gate.description}
              </p>
              {gate.details && (
                <p className="mt-1 font-mono text-muted-foreground text-xs">
                  {gate.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReportExportDialog({ trigger }: ReportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileName, setFileName] = useState('');

  const { biasCards, mitigationCards } = useCardsStore();
  const workspace = useWorkspaceStore();

  // Validate activity completion
  const validation = useMemo(
    () => validateActivityCompletion(workspace, biasCards, mitigationCards),
    [
      workspace.stageAssignments,
      workspace.cardPairs,
      workspace.customAnnotations,
      biasCards,
      mitigationCards,
      workspace,
    ]
  );

  const handleConfigChange = (
    key: keyof ReportConfig,
    value: boolean | string
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const getWorkspaceStats = () => {
    const assignedCards = workspace.stageAssignments.length;
    const createdPairs = workspace.cardPairs.length;
    const stagesUsed = new Set(workspace.stageAssignments.map((a) => a.stage))
      .size;
    const annotationsCount = workspace.customAnnotations
      ? Object.keys(workspace.customAnnotations).length
      : 0;

    return { assignedCards, createdPairs, stagesUsed, annotationsCount };
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);

      const reportData = {
        workspace: {
          sessionId: workspace.sessionId,
          name: workspace.name,
          createdAt: workspace.createdAt,
          lastModified: workspace.lastModified,
          currentStage: workspace.currentStage,
          completedActivityStages: workspace.completedActivityStages,
          biasRiskAssignments: workspace.biasRiskAssignments,
          stageAssignments: workspace.stageAssignments,
          cardPairs: workspace.cardPairs,
          selectedCardIds: workspace.selectedCardIds,
          customAnnotations: workspace.customAnnotations,
          completedStages: workspace.completedStages,
          activityProgress: workspace.activityProgress,
        },
        biasCards,
        mitigationCards,
        config,
      };

      const blob = await generateBiasReport(reportData);

      const finalFileName =
        fileName.trim() ||
        `bias-analysis-report-${new Date().toISOString().split('T')[0]}`;

      downloadReport(blob, `${finalFileName}.pdf`);
      setOpen(false);

      // Reset form
      setFileName('');
      setConfig(DEFAULT_CONFIG);
    } catch (_error) {
      // Error handling is managed by the export service
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = getWorkspaceStats();

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Analysis Report
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive PDF report of your bias analysis and
            mitigation strategies.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          className="w-full"
          defaultValue={validation.canGenerateReport ? 'content' : 'validation'}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="validation">
              {validation.canGenerateReport ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <AlertCircle className="mr-2 h-4 w-4" />
              )}
              Validation
            </TabsTrigger>
            <TabsTrigger
              disabled={!validation.canGenerateReport}
              value="content"
            >
              <FileType className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger
              disabled={!validation.canGenerateReport}
              value="settings"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="validation">
            <div className="space-y-4">
              {/* Completion Progress */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-sm">Activity Completion</h4>
                  <Badge
                    variant={
                      validation.canGenerateReport ? 'default' : 'secondary'
                    }
                  >
                    {validation.completionPercentage}%
                  </Badge>
                </div>
                <Progress
                  className="mb-2"
                  value={validation.completionPercentage}
                />
                <p className="text-muted-foreground text-xs">
                  {getCompletionSummary(validation)}
                </p>
              </div>

              {/* Next Action */}
              {!validation.canGenerateReport && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div>
                      <h4 className="font-medium text-amber-800 text-sm">
                        Next Step
                      </h4>
                      <p className="mt-1 text-amber-700 text-xs">
                        {getNextAction(validation)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {validation.canGenerateReport && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800 text-sm">
                        Ready for Report Generation
                      </h4>
                      <p className="mt-1 text-green-700 text-xs">
                        Your activity meets all required criteria. You can now
                        generate a comprehensive bias analysis report.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Gates */}
              <div>
                <h4 className="mb-3 font-medium text-sm">
                  Completion Criteria
                </h4>
                <ValidationGatesList gates={validation.gates} />
              </div>

              {/* Missing Requirements */}
              {validation.missingRequirements.length > 0 && (
                <div>
                  <h4 className="mb-3 font-medium text-sm">
                    Missing Requirements
                  </h4>
                  <div className="space-y-2">
                    {validation.missingRequirements.map((requirement) => (
                      <div className="flex items-start gap-2" key={requirement}>
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                        <p className="text-muted-foreground text-xs">
                          {requirement}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent className="space-y-4" value="content">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-sm">
                Current Workspace Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Cards assigned:
                    </span>
                    <Badge variant="secondary">{stats.assignedCards}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Pairs created:
                    </span>
                    <Badge variant="secondary">{stats.createdPairs}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stages used:</span>
                    <Badge variant="secondary">{stats.stagesUsed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annotations:</span>
                    <Badge variant="secondary">{stats.annotationsCount}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm">Report Sections</h4>

              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.includeExecutiveSummary}
                    id="executiveSummary"
                    onCheckedChange={(checked) =>
                      handleConfigChange(
                        'includeExecutiveSummary',
                        checked as boolean
                      )
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="executiveSummary"
                    >
                      Executive Summary
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      High-level overview of findings and key metrics
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.includeStageAnalysis}
                    id="stageAnalysis"
                    onCheckedChange={(checked) =>
                      handleConfigChange(
                        'includeStageAnalysis',
                        checked as boolean
                      )
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="stageAnalysis"
                    >
                      Lifecycle Stage Analysis
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Detailed breakdown of biases and mitigations by project
                      stage
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.includeMitigationStrategies}
                    id="mitigationStrategies"
                    onCheckedChange={(checked) =>
                      handleConfigChange(
                        'includeMitigationStrategies',
                        checked as boolean
                      )
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="mitigationStrategies"
                    >
                      Mitigation Strategies
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      All bias-mitigation pairs with effectiveness ratings
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.includeAnnotations}
                    id="annotations"
                    onCheckedChange={(checked) =>
                      handleConfigChange(
                        'includeAnnotations',
                        checked as boolean
                      )
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="annotations"
                    >
                      Custom Annotations
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Your custom notes and observations
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.includeRecommendations}
                    id="recommendations"
                    onCheckedChange={(checked) =>
                      handleConfigChange(
                        'includeRecommendations',
                        checked as boolean
                      )
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="recommendations"
                    >
                      Next Steps & Recommendations
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Actionable guidance for implementation
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.includeVisualization}
                    id="visualization"
                    onCheckedChange={(checked) =>
                      handleConfigChange(
                        'includeVisualization',
                        checked as boolean
                      )
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="visualization"
                    >
                      Lifecycle Visualization
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Visual representation of the project lifecycle with
                      assignments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent className="space-y-4" value="settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">Report File Name</Label>
                <Input
                  id="fileName"
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="bias-analysis-report"
                  value={fileName}
                />
                <p className="text-muted-foreground text-xs">
                  Leave blank to use default naming with current date
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name (optional)</Label>
                <Input
                  id="projectName"
                  onChange={(e) =>
                    handleConfigChange('projectName', e.target.value)
                  }
                  placeholder="Enter project name for the report"
                  value={config.projectName || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name (optional)</Label>
                <Input
                  id="authorName"
                  onChange={(e) =>
                    handleConfigChange('authorName', e.target.value)
                  }
                  placeholder="Your name"
                  value={config.authorName || ''}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={isGenerating || !validation.canGenerateReport}
            onClick={handleGenerateReport}
          >
            {(() => {
              if (isGenerating) {
                return (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
                    Generating...
                  </>
                );
              }
              if (validation.canGenerateReport) {
                return (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate PDF Report
                  </>
                );
              }
              return (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Complete Activity First
                </>
              );
            })()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
