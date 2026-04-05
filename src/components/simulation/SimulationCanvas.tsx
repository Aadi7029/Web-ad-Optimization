import { useConfigStore } from '@/store/configStore';
import { useSimulationStore } from '@/store/simulationStore';
import { AgentStateCard } from './AgentStateCard';
import { AdSlotGrid } from './AdSlotGrid';
import { BanditArmsViz } from './BanditArmsViz';
import { cn } from '@/lib/utils';

export function SimulationCanvas() {
  const { selectedAgentIds } = useConfigStore();
  const { status, currentStep, totalSteps } = useSimulationStore();

  const isIdle = status === 'idle';

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Status banner */}
      {isIdle && (
        <div className="glass-card p-6 text-center animate-fade-in">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-white mb-2">Ready to Optimize</h3>
          <p className="text-sm text-white/40 max-w-sm mx-auto">
            Configure your algorithms and environment, then press Run to watch RL agents compete to find the best-performing ad slots.
          </p>
        </div>
      )}

      {/* Agent state cards */}
      {!isIdle && (
        <div className="grid grid-cols-2 gap-3">
          {selectedAgentIds.map(id => (
            <AgentStateCard key={id} agentId={id} />
          ))}
        </div>
      )}

      {/* Ad slot grid */}
      <div className="glass-card p-4">
        <AdSlotGrid />
      </div>

      {/* Bandit arms visualization */}
      {!isIdle && (
        <div className="glass-card p-4">
          <BanditArmsViz />
        </div>
      )}
    </div>
  );
}
