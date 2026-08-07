import { RawTelemetryFrame, NormalizedFrame, FrameDerivedPhysics, FlightPhaseType } from './types';
import { isaAtmosphere, powerRequired, combustorTET } from '../physics/garunPhysics';
import { COMP_MTOW_KG, DESIGN_WING_AREA_M2, DESIGN_ASPECT_RATIO } from '../physics/garunSpec';
import { CD0_ASSUMPTION, OSWALD_E_ASSUMPTION, PROP_ETA_ASSUMPTION } from '../physics/physicsConstants';

/**
 * Normalizes raw telemetry dataset into a standardized SI unit model.
 * Handles unit conversion, missing field fallbacks, time integration, and frame physics.
 */
export function normalizeTelemetryDataset(rawFrames: RawTelemetryFrame[]): NormalizedFrame[] {
  if (!rawFrames || rawFrames.length === 0) return [];

  // Determine base starting timestamp
  let baseTimeMs = 0;
  const firstFrame = rawFrames[0];
  if (firstFrame.timestamp) {
    if (typeof firstFrame.timestamp === 'number') {
      baseTimeMs = firstFrame.timestamp > 1e11 ? firstFrame.timestamp : firstFrame.timestamp * 1000;
    } else if (typeof firstFrame.timestamp === 'string') {
      const parsed = Date.parse(firstFrame.timestamp.includes('Z') || firstFrame.timestamp.includes('+') ? firstFrame.timestamp : `1970-01-01T${firstFrame.timestamp}`);
      baseTimeMs = !isNaN(parsed) ? parsed : 0;
    }
  } else if (firstFrame.timeSec !== undefined) {
    baseTimeMs = firstFrame.timeSec * 1000;
  }

  let cumDistanceKm = 0;
  let cumFuelBurnKg = 0;
  let prevTimeRelSec = 0;
  let prevAltM = 0;

  const normalized: NormalizedFrame[] = [];

  rawFrames.forEach((frame, idx) => {
    const flags: string[] = [];

    // Parse time
    let frameTimeMs = baseTimeMs + idx * 1000; // default 1Hz
    if (frame.timestamp) {
      if (typeof frame.timestamp === 'number') {
        frameTimeMs = frame.timestamp > 1e11 ? frame.timestamp : frame.timestamp * 1000;
      } else if (typeof frame.timestamp === 'string') {
        const parsed = Date.parse(frame.timestamp.includes('Z') || frame.timestamp.includes('+') ? frame.timestamp : `1970-01-01T${frame.timestamp}`);
        if (!isNaN(parsed)) {
          frameTimeMs = parsed;
        }
      }
    } else if (frame.timeSec !== undefined) {
      frameTimeMs = frame.timeSec * 1000;
    }

    const timestampIso = new Date(frameTimeMs).toISOString();
    const timeRelSec = Math.max(0, (frameTimeMs - baseTimeMs) / 1000);
    const deltaTimeSec = idx === 0 ? 1.0 : Math.max(0.01, timeRelSec - prevTimeRelSec);

    // Altitude normalization
    let altitudeM = 0;
    if (frame.altitudeM !== undefined && frame.altitudeM !== null) {
      // Check unit error (e.g. altitude > 15000 is likely feet improperly labeled as meters)
      altitudeM = frame.altitudeM > 15000 ? frame.altitudeM * 0.3048 : frame.altitudeM;
      if (frame.altitudeM > 15000) flags.push('ALTITUDE_UNIT_CORRECTED_FT_TO_M');
    } else if (frame.altitudeFt !== undefined && frame.altitudeFt !== null) {
      altitudeM = frame.altitudeFt * 0.3048;
    } else {
      altitudeM = prevAltM; // Fallback
      flags.push('ALTITUDE_INTERPOLATED');
    }
    altitudeM = Math.max(0, altitudeM);
    const altitudeFt = altitudeM / 0.3048;

    // Airspeed normalization
    let airspeedKmh = 0;
    if (frame.airspeedKmh !== undefined && frame.airspeedKmh !== null) {
      airspeedKmh = frame.airspeedKmh;
    } else if (frame.airspeedKts !== undefined && frame.airspeedKts !== null) {
      airspeedKmh = frame.airspeedKts * 1.852;
    } else if (frame.airspeedMs !== undefined && frame.airspeedMs !== null) {
      airspeedKmh = frame.airspeedMs * 3.6;
    } else {
      airspeedKmh = 220; // nominal cruise default
      flags.push('AIRSPEED_ESTIMATED');
    }
    airspeedKmh = Math.max(0, airspeedKmh);
    const airspeedKts = airspeedKmh / 1.852;
    const airspeedMs = airspeedKmh / 3.6;

    // Vertical speed normalization
    let verticalSpeedMs = 0;
    if (frame.verticalSpeedMs !== undefined && frame.verticalSpeedMs !== null) {
      verticalSpeedMs = frame.verticalSpeedMs;
    } else if (frame.verticalSpeedFps !== undefined && frame.verticalSpeedFps !== null) {
      verticalSpeedMs = frame.verticalSpeedFps * 0.3048;
    } else if (idx > 0 && deltaTimeSec > 0) {
      verticalSpeedMs = (altitudeM - prevAltM) / deltaTimeSec;
    }

    // ISA atmosphere & Mach
    const atm = isaAtmosphere(altitudeM);
    const machNumber = frame.machNumber ?? airspeedMs / Math.max(1, atm.soundSpeedMs);

    // Power normalization (engine/ICE power & motor power)
    let enginePowerKw = frame.enginePowerKw ?? frame.icePowerKw ?? frame.engine?.powerKw ?? 0;
    if (enginePowerKw > 1000) {
      enginePowerKw = enginePowerKw / 1000; // Convert W to kW
      flags.push('POWER_UNIT_CORRECTED_W_TO_KW');
    }
    enginePowerKw = Math.max(0, enginePowerKw);

    let motorPowerKw = frame.motorPowerKw ?? frame.battery?.dischargeKw ?? 0;
    if (motorPowerKw > 1000) {
      motorPowerKw = motorPowerKw / 1000;
    }
    motorPowerKw = Math.max(0, motorPowerKw);

    const totalPowerKw = enginePowerKw + motorPowerKw;

    // Battery SOC & status
    let batterySocPct = frame.batterySocPct ?? frame.batterySOC ?? frame.battery?.socPct ?? frame.battery?.socPercent ?? 100;
    if (batterySocPct > 0 && batterySocPct <= 1.0) {
      batterySocPct = batterySocPct * 100; // Convert 0.8 to 80%
      flags.push('SOC_UNIT_CORRECTED_FRAC_TO_PCT');
    }
    batterySocPct = Math.max(0, Math.min(100, batterySocPct));

    const batteryVoltageV = frame.batteryVoltageV ?? frame.battery?.packVoltageV ?? 400;
    const batteryCurrentA = frame.batteryCurrentA ?? frame.battery?.currentDrawA ?? (motorPowerKw * 1000) / Math.max(1, batteryVoltageV);
    const batteryTempC = frame.batteryTempC ?? frame.battery?.cellTempAvgC ?? 35;

    // Fuel flow & cumulative fuel
    let fuelFlowKgHr = frame.fuelFlowKgHr ?? frame.engine?.fuelBurnRateKgHr ?? frame.engine?.sfcGkwh ? (enginePowerKw * (frame.engine?.sfcGkwh ?? 450)) / 1000 : 0;
    if (fuelFlowKgHr <= 0 && enginePowerKw > 5) {
      // Estimate fuel flow from engine power
      fuelFlowKgHr = enginePowerKw * 0.22; // ~0.22 kg/kWh SFC
      flags.push('FUEL_FLOW_DERIVED_FROM_POWER');
    }
    fuelFlowKgHr = Math.max(0, fuelFlowKgHr);

    const fuelBurnDeltaKg = (fuelFlowKgHr * deltaTimeSec) / 3600;
    cumFuelBurnKg += fuelBurnDeltaKg;

    // Distance delta
    const distanceDeltaKm = (airspeedKmh * deltaTimeSec) / 3600;
    cumDistanceKm += distanceDeltaKm;

    const vibrationG = frame.vibrationG ?? 0.12;

    // Calculate frame aerodynamic & thermodynamic physics
    const currentMassKg = Math.max(700, COMP_MTOW_KG - cumFuelBurnKg);
    const aero = powerRequired({
      massKg: currentMassKg,
      altM: altitudeM,
      speedKmh: airspeedKmh,
      wingAreaM2: DESIGN_WING_AREA_M2,
      AR: DESIGN_ASPECT_RATIO,
      e: OSWALD_E_ASSUMPTION,
      CD0: CD0_ASSUMPTION,
      etaProp: PROP_ETA_ASSUMPTION,
    });

    const loadFraction = Math.min(1.0, enginePowerKw / 60); // 60kW rated engine
    const sfcKgKwh = enginePowerKw > 1 ? fuelFlowKgHr / enginePowerKw : 0.22;
    const tet = combustorTET({ altM: altitudeM, loadFraction, pressureRatio: 5.0 });

    const derived: FrameDerivedPhysics = {
      dynamicPressurePa: aero.dynamicPressurePa,
      CL: aero.CL,
      CD: aero.CD,
      LOverD: aero.LOverD,
      dragN: aero.dragN,
      propulsionEfficiency: PROP_ETA_ASSUMPTION,
      sfcKgKwh,
      tetKelvin: tet.TET_K,
      densityKgM3: atm.densityKgM3,
      soundSpeedMs: atm.soundSpeedMs,
      distanceDeltaKm,
      cumDistanceKm,
    };

    normalized.push({
      frameIndex: idx,
      timestampIso,
      timeRelSec,
      deltaTimeSec,
      altitudeM,
      altitudeFt,
      airspeedKmh,
      airspeedKts,
      airspeedMs,
      verticalSpeedMs,
      machNumber,
      enginePowerKw,
      motorPowerKw,
      totalPowerKw,
      batterySocPct,
      batteryVoltageV,
      batteryCurrentA,
      batteryTempC,
      fuelFlowKgHr,
      cumFuelBurnKg,
      vibrationG,
      detectedPhase: 'CRUISE', // Will be determined by Phase Detector
      phaseConfidence: 1.0,
      derived,
      flags,
    });

    prevTimeRelSec = timeRelSec;
    prevAltM = altitudeM;
  });

  return normalized;
}
