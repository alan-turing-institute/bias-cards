import type { BiasActivityData } from '@/lib/types/bias-activity';

// Import data validation for v2 format only
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// v2.0 Activity-based import/export format
export interface ActivityImportData {
  // Can be either the raw BiasActivityData or wrapped with metadata
  version?: '2.0';
  activityData?: BiasActivityData;
  exportedAt?: string;

  // Or just the BiasActivityData directly
  id?: string;
  name?: string;
  biases?: Record<string, unknown>;
  state?: {
    currentStage: number;
    completedStages: number[];
    startTime: string;
    lastModified: string;
  };
}

// Helper to validate basic object structure
function validateBasicStructure(data: unknown): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!data || typeof data !== 'object') {
    result.isValid = false;
    result.errors.push('Import file must contain a valid JSON object');
  }

  return result;
}

// Helper to validate activity fields
function validateActivityFields(
  activityData: unknown,
  result: ImportValidationResult
): void {
  const data = activityData as Record<string, unknown>;

  if (!data.id || typeof data.id !== 'string') {
    result.errors.push('Activity must have a valid ID');
    result.isValid = false;
  }

  if (!data.name || typeof data.name !== 'string') {
    result.errors.push('Activity must have a valid name');
    result.isValid = false;
  }

  if (!data.biases || typeof data.biases !== 'object') {
    result.errors.push('Activity must contain a biases object');
    result.isValid = false;
  }
}

// Helper to validate state structure
function validateStateStructure(
  activityData: unknown,
  result: ImportValidationResult
): void {
  const data = activityData as Record<string, unknown>;

  if (!data.state || typeof data.state !== 'object') {
    result.errors.push('Activity must have state information');
    result.isValid = false;
    return;
  }

  const state = data.state as {
    currentStage?: unknown;
    completedStages?: unknown;
  };

  if (typeof state.currentStage !== 'number') {
    result.errors.push('State must have a valid currentStage number');
    result.isValid = false;
  }

  if (!Array.isArray(state.completedStages)) {
    result.warnings.push('State should have a completedStages array');
  }
}

// Simplified validation for v2 format only
export function validateImportData(data: unknown): ImportValidationResult {
  const result = validateBasicStructure(data);

  if (!result.isValid) {
    return result;
  }

  const importData = data as ActivityImportData;
  const activityData = importData.activityData || importData;

  validateActivityFields(activityData, result);
  validateStateStructure(activityData, result);

  return result;
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
