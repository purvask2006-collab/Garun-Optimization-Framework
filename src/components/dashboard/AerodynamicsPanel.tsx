import React from 'react';
import {
  Wind,
  Gauge,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sliders,
  TrendingDown,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { useGarunStore } from '../../store/useGarunStore';
import { powerRequired, enginePowerAtAlt, isaAtmosphere } from '../../physics/garunPhysics';
import {
  CD0_ASSUMPTION,
  OSWALD_E_ASSUMPTION,
  PROP_ETA_ASSUMPTION,
} from '../../physics/physicsConstants';

export const AerodynamicsPanel: React.FC = () => {
  const { vehicleInputs, updateVehicleInputs, simulationParams } = useGarunStore();

  const massKg = vehicleInputs.mtow_kg;
  const wingAreaM2 = vehicleInputs.wing_area_m2;
  const AR = vehicleInputs.aspect_ratio;
  const CD0 = vehicleInputs.cd0 ?? CD0_ASSUMPTION;
  const e = vehicleInputs.oswald_e ?? OSWALD_E_ASSUMPTION;
  const etaProp = vehicleInputs.eta_prop ?? PROP_ETA_ASSUMPTION;

  const cruiseSpeedKmh = vehicleInputs.cruise_speed_kmh;
  const cruiseAltM = vehicleInputs.cruise_alt_m;
  const loiterSpeedKmh = vehicleInputs.loiter_speed_kmh;
  const loiterAltM = vehicleInputs.loiter_alt_m;

  // Power required calculations from physics engine
  const cruisePower = powerRequired({
    massKg,
    altM: cruiseAltM,
    speedKmh: cruiseSpeedKmh,
    wingAreaM2,
    AR,
    e,
    CD0,
    etaProp,
  });

  const loiterPower = powerRequired({
    massKg,
    altM: loiterAltM,
    speedKmh: loiterSpeedKmh,
    wingAreaM2,
    AR,
    e,
    CD0,
    etaProp,
  });

  // Atmospheric conditions
  const cruiseAtm = isaAtmosphere(cruiseAltM);
  const loiterAtm = isaAtmosphere(loiterAltM);

  // Engine available power
  const engineRatedKw = 60; // 60kW rated turboshaft
  const engineAvailCruiseKw = enginePowerAtAlt(engineRatedKw, cruiseAltM);
  const engineAvailLoiterKw = enginePowerAtAlt(engineRatedKw, loiterAltM);
  const batteryMaxKw = 30; // 30kW max discharge contribution

  // Power sweep 100 -> 350 km/h at Cruise Altitude
  const powerCurveData: { speedKmh: number; shaftPowerKw: number; dragN: number; LOverD: number }[] = [];
  let minPowerKw = Infinity;
  let minPowerSpeedKmh = 100;

  for (let s = 100; s <= 350; s += 2) {
    const p = powerRequired({
      massKg,
      altM: cruiseAltM,
      speedKmh: s,
      wingAreaM2,
      AR,
      e,
      CD0,
      etaProp,
    });
    powerCurveData.push({
      speedKmh: s,
      shaftPowerKw: Number(p.shaftPowerKw.toFixed(1)),
      dragN: Number(p.dragN.toFixed(1)),
      LOverD: Number(p.LOverD.toFixed(2)),
    });

    if (p.shaftPowerKw < minPowerKw) {
      minPowerKw = p.shaftPowerKw;
      minPowerSpeedKmh = s;
    }
  }

  // Feasibility evaluation
  const totalAvailCruiseKw = engineAvailCruiseKw + batteryMaxKw;
  const isCruiseFeasible = cruisePower.shaftPowerKw <= totalAvailCruiseKw;
  const isLoiterEngineFeasible = loiterPower.shaftPowerKw <= engineAvailLoiterKw;
  const excessLoiterKw = engineAvailLoiterKw - loiterPower.shaftPowerKw;

  return (
    <CornerReticle className="h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] overflow-y-auto">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-[#00A8FF]" />
            <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              AERODYNAMIC POWER & DRAG POLAR ANALYSIS
            </h2>
          </div>
          <span className="text-[9px] font-mono-data text-[#00A8FF] bg-[#00A8FF]/10 px-2 py-0.5 rounded border border-[#00A8FF]/30">
            ISA DRAG POLAR MODEL
          </span>
        </div>

        {/* Global Aircraft Parameters Summary */}
        <div className="grid grid-cols-4 gap-1.5 mb-3 bg-[#111A2E] border border-[#1A2740] p-2 rounded text-[9px] font-mono-data">
          <div>
            <span className="text-[#8A9BBE] block">MASS (MTOW)</span>
            <span className="text-white font-bold">{massKg} kg</span>
          </div>
          <div>
            <span className="text-[#8A9BBE] block">WING AREA (S)</span>
            <span className="text-[#00A8FF] font-bold">{wingAreaM2} m²</span>
          </div>
          <div>
            <span className="text-[#8A9BBE] block">ASPECT RATIO (AR)</span>
            <span className="text-[#00A8FF] font-bold">{AR}</span>
          </div>
          <div>
            <span className="text-[#8A9BBE] block">CD0 / OSWALD e</span>
            <span className="text-[#00E87A] font-bold">{CD0} / {e}</span>
          </div>
        </div>

        {/* Feasibility Alert Box */}
        <div className="mb-3 p-2 rounded border bg-[#111A2E] text-[10px] font-mono-data flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isCruiseFeasible ? (
              <XCircle className="w-4 h-4 text-[#FF4D4D]" />
            ) : !isLoiterEngineFeasible ? (
              <AlertTriangle className="w-4 h-4 text-[#FFB800]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#00E87A]" />
            )}
            <div>
              <div className="font-bold text-[#E8EDF7]">
                {!isCruiseFeasible
                  ? 'POWER FEASIBILITY FAIL: UNDERSIZED POWERTRAN'
                  : !isLoiterEngineFeasible
                  ? 'LOITER WARNING: BATTERY ASSIST REQUIRED'
                  : 'FEASIBILITY PASS: POWERTRAN SIZED FOR CRUISE & RECHARGE'}
              </div>
              <div className="text-[8.5px] text-[#8A9BBE]">
                Cruise req: {cruisePower.shaftPowerKw.toFixed(1)} kW (Avail Eng: {engineAvailCruiseKw.toFixed(1)} kW) | Loiter req: {loiterPower.shaftPowerKw.toFixed(1)} kW (Eng load: {((loiterPower.shaftPowerKw / engineAvailLoiterKw) * 100).toFixed(0)}%)
              </div>
            </div>
          </div>
          {excessLoiterKw > 0 && (
            <div className="bg-[#00E87A]/10 border border-[#00E87A]/30 px-2 py-1 rounded text-right">
              <span className="text-[8px] text-[#8A9BBE] block uppercase">LOITER RECHARGE MARGIN</span>
              <span className="text-[#00E87A] font-bold text-xs">+{excessLoiterKw.toFixed(1)} kW</span>
            </div>
          )}
        </div>

        {/* Cruise vs Loiter Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* CRUISE POINT CARD */}
          <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-2">
            <div className="flex items-center justify-between border-b border-[#1A2740] pb-1">
              <span className="text-[10px] font-mono-data text-[#00A8FF] font-bold uppercase tracking-wider flex items-center space-x-1">
                <Gauge className="w-3 h-3 text-[#00A8FF]" />
                <span>CRUISE POINT DESIGN</span>
              </span>
              <span className="text-[9px] font-mono-data text-white font-bold bg-[#00A8FF]/20 px-1.5 py-0.2 rounded">
                {cruisePower.shaftPowerKw.toFixed(1)} kW Shaft
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-data">
              <div>
                <label className="text-[#8A9BBE] block text-[9px]">Speed (km/h)</label>
                <input
                  type="number"
                  min="180"
                  max="350"
                  value={cruiseSpeedKmh}
                  onChange={(e) => updateVehicleInputs({ cruise_speed_kmh: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-1.5 py-0.5 text-white font-bold outline-none focus:border-[#00A8FF]"
                />
              </div>
              <div>
                <label className="text-[#8A9BBE] block text-[9px]">Altitude (m)</label>
                <input
                  type="number"
                  min="1000"
                  max="10000"
                  step="500"
                  value={cruiseAltM}
                  onChange={(e) => updateVehicleInputs({ cruise_alt_m: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-1.5 py-0.5 text-white font-bold outline-none focus:border-[#00A8FF]"
                />
              </div>
            </div>

            {/* Live Aerodynamic Outputs */}
            <div className="bg-[#0A0F1E] p-2 rounded border border-[#1A2740]/60 space-y-1 text-[9px] font-mono-data">
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Air Density (ρ @ {cruiseAltM}m)</span>
                <span className="text-white font-semibold">{cruiseAtm.densityKgM3.toFixed(3)} kg/m³</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Dynamic Pressure (q)</span>
                <span className="text-white font-semibold">{cruisePower.dynamicPressurePa.toFixed(0)} Pa</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Lift Coeff (CL) / Drag (CD)</span>
                <span className="text-white font-semibold">{cruisePower.CL.toFixed(3)} / {cruisePower.CD.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Lift-to-Drag Ratio (L/D)</span>
                <span className="text-[#00A8FF] font-bold">{cruisePower.LOverD.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Aerodynamic Drag</span>
                <span className="text-white font-semibold">{cruisePower.dragN.toFixed(0)} N</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Propulsive Power (P_prop)</span>
                <span className="text-[#00E87A] font-semibold">{cruisePower.propulsivePowerKw.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE] pt-1 border-t border-[#1A2740] font-bold">
                <span className="text-[#00A8FF]">SHAFT POWER REQUIRED</span>
                <span className="text-[#00A8FF] text-[10px]">{cruisePower.shaftPowerKw.toFixed(1)} kW</span>
              </div>
            </div>
          </div>

          {/* LOITER POINT CARD */}
          <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-2">
            <div className="flex items-center justify-between border-b border-[#1A2740] pb-1">
              <span className="text-[10px] font-mono-data text-[#10B981] font-bold uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3 h-3 text-[#10B981]" />
                <span>LOITER POINT DESIGN</span>
              </span>
              <span className="text-[9px] font-mono-data text-white font-bold bg-[#10B981]/20 px-1.5 py-0.2 rounded">
                {loiterPower.shaftPowerKw.toFixed(1)} kW Shaft
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-data">
              <div>
                <label className="text-[#8A9BBE] block text-[9px]">Speed (km/h)</label>
                <input
                  type="number"
                  min="100"
                  max="200"
                  value={loiterSpeedKmh}
                  onChange={(e) => updateVehicleInputs({ loiter_speed_kmh: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-1.5 py-0.5 text-white font-bold outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="text-[#8A9BBE] block text-[9px]">Altitude (m)</label>
                <input
                  type="number"
                  min="1000"
                  max="10000"
                  step="500"
                  value={loiterAltM}
                  onChange={(e) => updateVehicleInputs({ loiter_alt_m: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-1.5 py-0.5 text-white font-bold outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* Live Aerodynamic Outputs */}
            <div className="bg-[#0A0F1E] p-2 rounded border border-[#1A2740]/60 space-y-1 text-[9px] font-mono-data">
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Air Density (ρ @ {loiterAltM}m)</span>
                <span className="text-white font-semibold">{loiterAtm.densityKgM3.toFixed(3)} kg/m³</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Dynamic Pressure (q)</span>
                <span className="text-white font-semibold">{loiterPower.dynamicPressurePa.toFixed(0)} Pa</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Lift Coeff (CL) / Drag (CD)</span>
                <span className="text-white font-semibold">{loiterPower.CL.toFixed(3)} / {loiterPower.CD.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Lift-to-Drag Ratio (L/D)</span>
                <span className="text-[#10B981] font-bold">{loiterPower.LOverD.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Aerodynamic Drag</span>
                <span className="text-white font-semibold">{loiterPower.dragN.toFixed(0)} N</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE]">
                <span>Propulsive Power (P_prop)</span>
                <span className="text-[#00E87A] font-semibold">{loiterPower.propulsivePowerKw.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between text-[#8A9BBE] pt-1 border-t border-[#1A2740] font-bold">
                <span className="text-[#10B981]">SHAFT POWER REQUIRED</span>
                <span className="text-[#10B981] text-[10px]">{loiterPower.shaftPowerKw.toFixed(1)} kW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Aerodynamic Power Polar Chart */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-[#00A8FF]" />
              <span className="text-[10px] font-mono-data text-[#00A8FF] font-bold uppercase tracking-wider">
                AERODYNAMIC POWER REQUIRED vs SPEED POLAR (ALT = {cruiseAltM}m)
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[9px] font-mono-data">
              <span className="flex items-center space-x-1 text-[#00A8FF]">
                <span className="w-2 h-2 rounded-full bg-[#00A8FF]" />
                <span>Cruise ({cruiseSpeedKmh}km/h: {cruisePower.shaftPowerKw.toFixed(1)}kW)</span>
              </span>
              <span className="flex items-center space-x-1 text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Loiter ({loiterSpeedKmh}km/h: {loiterPower.shaftPowerKw.toFixed(1)}kW)</span>
              </span>
              <span className="flex items-center space-x-1 text-[#FFB800]">
                <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
                <span>Min Power Speed ({minPowerSpeedKmh}km/h: {minPowerKw.toFixed(1)}kW)</span>
              </span>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={powerCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="speedKmh"
                  stroke="#8A9BBE"
                  tick={{ fontSize: 9 }}
                  unit=" km/h"
                  domain={[100, 350]}
                />
                <YAxis
                  stroke="#8A9BBE"
                  tick={{ fontSize: 9 }}
                  unit=" kW"
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0F1E', borderColor: '#1A2740', fontSize: '11px' }}
                  formatter={(val: number | string) => [`${val} kW`, 'Required Shaft Power']}
                  labelFormatter={(lbl) => `Airspeed: ${lbl} km/h`}
                />
                <ReferenceLine
                  y={engineAvailCruiseKw}
                  stroke="#EF4444"
                  strokeDasharray="3 3"
                  label={{
                    value: `Engine Max @ ${cruiseAltM}m (${engineAvailCruiseKw.toFixed(0)}kW)`,
                    fill: '#EF4444',
                    fontSize: 8,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceDot
                  x={cruiseSpeedKmh}
                  y={Number(cruisePower.shaftPowerKw.toFixed(1))}
                  r={5}
                  fill="#00A8FF"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
                <ReferenceDot
                  x={loiterSpeedKmh}
                  y={Number(loiterPower.shaftPowerKw.toFixed(1))}
                  r={5}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
                <ReferenceDot
                  x={minPowerSpeedKmh}
                  y={Number(minPowerKw.toFixed(1))}
                  r={5}
                  fill="#FFB800"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="shaftPowerKw"
                  stroke="#00A8FF"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-[8.5px] font-mono-data text-[#8A9BBE] flex justify-between border-t border-[#1A2740] pt-1">
            <span>
              Minimum Power Speed (V_min_p) = <strong className="text-[#FFB800]">{minPowerSpeedKmh} km/h</strong> ({minPowerKw.toFixed(1)} kW required)
            </span>
            <span>
              Drag Polar: CD = {CD0} + CL²/(π × {AR} × {e})
            </span>
          </div>
        </div>
      </div>
    </CornerReticle>
  );
};
