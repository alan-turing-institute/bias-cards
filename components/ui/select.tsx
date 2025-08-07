'use client';

import {
  Content as SelectContent,
  Group as SelectGroup,
  Icon as SelectIcon,
  Item as SelectItem,
  ItemIndicator as SelectItemIndicator,
  ItemText as SelectItemText,
  Label as SelectLabel,
  Portal as SelectPortal,
  Root as SelectRoot,
  ScrollDownButton as SelectScrollDownButton,
  ScrollUpButton as SelectScrollUpButton,
  Separator as SelectSeparator,
  Trigger as SelectTrigger,
  Value as SelectValue,
  Viewport as SelectViewport,
} from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Select({ ...props }: ComponentProps<typeof SelectRoot>) {
  return <SelectRoot data-slot="select" {...props} />;
}

function SelectGroupComponent({
  ...props
}: ComponentProps<typeof SelectGroup>) {
  return <SelectGroup data-slot="select-group" {...props} />;
}

function SelectValueComponent({
  ...props
}: ComponentProps<typeof SelectValue>) {
  return <SelectValue data-slot="select-value" {...props} />;
}

function SelectTriggerComponent({
  className,
  size = 'default',
  children,
  ...props
}: ComponentProps<typeof SelectTrigger> & {
  size?: 'sm' | 'default';
}) {
  return (
    <SelectTrigger
      className={cn(
        "flex w-fit items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[size=default]:h-9 data-[size=sm]:h-8 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-size={size}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectIcon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectIcon>
    </SelectTrigger>
  );
}

function SelectContentComponent({
  className,
  children,
  position = 'popper',
  ...props
}: ComponentProps<typeof SelectContent>) {
  return (
    <SelectPortal>
      <SelectContent
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
          position === 'popper' &&
            'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
          className
        )}
        data-slot="select-content"
        position={position}
        {...props}
      >
        <SelectScrollUpButtonComponent />
        <SelectViewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectViewport>
        <SelectScrollDownButtonComponent />
      </SelectContent>
    </SelectPortal>
  );
}

function SelectLabelComponent({
  className,
  ...props
}: ComponentProps<typeof SelectLabel>) {
  return (
    <SelectLabel
      className={cn('px-2 py-1.5 text-muted-foreground text-xs', className)}
      data-slot="select-label"
      {...props}
    />
  );
}

function SelectItemComponent({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectItem>) {
  return (
    <SelectItem
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectItemIndicator>
          <CheckIcon className="size-4" />
        </SelectItemIndicator>
      </span>
      <SelectItemText>{children}</SelectItemText>
    </SelectItem>
  );
}

function SelectSeparatorComponent({
  className,
  ...props
}: ComponentProps<typeof SelectSeparator>) {
  return (
    <SelectSeparator
      className={cn('-mx-1 pointer-events-none my-1 h-px bg-border', className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

function SelectScrollUpButtonComponent({
  className,
  ...props
}: ComponentProps<typeof SelectScrollUpButton>) {
  return (
    <SelectScrollUpButton
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      data-slot="select-scroll-up-button"
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectScrollUpButton>
  );
}

function SelectScrollDownButtonComponent({
  className,
  ...props
}: ComponentProps<typeof SelectScrollDownButton>) {
  return (
    <SelectScrollDownButton
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      data-slot="select-scroll-down-button"
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectScrollDownButton>
  );
}

export {
  Select,
  SelectContentComponent as SelectContent,
  SelectGroupComponent as SelectGroup,
  SelectItemComponent as SelectItem,
  SelectLabelComponent as SelectLabel,
  SelectSeparatorComponent as SelectSeparator,
  SelectTriggerComponent as SelectTrigger,
  SelectValueComponent as SelectValue,
};
