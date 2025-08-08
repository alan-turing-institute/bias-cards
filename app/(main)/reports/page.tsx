'use client';

import { Calendar, FileText, Search, Share2, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useReportsStore } from '@/lib/stores/reports-store';
import type { ReportSummary } from '@/lib/types/reports';

interface ReportCardProps {
  report: ReportSummary;
}

function ReportCard({ report }: ReportCardProps) {
  const router = useRouter();
  const { deleteReport, exportReport } = useReportsStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = report.isDemo
      ? `Delete demo report "${report.title}"? This example content won't reappear after deletion.`
      : `Are you sure you want to delete "${report.title}"?`;
    if (window.confirm(message)) {
      deleteReport(report.id);
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportReport(report.id, {
      format: 'json',
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
      },
    });
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader
        className="cursor-pointer pb-3"
        onClick={() => router.push(`/reports/view?id=${report.id}`)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1 text-lg">
              {report.title}
            </CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <User className="h-3 w-3" />
              <span>{report.owner}</span>
              <Separator className="h-3" orientation="vertical" />
              <Calendar className="h-3 w-3" />
              <span>{formatDate(report.lastModified)}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex space-x-4">
            <span className="text-muted-foreground">
              <strong>{report.biasCount}</strong> biases
            </span>
            <span className="text-muted-foreground">
              <strong>{report.mitigationCount}</strong> mitigations
            </span>
          </div>
          <span className="text-muted-foreground">
            {report.completionPercentage}% complete
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {report.isDemo && (
            <Badge className="text-xs" variant="secondary">
              Demo
            </Badge>
          )}
          <Badge className="text-xs" variant="outline">
            {report.domain}
          </Badge>
          {report.tags.slice(0, 2).map((tag) => (
            <Badge className="text-xs" key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {report.tags.length > 2 && (
            <Badge className="text-xs" variant="secondary">
              +{report.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => router.push(`/reports/view?id=${report.id}`)}
            size="sm"
          >
            View Report
          </Button>
          <Button onClick={handleExport} size="sm" variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleDelete}
            size="sm"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  const { getReportSummaries } = useReportsStore();
  const [allReports, setAllReports] = useState<ReportSummary[]>([]);

  useEffect(() => {
    // Load reports from store
    const reports = getReportSummaries();
    setAllReports(reports);
  }, [getReportSummaries]);

  const filteredReports = allReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDomain =
      domainFilter === 'all' || report.domain === domainFilter;

    return matchesSearch && matchesDomain;
  });

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
                <BreadcrumbPage>Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View and export your completed bias analysis reports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              value={searchQuery}
            />
          </div>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            onChange={(e) => setDomainFilter(e.target.value)}
            value={domainFilter}
          >
            <option value="all">All Domains</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Education">Education</option>
          </select>
        </div>

        {/* Reports Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No reports found</h3>
              <p className="mb-4 text-muted-foreground text-sm">
                {searchQuery || domainFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Reports will appear here when you complete bias analysis activities.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
