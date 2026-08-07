import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Edit2, 
  Check, 
  AlertTriangle, 
  Info, 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Wind, 
  Thermometer, 
  Maximize2,
  X,
  Compass,
  Gauge
} from 'lucide-react';
import { CornerReticle } from '../common/CornerReticle';
import { useGarunStore } from '../../store/useGarunStore';

export interface MissionSpecsState {
  missionType: string;
  objective: string;
  payloadType: string;
  payloadWeightKg: number;
  mtowKg: number;
  cruiseSpeedKmh: number;
  cruiseAltitudeM: number;
  loiterTimeHr: number;
  missionRadiusKm: number;
  takeoffDistanceM: number;
  ambientTempC: number;
  isaDeviationC: number;
  windKt: number;
  windDirectionDeg: number;
  batteryReservePct: number;
  fuelReservePct: number;
  engineRatingKw: number;
  engineType: string;
}

const DEFAULT_SPECS: MissionSpecsState = {
  missionType: 'ISR (Surveillance)',
  objective: 'Long Endurance Border Surveillance',
  payloadType: 'EO/IR + Synthetic Aperture Radar (SAR)',
  payloadWeightKg: 200,
  mtowKg: 1000,
  cruiseSpeedKmh: 250,
  cruiseAltitudeM: 6000,
  loiterTimeHr: 6.0,
  missionRadiusKm: 500,
  takeoffDistanceM: 450,
  ambientTempC: -20,
  isaDeviationC: 10,
  windKt: 15,
  windDirectionDeg: 270,
  batteryReservePct: 20,
  fuelReservePct: 15,
  engineRatingKw: 60,
  engineType: 'Turboshaft (Series Hybrid)',
};

const MISSION_PRESETS: { name: string; specs: MissionSpecsState }[] = [
  {
    name: 'Border ISR Baseline',
    specs: { ...DEFAULT_SPECS }
  },
  {
    name: 'High Alt Himalayan Patrol',
    specs: {
      ...DEFAULT_SPECS,
      missionType: 'High Altitude Recon',
      objective: 'Frontier Surveillance (Siachen Sector)',
      payloadType: 'Multi-Spectral EO/IR + SIGINT',
      cruiseAltitudeM: 8500,
      ambientTempC: -42,
      isaDeviationC: 5,
      windKt: 35,
      takeoffDistanceM: 650,
      loiterTimeHr: 8.0,
      batteryReservePct: 25,
      fuelReservePct: 20
    }
  },
  {
    name: 'Maritime Deep Patrol',
    specs: {
      ...DEFAULT_SPECS,
      missionType: 'Maritime Surveillance',
      objective: 'Indian Ocean Zone Reconnaissance',
      payloadType: 'Maritime Search Radar + AIS Receiver',
      missionRadiusKm: 800,
      cruiseSpeedKmh: 280,
      loiterTimeHr: 5.0,
      ambientTempC: 32,
      isaDeviationC: 15,
      windKt: 20,
      batteryReservePct: 18,
      fuelReservePct: 15
    }
  },
  {
    name: 'Tactical Armed Strike',
    specs: {
      ...DEFAULT_SPECS,
      missionType: 'Precision Strike',
      objective: 'Air Defense Suppression & Strike',
      payloadType: '2x Precision Guided Munitions + Targeting Pod',
      payloadWeightKg: 350,
      mtowKg: 1200,
      cruiseSpeedKmh: 310,
      loiterTimeHr: 3.5,
      missionRadiusKm: 350,
      batteryReservePct: 15,
      fuelReservePct: 12
    }
  }
];

export const MissionSpecsPanel: React.FC = () => {
  const { vehicleInputs, updateVehicleInputs, updateSimulationParams } = useGarunStore();
  const [specs, setSpecs] = useState<MissionSpecsState>({
    ...DEFAULT_SPECS,
    mtowKg: vehicleInputs.mtow_kg,
    payloadWeightKg: vehicleInputs.payload_kg,
    cruiseSpeedKmh: vehicleInputs.cruise_speed_kmh,
    cruiseAltitudeM: vehicleInputs.cruise_alt_m,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Helper field updater
  const updateField = <K extends keyof MissionSpecsState>(field: K, value: MissionSpecsState[K]) => {
    const nextValue = value;
    setSpecs(prev => ({ ...prev, [field]: nextValue }));

    if (field === 'mtowKg') {
      updateVehicleInputs({ mtow_kg: Number(nextValue) });
    }
    if (field === 'payloadWeightKg') {
      updateVehicleInputs({ payload_kg: Number(nextValue) });
      updateSimulationParams({ payloadKg: Number(nextValue) });
    }
    if (field === 'cruiseAltitudeM') {
      updateVehicleInputs({ cruise_alt_m: Number(nextValue) });
      updateSimulationParams({ cruiseAltitudeM: Number(nextValue) });
    }
    if (field === 'cruiseSpeedKmh') {
      updateVehicleInputs({ cruise_speed_kmh: Number(nextValue) });
    }
    if (field === 'ambientTempC') {
      updateSimulationParams({ ambientTempC: Number(nextValue) });
    }
  };

  // Live Calculations & Validation Engine
  const calculations = useMemo(() => {
    // 1. ISA Standard Temperature at Altitude (M)
    const isaStandardTemp = 15.0 - 0.0065 * specs.cruiseAltitudeM;
    const actualAmbientTemp = isaStandardTemp + specs.isaDeviationC;

    // 2. Air Density Ratio (Sigma) approximation
    const densityRatio = Math.pow(Math.max(0.1, 1 - 2.25577e-5 * specs.cruiseAltitudeM), 4.2561);
    const airDensityKgM3 = 1.225 * densityRatio;

    // 3. Transit & Total Mission Duration
    const transitTimeHr = (2 * specs.missionRadiusKm) / Math.max(50, specs.cruiseSpeedKmh);
    const totalFlightTimeHr = transitTimeHr + specs.loiterTimeHr;

    // 4. Estimated Fuel Consumption
    // Average cruise power ~ 65% engine rating, SFC ~ 0.215 kg/kWh
    const avgPowerKw = specs.engineRatingKw * 0.65;
    const estFuelMassKg = Math.round(totalFlightTimeHr * avgPowerKw * 0.215 * 1.15); // 15% margin
    const fuelReserveKg = Math.round(estFuelMassKg * (specs.fuelReservePct / 100));

    // 5. Total Takeoff Mass Check (Empty 520kg + Payload + Est Fuel + Battery 80kg)
    const baseEmptyWeightKg = 520;
    const batteryPackKg = 80;
    const calculatedTOW = baseEmptyWeightKg + batteryPackKg + specs.payloadWeightKg + estFuelMassKg;

    // 6. Validation Rule Checks
    const violations: { id: string; level: 'CRITICAL' | 'WARNING' | 'INFO'; msg: string }[] = [];

    if (calculatedTOW > specs.mtowKg) {
      violations.push({
        id: 'mtow_exceeded',
        level: 'CRITICAL',
        msg: `Calculated TOW (${calculatedTOW} kg) exceeds Maximum Takeoff Weight (${specs.mtowKg} kg) by ${calculatedTOW - specs.mtowKg} kg.`
      });
    }

    if (specs.cruiseAltitudeM > 9000) {
      violations.push({
        id: 'ceiling_exceeded',
        level: 'CRITICAL',
        msg: `Cruise Altitude (${specs.cruiseAltitudeM} m) exceeds Service Ceiling limit (9,000 m).`
      });
    }

    if (specs.batteryReservePct < 15) {
      violations.push({
        id: 'bat_reserve_low',
        level: 'WARNING',
        msg: `Battery Reserve (${specs.batteryReservePct}%) is below recommended safety limit (15%).`
      });
    }

    if (specs.fuelReservePct < 10) {
      violations.push({
        id: 'fuel_reserve_low',
        level: 'WARNING',
        msg: `Fuel Reserve (${specs.fuelReservePct}%) is below minimum ICAO contingency threshold (10%).`
      });
    }

    if (specs.ambientTempC > 50 || specs.ambientTempC < -45) {
      violations.push({
        id: 'thermal_envelope',
        level: 'WARNING',
        msg: `Ambient Temperature (${specs.ambientTempC}°C) is near thermal limit of operational envelope.`
      });
    }

    if (specs.takeoffDistanceM < 350) {
      violations.push({
        id: 'short_field_runway',
        level: 'INFO',
        msg: `Takeoff Run (${specs.takeoffDistanceM} m) requires short-field takeoff procedure.`
      });
    }

    const isMissionNominal = violations.filter(v => v.level === 'CRITICAL').length === 0;

    return {
      isaStandardTemp,
      actualAmbientTemp,
      densityRatio,
      airDensityKgM3,
      transitTimeHr,
      totalFlightTimeHr,
      estFuelMassKg,
      fuelReserveKg,
      calculatedTOW,
      violations,
      isMissionNominal
    };
  }, [specs]);

  return (
    <CornerReticle className="h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] relative">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header with EDIT & VALIDATION REPORT buttons */}
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-[#00A8FF]" />
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider">
              MISSION SPECIFICATIONS
            </h2>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowReportModal(true)}
              className="p-1 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-[#00A8FF] transition-colors"
              title="Expand Full Mission Validation Matrix"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`text-[10px] font-mono-data uppercase px-2 py-0.5 rounded flex items-center space-x-1 border transition-all ${
                isEditing
                  ? 'bg-[#00E87A]/15 text-[#00E87A] border-[#00E87A]/40'
                  : 'bg-[#00A8FF]/15 text-[#00A8FF] border-[#00A8FF]/40 hover:bg-[#00A8FF]/30'
              }`}
            >
              {isEditing ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
              <span>{isEditing ? 'SAVE' : 'EDIT'}</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Bar (Quick Switch) */}
        {isEditing && (
          <div className="mb-2 pb-2 border-b border-[#1A2740] flex-shrink-0">
            <label className="text-[9.5px] font-mono-data text-[#8A9BBE] block uppercase mb-1">
              LOAD QUICK MISSION PRESET:
            </label>
            <select
              onChange={(e) => {
                const preset = MISSION_PRESETS.find(p => p.name === e.target.value);
                if (preset) {
                  setSpecs({ ...preset.specs });
                  updateSimulationParams({
                    payloadKg: preset.specs.payloadWeightKg,
                    cruiseAltitudeM: preset.specs.cruiseAltitudeM,
                    ambientTempC: preset.specs.ambientTempC,
                  });
                }
              }}
              className="w-full bg-[#172236] border border-[#1F2D45] text-[#00A8FF] text-[10.5px] font-sans-ui rounded p-1 focus:outline-none focus:border-[#00A8FF]"
            >
              {MISSION_PRESETS.map((p, idx) => (
                <option key={idx} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Operational Status & Validation Badge */}
        <div className={`p-1.5 rounded border mb-2 text-[10.5px] font-mono-data flex items-center justify-between flex-shrink-0 ${
          calculations.isMissionNominal
            ? 'bg-[#00E87A]/10 border-[#00E87A]/30 text-[#00E87A]'
            : 'bg-[#FF3B30]/15 border-[#FF3B30]/40 text-[#FF3B30]'
        }`}>
          <div className="flex items-center space-x-1.5">
            {calculations.isMissionNominal ? (
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-pulse" />
            )}
            <span className="font-bold uppercase tracking-wide">
              {calculations.isMissionNominal ? 'MISSION FEASIBLE' : 'CONSTRAINTS VIOLATED'}
            </span>
          </div>
          <span className="text-[9.5px] text-[#8A9BBE]">
            {calculations.violations.length} {calculations.violations.length === 1 ? 'CHECK' : 'CHECKS'}
          </span>
        </div>

        {/* Fields List View / Edit View */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 text-[11px] font-sans-ui">
          {/* 1. Mission Type */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Mission Type</span>
            {isEditing ? (
              <input
                type="text"
                value={specs.missionType}
                onChange={(e) => updateField('missionType', e.target.value)}
                className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-32 text-right focus:border-[#00A8FF] outline-none"
              />
            ) : (
              <span className="font-mono-data font-semibold text-[#00A8FF]">{specs.missionType}</span>
            )}
          </div>

          {/* 2. Objective */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Objective</span>
            {isEditing ? (
              <input
                type="text"
                value={specs.objective}
                onChange={(e) => updateField('objective', e.target.value)}
                className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-36 text-right focus:border-[#00A8FF] outline-none"
              />
            ) : (
              <span className="font-mono-data text-[#E8EDF7] truncate max-w-[130px]">{specs.objective}</span>
            )}
          </div>

          {/* 3. Payload */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Payload Suite</span>
            {isEditing ? (
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={specs.payloadType}
                  onChange={(e) => updateField('payloadType', e.target.value)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1 py-0.5 text-[10px] border border-[#1F2D45] rounded w-24 text-right outline-none"
                />
                <input
                  type="number"
                  value={specs.payloadWeightKg}
                  onChange={(e) => updateField('payloadWeightKg', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#00A8FF] font-mono-data px-1 py-0.5 text-[10px] border border-[#1F2D45] rounded w-12 text-right outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px] self-center">kg</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7] truncate max-w-[130px]">
                {specs.payloadType} ({specs.payloadWeightKg}kg)
              </span>
            )}
          </div>

          {/* 4. MTOW */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">MTOW Rating</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.mtowKg}
                  onChange={(e) => updateField('mtowKg', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">kg</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">{specs.mtowKg} kg</span>
            )}
          </div>

          {/* 5. Cruise Speed */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Cruise Speed</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.cruiseSpeedKmh}
                  onChange={(e) => updateField('cruiseSpeedKmh', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">km/h</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">{specs.cruiseSpeedKmh} km/h</span>
            )}
          </div>

          {/* 6. Cruise Altitude */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Cruise Altitude</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.cruiseAltitudeM}
                  onChange={(e) => updateField('cruiseAltitudeM', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">m</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">{specs.cruiseAltitudeM.toLocaleString()} m</span>
            )}
          </div>

          {/* 7. Loiter Time */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Loiter Time</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.5"
                  value={specs.loiterTimeHr}
                  onChange={(e) => updateField('loiterTimeHr', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">hr</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#FFB800] font-semibold">{specs.loiterTimeHr} hr</span>
            )}
          </div>

          {/* 8. Mission Radius */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Mission Radius</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.missionRadiusKm}
                  onChange={(e) => updateField('missionRadiusKm', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">km</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#00E87A] font-semibold">{specs.missionRadiusKm} km</span>
            )}
          </div>

          {/* 9. Takeoff Distance */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Takeoff Distance</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.takeoffDistanceM}
                  onChange={(e) => updateField('takeoffDistanceM', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">m</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">{specs.takeoffDistanceM} m</span>
            )}
          </div>

          {/* 10. Ambient Temperature */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Ambient Temperature</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.ambientTempC}
                  onChange={(e) => updateField('ambientTempC', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">°C</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">{specs.ambientTempC} °C</span>
            )}
          </div>

          {/* 11. ISA Deviation */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">ISA Deviation</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.isaDeviationC}
                  onChange={(e) => updateField('isaDeviationC', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">°C</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">
                {specs.isaDeviationC >= 0 ? `+${specs.isaDeviationC}` : specs.isaDeviationC} °C
              </span>
            )}
          </div>

          {/* 12. Wind Speed & Vector */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Wind Vector</span>
            {isEditing ? (
              <div className="flex space-x-1">
                <input
                  type="number"
                  value={specs.windKt}
                  onChange={(e) => updateField('windKt', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1 py-0.5 text-[10px] border border-[#1F2D45] rounded w-12 text-right outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px] self-center">kt /</span>
                <input
                  type="number"
                  value={specs.windDirectionDeg}
                  onChange={(e) => updateField('windDirectionDeg', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1 py-0.5 text-[10px] border border-[#1F2D45] rounded w-12 text-right outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px] self-center">°</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">
                {specs.windKt} kt / {specs.windDirectionDeg}°
              </span>
            )}
          </div>

          {/* 13. Battery Reserve */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Battery Reserve</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.batteryReservePct}
                  onChange={(e) => updateField('batteryReservePct', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#00E87A] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">%</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#00E87A] font-semibold">{specs.batteryReservePct} %</span>
            )}
          </div>

          {/* 14. Fuel Reserve */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Fuel Reserve</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.fuelReservePct}
                  onChange={(e) => updateField('fuelReservePct', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#00E87A] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-20 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">%</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#00E87A] font-semibold">{specs.fuelReservePct} %</span>
            )}
          </div>

          {/* 15. Engine Rating */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2740]/60">
            <span className="text-[#8A9BBE]">Engine Power Rating</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={specs.engineRatingKw}
                  onChange={(e) => updateField('engineRatingKw', parseFloat(e.target.value) || 0)}
                  className="bg-[#172236] text-[#E8EDF7] font-mono-data px-1.5 py-0.5 text-[10.5px] border border-[#1F2D45] rounded w-16 text-right focus:border-[#00A8FF] outline-none"
                />
                <span className="text-[#8A9BBE] text-[10px]">kW</span>
              </div>
            ) : (
              <span className="font-mono-data text-[#E8EDF7]">{specs.engineRatingKw} kW ({specs.engineType})</span>
            )}
          </div>

          {/* 16. Safety Constraints Status */}
          <div className="flex items-center justify-between py-1">
            <span className="text-[#8A9BBE]">Safety Constraints</span>
            <span className={`font-mono-data font-bold text-[10.5px] ${
              calculations.isMissionNominal ? 'text-[#00E87A]' : 'text-[#FF3B30]'
            }`}>
              {calculations.isMissionNominal ? 'ALL NOMINAL' : 'LIMIT VIOLATION'}
            </span>
          </div>
        </div>

        {/* Live Calculation Derived Summary Strip */}
        <div className="pt-2 border-t border-[#1A2740] mt-2 bg-[#0A0F1E]/60 p-2 rounded text-[9.5px] font-mono-data space-y-1 flex-shrink-0">
          <div className="flex justify-between text-[#8A9BBE]">
            <span>EST FLIGHT TIME:</span>
            <span className="text-[#E8EDF7] font-bold">{calculations.totalFlightTimeHr.toFixed(1)} hrs</span>
          </div>
          <div className="flex justify-between text-[#8A9BBE]">
            <span>EST FUEL NEEDED:</span>
            <span className="text-[#00A8FF] font-bold">{calculations.estFuelMassKg} kg</span>
          </div>
          <div className="flex justify-between text-[#8A9BBE]">
            <span>CALCULATED TOW:</span>
            <span className={calculations.calculatedTOW > specs.mtowKg ? 'text-[#FF3B30] font-bold' : 'text-[#00E87A]'}>
              {calculations.calculatedTOW} kg / {specs.mtowKg} kg
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Validation Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-[#1F2D45] rounded-lg w-full max-w-2xl p-4 shadow-2xl flex flex-col space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F2D45] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#00A8FF]" />
                <div>
                  <h2 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
                    MISSION FEASIBILITY & SAFETY CONSTRAINT MATRIX
                  </h2>
                  <p className="text-[10px] font-mono-data text-[#8A9BBE]">
                    AEROSPACE ENGINE, MASS & AERODYNAMIC VALIDATION ENGINE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded bg-[#172236] text-[#8A9BBE] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Environmental & Density Calculations */}
            <div className="grid grid-cols-3 gap-2 bg-[#111A2E] p-3 rounded border border-[#1A2740] text-xs font-mono-data">
              <div>
                <span className="text-[#8A9BBE] text-[9.5px] block uppercase">ISA TEMP AT ALTITUDE</span>
                <span className="text-[#00A8FF] font-bold text-sm">
                  {calculations.actualAmbientTemp.toFixed(1)} °C
                </span>
                <span className="text-[9px] text-[#8A9BBE] block">(Std: {calculations.isaStandardTemp.toFixed(1)}°C)</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9.5px] block uppercase">AIR DENSITY RATIO (σ)</span>
                <span className="text-[#00E87A] font-bold text-sm">
                  {calculations.densityRatio.toFixed(3)}
                </span>
                <span className="text-[9px] text-[#8A9BBE] block">({calculations.airDensityKgM3.toFixed(3)} kg/m³)</span>
              </div>
              <div>
                <span className="text-[#8A9BBE] text-[9.5px] block uppercase">CALCULATED TAKEOFF MASS</span>
                <span className={`font-bold text-sm ${
                  calculations.calculatedTOW > specs.mtowKg ? 'text-[#FF3B30]' : 'text-[#00E87A]'
                }`}>
                  {calculations.calculatedTOW} kg
                </span>
                <span className="text-[9px] text-[#8A9BBE] block">(MTOW Limit: {specs.mtowKg} kg)</span>
              </div>
            </div>

            {/* Validation Checks Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider">
                CONSTRAINT COMPLIANCE CHECKS
              </h3>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {calculations.violations.length === 0 ? (
                  <div className="p-3 bg-[#00E87A]/10 border border-[#00E87A]/30 rounded text-[#00E87A] font-mono-data flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00E87A]" />
                    <span>All 6 safety, aerodynamic & propulsion constraints are fully compliant. Mission ready!</span>
                  </div>
                ) : (
                  calculations.violations.map((v) => (
                    <div
                      key={v.id}
                      className={`p-2.5 rounded border font-mono-data text-[11px] flex items-start space-x-2 ${
                        v.level === 'CRITICAL'
                          ? 'bg-[#FF3B30]/15 border-[#FF3B30]/40 text-[#FF3B30]'
                          : v.level === 'WARNING'
                          ? 'bg-[#FFB800]/15 border-[#FFB800]/40 text-[#FFB800]'
                          : 'bg-[#00A8FF]/15 border-[#00A8FF]/40 text-[#00A8FF]'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase mr-2">[{v.level}]</span>
                        <span>{v.msg}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#1F2D45] flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-[#00A8FF] hover:bg-[#0088CC] text-white font-sans-ui font-bold text-xs uppercase px-4 py-2 rounded"
              >
                CLOSE VALIDATION MATRIX
              </button>
            </div>
          </div>
        </div>
      )}
    </CornerReticle>
  );
};
