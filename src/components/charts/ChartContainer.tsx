import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartContainer({ title, subtitle, children, className, action }: ChartContainerProps) {
  return (
    <div className={cn('glass-card p-5 flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
