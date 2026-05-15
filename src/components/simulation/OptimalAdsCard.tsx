import { useMemo } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { useAlgorithmComparison } from '@/hooks/useAlgorithmComparison';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { argmax, formatPercent, formatNumber } from '@/lib/utils';

export function OptimalAdsCard() {
  const { trueCTRs, status, currentStep } = useSimulationStore();
  const { environmentConfig } = useConfigStore();
  const { arms, rewardMode } = environmentConfig;
  const metrics = useAlgorithmComparison();

  const { bestCtrIdx, bestRevIdx, expectedValues, isTrap } = useMemo(() => {
    const ctrs = arms.map((a, i) => trueCTRs[i] ?? a.trueCTR);
    const evs = arms.map((a, i) => ctrs[i] * a.revenuePerClick);
    const ctrIdx = argmax(ctrs);
    const revIdx = argmax(evs);
    return {
      bestCtrIdx: ctrIdx,
      bestRevIdx: revIdx,
      expectedValues: evs,
      isTrap: ctrIdx !== revIdx,
    };
  }, [arms, trueCTRs]);

  const leader = useMemo(() => {
    const withData = metrics.filter(m =>
      m.armSelectionCounts.length > 0 &&
      m.armSelectionCounts.some(c => c > 0)
    );
    if (withData.length === 0) return null;

    const top = withData.reduce((best, m) =>
      m.totalReward > best.totalReward ? m : best, withData[0]);

    const pickIdx = argmax(top.armSelectionCounts);
    const totalPulls = top.armSelectionCounts.reduce((s, c) => s + c, 0);
    const pickShare = totalPulls > 0 ? top.armSelectionCounts[pickIdx] / totalPulls : 0;
    const truthIdx = rewardMode === 'revenue' ? bestRevIdx : bestCtrIdx;

    return {
      name: top.name,
      color: top.color,
      pickIdx,
      pickShare,
      aligned: pickIdx === truthIdx,
    };
  }, [metrics, rewardMode, bestRevIdx, bestCtrIdx]);

  const letter = (i: number) => String.fromCharCode(65 + i);
  const ctrArm = arms[bestCtrIdx];
  const revArm = arms[bestRevIdx];
  const bestCtr = trueCTRs[bestCtrIdx] ?? ctrArm?.trueCTR ?? 0;
  const bestRevCtr = trueCTRs[bestRevIdx] ?? revArm?.trueCTR ?? 0;
  const bestEv = expectedValues[bestRevIdx] ?? 0;

  if (!ctrArm || !revArm) {
    return (
      <ChartContainer title="Best Ads" subtitle="Highest CTR vs highest expected revenue">
        <div className="h-20 flex items-center justify-center text-white/30 text-sm">
          Configure ads to see best picks
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Best Ads"
      subtitle={
        rewardMode === 'revenue'
          ? (isTrap
              ? 'Highest CTR is NOT the highest revenue — revenue trap active'
              : 'Highest CTR is also the revenue winner')
          : 'Highest click-through rate ad'
      }
    >
      <div className="flex flex-col gap-2">
        {/* Top CTR row */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-emerald-500/20">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shrink-0"
          >
            {letter(bestCtrIdx)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-emerald-300/70">
              Top CTR
            </div>
            <div className="text-sm font-semibold text-white truncate">
              Ad {letter(bestCtrIdx)} — {formatPercent(bestCtr)}
            </div>
            <div className="text-[11px] text-white/40 truncate">
              ${formatNumber(ctrArm.revenuePerClick)}/click
              {' · '}
              EV ${formatNumber(bestCtr * ctrArm.revenuePerClick)}/imp
            </div>
          </div>
        </div>

        {/* Top Revenue row (only shown in revenue mode) */}
        {rewardMode === 'revenue' && (
          <div
            className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 border ${
              isTrap ? 'border-amber-500/40' : 'border-white/10'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold shrink-0 ${
                isTrap
                  ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                  : 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
              }`}
            >
              {letter(bestRevIdx)}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-[10px] uppercase tracking-wider ${
                  isTrap ? 'text-amber-300/80' : 'text-emerald-300/70'
                }`}
              >
                Top Revenue {isTrap && '(true winner)'}
              </div>
              <div className="text-sm font-semibold text-white truncate">
                Ad {letter(bestRevIdx)} — ${formatNumber(bestEv)}/imp
              </div>
              <div className="text-[11px] text-white/40 truncate">
                {formatPercent(bestRevCtr)} CTR × ${formatNumber(revArm.revenuePerClick)}/click
              </div>
            </div>
          </div>
        )}

        {rewardMode === 'revenue' && isTrap && (
          <div className="text-[11px] text-amber-300/80 leading-snug px-1 pt-1">
            High CTR ≠ high revenue. A good algorithm must converge on Ad {letter(bestRevIdx)}, not Ad {letter(bestCtrIdx)}.
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/5 my-1" />

        {/* Live Leader's Pick row — dynamic */}
        {leader ? (
          <div
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border transition-all duration-300"
            style={{
              borderColor: leader.aligned ? `${leader.color}66` : 'rgba(244,114,33,0.35)',
              boxShadow: leader.aligned ? `0 0 12px ${leader.color}25` : undefined,
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold shrink-0 transition-colors duration-300"
              style={{
                color: leader.color,
                backgroundColor: `${leader.color}22`,
                borderColor: `${leader.color}55`,
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              {letter(leader.pickIdx)}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[10px] uppercase tracking-wider flex items-center gap-2"
                style={{ color: `${leader.color}cc` }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: leader.color }} />
                Leader's Pick · {leader.name}
              </div>
              <div className="text-sm font-semibold text-white truncate">
                Ad {letter(leader.pickIdx)} — {formatPercent(leader.pickShare)} of pulls
              </div>
              <div className={`text-[11px] truncate ${leader.aligned ? 'text-emerald-300/80' : 'text-amber-300/80'}`}>
                {leader.aligned
                  ? 'Aligned with the true winner'
                  : `Chasing Ad ${letter(leader.pickIdx)} — true winner is Ad ${letter(rewardMode === 'revenue' ? bestRevIdx : bestCtrIdx)}`}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white/30 bg-white/5 border border-white/10 shrink-0">
              —
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-white/40">Leader's Pick</div>
              <div className="text-sm font-semibold text-white/50">
                {status === 'idle' ? 'Start simulation to see' : 'Gathering data…'}
              </div>
              <div className="text-[11px] text-white/30">
                Step {currentStep}
              </div>
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}
