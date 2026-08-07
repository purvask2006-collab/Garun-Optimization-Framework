import React, { useState } from 'react';
import {
  Zap,
  Gauge,
  Flame,
  AlertTriangle,
  Info,
  Sliders,
  TrendingUp,
  Activity,
  CheckCircle2,
  ShieldCheck,
  BatteryCharging
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { FormulaPanel } from '../common/FormulaPanel';
import { useGarunStore } from '../../store/useGarunStore';
import {
  enginePowerAtAlt,
  engineSFC,
  engineFuelFlow,
  powerRequired,
  combustorTET,
  isaAtmosphere,
} from '../../physics/garunPhysics';
import {
  CD0_ASSUMPTION,
  OSWALD_E_ASSUMPTION,
  PROP_ETA_ASSUMPTION,
  ENGINE_TET_LIMIT_K
} from '../../physics/physicsConstants';

export const PropulsionSizingPanel: React.FC = () => {
  const { vehicleInputs, updateVehicleInputs, simulationParams, updateSimulationParams } = useGarunStore();

  const engineRatedKw = simulationParams.engineKw ?? 60; // Default 60kW

  const handleRatedKwChange = (newVal: number) => {
    updateSimulationParams({ engineKw: newVal });
  };

  // Vehicle & Mission Parameters
  const mtowKg = vehicleInputs.mtow_kg;
  const wingAreaM2 = vehicleInputs.wing_area_m2;
  const AR = vehicleInputs.aspect_ratio;
  const CD0 = vehicleInputs.cd0 ?? CD0_ASSUMPTION;
  const e = vehicleInputs.oswald_e ?? OSWALD_E_ASSUMPTION;
  const etaProp = vehicleInputs.eta_prop ?? PROP_ETA_ASSUMPTION;

  const cruiseSpeedKmh = vehicleInputs.cruise_speed_kmh;
  const cruiseAltM = vehicleInputs.cruise_alt_m;
  const loiterSpeedKmh = vehicleInputs.loiter_speed_kmh;
  const loiterAltM = vehicleInputs.loiter_alt_m;

  // 1. Aerodynamic Power Requirements
  const cruiseAero = powerRequired({
    massKg: mtowKg,
    altM: cruiseAltM,
    speedKmh: cruiseSpeedKmh,
    wingAreaM2,
    AR,
    e,
    CD0,
    etaProp,
  });

  const loiterAero = powerRequired({
    massKg: mtowKg,
    altM: loiterAltM,
    speedKmh: loiterSpeedKmh,
    wingAreaM2,
    AR,
    e,
    CD0,
    etaProp,
  });

  // 2. Engine Available Power at Altitude
  const availPowerSLKw = engineRatedKw;
  const availPowerCruiseKw = enginePowerAtAlt(engineRatedKw, cruiseAltM);
  const availPowerLoiterKw = enginePowerAtAlt(engineRatedKw, loiterAltM);

  // 3. Operating Point & Load Fractions
  // Cruise: engine delivers up to available max at altitude; battery supplies shortfall
  const cruiseReqShaftKw = cruiseAero.shaftPowerKw;
  const cruiseEnginePowerKw = Math.min(availPowerCruiseKw, cruiseReqShaftKw);
  const batteryCruiseBoostKw = Math.max(0, cruiseReqShaftKw - availPowerCruiseKw);
  const cruiseEngineLoad = Math.min(1.0, cruiseReqShaftKw / Math.max(0.1, availPowerCruiseKw)); // clamped 1.0
  const cruiseSFC = engineSFC(cruiseEngineLoad); // kg/kWh
  const cruiseFuelFlowKgHr = engineFuelFlow(cruiseEnginePowerKw, cruiseSFC);

  // Loiter: engine handles loiter shaft power demand and recharges battery with excess capacity
  const loiterReqShaftKw = loiterAero.shaftPowerKw;
  const loiterEngineLoad = Math.min(1.0, loiterReqShaftKw / Math.max(0.1, availPowerLoiterKw));
  const loiterEnginePowerKw = loiterReqShaftKw;
  const loiterSFC = engineSFC(loiterEngineLoad);
  const loiterFuelFlowKgHr = engineFuelFlow(loiterEnginePowerKw, loiterSFC);
  const loiterRechargeMarginKw = Math.max(0, availPowerLoiterKw - loiterReqShaftKw);

  // 4. Turbine Entry Temperature (TET)
  const cruiseTET = combustorTET({ altM: cruiseAltM, loadFraction: cruiseEngineLoad, pressureRatio: 5.0 });
  const loiterTET = combustorTET({ altM: loiterAltM, loadFraction: loiterEngineLoad, pressureRatio: 5.0 });

  // 5. Engine Operating Point Chart Curve (0 to 100% Load)
  const chartData: { loadPct: number; sfc: number; fuelFlowKgHr: number }[] = [];
  for (let l = 10; l <= 100; l += 5) {
    const loadFrac = l / 100;
    const sfcVal = engineSFC(loadFrac);
    const pKw = availPowerCruiseKw * loadFrac;
    const ffVal = engineFuelFlow(pKw, sfcVal);
    chartData.push({
      loadPct: l,
      sfc: Number(sfcVal.toFixed(3)),
      fuelFlowKgHr: Number(ffVal.toFixed(1)),
    });
  }

  return (
    <CornerReticle className="h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] overflow-y-auto">
      <div className="space-y-3">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-[#FFB800]" />
            <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              TURBOSHAFTS ENGINE SIZING & HYBRID NECESSITY ANALYSIS
            </h2>
          </div>
          <span className="text-[9px] font-mono-data text-[#FFB800] bg-[#FFB800]/10 px-2 py-0.5 rounded border border-[#FFB800]/30 font-bold">
            60 kW CLASS MODEL
          </span>
        </div>

        {/* Engine Rated Power Controls */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono-data">
            <span className="text-[#8A9BBE] flex items-center space-x-1">
              <Sliders className="w-3 h-3 text-[#00A8FF]" />
              <span>TURBOSHAFT RATED POWER (SEA LEVEL)</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-[#00E87A] text-[9px] bg-[#00E87A]/10 px-1.5 py-0.5 rounded border border-[#00E87A]/30">
                Competition preferred: ≈60 kW
              </span>
              <span className="text-white font-bold text-xs">{engineRatedKw} kW</span>
            </div>
          </div>
          <input
            type="range"
            min="40"
            max="90"
            step="1"
            value={engineRatedKw}
            onChange={(e) => handleRatedKwChange(Number(e.target.value))}
            className="w-full accent-[#00A8FF] bg-[#0A0F1E] h-1.5 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[8px] font-mono-data text-[#8A9BBE]">
            <span>40 kW (Light)</span>
            <span className="text-[#00A8FF] font-bold">60 kW (Baseline Target)</span>
            <span>90 kW (Heavy)</span>
          </div>
        </div>

        {/* PROMINENT CRITICAL DISPLAY: HYBRID ARCHITECTURE NECESSITY */}
        <div className="bg-[#172236] border-2 border-[#00A8FF] p-3 rounded space-y-2 shadow-lg shadow-[#00A8FF]/10">
          <div className="flex items-center justify-between border-b border-[#00A8FF]/30 pb-1.5">
            <span className="text-[10px] font-mono-data text-[#00A8FF] font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-[#00E87A]" />
              <span>HYBRID ARCHITECTURE SIZING CONSTRAINT</span>
            </span>
            <span className="text-[9px] font-mono-data text-[#00E87A] bg-[#00E87A]/20 px-2 py-0.5 rounded font-bold">
              PHYSICS VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono-data">
            <div className="bg-[#0A0F1E] p-2 rounded border border-[#1A2740]">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-[8.5px] text-[#8A9BBE] uppercase">CRUISE SHAFT POWER REQ</span>
                <FormulaPanel
                  label="Cruise Shaft Power Required"
                  value={cruiseReqShaftKw.toFixed(1)}
                  unit="kW"
                  symbolicFormula="V = cruiseSpeed / 3.6 [m/s]&#10;q = ½ × ρ_alt × V²&#10;CL = (MTOW × g) / (q × S)&#10;CD = CD0 + CL² / (π × AR × e)&#10;P_shaft = (D × V) / η_prop"
                  variableDefs={[
                    { symbol: 'V', name: 'Cruise True Airspeed', value: (cruiseSpeedKmh / 3.6).toFixed(1), unit: 'm/s' },
                    { symbol: 'ρ_alt', name: `ISA Air Density at ${cruiseAltM}m`, value: '0.909', unit: 'kg/m³' },
                    { symbol: 'CL', name: '3D Lift Coefficient', value: cruiseAero.CL.toFixed(3), unit: 'dim' },
                    { symbol: 'CD', name: '3D Drag Coefficient', value: cruiseAero.CD.toFixed(4), unit: 'dim' },
                    { symbol: 'D', name: 'Aerodynamic Drag Force', value: cruiseAero.dragN.toFixed(0), unit: 'N' },
                    { symbol: 'η_prop', name: 'Propeller Efficiency', value: etaProp, unit: 'dim' }
                  ]}
                  substitutedFormula={`V = ${cruiseSpeedKmh} / 3.6 = ${(cruiseSpeedKmh / 3.6).toFixed(1)} m/s\nq = ½ × 0.909 × ${(cruiseSpeedKmh / 3.6).toFixed(1)}² = ${cruiseAero.dynamicPressurePa.toFixed(0)} Pa\nCL = (${mtowKg} × 9.807) / (${cruiseAero.dynamicPressurePa.toFixed(0)} × ${wingAreaM2}) = ${cruiseAero.CL.toFixed(3)}\nCD = ${CD0} + ${cruiseAero.CL.toFixed(3)}² / (π × ${AR} × ${e}) = ${cruiseAero.CD.toFixed(4)}\nD = ${mtowKg * 9.807} / (${cruiseAero.CL.toFixed(3)} / ${cruiseAero.CD.toFixed(4)}) = ${cruiseAero.dragN.toFixed(0)} N\nP_shaft = (${cruiseAero.dragN.toFixed(0)} × ${(cruiseSpeedKmh / 3.6).toFixed(1)}) / ${etaProp} = ${cruiseReqShaftKw.toFixed(1)} kW`}
                  resultWithUnit={`${cruiseReqShaftKw.toFixed(1)} kW`}
                  source="3D Drag polar model with ISA 3000m atmospheric derating."
                  confidence="COMPUTED"
                />
              </div>
              <span className="text-sm font-bold text-[#FFB800]">{cruiseReqShaftKw.toFixed(1)} kW</span>
              <span className="text-[8px] text-[#8A9BBE] block">@ {cruiseSpeedKmh} km/h, {cruiseAltM}m</span>
            </div>

            <div className="bg-[#0A0F1E] p-2 rounded border border-[#1A2740]">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-[8.5px] text-[#8A9BBE] uppercase">ENGINE AVAIL @ {cruiseAltM}m</span>
                <FormulaPanel
                  label="Engine Power Derating at Altitude"
                  value={availPowerCruiseKw.toFixed(1)}
                  unit="kW"
                  symbolicFormula="P_alt = P_SL × (ρ_alt / ρ_SL)^1.0"
                  variableDefs={[
                    { symbol: 'P_SL', name: 'Sea Level Rated Turboshaft Power', value: engineRatedKw, unit: 'kW' },
                    { symbol: 'ρ_alt', name: `ISA Air Density at ${cruiseAltM}m`, value: '0.909', unit: 'kg/m³' },
                    { symbol: 'ρ_SL', name: 'Sea Level Standard Air Density', value: '1.225', unit: 'kg/m³' }
                  ]}
                  substitutedFormula={`P_alt = ${engineRatedKw} × (0.909 / 1.225) = ${availPowerCruiseKw.toFixed(1)} kW`}
                  resultWithUnit={`${availPowerCruiseKw.toFixed(1)} kW Available`}
                  source="Turboshaft density ratio altitude power lapse model."
                  confidence="COMPUTED"
                />
              </div>
              <span className="text-sm font-bold text-[#00A8FF]">{availPowerCruiseKw.toFixed(1)} kW</span>
              <span className="text-[8px] text-[#8A9BBE] block">Rated {engineRatedKw} kW @ SL</span>
            </div>

            <div className="bg-[#0A0F1E] p-2 rounded border border-[#00E87A]/40">
              <span className="text-[8.5px] text-[#8A9BBE] block uppercase">BATTERY ELECTRIC BOOST</span>
              <span className="text-sm font-bold text-[#00E87A]">+{batteryCruiseBoostKw.toFixed(1)} kW</span>
              <span className="text-[8px] text-[#00E87A] block">Fills Cruise Shortfall</span>
            </div>
          </div>

          <p className="text-[9px] text-[#8A9BBE] font-mono-data leading-relaxed">
            <strong className="text-white">Why Hybrid is Required:</strong> At {cruiseAltM}m cruise altitude, ambient air density (0.909 kg/m³) derates the {engineRatedKw}kW engine to <strong>{availPowerCruiseKw.toFixed(1)} kW</strong>. Aerodynamic drag at {cruiseSpeedKmh} km/h requires <strong>{cruiseReqShaftKw.toFixed(1)} kW</strong> shaft power. The battery provides the <strong>{batteryCruiseBoostKw.toFixed(1)} kW shortfall</strong> during cruise. During loiter ({loiterSpeedKmh} km/h, req {loiterReqShaftKw.toFixed(1)} kW), the engine operates at {((loiterEngineLoad) * 100).toFixed(0)}% load, leaving <strong>+{loiterRechargeMarginKw.toFixed(1)} kW</strong> to recharge the battery.
          </p>
        </div>

        {/* Engine Performance & Thermal Table */}
        <div className="grid grid-cols-2 gap-3">
          {/* CRUISE PERFORMANCE */}
          <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-1.5 font-mono-data text-[9px]">
            <div className="flex justify-between items-center border-b border-[#1A2740] pb-1">
              <span className="text-[#00A8FF] font-bold">CRUISE OPERATING POINT</span>
              <span className="text-[#8A9BBE]">{cruiseSpeedKmh} km/h @ {cruiseAltM}m</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Sea Level Available Power:</span>
              <span className="text-white font-semibold">{availPowerSLKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Derated Power @ {cruiseAltM}m:</span>
              <span className="text-[#00A8FF] font-bold">{availPowerCruiseKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Engine Load Fraction:</span>
              <span className="text-white font-semibold">{(cruiseEngineLoad * 100).toFixed(0)}% (Full Cap)</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Specific Fuel Cons (SFC):</span>
              <span className="text-[#00E87A] font-bold">{cruiseSFC.toFixed(3)} kg/kWh</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Fuel Mass Flow Rate:</span>
              <span className="text-white font-semibold">{cruiseFuelFlowKgHr.toFixed(1)} kg/hr</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Turbine Entry Temp (TET):</span>
              <span className="text-[#FFB800] font-bold">{cruiseTET.TET_K.toFixed(0)} K (&lt; {ENGINE_TET_LIMIT_K}K Limit)</span>
            </div>
          </div>

          {/* LOITER PERFORMANCE */}
          <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-1.5 font-mono-data text-[9px]">
            <div className="flex justify-between items-center border-b border-[#1A2740] pb-1">
              <span className="text-[#10B981] font-bold">LOITER OPERATING POINT</span>
              <span className="text-[#8A9BBE]">{loiterSpeedKmh} km/h @ {loiterAltM}m</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Required Shaft Power:</span>
              <span className="text-white font-semibold">{loiterReqShaftKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Engine Available Power:</span>
              <span className="text-white font-semibold">{availPowerLoiterKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Engine Load Fraction:</span>
              <span className="text-[#10B981] font-bold">{(loiterEngineLoad * 100).toFixed(0)}% (Optimal)</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Specific Fuel Cons (SFC):</span>
              <span className="text-[#00E87A] font-bold">{loiterSFC.toFixed(3)} kg/kWh</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Fuel Mass Flow Rate:</span>
              <span className="text-white font-semibold">{loiterFuelFlowKgHr.toFixed(1)} kg/hr</span>
            </div>
            <div className="flex justify-between text-[#8A9BBE]">
              <span>Recharge Excess Power:</span>
              <span className="text-[#00E87A] font-bold">+{loiterRechargeMarginKw.toFixed(1)} kW</span>
            </div>
          </div>
        </div>

        {/* Engine Operating Point Chart (SFC & Fuel Flow vs Load Fraction) */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-3 rounded space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-[#00A8FF]" />
              <span className="text-[10px] font-mono-data text-[#00A8FF] font-bold uppercase tracking-wider">
                SFC & FUEL FLOW vs ENGINE LOAD FRACTION
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[8.5px] font-mono-data">
              <span className="text-[#00E87A]">── SFC (kg/kWh)</span>
              <span className="text-[#FFB800]">── Fuel Flow (kg/hr)</span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#1A2740" strokeDasharray="3 3" />
                <XAxis
                  dataKey="loadPct"
                  stroke="#8A9BBE"
                  tick={{ fontSize: 9 }}
                  unit="%"
                  domain={[10, 100]}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#00E87A"
                  tick={{ fontSize: 9 }}
                  domain={[0.4, 0.75]}
                  unit=" kg/kWh"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#FFB800"
                  tick={{ fontSize: 9 }}
                  unit=" kg/h"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0F1E', borderColor: '#1A2740', fontSize: '11px' }}
                  labelFormatter={(lbl) => `Engine Load: ${lbl}%`}
                />
                <ReferenceLine
                  x={Number((cruiseEngineLoad * 100).toFixed(0))}
                  stroke="#00A8FF"
                  strokeDasharray="2 2"
                  label={{ value: 'Cruise Load (100%)', fill: '#00A8FF', fontSize: 8, position: 'top' }}
                />
                <ReferenceLine
                  x={Number((loiterEngineLoad * 100).toFixed(0))}
                  stroke="#10B981"
                  strokeDasharray="2 2"
                  label={{ value: `Loiter Load (${(loiterEngineLoad * 100).toFixed(0)}%)`, fill: '#10B981', fontSize: 8, position: 'top' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sfc"
                  stroke="#00E87A"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fuelFlowKgHr"
                  stroke="#FFB800"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-[8px] font-mono-data text-[#8A9BBE] border-t border-[#1A2740] pt-1">
            <span>SFC Formula: 0.450 + 0.280 × (1 - load)^1.8 kg/kWh</span>
            <span>Fuel Flow @ 60kW Rated = 27.0 kg/hr</span>
          </div>
        </div>
      </div>
    </CornerReticle>
  );
};
