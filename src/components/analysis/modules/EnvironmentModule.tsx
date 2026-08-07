import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { Cloud } from 'lucide-react';

export const EnvironmentModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={10}
      title="Environmental & ISA Atmospheric Analysis"
      category="POWER & ENERGY"
      equationBadge="ISA Model"
      description="International Standard Atmosphere modeling, air density lapse rate, temperature & altitude derating"
      inputsConsumed={['Cruise Altitude (3000 m)', 'Ambient Temp (+15 °C)', 'ISA Delta (0 K)']}
      physicsModel="ISA Barometric Formula: ρ(h) = ρ0 · (1 - L·h/T0)^(g·M/(R·L)) → ρ_3000 = 0.909 kg/m³"
      outputsGenerated={['Density Ratio σ = 0.742', 'Engine Altitude Derating (81.7%)', 'True Airspeed Correction TAS/EAS']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-[#00A8FF]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              ATMOSPHERIC METRICS AT 3000 M ALTITUDE
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00A8FF] px-2 py-0.5 rounded border border-[#1F2D45]">
            ρ = 0.909 kg/m³
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-mono-data">
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Air Density & Ratio:</span>
            <div className="text-lg font-bold text-[#00A8FF] mt-1">0.909 kg/m³ (σ = 0.742)</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">ICE Altitude Available Power:</span>
            <div className="text-lg font-bold text-[#FFB800] mt-1">49.0 kW (from 60.0 kW)</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Ambient Pressure & Temp:</span>
            <div className="text-lg font-bold text-[#E8EDF7] mt-1">70.1 kPa (-4.5 °C ISA)</div>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
