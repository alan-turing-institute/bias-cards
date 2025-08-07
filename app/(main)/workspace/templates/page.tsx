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

type Template = {
  id: string;
  name: string;
  description: string;
  domain: string;
  biasCount: number;
};

export default function TemplatesPage() {
  const router = useRouter();
  // Predefined templates for common ML domains
  const templates: Template[] = [
    {
      id: 'healthcare',
      name: 'Healthcare ML',
      description: 'Template for healthcare and medical diagnosis ML projects',
      domain: 'Healthcare',
      biasCount: 8,
    },
    {
      id: 'hiring',
      name: 'Hiring & Recruitment',
      description: 'Template for AI-powered hiring and talent acquisition',
      domain: 'HR',
      biasCount: 6,
    },
    {
      id: 'finance',
      name: 'Financial Services',
      description: 'Template for credit scoring and financial ML models',
      domain: 'Finance',
      biasCount: 7,
    },
    {
      id: 'recommendation',
      name: 'Recommendation Systems',
      description: 'Template for content and product recommendation engines',
      domain: 'E-commerce',
      biasCount: 5,
    },
  ];

  const handleUseTemplate = (_templateId: string) => {
    // In a real app, this would load the template and redirect to workspace
    router.push('/workspace');
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
                <BreadcrumbLink href="/workspace">
                  Activity Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Templates</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Start with pre-configured bias mapping templates for common ML
            domains.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card className="p-6" key={template.id}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {template.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {template.domain}
                  </span>
                  <span className="text-muted-foreground">
                    {template.biasCount} biases mapped
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
