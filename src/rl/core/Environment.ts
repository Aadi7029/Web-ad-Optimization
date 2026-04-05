import { clamp } from '@/lib/utils';

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

export class AdEnvironment {
  private arms: ArmConfig[];
  private config: EnvironmentConfig;
  private stepCount: number = 0;
  private baseCTRs: number[];

  constructor(config: EnvironmentConfig) {
    this.config = config;
    this.arms = config.arms.map(a => ({ ...a }));
    this.baseCTRs = config.arms.map(a => a.trueCTR);
  }

  reset(): void {
    this.stepCount = 0;
    this.arms = this.config.arms.map((a, i) => ({ ...a, trueCTR: this.baseCTRs[i] }));
  }

  step(armIndex: number): { reward: number; isClick: boolean } {
    const arm = this.arms[armIndex];
    const isClick = Math.random() < arm.trueCTR;
    const reward = isClick
      ? (this.config.rewardMode === 'revenue' ? arm.revenuePerClick : 1)
      : 0;

    this.stepCount++;

    if (this.config.nonStationary) {
      this.applyDrift();
    }

    return { reward, isClick };
  }

  getOptimalExpectedReward(): number {
    return Math.max(...this.arms.map(a =>
      this.config.rewardMode === 'revenue' ? a.trueCTR * a.revenuePerClick : a.trueCTR
    ));
  }

  getTrueCTRs(): number[] {
    return this.arms.map(a => a.trueCTR);
  }

  getNumArms(): number {
    return this.arms.length;
  }

  getStep(): number {
    return this.stepCount;
  }

  private applyDrift(): void {
    const phase = this.stepCount * this.config.driftRate;
    this.arms.forEach((arm, i) => {
      const drift = Math.sin(phase + i * 0.7) * 0.05;
      arm.trueCTR = clamp(this.baseCTRs[i] + drift, 0.02, 0.98);
    });
  }
}
