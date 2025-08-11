'use client';

import { Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ActivityCombobox } from '@/components/ui/activity-combobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';

interface SessionRecoveryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SessionRecoveryDialog({
  open: controlledOpen,
  onOpenChange,
}: SessionRecoveryDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<
    string | undefined
  >();
  const [showActivitySelector, setShowActivitySelector] = useState(false);

  const activities = useActivityStore((state) => state.activities);
  const workspaceStore = useWorkspaceStore();

  // Get the most recent in-progress or draft activity
  const mostRecentActivity = activities
    .filter((activity) => activity.status !== 'completed')
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )[0];

  // Use controlled state if provided
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  // Auto-open if there are activities to resume
  useEffect(() => {
    if (controlledOpen === undefined && mostRecentActivity) {
      setOpen(true);
    }
  }, [controlledOpen, mostRecentActivity]);

  const handleResumeActiveSession = useCallback(async () => {
    if (mostRecentActivity) {
      // Initialize workspace with BiasActivity
      await workspaceStore.initialize(mostRecentActivity.title);
      // Set the activity ID in workspace store
      workspaceStore.setActivityId(mostRecentActivity.id);
      // Navigate to the current stage of the activity
      router.push('/activity');
      setTimeout(() => {
        navigateToActivity(
          mostRecentActivity.id,
          mostRecentActivity.currentStage
        );
      }, 0);
      handleOpenChange(false);
    }
  }, [mostRecentActivity, router, workspaceStore, handleOpenChange]);

  const handleStartFresh = useCallback(() => {
    // Navigate to dashboard with intent to create new activity
    router.push('/activities?new=true');
    handleOpenChange(false);
  }, [router, handleOpenChange]);

  const handleSelectActivity = useCallback(
    async (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) {
        // Initialize workspace with BiasActivity
        await workspaceStore.initialize(activity.title);
        // Set the activity ID in workspace store
        workspaceStore.setActivityId(activity.id);
        // Navigate to the current stage of the selected activity
        router.push('/activity');
        setTimeout(() => {
          navigateToActivity(activity.id, activity.currentStage);
        }, 0);
        handleOpenChange(false);
      }
    },
    [activities, router, workspaceStore, handleOpenChange]
  );

  // Redirect to dashboard if no activities exist
  useEffect(() => {
    if (!mostRecentActivity) {
      router.push('/activities?new=true');
    }
  }, [mostRecentActivity, router]);

  // If no activities exist, don't show the dialog
  if (!mostRecentActivity) {
    return null;
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Continue Your Work
          </DialogTitle>
          <DialogDescription>
            {showActivitySelector
              ? 'Select an activity to continue working on.'
              : `Resume "${mostRecentActivity.title}" or start a new activity.`}
          </DialogDescription>
        </DialogHeader>

        {showActivitySelector ? (
          <div className="py-4">
            <ActivityCombobox
              onSelect={setSelectedActivityId}
              placeholder="Choose an activity..."
              value={selectedActivityId}
            />
          </div>
        ) : (
          <div className="py-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium text-sm">
                {mostRecentActivity.title}
              </h4>
              {mostRecentActivity.description && (
                <p className="mt-1 text-muted-foreground text-sm">
                  {mostRecentActivity.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-muted-foreground text-xs">
                <span>
                  Stage {mostRecentActivity.currentStage} of{' '}
                  {mostRecentActivity.progress?.total || 5}
                </span>
                <span>
                  {mostRecentActivity.status === 'in-progress'
                    ? 'In Progress'
                    : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {showActivitySelector ? (
            <>
              <Button
                className="w-full sm:w-auto"
                onClick={() => setShowActivitySelector(false)}
                variant="outline"
              >
                Back
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={!selectedActivityId}
                onClick={() =>
                  selectedActivityId && handleSelectActivity(selectedActivityId)
                }
              >
                Resume Selected Activity
              </Button>
            </>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button className="w-full" onClick={handleResumeActiveSession}>
                Resume Active Session
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:flex-1"
                  onClick={handleStartFresh}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start Fresh
                </Button>
                <Button
                  className="w-full sm:flex-1"
                  onClick={() => setShowActivitySelector(true)}
                  variant="outline"
                >
                  Choose Different Activity
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
