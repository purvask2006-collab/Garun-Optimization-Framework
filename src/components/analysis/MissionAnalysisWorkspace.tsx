import React, { useState } from 'react';
import { AnalysisHeader } from './AnalysisHeader';
import { AnalysisLeftNav } from './AnalysisLeftNav';
import { AnalysisModuleId } from './types';

// Import all 22 analysis modules
import { OverviewModule } from './modules/OverviewModule';
import { FlightTimelineModule } from './modules/FlightTimelineModule';
import { AerodynamicsModule } from './modules/AerodynamicsModule';
import { PropulsionModule } from './modules/PropulsionModule';
import { FuelModule } from './modules/FuelModule';
import { BatteryModule } from './modules/BatteryModule';
import { HybridPowerModule } from './modules/HybridPowerModule';
import { EnergyModule } from './modules/EnergyModule';
import { EnduranceRangeModule } from './modules/EnduranceRangeModule';
import { EnvironmentModule } from './modules/EnvironmentModule';
import { ThermalModule } from './modules/ThermalModule';
import { StabilityModule } from './modules/StabilityModule';
import { MissionEfficiencyModule } from './modules/MissionEfficiencyModule';
import { AnomaliesModule } from './modules/AnomaliesModule';
import { LiveAnalysisModule } from './modules/LiveAnalysisModule';
import { PredictionModule } from './modules/PredictionModule';
import { WhatIfModule } from './modules/WhatIfModule';
import { OptimizationModule } from './modules/OptimizationModule';
import { RecommendationsModule } from './modules/RecommendationsModule';
import { MethodologyModule } from './modules/MethodologyModule';
import { DataQualityModule } from './modules/DataQualityModule';
import { GenerateReportModule } from './modules/GenerateReportModule';

export const MissionAnalysisWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisModuleId>('overview');
  const [selectedMission, setSelectedMission] = useState('AEROTHON_STD');
  const [selectedDataset, setSelectedDataset] = useState('GARUN_DB_V2');

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'overview': return <OverviewModule />;
      case 'flight-timeline': return <FlightTimelineModule />;
      case 'aerodynamics': return <AerodynamicsModule />;
      case 'propulsion': return <PropulsionModule />;
      case 'fuel': return <FuelModule />;
      case 'battery': return <BatteryModule />;
      case 'hybrid-power': return <HybridPowerModule />;
      case 'energy': return <EnergyModule />;
      case 'endurance-range': return <EnduranceRangeModule />;
      case 'environment': return <EnvironmentModule />;
      case 'thermal': return <ThermalModule />;
      case 'stability': return <StabilityModule />;
      case 'mission-efficiency': return <MissionEfficiencyModule />;
      case 'anomalies': return <AnomaliesModule />;
      case 'live-analysis': return <LiveAnalysisModule />;
      case 'prediction': return <PredictionModule />;
      case 'what-if': return <WhatIfModule />;
      case 'optimization': return <OptimizationModule />;
      case 'recommendations': return <RecommendationsModule />;
      case 'methodology': return <MethodologyModule />;
      case 'data-quality': return <DataQualityModule />;
      case 'generate-report': return <GenerateReportModule />;
      default: return <OverviewModule />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0F1E] overflow-hidden">
      {/* Top Analysis Header */}
      <AnalysisHeader
        selectedMission={selectedMission}
        onMissionChange={setSelectedMission}
        selectedDataset={selectedDataset}
        onDatasetChange={setSelectedDataset}
        activeModuleId={activeTab}
        onModuleSelect={setActiveTab}
      />

      {/* Main Analysis Body: Left Nav + Dynamic Module Container */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Side Analysis Navigation */}
        <AnalysisLeftNav
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        {/* Live Analysis Display Area */}
        <main className="flex-1 flex flex-col bg-[#0A0F1E] min-w-0 overflow-hidden">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};
