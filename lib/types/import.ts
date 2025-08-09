import type { WorkspaceState } from '@/lib/types';
import type { Activity } from '@/lib/types/activity';

// Import data validation schemas
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportData {
  activity: Activity;
  workspace?: WorkspaceState;
  exportedAt?: string;
  format?: string;
}

// Validation functions
export function validateImportData(data: unknown): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    result.isValid = false;
    result.errors.push('Import file must contain a valid JSON object');
    return result;
  }

  const importData = data as Partial<ImportData>;

  // Validate activity object
  const activityValidation = validateActivityData(importData.activity);
  if (!activityValidation.isValid) {
    result.isValid = false;
    result.errors.push(...activityValidation.errors);
  }
  result.warnings.push(...activityValidation.warnings);

  // Validate workspace data if present
  if (importData.workspace) {
    const workspaceValidation = validateWorkspaceData(importData.workspace);
    if (!workspaceValidation.isValid) {
      result.warnings.push(...workspaceValidation.errors);
      result.warnings.push(
        'Workspace data appears corrupted - activity will be imported without workspace data'
      );
    }
    result.warnings.push(...workspaceValidation.warnings);
  }

  // Validate export metadata
  if (importData.exportedAt && !isValidISODate(importData.exportedAt)) {
    result.warnings.push('Export date format is invalid');
  }

  return result;
}

function validateRequiredActivityFields(
  act: Partial<Activity>,
  result: ImportValidationResult
): void {
  if (
    !act.title ||
    typeof act.title !== 'string' ||
    act.title.trim().length === 0
  ) {
    result.isValid = false;
    result.errors.push(
      'Activity title is required and must be a non-empty string'
    );
  }

  if (!act.id || typeof act.id !== 'string') {
    result.isValid = false;
    result.errors.push('Activity ID is required and must be a string');
  }
}

function validateOptionalActivityFields(
  act: Partial<Activity>,
  result: ImportValidationResult
): void {
  if (act.description !== undefined && typeof act.description !== 'string') {
    result.warnings.push('Activity description should be a string');
  }

  if (act.projectType !== undefined && typeof act.projectType !== 'string') {
    result.warnings.push('Project type should be a string');
  }

  if (
    act.status &&
    !['draft', 'in-progress', 'completed'].includes(act.status)
  ) {
    result.warnings.push(
      'Activity status should be one of: draft, in-progress, completed'
    );
  }

  if (
    act.currentStage &&
    (!Number.isInteger(act.currentStage) ||
      act.currentStage < 1 ||
      act.currentStage > 5)
  ) {
    result.warnings.push('Current stage should be an integer between 1 and 5');
  }
}

function validateActivityDates(
  act: Partial<Activity>,
  result: ImportValidationResult
): void {
  if (act.createdAt && !isValidISODate(act.createdAt)) {
    result.warnings.push('Created date format is invalid');
  }

  if (act.lastModified && !isValidISODate(act.lastModified)) {
    result.warnings.push('Last modified date format is invalid');
  }
}

function validateActivityData(activity: unknown): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!activity || typeof activity !== 'object') {
    result.isValid = false;
    result.errors.push('Missing or invalid activity data');
    return result;
  }

  const act = activity as Partial<Activity>;

  validateRequiredActivityFields(act, result);
  validateOptionalActivityFields(act, result);
  validateActivityDates(act, result);

  if (act.progress) {
    if (!validateProgress(act.progress)) {
      result.warnings.push(
        'Progress data is invalid - will be reset to defaults'
      );
    }
  } else {
    result.warnings.push(
      'Missing progress data - will be initialized with defaults'
    );
  }

  return result;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Workspace data validation requires comprehensive checks of nested arrays and objects
function validateWorkspaceData(workspace: unknown): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!workspace || typeof workspace !== 'object') {
    result.isValid = false;
    result.errors.push('Workspace data must be an object');
    return result;
  }

  const ws = workspace as Partial<WorkspaceState>;

  // Validate arrays
  if (ws.biasRiskAssignments && !Array.isArray(ws.biasRiskAssignments)) {
    result.errors.push('Bias risk assignments must be an array');
  } else if (ws.biasRiskAssignments) {
    const invalidAssignments = ws.biasRiskAssignments.filter(
      (assignment, _index) => {
        if (!assignment || typeof assignment !== 'object') {
          return true;
        }
        if (!assignment.cardId || typeof assignment.cardId !== 'string') {
          return true;
        }
        if (
          !(
            assignment.riskCategory &&
            [
              'high-risk',
              'medium-risk',
              'low-risk',
              'needs-discussion',
            ].includes(assignment.riskCategory)
          )
        ) {
          return true;
        }
        return false;
      }
    );
    if (invalidAssignments.length > 0) {
      result.warnings.push(
        `${invalidAssignments.length} bias risk assignments have invalid data`
      );
    }
  }

  if (ws.stageAssignments && !Array.isArray(ws.stageAssignments)) {
    result.errors.push('Stage assignments must be an array');
  } else if (ws.stageAssignments) {
    const invalidStageAssignments = ws.stageAssignments.filter((assignment) => {
      if (!assignment || typeof assignment !== 'object') {
        return true;
      }
      if (!assignment.cardId || typeof assignment.cardId !== 'string') {
        return true;
      }
      if (!assignment.stage || typeof assignment.stage !== 'string') {
        return true;
      }
      return false;
    });
    if (invalidStageAssignments.length > 0) {
      result.warnings.push(
        `${invalidStageAssignments.length} stage assignments have invalid data`
      );
    }
  }

  if (ws.cardPairs && !Array.isArray(ws.cardPairs)) {
    result.errors.push('Card pairs must be an array');
  } else if (ws.cardPairs) {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Card pair validation requires multiple nested checks
    const invalidPairs = ws.cardPairs.filter((pair) => {
      if (!pair || typeof pair !== 'object') {
        return true;
      }
      if (!pair.biasId || typeof pair.biasId !== 'string') {
        return true;
      }
      if (!pair.mitigationId || typeof pair.mitigationId !== 'string') {
        return true;
      }
      if (
        pair.effectivenessRating !== undefined &&
        (!Number.isInteger(pair.effectivenessRating) ||
          pair.effectivenessRating < 1 ||
          pair.effectivenessRating > 5)
      ) {
        return true;
      }
      return false;
    });
    if (invalidPairs.length > 0) {
      result.warnings.push(
        `${invalidPairs.length} card pairs have invalid data`
      );
    }
  }

  // Validate other workspace fields
  if (
    ws.currentStage &&
    (!Number.isInteger(ws.currentStage) ||
      ws.currentStage < 1 ||
      ws.currentStage > 5)
  ) {
    result.warnings.push(
      'Workspace current stage should be an integer between 1 and 5'
    );
  }

  if (ws.selectedCardIds && !Array.isArray(ws.selectedCardIds)) {
    result.warnings.push('Selected card IDs should be an array');
  }

  if (ws.customAnnotations && typeof ws.customAnnotations !== 'object') {
    result.warnings.push('Custom annotations should be an object');
  }

  return result;
}

function validateProgress(progress: unknown): boolean {
  if (!progress || typeof progress !== 'object') {
    return false;
  }
  const prog = progress as { completed?: unknown; total?: unknown };
  return (
    typeof prog.completed === 'number' &&
    typeof prog.total === 'number' &&
    Number.isInteger(prog.completed) &&
    Number.isInteger(prog.total) &&
    prog.completed >= 0 &&
    prog.total >= 0
  );
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !Number.isNaN(date.getTime()) &&
    dateString === date.toISOString()
  );
}

// File validation utilities
export function validateImportFile(file: File): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check file extension
  if (!file.name.toLowerCase().endsWith('.json')) {
    result.errors.push('File must have a .json extension');
    result.isValid = false;
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    result.errors.push('File size must be less than 10MB');
    result.isValid = false;
  }

  // Check MIME type
  if (
    file.type &&
    !['application/json', 'text/json', 'text/plain'].includes(file.type)
  ) {
    result.warnings.push('File type should be application/json');
  }

  return result;
}

export function getValidationSummary(
  validation: ImportValidationResult
): string {
  if (
    validation.isValid &&
    validation.errors.length === 0 &&
    validation.warnings.length === 0
  ) {
    return 'File validation passed successfully';
  }

  const parts: string[] = [];

  if (validation.errors.length > 0) {
    parts.push(`${validation.errors.length} error(s) found`);
  }

  if (validation.warnings.length > 0) {
    parts.push(`${validation.warnings.length} warning(s) found`);
  }

  return parts.join(', ');
}
