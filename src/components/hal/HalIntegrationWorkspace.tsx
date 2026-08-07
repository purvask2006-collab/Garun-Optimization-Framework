import React, { useState } from 'react';
import { HalProject, HAL_PROJECTS } from '../../data/halProjectsData';
import { HalProjectSelectorDropdown } from './HalProjectSelectorDropdown';
import { HalArchitectureComparison } from './HalArchitectureComparison';
import { HalParameterTransferCard } from './HalParameterTransferCard';
import { HalCompatibilityMatrix } from './HalCompatibilityMatrix';
import { HalMissionAdaptationSim } from './HalMissionAdaptationSim';
import { HalComparisonTable } from './HalComparisonTable';
import { Shield, Sparkles, Layers, ArrowRightLeft, Table, Send, Activity, Plane } from 'lucide-react';

export const HalIntegrationWorkspace: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<HalProject>(HAL_PROJECTS[0]); // Default GARUN
  const [activeTab, setActiveTab] = useState<'FULL_SUITE' | 'ARCHITECTURE' | 'COMPATIBILITY' | 'COMPARISON_TABLE'>('FULL_SUITE');

  return (
    <div id="hal-integration-workspace" className="flex-1 bg-[#0A0F1E] p-2 flex flex-col space-y-2 overflow-hidden select-none h-full">
      {/* 1. TOP MODULE NAVIGATION BAR */}
      <div className="flex items-center justify-between bg-[#0F1729] px-3 py-1.5 rounded border border-[#1A2740] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Plane className="w-5 h-5 text-[#00A8FF]" />
          <div>
            <h1 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-2">
              <span>HAL PROPULSION INTEGRATION MODULE</span>
              <span className="bg-[#00E87A]/20 text-[#00E87A] text-[8.5px] px-1.5 py-0.2 rounded border border-[#00E87A]/40 font-mono-data">
                11 HAL AIRCRAFT & ENGINE PLATFORMS
              </span>
            </h1>
            <p className="text-[9.5px] font-mono-data text-[#8A9BBE]">
              HYBRID-ELECTRIC PROPULSION RETROFIT, PARAMETER TRANSFER & COMPATIBILITY SUITE
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-[#172236] p-1 rounded border border-[#1A2740] text-[9.5px] font-mono-data">
          {([
            { id: 'FULL_SUITE', label: 'FULL SUITE', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'ARCHITECTURE', label: 'ARCHITECTURE & PARAMETERS', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
            { id: 'COMPATIBILITY', label: 'COMPATIBILITY & MISSION', icon: <Shield className="w-3.5 h-3.5" /> },
            { id: 'COMPARISON_TABLE', label: 'COMPARISON MATRIX TABLE', icon: <Table className="w-3.5 h-3.5" /> }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded flex items-center space-x-1.5 uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white hover:bg-[#111A2E]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. TOP INTERACTIVE HAL PROJECT SELECTOR DROPDOWN */}
      <div className="flex-shrink-0">
        <HalProjectSelectorDropdown
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
      </div>

      {/* 3. DYNAMIC CONTENT GRID */}
      {activeTab === 'FULL_SUITE' && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 overflow-y-auto">
          {/* Top Row: Architecture Comparison (Width 7/12) & Parameter Transfer Card (Width 5/12) */}
          <div className="col-span-7 h-[290px]">
            <HalArchitectureComparison project={selectedProject} />
          </div>
          <div className="col-span-5 h-[290px]">
            <HalParameterTransferCard project={selectedProject} />
          </div>

          {/* Bottom Row: Compatibility Matrix (Width 5/12) & Mission Adaptation (Width 7/12) */}
          <div className="col-span-5 h-[280px]">
            <HalCompatibilityMatrix project={selectedProject} />
          </div>
          <div className="col-span-7 h-[280px]">
            <HalMissionAdaptationSim project={selectedProject} />
          </div>

          {/* Full Width Bottom Table */}
          <div className="col-span-12 h-[320px]">
            <HalComparisonTable
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />
          </div>
        </div>
      )}

      {activeTab === 'ARCHITECTURE' && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
          <div className="col-span-7 h-full">
            <HalArchitectureComparison project={selectedProject} />
          </div>
          <div className="col-span-5 h-full">
            <HalParameterTransferCard project={selectedProject} />
          </div>
        </div>
      )}

      {activeTab === 'COMPATIBILITY' && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
          <div className="col-span-5 h-full">
            <HalCompatibilityMatrix project={selectedProject} />
          </div>
          <div className="col-span-7 h-full">
            <HalMissionAdaptationSim project={selectedProject} />
          </div>
        </div>
      )}

      {activeTab === 'COMPARISON_TABLE' && (
        <div className="flex-1 min-h-0 h-full">
          <HalComparisonTable
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />
        </div>
      )}
    </div>
  );
};
