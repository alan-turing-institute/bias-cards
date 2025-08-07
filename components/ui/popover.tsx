'use client';

import {
  Anchor as PopoverAnchor,
  Content as PopoverContent,
  Portal as PopoverPortal,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Popover({ ...props }: ComponentProps<typeof PopoverRoot>) {
  return <PopoverRoot data-slot="popover" {...props} />;
}

function PopoverTriggerComponent({
  ...props
}: ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchorComponent({
  ...props
}: ComponentProps<typeof PopoverAnchor>) {
  return <PopoverAnchor data-slot="popover-anchor" {...props} />;
}

function PopoverContentComponent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverPortal>
      <PopoverContent
        align={align}
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
          className
        )}
        data-slot="popover-content"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPortal>
  );
}

export {
  Popover,
  PopoverAnchorComponent as PopoverAnchor,
  PopoverContentComponent as PopoverContent,
  PopoverTriggerComponent as PopoverTrigger,
};
