'use client';

import {
  Avatar as AvatarRoot,
  AvatarFallback as RadixAvatarFallback,
  AvatarImage as RadixAvatarImage,
} from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: ComponentProps<typeof AvatarRoot>) {
  return (
    <AvatarRoot
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: ComponentProps<typeof RadixAvatarImage>) {
  return (
    <RadixAvatarImage
      className={cn('aspect-square size-full', className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof RadixAvatarFallback>) {
  return (
    <RadixAvatarFallback
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted',
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
