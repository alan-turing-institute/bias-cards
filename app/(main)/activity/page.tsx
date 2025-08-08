'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReportClient from '@/components/activity/report';
// Import stage components from new location
import Stage1Client from '@/components/activity/stages/stage1';
import Stage2Client from '@/components/activity/stages/stage2';
import Stage3Client from '@/components/activity/stages/stage3';
import Stage4Client from '@/components/activity/stages/stage4';
import Stage5Client from '@/components/activity/stages/stage5';
import { HashRouterProvider, useHashRouter } from '@/lib/routing/hash-router';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';

function ActivityContent() {
  const router = useRouter();
  const { currentRoute } = useHashRouter();
  const [isClient, setIsClient] = useState(false);

  const { getActivity, initializeDemoData } = useActivityStore();
  const { setActivityId, updateWorkspaceName } = useWorkspaceStore();

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

    // If no valid route, redirect to dashboard
    if (!(currentRoute.isValid && currentRoute.activityId)) {
      // If we're on the activity page but no hash, go to dashboard
      if (typeof window !== 'undefined' && !window.location.hash) {
        router.push('/dashboard');
      }
      return;
    }

    const activity = getActivity(currentRoute.activityId);

    if (!activity) {
      // Give it a moment for demo data to initialize
      const timer = setTimeout(() => {
        // We already checked that activityId exists above
        if (currentRoute.activityId) {
          const updatedActivity = getActivity(currentRoute.activityId);
          if (!updatedActivity) {
            // Activity not found, redirect to dashboard
            router.push('/dashboard');
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    // Set activity context in workspace store
    setActivityId(currentRoute.activityId);
    updateWorkspaceName(activity.title);
  }, [
    currentRoute,
    isClient,
    getActivity,
    router,
    setActivityId,
    updateWorkspaceName,
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

export default function ActivityPage() {
  return (
    <HashRouterProvider>
      <ActivityContent />
    </HashRouterProvider>
  );
}
