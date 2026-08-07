import React, { useState, useMemo } from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { useMissionAnalysisStore } from '../../../store/useMissionAnalysis';
import { useGarunStore } from '../../../store/useGarunStore';
import { generateEngineeringRecommendations, EngineeringRecommendation } from '../../../analysis/recommendationEngine';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Filter,
  Search,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Award
} from 'lucide-react';

export const RecommendationsModule: React.FC = () => {
  const { analysisResult } = useMissionAnalysisStore();
  const { vehicleInputs, simulationParams } = useGarunStore();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Generate real, data-driven recommendations across ALL modules
  const recommendations: EngineeringRecommendation[] = useMemo(() => {
    return generateEngineeringRecommendations(analysisResult, vehicleInputs, simulationParams);
  }, [analysisResult, vehicleInputs, simulationParams]);

  // Filter logic
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchCat = categoryFilter === 'ALL' || rec.category === categoryFilter;
      const matchPrio = priorityFilter === 'ALL' || rec.confidence === priorityFilter;
      const textToSearch = `${rec.moduleName} ${rec.finding} ${rec.cause} ${rec.impact} ${rec.recommendation} ${rec.expectedEffect}`.toLowerCase();
      const matchSearch = searchTerm === '' || textToSearch.includes(searchTerm.toLowerCase());
      return matchCat && matchPrio && matchSearch;
    });
  }, [recommendations, categoryFilter, priorityFilter, searchTerm]);

  const criticalCount = recommendations.filter(r => r.confidence === 'CRITICAL').length;
  const highCount = recommendations.filter(r => r.confidence === 'HIGH').length;

  return (
    <BaseModuleFrame
      moduleNumber={19}
      title="Automated Engineering Recommendation Engine"
      category="INTELLIGENCE & PREDICTION"
      equationBadge="AUTOMATED PHYSICS RULES"
      statusText="DATA-DRIVEN RECOMMENDATIONS ACTIVE"
      description="Automated 5-stage engineering diagnostic engine evaluating model findings, root causes, mission impacts, recommended operational adjustments, and calculated expected gains for every analysis module"
      inputsConsumed={[
        `18 Analysis Module Telemetry & Model Outputs`,
        `Turboshaft SFC Map & Power Splitting`,
        `Aerodynamic L/D & Drag Polar`,
        `Battery SOC & Thermal Degradation Limits`
      ]}
      physicsModel="Multi-Module Diagnostic Rule Engine with Quantitative Physics Impact & Sensitivity Analysis"
      outputsGenerated={[
        `${recommendations.length} Module-Specific Recommendations`,
        `5-Section Structured Diagnostics (Finding, Cause, Impact, Recommendation, Expected Effect)`,
        `Quantitative Performance Improvement Forecasts`
      ]}
    >
      <div className="space-y-4 font-sans-ui text-[#E8EDF7]">

        {/* ─── SUMMARY KPI STRIP & FILTER CONTROLS ───────────────────────────── */}
        <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-3.5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#1F2D45] pb-2.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#00E87A]" />
              <span className="text-xs font-bold text-[#E8EDF7] uppercase tracking-wider">
                AUTOMATED DIAGNOSTIC & RECOMMENDATION ENGINE SUMMARY
              </span>
            </div>
            <div className="flex items-center space-x-2 font-mono-data text-[10px]">
              <span className="bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40 px-2 py-0.5 rounded font-bold">
                {criticalCount} CRITICAL
              </span>
              <span className="bg-[#00E87A]/20 text-[#00E87A] border border-[#00E87A]/40 px-2 py-0.5 rounded font-bold">
                {highCount} HIGH CONFIDENCE
              </span>
              <span className="bg-[#172236] text-[#8A9BBE] border border-[#1F2D45] px-2 py-0.5 rounded">
                {recommendations.length} MODULES COVERED
              </span>
            </div>
          </div>

          {/* Interactive Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-data">
            {/* Category Filter */}
            <div className="flex items-center space-x-2 bg-[#111827] p-2 rounded border border-[#1F2D45]">
              <Filter className="w-3.5 h-3.5 text-[#00A8FF]" />
              <span className="text-[#8A9BBE] text-[10px]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#0E1626] text-[#E8EDF7] text-[11px] font-bold rounded px-2 py-1 border border-[#1F2D45] focus:outline-none w-full"
              >
                <option value="ALL">All Categories ({recommendations.length})</option>
                <option value="CORE FLIGHT & VEHICLE">Core Flight & Vehicle</option>
                <option value="AERODYNAMICS & ENVIRONMENT">Aerodynamics & Environment</option>
                <option value="INTELLIGENCE & PREDICTION">Intelligence & Prediction</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-2 bg-[#111827] p-2 rounded border border-[#1F2D45]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E87A]" />
              <span className="text-[#8A9BBE] text-[10px]">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#0E1626] text-[#E8EDF7] text-[11px] font-bold rounded px-2 py-1 border border-[#1F2D45] focus:outline-none w-full"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="flex items-center space-x-2 bg-[#111827] p-2 rounded border border-[#1F2D45]">
              <Search className="w-3.5 h-3.5 text-[#FFB800]" />
              <input
                type="text"
                placeholder="Search findings, recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0E1626] text-[#E8EDF7] text-[11px] font-bold rounded px-2 py-1 border border-[#1F2D45] focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* ─── RECOMMENDATIONS CARDS GRID (5 HEADINGS PER MODULE) ─────────────── */}
        <div className="space-y-3">
          {filteredRecommendations.length === 0 ? (
            <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-8 text-center text-[#8A9BBE] font-mono-data text-xs space-y-2">
              <AlertTriangle className="w-8 h-8 text-[#FFB800] mx-auto" />
              <p>No engineering recommendations match your current filter settings.</p>
              <button
                onClick={() => { setCategoryFilter('ALL'); setPriorityFilter('ALL'); setSearchTerm(''); }}
                className="px-3 py-1 bg-[#00A8FF] text-[#0A0F1E] font-bold rounded text-[11px] mt-2 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredRecommendations.map((rec) => (
              <div
                key={rec.moduleId}
                className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-3 shadow-md hover:border-[#00A8FF]/60 transition-all"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F2D45] pb-2.5 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono-data bg-[#172236] text-[#00A8FF] px-2 py-0.5 rounded font-bold border border-[#1F2D45]">
                      MOD #{rec.moduleNumber}
                    </span>
                    <h3 className="text-sm font-bold text-[#E8EDF7] font-sans-ui">
                      {rec.moduleName}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono-data">
                    <span className="text-[#8A9BBE] bg-[#111827] px-2 py-0.5 rounded border border-[#1F2D45]">
                      {rec.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold border ${
                        rec.confidence === 'CRITICAL'
                          ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]/40'
                          : rec.confidence === 'HIGH'
                          ? 'bg-[#00E87A]/20 text-[#00E87A] border-[#00E87A]/40'
                          : 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40'
                      }`}
                    >
                      {rec.confidence} PRIORITY
                    </span>
                  </div>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-data text-[10px]">
                  {rec.metrics.map((m, idx) => (
                    <div key={idx} className="bg-[#111827] border border-[#1F2D45] rounded p-1.5 flex flex-col justify-between">
                      <span className="text-[#8A9BBE] text-[9px] truncate">{m.label}</span>
                      <span className="text-[#00E87A] font-bold text-xs mt-0.5">{m.value}</span>
                    </div>
                  ))}
                </div>

                {/* 5 MANDATORY HEADINGS WITH COLOR-CODED DIAGNOSTIC PANELS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px] font-sans-ui">
                  
                  {/* 1. FINDING */}
                  <div className="bg-[#111827] border border-[#1F2D45] rounded-lg p-2.5 space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono-data font-bold text-[#00A8FF] flex items-center space-x-1 uppercase mb-1">
                        <Info className="w-3 h-3" />
                        <span>1. FINDING</span>
                      </span>
                      <p className="text-[#C5D1E8] text-[10.5px] leading-snug">
                        {rec.finding}
                      </p>
                    </div>
                  </div>

                  {/* 2. CAUSE */}
                  <div className="bg-[#111827] border border-[#1F2D45] rounded-lg p-2.5 space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono-data font-bold text-[#FFB800] flex items-center space-x-1 uppercase mb-1">
                        <Cpu className="w-3 h-3" />
                        <span>2. CAUSE</span>
                      </span>
                      <p className="text-[#C5D1E8] text-[10.5px] leading-snug">
                        {rec.cause}
                      </p>
                    </div>
                  </div>

                  {/* 3. IMPACT */}
                  <div className="bg-[#111827] border border-[#1F2D45] rounded-lg p-2.5 space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono-data font-bold text-[#FF3B30] flex items-center space-x-1 uppercase mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>3. IMPACT</span>
                      </span>
                      <p className="text-[#C5D1E8] text-[10.5px] leading-snug">
                        {rec.impact}
                      </p>
                    </div>
                  </div>

                  {/* 4. RECOMMENDATION */}
                  <div className="bg-[#111827] border border-[#00A8FF]/40 rounded-lg p-2.5 space-y-1 flex flex-col justify-between shadow-[0_0_10px_rgba(0,168,255,0.08)]">
                    <div>
                      <span className="text-[10px] font-mono-data font-bold text-[#00A8FF] flex items-center space-x-1 uppercase mb-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>4. RECOMMENDATION</span>
                      </span>
                      <p className="text-[#E8EDF7] font-medium text-[10.5px] leading-snug">
                        {rec.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* 5. EXPECTED EFFECT */}
                  <div className="bg-[#00E87A]/10 border border-[#00E87A]/40 rounded-lg p-2.5 space-y-1 flex flex-col justify-between shadow-[0_0_10px_rgba(0,232,122,0.1)]">
                    <div>
                      <span className="text-[10px] font-mono-data font-bold text-[#00E87A] flex items-center space-x-1 uppercase mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>5. EXPECTED EFFECT</span>
                      </span>
                      <p className="text-[#D1D5DB] font-semibold text-[10.5px] leading-snug">
                        {rec.expectedEffect}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </BaseModuleFrame>
  );
};
