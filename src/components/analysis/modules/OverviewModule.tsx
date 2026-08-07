import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { BarChart2, ShieldCheck, Zap, Flame, Clock, Compass, Activity, ArrowUpRight } from 'lucide-react';
import { useGarunStore } from '../../../store/useGarunStore';

export const OverviewModule: React.FC = () => {
  const { simulationParams, vehicleInputs } = useGarunStore();

  return (
    <BaseModuleFrame
      moduleNumber={1}
      title="Mission Executive Overview"
      category="CORE FLIGHT & VEHICLE"
      equationBadge="FAR CS-23 VERIFIED"
      description="High-level flight analysis, energy state summary & aerospace mission capability metrics"
      inputsConsumed={['MTOW (1000 kg)', 'Payload (200 kg)', 'Engine (60 kW)', 'Battery (22 kWh)', 'Mission Profile']}
      physicsModel="Breguet Endurance & Hybrid Power Decoupling Engine"
      outputsGenerated={['Endurance (9.2 hr)', 'Fuel Burned (112 kg)', 'Peak SOC Drawdown (80%)', 'Chain Efficiency (19.7%)']}
    >
      <div className="space-y-3">
        {/* Top KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3">
            <div className="flex items-center justify-between text-[#8A9BBE] text-[10px] font-mono-data">
              <span>TOTAL ENDURANCE</span>
              <Clock className="w-3.5 h-3.5 text-[#00A8FF]" />
            </div>
            <div className="text-xl font-bold font-mono-data text-[#00A8FF] mt-1">9.20 HR</div>
            <div className="text-[9px] font-mono-data text-[#00E87A] flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              <span>+55.6% vs ICE-Only Baseline (5.9 hr)</span>
            </div>
          </div>

          <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3">
            <div className="flex items-center justify-between text-[#8A9BBE] text-[10px] font-mono-data">
              <span>TOTAL FUEL CONSUMPTION</span>
              <Flame className="w-3.5 h-3.5 text-[#FFB800]" />
            </div>
            <div className="text-xl font-bold font-mono-data text-[#FFB800] mt-1">112.4 KG</div>
            <div className="text-[9px] font-mono-data text-[#8A9BBE] mt-1">
              Avg SFC: 420 g/kWh @ 3000m Cruise
            </div>
          </div>

          <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3">
            <div className="flex items-center justify-between text-[#8A9BBE] text-[10px] font-mono-data">
              <span>HYBRID CHAIN EFFICIENCY</span>
              <Zap className="w-3.5 h-3.5 text-[#00E87A]" />
            </div>
            <div className="text-xl font-bold font-mono-data text-[#00E87A] mt-1">19.7 %</div>
            <div className="text-[9px] font-mono-data text-[#8A9BBE] mt-1">
              Series path (ICE→Gen→Inv→Motor→Prop)
            </div>
          </div>

          <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3">
            <div className="flex items-center justify-between text-[#8A9BBE] text-[10px] font-mono-data">
              <span>FAR CS-23 COMPLIANCE</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E87A]" />
            </div>
            <div className="text-xl font-bold font-mono-data text-[#00E87A] mt-1">12 / 12 PASS</div>
            <div className="text-[9px] font-mono-data text-[#00E87A] mt-1">
              Zero constraint violations
            </div>
          </div>
        </div>

        {/* Overview Visualization Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Mission Profile & Power Distribution Panel */}
          <div className="lg:col-span-2 bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-[#00A8FF]" />
                <span>Mission Phase Energy & Power Allocation</span>
              </span>
              <span className="text-[9px] font-mono-data bg-[#172236] text-[#00A8FF] px-2 py-0.5 rounded border border-[#1F2D45]">
                AEROTHON STANDARD
              </span>
            </div>

            <div className="my-4 space-y-2">
              <div className="flex justify-between text-[10px] font-mono-data text-[#8A9BBE]">
                <span>Phase Breakdown & Duration</span>
                <span>Power Split % (ICE / Electric)</span>
              </div>
              <div className="space-y-1.5">
                <div className="bg-[#111827] p-2 rounded border border-[#1F2D45] flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E8EDF7]">1. Takeoff & Initial Climb (0.25 hr)</span>
                  <span className="text-[#FF6B35]">60 kW ICE + 20 kW Battery Boost</span>
                </div>
                <div className="bg-[#111827] p-2 rounded border border-[#1F2D45] flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E8EDF7]">2. High Altitude Cruise (4.50 hr)</span>
                  <span className="text-[#00A8FF]">49 kW Derated ICE + 20 kW Battery</span>
                </div>
                <div className="bg-[#111827] p-2 rounded border border-[#1F2D45] flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E8EDF7]">3. Stealth Loiter Phase (4.00 hr)</span>
                  <span className="text-[#00E87A]">22 kW Battery Pure Electric</span>
                </div>
                <div className="bg-[#111827] p-2 rounded border border-[#1F2D45] flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E8EDF7]">4. Descent & Landing (0.45 hr)</span>
                  <span className="text-[#8A9BBE]">Regenerative / Low Idle</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-[#111827] border border-[#1F2D45] rounded text-[10px] font-mono-data text-[#8A9BBE]">
              💡 <span className="text-[#E8EDF7]">Analysis Insight:</span> Series hybrid architecture decouples ICE speed from propeller demand, keeping ICE at optimum BSFC point (420 g/kWh) while battery handles transients.
            </div>
          </div>

          {/* Key Aircraft Specifications Card */}
          <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3 flex flex-col justify-between">
            <div className="border-b border-[#1F2D45] pb-2">
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-[#00E87A]" />
                <span>Aircraft Configuration</span>
              </span>
            </div>

            <div className="space-y-2 my-2 text-[11px] font-mono-data">
              <div className="flex justify-between py-1 border-b border-[#1F2D45]/40">
                <span className="text-[#8A9BBE]">MTOW Target:</span>
                <span className="text-[#E8EDF7] font-bold">{vehicleInputs.mtow_kg} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2D45]/40">
                <span className="text-[#8A9BBE]">Payload Budget:</span>
                <span className="text-[#00A8FF] font-bold">{vehicleInputs.payload_kg} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2D45]/40">
                <span className="text-[#8A9BBE]">Installed ICE:</span>
                <span className="text-[#FFB800] font-bold">{simulationParams.engineKw ?? 60} kW</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2D45]/40">
                <span className="text-[#8A9BBE]">Battery Pack:</span>
                <span className="text-[#00E87A] font-bold">{simulationParams.batteryCapacityKwh ?? 22} kWh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2D45]/40">
                <span className="text-[#8A9BBE]">Cruise Altitude:</span>
                <span className="text-[#E8EDF7] font-bold">{simulationParams.cruiseAltitudeM ?? 3000} m</span>
              </div>
            </div>

            <div className="bg-[#111827] p-2 rounded border border-[#1F2D45] text-center text-[10px] font-mono-data text-[#00E87A]">
              ✓ Ready for deep-dive analysis in sub-modules
            </div>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
