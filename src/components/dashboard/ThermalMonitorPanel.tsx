import React, { useState, useEffect, useMemo } from 'react';
import { 
  Thermometer, 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Maximize2, 
  X, 
  Sliders, 
  RotateCcw, 
  Zap, 
  Gauge, 
  Cpu, 
  BatteryCharging, 
  Info, 
  CheckCircle2, 
  Radio
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { FormulaPanel } from '../common/FormulaPanel';
import { useGarunStore } from '../../store/useGarunStore';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface TemperaturePoint {
  time: string;
  tetK: number;
  bladeMetalK: number;
  combustorK: number;
  exhaustK: number;
  batteryC: number;
  limit1700K: number;
}

export interface ComponentThermalZone {
  id: string;
  name: string;
  material: string;
  maxTempK: number;
  currentTempK: number;
  unit: 'K' | '°C';
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  location: string;
  description: string;
}

// ============================================================================
// MAIN THERMAL & MATERIALS MONITOR PANEL
// ============================================================================
export const ThermalMonitorPanel: React.FC = () => {
  // Store connection for live telemetry values
  const { activeTelemetryFrame } = useGarunStore();

  // Active Tab View Mode: 'OVERVIEW' | 'TIMELINE' | 'MATERIALS' | 'HEATMAP'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'MATERIALS' | 'HEATMAP'>('OVERVIEW');
  const [showExpandedModal, setShowExpandedModal] = useState(false);

  // Thermal Overload Simulation Stress Test Mode
  const [simulatedTetK, setSimulatedTetK] = useState<number>(1653); // Default 1653K
  const [isStressTestActive, setIsStressTestActive] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string>('blade');

  // Real-time Temperature Timeline Data Stream
  const [timelineData, setTimelineData] = useState<TemperaturePoint[]>(() => {
    const initialPoints: TemperaturePoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const timeStr = new Date(now - i * 3000).toISOString().substring(14, 19);
      const baseTet = 1650 + Math.sin(i * 0.4) * 15;
      initialPoints.push({
        time: timeStr,
        tetK: Math.round(baseTet),
        bladeMetalK: Math.round(baseTet - 273),
        combustorK: Math.round(baseTet + 195),
        exhaustK: 890 + Math.round(Math.cos(i * 0.3) * 10),
        batteryC: 38.5 + (i * 0.1),
        limit1700K: 1700,
      });
    }
    return initialPoints;
  });

  // Dynamic Live Stream Updates for Timeline Chart
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setTimelineData(prev => {
        const timeStr = new Date().toISOString().substring(14, 19);
        const osc = Math.sin(tick * 0.5) * 4;
        const currentTet = isStressTestActive 
          ? simulatedTetK 
          : 1650 + osc;

        const newPoint: TemperaturePoint = {
          time: timeStr,
          tetK: Math.round(currentTet),
          bladeMetalK: Math.round(currentTet - 273),
          combustorK: Math.round(currentTet + 195),
          exhaustK: 890 + Math.round(Math.cos(tick * 0.3) * 3),
          batteryC: Number((38.2 + Math.sin(tick * 0.2) * 0.2).toFixed(1)),
          limit1700K: 1700,
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStressTestActive, simulatedTetK]);

  // Current Working TET & Blade Metal Temperature
  const currentTetK = isStressTestActive ? simulatedTetK : 1653;
  const tetLimitK = 1700;
  const tetMarginK = tetLimitK - currentTetK;

  // Single Crystal Blade Calculation (Blade Metal = TET - TBC Cooling Drop ~273K)
  const bladeMetalTempK = Math.round(currentTetK - 273);
  const bladeLimitK = 1450; // CMSX-4 Uncoated Alloy Metal Limit
  const coolingEffectivenessPct = 8.4; // Bleed air flow effectiveness %
  const creepConsumptionRate = currentTetK > 1700 ? 4.2 : currentTetK > 1680 ? 1.8 : 0.4; // % per 100 hr

  // Status Categorization based on 1700K Limit
  const tetStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' = useMemo(() => {
    if (currentTetK > 1700) return 'CRITICAL';
    if (currentTetK > 1680) return 'WARNING';
    return 'NOMINAL';
  }, [currentTetK]);

  // SVG Gauge Geometry Calculation
  // Range: 1200 K to 2000 K (Span = 800 K)
  const gaugeMinK = 1200;
  const gaugeMaxK = 2000;
  const gaugePct = Math.min(100, Math.max(0, ((currentTetK - gaugeMinK) / (gaugeMaxK - gaugeMinK)) * 100));
  
  // Radius r = 42, Half Circumference = PI * 42 = 131.95
  const halfCircumference = 131.95;
  const strokeDashoffset = halfCircumference - (halfCircumference * gaugePct) / 100;

  // 1700K Limit Marker Position on Semicircle (1700 - 1200) / 800 = 62.5% of sweep (112.5 deg)
  const limitAngleRad = Math.PI * (1 - 0.625); // Angle from left
  const limitMarkerX = 50 + 42 * Math.cos(limitAngleRad);
  const limitMarkerY = 50 - 42 * Math.sin(limitAngleRad);

  // Material Limits Data Catalog
  const materialZones: ComponentThermalZone[] = [
    {
      id: 'combustor',
      name: 'Combustion Liner',
      material: 'CMC (Ceramic Matrix Composite)',
      maxTempK: 1950,
      currentTempK: Math.round(currentTetK + 195),
      unit: 'K',
      status: currentTetK + 195 > 1900 ? 'WARNING' : 'NOMINAL',
      location: 'Engine Gas Generator Core',
      description: 'High-temperature Ceramic Matrix Composite withstands direct stoichiometric flame temperatures.'
    },
    {
      id: 'blade',
      name: 'HP Single Crystal Blade',
      material: 'CMSX-4 + YSZ TBC Coating',
      maxTempK: 1700,
      currentTempK: currentTetK,
      unit: 'K',
      status: tetStatus,
      location: '1st Stage High Pressure Turbine',
      description: 'Single Crystal Superalloy with 1700K maximum creep threshold limit. Film cooled via compressor bleed air.'
    },
    {
      id: 'power_turbine',
      name: 'Power Turbine Vanes',
      material: 'Single Crystal CMSX-10',
      maxTempK: 1550,
      currentTempK: Math.round(currentTetK - 533),
      unit: 'K',
      status: 'NOMINAL',
      location: '2nd Stage Power Turbine',
      description: 'Drives output shaft to high-speed generator. Excellent fatigue life under thermal cyclic loading.'
    },
    {
      id: 'exhaust',
      name: 'Exhaust Duct & Nozzle',
      material: 'Inconel 718 Superalloy',
      maxTempK: 1250,
      currentTempK: 890,
      unit: 'K',
      status: 'NOMINAL',
      location: 'Aft Exhaust Nacelle',
      description: 'Corrosion resistant Nickel-Chromium alloy collecting turbine exhaust gases.'
    },
    {
      id: 'battery_pack',
      name: 'Li-Sulfur Battery Array',
      material: 'Solid-State Sulfur Electrolyte',
      maxTempK: 338, // 65°C
      currentTempK: 311, // 38.2°C
      unit: 'K',
      status: 'NOMINAL',
      location: 'Center Fuselage Bay',
      description: 'High energy density battery module. Requires thermal liquid cooling loop to stay below 60°C.'
    },
    {
      id: 'inverter',
      name: 'SiC Power Inverter',
      material: 'Silicon Carbide Power Modules',
      maxTempK: 448, // 175°C
      currentTempK: 323, // 50°C
      unit: 'K',
      status: 'NOMINAL',
      location: 'Avionics Power Rack',
      description: 'Wide bandgap SiC switches operating at high junction temperatures with active liquid cold plate.'
    }
  ];

  return (
    <CornerReticle className="h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] relative">
      <div className="flex flex-col h-full overflow-hidden">
        {/* 1. HEADER & SUB-NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Thermometer className={`w-4 h-4 ${
              tetStatus === 'CRITICAL' ? 'text-[#FF3B30] animate-bounce' : tetStatus === 'WARNING' ? 'text-[#FFB800]' : 'text-[#FF6B35]'
            }`} />
            <div>
              <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
                <span>THERMAL & MATERIALS MONITOR</span>
              </h2>
              <span className="text-[9px] font-mono-data text-[#00A8FF]">
                1700 K CMSX-4 SINGLE CRYSTAL THRESHOLD
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowExpandedModal(true)}
              className="p-1 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] transition-colors"
              title="Expand Thermal Diagnostic Dashboard"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs: OVERVIEW | TIMELINE | MATERIALS | HEATMAP */}
        <div className="grid grid-cols-4 gap-1 mb-2 border-b border-[#1A2740] pb-1.5 flex-shrink-0">
          {(['OVERVIEW', 'TIMELINE', 'HEATMAP', 'MATERIALS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1 text-[9px] font-mono-data rounded border uppercase transition-all ${
                activeTab === tab
                  ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF] font-bold'
                  : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 2. DYNAMIC ALERT BANNERS FOR 1700K THRESHOLD */}
        <div className={`p-1.5 rounded border mb-2 text-[10px] font-mono-data flex items-center justify-between flex-shrink-0 transition-all ${
          tetStatus === 'CRITICAL'
            ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30] animate-pulse'
            : tetStatus === 'WARNING'
            ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]'
            : 'bg-[#00E87A]/10 border-[#00E87A]/30 text-[#00E87A]'
        }`}>
          <div className="flex items-center space-x-1.5 truncate">
            {tetStatus === 'CRITICAL' ? (
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            ) : tetStatus === 'WARNING' ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-bold uppercase tracking-wide truncate">
              {tetStatus === 'CRITICAL'
                ? 'CRITICAL OVER-TEMP! 1700K THRESHOLD EXCEEDED'
                : tetStatus === 'WARNING'
                ? 'WARNING: APPROACHING 1700K MATERIAL LIMIT'
                : 'TET NOMINAL – WITHIN CMSX-4 SAFETY ENVELOPE'}
            </span>
          </div>
          <span className="text-[9.5px] font-bold ml-1 flex-shrink-0">
            {tetMarginK >= 0 ? `+${tetMarginK} K MARGIN` : `${tetMarginK} K OVER`}
          </span>
        </div>

        {/* 3. TAB CONTENT VIEWS */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-[11px] font-sans-ui">
          {/* ==================================================================== */}
          {/* TAB 1: OVERVIEW (ANIMATED TET GAUGE + SINGLE CRYSTAL BLADE PANEL)   */}
          {/* ==================================================================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-2">
              {/* ANIMATED TET SEMICIRCLE GAUGE */}
              <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] flex flex-col items-center justify-center relative">
                <div className="text-[9.5px] font-mono-data text-[#8A9BBE] uppercase mb-1 flex items-center justify-between w-full border-b border-[#1A2740] pb-1">
                  <span className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-[#FF6B35]" />
                    <span>TURBINE ENTRY TEMPERATURE (TET)</span>
                    <FormulaPanel
                      label="Turbine Entry Temperature (TET)"
                      value={currentTetK}
                      unit="K"
                      symbolicFormula="TET = T2 + ΔT_combust&#10;T2 = T1 × (1 + (PR^((γ-1)/γ) - 1) / η_c)&#10;ΔT_combust = (η_combustor × FAR × LHV) / ((1 + FAR) × Cp_hot)"
                      variableDefs={[
                        { symbol: 'T1', name: 'ISA Ambient Air Temperature at 3000m', value: 268.65, unit: 'K' },
                        { symbol: 'PR', name: 'Compressor Pressure Ratio', value: 8.5, unit: 'ratio' },
                        { symbol: 'η_c', name: 'Compressor Isentropic Efficiency', value: 0.82, unit: 'ratio' },
                        { symbol: 'FAR', name: 'Fuel-to-Air Ratio at load', value: 0.024, unit: 'ratio' },
                        { symbol: 'Cp_hot', name: 'Specific Heat Capacity Hot Gas', value: 1150, unit: 'J/kg/K' },
                        { symbol: 'LHV', name: 'Jet-A1 Lower Heating Value', value: '43.15', unit: 'MJ/kg' }
                      ]}
                      substitutedFormula={`T2 = 268.65 × (1 + (8.5^0.285 - 1) / 0.82) = 541.2 K\nΔT_combust = (0.98 × 0.024 × 43.15e6) / (1.024 × 1150) = 862.8 K\nTET = 541.2 + 862.8 = ${currentTetK} K`}
                      resultWithUnit={`${currentTetK} K (${(currentTetK - 273.15).toFixed(0)} °C)`}
                      source="Combustor energy balance (EQ-THERM-05). PR=8.5 (ASSUMPTION), η_c=0.82 (ASSUMPTION)."
                      confidence="COMPUTED"
                    />
                  </span>
                  <span className="text-[#FF3B30] font-bold">LIMIT: 1700 K</span>
                </div>

                <div className="relative w-44 h-24 flex items-center justify-center my-1">
                  <svg className="w-44 h-24" viewBox="0 0 100 56">
                    {/* Background Dial Arc */}
                    <path
                      d="M 8,50 A 42,42 0 0,1 92,50"
                      fill="none"
                      stroke="#1F2D45"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />

                    {/* Gradient Active Temperature Arc */}
                    <path
                      d="M 8,50 A 42,42 0 0,1 92,50"
                      fill="none"
                      stroke={tetStatus === 'CRITICAL' ? '#FF3B30' : tetStatus === 'WARNING' ? '#FFB800' : '#00E87A'}
                      strokeWidth="9"
                      strokeDasharray="131.95"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />

                    {/* 1700 K Limit Marker Tick Line */}
                    <line
                      x1={limitMarkerX - 2}
                      y1={limitMarkerY - 2}
                      x2={limitMarkerX + 3}
                      y2={limitMarkerY + 3}
                      stroke="#FF3B30"
                      strokeWidth="2.5"
                    />

                    {/* Threshold Label Tick */}
                    <text x="76" y="16" fill="#FF3B30" fontSize="4" fontWeight="bold" fontFamily="monospace">
                      1700K
                    </text>
                  </svg>

                  {/* Centered Large Live Temperature Readout */}
                  <div className="absolute bottom-1 flex flex-col items-center text-center">
                    <span className={`text-2xl font-mono-data font-bold tracking-tight ${
                      tetStatus === 'CRITICAL' ? 'text-[#FF3B30]' : tetStatus === 'WARNING' ? 'text-[#FFB800]' : 'text-[#E8EDF7]'
                    }`}>
                      {currentTetK} <span className="text-xs font-normal text-[#8A9BBE]">K</span>
                    </span>
                    <span className="text-[8.5px] font-mono-data text-[#8A9BBE]">
                      ({(currentTetK - 273.15).toFixed(0)} °C)
                    </span>
                  </div>
                </div>

                {/* Min / Max / Limit Range Indicators Bar */}
                <div className="w-full flex justify-between text-[8.5px] font-mono-data text-[#8A9BBE] px-2 pt-1 border-t border-[#1A2740]/60">
                  <span>1200 K</span>
                  <span className="text-[#00E87A]">NOMINAL: 1650 K</span>
                  <span className="text-[#FF3B30] font-bold">CRITICAL: &gt;1700 K</span>
                </div>
              </div>

              {/* SINGLE CRYSTAL BLADE INDICATOR PANEL */}
              <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-2">
                <div className="flex items-center justify-between border-b border-[#1A2740] pb-1">
                  <div className="flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#00F5E4]" />
                    <span className="text-[10px] font-bold font-sans-ui text-[#8A9BBE] uppercase">
                      SINGLE CRYSTAL BLADE METALLURGY
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono-data text-[#00F5E4] bg-[#00F5E4]/10 px-1.5 py-0.5 rounded border border-[#00F5E4]/30">
                    CMSX-4 ALLOY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-data">
                  <div className="bg-[#172236]/80 p-2 rounded border border-[#1A2740] space-y-1">
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">BLADE METAL TEMP</span>
                    <span className="text-sm font-bold text-[#00E87A]">{bladeMetalTempK} K</span>
                    <span className="text-[8px] text-[#8A9BBE] block">TBC Drop: -273 K</span>
                  </div>

                  <div className="bg-[#172236]/80 p-2 rounded border border-[#1A2740] space-y-1">
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">COOLING BLEED FLOW</span>
                    <span className="text-sm font-bold text-[#00A8FF]">{coolingEffectivenessPct}%</span>
                    <span className="text-[8px] text-[#8A9BBE] block">Air Effectiveness: NOMINAL</span>
                  </div>

                  <div className="bg-[#172236]/80 p-2 rounded border border-[#1A2740] space-y-1">
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">CREEP CONSUMPTION</span>
                    <span className={`text-sm font-bold ${
                      creepConsumptionRate > 2.0 ? 'text-[#FF3B30]' : 'text-[#FFB800]'
                    }`}>
                      {creepConsumptionRate}% / 100h
                    </span>
                    <span className="text-[8px] text-[#8A9BBE] block">Life Consumed: 23.4%</span>
                  </div>

                  <div className="bg-[#172236]/80 p-2 rounded border border-[#1A2740] space-y-1">
                    <span className="text-[#8A9BBE] text-[8.5px] block uppercase">TBC COATING INTEGRITY</span>
                    <span className="text-sm font-bold text-[#00E87A]">98.6%</span>
                    <span className="text-[8px] text-[#8A9BBE] block">No Delamination Risk</span>
                  </div>
                </div>
              </div>

              {/* OVER-TEMP SIMULATION STRESS TEST CONTROLLER */}
              <div className="bg-[#0A0F1E] p-2 rounded border border-[#1A2740] space-y-1.5">
                <div className="flex items-center justify-between text-[9.5px] font-mono-data">
                  <span className="text-[#8A9BBE] flex items-center space-x-1 uppercase">
                    <Sliders className="w-3 h-3 text-[#00A8FF]" />
                    <span>SIMULATE OVER-TEMP STRESS TEST</span>
                  </span>
                  <button
                    onClick={() => {
                      setIsStressTestActive(!isStressTestActive);
                      if (isStressTestActive) setSimulatedTetK(1653);
                    }}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                      isStressTestActive
                        ? 'bg-[#FF3B30] text-white animate-pulse'
                        : 'bg-[#172236] text-[#00A8FF] border border-[#00A8FF]/40'
                    }`}
                  >
                    {isStressTestActive ? 'RESET TEST' : 'ENABLE TEST'}
                  </button>
                </div>

                {isStressTestActive && (
                  <div className="space-y-1 pt-1 border-t border-[#1A2740]">
                    <div className="flex justify-between text-[9px] font-mono-data text-[#8A9BBE]">
                      <span>Adjust Simulated TET:</span>
                      <span className="text-[#FFB800] font-bold">{simulatedTetK} K</span>
                    </div>
                    <input
                      type="range"
                      min="1500"
                      max="1760"
                      step="5"
                      value={simulatedTetK}
                      onChange={(e) => setSimulatedTetK(Number(e.target.value))}
                      className="w-full accent-[#FF3B30] cursor-pointer bg-[#172236] h-1.5 rounded"
                    />
                    <div className="flex justify-between text-[8px] font-mono-data text-[#8A9BBE]">
                      <span>1500 K</span>
                      <span className="text-[#FF3B30] font-bold">1700 K THRESHOLD</span>
                      <span>1760 K</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: TIMELINE (RECHARTS REAL-TIME STREAMING TEMPERATURE HISTORY)   */}
          {/* ==================================================================== */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
                <div className="flex items-center justify-between text-[9.5px] font-mono-data text-[#8A9BBE] mb-2 border-b border-[#1A2740] pb-1">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-[#00A8FF]" />
                    <span>REAL-TIME TEMPERATURE TREND (K)</span>
                  </span>
                  <span className="text-[#FF3B30] font-bold">REF: 1700 K</span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
                      <XAxis dataKey="time" stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <YAxis domain={[1300, 1800]} stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }}
                        itemStyle={{ color: '#E8EDF7' }}
                      />
                      {/* 1700K Critical Threshold Line */}
                      <ReferenceLine
                        y={1700}
                        stroke="#FF3B30"
                        strokeDasharray="3 3"
                        label={{ value: '1700K LIMIT', fill: '#FF3B30', fontSize: 8, position: 'insideTopRight' }}
                      />
                      <Line type="monotone" dataKey="tetK" stroke="#00E87A" strokeWidth={2} dot={false} name="TET (K)" />
                      <Line type="monotone" dataKey="bladeMetalK" stroke="#00F5E4" strokeWidth={1.5} dot={false} name="Blade Metal (K)" />
                      <Line type="monotone" dataKey="combustorK" stroke="#FF6B35" strokeWidth={1} dot={false} name="Combustor (K)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center space-x-4 text-[8.5px] font-mono-data text-[#8A9BBE] pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#00E87A]" />
                    <span>TET</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#00F5E4]" />
                    <span>Blade Metal</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#FF6B35]" />
                    <span>Combustor</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#FF3B30]" />
                    <span>1700K Limit</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: HEATMAP (VISUAL INTERACTIVE THERMAL MAP SCHEMATIC)            */}
          {/* ==================================================================== */}
          {activeTab === 'HEATMAP' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-2">
                <div className="text-[9.5px] font-mono-data text-[#8A9BBE] uppercase border-b border-[#1A2740] pb-1 flex justify-between">
                  <span>POWERTRAIN THERMAL ZONES MAP</span>
                  <span className="text-[#00A8FF]">CLICK ZONE TO INSPECT</span>
                </div>

                {/* Hot Sections Graphic Diagram */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {materialZones.map((zone) => {
                    const isSelected = selectedHotspot === zone.id;
                    const tempPct = Math.min(100, (zone.currentTempK / zone.maxTempK) * 100);

                    return (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedHotspot(zone.id)}
                        className={`p-2 rounded border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-white shadow-lg'
                            : 'bg-[#172236]/80 border-[#1A2740] text-[#8A9BBE] hover:border-[#00A8FF]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold font-sans-ui uppercase truncate">{zone.name}</span>
                          <span className={`w-2 h-2 rounded-full ${
                            zone.status === 'CRITICAL' ? 'bg-[#FF3B30] animate-ping' : zone.status === 'WARNING' ? 'bg-[#FFB800]' : 'bg-[#00E87A]'
                          }`} />
                        </div>

                        <div className="my-1.5">
                          <span className="text-xs font-mono-data font-bold text-[#E8EDF7]">
                            {zone.currentTempK} {zone.unit}
                          </span>
                          <span className="text-[8px] text-[#8A9BBE] block">Max: {zone.maxTempK} {zone.unit}</span>
                        </div>

                        {/* Temp bar */}
                        <div className="w-full bg-[#0A0F1E] h-1 rounded overflow-hidden">
                          <div
                            className={`h-full ${
                              tempPct > 95 ? 'bg-[#FF3B30]' : tempPct > 85 ? 'bg-[#FFB800]' : 'bg-[#00E87A]'
                            }`}
                            style={{ width: `${tempPct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Zone Deep Dive Callout */}
                {selectedHotspot && (
                  <div className="bg-[#0A0F1E] p-2 rounded border border-[#00A8FF]/40 space-y-1 text-[10px] font-mono-data">
                    {(() => {
                      const zone = materialZones.find(z => z.id === selectedHotspot) || materialZones[1];
                      return (
                        <>
                          <div className="flex justify-between text-[#00A8FF] font-bold border-b border-[#1A2740] pb-1">
                            <span>{zone.name.toUpperCase()} [{zone.material}]</span>
                            <span>{zone.currentTempK} / {zone.maxTempK} {zone.unit}</span>
                          </div>
                          <p className="text-[9px] text-[#8A9BBE] pt-0.5">{zone.description}</p>
                          <div className="flex justify-between text-[8.5px] text-[#8A9BBE] pt-0.5">
                            <span>Location: {zone.location}</span>
                            <span className="text-[#00E87A]">Status: {zone.status}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 4: MATERIALS (METALLURGICAL LIMITS TABLE & MARGINS)              */}
          {/* ==================================================================== */}
          {activeTab === 'MATERIALS' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-2">
                <div className="text-[9.5px] font-mono-data text-[#8A9BBE] uppercase border-b border-[#1A2740] pb-1 flex justify-between">
                  <span>AEROSPACE MATERIAL LIMITS MATRIX</span>
                  <span className="text-[#00E87A]">ALL ENVELOPES VALIDATED</span>
                </div>

                <div className="space-y-1.5">
                  {materialZones.map((zone) => {
                    const margin = zone.maxTempK - zone.currentTempK;
                    return (
                      <div
                        key={zone.id}
                        className="p-1.5 rounded bg-[#172236]/80 border border-[#1A2740] flex items-center justify-between text-[10px] font-mono-data"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#E8EDF7]">{zone.name}</div>
                          <div className="text-[8.5px] text-[#8A9BBE]">{zone.material}</div>
                        </div>

                        <div className="flex items-center space-x-3 text-right">
                          <div>
                            <span className="text-[8px] text-[#8A9BBE] block">OPERATING</span>
                            <span className="font-bold text-[#00A8FF]">{zone.currentTempK} {zone.unit}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#8A9BBE] block">LIMIT</span>
                            <span className="font-bold text-[#FF3B30]">{zone.maxTempK} {zone.unit}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#8A9BBE] block">MARGIN</span>
                            <span className={`font-bold ${margin < 50 ? 'text-[#FF3B30]' : 'text-[#00E87A]'}`}>
                              +{margin} {zone.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER STATS STRIP */}
        <div className="pt-2 border-t border-[#1A2740] mt-2 bg-[#0A0F1E]/60 p-1.5 rounded text-[9.5px] font-mono-data flex justify-between text-[#8A9BBE] flex-shrink-0">
          <span>COOLING BLEED: <strong className="text-[#00E87A]">8.4%</strong></span>
          <span>TBC STATUS: <strong className="text-[#00F5E4]">INTACT</strong></span>
          <span>CREEP MARGIN: <strong className={currentTetK > 1700 ? 'text-[#FF3B30]' : 'text-[#00E87A]'}>{tetMarginK} K</strong></span>
        </div>
      </div>

      {/* EXPANDED FULLSCREEN MODAL FOR COMPREHENSIVE THERMAL DIAGNOSTICS */}
      {showExpandedModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-[#1F2D45] rounded-lg w-full max-w-3xl p-4 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F2D45] pb-3">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-[#FF6B35]" />
                <div>
                  <h2 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
                    THERMAL & MATERIAL DEGRADATION MONITOR MATRIX
                  </h2>
                  <p className="text-[10px] font-mono-data text-[#8A9BBE]">
                    SINGLE CRYSTAL SUPERALLOY CREEP & HYBRID POWERTRAIN THERMAL DIAGNOSTICS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExpandedModal(false)}
                className="p-1.5 rounded bg-[#172236] text-[#8A9BBE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-4 gap-2 bg-[#111A2E] p-3 rounded border border-[#1A2740] text-xs font-mono-data">
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">TURBINE ENTRY TEMP</span>
                <span className={`text-base font-bold ${
                  currentTetK > 1700 ? 'text-[#FF3B30]' : 'text-[#00E87A]'
                }`}>
                  {currentTetK} K
                </span>
                <span className="text-[8.5px] text-[#8A9BBE] block">Threshold: 1700 K</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">CMSX-4 BLADE METAL</span>
                <span className="text-base font-bold text-[#00F5E4]">{bladeMetalTempK} K</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">TBC Delta: -273 K</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">CREEP CONSUMPTION RATE</span>
                <span className="text-base font-bold text-[#FFB800]">{creepConsumptionRate}% / 100h</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">Accumulated: 23.4%</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">COOLING BLEED FLOW</span>
                <span className="text-base font-bold text-[#00E87A]">8.4%</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">Bleed Margin: +2.1%</span>
              </div>
            </div>

            {/* Comprehensive Materials Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider">
                AEROSPACE METALLURGICAL & THERMAL TOLERANCE MATRIX
              </h3>
              <div className="bg-[#111A2E] rounded border border-[#1A2740] p-2 space-y-1.5 text-xs font-mono-data">
                {materialZones.map((m) => (
                  <div key={m.id} className="p-2 bg-[#172236]/80 rounded flex justify-between items-center border border-[#1A2740]">
                    <div>
                      <div className="font-bold text-[#E8EDF7]">{m.name}</div>
                      <div className="text-[9.5px] text-[#8A9BBE]">{m.material} — {m.location}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#00A8FF] font-bold">{m.currentTempK} {m.unit}</span>
                      <span className="text-[#8A9BBE] text-[10px] block">Limit: {m.maxTempK} {m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#1F2D45] flex justify-end">
              <button
                onClick={() => setShowExpandedModal(false)}
                className="bg-[#00A8FF] hover:bg-[#0088CC] text-white font-sans-ui font-bold text-xs uppercase px-4 py-2 rounded"
              >
                CLOSE DIAGNOSTICS
              </button>
            </div>
          </div>
        </div>
      )}
    </CornerReticle>
  );
};
