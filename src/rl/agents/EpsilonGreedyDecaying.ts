import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, StepResult } from '@/types';

export class EpsilonGreedyDecayingAgent extends BaseAgent {
  private epsilon0: number;
  private decayRate: number;
  private currentEpsilon: number;
  private step: number = 0;
  private counts: number[];
  private values: number[];

  constructor(config: AgentConfig, numArms: number) {
    super(config, numArms);
    this.epsilon0 = config.params.epsilon0 ?? 1.0;
    this.decayRate = config.params.decayRate ?? 0.001;
    this.currentEpsilon = this.epsilon0;
    this.counts = new Array(numArms).fill(0);
    this.values = new Array(numArms).fill(0);
  }

  selectArm(): number {
    this.currentEpsilon = this.epsilon0 / (1 + this.decayRate * this.step);
    if (Math.random() < this.currentEpsilon) {
      return this.randomArm();
    }
    return this._argmax(this.values);
  }

  update(armIndex: number, reward: number): void {
    this.step++;
    this.counts[armIndex]++;
    this.values[armIndex] += (reward - this.values[armIndex]) / this.counts[armIndex];
    this.stats.armValueEstimates = [...this.values];
    this.stats.currentEpsilon = this.currentEpsilon;
  }

  recordStepPublic(result: StepResult): void {
    this.recordStep(result);
  }

  reset(numArms?: number): void {
    super.reset(numArms);
    const n = numArms ?? this.numArms;
    this.counts = new Array(n).fill(0);
    this.values = new Array(n).fill(0);
    this.step = 0;
    this.currentEpsilon = this.epsilon0;
  }
}
