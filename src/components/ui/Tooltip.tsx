import { cn } from '@/lib/utils';
import { useState, useRef, type ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-max max-w-xs pointer-events-none animate-fade-in">
          <div className="glass-card text-xs text-white/80 px-3 py-2 rounded-lg leading-relaxed">
            {content}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
        </div>
      )}
    </div>
  );
}
