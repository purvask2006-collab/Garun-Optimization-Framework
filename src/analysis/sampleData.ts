import { RawTelemetryFrame } from './types';

/**
 * Generates a realistic full-mission telemetry stream for the GARUN 1000kg Series-Hybrid MALE UAV.
 * Includes realistic flight phases (Ground, Takeoff, Climb, Cruise, Loiter, Maneuver, Descent, Landing)
 * and intentionally includes realistic edge-case anomalies (sensor spike, unit anomaly, gap) for validation testing.
 */
export function generateSampleMissionTelemetry(durationMinutes: number = 60): RawTelemetryFrame[] {
  const totalFrames = durationMinutes * 60; // 1Hz telemetry
  const frames: RawTelemetryFrame[] = [];

  let currentAltM = 0;
  let currentSpeedKmh = 0;
  let currentSocPct = 100.0;
  let cumFuelKg = 0;
  const baseTimeMs = Date.now() - totalFrames * 1000;

  for (let i = 0; i < totalFrames; i++) {
    const tSec = i;
    const timestampIso = new Date(baseTimeMs + i * 1000).toISOString();

    let phaseStr = 'GROUND';
    let targetAltM = 0;
    let targetSpeedKmh = 0;
    let enginePowerKw = 0;
    let motorPowerKw = 0;
    let vibrationG = 0.10 + Math.random() * 0.04;

    // Mission Profile Script:
    // 0 - 2 min: Ground / Taxi
    if (tSec < 120) {
      phaseStr = 'GROUND';
      targetAltM = 0;
      targetSpeedKmh = 25;
      enginePowerKw = 5;
      motorPowerKw = 10;
    }
    // 2 - 5 min: Takeoff (0 -> 150m, 25 -> 140 km/h)
    else if (tSec < 300) {
      phaseStr = 'TAKEOFF';
      const progress = (tSec - 120) / 180;
      targetAltM = progress * 150;
      targetSpeedKmh = 25 + progress * 115;
      enginePowerKw = 55;
      motorPowerKw = 45; // Max hybrid boost
      vibrationG = 0.22 + Math.random() * 0.08;
    }
    // 5 - 18 min: Climb (150m -> 3000m, 140 -> 210 km/h)
    else if (tSec < 1080) {
      phaseStr = 'CLIMB';
      const progress = (tSec - 300) / 780;
      targetAltM = 150 + progress * 2850;
      targetSpeedKmh = 140 + progress * 70;
      enginePowerKw = 58;
      motorPowerKw = 15;
    }
    // 18 - 38 min: Cruise at 3000m (250 km/h)
    else if (tSec < 2280) {
      phaseStr = 'CRUISE';
      targetAltM = 3000 + Math.sin(tSec / 30) * 10;
      targetSpeedKmh = 248 + Math.cos(tSec / 20) * 4;
      enginePowerKw = 48;
      motorPowerKw = 8;
    }
    // 38 - 48 min: Loiter at 3000m (180 km/h for maximum endurance L/D)
    else if (tSec < 2880) {
      phaseStr = 'LOITER';
      targetAltM = 3000 + Math.sin(tSec / 40) * 5;
      targetSpeedKmh = 178 + Math.sin(tSec / 15) * 3;
      enginePowerKw = 34;
      motorPowerKw = 4;
    }
    // 48 - 50 min: Maneuver (Evasive / sensor alignment test at 2800m)
    else if (tSec < 3000) {
      phaseStr = 'MANEUVER';
      targetAltM = 2800 + Math.sin(tSec / 5) * 50;
      targetSpeedKmh = 230 + Math.cos(tSec / 3) * 20;
      enginePowerKw = 52;
      motorPowerKw = 30;
      vibrationG = 0.48 + Math.random() * 0.12; // High vibration spike trigger
    }
    // 50 - 57 min: Descent (2800m -> 100m, 230 -> 130 km/h)
    else if (tSec < 3420) {
      phaseStr = 'DESCENT';
      const progress = (tSec - 3000) / 420;
      targetAltM = 2800 - progress * 2700;
      targetSpeedKmh = 230 - progress * 100;
      enginePowerKw = 15;
      motorPowerKw = 2;
    }
    // 57 - 60 min: Landing (100m -> 0m, 130 -> 0 km/h)
    else if (tSec <= 3600) {
      phaseStr = 'LANDING';
      const progress = (tSec - 3420) / 180;
      targetAltM = Math.max(0, 100 - progress * 100);
      targetSpeedKmh = Math.max(0, 130 - progress * 130);
      enginePowerKw = 10;
      motorPowerKw = 5;
    }

    // Dynamic state smoothing
    currentAltM += (targetAltM - currentAltM) * 0.1;
    currentSpeedKmh += (targetSpeedKmh - currentSpeedKmh) * 0.1;

    // Fuel and SOC drain
    const fuelFlowKgHr = enginePowerKw * 0.22; // ~0.22 kg/kWh
    cumFuelKg += (fuelFlowKgHr * 1.0) / 3600;
    currentSocPct = Math.max(15, currentSocPct - (motorPowerKw * 1.0) / 3600 / 0.22); // 22 kWh battery

    const frame: RawTelemetryFrame = {
      timestamp: timestampIso,
      timeSec: tSec,
      altitudeM: Number(currentAltM.toFixed(1)),
      altitudeFt: Number((currentAltM / 0.3048).toFixed(0)),
      airspeedKmh: Number(currentSpeedKmh.toFixed(1)),
      airspeedKts: Number((currentSpeedKmh / 1.852).toFixed(1)),
      batterySocPct: Number(currentSocPct.toFixed(2)),
      batteryTempC: Number((32 + (motorPowerKw / 50) * 12 + Math.sin(tSec / 100) * 2).toFixed(1)),
      iceRpm: Math.round((enginePowerKw / 60) * 5500),
      icePowerKw: Number(enginePowerKw.toFixed(1)),
      enginePowerKw: Number(enginePowerKw.toFixed(1)),
      motorRpm: Math.round((motorPowerKw / 55) * 3200),
      motorPowerKw: Number(motorPowerKw.toFixed(1)),
      fuelFlowKgHr: Number(fuelFlowKgHr.toFixed(2)),
      vibrationG: Number(vibrationG.toFixed(2)),
      battery: {
        socPct: Number(currentSocPct.toFixed(2)),
        cellTempAvgC: Number((32 + (motorPowerKw / 50) * 12).toFixed(1)),
        packVoltageV: 400.0,
        currentDrawA: Number(((motorPowerKw * 1000) / 400).toFixed(1)),
      },
    };

    // INJECT REALISTIC ANOMALIES FOR PIPELINE TESTING:
    // 1. Injected altitude spike at frame 400
    if (i === 400) {
      frame.altitudeM = 9999; // Altitude spike
    }
    // 2. Injected unit error at frame 1200 (Engine power passed in Watts instead of kW)
    if (i === 1200) {
      frame.enginePowerKw = 48000; // 48 kW written as 48000 W
    }
    // 3. Injected gap at frame 1800 (jump timestamp by 10s)
    if (i === 1800) {
      frame.timestamp = new Date(baseTimeMs + (i + 10) * 1000).toISOString();
    }

    frames.push(frame);
  }

  return frames;
}
