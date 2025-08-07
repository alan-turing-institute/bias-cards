'use client';

import {
  Activity as ActivityIcon,
  Check,
  ChevronsUpDown,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useActivityStore } from '@/lib/stores/activity-store';
import { cn } from '@/lib/utils';

interface ActivityComboboxProps {
  value?: string;
  onSelect: (activityId: string) => void;
  placeholder?: string;
  className?: string;
}

export function ActivityCombobox({
  value,
  onSelect,
  placeholder = 'Select an activity...',
  className,
}: ActivityComboboxProps) {
  const [open, setOpen] = useState(false);
  const activities = useActivityStore((state) => state.activities);

  // Filter out completed activities and sort by last modified
  const availableActivities = activities
    .filter((activity) => activity.status !== 'completed')
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

  const selectedActivity = value
    ? activities.find((activity) => activity.id === value)
    : undefined;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          variant="outline"
        >
          {selectedActivity ? (
            <div className="flex items-center gap-2 truncate">
              <ActivityIcon className="h-4 w-4" />
              <span className="truncate">{selectedActivity.title}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search activities..." />
          <CommandEmpty>No activities found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {availableActivities.map((activity) => (
                <CommandItem
                  className="flex items-start gap-3 py-3"
                  key={activity.id}
                  onSelect={(currentValue) => {
                    onSelect(currentValue);
                    setOpen(false);
                  }}
                  value={activity.id}
                >
                  <Check
                    className={cn(
                      'mt-0.5 h-4 w-4',
                      value === activity.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <Badge
                        className="ml-2 text-xs"
                        variant={
                          activity.status === 'in-progress'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {activity.status === 'in-progress'
                          ? 'In Progress'
                          : 'Draft'}
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="line-clamp-1 text-muted-foreground text-xs">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.lastModified)}
                      </span>
                      <span>
                        Stage {activity.currentStage} of{' '}
                        {activity.progress.total}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
