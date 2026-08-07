import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell,
  ReferenceLine
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { BarChart2 } from 'lucide-react';

export interface SensitivityItem {
  variable: string;
  impactEndurancePct: number;
  impactFuelPct: number;
  impactMassPct: number;
  impactCostPct: number;
}

export const GARUN_SENSITIVITY_DATA: SensitivityItem[] = [
  { variable: 'Battery Capacity (x1)', impactEndurancePct: 28.5, impactFuelPct: -14.2, impactMassPct: 22.0, impactCostPct: 18.5 },
  { variable: 'Gas Engine Power (x2)', impactEndurancePct: 16.2, impactFuelPct: -22.5, impactMassPct: 15.2, impactCostPct: 12.0 },
  { variable: 'Electric Motor Power (x3)', impactEndurancePct: 12.0, impactFuelPct: -8.0, impactMassPct: 11.5, impactCostPct: 9.4 },
  { variable: 'Payload Mass (Fixed)', impactEndurancePct: -18.5, impactFuelPct: 15.0, impactMassPct: 19.5, impactCostPct: 10.0 },
  { variable: 'Cruise Altitude (3000m)', impactEndurancePct: 8.8, impactFuelPct: -11.5, impactMassPct: 0.0, impactCostPct: -4.2 }
];

export const SensitivityAnalysisPanel: React.FC = () => {
  const [targetObjective, setTargetObjective] = useState<'ENDURANCE' | 'FUEL' | 'MASS' | 'COST'>('ENDURANCE');

  const getObjectiveKey = (): keyof SensitivityItem => {
    switch (targetObjective) {
      case 'ENDURANCE': return 'impactEndurancePct';
      case 'FUEL': return 'impactFuelPct';
      case 'MASS': return 'impactMassPct';
      case 'COST': return 'impactCostPct';
    }
  };

  const activeKey = getObjectiveKey();

  return (
    <CornerReticle id="sensitivity-analysis-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>SENSITIVITY & ELASTICITY ANALYSIS</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              VARIABLE IMPACT ON TARGET OBJECTIVES
            </span>
          </div>
        </div>

        {/* Objective Selector */}
        <div className="flex items-center space-x-1 bg-[#172236] p-0.5 rounded border border-[#1A2740] text-[8.5px] font-mono-data">
          <button
            onClick={() => setTargetObjective('ENDURANCE')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              targetObjective === 'ENDURANCE' ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
            }`}
          >
            ENDURANCE
          </button>
          <button
            onClick={() => setTargetObjective('FUEL')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              targetObjective === 'FUEL' ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
            }`}
          >
            FUEL BURN
          </button>
          <button
            onClick={() => setTargetObjective('MASS')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              targetObjective === 'MASS' ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
            }`}
          >
            PROP MASS
          </button>
          <button
            onClick={() => setTargetObjective('COST')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              targetObjective === 'COST' ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
            }`}
          >
            COST
          </button>
        </div>
      </div>

      {/* Description Banner */}
      <div className="bg-[#111A2E] p-1.5 rounded border border-[#1A2740] mb-2 text-[8.5px] font-mono-data text-[#8A9BBE] flex items-center justify-between flex-shrink-0">
        <span>Elasticity: % change in <strong>{targetObjective}</strong> per +10% increase in input variable</span>
        <span className="text-[#00A8FF] font-bold">SOBOL FIRST-ORDER INDEX</span>
      </div>

      {/* Bar Chart Canvas */}
      <div className="flex-1 min-h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={GARUN_SENSITIVITY_DATA}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
            <XAxis type="number" stroke="#8A9BBE" fontSize={8} unit="%" />
            <YAxis type="category" dataKey="variable" stroke="#8A9BBE" fontSize={8} width={110} />
            <Tooltip contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }} />
            <ReferenceLine x={0} stroke="#8A9BBE" />
            <Bar dataKey={activeKey} name="Sensitivity Impact (%)">
              {GARUN_SENSITIVITY_DATA.map((entry, index) => {
                const val = Number(entry[activeKey]);
                const isPositive = val >= 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isPositive ? '#00E87A' : '#FF3B30'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CornerReticle>
  );
};
