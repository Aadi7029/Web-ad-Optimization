import { BarChart2, Play, Info, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useRunHistoryStore } from '@/store/runHistoryStore';
import { useUIStore } from '@/store/uiStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

export function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { agentStats, status } = useSimulationStore();
  const { selectedAgentIds } = useConfigStore();
  const { runs } = useRunHistoryStore();

  const ucbWins = runs.filter(r => r.winner.agentId === 'ucb1').length;

  const navItems = [
    { id: 'simulator' as const, label: 'Simulator', icon: Play, badge: null },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart2, badge: null },
    { id: 'history' as const, label: 'History', icon: History, badge: runs.length > 0 ? `${ucbWins}/${runs.length}` : null },
    { id: 'about' as const, label: 'About', icon: Info, badge: null },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-white/5 transition-all duration-300 shrink-0',
        sidebarCollapsed ? 'w-14' : 'w-56'
      )}
      style={{ background: 'rgba(13,17,23,0.6)' }}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                activePage === id
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && status !== 'idle' && selectedAgentIds.length > 0 && (
          <div className="mt-6 px-3">
            <div className="text-xs text-white/30 uppercase tracking-wider mb-3 px-1">Live Agents</div>
            <div className="flex flex-col gap-2">
              {selectedAgentIds.map((id) => {
                const config = ALGORITHM_CONFIGS.find(c => c.id === id);
                const stats = agentStats[id];
                if (!config) return null;
                return (
                  <div key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: `${config.color}10`, border: `1px solid ${config.color}20` }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: config.color }}>{config.shortName}</div>
                      {stats && (
                        <div className="text-xs text-white/40 font-mono">
                          {formatNumber(stats.cumulativeReward, 0)} pts
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 border-t border-white/5 text-white/30 hover:text-white/60 transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
