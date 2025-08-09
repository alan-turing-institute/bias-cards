'use client';

import {
  Activity as ActivityIcon,
  Calendar,
  Clock,
  Edit3,
  Plus,
  Share2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReportClient from '@/components/activity/report';
// Import stage components
import Stage1Client from '@/components/activity/stages/stage1';
import Stage2Client from '@/components/activity/stages/stage2';
import Stage3Client from '@/components/activity/stages/stage3';
import Stage4Client from '@/components/activity/stages/stage4';
import Stage5Client from '@/components/activity/stages/stage5';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { HashRouterProvider, useHashRouter } from '@/lib/routing/hash-router';
import { navigateToActivity, navigateToReport } from '@/lib/routing/navigation';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type {
  ActivityStage,
  BiasRiskCategory,
  CardPair,
  LifecycleStage,
} from '@/lib/types';
import type { Activity } from '@/lib/types/activity';
import type { ReportSummary } from '@/lib/types/reports';

// Define specific meaningful bias-mitigation pairs for each stage
// This allows for stage-specific assignments rather than all combinations
type PairInfo = {
  biasId: string;
  mitigationId: string;
  reason: string;
};

type StageInfo = {
  biases?: string[];
  mitigations?: string[];
  notes?: string;
};

// Helper function to handle Missing Data Bias pairs
function getMissingDataBiasPairs(
  stageKey: LifecycleStage,
  stageInfo: StageInfo
): PairInfo[] {
  const pairs: PairInfo[] = [];

  if (!stageInfo.biases?.includes('18')) {
    return pairs;
  }

  if (stageKey === 'data-extraction-procurement') {
    if (stageInfo.mitigations?.includes('4')) {
      pairs.push({
        biasId: '18',
        mitigationId: '4',
        reason: 'Stakeholder engagement for missing data',
      });
    }
    if (stageInfo.mitigations?.includes('2')) {
      pairs.push({
        biasId: '18',
        mitigationId: '2',
        reason: 'Additional data collection for missing data',
      });
    }
  }

  if (stageKey === 'data-analysis' && stageInfo.mitigations?.includes('6')) {
    pairs.push({
      biasId: '18',
      mitigationId: '6',
      reason: 'Identify underrepresented groups for missing data',
    });
  }

  return pairs;
}

// Helper function to get general bias pairs
function getGeneralBiasPairs(stageInfo: StageInfo): PairInfo[] {
  const pairs: PairInfo[] = [];
  const biases = stageInfo.biases || [];
  const limitedMitigations = (stageInfo.mitigations || []).slice(0, 2);

  for (const biasId of biases) {
    if (biasId === '18') {
      continue; // Skip Missing Data Bias
    }

    for (const mitigationId of limitedMitigations) {
      pairs.push({ biasId, mitigationId, reason: 'selective pairing' });
    }
  }

  return pairs;
}

function getMeaningfulPairsForStage(
  stageKey: LifecycleStage,
  stageInfo: StageInfo
): PairInfo[] {
  const missingDataPairs = getMissingDataBiasPairs(stageKey, stageInfo);
  const generalPairs = getGeneralBiasPairs(stageInfo);

  return [...missingDataPairs, ...generalPairs];
}

// Helper to get risk mapping for demo biases
function getDemoRiskMapping(): Record<string, BiasRiskCategory> {
  return {
    // High Risk
    '7': 'high-risk', // Decision-Automation Bias
    '13': 'high-risk', // Implementation Bias
    '18': 'high-risk', // Missing Data Bias
    '23': 'high-risk', // Training-Serving Skew

    // Medium Risk
    '1': 'medium-risk', // Confirmation Bias
    '10': 'medium-risk', // Chronological Bias
    '14': 'medium-risk', // Label Bias
    '16': 'medium-risk', // Selection Bias

    // Low Risk
    '17': 'low-risk', // Status Quo Bias
    '8': 'low-risk', // Automation-Distrust Bias
    '6': 'low-risk', // Optimism Bias

    // Additional biases from demo data
    '2': 'medium-risk', // Availability Bias
    '11': 'medium-risk', // De-agentification Bias
    '12': 'medium-risk', // Historical Bias
    '15': 'medium-risk', // Representation Bias
    '21': 'medium-risk', // Measurement Bias
    '24': 'low-risk', // Wrong Sample Size Bias
  };
}

// Helper to seed stage assignments
function seedStageAssignments(
  stages: Record<string, StageInfo>,
  assignCardToStage: (
    cardId: string,
    stage: LifecycleStage,
    note?: string
  ) => void,
  assignBiasRisk: (
    cardId: string,
    risk: BiasRiskCategory,
    note?: string
  ) => void
) {
  const riskByBias = getDemoRiskMapping();

  for (const stageKey of Object.keys(stages) as LifecycleStage[]) {
    const stageInfo = stages[stageKey];
    if (!stageInfo) {
      continue;
    }

    const note = stageInfo.notes || `Demo rationale for ${stageKey}`;

    // Assign biases to stage and risk category
    for (const biasId of stageInfo.biases || []) {
      assignCardToStage(biasId, stageKey, note);
      const risk = riskByBias[biasId] || 'needs-discussion';
      assignBiasRisk(biasId, risk);
    }
  }
}

// Helper to clear existing card pairs
function clearExistingPairs(
  cardPairs: CardPair[],
  removeCardPair: (biasId: string, mitigationId: string) => void
) {
  for (const pair of cardPairs) {
    removeCardPair(pair.biasId, pair.mitigationId);
  }
}

// Helper to get demo annotation for a pair
function getDemoPairAnnotation(
  biasId: string,
  mitigationId: string,
  defaultReason: string
): { annotation: string; rating: number | undefined } {
  const isFirstConfirmationBiasPair = biasId === '1' && mitigationId === '4';
  const isFirstSelectionBiasPair = biasId === '16' && mitigationId === '2';

  if (isFirstConfirmationBiasPair) {
    return {
      annotation:
        'The Double Diamond methodology is highly effective for addressing confirmation bias.',
      rating: 5,
    };
  }

  if (isFirstSelectionBiasPair) {
    return {
      annotation: 'Data augmentation can help address selection bias.',
      rating: 3,
    };
  }

  return {
    annotation: defaultReason,
    rating: undefined,
  };
}

// Helper to seed card pairs
function seedCardPairs(
  stages: Record<string, StageInfo>,
  cardPairs: CardPair[],
  createCardPair: (
    biasId: string,
    mitigationId: string,
    annotation?: string,
    rating?: number
  ) => void,
  removeCardPair: (biasId: string, mitigationId: string) => void
) {
  // Clear existing pairs if re-seeding
  if (cardPairs.length > 0) {
    clearExistingPairs(cardPairs, removeCardPair);
  }

  for (const stageKey of Object.keys(stages) as LifecycleStage[]) {
    const stageInfo = stages[stageKey];
    if (!stageInfo) {
      continue;
    }

    const meaningfulPairs = getMeaningfulPairsForStage(stageKey, stageInfo);
    for (const { biasId, mitigationId, reason } of meaningfulPairs) {
      const { annotation, rating } = getDemoPairAnnotation(
        biasId,
        mitigationId,
        reason
      );
      createCardPair(biasId, mitigationId, annotation, rating);
    }
  }
}

// Seed demo workspace (Stage 1/2/3) from demo Activity metadata
function seedDemoWorkspaceIfNeeded(
  activity: Activity,
  currentStage: number | undefined
) {
  const {
    stageAssignments,
    biasRiskAssignments,
    cardPairs,
    activityId: wsActivityId,
    assignCardToStage,
    assignBiasRisk,
    createCardPair,
    removeCardPair,
    setCurrentActivityStage,
    setActivityId: setWSActivityId,
  } = useWorkspaceStore.getState();

  // Separate condition for stage assignments vs card pairs
  const shouldSeedStageAssignments =
    activity.isDemo &&
    (!wsActivityId ||
      wsActivityId !== activity.id ||
      (stageAssignments.length === 0 && biasRiskAssignments.length === 0));

  // Only seed card pairs if there are no existing pairs for this activity
  // This allows manual Stage 4 edits to persist
  const shouldSeedCardPairs =
    activity.isDemo && wsActivityId === activity.id && cardPairs.length === 0;

  if (!(shouldSeedStageAssignments || shouldSeedCardPairs)) {
    return;
  }

  const stages = activity.lifecycleStages || {};

  // Seed stage assignments if needed
  if (shouldSeedStageAssignments) {
    seedStageAssignments(stages, assignCardToStage, assignBiasRisk);
  }

  // Seed card pairs if needed (separate from stage assignments)
  if (shouldSeedCardPairs) {
    seedCardPairs(stages, cardPairs, createCardPair, removeCardPair);
  }

  if (currentStage) {
    setCurrentActivityStage(currentStage as unknown as ActivityStage);
  }
  setWSActivityId(activity.id);
}

// Handle route to activity by syncing workspace and seeding demo data
function handleActivityRoute(activityId?: string, stage?: number) {
  if (!activityId) {
    return;
  }

  const { getActivity, hasHydrated } = useActivityStore.getState();
  const activity = getActivity(activityId);

  if (!activity) {
    if (hasHydrated) {
      window.location.hash = '';
    }
    return;
  }

  const { setActivityId, updateWorkspaceName } = useWorkspaceStore.getState();
  setActivityId(activityId);
  updateWorkspaceName(activity.title);

  try {
    seedDemoWorkspaceIfNeeded(activity, stage);
  } catch (_e) {
    // Best-effort only
  }
}

const sectors = [
  'None',
  'Agriculture, Forestry & Fishing',
  'Mining, Quarrying & Extraction',
  'Energy Production & Supply',
  'Utilities & Environmental Services',
  'Construction & Civil Engineering',
  'Manufacturing & Industrial Production',
  'Wholesale & Retail Trade',
  'Transportation & Logistics',
  'Information, Communication & Media',
  'Financial Services',
  'Real‑Estate & Property Management',
  'Professional, Scientific & Technical Services',
  'Public Administration, Defence & Security',
  'Education & Training',
  'Health & Social Care',
  'Accommodation, Food Service & Tourism',
  'Arts, Entertainment & Creative Industries',
  'Legal Services & Justice',
  'Personal & Other Community Services',
  'Extraterrestrial & International Organisations',
];

// Activity Card Component
function ActivityCard({
  activity,
  onEdit,
  onExport,
  onDelete,
  reports,
}: {
  activity: Activity;
  onEdit: (activity: Activity, e?: React.MouseEvent) => void;
  onExport: (id: string) => void;
  onDelete: (id: string, title: string, isDemo?: boolean) => void;
  reports: ReportSummary[];
}) {
  const _router = useRouter();
  const isCompleted = activity.status === 'completed';

  return (
    <Card
      className="flex h-[400px] flex-col transition-shadow hover:shadow-lg"
      key={activity.id}
    >
      <CardHeader
        className="cursor-pointer"
        onClick={() => {
          if (!isCompleted) {
            navigateToActivity(activity.id, activity.currentStage);
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">
            {activity.title}
          </CardTitle>
          <div className="flex flex-shrink-0 gap-2">
            {activity.isDemo && <Badge variant="secondary">Demo</Badge>}
            {isCompleted ? (
              <Badge className="bg-green-600 text-white hover:bg-green-700">
                Completed
              </Badge>
            ) : (
              <Badge
                variant={
                  activity.status === 'in-progress' ? 'default' : 'outline'
                }
              >
                {activity.status === 'in-progress' ? 'In Progress' : 'Draft'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        <p className="mb-4 line-clamp-4 text-muted-foreground text-sm">
          {activity.description}
        </p>
        <div className="mt-auto space-y-3">
          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="mr-2 h-4 w-4" />
              Created: {new Date(activity.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="mr-2 h-4 w-4" />
              {isCompleted ? 'Completed' : 'Modified'}:{' '}
              {new Date(activity.lastModified).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>
                {isCompleted
                  ? 'Complete'
                  : `${activity.progress?.completed || 0}/${activity.progress?.total || 5} stages`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{
                  width: isCompleted
                    ? '100%'
                    : `${((activity.progress?.completed || 0) / (activity.progress?.total || 5)) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => {
                if (isCompleted) {
                  // Check if report already exists for this activity
                  const existingReport = reports.find(
                    (r) => r.activityId === activity.id
                  );
                  if (existingReport) {
                    _router.push(`/reports/view?id=${existingReport.id}`);
                  } else {
                    // Navigate to the activity report page which will create the report
                    navigateToReport(activity.id);
                  }
                } else {
                  navigateToActivity(activity.id, activity.currentStage);
                }
              }}
              size="sm"
            >
              {isCompleted ? 'View Report' : 'Continue'}
            </Button>
            <Button
              onClick={(e) => onEdit(activity, e)}
              size="sm"
              title="Edit activity details"
              variant="outline"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onExport(activity.id);
              }}
              size="sm"
              title="Export activity"
              variant="outline"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(activity.id, activity.title, activity.isDemo);
              }}
              size="sm"
              title="Delete activity"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard content component
function DashboardContent() {
  const _router = useRouter();
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    projectType: '',
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    message: string;
    success?: boolean;
  }>({ loading: false, message: '' });
  const isOnboardingActive = useOnboardingStore(
    (state) => state.isOnboardingActive
  );

  // Check for new=true query parameter (but not during onboarding)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true' && !isOnboardingActive) {
      setIsNewActivityOpen(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/activities');
    }
  }, [isOnboardingActive]);

  // Get data from Zustand store
  const activities = useActivityStore((state) => state.activities);
  const createActivity = useActivityStore((state) => state.createActivity);
  const updateActivity = useActivityStore((state) => state.updateActivity);
  const deleteActivity = useActivityStore((state) => state.deleteActivity);
  const exportActivity = useActivityStore((state) => state.exportActivity);
  const importActivity = useActivityStore((state) => state.importActivity);
  const reports = useReportsStore((state) => state.reports);

  // Convert Report[] to ReportSummary[]
  const reportSummaries: ReportSummary[] = reports.map((report) => ({
    id: report.id,
    activityId: report.activityId,
    title: report.projectInfo.title,
    status: report.metadata.status,
    createdAt: report.metadata.createdAt,
    lastModified: report.metadata.lastModified,
    version: report.metadata.version,
    owner: report.permissions.owner,
    domain: report.projectInfo.domain,
    tags: report.metadata.tags,
    biasCount: report.analysis.biasIdentification.reduce(
      (acc, stage) => acc + stage.biases.length,
      0
    ),
    mitigationCount: report.analysis.mitigationStrategies.length,
    completionPercentage:
      report.tracking.healthMetrics?.implementationProgress || 0,
    hasUnreadUpdates: false,
    isDemo: report.isDemo,
  }));

  // Filter activities by status
  const activeActivities = activities.filter(
    (activity) =>
      activity.status === 'draft' || activity.status === 'in-progress'
  );
  const completedActivities = activities.filter(
    (activity) => activity.status === 'completed'
  );

  const handleCreateActivity = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!activityForm.title.trim()) {
      return;
    }

    const activityId = createActivity({
      title: activityForm.title.trim(),
      description: activityForm.description.trim(),
      projectType: activityForm.projectType.trim(),
      progress: { completed: 0, total: 5 },
    });

    // Reset form
    setActivityForm({ title: '', description: '', projectType: '' });
    setIsNewActivityOpen(false);

    // Navigate to the activity page with hash routing
    navigateToActivity(activityId, 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleCreateActivity();
    }
  };

  const handleDeleteActivity = (
    id: string,
    title: string,
    isDemo?: boolean
  ) => {
    const message = isDemo
      ? `Delete demo activity "${title}"? This example content won't reappear after deletion.`
      : `Are you sure you want to delete "${title}"?`;
    if (window.confirm(message)) {
      deleteActivity(id);
    }
  };

  const handleExportActivity = (id: string) => {
    exportActivity(id, 'json');
  };

  const handleImportActivity = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportStatus({ loading: true, message: 'Importing activity...' });

    try {
      const result = await importActivity(file);

      setImportStatus({
        loading: false,
        message: result.message,
        success: result.success,
      });

      if (result.success && result.activityId) {
        // Close the import dialog after successful import
        setTimeout(() => {
          setIsImportDialogOpen(false);
          setImportStatus({ loading: false, message: '' });
          // Optionally navigate to the imported activity
          if (result.activityId) {
            navigateToActivity(result.activityId, 1);
          }
        }, 2000);
      }
    } catch (_error) {
      setImportStatus({
        loading: false,
        message: 'An unexpected error occurred during import.',
        success: false,
      });
    }

    // Reset the file input
    event.target.value = '';
  };

  const handleEditActivity = (activity: Activity, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title,
      description: activity.description,
      projectType: activity.projectType,
    });
  };

  const handleUpdateActivity = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!(editingActivity && activityForm.title.trim())) {
      return;
    }

    updateActivity(editingActivity.id, {
      title: activityForm.title.trim(),
      description: activityForm.description.trim(),
      projectType: activityForm.projectType.trim(),
    });

    // Reset form and close dialog
    setActivityForm({ title: '', description: '', projectType: '' });
    setEditingActivity(null);
  };

  const handleCloseDialog = () => {
    setIsNewActivityOpen(false);
    setEditingActivity(null);
    setActivityForm({ title: '', description: '', projectType: '' });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Activity</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your bias analysis activities and reports
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              onOpenChange={setIsImportDialogOpen}
              open={isImportDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Import Activity</DialogTitle>
                  <DialogDescription>
                    Import a previously exported bias analysis activity with all
                    its data.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="import-file">Select JSON file</Label>
                    <Input
                      accept=".json"
                      disabled={importStatus.loading}
                      id="import-file"
                      onChange={handleImportActivity}
                      type="file"
                    />
                    <p className="text-muted-foreground text-sm">
                      Select a JSON file exported from the Bias Cards
                      application.
                    </p>
                  </div>
                  {importStatus.message && (
                    <div
                      className={`rounded-md p-3 text-sm ${(() => {
                        if (importStatus.success === true) {
                          return 'border border-green-200 bg-green-50 text-green-700';
                        }
                        if (importStatus.success === false) {
                          return 'border border-red-200 bg-red-50 text-red-700';
                        }
                        return 'border border-blue-200 bg-blue-50 text-blue-700';
                      })()}`}
                    >
                      {importStatus.message}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setIsImportDialogOpen(false);
                      setImportStatus({ loading: false, message: '' });
                    }}
                    type="button"
                    variant="outline"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseDialog();
                } else if (!editingActivity) {
                  // Only set isNewActivityOpen if we're not editing
                  setIsNewActivityOpen(true);
                }
              }}
              open={isNewActivityOpen || !!editingActivity}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Activity
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[425px]"
                onEscapeKeyDown={handleCloseDialog}
              >
                <form
                  onSubmit={
                    editingActivity
                      ? handleUpdateActivity
                      : handleCreateActivity
                  }
                >
                  <DialogHeader>
                    <DialogTitle>
                      {editingActivity
                        ? 'Edit Activity'
                        : 'Create New Activity'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingActivity
                        ? 'Update the details of your bias analysis activity'
                        : 'Start a new bias analysis activity for your ML project'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        autoFocus
                        id="title"
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            title: e.target.value,
                          })
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., Healthcare AI Bias Review"
                        required
                        value={activityForm.title}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of your ML project and analysis goals"
                        rows={3}
                        value={activityForm.description}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="projectType">Domain/Sector</Label>
                      <Select
                        onValueChange={(value) =>
                          setActivityForm({
                            ...activityForm,
                            projectType: value,
                          })
                        }
                        value={activityForm.projectType}
                      >
                        <SelectTrigger className="w-full" id="projectType">
                          <SelectValue placeholder="Select a domain/sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCloseDialog}
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingActivity ? 'Save Changes' : 'Create & Start'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeActivities.map((activity) => (
            <ActivityCard
              activity={activity}
              key={activity.id}
              onDelete={handleDeleteActivity}
              onEdit={handleEditActivity}
              onExport={handleExportActivity}
              reports={reportSummaries}
            />
          ))}
          {activeActivities.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <ActivityIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 font-semibold text-gray-900 text-sm">
                No active activities
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                Get started by creating a new activity.
              </p>
            </div>
          )}
        </div>

        {/* Completed Activities Section */}
        {completedActivities.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-semibold text-xl">Completed Activities</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedActivities.map((activity) => (
                <ActivityCard
                  activity={activity}
                  key={activity.id}
                  onDelete={handleDeleteActivity}
                  onEdit={handleEditActivity}
                  onExport={handleExportActivity}
                  reports={reportSummaries}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Activity view content component
function ActivityViewContent() {
  const _router = useRouter();
  const { currentRoute } = useHashRouter();
  const [isClient, setIsClient] = useState(false);

  const { getActivity, initializeDemoData, hasHydrated } = useActivityStore();

  useEffect(() => {
    setIsClient(true);
    // Ensure demo data is initialized
    initializeDemoData();
  }, [initializeDemoData]);

  // Handle route changes
  useEffect(() => {
    if (!isClient) {
      return;
    }
    if (!(currentRoute.isValid && currentRoute.activityId)) {
      return;
    }
    handleActivityRoute(currentRoute.activityId, currentRoute.stage);
  }, [currentRoute, isClient]);

  // Show loading state during hydration
  if (!(isClient && hasHydrated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">Loading...</h2>
          <p className="text-gray-600 text-sm">Preparing activity</p>
        </div>
      </div>
    );
  }

  // Check if route is valid
  if (!(currentRoute.isValid && currentRoute.activityId)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">
            Invalid activity URL
          </h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const activity = getActivity(currentRoute.activityId);

  if (!activity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">
            Activity not found
          </h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate component based on the route
  if (currentRoute.view === 'report') {
    return <ReportClient />;
  }

  // Render the appropriate stage component
  switch (currentRoute.stage) {
    case 1:
      return <Stage1Client />;
    case 2:
      return <Stage2Client />;
    case 3:
      return <Stage3Client />;
    case 4:
      return <Stage4Client />;
    case 5:
      return <Stage5Client />;
    default:
      // Default to stage 1 if stage is invalid
      return <Stage1Client />;
  }
}

// Main component that decides what to render based on hash
function ActivitiesContent() {
  const { currentRoute } = useHashRouter();

  // If there's a valid activity hash, show the activity view
  if (currentRoute.isValid && currentRoute.activityId) {
    return <ActivityViewContent />;
  }

  // Otherwise, show the dashboard
  return <DashboardContent />;
}

// Main export with HashRouterProvider
export default function ActivitiesPage() {
  return (
    <HashRouterProvider>
      <ActivitiesContent />
    </HashRouterProvider>
  );
}
