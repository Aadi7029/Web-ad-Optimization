import { ALGORITHM_CONFIGS, ALGORITHM_EXPLAINERS } from '@/lib/constants';
import { useUIStore } from '@/store/uiStore';
import { BookOpen, ExternalLink } from 'lucide-react';

export function AboutPage() {
  const { setDrawerOpen, setActivePage } = useUIStore();

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Web Advertisement Optimization</h1>
          <h2 className="text-lg text-purple-400 mt-1">Using Reinforcement Learning</h2>
          <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-xl">
            This application demonstrates how Reinforcement Learning algorithms — specifically Multi-Armed Bandit methods and Deep Q-Networks — can be applied to optimize online advertisement delivery by learning which ad slots yield the highest click-through rates.
          </p>
        </div>

        {/* Problem framing */}
        <div className="glass-card p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen size={14} className="text-purple-400" />
            The Exploration-Exploitation Problem
          </h3>
          <p className="text-sm text-white/60 leading-relaxed">
            When serving ads, a system must choose between <strong className="text-white">exploiting</strong> known high-performing slots and <strong className="text-white">exploring</strong> unfamiliar ones that might be better.
            This is the classic bandit problem: each ad slot is an "arm" with an unknown click probability.
            The agent must balance gathering information with maximizing immediate reward.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {[
              { label: 'CTR', desc: 'Click-through rate — probability a user clicks an ad' },
              { label: 'Regret', desc: 'Cumulative missed reward vs. always picking the best arm' },
              { label: 'Convergence', desc: 'Steps until agent consistently selects the best arm' },
            ].map(({ label, desc }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-sm font-bold text-purple-400">{label}</div>
                <div className="text-xs text-white/40 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithm cards */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Algorithms Compared</h3>
          <div className="flex flex-col gap-3">
            {ALGORITHM_CONFIGS.map((algo) => {
              const explainer = ALGORITHM_EXPLAINERS[algo.id as keyof typeof ALGORITHM_EXPLAINERS];
              return (
                <div key={algo.id} className="glass-card p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: algo.color }} />
                      <span className="text-sm font-semibold text-white">{algo.name}</span>
                    </div>
                    <button
                      onClick={() => { setDrawerOpen(algo.id); setActivePage('simulator'); }}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      Learn more <ExternalLink size={10} />
                    </button>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{algo.description}</p>
                  <div className="font-mono text-xs rounded-lg px-3 py-2" style={{ background: `${algo.color}10`, color: algo.color, border: `1px solid ${algo.color}20` }}>
                    {algo.formula}
                  </div>
                  {explainer && (
                    <div className="flex gap-4 mt-1">
                      <div className="flex-1">
                        <div className="text-xs text-emerald-400/60 mb-1">Pros</div>
                        {explainer.pros.slice(0, 2).map((p, i) => (
                          <div key={i} className="text-xs text-white/40 flex items-start gap-1">
                            <span className="text-emerald-400">+</span>{p}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-red-400/60 mb-1">Cons</div>
                        {explainer.cons.slice(0, 2).map((c, i) => (
                          <div key={i} className="text-xs text-white/40 flex items-start gap-1">
                            <span className="text-red-400">−</span>{c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* References */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">References</h3>
          <ol className="flex flex-col gap-2 list-none">
            {[
              { text: 'P. Auer, N. Cesa-Bianchi, and P. Fischer, "Finite-time analysis of the multiarmed bandit problem," Machine Learning, vol. 47, pp. 235–256, 2002.', href: 'https://link.springer.com/article/10.1023/A:1013689704352' },
              { text: 'R. S. Sutton and A. G. Barto, Reinforcement Learning: An Introduction, 2nd ed., MIT Press, 2018.', href: 'http://incompleteideas.net/book/the-book-2nd.html' },
              { text: 'O. Chapelle and L. Li, "An empirical evaluation of Thompson sampling," in Advances in Neural Information Processing Systems (NeurIPS), vol. 24, pp. 2249–2257, 2011.', href: 'https://proceedings.neurips.cc/paper/2011/hash/e53a0a2978c28872a4505bdb51db06dc-Abstract.html' },
              { text: 'D. Bouneffouf, I. Rish, and C. Aggarwal, "Survey on applications of multi-armed and contextual bandits," in 2020 IEEE Congress on Evolutionary Computation (CEC), Glasgow, UK, pp. 1–8, 2020.', href: 'https://ieeexplore.ieee.org/document/9185782' },
              { text: 'T. Lattimore and C. Szepesvári, Bandit Algorithms, Cambridge University Press, 2020.', href: 'https://tor-lattimore.com/downloads/book/book.pdf' },
              { text: 'A. Soboleva et al., "Optimizing online advertising with multi-armed bandits: Mitigating the cold start problem under auction dynamics," arXiv:2502.01867, 2025.', href: 'https://arxiv.org/abs/2502.01867' },
              { text: 'S. Zhang, "Utilizing reinforcement learning bandit algorithms in advertising optimization," Highlights in Science, Engineering and Technology, vol. 94, pp. 195–200, 2024.', href: 'https://doi.org/10.54097/hset.v94i.p195-200' },
              { text: 'Anonymous, "Bandit algorithms applied in online advertisement to evaluate click-through rates," in IEEE CCECE, 2023. DOI: 10.1109/CCECE58730.2023.10293356.', href: 'https://ieeexplore.ieee.org/document/10293356' },
            ].map((ref, i) => (
              <li key={i} className="text-xs text-white/40 italic flex gap-2">
                <span className="text-white/25 shrink-0 not-italic font-mono">[{i + 1}]</span>
                <a href={ref.href} target="_blank" rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors underline underline-offset-2 decoration-white/10 hover:decoration-purple-400/50">
                  {ref.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
