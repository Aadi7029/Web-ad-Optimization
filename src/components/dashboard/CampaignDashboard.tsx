import { Trophy, Target, TrendingDown, Zap, Download } from 'lucide-react';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { MetricCard } from './MetricCard';
import { AlgorithmLeaderboard } from './AlgorithmLeaderboard';
import { CumulativeRewardChart } from '@/components/charts/CumulativeRewardChart';
import { RegretChart } from '@/components/charts/RegretChart';
import { CTROverTimeChart } from '@/components/charts/CTROverTimeChart';
import { ExplorationHeatmap } from '@/components/charts/ExplorationHeatmap';
import { Button } from '@/components/ui/Button';
import { formatPercent } from '@/lib/utils';

export function CampaignDashboard() {
  const metrics = useAlgorithmComparison();
  const { status, currentStep } = useSimulationStore();
  const { environmentConfig } = useConfigStore();
  const isRevenue = environmentConfig.rewardMode === 'revenue';

  const winner = metrics.reduce((best, m) => (!best || m.totalReward > best.totalReward) ? m : best, metrics[0]);
  const bestCTR = Math.max(...metrics.map(m => m.avgCTR), 0);
  // Lowest regret = best performer (UCB should win here)
  const minRegret = metrics.reduce((min, m) => m.totalRegret > 0 && m.totalRegret < min ? m.totalRegret : min, Infinity);
  const minRegretDisplay = minRegret === Infinity ? 0 : minRegret;

  const handleExport = () => {
    const data = metrics.map(m => ({
      algorithm: m.name,
      totalReward: m.totalReward,
      avgCTR: m.avgCTR,
      totalRegret: m.totalRegret,
      convergenceStep: m.convergenceStep,
      rank: m.rank,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adrl-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Campaign Dashboard</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {status === 'idle' ? 'No simulation run yet' : `${currentStep.toLocaleString()} steps completed`}
          </p>
        </div>
        {status !== 'idle' && (
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} />
            Export Results
          </Button>
        )}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Best Total Reward"
          value={winner?.totalReward ?? 0}
          color={winner?.color}
          icon={<Trophy size={16} />}
          subtitle={winner?.name}
        />
        <MetricCard
          label={isRevenue ? 'Best Avg Revenue/Step' : 'Best Avg CTR'}
          value={isRevenue ? bestCTR : bestCTR * 100}
          format={isRevenue ? (v) => `$${v.toFixed(3)}` : (v) => `${v.toFixed(1)}%`}
          color="#059669"
          icon={<Target size={16} />}
        />
        <MetricCard
          label="Min Regret"
          value={minRegretDisplay}
          format={(v) => v.toFixed(1)}
          color="#DC2626"
          icon={<TrendingDown size={16} />}
        />
        <MetricCard
          label="Total Steps"
          value={currentStep}
          color="#7C3AED"
          icon={<Zap size={16} />}
        />
      </div>

      {/* Winner banner */}
      {winner && status !== 'idle' && (
        <div className="glass-card p-4 border" style={{ borderColor: `${winner.color}40`, background: `${winner.color}08` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${winner.color}30` }}>
              <Trophy size={16} style={{ color: winner.color }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                <span style={{ color: winner.color }}>{winner.name}</span> leads with {isRevenue ? `$${winner.avgCTR.toFixed(3)}/step avg revenue` : `${formatPercent(winner.avgCTR)} avg CTR`}
              </div>
              <div className="text-xs text-white/40">Best performing algorithm in this simulation run</div>
            </div>
          </div>
        </div>
      )}

      <AlgorithmLeaderboard />

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CumulativeRewardChart />
        <RegretChart />
        <CTROverTimeChart />
        <ExplorationHeatmap />
      </div>
    </div>
  );
}
