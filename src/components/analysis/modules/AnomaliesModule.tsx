import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AnomaliesModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={14}
      title="Physics Constraint & Anomaly Log"
      category="INTELLIGENCE & PREDICTION"
      equationBadge="12 CS-23 CONSTRAINTS"
      description="Automated real-time verification against 12 FAR CS-23 airworthiness & physics limits"
      inputsConsumed={['All Telemetry Channels', '12 Rule Constraints', 'Aerodynamic Limits', 'Electrical Limits']}
      physicsModel="Boolean Constraint Checker Engine: ∀ i ∈ [1..12], Constraint_i(state) == TRUE"
      outputsGenerated={['0 Active Critical Violations', '1 Advisory Warning (Payload Threshold)', '100% Safety Integrity Score']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#FFB800]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              REAL-TIME CONSTRAINT COMPLIANCE MATRIX (12 / 12 CS-23 CONSTRAINTS)
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00E87A] px-2 py-0.5 rounded border border-[#1F2D45]">
            SYSTEM HEALTHY
          </span>
        </div>

        <div className="space-y-2 text-[11px] font-mono-data">
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45] flex items-center justify-between">
            <span className="text-[#E8EDF7]">1. MTOW Budget Constraint (≤1000 kg)</span>
            <span className="text-[#00E87A] font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PASS (1000.0 kg)</span>
          </div>
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45] flex items-center justify-between">
            <span className="text-[#E8EDF7]">2. Battery SOC Floor Constraint (≥15.0%)</span>
            <span className="text-[#00E87A] font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PASS (20.0% min)</span>
          </div>
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45] flex items-center justify-between">
            <span className="text-[#E8EDF7]">3. Battery C-Rate Limit (≤3.5 C)</span>
            <span className="text-[#00E87A] font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PASS (3.0 C peak)</span>
          </div>
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45] flex items-center justify-between">
            <span className="text-[#E8EDF7]">4. Stall Speed Margin (V ≥ 1.2 · V_stall)</span>
            <span className="text-[#00E87A] font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PASS (1.42x margin)</span>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
