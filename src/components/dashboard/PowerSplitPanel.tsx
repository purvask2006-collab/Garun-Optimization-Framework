import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sliders, 
  Zap, 
  Flame, 
  BatteryCharging, 
  DollarSign, 
  Award, 
  TrendingUp, 
  Activity, 
  RotateCcw, 
  Maximize2, 
  X, 
  CheckCircle2, 
  ChevronDown, 
  Gauge, 
  Cpu, 
  ArrowRight,
  Info,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { useGarunStore } from '../../store/useGarunStore';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type OptimizationGoal = 'ENDURANCE' | 'EFFICIENCY' | 'FUEL_SAVING' | 'COST';

export interface PowerCurvePoint {
  enginePct: number;
  batteryPct: number;
  engineSfc: number; // kg/kWh
  systemSfc: number; // kg/kWh
  efficiencyPct: number;
  enduranceHr: number;
  hourlyCostUsd: number;
}

// ============================================================================
// POWER SPLIT OPTIMIZATION PANEL
// ============================================================================
export const PowerSplitPanel: React.FC = () => {
  const { updateSimulationParams, activeTelemetryFrame, updateBatterySOC } = useGarunStore();

  // Active Sub-Tab: 'SLIDERS' | 'FLOW' | 'SFC_CURVE' | 'METRICS'
  const [activeTab, setActiveTab] = useState<'SLIDERS' | 'FLOW' | 'SFC_CURVE' | 'METRICS'>('SLIDERS');
  const [showExpandedModal, setShowExpandedModal] = useState<boolean>(false);

  // Core Interactive Sliders State
  const [engineLoad, setEngineLoad] = useState<number>(65); // 65% Engine, 35% Battery
  const [totalRequiredPowerKw, setTotalRequiredPowerKw] = useState<number>(140); // Total Cruise Power Demand
  const [fuelCapacityKg, setFuelCapacityKg] = useState<number>(215); // Remaining Jet-A Fuel
  const [batteryKwh, setBatteryKwh] = useState<number>(35.2); // Remaining Battery Energy
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>('ENDURANCE');
  const [isAutoOptimizing, setIsAutoOptimizing] = useState<boolean>(false);

  // Computed Battery Split
  const batteryContrib = 100 - engineLoad;

  // Power Distribution in kW
  const engineKw = (totalRequiredPowerKw * engineLoad) / 100;
  const batteryKw = (totalRequiredPowerKw * batteryContrib) / 100;

  // GARUN Series Hybrid Electrical Chain Constants
  const DC_BUS_VOLTAGE_V = 400; // Design spec: 400V DC bus (NOT 750V)
  const ETA_GENERATOR = 0.93;   // PMSM generator efficiency
  const ETA_RECTIFIER = 0.97;   // AC-DC rectifier efficiency  
  const ETA_INVERTER  = 0.96;   // DC-AC inverter efficiency
  const ETA_MOTOR     = 0.95;   // PMSM traction motor efficiency
  const ETA_ELEC_CHAIN = ETA_GENERATOR * ETA_RECTIFIER * ETA_INVERTER * ETA_MOTOR; // = 0.821

  // Power balance at DC bus
  const generatorOutputKw = engineKw * ETA_GENERATOR;
  const batteryContributionKw = batteryKw; // already on DC side
  const totalBusPowerKw = generatorOutputKw + batteryContributionKw;
  const busCurrent_A = Math.round((totalBusPowerKw * 1000) / DC_BUS_VOLTAGE_V);
  const motorShaftPowerKw = totalBusPowerKw * ETA_RECTIFIER * ETA_INVERTER * ETA_MOTOR;

  // Power losses
  const electricalLossesKw = totalBusPowerKw - motorShaftPowerKw;

  // ============================================================================
  // THERMODYNAMIC & HYBRID POWERTRAIN CALCULATIONS
  // ============================================================================
  const stats = useMemo(() => {
    // 1. Engine Specific Fuel Consumption BSFC (kg/kWh) based on Gas Turbine partial load curve
    // Optimal SFC around 80-85% load (~0.200 kg/kWh = 200 g/kWh).
    // Higher SFC at low load (<40%) or extreme thermal limit (>95%).
    const normalizedLoad = Math.max(0.05, engineLoad / 100);
    
    // BSFC in kg/kWh
    // GARUN turboshaft SFC model (corrected): 0.450 kg/kWh at rated, rising at part-load
    let engineSfc = 0.450 + 0.280 * Math.pow(1 - normalizedLoad, 1.8);
    if (engineLoad > 90) {
      engineSfc += (engineLoad - 90) * 0.002; // thermal degradation
    }
    engineSfc = Number(engineSfc.toFixed(3));

    // 2. Engine Fuel Flow Rate (kg/hr)
    const fuelFlowKgHr = engineKw * engineSfc;

    // 3. Equivalent System SFC (kg/kWh) = Fuel Flow / Total Power Output
    const overallSystemSfc = totalRequiredPowerKw > 0 
      ? Number((fuelFlowKgHr / totalRequiredPowerKw).toFixed(3)) 
      : 0;

    // 4. Efficiencies
    // Engine Thermal Eff = (3600 / (BSFC_g_kwh * LHV_MJ_kg)) * 100
    // LHV Jet-A ~ 43.15 MJ/kg = 11.97 kWh/kg. Thermal Eff = 1 / (SFC * LHV)
    const LHV_KWH_PER_KG = 11.97; // Jet-A1: 43.15 MJ/kg = 11.97 kWh/kg
    const engineThermalEff = Math.min(44, Math.max(12, Number(((1 / (engineSfc * LHV_KWH_PER_KG)) * 100).toFixed(1))));
    const electricDriveEff = 94.5; // Inverter + Motor efficiency
    
    // Overall System Efficiency %
    const systemEfficiencyPct = totalRequiredPowerKw > 0
      ? Number((((engineKw * (engineThermalEff / 100)) + (batteryKw * (electricDriveEff / 100))) / totalRequiredPowerKw * 100).toFixed(1))
      : 0;

    // 5. Estimated Endurance Calculations (Hours)
    const gasEnduranceHr = fuelFlowKgHr > 0 ? fuelCapacityKg / fuelFlowKgHr : 99;
    const batteryEnduranceHr = batteryKw > 0 ? batteryKwh / batteryKw : 99;
    
    // Hybrid Endurance (simultaneous parallel draw down)
    const minEnduranceHr = Math.min(gasEnduranceHr, batteryEnduranceHr);
    const combinedEnduranceHr = Number(minEnduranceHr.toFixed(2));

    // 6. Direct Operating Cost ($ / Flight Hour)
    // Jet-A Fuel Price: ~$1.85 / kg
    // Electricity Price: ~$0.18 / kWh
    // Battery Degradation Cost: ~$0.08 / kWh throughput
    const fuelCostUsdHr = fuelFlowKgHr * 1.85;
    const electricityCostUsdHr = batteryKw * (0.18 + 0.08);
    const totalHourlyCostUsd = Number((fuelCostUsdHr + electricityCostUsdHr).toFixed(2));

    // 7. Optimal Engine Load for Active Goal
    let targetOptimalEngineLoad = 82; // Default for Endurance
    if (optimizationGoal === 'ENDURANCE') targetOptimalEngineLoad = 82; // Peak gas efficiency + balanced battery
    else if (optimizationGoal === 'EFFICIENCY') targetOptimalEngineLoad = 75; // Peak system efficiency
    else if (optimizationGoal === 'FUEL_SAVING') targetOptimalEngineLoad = 40; // High battery reliance
    else if (optimizationGoal === 'COST') targetOptimalEngineLoad = 88; // Maximize cheap fuel over battery wear

    return {
      engineSfc,
      fuelFlowKgHr: Number(fuelFlowKgHr.toFixed(1)),
      overallSystemSfc,
      engineThermalEff,
      electricDriveEff,
      systemEfficiencyPct,
      gasEnduranceHr: Number(gasEnduranceHr.toFixed(2)),
      batteryEnduranceHr: Number(batteryEnduranceHr.toFixed(2)),
      combinedEnduranceHr,
      totalHourlyCostUsd,
      targetOptimalEngineLoad
    };
  }, [engineLoad, totalRequiredPowerKw, fuelCapacityKg, batteryKwh, optimizationGoal]);

  // Sync to store when engine load changes
  useEffect(() => {
    try {
      performance.mark('garun:powersplit-sync-start');
    } catch {
      // ignore
    }
    updateSimulationParams({
      hybridRatioCruisePct: 100 - engineLoad
    });
    try {
      performance.mark('garun:powersplit-sync-end');
      performance.measure('garun:powersplit-sync', 'garun:powersplit-sync-start', 'garun:powersplit-sync-end');
    } catch {
      // ignore
    }
  }, [engineLoad]);

  // Update SOC based on current battery power draw
  useEffect(() => {
    const interval = setInterval(() => {
      if (updateBatterySOC) {
        updateBatterySOC(batteryKw, 5); // 5-second update interval
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [batteryKw, updateBatterySOC]);

  // Handle Goal Auto Optimization with safe timer cleanup
  const autoOptimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoOptimizeTimerRef.current) {
        clearTimeout(autoOptimizeTimerRef.current);
      }
    };
  }, []);

  const handleAutoOptimize = () => {
    setIsAutoOptimizing(true);
    setEngineLoad(stats.targetOptimalEngineLoad);
    if (autoOptimizeTimerRef.current) clearTimeout(autoOptimizeTimerRef.current);
    autoOptimizeTimerRef.current = setTimeout(() => setIsAutoOptimizing(false), 600);
  };

  // ============================================================================
  // GENERATE RECHARTS SFC & EFFICIENCY TRADE-OFF CURVE DATA (0 to 100% Split)
  // ============================================================================
  const powerCurveData: PowerCurvePoint[] = useMemo(() => {
    const points: PowerCurvePoint[] = [];
    for (let ePct = 10; ePct <= 100; ePct += 5) {
      const bPct = 100 - ePct;
      const eKw = (totalRequiredPowerKw * ePct) / 100;
      const bKw = (totalRequiredPowerKw * bPct) / 100;
      const normLoad = ePct / 100;
      
      // GARUN turboshaft SFC model (corrected): 0.450 kg/kWh at rated, rising at part-load
      let eSfc = 0.450 + 0.280 * Math.pow(1 - normLoad, 1.8);
      if (ePct > 90) eSfc += (ePct - 90) * 0.002;

      const fFlow = eKw * eSfc;
      const sysSfc = fFlow / totalRequiredPowerKw;
      const LHV_KWH_PER_KG = 11.97; // Jet-A1: 43.15 MJ/kg = 11.97 kWh/kg
      const eEff = (1 / (eSfc * LHV_KWH_PER_KG)) * 100;
      const sysEff = ((eKw * (eEff / 100)) + (bKw * 0.945)) / totalRequiredPowerKw * 100;

      const gEndurance = fFlow > 0 ? fuelCapacityKg / fFlow : 99;
      const bEndurance = bKw > 0 ? batteryKwh / bKw : 99;
      const endHr = Math.min(gEndurance, bEndurance);
      const cost = fFlow * 1.85 + bKw * 0.26;

      points.push({
        enginePct: ePct,
        batteryPct: bPct,
        engineSfc: Number(eSfc.toFixed(3)),
        systemSfc: Number(sysSfc.toFixed(3)),
        efficiencyPct: Number(sysEff.toFixed(1)),
        enduranceHr: Number(endHr.toFixed(2)),
        hourlyCostUsd: Number(cost.toFixed(1))
      });
    }
    return points;
  }, [totalRequiredPowerKw, fuelCapacityKg, batteryKwh]);

  return (
    <CornerReticle className="h-full bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col justify-between relative overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden">
        {/* 1. PANEL HEADER & MODAL EXPAND BUTTON */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#00A8FF]" />
            <div>
              <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
                <span>POWER SPLIT OPTIMISATION</span>
              </h2>
              <span className="text-[9px] font-mono-data text-[#00E87A]">
                REAL-TIME THERMODYNAMIC & HYBRID OPTIMIZER
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowExpandedModal(true)}
              className="p-1 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] transition-colors"
              title="Expand Fullscreen Power Split Diagnostics"
              aria-label="Expand Fullscreen Power Split Diagnostics"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. SUB-NAVIGATION TABS */}
        <div className="grid grid-cols-4 gap-1 mb-2 border-b border-[#1A2740] pb-1.5 flex-shrink-0 text-[8.5px] font-mono-data" role="tablist" aria-label="Power split diagnostics tabs">
          {(['SLIDERS', 'FLOW', 'SFC_CURVE', 'METRICS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
              aria-label={`${tab.replace('_', ' ')} tab`}
              className={`py-1 rounded border uppercase transition-all truncate ${
                activeTab === tab
                  ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF] font-bold'
                  : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE] hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* 3. DYNAMIC TAB CONTENT VIEWS */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-[11px] font-sans-ui">
          {/* ==================================================================== */}
          {/* TAB 1: SLIDERS & OPTIMIZATION GOALS (PRIMARY CONTROLS)                */}
          {/* ==================================================================== */}
          {activeTab === 'SLIDERS' && (
            <div className="space-y-2">
              {/* OPTIMIZATION GOAL SELECTOR & AUTO-OPTIMIZE BUTTON */}
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono-data text-[#8A9BBE] border-b border-[#1A2740] pb-1">
                  <span className="flex items-center space-x-1 uppercase">
                    <Award className="w-3 h-3 text-[#FFB800]" />
                    <span>OPTIMIZATION OBJECTIVE GOAL</span>
                  </span>
                  <button
                    onClick={handleAutoOptimize}
                    aria-label="Auto-optimize power split for active objective goal"
                    className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase flex items-center space-x-1 transition-all ${
                      isAutoOptimizing
                        ? 'bg-[#00E87A] text-[#0A0F1E] scale-105'
                        : 'bg-[#00A8FF]/20 border border-[#00A8FF] text-[#00A8FF] hover:bg-[#00A8FF] hover:text-[#0A0F1E]'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AUTO-OPTIMIZE</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[8.5px] font-mono-data" role="tablist" aria-label="Optimization objectives">
                  {[
                    { id: 'ENDURANCE', label: 'ENDURANCE', icon: TrendingUp },
                    { id: 'EFFICIENCY', label: 'EFFICIENCY', icon: Zap },
                    { id: 'FUEL_SAVING', label: 'FUEL SAVING', icon: Flame },
                    { id: 'COST', label: 'MIN COST', icon: DollarSign }
                  ].map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = optimizationGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => {
                          setOptimizationGoal(goal.id as OptimizationGoal);
                        }}
                        role="tab"
                        aria-selected={isSelected}
                        aria-label={`Optimization objective: ${goal.label}`}
                        className={`py-1 px-1 rounded border flex flex-col items-center justify-center space-y-0.5 transition-all ${
                          isSelected
                            ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold border-[#00A8FF] shadow-sm'
                            : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE] hover:text-white'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="truncate">{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DUAL COUPLED POWER SPLIT SLIDERS */}
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] space-y-2">
                {/* Engine Load Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono-data">
                    <span className="text-[#8A9BBE] flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-[#FFB800]" />
                      <span>GAS TURBINE POWER SPLIT</span>
                    </span>
                    <span className="font-bold text-[#FFB800]">{engineLoad}% ({engineKw.toFixed(0)} kW)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={engineLoad}
                    onChange={(e) => setEngineLoad(Number(e.target.value))}
                    aria-label="Gas Turbine Power Split slider"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={engineLoad}
                    aria-valuetext={`${engineLoad}% (${engineKw.toFixed(0)} kW)`}
                    className="w-full h-2 bg-[#172236] rounded appearance-none cursor-pointer accent-[#FFB800]"
                  />
                </div>

                {/* Battery Contribution Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono-data">
                    <span className="text-[#8A9BBE] flex items-center space-x-1">
                      <BatteryCharging className="w-3 h-3 text-[#00E87A]" />
                      <span>ELECTRIC BATTERY POWER SPLIT</span>
                    </span>
                    <span className="font-bold text-[#00E87A]">{batteryContrib}% ({batteryKw.toFixed(0)} kW)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={batteryContrib}
                    onChange={(e) => setEngineLoad(100 - Number(e.target.value))}
                    aria-label="Electric Battery Power Split slider"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={batteryContrib}
                    aria-valuetext={`${batteryContrib}% (${batteryKw.toFixed(0)} kW)`}
                    className="w-full h-2 bg-[#172236] rounded appearance-none cursor-pointer accent-[#00E87A]"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-4 gap-1 text-[8px] font-mono-data pt-1 border-t border-[#1A2740]">
                  {[
                    { label: 'PURE GAS (100/0)', engine: 100 },
                    { label: 'BALANCED (65/35)', engine: 65 },
                    { label: 'OPT SINK (82/18)', engine: 82 },
                    { label: 'PURE ELEC (0/100)', engine: 0 }
                  ].map((preset) => (
                    <button
                      key={preset.engine}
                      onClick={() => setEngineLoad(preset.engine)}
                      aria-label={`Set power split preset: ${preset.label}`}
                      className={`py-0.5 rounded border transition-all ${
                        engineLoad === preset.engine
                          ? 'bg-[#00E87A] text-[#0A0F1E] font-bold border-[#00E87A]'
                          : 'bg-[#172236] text-[#8A9BBE] border-[#1A2740] hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: FLOW (ANIMATED HYBRID POWER FLOW SCHEMATIC DIAGRAM)           */}
          {/* ==================================================================== */}
          {activeTab === 'FLOW' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] space-y-2">
                <div className="text-[9.5px] font-mono-data text-[#8A9BBE] uppercase border-b border-[#1A2740] pb-1 flex justify-between">
                  <span>HYBRID POWER FLOW ANIMATION SCHEMATIC</span>
                  <span className="text-[#00E87A]">SUMMING BUS: {totalBusPowerKw.toFixed(1)} kW | {busCurrent_A} A</span>
                </div>

                {/* Animated SVG Diagram of Power Flow */}
                <div className="bg-[#0A0F1E] p-3 rounded border border-[#1A2740] relative flex items-center justify-between">
                  {/* Left Column: Energy Sources */}
                  <div className="flex flex-col space-y-3 z-10">
                    {/* Gas Engine Node */}
                    <div className="bg-[#172236] p-1.5 rounded border border-[#FFB800]/50 text-center w-24">
                      <div className="flex items-center justify-center space-x-1 text-[#FFB800] text-[9px] font-bold">
                        <Flame className="w-3 h-3" />
                        <span>ENGINE</span>
                      </div>
                      <span className="text-xs font-mono-data font-bold text-[#E8EDF7]">{engineKw.toFixed(0)} kW</span>
                      <span className="text-[7.5px] text-[#8A9BBE] block">{engineLoad}% Split (P_gen: {generatorOutputKw.toFixed(1)} kW)</span>
                    </div>

                    {/* Battery Node */}
                    <div className="bg-[#172236] p-1.5 rounded border border-[#00E87A]/50 text-center w-24">
                      <div className="flex items-center justify-center space-x-1 text-[#00E87A] text-[9px] font-bold">
                        <BatteryCharging className="w-3 h-3" />
                        <span>BATTERY</span>
                      </div>
                      <span className="text-xs font-mono-data font-bold text-[#E8EDF7]">{batteryKw.toFixed(0)} kW</span>
                      <span className="text-[7.5px] text-[#8A9BBE] block">{batteryContrib}% Split</span>
                    </div>
                  </div>

                  {/* Flow SVG Lines */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 300 120">
                      {/* Top path from Engine */}
                      <path d="M 90,30 L 150,60" stroke="#FFB800" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                      {/* Bottom path from Battery */}
                      <path d="M 90,90 L 150,60" stroke="#00E87A" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                      {/* Center output path to Motor */}
                      <path d="M 150,60 L 210,60" stroke="#00A8FF" strokeWidth="3" />
                    </svg>
                  </div>

                  {/* Center Node: HV Bus / Inverter Junction */}
                  <div className="bg-[#172236] p-2 rounded-full border border-[#00A8FF] text-center z-10 shadow-lg min-w-[80px]">
                    <Cpu className="w-4 h-4 text-[#00A8FF] mx-auto animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-[7.5px] font-mono-data text-[#00A8FF] font-bold block mt-0.5">{DC_BUS_VOLTAGE_V}V DC Bus</span>
                    <span className="text-[7.5px] font-mono-data text-[#00E87A] font-bold block">{busCurrent_A} A</span>
                  </div>

                  {/* Right Column: Output Propulsion */}
                  <div className="z-10">
                    <div className="bg-[#172236] p-2 rounded border border-[#00A8FF]/50 text-center w-24">
                      <div className="flex items-center justify-center space-x-1 text-[#00A8FF] text-[9px] font-bold">
                        <Zap className="w-3 h-3" />
                        <span>MOTOR</span>
                      </div>
                      <span className="text-xs font-mono-data font-bold text-[#00E87A]">{motorShaftPowerKw.toFixed(1)} kW</span>
                      <span className="text-[7.5px] text-[#8A9BBE] block">Shaft Output</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: SFC CURVE (SPECIFIC FUEL CONSUMPTION RECHARTS GRAPH)           */}
          {/* ==================================================================== */}
          {activeTab === 'SFC_CURVE' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
                <div className="flex items-center justify-between text-[9.5px] font-mono-data text-[#8A9BBE] mb-2 border-b border-[#1A2740] pb-1">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-[#00A8FF]" />
                    <span>SFC (kg/kWh) VS ENGINE LOAD %</span>
                  </span>
                  <span className="text-[#00E87A] font-bold">CURR: {stats.engineSfc} kg/kWh</span>
                </div>

                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={powerCurveData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
                      <XAxis dataKey="enginePct" stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <YAxis domain={[0.1, 0.45]} stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }}
                        itemStyle={{ color: '#E8EDF7' }}
                      />
                      <ReferenceLine x={engineLoad} stroke="#FFB800" strokeDasharray="3 3" label={{ value: 'CURRENT LOAD', fill: '#FFB800', fontSize: 8 }} />
                      <Line type="monotone" dataKey="engineSfc" stroke="#FF6B35" strokeWidth={2} name="Engine BSFC (kg/kWh)" />
                      <Line type="monotone" dataKey="systemSfc" stroke="#00E87A" strokeWidth={2} name="System SFC (kg/kWh)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center space-x-4 text-[8.5px] font-mono-data text-[#8A9BBE] pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#FF6B35]" />
                    <span>Engine BSFC</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#00E87A]" />
                    <span>System Equivalent SFC</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#FFB800]" />
                    <span>Operating Point</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 4: METRICS (DETAILED COST, ENDURANCE & EFFICIENCY BREAKDOWN)     */}
          {/* ==================================================================== */}
          {activeTab === 'METRICS' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-2 text-[10px] font-mono-data">
                <div className="text-[9.5px] text-[#8A9BBE] uppercase border-b border-[#1A2740] pb-1 flex justify-between">
                  <span>HYBRID PERFORMANCE METRICS BREAKDOWN</span>
                  <span className="text-[#00E87A]">VALIDATED</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div 
                    role="meter" 
                    aria-label="DC Bus Power" 
                    aria-valuenow={Number(totalBusPowerKw.toFixed(1))} 
                    aria-valuemin={0} 
                    aria-valuemax={300}
                    aria-valuetext={`${totalBusPowerKw.toFixed(1)} kW`}
                    className="bg-[#172236]/80 p-2 rounded border border-[#1A2740]"
                  >
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">DC BUS POWER & VOLTAGE</span>
                    <span className="text-sm font-bold text-[#00A8FF]">{totalBusPowerKw.toFixed(1)} kW</span>
                    <span className="text-[8px] text-[#8A9BBE] block">{DC_BUS_VOLTAGE_V}V DC Bus | {busCurrent_A} A</span>
                  </div>

                  <div 
                    role="meter" 
                    aria-label="Electrical Chain Efficiency" 
                    aria-valuenow={Number((ETA_ELEC_CHAIN * 100).toFixed(1))} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                    aria-valuetext={`${(ETA_ELEC_CHAIN * 100).toFixed(1)}%`}
                    className="bg-[#172236]/80 p-2 rounded border border-[#1A2740]"
                  >
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">ELEC CHAIN EFF (η_elec)</span>
                    <span className="text-sm font-bold text-[#00E87A]">{(ETA_ELEC_CHAIN * 100).toFixed(1)}%</span>
                    <span className="text-[8px] text-[#8A9BBE] block">Gen→Rect→Inv→Motor</span>
                  </div>

                  <div 
                    role="meter" 
                    aria-label="Electrical Losses" 
                    aria-valuenow={Number(electricalLossesKw.toFixed(1))} 
                    aria-valuemin={0} 
                    aria-valuemax={50}
                    aria-valuetext={`${electricalLossesKw.toFixed(1)} kW`}
                    className="bg-[#172236]/80 p-2 rounded border border-[#1A2740]"
                  >
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">ELECTRICAL LOSSES</span>
                    <span className="text-sm font-bold text-[#FF6B35]">{electricalLossesKw.toFixed(1)} kW</span>
                    <span className="text-[8px] text-[#8A9BBE] block">Losses: {electricalLossesKw.toFixed(1)} kW</span>
                  </div>

                  <div 
                    role="meter" 
                    aria-label="Direct Flight Cost" 
                    aria-valuenow={stats.totalHourlyCostUsd} 
                    aria-valuemin={0} 
                    aria-valuemax={1000}
                    aria-valuetext={`$${stats.totalHourlyCostUsd} per hour`}
                    className="bg-[#172236]/80 p-2 rounded border border-[#1A2740]"
                  >
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">DIRECT FLIGHT COST</span>
                    <span className="text-sm font-bold text-[#00A8FF]">${stats.totalHourlyCostUsd} / hr</span>
                    <span className="text-[8px] text-[#8A9BBE] block">Fuel + Elec Wear</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. BOTTOM KPI READOUT STRIP */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1A2740] mt-2 text-center flex-shrink-0">
          <div 
            role="meter"
            aria-label="DC Bus Current"
            aria-valuenow={busCurrent_A}
            aria-valuemin={0}
            aria-valuemax={600}
            aria-valuetext={`${busCurrent_A} Amperes at ${DC_BUS_VOLTAGE_V} Volts`}
            className="bg-[#172236]/60 p-1.5 rounded border border-[#1A2740]"
          >
            <span className="text-[8.5px] font-sans-ui text-[#8A9BBE] block uppercase">DC BUS CURRENT</span>
            <span className="text-sm font-mono-data font-bold text-[#E8EDF7]">{busCurrent_A} A</span>
            <span className="text-[8px] font-mono-data text-[#8A9BBE] block">{DC_BUS_VOLTAGE_V}V DC Bus</span>
          </div>

          <div 
            role="meter"
            aria-label="System Specific Fuel Consumption"
            aria-valuenow={stats.overallSystemSfc}
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuetext={`${stats.overallSystemSfc} kilograms per kilowatt hour`}
            className="bg-[#172236]/60 p-1.5 rounded border border-[#1A2740]"
          >
            <span className="text-[8.5px] font-sans-ui text-[#8A9BBE] block uppercase">SYSTEM SFC</span>
            <span className="text-sm font-mono-data font-bold text-[#00A8FF]">{stats.overallSystemSfc}</span>
            <span className="text-[8px] font-mono-data text-[#8A9BBE] block">kg/kWh</span>
          </div>

          <div 
            role="meter"
            aria-label="Estimated Hybrid Endurance"
            aria-valuenow={stats.combinedEnduranceHr}
            aria-valuemin={0}
            aria-valuemax={24}
            aria-valuetext={`${stats.combinedEnduranceHr} hours`}
            className="bg-[#172236]/60 p-1.5 rounded border border-[#1A2740]"
          >
            <span className="text-[8.5px] font-sans-ui text-[#8A9BBE] block uppercase">ENDURANCE</span>
            <span className="text-sm font-mono-data font-bold text-[#00E87A]">{stats.combinedEnduranceHr}</span>
            <span className="text-[8px] font-mono-data text-[#00E87A] block">hours</span>
          </div>
        </div>
      </div>

      {/* EXPANDED FULLSCREEN MODAL FOR POWER SPLIT DIAGNOSTICS */}
      {showExpandedModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Comprehensive Hybrid Power Split Optimization"
            className="bg-[#0D1527] border border-[#1F2D45] rounded-lg w-full max-w-3xl p-4 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F2D45] pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-[#00A8FF]" />
                <div>
                  <h2 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
                    COMPREHENSIVE HYBRID POWER SPLIT OPTIMIZATION
                  </h2>
                  <p className="text-[10px] font-mono-data text-[#8A9BBE]">
                    GAS TURBINE & LIPO (NMC) BATTERY ENERGY MANAGEMENT SYSTEM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExpandedModal(false)}
                aria-label="Close optimizer diagnostics modal"
                className="p-1.5 rounded bg-[#172236] text-[#8A9BBE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Summary Bar */}
            <div className="grid grid-cols-4 gap-2 bg-[#111A2E] p-3 rounded border border-[#1A2740] text-xs font-mono-data">
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">GAS ENGINE POWER</span>
                <span className="text-base font-bold text-[#FFB800]">{engineKw.toFixed(0)} kW</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">P_gen: {generatorOutputKw.toFixed(1)} kW</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">BATTERY POWER</span>
                <span className="text-base font-bold text-[#00E87A]">{batteryKw.toFixed(0)} kW</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">P_batt: {batteryContributionKw.toFixed(1)} kW</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">DC BUS ({DC_BUS_VOLTAGE_V}V)</span>
                <span className="text-base font-bold text-[#00A8FF]">{busCurrent_A} A</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">Losses: {electricalLossesKw.toFixed(1)} kW</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">ESTIMATED ENDURANCE</span>
                <span className="text-base font-bold text-[#00E87A]">{stats.combinedEnduranceHr} Hours</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">η_elec: {(ETA_ELEC_CHAIN * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Expanded Chart */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider">
                POWER SPLIT VS SYSTEM EFFICIENCY & SFC TRADE-OFF CURVE
              </h3>
              <div className="bg-[#111A2E] rounded border border-[#1A2740] p-3 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={powerCurveData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
                    <XAxis dataKey="enginePct" stroke="#8A9BBE" fontSize={10} />
                    <YAxis stroke="#8A9BBE" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740' }} />
                    <Line type="monotone" dataKey="efficiencyPct" stroke="#00E87A" strokeWidth={2} name="System Efficiency (%)" />
                    <Line type="monotone" dataKey="enduranceHr" stroke="#00A8FF" strokeWidth={2} name="Endurance (Hours)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#1F2D45] flex justify-end">
              <button
                onClick={() => setShowExpandedModal(false)}
                aria-label="Close optimizer diagnostics modal"
                className="bg-[#00A8FF] hover:bg-[#0088CC] text-white font-sans-ui font-bold text-xs uppercase px-4 py-2 rounded"
              >
                CLOSE OPTIMIZER DIAGNOSTICS
              </button>
            </div>
          </div>
        </div>
      )}
    </CornerReticle>
  );
};
