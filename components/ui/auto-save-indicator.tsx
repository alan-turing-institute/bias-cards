'use client';

import { CheckCircle, Clock, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  className?: string;
}

type SaveStatus = 'saved' | 'saving' | 'pending' | 'error';

export function AutoSaveIndicator({ className }: AutoSaveIndicatorProps) {
  const { lastModified } = useWorkspaceStore();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Simulate auto-save process
  useEffect(() => {
    if (!lastModified) {
      return;
    }

    setSaveStatus('pending');

    const saveTimeout = setTimeout(() => {
      setSaveStatus('saving');

      // Simulate save process
      setTimeout(() => {
        setSaveStatus('saved');
        setLastSaveTime(new Date());
      }, 500);
    }, 2000); // Wait 2 seconds before saving

    return () => clearTimeout(saveTimeout);
  }, [lastModified]);

  const _getStatusIcon = () => {
    switch (saveStatus) {
      case 'saved':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'saving':
        return <Upload className="h-3 w-3 animate-pulse text-blue-600" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-amber-600" />;
      case 'error':
        return <Save className="h-3 w-3 text-red-600" />;
      default:
        return <Save className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saved':
        return lastSaveTime
          ? `Saved ${lastSaveTime.toLocaleTimeString()}`
          : 'All changes saved';
      case 'saving':
        return 'Saving changes...';
      case 'pending':
        return 'Changes pending...';
      case 'error':
        return 'Save failed';
      default:
        return 'Unknown status';
    }
  };

  const _getStatusVariant = () => {
    switch (saveStatus) {
      case 'saved':
        return 'default';
      case 'saving':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getMinimalIcon = () => {
    switch (saveStatus) {
      case 'saved':
        return <Save className="h-4 w-4 text-muted-foreground" />;
      case 'saving':
        return <Clock className="h-4 w-4 animate-spin text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'error':
        return <Save className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent',
            saveStatus === 'error' && 'hover:bg-destructive/10',
            className
          )}
        >
          {getMinimalIcon()}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1 text-xs">
          <p className="font-medium">{getStatusText()}</p>
          {lastModified && (
            <p className="text-muted-foreground">
              Last modified: {new Date(lastModified).toLocaleString()}
            </p>
          )}
          <p className="text-muted-foreground">
            Auto-save enabled • 30s interval
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
