'use client';

import {
  Indicator as RadioGroupIndicator,
  Item as RadioGroupItem,
  Root as RadioGroupRoot,
} from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from 'react';

import { cn } from '@/lib/utils';

const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupRoot>,
  ComponentPropsWithoutRef<typeof RadioGroupRoot>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupRoot
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupRoot.displayName;

const RadioGroupItemComponent = forwardRef<
  ElementRef<typeof RadioGroupItem>,
  ComponentPropsWithoutRef<typeof RadioGroupItem>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupItem
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    >
      <RadioGroupIndicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupIndicator>
    </RadioGroupItem>
  );
});
RadioGroupItemComponent.displayName = RadioGroupItem.displayName;

export { RadioGroup, RadioGroupItemComponent as RadioGroupItem };
