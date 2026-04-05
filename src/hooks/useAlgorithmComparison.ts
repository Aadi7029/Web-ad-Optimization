import { useMemo } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { rollingMean } from '@/lib/utils';

export interface AlgorithmMetrics {
  agentId: string;
  name: string;
  color: string;
  totalReward: number;
  avgCTR: number;
  totalRegret: number;
  convergenceStep: number | null;
  rollingCTR: number[];
  cumulativeRewards: number[];
  cumulativeRegrets: number[];
  armSelectionCounts: number[];
  rank?: number;
}

export function useAlgorithmComparison(): AlgorithmMetrics[] {
  const { agentStats, currentStep } = useSimulationStore();
  const { selectedAgentIds } = useConfigStore();

  return useMemo(() => {
    const metrics: AlgorithmMetrics[] = selectedAgentIds.map((id) => {
      const config = ALGORITHM_CONFIGS.find(c => c.id === id)!;
      const stats = agentStats[id];

      if (!stats || stats.stepHistory.length === 0) {
        return {
          agentId: id,
          name: config?.name ?? id,
          color: config?.color ?? '#888',
          totalReward: 0,
          avgCTR: 0,
          totalRegret: 0,
          convergenceStep: null,
          rollingCTR: [],
          cumulativeRewards: [],
          cumulativeRegrets: [],
          armSelectionCounts: [],
        };
      }

      const history = stats.stepHistory;
      const rewards = history.map(s => s.reward);
      const regrets = history.map(s => s.regret);

      // Cumulative sums (downsampled to max 500 points for perf)
      const downsample = Math.max(1, Math.floor(history.length / 500));
      const cumulativeRewards: number[] = [];
      const cumulativeRegrets: number[] = [];
      let cumR = 0, cumReg = 0;
      for (let i = 0; i < history.length; i++) {
        cumR += rewards[i];
        cumReg += regrets[i];
        if (i % downsample === 0) {
          cumulativeRewards.push(cumR);
          cumulativeRegrets.push(cumReg);
        }
      }

      const rollingCTR = rollingMean(rewards, 50)
        .filter((_, i) => i % downsample === 0);

      // Convergence: first step where rolling CTR > 80% of optimal (simple heuristic)
      const optimalCTR = Math.max(...(stats.armValueEstimates.length > 0 ? stats.armValueEstimates : [0.3]));
      const threshold = optimalCTR * 0.8;
      const roll50 = rollingMean(rewards, 50);
      const convIdx = roll50.findIndex(v => v >= threshold);
      const convergenceStep = convIdx > 0 ? history[convIdx]?.step ?? null : null;

      return {
        agentId: id,
        name: config?.name ?? id,
        color: config?.color ?? '#888',
        totalReward: stats.cumulativeReward,
        // Use currentStep (total steps run), NOT history.length (capped at 2000)
        avgCTR: currentStep > 0 ? stats.cumulativeReward / currentStep : 0,
        totalRegret: stats.cumulativeRegret,
        convergenceStep,
        rollingCTR,
        cumulativeRewards,
        cumulativeRegrets,
        armSelectionCounts: stats.armSelectionCounts,
      };
    });

    // Rank by total reward
    const sorted = [...metrics].sort((a, b) => b.totalReward - a.totalReward);
    sorted.forEach((m, i) => { m.rank = i + 1; });

    return metrics.map(m => ({ ...m, rank: sorted.findIndex(s => s.agentId === m.agentId) + 1 }));
  }, [agentStats, selectedAgentIds, currentStep]);
}
