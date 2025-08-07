'use client';

import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function HelpTooltip({
  content,
  className,
  side = 'top',
  align = 'center',
  children,
  showIcon = true,
}: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button
              className={cn(
                'inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
                className
              )}
              type="button"
            >
              {showIcon && <HelpCircle className="h-3 w-3" />}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent align={align} className="max-w-xs" side={side}>
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
