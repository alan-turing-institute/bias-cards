'use client';

import {
  Collapsible as CollapsibleRoot,
  CollapsibleContent as RadixCollapsibleContent,
  CollapsibleTrigger as RadixCollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import type { ComponentProps } from 'react';

function Collapsible({ ...props }: ComponentProps<typeof CollapsibleRoot>) {
  return <CollapsibleRoot data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: ComponentProps<typeof RadixCollapsibleTrigger>) {
  return <RadixCollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({
  ...props
}: ComponentProps<typeof RadixCollapsibleContent>) {
  return <RadixCollapsibleContent data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
