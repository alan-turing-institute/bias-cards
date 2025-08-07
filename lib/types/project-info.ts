/**
 * Team member information for project context
 */
export interface TeamMember {
  /** Team member's name */
  name: string;

  /** Role/title within the project */
  role: string;

  /** Specific responsibilities for this project */
  responsibilities: string;

  /** Contact email (optional) */
  email?: string;

  /** Department or organization */
  department?: string;
}

/**
 * External stakeholder information
 */
export interface Stakeholder {
  /** Stakeholder's name */
  name: string;

  /** Organization they represent */
  organization: string;

  /** Their role in relation to the project */
  role: string;

  /** Level of involvement (high/medium/low) */
  involvement: 'high' | 'medium' | 'low';

  /** Contact information (optional) */
  email?: string;
}

/**
 * Project milestone information
 */
export interface ProjectMilestone {
  /** Milestone identifier */
  id: string;

  /** Milestone name/title */
  name: string;

  /** Detailed description */
  description: string;

  /** Target completion date */
  targetDate: string;

  /** Actual completion date (if completed) */
  completedDate?: string;

  /** Current status */
  status: 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';

  /** Dependencies on other milestones */
  dependencies?: string[];
}

/**
 * Technical context and environment details
 */
export interface TechnicalContext {
  /** Types of data being processed */
  dataTypes: string[];

  /** Machine learning model types being used */
  modelTypes: string[];

  /** Deployment environment (cloud, on-premise, hybrid) */
  deploymentEnvironment: string;

  /** Description of the user base */
  userBase: string;

  /** Categories of sensitive data involved */
  sensitiveDataCategories: string[];

  /** Compliance requirements */
  complianceRequirements: string[];

  /** Third-party services or APIs used */
  externalDependencies?: string[];

  /** Data volume and scale information */
  scale?: {
    dataVolume: string;
    userCount: string;
    transactionVolume: string;
  };
}

/**
 * Comprehensive project information structure
 */
export interface ProjectInfo {
  // Basic project information (inherited from activity)
  /** Project title */
  title: string;

  /** Project description */
  description: string;

  /** Domain or sector (healthcare, finance, etc.) */
  domain: string;

  // Extended project details (collected during report generation)
  /** Project objectives and goals */
  objectives: string;

  /** Project scope and boundaries */
  scope: string;

  /** Current project status */
  status: 'planning' | 'development' | 'testing' | 'deployed' | 'maintenance';

  /** Project timeline information */
  timeline: {
    /** Project start date */
    startDate: string;

    /** Expected or actual end date */
    endDate: string;

    /** Key project milestones */
    milestones: ProjectMilestone[];

    /** Current phase of the project */
    currentPhase?: string;
  };

  /** Team composition and structure */
  team: {
    /** Project lead information */
    projectLead: TeamMember;

    /** Core team members */
    members: TeamMember[];

    /** External stakeholders */
    stakeholders: Stakeholder[];

    /** Project governance structure */
    governance?: {
      reviewBoard?: string[];
      approvalProcess?: string;
      escalationPath?: string[];
    };
  };

  /** Technical implementation details */
  technicalContext?: TechnicalContext;

  /** Business context and requirements */
  businessContext?: {
    /** Primary business driver for the project */
    businessDriver: string;

    /** Expected business impact */
    expectedImpact: string;

    /** Success metrics and KPIs */
    successMetrics: string[];

    /** Risk assessment */
    risks: Array<{
      risk: string;
      impact: 'low' | 'medium' | 'high';
      probability: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
  };

  /** Regulatory and compliance information */
  compliance?: {
    /** Applicable regulations */
    regulations: string[];

    /** Compliance status */
    status: 'pending' | 'in-review' | 'compliant' | 'non-compliant';

    /** Required certifications */
    certifications?: string[];

    /** Data protection measures */
    dataProtection?: string[];
  };
}

/**
 * Template for different project types to pre-populate project info
 */
export interface ProjectTemplate {
  /** Template identifier */
  id: string;

  /** Template name */
  name: string;

  /** Template description */
  description: string;

  /** Domain this template is designed for */
  domain: string;

  /** Pre-configured project info structure */
  template: Partial<ProjectInfo>;

  /** Suggested completion order for fields */
  completionOrder?: string[];

  /** Required vs optional fields for this template */
  fieldRequirements?: {
    required: string[];
    recommended: string[];
    optional: string[];
  };
}
