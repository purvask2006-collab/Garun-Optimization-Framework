import React from 'react';
import { CheckCircle2, Cpu, FileCode2, Layers, Play } from 'lucide-react';

interface BaseModuleFrameProps {
  moduleNumber: number;
  title: string;
  category: string;
  equationBadge?: string;
  statusText?: string;
  description: string;
  inputsConsumed: string[];
  outputsGenerated: string[];
  physicsModel: string;
  children: React.ReactNode;
}

export const BaseModuleFrame: React.FC<BaseModuleFrameProps> = ({
  moduleNumber,
  title,
  category,
  equationBadge,
  statusText = 'PHYSICS READY',
  description,
  inputsConsumed,
  outputsGenerated,
  physicsModel,
  children
}) => {
  return (
    <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto custom-scrollbar select-none">
      {/* Module Header Frame */}
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-[#111827] border border-[#00A8FF]/40 flex items-center justify-center font-mono-data font-bold text-sm text-[#00A8FF]">
            {moduleNumber.toString().padStart(2, '0')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono-data font-semibold text-[#8A9BBE] uppercase tracking-wider">
                [{category}]
              </span>
              <h2 className="text-base font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                {title}
              </h2>
              {equationBadge && (
                <span className="bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30 text-[9px] font-mono-data px-2 py-0.5 rounded font-bold">
                  {equationBadge}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono-data text-[#8A9BBE] mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Engine Status & Execution Button */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#111827] border border-[#00E87A]/30 px-2.5 py-1 rounded text-[10px] font-mono-data flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
            <span className="text-[#00E87A] font-bold uppercase">{statusText}</span>
          </div>
          <button className="bg-[#00A8FF] hover:bg-[#00A8FF]/80 text-[#0A0F1E] px-3 py-1.5 rounded text-[11px] font-mono-data font-bold flex items-center space-x-1.5 transition-colors">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN ANALYSIS</span>
          </button>
        </div>
      </div>

      {/* Main Module Content Area */}
      <div className="flex-1 min-h-[300px]">
        {children}
      </div>

      {/* Module Engineering Context Footer */}
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-2.5 text-[10px] font-mono-data grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Inputs Consumed */}
        <div className="space-y-1">
          <div className="text-[#00A8FF] font-bold flex items-center space-x-1 uppercase">
            <Layers className="w-3 h-3" />
            <span>Inputs Consumed</span>
          </div>
          <div className="text-[#8A9BBE] leading-relaxed">
            {inputsConsumed.join(' • ')}
          </div>
        </div>

        {/* Physics Model */}
        <div className="space-y-1">
          <div className="text-[#00E87A] font-bold flex items-center space-x-1 uppercase">
            <FileCode2 className="w-3 h-3" />
            <span>Physics Formulation</span>
          </div>
          <div className="text-[#8A9BBE] leading-relaxed">
            {physicsModel}
          </div>
        </div>

        {/* Outputs Generated */}
        <div className="space-y-1">
          <div className="text-[#FFB800] font-bold flex items-center space-x-1 uppercase">
            <Cpu className="w-3 h-3" />
            <span>Outputs Derived</span>
          </div>
          <div className="text-[#8A9BBE] leading-relaxed">
            {outputsGenerated.join(' • ')}
          </div>
        </div>
      </div>
    </div>
  );
};
