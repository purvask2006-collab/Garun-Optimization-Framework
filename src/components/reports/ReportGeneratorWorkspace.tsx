import React, { useState } from 'react';
import { ReportExportData } from './ReportExporter';
import { ReportCustomizerPanel } from './ReportCustomizerPanel';
import { ReportPreviewDocument } from './ReportPreviewDocument';
import { useGarunStore } from '../../store/useGarunStore';
import { 
  FileText, 
  Printer, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

export const ReportGeneratorWorkspace: React.FC = () => {
  const { 
    selectedAircraft, 
    selectedMissionProfile, 
    simulationResult, 
    optimizationRun, 
    activeTelemetryFrame 
  } = useGarunStore();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Initial Report State populated with live Store data
  const [reportData, setReportData] = useState<ReportExportData>({
    reportId: `HAL-RPT-${(Date.now() % 900000 + 100000).toString().padStart(6, '0')}`,
    title: `${selectedAircraft.name} - ${selectedMissionProfile.name} Technical & Performance Evaluation`,
    reportType: 'TECHNICAL',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    classification: 'CLASSIFICATION: SECRET / LEVEL-4',
    author: 'HAL Defense R&D Propulsion Division',
    aircraft: selectedAircraft,
    mission: selectedMissionProfile,
    simulation: simulationResult,
    optimization: optimizationRun,
    telemetry: activeTelemetryFrame,
    engineerNotes: 'All power-split ratios, specific fuel consumption bounds, and battery thermal operating profiles meet FAR CS-23 airworthiness criteria. Recommended for flight testing approval.',
    includedSections: [
      'exec_summary',
      'vehicle_definition',
      'propulsion_specs',
      'mission_analysis',
      'optimization_results',
      'validation_checklist',
      'engineering_assumptions'
    ]
  });

  const handleUpdateReportData = (updated: Partial<ReportExportData>) => {
    setReportData(prev => ({ ...prev, ...updated }));
  };

  return (
    <div id="report-generator-workspace" className="flex-1 bg-[#0A0F1E] p-2 flex flex-col space-y-2 overflow-hidden select-none h-full">
      {/* 1. TOP REPORT GENERATOR HEADER BAR */}
      <div className="bg-[#0F1729] p-2.5 rounded border border-[#1A2740] flex items-center justify-between flex-shrink-0 space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-[#00A8FF]/10 border border-[#00A8FF]/30 flex items-center justify-center text-[#00A8FF]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold font-sans-ui text-white uppercase tracking-wider flex items-center space-x-2">
              <span>HAL OFFICIAL AEROSPACE REPORT GENERATOR & EXPORT STUDIO</span>
              <span className="bg-[#00E87A]/20 text-[#00E87A] text-[8.5px] px-1.5 py-0.2 rounded border border-[#00E87A]/40 font-mono-data">
                DEFENSE R&D FORMATTING ENGINE
              </span>
            </h1>
            <p className="text-[9.5px] font-mono-data text-[#8A9BBE]">
              PDF, CSV & JSON EXPORT FOR TECHNICAL REPORTS, MISSION SUMMARIES & OPTIMIZATION RESULTS
            </p>
          </div>
        </div>

        {/* View Controls: Zoom & Print */}
        <div className="flex items-center space-x-2 font-mono-data text-[10px]">
          <div className="flex items-center space-x-1 bg-[#172236] px-2 py-1 rounded border border-[#1A2740]">
            <button onClick={() => setZoomLevel(Math.max(60, zoomLevel - 15))} className="text-[#8A9BBE] hover:text-white">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[#00A8FF] font-bold px-1">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))} className="text-[#8A9BBE] hover:text-white">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 bg-[#172236] border border-[#1A2740] rounded text-[#8A9BBE] hover:text-white transition-colors"
            title="Toggle Document Focus Mode"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTENT GRID */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Left Column: Report Controls & Customizer (Width 4/12 or hidden if fullscreen) */}
        {!isFullScreen && (
          <div className="col-span-4 h-full min-h-0">
            <ReportCustomizerPanel
              reportData={reportData}
              onUpdateReportData={handleUpdateReportData}
            />
          </div>
        )}

        {/* Right Column: Live Printable Document Preview (Width 8/12 or 12/12 if fullscreen) */}
        <div className={`${isFullScreen ? 'col-span-12' : 'col-span-8'} h-full min-h-0 bg-[#0A0F1E] rounded border border-[#1A2740] p-4 overflow-y-auto flex justify-center`}>
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full transition-transform duration-150"
          >
            <ReportPreviewDocument data={reportData} />
          </div>
        </div>
      </div>
    </div>
  );
};
