import { useSimulationStore } from '@/store/simulationStore';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { formatNumber, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AgentStateCardProps {
  agentId: string;
}

export function AgentStateCard({ agentId }: AgentStateCardProps) {
  const { agentStats, status } = useSimulationStore();
  const config = ALGORITHM_CONFIGS.find(c => c.id === agentId);
  const stats = agentStats[agentId];

  if (!config) return null;

  const steps = stats?.stepHistory?.length ?? 0;
  const avgCTR = steps > 0 ? (stats.cumulativeReward / steps) : 0;
  const isRunning = status === 'running';

  return (
    <div
      className="glass-card p-3 flex flex-col gap-2"
      style={{ borderColor: `${config.color}30`, background: `${config.color}08` }}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn('w-2 h-2 rounded-full', isRunning && 'animate-pulse')}
          style={{ backgroundColor: config.color }}
        />
        <span className="text-sm font-semibold" style={{ color: config.color }}>{config.shortName}</span>
        {stats?.currentEpsilon !== undefined && (
          <span className="text-xs text-white/30 font-mono ml-auto">ε={formatNumber(stats.currentEpsilon, 3)}</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs text-white/30">Reward</div>
          <div className="text-sm font-mono text-white">{formatNumber(stats?.cumulativeReward ?? 0, 0)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/30">CTR</div>
          <div className="text-sm font-mono text-white">{formatPercent(avgCTR)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/30">Regret</div>
          <div className="text-sm font-mono text-red-400">{formatNumber(stats?.cumulativeRegret ?? 0, 1)}</div>
        </div>
      </div>
    </div>
  );
}
