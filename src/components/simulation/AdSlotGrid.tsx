import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { argmax, formatNumber, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function AdSlotGrid() {
  const { agentStats, trueCTRs } = useSimulationStore();
  const { environmentConfig, selectedAgentIds } = useConfigStore();
  const arms = environmentConfig.arms;
  const isRevenue = environmentConfig.rewardMode === 'revenue';

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

  // ★ marks the BASELINE optimal arm — what an ideal algorithm should converge
  // to over the long run. Uses arm.trueCTR (original config), NOT the drifted
  // live value, so the marker stays stable across the run.
  const bestIdx = useMemo(() => {
    if (isRevenue) {
      const evs = arms.map((a) => a.trueCTR * a.revenuePerClick);
      return argmax(evs);
    }
    return argmax(arms.map((a) => a.trueCTR));
  }, [arms, isRevenue]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40 uppercase tracking-wider">Ad Inventory</div>
        <div className="text-[10px] text-white/35">
          {arms.length} slots · {isRevenue ? 'Revenue mode' : 'CTR mode'}
          {' · '}
          <span className="text-emerald-300/80">★ baseline-optimal {isRevenue ? 'EV' : 'CTR'}</span>
        </div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(118px, 1fr))` }}>
        {arms.map((arm, i) => {
          const activeAgents = selectedAgentIds.filter(id => lastSelectedByAgent[id] === i);
          const isActive = activeAgents.length > 0;
          const trueCTR = trueCTRs[i] ?? arm.trueCTR;
          const rev = arm.revenuePerClick;
          const ev = trueCTR * rev;
          const isBest = i === bestIdx;
          const letter = String.fromCharCode(65 + i);

          return (
            <div
              key={arm.id}
              className={cn(
                'relative p-2.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5',
                isActive ? 'border-white/20 bg-white/5' : isBest ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/2'
              )}
              style={isActive && activeAgents.length > 0 ? {
                boxShadow: `0 0 12px ${ALGORITHM_CONFIGS.find(c => c.id === activeAgents[0])?.color ?? 'white'}40`,
              } : {}}
            >
              {/* Slot header: letter + best marker */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Ad {letter}</div>
                {isBest && (
                  <span className="text-[9px] text-emerald-300/90 font-semibold">★ TOP</span>
                )}
              </div>

              {/* Revenue per click — primary new metric */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">$/click</span>
                  <span className="text-sm font-mono font-semibold text-amber-300">
                    ${formatNumber(rev, 2)}
                  </span>
                </div>
                {/* Revenue bar (scaled to max $3.00 by default) */}
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400/80 transition-all duration-500"
                    style={{ width: `${Math.min(100, (rev / 3) * 100)}%` }}
                  />
                </div>
              </div>

              {/* CTR */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">CTR</span>
                  <span className="text-[11px] font-mono text-emerald-300">
                    {formatPercent(trueCTR, 1)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, trueCTR * 100 * 2)}%` }}
                  />
                </div>
              </div>

              {/* Expected value per impression (the true objective in revenue mode) */}
              {isRevenue && (
                <div className="flex items-baseline justify-between gap-1 pt-0.5 border-t border-white/5">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">EV/imp</span>
                  <span className={cn(
                    'text-[11px] font-mono font-semibold',
                    isBest ? 'text-emerald-300' : 'text-white/70'
                  )}>
                    ${formatNumber(ev, 3)}
                  </span>
                </div>
              )}

              {/* Agent selection dots */}
              <div className="flex justify-center gap-1 h-2.5 mt-0.5">
                {activeAgents.map(id => {
                  const cfg = ALGORITHM_CONFIGS.find(c => c.id === id);
                  return cfg ? (
                    <div
                      key={id}
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: cfg.color }}
                      title={`${cfg.name} picked this slot`}
                    />
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-white/35 leading-snug">
        <span className="text-amber-300">$/click</span> = revenue this ad earns per click ·
        <span className="text-emerald-300"> CTR</span> = current click-through rate
        {isRevenue && (
          <>
            {' · '}
            <span className="text-white/55">EV/imp</span> = CTR × $/click (the algorithm's true objective)
          </>
        )}
        {environmentConfig.nonStationary && (
          <>
            <br />
            <span className="text-white/45">★ marks the baseline winner (stable). CTR / EV values shown are live and drift each step.</span>
          </>
        )}
      </div>
    </div>
  );
}
