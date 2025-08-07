import type { ActivityStage } from './cards';

export interface Activity {
  id: string;
  title: string;
  description: string;
  projectType: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  createdAt: string;
  lastModified: string;
  currentStage: ActivityStage;
  progress: {
    completed: number;
    total: number;
  };
  lifecycleStages?: {
    [key: string]: {
      completed: boolean;
      biases: string[];
      mitigations: string[];
      notes?: string;
    };
  };
  isDemo?: boolean; // Flag to identify demo activities
}

export interface Report {
  id: string;
  activityId: string;
  title: string;
  description: string;
  completedAt: string;
  exportFormats: ('pdf' | 'json')[];
  data: unknown; // Will be defined more specifically later
}

export interface ActivityTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  defaultStages?: string[];
  suggestedBiases?: string[];
  suggestedMitigations?: string[];
}
