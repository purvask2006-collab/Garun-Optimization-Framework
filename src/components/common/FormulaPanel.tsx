import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, CheckCircle, AlertCircle, Cpu, Info } from 'lucide-react';

export type ConfidenceLevel = 'COMPETITION_GIVEN' | 'ASSUMPTION' | 'COMPUTED' | 'LITERATURE';

export interface VariableDef {
  symbol: string;
  name: string;
  value: string | number;
  unit: string;
}

export interface FormulaPanelProps {
  label: string;
  value: string | number;
  unit: string;
  symbolicFormula: string;
  variableDefs: VariableDef[];
  substitutedFormula: string;
  resultWithUnit: string;
  source: string;
  confidence: ConfidenceLevel;
  className?: string;
  triggerLabel?: string;
}

const confidenceBadgeMap: Record<ConfidenceLevel, { label: string; color: string; bg: string; border: string }> = {
  COMPETITION_GIVEN: {
    label: 'COMPETITION SPEC (HAL / GARUN)',
    color: 'text-[#00E87A]',
    bg: 'bg-[#00E87A]/10',
    border: 'border-[#00E87A]/40'
  },
  COMPUTED: {
    label: 'COMPUTED (PHYSICS ENGINE)',
    color: 'text-[#00A8FF]',
    bg: 'bg-[#00A8FF]/10',
    border: 'border-[#00A8FF]/40'
  },
  ASSUMPTION: {
    label: 'ENGINEERING ASSUMPTION',
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/40'
  },
  LITERATURE: {
    label: 'LITERATURE / EMPIRICAL DATA',
    color: 'text-[#B47FFF]',
    bg: 'bg-[#B47FFF]/10',
    border: 'border-[#B47FFF]/40'
  }
};

export const FormulaPanel: React.FC<FormulaPanelProps> = ({
  label,
  value,
  unit,
  symbolicFormula,
  variableDefs,
  substitutedFormula,
  resultWithUnit,
  source,
  confidence,
  className = '',
  triggerLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const badgeInfo = confidenceBadgeMap[confidence] || confidenceBadgeMap.COMPUTED;

  return (
    <div className={`inline-block text-left font-mono-data ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        type="button"
        title={`View mathematical derivation for ${label}`}
        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#00A8FF] text-[#0A0F1E] border-[#00A8FF] font-bold shadow-sm'
            : 'bg-[#172236] text-[#8A9BBE] hover:text-[#00A8FF] hover:border-[#00A8FF]/50 border-[#1A2740]'
        }`}
      >
        <HelpCircle className="w-3 h-3 text-[#00A8FF]" />
        <span>{triggerLabel || '?'}</span>
        {isOpen ? <ChevronUp className="w-2.5 h-2.5 ml-0.5" /> : <ChevronDown className="w-2.5 h-2.5 ml-0.5" />}
      </button>

      {/* Expandable Derivation Breakdown Dropdown */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 p-2.5 bg-[#0D1527] border border-[#00A8FF]/50 rounded-md shadow-2xl text-[9.5px] text-[#E8EDF7] space-y-2 z-50 relative min-w-[280px] max-w-[380px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1A2740] pb-1.5">
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#00A8FF]" />
              <span className="font-bold text-white uppercase tracking-wider">{label} DERIVATION</span>
            </div>
            <span className={`text-[8px] px-1.5 py-0.2 rounded border font-bold ${badgeInfo.bg} ${badgeInfo.color} ${badgeInfo.border}`}>
              {badgeInfo.label}
            </span>
          </div>

          {/* Symbolic Formula Block */}
          <div className="bg-[#111A2E] p-1.5 rounded border border-[#1A2740]">
            <span className="text-[8px] text-[#8A9BBE] block uppercase font-sans-ui mb-0.5">SYMBOLIC FORMULA</span>
            <div className="font-mono text-[#00E87A] text-[10px] font-bold tracking-wide overflow-x-auto whitespace-pre-wrap">
              {symbolicFormula}
            </div>
          </div>

          {/* Variables Table */}
          {variableDefs && variableDefs.length > 0 && (
            <div className="space-y-1">
              <span className="text-[8px] text-[#8A9BBE] block uppercase font-sans-ui">VARIABLE DEFINITIONS & ISA INPUTS</span>
              <div className="bg-[#111A2E] rounded border border-[#1A2740] divide-y divide-[#1A2740]/60 max-h-[110px] overflow-y-auto no-scrollbar">
                {variableDefs.map((v, i) => (
                  <div key={i} className="px-2 py-0.8 flex items-center justify-between text-[8.5px]">
                    <span className="font-bold text-[#00A8FF]">{v.symbol}</span>
                    <span className="text-[#8A9BBE] truncate mx-1 max-w-[140px]">{v.name}</span>
                    <span className="font-mono text-white font-bold">{v.value} <span className="text-[7.5px] text-[#8A9BBE]">{v.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Substituted Evaluation */}
          <div className="bg-[#111A2E] p-1.5 rounded border border-[#1A2740]">
            <span className="text-[8px] text-[#8A9BBE] block uppercase font-sans-ui mb-0.5">SUBSTITUTED VALUES & STEP EVALUATION</span>
            <div className="font-mono text-[#F59E0B] text-[9.5px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {substitutedFormula}
            </div>
          </div>

          {/* Result Banner */}
          <div className="bg-[#00E87A]/10 border border-[#00E87A]/40 p-1.5 rounded flex items-center justify-between text-[#00E87A]">
            <span className="text-[8.5px] font-bold uppercase">FINAL AUDITED RESULT:</span>
            <span className="font-bold text-[11px] font-mono">{resultWithUnit}</span>
          </div>

          {/* Source / Assumptions Footer */}
          <div className="text-[8px] text-[#8A9BBE] border-t border-[#1A2740] pt-1 flex items-start space-x-1">
            <Info className="w-3 h-3 text-[#00A8FF] flex-shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong className="text-white">SOURCE:</strong> {source}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
