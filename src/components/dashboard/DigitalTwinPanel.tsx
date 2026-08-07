import React, { useState, useEffect } from 'react';
import { Crosshair, Maximize2, X, Info, Flame, Disc, Cpu, BatteryCharging, Zap } from 'lucide-react';
import { CornerReticle } from '../common/CornerReticle';
import { useGarunStore } from '../../store/useGarunStore';
import { GarunThreeScene } from './GarunThreeScene';
import { TelemetryHUD } from './TelemetryHUD';
import { CameraPreset, useSubsystemHighlight } from './SubsystemHighlighter';

export const DigitalTwinPanel: React.FC = () => {
  const { activeTelemetryFrame } = useGarunStore();

  const [isSimRunning, setIsSimRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('ISO');
  const [selectedCompId, setSelectedCompId] = useState<string>('turboshaft');

  const [showHull, setShowHull] = useState(true);
  const [showFlows, setShowFlows] = useState(true);
  const [showHUD] = useState(true);
  const [showGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [simTimeMs, setSimTimeMs] = useState(0);
  const [tickCount, setTickCount] = useState(2841920);

  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setSimTimeMs((prev) => prev + Math.round(100 * simSpeed));
      setTickCount((prev) => prev + Math.round(10 * simSpeed));
    }, 100);
    return () => clearInterval(interval);
  }, [isSimRunning, simSpeed]);

  const { activeComp } = useSubsystemHighlight(selectedCompId);
  const batterySocPct = activeTelemetryFrame?.battery?.socPct || activeTelemetryFrame?.batterySocPct || 78.4;

  return (
    <CornerReticle className={`h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] relative ${isFullscreen ? 'fixed inset-0 z-50 p-6 bg-[#0A0F1E]' : ''}`}>
      {/* 1. SIMULATION HEADER BANNER */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 z-10 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-2">
              <span>DIGITAL TWIN – REAL-TIME AEROSPACE SIMULATION</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00F5E4] block">HAL-SKUNKWORKS LM-SIM // HYBRID AIRCRAFT VIRTUAL MODEL</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-[#00E87A]/10 border border-[#00E87A]/40 text-[#00E87A] px-2 py-0.5 rounded text-[10px] font-mono-data">
            <span className={`w-1.5 h-1.5 rounded-full bg-[#00E87A] ${isSimRunning ? 'animate-ping' : ''}`} />
            <span className="font-semibold">{isSimRunning ? 'LIVE SIM 100Hz' : 'PAUSED'}</span>
          </div>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] transition-colors" title="Toggle Fullscreen Canvas">
            {isFullscreen ? <X className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. CENTER 3D CANVAS AREA WITH REAL-TIME TELEMETRY OVERLAYS */}
      <div className="relative my-2 flex-1 min-h-[260px] w-full rounded bg-[#0A0F1E] border border-[#1A2740] overflow-hidden">
        <TelemetryHUD showHUD={showHUD} isSimRunning={isSimRunning} setIsSimRunning={setIsSimRunning} simSpeed={simSpeed} setSimSpeed={setSimSpeed} cameraPreset={cameraPreset} setCameraPreset={setCameraPreset} showHull={showHull} setShowHull={setShowHull} showFlows={showFlows} setShowFlows={setShowFlows} simTimeMs={simTimeMs} tickCount={tickCount} />
        <GarunThreeScene cameraPreset={cameraPreset} selectedCompId={selectedCompId} setSelectedCompId={setSelectedCompId} isSimRunning={isSimRunning} simSpeed={simSpeed} showHull={showHull} showFlows={showFlows} showGrid={showGrid} batterySocPct={batterySocPct} />
      </div>

      {/* 3. INSPECTED COMPONENT CAD HUD CALLOUT STRIP */}
      <div className="bg-[#111A2E] border border-[#1A2740] rounded p-2 mb-1 flex items-center justify-between text-xs font-mono-data">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <div className="text-[9.5px] text-[#8A9BBE] uppercase font-sans-ui flex items-center space-x-2">
              <span>INSPECTED SUBSYSTEM:</span>
              <span className="text-[#00F5E4] font-bold font-mono-data">[{activeComp.category}]</span>
            </div>
            <div className="text-xs font-bold text-[#E8EDF7] font-mono-data">{activeComp.title}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[10.5px]">
          <div><span className="text-[#8A9BBE] block text-[9px]">POWER</span><span className="text-[#00E87A] font-bold">{activeComp.powerKw} kW</span></div>
          {activeComp.rpm && <div><span className="text-[#8A9BBE] block text-[9px]">SPEED</span><span className="text-[#00A8FF] font-bold">{activeComp.rpm.toLocaleString()} RPM</span></div>}
          {activeComp.voltageV && <div><span className="text-[#8A9BBE] block text-[9px]">BUS VOLTAGE</span><span className="text-[#FFB800] font-bold">{activeComp.voltageV} V</span></div>}
          <div><span className="text-[#8A9BBE] block text-[9px]">TEMP</span><span className="text-[#E8EDF7] font-bold">{activeComp.tempC} °C</span></div>
          <div><span className="text-[#8A9BBE] block text-[9px]">EFFICIENCY</span><span className="text-[#00E87A] font-bold">{activeComp.efficiencyPct}%</span></div>
        </div>
      </div>

      {/* 4. COMPONENT CHAIN CARDS */}
      <div className="pt-1.5 border-t border-[#1A2740] flex-shrink-0">
        <div className="grid grid-cols-5 gap-1.5 text-center">
          <button onClick={() => { setSelectedCompId('turboshaft'); setCameraPreset('ENGINE_XRAY'); }} className={`p-1.5 rounded border transition-all text-left flex flex-col justify-between ${selectedCompId === 'turboshaft' ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-[#E8EDF7]' : 'bg-[#172236] border-[#1A2740] hover:border-[#1F2D45] text-[#8A9BBE]'}`}>
            <div className="flex items-center justify-between"><span className="text-[8.5px] font-bold font-sans-ui uppercase text-[#8A9BBE] truncate">TURBOSHAFT</span><Flame className="w-3 h-3 text-[#FF6B35]" /></div>
            <div className="my-1"><span className="text-xs font-mono-data font-bold text-[#00E87A]">{activeTelemetryFrame?.engine?.powerKw || activeTelemetryFrame?.icePowerKw || 110} kW</span></div>
            <div className="text-[8.5px] font-mono-data text-[#8A9BBE]">RPM: <span className="text-[#E8EDF7]">{activeTelemetryFrame?.engine?.rpm || activeTelemetryFrame?.iceRpm || 5450}</span></div>
          </button>

          <button onClick={() => { setSelectedCompId('generator'); setCameraPreset('ENGINE_XRAY'); }} className={`p-1.5 rounded border transition-all text-left flex flex-col justify-between ${selectedCompId === 'generator' ? 'bg-[#00E87A]/15 border-[#00E87A] text-[#E8EDF7]' : 'bg-[#172236] border-[#1A2740] hover:border-[#1F2D45] text-[#8A9BBE]'}`}>
            <div className="flex items-center justify-between"><span className="text-[8.5px] font-bold font-sans-ui uppercase text-[#8A9BBE] truncate">GENERATOR</span><Disc className="w-3 h-3 text-[#00E87A]" /></div>
            <div className="my-1"><span className="text-xs font-mono-data font-bold text-[#00E87A]">58.1 kW</span></div>
            <div className="text-[8.5px] font-mono-data text-[#8A9BBE]">Eff: <span className="text-[#E8EDF7]">96.4%</span></div>
          </button>

          <button onClick={() => { setSelectedCompId('power_bus'); setCameraPreset('ISO'); }} className={`p-1.5 rounded border transition-all text-left flex flex-col justify-between ${selectedCompId === 'power_bus' ? 'bg-[#00F5E4]/15 border-[#00F5E4] text-[#E8EDF7]' : 'bg-[#172236] border-[#1A2740] hover:border-[#1F2D45] text-[#8A9BBE]'}`}>
            <div className="flex items-center justify-between"><span className="text-[8.5px] font-bold font-sans-ui uppercase text-[#8A9BBE] truncate">POWER BUS</span><Cpu className="w-3 h-3 text-[#00F5E4]" /></div>
            <div className="my-1"><span className="text-xs font-mono-data font-bold text-[#00E87A]">620 V</span></div>
            <div className="text-[8.5px] font-mono-data text-[#8A9BBE]">Eff: <span className="text-[#00E87A]">97.8%</span></div>
          </button>

          <button onClick={() => { setSelectedCompId('battery'); setCameraPreset('BATTERY_XRAY'); }} className={`p-1.5 rounded border transition-all text-left flex flex-col justify-between ${selectedCompId === 'battery' ? 'bg-[#00E87A]/15 border-[#00E87A] text-[#E8EDF7]' : 'bg-[#172236] border-[#1A2740] hover:border-[#1F2D45] text-[#8A9BBE]'}`}>
            <div className="flex items-center justify-between"><span className="text-[8.5px] font-bold font-sans-ui uppercase text-[#8A9BBE] truncate">BATTERY</span><BatteryCharging className="w-3 h-3 text-[#00E87A]" /></div>
            <div className="my-1"><span className="text-xs font-mono-data font-bold text-[#00E87A]">{batterySocPct}% SOC</span></div>
            <div className="text-[8.5px] font-mono-data text-[#8A9BBE]">Temp: <span className="text-[#00E87A]">{activeTelemetryFrame?.battery?.cellTempAvgC || activeTelemetryFrame?.batteryTempC || 38.2}°C</span></div>
          </button>

          <button onClick={() => { setSelectedCompId('motor'); setCameraPreset('ISO'); }} className={`p-1.5 rounded border transition-all text-left flex flex-col justify-between ${selectedCompId === 'motor' ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-[#E8EDF7]' : 'bg-[#172236] border-[#1A2740] hover:border-[#1F2D45] text-[#8A9BBE]'}`}>
            <div className="flex items-center justify-between"><span className="text-[8.5px] font-bold font-sans-ui uppercase text-[#8A9BBE] truncate">E-MOTOR</span><Zap className="w-3 h-3 text-[#00A8FF]" /></div>
            <div className="my-1"><span className="text-xs font-mono-data font-bold text-[#00A8FF]">88.0 kW</span></div>
            <div className="text-[8.5px] font-mono-data text-[#8A9BBE]">RPM: <span className="text-[#E8EDF7]">2,400</span></div>
          </button>
        </div>

        {/* 5. POWER FLOW LEGEND */}
        <div className="flex items-center justify-center space-x-6 text-[9px] font-mono-data text-[#8A9BBE] mt-1.5">
          <div className="flex items-center space-x-1.5"><span className="w-3.5 h-1 rounded-full bg-[#FF6B35]" /><span>Mechanical Power Flow</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-3.5 h-1 rounded-full bg-[#00E87A]" /><span>Electrical Power Flow</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-3.5 h-1 rounded-full bg-[#00F5E4]" /><span>Battery Energy Vector</span></div>
        </div>
      </div>
    </CornerReticle>
  );
};
