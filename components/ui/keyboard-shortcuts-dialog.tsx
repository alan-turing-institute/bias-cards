'use client';

import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface KeyboardShortcut {
  keys: string[];
  description: string;
}

const shortcuts: KeyboardShortcut[] = [
  {
    keys: ['↑', '↓'],
    description: 'Navigate between cards',
  },
  {
    keys: ['Enter', 'Space'],
    description: 'Select/activate card for dragging',
  },
  {
    keys: ['Esc'],
    description: 'Deselect card',
  },
  {
    keys: ['Tab'],
    description: 'Move focus between sections',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
  },
];

interface KeyboardShortcutsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="icon" title="Keyboard shortcuts" variant="ghost">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and interact with cards efficiently.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              className="flex items-center justify-between gap-4"
              key={`shortcut-${index}-${shortcut.keys[0]}`}
            >
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={`${shortcut.keys[0]}-key-${keyIndex}`}>
                    <kbd className="rounded border border-gray-200 bg-gray-100 px-2 py-1 font-mono text-xs dark:border-gray-700 dark:bg-gray-800">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-muted-foreground text-xs">
                        or
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <span className="text-sm">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm">
            <strong>Tip:</strong> Focus a card and use Space or Enter to start
            dragging, then use arrow keys to move it to different lifecycle
            stages.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
