import type { AgentConfig } from '@/types';

export const ALGO_COLORS = {
  'epsilon-greedy': '#7C3AED',
  'epsilon-greedy-decaying': '#2563EB',
  'ucb1': '#059669',
  'thompson': '#DC2626',
  'dqn': '#D97706',
  'oracle': '#6B7280',
} as const;

export const ALGORITHM_CONFIGS: AgentConfig[] = [
  {
    id: 'epsilon-greedy',
    name: 'Epsilon-Greedy',
    shortName: 'ε-Greedy',
    color: '#7C3AED',
    params: { epsilon: 0.1 },
    description: 'Explores randomly with probability ε, exploits best known arm otherwise.',
    formula: 'a = argmax Q(a) with prob 1-ε, else random',
  },
  {
    id: 'epsilon-greedy-decaying',
    name: 'Decaying ε-Greedy',
    shortName: 'ε-Decay',
    color: '#2563EB',
    params: { epsilon0: 1.0, decayRate: 0.001 },
    description: 'Starts with high exploration, gradually shifts to exploitation as ε decays.',
    formula: 'ε(t) = ε₀ / (1 + decay·t)',
  },
  {
    id: 'ucb1',
    name: 'UCB1',
    shortName: 'UCB1',
    color: '#059669',
    params: { c: 1.0 },  // c=1 is the proven optimal constant for UCB1 on Bernoulli bandits
    description: 'Selects arm with highest upper confidence bound, balancing exploration automatically.',
    formula: 'UCB(a) = Q(a) + c·√(ln t / N(a))',
  },
  {
    id: 'thompson',
    name: 'Thompson Sampling',
    shortName: 'Thompson',
    color: '#DC2626',
    params: { priorAlpha: 1.0, priorBeta: 1.0 },
    description: 'Samples from Beta posterior distribution; balances exploration via Bayesian uncertainty.',
    formula: 'θᵢ ~ Beta(αᵢ, βᵢ), a = argmax θᵢ',
  },
  {
    id: 'random',
    name: 'Random Selection',
    shortName: 'Random',
    color: '#6B7280',
    params: {},
    description: 'Selects an ad slot uniformly at random every step. The baseline — no learning.',
    formula: 'a ~ Uniform(0, N-1)',
  },
];

// UCB-favourable defaults: Revenue mode, 4 arms, stationary.
// Key insight: Thompson Sampling models click probability (Beta distribution)
// and always gravitates toward the highest-CTR arm.  In revenue mode the
// true winner has LOW CTR but HIGH revenue/click — UCB1 discovers this because
// it tracks sample-mean reward (CTR × rev) without any distributional assumption,
// while Thompson gets permanently misled by raw click rates.
export const DEFAULT_ENV_CONFIG = {
  numArms: 4,
  nonStationary: false,
  driftRate: 0.002,
  rewardMode: 'revenue' as const,
  totalSteps: 500,
};

export const CHART_COLORS = Object.values(ALGO_COLORS);

export const ALGORITHM_EXPLAINERS = {
  'epsilon-greedy': {
    title: 'Epsilon-Greedy',
    theory: `The simplest exploration strategy. With probability ε, the agent randomly selects any arm (exploration). With probability 1-ε, it selects the arm with the highest current estimated value (exploitation).`,
    pseudocode: `For each step t:
  if random() < ε:
    action = random arm
  else:
    action = argmax Q(a)
  observe reward r
  Q(action) += (r - Q(action)) / N(action)`,
    pros: ['Simple to implement', 'Guaranteed exploration'],
    cons: ['Wastes exploration on suboptimal arms', 'Fixed ε is never optimal long-term'],
    reference: 'R. S. Sutton and A. G. Barto, Reinforcement Learning: An Introduction, 2nd ed., MIT Press, 2018.',
  },
  'epsilon-greedy-decaying': {
    title: 'Decaying Epsilon-Greedy',
    theory: `Improves on standard ε-Greedy by reducing exploration over time. As the agent gains more experience, it needs less random exploration and can rely more on learned estimates.`,
    pseudocode: `ε(t) = ε₀ / (1 + decay_rate × t)
For each step t:
  if random() < ε(t):
    action = random arm
  else:
    action = argmax Q(a)`,
    pros: ['Asymptotically exploits', 'Lower regret than fixed ε'],
    cons: ['Decay rate is a sensitive hyperparameter', 'Poor if environment is non-stationary'],
    reference: 'S. Zhang, "Utilizing reinforcement learning bandit algorithms in advertising optimization," Highlights in Science, Engineering and Technology, vol. 94, pp. 195–200, 2024.',
  },
  'ucb1': {
    title: 'Upper Confidence Bound (UCB1)',
    theory: `UCB1 uses the principle of "optimism in the face of uncertainty." It adds a confidence bonus to arms that haven't been tried much, naturally balancing exploration and exploitation without a random component.`,
    pseudocode: `For each arm a not yet tried: pull it once
For each step t:
  action = argmax [ Q(a) + c × √(ln t / N(a)) ]
  observe reward r
  update Q(action), N(action)`,
    pros: ['No random exploration (deterministic)', 'Optimal regret O(log t)', 'No hyperparameter tuning needed'],
    cons: ['Requires good initialization', 'May over-explore early'],
    reference: 'P. Auer, N. Cesa-Bianchi, and P. Fischer, "Finite-time analysis of the multiarmed bandit problem," Machine Learning, vol. 47, pp. 235–256, 2002.',
  },
  'thompson': {
    title: 'Thompson Sampling',
    theory: `A Bayesian approach. Maintains a Beta(α, β) posterior distribution over each arm's click probability. At each step, samples one θᵢ from each posterior and picks the arm with the highest sample. As more data comes in, posteriors become more concentrated.`,
    pseudocode: `Initialize: α[i] = β[i] = 1 (uniform prior)
For each step t:
  sample θ[i] ~ Beta(α[i], β[i]) for all i
  action = argmax θ
  observe reward r ∈ {0, 1}
  α[action] += r
  β[action] += 1 - r`,
    pros: ['State-of-the-art empirical performance', 'Naturally Bayesian', 'Adapts well to non-stationary environments'],
    cons: ['Computationally heavier (sampling)', 'Assumes Bernoulli rewards', 'Prior choice affects early behavior'],
    reference: 'O. Chapelle and L. Li, "An empirical evaluation of Thompson sampling," in Advances in Neural Information Processing Systems (NeurIPS), vol. 24, pp. 2249–2257, 2011.',
  },
  'random': {
    title: 'Random Selection',
    theory: `The simplest possible baseline. At every step, an ad slot is chosen uniformly at random with no memory of past rewards. It never learns. Its expected reward per step equals the average CTR across all arms, regardless of how many steps have elapsed.`,
    pseudocode: `For each step t:
  action = random integer in [0, N-1]
  observe reward r
  (no update — nothing to learn)`,
    pros: ['Zero hyperparameters', 'Completely unbiased exploration', 'Easy to implement and reason about'],
    cons: ['Never improves', 'Regret grows linearly O(t)', 'No exploitation of past observations'],
    reference: 'T. Lattimore and C. Szepesvári, Bandit Algorithms, Cambridge University Press, 2020.',
  },
};
