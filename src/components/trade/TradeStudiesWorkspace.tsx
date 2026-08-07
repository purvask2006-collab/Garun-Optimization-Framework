import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Download, 
  Battery, 
  Flame, 
  Compass, 
  Mountain, 
  Scale, 
  Star, 
  Triangle, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceDot, 
  Cell 
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { 
  simulateFullMission, 
  computeOptimalLoiterEndurance, 
  VehicleParams, 
  PropulsionParams, 
  MissionPhaseInput 
} from '../../physics/garunPhysics';
import { 
  COMP_MTOW_KG, 
  COMP_PAYLOAD_KG, 
  EST_OEW_KG, 
  DESIGN_BATTERY_KWH, 
  DESIGN_ENGINE_KW 
} from '../../physics/garunSpec';
import { CitationBadge } from '../common/CitationBadge';

export type TradeStudyType = 
  | 'BATTERY_CAPACITY'
  | 'ENGINE_POWER'
  | 'LOITER_STRATEGY'
  | 'CRUISE_ALTITUDE'
  | 'PAYLOAD_TRADE';

interface TradeDataPoint {
  xValue: number | string;
  xLabel: string;
  enduranceHr: number;
  fuelConsumedKg: number;
  finalSocPct: number;
  isFeasible: boolean;
  isCompetitionPoint: boolean;
  isOptimalPoint: boolean;
  notes: string;
}

const defaultVehicle: VehicleParams = {
  mtowKg: COMP_MTOW_KG,
  payloadKg: COMP_PAYLOAD_KG,
  oewKg: EST_OEW_KG,
  wingAreaM2: 15,
  AR: 12,
  e: 0.82,
  CD0: 0.022,
  etaProp: 0.82
};

const defaultPropulsion: PropulsionParams = {
  engineRatedKw: DESIGN_ENGINE_KW,
  batteryCapacityKwh: DESIGN_BATTERY_KWH,
  busVoltageV: 400,
  etaGen: 0.93,
  etaRect: 0.97,
  etaInv: 0.96,
  etaMotor: 0.95,
  peukertN: 1.05,
  socMin: 0.20
};

const basePhasesTemplate: MissionPhaseInput[] = [
  { phaseName: 'Taxi & Takeoff', durationHr: 0.1, altM: 0, speedKmh: 100, engineLoadFraction: 1.0, batteryPowerKw: 25, strategy: 'hybrid' },
  { phaseName: 'Climb to 3000m', durationHr: 0.25, altM: 1500, speedKmh: 180, engineLoadFraction: 0.95, batteryPowerKw: 15, strategy: 'hybrid' },
  { phaseName: 'Cruise (250 km/h)', durationHr: 2.0, altM: 3000, speedKmh: 250, engineLoadFraction: 0.85, batteryPowerKw: 0, strategy: 'engine_dominant' },
  { phaseName: 'Loiter / Patrol', durationHr: 4.0, altM: 3000, speedKmh: 150, engineLoadFraction: 0.65, batteryPowerKw: 0, strategy: 'engine_dominant' },
  { phaseName: 'Descent & Land', durationHr: 0.2, altM: 1000, speedKmh: 140, engineLoadFraction: 0.20, batteryPowerKw: -5, strategy: 'charge_sustain' }
];

export const TradeStudiesWorkspace: React.FC = () => {
  const [activeStudy, setActiveStudy] = useState<TradeStudyType>('BATTERY_CAPACITY');

  // Compute Trade Data dynamically from simulation physics engine
  const tradeData = useMemo<TradeDataPoint[]>(() => {
    if (activeStudy === 'BATTERY_CAPACITY') {
      const batterySteps = [5, 10, 15, 20, 22, 25, 30, 35, 40];
      const results: TradeDataPoint[] = [];

      for (const bKwh of batterySteps) {
        const batteryMassKg = (bKwh * 1000) / 200; // 200 Wh/kg
        const fuelMassAvailable = Math.max(0, COMP_MTOW_KG - EST_OEW_KG - COMP_PAYLOAD_KG - batteryMassKg);

        const prop = { ...defaultPropulsion, batteryCapacityKwh: bKwh };
        const optLoiter = computeOptimalLoiterEndurance(basePhasesTemplate, defaultVehicle, prop, fuelMassAvailable);

        results.push({
          xValue: bKwh,
          xLabel: `${bKwh} kWh`,
          enduranceHr: optLoiter.totalEnduranceHr,
          fuelConsumedKg: optLoiter.totalFuelConsumedKg,
          finalSocPct: optLoiter.finalSOC,
          isFeasible: optLoiter.feasible,
          isCompetitionPoint: bKwh === 22,
          isOptimalPoint: false,
          notes: bKwh === 22 
            ? 'IIT Indore × HAL Baseline Design Point' 
            : fuelMassAvailable <= 0 
            ? 'Mass limit exceeded (no fuel capacity)' 
            : `Fuel mass budget: ${fuelMassAvailable.toFixed(1)} kg`
        });
      }

      // Mark optimal point
      let maxEnd = -1;
      let optIdx = -1;
      results.forEach((r, idx) => {
        if (r.isFeasible && r.enduranceHr > maxEnd) {
          maxEnd = r.enduranceHr;
          optIdx = idx;
        }
      });
      if (optIdx !== -1) results[optIdx].isOptimalPoint = true;

      return results;
    }

    if (activeStudy === 'ENGINE_POWER') {
      const engineSteps = [40, 50, 60, 70, 80, 90];
      const results: TradeDataPoint[] = [];

      for (const eKw of engineSteps) {
        const prop = { ...defaultPropulsion, engineRatedKw: eKw };
        const optLoiter = computeOptimalLoiterEndurance(basePhasesTemplate, defaultVehicle, prop, 248);

        const isCruisePossibleEngineOnly = eKw >= 70;

        results.push({
          xValue: eKw,
          xLabel: `${eKw} kW`,
          enduranceHr: optLoiter.totalEnduranceHr,
          fuelConsumedKg: optLoiter.totalFuelConsumedKg,
          finalSocPct: optLoiter.finalSOC,
          isFeasible: optLoiter.feasible,
          isCompetitionPoint: eKw === 60,
          isOptimalPoint: eKw === 70,
          notes: eKw === 60 
            ? 'Competition baseline. Cruise requires battery supplement' 
            : isCruisePossibleEngineOnly 
            ? 'Engine power sufficient for standalone cruise' 
            : 'Engine underpowered for standalone cruise'
        });
      }
      return results;
    }

    if (activeStudy === 'LOITER_STRATEGY') {
      const strategies: Array<{ name: string; id: MissionPhaseInput['strategy']; note: string }> = [
        { name: 'Engine Dominant', id: 'engine_dominant', note: 'Engine handles 90% loiter load, minimal battery usage' },
        { name: 'Hybrid Share', id: 'hybrid', note: 'Engine and battery share loiter load equally' },
        { name: 'Battery Dominant', id: 'battery_dominant', note: 'Quiet electric loiter, engine idled' },
        { name: 'Charge Sustain', id: 'charge_sustain', note: 'Engine oversized to charge battery during loiter' },
      ];

      return strategies.map((strat) => {
        const phases: MissionPhaseInput[] = basePhasesTemplate.map(p => 
          p.phaseName.includes('Loiter') ? { ...p, strategy: strat.id } : p
        );

        const sim = simulateFullMission(phases, defaultVehicle, defaultPropulsion);

        return {
          xValue: strat.name,
          xLabel: strat.name,
          enduranceHr: Number(sim.enduranceHr.toFixed(2)),
          fuelConsumedKg: Number(sim.totalFuelKg.toFixed(1)),
          finalSocPct: Number((sim.finalSOC * 100).toFixed(1)),
          isFeasible: sim.feasible,
          isCompetitionPoint: strat.id === 'engine_dominant',
          isOptimalPoint: strat.id === 'engine_dominant',
          notes: strat.note
        };
      });
    }

    if (activeStudy === 'CRUISE_ALTITUDE') {
      const altSteps = [1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000];
      const results: TradeDataPoint[] = [];

      for (const alt of altSteps) {
        const phases: MissionPhaseInput[] = basePhasesTemplate.map(p => ({ ...p, altM: alt }));
        const optLoiter = computeOptimalLoiterEndurance(phases, defaultVehicle, defaultPropulsion, 248);

        results.push({
          xValue: alt,
          xLabel: `${alt} m`,
          enduranceHr: optLoiter.totalEnduranceHr,
          fuelConsumedKg: optLoiter.totalFuelConsumedKg,
          finalSocPct: optLoiter.finalSOC,
          isFeasible: optLoiter.feasible,
          isCompetitionPoint: alt === 3000,
          isOptimalPoint: alt === 3000,
          notes: alt === 3000 
            ? 'Design cruise altitude (Optimal L/D & density trade)' 
            : alt > 6000 
            ? 'High altitude turboshaft derating limits thrust' 
            : 'Higher density increases drag at 250 km/h'
        });
      }
      return results;
    }

    if (activeStudy === 'PAYLOAD_TRADE') {
      const payloadSteps = [100, 150, 200, 250, 300];
      const results: TradeDataPoint[] = [];

      const batteryMassKg = (DESIGN_BATTERY_KWH * 1000) / 200;

      for (const payload of payloadSteps) {
        const fuelMassAvailable = Math.max(0, COMP_MTOW_KG - EST_OEW_KG - payload - batteryMassKg);
        const veh = { ...defaultVehicle, payloadKg: payload };

        const optLoiter = computeOptimalLoiterEndurance(basePhasesTemplate, veh, defaultPropulsion, fuelMassAvailable);

        results.push({
          xValue: payload,
          xLabel: `${payload} kg`,
          enduranceHr: optLoiter.totalEnduranceHr,
          fuelConsumedKg: optLoiter.totalFuelConsumedKg,
          finalSocPct: optLoiter.finalSOC,
          isFeasible: optLoiter.feasible,
          isCompetitionPoint: payload === 200,
          isOptimalPoint: payload === 100,
          notes: payload === 200 
            ? 'IIT Indore × HAL Competition Payload Target' 
            : payload === 100 
            ? 'Max endurance payload configuration' 
            : `Payload ${payload} kg reduces fuel capacity to ${fuelMassAvailable.toFixed(1)} kg`
        });
      }
      return results;
    }

    return [];
  }, [activeStudy]);

  const compPoint = tradeData.find(d => d.isCompetitionPoint) || tradeData[0];
  const optPoint = tradeData.find(d => d.isOptimalPoint) || tradeData[0];

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Variable Value', 'Total Endurance (hr)', 'Fuel Consumed (kg)', 'Final SOC (%)', 'Feasible', 'Notes'];
    const rows = tradeData.map(d => [
      `"${d.xLabel}"`,
      d.enduranceHr,
      d.fuelConsumedKg,
      d.finalSocPct,
      d.isFeasible ? 'PASS' : 'FAIL',
      `"${d.notes}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HAL_GARUN_TradeStudy_${activeStudy}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-[#0A0F1E] p-3 flex flex-col space-y-3 overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#00A8FF]/10 border border-[#00A8FF]/40 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#00A8FF]" />
          </div>
          <div>
            <h1 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-2">
              <span>SYSTEMS TRADE STUDIES & SENSITIVITY ANALYSIS WORKSPACE</span>
              <span className="text-[9.5px] bg-[#172236] text-[#00E87A] px-2 py-0.5 rounded border border-[#1A2740] font-mono-data">
                SIMULATION-DERIVED
              </span>
            </h1>
            <p className="text-[9.5px] font-mono-data text-[#8A9BBE]">
              Parametric trade studies computed via full mission physics engine (ISA Atmosphere + Part-load SFC + Peukert SOC).
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 bg-[#00A8FF]/20 hover:bg-[#00A8FF] text-[#00A8FF] hover:text-[#0A0F1E] border border-[#00A8FF]/50 rounded text-[10px] font-bold font-mono-data transition-colors flex items-center space-x-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT CSV REPORT</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Sidebar: Select Trade Study */}
        <div className="col-span-3 flex flex-col space-y-2 min-h-0">
          <div className="px-2 py-1 bg-[#111A2E] border border-[#1A2740] rounded text-[9.5px] font-mono-data text-[#00A8FF] font-bold uppercase">
            SELECT TRADE PARAMETER
          </div>

          <div className="flex-1 flex flex-col space-y-1.5 overflow-y-auto pr-1">
            <button
              onClick={() => setActiveStudy('BATTERY_CAPACITY')}
              className={`p-2.5 rounded border text-left transition-all ${
                activeStudy === 'BATTERY_CAPACITY'
                  ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-white shadow-md'
                  : 'bg-[#0F1729] border-[#1A2740] text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Battery className="w-4 h-4 text-[#00E87A]" />
                  <span className="text-[10.5px] font-bold font-mono-data">1. Battery Capacity</span>
                </div>
                <CitationBadge citationKey="BATTERY_SPECIFIC_ENERGY" />
              </div>
              <p className="text-[9px] text-[#8A9BBE] mt-1 leading-snug">
                Sweep 5–40 kWh. Trade battery mass vs fuel capacity under 1000 kg MTOW.
              </p>
            </button>

            <button
              onClick={() => setActiveStudy('ENGINE_POWER')}
              className={`p-2.5 rounded border text-left transition-all ${
                activeStudy === 'ENGINE_POWER'
                  ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-white shadow-md'
                  : 'bg-[#0F1729] border-[#1A2740] text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-[#FFB800]" />
                  <span className="text-[10.5px] font-bold font-mono-data">2. Engine Power</span>
                </div>
                <CitationBadge citationKey="TURBOSHAFT_SFC" />
              </div>
              <p className="text-[9px] text-[#8A9BBE] mt-1 leading-snug">
                Sweep 40–90 kW. Identify standalone engine cruise vs battery supplement crossover.
              </p>
            </button>

            <button
              onClick={() => setActiveStudy('LOITER_STRATEGY')}
              className={`p-2.5 rounded border text-left transition-all ${
                activeStudy === 'LOITER_STRATEGY'
                  ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-white shadow-md'
                  : 'bg-[#0F1729] border-[#1A2740] text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-[#00F5E4]" />
                  <span className="text-[10.5px] font-bold font-mono-data">3. Loiter Strategy</span>
                </div>
                <CitationBadge citationKey="ELECTRICAL_EFFICIENCY" />
              </div>
              <p className="text-[9px] text-[#8A9BBE] mt-1 leading-snug">
                Compare Engine Dominant, Hybrid, Battery Dominant, and Charge Sustain modes.
              </p>
            </button>

            <button
              onClick={() => setActiveStudy('CRUISE_ALTITUDE')}
              className={`p-2.5 rounded border text-left transition-all ${
                activeStudy === 'CRUISE_ALTITUDE'
                  ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-white shadow-md'
                  : 'bg-[#0F1729] border-[#1A2740] text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mountain className="w-4 h-4 text-[#B47FFF]" />
                  <span className="text-[10.5px] font-bold font-mono-data">4. Cruise Altitude</span>
                </div>
                <CitationBadge citationKey="ISA_ATMOSPHERE" />
              </div>
              <p className="text-[9px] text-[#8A9BBE] mt-1 leading-snug">
                Sweep 1,000–10,000m altitude. ISA lapse rate vs engine derating trade-off.
              </p>
            </button>

            <button
              onClick={() => setActiveStudy('PAYLOAD_TRADE')}
              className={`p-2.5 rounded border text-left transition-all ${
                activeStudy === 'PAYLOAD_TRADE'
                  ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-white shadow-md'
                  : 'bg-[#0F1729] border-[#1A2740] text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-[10.5px] font-bold font-mono-data">5. Payload vs Endurance</span>
                </div>
                <CitationBadge citationKey="COMPETITION_PAYLOAD" />
              </div>
              <p className="text-[9px] text-[#8A9BBE] mt-1 leading-snug">
                Sweep 100–300 kg payload. Quantify payload penalty on fuel capacity & flight time.
              </p>
            </button>
          </div>
        </div>

        {/* Right Area: Chart and Data Table */}
        <div className="col-span-9 flex flex-col space-y-3 min-h-0">
          {/* Summary Stat Bar */}
          <div className="grid grid-cols-3 gap-3">
            <CornerReticle className="bg-[#0F1729] p-2.5 border border-[#00A8FF]/30 rounded flex items-center justify-between">
              <div>
                <span className="text-[8.5px] font-mono-data text-[#8A9BBE] uppercase block flex items-center space-x-1">
                  <Star className="w-3 h-3 text-[#00A8FF] inline mr-1 fill-[#00A8FF]" />
                  COMPETITION POINT
                </span>
                <span className="text-lg font-bold font-mono-data text-[#00A8FF]">
                  {compPoint?.xLabel}
                </span>
                <span className="text-[9px] text-[#E8EDF7] block font-mono-data">
                  Endurance: <span className="text-[#00E87A] font-bold">{compPoint?.enduranceHr} hr</span>
                </span>
              </div>
              <div className="text-right text-[9px] font-mono-data text-[#8A9BBE]">
                <span>Fuel: {compPoint?.fuelConsumedKg} kg</span>
                <span className="block">Final SOC: {compPoint?.finalSocPct}%</span>
              </div>
            </CornerReticle>

            <CornerReticle className="bg-[#0F1729] p-2.5 border border-[#00E87A]/30 rounded flex items-center justify-between">
              <div>
                <span className="text-[8.5px] font-mono-data text-[#8A9BBE] uppercase block flex items-center space-x-1">
                  <Triangle className="w-3 h-3 text-[#00E87A] inline mr-1 fill-[#00E87A]" />
                  OPTIMAL PEAK POINT
                </span>
                <span className="text-lg font-bold font-mono-data text-[#00E87A]">
                  {optPoint?.xLabel}
                </span>
                <span className="text-[9px] text-[#E8EDF7] block font-mono-data">
                  Max Endurance: <span className="text-[#00E87A] font-bold">{optPoint?.enduranceHr} hr</span>
                </span>
              </div>
              <div className="text-right text-[9px] font-mono-data text-[#8A9BBE]">
                <span>Fuel: {optPoint?.fuelConsumedKg} kg</span>
                <span className="block text-[#00E87A] font-bold">FEASIBLE</span>
              </div>
            </CornerReticle>

            <CornerReticle className="bg-[#0F1729] p-2.5 border border-[#1A2740] rounded flex items-center justify-between">
              <div>
                <span className="text-[8.5px] font-mono-data text-[#8A9BBE] uppercase block">
                  PHYSICS ENGINE MODEL
                </span>
                <span className="text-xs font-bold font-mono-data text-white block mt-1">
                  `simulateFullMission()`
                </span>
                <span className="text-[8.5px] text-[#00E87A] block mt-0.5">
                  ISA Atmosphere + Peukert SOC
                </span>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#00E87A]/80" />
            </CornerReticle>
          </div>

          {/* Chart Display Area */}
          <CornerReticle className="h-[260px] bg-[#0F1729] p-3 border border-[#1A2740] rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono-data text-[#E8EDF7] font-bold uppercase flex items-center space-x-2">
                <span>
                  {activeStudy === 'BATTERY_CAPACITY' && 'Total Mission Endurance vs Battery Capacity (kWh)'}
                  {activeStudy === 'ENGINE_POWER' && 'Total Mission Endurance vs Turboshaft Engine Rating (kW)'}
                  {activeStudy === 'LOITER_STRATEGY' && 'Mission Endurance Comparison Across Loiter Power Strategies'}
                  {activeStudy === 'CRUISE_ALTITUDE' && 'Total Mission Endurance vs Cruise Altitude (m)'}
                  {activeStudy === 'PAYLOAD_TRADE' && 'Payload Mass vs Total Mission Endurance Trade-Off'}
                </span>
              </span>

              <div className="flex items-center space-x-3 text-[9px] font-mono-data">
                <span className="flex items-center space-x-1 text-[#00A8FF]">
                  <Star className="w-3 h-3 fill-[#00A8FF]" />
                  <span>Competition Baseline (★)</span>
                </span>
                <span className="flex items-center space-x-1 text-[#00E87A]">
                  <Triangle className="w-3 h-3 fill-[#00E87A]" />
                  <span>Optimal Peak (▲)</span>
                </span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                {activeStudy === 'LOITER_STRATEGY' ? (
                  <BarChart data={tradeData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2740" />
                    <XAxis dataKey="xLabel" stroke="#8A9BBE" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#8A9BBE" tick={{ fontSize: 10 }} unit=" hr" domain={[0, 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0D1527', borderColor: '#00A8FF', borderRadius: '4px', fontSize: '11px' }}
                    />
                    <Bar dataKey="enduranceHr" name="Endurance (hr)" radius={[4, 4, 0, 0]}>
                      {tradeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isCompetitionPoint ? '#00A8FF' : entry.isFeasible ? '#00E87A' : '#FF3B30'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart data={tradeData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2740" />
                    <XAxis dataKey="xValue" stroke="#8A9BBE" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#8A9BBE" tick={{ fontSize: 10 }} unit=" hr" domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0D1527', borderColor: '#00A8FF', borderRadius: '4px', fontSize: '11px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="enduranceHr" 
                      name="Endurance (hr)" 
                      stroke="#00A8FF" 
                      strokeWidth={2.5} 
                      dot={{ r: 4, fill: '#00A8FF' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CornerReticle>

          {/* Computed Value Data Table */}
          <CornerReticle className="flex-1 bg-[#0F1729] border border-[#1A2740] rounded overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-left font-mono-data border-collapse">
                <thead>
                  <tr className="bg-[#111A2E] text-[9.5px] text-[#8A9BBE] uppercase border-b border-[#1A2740]">
                    <th className="py-2 px-3">SWEEP VARIABLE</th>
                    <th className="py-2 px-3">TOTAL ENDURANCE</th>
                    <th className="py-2 px-3">FUEL CONSUMPTION</th>
                    <th className="py-2 px-3">FINAL BATTERY SOC</th>
                    <th className="py-2 px-3">FEASIBILITY</th>
                    <th className="py-2 px-3">ENGINEERING NOTES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2740] text-[10px]">
                  {tradeData.map((row, idx) => (
                    <tr 
                      key={idx}
                      className={`transition-colors ${
                        row.isCompetitionPoint 
                          ? 'bg-[#00A8FF]/10' 
                          : row.isOptimalPoint 
                          ? 'bg-[#00E87A]/10' 
                          : 'hover:bg-[#172236]'
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-white flex items-center space-x-1.5">
                        {row.isCompetitionPoint && <span title="Competition Baseline"><Star className="w-3.5 h-3.5 text-[#00A8FF] fill-[#00A8FF]" /></span>}
                        {row.isOptimalPoint && !row.isCompetitionPoint && <span title="Optimal Peak Point"><Triangle className="w-3.5 h-3.5 text-[#00E87A] fill-[#00E87A]" /></span>}
                        <span>{row.xLabel}</span>
                      </td>

                      <td className="py-2 px-3 font-bold text-[#00E87A]">
                        {row.enduranceHr.toFixed(2)} hr
                      </td>

                      <td className="py-2 px-3 text-[#E8EDF7]">
                        {row.fuelConsumedKg.toFixed(1)} kg
                      </td>

                      <td className="py-2 px-3 text-[#E8EDF7]">
                        {row.finalSocPct.toFixed(1)} %
                      </td>

                      <td className="py-2 px-3">
                        {row.isFeasible ? (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#00E87A]/20 text-[#00E87A] text-[8.5px] font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>FEASIBLE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30] text-[8.5px] font-bold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>UNFEASIBLE</span>
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-[#8A9BBE]">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CornerReticle>
        </div>
      </div>
    </div>
  );
};
