export interface Action {
  armIndex: number;
}

export interface StepResult {
  action: Action;
  reward: number;
  isClick: boolean;
  regret: number;
  step: number;
  armIndex: number;
}

export interface AgentStats {
  cumulativeReward: number;
  cumulativeRegret: number;
  stepHistory: StepResult[];
  armSelectionCounts: number[];
  armValueEstimates: number[];
  currentEpsilon?: number;
  currentUCBScores?: number[];
  thompsonPosteriors?: Array<{ alpha: number; beta: number }>;
  convergenceStep?: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  shortName: string;
  color: string;
  params: Record<string, number>;
  description: string;
  formula: string;
}

export interface EpisodeResult {
  agentId: string;
  episodeIndex: number;
  steps: StepResult[];
  finalStats: AgentStats;
}

export type AlgorithmId = 'epsilon-greedy' | 'epsilon-greedy-decaying' | 'ucb1' | 'thompson' | 'dqn';
