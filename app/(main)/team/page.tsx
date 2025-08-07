'use client';

import { MessageSquare, Plus, UserPlus, Users } from 'lucide-react';
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

type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  recentActivity: string;
};

export default function TeamCollaborationPage() {
  // Mock team data - in a real app, this would come from a database
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      role: 'ML Engineer',
      avatar: 'SC',
      status: 'online',
      recentActivity: 'Added bias to Healthcare project',
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'Data Scientist',
      avatar: 'MR',
      status: 'away',
      recentActivity: 'Reviewed mitigation strategies',
    },
    {
      id: '3',
      name: 'Emily Johnson',
      role: 'Ethics Advisor',
      avatar: 'EJ',
      status: 'offline',
      recentActivity: 'Generated compliance report',
    },
  ];

  const handleInviteTeamMember = () => {
    alert('Team invitation functionality would be implemented here');
  };

  const handleStartDiscussion = () => {
    alert('Discussion forum functionality would be implemented here');
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
                <BreadcrumbPage>Team Collaboration</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-bold text-3xl tracking-tight">
              Team Collaboration
            </h1>
            <p className="text-muted-foreground">
              Work together on bias identification and mitigation across your ML
              projects.
            </p>
          </div>
          <Button onClick={handleInviteTeamMember}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Team Members */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Team Members</h3>
                </div>
                <span className="text-muted-foreground text-sm">
                  {teamMembers.length} members
                </span>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-3"
                    key={member.id}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                          {member.avatar}
                        </div>
                        <div
                          className={`-bottom-1 -right-1 absolute h-3 w-3 rounded-full border-2 border-background ${(() => {
                            if (member.status === 'online') {
                              return 'bg-green-500';
                            }
                            if (member.status === 'away') {
                              return 'bg-yellow-500';
                            }
                            return 'bg-gray-400';
                          })()}`}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-sm">
                        {member.recentActivity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={handleStartDiscussion}
                  variant="outline"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Discussion
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={handleInviteTeamMember}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Recent Discussions</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    Healthcare Model Bias Review
                  </div>
                  <div className="text-muted-foreground text-xs">
                    3 participants • 5 messages
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    Fairness Metrics Discussion
                  </div>
                  <div className="text-muted-foreground text-xs">
                    2 participants • 12 messages
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    Mitigation Strategy Planning
                  </div>
                  <div className="text-muted-foreground text-xs">
                    4 participants • 8 messages
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
