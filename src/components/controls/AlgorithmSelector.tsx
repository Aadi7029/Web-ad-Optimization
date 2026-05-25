import { Info } from 'lucide-react';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { useConfigStore } from '@/store/configStore';
import { useUIStore } from '@/store/uiStore';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

const MAX_SELECTED = 4;

export function AlgorithmSelector() {
  const { selectedAgentIds, toggleAgent } = useConfigStore();
  const { setDrawerOpen } = useUIStore();
  const atLimit = selectedAgentIds.length >= MAX_SELECTED;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Algorithms</h3>
        <span className={cn('text-xs', atLimit ? 'text-amber-300/80' : 'text-white/30')}>
          {selectedAgentIds.length}/{MAX_SELECTED} selected
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {ALGORITHM_CONFIGS.map((algo) => {
          const isSelected = selectedAgentIds.includes(algo.id);
          const isDisabled = !isSelected && atLimit;

          const card = (
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border w-full',
                isDisabled
                  ? 'cursor-not-allowed border-white/5 bg-white/2 opacity-50'
                  : 'cursor-pointer',
                !isDisabled && isSelected
                  ? 'border-opacity-40 bg-opacity-10'
                  : !isDisabled && 'border-white/5 bg-white/2 hover:bg-white/5'
              )}
              style={isSelected ? {
                borderColor: `${algo.color}50`,
                background: `${algo.color}10`,
              } : {}}
              onClick={() => { if (!isDisabled) toggleAgent(algo.id); }}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0 transition-all"
                style={{ backgroundColor: isSelected ? algo.color : 'rgba(255,255,255,0.15)' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-white/50')}>
                    {algo.shortName}
                  </span>
                  {isSelected && (
                    <Badge color={algo.color}>Active</Badge>
                  )}
                </div>
                <p className="text-xs text-white/30 mt-0.5 truncate">{algo.description.slice(0, 50)}...</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDrawerOpen(algo.id); }}
                className="shrink-0 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
              >
                <Info size={13} />
              </button>
            </div>
          );

          if (isDisabled) {
            return (
              <Tooltip
                key={algo.id}
                className="w-full"
                content={
                  <div className="text-center">
                    <div className="font-semibold text-white">Only {MAX_SELECTED} algorithms can be compared at once</div>
                    <div className="text-white/60 mt-0.5">Deselect one to add {algo.shortName}</div>
                  </div>
                }
              >
                {card}
              </Tooltip>
            );
          }

          return <div key={algo.id} className="w-full">{card}</div>;
        })}
      </div>
    </div>
  );
}
