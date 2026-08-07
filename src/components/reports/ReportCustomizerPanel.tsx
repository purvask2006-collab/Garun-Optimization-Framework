import React, { useState } from 'react';
import { ReportExportData, exportReportToPdf, exportReportToCsv, exportReportToJson } from './ReportExporter';
import { CornerReticle } from '../common/CornerReticle';
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileJson, 
  Check, 
  Sliders, 
  ShieldAlert, 
  Plus, 
  Settings2,
  Sparkles,
  Plane,
  Crosshair
} from 'lucide-react';
import { useGarunStore } from '../../store/useGarunStore';
import { DEFAULT_HAL_AIRCRAFT, DEFAULT_MISSION_PROFILES } from '../../constants/hal-constants';

interface ReportCustomizerPanelProps {
  reportData: ReportExportData;
  onUpdateReportData: (updated: Partial<ReportExportData>) => void;
}

export const ReportCustomizerPanel: React.FC<ReportCustomizerPanelProps> = ({
  reportData,
  onUpdateReportData
}) => {
  const { selectedAircraft, setSelectedAircraft, selectedMissionProfile, setSelectedMissionProfile } = useGarunStore();
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const handleExportCsv = () => {
    exportReportToCsv(reportData);
    showSuccess('CSV Dataset Downloaded');
  };

  const handleExportJson = () => {
    exportReportToJson(reportData);
    showSuccess('JSON Schema Downloaded');
  };

  const handleExportPdf = () => {
    exportReportToPdf();
    showSuccess('PDF Print Dialog Launched');
  };

  const showSuccess = (msg: string) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => setDownloadSuccessMessage(null), 3000);
  };

  const toggleSection = (sectionKey: string) => {
    const current = reportData.includedSections;
    if (current.includes(sectionKey)) {
      onUpdateReportData({ includedSections: current.filter(s => s !== sectionKey) });
    } else {
      onUpdateReportData({ includedSections: [...current, sectionKey] });
    }
  };

  return (
    <CornerReticle id="report-customizer-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden font-mono-data text-[9.5px]">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-white uppercase tracking-wider">
              REPORT GENERATOR CONTROLS
            </h2>
            <span className="text-[8.5px] text-[#00E87A]">
              HAL ENGINEERING EXPORT ENGINE
            </span>
          </div>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {downloadSuccessMessage && (
        <div className="bg-[#00E87A]/20 border border-[#00E87A] text-[#00E87A] p-2 rounded mb-3 flex items-center justify-between animate-fadeIn text-[9px] font-bold">
          <span className="flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>{downloadSuccessMessage}</span>
          </span>
        </div>
      )}

      {/* EXPORT BUTTONS ROW */}
      <div className="space-y-1.5 mb-4 flex-shrink-0">
        <span className="text-[#8A9BBE] text-[8.5px] font-bold uppercase block">1. EXPORT FORMAT</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleExportPdf}
            className="bg-[#00A8FF] hover:bg-[#0088CC] text-[#0A0F1E] font-bold py-2 rounded flex flex-col items-center justify-center space-y-1 transition-all shadow-md text-[9px]"
          >
            <Printer className="w-4 h-4" />
            <span>EXPORT PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-[#172236] hover:bg-[#00E87A] hover:text-[#0A0F1E] text-[#00E87A] border border-[#00E87A]/40 font-bold py-2 rounded flex flex-col items-center justify-center space-y-1 transition-all text-[9px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="bg-[#172236] hover:bg-[#FFB800] hover:text-[#0A0F1E] text-[#FFB800] border border-[#FFB800]/40 font-bold py-2 rounded flex flex-col items-center justify-center space-y-1 transition-all text-[9px]"
          >
            <FileJson className="w-4 h-4" />
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* REPORT TYPE SELECTOR */}
      <div className="space-y-1.5 mb-4 flex-shrink-0">
        <span className="text-[#8A9BBE] text-[8.5px] font-bold uppercase block">2. REPORT TYPE & TEMPLATE</span>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { id: 'TECHNICAL', title: 'TECHNICAL REPORT', desc: 'Full propulsion, power-split & CS-23 certification' },
            { id: 'MISSION_SUMMARY', title: 'MISSION SUMMARY', desc: 'ConOps trajectory, altitude profile & fuel burn' },
            { id: 'OPTIMIZATION', title: 'OPTIMIZATION RESULTS', desc: 'NSGA-II Pareto trade-offs & candidate comparison' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => onUpdateReportData({ reportType: type.id as any })}
              className={`p-2 rounded border text-left transition-all ${
                reportData.reportType === type.id
                  ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-white'
                  : 'bg-[#111A2E] border-[#1A2740] text-[#8A9BBE] hover:text-white'
              }`}
            >
              <div className="font-bold text-xs text-white uppercase flex justify-between items-center">
                <span>{type.title}</span>
                {reportData.reportType === type.id && <Check className="w-3.5 h-3.5 text-[#00A8FF]" />}
              </div>
              <p className="text-[8px] text-[#8A9BBE] mt-0.5">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* AIRCRAFT & MISSION CONTEXT SWITCHERS */}
      <div className="space-y-2 mb-4 bg-[#111A2E] p-2.5 rounded border border-[#1A2740] flex-shrink-0">
        <span className="text-[#8A9BBE] text-[8.5px] font-bold uppercase block">3. REPORT DATA SOURCE</span>
        
        <div>
          <label className="text-[8px] text-[#8A9BBE] block mb-1">AIRCRAFT PLATFORM</label>
          <select
            value={selectedAircraft.id}
            onChange={(e) => {
              const ac = DEFAULT_HAL_AIRCRAFT.find((a) => a.id === e.target.value);
              if (ac) {
                setSelectedAircraft(ac);
                onUpdateReportData({ aircraft: ac });
              }
            }}
            className="w-full bg-[#0F1729] border border-[#1A2740] rounded p-1.5 text-white text-[9px] focus:outline-none focus:border-[#00A8FF]"
          >
            {DEFAULT_HAL_AIRCRAFT.map((ac) => (
              <option key={ac.id} value={ac.id}>{ac.name} ({ac.type})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[8px] text-[#8A9BBE] block mb-1">MISSION CONOPS PROFILE</label>
          <select
            value={selectedMissionProfile.id}
            onChange={(e) => {
              const mp = DEFAULT_MISSION_PROFILES.find((p) => p.id === e.target.value);
              if (mp) {
                setSelectedMissionProfile(mp);
                onUpdateReportData({ mission: mp });
              }
            }}
            className="w-full bg-[#0F1729] border border-[#1A2740] rounded p-1.5 text-white text-[9px] focus:outline-none focus:border-[#00A8FF]"
          >
            {DEFAULT_MISSION_PROFILES.map((mp) => (
              <option key={mp.id} value={mp.id}>{mp.name} ({mp.category})</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTIONS INCLUDE / EXCLUDE CHECKBOXES */}
      <div className="space-y-1.5 mb-4 flex-1 overflow-y-auto">
        <span className="text-[#8A9BBE] text-[8.5px] font-bold uppercase block">4. INCLUDED REPORT SECTIONS</span>
        <div className="space-y-1">
          {[
            { key: 'exec_summary', label: '1. Executive Summary & Verdict' },
            { key: 'vehicle_definition', label: '2. Vehicle Definition & Weight Budget' },
            { key: 'propulsion_specs', label: '3. Propulsion & Electrical Architecture' },
            { key: 'mission_analysis', label: '4. Mission Analysis & Phase Breakdown' },
            { key: 'optimization_results', label: '5. NSGA-II Pareto Optimization' },
            { key: 'validation_checklist', label: '6. Airworthiness & Validation Checklist' },
            { key: 'engineering_assumptions', label: '7. Engineering Assumptions & Transparency' },
          ].map((sec) => {
            const isChecked = reportData.includedSections.includes(sec.key);
            return (
              <label
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-[#172236] border-[#00A8FF]/40 text-white'
                    : 'bg-[#111A2E]/50 border-[#1A2740] text-[#8A9BBE] opacity-60'
                }`}
              >
                <span>{sec.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="accent-[#00A8FF]"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* ENGINEER ANNOTATIONS INPUT */}
      <div className="space-y-1.5 flex-shrink-0">
        <span className="text-[#8A9BBE] text-[8.5px] font-bold uppercase block">5. CHIEF ENGINEER ANNOTATIONS</span>
        <textarea
          value={reportData.engineerNotes || ''}
          onChange={(e) => onUpdateReportData({ engineerNotes: e.target.value })}
          placeholder="Add custom engineering comments or certification notes..."
          className="w-full bg-[#111A2E] border border-[#1A2740] rounded p-2 text-white text-[9px] focus:outline-none focus:border-[#00A8FF] h-16 resize-none"
        />
      </div>
    </CornerReticle>
  );
};
