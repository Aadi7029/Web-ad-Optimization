import { useRef, useCallback } from 'react';
import { SimulationEngine } from '@/rl/SimulationEngine';
import { useConfigStore } from '@/store/configStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useRunHistoryStore } from '@/store/runHistoryStore';
import { useAlgorithmComparison } from './useAlgorithmComparison';
import { useAnimationFrame } from './useAnimationFrame';

export function useSimulation() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const configStore = useConfigStore();
  const simStore = useSimulationStore();
  const { addRun } = useRunHistoryStore();
  const metrics = useAlgorithmComparison();

  const isRunning = simStore.status === 'running';

  const createEngine = useCallback(() => {
    const engine = new SimulationEngine(
      configStore.environmentConfig,
      configStore.selectedAgentIds
    );
    engineRef.current = engine;
    simStore.setTotalSteps(configStore.totalSteps);
    simStore.setTrueCTRs(engine.getTrueCTRs());
    return engine;
  }, [configStore, simStore]);

  const start = useCallback(() => {
    if (simStore.status === 'idle' || simStore.status === 'completed') {
      simStore.reset();
      createEngine();
    }
    simStore.setStatus('running');
  }, [simStore, createEngine]);

  const pause = useCallback(() => {
    simStore.setStatus('paused');
  }, [simStore]);

  const resume = useCallback(() => {
    simStore.setStatus('running');
  }, [simStore]);

  const reset = useCallback(() => {
    engineRef.current = null;
    simStore.reset();
  }, [simStore]);

  const step = useCallback((deltaMs: number) => {
    const engine = engineRef.current;
    if (!engine || engine.isComplete()) {
      simStore.setStatus('completed');
      return;
    }

    const stepsPerFrame = Math.max(1, Math.round(configStore.speed * (deltaMs / 16.67)));
    const results = engine.tick(stepsPerFrame);

    simStore.batchUpdate(results, engine.getCurrentStep());
    simStore.setTrueCTRs(engine.getTrueCTRs());

    if (engine.isComplete()) {
      simStore.setStatus('completed');

      // Auto-save this run to history
      const winner = metrics.reduce((best, m) =>
        (!best || m.totalReward > best.totalReward) ? m : best, metrics[0]);
      if (winner && metrics.some(m => m.totalReward > 0)) {
        addRun({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          steps: engine.getCurrentStep(),
          rewardMode: configStore.environmentConfig.rewardMode,
          numArms: configStore.environmentConfig.arms.length,
          results: metrics.map(m => ({
            agentId: m.agentId,
            name: m.name,
            color: m.color,
            rank: m.rank ?? 99,
            totalReward: m.totalReward,
            avgMetric: m.avgCTR,
            totalRegret: m.totalRegret,
            convergenceStep: m.convergenceStep,
          })),
          winner: { agentId: winner.agentId, name: winner.name, color: winner.color },
        });
      }
    }
  }, [configStore.speed, configStore.environmentConfig, simStore, metrics, addRun]);

  useAnimationFrame(step, isRunning);

  return { start, pause, resume, reset };
}
