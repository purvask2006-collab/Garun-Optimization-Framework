import React from 'react';
import { 
  BarChart2, 
  Database, 
  CheckCircle2, 
  Radio, 
  TrendingUp, 
  Dna, 
  FileText, 
  Sliders
} from 'lucide-react';
import { AnalysisModuleId } from './types';

interface AnalysisHeaderProps {
  selectedMission: string;
  onMissionChange: (mission: string) => void;
  selectedDataset: string;
  onDatasetChange: (dataset: string) => void;
  activeModuleId: AnalysisModuleId;
  onModuleSelect: (module: AnalysisModuleId) => void;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  selectedMission,
  onMissionChange,
  selectedDataset,
  onDatasetChange,
  activeModuleId,
  onModuleSelect
}) => {
  return (
    <div className="bg-[#0E1626] border-b border-[#1F2D45] px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-20 select-none">
      {/* Title & Section Tag */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-[#00A8FF]/20 border border-[#00A8FF] flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-[#00A8FF]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                MISSION ANALYSIS & INTELLIGENCE
              </h1>
              <span className="bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 text-[9px] font-mono-data px-1.5 py-0.5 rounded font-bold">
                ENGINEERING WORKSPACE
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-[#8A9BBE]">
              AERODYNAMIC, PROPULSION & HYBRID ENERGY INTELLIGENCE SUITE
            </p>
          </div>
        </div>
      </div>

      {/* Center Selectors: Mission & Dataset */}
      <div className="flex items-center space-x-2 bg-[#0A0F1E] p-1 rounded border border-[#1F2D45]">
        {/* Mission Selector */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 border-r border-[#1F2D45]">
          <Sliders className="w-3 h-3 text-[#00A8FF]" />
          <span className="text-[10px] font-mono-data text-[#8A9BBE] uppercase">Mission:</span>
          <select
            value={selectedMission}
            onChange={(e) => onMissionChange(e.target.value)}
            className="bg-[#111827] text-[#E8EDF7] border border-[#1F2D45] rounded text-[11px] font-mono-data px-2 py-0.5 focus:outline-none focus:border-[#00A8FF]"
          >
            <option value="AEROTHON_STD">Aerothon Standard Mission (1000kg MTOW)</option>
            <option value="HIGH_ALT_STRENGTH">High-Altitude Stealth Endurance (5000m)</option>
            <option value="MAX_PAYLOAD">Maximum Payload Delivery (250kg)</option>
            <option value="CUSTOM_SIM">Custom HIL Telemetry Run #042</option>
          </select>
        </div>

        {/* Dataset Selector */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5">
          <Database className="w-3 h-3 text-[#00E87A]" />
          <span className="text-[10px] font-mono-data text-[#8A9BBE] uppercase">Dataset:</span>
          <select
            value={selectedDataset}
            onChange={(e) => onDatasetChange(e.target.value)}
            className="bg-[#111827] text-[#E8EDF7] border border-[#1F2D45] rounded text-[11px] font-mono-data px-2 py-0.5 focus:outline-none focus:border-[#00E87A]"
          >
            <option value="GARUN_DB_V2">garun.json v2.0.0 (Baseline Physics)</option>
            <option value="HIL_TELEMETRY_LOG">HIL Telemetry Capture (Live Filtered)</option>
            <option value="OPTIMIZED_PARETO_RUN">NSGA-II Pareto Solution Set #19</option>
            <option value="FLIGHT_SIM_RECORD">Flight Sim Record 2026-08-08</option>
          </select>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center space-x-2">
        {/* Analysis Engine Status */}
        <div className="hidden xl:flex items-center space-x-2 bg-[#111827] border border-[#00E87A]/30 px-2.5 py-1 rounded text-[10px] font-mono-data">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
          <div className="flex flex-col">
            <span className="text-[#00E87A] font-bold leading-tight">ANALYSIS STATUS: READY</span>
            <span className="text-[#8A9BBE] text-[9px] leading-tight">Physics Confidence: 98.4%</span>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center space-x-1 border-l border-[#1F2D45] pl-2">
          <button
            onClick={() => onModuleSelect('live-analysis')}
            className={`px-2 py-1 rounded text-[10px] font-mono-data font-semibold flex items-center space-x-1 transition-all ${
              activeModuleId === 'live-analysis'
                ? 'bg-[#00E87A] text-[#0A0F1E] shadow-sm'
                : 'bg-[#111827] border border-[#1F2D45] text-[#8A9BBE] hover:text-[#00E87A] hover:border-[#00E87A]/50'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE</span>
          </button>

          <button
            onClick={() => onModuleSelect('prediction')}
            className={`px-2 py-1 rounded text-[10px] font-mono-data font-semibold flex items-center space-x-1 transition-all ${
              activeModuleId === 'prediction'
                ? 'bg-[#FFB800] text-[#0A0F1E] shadow-sm'
                : 'bg-[#111827] border border-[#1F2D45] text-[#8A9BBE] hover:text-[#FFB800] hover:border-[#FFB800]/50'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>PREDICT</span>
          </button>

          <button
            onClick={() => onModuleSelect('optimization')}
            className={`px-2 py-1 rounded text-[10px] font-mono-data font-semibold flex items-center space-x-1 transition-all ${
              activeModuleId === 'optimization'
                ? 'bg-[#00A8FF] text-[#0A0F1E] shadow-sm'
                : 'bg-[#111827] border border-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] hover:border-[#00A8FF]/50'
            }`}
          >
            <Dna className="w-3 h-3" />
            <span>OPTIMIZE</span>
          </button>

          <button
            onClick={() => onModuleSelect('generate-report')}
            className={`px-2 py-1 rounded text-[10px] font-mono-data font-semibold flex items-center space-x-1 transition-all ${
              activeModuleId === 'generate-report'
                ? 'bg-[#E8EDF7] text-[#0A0F1E] shadow-sm'
                : 'bg-[#111827] border border-[#1F2D45] text-[#8A9BBE] hover:text-[#E8EDF7] hover:border-[#E8EDF7]/50'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>REPORT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
