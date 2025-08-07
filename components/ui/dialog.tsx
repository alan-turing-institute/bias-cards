'use client';

import {
  Close as DialogClose,
  Content as DialogContent,
  Description as DialogDescription,
  Overlay as DialogOverlay,
  Portal as DialogPortal,
  Root as DialogRoot,
  Title as DialogTitle,
  Trigger as DialogTrigger,
} from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function Dialog({ ...props }: React.ComponentProps<typeof DialogRoot>) {
  return <DialogRoot data-slot="dialog" {...props} />;
}

function DialogTriggerComponent({
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortalComponent({
  ...props
}: React.ComponentProps<typeof DialogPortal>) {
  return <DialogPortal data-slot="dialog-portal" {...props} />;
}

function DialogCloseComponent({
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  return <DialogClose data-slot="dialog-close" {...props} />;
}

function DialogOverlayComponent({
  className,
  ...props
}: React.ComponentProps<typeof DialogOverlay>) {
  return (
    <DialogOverlay
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in',
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

function DialogContentComponent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogContent> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogContent
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg',
          className
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
            data-slot="dialog-close"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
      </DialogContent>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

function DialogTitleComponent({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn('font-semibold text-lg leading-none', className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescriptionComponent({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogCloseComponent as DialogClose,
  DialogContentComponent as DialogContent,
  DialogDescriptionComponent as DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlayComponent as DialogOverlay,
  DialogPortalComponent as DialogPortal,
  DialogTitleComponent as DialogTitle,
  DialogTriggerComponent as DialogTrigger,
};
