'use client';

import {
  BarChart3,
  Brain,
  FileText,
  GalleryVerticalEnd,
  Lightbulb,
  Shield,
  Users,
  Workflow,
} from 'lucide-react';
import type { ComponentProps } from 'react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// Bias cards navigation data
const data = {
  navMain: [
    {
      title: 'Bias Cards',
      url: '/cards',
      icon: Brain,
      isActive: true,
      items: [
        {
          title: 'Cognitive Biases',
          url: '/cards/cognitive',
        },
        {
          title: 'Social Biases',
          url: '/cards/social',
        },
        {
          title: 'Statistical Biases',
          url: '/cards/statistical',
        },
      ],
    },
    {
      title: 'Mitigation Strategies',
      url: '/mitigation',
      icon: Shield,
      items: [
        {
          title: 'Data Collection',
          url: '/mitigation/data',
        },
        {
          title: 'Model Development',
          url: '/mitigation/model',
        },
        {
          title: 'Validation & Testing',
          url: '/mitigation/validation',
        },
        {
          title: 'Deployment & Monitoring',
          url: '/mitigation/deployment',
        },
      ],
    },
    {
      title: 'Project Lifecycle',
      url: '/lifecycle',
      icon: Workflow,
      items: [
        {
          title: 'Planning & Problem Definition',
          url: '/lifecycle/planning',
        },
        {
          title: 'Data Collection & Preparation',
          url: '/lifecycle/data',
        },
        {
          title: 'Model Development',
          url: '/lifecycle/model',
        },
        {
          title: 'Testing & Validation',
          url: '/lifecycle/testing',
        },
        {
          title: 'Deployment & Monitoring',
          url: '/lifecycle/deployment',
        },
      ],
    },
    {
      title: 'Activity Workspace',
      url: '/workspace',
      icon: Lightbulb,
      items: [
        {
          title: 'New Activity',
          url: '/workspace/new',
        },
        {
          title: 'Saved Activities',
          url: '/workspace/saved',
        },
        {
          title: 'Templates',
          url: '/workspace/templates',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Generate Report',
      url: '/report',
      icon: FileText,
    },
    {
      name: 'Data Analytics',
      url: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Team Collaboration',
      url: '/team',
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-primary">
                    Bias Cards
                  </span>
                  <span className="truncate text-xs">ML Education Tool</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
