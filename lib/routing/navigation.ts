// Navigation helper functions for hash-based routing

// Define regex patterns at module level for performance
const ACTIVITY_ID_PATTERN = /^\/activity\/([^/]+)/;
const STAGE_NUMBER_PATTERN = /\/stage\/(\d+)$/;

export function navigateToActivity(id: string, stage = 1): void {
  if (typeof window !== 'undefined') {
    const validStage = stage < 1 || stage > 5 ? 1 : stage;
    window.location.hash = `/activity/${id}/stage/${validStage}`;
  }
}

export function navigateToReport(activityId: string): void {
  if (typeof window !== 'undefined') {
    window.location.hash = `/activity/${activityId}/report`;
  }
}

export function navigateToDashboard(): void {
  // Navigate to dashboard using Next.js router would be handled by the component
  // This is a client-side navigation to a static route
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard';
  }
}

export function getActivityUrl(id: string, stage?: number): string {
  if (stage !== undefined && stage >= 1 && stage <= 5) {
    return `#/activity/${id}/stage/${stage}`;
  }
  return `#/activity/${id}/stage/1`;
}

export function getReportUrl(activityId: string): string {
  return `#/activity/${activityId}/report`;
}

export function isActivityHash(hash: string): boolean {
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  return cleanHash.startsWith('/activity/');
}

export function clearActivityHash(): void {
  // If we're on an activity hash, clear it and go to dashboard
  if (typeof window !== 'undefined' && isActivityHash(window.location.hash)) {
    window.location.href = '/dashboard';
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
