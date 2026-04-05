import type { AgentStats, EpisodeResult } from './rl.types';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface SimulationState {
  status: SimulationStatus;
  currentStep: number;
  totalSteps: number;
  agentStats: Record<string, AgentStats>;
  episodeHistory: EpisodeResult[];
  trueCTRs: number[];
}

export interface SimulationTickEvent {
  agentId: string;
  stepResults: import('./rl.types').StepResult[];
  updatedStats: AgentStats;
}
