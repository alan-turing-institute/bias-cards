'use client';

import {
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  FileText,
  Share,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { ReportExportDialog } from '@/components/reports/export-dialog';
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
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useReportsStore } from '@/lib/stores/reports-store';
import type { ReportStatus } from '@/lib/types/reports';

function ReportPageContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id') || '';

  const {
    currentReport,
    setCurrentReport,

    isLoading,
    error,
  } = useReportsStore();

  useEffect(() => {
    if (reportId) {
      setCurrentReport(reportId);
    }
  }, [reportId, setCurrentReport]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">Loading Report</h3>
          <p className="text-muted-foreground">
            Please wait while we load your report...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h3 className="mb-2 font-semibold text-lg">Error Loading Report</h3>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button asChild>
            <Link href="/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">Report Not Found</h3>
          <p className="mb-4 text-muted-foreground">
            The report you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button asChild>
            <Link href="/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                <BreadcrumbLink href="/activities">Activities</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/reports">Reports</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {currentReport.projectInfo.title}
                </BreadcrumbPage>
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

        {/* Report Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-3xl tracking-tight">
                {currentReport.projectInfo.title}
              </h1>
              <Badge className={getStatusColor(currentReport.metadata.status)}>
                {currentReport.metadata.status}
              </Badge>
              <Badge variant="outline">v{currentReport.metadata.version}</Badge>
            </div>
            <p className="text-lg text-muted-foreground">
              {currentReport.projectInfo.description}
            </p>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{currentReport.permissions.owner}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Updated {formatDate(currentReport.metadata.lastModified)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <ReportExportDialog
              report={currentReport}
              trigger={
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              }
            />
          </div>
        </div>

        {/* Report Content */}
        <div className="grid gap-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Overview and details about this AI project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium">Domain</h4>
                  <p className="text-muted-foreground">
                    {currentReport.projectInfo.domain}
                  </p>
                </div>
                {currentReport.projectInfo.objectives && (
                  <div>
                    <h4 className="font-medium">Objectives</h4>
                    <p className="text-muted-foreground">
                      {currentReport.projectInfo.objectives}
                    </p>
                  </div>
                )}
                {currentReport.projectInfo.scope && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium">Scope</h4>
                    <p className="text-muted-foreground">
                      {currentReport.projectInfo.scope}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          {currentReport.analysis.executiveSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>
                  Key findings and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentReport.analysis.executiveSummary.keyFindings.length >
                  0 && (
                  <div>
                    <h4 className="font-medium">Key Findings</h4>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {currentReport.analysis.executiveSummary.keyFindings.map(
                        (finding) => (
                          <li
                            className="text-muted-foreground"
                            key={`finding-${finding.substring(0, 20)}`}
                          >
                            {finding}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {currentReport.analysis.executiveSummary.riskAssessment && (
                  <div>
                    <h4 className="font-medium">Risk Assessment</h4>
                    <p className="text-muted-foreground">
                      {currentReport.analysis.executiveSummary.riskAssessment}
                    </p>
                  </div>
                )}
                {currentReport.analysis.executiveSummary.recommendations
                  .length > 0 && (
                  <div>
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {currentReport.analysis.executiveSummary.recommendations.map(
                        (rec) => (
                          <li
                            className="text-muted-foreground"
                            key={`rec-${rec.substring(0, 20)}`}
                          >
                            {rec}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bias Identification */}
          {currentReport.analysis.biasIdentification.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bias Identification</CardTitle>
                <CardDescription>
                  Biases identified across project lifecycle stages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentReport.analysis.biasIdentification.map(
                  (identification) => (
                    <div
                      className="space-y-3"
                      key={`identification-${identification.stage}`}
                    >
                      <h4 className="font-medium capitalize">
                        {identification.stage.replace(/-/g, ' ')}
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {identification.biases.map((bias) => (
                          <div
                            className="rounded-lg border p-3"
                            key={`bias-${bias.biasCard.id}`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <h5 className="font-medium text-sm">
                                {bias.biasCard.title}
                              </h5>
                              <Badge
                                className="text-xs"
                                variant={(() => {
                                  if (bias.severity === 'high') {
                                    return 'destructive';
                                  }
                                  if (bias.severity === 'medium') {
                                    return 'default';
                                  }
                                  return 'secondary';
                                })()}
                              >
                                {bias.severity}
                              </Badge>
                            </div>
                            <p className="line-clamp-2 text-muted-foreground text-xs">
                              {bias.biasCard.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {/* Mitigation Strategies */}
          {currentReport.analysis.mitigationStrategies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mitigation Strategies</CardTitle>
                <CardDescription>
                  Planned strategies to address identified biases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentReport.analysis.mitigationStrategies.map((strategy) => (
                  <div
                    className="space-y-3"
                    key={`strategy-${strategy.biasId}`}
                  >
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {strategy.mitigations.map((mitigation) => (
                        <div
                          className="rounded-lg border p-3"
                          key={`mitigation-${mitigation.mitigationCard.id}`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <h5 className="font-medium text-sm">
                              {mitigation.mitigationCard.title}
                            </h5>
                            <Badge
                              className="text-xs"
                              variant={(() => {
                                if (mitigation.priority === 'high') {
                                  return 'destructive';
                                }
                                if (mitigation.priority === 'medium') {
                                  return 'default';
                                }
                                return 'secondary';
                              })()}
                            >
                              {mitigation.priority}
                            </Badge>
                          </div>
                          <p className="mb-2 line-clamp-2 text-muted-foreground text-xs">
                            {mitigation.mitigationCard.description}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="font-medium">Timeline:</span>{' '}
                              {mitigation.timeline}
                            </div>
                            <div>
                              <span className="font-medium">Responsible:</span>{' '}
                              {mitigation.responsible}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          {currentReport.auditTrail.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  History of changes and updates to this report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentReport.auditTrail
                    .slice(-5)
                    .reverse()
                    .map((entry) => (
                      <div
                        className="flex items-center justify-between py-2"
                        key={entry.id}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {entry.description}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            by {entry.userName} • {formatDate(entry.timestamp)}
                          </p>
                        </div>
                        <Badge className="text-xs" variant="outline">
                          {entry.action}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">Loading Report</h3>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      }
    >
      <ReportPageContent />
    </Suspense>
  );
}
