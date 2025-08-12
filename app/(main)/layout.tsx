'use client';

import type { ReactNode } from 'react';
import { ActivityFooter } from '@/components/activity-footer';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { OnboardingOverlay } from '@/components/ui/onboarding-overlay';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ToastProvider } from '@/components/ui/toast-provider';
import { WelcomeDialog } from '@/components/ui/welcome-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MainLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <SidebarProvider defaultOpen={!isMobile}>
          <AppSidebar />
          <SidebarInset className="relative">
            <div className="pb-16 md:pb-20">{children}</div>
            <ActivityFooter />
          </SidebarInset>
          <MobileNav />
          <WelcomeDialog />
          <OnboardingOverlay />
        </SidebarProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
