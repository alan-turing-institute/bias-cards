'use client';

import { Grid2X2, Layers3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'grid' | 'grouped';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({
  currentView,
  onViewChange,
  className,
}: ViewToggleProps) {
  const viewOptions = [
    {
      value: 'list' as ViewMode,
      icon: List,
      label: 'List View',
      description: 'Standard horizontal cards (70px height)',
    },
    {
      value: 'grid' as ViewMode,
      icon: Grid2X2,
      label: 'Grid View',
      description: 'Compact 2-column grid (50px height)',
    },
    {
      value: 'grouped' as ViewMode,
      icon: Layers3,
      label: 'Grouped View',
      description: 'Categories with collapsible sections (32px height)',
    },
  ];

  return (
    <div className={cn('flex rounded-md border bg-muted p-1', className)}>
      {viewOptions.map(({ value, icon: Icon, label, description }) => (
        <HelpTooltip content={description} key={value} side="bottom">
          <Button
            className={cn(
              'h-8 px-2',
              currentView === value
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            )}
            onClick={() => onViewChange(value)}
            size="sm"
            variant={currentView === value ? 'default' : 'ghost'}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="ml-1.5 font-medium text-xs">
              {label.split(' ')[0]}
            </span>
          </Button>
        </HelpTooltip>
      ))}
    </div>
  );
}
