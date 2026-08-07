import React, { useState, useEffect } from 'react';
import { 
  ParetoFrontChart, 
  GARUN_DESIGN_POINT_REFERENCE 
} from './ParetoFrontChart';
import { 
  OptimizationVariablesPanel, 
  INITIAL_DECISION_VARIABLES, 
  DecisionVariablesState 
} from './OptimizationVariablesPanel';
import { ConstraintsViolationPanel } from './ConstraintsViolationPanel';
import { FitnessEvolutionChart } from './FitnessEvolutionChart';
import { SensitivityAnalysisPanel } from './SensitivityAnalysisPanel';
import { ParallelCoordinatesPlot } from './ParallelCoordinatesPlot';
import { OptimizationSummaryCard } from './OptimizationSummaryCard';
import { Dna, Sparkles, Layers, BarChart2 } from 'lucide-react';
import { 
  runParametricDesignSweep, 
  EvaluatedDesignCandidate 
} from '../../physics/optimizationEngine';

export const OptimizationWorkspace: React.FC = () => {
  // Active Workspace Sub-Tab
  const [workspaceTab, setWorkspaceTab] = useState<'ALL_ANALYTICS' | 'PARETO_TRADE' | 'PARALLEL_COORDINATES' | 'CONVERGENCE_SENSITIVITY'>('ALL_ANALYTICS');

  // Decision Variables State
  const [decisionVars, setDecisionVars] = useState<DecisionVariablesState>(INITIAL_DECISION_VARIABLES);

  // Real Computed Candidates State
  const [candidates, setCandidates] = useState<EvaluatedDesignCandidate[]>(() => {
    return runParametricDesignSweep(INITIAL_DECISION_VARIABLES.motorKw);
  });

  // Selected Active Candidate
  const [selectedCandidate, setSelectedCandidate] = useState<EvaluatedDesignCandidate>(() => {
    return candidates.find((c) => c.isGarunDesign) || candidates[0];
  });

  // Optimization Run State
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [evaluatedCount, setEvaluatedCount] = useState<number>(candidates.length);

  // Run Real Parametric Sweep Computation
  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setEvaluatedCount(0);

    setTimeout(() => {
      const results = runParametricDesignSweep(decisionVars.motorKw, (progress) => {
        setEvaluatedCount(progress);
      });

      setCandidates(results);
      setEvaluatedCount(results.length);

      // Select matching decision variable candidate or rank 1 pareto
      const matching = results.find(
        (c) => c.batteryKwh === decisionVars.batteryKwh && c.engineKw === decisionVars.engineKw
      ) || results.find((c) => c.rank === 1) || results[0];

      setSelectedCandidate(matching);
      setIsOptimizing(false);
    }, 400);
  };

  const paretoCount = candidates.filter((c) => c.rank === 1).length;

  return (
    <div id="optimization-workspace-view" className="flex-1 bg-[#0A0F1E] p-2 flex flex-col space-y-2 overflow-hidden select-none h-full">
      {/* 1. TOP SUITE NAVIGATION TAB BAR */}
      <div className="flex items-center justify-between bg-[#0F1729] px-3 py-1.5 rounded border border-[#1A2740] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Dna className="w-5 h-5 text-[#00A8FF]" />
          <div>
            <h1 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-2">
              <span>GARUN OPTIMIZATION & TRADE SPACE WORKSPACE</span>
              <span className="bg-[#00E87A]/20 text-[#00E87A] text-[8.5px] px-1.5 py-0.2 rounded border border-[#00E87A]/40 font-mono-data font-bold">
                PARAMETRIC DESIGN SPACE SWEEP ({candidates.length} DESIGNS)
              </span>
            </h1>
            <p className="text-[9.5px] font-mono-data text-[#8A9BBE]">
              PHYSICS-COMPUTED MULTI-OBJECTIVE TRADE SEARCH (x1: battery_kwh, x2: engine_kw, x3: motor_kw)
            </p>
          </div>
        </div>

        {/* Workspace View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-[#172236] p-1 rounded border border-[#1A2740] text-[9.5px] font-mono-data">
          {([
            { id: 'ALL_ANALYTICS', label: 'FULL DASHBOARD', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'PARETO_TRADE', label: 'PARETO & VARIABLES', icon: <Dna className="w-3.5 h-3.5" /> },
            { id: 'PARALLEL_COORDINATES', label: 'PARALLEL PATHWAYS', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'CONVERGENCE_SENSITIVITY', label: 'CONVERGENCE & SENSITIVITY', icon: <BarChart2 className="w-3.5 h-3.5" /> }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setWorkspaceTab(tab.id)}
              className={`px-3 py-1 rounded flex items-center space-x-1.5 uppercase transition-all cursor-pointer ${
                workspaceTab === tab.id
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

      {/* 2. DYNAMIC WORKSPACE GRID CONTENT */}
      {workspaceTab === 'ALL_ANALYTICS' && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 overflow-y-auto">
          {/* Row 1 Top Grid: Pareto Front Chart (Width 7/12) & Variables Panel (Width 5/12) */}
          <div className="col-span-7 h-[310px]">
            <ParetoFrontChart
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          </div>
          <div className="col-span-5 h-[310px]">
            <OptimizationVariablesPanel
              variables={decisionVars}
              onChangeVariables={setDecisionVars}
              onRunOptimization={handleRunOptimization}
              isOptimizing={isOptimizing}
              evaluatedCount={evaluatedCount}
              totalEvaluations={candidates.length}
            />
          </div>

          {/* Row 2 Mid Grid: Parallel Coordinates Plot (Width 8/12) & Optimization Summary (Width 4/12) */}
          <div className="col-span-8 h-[240px]">
            <ParallelCoordinatesPlot
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          </div>
          <div className="col-span-4 h-[240px]">
            <OptimizationSummaryCard
              selectedCandidate={selectedCandidate}
              totalEvaluatedCount={candidates.length}
              paretoCount={paretoCount}
            />
          </div>

          {/* Row 3 Bottom Grid: Constraints (Width 4/12), Convergence (Width 4/12), Sensitivity (Width 4/12) */}
          <div className="col-span-4 h-[220px]">
            <ConstraintsViolationPanel
              variables={decisionVars}
              selectedCandidate={selectedCandidate}
            />
          </div>
          <div className="col-span-4 h-[220px]">
            <FitnessEvolutionChart
              candidates={candidates}
            />
          </div>
          <div className="col-span-4 h-[220px]">
            <SensitivityAnalysisPanel />
          </div>
        </div>
      )}

      {workspaceTab === 'PARETO_TRADE' && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
          <div className="col-span-7 h-full">
            <ParetoFrontChart
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          </div>
          <div className="col-span-5 flex flex-col space-y-2 h-full">
            <div className="flex-1">
              <OptimizationVariablesPanel
                variables={decisionVars}
                onChangeVariables={setDecisionVars}
                onRunOptimization={handleRunOptimization}
                isOptimizing={isOptimizing}
                evaluatedCount={evaluatedCount}
                totalEvaluations={candidates.length}
              />
            </div>
            <div className="h-[200px]">
              <ConstraintsViolationPanel
                variables={decisionVars}
                selectedCandidate={selectedCandidate}
              />
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'PARALLEL_COORDINATES' && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
          <div className="col-span-8 h-full">
            <ParallelCoordinatesPlot
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          </div>
          <div className="col-span-4 h-full">
            <OptimizationSummaryCard
              selectedCandidate={selectedCandidate}
              totalEvaluatedCount={candidates.length}
              paretoCount={paretoCount}
            />
          </div>
        </div>
      )}

      {workspaceTab === 'CONVERGENCE_SENSITIVITY' && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
          <div className="col-span-6 h-full">
            <FitnessEvolutionChart
              candidates={candidates}
            />
          </div>
          <div className="col-span-6 h-full">
            <SensitivityAnalysisPanel />
          </div>
        </div>
      )}
    </div>
  );
};
