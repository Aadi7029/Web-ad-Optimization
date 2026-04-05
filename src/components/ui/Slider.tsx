import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  formatValue?: (v: number) => string;
  className?: string;
}

export function Slider({ value, min, max, step = 1, onChange, label, showValue = true, formatValue, className }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : String(value);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-white/60">{label}</span>}
          {showValue && <span className="text-white font-mono font-medium">{display}</span>}
        </div>
      )}
      <div className="relative h-2 rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-purple-500 transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
