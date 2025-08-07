import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LinkCardProps {
  href: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  external?: boolean;
  className?: string;
}

export function LinkCard({
  href,
  title,
  description,
  icon: Icon,
  external = false,
  className,
}: LinkCardProps) {
  const Component = external ? 'a' : Link;
  const linkProps = external
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };

  return (
    <Component
      {...linkProps}
      className={cn(
        'group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/50',
        className
      )}
    >
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{title}</h3>
          {external && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        {description && (
          <p className="mt-1 text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {!external && (
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      )}
    </Component>
  );
}
