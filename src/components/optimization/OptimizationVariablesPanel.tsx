import React from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { Play, Dna, Zap, Gauge, Cpu } from 'lucide-react';

export interface DecisionVariablesState {
  batteryKwh: number; // x1: range [5, 40], step 5 kWh
  engineKw: number;   // x2: range [40, 90], step 5 kW
  motorKw: number;    // x3: range [30, 80], step 5 kW
}

export const INITIAL_DECISION_VARIABLES: DecisionVariablesState = {
  batteryKwh: 22,
  engineKw: 60,
  motorKw: 55
};

interface OptimizationVariablesPanelProps {
  variables: DecisionVariablesState;
  onChangeVariables: (vars: DecisionVariablesState) => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
  evaluatedCount: number;
  totalEvaluations: number;
}

export const OptimizationVariablesPanel: React.FC<OptimizationVariablesPanelProps> = ({
  variables,
  onChangeVariables,
  onRunOptimization,
  isOptimizing,
  evaluatedCount,
  totalEvaluations
}) => {
  const updateVar = (key: keyof DecisionVariablesState, value: number) => {
    onChangeVariables({
      ...variables,
      [key]: value
    });
  };

  const applyPreset = (presetName: 'ENDURANCE' | 'MIN_FUEL' | 'GARUN' | 'LIGHTWEIGHT') => {
    if (presetName === 'ENDURANCE') {
      onChangeVariables({
        batteryKwh: 35,
        engineKw: 70,
        motorKw: 60
      });
    } else if (presetName === 'MIN_FUEL') {
      onChangeVariables({
        batteryKwh: 15,
        engineKw: 80,
        motorKw: 55
      });
    } else if (presetName === 'GARUN') {
      onChangeVariables(INITIAL_DECISION_VARIABLES);
    } else {
      onChangeVariables({
        batteryKwh: 10,
        engineKw: 50,
        motorKw: 40
      });
    }
  };

  return (
    <CornerReticle id="optimization-variables-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Dna className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>DESIGN SPACE VARIABLES (GARUN)</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              PARAMETRIC SWEEP SEARCH ENGINE
            </span>
          </div>
        </div>

        {/* Evaluations Counter */}
        <div className="bg-[#172236] px-2 py-0.5 rounded border border-[#1A2740] text-[9px] font-mono-data text-[#00A8FF]">
          EVAL: <strong className="text-white font-bold">{evaluatedCount}</strong> / {totalEvaluations}
        </div>
      </div>

      {/* Solver Action Bar */}
      <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] mb-2.5 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onRunOptimization}
          disabled={isOptimizing}
          className={`px-3 py-1.5 rounded font-mono-data text-[10px] font-bold uppercase transition-all flex items-center space-x-1.5 shadow-md ${
            isOptimizing 
              ? 'bg-[#FF3B30] text-white animate-pulse cursor-not-allowed' 
              : 'bg-[#00A8FF] hover:bg-[#0088CC] text-[#0A0F1E] cursor-pointer'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isOptimizing ? 'RUNNING SWEEP...' : 'RUN PARAMETRIC SWEEP (54 DESIGNS)'}</span>
        </button>

        <div className="flex items-center space-x-2 text-[8.5px] font-mono-data">
          <div className="text-right">
            <span className="text-[#00E87A] block font-bold">GRID: 9x6 (54 COMBOS)</span>
            <span className="text-[#8A9BBE] block">REAL-TIME PHYSICS ENGINE</span>
          </div>
        </div>
      </div>

      {/* Quick Presets Strip */}
      <div className="grid grid-cols-4 gap-1 mb-2.5 text-[8px] font-mono-data flex-shrink-0">
        <button
          onClick={() => applyPreset('GARUN')}
          className="bg-[#172236] hover:bg-[#1F2D45] text-[#00A8FF] border border-[#1A2740] py-1 rounded uppercase font-bold text-center truncate cursor-pointer"
        >
          GARUN TARGET
        </button>
        <button
          onClick={() => applyPreset('ENDURANCE')}
          className="bg-[#172236] hover:bg-[#1F2D45] text-[#00E87A] border border-[#1A2740] py-1 rounded uppercase font-bold text-center truncate cursor-pointer"
        >
          MAX ENDURANCE
        </button>
        <button
          onClick={() => applyPreset('MIN_FUEL')}
          className="bg-[#172236] hover:bg-[#1F2D45] text-[#FFB800] border border-[#1A2740] py-1 rounded uppercase font-bold text-center truncate cursor-pointer"
        >
          LOWEST SFC
        </button>
        <button
          onClick={() => applyPreset('LIGHTWEIGHT')}
          className="bg-[#172236] hover:bg-[#1F2D45] text-[#B47FFF] border border-[#1A2740] py-1 rounded uppercase font-bold text-center truncate cursor-pointer"
        >
          LIGHTWEIGHT
        </button>
      </div>

      {/* Exactly 3 GARUN Decision Variables */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar text-[9.5px] font-mono-data">
        {/* x1. Battery Capacity (x1) */}
        <div className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Zap className="w-3 h-3 text-[#B47FFF]" />
              <span>x1: Battery Capacity (battery_kwh)</span>
            </span>
            <span className="font-bold text-[#B47FFF]">{variables.batteryKwh} kWh</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={variables.batteryKwh}
            onChange={(e) => updateVar('batteryKwh', Number(e.target.value))}
            className="w-full h-1 bg-[#172236] rounded appearance-none cursor-pointer accent-[#B47FFF]"
          />
          <div className="flex justify-between text-[7.5px] text-[#8A9BBE] mt-0.5">
            <span>5 kWh (Light)</span>
            <span className="text-[#00E87A]">GARUN Target: 22 kWh</span>
            <span>40 kWh (Heavy)</span>
          </div>
        </div>

        {/* x2. Gas Engine Power (x2) */}
        <div className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Gauge className="w-3 h-3 text-[#00A8FF]" />
              <span>x2: Gas Engine Power (engine_kw)</span>
            </span>
            <span className="font-bold text-[#00A8FF]">{variables.engineKw} kW</span>
          </div>
          <input
            type="range"
            min="40"
            max="90"
            step="5"
            value={variables.engineKw}
            onChange={(e) => updateVar('engineKw', Number(e.target.value))}
            className="w-full h-1 bg-[#172236] rounded appearance-none cursor-pointer accent-[#00A8FF]"
          />
          <div className="flex justify-between text-[7.5px] text-[#8A9BBE] mt-0.5">
            <span>40 kW (Low Power)</span>
            <span className="text-[#00E87A]">GARUN Target: 60 kW</span>
            <span>90 kW (High Power)</span>
          </div>
        </div>

        {/* x3. Electric Motor Power (x3) */}
        <div className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-[#00E87A]" />
              <span>x3: Electric Motor Power (motor_kw)</span>
            </span>
            <span className="font-bold text-[#00E87A]">{variables.motorKw} kW</span>
          </div>
          <input
            type="range"
            min="30"
            max="80"
            step="5"
            value={variables.motorKw}
            onChange={(e) => updateVar('motorKw', Number(e.target.value))}
            className="w-full h-1 bg-[#172236] rounded appearance-none cursor-pointer accent-[#00E87A]"
          />
          <div className="flex justify-between text-[7.5px] text-[#8A9BBE] mt-0.5">
            <span>30 kW</span>
            <span className="text-[#00E87A]">Constraint: motor_kw ≥ cruise_power</span>
            <span>80 kW</span>
          </div>
        </div>
      </div>
    </CornerReticle>
  );
};
