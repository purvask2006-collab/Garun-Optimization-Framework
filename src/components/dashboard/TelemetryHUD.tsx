import React, { useMemo } from 'react';
import { Radio, Gauge, Pause, Play } from 'lucide-react';
import { useGarunStore } from '../../store/useGarunStore';
import { CameraPreset } from './SubsystemHighlighter';

interface TelemetryHUDProps {
  showHUD: boolean;
  isSimRunning: boolean;
  setIsSimRunning: React.Dispatch<React.SetStateAction<boolean>>;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  showHull: boolean;
  setShowHull: React.Dispatch<React.SetStateAction<boolean>>;
  showFlows: boolean;
  setShowFlows: React.Dispatch<React.SetStateAction<boolean>>;
  simTimeMs: number;
  tickCount: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  showHUD,
  isSimRunning,
  setIsSimRunning,
  simSpeed,
  setSimSpeed,
  cameraPreset,
  setCameraPreset,
  showHull,
  setShowHull,
  showFlows,
  setShowFlows,
  simTimeMs,
  tickCount
}) => {
  const activeTelemetryFrame = useGarunStore((state) => state.activeTelemetryFrame);

  if (!showHUD) return null;

  const altitudeM = activeTelemetryFrame?.altitudeM || 6500;
  const machVal = activeTelemetryFrame?.machNumber || 0.29;

  const airDensityKgM3 = useMemo(() => {
    const densityRatio = Math.pow(Math.max(0.1, 1 - 2.25577e-5 * altitudeM), 4.2561);
    return (1.225 * densityRatio).toFixed(3);
  }, [altitudeM]);

  const airspeedMps = (activeTelemetryFrame?.airspeedKts || 165) * 0.514444;
  const dynamicPressureKpa = useMemo(() => {
    const rho = parseFloat(airDensityKgM3);
    return ((0.5 * rho * airspeedMps * airspeedMps) / 1000).toFixed(2);
  }, [airDensityKgM3, airspeedMps]);

  const formatSimClock = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSec % 60).padStart(2, '0');
    const millis = String(ms % 1000).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${millis}`;
  };

  return (
    <>
      {/* Top Left: Flight & Aerodynamic Telemetry */}
      <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1.5 bg-[#0F1729]/85 backdrop-blur-md p-2 rounded border border-[#1A2740] min-w-[130px]">
        <div className="text-[9px] font-mono-data text-[#8A9BBE] border-b border-[#1A2740] pb-0.5 mb-1 uppercase flex items-center justify-between">
          <span>FLIGHT TELEMETRY</span>
          <Radio className="w-2.5 h-2.5 text-[#00A8FF]" />
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">ALTITUDE</span>
          <span className="text-xs font-mono-data font-bold text-[#00A8FF]">
            {altitudeM.toLocaleString()} <span className="text-[9px] text-[#8A9BBE]">m</span>
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">MACH NO.</span>
          <span className="text-xs font-mono-data font-bold text-[#00F5E4]">
            M {machVal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">AIR DENSITY</span>
          <span className="text-xs font-mono-data font-bold text-[#E8EDF7]">
            {airDensityKgM3} <span className="text-[9px] text-[#8A9BBE]">kg/m³</span>
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">DYN PRESS q</span>
          <span className="text-xs font-mono-data font-bold text-[#FFB800]">
            {dynamicPressureKpa} <span className="text-[9px] text-[#8A9BBE]">kPa</span>
          </span>
        </div>
      </div>

      {/* Top Right: Mission & Simulation Clocks */}
      <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1.5 bg-[#0F1729]/85 backdrop-blur-md p-2 rounded border border-[#1A2740] text-right min-w-[140px]">
        <div className="text-[9px] font-mono-data text-[#8A9BBE] border-b border-[#1A2740] pb-0.5 mb-1 uppercase flex items-center justify-between">
          <Gauge className="w-2.5 h-2.5 text-[#00E87A]" />
          <span>SIMULATION CLOCK</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">MISSION TIME</span>
          <span className="text-xs font-mono-data font-bold text-[#00A8FF]">02:15:30</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">SIM RUNTIME</span>
          <span className="text-xs font-mono-data font-bold text-[#00E87A]">
            {formatSimClock(simTimeMs)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">SIM TICKS</span>
          <span className="text-xs font-mono-data font-bold text-[#8A9BBE]">
            {tickCount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9.5px] font-sans-ui text-[#8A9BBE] uppercase">SIM SPEED</span>
          <span className="text-xs font-mono-data font-bold text-[#FFB800]">
            {simSpeed.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Center Pitch Ladder Reticle Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
        <div className="w-32 h-32 border border-[#00A8FF] rounded-full flex items-center justify-center relative">
          <div className="w-2 h-2 bg-[#00A8FF] rounded-full" />
          <div className="absolute w-full h-[1px] bg-[#00A8FF]" />
          <div className="absolute h-full w-[1px] bg-[#00A8FF]" />
        </div>
      </div>

      {/* Bottom Left: Interactive Camera Preset Selector */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center space-x-1 bg-[#0F1729]/90 backdrop-blur-md p-1 rounded border border-[#1A2740]">
        <span className="text-[9px] font-mono-data text-[#8A9BBE] px-1 uppercase">CAM:</span>
        {(['ISO', 'TOP', 'SIDE', 'ENGINE_XRAY', 'BATTERY_XRAY'] as CameraPreset[]).map((preset) => (
          <button
            key={preset}
            onClick={() => setCameraPreset(preset)}
            className={`px-1.5 py-0.5 text-[9.5px] font-mono-data rounded border transition-all ${
              cameraPreset === preset
                ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF] font-bold'
                : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE] hover:text-white'
            }`}
          >
            {preset.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bottom Right: Layer Toggles & Simulation Speed Control Strip */}
      <div className="absolute bottom-2 right-2 z-10 flex items-center space-x-1.5 bg-[#0F1729]/90 backdrop-blur-md p-1.5 rounded border border-[#1A2740]">
        {/* Play / Pause Toggle */}
        <button
          onClick={() => setIsSimRunning((prev) => !prev)}
          className={`p-1 rounded border text-[10px] font-mono-data flex items-center space-x-1 ${
            isSimRunning
              ? 'bg-[#00E87A]/20 border-[#00E87A]/50 text-[#00E87A]'
              : 'bg-[#FF3B30]/20 border-[#FF3B30]/50 text-[#FF3B30]'
          }`}
        >
          {isSimRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        {/* Speed Multiplier Options */}
        {[0.5, 1.0, 2.0, 5.0].map((s) => (
          <button
            key={s}
            onClick={() => setSimSpeed(s)}
            className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded border ${
              simSpeed === s
                ? 'bg-[#00F5E4]/20 border-[#00F5E4] text-[#00F5E4] font-bold'
                : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE]'
            }`}
          >
            {s}x
          </button>
        ))}

        <div className="w-[1px] h-4 bg-[#1A2740] mx-0.5" />

        {/* Hull Toggle */}
        <button
          onClick={() => setShowHull((prev) => !prev)}
          className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded border ${
            showHull ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF]' : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE]'
          }`}
          title="Toggle Airframe Semi-Transparent Hull"
        >
          HULL
        </button>

        {/* Power Flow Animation Toggle */}
        <button
          onClick={() => setShowFlows((prev) => !prev)}
          className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded border ${
            showFlows ? 'bg-[#00E87A]/20 border-[#00E87A] text-[#00E87A]' : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE]'
          }`}
          title="Toggle Power Flow Vectors"
        >
          FLOWS
        </button>
      </div>
    </>
  );
};
