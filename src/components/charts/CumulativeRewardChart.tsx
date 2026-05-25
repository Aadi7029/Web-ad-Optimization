import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { useConfigStore } from '@/store/configStore';
import { useSimulationStore } from '@/store/simulationStore';
import { ChartContainer } from './ChartContainer';
import { formatNumber } from '@/lib/utils';

export function CumulativeRewardChart() {
  const metrics = useAlgorithmComparison();
  const { environmentConfig } = useConfigStore();
  const { currentStep } = useSimulationStore();
  const isRevenue = environmentConfig.rewardMode === 'revenue';
  const unitSuffix = isRevenue ? ' $' : ' clicks';
  const yLabel = isRevenue ? 'Cumulative revenue ($)' : 'Cumulative clicks';

  const data = useMemo(() => {
    const maxLen = Math.max(...metrics.map(m => m.cumulativeRewards.length), 0);
    if (maxLen === 0) return [];
    const downsample = Math.max(1, Math.floor(currentStep / Math.max(maxLen, 1)));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { step: i * downsample };
      metrics.forEach(m => {
        point[m.agentId] = m.cumulativeRewards[i] ?? 0;
      });
      return point;
    });
  }, [metrics, currentStep]);

  const subtitle = isRevenue
    ? 'Total $ earned over impressions — higher is better'
    : 'Total clicks earned over impressions — higher is better';

  if (data.length === 0) {
    return (
      <ChartContainer title="Cumulative Reward" subtitle={subtitle}>
        <div className="h-48 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Cumulative Reward" subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 14, bottom: 28, left: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="step"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
            stroke="rgba(255,255,255,0.2)"
          >
            <Label value="Impression (step t)" position="insideBottom" offset={-14} style={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)' }} />
          </XAxis>
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
            stroke="rgba(255,255,255,0.2)"
            tickFormatter={(v) => isRevenue ? `$${formatNumber(v, 0)}` : `${v}`}
          >
            <Label value={yLabel} angle={-90} position="insideLeft" offset={4} style={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)', textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip
            contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
            itemStyle={{ fontSize: 12 }}
            labelFormatter={(v) => `Step ${v}`}
            formatter={(v: number, name: string) => [
              `${isRevenue ? '$' : ''}${formatNumber(Number(v), 2)}${unitSuffix}`,
              name,
            ]}
          />
          {metrics.map(m => (
            <Line
              key={m.agentId}
              type="monotone"
              dataKey={m.agentId}
              stroke={m.color}
              name={m.name}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ChartLegend metrics={metrics} />
    </ChartContainer>
  );
}

function ChartLegend({ metrics }: { metrics: ReturnType<typeof useAlgorithmComparison> }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
      {metrics.map(m => (
        <div key={m.agentId} className="flex items-center gap-1.5 text-[11px] text-white/60">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
          <span>{m.name}</span>
        </div>
      ))}
    </div>
  );
}
