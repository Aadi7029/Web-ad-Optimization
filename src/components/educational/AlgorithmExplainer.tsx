import { X, ExternalLink } from 'lucide-react';
import { ALGORITHM_EXPLAINERS, ALGORITHM_CONFIGS } from '@/lib/constants';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function AlgorithmExplainer() {
  const { drawerOpen, setDrawerOpen } = useUIStore();
  const isOpen = drawerOpen !== null;

  const algo = drawerOpen ? ALGORITHM_CONFIGS.find(c => c.id === drawerOpen) : null;
  const explainer = drawerOpen ? ALGORITHM_EXPLAINERS[drawerOpen as keyof typeof ALGORITHM_EXPLAINERS] : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setDrawerOpen(null)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ background: 'rgba(13,17,23,0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
      >
        {algo && explainer && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: algo.color }} />
                <h2 className="text-base font-semibold text-white">{explainer.title}</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-5">
              {/* Theory */}
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Theory</h3>
                <p className="text-sm text-white/70 leading-relaxed">{explainer.theory}</p>
              </div>

              {/* Formula */}
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Formula</h3>
                <div className="rounded-lg p-3 font-mono text-sm" style={{ background: `${algo.color}15`, border: `1px solid ${algo.color}30`, color: algo.color }}>
                  {algo.formula}
                </div>
              </div>

              {/* Pseudocode */}
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Pseudocode</h3>
                <pre className="text-xs text-white/60 leading-relaxed rounded-lg p-3 overflow-x-auto font-mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {explainer.pseudocode}
                </pre>
              </div>

              {/* Pros / Cons */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-emerald-400/60 uppercase tracking-wider mb-2">Pros</h3>
                  <ul className="flex flex-col gap-1.5">
                    {explainer.pros.map((p, i) => (
                      <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">+</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-2">Cons</h3>
                  <ul className="flex flex-col gap-1.5">
                    {explainer.cons.map((c, i) => (
                      <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">−</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reference */}
              <div className="text-xs text-white/30 italic border-t border-white/5 pt-4">
                {explainer.reference}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
