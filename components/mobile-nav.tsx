'use client';

import { Activity, LayoutDashboard, Menu, Users, Workflow } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Workspace',
    href: '/workspace',
    icon: Activity,
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    title: 'Lifecycle',
    href: '/lifecycle',
    icon: Workflow,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around py-2">
        <Button
          className="flex-1 rounded-none"
          onClick={toggleSidebar}
          size="sm"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-none py-2 text-xs transition-colors',
                'hover:bg-muted hover:text-primary',
                isActive && 'text-primary'
              )}
              href={item.href}
              key={item.href}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'text-primary')}
              />
              <span className={cn('text-[10px]', isActive && 'font-medium')}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
