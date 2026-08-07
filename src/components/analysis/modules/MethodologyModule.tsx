import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { BookOpen } from 'lucide-react';

export const MethodologyModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={20}
      title="Aerospace Equations & FAR CS-23 Methodology"
      category="ENGINEERING & DELIVERABLES"
      equationBadge="CS-23 & STANAG"
      description="Formal mathematical formulations, physics assumptions, reference papers & CS-23 airworthiness criteria"
      inputsConsumed={['FAR CS-23 Subpart C/E', 'STANAG 4671 UAV Specs', 'Breguet Equations', 'ISA Models']}
      physicsModel="Peer-Reviewed Aerospace Formulations (Raymer, Roskam, Mattingly)"
      outputsGenerated={['Complete Equation Documentation', 'Assumptions Log', 'Aerospace Standards References']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#00A8FF]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              MATHEMATICAL FORMULATIONS & STANDARDS
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00A8FF] px-2 py-0.5 rounded border border-[#1F2D45]">
            FAR CS-23 AMDT 55
          </span>
        </div>

        <div className="space-y-2 text-[10px] font-mono-data text-[#8A9BBE]">
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45]">
            <span className="text-[#00A8FF] font-bold">Eq 1. Parabolic Drag Polar:</span> CD = CD0 + (1 / (π · AR · e)) · CL²
          </div>
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45]">
            <span className="text-[#00E87A] font-bold">Eq 2. Hybrid Breguet Range:</span> R = (η / SFC) · (L/D) · ln(W0 / W1) + (η_elec · E_bat) / Drag
          </div>
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45]">
            <span className="text-[#FFB800] font-bold">Eq 3. ISA Air Density Lapse:</span> ρ(h) = ρ0 · (1 - L·h / T0)^(4.2558)
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
