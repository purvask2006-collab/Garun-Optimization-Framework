import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { Thermometer } from 'lucide-react';

export const ThermalModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={11}
      title="Thermal Management & Component Limits"
      category="POWER & ENERGY"
      equationBadge="Lumped Thermal Model"
      description="Inverter SiC temperature, electric motor winding thermal rise & battery thermal operating profile"
      inputsConsumed={['Ambient Temperature', 'Component Losses (I²R)', 'Cooling Air Mass Flow']}
      physicsModel="Transient Lumped Thermal Capacitance: C_th · dT/dt = Q_gen - h·A·(T - T_amb)"
      outputsGenerated={['Motor Temp (65 °C)', 'Inverter Temp (52 °C)', 'Battery Temp (38 °C)', 'Thermal Margin (+25 °C)']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-[#FF6B35]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              COMPONENT THERMAL MONITORING
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00E87A] px-2 py-0.5 rounded border border-[#1F2D45]">
            ALL WITHIN SAFE LIMITS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-mono-data">
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Battery Pack Temp:</span>
            <div className="text-lg font-bold text-[#00E87A] mt-1">38.5 °C (Limit: 55 °C)</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Electric Motor Winding:</span>
            <div className="text-lg font-bold text-[#00E87A] mt-1">65.2 °C (Limit: 110 °C)</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">SiC Inverter Junction:</span>
            <div className="text-lg font-bold text-[#00E87A] mt-1">52.0 °C (Limit: 125 °C)</div>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
