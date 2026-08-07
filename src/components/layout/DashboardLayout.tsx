import React, { useState } from 'react';
import { PlatformLibraryPanel } from '../dashboard/PlatformLibraryPanel';
import { VehicleDefinitionPanel } from '../dashboard/VehicleDefinitionPanel';
import { MissionSpecsPanel } from '../dashboard/MissionSpecsPanel';
import { DigitalTwinPanel } from '../dashboard/DigitalTwinPanel';
import { ThermalMonitorPanel } from '../dashboard/ThermalMonitorPanel';
import { HighAltitudeMonitorPanel } from '../dashboard/HighAltitudeMonitorPanel';
import { PowerSplitPanel } from '../dashboard/PowerSplitPanel';
import { PropulsionSizingPanel } from '../dashboard/PropulsionSizingPanel';
import { BatterySystemPanel } from '../dashboard/BatterySystemPanel';
import { MissionProfileChartPanel } from '../dashboard/MissionProfileChartPanel';
import { AnalyticsStrip } from '../dashboard/AnalyticsStrip';
import { PlatformConfigurationLibrary } from '../platform/PlatformConfigurationLibrary';
import { OptimizationWorkspace } from '../optimization/OptimizationWorkspace';
import { HalIntegrationWorkspace } from '../hal/HalIntegrationWorkspace';
import { KnowledgeHubWorkspace } from '../knowledge/KnowledgeHubWorkspace';
import { ReportGeneratorWorkspace } from '../reports/ReportGeneratorWorkspace';
import { DiagnosticsSettingsWorkspace } from '../platform/DiagnosticsSettingsWorkspace';
import { SystemValidationPanel } from '../validation/SystemValidationPanel';
import { ReferencesWorkspace } from '../references/ReferencesWorkspace';
import { TradeStudiesWorkspace } from '../trade/TradeStudiesWorkspace';
import { MissionAnalysisWorkspace } from '../analysis/MissionAnalysisWorkspace';
import { useGarunStore } from '../../store/useGarunStore';
import { Thermometer, CloudRain, Layers, Compass, Zap, Activity, Scale, Flame, BatteryCharging, ShieldCheck } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { activeModule } = useGarunStore();
  const [rightPanelTab, setRightPanelTab] = useState<'THERMAL' | 'HIGH_ALTITUDE'>('HIGH_ALTITUDE');
  const [leftPanelTab, setLeftPanelTab] = useState<'PLATFORM' | 'VEHICLE' | 'VALIDATION'>('VEHICLE');
  const [propulsionSubTab, setPropulsionSubTab] = useState<'ENGINE' | 'BATTERY' | 'SPLIT'>('ENGINE');

  if (activeModule === 'vehicle-definition') {
    return (
      <div className="flex-1 bg-[#0A0F1E] p-3 flex flex-col space-y-3 overflow-hidden select-none">
        <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2">
          <Scale className="w-4 h-4 text-[#00A8FF]" />
          <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
            VEHICLE DEFINITION & AIRCRAFT MASS BUDGET WORKSPACE
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="col-span-5 flex flex-col min-h-0">
            <VehicleDefinitionPanel />
          </div>
          <div className="col-span-7 flex flex-col space-y-3 min-h-0">
            <div className="flex-1 min-h-0">
              <DigitalTwinPanel />
            </div>
            <div className="h-[200px]">
              <MissionProfileChartPanel />
            </div>
          </div>
        </div>
        <div className="h-[125px] flex-shrink-0">
          <AnalyticsStrip />
        </div>
      </div>
    );
  }

  if (activeModule === 'platform-library') {
    return <PlatformConfigurationLibrary />;
  }

  if (activeModule === 'optimization') {
    return <OptimizationWorkspace />;
  }

  if (activeModule === 'hal' || activeModule === 'hal-integration') {
    return <HalIntegrationWorkspace />;
  }

  if (activeModule === 'knowledge' || activeModule === 'knowledge-hub') {
    return <KnowledgeHubWorkspace />;
  }

  if (activeModule === 'reports') {
    return <ReportGeneratorWorkspace />;
  }

  if (activeModule === 'diagnostics') {
    return <DiagnosticsSettingsWorkspace />;
  }

  if (activeModule === 'references') {
    return <ReferencesWorkspace />;
  }

  if (activeModule === 'trade-studies') {
    return <TradeStudiesWorkspace />;
  }

  if (activeModule === 'mission-analysis') {
    return <MissionAnalysisWorkspace />;
  }

  if (activeModule === 'validation') {
    return (
      <div className="flex-1 bg-[#0A0F1E] p-3 flex flex-col space-y-3 overflow-hidden select-none">
        <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2">
          <ShieldCheck className="w-4 h-4 text-[#00E87A]" />
          <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
            AUTOMATED ENGINEERING VALIDATION & CONSTRAINT COMPLIANCE MATRIX
          </h2>
        </div>
        <div className="flex-1 min-h-0">
          <SystemValidationPanel isCollapsible={false} defaultExpanded={true} className="h-full" />
        </div>
        <div className="h-[125px] flex-shrink-0">
          <AnalyticsStrip />
        </div>
      </div>
    );
  }

  // Focused View for "Mission" (constraints)
  if (activeModule === 'constraints') {
    return (
      <div className="flex-1 bg-[#0A0F1E] p-3 flex flex-col space-y-3 overflow-hidden select-none">
        <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2">
          <Compass className="w-4 h-4 text-[#00A8FF]" />
          <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
            MISSION CONSTRAINTS & ALTITUDE PROFILE WORKSPACE
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="col-span-4 flex flex-col min-h-0">
            <MissionSpecsPanel />
          </div>
          <div className="col-span-4 flex flex-col min-h-0">
            <HighAltitudeMonitorPanel />
          </div>
          <div className="col-span-4 flex flex-col min-h-0">
            <MissionProfileChartPanel />
          </div>
        </div>
        <div className="h-[125px] flex-shrink-0">
          <AnalyticsStrip />
        </div>
      </div>
    );
  }

  // Focused View for "Propulsion" (energy-flow)
  if (activeModule === 'energy-flow') {
    return (
      <div className="flex-1 bg-[#0A0F1E] p-3 flex flex-col space-y-3 overflow-hidden select-none">
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#00E87A]" />
            <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              PROPULSION & TURBOSHAFTS ENGINE SIZING WORKSPACE
            </h2>
          </div>
          <div className="flex items-center space-x-1 bg-[#111A2E] p-1 rounded border border-[#1A2740]">
            <button
              onClick={() => setPropulsionSubTab('ENGINE')}
              className={`px-2 py-1 text-[10px] font-mono-data rounded flex items-center space-x-1 ${
                propulsionSubTab === 'ENGINE'
                  ? 'bg-[#FFB800] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>ENGINE SIZING & HYBRID CONSTRAINT</span>
            </button>
            <button
              onClick={() => setPropulsionSubTab('BATTERY')}
              className={`px-2 py-1 text-[10px] font-mono-data rounded flex items-center space-x-1 ${
                propulsionSubTab === 'BATTERY'
                  ? 'bg-[#00E87A] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white'
              }`}
            >
              <BatteryCharging className="w-3 h-3" />
              <span>BATTERY COULOMB COUNTING</span>
            </button>
            <button
              onClick={() => setPropulsionSubTab('SPLIT')}
              className={`px-2 py-1 text-[10px] font-mono-data rounded flex items-center space-x-1 ${
                propulsionSubTab === 'SPLIT'
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>POWER SPLIT MATRIX</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="col-span-5 flex flex-col space-y-3 min-h-0">
            <div className="flex-1 min-h-0">
              <DigitalTwinPanel />
            </div>
          </div>
          <div className="col-span-7 flex flex-col min-h-0 overflow-y-auto">
            {propulsionSubTab === 'ENGINE' ? (
              <div className="flex-1 min-h-0">
                <PropulsionSizingPanel />
              </div>
            ) : propulsionSubTab === 'BATTERY' ? (
              <div className="flex-1 min-h-0">
                <BatterySystemPanel />
              </div>
            ) : (
              <div className="flex-1 min-h-0 space-y-3">
                <div className="h-[280px]">
                  <PowerSplitPanel />
                </div>
                <div className="h-[260px]">
                  <ThermalMonitorPanel />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Focused View for "Hardware In Loop Analysis" (hardware-in-loop)
  if (activeModule === 'hardware-in-loop') {
    return (
      <div className="flex-1 bg-[#0A0F1E] p-3 flex flex-col space-y-3 overflow-hidden select-none">
        <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2">
          <Activity className="w-4 h-4 text-[#FFB800]" />
          <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
            HARDWARE-IN-THE-LOOP (HIL) TELEMETRY & THERMAL ANALYSIS
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="col-span-6 flex flex-col min-h-0">
            <ThermalMonitorPanel />
          </div>
          <div className="col-span-6 flex flex-col space-y-3 min-h-0">
            <div className="flex-1 min-h-0">
              <HighAltitudeMonitorPanel />
            </div>
            <div className="h-[200px]">
              <MissionProfileChartPanel />
            </div>
          </div>
        </div>
        <div className="h-[125px] flex-shrink-0">
          <AnalyticsStrip />
        </div>
      </div>
    );
  }

  // Focused View for "Simulation" (simulation)
  if (activeModule === 'simulation') {
    return (
      <div className="flex-1 bg-[#0A0F1E] p-3 flex flex-col space-y-3 overflow-hidden select-none">
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="col-span-8 flex flex-col space-y-3 min-h-0">
            <div className="flex-1 min-h-0">
              <DigitalTwinPanel />
            </div>
          </div>
          <div className="col-span-4 flex flex-col space-y-3 min-h-0">
            <div className="h-[220px]">
              <PowerSplitPanel />
            </div>
            <div className="flex-1 min-h-0">
              <HighAltitudeMonitorPanel />
            </div>
          </div>
        </div>
        <div className="h-[125px] flex-shrink-0">
          <AnalyticsStrip />
        </div>
      </div>
    );
  }

  // Default Overview / Dashboard View
  return (
    <div className="flex-1 bg-[#0A0F1E] p-2 flex flex-col space-y-2 overflow-hidden select-none">
      {/* Zone B & C: Main Grid Section */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Column 1 (Left): Vehicle Definition & Mass Budget / Platform Library */}
        <div className="col-span-3 flex flex-col min-h-0 space-y-1">
          <div className="flex items-center space-x-1 bg-[#111A2E] p-1 rounded border border-[#1A2740] flex-shrink-0">
            <button
              onClick={() => setLeftPanelTab('VEHICLE')}
              className={`flex-1 py-1 px-1 text-[8.5px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase transition-all ${
                leftPanelTab === 'VEHICLE'
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>WEIGHT BUDGET</span>
            </button>
            <button
              onClick={() => setLeftPanelTab('VALIDATION')}
              className={`flex-1 py-1 px-1 text-[8.5px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase transition-all ${
                leftPanelTab === 'VALIDATION'
                  ? 'bg-[#00E87A] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>VALIDATION</span>
            </button>
            <button
              onClick={() => setLeftPanelTab('PLATFORM')}
              className={`flex-1 py-1 px-1 text-[8.5px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase transition-all ${
                leftPanelTab === 'PLATFORM'
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>PLATFORMS</span>
            </button>
          </div>
          <div className="flex-1 min-h-0">
            {leftPanelTab === 'VEHICLE' ? (
              <VehicleDefinitionPanel />
            ) : leftPanelTab === 'VALIDATION' ? (
              <SystemValidationPanel isCollapsible={false} defaultExpanded={true} className="h-full" />
            ) : (
              <PlatformLibraryPanel />
            )}
          </div>
        </div>

        {/* Column 2: Mission Specifications */}
        <div className="col-span-2 flex flex-col min-h-0 space-y-1">
          <div className="px-2 py-0.5 bg-[#111A2E] border border-[#1A2740] rounded text-[9px] font-mono-data text-[#00F5E4] font-bold flex items-center space-x-1 uppercase">
            <Compass className="w-3 h-3 text-[#00F5E4]" />
            <span>2. MISSION SPECS</span>
          </div>
          <div className="flex-1 min-h-0">
            <MissionSpecsPanel />
          </div>
        </div>

        {/* Column 3 (Center): Digital Twin 3D View & Component Chain Cards */}
        <div className="col-span-4 flex flex-col space-y-1.5 min-h-0">
          <div className="px-2 py-0.5 bg-[#111A2E] border border-[#1A2740] rounded text-[9px] font-mono-data text-[#00E87A] font-bold flex items-center space-x-1 uppercase">
            <Zap className="w-3 h-3 text-[#00E87A]" />
            <span>3. DIGITAL TWIN & POWER MATRIX</span>
          </div>
          <div className="flex-1 min-h-0">
            <DigitalTwinPanel />
          </div>
          {/* Zone C Mid Left: Power Split Optimization */}
          <div className="h-[210px]">
            <PowerSplitPanel />
          </div>
        </div>

        {/* Column 4 (Right): Environmental & Mission Dynamics */}
        <div className="col-span-3 flex flex-col space-y-1.5 min-h-0">
          {/* Right Panel Sub-Header Tab Bar */}
          <div className="flex items-center space-x-1 bg-[#111A2E] p-1 rounded border border-[#1A2740] flex-shrink-0">
            <button
              onClick={() => setRightPanelTab('HIGH_ALTITUDE')}
              className={`flex-1 py-1 px-1.5 text-[9px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase transition-all ${
                rightPanelTab === 'HIGH_ALTITUDE'
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              <span>HIGH ALTITUDE</span>
            </button>
            <button
              onClick={() => setRightPanelTab('THERMAL')}
              className={`flex-1 py-1 px-1.5 text-[9px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase transition-all ${
                rightPanelTab === 'THERMAL'
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm'
                  : 'text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <Thermometer className="w-3 h-3" />
              <span>THERMAL MONITOR</span>
            </button>
          </div>

          <div className="flex-1 min-h-0">
            {rightPanelTab === 'HIGH_ALTITUDE' ? (
              <HighAltitudeMonitorPanel />
            ) : (
              <ThermalMonitorPanel />
            )}
          </div>

          {/* Zone C Mid Right: Mission Profile Chart */}
          <div className="h-[210px]">
            <MissionProfileChartPanel />
          </div>
        </div>
      </div>

      {/* Zone D: Analytics Strip at Bottom */}
      <div className="h-[125px] flex-shrink-0">
        <AnalyticsStrip />
      </div>
    </div>
  );
};

