'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavProjects({
  projects,
  label = 'Projects',
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    onboardingId?: string;
    items?: {
      title: string;
      url: string;
      onboardingId?: string;
    }[];
  }[];
  label?: string;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          // If the item has sub-items, render as collapsible
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                asChild
                className="group/collapsible"
                defaultOpen={item.isActive}
                key={item.name}
              >
                <SidebarMenuItem>
                  <div className="flex items-center">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className="group-data-[collapsible=icon]:hidden"
                        tooltip={item.name}
                        {...(item.onboardingId && {
                          'data-onboarding': item.onboardingId,
                        })}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {/* Icon-only link for collapsed state */}
                    <SidebarMenuButton
                      asChild
                      className="hidden group-data-[collapsible=icon]:flex"
                      tooltip={item.name}
                    >
                      <Link href={item.url}>{item.icon && <item.icon />}</Link>
                    </SidebarMenuButton>
                  </div>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            {...(subItem.onboardingId && {
                              'data-onboarding': subItem.onboardingId,
                            })}
                          >
                            <Link
                              href={subItem.url}
                              onClick={() => {
                                // Clear hash when navigating to activities or reports
                                if (
                                  (subItem.url === '/activities' ||
                                    subItem.url === '/reports') &&
                                  typeof window !== 'undefined' &&
                                  window.location.hash
                                ) {
                                  window.location.hash = '';
                                }
                              }}
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // If no sub-items, render as simple link
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                {...(item.onboardingId && {
                  'data-onboarding': item.onboardingId,
                })}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
