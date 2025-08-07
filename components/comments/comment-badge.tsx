'use client';

import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCommentsStore } from '@/lib/stores';
import type { CommentCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CommentBadgeProps {
  cardId: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showCategories?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CommentBadge({
  cardId,
  variant = 'default',
  showCategories = false,
  className,
  onClick,
}: CommentBadgeProps) {
  const { getCommentCount, getCommentSummary } = useCommentsStore();

  const totalComments = getCommentCount(cardId);
  const summary = getCommentSummary(cardId);

  if (totalComments === 0) {
    return null;
  }

  const getCategoryColor = (category: CommentCategory) => {
    switch (category) {
      case 'rationale':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'implementation':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatCategoryName = (category: CommentCategory) => {
    switch (category) {
      case 'rationale':
        return 'R';
      case 'implementation':
        return 'I';
      case 'general':
        return 'G';
      default:
        return (category as string).charAt(0).toUpperCase();
    }
  };

  if (variant === 'icon-only') {
    return (
      <Button
        className={cn('h-6 w-6 p-0', className)}
        onClick={onClick}
        size="sm"
        title={`${totalComments} comment${totalComments !== 1 ? 's' : ''}`}
        variant="ghost"
      >
        <div className="relative">
          <MessageSquare className="h-3 w-3" />
          <Badge
            className="-right-2 -top-2 absolute flex h-4 w-4 items-center justify-center p-0 text-xs"
            variant="secondary"
          >
            {totalComments}
          </Badge>
        </div>
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge
        className={cn('cursor-pointer text-xs', className)}
        onClick={onClick}
        variant="secondary"
      >
        <MessageSquare className="mr-1 h-3 w-3" />
        {totalComments}
      </Badge>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <Badge className="cursor-pointer" onClick={onClick} variant="secondary">
        <MessageSquare className="mr-1 h-3 w-3" />
        {totalComments} comment{totalComments !== 1 ? 's' : ''}
      </Badge>

      {showCategories && (
        <div className="flex gap-1">
          {Object.entries(summary.commentsByCategory)
            .filter(([, count]) => count > 0)
            .map(([category, count]) => (
              <Badge
                className={cn(
                  'cursor-pointer text-xs',
                  getCategoryColor(category as CommentCategory)
                )}
                key={category}
                onClick={onClick}
                title={`${count} ${category} comment${count !== 1 ? 's' : ''}`}
              >
                {formatCategoryName(category as CommentCategory)}
                {count}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}

interface CommentIndicatorProps {
  cardId: string;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function CommentIndicator({
  cardId,
  position = 'top-right',
  size = 'sm',
  onClick,
}: CommentIndicatorProps) {
  const { getCommentCount } = useCommentsStore();
  const totalComments = getCommentCount(cardId);

  if (totalComments === 0) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'absolute -right-1 -top-1';
      case 'bottom-right':
        return 'absolute -bottom-1 -right-1';
      case 'bottom-left':
        return 'absolute -bottom-1 -left-1';
      case 'top-left':
        return 'absolute -left-1 -top-1';
      default:
        return 'absolute -right-1 -top-1';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4 text-xs';
      case 'md':
        return 'h-5 w-5 text-sm';
      case 'lg':
        return 'h-6 w-6 text-sm';
      default:
        return 'h-4 w-4 text-xs';
    }
  };

  return (
    <Badge
      className={cn(
        'flex cursor-pointer items-center justify-center rounded-full p-0',
        getPositionClasses(),
        getSizeClasses()
      )}
      onClick={onClick}
      title={`${totalComments} comment${totalComments !== 1 ? 's' : ''}`}
      variant="destructive"
    >
      {totalComments > 99 ? '99+' : totalComments}
    </Badge>
  );
}
