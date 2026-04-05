import { argmax } from '@/lib/utils';
import type { AgentConfig, AgentStats, StepResult } from '@/types';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected stats: AgentStats;
  protected numArms: number;

  constructor(config: AgentConfig, numArms: number) {
    this.config = config;
    this.numArms = numArms;
    this.stats = this.initStats(numArms);
  }

  private initStats(numArms: number): AgentStats {
    return {
      cumulativeReward: 0,
      cumulativeRegret: 0,
      stepHistory: [],
      armSelectionCounts: new Array(numArms).fill(0),
      armValueEstimates: new Array(numArms).fill(0),
    };
  }

  abstract selectArm(): number;
  abstract update(armIndex: number, reward: number): void;

  reset(numArms?: number): void {
    this.numArms = numArms ?? this.numArms;
    this.stats = this.initStats(this.numArms);
  }

  getStats(): AgentStats {
    return { ...this.stats, stepHistory: this.stats.stepHistory };
  }

  getId(): string {
    return this.config.id;
  }

  getColor(): string {
    return this.config.color;
  }

  protected recordStep(result: StepResult): void {
    this.stats.cumulativeReward += result.reward;
    this.stats.cumulativeRegret += result.regret;
    this.stats.armSelectionCounts[result.armIndex]++;
    // Keep only last 5000 steps to avoid memory issues
    if (this.stats.stepHistory.length >= 5000) {
      this.stats.stepHistory.shift();
    }
    this.stats.stepHistory.push(result);
  }

  protected randomArm(): number {
    return Math.floor(Math.random() * this.numArms);
  }

  protected _argmax(arr: number[]): number {
    return argmax(arr);
  }
}
