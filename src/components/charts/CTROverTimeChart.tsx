import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { ChartContainer } from './ChartContainer';

export function CTROverTimeChart() {
  const metrics = useAlgorithmComparison();

  const data = useMemo(() => {
    const maxLen = Math.max(...metrics.map(m => m.rollingCTR.length), 0);
    if (maxLen === 0) return [];
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { step: i };
      metrics.forEach(m => {
        point[m.agentId] = m.rollingCTR[i] ?? 0;
      });
      return point;
    });
  }, [metrics]);

  if (data.length === 0) {
    return (
      <ChartContainer title="Rolling CTR" subtitle="50-step rolling click-through rate">
        <div className="h-48 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Rolling CTR" subtitle="50-step rolling click-through rate">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            {metrics.map(m => (
              <linearGradient key={m.agentId} id={`grad-${m.agentId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={m.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="step" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <Tooltip
            contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            itemStyle={{ fontSize: 12 }}
            formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`]}
          />
          {metrics.map(m => (
            <Area
              key={m.agentId}
              type="monotone"
              dataKey={m.agentId}
              stroke={m.color}
              fill={`url(#grad-${m.agentId})`}
              name={m.name}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
