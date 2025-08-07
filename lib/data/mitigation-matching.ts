import type { BiasCard, LifecycleStage, MitigationCard } from '@/lib/types';

/**
 * Matching score calculation for bias-mitigation pairs
 */

interface MatchingScore {
  mitigationId: string;
  score: number;
  reasons: string[];
  predictedEffectiveness: number; // 1-5 scale
}

// Keywords associated with each bias category for matching
const BIAS_CATEGORY_KEYWORDS = {
  'cognitive-bias': [
    'team',
    'human',
    'decision',
    'assumption',
    'belief',
    'interpret',
    'think',
    'perception',
    'judgment',
    'mindset',
    'cognitive',
    'mental',
  ],
  'social-bias': [
    'society',
    'culture',
    'group',
    'demographic',
    'representation',
    'fairness',
    'discrimination',
    'equity',
    'inclusion',
    'diversity',
    'community',
    'social',
  ],
  'statistical-bias': [
    'data',
    'sample',
    'distribution',
    'statistical',
    'measurement',
    'variance',
    'accuracy',
    'precision',
    'model',
    'algorithm',
    'mathematical',
    'quantitative',
  ],
};

// Keywords that suggest mitigation effectiveness for different bias types
const MITIGATION_KEYWORDS = {
  review: ['review', 'audit', 'evaluate', 'assess', 'examine', 'check'],
  diversity: ['diverse', 'inclusion', 'representation', 'variety', 'different'],
  data: ['data', 'dataset', 'sample', 'collection', 'augmentation'],
  process: ['process', 'methodology', 'framework', 'systematic', 'structured'],
  human: ['human', 'people', 'team', 'stakeholder', 'participant'],
  technical: ['model', 'algorithm', 'metric', 'technical', 'quantitative'],
  documentation: ['document', 'transparency', 'explain', 'communicate'],
  validation: ['validate', 'test', 'verify', 'confirm', 'check'],
};

// Stage relevance mapping for different mitigation types
const STAGE_RELEVANCE: Record<string, LifecycleStage[]> = {
  'stakeholder-engagement': ['project-planning', 'problem-formulation'],
  'participatory-design-workshops': ['project-planning', 'problem-formulation'],
  'double-diamond-methodology': ['project-planning', 'problem-formulation'],
  'identify-underrepresented-groups': [
    'data-extraction-procurement',
    'data-analysis',
  ],
  'additional-data-collection': ['data-extraction-procurement'],
  'data-augmentation': ['preprocessing-feature-engineering'],
  'quality-control-procedures': [
    'data-analysis',
    'preprocessing-feature-engineering',
  ],
  'peer-review': ['model-selection-training', 'model-testing-validation'],
  'external-validation': ['model-testing-validation', 'model-reporting'],
  'multiple-model-comparison': [
    'model-selection-training',
    'model-testing-validation',
  ],
  'diversify-evaluation-metrics': ['model-testing-validation'],
  'employ-model-interpretability': [
    'model-testing-validation',
    'model-reporting',
  ],
  'human-in-the-loop': ['system-implementation', 'system-use-monitoring'],
  'regular-auditing': [
    'system-use-monitoring',
    'model-updating-deprovisioning',
  ],
  'open-documentation': ['model-reporting', 'system-implementation'],
  'skills-and-training': ['user-training', 'system-implementation'],
};

/**
 * Calculate how well a mitigation matches a specific bias
 */
export function calculateMatchingScore(
  bias: BiasCard,
  mitigation: MitigationCard,
  currentStage?: LifecycleStage
): MatchingScore {
  const reasons: string[] = [];
  let score = 0;

  // 1. Category-based matching (30 points max)
  const biasKeywords = BIAS_CATEGORY_KEYWORDS[bias.category] || [];
  const biasText = `${bias.description} ${bias.example}`.toLowerCase();
  const mitigationText =
    `${mitigation.description} ${mitigation.example}`.toLowerCase();

  let categoryMatchCount = 0;
  biasKeywords.forEach((keyword) => {
    if (mitigationText.includes(keyword)) {
      categoryMatchCount++;
    }
  });

  if (categoryMatchCount > 0) {
    score += Math.min(30, categoryMatchCount * 10);
    reasons.push(`Addresses ${bias.category.replace('-', ' ')} concerns`);
  }

  // 2. Keyword matching between bias and mitigation (30 points max)
  const biasWords = new Set(biasText.split(/\s+/).filter((w) => w.length > 4));
  const mitigationWords = new Set(
    mitigationText.split(/\s+/).filter((w) => w.length > 4)
  );

  let keywordOverlap = 0;
  biasWords.forEach((word) => {
    if (mitigationWords.has(word)) {
      keywordOverlap++;
    }
  });

  if (keywordOverlap > 0) {
    score += Math.min(30, keywordOverlap * 5);
    reasons.push('Directly addresses bias characteristics');
  }

  // 3. Mitigation type analysis (20 points max)
  let mitigationTypeScore = 0;
  Object.entries(MITIGATION_KEYWORDS).forEach(([type, keywords]) => {
    const typeMatch = keywords.some(
      (keyword) =>
        mitigation.name.toLowerCase().includes(keyword) ||
        mitigationText.includes(keyword)
    );

    if (typeMatch) {
      // Check if this mitigation type is relevant to the bias category
      if (
        (type === 'review' && bias.category === 'cognitive-bias') ||
        (type === 'diversity' && bias.category === 'social-bias') ||
        (type === 'data' && bias.category === 'statistical-bias') ||
        (type === 'human' && bias.category !== 'statistical-bias') ||
        (type === 'technical' && bias.category === 'statistical-bias')
      ) {
        mitigationTypeScore += 10;
      }
    }
  });

  if (mitigationTypeScore > 0) {
    score += Math.min(20, mitigationTypeScore);
    reasons.push('Mitigation type matches bias nature');
  }

  // 4. Stage relevance (20 points max)
  if (currentStage) {
    const relevantStages = STAGE_RELEVANCE[mitigation.title] || [];
    if (relevantStages.includes(currentStage)) {
      score += 20;
      reasons.push('Highly relevant to current lifecycle stage');
    }
  }

  // 5. Special case bonuses
  // Peer review is good for all cognitive biases
  if (
    bias.category === 'cognitive-bias' &&
    mitigation.title === 'peer-review'
  ) {
    score += 10;
    reasons.push('Peer review helps identify cognitive biases');
  }

  // Stakeholder engagement is crucial for social biases
  if (
    bias.category === 'social-bias' &&
    ['stakeholder-engagement', 'participatory-design-workshops'].includes(
      mitigation.title
    )
  ) {
    score += 10;
    reasons.push('Community involvement essential for social bias');
  }

  // Data techniques are key for statistical biases
  if (
    bias.category === 'statistical-bias' &&
    [
      'additional-data-collection',
      'data-augmentation',
      'quality-control-procedures',
    ].includes(mitigation.title)
  ) {
    score += 10;
    reasons.push('Data-focused approach for statistical bias');
  }

  // Calculate predicted effectiveness (1-5 scale)
  let predictedEffectiveness = 1;
  if (score >= 80) {
    predictedEffectiveness = 5;
  } else if (score >= 60) {
    predictedEffectiveness = 4;
  } else if (score >= 40) {
    predictedEffectiveness = 3;
  } else if (score >= 20) {
    predictedEffectiveness = 2;
  }

  return {
    mitigationId: mitigation.id,
    score,
    reasons,
    predictedEffectiveness,
  };
}

/**
 * Get suggested mitigations for a specific bias
 */
export function getSuggestedMitigations(
  bias: BiasCard,
  mitigations: MitigationCard[],
  currentStage?: LifecycleStage,
  limit = 5
): MatchingScore[] {
  const scores = mitigations.map((mitigation) =>
    calculateMatchingScore(bias, mitigation, currentStage)
  );

  // Sort by score descending and return top matches
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((match) => match.score > 0); // Only return matches with positive scores
}

/**
 * Get match quality description
 */
export function getMatchQuality(score: number): string {
  if (score >= 80) {
    return 'Excellent match';
  }
  if (score >= 60) {
    return 'Strong match';
  }
  if (score >= 40) {
    return 'Good match';
  }
  if (score >= 20) {
    return 'Possible match';
  }
  return 'Weak match';
}

/**
 * Check if a bias-mitigation pair is recommended
 */
export function isRecommendedPair(
  bias: BiasCard,
  mitigation: MitigationCard,
  currentStage?: LifecycleStage
): boolean {
  const score = calculateMatchingScore(bias, mitigation, currentStage);
  return score.score >= 40; // Threshold for recommendation
}
