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
        <div className="glass-card p-4 flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-white">References</h3>
          <ul className="flex flex-col gap-1.5">
            {Object.values(ALGORITHM_EXPLAINERS).map((e, i) => (
              <li key={i} className="text-xs text-white/40 italic">{e.reference}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
