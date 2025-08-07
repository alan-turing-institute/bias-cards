'use client';

import {
  Activity,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function DataAnalyticsPage() {
  // Mock data - in a real app, this would come from actual analytics
  const stats = {
    totalBiases: 24,
    mitigationStrategies: 16,
    completedProjects: 3,
    activeProjects: 2,
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
                <BreadcrumbPage>Data Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl tracking-tight">Data Analytics</h1>
          <p className="text-muted-foreground">
            Analyze patterns and trends in your bias identification and
            mitigation activities.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="ml-2 font-semibold text-sm">Total Biases</h3>
            </div>
            <div className="mt-2">
              <div className="font-bold text-2xl">{stats.totalBiases}</div>
              <p className="text-muted-foreground text-xs">
                Identified across all projects
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-green-500" />
              <h3 className="ml-2 font-semibold text-sm">
                Mitigation Strategies
              </h3>
            </div>
            <div className="mt-2">
              <div className="font-bold text-2xl">
                {stats.mitigationStrategies}
              </div>
              <p className="text-muted-foreground text-xs">
                Available strategies
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-blue-500" />
              <h3 className="ml-2 font-semibold text-sm">Active Projects</h3>
            </div>
            <div className="mt-2">
              <div className="font-bold text-2xl">{stats.activeProjects}</div>
              <p className="text-muted-foreground text-xs">
                Currently in progress
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <h3 className="ml-2 font-semibold text-sm">Completed</h3>
            </div>
            <div className="mt-2">
              <div className="font-bold text-2xl">
                {stats.completedProjects}
              </div>
              <p className="text-muted-foreground text-xs">Projects finished</p>
            </div>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Bias Distribution by Category</h3>
            </div>
            <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground text-sm">
                Chart visualization would be implemented here
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Lifecycle Stage Coverage</h3>
            </div>
            <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground text-sm">
                Pie chart visualization would be implemented here
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm">
                New bias identified in Healthcare ML project
              </span>
              <span className="text-muted-foreground text-xs">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">
                Mitigation strategy applied to Hiring model
              </span>
              <span className="text-muted-foreground text-xs">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm">
                Report generated for Finance project
              </span>
              <span className="text-muted-foreground text-xs">3 days ago</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
