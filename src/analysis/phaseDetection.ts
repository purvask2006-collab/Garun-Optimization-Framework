import { NormalizedFrame, FlightPhaseType } from './types';

/**
 * Detects flight phase for each frame using multi-variable aeronautical state machines,
 * hysteresis window filtering, and rule-based decision trees.
 */
export function detectFlightPhases(frames: NormalizedFrame[]): NormalizedFrame[] {
  if (!frames || frames.length === 0) return frames;

  // Pass 1: Frame-level classification
  const rawPhases: { phase: FlightPhaseType; confidence: number }[] = frames.map((frame, idx) => {
    const { altitudeM, airspeedKmh, verticalSpeedMs, totalPowerKw, vibrationG } = frame;

    // Check Maneuver (high G / high vibration / rapid speed derivative)
    if (vibrationG > 0.40 || Math.abs(frame.derived.CL) > 1.4) {
      return { phase: 'MANEUVER', confidence: 0.90 };
    }

    // Check Ground
    if (altitudeM < 15 && airspeedKmh < 45) {
      return { phase: 'GROUND', confidence: 0.98 };
    }

    // Check Takeoff
    if (altitudeM < 120 && verticalSpeedMs >= 0.8 && airspeedKmh >= 40 && airspeedKmh < 160 && totalPowerKw > 50) {
      return { phase: 'TAKEOFF', confidence: 0.95 };
    }

    // Check Landing
    if (altitudeM < 120 && verticalSpeedMs <= -0.5 && airspeedKmh < 140) {
      return { phase: 'LANDING', confidence: 0.95 };
    }

    // Check Climb
    if (verticalSpeedMs > 1.2 && altitudeM >= 50) {
      return { phase: 'CLIMB', confidence: 0.92 };
    }

    // Check Descent
    if (verticalSpeedMs < -1.2 && altitudeM >= 50) {
      return { phase: 'DESCENT', confidence: 0.92 };
    }

    // Level flight distinctions: CRUISE vs LOITER
    if (Math.abs(verticalSpeedMs) <= 1.0 && altitudeM >= 300) {
      // Loiter is characterized by loiter speed range (~140–190 km/h) for maximum endurance L/D
      if (airspeedKmh >= 135 && airspeedKmh <= 195) {
        return { phase: 'LOITER', confidence: 0.88 };
      }
      // Cruise is faster (~200–280 km/h) for transit efficiency
      if (airspeedKmh > 195) {
        return { phase: 'CRUISE', confidence: 0.95 };
      }
    }

    // Fallbacks
    if (altitudeM > 1000) {
      return { phase: airspeedKmh < 195 ? 'LOITER' : 'CRUISE', confidence: 0.70 };
    }
    if (verticalSpeedMs > 0) return { phase: 'CLIMB', confidence: 0.70 };
    if (verticalSpeedMs < 0) return { phase: 'DESCENT', confidence: 0.70 };

    return { phase: 'CRUISE', confidence: 0.60 };
  });

  // Pass 2: Hysteresis & Temporal Smoothing (sliding window = 5 frames)
  // Prevents single-frame transient noise from flickering phase labels
  const windowSize = 5;
  const smoothedFrames = frames.map((frame, idx) => {
    const startIdx = Math.max(0, idx - Math.floor(windowSize / 2));
    const endIdx = Math.min(frames.length - 1, idx + Math.floor(windowSize / 2));

    const counts: Record<FlightPhaseType, number> = {
      GROUND: 0,
      TAKEOFF: 0,
      CLIMB: 0,
      CRUISE: 0,
      LOITER: 0,
      MANEUVER: 0,
      DESCENT: 0,
      LANDING: 0,
    };

    let maxConfidence = rawPhases[idx].confidence;

    for (let i = startIdx; i <= endIdx; i++) {
      counts[rawPhases[i].phase] += 1;
    }

    let dominantPhase: FlightPhaseType = rawPhases[idx].phase;
    let maxCount = 0;

    (Object.keys(counts) as FlightPhaseType[]).forEach((p) => {
      if (counts[p] > maxCount) {
        maxCount = counts[p];
        dominantPhase = p;
      }
    });

    return {
      ...frame,
      detectedPhase: dominantPhase,
      phaseConfidence: dominantPhase === rawPhases[idx].phase ? maxConfidence : Math.max(0.65, maxConfidence - 0.15),
    };
  });

  return smoothedFrames;
}
