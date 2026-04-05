import { create } from 'zustand';
import { generateDefaultArms } from '@/lib/utils';
import { DEFAULT_ENV_CONFIG } from '@/lib/constants';
import type { EnvironmentConfig } from '@/rl/core/Environment';

interface ConfigState {
  selectedAgentIds: string[];
  speed: number;
  totalSteps: number;
  environmentConfig: EnvironmentConfig;
  setSelectedAgentIds: (ids: string[]) => void;
  toggleAgent: (id: string) => void;
  setSpeed: (speed: number) => void;
  setTotalSteps: (steps: number) => void;
  setNumArms: (n: number) => void;
  setNonStationary: (v: boolean) => void;
  setRewardMode: (mode: 'ctr' | 'revenue') => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  // UCB1 vs its direct competitors in the stationary short-horizon scenario
  selectedAgentIds: ['ucb1', 'epsilon-greedy', 'epsilon-greedy-decaying', 'random'],
  speed: 10,
  totalSteps: DEFAULT_ENV_CONFIG.totalSteps,
  environmentConfig: {
    arms: generateDefaultArms(DEFAULT_ENV_CONFIG.numArms),
    nonStationary: DEFAULT_ENV_CONFIG.nonStationary,
    driftRate: DEFAULT_ENV_CONFIG.driftRate,
    rewardMode: DEFAULT_ENV_CONFIG.rewardMode,
    totalSteps: DEFAULT_ENV_CONFIG.totalSteps,
  },

  setSelectedAgentIds: (ids) => set({ selectedAgentIds: ids }),

  toggleAgent: (id) => {
    const { selectedAgentIds } = get();
    if (selectedAgentIds.includes(id)) {
      if (selectedAgentIds.length > 1) {
        set({ selectedAgentIds: selectedAgentIds.filter(a => a !== id) });
      }
    } else if (selectedAgentIds.length < 4) {
      set({ selectedAgentIds: [...selectedAgentIds, id] });
    }
  },

  setSpeed: (speed) => set({ speed }),

  setTotalSteps: (steps) =>
    set((state) => ({
      totalSteps: steps,
      environmentConfig: { ...state.environmentConfig, totalSteps: steps },
    })),

  setNumArms: (n) =>
    set((state) => ({
      environmentConfig: {
        ...state.environmentConfig,
        arms: generateDefaultArms(n),
      },
    })),

  setNonStationary: (v) =>
    set((state) => ({
      environmentConfig: { ...state.environmentConfig, nonStationary: v },
    })),

  setRewardMode: (mode) =>
    set((state) => ({
      environmentConfig: { ...state.environmentConfig, rewardMode: mode },
    })),
}));
