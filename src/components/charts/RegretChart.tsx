import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { ChartContainer } from './ChartContainer';

export function RegretChart() {
  const metrics = useAlgorithmComparison();

  const data = useMemo(() => {
    const maxLen = Math.max(...metrics.map(m => m.cumulativeRegrets.length), 0);
    if (maxLen === 0) return [];
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { step: i };
      metrics.forEach(m => {
        point[m.agentId] = m.cumulativeRegrets[i] ?? 0;
      });
      return point;
    });
  }, [metrics]);

  if (data.length === 0) {
    return (
      <ChartContainer title="Cumulative Regret" subtitle="Lower is better — missed reward vs optimal policy">
        <div className="h-48 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Cumulative Regret" subtitle="Lower is better — missed reward vs optimal policy">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="step" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
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
