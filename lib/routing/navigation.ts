// Navigation helper functions for hash-based routing

// Define regex patterns at module level for performance
const ACTIVITY_ID_PATTERN = /^\/([^/]+)/;
const STAGE_NUMBER_PATTERN = /\/stage\/(\d+)$/;

export function navigateToActivity(id: string, stage = 1): void {
  if (typeof window !== 'undefined') {
    const validStage = stage < 1 || stage > 5 ? 1 : stage;
    // Check if we're on the activities page
    const pathname = window.location.pathname;
    const isOnActivitiesPage =
      pathname === '/activities' || pathname.endsWith('/activities/');

    if (isOnActivitiesPage) {
      // If we're already on the activities page, just update the hash
      window.location.hash = `/${id}/stage/${validStage}`;
    } else {
      // Navigate to the activities page with the hash
      window.location.href = `/activities/#/${id}/stage/${validStage}`;
    }
  }
}

export function navigateToReport(activityId: string): void {
  if (typeof window !== 'undefined') {
    // Check if we're on the activities page
    const pathname = window.location.pathname;
    const isOnActivitiesPage =
      pathname === '/activities' || pathname.endsWith('/activities/');

    if (isOnActivitiesPage) {
      // If we're already on the activities page, just update the hash
      window.location.hash = `/${activityId}/report`;
    } else {
      // Navigate to the activities page with the hash
      window.location.href = `/activities/#/${activityId}/report`;
    }
  }
}

export function navigateToDashboard(): void {
  // Navigate to activities dashboard using Next.js router would be handled by the component
  // This is a client-side navigation to a static route
  if (typeof window !== 'undefined') {
    window.location.href = '/activities';
  }
}

export function getActivityUrl(id: string, stage?: number): string {
  if (stage !== undefined && stage >= 1 && stage <= 5) {
    return `#/${id}/stage/${stage}`;
  }
  return `#/${id}/stage/1`;
}

export function getReportUrl(activityId: string): string {
  return `#/${activityId}/report`;
}

export function isActivityHash(hash: string): boolean {
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  // Check if it's a valid activity hash (starts with / followed by activity ID)
  return cleanHash.startsWith('/') && !cleanHash.startsWith('//');
}

export function clearActivityHash(): void {
  // If we're on an activity hash, clear it to show the dashboard
  if (typeof window !== 'undefined' && isActivityHash(window.location.hash)) {
    // If we're already on /activities, just clear the hash
    const pathname = window.location.pathname;
    if (pathname === '/activities' || pathname.endsWith('/activities/')) {
      window.location.hash = '';
    } else {
      // Otherwise navigate to activities dashboard
      window.location.href = '/activities';
    }
  }
}

// Helper to get the current activity ID from the hash
export function getCurrentActivityId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const hash = window.location.hash;
  if (!hash) {
    return null;
  }

  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  const match = cleanHash.match(ACTIVITY_ID_PATTERN);

  return match ? match[1] : null;
}

// Helper to get the current stage from the hash
export function getCurrentStage(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const hash = window.location.hash;
  if (!hash) {
    return null;
  }

  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  const match = cleanHash.match(STAGE_NUMBER_PATTERN);

  if (match) {
    const stage = Number.parseInt(match[1], 10);
    return stage >= 1 && stage <= 5 ? stage : null;
  }

  return null;
}
