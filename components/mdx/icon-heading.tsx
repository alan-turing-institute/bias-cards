import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconHeadingProps {
  icon: LucideIcon;
  children: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export function IconHeading({
  icon: Icon,
  children,
  level = 2,
  className,
}: IconHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const sizeClasses = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-semibold',
  };

  const iconSizes = {
    1: 'h-7 w-7',
    2: 'h-6 w-6',
    3: 'h-5 w-5',
  };

  return (
    <Tag
      className={cn(
        'flex items-center gap-2',
        sizeClasses[level],
        level === 1 ? 'mb-4' : level === 2 ? 'mt-8 mb-4' : 'mb-2',
        className
      )}
    >
      <Icon className={cn(iconSizes[level], 'text-primary')} />
      {children}
    </Tag>
  );
}
