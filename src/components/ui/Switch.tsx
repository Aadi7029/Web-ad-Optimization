import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
      <div
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200',
          checked ? 'bg-purple-600' : 'bg-white/10'
        )}
        onClick={() => onChange(!checked)}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </div>
      {label && <span className="text-sm text-white/70">{label}</span>}
    </label>
  );
}
