import { Trophy } from 'lucide-react';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { formatNumber, formatPercent } from '@/lib/utils';
import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';

export function AlgorithmLeaderboard() {
  const metrics = useAlgorithmComparison();
  const { status } = useSimulationStore();
  const { environmentConfig } = useConfigStore();
  const isRevenue = environmentConfig.rewardMode === 'revenue';

  const sorted = [...metrics].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  if (status === 'idle') {
    return (
      <div className="glass-card p-6 text-center text-white/30 text-sm">
        Run a simulation to see the leaderboard
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          Algorithm Leaderboard
        </h3>
      </div>
      <div className="divide-y divide-white/5">
        {sorted.map((m, i) => {
          const isWinner = i === 0;
          return (
            <div key={m.agentId} className={`flex items-center gap-4 px-4 py-3 transition-colors ${isWinner ? 'bg-purple-600/5' : ''}`}>
              <div className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold shrink-0"
                style={isWinner ? { background: '#D97706', color: 'white' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                {i + 1}
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-sm font-medium truncate" style={{ color: m.color }}>{m.name}</span>
                {isWinner && <Trophy size={12} className="text-amber-400 shrink-0" />}
              </div>
              <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
                <div>
                  <div className="text-xs text-white/30">Reward</div>
                  <div className="text-sm font-mono text-white">{formatNumber(m.totalReward, 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/30">{isRevenue ? 'Rev/Step' : 'Avg CTR'}</div>
                  <div className="text-sm font-mono text-white">
                    {isRevenue ? `$${m.avgCTR.toFixed(3)}` : formatPercent(m.avgCTR)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/30">Regret</div>
                  <div className="text-sm font-mono text-red-400">{formatNumber(m.totalRegret, 1)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/30">Converge</div>
                  <div className="text-sm font-mono text-white">
                    {m.convergenceStep !== null ? `@${m.convergenceStep}` : '—'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
