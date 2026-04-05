import { AdEnvironment, type EnvironmentConfig } from './core/Environment';
import { EpsilonGreedyAgent } from './agents/EpsilonGreedy';
import { EpsilonGreedyDecayingAgent } from './agents/EpsilonGreedyDecaying';
import { UCB1Agent } from './agents/UCB1';
import { ThompsonSamplingAgent } from './agents/ThompsonSampling';
import { RandomAgent } from './agents/Random';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import type { AgentStats, StepResult } from '@/types';
import type { BaseAgent } from './core/BaseAgent';

export interface TickResult {
  agentId: string;
  stats: AgentStats;
  latestSteps: StepResult[];
}

export class SimulationEngine {
  private environment: AdEnvironment;
  private agents: Map<string, BaseAgent> = new Map();
  private currentStep = 0;
  private totalSteps: number;

  constructor(envConfig: EnvironmentConfig, agentIds: string[]) {
    this.environment = new AdEnvironment(envConfig);
    this.totalSteps = envConfig.totalSteps;
    this.initAgents(agentIds);
  }

  private createAgent(agentId: string): BaseAgent {
    const config = ALGORITHM_CONFIGS.find(c => c.id === agentId);
    if (!config) throw new Error(`Unknown agent: ${agentId}`);
    const numArms = this.environment.getNumArms();
    switch (agentId) {
      case 'epsilon-greedy': return new EpsilonGreedyAgent(config, numArms);
      case 'epsilon-greedy-decaying': return new EpsilonGreedyDecayingAgent(config, numArms);
      case 'ucb1': return new UCB1Agent(config, numArms);
      case 'thompson': return new ThompsonSamplingAgent(config, numArms);
      case 'random': return new RandomAgent(config, numArms);
      default: throw new Error(`Unknown agent: ${agentId}`);
    }
  }

  private initAgents(agentIds: string[]): void {
    this.agents.clear();
    for (const id of agentIds) {
      this.agents.set(id, this.createAgent(id));
    }
  }

  tick(stepsToRun: number): TickResult[] {
    const results: Map<string, { steps: StepResult[] }> = new Map();
    for (const id of this.agents.keys()) {
      results.set(id, { steps: [] });
    }

    const actualSteps = Math.min(stepsToRun, this.totalSteps - this.currentStep);

    for (let s = 0; s < actualSteps; s++) {
      const optimalReward = this.environment.getOptimalExpectedReward();

      for (const [agentId, agent] of this.agents.entries()) {
        const armIndex = agent.selectArm();
        const { reward, isClick } = this.environment.step(armIndex);
        const regret = Math.max(0, optimalReward - reward);

        const stepResult: StepResult = {
          action: { armIndex },
          reward,
          isClick,
          regret,
          step: this.currentStep + s,
          armIndex,
        };

        // Type assertion needed since recordStepPublic is on subclasses
        (agent as unknown as { recordStepPublic: (r: StepResult) => void }).recordStepPublic(stepResult);
        agent.update(armIndex, reward);

        results.get(agentId)!.steps.push(stepResult);
      }
    }

    this.currentStep += actualSteps;

    return Array.from(this.agents.entries()).map(([agentId, agent]) => ({
      agentId,
      stats: agent.getStats(),
      latestSteps: results.get(agentId)!.steps,
    }));
  }

  isComplete(): boolean {
    return this.currentStep >= this.totalSteps;
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  getTrueCTRs(): number[] {
    return this.environment.getTrueCTRs();
  }

  reset(): void {
    this.currentStep = 0;
    this.environment.reset();
    for (const agent of this.agents.values()) {
      agent.reset();
    }
  }

  getAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }
}
