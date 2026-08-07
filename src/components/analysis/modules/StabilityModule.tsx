import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { Scale } from 'lucide-react';

export const StabilityModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={12}
      title="Aircraft CG & Longitudinal Stability"
      category="POWER & ENERGY"
      equationBadge="Static Margin % MAC"
      description="Center of gravity shift during fuel burn, neutral point calculation & static margin tracking"
      inputsConsumed={['OEW CG Location', 'Payload CG Location', 'Fuel Tank CG Location', 'Neutral Point x_np']}
      physicsModel="Longitudinal Static Margin: SM = (x_np - x_cg) / MAC = 12.5% MAC"
      outputsGenerated={['Initial CG (25.0% MAC)', 'Final CG (23.2% MAC)', 'CG Shift Delta (-1.8% MAC)', 'Static Margin Range (12.5% - 14.3%)']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-[#00A8FF]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              LONGITUDINAL STATIC MARGIN & CG SHIFT
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00E87A] px-2 py-0.5 rounded border border-[#1F2D45]">
            12.5% MAC STABLE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-mono-data">
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Initial Takeoff CG:</span>
            <div className="text-lg font-bold text-[#E8EDF7] mt-1">25.0% MAC</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Landing CG (Fuel Burned):</span>
            <div className="text-lg font-bold text-[#00A8FF] mt-1">23.2% MAC</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Neutral Point x_np:</span>
            <div className="text-lg font-bold text-[#00E87A] mt-1">37.5% MAC (Static Margin: +12.5%)</div>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
