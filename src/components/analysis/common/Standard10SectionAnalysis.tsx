import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  Database, 
  FunctionSquare, 
  Layers, 
  Activity, 
  FileText, 
  TrendingUp, 
  Sliders, 
  Compass, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  BarChart2, 
  Table as TableIcon
} from 'lucide-react';
import { MissionAnalysisResult, NormalizedFrame, TimelineSegment } from '../../../analysis/types';

export interface StandardSectionData {
  // 1. RESULT
  result: {
    title?: string;
    summaryText: string;
    metrics: Array<{ label: string; value: string | number; unit?: string; status?: 'VALID' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE'; note?: string }>;
    customComponent?: React.ReactNode;
  };
  // 2. DATA
  data: {
    datasetName: string;
    variablesUsed: string[];
    samplingRate: string;
    totalFrames: number;
    missingSensors: string[];
    sensorQualityScorePct: number;
    notes?: string;
  };
  // 3. METHODOLOGY
  methodology: {
    governingEquation: string;
    numericalMethod: string;
    stepByStepProcedure: string[];
    standardsReference?: string;
  };
  // 4. PHYSICS INTERPRETATION
  physicsInterpretation: {
    corePrinciple: string;
    whyItMakesSense: string;
    observedTrendExplanation: string;
  };
  // 5. TIMELINE
  timeline: {
    phaseBreakdown: Array<{ phase: string; durationMin: number; valueStart: string | number; valueEnd: string | number; delta: string | number; impactNote?: string }>;
    keyEvents: Array<{ timeIso: string; relSec: number; event: string; parameterValue: string }>;
  };
  // 6. IMPACT
  impact: {
    missionScopeImpact: string;
    performanceMarginImpact: string;
    safetyThermalImpact: string;
  };
  // 7. PREDICTION
  prediction: {
    available: boolean;
    extrapolationSummary: string;
    projectedEndState?: string;
    confidenceLevel?: string;
    unavailableReason?: string;
  };
  // 8. OPTIMIZATION
  optimization: {
    possibleAdjustments: string[];
    potentialGain: string;
    tradeOffs: string;
  };
  // 9. RECOMMENDATION
  recommendation: {
    actionItems: string[];
    pilotGuidance?: string;
    engineeringAction?: string;
  };
  // 10. LIMITATIONS
  limitations: {
    modelAssumptions: string[];
    sensorAccuracyLimits: string;
    environmentalUncertainty: string;
  };
}

interface Standard10SectionProps {
  moduleNumber: number;
  moduleTitle: string;
  category: string;
  equationBadge?: string;
  description: string;
  analysisResult: MissionAnalysisResult;
  sectionData: StandardSectionData;
  chartComponent?: React.ReactNode;
  tableData?: {
    columns: string[];
    rows: Array<Record<string, string | number>>;
  };
  calculationCards?: React.ReactNode;
}

export const Standard10SectionAnalysis: React.FC<Standard10SectionProps> = ({
  moduleNumber,
  moduleTitle,
  category,
  equationBadge,
  description,
  analysisResult,
  sectionData,
  chartComponent,
  tableData,
  calculationCards
}) => {
  const [activeSection, setActiveSection] = useState<string>('ALL');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    RESULT: true,
    DATA: true,
    METHODOLOGY: true,
    PHYSICS: true,
    TIMELINE: true,
    IMPACT: true,
    PREDICTION: true,
    OPTIMIZATION: true,
    RECOMMENDATION: true,
    LIMITATIONS: true
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionKeys = [
    { id: 'RESULT', label: '1. RESULT', icon: CheckCircle2, color: '#00E87A' },
    { id: 'DATA', label: '2. DATA', icon: Database, color: '#00A8FF' },
    { id: 'METHODOLOGY', label: '3. METHODOLOGY', icon: FunctionSquare, color: '#FFB800' },
    { id: 'PHYSICS', label: '4. PHYSICS INTERPRETATION', icon: Activity, color: '#00E87A' },
    { id: 'TIMELINE', label: '5. TIMELINE', icon: Clock, color: '#00A8FF' },
    { id: 'IMPACT', label: '6. IMPACT', icon: ShieldAlert, color: '#FF3B30' },
    { id: 'PREDICTION', label: '7. PREDICTION', icon: TrendingUp, color: '#FFB800' },
    { id: 'OPTIMIZATION', label: '8. OPTIMIZATION', icon: Sliders, color: '#00A8FF' },
    { id: 'RECOMMENDATION', label: '9. RECOMMENDATION', icon: CheckCircle2, color: '#00E87A' },
    { id: 'LIMITATIONS', label: '10. LIMITATIONS', icon: Info, color: '#8A9BBE' }
  ];

  const isVisible = (id: string) => activeSection === 'ALL' || activeSection === id;

  return (
    <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto custom-scrollbar select-none">
      {/* Module Navigation Jump Bar */}
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-2 flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSection('ALL')}
          className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold transition-colors whitespace-nowrap ${
            activeSection === 'ALL'
              ? 'bg-[#00A8FF] text-[#0A0F1E]'
              : 'bg-[#111827] text-[#8A9BBE] hover:text-[#E8EDF7] hover:bg-[#172236]'
          }`}
        >
          SHOW ALL 10 SECTIONS
        </button>
        <div className="h-4 w-px bg-[#1F2D45] mx-1" />
        <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar">
          {sectionKeys.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`px-2 py-1 rounded text-[9px] font-mono-data font-bold flex items-center space-x-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#172236] text-[#E8EDF7] border border-[#00A8FF]'
                    : 'text-[#8A9BBE] hover:text-[#E8EDF7] hover:bg-[#111827]'
                }`}
              >
                <Icon className="w-3 h-3" style={{ color: sec.color }} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────── SECTION 1: RESULT ────────────────── */}
      {isVisible('RESULT') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00E87A]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                1. RESULT — What Was Measured / Calculated?
              </span>
            </div>
            <button onClick={() => toggleSection('RESULT')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.RESULT ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.RESULT && (
            <div className="space-y-3">
              {/* Summary Sentence */}
              <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5 text-xs font-mono-data text-[#E8EDF7] leading-relaxed">
                <span className="text-[#00E87A] font-bold uppercase mr-1.5">[CALCULATED RESULT]:</span>
                {sectionData.result.summaryText}
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-data text-[10px]">
                {sectionData.result.metrics.map((m, idx) => (
                  <div key={idx} className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2 flex flex-col justify-between">
                    <span className="text-[#8A9BBE] font-semibold truncate">{m.label}</span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-[#00E87A]">{m.value}</span>
                      {m.unit && <span className="text-[9px] text-[#00A8FF]">{m.unit}</span>}
                    </div>
                    {m.note && <span className="text-[8px] text-[#8A9BBE]/80 mt-0.5 truncate">{m.note}</span>}
                  </div>
                ))}
              </div>

              {/* Custom Component or Calculation Cards */}
              {calculationCards && (
                <div className="pt-1">
                  <div className="text-[10px] font-mono-data font-bold text-[#00A8FF] uppercase mb-1.5 flex items-center space-x-1">
                    <FunctionSquare className="w-3.5 h-3.5" />
                    <span>Physics Calculation Cards & Equations</span>
                  </div>
                  {calculationCards}
                </div>
              )}

              {/* Interactive Synchronized Chart */}
              {chartComponent && (
                <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono-data border-b border-[#1F2D45]/60 pb-1.5">
                    <span className="text-[#00A8FF] font-bold flex items-center space-x-1 uppercase">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Synchronized Telemetry Trend Chart</span>
                    </span>
                    <span className="text-[#8A9BBE]">Sample Rate: {sectionData.data.samplingRate}</span>
                  </div>
                  <div className="h-[220px] w-full">
                    {chartComponent}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 2: DATA ────────────────── */}
      {isVisible('DATA') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#00A8FF]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                2. DATA — What Dataset & Variables Were Used?
              </span>
            </div>
            <button onClick={() => toggleSection('DATA')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.DATA ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.DATA && (
            <div className="space-y-2.5 text-[10px] font-mono-data">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#8A9BBE] block font-semibold">Active Telemetry Stream:</span>
                  <span className="text-[#E8EDF7] font-bold">{sectionData.data.datasetName}</span>
                </div>
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#8A9BBE] block font-semibold">Usable Telemetry Frames:</span>
                  <span className="text-[#00E87A] font-bold">{sectionData.data.totalFrames} frames ({sectionData.data.samplingRate})</span>
                </div>
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#8A9BBE] block font-semibold">Sensor Quality Score:</span>
                  <span className="text-[#00A8FF] font-bold">{sectionData.data.sensorQualityScorePct.toFixed(1)}% Verified</span>
                </div>
              </div>

              <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#00A8FF] font-bold block uppercase mb-1">Telemetry Variables Consumed:</span>
                <div className="flex flex-wrap gap-1">
                  {sectionData.data.variablesUsed.map((v, i) => (
                    <span key={i} className="bg-[#172236] border border-[#1F2D45] text-[#C5D1E8] px-2 py-0.5 rounded text-[9px]">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {sectionData.data.missingSensors.length > 0 ? (
                <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded p-2.5 text-[#FF3B30]">
                  <div className="flex items-center space-x-1.5 font-bold uppercase mb-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Detected Missing Sensors (Unavailable Data):</span>
                  </div>
                  <p className="text-[#8A9BBE]">
                    The following telemetry streams were absent from dataset and marked unavailable:{' '}
                    <span className="text-[#FF3B30] font-bold">{sectionData.data.missingSensors.join(', ')}</span>.
                  </p>
                </div>
              ) : (
                <div className="bg-[#00E87A]/10 border border-[#00E87A]/30 rounded p-2 text-[#00E87A] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>All required physical sensors are active and verified in telemetry stream.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 3: METHODOLOGY ────────────────── */}
      {isVisible('METHODOLOGY') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <FunctionSquare className="w-4 h-4 text-[#FFB800]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                3. METHODOLOGY — How Was It Calculated?
              </span>
            </div>
            <button onClick={() => toggleSection('METHODOLOGY')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.METHODOLOGY ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.METHODOLOGY && (
            <div className="space-y-2.5 text-[10px] font-mono-data">
              <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#FFB800] font-bold block uppercase mb-1">Governing Physical Formulation:</span>
                <div className="bg-[#111827] border border-[#1F2D45] p-2 rounded text-[#00E87A] font-bold text-xs">
                  {sectionData.methodology.governingEquation}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#8A9BBE] font-semibold block mb-0.5">Numerical Execution Scheme:</span>
                  <p className="text-[#E8EDF7]">{sectionData.methodology.numericalMethod}</p>
                </div>
                {sectionData.methodology.standardsReference && (
                  <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                    <span className="text-[#8A9BBE] font-semibold block mb-0.5">Regulatory Standard / Reference:</span>
                    <p className="text-[#00A8FF] font-bold">{sectionData.methodology.standardsReference}</p>
                  </div>
                )}
              </div>

              <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#8A9BBE] font-bold uppercase block mb-1">Calculation Step-by-Step Procedure:</span>
                <ol className="list-decimal list-inside space-y-1 text-[#E8EDF7]">
                  {sectionData.methodology.stepByStepProcedure.map((step, idx) => (
                    <li key={idx} className="leading-normal">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 4: PHYSICS INTERPRETATION ────────────────── */}
      {isVisible('PHYSICS') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00E87A]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                4. PHYSICS INTERPRETATION — Why Does The Result Make Physical Sense?
              </span>
            </div>
            <button onClick={() => toggleSection('PHYSICS')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.PHYSICS ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.PHYSICS && (
            <div className="space-y-2 text-[10px] font-mono-data">
              <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#00E87A] font-bold uppercase block mb-1">Core Physical Principle:</span>
                <p className="text-[#E8EDF7] leading-relaxed">{sectionData.physicsInterpretation.corePrinciple}</p>
              </div>

              <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#00A8FF] font-bold uppercase block mb-1">Physical Consistency Validation:</span>
                <p className="text-[#E8EDF7] leading-relaxed">{sectionData.physicsInterpretation.whyItMakesSense}</p>
              </div>

              <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#FFB800] font-bold uppercase block mb-1">Observed Telemetry Trend Explanation:</span>
                <p className="text-[#E8EDF7] leading-relaxed">{sectionData.physicsInterpretation.observedTrendExplanation}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 5: TIMELINE ────────────────── */}
      {isVisible('TIMELINE') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#00A8FF]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                5. TIMELINE — When Did It Happen?
              </span>
            </div>
            <button onClick={() => toggleSection('TIMELINE')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.TIMELINE ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.TIMELINE && (
            <div className="space-y-3 text-[10px] font-mono-data">
              {/* Phase Breakdown Table */}
              <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded overflow-hidden">
                <div className="bg-[#111827] px-3 py-1.5 text-[#00A8FF] font-bold uppercase border-b border-[#1F2D45] flex items-center justify-between">
                  <span>Flight Phase Temporal Breakdown</span>
                  <span className="text-[#8A9BBE] font-normal text-[9px]">{analysisResult.timeline.segments.length} Detected Phases</span>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#1F2D45] text-[#8A9BBE] uppercase text-[9px] bg-[#0E1626]">
                        <th className="px-3 py-1.5">Phase</th>
                        <th className="px-3 py-1.5">Duration</th>
                        <th className="px-3 py-1.5">Start Val</th>
                        <th className="px-3 py-1.5">End Val</th>
                        <th className="px-3 py-1.5">Delta</th>
                        <th className="px-3 py-1.5">Operational Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2D45]/50 text-[#E8EDF7]">
                      {sectionData.timeline.phaseBreakdown.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#172236]/40">
                          <td className="px-3 py-1.5 font-bold text-[#00A8FF] uppercase">{row.phase}</td>
                          <td className="px-3 py-1.5">{row.durationMin.toFixed(1)} min</td>
                          <td className="px-3 py-1.5">{row.valueStart}</td>
                          <td className="px-3 py-1.5">{row.valueEnd}</td>
                          <td className="px-3 py-1.5 font-bold text-[#00E87A]">{row.delta}</td>
                          <td className="px-3 py-1.5 text-[#8A9BBE]">{row.impactNote || 'Nominal execution'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Events List */}
              {sectionData.timeline.keyEvents.length > 0 && (
                <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2.5">
                  <span className="text-[#FFB800] font-bold uppercase block mb-1">Key Chronological Events:</span>
                  <div className="space-y-1">
                    {sectionData.timeline.keyEvents.map((evt, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[9px] bg-[#111827] border border-[#1F2D45] p-1.5 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-[#00A8FF] font-bold">t+{evt.relSec.toFixed(0)}s</span>
                          <span className="text-[#E8EDF7]">{evt.event}</span>
                        </div>
                        <span className="text-[#00E87A] font-bold">{evt.parameterValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 6: IMPACT ────────────────── */}
      {isVisible('IMPACT') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#FF3B30]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                6. IMPACT — How Did It Affect The Mission?
              </span>
            </div>
            <button onClick={() => toggleSection('IMPACT')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.IMPACT ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.IMPACT && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px] font-mono-data">
              <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#00A8FF] font-bold uppercase block mb-1">Mission Scope Impact:</span>
                <p className="text-[#E8EDF7] leading-relaxed">{sectionData.impact.missionScopeImpact}</p>
              </div>

              <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#00E87A] font-bold uppercase block mb-1">Performance Margin Impact:</span>
                <p className="text-[#E8EDF7] leading-relaxed">{sectionData.impact.performanceMarginImpact}</p>
              </div>

              <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#FF3B30] font-bold uppercase block mb-1">Safety & Thermal Impact:</span>
                <p className="text-[#E8EDF7] leading-relaxed">{sectionData.impact.safetyThermalImpact}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 7: PREDICTION ────────────────── */}
      {isVisible('PREDICTION') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#FFB800]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                7. PREDICTION — What Is Likely To Happen Next?
              </span>
            </div>
            <button onClick={() => toggleSection('PREDICTION')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.PREDICTION ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.PREDICTION && (
            <div className="space-y-2 text-[10px] font-mono-data">
              {sectionData.prediction.available ? (
                <>
                  <div className="bg-[#111827] border border-[#1F2D45] rounded p-2.5">
                    <span className="text-[#FFB800] font-bold uppercase block mb-1">Extrapolation & Trend Forecast:</span>
                    <p className="text-[#E8EDF7] leading-relaxed">{sectionData.prediction.extrapolationSummary}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2">
                      <span className="text-[#8A9BBE] font-semibold block">Projected End State:</span>
                      <span className="text-[#00E87A] font-bold">{sectionData.prediction.projectedEndState}</span>
                    </div>
                    <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2">
                      <span className="text-[#8A9BBE] font-semibold block">Model Confidence Level:</span>
                      <span className="text-[#00A8FF] font-bold">{sectionData.prediction.confidenceLevel || '95% Confidence Interval'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-3 text-[#8A9BBE] flex items-center space-x-2">
                  <Info className="w-4 h-4 text-[#FFB800]" />
                  <span>{sectionData.prediction.unavailableReason || 'Prediction model is not applicable or insufficient extrapolation data available for this parameter.'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 8: OPTIMIZATION ────────────────── */}
      {isVisible('OPTIMIZATION') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#00A8FF]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                8. OPTIMIZATION — What Could Be Changed?
              </span>
            </div>
            <button onClick={() => toggleSection('OPTIMIZATION')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.OPTIMIZATION ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.OPTIMIZATION && (
            <div className="space-y-2 text-[10px] font-mono-data">
              <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#00A8FF] font-bold uppercase block mb-1">Candidate Operational Adjustments:</span>
                <ul className="list-disc list-inside space-y-1 text-[#E8EDF7]">
                  {sectionData.optimization.possibleAdjustments.map((adj, idx) => (
                    <li key={idx}>{adj}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#00E87A] font-bold block mb-0.5">Estimated Potential Efficiency Gain:</span>
                  <p className="text-[#E8EDF7]">{sectionData.optimization.potentialGain}</p>
                </div>
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#FFB800] font-bold block mb-0.5">Engineering Trade-offs Involved:</span>
                  <p className="text-[#E8EDF7]">{sectionData.optimization.tradeOffs}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 9: RECOMMENDATION ────────────────── */}
      {isVisible('RECOMMENDATION') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00E87A]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                9. RECOMMENDATION — What Should Be Done?
              </span>
            </div>
            <button onClick={() => toggleSection('RECOMMENDATION')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.RECOMMENDATION ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.RECOMMENDATION && (
            <div className="space-y-2 text-[10px] font-mono-data">
              <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#00E87A] font-bold uppercase block mb-1">Actionable Flight Items:</span>
                <ul className="list-disc list-inside space-y-1 text-[#E8EDF7]">
                  {sectionData.recommendation.actionItems.map((item, idx) => (
                    <li key={idx} className="font-semibold">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sectionData.recommendation.pilotGuidance && (
                  <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                    <span className="text-[#00A8FF] font-bold block mb-0.5">Pilot / Flight Crew Guidance:</span>
                    <p className="text-[#E8EDF7]">{sectionData.recommendation.pilotGuidance}</p>
                  </div>
                )}
                {sectionData.recommendation.engineeringAction && (
                  <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                    <span className="text-[#FFB800] font-bold block mb-0.5">Engineering Maintenance Action:</span>
                    <p className="text-[#E8EDF7]">{sectionData.recommendation.engineeringAction}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SECTION 10: LIMITATIONS ────────────────── */}
      {isVisible('LIMITATIONS') && (
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-[#8A9BBE]" />
              <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight uppercase">
                10. LIMITATIONS — What Data / Model Limitations Exist?
              </span>
            </div>
            <button onClick={() => toggleSection('LIMITATIONS')} className="text-[#8A9BBE] hover:text-white">
              {expandedSections.LIMITATIONS ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.LIMITATIONS && (
            <div className="space-y-2 text-[10px] font-mono-data">
              <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2.5">
                <span className="text-[#8A9BBE] font-bold uppercase block mb-1">Model Physical Assumptions & Scope Limits:</span>
                <ul className="list-disc list-inside space-y-1 text-[#8A9BBE]">
                  {sectionData.limitations.modelAssumptions.map((asm, idx) => (
                    <li key={idx}>{asm}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#8A9BBE] font-semibold block mb-0.5">Sensor Precision & Noise Boundary:</span>
                  <p className="text-[#8A9BBE]">{sectionData.limitations.sensorAccuracyLimits}</p>
                </div>
                <div className="bg-[#111827] border border-[#1F2D45] rounded p-2">
                  <span className="text-[#8A9BBE] font-semibold block mb-0.5">Atmospheric & Environmental Uncertainty:</span>
                  <p className="text-[#8A9BBE]">{sectionData.limitations.environmentalUncertainty}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
