import { Trash2, Trophy, RotateCcw, TrendingDown, Clock } from 'lucide-react';
import { useRunHistoryStore, type RunRecord } from '@/store/runHistoryStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ALGORITHM_CONFIGS } from '@/lib/constants';
import { formatNumber, formatPercent, cn } from '@/lib/utils';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function WinRateSummary() {
  const { runs } = useRunHistoryStore();

  if (runs.length === 0) return null;

  // Count wins per algorithm
  const winCounts: Record<string, number> = {};
  for (const run of runs) {
    const w = run.winner.agentId;
    winCounts[w] = (winCounts[w] ?? 0) + 1;
  }

  const ucbWins = winCounts['ucb1'] ?? 0;
  const ucbWinRate = runs.length > 0 ? ucbWins / runs.length : 0;
  const ucbConfig = ALGORITHM_CONFIGS.find(c => c.id === 'ucb1');

  // All algorithms that appeared
  const allAgents = Array.from(
    new Set(runs.flatMap(r => r.results.map(res => res.agentId)))
  );

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Win Rate Summary</h3>
        <span className="text-xs text-white/30">{runs.length} run{runs.length !== 1 ? 's' : ''} recorded</span>
      </div>

      {/* UCB1 spotlight */}
      <div className="flex items-center gap-4 p-4 rounded-xl"
        style={{ background: `${ucbConfig?.color}10`, border: `1px solid ${ucbConfig?.color}25` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${ucbConfig?.color}25` }}>
          <Trophy size={18} style={{ color: ucbConfig?.color }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">
            UCB1 won <span style={{ color: ucbConfig?.color }}>{ucbWins}</span> / {runs.length} runs
          </div>
          <div className="text-xs text-white/40 mt-0.5">
            Win rate: <span className="font-mono" style={{ color: ucbConfig?.color }}>
              {formatPercent(ucbWinRate)}
            </span>
          </div>
        </div>
        {/* Win rate bar */}
        <div className="w-24 flex flex-col gap-1 shrink-0">
          <div className="h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${ucbWinRate * 100}%`, backgroundColor: ucbConfig?.color }} />
          </div>
          <div className="text-xs text-right font-mono" style={{ color: ucbConfig?.color }}>
            {(ucbWinRate * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* All algorithms win counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {allAgents.map(id => {
          const cfg = ALGORITHM_CONFIGS.find(c => c.id === id);
          const wins = winCounts[id] ?? 0;
          const rate = wins / runs.length;
          return (
            <div key={id} className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ background: `${cfg?.color}08`, border: `1px solid ${cfg?.color}20` }}>
              <div className="text-xs font-medium" style={{ color: cfg?.color }}>{cfg?.shortName ?? id}</div>
              <div className="text-lg font-bold font-mono text-white">{wins}</div>
              <div className="h-1 rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${rate * 100}%`, backgroundColor: cfg?.color }} />
              </div>
              <div className="text-xs text-white/30 font-mono">{(rate * 100).toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RunRow({ run, onDelete }: { run: RunRecord; onDelete: () => void }) {
  const isRevenue = run.rewardMode === 'revenue';
  const sorted = [...run.results].sort((a, b) => a.rank - b.rank);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Clock size={11} />
            {formatTime(run.timestamp)}
          </div>
          <Badge color="#6B7280">{run.steps.toLocaleString()} steps</Badge>
          <Badge color="#6B7280">{run.numArms} arms</Badge>
          <Badge color={isRevenue ? '#D97706' : '#059669'}>
            {isRevenue ? 'Revenue' : 'CTR'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Winner badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
            style={{ background: `${run.winner.color}15`, color: run.winner.color, border: `1px solid ${run.winner.color}30` }}>
            <Trophy size={10} />
            {run.winner.name}
          </div>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Results grid */}
      <div className="divide-y divide-white/5">
        {sorted.map((r) => {
          const isWinner = r.rank === 1;
          const isUCB = r.agentId === 'ucb1';
          return (
            <div key={r.agentId}
              className={cn('flex items-center gap-3 px-4 py-2.5',
                isWinner && 'bg-white/[0.02]')}>
              {/* Rank */}
              <div className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold shrink-0"
                style={isWinner
                  ? { background: '#D97706', color: 'white' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
                {r.rank}
              </div>
              {/* Name */}
              <div className="flex items-center gap-1.5 w-36 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                <span className={cn('text-xs font-medium', isUCB ? 'font-semibold' : '')}
                  style={{ color: r.color }}>
                  {r.name}
                </span>
                {isUCB && <span className="text-xs text-white/20">(ours)</span>}
              </div>
              {/* Stats */}
              <div className="flex items-center gap-5 ml-auto text-right text-xs font-mono">
                <div>
                  <span className="text-white/30 mr-1.5">Reward</span>
                  <span className="text-white">{formatNumber(r.totalReward, 1)}</span>
                </div>
                <div>
                  <span className="text-white/30 mr-1.5">{isRevenue ? 'Rev/step' : 'CTR'}</span>
                  <span className="text-white">
                    {isRevenue ? `$${r.avgMetric.toFixed(3)}` : formatPercent(r.avgMetric)}
                  </span>
                </div>
                <div>
                  <span className="text-white/30 mr-1.5">Regret</span>
                  <span className="text-red-400">{formatNumber(r.totalRegret, 1)}</span>
                </div>
                <div className="w-16">
                  <span className="text-white/30 mr-1.5">Conv.</span>
                  <span className="text-white">
                    {r.convergenceStep !== null ? `@${r.convergenceStep}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HistoryPage() {
  const { runs, deleteRun, clearAll } = useRunHistoryStore();

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Run History</h2>
            <p className="text-sm text-white/40 mt-0.5">
              Every completed simulation is saved here automatically
            </p>
          </div>
          {runs.length > 0 && (
            <Button variant="danger" size="sm" onClick={clearAll}>
              <RotateCcw size={13} />
              Clear All
            </Button>
          )}
        </div>

        {runs.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-3">
            <TrendingDown size={32} className="text-white/10" />
            <p className="text-white/30 text-sm">No runs recorded yet.</p>
            <p className="text-white/20 text-xs">Complete a simulation on the Simulator page — it saves here automatically.</p>
          </div>
        ) : (
          <>
            <WinRateSummary />
            <div className="flex flex-col gap-3">
              {runs.map(run => (
                <RunRow key={run.id} run={run} onDelete={() => deleteRun(run.id)} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
