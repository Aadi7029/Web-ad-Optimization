import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  format?: (v: number) => string;
  color?: string;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
}

export function MetricCard({ label, value, format, color, icon, subtitle, className }: MetricCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const targetRef = useRef(value);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const target = value;
    targetRef.current = target;
    const start = displayed;
    const startTime = performance.now();
    const duration = 800;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(start + (target - start) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const display = format ? format(displayed) : Math.round(displayed).toLocaleString();

  return (
    <div className={cn('glass-card p-4', className)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
        {icon && <div style={{ color }}>{icon}</div>}
      </div>
      <div className="text-2xl font-bold font-mono" style={color ? { color } : {}}>
        {display}
      </div>
      {subtitle && <div className="text-xs text-white/40 mt-1">{subtitle}</div>}
    </div>
  );
}
