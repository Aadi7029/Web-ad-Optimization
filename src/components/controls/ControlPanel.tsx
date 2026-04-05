import { AlgorithmSelector } from './AlgorithmSelector';
import { SimulationControls } from './SimulationControls';
import { EnvironmentConfig } from './EnvironmentConfig';

export function ControlPanel() {
  return (
    <div className="w-72 shrink-0 flex flex-col gap-0 border-r border-white/5 overflow-y-auto scrollbar-thin" style={{ background: 'rgba(13,17,23,0.4)' }}>
      <div className="p-4 border-b border-white/5">
        <SimulationControls />
      </div>
      <div className="p-4 border-b border-white/5">
        <AlgorithmSelector />
      </div>
      <div className="p-4">
        <EnvironmentConfig />
      </div>
    </div>
  );
}
