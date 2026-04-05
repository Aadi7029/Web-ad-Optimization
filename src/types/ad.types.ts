export interface ArmConfig {
  id: number;
  label: string;
  trueCTR: number;
  revenuePerClick: number;
}

export interface EnvironmentConfig {
  arms: ArmConfig[];
  nonStationary: boolean;
  driftRate: number;
  rewardMode: 'ctr' | 'revenue';
  totalSteps: number;
}

export interface SimulationConfig {
  environment: EnvironmentConfig;
  selectedAgentIds: string[];
  speed: number;
  episodeCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  config: SimulationConfig;
}
