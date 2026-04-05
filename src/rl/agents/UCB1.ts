import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, StepResult } from '@/types';

export class UCB1Agent extends BaseAgent {
  private counts: number[];
  private values: number[];
  private totalSteps: number = 0;
  private c: number;

  constructor(config: AgentConfig, numArms: number) {
    super(config, numArms);
    this.c = config.params.c ?? 2.0;
    this.counts = new Array(numArms).fill(0);
    this.values = new Array(numArms).fill(0);
  }

  selectArm(): number {
    // Pull each arm at least once
    const unpulled = this.counts.findIndex(c => c === 0);
    if (unpulled !== -1) return unpulled;

    const ucbScores = this.values.map((v, i) =>
      v + this.c * Math.sqrt(Math.log(this.totalSteps) / this.counts[i])
    );
    this.stats.currentUCBScores = [...ucbScores];
    return this._argmax(ucbScores);
  }

  update(armIndex: number, reward: number): void {
    this.totalSteps++;
    this.counts[armIndex]++;
    this.values[armIndex] += (reward - this.values[armIndex]) / this.counts[armIndex];
    this.stats.armValueEstimates = [...this.values];

    const ucbScores = this.values.map((v, i) =>
      this.counts[i] > 0
        ? v + this.c * Math.sqrt(Math.log(this.totalSteps) / this.counts[i])
        : Infinity
    );
    this.stats.currentUCBScores = ucbScores;
  }

  recordStepPublic(result: StepResult): void {
    this.recordStep(result);
  }

  reset(numArms?: number): void {
    super.reset(numArms);
    const n = numArms ?? this.numArms;
    this.counts = new Array(n).fill(0);
    this.values = new Array(n).fill(0);
    this.totalSteps = 0;
  }
}
