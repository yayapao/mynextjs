import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// Cult UI Minimal Card, adapted from Niu. See cult-ui.LICENSE.
export function MinimalCard({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="minimal-card"
      className={cn(
        'rounded-lg bg-muted/35 p-3 text-card-foreground ring-1 ring-border/40 transition-colors hover:bg-muted/50 motion-reduce:transition-none',
        className
      )}
      {...props}
    />
  );
}

export function MinimalCardTitle({
  className,
  ...props
}: ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('break-words text-sm leading-5 font-semibold', className)}
      {...props}
    />
  );
}

export function MinimalCardDescription({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'break-words text-xs leading-5 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
