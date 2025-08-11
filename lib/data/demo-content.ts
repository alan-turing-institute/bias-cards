import { BiasActivity } from '@/lib/activities/bias-activity';
import { BiasDeck } from '@/lib/cards/decks/bias-deck';
import type { Activity } from '@/lib/types/activity';
import type { BiasActivityData } from '@/lib/types/bias-activity';
import type { BiasCard, MitigationCard } from '@/lib/types/cards';
import type { ProjectInfo } from '@/lib/types/project-info';
import type { Report, ReportSummary } from '@/lib/types/reports';

// Demo Activities - Educational examples in different domains
export const DEMO_ACTIVITIES: Partial<Activity>[] = [
  {
    id: 'demo-ai-triage-tool',
    title: 'AI Risk Assessment Tool',
    isDemo: true,
    description:
      'An AI system used by healthcare professionals to triage patients and assess risk as part of a preliminary assessment. The system will be used to support accident and emergency departments.',
    projectType: 'Health & Social Care',
    status: 'in-progress',
    currentStage: 5,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    progress: {
      completed: 5,
      total: 5,
    },
    lifecycleStages: {
      'problem-formulation': {
        completed: true,
        biases: [
          '1', // Confirmation Bias
          '2', // Availability Bias
          '6', // Naive Realism
          '18', // Aggregation Bias (was '21')
        ],
        mitigations: ['4', '3'],
        notes:
          'Engaged diverse stakeholder groups including radiologists, oncologists, patient advocacy groups, and health equity researchers. Identified key assumptions about diagnostic patterns that may not generalize across different populations. Discovered critical concerns about triage thresholds and pain expression variations across cultures. Community engagement revealed that many vulnerable patients avoid ambulances due to cost fears or immigration concerns, affecting our data representation.',
      },
      'data-extraction-procurement': {
        completed: true,
        biases: [
          '16', // Selection Bias
          '15', // Representation Bias
          '12', // Historical Bias
          '18', // Missing Data Bias
          '10', // Chronological Bias
          '14', // Label Bias
        ],
        mitigations: ['2', '4'], // Additional Data Collection, Stakeholder Engagement
        notes:
          'Training data primarily from urban academic medical centers. Identified significant underrepresentation of rural populations, certain ethnic groups, and patients with comorbidities. Historical data reflects past diagnostic disparities. Demographic audit revealed homeless populations comprised only 0.3% representation despite 2.8% of A&E visits. South Asian women were underrepresented by 71% in cardiac emergency data due to atypical symptom presentations and cultural barriers.',
      },
      'data-analysis': {
        completed: true,
        biases: [
          '21', // Measurement Bias
          '18', // Missing Data Bias
          '24', // Wrong Sample Size Bias (was survivorship)
          '18', // Aggregation Bias
          '1', // Confirmation Bias
        ],
        mitigations: ['6'], // Identify Underrepresented Groups
        notes:
          'Image quality varies significantly between different scanning equipment. Missing follow-up data for patients who left the healthcare system. Need to account for different imaging protocols across institutions. Comprehensive bias awareness training revealed critical gaps in data interpretation - detection of atypical MI presentations in women improved by 29% after training team to systematically investigate unusual patterns rather than dismissing them.',
      },
      'preprocessing-feature-engineering': {
        completed: true,
        biases: [
          '11', // De-agentification Bias (closest to proxy discrimination)
          '13', // Implementation Bias
        ],
        mitigations: ['5', '8'],
        notes:
          'Identified potential proxy variables for protected characteristics in preprocessing stage. Implemented fairness-aware feature selection to prevent indirect discrimination through correlated features. Addressed excessive scepticism toward AI assistance through targeted stakeholder engagement.',
      },
      'model-selection-training': {
        completed: true,
        biases: [
          '7', // Decision-Automation Bias
          '8', // Automation-Distrust Bias
        ],
        mitigations: ['4', '7'],
        notes:
          'Addressed automation bias concerns through stakeholder engagement and comprehensive training program. Healthcare professionals now maintain appropriate scepticism toward AI recommendations while recognizing genuine value. Established ongoing monitoring to prevent over-reliance on automated decision-making.',
      },
      'model-testing-validation': {
        completed: true,
        biases: [
          '23', // Training-Serving Skew
        ],
        mitigations: ['11', '9'],
        notes:
          'Training-serving skew becomes evident during model testing and validation when evaluating performance on test datasets that may not fully represent real-world A&E conditions. The training data from urban teaching hospitals during standard hours differs dramatically from the reality of weekend nights in under-resourced A&E departments, seasonal flu surges, or pandemic conditions.',
      },
      'model-reporting': {
        completed: true,
        biases: [
          '6', // Optimism Bias
        ],
        mitigations: ['1', '11'],
        notes:
          'Optimism bias manifests during model reporting when teams present overly positive assessments of AI triage system performance, underestimating implementation challenges and timelines for real-world deployment.',
      },
      'system-implementation': {
        completed: true,
        biases: [
          '13', // Implementation Bias
        ],
        mitigations: ['7', '4'],
        notes:
          'Implementation bias poses significant risks when deploying triage AI in real A&E departments. The system designed for decision support might become a de facto decision-maker, with UI design inadvertently pushing clinicians towards AI recommendations.',
      },
      'system-use-monitoring': {
        completed: true,
        biases: [
          '7', // Decision-Automation Bias
          '8', // Automation-Distrust Bias
        ],
        mitigations: ['7', '4'],
        notes:
          'Decision-automation bias presents a critical risk during ongoing system use in A&E departments. As healthcare professionals become familiar with the triage AI, they may develop excessive trust in its recommendations, particularly during busy periods.',
      },
      'project-planning': {
        completed: true,
        biases: [
          '17', // Status Quo Bias
          '18', // Aggregation Bias
        ],
        mitigations: ['3', '6', '9'],
        notes:
          'Status quo bias influences project planning when NHS trusts favour existing manual triage processes over AI-assisted systems despite evidence of potential improvements.',
      },
    },
  },
  {
    id: 'demo-financial-credit',
    title: 'Fair Lending AI Credit Scoring System',
    isDemo: true,
    description:
      'Complete assessment of an AI-based credit scoring system for personal loans. This activity has been completed and includes a comprehensive analysis of biases affecting lending decisions, with particular attention to proxy discrimination and feedback loops.',
    projectType: 'Financial Services',
    status: 'completed',
    currentStage: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    progress: {
      completed: 5,
      total: 5,
    },
    lifecycleStages: {
      'problem-formulation': {
        completed: true,
        biases: ['confirmation-bias', 'optimism-bias'],
        mitigations: ['peer-review', 'external-auditors'],
        notes:
          'Team initially optimistic about eliminating human bias through automation. External review revealed assumptions about creditworthiness indicators that could perpetuate discrimination.',
      },
      'data-extraction-procurement': {
        completed: true,
        biases: ['selection-bias', 'historical-bias', 'representation-bias'],
        mitigations: [
          'additional-data-collection',
          'identify-underrepresented-groups',
        ],
        notes:
          'Historical lending data reflects decades of discriminatory practices. Certain demographic groups underrepresented due to lower application rates. Need alternative data sources.',
      },
      'data-analysis': {
        completed: true,
        biases: [
          'proxy-discrimination',
          'measurement-bias',
          'omitted-variable-bias',
        ],
        mitigations: [
          'identify-proxy-attributes',
          'statistical-parity',
          'causal-analysis',
        ],
        notes:
          'Zip code and education level acting as proxies for protected attributes. Income measurement differs across employment types. Missing data on financial hardships and recovery.',
      },
      'preprocessing-feature-engineering': {
        completed: true,
        biases: ['feature-selection-bias', 'aggregation-bias'],
        mitigations: ['data-augmentation', 'individual-fairness-constraints'],
        notes:
          'Feature engineering inadvertently created combinations that correlate with protected characteristics. Aggregation masks important within-group variations.',
      },
      'model-selection-training': {
        completed: true,
        biases: [
          'algorithmic-bias',
          'feedback-loop-bias',
          'generalization-bias',
        ],
        mitigations: [
          'algorithmic-fairness-techniques',
          'adversarial-debiasing',
          'regular-auditing',
        ],
        notes:
          'Model shows differential performance across demographic groups. Feedback loops could amplify initial biases over time. Implemented fairness constraints and monitoring.',
      },
    },
  },
];

// Demo Reports - Complete with analysis and tracking
export const DEMO_REPORTS: Partial<Report>[] = [
  {
    id: 'demo-report-financial',
    activityId: 'demo-financial-credit',
    isDemo: true,
    projectInfo: {
      title: 'Fair Lending AI Credit Scoring System',
      description:
        'Comprehensive bias assessment report for AI-based credit scoring system implementation.',
      domain: 'Financial Services',
      objectives:
        'Develop fair and accurate credit scoring model that ensures regulatory compliance with fair lending laws, reduces disparate impact across protected groups, and maintains business viability.',
      scope:
        'Personal loan credit scoring system for amounts between $1,000 and $50,000. Covers initial application scoring, not ongoing account management.',
      status: 'testing' as const,
      timeline: {
        startDate: new Date(
          Date.now() - 180 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: [],
      },
      team: {
        projectLead: {
          name: 'Demo Lead',
          role: 'ML Engineering Manager',
          responsibilities:
            'Overall project coordination and technical leadership',
        },
        members: [],
        stakeholders: [],
      },
      technicalContext: {
        dataTypes: [
          'Financial history',
          'Application data',
          'Credit bureau data',
        ],
        modelTypes: ['Gradient Boosting', 'Neural Networks'],
        deploymentEnvironment: 'Cloud-based API',
        userBase: 'Loan officers and automated decision systems',
        sensitiveDataCategories: ['Financial data', 'Personal identifiers'],
        complianceRequirements: ['ECOA', 'Fair Lending', 'GDPR'],
      },
      ethicalConsiderations: {
        fairnessDefinition: 'Demographic parity and equalized odds',
        potentialHarms: ['Discriminatory lending', 'Economic exclusion'],
        mitigationApproach: 'Regular auditing and fairness constraints',
      },
      successCriteria: {
        technical: ['AUC-ROC > 0.75', 'Latency < 100ms'],
        fairness: [
          'Disparate impact ratio > 0.8',
          'Equal opportunity difference < 0.05',
        ],
        business: ['Approval rate maintenance', 'Default rate < 5%'],
      },
      constraints: {
        regulatory: ['ECOA compliance', 'Fair lending regulations'],
        technical: [
          'Must integrate with existing systems',
          'Interpretability requirements',
        ],
        resource: ['6 month timeline', 'Budget constraints'],
      },
    } as ProjectInfo,
    metadata: {
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastModified: new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: 'final',
      version: 1,
      tags: [
        'financial-services',
        'credit-scoring',
        'fair-lending',
        'completed',
      ],
    },
    permissions: {
      owner: 'demo-user',
      editors: [],
      viewers: [],
      isPublic: false,
    },
    analysis: {
      biasIdentification: [
        {
          stage: 'data-extraction-procurement',
          biases: [
            {
              biasCard: {
                id: 'historical-bias',
                name: 'Historical Bias',
                title: 'Historical Bias',
                category: 'statistical-bias',
                description:
                  'Historical lending data reflects past discriminatory practices',
                caption: 'Past discrimination embedded in training data',
                icon: 'history',
                example:
                  'Past redlining practices reflected in loan approval data',
                prompts: [],
              } as BiasCard,
              severity: 'high',
              confidence: 'high',
              comments: [],
              identifiedAt: new Date(
                Date.now() - 25 * 24 * 60 * 60 * 1000
              ).toISOString(),
              identifiedBy: 'demo-user',
              stageContext: {
                applicableActivities: ['Data collection', 'Data sourcing'],
                potentialImpact:
                  'Model learns and perpetuates historical discrimination patterns',
                evidence:
                  'Analysis shows 40% lower approval rates for certain zip codes that correlate with minority populations',
              },
            },
            {
              biasCard: {
                id: 'selection-bias',
                name: 'Selection Bias',
                title: 'Selection Bias',
                category: 'statistical-bias',
                description:
                  'Training data not representative of all applicant populations',
                caption: 'Non-representative sampling in data collection',
                icon: 'filter',
                example:
                  'Only including data from bank customers, excluding unbanked populations',
                prompts: [],
              } as BiasCard,
              severity: 'high',
              confidence: 'medium',
              comments: [],
              identifiedAt: new Date(
                Date.now() - 25 * 24 * 60 * 60 * 1000
              ).toISOString(),
              identifiedBy: 'demo-user',
              stageContext: {
                applicableActivities: ['Data sampling strategy'],
                potentialImpact:
                  'Model performs poorly for underrepresented groups',
                evidence:
                  'Some demographic groups comprise less than 5% of training data despite being 20% of population',
              },
            },
          ],
        },
        {
          stage: 'data-analysis',
          biases: [
            {
              biasCard: {
                id: 'proxy-discrimination',
                name: 'Proxy Discrimination',
                title: 'Proxy Discrimination',
                category: 'social-bias',
                description:
                  'Non-protected attributes serving as proxies for protected characteristics',
                caption: 'Indirect discrimination through correlated features',
                icon: 'link',
                example:
                  'Zip code serving as proxy for race in lending decisions',
                prompts: [],
              } as BiasCard,
              severity: 'high',
              confidence: 'high',
              comments: [],
              identifiedAt: new Date(
                Date.now() - 20 * 24 * 60 * 60 * 1000
              ).toISOString(),
              identifiedBy: 'demo-user',
              stageContext: {
                applicableActivities: ['Feature correlation analysis'],
                potentialImpact:
                  'Illegal discrimination despite not using protected attributes',
                evidence:
                  'Zip code and school attended show >0.7 correlation with race',
              },
            },
          ],
        },
        {
          stage: 'model-selection-training',
          biases: [
            {
              biasCard: {
                id: 'feedback-loop-bias',
                name: 'Feedback Loop Bias',
                title: 'Feedback Loop Bias',
                category: 'statistical-bias',
                description: 'Model decisions influence future training data',
                caption: 'Self-reinforcing bias through feedback mechanisms',
                icon: 'refresh-cw',
                example:
                  'Loan denials reduce credit history, affecting future applications',
                prompts: [],
              } as BiasCard,
              severity: 'medium',
              confidence: 'high',
              comments: [],
              identifiedAt: new Date(
                Date.now() - 15 * 24 * 60 * 60 * 1000
              ).toISOString(),
              identifiedBy: 'demo-user',
              stageContext: {
                applicableActivities: ['Model deployment planning'],
                potentialImpact: 'Initial biases amplify over time',
                evidence:
                  'Simulation shows 15% increase in disparate impact after 1 year of feedback',
              },
            },
          ],
        },
      ],
      mitigationStrategies: [
        {
          biasId: 'historical-bias',
          mitigations: [
            {
              mitigationCard: {
                id: 'additional-data-collection',
                name: 'Additional Data Collection',
                title: 'additional-data-collection',
                category: 'mitigation-technique',
                description:
                  'Collect new, unbiased data to supplement historical records',
                caption: 'Expanding data sources for better representation',
                example:
                  'Implementing diverse data collection strategies to address historical bias',
                prompts: [
                  'How can we expand our data sources?',
                  'What gaps exist in current data?',
                ],
                icon: 'data-collection',
              } as MitigationCard,
              timeline: '3 months',
              responsible: 'Data Engineering Team',
              successCriteria:
                'Achieve demographic parity in training data within 10% for all groups',
              priority: 'high',
              effort: {
                timeEstimate: '3 months',
                resourceRequirements: [
                  'Data engineers',
                  'External data sources',
                  'Legal review',
                ],
                complexity: 'high',
              },
              comments: [],
            },
            {
              mitigationCard: {
                id: 'synthetic-data-generation',
                name: 'Synthetic Data Generation',
                title: 'synthetic-data-generation',
                category: 'mitigation-technique',
                description: 'Generate synthetic examples to balance dataset',
                caption: 'Creating artificial data to address imbalances',
                example:
                  'Using GANs or other techniques to generate balanced synthetic data',
                prompts: [
                  'What synthetic data techniques can we use?',
                  'How do we validate synthetic data quality?',
                ],
                icon: 'data-generation',
              } as MitigationCard,
              timeline: '2 months',
              responsible: 'ML Engineering Team',
              successCriteria:
                'Synthetic data passes statistical similarity tests',
              priority: 'medium',
              effort: {
                timeEstimate: '2 months',
                resourceRequirements: [
                  'ML engineers',
                  'Computational resources',
                ],
                complexity: 'medium',
              },
              comments: [],
            },
          ],
        },
        {
          biasId: 'proxy-discrimination',
          mitigations: [
            {
              mitigationCard: {
                id: 'identify-proxy-attributes',
                name: 'Identify Proxy Attributes',
                title: 'identify-proxy-attributes',
                category: 'mitigation-technique',
                description:
                  'Systematically identify and handle features that proxy for protected attributes',
                caption: 'Finding hidden discriminatory patterns',
                example:
                  'Using correlation analysis and fairness audits to identify proxy variables',
                prompts: [
                  'Which features might serve as proxies?',
                  'How can we measure proxy relationships?',
                ],
                icon: 'analysis',
              } as MitigationCard,
              timeline: '1 month',
              responsible: 'Fair Lending Team',
              successCriteria:
                'All proxies identified with correlation > 0.5 documented and addressed',
              priority: 'high',
              effort: {
                timeEstimate: '1 month',
                resourceRequirements: [
                  'Data scientists',
                  'Fair lending experts',
                ],
                complexity: 'medium',
              },
              comments: [],
            },
          ],
        },
        {
          biasId: 'feedback-loop-bias',
          mitigations: [
            {
              mitigationCard: {
                id: 'regular-auditing',
                name: 'Regular Auditing',
                title: 'regular-auditing',
                category: 'mitigation-technique',
                description:
                  'Implement continuous monitoring and auditing of model decisions',
                caption: 'Ongoing bias detection and correction',
                example:
                  'Setting up automated monitoring dashboards and regular audit processes',
                prompts: [
                  'What metrics should we monitor?',
                  'How often should we audit?',
                ],
                icon: 'monitoring',
              } as MitigationCard,
              timeline: 'Ongoing',
              responsible: 'Model Risk Management',
              successCriteria:
                'Monthly bias reports with corrective actions when thresholds exceeded',
              priority: 'high',
              effort: {
                timeEstimate: 'Ongoing',
                resourceRequirements: [
                  'Monitoring infrastructure',
                  'Audit team',
                ],
                complexity: 'medium',
              },
              comments: [],
            },
          ],
        },
      ],
      executiveSummary: {
        keyFindings: [
          'Historical lending data contains significant bias that would perpetuate discrimination if used without mitigation',
          'Zip code and education features act as strong proxies for race, requiring careful handling',
          'Without intervention, feedback loops would amplify initial biases by 15% annually',
          'Current model shows 65% disparate impact ratio for certain protected groups',
        ],
        riskAssessment:
          'High risk of regulatory non-compliance and discriminatory outcomes without comprehensive bias mitigation. Estimated 3-6 months to implement all critical mitigations.',
        recommendations: [
          'Immediately implement proxy attribute analysis and removal',
          'Establish monthly bias monitoring before production deployment',
          'Engage external auditors for independent fairness assessment',
          'Develop clear documentation for regulatory compliance',
        ],
        businessImpact:
          'Initial implementation may reduce approval rates by 5-8% but will ensure long-term sustainability and regulatory compliance. Avoiding potential fines and reputational damage worth the investment.',
      },
    },
    tracking: {
      mitigationTracking: [
        {
          mitigationId: 'additional-data-collection',
          status: 'in-progress',
          progressPercentage: 40,
          updates: [
            {
              userId: 'demo-user',
              userName: 'Demo User',
              date: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              note: 'Started collecting alternative data sources. Partnered with two new data providers.',
              statusChange: {
                from: 'planned',
                to: 'in-progress',
                reason: 'Contracts signed, data ingestion pipeline being built',
              },
            },
          ],
        },
        {
          mitigationId: 'identify-proxy-attributes',
          status: 'completed',
          progressPercentage: 100,
          updates: [
            {
              userId: 'demo-user',
              userName: 'Demo User',
              date: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              note: 'Completed comprehensive proxy analysis. Identified 12 features with high correlation to protected attributes.',
              statusChange: {
                from: 'in-progress',
                to: 'completed',
                reason: 'Analysis complete and remediation plan approved',
              },
              metrics: {
                'Features Analyzed': 47,
                'Proxies Identified': 12,
                'Correlation Threshold': 0.5,
              },
            },
          ],
        },
      ],
      healthMetrics: {
        implementationProgress: 45,
        riskReduction: 30,
        complianceStatus: 'In Progress - Target: Q2 2024',
        lastAssessment: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    },
    auditTrail: [
      {
        id: 'audit-demo-1',
        userId: 'demo-user',
        userName: 'Demo User',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'created',
        description: 'Report created from completed activity',
        details: {
          section: 'report',
          reason: 'Activity assessment completed',
        },
      },
    ],
  },
];

// Helper function to get demo report summaries
export function getDemoReportSummaries(): ReportSummary[] {
  return DEMO_REPORTS.map((report) => ({
    id: report.id ?? 'unknown-id',
    activityId: report.activityId ?? 'unknown-activity',
    isDemo: true,
    title: report.projectInfo?.title || 'Untitled Report',
    status: report.metadata?.status || 'draft',
    createdAt: report.metadata?.createdAt || new Date().toISOString(),
    lastModified: report.metadata?.lastModified || new Date().toISOString(),
    version:
      typeof report.metadata?.version === 'number'
        ? report.metadata.version
        : 1,
    owner: report.permissions?.owner || 'demo-user',
    domain: report.projectInfo?.domain || '',
    tags: report.metadata?.tags || [],
    biasCount:
      report.analysis?.biasIdentification.reduce(
        (count, bi) => count + bi.biases.length,
        0
      ) || 0,
    mitigationCount:
      report.analysis?.mitigationStrategies.reduce(
        (count, ms) => count + ms.mitigations.length,
        0
      ) || 0,
    completionPercentage: 85,
  }));
}

// Metadata for demo content management
export const DEMO_METADATA = {
  version: 1,
  createdAt: new Date().toISOString(),
  description:
    'Educational demo content to help users understand the bias assessment process',
  helpText:
    'These are example activities and reports to help you get started. You can explore, modify, or delete them at any time.',
};

// V2.0 Demo Activity Support
export async function loadDemoActivityV2(
  demoName: 'ai-risk-assessment' | 'fair-lending'
): Promise<BiasActivity | null> {
  try {
    const deck = await BiasDeck.getInstance();

    // Load the appropriate demo JSON file
    const filename =
      demoName === 'ai-risk-assessment'
        ? 'ai-risk-assessment-tool.json'
        : 'fair-lending-credit-scoring.json';

    const response = await fetch(`/demo/${filename}`);
    if (!response.ok) {
      // Failed to load demo file
      return null;
    }

    const demoData = await response.json();

    if (demoData.version !== '2.0' || !demoData.activityData) {
      // Invalid demo data format
      return null;
    }

    // Create a new BiasActivity instance
    const activityData = demoData.activityData as BiasActivityData;
    const activity = new BiasActivity(deck, {
      name: activityData.name,
      description: activityData.description,
    });

    // Load the demo data into the activity
    activity.load(activityData);

    return activity;
  } catch (_error) {
    // Error loading demo activity
    return null;
  }
}

export async function loadAllDemoActivitiesV2(): Promise<{
  aiRiskDemo: BiasActivity | null;
  fairLendingDemo: BiasActivity | null;
}> {
  const [aiRiskDemo, fairLendingDemo] = await Promise.all([
    loadDemoActivityV2('ai-risk-assessment'),
    loadDemoActivityV2('fair-lending'),
  ]);

  return { aiRiskDemo, fairLendingDemo };
}

// Convert v2.0 BiasActivity to legacy Activity format for backward compatibility
export function convertV2ToLegacyActivity(
  biasActivity: BiasActivity
): Partial<Activity> {
  const activityData = biasActivity.export();
  const biases = activityData.biases;

  // Group biases by lifecycle stage for legacy format
  // biome-ignore lint/suspicious/noExplicitAny: Legacy format compatibility
  const lifecycleStages: Record<string, any> = {};

  for (const [biasId, biasEntry] of Object.entries(biases)) {
    for (const stage of biasEntry.lifecycleAssignments) {
      if (!lifecycleStages[stage]) {
        lifecycleStages[stage] = {
          completed: true,
          biases: [],
          mitigations: [],
          notes: '',
        };
      }

      lifecycleStages[stage].biases.push(biasId);

      if (biasEntry.mitigations[stage]) {
        lifecycleStages[stage].mitigations.push(
          ...biasEntry.mitigations[stage]
        );
      }

      if (biasEntry.rationale[stage]) {
        lifecycleStages[stage].notes += `${biasEntry.rationale[stage]} `;
      }
    }
  }

  return {
    id: activityData.id,
    title: activityData.name,
    description: activityData.description,
    isDemo: true,
    currentStage: activityData.state.currentStage as 1 | 2 | 3 | 4 | 5,
    status: activityData.completedAt ? 'completed' : 'in-progress',
    createdAt: activityData.createdAt,
    lastModified: activityData.updatedAt,
    lifecycleStages,
    progress: {
      completed: activityData.state.completedStages.length,
      total: 5,
    },
  };
}
