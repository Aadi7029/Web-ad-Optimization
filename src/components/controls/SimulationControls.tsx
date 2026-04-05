import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';
import { useConfigStore } from '@/store/configStore';
import { useSimulation } from '@/hooks/useSimulation';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';

export function SimulationControls() {
  const { status } = useSimulationStore();
  const { speed, setSpeed, totalSteps, setTotalSteps } = useConfigStore();
  const { start, pause, resume, reset } = useSimulation();

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Simulation</h3>

      <div className="flex items-center gap-2">
        {!isRunning && !isPaused ? (
          <Button
            variant="primary"
            size="sm"
            onClick={start}
            className="flex-1"
          >
            <Play size={14} />
            {isCompleted ? 'Restart' : 'Run'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={isRunning ? pause : resume}
            className="flex-1"
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause' : 'Resume'}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw size={14} />
        </Button>
      </div>

      <Slider
        label="Speed"
        value={speed}
        min={1}
        max={50}
        step={1}
        onChange={setSpeed}
        formatValue={(v) => `${v}x`}
      />

      <Slider
        label="Total Steps"
        value={totalSteps}
        min={200}
        max={5000}
        step={100}
        onChange={setTotalSteps}
        formatValue={(v) => v.toLocaleString()}
      />
    </div>
  );
}
