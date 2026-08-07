import React from 'react';
import {
  Battery,
  BatteryCharging,
  Zap,
  AlertTriangle,
  Sliders,
  Activity,
  CheckCircle2,
  XCircle,
  Info,
  Scale,
  ShieldAlert
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { FormulaPanel } from '../common/FormulaPanel';
import { useGarunStore } from '../../store/useGarunStore';
import {
  simulateFullMission,
  computeDetailedWeightBudget,
  batterySOCUpdate
} from '../../physics/garunPhysics';
import {
  BATTERY_SPECIFIC_ENERGY_WH_KG_PACK,
  BATTERY_SOC_MIN,
  BATTERY_SOC_MAX,
  BATTERY_MAX_C_RATE
} from '../../physics/physicsConstants';

export const BatterySystemPanel: React.FC = () => {
  const {
    simulationParams,
    updateSimulationParams,
    vehicleInputs,
    activeTelemetryFrame
  } = useGarunStore();

  const batteryCapacityKwh = simulationParams.batteryCapacityKwh ?? 22;
  const installedEngineKw = simulationParams.engineKw ?? 60;

  // 1. Physical Sizing Calculations
  const packMassKg = (batteryCapacityKwh * 1000) / BATTERY_SPECIFIC_ENERGY_WH_KG_PACK; // 22000/200 = 110 kg
  const usableKwh = batteryCapacityKwh * (BATTERY_SOC_MAX - BATTERY_SOC_MIN); // 22 * 0.75 = 16.5 kWh
  const maxDischargeKw = BATTERY_MAX_C_RATE * batteryCapacityKwh; // 2.0 * 22 = 44 kW
  const busVoltageV = 400.0; // 400V DC bus
  const maxBusCurrentA = (maxDischargeKw * 1000) / busVoltageV; // 44000 / 400 = 110 A
  const cellCountSeries = Math.round(busVoltageV / 3.7); // 400 / 3.7 ≈ 108

  // 2. Weight Budget Impact
  const weightBudget = computeDetailedWeightBudget({
    mtowKg: vehicleInputs.mtow_kg,
    payloadKg: vehicleInputs.payload_kg,
    batteryKwh: batteryCapacityKwh,
    engineKw: installedEngineKw
  });

  // 3. Mission Simulation & Coulomb Counting SOC Curve
  const defaultPhases = [
    { phaseName: 'Climb & Accel', durationHr: 0.25, altM: 3000, speedKmh: 220, engineLoadFraction: 1.0, strategy: 'hybrid' as const, batteryPowerKw: 25 },
    { phaseName: 'Cruise (250 km/h)', durationHr: 2.0, altM: 3000, speedKmh: 250, engineLoadFraction: 1.0, strategy: 'hybrid' as const, batteryPowerKw: 20 },
    { phaseName: 'Loiter Phase 1', durationHr: 2.5, altM: 3000, speedKmh: 150, engineLoadFraction: 0.6, strategy: 'engine_dominant' as const, batteryPowerKw: 2 },
    { phaseName: 'Loiter Phase 2', durationHr: 3.5, altM: 3000, speedKmh: 150, engineLoadFraction: 0.55, strategy: 'engine_dominant' as const, batteryPowerKw: 3 },
    { phaseName: 'Descent & Reserve', durationHr: 0.5, altM: 1000, speedKmh: 140, engineLoadFraction: 0.3, strategy: 'battery_dominant' as const, batteryPowerKw: 5 }
  ];

  const missionSim = simulateFullMission(
    defaultPhases,
    {
      mtowKg: vehicleInputs.mtow_kg,
      payloadKg: vehicleInputs.payload_kg,
      oewKg: weightBudget.oewSubtotalKg,
      wingAreaM2: vehicleInputs.wing_area_m2,
      AR: vehicleInputs.aspect_ratio,
      e: vehicleInputs.oswald_e,
      CD0: vehicleInputs.cd0,
      etaProp: vehicleInputs.eta_prop
    },
    {
      engineRatedKw: installedEngineKw,
      batteryCapacityKwh,
      busVoltageV: 400,
      peukertN: 1.05,
      socMin: 0.20,
      etaGen: 0.93,
      etaRect: 0.97,
      etaInv: 0.96,
      etaMotor: 0.95
    }
  );

  // Timeline points for SOC chart
  const chartPoints: { timeHr: number; socPct: number; phase: string; batteryKw: number }[] = [];
  let cumTime = 0;
  let runningSOC = BATTERY_SOC_MAX; // 95% start

  chartPoints.push({
    timeHr: 0,
    socPct: Number((runningSOC * 100).toFixed(1)),
    phase: 'Pre-flight',
    batteryKw: 0
  });

  for (const res of missionSim.phases) {
    const timeStepCount = 10;
    const dt = res.durationHr / timeStepCount;
    for (let step = 1; step <= timeStepCount; step++) {
      cumTime += dt;
      const stepSOC = batterySOCUpdate({
        socInitial: runningSOC,
        powerKw: res.batteryKw,
        durationHr: dt,
        capacityKwh: batteryCapacityKwh,
        peukertN: 1.05,
        socMin: 0.20
      });
      runningSOC = stepSOC.socFinal;
      chartPoints.push({
        timeHr: Number(cumTime.toFixed(2)),
        socPct: Number((runningSOC * 100).toFixed(1)),
        phase: res.phaseName,
        batteryKw: Number(res.batteryKw.toFixed(1))
      });
    }
  }

  // Live telemetry SOC or current simulation phase SOC
  const liveSOC = activeTelemetryFrame?.batterySocPct ?? Number((runningSOC * 100).toFixed(1));

  // Determine Live Gauge Color
  let gaugeColor = '#00E87A'; // green > 40%
  let statusText = 'NOMINAL';
  if (liveSOC <= 20) {
    gaugeColor = '#FF3B30'; // red <= 20%
    statusText = 'DEAD ZONE (CRITICAL)';
  } else if (liveSOC <= 25) {
    gaugeColor = '#FF3B30'; // red 20-25%
    statusText = 'LOW SOC FLOOR';
  } else if (liveSOC <= 40) {
    gaugeColor = '#FFB800'; // yellow 25-40%
    statusText = 'CAUTION REGION';
  }

  // Cruise C-Rate check (20 kW battery draw during cruise)
  const cruiseBattPowerKw = 20.0;
  const cRateCruise = cruiseBattPowerKw / batteryCapacityKwh;
  let cRateStatus: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
  if (cRateCruise > 2.0) {
    cRateStatus = 'FAIL';
  } else if (cRateCruise > 1.5) {
    cRateStatus = 'WARN';
  }

  // Max draw C-Rate check (at 44 kW)
  const maxCRate = 44.0 / batteryCapacityKwh;
  const maxCRateValid = maxCRate <= 2.0;

  return (
    <CornerReticle className="h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] overflow-y-auto">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2">
          <div className="flex items-center space-x-2">
            <BatteryCharging className="w-4 h-4 text-[#00E87A]" />
            <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              ELECTROCHEMICAL BATTERY SIZING & COULOMB COUNTING
            </h2>
          </div>
          <span className="text-[9px] font-mono-data text-[#00E87A] bg-[#00E87A]/10 px-2 py-0.5 rounded border border-[#00E87A]/30 font-bold">
            Li-ion NMC CLASS (200 Wh/kg PACK)
          </span>
        </div>

        {/* Battery Sizing Inputs & Physical Math */}
        <div className="grid grid-cols-12 gap-3">
          {/* Slider & Specs */}
          <div className="col-span-8 bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono-data">
              <span className="text-[#8A9BBE] flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-[#00E87A]" />
                <span>PACK ENERGY CAPACITY (kWh)</span>
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-xs">{batteryCapacityKwh} kWh</span>
                <span className="text-[#00E87A] text-[8.5px] bg-[#00E87A]/10 px-1.5 py-0.5 rounded border border-[#00E87A]/30 font-bold">
                  Baseline: 22 kWh
                </span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={batteryCapacityKwh}
              onChange={(e) => updateSimulationParams({ batteryCapacityKwh: Number(e.target.value) })}
              className="w-full accent-[#00E87A] bg-[#0A0F1E] h-1.5 rounded cursor-pointer"
            />

            <div className="grid grid-cols-3 gap-2 text-[9px] font-mono-data pt-1 border-t border-[#1A2740]">
              <div>
                <span className="text-[#8A9BBE] block">COMPUTED PACK MASS:</span>
                <span className="text-white font-bold">{batteryCapacityKwh} kWh / 200 Wh/kg = {packMassKg.toFixed(1)} kg</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] block">USABLE WINDOW (75%):</span>
                <span className="text-[#00E87A] font-bold">{usableKwh.toFixed(1)} kWh (20%–95%)</span>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-[#8A9BBE]">MAX DISCHARGE (2.0C):</span>
                  <FormulaPanel
                    label="Bus Current & Battery C-Rate"
                    value={maxBusCurrentA.toFixed(0)}
                    unit="A"
                    symbolicFormula="I_bus = P_max / V_bus&#10;C_rate = P_battery / E_capacity"
                    variableDefs={[
                      { symbol: 'P_max', name: 'Peak Battery Discharge Power (2.0C)', value: maxDischargeKw.toFixed(1), unit: 'kW' },
                      { symbol: 'V_bus', name: 'DC Bus Architecture Voltage', value: busVoltageV, unit: 'V' },
                      { symbol: 'E_capacity', name: 'Pack Energy Capacity', value: batteryCapacityKwh, unit: 'kWh' }
                    ]}
                    substitutedFormula={`I = (${maxDischargeKw.toFixed(1)} × 1000) / ${busVoltageV} = ${maxBusCurrentA.toFixed(0)} A\nC_rate = ${maxDischargeKw.toFixed(1)} kW / ${batteryCapacityKwh} kWh = 2.0 C`}
                    resultWithUnit={`${maxBusCurrentA.toFixed(0)} A @ 400V (${maxDischargeKw.toFixed(1)} kW)`}
                    source="P = V × I (Ohm's Law). 400V DC Bus Specification."
                    confidence="COMPUTED"
                  />
                </div>
                <span className="text-[#FFB800] font-bold block">{maxDischargeKw.toFixed(1)} kW ({maxBusCurrentA.toFixed(0)}A @ 400V)</span>
              </div>
            </div>
          </div>

          {/* Live Gauge */}
          <div className="col-span-4 bg-[#111A2E] border border-[#1A2740] p-2 rounded flex flex-col items-center justify-center space-y-1">
            <span className="text-[8.5px] font-mono-data text-[#8A9BBE] uppercase">LIVE MISSION SOC</span>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#1A2740]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeWidth="3.5"
                  strokeDasharray={`${liveSOC}, 100`}
                  stroke={gaugeColor}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-bold font-mono-data text-white">{liveSOC.toFixed(0)}%</span>
              </div>
            </div>
            <span className="text-[8px] font-mono-data font-bold px-1.5 py-0.5 rounded" style={{ color: gaugeColor, backgroundColor: `${gaugeColor}15` }}>
              {statusText}
            </span>
          </div>
        </div>

        {/* Battery Impact on Weight Budget & Cell Specs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-1.5 font-mono-data text-[9px]">
            <div className="flex justify-between items-center border-b border-[#1A2740] pb-1">
              <span className="text-[#00E87A] font-bold flex items-center space-x-1">
                <Scale className="w-3 h-3" />
                <span>WEIGHT BUDGET IMPACT</span>
              </span>
              <span className={weightBudget.mtowValidation === 'PASS' ? 'text-[#00E87A] font-bold' : 'text-[#FF3B30] font-bold'}>
                MTOW STATUS: {weightBudget.mtowValidation}
              </span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Pack Mass ({batteryCapacityKwh} kWh):</span>
              <span className="text-white font-bold">{packMassKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Available Fuel Mass:</span>
              <span className="text-[#00A8FF] font-bold">{weightBudget.fuelMassKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Total Mass / MTOW Limit:</span>
              <span className="text-white font-semibold">{weightBudget.totalMassKg.toFixed(1)} / {vehicleInputs.mtow_kg} kg</span>
            </div>
          </div>

          <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-1.5 font-mono-data text-[9px]">
            <div className="flex justify-between items-center border-b border-[#1A2740] pb-1">
              <span className="text-[#00A8FF] font-bold flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>PACK ELECTRICAL & CELL CONFIG</span>
              </span>
              <span className="text-white">Li-ion NMC</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Pack Level Specific Energy:</span>
              <span className="text-white font-semibold">200 Wh/kg (Cell 260 Wh/kg)</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Bus Voltage / Cell Stack:</span>
              <span className="text-white font-semibold">{busVoltageV} V DC ({cellCountSeries}S Stack)</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Cruise Discharge C-Rate:</span>
              <span className={cRateStatus === 'PASS' ? 'text-[#00E87A] font-bold' : 'text-[#FF3B30] font-bold'}>
                {cRateCruise.toFixed(2)}C (Limit: 2.0C) — {cRateStatus}
              </span>
            </div>
          </div>
        </div>

        {/* SOC Timeline Chart */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-3 rounded space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-[#00E87A]" />
              <span className="text-[10px] font-mono-data text-[#00E87A] font-bold uppercase tracking-wider">
                MISSION SOC TIMELINE (COULOMB COUNTING WITH PEUKERT)
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[8.5px] font-mono-data">
              <span className="text-[#00E87A]">── SOC (%)</span>
              <span className="text-[#FF3B30]">--- SOC Floor (20%)</span>
              <span className="text-[#00A8FF]">--- SOC Max (95%)</span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#1A2740" strokeDasharray="3 3" />
                <XAxis
                  dataKey="timeHr"
                  stroke="#8A9BBE"
                  tick={{ fontSize: 9 }}
                  unit=" hr"
                />
                <YAxis
                  stroke="#8A9BBE"
                  tick={{ fontSize: 9 }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0F1E', borderColor: '#1A2740', fontSize: '11px' }}
                  labelFormatter={(lbl) => `Flight Time: ${lbl} hrs`}
                  formatter={(val: number | string, _name: string, item?: { payload?: { phase?: string } }) => [
                    `${val}% (${item?.payload?.phase ?? 'Flight'})`,
                    'State of Charge'
                  ]}
                />
                <ReferenceLine
                  y={20}
                  stroke="#FF3B30"
                  strokeDasharray="3 3"
                  label={{ value: 'SOC Min (20%)', fill: '#FF3B30', fontSize: 8, position: 'insideBottomRight' }}
                />
                <ReferenceLine
                  y={95}
                  stroke="#00A8FF"
                  strokeDasharray="3 3"
                  label={{ value: 'SOC Max (95%)', fill: '#00A8FF', fontSize: 8, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="socPct"
                  stroke="#00E87A"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-[8px] font-mono-data text-[#8A9BBE] border-t border-[#1A2740] pt-1">
            <span>Coulomb Counting Eq: SOC(t+dt) = SOC(t) - (P × dt × Peukert) / Capacity</span>
            <span>Total Mission Fuel Burn: {missionSim.totalFuelKg.toFixed(1)} kg</span>
          </div>
        </div>

        {/* C-Rate & Constraints Banner */}
        <div className="bg-[#172236] border border-[#1A2740] p-2.5 rounded flex items-center justify-between text-[9px] font-mono-data">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#FFB800]" />
            <div>
              <span className="text-white font-bold block">BATTERY CONTINUOUS C-RATE COMPLIANCE</span>
              <span className="text-[#8A9BBE]">
                Cruise Draw: {cruiseBattPowerKw} kW ({cRateCruise.toFixed(2)}C) | Peak Draw: {maxDischargeKw} kW ({maxCRate.toFixed(1)}C)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {cRateCruise <= 2.0 && maxCRateValid ? (
              <span className="flex items-center space-x-1 text-[#00E87A] bg-[#00E87A]/10 px-2 py-1 rounded border border-[#00E87A]/30 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>C-RATE PASS (&lt; 2.0C)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-1 rounded border border-[#FF3B30]/30 font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>C-RATE LIMIT EXCEEDED</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </CornerReticle>
  );
};
