import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RunResult {
  agentId: string;
  name: string;
  color: string;
  rank: number;
  totalReward: number;
  avgMetric: number;   // CTR (0–1) or revenue/step depending on mode
  totalRegret: number;
  convergenceStep: number | null;
}

export interface RunRecord {
  id: string;
  timestamp: number;
  steps: number;
  rewardMode: 'ctr' | 'revenue';
  numArms: number;
  results: RunResult[];
  winner: { agentId: string; name: string; color: string };
}

interface RunHistoryState {
  runs: RunRecord[];
  addRun: (run: RunRecord) => void;
  deleteRun: (id: string) => void;
  clearAll: () => void;
}

export const useRunHistoryStore = create<RunHistoryState>()(
  persist(
    (set) => ({
      runs: [],
      addRun: (run) => set((s) => ({ runs: [run, ...s.runs] })),
      deleteRun: (id) => set((s) => ({ runs: s.runs.filter(r => r.id !== id) })),
      clearAll: () => set({ runs: [] }),
    }),
    { name: 'adrl-run-history' }   // key in localStorage
  )
);
