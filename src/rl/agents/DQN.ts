import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, StepResult } from '@/types';

class DenseLayer {
  weights: number[][];
  biases: number[];
  private lastInput: number[] = [];
  private lastPreActivation: number[] = [];

  constructor(inputSize: number, outputSize: number) {
    // Xavier initialization
    const scale = Math.sqrt(2 / inputSize);
    this.weights = Array.from({ length: outputSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() * 2 - 1) * scale)
    );
    this.biases = new Array(outputSize).fill(0);
  }

  forward(input: number[], relu = true): number[] {
    this.lastInput = [...input];
    const output = this.biases.map((b, i) =>
      b + this.weights[i].reduce((sum, w, j) => sum + w * input[j], 0)
    );
    this.lastPreActivation = [...output];
    return relu ? output.map(v => Math.max(0, v)) : output;
  }

  backward(gradOutput: number[], relu = true): { gradInput: number[]; gradW: number[][]; gradB: number[] } {
    const gradPre = relu
      ? gradOutput.map((g, i) => (this.lastPreActivation[i] > 0 ? g : 0))
      : [...gradOutput];

    const gradInput = this.lastInput.map((_, j) =>
      this.weights.reduce((sum, row, i) => sum + row[j] * gradPre[i], 0)
    );
    const gradW = this.weights.map((_, i) =>
      this.lastInput.map(x => gradPre[i] * x)
    );
    const gradB = [...gradPre];
    return { gradInput, gradW, gradB };
  }

  update(gradW: number[][], gradB: number[], lr: number): void {
    this.weights = this.weights.map((row, i) =>
      row.map((w, j) => w - lr * gradW[i][j])
    );
    this.biases = this.biases.map((b, i) => b - lr * gradB[i]);
  }

  clone(): DenseLayer {
    const layer = new DenseLayer(this.weights[0]?.length ?? 0, this.weights.length);
    layer.weights = this.weights.map(row => [...row]);
    layer.biases = [...this.biases];
    return layer;
  }
}

interface Transition {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
}

class ReplayBuffer {
  private buffer: Transition[] = [];
  private maxSize: number;
  private idx: number = 0;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  push(t: Transition): void {
    if (this.buffer.length < this.maxSize) {
      this.buffer.push(t);
    } else {
      this.buffer[this.idx % this.maxSize] = t;
      this.idx++;
    }
  }

  sample(batchSize: number): Transition[] {
    const result: Transition[] = [];
    for (let i = 0; i < Math.min(batchSize, this.buffer.length); i++) {
      result.push(this.buffer[Math.floor(Math.random() * this.buffer.length)]);
    }
    return result;
  }

  get size(): number {
    return this.buffer.length;
  }
}

export class DQNAgent extends BaseAgent {
  private layers: DenseLayer[];
  private targetLayers: DenseLayer[];
  private replayBuffer: ReplayBuffer;
  private epsilon: number;
  private epsilonMin: number;
  private epsilonDecay: number;
  private gamma: number;
  private learningRate: number;
  // Kept small to avoid blocking the main thread:
  // batchSize 8 (was 32) — 4× less matrix work per training call
  // trainEvery 4 — only train every 4th step, not every step
  // stateWindow 3 (was 5) — network input 25 instead of 41
  private batchSize = 8;
  private trainEvery = 4;
  private updateTargetEvery = 50;
  private stepCount = 0;
  private lastState: number[];
  private stateWindow = 3;
  private recentActions: number[];

  constructor(config: AgentConfig, numArms: number) {
    super(config, numArms);
    this.gamma = config.params.gamma ?? 0.95;
    this.learningRate = config.params.learningRate ?? 0.001;
    this.epsilonDecay = config.params.epsilonDecay ?? 0.995;
    this.epsilonMin = config.params.epsilonMin ?? 0.01;
    this.epsilon = 1.0;
    this.recentActions = new Array(this.stateWindow).fill(0);

    const stateSize = this.stateWindow * numArms + 1;
    this.layers = [
      new DenseLayer(stateSize, 32),
      new DenseLayer(32, numArms),
    ];
    this.targetLayers = this.layers.map(l => l.clone());
    this.replayBuffer = new ReplayBuffer(2000);
    this.lastState = this.encodeState();
  }

  private encodeState(): number[] {
    const oneHot: number[] = new Array(this.stateWindow * this.numArms).fill(0);
    this.recentActions.forEach((a, t) => {
      oneHot[t * this.numArms + a] = 1;
    });
    return [...oneHot, this.stepCount / 1000];
  }

  private forwardNetwork(input: number[], layers: DenseLayer[]): number[] {
    let x = input;
    for (let i = 0; i < layers.length - 1; i++) {
      x = layers[i].forward(x, true);
    }
    return layers[layers.length - 1].forward(x, false);
  }

  selectArm(): number {
    if (Math.random() < this.epsilon) {
      return this.randomArm();
    }
    const state = this.encodeState();
    const qValues = this.forwardNetwork(state, this.layers);
    this.stats.armValueEstimates = [...qValues];
    this.stats.currentEpsilon = this.epsilon;
    return this._argmax(qValues);
  }

  update(armIndex: number, reward: number): void {
    const currentState = this.lastState;
    this.recentActions = [...this.recentActions.slice(1), armIndex];
    const nextState = this.encodeState();

    this.replayBuffer.push({ state: currentState, action: armIndex, reward, nextState });
    this.lastState = nextState;
    this.stepCount++;

    // Only train every `trainEvery` steps to avoid blocking the animation frame
    if (this.replayBuffer.size >= this.batchSize && this.stepCount % this.trainEvery === 0) {
      this.trainBatch();
    }

    this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);

    if (this.stepCount % this.updateTargetEvery === 0) {
      this.targetLayers = this.layers.map(l => l.clone());
    }

    const qValues = this.forwardNetwork(nextState, this.layers);
    this.stats.armValueEstimates = [...qValues];
    this.stats.currentEpsilon = this.epsilon;
  }

  private trainBatch(): void {
    const batch = this.replayBuffer.sample(this.batchSize);

    for (const { state, action, reward, nextState } of batch) {
      const currentQ = this.forwardNetwork(state, this.layers);
      const nextQ = this.forwardNetwork(nextState, this.targetLayers);
      const targetQ = [...currentQ];
      targetQ[action] = reward + this.gamma * Math.max(...nextQ);

      // Backprop through layers
      let grad = currentQ.map((q, i) => (q - targetQ[i]) * 2 / this.batchSize);

      const grads: Array<{ gradW: number[][]; gradB: number[] }> = [];
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const isLast = i === this.layers.length - 1;
        const { gradInput, gradW, gradB } = this.layers[i].backward(grad, !isLast);
        grads.unshift({ gradW, gradB });
        grad = gradInput;
      }

      this.layers.forEach((layer, i) => {
        layer.update(grads[i].gradW, grads[i].gradB, this.learningRate);
      });
    }
  }

  recordStepPublic(result: StepResult): void {
    this.recordStep(result);
  }

  reset(numArms?: number): void {
    super.reset(numArms);
    const n = numArms ?? this.numArms;
    this.numArms = n;
    this.epsilon = 1.0;
    this.stepCount = 0;
    this.recentActions = new Array(this.stateWindow).fill(0);
    const stateSize = this.stateWindow * n + 1;
    this.layers = [
      new DenseLayer(stateSize, 32),
      new DenseLayer(32, n),
    ];
    this.targetLayers = this.layers.map(l => l.clone());
    this.replayBuffer = new ReplayBuffer(2000);
    this.lastState = this.encodeState();
  }
}
