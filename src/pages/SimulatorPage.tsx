import { ControlPanel } from '@/components/controls/ControlPanel';
import { SimulationCanvas } from '@/components/simulation/SimulationCanvas';
import { CumulativeRewardChart } from '@/components/charts/CumulativeRewardChart';
import { RegretChart } from '@/components/charts/RegretChart';
import { CTROverTimeChart } from '@/components/charts/CTROverTimeChart';
import { ExplorationHeatmap } from '@/components/charts/ExplorationHeatmap';
import { AlgorithmExplainer } from '@/components/educational/AlgorithmExplainer';
import { Tabs } from '@/components/ui/Tabs';
import { useUIStore } from '@/store/uiStore';
import { BarChart2, Activity, Map } from 'lucide-react';

const chartTabs = [
  { id: 'reward', label: 'Reward', icon: <Activity size={12} /> },
  { id: 'regret', label: 'Regret', icon: <BarChart2 size={12} /> },
  { id: 'ctr', label: 'CTR', icon: <BarChart2 size={12} /> },
  { id: 'heatmap', label: 'Heatmap', icon: <Map size={12} /> },
];

export function SimulatorPage() {
  const { activeChartTab, setActiveChartTab } = useUIStore();

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left panel: controls */}
      <ControlPanel />

      {/* Center: simulation canvas */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <SimulationCanvas />
      </div>

      {/* Right panel: charts */}
      <div className="w-80 xl:w-96 shrink-0 border-l border-white/5 flex flex-col overflow-hidden" style={{ background: 'rgba(13,17,23,0.4)' }}>
        <div className="p-4 border-b border-white/5">
          <Tabs
            tabs={chartTabs}
            activeTab={activeChartTab}
            onTabChange={setActiveChartTab}
          />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {activeChartTab === 'reward' && <CumulativeRewardChart />}
          {activeChartTab === 'regret' && <RegretChart />}
          {activeChartTab === 'ctr' && <CTROverTimeChart />}
          {activeChartTab === 'heatmap' && <ExplorationHeatmap />}
        </div>
      </div>

      <AlgorithmExplainer />
    </div>
  );
}
