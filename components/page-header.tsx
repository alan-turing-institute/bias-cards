import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export interface PageBreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: PageBreadcrumbItem[];
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  children,
}: PageHeaderProps) {
  // If title is provided but no breadcrumbs, create default breadcrumbs
  const effectiveBreadcrumbs =
    breadcrumbs ||
    (title ? [{ label: 'Home', href: '/' }, { label: title }] : []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" data-onboarding="sidebar-trigger" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          {effectiveBreadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {effectiveBreadcrumbs.map((breadcrumb, index) => (
                  <div className="flex items-center" key={breadcrumb.label}>
                    {index > 0 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                    <BreadcrumbItem
                      className={index === 0 ? 'hidden md:block' : ''}
                    >
                      {index === effectiveBreadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={breadcrumb.href || '#'}>
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        {children}
      </header>
      {(title || description) && (
        <div className="px-6 pb-4">
          {title && (
            <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </>
  );
}
