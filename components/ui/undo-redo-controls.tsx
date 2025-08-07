'use client';

import { Redo, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { cn } from '@/lib/utils';

interface UndoRedoControlsProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function UndoRedoControls({
  className,
  size = 'default',
}: UndoRedoControlsProps) {
  const { undo, redo, canUndo, canRedo, history } = useWorkspaceStore();

  const lastAction = history.undoStack.at(-1);
  const nextAction = history.redoStack.at(-1);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8 w-8 p-0"
            disabled={!canUndo()}
            onClick={undo}
            size={size}
            variant="ghost"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {canUndo() && lastAction
              ? `Undo: ${lastAction.description}`
              : 'Nothing to undo'}
          </p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8 w-8 p-0"
            disabled={!canRedo()}
            onClick={redo}
            size={size}
            variant="ghost"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {canRedo() && nextAction
              ? `Redo: ${nextAction.description}`
              : 'Nothing to redo'}
          </p>
        </TooltipContent>
      </Tooltip>

      {(canUndo() || canRedo()) && (
        <div className="ml-2 text-muted-foreground text-xs">
          {history.undoStack.length} actions
        </div>
      )}
    </div>
  );
}
