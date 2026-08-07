import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { CheckCircle2 } from 'lucide-react';

export const RecommendationsModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={19}
      title="Automated Engineering Recommendations"
      category="INTELLIGENCE & PREDICTION"
      equationBadge="AI & Physics Rules"
      description="Actionable design & flight operation recommendations derived from physics optimization and safety analysis"
      inputsConsumed={['All Analysis Module Outputs', 'HAL Design Targets', 'Aerothon Requirements', 'Thermal Profile']}
      physicsModel="Automated Decision Tree Rule Engine for Aerospace Design Optimization"
      outputsGenerated={['3 Critical Design Recommendations', '2 Operational Guidance Bulletins', 'HAL Panel Action Plan']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#00E87A]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              TOP ENGINEERING ACTION ITEMS & DESIGN RECOMMENDATIONS
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00E87A] px-2 py-0.5 rounded border border-[#1F2D45]">
            HIGH CONFIDENCE
          </span>
        </div>

        <div className="space-y-2 text-[11px] font-mono-data">
          <div className="bg-[#111827] p-3 rounded border border-[#1F2D45]">
            <div className="text-[#00A8FF] font-bold">1. Maintain 60 kW ICE Engine Rating with 3000m Altitude Derating</div>
            <p className="text-[#8A9BBE] text-[10px] mt-1">
              Provides required 49 kW altitude power to cover cruise demand when combined with 20 kW battery assist.
            </p>
          </div>

          <div className="bg-[#111827] p-3 rounded border border-[#1F2D45]">
            <div className="text-[#00E87A] font-bold">2. Enforce Pure Electric Mode During 4-Hour Loiter Phase</div>
            <p className="text-[#8A9BBE] text-[10px] mt-1">
              Shutting off ICE during loiter conserves 32.8 kg fuel and delivers complete acoustic stealth.
            </p>
          </div>

          <div className="bg-[#111827] p-3 rounded border border-[#1F2D45]">
            <div className="text-[#FFB800] font-bold">3. Implement ECMS Power Split Controller for HIL Testing</div>
            <p className="text-[#8A9BBE] text-[10px] mt-1">
              Dynamic ECMS power split minimizes fuel burn while maintaining battery SOC above the 15% safety floor.
            </p>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
