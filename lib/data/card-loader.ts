import type { BiasCard, BiasCategory, MitigationCard } from '@/lib/types';

export class CardLoadError extends Error {
  cardPath?: string;

  constructor(message: string, cardPath?: string) {
    super(message);
    this.name = 'CardLoadError';
    this.cardPath = cardPath;
  }
}

export class CardValidationError extends Error {
  cardData?: unknown;

  constructor(message: string, cardData?: unknown) {
    super(message);
    this.name = 'CardValidationError';
    this.cardData = cardData;
  }
}

const BIAS_CATEGORIES: BiasCategory[] = [
  'cognitive-bias',
  'social-bias',
  'statistical-bias',
];

function validateBiasCard(data: unknown, categoryOffset = 0): BiasCard {
  if (typeof data !== 'object' || data === null) {
    throw new CardValidationError('Data must be an object', data);
  }

  const cardData = data as Record<string, unknown>;
  const requiredFields = [
    'id',
    'name',
    'title',
    'category',
    'caption',
    'description',
    'example',
    'prompts',
    'icon',
  ];

  for (const field of requiredFields) {
    if (!(field in cardData)) {
      throw new CardValidationError(`Missing required field: ${field}`, data);
    }
  }

  if (typeof cardData.id !== 'number') {
    throw new CardValidationError('Card ID must be a number', data);
  }

  if (!BIAS_CATEGORIES.includes(cardData.category as BiasCategory)) {
    throw new CardValidationError(
      `Invalid bias category: ${cardData.category}`,
      data
    );
  }

  if (!Array.isArray(cardData.prompts)) {
    throw new CardValidationError('Prompts must be an array', data);
  }

  // Apply category offset to make IDs globally unique internally
  // but preserve the original ID for display purposes
  const globalId = (cardData.id as number) + categoryOffset;

  return {
    id: String(globalId),
    name: cardData.name as string,
    title: cardData.title as string,
    category: cardData.category as BiasCategory,
    caption: cardData.caption as string,
    description: cardData.description as string,
    example: cardData.example as string,
    prompts: cardData.prompts as string[],
    icon: cardData.icon as string,
    displayNumber: String(cardData.id).padStart(2, '0'), // Original category-specific number
  };
}

function validateMitigationCard(data: unknown): MitigationCard {
  if (typeof data !== 'object' || data === null) {
    throw new CardValidationError('Data must be an object', data);
  }

  const cardData = data as Record<string, unknown>;
  const requiredFields = [
    'id',
    'name',
    'title',
    'category',
    'caption',
    'description',
    'example',
    'prompts',
    'icon',
  ];

  for (const field of requiredFields) {
    if (!(field in cardData)) {
      throw new CardValidationError(`Missing required field: ${field}`, data);
    }
  }

  if (typeof cardData.id !== 'number') {
    throw new CardValidationError('Card ID must be a number', data);
  }

  if (cardData.category !== 'mitigation-technique') {
    throw new CardValidationError(
      `Invalid mitigation category: ${cardData.category}`,
      data
    );
  }

  if (!Array.isArray(cardData.prompts)) {
    throw new CardValidationError('Prompts must be an array', data);
  }

  return {
    id: String(cardData.id),
    name: cardData.name as string,
    title: cardData.title as string,
    category: 'mitigation-technique',
    caption: cardData.caption as string,
    description: cardData.description as string,
    example: cardData.example as string,
    prompts: cardData.prompts as string[],
    icon: cardData.icon as string,
  };
}

// Note: We use static imports below for Next.js static export compatibility

// Static card data loader (for Next.js static export compatibility)
export async function loadAllCards(): Promise<{
  biasCards: BiasCard[];
  mitigationCards: MitigationCard[];
}> {
  try {
    // Import individual card files statically
    const [
      // Cognitive bias cards
      automationDistrust,
      availability,
      confirmation,
      decisionAutomation,
      lawOfInstrument,
      naiveRealism,
      optimism,
      selfAssessment,

      // Social bias cards
      annotation,
      chronological,
      deAgentification,
      historical,
      implementation,
      label,
      representation,
      selection,
      statusQuo,

      // Statistical bias cards
      aggregation,
      confounding,
      evaluation,
      measurement,
      missingData,
      trainingServing,
      wrongSampleSize,

      // Mitigation cards
      additionalData,
      dataAugmentation,
      diversifyMetrics,
      doubleDiamond,
      modelInterpretability,
      externalValidation,
      humanInLoop,
      identifyUnderrepresented,
      multipleModel,
      openDocumentation,
      participatoryDesign,
      peerReview,
      qualityControl,
      regularAuditing,
      skillsTraining,
      stakeholderEngagement,
    ] = await Promise.all([
      // Cognitive
      import('@/app/data/biases/cognitive/automation-distrust-bias.json'),
      import('@/app/data/biases/cognitive/availability-bias.json'),
      import('@/app/data/biases/cognitive/confirmation-bias.json'),
      import('@/app/data/biases/cognitive/decision-automation-bias.json'),
      import('@/app/data/biases/cognitive/law-of-the-instrument.json'),
      import('@/app/data/biases/cognitive/naive-realism.json'),
      import('@/app/data/biases/cognitive/optimism-bias.json'),
      import('@/app/data/biases/cognitive/self-assessment-bias.json'),

      // Social
      import('@/app/data/biases/social/annotation-bias.json'),
      import('@/app/data/biases/social/chronological-bias.json'),
      import('@/app/data/biases/social/de-agentification-bias.json'),
      import('@/app/data/biases/social/historical-bias.json'),
      import('@/app/data/biases/social/implementation-bias.json'),
      import('@/app/data/biases/social/label-bias.json'),
      import('@/app/data/biases/social/representation-bias.json'),
      import('@/app/data/biases/social/selection-bias.json'),
      import('@/app/data/biases/social/status-quo-bias.json'),

      // Statistical
      import('@/app/data/biases/statistical/aggregation-bias.json'),
      import('@/app/data/biases/statistical/confounding.json'),
      import('@/app/data/biases/statistical/evaluation-bias.json'),
      import('@/app/data/biases/statistical/measurement-bias.json'),
      import('@/app/data/biases/statistical/missing-data-bias.json'),
      import('@/app/data/biases/statistical/training-serving-skew.json'),
      import('@/app/data/biases/statistical/wrong-sample-size-bias.json'),

      // Mitigation
      import('@/app/data/biases/mitigation/additional-data-collection.json'),
      import('@/app/data/biases/mitigation/data-augmentation.json'),
      import('@/app/data/biases/mitigation/diversify-evaluation-metrics.json'),
      import('@/app/data/biases/mitigation/double-diamond-methodology.json'),
      import('@/app/data/biases/mitigation/employ-model-interpretability.json'),
      import('@/app/data/biases/mitigation/external-validation.json'),
      import('@/app/data/biases/mitigation/human-in-the-loop.json'),
      import(
        '@/app/data/biases/mitigation/identify-underrepresented-groups.json'
      ),
      import('@/app/data/biases/mitigation/multiple-model-comparison.json'),
      import('@/app/data/biases/mitigation/open-documentation.json'),
      import(
        '@/app/data/biases/mitigation/participatory-design-workshops.json'
      ),
      import('@/app/data/biases/mitigation/peer-review.json'),
      import('@/app/data/biases/mitigation/quality-control-procedures.json'),
      import('@/app/data/biases/mitigation/regular-auditing.json'),
      import('@/app/data/biases/mitigation/skills-and-training.json'),
      import('@/app/data/biases/mitigation/stakeholder-engagement.json'),
    ]);

    const biasCards: BiasCard[] = [
      // Cognitive biases: offset 0 (IDs 1-8 stay as 1-8)
      validateBiasCard(
        {
          ...automationDistrust.default,
          category: 'cognitive-bias',
        },
        0
      ),
      validateBiasCard(
        { ...availability.default, category: 'cognitive-bias' },
        0
      ),
      validateBiasCard(
        { ...confirmation.default, category: 'cognitive-bias' },
        0
      ),
      validateBiasCard(
        {
          ...decisionAutomation.default,
          category: 'cognitive-bias',
        },
        0
      ),
      validateBiasCard(
        {
          ...lawOfInstrument.default,
          category: 'cognitive-bias',
        },
        0
      ),
      validateBiasCard(
        { ...naiveRealism.default, category: 'cognitive-bias' },
        0
      ),
      validateBiasCard({ ...optimism.default, category: 'cognitive-bias' }, 0),
      validateBiasCard(
        {
          ...selfAssessment.default,
          category: 'cognitive-bias',
        },
        0
      ),

      // Social biases: offset 8 (IDs 1-9 become 9-17)
      validateBiasCard({ ...annotation.default, category: 'social-bias' }, 8),
      validateBiasCard(
        { ...chronological.default, category: 'social-bias' },
        8
      ),
      validateBiasCard(
        {
          ...deAgentification.default,
          category: 'social-bias',
        },
        8
      ),
      validateBiasCard({ ...historical.default, category: 'social-bias' }, 8),
      validateBiasCard(
        { ...implementation.default, category: 'social-bias' },
        8
      ),
      validateBiasCard({ ...label.default, category: 'social-bias' }, 8),
      validateBiasCard(
        { ...representation.default, category: 'social-bias' },
        8
      ),
      validateBiasCard({ ...selection.default, category: 'social-bias' }, 8),
      validateBiasCard({ ...statusQuo.default, category: 'social-bias' }, 8),

      // Statistical biases: offset 17 (IDs 1-7 become 18-24)
      validateBiasCard(
        {
          ...aggregation.default,
          category: 'statistical-bias',
        },
        17
      ),
      validateBiasCard(
        {
          ...confounding.default,
          category: 'statistical-bias',
        },
        17
      ),
      validateBiasCard(
        { ...evaluation.default, category: 'statistical-bias' },
        17
      ),
      validateBiasCard(
        {
          ...measurement.default,
          category: 'statistical-bias',
        },
        17
      ),
      validateBiasCard(
        {
          ...missingData.default,
          category: 'statistical-bias',
        },
        17
      ),
      validateBiasCard(
        {
          ...trainingServing.default,
          category: 'statistical-bias',
        },
        17
      ),
      validateBiasCard(
        {
          ...wrongSampleSize.default,
          category: 'statistical-bias',
        },
        17
      ),
    ];

    const mitigationCards: MitigationCard[] = [
      validateMitigationCard(additionalData.default),
      validateMitigationCard(dataAugmentation.default),
      validateMitigationCard(diversifyMetrics.default),
      validateMitigationCard(doubleDiamond.default),
      validateMitigationCard(modelInterpretability.default),
      validateMitigationCard(externalValidation.default),
      validateMitigationCard(humanInLoop.default),
      validateMitigationCard(identifyUnderrepresented.default),
      validateMitigationCard(multipleModel.default),
      validateMitigationCard(openDocumentation.default),
      validateMitigationCard(participatoryDesign.default),
      validateMitigationCard(peerReview.default),
      validateMitigationCard(qualityControl.default),
      validateMitigationCard(regularAuditing.default),
      validateMitigationCard(skillsTraining.default),
      validateMitigationCard(stakeholderEngagement.default),
    ];

    // Sort cards by ID in ascending order
    biasCards.sort((a, b) => Number(a.id) - Number(b.id));
    mitigationCards.sort((a, b) => Number(a.id) - Number(b.id));

    return { biasCards, mitigationCards };
  } catch (error) {
    if (
      error instanceof CardValidationError ||
      error instanceof CardLoadError
    ) {
      throw error;
    }
    throw new CardLoadError('Failed to load card data', error?.toString());
  }
}
