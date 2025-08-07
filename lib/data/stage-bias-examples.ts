import type { LifecycleStage } from '@/lib/types';

// Sample bias cards that are typically relevant at each stage
// Based on the bias heatmap showing relevance across the ML lifecycle
export const STAGE_BIAS_EXAMPLES: Record<
  LifecycleStage,
  Array<{ name: string; category: string; description: string }>
> = {
  'project-planning': [
    {
      name: 'Historical Bias',
      category: 'social-bias',
      description:
        'Pre-existing societal inequalities embedded in data before any AI development begins',
    },
    {
      name: 'Selection Bias',
      category: 'social-bias',
      description: 'Systematic exclusion of certain groups in data collection',
    },
    {
      name: 'Self-Assessment Bias',
      category: 'cognitive-bias',
      description:
        "Overconfidence in one's abilities to identify and mitigate biases",
    },
  ],
  'problem-formulation': [
    {
      name: 'Historical Bias',
      category: 'social-bias',
      description:
        'Past discrimination patterns may influence how problems are defined',
    },
    {
      name: 'Confirmation Bias',
      category: 'cognitive-bias',
      description:
        'Seeking evidence that confirms pre-existing beliefs about the problem',
    },
    {
      name: 'Wrong Sample Size Bias',
      category: 'statistical-bias',
      description:
        'Planning for insufficient data to properly address the problem',
    },
  ],
  'data-extraction-procurement': [
    {
      name: 'Representation Bias',
      category: 'social-bias',
      description:
        'Certain groups are underrepresented in the collected dataset',
    },
    {
      name: 'Selection Bias',
      category: 'social-bias',
      description:
        'Systematic differences in how data is collected across populations',
    },
    {
      name: 'Missing Data Bias',
      category: 'statistical-bias',
      description:
        'Important information is systematically absent from the dataset',
    },
  ],
  'data-analysis': [
    {
      name: 'Label Bias',
      category: 'social-bias',
      description:
        'Human annotators introduce their own prejudices into data labels',
    },
    {
      name: 'Confirmation Bias',
      category: 'cognitive-bias',
      description:
        'Interpreting data patterns to support predetermined hypotheses',
    },
    {
      name: 'Confounding',
      category: 'statistical-bias',
      description: 'Hidden variables that influence both features and outcomes',
    },
  ],
  'preprocessing-feature-engineering': [
    {
      name: 'Aggregation Bias',
      category: 'statistical-bias',
      description:
        'Loss of important variations when combining data from different groups',
    },
    {
      name: 'Law of the Instrument',
      category: 'cognitive-bias',
      description:
        'Over-reliance on familiar techniques regardless of appropriateness',
    },
    {
      name: 'Availability Bias',
      category: 'cognitive-bias',
      description:
        'Overweighting easily accessible features while ignoring others',
    },
  ],
  'model-selection-training': [
    {
      name: 'Training-Serving Skew',
      category: 'statistical-bias',
      description: 'Differences between training and production environments',
    },
    {
      name: 'Law of the Instrument',
      category: 'cognitive-bias',
      description: 'Using familiar models regardless of problem requirements',
    },
    {
      name: 'Aggregation Bias',
      category: 'statistical-bias',
      description:
        'Model that works on average but fails for specific subgroups',
    },
  ],
  'model-testing-validation': [
    {
      name: 'Evaluation Bias',
      category: 'statistical-bias',
      description: 'Test data not representative of real deployment conditions',
    },
    {
      name: 'Chronological Bias',
      category: 'social-bias',
      description:
        "Testing on outdated data that doesn't reflect current patterns",
    },
    {
      name: 'Aggregation Bias',
      category: 'statistical-bias',
      description: 'Overall metrics hide poor performance on minority groups',
    },
  ],
  'model-reporting': [
    {
      name: 'Confirmation Bias',
      category: 'cognitive-bias',
      description: 'Selective reporting of favorable results',
    },
    {
      name: 'Annotation Bias',
      category: 'social-bias',
      description:
        'Documentation reflects annotator perspectives, not all stakeholders',
    },
    {
      name: 'Aggregation Bias',
      category: 'statistical-bias',
      description:
        'Reporting average performance while hiding subgroup disparities',
    },
  ],
  'system-implementation': [
    {
      name: 'Implementation Bias',
      category: 'social-bias',
      description:
        'System design that creates barriers for certain user groups',
    },
    {
      name: 'Optimism Bias',
      category: 'cognitive-bias',
      description: 'Underestimating implementation challenges and risks',
    },
    {
      name: 'Training-Serving Skew',
      category: 'statistical-bias',
      description:
        'Production environment differs from development assumptions',
    },
  ],
  'user-training': [
    {
      name: 'Implementation Bias',
      category: 'social-bias',
      description: 'Training materials not accessible to all user groups',
    },
    {
      name: 'Automation-Distrust Bias',
      category: 'cognitive-bias',
      description: 'Users skeptical of AI system recommendations',
    },
    {
      name: 'Optimism Bias',
      category: 'cognitive-bias',
      description:
        'Overestimating user ability to understand and use the system',
    },
  ],
  'system-use-monitoring': [
    {
      name: 'Chronological Bias',
      category: 'social-bias',
      description:
        'System performance degrades as society and data patterns evolve',
    },
    {
      name: 'Decision-Automation Bias',
      category: 'cognitive-bias',
      description:
        'Over-reliance on automated decisions without critical evaluation',
    },
    {
      name: 'Training-Serving Skew',
      category: 'statistical-bias',
      description: 'Production data drifts from original training distribution',
    },
  ],
  'model-updating-deprovisioning': [
    {
      name: 'Status Quo Bias',
      category: 'social-bias',
      description: 'Resistance to changing or removing established systems',
    },
    {
      name: 'De-agentification Bias',
      category: 'social-bias',
      description: 'Removing human agency and accountability from decisions',
    },
    {
      name: 'Evaluation Bias',
      category: 'statistical-bias',
      description:
        'Using outdated metrics to evaluate whether to update models',
    },
  ],
};
