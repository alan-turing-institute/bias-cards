export type BiasCategory =
  | 'cognitive-bias'
  | 'social-bias'
  | 'statistical-bias';
export type MitigationCategory = 'mitigation-technique';
export type CardCategory = BiasCategory | MitigationCategory;

export interface BiasCard {
  id: string;
  name: string;
  title: string;
  category: BiasCategory;
  caption: string;
  description: string;
  example: string;
  prompts: string[];
  icon: string;
  displayNumber?: string; // Optional display number for UI
}

export interface MitigationCard {
  id: string;
  name: string;
  title: string;
  category: MitigationCategory;
  caption: string;
  description: string;
  example: string;
  prompts: string[];
  icon: string;
}

export type Card = BiasCard | MitigationCard;

export interface CardPair {
  biasId: string;
  mitigationId: string;
  annotation?: string;
  effectivenessRating?: number; // 1-5 scale
  timestamp: string;
}

export type ProjectPhase =
  | 'project-design'
  | 'model-development'
  | 'system-deployment';

export type LifecycleStage =
  // Project Design
  | 'project-planning'
  | 'problem-formulation'
  | 'data-extraction-procurement'
  | 'data-analysis'
  // Model Development
  | 'preprocessing-feature-engineering'
  | 'model-selection-training'
  | 'model-testing-validation'
  | 'model-reporting'
  // System Deployment
  | 'system-implementation'
  | 'system-use-monitoring'
  | 'model-updating-deprovisioning'
  | 'user-training';

export interface StageAssignment {
  id: string; // Unique assignment ID
  cardId: string;
  stage: LifecycleStage;
  annotation?: string;
  timestamp: string;
}

// Multi-stage activity system types
export type ActivityStage = 1 | 2 | 3 | 4 | 5;
export type BiasRiskCategory =
  | 'high-risk'
  | 'medium-risk'
  | 'low-risk'
  | 'needs-discussion';

export interface BiasRiskAssignment {
  id: string;
  cardId: string;
  riskCategory: BiasRiskCategory;
  timestamp: string;
  annotation?: string;
}
