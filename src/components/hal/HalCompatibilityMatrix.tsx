import React from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { HalProject } from '../../data/halProjectsData';
import { ShieldCheck, AlertTriangle, CheckCircle2, Cpu, Thermometer, Layers, Wrench } from 'lucide-react';

interface HalCompatibilityMatrixProps {
  project: HalProject;
}

export const HalCompatibilityMatrix: React.FC<HalCompatibilityMatrixProps> = ({ project }) => {
  const getRatingBadgeClass = () => {
    switch (project.compatibilityRating) {
      case 'EXCELLENT':
        return 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/40';
      case 'HIGH':
        return 'bg-[#00A8FF]/10 text-[#00A8FF] border-[#00A8FF]/40';
      case 'MODERATE':
        return 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/40';
      case 'REQUIRES_REDESIGN':
        return 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/40';
    }
  };

  const constraintsList = [
    { label: 'Thermal Cooling Margin', passed: project.thermalCompatibilityPct >= 80, score: `${project.thermalCompatibilityPct}%` },
    { label: 'Airframe Wingbox Load Limits', passed: project.structuralFeasibilityPct >= 75, score: `${project.structuralFeasibilityPct}%` },
    { label: 'HVDC Bus Voltage Match', passed: project.electricalVoltageV >= 600, score: `${project.electricalVoltageV}V` },
    { label: 'CG Shift Tolerance', passed: project.compatibilityScore >= 80, score: 'NOMINAL' },
    { label: 'Acoustic Signature Redesign', passed: true, score: `-${project.adaptationBenefits.acousticReductionDb} dB` }
  ];

  return (
    <CornerReticle id="hal-compatibility-matrix-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#00E87A]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>AIRFRAME & POWERPLANT INTEGRATION FEASIBILITY</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              MULTIDISCIPLINARY COMPATIBILITY MATRIX
            </span>
          </div>
        </div>

        <span className={`text-[8.5px] font-mono-data font-bold px-2 py-0.5 rounded border uppercase ${getRatingBadgeClass()}`}>
          {project.compatibilityRating}
        </span>
      </div>

      {/* Main Score Hero Bar */}
      <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] mb-2 flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[8.5px] font-mono-data text-[#8A9BBE] block uppercase">OVERALL INTEGRATION SCORE</span>
          <span className="text-xl font-mono-data font-bold text-[#00E87A]">
            {project.compatibilityScore} <span className="text-xs font-normal text-[#8A9BBE]">/ 100</span>
          </span>
        </div>

        <div className="w-36 h-2 bg-[#172236] rounded-full overflow-hidden border border-[#1A2740]">
          <div 
            style={{ width: `${project.compatibilityScore}%` }}
            className={`h-full transition-all duration-500 ${
              project.compatibilityScore >= 90 ? 'bg-[#00E87A]' : project.compatibilityScore >= 80 ? 'bg-[#00A8FF]' : 'bg-[#FFB800]'
            }`}
          />
        </div>
      </div>

      {/* Sub-system Feasibility Gauges */}
      <div className="grid grid-cols-2 gap-2 mb-2 font-mono-data text-[9px] flex-shrink-0">
        {/* Thermal Feasibility */}
        <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-[#FF6B35]" />
              <span>THERMAL HEAT REJECTION</span>
            </span>
            <span className="font-bold text-[#00E87A]">{project.thermalCompatibilityPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#172236] rounded overflow-hidden">
            <div style={{ width: `${project.thermalCompatibilityPct}%` }} className="bg-[#FF6B35] h-full" />
          </div>
        </div>

        {/* Structural Feasibility */}
        <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Layers className="w-3 h-3 text-[#00A8FF]" />
              <span>STRUCTURAL WINGBOX</span>
            </span>
            <span className="font-bold text-[#00A8FF]">{project.structuralFeasibilityPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#172236] rounded overflow-hidden">
            <div style={{ width: `${project.structuralFeasibilityPct}%` }} className="bg-[#00A8FF] h-full" />
          </div>
        </div>
      </div>

      {/* Constraints Checkbox List */}
      <div className="space-y-1 flex-1 overflow-y-auto min-h-0 font-mono-data text-[8.5px]">
        {constraintsList.map((item, idx) => (
          <div 
            key={idx}
            className="bg-[#111A2E]/80 p-1.5 rounded border border-[#1A2740] flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              {item.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#FFB800]" />
              )}
              <span className="text-[#E8EDF7]">{item.label}</span>
            </div>
            <span className="font-bold text-[#00A8FF]">{item.score}</span>
          </div>
        ))}
      </div>
    </CornerReticle>
  );
};
