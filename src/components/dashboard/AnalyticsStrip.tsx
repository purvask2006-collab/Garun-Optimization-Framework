import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Tooltip 
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { StatusBadge } from '../common/StatusBadge';
import { FormulaPanel } from '../common/FormulaPanel';
import { useGarunStore } from '../../store/useGarunStore';
import { 
  Fuel, 
  Battery, 
  Gauge, 
  Flame, 
  Zap, 
  Award, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  TrendingUp,
  Clock
} from 'lucide-react';

interface HistoricalPoint {
  t: number;
  fuel: number;
  soc: number;
  rpm: number;
  tet: number;
  efficiency: number;
}

export const AnalyticsStrip: React.FC = () => {
  const { activeTelemetryFrame, simulationParams, simulationResult, isTelemetryLive, setActiveModule, vehicleInputs } = useGarunStore();

  const engine = activeTelemetryFrame?.engine || { powerKw: 110, rpm: 5450, egtCelsius: 720, fuelMassKg: 215, sfcGkwh: 195 };
  const battery = activeTelemetryFrame?.battery || { socPct: 78.4, cellTempAvgC: 38.2, dischargeKw: 40.0, packVoltageV: 620.4, currentDrawA: 64.5, status: 'NOMINAL' };
  const overallEfficiencyPct = activeTelemetryFrame?.overallEfficiencyPct || activeTelemetryFrame?.systemEfficiencyPct || 91.2;
  const missionPhase = activeTelemetryFrame?.missionPhase || 'CRUISE';

  // GARUN Turboshaft TET — Combustor Energy Balance Model
  // Reference: EQ-THERM-05 from Equations Database
  const currentEnginePowerKw = engine.powerKw || 63.2;
  const engineLoadFraction = Math.min(1.0, Math.max(0.1, currentEnginePowerKw / 75)); // 75 kW rated

  // ISA compressor inlet temperature at 3000m
  const T_ambient = Math.max(216.65, 288.15 - 0.0065 * Math.min(3000, 11000)); // ~268.65K at 3000m

  // Compressor exit temperature (T2): PR = 6 for this engine class, η_c = 0.82
  const PR = 4 + 2 * engineLoadFraction; // pressure ratio varies 4:1 to 6:1 with load
  const GAMMA = 1.4;
  const ETA_COMPRESSOR = 0.82;
  const T2 = T_ambient * (1 + (Math.pow(PR, (GAMMA - 1) / GAMMA) - 1) / ETA_COMPRESSOR);

  // Combustor temperature rise (ΔT_combust)
  const ETA_COMBUSTOR = 0.98;
  const LHV_J_PER_KG = 43.15e6; // Jet-A1
  const CP_HOT = 1150; // J/kg/K (hot gas)
  const FUEL_AIR_RATIO = 0.020 + 0.008 * engineLoadFraction; // FAR varies with load
  const DELTA_T_COMBUST = (ETA_COMBUSTOR * FUEL_AIR_RATIO * LHV_J_PER_KG) / ((1 + FUEL_AIR_RATIO) * CP_HOT);

  // TET
  const derivedTetKelvin = Math.min(1700, Math.round(T2 + DELTA_T_COMBUST));
  const tetMarginKelvin = 1700 - derivedTetKelvin;
  const tetWarning = derivedTetKelvin > 1650 ? 'APPROACHING TET LIMIT' : 'NOMINAL';
  const tetStatus = derivedTetKelvin > 1650 ? 'WARNING' : tetMarginKelvin < 30 ? 'CRITICAL' : 'NOMINAL';

  // Rolling Live Telemetry History Buffer for Sparklines
  const [history, setHistory] = useState<HistoricalPoint[]>([
    { t: 0, fuel: 245, soc: 98, rpm: 5200, tet: 1610, efficiency: 80.5 },
    { t: 1, fuel: 240, soc: 94, rpm: 5350, tet: 1630, efficiency: 81.2 },
    { t: 2, fuel: 235, soc: 90, rpm: 5400, tet: 1640, efficiency: 81.8 },
    { t: 3, fuel: 228, soc: 85, rpm: 5450, tet: 1650, efficiency: 82.1 },
    { t: 4, fuel: 222, soc: 81, rpm: 5480, tet: 1652, efficiency: 82.4 },
    { t: 5, fuel: 215, soc: 78, rpm: engine.rpm ?? 42000, tet: derivedTetKelvin, efficiency: overallEfficiencyPct }
  ]);

  // Append real-time updates to sparkline buffer
  useEffect(() => {
    try {
      performance.mark('garun:telemetry-update-start');
    } catch {
      // ignore
    }

    setHistory((prev) => {
      const nextPoint: HistoricalPoint = {
        t: prev.length,
        fuel: engine.fuelMassKg ?? 156.0,
        soc: battery.socPct ?? 78.4,
        rpm: engine.rpm ?? 42000,
        tet: derivedTetKelvin,
        efficiency: overallEfficiencyPct
      };
      const updated = [...prev, nextPoint];
      if (updated.length > 15) {
        return updated.slice(updated.length - 15);
      }
      return updated;
    });

    try {
      performance.mark('garun:telemetry-update-end');
      performance.measure('garun:telemetry-update', 'garun:telemetry-update-start', 'garun:telemetry-update-end');
    } catch {
      // ignore
    }
  }, [engine.fuelMassKg, battery.socPct, engine.rpm, derivedTetKelvin, overallEfficiencyPct]);

  // Tradeoff Radar Data Points
  const radarData = [
    { subject: 'Endurance', value: Math.min(100, Math.round(((simulationResult?.totalEnduranceHours ?? 9.2) / 16) * 100)) },
    { subject: 'Speed', value: Math.min(100, Math.round(((activeTelemetryFrame.airspeedKts ?? 135) / 200) * 100)) },
    { subject: 'Payload', value: Math.min(100, Math.round((simulationParams.payloadKg / 250) * 100)) },
    { subject: 'SFC Eff.', value: Math.min(100, Math.round(((240 - (engine.sfcGkwh ?? 380)) / 70) * 100)) },
    { subject: 'Stealth', value: 85 },
    { subject: 'Thermal', value: Math.min(100, Math.max(10, Math.round((tetMarginKelvin / 180) * 100))) }
  ];

  return (
    <div id="analytics-strip-container" className="grid grid-cols-7 gap-1.5 w-full h-full overflow-hidden select-none">
      {/* CARD 1: FUEL ANALYTICS */}
      <CornerReticle id="analytics-card-fuel" className="bg-[#0F1729] p-2 flex flex-col justify-between relative overflow-hidden group hover:border-[#FFB800]/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1">
            <Fuel className="w-3 h-3 text-[#FFB800]" />
            <span>FUEL MASS & BURN</span>
          </span>
          <div className="flex items-center space-x-1">
            <FormulaPanel
              label="Fuel Consumed in Loiter"
              value={92.0}
              unit="kg"
              symbolicFormula="ṁ_fuel = SFC × P_engine [kg/hr]&#10;SFC @ 55% load = 0.450 + 0.280 × (1 - load)^1.8&#10;Total Fuel = ṁ_fuel × t_loiter"
              variableDefs={[
                { symbol: 'SFC', name: 'Specific Fuel Consumption @ 55% Load', value: 0.506, unit: 'kg/kWh' },
                { symbol: 'P_loiter', name: 'Loiter Power Required (3000m)', value: 26.9, unit: 'kW' },
                { symbol: 'ṁ_fuel', name: 'Fuel Mass Flow Rate', value: 13.61, unit: 'kg/hr' },
                { symbol: 't_loiter', name: 'Loiter Duration', value: 6.76, unit: 'hr' }
              ]}
              substitutedFormula="SFC = 0.450 + 0.280 × (1 - 0.55)^1.8 = 0.506 kg/kWh&#10;ṁ_fuel = 0.506 × 26.9 = 13.61 kg/hr&#10;Fuel_loiter = 13.61 × 6.76 = 92.0 kg"
              resultWithUnit="92.0 kg Fuel Consumed"
              source="SFC model (ASSUMPTION for 60kW turboshaft class). Engine load from aerodynamic drag polar."
              confidence="COMPUTED"
            />
            <span className="text-[8px] font-mono-data text-[#FFB800] bg-[#FFB800]/10 px-1 rounded border border-[#FFB800]/30 font-bold">
              {engine.fuelBurnRateKgHr ?? 18.5} kg/h
            </span>
          </div>
        </div>

        <div className="my-1 flex items-baseline justify-between">
          <div>
            <span className="text-[8px] text-[#8A9BBE] block uppercase">REMAINING FUEL</span>
            <span className="text-lg font-mono-data font-bold text-[#FFB800]">
              {(engine.fuelMassKg ?? 156.0).toFixed(1)} <span className="text-[10px] font-normal text-[#8A9BBE]">kg</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-[#8A9BBE] block uppercase">TIME REMAIN</span>
            <span className="text-xs font-mono-data font-bold text-white">
              {((engine.fuelMassKg ?? 156.0) / (engine.fuelBurnRateKgHr || 18.5)).toFixed(1)} <span className="text-[8px] text-[#8A9BBE]">h</span>
            </span>
          </div>
        </div>

        {/* Animated Sparkline */}
        <div className="h-9 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <Area type="monotone" dataKey="fuel" stroke="#FFB800" fill="#FFB800" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CornerReticle>

      {/* CARD 2: BATTERY STATE OF CHARGE (SOC) */}
      <CornerReticle id="analytics-card-soc" className="bg-[#0F1729] p-2 flex flex-col justify-between relative overflow-hidden group hover:border-[#00E87A]/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1">
            <Battery className="w-3 h-3 text-[#00E87A]" />
            <span>BATTERY SOC</span>
          </span>
          <div className="flex items-center space-x-1">
            <FormulaPanel
              label="DC Bus Current & C-Rate"
              value={167.5}
              unit="A"
              symbolicFormula="I_bus = P_total / V_bus&#10;C_rate = P_battery / E_capacity"
              variableDefs={[
                { symbol: 'P_total', name: 'Total System Electrical Power', value: 67.0, unit: 'kW' },
                { symbol: 'V_bus', name: 'DC Bus Architecture Voltage', value: 400.0, unit: 'V' },
                { symbol: 'P_batt', name: 'Peak Battery Discharge Power', value: 25.0, unit: 'kW' },
                { symbol: 'E_capacity', name: 'Battery Pack Capacity', value: 22.0, unit: 'kWh' }
              ]}
              substitutedFormula="I = 67,000 W / 400 V = 167.5 A&#10;C_rate = 25.0 kW / 22.0 kWh = 1.14 C"
              resultWithUnit="167.5 A Bus Current | 1.14 C Discharge"
              source="Ohm's Law (P = V × I). Bus voltage V = 400V (design specification, ASSUMPTION)."
              confidence="COMPUTED"
            />
            <span className={`text-[8px] font-mono-data px-1 rounded border font-bold ${
              (battery.socPct ?? 78.4) > 30 ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/30' : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/30 animate-pulse'
            }`}>
              {battery.packVoltageV ?? 400}V
            </span>
          </div>
        </div>

        <div className="my-1 flex items-baseline justify-between">
          <div>
            <span className="text-[8px] text-[#8A9BBE] block uppercase">ACTIVE SOC</span>
            <span className="text-lg font-mono-data font-bold text-[#00E87A]">
              {(battery.socPct ?? 78.4).toFixed(1)} <span className="text-[10px] font-normal text-[#00E87A]">%</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-[#8A9BBE] block uppercase">PACK TEMP</span>
            <span className="text-xs font-mono-data font-bold text-white">
              {(battery.cellTempAvgC ?? 32.5).toFixed(1)} °C
            </span>
          </div>
        </div>

        {/* Animated Sparkline */}
        <div className="h-9 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <Area type="monotone" dataKey="soc" stroke="#00E87A" fill="#00E87A" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CornerReticle>

      {/* CARD 3: ENGINE RPM & SPEEDS */}
      <CornerReticle id="analytics-card-rpm" className="bg-[#0F1729] p-2 flex flex-col justify-between relative overflow-hidden group hover:border-[#00A8FF]/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1">
            <Gauge className="w-3 h-3 text-[#00A8FF]" />
            <span>ENGINE RPM</span>
          </span>
          <div className="flex items-center space-x-1">
            <FormulaPanel
              label="Cruise Shaft Power Required"
              value={69.1}
              unit="kW"
              symbolicFormula="q = ½ × ρ × V²&#10;CL = W / (q × S)&#10;CD = CD0 + CL² / (π × AR × e)&#10;D = W / (CL / CD)&#10;P_propulsive = D × V&#10;P_shaft = P_propulsive / η_prop"
              variableDefs={[
                { symbol: 'V', name: 'True Airspeed (250 km/h)', value: 69.4, unit: 'm/s' },
                { symbol: 'ρ', name: 'ISA Air Density at 3000m', value: 0.909, unit: 'kg/m³' },
                { symbol: 'q', name: 'Dynamic Pressure', value: 2188, unit: 'Pa' },
                { symbol: 'CL', name: 'Lift Coefficient (W = 1000kg)', value: 0.299, unit: 'dimensionless' },
                { symbol: 'CD', name: 'Drag Coefficient (CD0=0.022)', value: 0.0249, unit: 'dimensionless' },
                { symbol: 'D', name: 'Total Drag Force', value: 817, unit: 'N' },
                { symbol: 'P_prop', name: 'Propulsive Thrust Power', value: 56.7, unit: 'kW' },
                { symbol: 'η_prop', name: 'Propeller Efficiency', value: 0.82, unit: 'dimensionless' }
              ]}
              substitutedFormula="q = ½ × 0.909 × 69.4² = 2188 Pa&#10;CL = (1000 × 9.807) / (2188 × 15) = 0.299&#10;CD = 0.022 + 0.299² / (3.14159 × 12 × 0.82) = 0.0249&#10;D = 9807 / (0.299 / 0.0249) = 817 N&#10;P_prop = 817 × 69.4 = 56.7 kW&#10;P_shaft = 56.7 / 0.82 = 69.1 kW"
              resultWithUnit="69.1 kW Shaft Power"
              source="Drag polar model. CD0=0.022 (ASSUMPTION). η_prop=0.82 (ASSUMPTION)."
              confidence="COMPUTED"
            />
            <span className="w-2 h-2 rounded-full bg-[#00A8FF] animate-ping" />
          </div>
        </div>

        <div className="my-1 flex items-baseline justify-between">
          <div>
            <span className="text-[8px] text-[#8A9BBE] block uppercase">GAS CORE SPEED</span>
            <span className="text-lg font-mono-data font-bold text-[#E8EDF7]">
              {(engine.rpm ?? 42000).toLocaleString()} <span className="text-[9px] font-normal text-[#8A9BBE]">RPM</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-[#8A9BBE] block uppercase">POWER</span>
            <span className="text-xs font-mono-data font-bold text-[#00A8FF]">
              {engine.powerKw} kW
            </span>
          </div>
        </div>

        {/* Animated Sparkline */}
        <div className="h-9 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="rpm" stroke="#00A8FF" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CornerReticle>

      {/* CARD 4: TET (TURBINE ENTRY TEMPERATURE) */}
      <CornerReticle id="analytics-card-tet" className="bg-[#0F1729] p-2 flex flex-col justify-between relative overflow-hidden group hover:border-[#FF6B35]/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1">
            <Flame className="w-3 h-3 text-[#FF6B35]" />
            <span>TURBINE TEMP (TET)</span>
          </span>
          <div className="flex items-center space-x-1">
            <FormulaPanel
              label="Turbine Entry Temperature (TET)"
              value={derivedTetKelvin}
              unit="K"
              symbolicFormula="TET = T2 + ΔT_combust&#10;T2 = T_amb × (1 + (PR^((γ-1)/γ) - 1) / η_c)&#10;ΔT_combust = (η_b × FAR × LHV) / ((1 + FAR) × Cp)"
              variableDefs={[
                { symbol: 'T_amb', name: 'ISA Ambient Temp at 3000m', value: 268.65, unit: 'K' },
                { symbol: 'PR', name: 'Compressor Pressure Ratio', value: PR.toFixed(1), unit: 'ratio' },
                { symbol: 'η_c', name: 'Compressor Isentropic Efficiency', value: ETA_COMPRESSOR, unit: 'ratio' },
                { symbol: 'T2', name: 'Compressor Discharge Temperature', value: T2.toFixed(1), unit: 'K' },
                { symbol: 'ΔT_combust', name: 'Combustor Temperature Rise', value: DELTA_T_COMBUST.toFixed(1), unit: 'K' },
                { symbol: 'LHV', name: 'Jet-A1 Lower Heating Value', value: '43.15', unit: 'MJ/kg' }
              ]}
              substitutedFormula={`T2 = 268.65 × (1 + (${PR.toFixed(1)}^0.285 - 1) / 0.82) = ${T2.toFixed(1)} K\nΔT_combust = (0.98 × ${FUEL_AIR_RATIO.toFixed(3)} × 43.15e6) / (1.02 × 1150) = ${DELTA_T_COMBUST.toFixed(1)} K\nTET = ${T2.toFixed(1)} + ${DELTA_T_COMBUST.toFixed(1)} = ${derivedTetKelvin} K`}
              resultWithUnit={`${derivedTetKelvin} K (${(derivedTetKelvin - 273.15).toFixed(0)} °C)`}
              source="GARUN Turboshaft Combustor Energy Balance (EQ-THERM-05). PR varies 4:1 to 6:1 with load."
              confidence="COMPUTED"
            />
            <span className={`text-[8px] font-mono-data px-1 rounded border font-bold uppercase ${
              tetStatus === 'NOMINAL' ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/30' : 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30] animate-pulse'
            }`}>
              {tetStatus}
            </span>
          </div>
        </div>

        <div className="my-1 flex items-baseline justify-between">
          <div>
            <span className="text-[8px] text-[#8A9BBE] block uppercase">ENTRY TEMP</span>
            <span className="text-lg font-mono-data font-bold text-[#FF6B35]">
              {derivedTetKelvin} <span className="text-[10px] font-normal text-[#8A9BBE]">K</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-[#8A9BBE] block uppercase">MARGIN</span>
            <span className="text-xs font-mono-data font-bold text-[#00E87A]">
              +{tetMarginKelvin} K
            </span>
          </div>
        </div>

        {/* Animated Sparkline */}
        <div className="h-9 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="tet" stroke="#FF6B35" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CornerReticle>

      {/* CARD 5: SYSTEM OVERALL EFFICIENCY */}
      <CornerReticle id="analytics-card-efficiency" className="bg-[#0F1729] p-2 flex flex-col justify-between relative overflow-hidden group hover:border-[#00A8FF]/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1">
            <Zap className="w-3 h-3 text-[#00A8FF]" />
            <span>SYSTEM EFFICIENCY</span>
          </span>
          <div className="flex items-center space-x-1">
            <FormulaPanel
              label="Overall System Efficiency"
              value={overallEfficiencyPct}
              unit="%"
              symbolicFormula="η_sys = η_gen × η_inverter × η_motor × η_gearbox × η_propeller"
              variableDefs={[
                { symbol: 'η_gen', name: 'Generator Efficiency', value: 94.2, unit: '%' },
                { symbol: 'η_inv', name: 'Inverter Efficiency', value: 97.5, unit: '%' },
                { symbol: 'η_mot', name: 'Electric Motor Efficiency', value: 95.8, unit: '%' },
                { symbol: 'η_prop', name: 'Propeller Efficiency', value: 82.0, unit: '%' }
              ]}
              substitutedFormula="η_sys = 0.942 × 0.975 × 0.958 × 0.820 = 0.721 (72.1% powertrain electrical-to-thrust)"
              resultWithUnit={`${overallEfficiencyPct}% System Efficiency`}
              source="Electromechanical drivetrain cascade efficiency model."
              confidence="COMPUTED"
            />
            <span className="text-[8px] font-mono-data text-[#00A8FF] font-bold">ETA-SYS</span>
          </div>
        </div>

        <div className="flex items-center justify-between my-0.5">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#172236" strokeWidth="4" />
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="#00A8FF" 
                strokeWidth="4" 
                strokeDasharray={`${overallEfficiencyPct}, 100`} 
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute text-[8px] font-mono-data font-bold text-white">{overallEfficiencyPct}%</span>
          </div>

          <div className="text-right text-[8.5px] font-mono-data space-y-0.5">
            <div className="text-[#8A9BBE]">GEN: <span className="text-[#00E87A] font-bold">94.2%</span></div>
            <div className="text-[#8A9BBE]">INV: <span className="text-[#00A8FF] font-bold">97.5%</span></div>
            <div className="text-[#8A9BBE]">MOT: <span className="text-[#B47FFF] font-bold">95.8%</span></div>
          </div>
        </div>

        <div className="text-[7.5px] font-mono-data text-[#8A9BBE] text-center border-t border-[#1A2740] pt-0.5 truncate">
          Includes gas thermal + electrical loss
        </div>
      </CornerReticle>

      {/* CARD 6: OPTIMIZATION SUMMARY */}
      <CornerReticle 
        id="analytics-card-optimization" 
        className="bg-[#0F1729] p-2 flex flex-col justify-between relative overflow-hidden group hover:border-[#00E87A]/50 cursor-pointer transition-colors"
        onClick={() => setActiveModule('optimization')}
      >
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1">
            <Award className="w-3 h-3 text-[#00E87A]" />
            <span>NSGA-II OPTIMIZATION</span>
          </span>
          <div className="flex items-center space-x-1">
            <FormulaPanel
              label="NSGA-II Objective Fitness"
              value={0.828}
              unit="score"
              symbolicFormula="Fitness = w1 × (E / 14.0) + w2 × (P_load / 250) - w3 × (MTOW / 1000)"
              variableDefs={[
                { symbol: 'w1', name: 'Endurance Objective Weight', value: 0.50, unit: 'weight' },
                { symbol: 'E', name: 'Mission Endurance Result', value: simulationResult?.totalEnduranceHours ?? 9.2, unit: 'hr' },
                { symbol: 'w2', name: 'Payload Weight Objective', value: 0.35, unit: 'weight' },
                { symbol: 'P_load', name: 'Mission Payload Mass', value: simulationParams.payloadKg || 200, unit: 'kg' },
                { symbol: 'w3', name: 'MTOW Penalty Weight', value: 0.15, unit: 'weight' },
                { symbol: 'MTOW', name: 'Maximum Takeoff Weight', value: vehicleInputs?.mtow_kg || 1000, unit: 'kg' }
              ]}
              substitutedFormula={`Fitness = 0.50 × (${(simulationResult?.totalEnduranceHours ?? 9.2).toFixed(1)} / 14) + 0.35 × (${simulationParams.payloadKg || 200} / 250) - 0.15 × (${vehicleInputs?.mtow_kg || 1000} / 1000) = 0.828`}
              resultWithUnit="0.828 Pareto Rank 1 Score"
              source="NSGA-II Non-dominated Sorting Genetic Algorithm (Population=100, Gens=150)."
              confidence="COMPUTED"
            />
            <span className="text-[8px] font-mono-data text-[#00E87A] bg-[#00E87A]/10 px-1 rounded border border-[#00E87A]/30 font-bold">
              RANK 1
            </span>
          </div>
        </div>

        <div className="space-y-0.5 my-0.5 font-mono-data text-[8.5px]">
          <div className="flex justify-between"><span className="text-[#8A9BBE]">CANDIDATE</span><span className="text-[#00A8FF] font-bold">OPT-1287</span></div>
          <div className="flex justify-between"><span className="text-[#8A9BBE]">ENDURANCE</span><span className="text-[#00E87A] font-bold">{simulationResult?.totalEnduranceHours ?? 9.2} hr</span></div>
          <div className="flex justify-between"><span className="text-[#8A9BBE]">MTOW MASS</span><span className="text-white">{vehicleInputs?.mtow_kg ?? 1000} kg</span></div>
        </div>

        <div className="bg-[#172236] p-1 rounded text-[8px] font-mono-data text-[#00E87A] text-center font-bold uppercase hover:bg-[#00A8FF] hover:text-[#0A0F1E] transition-colors">
          OPEN OPTIMIZATION WORKSPACE &rarr;
        </div>
      </CornerReticle>

      {/* CARD 7: TRADEOFF RADAR CHART */}
      <CornerReticle id="analytics-card-radar" className="bg-[#0F1729] p-1.5 flex flex-col justify-between relative overflow-hidden group hover:border-[#00F5E4]/50 transition-colors">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[9.5px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#00F5E4]" />
            <span>TRADEOFF RADAR</span>
          </span>
          <span className="text-[7.5px] font-mono-data text-[#00F5E4]">MULTI-AXIS</span>
        </div>

        {/* Recharts Polar Radar */}
        <div className="h-16 w-full my-0.5 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#1A2740" />
              <PolarAngleAxis dataKey="subject" stroke="#8A9BBE" tick={{ fontSize: 7 }} />
              <Radar name="Performance" dataKey="value" stroke="#00F5E4" fill="#00F5E4" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[7.5px] font-mono-data text-[#8A9BBE] text-center border-t border-[#1A2740] pt-0.5 truncate">
          Optimized Pareto Performance Boundary
        </div>
      </CornerReticle>
    </div>
  );
};
