import type { LifecycleStage, ProjectPhase } from '@/lib/types';

export const LIFECYCLE_STAGES: Record<
  LifecycleStage,
  {
    name: string;
    phase: ProjectPhase;
    order: number;
    description: string;
  }
> = {
  // Project Design
  'project-planning': {
    name: 'Project Planning',
    phase: 'project-design',
    order: 1,
    description:
      'Preliminary activities to define project aims, objectives, scope, and processes. This stage involves evaluating resources, assigning team responsibilities, and engaging diverse stakeholders. Key activities include conducting risk assessments, identifying skill gaps, and developing a comprehensive project plan. The goal is creating a stable framework that guides project direction while considering potential ethical implications and establishing clear boundaries for acceptable outcomes.',
  },
  'problem-formulation': {
    name: 'Problem Formulation',
    phase: 'project-design',
    order: 2,
    description:
      "Defining the project's core problem and computational approach through precise statements about the system's purpose. This stage critically examines the validity and legitimacy of proposed solutions, ensuring algorithmic approaches are appropriate and free from inherent biases. Teams evaluate whether their methods meaningfully address the identified challenge while identifying potential ethical concerns early in development.",
  },
  'data-extraction-procurement': {
    name: 'Data Extraction & Procurement',
    phase: 'project-design',
    order: 3,
    description:
      'Designing data gathering methods and collecting or acquiring datasets while considering technical and ethical aspects. Following the "garbage-in, garbage-out" principle, this stage emphasizes careful data selection for developing accountable and fair systems. Teams must evaluate data sources, collection methods, and potential biases to ensure datasets are representative and aligned with ethical standards.',
  },
  'data-analysis': {
    name: 'Data Analysis',
    phase: 'project-design',
    order: 4,
    description:
      'Combining exploratory analysis to understand dataset structure with confirmatory analysis to evaluate hypotheses using statistical methods. This critical stage identifies and addresses potential biases that could negatively impact the project. Special attention is given to handling missing data and understanding its implications, ensuring findings are robust and unbiased.',
  },

  // Model Development
  'preprocessing-feature-engineering': {
    name: 'Preprocessing & Feature Engineering',
    phase: 'model-development',
    order: 5,
    description:
      "Transforming raw data into meaningful features through cleaning, normalizing, and refactoring processes. Feature selection impacts both model accuracy and ethical outcomes, requiring careful balance between predictive power and interpretability. Teams must recognize that poorly chosen features could create discriminatory outcomes or reduce the system's explanatory potential.",
  },
  'model-selection-training': {
    name: 'Model Selection & Training',
    phase: 'model-development',
    order: 6,
    description:
      'Choosing appropriate algorithms based on computational resources, performance needs, and data properties, then iteratively optimizing parameters. Critical considerations include understanding problem formulation and data splitting strategies. More complex models may offer better performance but reduced interpretability, while computational intensity can create accessibility barriers for certain groups.',
  },
  'model-testing-validation': {
    name: 'Model Testing & Validation',
    phase: 'model-development',
    order: 7,
    description:
      'Evaluating model performance using held-out data to assess accuracy, generalizability, and fairness across contexts. Beyond performance metrics, teams examine interpretability and explainability. If models demonstrate low interpretability, teams might retrain with different features or apply explanation techniques to ensure consistent, understandable performance across domains.',
  },
  'model-reporting': {
    name: 'Model Reporting',
    phase: 'model-development',
    order: 8,
    description:
      'Documenting formal and informal model properties including data sources, parameters, metrics, limitations, and assumptions. Comprehensive documentation ensures reproducibility, maintains accountability, enables harm redress, and facilitates team reflection. Requirements vary by project type, but all documentation should support transparency and help identify potential biases or limitations.',
  },

  // System Deployment
  'system-implementation': {
    name: 'System Implementation',
    phase: 'system-deployment',
    order: 9,
    description:
      'Creating operational environments for human-system interaction through technical infrastructure (servers, interfaces) and social/organizational integration. Critical considerations include ensuring security, performance, accessibility, and regulatory compliance. Poor implementation design may limit effectiveness or create unintended barriers for certain user groups.',
  },
  'system-use-monitoring': {
    name: 'System Use & Monitoring',
    phase: 'system-deployment',
    order: 10,
    description:
      'Continuously evaluating performance and detecting issues like model drift where accuracy changes due to shifting data distributions. Monitoring ensures systems maintain validated performance while identifying unintended consequences. Key activities include tracking metrics, gathering feedback, and detecting subtle shifts that might perpetuate inequities or create new discriminatory patterns.',
  },
  'model-updating-deprovisioning': {
    name: 'Model Updating & Deprovisioning',
    phase: 'system-deployment',
    order: 11,
    description:
      'Deciding whether to update models through retraining or completely remove systems when monitoring reveals limitations. Triggers include reduced accuracy, vulnerabilities, changed purposes, or non-compliance. This critical reflection point may require restarting the project lifecycle, ensuring updates genuinely address systemic limitations rather than cosmetic changes.',
  },
  'user-training': {
    name: 'User Training',
    phase: 'system-deployment',
    order: 12,
    description:
      'Supporting and upskilling system operators through workshops, courses, and documentation. Effective training builds understanding and appropriate trust levels, avoiding both algorithmic aversion and excessive trust. Training must address diverse user backgrounds and learning styles to prevent perpetuating systemic inequities in technology understanding and usage.',
  },
};

export const PROJECT_PHASES: Record<
  ProjectPhase,
  {
    name: string;
    color: string;
    stages: LifecycleStage[];
  }
> = {
  'project-design': {
    name: 'Project Design',
    color: '#3B82F6', // Blue
    stages: [
      'project-planning',
      'problem-formulation',
      'data-extraction-procurement',
      'data-analysis',
    ],
  },
  'model-development': {
    name: 'Model Development',
    color: '#10B981', // Green
    stages: [
      'preprocessing-feature-engineering',
      'model-selection-training',
      'model-testing-validation',
      'model-reporting',
    ],
  },
  'system-deployment': {
    name: 'System Deployment',
    color: '#F59E0B', // Amber (matching theme)
    stages: [
      'system-implementation',
      'system-use-monitoring',
      'model-updating-deprovisioning',
      'user-training',
    ],
  },
};

export function getPhaseForStage(stage: LifecycleStage): ProjectPhase {
  return LIFECYCLE_STAGES[stage].phase;
}

export function getStagesForPhase(phase: ProjectPhase): LifecycleStage[] {
  return PROJECT_PHASES[phase].stages;
}

export function getStageOrder(stage: LifecycleStage): number {
  return LIFECYCLE_STAGES[stage].order;
}
