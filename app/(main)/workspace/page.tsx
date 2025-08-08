'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SessionRecoveryDialog } from '@/components/ui/session-recovery-dialog';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';

function WorkspaceContent() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const activities = useActivityStore((state) => state.activities);
  const isOnboardingActive = useOnboardingStore(
    (state) => state.isOnboardingActive
  );

  // Get the most recent in-progress or draft activity
  const mostRecentActivity = activities
    .filter((activity) => activity.status !== 'completed')
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )[0];

  useEffect(() => {
    // Wait for store to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // If no activities exist after initialization, redirect to dashboard (unless onboarding is active)
  useEffect(() => {
    if (isInitialized && !mostRecentActivity && !isOnboardingActive) {
      router.push('/activities?new=true');
    }
  }, [isInitialized, mostRecentActivity, router, isOnboardingActive]);

  if (!isInitialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // During onboarding, show a simple workspace preview instead of the recovery dialog
  if (isOnboardingActive) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-2xl">Workspace</h2>
          <p className="mt-2 text-muted-foreground">
            This is where you'll manage your bias analysis activities
          </p>
        </div>
      </div>
    );
  }

  return <SessionRecoveryDialog />;
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
