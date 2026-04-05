import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { ChartContainer } from './ChartContainer';

export function CumulativeRewardChart() {
  const metrics = useAlgorithmComparison();

  const data = useMemo(() => {
    const maxLen = Math.max(...metrics.map(m => m.cumulativeRewards.length), 0);
    if (maxLen === 0) return [];
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { step: i };
      metrics.forEach(m => {
        point[m.agentId] = m.cumulativeRewards[i] ?? 0;
      });
      return point;
    });
  }, [metrics]);

  if (data.length === 0) {
    return (
      <ChartContainer title="Cumulative Reward" subtitle="Total reward accumulated over time">
        <div className="h-48 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Cumulative Reward" subtitle="Total reward accumulated over time">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="step" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v * Math.max(1, Math.floor(1))}` } />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
            itemStyle={{ fontSize: 12 }}
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
    </ChartContainer>
  );
}
