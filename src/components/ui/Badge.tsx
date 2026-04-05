import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color, border: `1px solid ${color}40` } : undefined}
    >
      {children}
    </span>
  );
}
