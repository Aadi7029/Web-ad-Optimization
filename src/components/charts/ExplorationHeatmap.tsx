import { useMemo } from 'react';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { ChartContainer } from './ChartContainer';
import { useConfigStore } from '@/store/configStore';

export function ExplorationHeatmap() {
  const metrics = useAlgorithmComparison();
  const { environmentConfig } = useConfigStore();
  const numArms = environmentConfig.arms.length;

  const data = useMemo(() => metrics.filter(m => m.armSelectionCounts.length > 0), [metrics]);

  if (data.length === 0) {
    return (
      <ChartContainer title="Exploration Heatmap" subtitle="Which ad slots each agent selected">
        <div className="h-32 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Exploration Heatmap" subtitle="Selection frequency per ad slot (darker = more selected)">
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-2 min-w-0">
          {/* X axis labels */}
          <div className="flex items-center gap-1 pl-20">
            {Array.from({ length: numArms }, (_, i) => (
              <div key={i} className="flex-1 text-center text-xs text-white/30 min-w-6">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          {data.map(m => {
            const counts = m.armSelectionCounts;
            const maxCount = Math.max(...counts, 1);
            return (
              <div key={m.agentId} className="flex items-center gap-1">
                <div className="w-20 shrink-0 text-xs font-medium truncate" style={{ color: m.color }}>
                  {m.name}
                </div>
                {counts.map((count, i) => {
                  const intensity = count / maxCount;
                  return (
                    <div
                      key={i}
                      className="flex-1 h-7 rounded min-w-6 transition-all duration-300"
                      style={{ backgroundColor: `${m.color}${Math.round(intensity * 220 + 20).toString(16).padStart(2, '0')}` }}
                      title={`Slot ${String.fromCharCode(65 + i)}: ${count} selections`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </ChartContainer>
  );
}
