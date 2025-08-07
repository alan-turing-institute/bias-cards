'use client';

import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function GenerateReportPage() {
  const handleGenerateReport = () => {
    // In a real app, this would generate and download a report
    alert('Report generation functionality would be implemented here');
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
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Generate Report</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl tracking-tight">Generate Report</h1>
          <p className="text-muted-foreground">
            Create comprehensive bias assessment reports for your ML projects.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Bias Assessment Report</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Comprehensive analysis of identified biases and mitigation
                  strategies.
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={handleGenerateReport}>
              <Download className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Technical Documentation</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Markdown format for integration with documentation systems.
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={handleGenerateReport}>
              <Download className="mr-2 h-4 w-4" />
              Generate Markdown
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Editable Report</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Word document format for collaborative editing and review.
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={handleGenerateReport}>
              <Download className="mr-2 h-4 w-4" />
              Generate DOCX
            </Button>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-lg">Report Options</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-sm">Include Sections</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input className="rounded" defaultChecked type="checkbox" />
                  <span className="text-sm">Bias Identification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input className="rounded" defaultChecked type="checkbox" />
                  <span className="text-sm">Mitigation Strategies</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input className="rounded" defaultChecked type="checkbox" />
                  <span className="text-sm">Risk Assessment</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">Report Format</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    defaultChecked
                    name="format"
                    type="radio"
                    value="detailed"
                  />
                  <span className="text-sm">Detailed Analysis</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input name="format" type="radio" value="summary" />
                  <span className="text-sm">Executive Summary</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
