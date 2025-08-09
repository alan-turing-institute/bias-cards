import type { ActivityMetadata } from '@/lib/activities/Activity';
import type { BiasRiskCategory, LifecycleStage } from '@/lib/types';

export interface BiasActivityData {
  id: string;
  name: string;
  description?: string;
  deckId: string; // Reference to deck used
  deckVersion: string; // Version of deck at creation time
  biases: Record<string, BiasEntry>;
  state: BiasActivityState; // Add state for compatibility with base Activity
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata: ActivityMetadata;
}

export interface BiasEntry {
  biasId: string; // Reference to card in deck
  name: string;
  riskCategory: BiasRiskCategory | null;
  riskAssignedAt: string | null;
  lifecycleAssignments: LifecycleStage[];
  rationale: Record<LifecycleStage, string>;
  mitigations: Record<LifecycleStage, string[]>; // mitigation card IDs from deck
  implementationNotes: Record<
    LifecycleStage,
    Record<string, ImplementationNote>
  >;
  customAnnotations?: string;
}

export interface ImplementationNote {
  effectivenessRating: number; // 1-5 scale
  notes: string;
  status: 'planned' | 'in-progress' | 'implemented' | 'deferred';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
}

export interface BiasActivityState {
  currentStage: number;
  biases: Record<string, BiasEntry>;
  completedStages: number[];
  startTime: string;
  lastModified: string;
  [key: string]: unknown; // Allow extending state with additional properties
}

export interface CompletionStatus {
  stages: {
    stage1: boolean;
    stage2: boolean;
    stage3: boolean;
    stage4: boolean;
    stage5: boolean;
  };
  overallProgress: number;
}

export interface ActivityProgress {
  currentStage: number;
  completionStatus: CompletionStatus;
  biasesAssessed: number;
  mitigationsSelected: number;
  lastUpdated: Date;
}
