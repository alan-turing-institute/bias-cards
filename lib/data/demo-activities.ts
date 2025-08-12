import { BiasActivity } from '@/lib/activities/bias-activity';
import { BiasDeck } from '@/lib/cards/decks/bias-deck';
import type { BiasActivityData } from '@/lib/types/bias-activity';

// Legacy mitigation mapping removed - unused in current codebase

export async function createDemoActivities(): Promise<{
  aiRiskDemo: BiasActivity;
  fairLendingDemo: BiasActivity;
}> {
  const deck = await BiasDeck.getInstance();

  // AI Risk Assessment Tool Demo
  const aiRiskDemo = new BiasActivity(deck, {
    name: 'AI Risk Assessment Tool',
    description:
      'An AI system used by healthcare professionals to triage patients and assess risk as part of a preliminary assessment. The system will be used to support accident and emergency departments.',
  });

  // Populate AI Risk Demo data (Healthcare)
  // Stage 1: Risk Assessment
  aiRiskDemo.assignBiasRisk('1', 'high-risk'); // Confirmation Bias
  aiRiskDemo.assignBiasRisk('2', 'medium-risk'); // Availability Bias
  aiRiskDemo.assignBiasRisk('6', 'medium-risk'); // Naive Realism
  aiRiskDemo.assignBiasRisk('18', 'high-risk'); // Aggregation Bias
  aiRiskDemo.assignBiasRisk('16', 'high-risk'); // Selection Bias
  aiRiskDemo.assignBiasRisk('15', 'high-risk'); // Representation Bias
  aiRiskDemo.assignBiasRisk('12', 'high-risk'); // Historical Bias
  aiRiskDemo.assignBiasRisk('22', 'medium-risk'); // Missing Data Bias
  aiRiskDemo.assignBiasRisk('10', 'low-risk'); // Chronological Bias
  aiRiskDemo.assignBiasRisk('14', 'medium-risk'); // Label Bias
  aiRiskDemo.assignBiasRisk('21', 'high-risk'); // Measurement Bias
  aiRiskDemo.assignBiasRisk('24', 'medium-risk'); // Wrong Sample Size Bias
  aiRiskDemo.assignBiasRisk('11', 'medium-risk'); // De-agentification Bias
  aiRiskDemo.assignBiasRisk('13', 'high-risk'); // Implementation Bias
  aiRiskDemo.assignBiasRisk('7', 'medium-risk'); // Optimism Bias
  aiRiskDemo.assignBiasRisk('4', 'high-risk'); // Decision-Automation Bias
  aiRiskDemo.assignBiasRisk('3', 'medium-risk'); // Automation-Distrust Bias
  aiRiskDemo.assignBiasRisk('23', 'high-risk'); // Training-Serving Skew
  aiRiskDemo.assignBiasRisk('17', 'medium-risk'); // Status Quo Bias

  // Stage 2: Lifecycle Assignment
  // Problem Formulation
  aiRiskDemo.assignToLifecycle('1', 'problem-formulation'); // Confirmation
  aiRiskDemo.assignToLifecycle('2', 'problem-formulation'); // Availability
  aiRiskDemo.assignToLifecycle('6', 'problem-formulation'); // Naive Realism
  aiRiskDemo.assignToLifecycle('18', 'problem-formulation'); // Aggregation

  // Data Extraction
  aiRiskDemo.assignToLifecycle('16', 'data-extraction-procurement'); // Selection
  aiRiskDemo.assignToLifecycle('15', 'data-extraction-procurement'); // Representation
  aiRiskDemo.assignToLifecycle('12', 'data-extraction-procurement'); // Historical
  aiRiskDemo.assignToLifecycle('22', 'data-extraction-procurement'); // Missing Data
  aiRiskDemo.assignToLifecycle('10', 'data-extraction-procurement'); // Chronological
  aiRiskDemo.assignToLifecycle('14', 'data-extraction-procurement'); // Label

  // Data Analysis
  aiRiskDemo.assignToLifecycle('21', 'data-analysis'); // Measurement
  aiRiskDemo.assignToLifecycle('22', 'data-analysis'); // Missing Data
  aiRiskDemo.assignToLifecycle('24', 'data-analysis'); // Wrong Sample Size
  aiRiskDemo.assignToLifecycle('18', 'data-analysis'); // Aggregation
  aiRiskDemo.assignToLifecycle('1', 'data-analysis'); // Confirmation

  // Preprocessing
  aiRiskDemo.assignToLifecycle('11', 'preprocessing-feature-engineering'); // De-agentification
  aiRiskDemo.assignToLifecycle('13', 'preprocessing-feature-engineering'); // Implementation

  // Model Selection
  aiRiskDemo.assignToLifecycle('4', 'model-selection-training'); // Decision-Automation
  aiRiskDemo.assignToLifecycle('3', 'model-selection-training'); // Automation-Distrust

  // Model Testing
  aiRiskDemo.assignToLifecycle('23', 'model-testing-validation'); // Training-Serving Skew

  // Model Reporting
  aiRiskDemo.assignToLifecycle('7', 'model-reporting'); // Optimism Bias

  // System Implementation
  aiRiskDemo.assignToLifecycle('13', 'system-implementation'); // Implementation Bias

  // System Use & Monitoring
  aiRiskDemo.assignToLifecycle('4', 'system-use-monitoring'); // Decision-Automation
  aiRiskDemo.assignToLifecycle('3', 'system-use-monitoring'); // Automation-Distrust

  // Project Planning
  aiRiskDemo.assignToLifecycle('17', 'project-planning'); // Status Quo
  aiRiskDemo.assignToLifecycle('18', 'project-planning'); // Aggregation

  // Stage 3: Rationale
  aiRiskDemo.setRationale(
    '1',
    'problem-formulation',
    'Engaged diverse stakeholder groups including radiologists, oncologists, patient advocacy groups, and health equity researchers. Identified key assumptions about diagnostic patterns that may not generalize across different populations.'
  );
  aiRiskDemo.setRationale(
    '16',
    'data-extraction-procurement',
    'Training data primarily from urban academic medical centers. Identified significant underrepresentation of rural populations, certain ethnic groups, and patients with comorbidities.'
  );
  aiRiskDemo.setRationale(
    '21',
    'data-analysis',
    'Image quality varies significantly between different scanning equipment. Missing follow-up data for patients who left the healthcare system.'
  );
  aiRiskDemo.setRationale(
    '23',
    'model-testing-validation',
    'Training-serving skew becomes evident during model testing when evaluating performance on test datasets that may not fully represent real-world A&E conditions.'
  );
  aiRiskDemo.setRationale(
    '13',
    'system-implementation',
    'Implementation bias poses significant risks when deploying triage AI in real A&E departments. The system designed for decision support might become a de facto decision-maker.'
  );

  // Stage 4: Mitigations
  aiRiskDemo.addMitigation(
    '1',
    'problem-formulation',
    'stakeholder-engagement'
  );
  aiRiskDemo.addMitigation(
    '1',
    'problem-formulation',
    'participatory-design-workshops'
  );
  aiRiskDemo.addMitigation(
    '16',
    'data-extraction-procurement',
    'additional-data-collection'
  );
  aiRiskDemo.addMitigation(
    '16',
    'data-extraction-procurement',
    'stakeholder-engagement'
  );
  aiRiskDemo.addMitigation(
    '21',
    'data-analysis',
    'identify-underrepresented-groups'
  );
  aiRiskDemo.addMitigation(
    '11',
    'preprocessing-feature-engineering',
    'data-augmentation'
  );
  aiRiskDemo.addMitigation(
    '11',
    'preprocessing-feature-engineering',
    'double-diamond-methodology'
  );
  aiRiskDemo.addMitigation(
    '4',
    'model-selection-training',
    'stakeholder-engagement'
  );
  aiRiskDemo.addMitigation(
    '4',
    'model-selection-training',
    'skills-and-training'
  );
  aiRiskDemo.addMitigation(
    '23',
    'model-testing-validation',
    'external-validation'
  );
  aiRiskDemo.addMitigation(
    '23',
    'model-testing-validation',
    'regular-auditing'
  );
  aiRiskDemo.addMitigation('7', 'model-reporting', 'peer-review');
  aiRiskDemo.addMitigation('7', 'model-reporting', 'external-validation');
  aiRiskDemo.addMitigation(
    '13',
    'system-implementation',
    'skills-and-training'
  );
  aiRiskDemo.addMitigation(
    '13',
    'system-implementation',
    'stakeholder-engagement'
  );
  aiRiskDemo.addMitigation('4', 'system-use-monitoring', 'skills-and-training');
  aiRiskDemo.addMitigation(
    '4',
    'system-use-monitoring',
    'stakeholder-engagement'
  );

  // Stage 5: Implementation Notes
  aiRiskDemo.setImplementationNote(
    '1',
    'problem-formulation',
    'stakeholder-engagement',
    {
      effectivenessRating: 4,
      notes:
        'Engaged diverse stakeholder groups including healthcare professionals and patient advocacy groups. Critical for identifying assumptions.',
      status: 'implemented',
    }
  );
  aiRiskDemo.setImplementationNote(
    '23',
    'model-testing-validation',
    'external-validation',
    {
      effectivenessRating: 5,
      notes:
        'External validation on datasets from different hospitals revealed significant performance variations. Essential for real-world deployment.',
      status: 'in-progress',
    }
  );

  // Fair Lending AI Credit Scoring System Demo
  const fairLendingDemo = new BiasActivity(deck, {
    name: 'Fair Lending AI Credit Scoring System',
    description:
      'Complete assessment of an AI-based credit scoring system for personal loans. This activity includes a comprehensive analysis of biases affecting lending decisions, with particular attention to proxy discrimination and feedback loops.',
  });

  // Populate Fair Lending Demo data (Financial Services)
  // Stage 1: Risk Assessment
  fairLendingDemo.assignBiasRisk('1', 'high-risk'); // Confirmation Bias
  fairLendingDemo.assignBiasRisk('7', 'medium-risk'); // Optimism Bias
  fairLendingDemo.assignBiasRisk('16', 'high-risk'); // Selection Bias
  fairLendingDemo.assignBiasRisk('12', 'high-risk'); // Historical Bias
  fairLendingDemo.assignBiasRisk('15', 'high-risk'); // Representation Bias
  fairLendingDemo.assignBiasRisk('21', 'high-risk'); // Measurement Bias
  fairLendingDemo.assignBiasRisk('18', 'medium-risk'); // Aggregation Bias

  // Stage 2: Lifecycle Assignment
  fairLendingDemo.assignToLifecycle('1', 'problem-formulation');
  fairLendingDemo.assignToLifecycle('7', 'problem-formulation');
  fairLendingDemo.assignToLifecycle('16', 'data-extraction-procurement');
  fairLendingDemo.assignToLifecycle('12', 'data-extraction-procurement');
  fairLendingDemo.assignToLifecycle('15', 'data-extraction-procurement');
  fairLendingDemo.assignToLifecycle('21', 'data-analysis');
  fairLendingDemo.assignToLifecycle('18', 'preprocessing-feature-engineering');

  // Stage 3: Rationale
  fairLendingDemo.setRationale(
    '1',
    'problem-formulation',
    'Team initially optimistic about eliminating human bias through automation. External review revealed assumptions about creditworthiness indicators that could perpetuate discrimination.'
  );
  fairLendingDemo.setRationale(
    '12',
    'data-extraction-procurement',
    'Historical lending data reflects decades of discriminatory practices. Certain demographic groups underrepresented due to lower application rates.'
  );
  fairLendingDemo.setRationale(
    '21',
    'data-analysis',
    'Zip code and education level acting as proxies for protected attributes. Income measurement differs across employment types.'
  );

  // Stage 4: Mitigations
  fairLendingDemo.addMitigation('1', 'problem-formulation', 'peer-review');
  fairLendingDemo.addMitigation(
    '1',
    'problem-formulation',
    'external-validation'
  );
  fairLendingDemo.addMitigation(
    '12',
    'data-extraction-procurement',
    'additional-data-collection'
  );
  fairLendingDemo.addMitigation(
    '15',
    'data-extraction-procurement',
    'identify-underrepresented-groups'
  );
  fairLendingDemo.addMitigation(
    '21',
    'data-analysis',
    'employ-model-interpretability'
  );
  fairLendingDemo.addMitigation(
    '18',
    'preprocessing-feature-engineering',
    'data-augmentation'
  );

  // Stage 5: Implementation Notes
  fairLendingDemo.setImplementationNote(
    '12',
    'data-extraction-procurement',
    'additional-data-collection',
    {
      effectivenessRating: 4,
      notes:
        'Collecting new, unbiased data to supplement historical records. Partnered with community organizations for better representation.',
      status: 'in-progress',
      assignedTo: 'Data Engineering Team',
    }
  );

  return { aiRiskDemo, fairLendingDemo };
}

export function exportDemoActivityToJSON(
  activity: BiasActivity
): BiasActivityData {
  return activity.export();
}

export function createV2DemoExportFormat(
  activityData: BiasActivityData
): unknown {
  return {
    version: '2.0',
    deckId: activityData.deckId,
    deckVersion: activityData.deckVersion,
    activityData: {
      id: activityData.id,
      name: activityData.name,
      description: activityData.description,
      biases: activityData.biases,
      state: activityData.state,
      createdAt: activityData.createdAt,
      updatedAt: activityData.updatedAt,
      completedAt: activityData.completedAt,
      metadata: activityData.metadata,
    },
  };
}
