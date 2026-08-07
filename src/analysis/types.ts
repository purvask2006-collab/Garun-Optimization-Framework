// ─── CENTRALIZED MISSION ANALYSIS DATA MODEL ─────────────────────────────────
// Defines strict types for the analysis engine pipeline:
// DATASET → VALIDATION → NORMALIZATION → FLIGHT-PHASE DETECTION → PHYSICS CALCULATIONS → ANALYSIS RESULTS

export type FlightPhaseType =
  | 'TAKEOFF'
  | 'CLIMB'
  | 'CRUISE'
  | 'LOITER'
  | 'MANEUVER'
  | 'DESCENT'
  | 'LANDING'
  | 'GROUND';

export interface RawTelemetryFrame {
  timestamp?: string | number;
  timeSec?: number;
  altitudeFt?: number;
  altitudeM?: number;
  airspeedKts?: number;
  airspeedKmh?: number;
  airspeedMs?: number;
  verticalSpeedFps?: number;
  verticalSpeedMs?: number;
  machNumber?: number;
  batterySocPct?: number;
  batterySOC?: number;
  batteryTempC?: number;
  batteryVoltageV?: number;
  batteryCurrentA?: number;
  iceRpm?: number;
  icePowerKw?: number;
  enginePowerKw?: number;
  motorRpm?: number;
  motorPowerKw?: number;
  powerSplitRatio?: number;
  systemEfficiencyPct?: number;
  fuelFlowKgHr?: number;
  cabinPressurePsi?: number;
  vibrationG?: number;
  pitchDeg?: number;
  rollDeg?: number;
  engine?: {
    powerKw?: number;
    rpm?: number;
    egtCelsius?: number;
    fuelMassKg?: number;
    sfcGkwh?: number;
    fuelBurnRateKgHr?: number;
  };
  battery?: {
    socPct?: number;
    socPercent?: number;
    powerKw?: number;
    dischargeKw?: number;
    packVoltageV?: number;
    currentDrawA?: number;
    cellTempAvgC?: number;
  };
  [key: string]: any;
}

export type ValidationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ValidationIssueType =
  | 'MISSING_VALUE'
  | 'INVALID_TIMESTAMP'
  | 'UNIT_INCONSISTENCY'
  | 'PHYSICAL_IMPOSSIBILITY'
  | 'SENSOR_SPIKE'
  | 'TIME_GAP';

export interface ValidationIssue {
  id: string;
  frameIndex: number;
  timestamp?: string;
  type: ValidationIssueType;
  severity: ValidationSeverity;
  field: string;
  value: any;
  message: string;
  resolution: string;
}

export interface ValidationReport {
  isValid: boolean;
  totalFramesChecked: number;
  validFramesCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  missingSensors: string[];
}

export interface FrameDerivedPhysics {
  dynamicPressurePa: number;
  CL: number;
  CD: number;
  LOverD: number;
  dragN: number;
  propulsionEfficiency: number;
  sfcKgKwh: number;
  tetKelvin: number;
  densityKgM3: number;
  soundSpeedMs: number;
  distanceDeltaKm: number;
  cumDistanceKm: number;
}

export interface NormalizedFrame {
  frameIndex: number;
  timestampIso: string;
  timeRelSec: number;
  deltaTimeSec: number;
  altitudeM: number;
  altitudeFt: number;
  airspeedKmh: number;
  airspeedKts: number;
  airspeedMs: number;
  verticalSpeedMs: number;
  machNumber: number;
  enginePowerKw: number;
  motorPowerKw: number;
  totalPowerKw: number;
  batterySocPct: number;
  batteryVoltageV: number;
  batteryCurrentA: number;
  batteryTempC: number;
  fuelFlowKgHr: number;
  cumFuelBurnKg: number;
  vibrationG: number;
  detectedPhase: FlightPhaseType;
  phaseConfidence: number;
  derived: FrameDerivedPhysics;
  flags: string[];
}

export interface TimelineSegment {
  id: string;
  phase: FlightPhaseType;
  startIndex: number;
  endIndex: number;
  startTimeIso: string;
  endTimeIso: string;
  durationSec: number;
  durationMin: number;
  durationHr: number;
  startAltitudeM: number;
  endAltitudeM: number;
  minAltitudeM: number;
  maxAltitudeM: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  distanceKm: number;
  avgEngineKw: number;
  avgMotorKw: number;
  avgTotalPowerKw: number;
  peakPowerKw: number;
  fuelBurnedKg: number;
  batteryEnergyKwh: number;
  startSocPct: number;
  endSocPct: number;
  socDeltaPct: number;
  avgLOverD: number;
  avgSfcKgKwh: number;
  thermalMaxTempC: number;
}

export interface MissionTimeline {
  startTimeIso: string;
  endTimeIso: string;
  totalDurationSec: number;
  totalDurationMin: number;
  totalDurationHr: number;
  totalDistanceKm: number;
  totalDistanceNm: number;
  segments: TimelineSegment[];
}

export interface AnalysisEnergyBalance {
  totalFuelKwh: number;
  batteryEnergyKwh: number;
  mechanicalWorkKwh: number;
  electricalLossesKwh: number;
  thermalLossesKwh: number;
  balanceErrorPct: number;
}

export interface MissionAnalysisResult {
  metadata: {
    analyzedAt: string;
    datasetName: string;
    totalRawFrames: number;
    usableFrames: number;
    dataQualityScorePct: number;
  };
  validation: ValidationReport;
  timeline: MissionTimeline;
  normalizedFrames: NormalizedFrame[];
  summaryMetrics: {
    totalDistanceKm: number;
    totalDurationHr: number;
    avgCruiseSpeedKmh: number;
    maxAltitudeM: number;
    avgAltitudeM: number;
    totalFuelBurnKg: number;
    totalBatteryEnergyKwh: number;
    initialSocPct: number;
    finalSocPct: number;
    peakPowerKw: number;
    avgSystemEfficiencyPct: number;
    avgLOverD: number;
    breguetEstimatedEnduranceHr: number;
    energyBalance: AnalysisEnergyBalance;
    phaseDurationsHr: Record<FlightPhaseType, number>;
    phaseFuelKg: Record<FlightPhaseType, number>;
    phaseEnergyKwh: Record<FlightPhaseType, number>;
  };
  missingInputs: string[];
  recommendations: string[];
}
