import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function AdSlotGrid() {
  const { agentStats, trueCTRs, status } = useSimulationStore();
  const { environmentConfig, selectedAgentIds } = useConfigStore();
  const arms = environmentConfig.arms;

  const lastSelectedByAgent = useMemo(() => {
    const result: Record<string, number> = {};
    for (const id of selectedAgentIds) {
      const stats = agentStats[id];
      if (stats?.stepHistory?.length > 0) {
        result[id] = stats.stepHistory[stats.stepHistory.length - 1]?.armIndex ?? -1;
      }
    }
    return result;
  }, [agentStats, selectedAgentIds]);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-white/40 uppercase tracking-wider">Ad Inventory</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))` }}>
        {arms.map((arm, i) => {
          const activeAgents = selectedAgentIds.filter(id => lastSelectedByAgent[id] === i);
          const isActive = activeAgents.length > 0;
          const trueCTR = trueCTRs[i] ?? arm.trueCTR;

          return (
            <div
              key={arm.id}
              className={cn(
                'relative p-2 rounded-xl border transition-all duration-200 flex flex-col gap-1',
                isActive ? 'border-white/20 bg-white/5' : 'border-white/5 bg-white/2'
              )}
              style={isActive && activeAgents.length > 0 ? {
                boxShadow: `0 0 12px ${ALGORITHM_CONFIGS.find(c => c.id === activeAgents[0])?.color ?? 'white'}40`,
              } : {}}
            >
              <div className="text-xs font-medium text-white/60 text-center">{arm.label.replace('Ad Slot ', '')}</div>

              {/* Agent selection dots */}
              <div className="flex justify-center gap-0.5 h-2">
                {activeAgents.map(id => {
                  const cfg = ALGORITHM_CONFIGS.find(c => c.id === id);
                  return cfg ? (
                    <div
                      key={id}
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: cfg.color }}
                    />
                  ) : null;
                })}
              </div>

              {/* CTR bar */}
              <div className="h-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${trueCTR * 100}%` }}
                />
              </div>
              {status === 'completed' && (
                <div className="text-xs text-center text-emerald-400 font-mono">{formatPercent(trueCTR)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
