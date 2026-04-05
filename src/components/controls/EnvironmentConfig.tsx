import { useConfigStore } from '@/store/configStore';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';

export function EnvironmentConfig() {
  const { environmentConfig, setNumArms, setNonStationary, setRewardMode } = useConfigStore();
  const numArms = environmentConfig.arms.length;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Environment</h3>

      <Slider
        label="Ad Slots (Arms)"
        value={numArms}
        min={2}
        max={16}
        step={1}
        onChange={setNumArms}
      />

      <Switch
        label="Non-stationary (CTR drift)"
        checked={environmentConfig.nonStationary}
        onChange={setNonStationary}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/60">Reward Mode</span>
        <div className="flex gap-2">
          {(['ctr', 'revenue'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setRewardMode(mode)}
              className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                environmentConfig.rewardMode === mode
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
              }`}
            >
              {mode === 'ctr' ? 'CTR (clicks)' : 'Revenue ($)'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
