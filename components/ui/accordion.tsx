'use client';

import {
  Content as AccordionContent,
  Header as AccordionHeader,
  Item as AccordionItem,
  Root as AccordionRoot,
  Trigger as AccordionTrigger,
} from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function Accordion({ ...props }: React.ComponentProps<typeof AccordionRoot>) {
  return <AccordionRoot data-slot="accordion" {...props} />;
}

function AccordionItemComponent({
  className,
  ...props
}: React.ComponentProps<typeof AccordionItem>) {
  return (
    <AccordionItem
      className={cn('border-b last:border-b-0', className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

function AccordionTriggerComponent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionTrigger>) {
  return (
    <AccordionHeader className="flex">
      <AccordionTrigger
        className={cn(
          'flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionTrigger>
    </AccordionHeader>
  );
}

function AccordionContentComponent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionContent>) {
  return (
    <AccordionContent
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      data-slot="accordion-content"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionContent>
  );
}

export {
  Accordion,
  AccordionItemComponent as AccordionItem,
  AccordionTriggerComponent as AccordionTrigger,
  AccordionContentComponent as AccordionContent,
};
