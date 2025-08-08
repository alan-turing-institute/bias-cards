'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface HashRoute {
  activityId?: string;
  stage?: number;
  view?: 'report' | 'stage';
  isValid: boolean;
}

interface HashRouterContextType {
  currentRoute: HashRoute;
  navigateToActivity: (id: string, stage?: number) => void;
  navigateToReport: (activityId: string) => void;
  clearHash: () => void;
}

const HashRouterContext = createContext<HashRouterContextType | null>(null);

export function useHashRouter() {
  const context = useContext(HashRouterContext);
  if (!context) {
    throw new Error('useHashRouter must be used within HashRouterProvider');
  }
  return context;
}

// Define regex patterns at module level for performance
const ACTIVITY_PATTERN = /^\/activity\/([^/]+)(?:\/(.+))?$/;
const STAGE_PATTERN = /^stage\/(\d+)$/;

export function parseActivityHash(hash: string): HashRoute {
  // Remove leading # if present
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;

  // Return invalid route for empty hash
  if (!cleanHash || cleanHash === '/') {
    return { isValid: false };
  }

  // Match patterns like:
  // /activity/abc123/stage/1
  // /activity/abc123/report
  // /activity/abc123

  const activityMatch = cleanHash.match(ACTIVITY_PATTERN);

  if (!activityMatch) {
    return { isValid: false };
  }

  const activityId = activityMatch[1];
  const remainder = activityMatch[2];

  // Just activity ID - default to stage 1
  if (!remainder) {
    return {
      activityId,
      stage: 1,
      view: 'stage',
      isValid: true,
    };
  }

  // Check for report view
  if (remainder === 'report') {
    return {
      activityId,
      view: 'report',
      isValid: true,
    };
  }

  // Check for stage view
  const stageMatch = remainder.match(STAGE_PATTERN);
  if (stageMatch) {
    const stage = Number.parseInt(stageMatch[1], 10);
    if (stage >= 1 && stage <= 5) {
      return {
        activityId,
        stage,
        view: 'stage',
        isValid: true,
      };
    }
  }

  return { isValid: false };
}

export function HashRouterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentRoute, setCurrentRoute] = useState<HashRoute>(() =>
    typeof window !== 'undefined'
      ? parseActivityHash(window.location.hash)
      : { isValid: false }
  );

  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = parseActivityHash(window.location.hash);
      setCurrentRoute(newRoute);
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Check initial hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateToActivity = (id: string, stage = 1) => {
    if (typeof window !== 'undefined') {
      const validStage = stage < 1 || stage > 5 ? 1 : stage;
      window.location.hash = `/activity/${id}/stage/${validStage}`;
    }
  };

  const navigateToReport = (activityId: string) => {
    if (typeof window !== 'undefined') {
      window.location.hash = `/activity/${activityId}/report`;
    }
  };

  const clearHash = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
  };

  return (
    <HashRouterContext.Provider
      value={{
        currentRoute,
        navigateToActivity,
        navigateToReport,
        clearHash,
      }}
    >
      {children}
    </HashRouterContext.Provider>
  );
}
