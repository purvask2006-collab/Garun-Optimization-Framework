import { analyzeMissionDataset } from './analysisEngine';
import { generateSampleMissionTelemetry } from './sampleData';

/**
 * Pipeline verification runner.
 * Executes centralized analysis pipeline against realistic 60-minute GARUN MALE UAV telemetry stream.
 * Validates data quality, flight phase detection, physics integration, energy balance, and missing input detection.
 */
export function runAnalysisPipelineVerification() {
  console.log('========================================================================');
  console.log('  GARUN HAL AEROSPACE - MISSION ANALYSIS & INTELLIGENCE PIPELINE TEST');
  console.log('========================================================================\n');

  // 1. Generate 60-minute realistic 1Hz telemetry stream
  const rawDataset = generateSampleMissionTelemetry(60);
  console.log(`[1. DATASET]: Loaded ${rawDataset.length} raw telemetry frames.`);

  // 2. Execute central analysis pipeline
  const startTime = Date.now();
  const results = analyzeMissionDataset(rawDataset, 'HAL-GARUN-FLIGHT-TEST-001');
  const durationMs = Date.now() - startTime;

  console.log(`[2. PIPELINE EXECUTION]: Pipeline completed in ${durationMs} ms.`);
  console.log(`    Data Quality Score: ${results.metadata.dataQualityScorePct}%`);
  console.log(`    Usable Frames: ${results.metadata.usableFrames} / ${results.metadata.totalRawFrames}\n`);

  // 3. Validation results check
  console.log('--- [3. DATA VALIDATION RESULTS] ---');
  console.log(`  Is Valid: ${results.validation.isValid}`);
  console.log(`  Critical Issues: ${results.validation.criticalCount}`);
  console.log(`  Warnings: ${results.validation.warningCount}`);
  console.log(`  Info Alerts: ${results.validation.infoCount}`);
  console.log('  Issues Detected:');
  results.validation.issues.slice(0, 8).forEach((issue) => {
    console.log(`    - [${issue.severity}] Frame ${issue.frameIndex} (${issue.field}): ${issue.message}`);
  });
  console.log();

  // 4. Flight Phase Detection check
  console.log('--- [4. FLIGHT PHASE DETECTION BREAKDOWN] ---');
  const phasesFound = new Set(results.normalizedFrames.map((f) => f.detectedPhase));
  console.log(`  Detected Unique Flight Phases (${phasesFound.size}): [${Array.from(phasesFound).join(', ')}]`);
  console.log('  Phase Durations & Fuel Burn:');
  Object.entries(results.summaryMetrics.phaseDurationsHr).forEach(([phase, hrs]) => {
    if (hrs > 0) {
      const min = (hrs * 60).toFixed(1);
      const fuel = results.summaryMetrics.phaseFuelKg[phase as keyof typeof results.summaryMetrics.phaseFuelKg].toFixed(1);
      const kwh = results.summaryMetrics.phaseEnergyKwh[phase as keyof typeof results.summaryMetrics.phaseEnergyKwh].toFixed(2);
      console.log(`    - ${phase.padEnd(10)} : ${min.padStart(5)} min | Fuel: ${fuel.padStart(5)} kg | Battery: ${kwh.padStart(5)} kWh`);
    }
  });
  console.log();

  // 5. Mission Timeline & Physics Calculations
  console.log('--- [5. MISSION TIMELINE & PHYSICS CALCULATIONS] ---');
  console.log(`  Start Time           : ${results.timeline.startTimeIso}`);
  console.log(`  End Time             : ${results.timeline.endTimeIso}`);
  console.log(`  Total Duration       : ${results.timeline.totalDurationMin} min (${results.timeline.totalDurationHr} hr)`);
  console.log(`  Total Distance       : ${results.summaryMetrics.totalDistanceKm} km (${results.timeline.totalDistanceNm} NM)`);
  console.log(`  Avg Cruise Speed     : ${results.summaryMetrics.avgCruiseSpeedKmh} km/h`);
  console.log(`  Peak Altitude        : ${results.summaryMetrics.maxAltitudeM} m`);
  console.log(`  Total Fuel Burned    : ${results.summaryMetrics.totalFuelBurnKg} kg`);
  console.log(`  Total Battery Used   : ${results.summaryMetrics.totalBatteryEnergyKwh} kWh`);
  console.log(`  Battery SOC Delta    : ${results.summaryMetrics.initialSocPct}% -> ${results.summaryMetrics.finalSocPct}%`);
  console.log(`  Peak Power Output    : ${results.summaryMetrics.peakPowerKw} kW`);
  console.log(`  Avg Lift-to-Drag     : ${results.summaryMetrics.avgLOverD}`);
  console.log(`  Breguet Est. Range   : ${results.summaryMetrics.breguetEstimatedEnduranceHr} hr`);
  console.log(`  Energy Balance Error : ${results.summaryMetrics.energyBalance.balanceErrorPct}%\n`);

  // 6. Missing inputs & recommendations
  console.log('--- [6. MISSING INPUTS & RECOMMENDATIONS] ---');
  console.log(`  Missing Inputs (${results.missingInputs.length}): ${results.missingInputs.length > 0 ? results.missingInputs.join(', ') : 'None'}`);
  console.log('  Actionable Recommendations:');
  results.recommendations.forEach((rec, idx) => {
    console.log(`    ${idx + 1}. ${rec}`);
  });
  console.log('\n========================================================================\n');

  return results;
}

// Automatically verify on import in test environments
if (typeof window === 'undefined') {
  try {
    runAnalysisPipelineVerification();
  } catch (err) {
    console.error('Verification error:', err);
  }
}
