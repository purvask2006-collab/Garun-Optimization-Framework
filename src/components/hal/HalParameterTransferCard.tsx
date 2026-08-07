import React, { useState } from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { HalProject } from '../../data/halProjectsData';
import { useGarunStore } from '../../store/useGarunStore';
import { Sliders, CheckCircle2, RefreshCw, Send, ArrowRight, Battery, Gauge, Zap } from 'lucide-react';

interface HalParameterTransferCardProps {
  project: HalProject;
}

export const HalParameterTransferCard: React.FC<HalParameterTransferCardProps> = ({ project }) => {
  const { updateSimulationParams, setActiveModule } = useGarunStore();

  const [batteryMassKg, setBatteryMassKg] = useState<number>(project.recommendedBatteryKg);
  const [hybridRatioPct, setHybridRatioPct] = useState<number>(project.recommendedHybridSplitPct);
  const [cruiseAltM, setCruiseAltM] = useState<number>(project.keySpecs.serviceCeilingM * 0.7);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isTransferredSuccess, setIsTransferredSuccess] = useState<boolean>(false);

  // Transfer parameters into simulation store
  const handleTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      // Calculate capacity kwh based on battery mass (~0.25 kWh per kg for Li-Sulfur)
      const calculatedKwh = Number((batteryMassKg * 0.25).toFixed(1));

      updateSimulationParams({
        batteryCapacityKwh: calculatedKwh,
        hybridRatioCruisePct: hybridRatioPct,
        cruiseAltitudeM: cruiseAltM,
        payloadKg: project.adaptationBenefits.payloadIncreaseKg + 100
      });

      setIsTransferring(false);
      setIsTransferredSuccess(true);
      setTimeout(() => setIsTransferredSuccess(false), 3000);
    }, 500);
  };

  const handleApplyPreset = (preset: 'ENDURANCE' | 'EFFICIENCY' | 'PAYLOAD') => {
    if (preset === 'ENDURANCE') {
      setBatteryMassKg(Math.round(project.recommendedBatteryKg * 1.25));
      setHybridRatioPct(45);
    } else if (preset === 'EFFICIENCY') {
      setBatteryMassKg(project.recommendedBatteryKg);
      setHybridRatioPct(35);
    } else if (preset === 'PAYLOAD') {
      setBatteryMassKg(Math.round(project.recommendedBatteryKg * 0.75));
      setHybridRatioPct(25);
    }
  };

  return (
    <CornerReticle id="hal-parameter-transfer-card" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Send className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>PARAMETER TRANSFER & SIMULATION SYNC</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              APPLY OPTIMIZATION DIRECTLY TO AIRCRAFT SIMULATOR
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-1 bg-[#172236] p-0.5 rounded border border-[#1A2740] text-[8px] font-mono-data">
          <button
            onClick={() => handleApplyPreset('ENDURANCE')}
            className="px-1.5 py-0.5 rounded text-[#8A9BBE] hover:text-white hover:bg-[#111A2E]"
          >
            MAX ENDURANCE
          </button>
          <button
            onClick={() => handleApplyPreset('EFFICIENCY')}
            className="px-1.5 py-0.5 rounded text-[#8A9BBE] hover:text-white hover:bg-[#111A2E]"
          >
            MIN SFC
          </button>
          <button
            onClick={() => handleApplyPreset('PAYLOAD')}
            className="px-1.5 py-0.5 rounded text-[#8A9BBE] hover:text-white hover:bg-[#111A2E]"
          >
            MAX PAYLOAD
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-2.5 mb-3 flex-shrink-0 font-mono-data text-[9px]">
        {/* Battery Mass Slider */}
        <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Battery className="w-3 h-3 text-[#00E87A]" />
              <span>BATTERY PACK MASS</span>
            </span>
            <span className="font-bold text-[#00E87A]">
              {batteryMassKg} kg <span className="text-[8px] text-[#8A9BBE]">({(batteryMassKg * 0.25).toFixed(1)} kWh)</span>
            </span>
          </div>
          <input
            type="range"
            min={Math.round(project.recommendedBatteryKg * 0.4)}
            max={Math.round(project.recommendedBatteryKg * 1.8)}
            value={batteryMassKg}
            onChange={(e) => setBatteryMassKg(Number(e.target.value))}
            className="w-full accent-[#00E87A] h-1.5 bg-[#172236] rounded cursor-pointer"
          />
        </div>

        {/* Hybrid Split Ratio Slider */}
        <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Zap className="w-3 h-3 text-[#00A8FF]" />
              <span>HYBRID ELECTRIC POWER SPLIT</span>
            </span>
            <span className="font-bold text-[#00A8FF]">{hybridRatioPct}% ELECTRIC ASSIST</span>
          </div>
          <input
            type="range"
            min={10}
            max={75}
            value={hybridRatioPct}
            onChange={(e) => setHybridRatioPct(Number(e.target.value))}
            className="w-full accent-[#00A8FF] h-1.5 bg-[#172236] rounded cursor-pointer"
          />
        </div>

        {/* Operating Altitude Slider */}
        <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Gauge className="w-3 h-3 text-[#FFB800]" />
              <span>CRUISE ALTITUDE METERS</span>
            </span>
            <span className="font-bold text-white">{cruiseAltM.toLocaleString()} m</span>
          </div>
          <input
            type="range"
            min={2000}
            max={project.keySpecs.serviceCeilingM}
            step={250}
            value={cruiseAltM}
            onChange={(e) => setCruiseAltM(Number(e.target.value))}
            className="w-full accent-[#FFB800] h-1.5 bg-[#172236] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Transfer Action Controls */}
      <div className="mt-auto space-y-1.5">
        <button
          onClick={handleTransfer}
          disabled={isTransferring}
          className={`w-full text-xs font-bold font-sans-ui uppercase py-2.5 rounded transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
            isTransferredSuccess
              ? 'bg-[#00E87A] text-[#0A0F1E]'
              : 'bg-[#00A8FF] hover:bg-[#0088CC] text-[#0A0F1E] shadow-[#00A8FF]/20'
          }`}
        >
          {isTransferring ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[#0A0F1E]" />
          ) : isTransferredSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>PARAMETERS SYNCED TO SIMULATOR!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>TRANSFER OPTIMIZATION TO {project.id}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex justify-between items-center text-[8px] font-mono-data text-[#8A9BBE] px-1">
          <span>TARGET PLATFORM: <strong>{project.name}</strong></span>
          <button 
            onClick={() => setActiveModule('simulation')}
            className="text-[#00A8FF] hover:underline"
          >
            GO TO SIMULATOR &rarr;
          </button>
        </div>
      </div>
    </CornerReticle>
  );
};
