import { create } from 'zustand';
import type { AgentStats, StepResult } from '@/types';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

const HISTORY_LIMIT = 2000;

interface SimulationState {
  status: SimulationStatus;
  currentStep: number;
  totalSteps: number;
  agentStats: Record<string, AgentStats>;
  trueCTRs: number[];

  setStatus: (status: SimulationStatus) => void;
  setTotalSteps: (n: number) => void;
  setTrueCTRs: (ctrs: number[]) => void;
  batchUpdate: (updates: Array<{ agentId: string; stats: AgentStats; latestSteps: StepResult[] }>, step: number) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  status: 'idle',
  currentStep: 0,
  totalSteps: 1000,
  agentStats: {},
  trueCTRs: [],

  setStatus: (status) => set({ status }),
  setTotalSteps: (n) => set({ totalSteps: n }),
  setTrueCTRs: (trueCTRs) => set({ trueCTRs }),

  batchUpdate: (updates, step) =>
    set((state) => {
      const newStats: Record<string, AgentStats> = { ...state.agentStats };
      for (const { agentId, stats } of updates) {
        const prev = state.agentStats[agentId];
        const prevHistory = prev?.stepHistory ?? [];
        // Maintain a capped history
        const combined = [...prevHistory, ...stats.stepHistory];
        const trimmed = combined.length > HISTORY_LIMIT
          ? combined.slice(combined.length - HISTORY_LIMIT)
          : combined;
        newStats[agentId] = { ...stats, stepHistory: trimmed };
      }
      return { agentStats: newStats, currentStep: step };
    }),

  reset: () =>
    set({
      status: 'idle',
      currentStep: 0,
      agentStats: {},
      trueCTRs: [],
    }),
}));
