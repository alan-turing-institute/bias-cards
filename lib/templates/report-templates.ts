import type { ReportTemplate } from '@/lib/types/reports';

/**
 * Default report templates for different domains
 */
export const DEFAULT_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'healthcare-ai-standard',
    name: 'Healthcare AI Bias Assessment',
    description:
      'Comprehensive template for evaluating bias in healthcare AI systems, aligned with FDA and medical ethics guidelines',
    domain: 'Healthcare',
    version: '1.0.0',
    isActive: true,
    structure: {
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          required: true,
          order: 1,
          subsections: [
            {
              id: 'clinical-impact',
              title: 'Clinical Impact Assessment',
              required: true,
              order: 1,
            },
            {
              id: 'patient-safety',
              title: 'Patient Safety Considerations',
              required: true,
              order: 2,
            },
            {
              id: 'regulatory-compliance',
              title: 'Regulatory Compliance Status',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'bias-analysis',
          title: 'Bias Analysis',
          required: true,
          order: 2,
          subsections: [
            {
              id: 'demographic-bias',
              title: 'Demographic Bias Assessment',
              required: true,
              order: 1,
            },
            {
              id: 'clinical-bias',
              title: 'Clinical Outcome Bias',
              required: true,
              order: 2,
            },
            {
              id: 'data-quality',
              title: 'Data Quality and Representation',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'mitigation-plan',
          title: 'Mitigation Strategies',
          required: true,
          order: 3,
          subsections: [
            {
              id: 'technical-mitigations',
              title: 'Technical Mitigations',
              required: true,
              order: 1,
            },
            {
              id: 'clinical-validations',
              title: 'Clinical Validation Requirements',
              required: true,
              order: 2,
            },
            {
              id: 'monitoring-plan',
              title: 'Post-Deployment Monitoring',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'stakeholder-engagement',
          title: 'Stakeholder Engagement',
          required: true,
          order: 4,
          subsections: [
            {
              id: 'healthcare-providers',
              title: 'Healthcare Provider Training',
              required: true,
              order: 1,
            },
            {
              id: 'patient-communication',
              title: 'Patient Communication Strategy',
              required: true,
              order: 2,
            },
          ],
        },
        {
          id: 'appendices',
          title: 'Appendices',
          required: false,
          order: 5,
          subsections: [
            {
              id: 'technical-details',
              title: 'Technical Implementation Details',
              required: false,
              order: 1,
            },
            {
              id: 'regulatory-docs',
              title: 'Regulatory Documentation',
              required: false,
              order: 2,
            },
          ],
        },
      ],
      defaultExportConfig: {
        format: 'pdf',
        sections: {
          executiveSummary: true,
          projectInfo: true,
          biasIdentification: true,
          mitigationStrategies: true,
          implementation: true,
          tracking: true,
          comments: true,
          auditTrail: false,
          appendices: true,
        },
        options: {
          includeSensitiveData: false,
          includeBranding: true,
          pageLayout: 'portrait',
          colorScheme: 'full',
          locale: 'en-US',
        },
      },
      requiredProjectFields: [
        'title',
        'description',
        'domain',
        'objectives',
        'scope',
        'teamMembers',
        'timeline',
        'stakeholders',
        'complianceRequirements',
        'clinicalContext',
      ],
      validationRules: {
        minimumBiasCount: 3,
        minimumMitigationCount: 3,
        requireExecutiveSummary: true,
        requireRiskAssessment: true,
        requireComplianceSection: true,
      },
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModified: new Date().toISOString(),
      usageCount: 0,
      tags: ['healthcare', 'fda', 'clinical', 'patient-safety', 'medical-ai'],
    },
  },

  {
    id: 'financial-ai-standard',
    name: 'Financial Services AI Bias Assessment',
    description:
      'Template for evaluating bias in financial AI systems, covering lending, credit scoring, and algorithmic trading',
    domain: 'Financial Services',
    version: '1.0.0',
    isActive: true,
    structure: {
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          required: true,
          order: 1,
          subsections: [
            {
              id: 'business-impact',
              title: 'Business Impact Analysis',
              required: true,
              order: 1,
            },
            {
              id: 'regulatory-risk',
              title: 'Regulatory Risk Assessment',
              required: true,
              order: 2,
            },
            {
              id: 'fairness-metrics',
              title: 'Fairness Metrics Summary',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'bias-analysis',
          title: 'Bias Analysis',
          required: true,
          order: 2,
          subsections: [
            {
              id: 'demographic-lending',
              title: 'Demographic Bias in Lending Decisions',
              required: true,
              order: 1,
            },
            {
              id: 'socioeconomic-bias',
              title: 'Socioeconomic Bias Assessment',
              required: true,
              order: 2,
            },
            {
              id: 'geographic-bias',
              title: 'Geographic and Regional Bias',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'compliance',
          title: 'Regulatory Compliance',
          required: true,
          order: 3,
          subsections: [
            {
              id: 'fair-lending',
              title: 'Fair Lending Compliance (ECOA/Reg B)',
              required: true,
              order: 1,
            },
            {
              id: 'gdpr-ccpa',
              title: 'Data Privacy Compliance (GDPR/CCPA)',
              required: true,
              order: 2,
            },
            {
              id: 'model-governance',
              title: 'Model Risk Management (SR 11-7)',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'mitigation-strategies',
          title: 'Mitigation Strategies',
          required: true,
          order: 4,
          subsections: [
            {
              id: 'algorithmic-adjustments',
              title: 'Algorithmic Bias Corrections',
              required: true,
              order: 1,
            },
            {
              id: 'monitoring-controls',
              title: 'Monitoring and Control Systems',
              required: true,
              order: 2,
            },
            {
              id: 'appeals-process',
              title: 'Customer Appeals and Remediation',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'implementation',
          title: 'Implementation Plan',
          required: true,
          order: 5,
          subsections: [
            {
              id: 'rollout-strategy',
              title: 'Phased Rollout Strategy',
              required: true,
              order: 1,
            },
            {
              id: 'success-metrics',
              title: 'Success Metrics and KPIs',
              required: true,
              order: 2,
            },
          ],
        },
      ],
      defaultExportConfig: {
        format: 'pdf',
        sections: {
          executiveSummary: true,
          projectInfo: true,
          biasIdentification: true,
          mitigationStrategies: true,
          implementation: true,
          tracking: true,
          comments: true,
          auditTrail: true,
          appendices: true,
        },
        options: {
          includeSensitiveData: false,
          includeBranding: true,
          pageLayout: 'portrait',
          colorScheme: 'full',
          locale: 'en-US',
        },
      },
      requiredProjectFields: [
        'title',
        'description',
        'domain',
        'objectives',
        'scope',
        'teamMembers',
        'timeline',
        'stakeholders',
        'complianceRequirements',
        'businessContext',
        'riskTolerance',
      ],
      validationRules: {
        minimumBiasCount: 5,
        minimumMitigationCount: 5,
        requireExecutiveSummary: true,
        requireRiskAssessment: true,
        requireComplianceSection: true,
        requireFairnessMetrics: true,
      },
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModified: new Date().toISOString(),
      usageCount: 0,
      tags: [
        'finance',
        'lending',
        'credit',
        'fair-lending',
        'ecoa',
        'regulatory',
      ],
    },
  },

  {
    id: 'recruitment-ai-standard',
    name: 'Recruitment AI Bias Assessment',
    description:
      'Template for evaluating bias in recruitment and hiring AI systems, ensuring fair and inclusive hiring practices',
    domain: 'Recruitment',
    version: '1.0.0',
    isActive: true,
    structure: {
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          required: true,
          order: 1,
          subsections: [
            {
              id: 'diversity-impact',
              title: 'Diversity & Inclusion Impact',
              required: true,
              order: 1,
            },
            {
              id: 'legal-compliance',
              title: 'Legal Compliance Assessment',
              required: true,
              order: 2,
            },
            {
              id: 'candidate-experience',
              title: 'Candidate Experience Impact',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'bias-analysis',
          title: 'Bias Analysis',
          required: true,
          order: 2,
          subsections: [
            {
              id: 'resume-screening',
              title: 'Resume Screening Bias',
              required: true,
              order: 1,
            },
            {
              id: 'demographic-bias',
              title: 'Demographic and Protected Class Bias',
              required: true,
              order: 2,
            },
            {
              id: 'linguistic-bias',
              title: 'Linguistic and Cultural Bias',
              required: true,
              order: 3,
            },
            {
              id: 'educational-bias',
              title: 'Educational Background Bias',
              required: true,
              order: 4,
            },
          ],
        },
        {
          id: 'legal-compliance',
          title: 'Legal and Regulatory Compliance',
          required: true,
          order: 3,
          subsections: [
            {
              id: 'eeoc-compliance',
              title: 'EEOC Compliance',
              required: true,
              order: 1,
            },
            {
              id: 'ada-compliance',
              title: 'ADA Compliance',
              required: true,
              order: 2,
            },
            {
              id: 'gdpr-privacy',
              title: 'Data Privacy (GDPR/CCPA)',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'mitigation-strategies',
          title: 'Mitigation Strategies',
          required: true,
          order: 4,
          subsections: [
            {
              id: 'algorithm-improvements',
              title: 'Algorithm Design Improvements',
              required: true,
              order: 1,
            },
            {
              id: 'human-oversight',
              title: 'Human Review and Oversight',
              required: true,
              order: 2,
            },
            {
              id: 'inclusive-design',
              title: 'Inclusive Design Practices',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'implementation',
          title: 'Implementation and Monitoring',
          required: true,
          order: 5,
          subsections: [
            {
              id: 'pilot-program',
              title: 'Pilot Program Design',
              required: true,
              order: 1,
            },
            {
              id: 'diversity-metrics',
              title: 'Diversity Metrics and Tracking',
              required: true,
              order: 2,
            },
            {
              id: 'feedback-loops',
              title: 'Candidate Feedback Integration',
              required: true,
              order: 3,
            },
          ],
        },
      ],
      defaultExportConfig: {
        format: 'pdf',
        sections: {
          executiveSummary: true,
          projectInfo: true,
          biasIdentification: true,
          mitigationStrategies: true,
          implementation: true,
          tracking: true,
          comments: true,
          auditTrail: false,
          appendices: true,
        },
        options: {
          includeSensitiveData: false,
          includeBranding: true,
          pageLayout: 'portrait',
          colorScheme: 'full',
          locale: 'en-US',
        },
      },
      requiredProjectFields: [
        'title',
        'description',
        'domain',
        'objectives',
        'scope',
        'teamMembers',
        'timeline',
        'stakeholders',
        'complianceRequirements',
        'diversityGoals',
        'hiringVolume',
      ],
      validationRules: {
        minimumBiasCount: 4,
        minimumMitigationCount: 4,
        requireExecutiveSummary: true,
        requireRiskAssessment: true,
        requireComplianceSection: true,
        requireDiversityMetrics: true,
      },
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModified: new Date().toISOString(),
      usageCount: 0,
      tags: ['recruitment', 'hiring', 'hr', 'diversity', 'inclusion', 'eeoc'],
    },
  },

  {
    id: 'general-ai-standard',
    name: 'General AI Bias Assessment',
    description:
      'Flexible template for general AI bias assessment across various domains',
    domain: 'General',
    version: '1.0.0',
    isActive: true,
    structure: {
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          required: true,
          order: 1,
          subsections: [
            {
              id: 'key-findings',
              title: 'Key Findings',
              required: true,
              order: 1,
            },
            {
              id: 'risk-assessment',
              title: 'Risk Assessment',
              required: true,
              order: 2,
            },
            {
              id: 'recommendations',
              title: 'Recommendations',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'project-context',
          title: 'Project Context',
          required: true,
          order: 2,
        },
        {
          id: 'bias-identification',
          title: 'Bias Identification',
          required: true,
          order: 3,
        },
        {
          id: 'mitigation-strategies',
          title: 'Mitigation Strategies',
          required: true,
          order: 4,
        },
        {
          id: 'implementation-plan',
          title: 'Implementation Plan',
          required: true,
          order: 5,
        },
        {
          id: 'monitoring-evaluation',
          title: 'Monitoring & Evaluation',
          required: true,
          order: 6,
        },
        {
          id: 'appendices',
          title: 'Appendices',
          required: false,
          order: 7,
        },
      ],
      defaultExportConfig: {
        format: 'pdf',
        sections: {
          executiveSummary: true,
          projectInfo: true,
          biasIdentification: true,
          mitigationStrategies: true,
          implementation: true,
          tracking: true,
          comments: true,
          auditTrail: false,
          appendices: true,
        },
        options: {
          includeSensitiveData: false,
          includeBranding: true,
          pageLayout: 'portrait',
          colorScheme: 'full',
          locale: 'en-US',
        },
      },
      requiredProjectFields: [
        'title',
        'description',
        'domain',
        'objectives',
        'scope',
        'teamMembers',
        'timeline',
      ],
      validationRules: {
        minimumBiasCount: 2,
        minimumMitigationCount: 2,
        requireExecutiveSummary: true,
        requireRiskAssessment: true,
        requireComplianceSection: false,
      },
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModified: new Date().toISOString(),
      usageCount: 0,
      tags: ['general', 'flexible', 'multi-domain'],
    },
  },
];

/**
 * Get all active report templates
 */
export function getActiveTemplates(): ReportTemplate[] {
  return DEFAULT_REPORT_TEMPLATES.filter((template) => template.isActive);
}

/**
 * Get templates by domain
 */
export function getTemplatesByDomain(domain: string): ReportTemplate[] {
  return DEFAULT_REPORT_TEMPLATES.filter(
    (template) =>
      template.domain.toLowerCase() === domain.toLowerCase() &&
      template.isActive
  );
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(id: string): ReportTemplate | undefined {
  return DEFAULT_REPORT_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get template suggestions based on project info
 */
export function suggestTemplates(projectDomain: string): ReportTemplate[] {
  // First try exact domain match
  const domainTemplates = getTemplatesByDomain(projectDomain);
  if (domainTemplates.length > 0) {
    return domainTemplates;
  }

  // Otherwise return general template
  return DEFAULT_REPORT_TEMPLATES.filter(
    (template) => template.domain === 'General' && template.isActive
  );
}

/**
 * Validate if a report meets template requirements
 */
export function validateReportAgainstTemplate(
  report: any,
  templateId: string
): { isValid: boolean; errors: string[] } {
  const template = getTemplateById(templateId);
  if (!template) {
    return { isValid: false, errors: ['Template not found'] };
  }

  const errors: string[] = [];
  const rules = template.structure.validationRules;

  // Check minimum bias count
  if (
    rules.minimumBiasCount &&
    report.analysis.biasIdentification.length < rules.minimumBiasCount
  ) {
    errors.push(
      `Report must identify at least ${rules.minimumBiasCount} biases`
    );
  }

  // Check minimum mitigation count
  if (
    rules.minimumMitigationCount &&
    report.analysis.mitigationStrategies.length < rules.minimumMitigationCount
  ) {
    errors.push(
      `Report must include at least ${rules.minimumMitigationCount} mitigation strategies`
    );
  }

  // Check required sections
  if (rules.requireExecutiveSummary && !report.analysis.executiveSummary) {
    errors.push('Executive summary is required');
  }

  if (
    rules.requireRiskAssessment &&
    !report.analysis.executiveSummary?.riskAssessment
  ) {
    errors.push('Risk assessment is required');
  }

  // Check required project fields
  template.structure.requiredProjectFields.forEach((field) => {
    if (!report.projectInfo[field]) {
      errors.push(`Project field '${field}' is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
