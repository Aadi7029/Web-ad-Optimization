import { useMemo } from 'react';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { ChartContainer } from './ChartContainer';
import { useConfigStore } from '@/store/configStore';
import { useSimulationStore } from '@/store/simulationStore';
import { argmax, formatNumber, formatPercent } from '@/lib/utils';

export function ExplorationHeatmap() {
  const metrics = useAlgorithmComparison();
  const { environmentConfig } = useConfigStore();
  const { trueCTRs } = useSimulationStore();
  const { arms, rewardMode } = environmentConfig;
  const numArms = arms.length;

  const data = useMemo(() => metrics.filter(m => m.armSelectionCounts.length > 0), [metrics]);

  const truthIdx = useMemo(() => {
    if (rewardMode === 'revenue') {
      const evs = arms.map((a, i) => (trueCTRs[i] ?? a.trueCTR) * a.revenuePerClick);
      return argmax(evs);
    }
    return argmax(arms.map((a, i) => trueCTRs[i] ?? a.trueCTR));
  }, [arms, trueCTRs, rewardMode]);

  const subtitle = 'Share of impressions sent to each ad slot — darker = picked more often';

  if (data.length === 0) {
    return (
      <ChartContainer title="Exploration Heatmap" subtitle={subtitle}>
        <div className="h-32 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Exploration Heatmap" subtitle={subtitle}>
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* X axis: slot letter row */}
          <div className="flex items-center gap-1 pl-24">
            {arms.map((_, i) => (
              <div
                key={i}
                className={`flex-1 text-center text-[11px] font-semibold min-w-8 ${
                  i === truthIdx ? 'text-emerald-300' : 'text-white/45'
                }`}
              >
                {String.fromCharCode(65 + i)}
                {i === truthIdx && <span className="ml-0.5 text-[9px]">★</span>}
              </div>
            ))}
          </div>
          {/* X axis: true value row */}
          <div className="flex items-center gap-1 pl-24">
            {arms.map((a, i) => {
              const ctr = trueCTRs[i] ?? a.trueCTR;
              const text = rewardMode === 'revenue'
                ? `$${formatNumber(ctr * a.revenuePerClick, 2)}`
                : formatPercent(ctr, 0);
              return (
                <div
                  key={i}
                  className="flex-1 text-center text-[9px] text-white/35 min-w-8 font-mono"
                  title={rewardMode === 'revenue'
                    ? `EV per impression: $${formatNumber(ctr * a.revenuePerClick, 3)}`
                    : `True CTR: ${formatPercent(ctr, 2)}`}
                >
                  {text}
                </div>
              );
            })}
          </div>
          {/* Heatmap rows */}
          {data.map(m => {
            const counts = m.armSelectionCounts;
            const total = counts.reduce((s, c) => s + c, 0) || 1;
            const maxCount = Math.max(...counts, 1);
            return (
              <div key={m.agentId} className="flex items-center gap-1">
                <div className="w-24 shrink-0 text-[11px] font-medium truncate pr-1" style={{ color: m.color }}>
                  {m.name}
                </div>
                {counts.map((count, i) => {
                  const intensity = count / maxCount;
                  const share = count / total;
                  return (
                    <div
                      key={i}
                      className="flex-1 h-7 rounded min-w-8 transition-all duration-300 flex items-center justify-center text-[9px] font-mono"
                      style={{
                        backgroundColor: `${m.color}${Math.round(intensity * 220 + 20).toString(16).padStart(2, '0')}`,
                        color: intensity > 0.45 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
                      }}
                      title={`${m.name} → Slot ${String.fromCharCode(65 + i)}: ${count} picks (${formatPercent(share, 1)})`}
                    >
                      {share >= 0.05 ? formatPercent(share, 0) : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* Footer legend */}
          <div className="pl-24 mt-2 flex items-center gap-3 text-[10px] text-white/40">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-white/10" />
              <span>0% picks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-white/40" />
              <span>↑ more picks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-300">★</span>
              <span>{rewardMode === 'revenue' ? 'Top EV/impression' : 'Top CTR'}</span>
            </div>
          </div>
          <div className="pl-24 mt-0.5 text-[10px] text-white/30">
            Numbers inside cells = share of that algorithm's total impressions
          </div>
        </div>
      </div>
    </ChartContainer>
  );
}
