'use client';

import {
  Activity as ActivityIcon,
  Calendar,
  Clock,
  Edit3,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { navigateToActivity, navigateToReport } from '@/lib/routing/navigation';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import type { Activity } from '@/lib/types/activity';
import type { ReportSummary } from '@/lib/types/reports';

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
  const router = useRouter();
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
                  : `${activity.progress.completed}/${activity.progress.total} stages`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{
                  width: isCompleted
                    ? '100%'
                    : `${(activity.progress.completed / activity.progress.total) * 100}%`,
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
                    router.push(`/reports/view?id=${existingReport.id}`);
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

export default function DashboardPage() {
  const router = useRouter();
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    projectType: '',
  });
  const isOnboardingActive = useOnboardingStore(
    (state) => state.isOnboardingActive
  );

  // Check for new=true query parameter (but not during onboarding)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true' && !isOnboardingActive) {
      setIsNewActivityOpen(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [isOnboardingActive]);

  // Get data from Zustand store
  const activities = useActivityStore((state) => state.activities);
  const createActivity = useActivityStore((state) => state.createActivity);
  const updateActivity = useActivityStore((state) => state.updateActivity);
  const deleteActivity = useActivityStore((state) => state.deleteActivity);
  const exportActivity = useActivityStore((state) => state.exportActivity);
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
    router.push('/activity');
    // Set the hash after navigation
    setTimeout(() => {
      navigateToActivity(activityId, 1);
    }, 0);
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
                  editingActivity ? handleUpdateActivity : handleCreateActivity
                }
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingActivity ? 'Edit Activity' : 'Create New Activity'}
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
