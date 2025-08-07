'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;
  const [isClient, setIsClient] = useState(false);

  const { getActivity, initializeDemoData } = useActivityStore();
  const { setActivityId, updateWorkspaceName } = useWorkspaceStore();

  useEffect(() => {
    setIsClient(true);

    // Ensure demo data is initialized
    initializeDemoData();
  }, [initializeDemoData]);

  // Get activity after client-side initialization
  const activity = isClient ? getActivity(activityId) : null;

  useEffect(() => {
    if (!isClient) return;

    if (!activity) {
      // Give it a moment for demo data to initialize
      const timer = setTimeout(() => {
        const updatedActivity = getActivity(activityId);
        if (!updatedActivity) {
          // Activity not found, redirect to dashboard
          router.push('/dashboard');
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    // Set activity context in workspace store
    setActivityId(activityId);
    updateWorkspaceName(activity.title);

    // If on activity root, redirect to current stage
    if (window.location.pathname === `/activity/${activityId}`) {
      router.push(
        `/activity/${activityId}/stage/${activity.currentStage || 1}`
      );
    }
  }, [
    activity,
    activityId,
    router,
    setActivityId,
    updateWorkspaceName,
    isClient,
    getActivity,
  ]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">Loading...</h2>
          <p className="text-gray-600 text-sm">Preparing activity</p>
        </div>
      </div>
    );
  }

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

  return <>{children}</>;
}
