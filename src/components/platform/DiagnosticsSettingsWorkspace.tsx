import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  SlidersHorizontal,
  Server,
  Database
} from 'lucide-react';
import { CornerReticle } from '../common/CornerReticle';
import { useGarunStore } from '../../store/useGarunStore';

export const DiagnosticsSettingsWorkspace: React.FC = () => {
  const { systemMetrics, simulationParams, updateSimulationParams } = useGarunStore();
  const [hilMode, setHilMode] = useState<'REALTIME' | 'ACCELERATED' | 'HARDWARE_LOOP'>('REALTIME');
  const [cs23Level, setCs23Level] = useState<'CLASS_I' | 'CLASS_II' | 'CLASS_III'>('CLASS_I');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(true);

  const handleRecalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrated(true);
    }, 1200);
  };

  return (
    <div className="flex-1 bg-[#0A0F1E] p-4 overflow-y-auto space-y-4 font-mono-data select-none">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00A8FF]/10 border border-[#00A8FF]/40 text-[#00A8FF] rounded">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              SYSTEM DIAGNOSTICS & HARDWARE CONFIGURATION
            </h1>
            <p className="text-xs text-[#8A9BBE]">
              AERDC HINDUSTAN AERONAUTICS LIMITED // HIL BUS & CERTIFICATION PARAMETERS
            </p>
          </div>
        </div>

        <button
          onClick={handleRecalibrate}
          disabled={isCalibrating}
          className="px-3 py-1.5 bg-[#00A8FF] text-[#0A0F1E] font-bold rounded text-xs flex items-center space-x-2 hover:bg-[#33B8FF] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
          <span>{isCalibrating ? 'RECALIBRATING HIL...' : 'RECALIBRATE BUS SENSORS'}</span>
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: HIL Interface & Bus Telemetry */}
        <CornerReticle className="bg-[#0F1729] p-4 space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2 text-[#00A8FF]">
            <Server className="w-4 h-4" />
            <h2 className="font-bold font-sans-ui text-sm text-[#E8EDF7]">HIL BUS & INTERFACE</h2>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">CPU Simulation Load:</span>
              <span className="text-[#00E87A] font-bold">{systemMetrics.cpuLoadPct}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">HIL Latency:</span>
              <span className="text-[#00A8FF] font-bold">{systemMetrics.hilLatencyMs} ms</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">DC Power Bus Voltage:</span>
              <span className="text-[#FFB800] font-bold">{systemMetrics.busVoltageV} V</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">Bus Peak Current:</span>
              <span className="text-[#E8EDF7] font-bold">{systemMetrics.busCurrentA} A</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] text-[#8A9BBE] block uppercase mb-1">Execution Mode</label>
            <div className="grid grid-cols-3 gap-1">
              {(['REALTIME', 'ACCELERATED', 'HARDWARE_LOOP'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setHilMode(mode)}
                  className={`py-1 text-[9px] rounded font-bold transition-all border ${
                    hilMode === mode
                      ? 'bg-[#00A8FF] text-[#0A0F1E] border-[#00A8FF]'
                      : 'bg-[#111A2E] text-[#8A9BBE] border-[#1A2740] hover:text-white'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </CornerReticle>

        {/* Card 2: CS-23 Certification Standard */}
        <CornerReticle className="bg-[#0F1729] p-4 space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2 text-[#00E87A]">
            <ShieldCheck className="w-4 h-4" />
            <h2 className="font-bold font-sans-ui text-sm text-[#E8EDF7]">CS-23 AIRWORTHINESS</h2>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">Compliance Status:</span>
              <span className="text-[#00E87A] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CS-23 PASS</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">Single Engine Reserve:</span>
              <span className="text-[#00A8FF] font-bold">45 Min Loiter</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">Thermal Margin Guard:</span>
              <span className="text-[#00E87A] font-bold">+18.2 °C</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A2740]/50">
              <span className="text-[#8A9BBE]">Peukert Battery Floor:</span>
              <span className="text-[#E8EDF7] font-bold">20.0% SOC</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] text-[#8A9BBE] block uppercase mb-1">CS-23 Aircraft Class</label>
            <div className="grid grid-cols-3 gap-1">
              {(['CLASS_I', 'CLASS_II', 'CLASS_III'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setCs23Level(cls)}
                  className={`py-1 text-[9px] rounded font-bold transition-all border ${
                    cs23Level === cls
                      ? 'bg-[#00E87A] text-[#0A0F1E] border-[#00E87A]'
                      : 'bg-[#111A2E] text-[#8A9BBE] border-[#1A2740] hover:text-white'
                  }`}
                >
                  {cls.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </CornerReticle>

        {/* Card 3: Simulation Baseline Parameters */}
        <CornerReticle className="bg-[#0F1729] p-4 space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2 text-[#FFB800]">
            <SlidersHorizontal className="w-4 h-4" />
            <h2 className="font-bold font-sans-ui text-sm text-[#E8EDF7]">DEFAULT CALIBRATION</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[#8A9BBE] mb-1">
                <span>ICE Target Speed</span>
                <span className="text-[#FFB800] font-bold">{simulationParams.iceRpmTarget} RPM</span>
              </div>
              <input
                type="range"
                min="3000"
                max="6000"
                step="100"
                value={simulationParams.iceRpmTarget}
                onChange={(e) => updateSimulationParams({ iceRpmTarget: parseInt(e.target.value) })}
                className="w-full accent-[#FFB800]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#8A9BBE] mb-1">
                <span>Payload Capacity</span>
                <span className="text-[#00A8FF] font-bold">{simulationParams.payloadKg} kg</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={simulationParams.payloadKg}
                onChange={(e) => updateSimulationParams({ payloadKg: parseInt(e.target.value) })}
                className="w-full accent-[#00A8FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#8A9BBE] mb-1">
                <span>Battery Reserve Capacity</span>
                <span className="text-[#00E87A] font-bold">{simulationParams.batteryCapacityKwh} kWh</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={simulationParams.batteryCapacityKwh}
                onChange={(e) => updateSimulationParams({ batteryCapacityKwh: parseInt(e.target.value) })}
                className="w-full accent-[#00E87A]"
              />
            </div>
          </div>
        </CornerReticle>
      </div>
    </div>
  );
};
