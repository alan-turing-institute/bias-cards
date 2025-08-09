import type { BiasActivityData } from './bias-activity';
import type {
  BiasRiskAssignment,
  CardPair,
  LifecycleStage,
  StageAssignment,
} from './cards';

/**
 * Legacy data format (v1.0)
 * File-based cards with lifecycle-centric data structure
 */
export interface LegacyData {
  dataVersion?: '1.0';
  biasRiskAssignments?: BiasRiskAssignment[];
  stageAssignments?: StageAssignment[];
  cardPairs?: CardPair[];
  customAnnotations?: Record<string, string>;
  completedStages?: LifecycleStage[];
  sessionId?: string;
  name?: string;
  activityId?: string;
  createdAt?: string;
  lastModified?: string;
}

/**
 * Intermediate data format (v1.5)
 * Deck-based cards with lifecycle-centric data structure
 */
export interface IntermediateData extends Omit<LegacyData, 'dataVersion'> {
  dataVersion: '1.5';
  deckId: string;
  deckVersion: string;
  // Still uses lifecycle-centric arrays
  biasRiskAssignments: BiasRiskAssignment[];
  stageAssignments: StageAssignment[];
  cardPairs: CardPair[];
}

/**
 * Activity export format (v2.0)
 * Deck-based cards with bias-centric Activity structure
 */
export interface ActivityExport {
  version: '2.0';
  deckId: string;
  deckVersion: string;
  activityData: BiasActivityData;
  exportedAt: string;
  metadata?: {
    exportedBy?: string;
    appVersion?: string;
    notes?: string;
  };
}

/**
 * Migration result type
 */
export interface MigrationResult {
  success: boolean;
  fromVersion: '1.0' | '1.5' | '2.0';
  toVersion: '1.0' | '1.5' | '2.0';
  message: string;
  data?: unknown;
  errors?: Array<{
    field: string;
    error: string;
  }>;
  warnings?: string[];
}

/**
 * Version detection result
 */
export interface VersionDetectionResult {
  version: '1.0' | '1.5' | '2.0' | 'unknown';
  confidence: number; // 0-1 scale
  indicators: string[];
}

/**
 * Migration options
 */
export interface MigrationOptions {
  preserveHistory?: boolean;
  validateData?: boolean;
  generateNewIds?: boolean;
  verbose?: boolean;
}

/**
 * Data validation result
 */
export interface DataValidationResult {
  valid: boolean;
  version: '1.0' | '1.5' | '2.0';
  errors: Array<{
    path: string;
    expected: string;
    received: string;
  }>;
  warnings: string[];
}

/**
 * Type guards for version detection
 */
export function isLegacyData(data: unknown): data is LegacyData {
  const d = data as LegacyData;
  return (
    (!d.dataVersion || d.dataVersion === '1.0') &&
    Array.isArray(d.biasRiskAssignments) &&
    Array.isArray(d.stageAssignments) &&
    !('deckId' in d) &&
    !('biases' in d)
  );
}

export function isIntermediateData(data: unknown): data is IntermediateData {
  const d = data as IntermediateData;
  return (
    d.dataVersion === '1.5' &&
    typeof d.deckId === 'string' &&
    typeof d.deckVersion === 'string' &&
    Array.isArray(d.biasRiskAssignments) &&
    Array.isArray(d.stageAssignments)
  );
}

export function isActivityExport(data: unknown): data is ActivityExport {
  const d = data as ActivityExport;
  return (
    d.version === '2.0' &&
    typeof d.deckId === 'string' &&
    typeof d.deckVersion === 'string' &&
    typeof d.activityData === 'object' &&
    d.activityData !== null &&
    'biases' in d.activityData
  );
}

/**
 * Version detection function
 */
export function detectDataVersion(
  data: unknown
): '1.0' | '1.5' | '2.0' | 'unknown' {
  if (isActivityExport(data)) {
    return '2.0';
  }
  if (isIntermediateData(data)) {
    return '1.5';
  }
  if (isLegacyData(data)) {
    return '1.0';
  }

  // Check for explicit version field
  const d = data as { dataVersion?: string; version?: string };
  if (d.version === '2.0') {
    return '2.0';
  }
  if (d.dataVersion === '1.5') {
    return '1.5';
  }
  if (d.dataVersion === '1.0' || !d.dataVersion) {
    return '1.0';
  }

  return 'unknown';
}
