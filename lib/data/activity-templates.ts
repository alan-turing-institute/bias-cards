import type { LifecycleStage, WorkspaceState } from '@/lib/types';

export interface ActivityTemplate {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'specialized';
  estimatedDuration: string; // e.g., "30 minutes", "1 hour"
  learningObjectives: string[];
  preAssignedCards: Array<{
    cardId: string;
    stage: LifecycleStage;
    annotation?: string;
  }>;
  prePairedCards: Array<{
    biasId: string;
    mitigationId: string;
    effectivenessRating?: number;
    annotation?: string;
  }>;
  instructions?: string[];
  completionCriteria?: string[];
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    id: 'beginner-intro',
    name: 'Introduction to ML Bias',
    description:
      'A gentle introduction to understanding bias in machine learning systems. Perfect for newcomers.',
    category: 'beginner',
    estimatedDuration: '20-30 minutes',
    learningObjectives: [
      'Identify common types of bias in ML systems',
      'Understand when biases typically occur in the ML lifecycle',
      'Learn basic mitigation strategies',
    ],
    preAssignedCards: [
      { cardId: 'confirmation-bias', stage: 'problem-formulation' },
      { cardId: 'selection-bias', stage: 'data-extraction-procurement' },
      { cardId: 'measurement-bias', stage: 'data-analysis' },
      { cardId: 'peer-review', stage: 'problem-formulation' },
      {
        cardId: 'additional-data-collection',
        stage: 'data-extraction-procurement',
      },
    ],
    prePairedCards: [
      {
        biasId: 'confirmation-bias',
        mitigationId: 'peer-review',
        effectivenessRating: 4,
        annotation:
          'External review helps identify blind spots in problem definition',
      },
    ],
    instructions: [
      'Review the pre-assigned bias cards and their lifecycle stages',
      'Read the descriptions and examples for each bias type',
      'Consider how the suggested mitigation strategies address each bias',
      'Try creating additional bias-mitigation pairs based on your understanding',
    ],
    completionCriteria: [
      'All pre-assigned cards reviewed',
      'At least 2 additional bias-mitigation pairs created',
      'Notes added explaining reasoning for new pairs',
    ],
  },

  {
    id: 'data-bias-focus',
    name: 'Data Collection & Bias',
    description:
      'Deep dive into biases that occur during data collection and preparation phases.',
    category: 'intermediate',
    estimatedDuration: '45-60 minutes',
    learningObjectives: [
      'Identify data-related biases across different sources',
      'Understand sampling and representation issues',
      'Design data collection strategies to minimize bias',
    ],
    preAssignedCards: [
      { cardId: 'selection-bias', stage: 'data-extraction-procurement' },
      { cardId: 'representation-bias', stage: 'data-extraction-procurement' },
      { cardId: 'historical-bias', stage: 'data-analysis' },
      { cardId: 'measurement-bias', stage: 'data-analysis' },
      {
        cardId: 'missing-data-bias',
        stage: 'preprocessing-feature-engineering',
      },
      {
        cardId: 'additional-data-collection',
        stage: 'data-extraction-procurement',
      },
      { cardId: 'identify-underrepresented-groups', stage: 'data-analysis' },
      {
        cardId: 'data-augmentation',
        stage: 'preprocessing-feature-engineering',
      },
    ],
    prePairedCards: [
      {
        biasId: 'selection-bias',
        mitigationId: 'additional-data-collection',
        effectivenessRating: 5,
        annotation: 'Expanding data sources helps address sampling limitations',
      },
      {
        biasId: 'representation-bias',
        mitigationId: 'identify-underrepresented-groups',
        effectivenessRating: 4,
        annotation: 'Systematic analysis reveals gaps in representation',
      },
    ],
    instructions: [
      'Map each bias to its most common occurrence in the data pipeline',
      'Consider how biases in one stage affect downstream stages',
      'Evaluate the effectiveness of different mitigation strategies',
      'Think about implementation challenges for each mitigation',
    ],
    completionCriteria: [
      'All data-related biases assigned to appropriate stages',
      'At least 5 bias-mitigation pairs with effectiveness ratings',
      'Annotations explaining the reasoning for each pairing',
    ],
  },

  {
    id: 'model-deployment-audit',
    name: 'Model Deployment Audit',
    description:
      'Advanced activity focusing on bias detection and mitigation in production systems.',
    category: 'advanced',
    estimatedDuration: '60-90 minutes',
    learningObjectives: [
      'Conduct comprehensive bias audits of ML systems',
      'Design monitoring strategies for production bias detection',
      'Implement systematic bias mitigation processes',
    ],
    preAssignedCards: [
      { cardId: 'evaluation-bias', stage: 'model-testing-validation' },
      { cardId: 'implementation-bias', stage: 'system-implementation' },
      { cardId: 'training-serving-skew', stage: 'system-use-monitoring' },
      { cardId: 'automation-distrust-bias', stage: 'user-training' },
      {
        cardId: 'diversify-evaluation-metrics',
        stage: 'model-testing-validation',
      },
      { cardId: 'regular-auditing', stage: 'system-use-monitoring' },
      { cardId: 'human-in-the-loop', stage: 'system-implementation' },
      { cardId: 'skills-and-training', stage: 'user-training' },
    ],
    prePairedCards: [],
    instructions: [
      'Design a comprehensive audit process using the assigned bias cards',
      'Create bias-mitigation pairs with detailed implementation plans',
      'Consider the organizational and technical challenges',
      'Develop monitoring and feedback mechanisms',
    ],
    completionCriteria: [
      'Complete audit framework designed',
      'All biases paired with appropriate mitigations',
      'Implementation timeline and responsibilities defined',
      'Success metrics and monitoring plan established',
    ],
  },

  {
    id: 'healthcare-ml-bias',
    name: 'Healthcare ML Bias Analysis',
    description:
      'Specialized activity examining bias considerations in healthcare machine learning applications.',
    category: 'specialized',
    estimatedDuration: '45-75 minutes',
    learningObjectives: [
      'Identify healthcare-specific bias challenges',
      'Understand regulatory and ethical considerations',
      'Design bias mitigation for sensitive applications',
    ],
    preAssignedCards: [
      {
        cardId: 'representation-bias',
        stage: 'data-extraction-procurement',
        annotation: 'Patient demographics may not reflect target population',
      },
      {
        cardId: 'historical-bias',
        stage: 'data-analysis',
        annotation: 'Medical data reflects historical treatment disparities',
      },
      {
        cardId: 'measurement-bias',
        stage: 'data-analysis',
        annotation:
          'Diagnostic tools may perform differently across populations',
      },
      {
        cardId: 'confirmation-bias',
        stage: 'problem-formulation',
        annotation: 'Clinical assumptions may bias problem definition',
      },
      {
        cardId: 'participatory-design-workshops',
        stage: 'problem-formulation',
      },
      { cardId: 'external-validation', stage: 'model-testing-validation' },
      { cardId: 'stakeholder-engagement', stage: 'system-implementation' },
    ],
    prePairedCards: [
      {
        biasId: 'representation-bias',
        mitigationId: 'participatory-design-workshops',
        effectivenessRating: 5,
        annotation:
          'Involving diverse healthcare stakeholders improves representation awareness',
      },
    ],
    instructions: [
      'Consider patient safety and regulatory requirements',
      'Evaluate bias implications for different patient populations',
      'Design mitigation strategies that maintain clinical efficacy',
      'Address both technical and organizational aspects',
    ],
    completionCriteria: [
      'Healthcare-specific bias risks identified and documented',
      'Comprehensive mitigation strategy with clinical validation',
      'Stakeholder engagement plan for implementation',
      'Monitoring and feedback mechanisms for ongoing bias detection',
    ],
  },

  {
    id: 'quick-assessment',
    name: 'Quick Bias Assessment',
    description: 'Rapid bias identification exercise for existing ML projects.',
    category: 'beginner',
    estimatedDuration: '15-20 minutes',
    learningObjectives: [
      'Quickly identify potential bias hotspots',
      'Prioritize bias mitigation efforts',
      'Create actionable next steps',
    ],
    preAssignedCards: [
      { cardId: 'availability-bias', stage: 'problem-formulation' },
      { cardId: 'selection-bias', stage: 'data-extraction-procurement' },
      { cardId: 'aggregation-bias', stage: 'model-selection-training' },
      { cardId: 'evaluation-bias', stage: 'model-testing-validation' },
    ],
    prePairedCards: [],
    instructions: [
      'Think about a specific ML project you know',
      'Quickly assess where each bias type might apply',
      'Identify the top 3 most critical bias risks',
      'Select appropriate mitigation strategies',
    ],
    completionCriteria: [
      'All stages of the ML lifecycle considered',
      'Top 3 bias risks identified and prioritized',
      'At least 3 bias-mitigation pairs created',
      'Next steps documented',
    ],
  },
];

export function getTemplateById(id: string): ActivityTemplate | undefined {
  return ACTIVITY_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByCategory(
  category: ActivityTemplate['category']
): ActivityTemplate[] {
  return ACTIVITY_TEMPLATES.filter(
    (template) => template.category === category
  );
}

export function createWorkspaceFromTemplate(
  template: ActivityTemplate
): Partial<WorkspaceState> {
  const timestamp = new Date().toISOString();

  return {
    name: template.name,
    stageAssignments: template.preAssignedCards.map((assignment) => ({
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cardId: assignment.cardId,
      stage: assignment.stage,
      annotation: assignment.annotation,
      timestamp,
    })),
    cardPairs: template.prePairedCards.map((pair) => ({
      biasId: pair.biasId,
      mitigationId: pair.mitigationId,
      effectivenessRating: pair.effectivenessRating,
      annotation: pair.annotation,
      timestamp,
    })),
    selectedCardIds: [],
    customAnnotations: {},
    completedStages: [],
    activityProgress: {
      totalCards: 40,
      assignedCards: template.preAssignedCards.length,
      pairedCards: template.prePairedCards.length,
      completionPercentage: Math.round(
        ((template.preAssignedCards.length + template.prePairedCards.length) /
          80) *
          100
      ),
      timeSpent: 0,
      milestones: [],
    },
  };
}
