'use client';

import { ArrowLeft, FileStack, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { TemplateSelector } from '@/components/reports/template-selector';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { useActivityStore } from '@/lib/stores/activity-store';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useReportsStore } from '@/lib/stores/reports-store';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { useTemplateStore } from '@/lib/templates/template-store';
import type { ProjectInfo } from '@/lib/types/project-info';
import { validateActivityCompletion } from '@/lib/validation/activity-validation';

function NewReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId');

  const { generateReportFromWorkspace, isLoading, error } = useReportsStore();
  const { getActivity } = useActivityStore();
  const workspaceStore = useWorkspaceStore();
  const { biasCards, mitigationCards, loadCards } = useCardsStore();

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    title: '',
    description: '',
    domain: '',
    objectives: '',
    scope: '',
    status: 'planning',
    timeline: {
      startDate: '',
      endDate: '',
      milestones: [],
    },
    team: {
      projectLead: {
        name: '',
        role: '',
        responsibilities: '',
      },
      members: [],
      stakeholders: [],
    },
  });

  interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    gates: Array<{ name: string; passed: boolean; message: string }>;
  }

  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [canCreateReport, setCanCreateReport] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [showTemplateSelector, _setShowTemplateSelector] = useState(true);
  const { incrementUsageCount } = useTemplateStore();

  useEffect(() => {
    // Load cards if not already loaded
    if (biasCards.length === 0 || mitigationCards.length === 0) {
      loadCards();
    }
  }, [biasCards.length, mitigationCards.length, loadCards]);

  useEffect(() => {
    // Validate workspace completion only when cards are loaded
    if (biasCards.length > 0 && mitigationCards.length > 0) {
      const validation = validateActivityCompletion(
        workspaceStore,
        biasCards,
        mitigationCards
      );
      setValidationResult(validation);
      setCanCreateReport(validation.isComplete);
    }

    // If we have an activityId, try to get basic info
    if (activityId) {
      const activity = getActivity(activityId);
      if (activity) {
        setProjectInfo((prev) => ({
          ...prev,
          title: activity.title || '',
          description: activity.description || '',
          domain: activity.projectType || '',
        }));
      }
    }
  }, [activityId, getActivity, workspaceStore, biasCards, mitigationCards]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [section, subfield] = field.split('.');
      setProjectInfo((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof ProjectInfo] as Record<string, unknown>),
          [subfield]: value,
        },
      }));
    } else {
      setProjectInfo((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleTeamLeadChange = (field: string, value: string) => {
    setProjectInfo((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        projectLead: {
          ...prev.team.projectLead,
          [field]: value,
        } as typeof prev.team.projectLead,
      },
    }));
  };

  const handleCreateReport = async () => {
    if (!canCreateReport) {
      return;
    }

    try {
      const reportId = await generateReportFromWorkspace(
        activityId || 'unknown',
        projectInfo,
        undefined,
        undefined,
        selectedTemplateId || undefined
      );

      // Increment template usage count if a template was selected
      if (selectedTemplateId) {
        incrementUsageCount(selectedTemplateId);
      }

      router.push(`/reports/view?id=${reportId}`);
    } catch (_error) {
      // Error already logged above
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/reports">Reports</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Report</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Back Button */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="font-bold text-3xl tracking-tight">
            Create New Report
          </h1>
          <p className="text-muted-foreground">
            Generate a comprehensive bias analysis report from your workspace
            data.
          </p>
        </div>

        {/* Validation Status */}
        {validationResult && (
          <Card
            className={
              canCreateReport
                ? 'border-green-200 bg-green-50'
                : 'border-amber-200 bg-amber-50'
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Workspace Validation
              </CardTitle>
              <CardDescription>
                {canCreateReport
                  ? 'Your workspace meets all requirements for report generation.'
                  : 'Please complete the following requirements before generating a report.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {validationResult.gates.map((gate) => (
                  <div className="flex items-center gap-2" key={gate.name}>
                    <Badge
                      className="flex h-6 w-6 items-center justify-center rounded-full p-0"
                      variant={gate.passed ? 'default' : 'secondary'}
                    >
                      {gate.passed ? '✓' : '○'}
                    </Badge>
                    <span
                      className={
                        gate.passed ? 'text-green-700' : 'text-amber-700'
                      }
                    >
                      {gate.name}
                    </span>
                  </div>
                ))}
              </div>
              {!canCreateReport && (
                <div className="mt-4 rounded-lg bg-amber-100 p-3">
                  <p className="font-medium text-amber-800 text-sm">
                    Next Steps:
                  </p>
                  <p className="mt-1 text-amber-700 text-sm">
                    Return to the{' '}
                    <Link className="underline" href="/workspace">
                      workspace
                    </Link>{' '}
                    to complete your bias analysis before generating a report.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Template Selection */}
        {showTemplateSelector && canCreateReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileStack className="h-5 w-5" />
                Report Template
              </CardTitle>
              <CardDescription>
                Choose a template that best fits your project needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                onSelectTemplate={setSelectedTemplateId}
                projectDomain={projectInfo.domain}
                selectedTemplateId={selectedTemplateId}
              />
            </CardContent>
          </Card>
        )}

        {/* Project Information Form */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Provide details about your AI project to include in the report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter project title"
                    required
                    value={projectInfo.title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain/Sector *</Label>
                  <Input
                    id="domain"
                    onChange={(e) =>
                      handleInputChange('domain', e.target.value)
                    }
                    placeholder="e.g., Healthcare, Finance, HR"
                    required
                    value={projectInfo.domain}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  className="min-h-[100px]"
                  id="description"
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Describe the AI project, its purpose, and intended use cases"
                  required
                  value={projectInfo.description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Project Objectives</Label>
                <Textarea
                  className="min-h-[80px]"
                  id="objectives"
                  onChange={(e) =>
                    handleInputChange('objectives', e.target.value)
                  }
                  placeholder="What are the main goals and objectives of this project?"
                  value={projectInfo.objectives}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Project Scope</Label>
                <Textarea
                  className="min-h-[80px]"
                  id="scope"
                  onChange={(e) => handleInputChange('scope', e.target.value)}
                  placeholder="Define what is included and excluded from this project"
                  value={projectInfo.scope}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>
                Specify the project timeline and key milestones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    onChange={(e) =>
                      handleInputChange('timeline.startDate', e.target.value)
                    }
                    type="date"
                    value={projectInfo.timeline.startDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    onChange={(e) =>
                      handleInputChange('timeline.endDate', e.target.value)
                    }
                    type="date"
                    value={projectInfo.timeline.endDate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>
                Identify the project lead and key team members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="leadName">Project Lead Name</Label>
                  <Input
                    id="leadName"
                    onChange={(e) =>
                      handleTeamLeadChange('name', e.target.value)
                    }
                    placeholder="Full name"
                    value={projectInfo.team.projectLead.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadRole">Project Lead Role</Label>
                  <Input
                    id="leadRole"
                    onChange={(e) =>
                      handleTeamLeadChange('role', e.target.value)
                    }
                    placeholder="e.g., Data Scientist, AI Engineer"
                    value={projectInfo.team.projectLead.role}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-4">
          <div className="text-muted-foreground text-sm">
            {canCreateReport
              ? 'All requirements met. Ready to generate report.'
              : 'Complete workspace analysis to enable report generation.'}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/reports">Cancel</Link>
            </Button>
            <Button
              disabled={
                !canCreateReport ||
                isLoading ||
                !projectInfo.title ||
                !projectInfo.description
              }
              onClick={handleCreateReport}
            >
              {isLoading ? (
                <>
                  <FileText className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Report
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default function NewReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">Loading...</h3>
            <p className="text-muted-foreground">
              Please wait while we prepare the report creation form.
            </p>
          </div>
        </div>
      }
    >
      <NewReportPageContent />
    </Suspense>
  );
}
