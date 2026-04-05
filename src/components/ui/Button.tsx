import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed',
          {
            'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/25': variant === 'primary',
            'glass-card hover:bg-white/10 text-white': variant === 'secondary',
            'hover:bg-white/5 text-white/70 hover:text-white': variant === 'ghost',
            'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30': variant === 'danger',
          },
          {
            'text-xs px-3 py-1.5 gap-1.5': size === 'sm',
            'text-sm px-4 py-2 gap-2': size === 'md',
            'text-base px-6 py-3 gap-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
