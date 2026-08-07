import React, { useState, useEffect, useMemo } from 'react';
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  Compass, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Sliders, 
  RotateCcw, 
  Zap, 
  Gauge, 
  Flame, 
  Maximize2, 
  X, 
  CheckCircle2, 
  Layers, 
  Snowflake, 
  BatteryCharging, 
  Sparkles, 
  ArrowUpRight,
  Info
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
export interface AtmosphericDataPoint {
  altitudeM: number;
  altitudeFt: number;
  pressureKPa: number;
  densityKgM3: number;
  tempCelsius: number;
  restartProbabilityPct: number;
  machLimit: number;
}

export interface ColdStartDiagnostic {
  parameter: string;
  value: string;
  unit: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  idealRange: string;
  description: string;
}

// ============================================================================
// HIGH ALTITUDE MONITOR PANEL COMPONENT
// ============================================================================
export const HighAltitudeMonitorPanel: React.FC = () => {
  const { activeTelemetryFrame, updateSimulationParams } = useGarunStore();

  // Active Sub-Tab: 'OVERVIEW' | 'COLD_START' | 'ATMOSPHERE' | 'RELIGHT_ENVELOPE'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COLD_START' | 'ATMOSPHERE' | 'RELIGHT_ENVELOPE'>('OVERVIEW');
  const [showExpandedModal, setShowExpandedModal] = useState(false);

  // Environmental Controls State
  const [altitudeM, setAltitudeM] = useState<number>(6500); // meters
  const [isaDeviationC, setIsaDeviationC] = useState<number>(0); // °C deviation from ISA
  const [airspeedKts, setAirspeedKts] = useState<number>(165); // knots
  const [isIcingActive, setIsIcingActive] = useState<boolean>(false);
  const [isBatteryHeaterOn, setIsBatteryHeaterOn] = useState<boolean>(true);

  // Synchronize initial values with store telemetry if needed
  useEffect(() => {
    if (activeTelemetryFrame?.altitudeM) {
      setAltitudeM(activeTelemetryFrame.altitudeM);
    }
    if (activeTelemetryFrame?.airspeedKts) {
      setAirspeedKts(activeTelemetryFrame.airspeedKts);
    }
  }, []);

  // Sync to store when altitude changes
  const handleAltitudeChange = (newAlt: number) => {
    setAltitudeM(newAlt);
    updateSimulationParams({ cruiseAltitudeM: newAlt });
  };

  // ============================================================================
  // U.S. STANDARD ATMOSPHERE (1976) ATMOSPHERIC PHYSICS CALCULATIONS
  // ============================================================================
  const physics = useMemo(() => {
    // 1. ISA Standard Static Air Temperature at Altitude (Meters)
    // Lapse rate: -0.0065 °C/m up to troposphere (11,000m)
    const seaLevelTempK = 288.15; // 15°C
    const lapseRate = 0.0065; // K/m
    const isaTempK = Math.max(216.65, seaLevelTempK - lapseRate * Math.min(altitudeM, 11000));
    const actualTempK = isaTempK + isaDeviationC;
    const actualTempC = actualTempK - 273.15;

    // 2. Static Pressure P (kPa)
    // P = P0 * (T_isa / T0) ^ (g / (R * L))
    const p0 = 101.325; // kPa at sea level
    const pressureKPa = p0 * Math.pow(Math.max(0.1, isaTempK / seaLevelTempK), 5.25588);
    const pressureAtm = pressureKPa / 101.325;

    // 3. Air Density ρ (kg/m³) using Ideal Gas Law ρ = P / (R * T)
    const R_specific = 287.058; // J/(kg·K)
    const airDensityKgM3 = (pressureKPa * 1000) / (R_specific * actualTempK);
    const seaLevelDensity = 1.225; // kg/m³
    const densityRatioSigma = airDensityKgM3 / seaLevelDensity; // σ = ρ / ρ0

    // 4. Density Altitude (Meters)
    // Approx: Pressure Alt + 120 * (Actual Temp - ISA Temp)
    const densityAltitudeM = Math.round(altitudeM + 36.5 * (actualTempC - (15 - 0.0065 * altitudeM)));

    // 5. Speed of Sound a (m/s & knots)
    const gamma = 1.4;
    const speedOfSoundMps = Math.sqrt(gamma * R_specific * actualTempK);
    const speedOfSoundKts = speedOfSoundMps * 1.94384;

    // 6. True Airspeed (TAS) & Mach Number
    const tasKts = airspeedKts / Math.sqrt(Math.max(0.1, densityRatioSigma));
    const machNumber = Number((tasKts / Math.max(1, speedOfSoundKts)).toFixed(3));

    // 7. Dynamic Pressure q = 0.5 * ρ * V^2 (kPa)
    const tasMps = tasKts * 0.514444;
    const dynamicPressureKPa = Number(((0.5 * airDensityKgM3 * Math.pow(tasMps, 2)) / 1000).toFixed(2));

    // 8. In-Flight Engine Restart / Relight Probability Calculation
    // Dependent on air density, dynamic pressure, temperature, spark energy, and icing.
    let baseProbability = 98 - (altitudeM / 1000) * 5.2; // drops with altitude
    if (machNumber < 0.15) baseProbability -= 15; // insufficient windmilling
    if (machNumber > 0.45) baseProbability -= 10; // high combustor flow velocity
    if (actualTempC < -30) baseProbability -= (Math.abs(actualTempC) - 30) * 0.8; // cold fuel atomization penalty
    if (isIcingActive) baseProbability -= 18; // intake icing risk
    if (isBatteryHeaterOn) baseProbability += 5; // heater boost for spark power

    const restartProbabilityPct = Math.min(99, Math.max(2, Math.round(baseProbability)));

    // 9. Cold Start & Fuel Atomization Metrics
    const fuelViscosityCSt = Number((1.5 * Math.exp(1200 / actualTempK)).toFixed(2)); // JP-8 viscosity
    const atomizationQualityPct = Math.min(100, Math.max(15, Math.round(100 - (fuelViscosityCSt - 2.0) * 8)));
    const sparkEnergyJoules = Math.min(12, Number((2.5 + (12000 - altitudeM) / 1000 * 0.4 + (actualTempC < -20 ? 2.0 : 0)).toFixed(1)));
    const minPreheatSec = actualTempC < -20 ? Math.round(Math.abs(actualTempC + 20) * 1.5 + 10) : 0;

    // 10. Mission Readiness Status Determination
    let readinessStatus: 'NOMINAL' | 'FEASIBLE' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
    let readinessLabel = 'ALL HIGH ALTITUDE SYSTEMS OPTIMAL';

    if (altitudeM > 9000 || restartProbabilityPct < 40) {
      readinessStatus = 'CRITICAL';
      readinessLabel = 'UNFEASIBLE RELIGHT ENVELOPE (CEILING EXCEEDED)';
    } else if (restartProbabilityPct < 65 || actualTempC < -35) {
      readinessStatus = 'WARNING';
      readinessLabel = 'MARGINAL RELIGHT ENVELOPE – PRE-HEAT REQUIRED';
    } else if (actualTempC < -15 || isIcingActive) {
      readinessStatus = 'FEASIBLE';
      readinessLabel = 'HIGH ALTITUDE READY (HEATER & ANTI-ICE ACTIVE)';
    }

    return {
      isaTempK,
      actualTempK,
      actualTempC,
      pressureKPa,
      pressureAtm,
      airDensityKgM3,
      densityRatioSigma,
      densityAltitudeM,
      speedOfSoundMps,
      speedOfSoundKts,
      tasKts,
      machNumber,
      dynamicPressureKPa,
      restartProbabilityPct,
      fuelViscosityCSt,
      atomizationQualityPct,
      sparkEnergyJoules,
      minPreheatSec,
      readinessStatus,
      readinessLabel
    };
  }, [altitudeM, isaDeviationC, airspeedKts, isIcingActive, isBatteryHeaterOn]);

  // ============================================================================
  // GENERATE ATMOSPHERIC PROFILE CHART DATA (0 to 12,000 meters)
  // ============================================================================
  const atmosphericProfileData: AtmosphericDataPoint[] = useMemo(() => {
    const points: AtmosphericDataPoint[] = [];
    for (let alt = 0; alt <= 12000; alt += 1000) {
      const isaK = Math.max(216.65, 288.15 - 0.0065 * alt);
      const tempC = isaK - 273.15 + isaDeviationC;
      const p = 101.325 * Math.pow(Math.max(0.1, isaK / 288.15), 5.25588);
      const rho = (p * 1000) / (287.058 * (isaK + isaDeviationC));
      let relight = 98 - (alt / 1000) * 5.2;
      if (tempC < -30) relight -= (Math.abs(tempC) - 30) * 0.8;
      relight = Math.min(99, Math.max(2, Math.round(relight)));

      points.push({
        altitudeM: alt,
        altitudeFt: Math.round(alt * 3.28084),
        pressureKPa: Number(p.toFixed(1)),
        densityKgM3: Number(rho.toFixed(3)),
        tempCelsius: Number(tempC.toFixed(1)),
        restartProbabilityPct: relight,
        machLimit: Number((0.65 - (alt / 20000)).toFixed(2))
      });
    }
    return points;
  }, [isaDeviationC]);

  // SVG Gauge Arc Geometry Calculation
  // Altitude Semicircle (0 to 12,000 m)
  const altGaugePct = Math.min(100, Math.max(0, (altitudeM / 12000) * 100));
  const halfCircumference = 131.95; // r=42
  const altStrokeDashoffset = halfCircumference - (halfCircumference * altGaugePct) / 100;

  // Restart Probability Semicircle (0 to 100%)
  const relightGaugePct = physics.restartProbabilityPct;
  const relightStrokeDashoffset = halfCircumference - (halfCircumference * relightGaugePct) / 100;

  // Cold Start Detailed Matrix
  const coldStartDiagnostics: ColdStartDiagnostic[] = [
    {
      parameter: 'Fuel Atomization Quality',
      value: `${physics.atomizationQualityPct}%`,
      unit: '%',
      status: physics.atomizationQualityPct < 50 ? 'WARNING' : 'NOMINAL',
      idealRange: '> 60%',
      description: 'Spray droplet Sauter Mean Diameter (SMD). Low temperature increases fuel surface tension.'
    },
    {
      parameter: 'JP-8 Fuel Viscosity',
      value: `${physics.fuelViscosityCSt}`,
      unit: 'cSt',
      status: physics.fuelViscosityCSt > 5.0 ? 'WARNING' : 'NOMINAL',
      idealRange: '< 4.5 cSt',
      description: 'Kinematic viscosity at nozzle tip. High viscosity degrades injector spray pattern.'
    },
    {
      parameter: 'Spark Igniter Energy',
      value: `${physics.sparkEnergyJoules}`,
      unit: 'Joules',
      status: 'NOMINAL',
      idealRange: '2.5 - 12.0 J',
      description: 'Capacitive discharge spark energy required for high altitude low-pressure combustor lightoff.'
    },
    {
      parameter: 'Battery Pack Heater',
      value: isBatteryHeaterOn ? 'ACTIVE (+25°C)' : 'DISABLED',
      unit: 'State',
      status: isBatteryHeaterOn ? 'NOMINAL' : physics.actualTempC < -20 ? 'WARNING' : 'NOMINAL',
      idealRange: 'ACTIVE below -10°C',
      description: 'Electric thermal blanket maintains Li-Sulfur battery discharge rate for starter motor.'
    },
    {
      parameter: 'Thermal Pre-Heat Soak',
      value: `${physics.minPreheatSec}`,
      unit: 'Seconds',
      status: physics.minPreheatSec > 30 ? 'WARNING' : 'NOMINAL',
      idealRange: '< 20 s',
      description: 'Required pre-ignition thermal soak duration for igniter plugs and fuel nozzle manifolds.'
    }
  ];

  return (
    <CornerReticle className="h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] relative">
      <div className="flex flex-col h-full overflow-hidden">
        {/* 1. HEADER & MODAL TRIGGER */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-4 h-4 text-[#00A8FF]" />
            <div>
              <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
                <span>HIGH ALTITUDE MONITOR</span>
              </h2>
              <span className="text-[9px] font-mono-data text-[#00E87A]">
                ATMOSPHERIC & RESTART FEASIBILITY ENGINE
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowExpandedModal(true)}
              className="p-1 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] transition-colors"
              title="Expand High Altitude Diagnostic Suite"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 mb-2 border-b border-[#1A2740] pb-1.5 flex-shrink-0">
          {(['OVERVIEW', 'COLD_START', 'ATMOSPHERE', 'RELIGHT_ENVELOPE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1 text-[8.5px] font-mono-data rounded border uppercase transition-all truncate ${
                activeTab === tab
                  ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF] font-bold'
                  : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE] hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* 2. MISSION READINESS INDICATOR BADGE */}
        <div className={`p-1.5 rounded border mb-2 text-[10px] font-mono-data flex items-center justify-between flex-shrink-0 transition-all ${
          physics.readinessStatus === 'CRITICAL'
            ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30] animate-pulse'
            : physics.readinessStatus === 'WARNING'
            ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]'
            : physics.readinessStatus === 'FEASIBLE'
            ? 'bg-[#00F5E4]/15 border-[#00F5E4]/40 text-[#00F5E4]'
            : 'bg-[#00E87A]/10 border-[#00E87A]/30 text-[#00E87A]'
        }`}>
          <div className="flex items-center space-x-1.5 truncate">
            {physics.readinessStatus === 'CRITICAL' ? (
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            ) : physics.readinessStatus === 'WARNING' ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-bold uppercase tracking-wide truncate">
              {physics.readinessLabel}
            </span>
          </div>
          <span className="text-[9.5px] font-bold ml-1 flex-shrink-0">
            {physics.restartProbabilityPct}% RELIGHT
          </span>
        </div>

        {/* 3. DYNAMIC TAB CONTENT VIEWS */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-[11px] font-sans-ui">
          {/* ==================================================================== */}
          {/* TAB 1: OVERVIEW (ANIMATED GAUGES & KEY METRICS DISPLAY)              */}
          {/* ==================================================================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-2">
              {/* SIDE-BY-SIDE ANIMATED INTERACTIVE GAUGES */}
              <div className="grid grid-cols-2 gap-2">
                {/* GAUGE 1: ALTITUDE ARC GAUGE */}
                <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] flex flex-col items-center justify-center relative">
                  <span className="text-[8.5px] font-mono-data text-[#8A9BBE] uppercase mb-1 flex items-center space-x-1">
                    <ArrowUpRight className="w-3 h-3 text-[#00A8FF]" />
                    <span>ALTITUDE</span>
                  </span>

                  <div className="relative w-28 h-16 flex items-center justify-center my-0.5">
                    <svg className="w-28 h-16" viewBox="0 0 100 56">
                      <path
                        d="M 8,50 A 42,42 0 0,1 92,50"
                        fill="none"
                        stroke="#1F2D45"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 8,50 A 42,42 0 0,1 92,50"
                        fill="none"
                        stroke="#00A8FF"
                        strokeWidth="8"
                        strokeDasharray="131.95"
                        strokeDashoffset={altStrokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>

                    <div className="absolute bottom-0 flex flex-col items-center text-center">
                      <span className="text-base font-mono-data font-bold text-[#E8EDF7]">
                        {altitudeM.toLocaleString()} <span className="text-[9px] font-normal text-[#8A9BBE]">m</span>
                      </span>
                      <span className="text-[8px] font-mono-data text-[#8A9BBE]">
                        ({Math.round(altitudeM * 3.28084).toLocaleString()} ft)
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex justify-between text-[7.5px] font-mono-data text-[#8A9BBE] pt-0.5 border-t border-[#1A2740]">
                    <span>0 m</span>
                    <span className="text-[#FF3B30]">LIMIT: 9,000m</span>
                  </div>
                </div>

                {/* GAUGE 2: RESTART PROBABILITY GAUGE */}
                <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] flex flex-col items-center justify-center relative">
                  <span className="text-[8.5px] font-mono-data text-[#8A9BBE] uppercase mb-1 flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-[#00E87A]" />
                    <span>RESTART PROB</span>
                  </span>

                  <div className="relative w-28 h-16 flex items-center justify-center my-0.5">
                    <svg className="w-28 h-16" viewBox="0 0 100 56">
                      <path
                        d="M 8,50 A 42,42 0 0,1 92,50"
                        fill="none"
                        stroke="#1F2D45"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 8,50 A 42,42 0 0,1 92,50"
                        fill="none"
                        stroke={physics.restartProbabilityPct < 40 ? '#FF3B30' : physics.restartProbabilityPct < 65 ? '#FFB800' : '#00E87A'}
                        strokeWidth="8"
                        strokeDasharray="131.95"
                        strokeDashoffset={relightStrokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>

                    <div className="absolute bottom-0 flex flex-col items-center text-center">
                      <span className={`text-base font-mono-data font-bold ${
                        physics.restartProbabilityPct < 40 ? 'text-[#FF3B30]' : physics.restartProbabilityPct < 65 ? 'text-[#FFB800]' : 'text-[#00E87A]'
                      }`}>
                        {physics.restartProbabilityPct}%
                      </span>
                      <span className="text-[8px] font-mono-data text-[#8A9BBE]">
                        IN-FLIGHT RELIGHT
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex justify-between text-[7.5px] font-mono-data text-[#8A9BBE] pt-0.5 border-t border-[#1A2740]">
                    <span>0%</span>
                    <span className="text-[#00E87A]">TARGET &gt;80%</span>
                  </div>
                </div>
              </div>

              {/* CORE ATMOSPHERIC & AERODYNAMIC METRICS GRID */}
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] space-y-1.5">
                <div className="text-[9.5px] font-mono-data text-[#8A9BBE] uppercase border-b border-[#1A2740] pb-1 flex justify-between">
                  <span>TELEMETRY & FLIGHT CONDITIONS</span>
                  <span className="text-[#00F5E4]">ISA {isaDeviationC >= 0 ? `+${isaDeviationC}` : isaDeviationC}°C</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono-data">
                  <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
                    <span className="text-[#8A9BBE] text-[8px] block uppercase">AMBIENT PRESSURE</span>
                    <span className="text-xs font-bold text-[#00A8FF]">{physics.pressureKPa} kPa</span>
                    <span className="text-[8px] text-[#8A9BBE] block">({physics.pressureAtm.toFixed(3)} atm)</span>
                  </div>

                  <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
                    <span className="text-[#8A9BBE] text-[8px] block uppercase">AIR DENSITY (ρ)</span>
                    <span className="text-xs font-bold text-[#00E87A]">{physics.airDensityKgM3} kg/m³</span>
                    <span className="text-[8px] text-[#8A9BBE] block">σ = {physics.densityRatioSigma.toFixed(3)}</span>
                  </div>

                  <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
                    <span className="text-[#8A9BBE] text-[8px] block uppercase">AMBIENT TEMP</span>
                    <span className="text-xs font-bold text-[#FFB800]">{physics.actualTempC.toFixed(1)} °C</span>
                    <span className="text-[8px] text-[#8A9BBE] block">({physics.actualTempK.toFixed(1)} K)</span>
                  </div>

                  <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
                    <span className="text-[#8A9BBE] text-[8px] block uppercase">MACH NUMBER</span>
                    <span className="text-xs font-bold text-[#00F5E4]">M {physics.machNumber}</span>
                    <span className="text-[8px] text-[#8A9BBE] block">Speed of Sound: {Math.round(physics.speedOfSoundKts)} kt</span>
                  </div>
                </div>
              </div>

              {/* ENVIRONMENTAL CONTROLS & INTERACTIVE SLIDERS */}
              <div className="bg-[#0A0F1E] p-2 rounded border border-[#1A2740] space-y-2">
                <div className="flex items-center justify-between text-[9.5px] font-mono-data border-b border-[#1A2740] pb-1">
                  <span className="text-[#8A9BBE] flex items-center space-x-1 uppercase">
                    <Sliders className="w-3 h-3 text-[#00A8FF]" />
                    <span>ENVIRONMENTAL FLIGHT CONTROLS</span>
                  </span>
                  <button
                    onClick={() => {
                      setAltitudeM(6500);
                      setIsaDeviationC(0);
                      setAirspeedKts(165);
                      setIsIcingActive(false);
                      setIsBatteryHeaterOn(true);
                    }}
                    className="text-[8.5px] text-[#8A9BBE] hover:text-[#00A8FF] flex items-center space-x-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>RESET</span>
                  </button>
                </div>

                {/* Altitude Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono-data">
                    <span className="text-[#8A9BBE]">Set Altitude (m):</span>
                    <span className="text-[#00A8FF] font-bold">{altitudeM.toLocaleString()} m ({Math.round(altitudeM * 3.28084).toLocaleString()} ft)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="11000"
                    step="250"
                    value={altitudeM}
                    onChange={(e) => handleAltitudeChange(Number(e.target.value))}
                    className="w-full accent-[#00A8FF] cursor-pointer bg-[#172236] h-1.5 rounded"
                  />
                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1 text-[8px] font-mono-data">
                    {[
                      { label: '2,000m', alt: 2000 },
                      { label: '6,000m', alt: 6000 },
                      { label: '8,500m', alt: 8500 },
                      { label: '11,000m', alt: 11000 }
                    ].map((p) => (
                      <button
                        key={p.alt}
                        onClick={() => handleAltitudeChange(p.alt)}
                        className={`py-0.5 rounded border transition-all ${
                          altitudeM === p.alt
                            ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold border-[#00A8FF]'
                            : 'bg-[#172236] text-[#8A9BBE] border-[#1A2740] hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature Offset Slider */}
                <div className="space-y-1 pt-1 border-t border-[#1A2740]/60">
                  <div className="flex justify-between text-[9px] font-mono-data">
                    <span className="text-[#8A9BBE]">ISA Temp Deviation (°C):</span>
                    <span className="text-[#FFB800] font-bold">{isaDeviationC >= 0 ? `+${isaDeviationC}` : isaDeviationC} °C</span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    step="1"
                    value={isaDeviationC}
                    onChange={(e) => setIsaDeviationC(Number(e.target.value))}
                    className="w-full accent-[#FFB800] cursor-pointer bg-[#172236] h-1.5 rounded"
                  />
                </div>

                {/* Toggles: Icing & Battery Heater */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1A2740]/60 text-[9px] font-mono-data">
                  <button
                    onClick={() => setIsIcingActive(!isIcingActive)}
                    className={`p-1.5 rounded border flex items-center justify-between transition-all ${
                      isIcingActive
                        ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30] font-bold'
                        : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE]'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <Snowflake className="w-3 h-3" />
                      <span>ICING ENVELOPE</span>
                    </span>
                    <span>{isIcingActive ? 'ACTIVE' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => setIsBatteryHeaterOn(!isBatteryHeaterOn)}
                    className={`p-1.5 rounded border flex items-center justify-between transition-all ${
                      isBatteryHeaterOn
                        ? 'bg-[#00E87A]/20 border-[#00E87A] text-[#00E87A] font-bold'
                        : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE]'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <BatteryCharging className="w-3 h-3" />
                      <span>BATTERY HEATER</span>
                    </span>
                    <span>{isBatteryHeaterOn ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: COLD START ANALYSIS (FUEL VISCOSITY & SPARK DIAGNOSTICS)     */}
          {/* ==================================================================== */}
          {activeTab === 'COLD_START' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-2">
                <div className="text-[9.5px] font-mono-data text-[#8A9BBE] uppercase border-b border-[#1A2740] pb-1 flex justify-between">
                  <span>COLD START & RELIGHT DIAGNOSTIC MATRIX</span>
                  <span className="text-[#00E87A]">JP-8 / JET-A1 FUEL</span>
                </div>

                <div className="space-y-1.5">
                  {coldStartDiagnostics.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-[#172236]/80 border border-[#1A2740] space-y-1 text-[10px] font-mono-data"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#E8EDF7]">{item.parameter}</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                          item.status === 'WARNING'
                            ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40'
                            : 'bg-[#00E87A]/15 text-[#00E87A] border border-[#00E87A]/30'
                        }`}>
                          {item.value}
                        </span>
                      </div>
                      <p className="text-[8.5px] text-[#8A9BBE]">{item.description}</p>
                      <div className="flex justify-between text-[8px] text-[#8A9BBE] pt-0.5 border-t border-[#1A2740]/40">
                        <span>Target Range: {item.idealRange}</span>
                        <span className="text-[#00A8FF]">Unit: {item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: ATMOSPHERE (RECHARTS ALTITUDE VS DENSITY & PRESSURE CHART)    */}
          {/* ==================================================================== */}
          {activeTab === 'ATMOSPHERE' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
                <div className="flex items-center justify-between text-[9.5px] font-mono-data text-[#8A9BBE] mb-2 border-b border-[#1A2740] pb-1">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-[#00A8FF]" />
                    <span>ATMOSPHERIC PROFILE (PRESSURE & DENSITY)</span>
                  </span>
                  <span className="text-[#00E87A] font-bold">1976 STD MODEL</span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={atmosphericProfileData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
                      <XAxis dataKey="altitudeM" stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <YAxis stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }}
                        itemStyle={{ color: '#E8EDF7' }}
                      />
                      <ReferenceLine
                        x={altitudeM}
                        stroke="#FFB800"
                        strokeDasharray="3 3"
                        label={{ value: 'CURRENT ALT', fill: '#FFB800', fontSize: 8, position: 'insideTopLeft' }}
                      />
                      <Area type="monotone" dataKey="pressureKPa" stroke="#00A8FF" fill="#00A8FF" fillOpacity={0.15} name="Pressure (kPa)" />
                      <Line type="monotone" dataKey="restartProbabilityPct" stroke="#00E87A" strokeWidth={2} name="Relight Prob (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center space-x-4 text-[8.5px] font-mono-data text-[#8A9BBE] pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#00A8FF]" />
                    <span>Pressure (kPa)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#00E87A]" />
                    <span>Relight Feasibility (%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-1 rounded bg-[#FFB800]" />
                    <span>Current Flight Altitude</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 4: RELIGHT ENVELOPE (RESTART PROBABILITY VS ALTITUDE CURVE)      */}
          {/* ==================================================================== */}
          {activeTab === 'RELIGHT_ENVELOPE' && (
            <div className="space-y-2">
              <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740]">
                <div className="flex items-center justify-between text-[9.5px] font-mono-data text-[#8A9BBE] mb-2 border-b border-[#1A2740] pb-1">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-[#00E87A]" />
                    <span>IN-FLIGHT RELIGHT ENVELOPE CURVE</span>
                  </span>
                  <span className="text-[#FF3B30] font-bold">CEILING: 9,000m</span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={atmosphericProfileData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
                      <XAxis dataKey="altitudeM" stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#8A9BBE" fontSize={8} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }}
                        itemStyle={{ color: '#E8EDF7' }}
                      />
                      <ReferenceLine y={80} stroke="#00E87A" strokeDasharray="2 2" label={{ value: 'OPTIMAL (80%)', fill: '#00E87A', fontSize: 8 }} />
                      <ReferenceLine y={40} stroke="#FF3B30" strokeDasharray="2 2" label={{ value: 'CRITICAL (40%)', fill: '#FF3B30', fontSize: 8 }} />
                      <Line type="monotone" dataKey="restartProbabilityPct" stroke="#00E87A" strokeWidth={2.5} dot={{ r: 2 }} name="Restart Prob (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-1.5 rounded bg-[#172236]/80 text-[8.5px] font-mono-data text-[#8A9BBE] mt-1 flex justify-between">
                  <span>AIRFLOW VELOCITY: <strong>{airspeedKts} KTS</strong></span>
                  <span>BATTERY HEATER: <strong className="text-[#00E87A]">{isBatteryHeaterOn ? 'ENABLED' : 'OFF'}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER STATS STRIP */}
        <div className="pt-2 border-t border-[#1A2740] mt-2 bg-[#0A0F1E]/60 p-1.5 rounded text-[9.5px] font-mono-data flex justify-between text-[#8A9BBE] flex-shrink-0">
          <span>DENSITY ALT: <strong className="text-[#00A8FF]">{physics.densityAltitudeM.toLocaleString()} m</strong></span>
          <span>SPEED OF SOUND: <strong className="text-[#00F5E4]">{Math.round(physics.speedOfSoundKts)} kts</strong></span>
          <span>RELIGHT PROB: <strong className={physics.restartProbabilityPct < 50 ? 'text-[#FF3B30]' : 'text-[#00E87A]'}>{physics.restartProbabilityPct}%</strong></span>
        </div>
      </div>

      {/* EXPANDED FULLSCREEN MODAL FOR HIGH ALTITUDE DIAGNOSTICS */}
      {showExpandedModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-[#1F2D45] rounded-lg w-full max-w-3xl p-4 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F2D45] pb-3">
              <div className="flex items-center space-x-2">
                <CloudRain className="w-5 h-5 text-[#00A8FF]" />
                <div>
                  <h2 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
                    HIGH ALTITUDE & IN-FLIGHT RESTART FEASIBILITY MONITOR
                  </h2>
                  <p className="text-[10px] font-mono-data text-[#8A9BBE]">
                    U.S. STANDARD ATMOSPHERE 1976 & COMBUSTOR LIGHTOFF ENVELOPE ANALYSIS
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

            {/* Quick Physics Summary Bar */}
            <div className="grid grid-cols-4 gap-2 bg-[#111A2E] p-3 rounded border border-[#1A2740] text-xs font-mono-data">
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">CRUISE ALTITUDE</span>
                <span className="text-base font-bold text-[#00A8FF]">
                  {altitudeM.toLocaleString()} m
                </span>
                <span className="text-[8.5px] text-[#8A9BBE] block">({Math.round(altitudeM * 3.28084).toLocaleString()} ft)</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">AIR DENSITY (ρ)</span>
                <span className="text-base font-bold text-[#00E87A]">{physics.airDensityKgM3} kg/m³</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">σ = {physics.densityRatioSigma.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">STATIC PRESSURE</span>
                <span className="text-base font-bold text-[#FFB800]">{physics.pressureKPa} kPa</span>
                <span className="text-[8.5px] text-[#8A9BBE] block">({physics.pressureAtm.toFixed(3)} atm)</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9px] block uppercase">RESTART PROBABILITY</span>
                <span className={`text-base font-bold ${
                  physics.restartProbabilityPct < 50 ? 'text-[#FF3B30]' : 'text-[#00E87A]'
                }`}>
                  {physics.restartProbabilityPct}%
                </span>
                <span className="text-[8.5px] text-[#8A9BBE] block">Combustor Lightoff</span>
              </div>
            </div>

            {/* Comprehensive Cold Start Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider">
                COLD START & HIGH ALTITUDE IGNITION PARAMETERS
              </h3>
              <div className="bg-[#111A2E] rounded border border-[#1A2740] p-2 space-y-1.5 text-xs font-mono-data">
                {coldStartDiagnostics.map((d, idx) => (
                  <div key={idx} className="p-2 bg-[#172236]/80 rounded flex justify-between items-center border border-[#1A2740]">
                    <div>
                      <div className="font-bold text-[#E8EDF7]">{d.parameter}</div>
                      <div className="text-[9.5px] text-[#8A9BBE]">{d.description}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#00A8FF] font-bold">{d.value}</span>
                      <span className="text-[#8A9BBE] text-[10px] block">Target: {d.idealRange}</span>
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
                CLOSE HIGH ALTITUDE DIAGNOSTICS
              </button>
            </div>
          </div>
        </div>
      )}
    </CornerReticle>
  );
};
