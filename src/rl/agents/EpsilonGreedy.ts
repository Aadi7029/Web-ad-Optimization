import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, StepResult } from '@/types';

export class EpsilonGreedyAgent extends BaseAgent {
  private epsilon: number;
  private counts: number[];
  private values: number[];

  constructor(config: AgentConfig, numArms: number) {
    super(config, numArms);
    this.epsilon = config.params.epsilon ?? 0.1;
    this.counts = new Array(numArms).fill(0);
    this.values = new Array(numArms).fill(0);
  }

  selectArm(): number {
    if (Math.random() < this.epsilon) {
      return this.randomArm();
    }
    return this._argmax(this.values);
  }

  update(armIndex: number, reward: number): void {
    this.counts[armIndex]++;
    this.values[armIndex] += (reward - this.values[armIndex]) / this.counts[armIndex];
    this.stats.armValueEstimates = [...this.values];
    this.stats.currentEpsilon = this.epsilon;
  }

  recordStepPublic(result: StepResult): void {
    this.recordStep(result);
  }

  reset(numArms?: number): void {
    super.reset(numArms);
    const n = numArms ?? this.numArms;
    this.counts = new Array(n).fill(0);
    this.values = new Array(n).fill(0);
  }
}
