import type { Activity } from '@/lib/types/activity';
import type { BiasCard, MitigationCard } from '@/lib/types/cards';
import type { ProjectInfo } from '@/lib/types/project-info';
import type { Report, ReportSummary } from '@/lib/types/reports';

// Demo Activities - Educational examples in different domains
export const DEMO_ACTIVITIES: Partial<Activity>[] = [
  {
    id: 'demo-healthcare-ml',
    title: 'Healthcare AI Diagnostic Tool Assessment',
    isDemo: true,
    description:
      'Comprehensive bias assessment for an AI-powered diagnostic imaging system designed to detect early-stage lung cancer. This project examines potential biases across the entire ML lifecycle, with particular focus on representation and measurement biases in medical imaging.',
    projectType: 'Health & Social Care',
    status: 'in-progress',
    currentStage: 3,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    progress: {
      completed: 3,
      total: 5,
    },
    lifecycleStages: {
      'problem-formulation': {
        completed: true,
        biases: ['confirmation-bias', 'availability-bias', 'naive-realism'],
        mitigations: [
          'participatory-design-workshops',
          'peer-review',
          'stakeholder-engagement',
        ],
        notes:
          'Engaged diverse stakeholder groups including radiologists, oncologists, patient advocacy groups, and health equity researchers. Identified key assumptions about diagnostic patterns that may not generalize across different populations.',
      },
      'data-extraction-procurement': {
        completed: true,
        biases: ['selection-bias', 'representation-bias', 'historical-bias'],
        mitigations: [
          'additional-data-collection',
          'identify-underrepresented-groups',
          'synthetic-data-generation',
        ],
        notes:
          'Training data primarily from urban academic medical centers. Identified significant underrepresentation of rural populations, certain ethnic groups, and patients with comorbidities. Historical data reflects past diagnostic disparities.',
      },
      'data-analysis': {
        completed: true,
        biases: ['measurement-bias', 'missing-data-bias', 'survivorship-bias'],
        mitigations: [
          'statistical-parity',
          'identify-proxy-attributes',
          'external-validation',
        ],
        notes:
          'Image quality varies significantly between different scanning equipment. Missing follow-up data for patients who left the healthcare system. Need to account for different imaging protocols across institutions.',
      },
      'preprocessing-feature-engineering': {
        completed: false,
        biases: [],
        mitigations: [],
        notes: '',
      },
      'model-selection-training': {
        completed: false,
        biases: [],
        mitigations: [],
        notes: '',
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
                name: 'Historical Bias',
                title: 'historical-bias',
                category: 'statistical-bias',
                description:
                  'Historical lending data reflects past discriminatory practices',
                caption: 'Past discrimination embedded in training data',
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
                name: 'Selection Bias',
                title: 'selection-bias',
                category: 'statistical-bias',
                description:
                  'Training data not representative of all applicant populations',
                caption: 'Non-representative sampling in data collection',
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
                name: 'Proxy Discrimination',
                title: 'proxy-discrimination',
                category: 'social-bias',
                description:
                  'Non-protected attributes serving as proxies for protected characteristics',
                caption: 'Indirect discrimination through correlated features',
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
                name: 'Feedback Loop Bias',
                title: 'feedback-loop-bias',
                category: 'statistical-bias',
                description: 'Model decisions influence future training data',
                caption: 'Self-reinforcing bias through feedback mechanisms',
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
