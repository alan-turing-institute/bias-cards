'use client';

import {
  Arrow as TooltipArrow,
  Content as TooltipContent,
  Portal as TooltipPortal,
  Provider as TooltipProvider,
  Root as TooltipRoot,
  Trigger as TooltipTrigger,
} from '@radix-ui/react-tooltip';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function TooltipProviderComponent({
  delayDuration = 0,
  ...props
}: ComponentProps<typeof TooltipProvider>) {
  return (
    <TooltipProvider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: ComponentProps<typeof TooltipRoot>) {
  return <TooltipRoot data-slot="tooltip" {...props} />;
}

function TooltipTriggerComponent({
  ...props
}: ComponentProps<typeof TooltipTrigger>) {
  return <TooltipTrigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContentComponent({
  className,
  sideOffset = 4,
  showArrow = true,
  ...props
}: ComponentProps<typeof TooltipContent> & { showArrow?: boolean }) {
  return (
    <TooltipPortal>
      <TooltipContent
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 animate-in overflow-hidden rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs shadow-md data-[state=closed]:animate-out',
          className
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      >
        {props.children}
        {showArrow && (
          <TooltipArrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] border bg-popover fill-popover" />
        )}
      </TooltipContent>
    </TooltipPortal>
  );
}

export {
  Tooltip,
  TooltipContentComponent as TooltipContent,
  TooltipProviderComponent as TooltipProvider,
  TooltipTriggerComponent as TooltipTrigger,
};
