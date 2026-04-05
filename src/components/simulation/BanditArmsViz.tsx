import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { formatPercent } from '@/lib/utils';

export function BanditArmsViz() {
  const { agentStats, trueCTRs } = useSimulationStore();
  const { environmentConfig, selectedAgentIds } = useConfigStore();
  const arms = environmentConfig.arms;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-white/40 uppercase tracking-wider">Value Estimates per Arm</div>
      <div className="flex flex-col gap-2">
        {arms.map((arm, i) => {
          const trueCTR = trueCTRs[i] ?? arm.trueCTR;
          return (
            <div key={arm.id} className="flex items-center gap-3">
              <div className="w-8 text-xs text-white/40 text-right shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <div className="flex-1 relative h-4 flex items-center">
                {/* True CTR marker */}
                <div
                  className="absolute w-0.5 h-4 bg-white/20 rounded-full z-10"
                  style={{ left: `${trueCTR * 100}%` }}
                  title={`True CTR: ${formatPercent(trueCTR)}`}
                />
                {/* Agent estimates */}
                {selectedAgentIds.map((id) => {
                  const config = ALGORITHM_CONFIGS.find(c => c.id === id);
                  const stats = agentStats[id];
                  const estimate = stats?.armValueEstimates?.[i] ?? 0;
                  if (!config) return null;
                  return (
                    <div
                      key={id}
                      className="absolute w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        left: `${Math.min(estimate * 100, 98)}%`,
                        backgroundColor: config.color,
                        transform: 'translateX(-50%)',
                      }}
                      title={`${config.shortName}: ${formatPercent(estimate)}`}
                    />
                  );
                })}
                {/* Background bar */}
                <div className="absolute inset-0 rounded-full bg-white/5" />
              </div>
              <div className="text-xs text-white/20 font-mono w-10 shrink-0">
                {formatPercent(trueCTR)}
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-1">
        {selectedAgentIds.map(id => {
          const config = ALGORITHM_CONFIGS.find(c => c.id === id);
          if (!config) return null;
          return (
            <div key={id} className="flex items-center gap-1.5 text-xs text-white/40">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
              {config.shortName}
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <div className="w-0.5 h-3 bg-white/30" />
          True CTR
        </div>
      </div>
    </div>
  );
}
