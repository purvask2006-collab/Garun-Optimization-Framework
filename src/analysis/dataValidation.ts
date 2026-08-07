import { RawTelemetryFrame, ValidationIssue, ValidationReport, ValidationSeverity } from './types';

/**
 * Validates raw telemetry dataset against physical bounds, sensor continuity, timestamp ordering, and schema completeness.
 */
export function validateTelemetryDataset(frames: RawTelemetryFrame[]): ValidationReport {
  const issues: ValidationIssue[] = [];
  const missingSensorsSet = new Set<string>();

  if (!frames || frames.length === 0) {
    return {
      isValid: false,
      totalFramesChecked: 0,
      validFramesCount: 0,
      criticalCount: 1,
      warningCount: 0,
      infoCount: 0,
      issues: [
        {
          id: 'ERR-EMPTY-DATASET',
          frameIndex: -1,
          type: 'MISSING_VALUE',
          severity: 'CRITICAL',
          field: 'dataset',
          value: null,
          message: 'Dataset contains zero telemetry frames.',
          resolution: 'Provide a valid telemetry stream or CSV import.',
        },
      ],
      missingSensors: ['timestamp', 'altitude', 'airspeed', 'batterySoc', 'enginePower'],
    };
  }

  // Sensor existence check across sample
  const requiredFields = [
    { key: 'timestamp', aliases: ['timestamp', 'timeSec'] },
    { key: 'altitude', aliases: ['altitudeM', 'altitudeFt'] },
    { key: 'airspeed', aliases: ['airspeedKmh', 'airspeedKts', 'airspeedMs'] },
    { key: 'batterySoc', aliases: ['batterySocPct', 'batterySOC'] },
    { key: 'enginePower', aliases: ['enginePowerKw', 'icePowerKw'] },
  ];

  for (const req of requiredFields) {
    const present = frames.some((f) => req.aliases.some((a) => f[a] !== undefined && f[a] !== null));
    if (!present) {
      missingSensorsSet.add(req.key);
      issues.push({
        id: `WARN-MISSING-SENSOR-${req.key.toUpperCase()}`,
        frameIndex: -1,
        type: 'MISSING_VALUE',
        severity: 'WARNING',
        field: req.key,
        value: null,
        message: `Sensor stream '${req.key}' is completely missing from dataset. Fallback estimators will be used.`,
        resolution: `Ensure telemetry feed provides ${req.aliases.join(' or ')}.`,
      });
    }
  }

  let prevTimeMs: number | null = null;
  let prevAltM: number | null = null;
  let prevSpeedKmh: number | null = null;
  let prevSoc: number | null = null;
  let prevTempC: number | null = null;

  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let invalidFramesCount = 0;

  frames.forEach((frame, idx) => {
    let frameHasCritical = false;

    // 1. Timestamp validation
    let timeMs: number | null = null;
    if (frame.timestamp) {
      if (typeof frame.timestamp === 'number') {
        timeMs = frame.timestamp > 1e11 ? frame.timestamp : frame.timestamp * 1000;
      } else if (typeof frame.timestamp === 'string') {
        const parsed = Date.parse(frame.timestamp.includes('Z') || frame.timestamp.includes('+') ? frame.timestamp : `1970-01-01T${frame.timestamp}`);
        if (!isNaN(parsed)) {
          timeMs = parsed;
        } else if (!isNaN(Number(frame.timestamp))) {
          timeMs = Number(frame.timestamp) * 1000;
        }
      }
    } else if (frame.timeSec !== undefined) {
      timeMs = frame.timeSec * 1000;
    }

    if (timeMs === null) {
      frameHasCritical = true;
      issues.push({
        id: `ERR-TS-${idx}`,
        frameIndex: idx,
        type: 'INVALID_TIMESTAMP',
        severity: 'CRITICAL',
        field: 'timestamp',
        value: frame.timestamp,
        message: `Frame ${idx}: Unparseable or missing timestamp.`,
        resolution: 'Interpolated timestamp from frame index.',
      });
    } else if (prevTimeMs !== null) {
      const deltaSec = (timeMs - prevTimeMs) / 1000;

      if (deltaSec <= 0) {
        frameHasCritical = true;
        issues.push({
          id: `ERR-TS-NONMONO-${idx}`,
          frameIndex: idx,
          timestamp: String(frame.timestamp),
          type: 'INVALID_TIMESTAMP',
          severity: 'CRITICAL',
          field: 'timestamp',
          value: deltaSec,
          message: `Frame ${idx}: Non-monotonic timestamp (delta: ${deltaSec.toFixed(2)}s). Time must strictly advance.`,
          resolution: 'Corrected timestamp to maintain strict monotonic order.',
        });
      } else if (deltaSec > 5.0) {
        issues.push({
          id: `GAP-${idx}`,
          frameIndex: idx,
          timestamp: String(frame.timestamp),
          type: 'TIME_GAP',
          severity: 'WARNING',
          field: 'timestamp',
          value: deltaSec,
          message: `Frame ${idx}: Telemetry signal gap of ${deltaSec.toFixed(1)}s detected (>5.0s limit).`,
          resolution: 'Segmented timeline across gap to prevent integration distortion.',
        });
      }
    }

    // 2. Altitude physical check & unit inconsistency check
    const altM = frame.altitudeM ?? (frame.altitudeFt !== undefined ? frame.altitudeFt * 0.3048 : null);
    if (altM === null) {
      issues.push({
        id: `MISSING-ALT-${idx}`,
        frameIndex: idx,
        type: 'MISSING_VALUE',
        severity: 'WARNING',
        field: 'altitude',
        value: null,
        message: `Frame ${idx}: Altitude value is missing.`,
        resolution: 'Applied linear interpolation from adjacent frames.',
      });
    } else {
      if (altM < -100 || altM > 18000) {
        frameHasCritical = true;
        issues.push({
          id: `ERR-ALT-PHYS-${idx}`,
          frameIndex: idx,
          type: 'PHYSICAL_IMPOSSIBILITY',
          severity: 'CRITICAL',
          field: 'altitudeM',
          value: altM,
          message: `Frame ${idx}: Impossible altitude ${altM.toFixed(1)}m (outside -100m to 18000m operational envelope).`,
          resolution: 'Clamped value to valid physical limits.',
        });
      }

      // Check unit inconsistency (e.g. altitudeFt passed in altitudeM field: e.g., 10000m when cruising altitude max is 10000ft)
      if (frame.altitudeM && frame.altitudeM > 12000) {
        issues.push({
          id: `UNIT-ALT-${idx}`,
          frameIndex: idx,
          type: 'UNIT_INCONSISTENCY',
          severity: 'WARNING',
          field: 'altitudeM',
          value: frame.altitudeM,
          message: `Frame ${idx}: Suspiciously high altitude ${frame.altitudeM}m. Might be specified in feet.`,
          resolution: 'Normalized unit converting from ft to meters.',
        });
      }

      // Check spike
      if (prevAltM !== null && prevTimeMs !== null && timeMs !== null) {
        const dt = Math.max(0.1, (timeMs - prevTimeMs) / 1000);
        const altRate = Math.abs(altM - prevAltM) / dt;
        if (altRate > 150) {
          // 150 m/s vertical rate is unphysical for 1000kg UAV
          issues.push({
            id: `SPIKE-ALT-${idx}`,
            frameIndex: idx,
            type: 'SENSOR_SPIKE',
            severity: 'WARNING',
            field: 'altitude',
            value: altRate,
            message: `Frame ${idx}: Sensor altitude spike detected (${altRate.toFixed(1)} m/s rate of change).`,
            resolution: 'Filtered using moving median smoother.',
          });
        }
      }
    }

    // 3. Airspeed physical check & spike
    const speedKmh = frame.airspeedKmh ?? (frame.airspeedKts !== undefined ? frame.airspeedKts * 1.852 : (frame.airspeedMs !== undefined ? frame.airspeedMs * 3.6 : null));
    if (speedKmh !== null) {
      if (speedKmh < 0 || speedKmh > 800) {
        issues.push({
          id: `ERR-SPEED-PHYS-${idx}`,
          frameIndex: idx,
          type: 'PHYSICAL_IMPOSSIBILITY',
          severity: 'CRITICAL',
          field: 'airspeed',
          value: speedKmh,
          message: `Frame ${idx}: Airspeed ${speedKmh.toFixed(1)} km/h violates vehicle flight envelope (0–800 km/h).`,
          resolution: 'Clamped to vehicle max speed.',
        });
      }
      if (prevSpeedKmh !== null && prevTimeMs !== null && timeMs !== null) {
        const dt = Math.max(0.1, (timeMs - prevTimeMs) / 1000);
        const accel = Math.abs(speedKmh - prevSpeedKmh) / 3.6 / dt; // m/s^2
        if (accel > 30) {
          // >3G horizontal acceleration
          issues.push({
            id: `SPIKE-SPEED-${idx}`,
            frameIndex: idx,
            type: 'SENSOR_SPIKE',
            severity: 'WARNING',
            field: 'airspeed',
            value: accel,
            message: `Frame ${idx}: Unrealistic horizontal acceleration spike (${accel.toFixed(1)} m/s²).`,
            resolution: 'Low-pass filtered speed value.',
          });
        }
      }
    }

    // 4. Battery SOC check
    const soc = frame.batterySocPct ?? frame.batterySOC ?? frame.battery?.socPct ?? frame.battery?.socPercent;
    if (soc !== undefined && soc !== null) {
      if (soc < 0 || soc > 105) {
        issues.push({
          id: `PHYS-SOC-${idx}`,
          frameIndex: idx,
          type: 'PHYSICAL_IMPOSSIBILITY',
          severity: 'CRITICAL',
          field: 'batterySocPct',
          value: soc,
          message: `Frame ${idx}: Battery SOC ${soc}% outside physical bounds (0–100%).`,
          resolution: 'Clamped to [0, 100]%.',
        });
      }
      if (prevSoc !== null && soc > prevSoc + 2.0) {
        // SOC jumped up by >2% without generator/charging active
        const enginePwr = frame.enginePowerKw ?? frame.icePowerKw ?? frame.engine?.powerKw ?? 0;
        if (enginePwr < 10) {
          issues.push({
            id: `SPIKE-SOC-${idx}`,
            frameIndex: idx,
            type: 'SENSOR_SPIKE',
            severity: 'INFO',
            field: 'batterySocPct',
            value: soc - prevSoc,
            message: `Frame ${idx}: Positive SOC jump (+${(soc - prevSoc).toFixed(1)}%) without charging power.`,
            resolution: 'Monotonically constrained SOC discharge curve.',
          });
        }
      }
    }

    // 5. Battery temperature check
    const tempC = frame.batteryTempC ?? frame.battery?.cellTempAvgC;
    if (tempC !== undefined && tempC !== null) {
      if (tempC < -40 || tempC > 120) {
        issues.push({
          id: `PHYS-TEMP-${idx}`,
          frameIndex: idx,
          type: 'PHYSICAL_IMPOSSIBILITY',
          severity: 'WARNING',
          field: 'batteryTempC',
          value: tempC,
          message: `Frame ${idx}: Extreme battery temperature reading (${tempC}°C).`,
          resolution: 'Flagged for thermal system assessment.',
        });
      }
    }

    // 6. Unit Inconsistency check for power (e.g., Watts vs kW)
    const engPower = frame.enginePowerKw ?? frame.icePowerKw ?? frame.engine?.powerKw;
    if (engPower !== undefined && engPower > 1000) {
      issues.push({
        id: `UNIT-PWR-${idx}`,
        frameIndex: idx,
        type: 'UNIT_INCONSISTENCY',
        severity: 'WARNING',
        field: 'enginePowerKw',
        value: engPower,
        message: `Frame ${idx}: Engine power value ${engPower} exceeds 1000 kW. Value appears to be in Watts instead of kW.`,
        resolution: 'Divided value by 1000 to convert W to kW.',
      });
    }

    if (timeMs !== null) prevTimeMs = timeMs;
    if (altM !== null) prevAltM = altM;
    if (speedKmh !== null) prevSpeedKmh = speedKmh;
    if (soc !== undefined && soc !== null) prevSoc = soc;
    if (tempC !== undefined && tempC !== null) prevTempC = tempC;

    if (frameHasCritical) invalidFramesCount++;
  });

  issues.forEach((iss) => {
    if (iss.severity === 'CRITICAL') criticalCount++;
    else if (iss.severity === 'WARNING') warningCount++;
    else infoCount++;
  });

  return {
    isValid: criticalCount === 0,
    totalFramesChecked: frames.length,
    validFramesCount: frames.length - invalidFramesCount,
    criticalCount,
    warningCount,
    infoCount,
    issues,
    missingSensors: Array.from(missingSensorsSet),
  };
}
