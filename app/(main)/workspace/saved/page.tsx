'use client';

import { useRouter } from 'next/navigation';
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

export default function SavedActivitiesPage() {
  const router = useRouter();
  // In a real app, this would fetch saved workspaces from a database
  interface SavedWorkspace {
    id: string;
    name: string;
    description?: string;
    lastModified: string;
    status: string;
  }

  const savedWorkspaces: SavedWorkspace[] = [];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/workspace">
                  Activity Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Saved Activities</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl tracking-tight">
            Saved Activities
          </h1>
          <p className="text-muted-foreground">
            Resume your previous bias mapping activities.
          </p>
        </div>

        {savedWorkspaces.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="mb-2 font-semibold text-lg">No saved activities</h3>
            <p className="mb-4 text-muted-foreground">
              You haven't saved any activities yet. Create a new activity to get
              started.
            </p>
            <Button onClick={() => router.push('/workspace/new')}>
              Create New Activity
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Saved workspace cards would be displayed here */}
          </div>
        )}
      </div>
    </>
  );
}
