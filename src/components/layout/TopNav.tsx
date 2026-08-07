import React from 'react';
import { 
  BarChart2, 
  Settings, 
  Sliders, 
  Bell, 
  HelpCircle, 
  User, 
  ShieldCheck
} from 'lucide-react';
import { useGarunStore } from '../../store/useGarunStore';
import { AerospaceClock } from '../common/AerospaceClock';
import { HAL_ORGANIZATION } from '../../constants/hal-constants';

export const TopNav: React.FC = () => {
  const { 
    setCommandPaletteOpen, 
    setTelemetryDrawerOpen,
    activeModule,
    setActiveModule,
    systemMetrics
  } = useGarunStore();

  return (
    <header className="h-[56px] bg-[#0A0F1E] border-b border-[#1F2D45] px-3 flex items-center justify-between z-30 select-none">
      {/* Left: HAL Emblem & Dashboard Title */}
      <div className="flex items-center space-x-3">
        {/* HAL Institutional Logo Emblem */}
        <div className="flex items-center space-x-2 pr-3 border-r border-[#1F2D45]">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00A8FF]/20 to-[#FF6B35]/20 border border-[#00A8FF]/40 flex items-center justify-center relative shadow-sm">
            <span className="text-[11px] font-bold font-mono-data text-[#00A8FF] tracking-tighter">HAL</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00E87A] animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider text-[#E8EDF7] font-mono-data leading-none">
              HINDUSTAN AERONAUTICS LIMITED
            </span>
            <span className="text-[9px] font-mono-data text-[#8A9BBE] leading-tight mt-0.5">
              AERDC BENGALURU // DEFENSE R&D
            </span>
          </div>
        </div>

        {/* Dashboard Title */}
        <div className="hidden lg:flex flex-col">
          <h1 className="text-sm font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase flex items-center space-x-2">
            <span>HYBRID-ELECTRIC PROPULSION OPTIMIZATION</span>
            <span className="text-[#8A9BBE] font-normal">FOR FIXED-WING UAV</span>
          </h1>
        </div>
      </div>

      {/* Center: Mode Badge & Workspace Switcher */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveModule(activeModule === 'mission-analysis' ? 'overview' : 'mission-analysis')}
          className={`px-3 py-1 rounded text-[11px] font-mono-data font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
            activeModule === 'mission-analysis'
              ? 'bg-[#00E87A] text-[#0A0F1E] border border-[#00E87A]'
              : 'bg-[#172236] border border-[#00A8FF]/40 text-[#00A8FF] hover:bg-[#00A8FF]/20'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="uppercase">Mission Analysis & Intelligence</span>
        </button>

        <div className="hidden sm:flex bg-[#172236] border border-[#00E87A]/40 text-[#00E87A] px-3 py-1 rounded text-[11px] font-mono-data font-semibold items-center space-x-2 shadow-sm">
          <span className="text-[9px] uppercase text-[#8A9BBE]">MODE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E87A] animate-pulse" />
          <span>STEALTH / ENDURANCE</span>
        </div>
      </div>

      {/* Right Controls, Clock, and Global Status */}
      <div className="flex items-center space-x-3">
        {/* Navigation Action Buttons */}
        <div className="flex items-center space-x-1 border-r border-[#1F2D45] pr-2" role="tablist" aria-label="Quick navigation and platform controls">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title="Search Commands & Workspaces (Cmd+K)"
            aria-haspopup="dialog"
            aria-label="Open command palette (Ctrl+K)"
            className="p-1.5 rounded bg-[#111827] border border-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] hover:border-[#00A8FF]/50 transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveModule('diagnostics')}
            title="System Diagnostics & Settings"
            role="tab"
            aria-selected={activeModule === 'diagnostics'}
            aria-label="Platform Settings navigation"
            className={`p-1.5 rounded border transition-colors ${
              activeModule === 'diagnostics'
                ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF]'
                : 'bg-[#111827] border-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] hover:border-[#00A8FF]/50'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModule('validation')}
            title="Automated Engineering Validation Matrix (12 Constraints)"
            role="tab"
            aria-selected={activeModule === 'validation'}
            aria-label="Validation Matrix navigation"
            className={`p-1.5 rounded border transition-colors ${
              activeModule === 'validation'
                ? 'bg-[#00E87A]/20 border-[#00E87A] text-[#00E87A]'
                : 'bg-[#111827] border-[#1F2D45] text-[#8A9BBE] hover:text-[#00E87A] hover:border-[#00E87A]/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModule('simulation')}
            title="Simulation Workspace"
            role="tab"
            aria-selected={activeModule === 'simulation'}
            aria-label="Simulation Config navigation"
            className={`p-1.5 rounded border transition-colors ${
              activeModule === 'simulation'
                ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF]'
                : 'bg-[#111827] border-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] hover:border-[#00A8FF]/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTelemetryDrawerOpen(true)}
            title="Telemetry Alerts & Logs"
            aria-label="Open notification alerts telemetry"
            className="p-1.5 rounded bg-[#111827] border border-[#1F2D45] text-[#8A9BBE] hover:text-[#FFB800] hover:border-[#FFB800]/50 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-[9px] font-mono-data font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              4
            </span>
          </button>

          <button
            onClick={() => setActiveModule('knowledge-hub')}
            title="Knowledge Hub & Aerospace Equations"
            role="tab"
            aria-selected={activeModule === 'knowledge-hub'}
            aria-label="Knowledge and Equation Reference navigation"
            className={`p-1.5 rounded border transition-colors ${
              activeModule === 'knowledge-hub'
                ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF]'
                : 'bg-[#111827] border-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] hover:border-[#00A8FF]/50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            title="User Profile Session"
            aria-label="User profile session"
            className="p-1.5 rounded bg-[#111827] border border-[#1F2D45] text-[#8A9BBE] hover:text-[#E8EDF7] hover:border-[#00A8FF]/50 transition-colors"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Live Date / Clock */}
        <AerospaceClock />

        {/* Global System Status */}
        <div className="flex items-center space-x-1.5 bg-[#111827] px-2.5 py-1 rounded border border-[#00E87A]/30 text-[11px] font-mono-data">
          <span className="text-[#8A9BBE]">System Status:</span>
          <span className="text-[#00E87A] font-bold uppercase tracking-wider">OPTIMAL</span>
          <span className="w-2 h-2 rounded-full bg-[#00E87A] animate-pulse" />
        </div>
      </div>
    </header>
  );
};
