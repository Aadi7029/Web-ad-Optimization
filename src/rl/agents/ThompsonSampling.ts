import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, StepResult } from '@/types';

function sampleGamma(shape: number): number {
  if (shape < 1) {
    // Ahrens-Dieter method for shape < 1
    return sampleGamma(1 + shape) * Math.pow(Math.random(), 1 / shape);
  }
  // Marsaglia-Tsang method for shape >= 1
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x: number;
    let v: number;
    do {
      x = randn();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

function randn(): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function sampleBeta(alpha: number, beta: number): number {
  const g1 = sampleGamma(alpha);
  const g2 = sampleGamma(beta);
  const total = g1 + g2;
  if (total === 0) return 0.5;
  return g1 / total;
}

export class ThompsonSamplingAgent extends BaseAgent {
  private alpha: number[];
  private betaArr: number[];
  private priorAlpha: number;
  private priorBeta: number;

  constructor(config: AgentConfig, numArms: number) {
    super(config, numArms);
    this.priorAlpha = config.params.priorAlpha ?? 1;
    this.priorBeta = config.params.priorBeta ?? 1;
    this.alpha = new Array(numArms).fill(this.priorAlpha);
    this.betaArr = new Array(numArms).fill(this.priorBeta);
  }

  selectArm(): number {
    const samples = this.alpha.map((a, i) => sampleBeta(a, this.betaArr[i]));
    return this._argmax(samples);
  }

  update(armIndex: number, reward: number): void {
    const click = reward > 0 ? 1 : 0;
    this.alpha[armIndex] += click;
    this.betaArr[armIndex] += 1 - click;
    this.stats.armValueEstimates = this.alpha.map((a, i) =>
      a / (a + this.betaArr[i])
    );
    this.stats.thompsonPosteriors = this.alpha.map((a, i) => ({
      alpha: a,
      beta: this.betaArr[i],
    }));
  }

  recordStepPublic(result: StepResult): void {
    this.recordStep(result);
  }

  reset(numArms?: number): void {
    super.reset(numArms);
    const n = numArms ?? this.numArms;
    this.alpha = new Array(n).fill(this.priorAlpha);
    this.betaArr = new Array(n).fill(this.priorBeta);
  }
}
