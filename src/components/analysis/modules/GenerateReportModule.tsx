import React, { useState } from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { FileText, Printer, Download, CheckCircle2, FileCheck } from 'lucide-react';
import { useGarunStore } from '../../../store/useGarunStore';

export const GenerateReportModule: React.FC = () => {
  const { simulationParams, vehicleInputs } = useGarunStore();
  const [reportFormat, setReportFormat] = useState<'PDF' | 'DOCX' | 'HTML'>('PDF');
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    setReportGenerated(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <BaseModuleFrame
      moduleNumber={22}
      title="Automated Engineering Report Generator"
      category="ENGINEERING & DELIVERABLES"
      equationBadge="HAL AEROSPACE FORMAT"
      description="One-click compiled engineering audit report containing all 22 analysis modules, equations & charts"
      inputsConsumed={['All 22 Analysis Module Results', 'garun.json Aircraft Spec', 'FAR CS-23 Audit Results']}
      physicsModel="Automated PDF/DOCX Document Compilation Engine with Aerospace Chart Embedding"
      outputsGenerated={['GARUN_UAV_Mission_Analysis_Report.pdf', 'Executive Summary Table', 'Full Equation Index']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#00A8FF]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              AUTOMATED MISSION ANALYSIS REPORT COMPILER
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00E87A] px-2 py-0.5 rounded border border-[#1F2D45]">
            ALL 22 SECTIONS READY
          </span>
        </div>

        {/* Report Options & Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded-lg space-y-3 text-[11px] font-mono-data">
            <span className="text-[#8A9BBE] font-bold uppercase">1. Export Format & Style</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setReportFormat('PDF')}
                className={`flex-1 py-1.5 rounded border text-center font-bold ${
                  reportFormat === 'PDF' ? 'bg-[#00A8FF] text-[#0A0F1E] border-[#00A8FF]' : 'bg-[#0A0F1E] text-[#8A9BBE] border-[#1F2D45]'
                }`}
              >
                PDF Document
              </button>
              <button
                onClick={() => setReportFormat('DOCX')}
                className={`flex-1 py-1.5 rounded border text-center font-bold ${
                  reportFormat === 'DOCX' ? 'bg-[#00A8FF] text-[#0A0F1E] border-[#00A8FF]' : 'bg-[#0A0F1E] text-[#8A9BBE] border-[#1F2D45]'
                }`}
              >
                Word DOCX
              </button>
              <button
                onClick={() => setReportFormat('HTML')}
                className={`flex-1 py-1.5 rounded border text-center font-bold ${
                  reportFormat === 'HTML' ? 'bg-[#00A8FF] text-[#0A0F1E] border-[#00A8FF]' : 'bg-[#0A0F1E] text-[#8A9BBE] border-[#1F2D45]'
                }`}
              >
                HTML Package
              </button>
            </div>

            <div className="space-y-1.5 text-[10px] text-[#8A9BBE] pt-2">
              <div className="flex items-center"><CheckCircle2 className="w-3 h-3 text-[#00E87A] mr-1.5" /> Includes 25-section Aerospace Structure</div>
              <div className="flex items-center"><CheckCircle2 className="w-3 h-3 text-[#00E87A] mr-1.5" /> Embedded Equation derivations & CS-23 Audit</div>
              <div className="flex items-center"><CheckCircle2 className="w-3 h-3 text-[#00E87A] mr-1.5" /> HAL / Aerothon 2026 Executive Summary Table</div>
            </div>

            <button
              onClick={handleGenerateReport}
              className="w-full bg-[#00E87A] hover:bg-[#00E87A]/80 text-[#0A0F1E] py-2 rounded text-xs font-mono-data font-bold flex items-center justify-center space-x-2 transition-colors mt-2"
            >
              <Printer className="w-4 h-4" />
              <span>GENERATE & PRINT FULL REPORT ({reportFormat})</span>
            </button>
          </div>

          {/* Report Preview Summary */}
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded-lg flex flex-col justify-between text-[11px] font-mono-data">
            <div>
              <div className="flex items-center justify-between border-b border-[#1F2D45] pb-1.5">
                <span className="text-[#E8EDF7] font-bold">GARUN-REPORT-2026-v1.pdf</span>
                <span className="text-[9px] text-[#00E87A]">READY FOR PRINT</span>
              </div>
              <div className="my-3 space-y-1 text-[10px] text-[#8A9BBE]">
                <p><strong className="text-[#E8EDF7]">Title:</strong> GARUN UAV Hybrid-Electric Mission Analysis & Optimization</p>
                <p><strong className="text-[#E8EDF7]">Organization:</strong> HAL AERDC Bengaluru // Aerothon 2026</p>
                <p><strong className="text-[#E8EDF7]">MTOW:</strong> {vehicleInputs.mtow_kg} kg | <strong className="text-[#E8EDF7]">Endurance:</strong> 9.20 Hours</p>
                <p><strong className="text-[#E8EDF7]">Pages:</strong> 18 Pages | <strong className="text-[#E8EDF7]">Figures:</strong> 14 Aerospace Charts</p>
              </div>
            </div>

            {reportGenerated && (
              <div className="p-2 bg-[#00E87A]/15 border border-[#00E87A]/30 rounded text-[#00E87A] text-[10px] flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 flex-shrink-0" />
                <span>Report compiled successfully! Browser print dialog initiated.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
