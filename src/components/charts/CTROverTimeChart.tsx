import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { useSimulationStore } from '@/store/simulationStore';
import { ChartContainer } from './ChartContainer';

export function CTROverTimeChart() {
  const metrics = useAlgorithmComparison();
  const { currentStep } = useSimulationStore();

  const data = useMemo(() => {
    const maxLen = Math.max(...metrics.map(m => m.rollingCTR.length), 0);
    if (maxLen === 0) return [];
    const downsample = Math.max(1, Math.floor(currentStep / Math.max(maxLen, 1)));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { step: i * downsample };
      metrics.forEach(m => {
        point[m.agentId] = m.rollingCTR[i] ?? 0;
      });
      return point;
    });
  }, [metrics, currentStep]);

  const subtitle = '50-step rolling click-through rate — higher is better';

  if (data.length === 0) {
    return (
      <ChartContainer title="Rolling CTR" subtitle={subtitle}>
        <div className="h-48 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Rolling CTR" subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 14, bottom: 28, left: 18 }}>
          <defs>
            {metrics.map(m => (
              <linearGradient key={m.agentId} id={`grad-${m.agentId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={m.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          >
            <Label value="Click-through rate" angle={-90} position="insideLeft" offset={4} style={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)', textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip
            position={{ x: 50, y: 0 }}
            cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeDasharray: '3 3' }}
            wrapperStyle={{ pointerEvents: 'none', zIndex: 10 }}
            contentStyle={{ background: 'rgba(13,17,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px' }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: 2, fontSize: 11 }}
            itemStyle={{ fontSize: 11, padding: 0, lineHeight: 1.4 }}
            labelFormatter={(v) => `Step ${v}`}
            formatter={(v, name) => [`${(Number(v ?? 0) * 100).toFixed(2)}%`, String(name)]}
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
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
        {metrics.map(m => (
          <div key={m.agentId} className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
            <span>{m.name}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
}
