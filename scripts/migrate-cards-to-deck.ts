#!/usr/bin/env ts-node

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import automationDistrustBias from '../app/data/biases/cognitive/automation-distrust-bias.json' with {
  type: 'json',
};
import availabilityBias from '../app/data/biases/cognitive/availability-bias.json' with {
  type: 'json',
};
// Import all card JSON files
import confirmationBias from '../app/data/biases/cognitive/confirmation-bias.json' with {
  type: 'json',
};
import decisionAutomationBias from '../app/data/biases/cognitive/decision-automation-bias.json' with {
  type: 'json',
};
import lawOfInstrument from '../app/data/biases/cognitive/law-of-the-instrument.json' with {
  type: 'json',
};
import naiveRealism from '../app/data/biases/cognitive/naive-realism.json' with {
  type: 'json',
};
import optimismBias from '../app/data/biases/cognitive/optimism-bias.json' with {
  type: 'json',
};
import selfAssessmentBias from '../app/data/biases/cognitive/self-assessment-bias.json' with {
  type: 'json',
};
import additionalDataCollection from '../app/data/biases/mitigation/additional-data-collection.json' with {
  type: 'json',
};
import dataAugmentation from '../app/data/biases/mitigation/data-augmentation.json' with {
  type: 'json',
};
import diversifyEvaluationMetrics from '../app/data/biases/mitigation/diversify-evaluation-metrics.json' with {
  type: 'json',
};
import doubleDiamondMethodology from '../app/data/biases/mitigation/double-diamond-methodology.json' with {
  type: 'json',
};
import employModelInterpretability from '../app/data/biases/mitigation/employ-model-interpretability.json' with {
  type: 'json',
};
import externalValidation from '../app/data/biases/mitigation/external-validation.json' with {
  type: 'json',
};
import humanInTheLoop from '../app/data/biases/mitigation/human-in-the-loop.json' with {
  type: 'json',
};
import identifyUnderrepresentedGroups from '../app/data/biases/mitigation/identify-underrepresented-groups.json' with {
  type: 'json',
};
import multipleModelComparison from '../app/data/biases/mitigation/multiple-model-comparison.json' with {
  type: 'json',
};
import openDocumentation from '../app/data/biases/mitigation/open-documentation.json' with {
  type: 'json',
};
import participatoryDesignWorkshops from '../app/data/biases/mitigation/participatory-design-workshops.json' with {
  type: 'json',
};
import peerReview from '../app/data/biases/mitigation/peer-review.json' with {
  type: 'json',
};
import qualityControlProcedures from '../app/data/biases/mitigation/quality-control-procedures.json' with {
  type: 'json',
};
import regularAuditing from '../app/data/biases/mitigation/regular-auditing.json' with {
  type: 'json',
};
import skillsAndTraining from '../app/data/biases/mitigation/skills-and-training.json' with {
  type: 'json',
};
import stakeholderEngagement from '../app/data/biases/mitigation/stakeholder-engagement.json' with {
  type: 'json',
};
import annotationBias from '../app/data/biases/social/annotation-bias.json' with {
  type: 'json',
};
import chronologicalBias from '../app/data/biases/social/chronological-bias.json' with {
  type: 'json',
};
import deAgentificationBias from '../app/data/biases/social/de-agentification-bias.json' with {
  type: 'json',
};
import historicalBias from '../app/data/biases/social/historical-bias.json' with {
  type: 'json',
};
import implementationBias from '../app/data/biases/social/implementation-bias.json' with {
  type: 'json',
};
import labelBias from '../app/data/biases/social/label-bias.json' with {
  type: 'json',
};
import representationBias from '../app/data/biases/social/representation-bias.json' with {
  type: 'json',
};
import selectionBias from '../app/data/biases/social/selection-bias.json' with {
  type: 'json',
};
import statusQuoBias from '../app/data/biases/social/status-quo-bias.json' with {
  type: 'json',
};
import aggregationBias from '../app/data/biases/statistical/aggregation-bias.json' with {
  type: 'json',
};
import confounding from '../app/data/biases/statistical/confounding.json' with {
  type: 'json',
};
import evaluationBias from '../app/data/biases/statistical/evaluation-bias.json' with {
  type: 'json',
};
import measurementBias from '../app/data/biases/statistical/measurement-bias.json' with {
  type: 'json',
};
import missingDataBias from '../app/data/biases/statistical/missing-data-bias.json' with {
  type: 'json',
};
import trainingServingSkew from '../app/data/biases/statistical/training-serving-skew.json' with {
  type: 'json',
};
import wrongSampleSizeBias from '../app/data/biases/statistical/wrong-sample-size-bias.json' with {
  type: 'json',
};

interface CardData {
  id: number | string;
  name: string;
  title: string;
  category: string;
  description: string;
  example: string;
  prompts: string[];
  icon: string;
  caption: string;
}

const NAME_SPLIT_REGEX = /\s+/;
const TITLE_SPLIT_REGEX = /-/;

function generateTags(card: CardData): string[] {
  const tags: string[] = [];

  // Add category as a tag
  if (card.category) {
    tags.push(card.category.replace(/-/g, ' '));
  }

  // Extract keywords from name
  const nameWords = card.name.toLowerCase().split(NAME_SPLIT_REGEX);
  tags.push(...nameWords.filter((word: string) => word.length > 3));

  // Extract key terms from title
  const titleWords = card.title.toLowerCase().split(TITLE_SPLIT_REGEX);
  tags.push(...titleWords.filter((word: string) => word.length > 3));

  return [...new Set(tags)]; // Remove duplicates
}

function inferApplicableStages(card: CardData): string[] {
  // Based on the mitigation technique, infer applicable lifecycle stages
  const name = card.name.toLowerCase();
  const stages: string[] = [];

  if (
    name.includes('design') ||
    name.includes('participatory') ||
    name.includes('stakeholder')
  ) {
    stages.push('project-planning', 'problem-formulation');
  }

  if (
    name.includes('data') ||
    name.includes('collection') ||
    name.includes('augmentation')
  ) {
    stages.push('data-extraction-procurement', 'data-analysis');
  }

  if (
    name.includes('model') ||
    name.includes('training') ||
    name.includes('validation')
  ) {
    stages.push('model-selection-training', 'model-testing-validation');
  }

  if (name.includes('documentation') || name.includes('report')) {
    stages.push('model-reporting');
  }

  if (
    name.includes('audit') ||
    name.includes('monitor') ||
    name.includes('review')
  ) {
    stages.push('system-use-monitoring', 'model-updating-deprovisioning');
  }

  if (
    name.includes('human') ||
    name.includes('training') ||
    name.includes('skills')
  ) {
    stages.push('user-training', 'system-implementation');
  }

  // If no specific stages identified, make it applicable to testing and monitoring
  if (stages.length === 0) {
    stages.push('model-testing-validation', 'system-use-monitoring');
  }

  return [...new Set(stages)];
}

function migrateCardsToDeck() {
  console.log('Starting card migration to deck format...');

  // Organize all bias cards
  const cognitiveBiasCards = [
    confirmationBias,
    selfAssessmentBias,
    availabilityBias,
    lawOfInstrument,
    optimismBias,
    decisionAutomationBias,
    automationDistrustBias,
    naiveRealism,
  ];

  const socialBiasCards = [
    historicalBias,
    representationBias,
    labelBias,
    annotationBias,
    chronologicalBias,
    selectionBias,
    implementationBias,
    statusQuoBias,
    deAgentificationBias,
  ];

  const statisticalBiasCards = [
    missingDataBias,
    measurementBias,
    wrongSampleSizeBias,
    aggregationBias,
    evaluationBias,
    confounding,
    trainingServingSkew,
  ];

  const mitigationCards = [
    peerReview,
    additionalDataCollection,
    participatoryDesignWorkshops,
    stakeholderEngagement,
    humanInTheLoop,
    identifyUnderrepresentedGroups,
    skillsAndTraining,
    dataAugmentation,
    diversifyEvaluationMetrics,
    multipleModelComparison,
    externalValidation,
    doubleDiamondMethodology,
    openDocumentation,
    regularAuditing,
    employModelInterpretability,
    qualityControlProcedures,
  ];

  // Create deck structure
  const deckData = {
    metadata: {
      id: 'bias-deck-v1',
      name: 'Bias and Mitigation Cards',
      version: '1.0.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      categories: {
        'cognitive-bias': {
          name: 'Cognitive Biases',
          description:
            'Biases arising from mental shortcuts and cognitive limitations',
          color: '#FCD34D',
          count: cognitiveBiasCards.length,
        },
        'social-bias': {
          name: 'Social Biases',
          description:
            'Biases reflecting societal inequalities and cultural factors',
          color: '#93C5FD',
          count: socialBiasCards.length,
        },
        'statistical-bias': {
          name: 'Statistical Biases',
          description:
            'Biases from data collection, processing, and analysis methods',
          color: '#A78BFA',
          count: statisticalBiasCards.length,
        },
        'mitigation-technique': {
          name: 'Mitigation Techniques',
          description: 'Strategies to identify and address biases',
          color: '#86EFAC',
          count: mitigationCards.length,
        },
      },
    },
    biasCards: [
      ...cognitiveBiasCards.map((card, index) => ({
        ...card,
        id: card.title, // Use title as ID for consistency
        category: 'cognitive-bias',
        displayNumber: String(index + 1).padStart(2, '0'),
        tags: generateTags(card as CardData),
      })),
      ...socialBiasCards.map((card, index) => ({
        ...card,
        id: card.title, // Use title as ID for consistency
        category: 'social-bias',
        displayNumber: String(index + 1).padStart(2, '0'),
        tags: generateTags(card as CardData),
      })),
      ...statisticalBiasCards.map((card, index) => ({
        ...card,
        id: card.title, // Use title as ID for consistency
        category: 'statistical-bias',
        displayNumber: String(index + 1).padStart(2, '0'),
        tags: generateTags(card as CardData),
      })),
    ],
    mitigationCards: mitigationCards.map((card, index) => ({
      ...card,
      id: card.title, // Use title as ID for consistency
      category: 'mitigation-technique',
      displayNumber: String(index + 1).padStart(2, '0'),
      applicableStages: inferApplicableStages(card as CardData),
      tags: generateTags(card as CardData),
    })),
  };

  // Write to file
  const outputPath = join(process.cwd(), 'app/data/decks/bias-deck.json');
  writeFileSync(outputPath, JSON.stringify(deckData, null, 2));

  const totalBiasCards =
    cognitiveBiasCards.length +
    socialBiasCards.length +
    statisticalBiasCards.length;
  console.log(
    `✅ Migrated ${totalBiasCards} bias cards and ${mitigationCards.length} mitigation cards`
  );
  console.log(`📁 Deck saved to: ${outputPath}`);

  // Print statistics
  console.log('\n📊 Deck Statistics:');
  console.log(`  - Cognitive Bias Cards: ${cognitiveBiasCards.length}`);
  console.log(`  - Social Bias Cards: ${socialBiasCards.length}`);
  console.log(`  - Statistical Bias Cards: ${statisticalBiasCards.length}`);
  console.log(`  - Mitigation Cards: ${mitigationCards.length}`);
  console.log(`  - Total Cards: ${totalBiasCards + mitigationCards.length}`);
}

// Run migration
try {
  migrateCardsToDeck();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
