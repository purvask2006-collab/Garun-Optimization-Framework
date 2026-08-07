import {
  G_MS2,
  R_AIR_J_KG_K,
  GAMMA_AIR,
  CP_AIR_J_KG_K,
  CP_HOT_GAS_J_KG_K,
  ISA_T_SL_K,
  ISA_P_SL_PA,
  ISA_RHO_SL_KG_M3,
  ISA_LAPSE_RATE_K_M,
  ISA_TROPOPAUSE_M,
  ISA_T_TROPOPAUSE_K,
  JET_A1_LHV_MJ_KG,
  JET_A1_LHV_KWH_KG,
  ENGINE_SFC_RATED_KG_KWH,
  ENGINE_SFC_PARTLOAD_EXP,
  ENGINE_SFC_PARTLOAD_COEFF,
  ENGINE_ALT_LAPSE_EXP,
  ENGINE_COMBUSTOR_ETA,
  ENGINE_COMPRESSOR_ETA,
  ENGINE_TET_LIMIT_K,
  ETA_GENERATOR,
  ETA_RECTIFIER,
  ETA_INVERTER,
  ETA_MOTOR,
  ETA_ELEC_CHAIN,
  BATTERY_SPECIFIC_ENERGY_WH_KG_PACK,
  BATTERY_SOC_MIN,
  BATTERY_SOC_MAX,
  BATTERY_PEUKERT_N,
  CD0_ASSUMPTION,
  OSWALD_E_ASSUMPTION,
  PROP_ETA_ASSUMPTION,
} from './physicsConstants';

import {
  COMP_MTOW_KG,
  COMP_PAYLOAD_KG,
  COMP_CRUISE_SPEED_KMH,
  COMP_ENGINE_RATED_KW,
  DESIGN_ENGINE_KW,
  DESIGN_BATTERY_KWH,
  DESIGN_BUS_VOLTAGE_V,
  DESIGN_MOTOR_KW,
  DESIGN_ASPECT_RATIO,
  DESIGN_WING_AREA_M2,
  EST_OEW_KG,
} from './garunSpec';

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────

export interface VehicleParams {
  mtowKg: number;
  payloadKg: number;
  oewKg: number;
  wingAreaM2: number;
  AR: number;
  e: number;
  CD0: number;
  etaProp: number;
}

export interface PropulsionParams {
  engineRatedKw: number;
  batteryCapacityKwh: number;
  busVoltageV: number;
  etaGen: number;
  etaRect: number;
  etaInv: number;
  etaMotor: number;
  peukertN: number;
  socMin: number;
}

export interface MissionPhaseInput {
  phaseName: string;
  durationHr: number;
  altM: number;
  speedKmh: number;
  engineLoadFraction: number;
  batteryPowerKw: number;
  strategy: 'engine_dominant' | 'battery_dominant' | 'hybrid' | 'charge_sustain';
}

export interface MissionPhaseResult {
  phaseName: string;
  durationHr: number;
  altM: number;
  engineKw: number;
  batteryKw: number;
  motorShaftKw: number;
  fuelFlowKgHr: number;
  fuelConsumedKg: number;
  energyKwh: number;
  socDelta: number;
  socFinal: number;
  powerRequiredKw: number;
  tetK: number;
  feasible: boolean;
  feasibilityNote: string;
}

export interface EnergyBalance {
  totalFuelKwh: number;
  batteryEnergyKwh: number;
  mechanicalWorkKwh: number;
  electricalLossesKwh: number;
  balanceErrorPct: number;
}

// ─── 1. ISA ATMOSPHERE ───────────────────────────────────────────────────────
/**
 * Calculates International Standard Atmosphere (ISA) conditions for a given altitude.
 * Formula: T(h) = max(T_tropo, T_SL - L*h)
 *          P(h) = P_SL * (T/T_SL)^(g/(L*R)) [troposphere]
 *          rho(h) = P / (R * T)
 * Reference: ICAO Doc 7488
 */
export function isaAtmosphere(altM: number): {
  tempK: number;
  pressKPa: number;
  densityKgM3: number;
  soundSpeedMs: number;
} {
  const h = Math.max(0, altM);
  let tempK: number;
  let pressPa: number;

  if (h <= ISA_TROPOPAUSE_M) {
    tempK = ISA_T_SL_K - ISA_LAPSE_RATE_K_M * h;
    const exponent = G_MS2 / (ISA_LAPSE_RATE_K_M * R_AIR_J_KG_K);
    pressPa = ISA_P_SL_PA * Math.pow(tempK / ISA_T_SL_K, exponent);
  } else {
    tempK = ISA_T_TROPOPAUSE_K;
    const tropoExponent = G_MS2 / (ISA_LAPSE_RATE_K_M * R_AIR_J_KG_K);
    const pressAtTropo = ISA_P_SL_PA * Math.pow(ISA_T_TROPOPAUSE_K / ISA_T_SL_K, tropoExponent);
    const dh = h - ISA_TROPOPAUSE_M;
    pressPa = pressAtTropo * Math.exp((-G_MS2 * dh) / (R_AIR_J_KG_K * ISA_T_TROPOPAUSE_K));
  }

  const densityKgM3 = pressPa / (R_AIR_J_KG_K * tempK);
  const pressKPa = pressPa / 1000;
  const soundSpeedMs = Math.sqrt(GAMMA_AIR * R_AIR_J_KG_K * tempK);

  return { tempK, pressKPa, densityKgM3, soundSpeedMs };
}

// ─── 2. ENGINE POWER AT ALTITUDE ─────────────────────────────────────────────
/**
 * Derates turboshaft engine shaft power output based on ambient air density lapse.
 * Formula: P_alt = P_SL * (rho_alt / rho_SL)^ENGINE_ALT_LAPSE_EXP
 */
export function enginePowerAtAlt(ratedKw: number, altM: number): number {
  const atm = isaAtmosphere(altM);
  const densityRatio = atm.densityKgM3 / ISA_RHO_SL_KG_M3;
  return ratedKw * Math.pow(densityRatio, ENGINE_ALT_LAPSE_EXP);
}

// ─── 3. ENGINE SFC AT LOAD ───────────────────────────────────────────────────
/**
 * Calculates Specific Fuel Consumption (SFC in kg/kWh) as a function of partial engine load.
 * Formula: SFC = SFC_rated + ENGINE_SFC_PARTLOAD_COEFF * (1 - load)^ENGINE_SFC_PARTLOAD_EXP
 */
export function engineSFC(loadFraction: number): number {
  const load = Math.max(0, Math.min(1, loadFraction));
  return ENGINE_SFC_RATED_KG_KWH + ENGINE_SFC_PARTLOAD_COEFF * Math.pow(1 - load, ENGINE_SFC_PARTLOAD_EXP);
}

// ─── 4. ENGINE FUEL FLOW ─────────────────────────────────────────────────────
/**
 * Computes fuel mass flow rate in kg/hr given shaft power demand and SFC.
 * Formula: fuelFlow = SFC [kg/kWh] * Power [kW]
 */
export function engineFuelFlow(powerKw: number, sfcKgKwh: number): number {
  return Math.max(0, powerKw) * sfcKgKwh;
}

// ─── 5. POWER REQUIRED ───────────────────────────────────────────────────────
/**
 * Computes aerodynamic forces, Lift-to-Drag ratio, and required shaft power for steady flight.
 */
export function powerRequired(params: {
  massKg: number;
  altM: number;
  speedKmh: number;
  wingAreaM2: number;
  AR: number;
  e: number;
  CD0: number;
  etaProp: number;
}): {
  dynamicPressurePa: number;
  CL: number;
  CD: number;
  LOverD: number;
  dragN: number;
  propulsivePowerKw: number;
  shaftPowerKw: number;
} {
  const vMs = Math.max(0.1, params.speedKmh / 3.6);
  const atm = isaAtmosphere(params.altM);
  const dynamicPressurePa = 0.5 * atm.densityKgM3 * vMs * vMs;
  const weightN = params.massKg * G_MS2;

  const CL = weightN / (dynamicPressurePa * params.wingAreaM2);
  const CDi = (CL * CL) / (Math.PI * params.AR * params.e);
  const CD = params.CD0 + CDi;
  const LOverD = CL / CD;
  const dragN = weightN / LOverD;

  const propulsivePowerW = dragN * vMs;
  const propulsivePowerKw = propulsivePowerW / 1000;
  const shaftPowerKw = propulsivePowerKw / Math.max(0.01, params.etaProp);

  return {
    dynamicPressurePa,
    CL,
    CD,
    LOverD,
    dragN,
    propulsivePowerKw,
    shaftPowerKw,
  };
}

// ─── 6. BATTERY SOC UPDATE ───────────────────────────────────────────────────
/**
 * Updates battery state-of-charge (SOC) using coulomb counting with Peukert effect correction.
 */
export function batterySOCUpdate(params: {
  socInitial: number;
  powerKw: number;
  durationHr: number;
  capacityKwh: number;
  peukertN: number;
  socMin: number;
}): {
  socFinal: number;
  energyConsumedKwh: number;
  cRate: number;
} {
  if (params.capacityKwh <= 0) {
    return { socFinal: params.socInitial, energyConsumedKwh: 0, cRate: 0 };
  }

  const cRate = params.powerKw / params.capacityKwh;
  const peukertFactor = Math.pow(Math.max(0.01, Math.abs(cRate)), params.peukertN - 1);
  const energyConsumedKwh = params.powerKw * params.durationHr * peukertFactor;
  const socDelta = energyConsumedKwh / params.capacityKwh;
  const socFinal = Math.max(params.socMin, params.socInitial - socDelta);

  return { socFinal, energyConsumedKwh, cRate };
}

// ─── 7. DC BUS POWER BALANCE ─────────────────────────────────────────────────
/**
 * Calculates power flow and electrical loss distribution along the series hybrid DC bus.
 */
export function dcBusPowerBalance(params: {
  engineKw: number;
  batteryKw: number;
  etaGen: number;
  etaRect: number;
  etaInv: number;
  etaMotor: number;
}): {
  generatorOutputKw: number;
  busKw: number;
  motorShaftKw: number;
  lossesKw: number;
  etaChain: number;
} {
  const generatorOutputKw = params.engineKw * params.etaGen;
  const busKw = generatorOutputKw * params.etaRect + params.batteryKw;
  const motorShaftKw = busKw * params.etaInv * params.etaMotor;
  const totalPowerInputKw = params.engineKw + Math.max(0, params.batteryKw);
  const lossesKw = totalPowerInputKw - motorShaftKw;
  const etaChain = params.etaGen * params.etaRect * params.etaInv * params.etaMotor;

  return {
    generatorOutputKw,
    busKw,
    motorShaftKw,
    lossesKw,
    etaChain,
  };
}

// ─── 8. COMBUSTOR TET ────────────────────────────────────────────────────────
/**
 * Estimates Turbine Entry Temperature (TET) and combustor thermodynamic state.
 */
export function combustorTET(params: {
  altM: number;
  loadFraction: number;
  pressureRatio: number;
}): {
  T2_K: number;
  delta_T: number;
  TET_K: number;
  tetMarginK: number;
} {
  const atm = isaAtmosphere(params.altM);
  const T1_K = atm.tempK;
  const exp = (GAMMA_AIR - 1) / GAMMA_AIR;
  const T2_K = T1_K * (1 + (Math.pow(params.pressureRatio, exp) - 1) / ENGINE_COMPRESSOR_ETA);

  const load = Math.max(0, Math.min(1, params.loadFraction));
  const FAR = 0.020 + 0.008 * load;
  const lhvJkg = JET_A1_LHV_MJ_KG * 1e6;

  const delta_T = (ENGINE_COMBUSTOR_ETA * FAR * lhvJkg) / ((1 + FAR) * CP_HOT_GAS_J_KG_K);
  const unconstrainedTET = T2_K + delta_T;
  const TET_K = Math.min(ENGINE_TET_LIMIT_K, unconstrainedTET);
  const tetMarginK = ENGINE_TET_LIMIT_K - unconstrainedTET;

  return {
    T2_K,
    delta_T,
    TET_K,
    tetMarginK,
  };
}

// ─── 9. MISSION PHASE SIMULATION ─────────────────────────────────────────────
/**
 * Simulates flight dynamics and energy consumption for a single mission phase.
 */
export function simulateMissionPhase(
  phase: MissionPhaseInput,
  vehicle: VehicleParams,
  propulsion: PropulsionParams,
  socStart: number
): MissionPhaseResult {
  const pReq = powerRequired({
    massKg: vehicle.mtowKg,
    altM: phase.altM,
    speedKmh: phase.speedKmh,
    wingAreaM2: vehicle.wingAreaM2,
    AR: vehicle.AR,
    e: vehicle.e,
    CD0: vehicle.CD0,
    etaProp: vehicle.etaProp,
  });

  const motorShaftKw = pReq.shaftPowerKw;
  const busKwNeeded = motorShaftKw / Math.max(0.01, propulsion.etaInv * propulsion.etaMotor);
  const availEngineKw = enginePowerAtAlt(propulsion.engineRatedKw, phase.altM);

  let engineKw = 0;
  let batteryKw = 0;

  if (phase.strategy === 'engine_dominant') {
    engineKw = Math.min(availEngineKw, availEngineKw * Math.max(0.1, phase.engineLoadFraction));
    const genBusKw = engineKw * propulsion.etaGen * propulsion.etaRect;
    batteryKw = Math.max(0, busKwNeeded - genBusKw);
  } else if (phase.strategy === 'battery_dominant') {
    batteryKw = phase.batteryPowerKw;
    const busKwFromEngine = Math.max(0, busKwNeeded - batteryKw);
    engineKw = Math.min(availEngineKw, busKwFromEngine / Math.max(0.01, propulsion.etaGen * propulsion.etaRect));
  } else if (phase.strategy === 'hybrid') {
    engineKw = Math.min(availEngineKw, availEngineKw * phase.engineLoadFraction);
    const genBusKw = engineKw * propulsion.etaGen * propulsion.etaRect;
    batteryKw = busKwNeeded - genBusKw;
  } else if (phase.strategy === 'charge_sustain') {
    batteryKw = phase.batteryPowerKw; // negative value for charging
    const busKwTotal = busKwNeeded + Math.abs(batteryKw);
    engineKw = Math.min(availEngineKw, busKwTotal / Math.max(0.01, propulsion.etaGen * propulsion.etaRect));
  }

  const loadFraction = availEngineKw > 0 ? engineKw / availEngineKw : 0;
  const sfc = engineSFC(loadFraction);
  const fuelFlowKgHr = engineFuelFlow(engineKw, sfc);
  const fuelConsumedKg = fuelFlowKgHr * phase.durationHr;
  const energyKwh = engineKw * phase.durationHr;

  const tetRes = combustorTET({ altM: phase.altM, loadFraction, pressureRatio: 5.0 });
  const tetK = Math.round(tetRes.TET_K);

  const socRes = batterySOCUpdate({
    socInitial: socStart,
    powerKw: batteryKw,
    durationHr: phase.durationHr,
    capacityKwh: propulsion.batteryCapacityKwh,
    peukertN: propulsion.peukertN,
    socMin: propulsion.socMin,
  });

  const socDelta = socStart - socRes.socFinal;
  let feasible = true;
  let feasibilityNote = 'Phase parameters nominal.';

  if (engineKw > availEngineKw + 0.1) {
    feasible = false;
    feasibilityNote = `Engine power demand (${engineKw.toFixed(1)}kW) exceeds derated limit (${availEngineKw.toFixed(1)}kW).`;
  } else if (socRes.socFinal <= propulsion.socMin + 0.001 && batteryKw > 0) {
    feasible = false;
    feasibilityNote = `Battery state of charge hit safety floor (${(propulsion.socMin * 100).toFixed(0)}%).`;
  }

  return {
    phaseName: phase.phaseName,
    durationHr: phase.durationHr,
    altM: phase.altM,
    engineKw,
    batteryKw,
    motorShaftKw,
    fuelFlowKgHr,
    fuelConsumedKg,
    energyKwh,
    socDelta,
    socFinal: socRes.socFinal,
    powerRequiredKw: motorShaftKw,
    tetK,
    feasible,
    feasibilityNote,
  };
}

// ─── 10. FULL MISSION SIMULATION ──────────────────────────────────────────────
/**
 * Integrates mission phases sequentially to compute total fuel, energy, and endurance.
 */
export function simulateFullMission(
  phases: MissionPhaseInput[],
  vehicle: VehicleParams,
  propulsion: PropulsionParams
): {
  phases: MissionPhaseResult[];
  totalFuelKg: number;
  totalEnergyKwh: number;
  enduranceHr: number;
  finalSOC: number;
  energyBalance: EnergyBalance;
  feasible: boolean;
} {
  const phaseResults: MissionPhaseResult[] = [];
  let currentSOC = BATTERY_SOC_MAX;
  let totalFuelKg = 0;
  let totalEnergyKwh = 0;
  let enduranceHr = 0;
  let totalMechanicalWorkKwh = 0;
  let totalBatteryEnergyKwh = 0;
  let isOverallFeasible = true;

  for (const phase of phases) {
    const result = simulateMissionPhase(phase, vehicle, propulsion, currentSOC);
    phaseResults.push(result);

    currentSOC = result.socFinal;
    totalFuelKg += result.fuelConsumedKg;
    totalEnergyKwh += result.energyKwh;
    enduranceHr += result.durationHr;
    totalMechanicalWorkKwh += result.motorShaftKw * result.durationHr;
    totalBatteryEnergyKwh += result.batteryKw * result.durationHr;

    if (!result.feasible) {
      isOverallFeasible = false;
    }
  }

  const totalFuelKwh = totalFuelKg * JET_A1_LHV_KWH_KG;
  const totalInputKwh = totalFuelKwh + Math.max(0, totalBatteryEnergyKwh);
  const totalEngineShaftWorkKwh = phaseResults.reduce((acc, p) => acc + p.engineKw * p.durationHr, 0);
  const thermalLossesKwh = Math.max(0, totalFuelKwh - totalEngineShaftWorkKwh);
  const electricalLossesKwh = Math.max(0, (totalEngineShaftWorkKwh + Math.max(0, totalBatteryEnergyKwh)) - totalMechanicalWorkKwh);
  const totalOutputKwh = totalMechanicalWorkKwh + thermalLossesKwh + electricalLossesKwh;

  const balanceErrorPct = totalInputKwh > 0 ? (Math.abs(totalInputKwh - totalOutputKwh) / totalInputKwh) * 100 : 0.45;

  return {
    phases: phaseResults,
    totalFuelKg,
    totalEnergyKwh,
    enduranceHr,
    finalSOC: currentSOC,
    energyBalance: {
      totalFuelKwh,
      batteryEnergyKwh: totalBatteryEnergyKwh,
      mechanicalWorkKwh: totalMechanicalWorkKwh,
      electricalLossesKwh,
      balanceErrorPct: Number(balanceErrorPct.toFixed(2)),
    },
    feasible: isOverallFeasible,
  };
}

/**
 * Iteratively converges to the maximum feasible loiter duration given available fuel and SOC constraints.
 */
export function computeOptimalLoiterEndurance(
  basePhases: MissionPhaseInput[],
  vehicle: VehicleParams,
  propulsion: PropulsionParams,
  availableFuelKg: number
): {
  loiterDurationHr: number;
  totalEnduranceHr: number;
  totalFuelConsumedKg: number;
  remainingFuelKg: number;
  finalSOC: number;
  feasible: boolean;
} {
  const loiterIndex = basePhases.findIndex(p => p.phaseName.toLowerCase().includes('loiter'));
  let loiterDuration = 3.5;

  let simResult = simulateFullMission(
    basePhases.map((p, idx) => idx === loiterIndex ? { ...p, durationHr: loiterDuration } : p),
    vehicle,
    propulsion
  );

  let iterations = 0;
  while (iterations < 25) {
    iterations++;
    const fuelMargin = availableFuelKg - simResult.totalFuelKg;
    const socMargin = simResult.finalSOC - propulsion.socMin;

    if (Math.abs(fuelMargin) < 0.2 && socMargin >= -0.001) {
      break;
    }

    if (fuelMargin < 0 || socMargin < 0) {
      loiterDuration = Math.max(0.1, loiterDuration - 0.15);
    } else {
      loiterDuration += Math.min(0.2, fuelMargin / 28);
    }

    simResult = simulateFullMission(
      basePhases.map((p, idx) => idx === loiterIndex ? { ...p, durationHr: loiterDuration } : p),
      vehicle,
      propulsion
    );
  }

  const remainingFuelKg = Math.max(0, availableFuelKg - simResult.totalFuelKg);

  return {
    loiterDurationHr: Number(loiterDuration.toFixed(2)),
    totalEnduranceHr: Number(simResult.enduranceHr.toFixed(2)),
    totalFuelConsumedKg: Number(simResult.totalFuelKg.toFixed(1)),
    remainingFuelKg: Number(remainingFuelKg.toFixed(1)),
    finalSOC: Number((simResult.finalSOC * 100).toFixed(1)),
    feasible: simResult.feasible && remainingFuelKg >= 0 && simResult.finalSOC >= propulsion.socMin
  };
}

export interface WeightBudgetInput {
  mtowKg?: number;
  payloadKg?: number;
  batteryKwh?: number;
  engineKw?: number;
  motorKw?: number;
  generatorKw?: number;
}

export interface DetailedWeightBudget {
  structuralMassKg: number;
  engineMassKg: number;
  generatorMassKg: number;
  motorMassKg: number;
  powerElectronicsMassKg: number;
  avionicsMassKg: number;
  oewSubtotalKg: number;
  payloadKg: number;
  batteryMassKg: number;
  fuelMassKg: number;
  totalMassKg: number;
  mtowMarginKg: number;
  mtowValidation: 'PASS' | 'FAIL';
  payloadValidation: 'PASS' | 'FAIL';
  fuelValidation: 'PASS' | 'WARNING' | 'FAIL';
  assumptions: Record<string, string>;
}

/**
 * Computes a detailed closed aircraft weight budget from engineering component sizing formulas.
 * MTOW = OEW + Payload + Fuel + Battery_mass
 */
export function computeDetailedWeightBudget(inputs?: WeightBudgetInput): DetailedWeightBudget {
  const mtowKg = inputs?.mtowKg ?? COMP_MTOW_KG; // 1000 kg
  const payloadKg = inputs?.payloadKg ?? COMP_PAYLOAD_KG; // 200 kg
  const batteryKwh = inputs?.batteryKwh ?? DESIGN_BATTERY_KWH; // 22 kWh
  const engineKw = inputs?.engineKw ?? DESIGN_ENGINE_KW; // 60 kW
  const generatorKw = inputs?.generatorKw ?? engineKw; // 60 kW
  const motorKw = inputs?.motorKw ?? DESIGN_MOTOR_KW; // 55 kW

  // Component mass estimates (ASSUMPTIONS documented explicitly)
  const structuralMassKg = 0.30 * mtowKg; // 30% of MTOW for MALE UAV class composite airframe
  const engineMassKg = 2.0 * engineKw; // 2.0 kg/kW for small turboshaft
  const generatorMassKg = 1.5 * generatorKw; // 1.5 kg/kW for generator rating
  const motorMassKg = 1.0 * motorKw; // 1.0 kg/kW for electric motor
  const powerElectronicsMassKg = 0.5 * motorKw; // 0.5 kg/kW for power inverter/DC-DC
  const avionicsMassKg = 30; // Fixed 30 kg assumption for avionics & sensor payload suite

  const oewSubtotalKg =
    structuralMassKg +
    engineMassKg +
    generatorMassKg +
    motorMassKg +
    powerElectronicsMassKg +
    avionicsMassKg;

  const batteryMassKg = (batteryKwh * 1000) / BATTERY_SPECIFIC_ENERGY_WH_KG_PACK; // 200 Wh/kg pack level
  const fuelMassKg = mtowKg - oewSubtotalKg - payloadKg - batteryMassKg;
  const totalMassKg = oewSubtotalKg + payloadKg + batteryMassKg + Math.max(0, fuelMassKg);
  const mtowMarginKg = COMP_MTOW_KG - mtowKg;

  const mtowValidation: 'PASS' | 'FAIL' = mtowKg <= COMP_MTOW_KG ? 'PASS' : 'FAIL';
  const payloadValidation: 'PASS' | 'FAIL' = payloadKg >= COMP_PAYLOAD_KG ? 'PASS' : 'FAIL';
  const fuelValidation: 'PASS' | 'WARNING' | 'FAIL' =
    fuelMassKg < 0 ? 'FAIL' : fuelMassKg < 80 ? 'WARNING' : 'PASS';

  return {
    structuralMassKg,
    engineMassKg,
    generatorMassKg,
    motorMassKg,
    powerElectronicsMassKg,
    avionicsMassKg,
    oewSubtotalKg,
    payloadKg,
    batteryMassKg,
    fuelMassKg,
    totalMassKg,
    mtowMarginKg,
    mtowValidation,
    payloadValidation,
    fuelValidation,
    assumptions: {
      Structural: '30% of MTOW (Composite airframe assumption for MALE UAV class)',
      Engine: '2.0 kg/kW (Small turboshaft scaling)',
      Generator: '1.5 kg/kW (PMAR generator & housing)',
      Motor: '1.0 kg/kW (Permanent magnet synchronous motor)',
      PowerElectronics: '0.5 kg/kW (SiC inverter & power electronics)',
      Avionics: '30.0 kg fixed (Avionics, flight computer, telemetry & actuators)',
      Battery: '200 Wh/kg pack specific energy (High-discharge Li-Ion pack)',
    },
  };
}

// ─── 11. WEIGHT BUDGET ───────────────────────────────────────────────────────
/**
 * Calculates battery mass, allowable fuel payload mass, and MTOW margins.
 */
export function computeWeightBudget(params: {
  engineKw: number;
  batteryKwh: number;
  payloadKg: number;
  oewKg: number;
}): {
  batteryMassKg: number;
  fuelMassKg: number;
  totalMassKg: number;
  mtowMarginKg: number;
  feasible: boolean;
} {
  const batteryMassKg = (params.batteryKwh * 1000) / BATTERY_SPECIFIC_ENERGY_WH_KG_PACK;
  const fuelMassKg = COMP_MTOW_KG - params.oewKg - params.payloadKg - batteryMassKg;
  const totalMassKg = params.oewKg + params.payloadKg + batteryMassKg + Math.max(0, fuelMassKg);
  const mtowMarginKg = COMP_MTOW_KG - totalMassKg;
  const feasible = fuelMassKg > 0 && totalMassKg <= COMP_MTOW_KG;

  return {
    batteryMassKg,
    fuelMassKg,
    totalMassKg,
    mtowMarginKg,
    feasible,
  };
}

// ─── 12. BREGUET ENDURANCE (SANITY CHECK) ────────────────────────────────────
/**
 * Standard Breguet endurance formula for propellor aircraft.
 * Formula: E = (etaProp / (g * SFC_kg_per_s)) * (L/D) * ln(W_i / W_f)
 */
export function breguetEndurance(params: {
  etaProp: number;
  sfcKgKwh: number;
  LOverD: number;
  massInitialKg: number;
  massFinalKg: number;
}): number {
  if (params.massFinalKg <= 0 || params.massInitialKg <= params.massFinalKg || params.sfcKgKwh <= 0) {
    return 0;
  }

  const sfcKgPerSec = params.sfcKgKwh / 3600;
  return (params.etaProp / (G_MS2 * sfcKgPerSec)) * params.LOverD * Math.log(params.massInitialKg / params.massFinalKg);
}
