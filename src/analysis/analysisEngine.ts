import { RawTelemetryFrame, MissionAnalysisResult } from './types';
import { validateTelemetryDataset } from './dataValidation';
import { normalizeTelemetryDataset } from './normalization';
import { detectFlightPhases } from './phaseDetection';
import { buildMissionTimelineAndMetrics } from './physicsPipeline';

/**
 * Centralized Mission Analysis Pipeline:
 * DATASET → VALIDATION → NORMALIZATION → FLIGHT-PHASE DETECTION → PHYSICS CALCULATIONS → ANALYSIS RESULTS
 *
 * Provides a unified, validated, reusable analysis model for all mission analysis modules.
 */
export function analyzeMissionDataset(
  rawDataset: RawTelemetryFrame[],
  datasetName: string = 'GARUN-MALE-UAV-TELEMETRY-STREAM'
): MissionAnalysisResult {
  const startTime = Date.now();

  // 1. VALIDATION
  const validation = validateTelemetryDataset(rawDataset);

  // 2. NORMALIZATION
  const normalizedFrames = normalizeTelemetryDataset(rawDataset);

  // 3. FLIGHT-PHASE DETECTION
  const phaseLabeledFrames = detectFlightPhases(normalizedFrames);

  // 4. PHYSICS CALCULATIONS
  const { timeline, summaryMetrics } = buildMissionTimelineAndMetrics(phaseLabeledFrames);

  // Calculate Data Quality Score
  const totalFrames = rawDataset.length || 1;
  const criticalDeduction = (validation.criticalCount / totalFrames) * 50;
  const warningDeduction = (validation.warningCount / totalFrames) * 20;
  const infoDeduction = (validation.infoCount / totalFrames) * 5;
  const dataQualityScorePct = Math.max(0, Math.min(100, Number((100 - criticalDeduction - warningDeduction - infoDeduction).toFixed(1))));

  // Identify missing inputs & recommendations
  const missingInputs: string[] = [...validation.missingSensors];
  const recommendations: string[] = [];

  if (validation.missingSensors.length > 0) {
    recommendations.push(
      `Sensor feeds for [${validation.missingSensors.join(', ')}] were missing and estimated using ISA/Breguet models. Ensure telemetry sensor feeds are connected for HIL precision.`
    );
  }

  if (validation.criticalCount > 0) {
    recommendations.push(
      `Detected ${validation.criticalCount} critical data boundary violations (clamped to physical envelope limits). Verify sensor calibration and packet encoding.`
    );
  }

  if (summaryMetrics.energyBalance.balanceErrorPct > 2.0) {
    recommendations.push(
      `Energy balance residual error is ${summaryMetrics.energyBalance.balanceErrorPct}%. Inspect inverter/generator loss models.`
    );
  } else {
    recommendations.push(
      `Energy balance verified within ${summaryMetrics.energyBalance.balanceErrorPct}% thermal/electrical conservation margin.`
    );
  }

  if (summaryMetrics.finalSocPct < 20) {
    recommendations.push(
      `Final battery SOC reached ${summaryMetrics.finalSocPct}%. Reserve threshold (20%) reached — consider adjusting loiter power split.`
    );
  }

  return {
    metadata: {
      analyzedAt: new Date().toISOString(),
      datasetName,
      totalRawFrames: rawDataset.length,
      usableFrames: phaseLabeledFrames.length,
      dataQualityScorePct,
    },
    validation,
    timeline,
    normalizedFrames: phaseLabeledFrames,
    summaryMetrics,
    missingInputs,
    recommendations,
  };
}
