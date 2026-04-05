import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, StepResult } from '@/types';

export class RandomAgent extends BaseAgent {
  constructor(config: AgentConfig, numArms: number) {
    super(config, numArms);
  }

  selectArm(): number {
    return this.randomArm();
  }

  update(armIndex: number, _reward: number): void {
    this.stats.armValueEstimates = new Array(this.numArms).fill(0);
  }

  recordStepPublic(result: StepResult): void {
    this.recordStep(result);
  }

  reset(numArms?: number): void {
    super.reset(numArms);
  }
}
