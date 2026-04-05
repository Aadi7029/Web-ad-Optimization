import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'purple' | 'blue' | 'emerald' | 'red' | 'amber' | 'none';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = 'none', hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card',
          hoverable && 'glass-card-hover cursor-pointer',
          glow === 'purple' && 'glow-purple border-purple-500/30',
          glow === 'blue' && 'glow-blue border-blue-500/30',
          glow === 'emerald' && 'glow-emerald border-emerald-500/30',
          glow === 'red' && 'glow-red border-red-500/30',
          glow === 'amber' && 'glow-amber border-amber-500/30',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
