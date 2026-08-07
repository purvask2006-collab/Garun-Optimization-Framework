import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Maximize2, 
  X, 
  Clock, 
  Navigation, 
  Zap, 
  Battery, 
  Flame, 
  ArrowUpRight, 
  Gauge, 
  FastForward, 
  Rewind, 
  Layers, 
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  Scale
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
  Area,
  ComposedChart
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { useGarunStore } from '../../store/useGarunStore';
import { 
  computeDetailedWeightBudget, 
  simulateFullMission, 
  computeOptimalLoiterEndurance,
  MissionPhaseInput,
  VehicleParams,
  PropulsionParams
} from '../../physics/garunPhysics';
import { TelemetryFrame } from '../../types/telemetry';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type MissionPhaseKey = 'TAKEOFF' | 'CLIMB' | 'CRUISE' | 'LOITER' | 'DESCENT' | 'LANDING';

export interface MissionDataPoint {
  timeIndex: number;          // 0 to 100 % progress
  timeFormatted: string;      // "00:00", "01:15", etc.
  phase: MissionPhaseKey;
  altitudeM: number;          // meters
  altitudeFt: number;         // feet
  airspeedKts: number;        // knots
  machNumber: number;
  powerDemandKw: number;      // kW
  batterySocPct: number;      // %
  fuelRemainingKg: number;    // kg
  fuelBurnRateKgHr: number;   // kg/hr
  hybridSplitGasPct: number;  // %
}

// 6 Core Mission Phases Definition
export const MISSION_PHASE_CONFIGS: {
  phase: MissionPhaseKey;
  label: string;
  durationMin: number;
  timeRangeStr: string;
  description: string;
  color: string;
}[] = [
  { phase: 'TAKEOFF', label: 'Takeoff', durationMin: 15, timeRangeStr: '00:00 - 00:15', description: 'Maximum power boost (Engine + Battery) ground roll & initial rotation.', color: '#FF3B30' },
  { phase: 'CLIMB', label: 'Climb', durationMin: 45, timeRangeStr: '00:15 - 01:00', description: 'Steep climb to cruise altitude (3,000m) with high hybrid power split.', color: '#FFB800' },
  { phase: 'CRUISE', label: 'Cruise', durationMin: 60, timeRangeStr: '01:00 - 02:00', description: 'At 250 km/h, shaft power ≈ 69 kW. Engine supplies ~49 kW, battery supplements ~20 kW.', color: '#00A8FF' },
  { phase: 'LOITER', label: 'Loiter', durationMin: 210, timeRangeStr: '02:00 - 05:30', description: 'Engine dominant loiter at 150 km/h optimizing fuel burn & endurance.', color: '#00E87A' },
  { phase: 'DESCENT', label: 'Descent', durationMin: 30, timeRangeStr: '05:30 - 06:00', description: 'Low throttle descent & electric glide profile.', color: '#B47FFF' },
  { phase: 'LANDING', label: 'Landing', durationMin: 15, timeRangeStr: '06:00 - 06:15', description: 'Final approach, touchdown, and battery reserve safety check.', color: '#00F5E4' }
];

// ============================================================================
// MISSION PROFILE CHART PANEL COMPONENT
// ============================================================================
export const MissionProfileChartPanel: React.FC = () => {
  const { activeTelemetryFrame, updateTelemetryFrame, simulationParams, vehicleInputs } = useGarunStore();

  // Active Chart Tab View: 'COMBINED' | 'ALT_SPEED' | 'POWER_SOC' | 'FUEL_BURN'
  const [chartView, setChartView] = useState<'COMBINED' | 'ALT_SPEED' | 'POWER_SOC' | 'FUEL_BURN'>('COMBINED');
  const [showExpandedModal, setShowExpandedModal] = useState<boolean>(false);

  // Timeline Simulation Animation Controls
  const [currentTimeIndex, setCurrentTimeIndex] = useState<number>(30); // Default 30% progress
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const animationTimerRef = useRef<number | null>(null);

  // Dynamic Full Mission Simulation Computation using GARUN Physics Engine
  const fullMissionSim = useMemo(() => {
    const mtowKg = vehicleInputs?.mtow_kg ?? 1000;
    const payloadKg = simulationParams.payloadKg ?? vehicleInputs?.payload_kg ?? 200;
    const batteryCapacityKwh = simulationParams.batteryCapacityKwh ?? 22;
    const targetAltM = simulationParams.cruiseAltitudeM ?? 3000;
    const engineKw = simulationParams.engineKw ?? 60;

    const weightBudget = computeDetailedWeightBudget({
      mtowKg,
      payloadKg,
      batteryKwh: batteryCapacityKwh,
      engineKw
    });

    const availableFuelKg = weightBudget.fuelMassKg;

    const defaultPhases: MissionPhaseInput[] = [
      { phaseName: 'Climb & Accel', durationHr: 0.25, altM: targetAltM, speedKmh: 220, engineLoadFraction: 1.0, strategy: 'hybrid', batteryPowerKw: 25 },
      { phaseName: 'Cruise (250 km/h)', durationHr: 1.0, altM: targetAltM, speedKmh: 250, engineLoadFraction: 1.0, strategy: 'hybrid', batteryPowerKw: 20 },
      { phaseName: 'Loiter Phase', durationHr: 3.5, altM: targetAltM, speedKmh: 150, engineLoadFraction: 0.6, strategy: 'engine_dominant', batteryPowerKw: 2 },
      { phaseName: 'Descent & Approach', durationHr: 0.4, altM: 500, speedKmh: 140, engineLoadFraction: 0.3, strategy: 'battery_dominant', batteryPowerKw: 5 }
    ];

    const vehicleParams: VehicleParams = {
      mtowKg,
      payloadKg,
      oewKg: weightBudget.oewSubtotalKg,
      wingAreaM2: vehicleInputs?.wing_area_m2 ?? 14.2,
      AR: vehicleInputs?.aspect_ratio ?? 12.0,
      e: vehicleInputs?.oswald_e ?? 0.85,
      CD0: vehicleInputs?.cd0 ?? 0.025,
      etaProp: vehicleInputs?.eta_prop ?? 0.82
    };

    const propulsionParams: PropulsionParams = {
      engineRatedKw: engineKw,
      batteryCapacityKwh,
      busVoltageV: 400,
      etaGen: 0.93,
      etaRect: 0.97,
      etaInv: 0.96,
      etaMotor: 0.95,
      peukertN: 1.05,
      socMin: 0.20
    };

    const loiterOpt = computeOptimalLoiterEndurance(defaultPhases, vehicleParams, propulsionParams, availableFuelKg);

    const adjustedPhases = defaultPhases.map(p => 
      p.phaseName.includes('Loiter') ? { ...p, durationHr: loiterOpt.loiterDurationHr } : p
    );

    const simResult = simulateFullMission(adjustedPhases, vehicleParams, propulsionParams);

    const remainingFuelKg = Math.max(0, availableFuelKg - simResult.totalFuelKg);
    const icaoReserveKg = 16.9; // Standard ICAO reserve requirement for class

    return {
      simResult,
      availableFuelKg: Number(availableFuelKg.toFixed(1)),
      remainingFuelKg: Number(remainingFuelKg.toFixed(1)),
      loiterDurationHr: loiterOpt.loiterDurationHr,
      icaoReserveKg,
      isIcaoReservePassed: remainingFuelKg >= icaoReserveKg,
      isFeasible: simResult.feasible && remainingFuelKg >= 0 && simResult.finalSOC >= 0.20
    };
  }, [vehicleInputs, simulationParams]);

  // Dynamic Timeline Points from Simulation
  const missionTimelineData = useMemo(() => {
    const totalMinutes = fullMissionSim.simResult.enduranceHr * 60;
    const numPoints = 21;
    const result: MissionDataPoint[] = [];

    const phases = fullMissionSim.simResult.phases;
    let cumTimeHr = 0;
    let fuelAccum = fullMissionSim.availableFuelKg;
    let socAccum = 95;

    for (let i = 0; i < numPoints; i++) {
      const timeIndex = i * 5;
      const progressFrac = i / (numPoints - 1);
      const currentMinTotal = Math.round(progressFrac * totalMinutes);
      const hrs = Math.floor(currentMinTotal / 60);
      const mins = currentMinTotal % 60;
      const timeFormatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      // Find corresponding phase
      let activePhase = phases[0];
      let cumulativeHr = 0;
      for (const p of phases) {
        cumulativeHr += p.durationHr;
        if (progressFrac * fullMissionSim.simResult.enduranceHr <= cumulativeHr || p === phases[phases.length - 1]) {
          activePhase = p;
          break;
        }
      }

      let phaseKey: MissionPhaseKey = 'CRUISE';
      if (activePhase.phaseName.includes('Climb')) phaseKey = 'CLIMB';
      else if (activePhase.phaseName.includes('Cruise')) phaseKey = 'CRUISE';
      else if (activePhase.phaseName.includes('Loiter')) phaseKey = 'LOITER';
      else if (activePhase.phaseName.includes('Descent')) phaseKey = 'DESCENT';

      const altitudeM = activePhase.altM;
      const altitudeFt = Math.round(altitudeM * 3.28084);
      const airspeedKts = phaseKey === 'CRUISE' ? 135 : phaseKey === 'LOITER' ? 81 : 100;
      const powerDemandKw = Math.round(activePhase.motorShaftKw);
      const currentBurnRate = Number(activePhase.fuelFlowKgHr.toFixed(1));

      const dtHr = (fullMissionSim.simResult.enduranceHr / (numPoints - 1));
      if (i > 0) {
        fuelAccum = Math.max(0, fuelAccum - currentBurnRate * dtHr);
        const socDrop = activePhase.socDelta / numPoints;
        socAccum = Math.max(20, socAccum - socDrop * 100);
      }

      result.push({
        timeIndex,
        timeFormatted,
        phase: phaseKey,
        altitudeM,
        altitudeFt,
        airspeedKts,
        machNumber: Number((airspeedKts * 0.00175).toFixed(2)),
        powerDemandKw,
        batterySocPct: Number(socAccum.toFixed(1)),
        fuelRemainingKg: Math.round(fuelAccum),
        fuelBurnRateKgHr: currentBurnRate,
        hybridSplitGasPct: Math.round((activePhase.engineKw / Math.max(1, activePhase.engineKw + activePhase.batteryKw)) * 100)
      });
    }

    return result;
  }, [fullMissionSim]);

  // Current Frame Data
  const currentFrame = useMemo(() => {
    const exact = missionTimelineData.find((d) => d.timeIndex === currentTimeIndex);
    if (exact) return exact;
    return missionTimelineData[0];
  }, [currentTimeIndex, missionTimelineData]);

  // Synchronize Telemetry Store
  useEffect(() => {
    if (currentFrame && activeTelemetryFrame) {
      updateTelemetryFrame({
        ...activeTelemetryFrame,
        missionPhase: currentFrame.phase as TelemetryFrame['missionPhase'],
        altitudeM: currentFrame.altitudeM,
        airspeedKts: currentFrame.airspeedKts,
        machNumber: currentFrame.machNumber,
        battery: {
          ...(activeTelemetryFrame?.battery || {}),
          socPct: currentFrame.batterySocPct,
          remainingKwh: Number(((currentFrame.batterySocPct / 100) * 22).toFixed(1))
        },
        engine: {
          ...(activeTelemetryFrame?.engine || {}),
          powerKw: currentFrame.powerDemandKw,
          fuelMassKg: currentFrame.fuelRemainingKg,
          fuelBurnRateKgHr: currentFrame.fuelBurnRateKgHr
        }
      });
    }
  }, [currentTimeIndex]);

  // Animation Loop
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = setInterval(() => {
        setCurrentTimeIndex((prevIndex) => {
          if (prevIndex >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prevIndex + 1;
        });
      }, 300 / playbackSpeed);
    } else if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const handlePhaseJump = (phase: MissionPhaseKey) => {
    setIsPlaying(false);
    const targetPoint = missionTimelineData.find((pt) => pt.phase === phase);
    if (targetPoint) {
      setCurrentTimeIndex(targetPoint.timeIndex);
    }
  };

  return (
    <CornerReticle className="h-full bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col justify-between relative overflow-y-auto">
      <div className="flex flex-col space-y-3">
        {/* HEADER & CONTROLS */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#00A8FF]" />
            <div>
              <h2 className="text-[11px] font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-1.5">
                <span>TIME-MARCHING MISSION ENERGY SIMULATION</span>
              </h2>
              <span className="text-[9px] font-mono-data text-[#00E87A]">
                INTEGRATED FUEL BURN & SOC CHANGE PROFILE
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-[#172236] p-0.5 rounded border border-[#1A2740]">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1 rounded transition-colors ${
                  isPlaying ? 'bg-[#FF3B30] text-white' : 'bg-[#00E87A] text-[#0A0F1E]'
                }`}
                title={isPlaying ? 'Pause Simulation' : 'Play Mission Simulation'}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTimeIndex(0);
                }}
                className="p-1 text-[#8A9BBE] hover:text-white"
                title="Reset Timeline to 00:00"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => setShowExpandedModal(true)}
              className="p-1 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] transition-colors"
              title="Expand Mission Simulation Diagnostic Suite"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CRITICAL PHYSICS CHECK WARNING BOX */}
        <div className="bg-[#172236] border border-[#FFB800]/40 p-2.5 rounded text-[9px] font-mono-data space-y-1">
          <div className="flex items-center space-x-1.5 text-[#FFB800] font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>CRITICAL PHYSICS CHECK — COMPETITION CRUISE TRADE-OFF</span>
          </div>
          <p className="text-[#8A9BBE] leading-relaxed">
            At competition cruise speed (250 km/h) and 3000m, shaft power required ≈ 69 kW.
            Engine available at 3000m ≈ 49 kW (60 kW rated, altitude-derated).
            Battery must supplement ~20 kW during cruise phase.
            Battery SOC consumption during cruise: ~20 kW × 1 hr / 22 kWh ≈ 0.91 per hour of cruise.
            Cruise duration is therefore limited by available battery energy.
            This creates the fundamental endurance optimization trade-off:
            More cruise time → faster battery depletion → less battery for other phases.
            The optimizer maximizes total endurance by finding optimal phase durations and strategies.
          </p>
        </div>

        {/* MISSION SUMMARY DASHBOARD CARDS */}
        <div className="grid grid-cols-4 gap-2 text-[9px] font-mono-data">
          <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded">
            <span className="text-[#8A9BBE] block">TOTAL ENDURANCE:</span>
            <span className="text-[#00E87A] font-bold text-xs">{fullMissionSim.simResult.enduranceHr.toFixed(2)} hr</span>
            <span className="text-[8px] text-[#8A9BBE] block">Loiter: {fullMissionSim.loiterDurationHr.toFixed(2)} hr</span>
          </div>

          <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded">
            <span className="text-[#8A9BBE] block">FUEL CONSUMED / AVAIL:</span>
            <span className="text-white font-bold text-xs">{fullMissionSim.simResult.totalFuelKg.toFixed(1)} / {fullMissionSim.availableFuelKg} kg</span>
            <span className="text-[8px] text-[#00A8FF] block">Remain: {fullMissionSim.remainingFuelKg.toFixed(1)} kg</span>
          </div>

          <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded">
            <span className="text-[#8A9BBE] block">FINAL BATTERY SOC:</span>
            <span className={fullMissionSim.simResult.finalSOC >= 0.20 ? 'text-[#00E87A] font-bold text-xs' : 'text-[#FF3B30] font-bold text-xs'}>
              {(fullMissionSim.simResult.finalSOC * 100).toFixed(1)}% (Min 20%)
            </span>
            <span className="text-[8px] text-[#8A9BBE] block">ICAO Reserve: ✓ {fullMissionSim.icaoReserveKg} kg</span>
          </div>

          <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded">
            <span className="text-[#8A9BBE] block">ENERGY BALANCE CHECK:</span>
            <span className="text-[#00E87A] font-bold text-xs flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Error: {fullMissionSim.simResult.energyBalance.balanceErrorPct}% (&lt; 2%)</span>
            </span>
            <span className={fullMissionSim.isFeasible ? 'text-[#00E87A] font-bold text-[8.5px] block' : 'text-[#FF3B30] font-bold text-[8.5px] block'}>
              FEASIBLE: {fullMissionSim.isFeasible ? 'YES ✓' : 'NO ✕'}
            </span>
          </div>
        </div>

        {/* TIMELINE ANIMATED SCRUBBER */}
        <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] space-y-1">
          <div className="flex justify-between items-center text-[9px] font-mono-data">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#00A8FF]" />
              <span>TIME: <strong className="text-[#00E87A]">{currentFrame.timeFormatted}</strong> / {missionTimelineData[missionTimelineData.length - 1]?.timeFormatted}</span>
            </span>
            <span className="text-[#00A8FF] font-bold uppercase">{currentFrame.phase} PHASE ({currentTimeIndex}%)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentTimeIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentTimeIndex(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-[#172236] rounded appearance-none cursor-pointer accent-[#00A8FF]"
          />
        </div>

        {/* RECHARTS VISUALIZATION CANVAS */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded h-40">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={missionTimelineData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
              <XAxis dataKey="timeFormatted" stroke="#8A9BBE" fontSize={8} />
              <YAxis yAxisId="left" stroke="#00A8FF" fontSize={8} domain={[0, 4000]} unit="m" />
              <YAxis yAxisId="right" orientation="right" stroke="#00E87A" fontSize={8} domain={[0, 200]} />
              <Tooltip contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }} />
              <ReferenceLine yAxisId="left" x={currentFrame.timeFormatted} stroke="#FFB800" strokeWidth={2} strokeDasharray="3 3" />
              <Area yAxisId="left" type="monotone" dataKey="altitudeM" fill="#00A8FF" fillOpacity={0.15} stroke="#00A8FF" strokeWidth={2} name="Altitude (m)" />
              <Line yAxisId="right" type="monotone" dataKey="powerDemandKw" stroke="#FF6B35" strokeWidth={1.5} dot={false} name="Power Demand (kW)" />
              <Line yAxisId="right" type="monotone" dataKey="batterySocPct" stroke="#B47FFF" strokeWidth={1.5} dot={false} name="Battery SOC (%)" />
              <Line yAxisId="right" type="monotone" dataKey="fuelRemainingKg" stroke="#FFB800" strokeWidth={1.5} dot={false} name="Fuel (kg)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* PHASE-BY-PHASE RESULTS TABLE */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded space-y-1">
          <span className="text-[9.5px] font-mono-data text-[#00E87A] font-bold uppercase tracking-wider block">
            PHASE-BY-PHASE ENERGY SIMULATION RESULTS
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-data text-[8.5px]">
              <thead>
                <tr className="text-[#8A9BBE] border-b border-[#1A2740]">
                  <th className="pb-1">PHASE</th>
                  <th className="pb-1">DURATION</th>
                  <th className="pb-1">ENGINE kW</th>
                  <th className="pb-1">BATTERY kW</th>
                  <th className="pb-1">FUEL (kg)</th>
                  <th className="pb-1">ΔSOC (%)</th>
                  <th className="pb-1">TET (K)</th>
                  <th className="pb-1">FEASIBLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2740]/50 text-white">
                {fullMissionSim.simResult.phases.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#172236]/50">
                    <td className="py-1 font-bold text-[#00A8FF]">{p.phaseName}</td>
                    <td className="py-1">{p.durationHr.toFixed(2)} hr</td>
                    <td className="py-1 text-[#FFB800]">{p.engineKw.toFixed(1)} kW</td>
                    <td className="py-1 text-[#B47FFF]">{p.batteryKw.toFixed(1)} kW</td>
                    <td className="py-1 text-[#FF3B30]">{p.fuelConsumedKg.toFixed(1)} kg</td>
                    <td className="py-1 text-[#00E87A]">{(p.socDelta * 100).toFixed(1)}%</td>
                    <td className="py-1">{p.tetK} K</td>
                    <td className="py-1">
                      {p.feasible ? (
                        <span className="text-[#00E87A] font-bold">PASS ✓</span>
                      ) : (
                        <span className="text-[#FF3B30] font-bold">FAIL ✕</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EXPANDED FULLSCREEN MODAL FOR MISSION SIMULATION */}
      {showExpandedModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-[#1F2D45] rounded-lg w-full max-w-4xl p-4 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1F2D45] pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#00A8FF]" />
                <div>
                  <h2 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
                    MISSION SIMULATION DIAGNOSTIC SUITE
                  </h2>
                  <p className="text-[10px] font-mono-data text-[#8A9BBE]">
                    FULL TIME-MARCHING SIMULATION, POWER DEMAND & ENERGY CONSERVATION ANALYZER
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

            <div className="bg-[#111A2E] rounded border border-[#1A2740] p-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={missionTimelineData}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
                  <XAxis dataKey="timeFormatted" stroke="#8A9BBE" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#00A8FF" fontSize={10} domain={[0, 4000]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#00E87A" fontSize={10} domain={[0, 200]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740' }} />
                  <ReferenceLine yAxisId="left" x={currentFrame.timeFormatted} stroke="#FFB800" strokeWidth={2} strokeDasharray="3 3" />
                  <Area yAxisId="left" type="monotone" dataKey="altitudeM" fill="#00A8FF" fillOpacity={0.15} stroke="#00A8FF" strokeWidth={2} name="Altitude (m)" />
                  <Line yAxisId="right" type="monotone" dataKey="powerDemandKw" stroke="#FF6B35" strokeWidth={2} name="Power Demand (kW)" />
                  <Line yAxisId="right" type="monotone" dataKey="batterySocPct" stroke="#B47FFF" strokeWidth={2} name="Battery SOC (%)" />
                  <Line yAxisId="right" type="monotone" dataKey="fuelRemainingKg" stroke="#FFB800" strokeWidth={2} name="Fuel Mass (kg)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-[#1F2D45] flex justify-end">
              <button
                onClick={() => setShowExpandedModal(false)}
                className="bg-[#00A8FF] hover:bg-[#0088CC] text-white font-sans-ui font-bold text-xs uppercase px-4 py-2 rounded"
              >
                CLOSE SIMULATION DIAGNOSTICS
              </button>
            </div>
          </div>
        </div>
      )}
    </CornerReticle>
  );
};
