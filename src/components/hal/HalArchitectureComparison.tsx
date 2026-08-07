import React, { useState } from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { HalProject } from '../../data/halProjectsData';
import { Zap, ArrowRight, ArrowRightLeft, Cpu, Flame, Fuel, Activity, CheckCircle2 } from 'lucide-react';

interface HalArchitectureComparisonProps {
  project: HalProject;
}

export type ArchitectureType = 'PARALLEL_HYBRID' | 'SERIES_HYBRID' | 'TURBO_ELECTRIC' | 'ALL_ELECTRIC';

export const HalArchitectureComparison: React.FC<HalArchitectureComparisonProps> = ({ project }) => {
  const [activeArchType, setActiveArchType] = useState<ArchitectureType>('PARALLEL_HYBRID');

  // Dynamic calculations based on selected architecture type
  const getArchDetails = () => {
    switch (activeArchType) {
      case 'PARALLEL_HYBRID':
        return {
          title: 'Parallel Gas Turbine + Electric Boost',
          gasSharePct: 100 - project.recommendedHybridSplitPct,
          elecSharePct: project.recommendedHybridSplitPct,
          sfcDeltaPct: -project.adaptationBenefits.sfcReductionPct,
          enduranceDeltaPct: project.adaptationBenefits.enduranceGainPct,
          thermalMarginK: '+140 K',
          weightImpactKg: `+${project.recommendedBatteryKg} kg`,
          description: 'Both gas turbine shaft and electric motor directly engage the main gearbox / propulsor for takeoff and sprint.'
        };
      case 'SERIES_HYBRID':
        return {
          title: 'Series Gas-Turbine Generator + Electric Propulsor',
          gasSharePct: 35,
          elecSharePct: 65,
          sfcDeltaPct: -16.5,
          enduranceDeltaPct: 24.0,
          thermalMarginK: '+180 K',
          weightImpactKg: `+${project.recommendedBatteryKg + 60} kg`,
          description: 'Gas turbine drives high-voltage generator to feed energy storage and pure electric drive motors.'
        };
      case 'TURBO_ELECTRIC':
        return {
          title: 'Turbo-Electric Distributed Propulsion (DEP)',
          gasSharePct: 55,
          elecSharePct: 45,
          sfcDeltaPct: -25.0,
          enduranceDeltaPct: 32.5,
          thermalMarginK: '+110 K',
          weightImpactKg: `+${project.recommendedBatteryKg - 20} kg`,
          description: 'Gas turbine acts as primary turbogenerator supplying multi-pod distributed electric thrusters.'
        };
      case 'ALL_ELECTRIC':
        return {
          title: 'Full Solid-State Battery Electric System',
          gasSharePct: 0,
          elecSharePct: 100,
          sfcDeltaPct: -100.0, // Zero fuel
          enduranceDeltaPct: -45.0, // Limited by energy density
          thermalMarginK: '+220 K',
          weightImpactKg: `+${Math.round(project.recommendedBatteryKg * 2.4)} kg`,
          description: 'Zero direct carbon emissions. Pure electric propulsion optimized for low-altitude tactical acoustic stealth.'
        };
    }
  };

  const archDetails = getArchDetails();

  return (
    <CornerReticle id="hal-architecture-comparison-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>PROPULSION ARCHITECTURE COMPARISON ENGINE</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              BASELINE vs RETROFIT HYBRID POWER SPLIT
            </span>
          </div>
        </div>

        {/* Architecture Mode Selector */}
        <div className="flex items-center space-x-1 bg-[#172236] p-0.5 rounded border border-[#1A2740] text-[8.5px] font-mono-data">
          {[
            { id: 'PARALLEL_HYBRID', label: 'PARALLEL' },
            { id: 'SERIES_HYBRID', label: 'SERIES' },
            { id: 'TURBO_ELECTRIC', label: 'TURBO-ELEC' },
            { id: 'ALL_ELECTRIC', label: 'ALL-ELEC' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveArchType(mode.id as ArchitectureType)}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeArchType === mode.id
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold'
                  : 'text-[#8A9BBE] hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Dual Cards */}
      <div className="grid grid-cols-2 gap-2 mb-2 flex-shrink-0">
        {/* Baseline Architecture Card */}
        <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] font-mono-data text-[9px] space-y-1.5">
          <div className="flex justify-between items-center border-b border-[#1A2740] pb-1">
            <span className="text-[#8A9BBE] font-bold uppercase flex items-center space-x-1">
              <Fuel className="w-3 h-3 text-[#FFB800]" />
              <span>BASELINE ARCHITECTURE</span>
            </span>
            <span className="bg-[#FFB800]/10 text-[#FFB800] px-1.5 py-0.2 rounded text-[8px] font-bold">
              CONVENTIONAL
            </span>
          </div>
          <div className="font-bold text-white text-xs">{project.currentArchitecture}</div>
          <div className="grid grid-cols-2 gap-1 text-[8.5px] text-[#8A9BBE]">
            <div>POWER: <strong className="text-white">{project.baselinePowerKw} kW</strong></div>
            <div>SFC: <strong className="text-[#FFB800]">{project.baselineSfcGkwh} g/kWh</strong></div>
            <div>ENDURANCE: <strong className="text-white">{project.baselineEnduranceHr} hr</strong></div>
            <div>RANGE: <strong className="text-white">{project.baselineRangeKm} km</strong></div>
          </div>
        </div>

        {/* Proposed Hybrid Architecture Card */}
        <div className="bg-[#111A2E] p-2.5 rounded border border-[#00A8FF]/40 font-mono-data text-[9px] space-y-1.5">
          <div className="flex justify-between items-center border-b border-[#1A2740] pb-1">
            <span className="text-[#00A8FF] font-bold uppercase flex items-center space-x-1">
              <Zap className="w-3 h-3 text-[#00E87A]" />
              <span>RETROFIT HYBRID ARCHITECTURE</span>
            </span>
            <span className="bg-[#00E87A]/10 text-[#00E87A] px-1.5 py-0.2 rounded text-[8px] font-bold">
              RETROFIT OPTIMIZED
            </span>
          </div>
          <div className="font-bold text-[#00A8FF] text-xs">{archDetails.title}</div>
          <div className="grid grid-cols-2 gap-1 text-[8.5px] text-[#8A9BBE]">
            <div>GAS SHARE: <strong className="text-white">{archDetails.gasSharePct}%</strong></div>
            <div>ELEC BOOST: <strong className="text-[#00E87A]">{archDetails.elecSharePct}%</strong></div>
            <div>SFC DELTA: <strong className="text-[#00E87A]">{archDetails.sfcDeltaPct}%</strong></div>
            <div>ENDURANCE: <strong className="text-[#00E87A]">+{archDetails.enduranceDeltaPct}%</strong></div>
          </div>
        </div>
      </div>

      {/* Visual Power Split Bar Diagram */}
      <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] mb-2 font-mono-data text-[9px] flex-shrink-0">
        <div className="flex justify-between items-center mb-1 text-[8.5px] text-[#8A9BBE]">
          <span>PROPULSION POWER SOURCE SPLIT RATIO</span>
          <span className="text-white font-bold">
            {archDetails.gasSharePct}% GAS TURBINE | {archDetails.elecSharePct}% ELECTRIC
          </span>
        </div>
        <div className="w-full h-4 bg-[#172236] rounded overflow-hidden flex border border-[#1A2740]">
          <div 
            style={{ width: `${archDetails.gasSharePct}%` }} 
            className="bg-gradient-to-r from-[#FFB800] to-[#FF6B35] h-full flex items-center justify-center text-[7.5px] font-bold text-[#0A0F1E] transition-all duration-300"
          >
            {archDetails.gasSharePct > 15 && `GAS (${archDetails.gasSharePct}%)`}
          </div>
          <div 
            style={{ width: `${archDetails.elecSharePct}%` }} 
            className="bg-gradient-to-r from-[#00A8FF] to-[#00E87A] h-full flex items-center justify-center text-[7.5px] font-bold text-[#0A0F1E] transition-all duration-300"
          >
            {archDetails.elecSharePct > 15 && `ELECTRIC ASSIST (${archDetails.elecSharePct}%)`}
          </div>
        </div>
      </div>

      {/* Description & Impact Summary */}
      <div className="bg-[#172236]/80 p-2 rounded border border-[#1A2740] text-[8.5px] font-mono-data text-[#8A9BBE] space-y-1">
        <div className="text-[#00A8FF] font-bold flex items-center space-x-1">
          <Activity className="w-3 h-3 text-[#00A8FF]" />
          <span>ARCHITECTURAL FEASIBILITY OVERVIEW</span>
        </div>
        <p className="line-clamp-2">{archDetails.description}</p>
        <div className="flex justify-between pt-1 border-t border-[#1A2740] text-[8px]">
          <span>THERMAL MARGIN: <strong className="text-[#00E87A]">{archDetails.thermalMarginK}</strong></span>
          <span>WEIGHT IMPACT: <strong className="text-white">{archDetails.weightImpactKg}</strong></span>
          <span>BUS VOLTAGE: <strong className="text-[#00A8FF]">{project.electricalVoltageV}V DC</strong></span>
        </div>
      </div>
    </CornerReticle>
  );
};
