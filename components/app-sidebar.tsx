'use client';

import {
  BookOpen,
  Brain,
  Info,
  LayoutDashboard,
  Lightbulb,
  Workflow,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
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

// Navigation data with Resources and Activity sections
const data = {
  resources: [
    {
      title: 'Bias Cards',
      url: '/cards',
      icon: Brain,
      isActive: true,
      onboardingId: 'bias-cards-nav',
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
        {
          title: 'Mitigation Strategies',
          url: '/cards/mitigation',
          onboardingId: 'mitigation-nav',
        },
      ],
    },
    {
      title: 'Project Lifecycle',
      url: '/lifecycle',
      icon: Workflow,
      onboardingId: 'lifecycle-nav',
    },
    {
      title: 'Tutorial',
      url: '/tutorial',
      icon: BookOpen,
      onboardingId: 'tutorial-nav',
      items: [
        {
          title: 'Getting Started',
          url: '/tutorial',
        },
        {
          title: 'Understanding Biases',
          url: '/tutorial/understanding-biases',
        },
        {
          title: 'Bias Assessment Activity',
          url: '/tutorial/activity',
        },
        {
          title: 'Creating Reports',
          url: '/tutorial/creating-reports',
        },
      ],
    },
    {
      title: 'About',
      url: '/about',
      icon: Info,
      onboardingId: 'about-nav',
    },
  ],
  activity: [
    {
      name: 'Dashboards',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
      onboardingId: 'dashboards-nav',
      items: [
        {
          title: 'Activities',
          url: '/dashboard',
        },
        {
          title: 'Reports',
          url: '/reports',
          onboardingId: 'reports-nav',
        },
      ],
    },
    {
      name: 'Workspace',
      url: '/workspace',
      icon: Lightbulb,
      onboardingId: 'workspace-nav',
    },
    // {
    //   name: 'Team Space',
    //   url: '/team',
    //   icon: Users,
    // },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use light logo by default, switch to dark logo when theme is dark
  const logoSrc =
    mounted && theme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-transparent focus-visible:ring-0 active:bg-transparent data-[active=true]:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent"
              size="lg"
            >
              <Link
                className="flex items-center justify-center group-data-[collapsible=icon]:justify-center"
                href="/"
              >
                <div className="relative flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                  <Image
                    alt="Bias Cards Logo"
                    className="object-cover"
                    height={32}
                    src={logoSrc}
                    width={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-base text-primary">
                    Bias Cards
                  </span>
                  <span className="truncate text-xs">
                    A Turing Commons Resource
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.resources} label="Resources" />
        <NavProjects label="Activity" projects={data.activity} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
