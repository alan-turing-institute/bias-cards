'use client';

import { AlertCircle, Check, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface DriveSyncButtonProps {
  onSync?: () => Promise<void>;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DriveSyncButton({
  onSync,
  className,
  variant = 'ghost',
  size = 'icon',
}: DriveSyncButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const handleSync = async () => {
    if (!isAuthenticated || syncStatus === 'syncing') {
      return;
    }

    setSyncStatus('syncing');
    try {
      if (onSync) {
        await onSync();
      }
      setSyncStatus('success');
      setLastSyncTime(new Date());

      // Reset to idle after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (_error) {
      setSyncStatus('error');

      // Reset to idle after 5 seconds
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const getIcon = () => {
    if (!isAuthenticated) {
      return <CloudOff className="h-4 w-4" />;
    }

    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const getTimeAgoText = (syncTime: Date) => {
    const timeAgo = Math.floor((Date.now() - syncTime.getTime()) / 60_000);
    if (timeAgo < 1) {
      return 'Just synced';
    }
    if (timeAgo === 1) {
      return '1 minute ago';
    }
    if (timeAgo < 60) {
      return `${timeAgo} minutes ago`;
    }
    const hoursAgo = Math.floor(timeAgo / 60);
    if (hoursAgo === 1) {
      return '1 hour ago';
    }
    return `${hoursAgo} hours ago`;
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Sync complete';
      case 'error':
        return 'Sync failed';
      default:
        return null;
    }
  };

  const getTooltipContent = () => {
    if (!isAuthenticated) {
      return 'Sign in to enable cloud sync';
    }

    const statusText = getSyncStatusText();
    if (statusText) {
      return statusText;
    }

    if (lastSyncTime) {
      return getTimeAgoText(lastSyncTime);
    }

    return 'Sync to Google Drive';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              'transition-colors',
              syncStatus === 'success' && 'text-green-600',
              syncStatus === 'error' && 'text-red-600',
              className
            )}
            disabled={!isAuthenticated || syncStatus === 'syncing'}
            onClick={handleSync}
            size={size}
            variant={variant}
          >
            {getIcon()}
            {size !== 'icon' && <span className="ml-2">Sync</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
