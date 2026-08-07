export interface TelemetryFrame {
  timestamp: string;
  altitudeFt: number;
  machNumber: number;
  batterySocPct: number;
  batteryTempC: number;
  iceRpm: number;
  icePowerKw: number;
  motorRpm: number;
  motorPowerKw: number;
  powerSplitRatio: number;
  systemEfficiencyPct: number;
  cabinPressurePsi: number;
  vibrationG: number;
  batterySOC?: number;
  overallEfficiencyPct?: number;
  missionPhase?: string;
  altitudeM?: number;
  airspeedKts?: number;
  airspeedKmh?: number;
  tetKelvin?: number;
  busCurrentA?: number;
  fuelFlowKgHr?: number;
  engine?: {
    powerKw?: number;
    loadFraction?: number;
    rpmPercent?: number;
    sfcKgKwh?: number;
    tetKelvin?: number;
    rpm?: number;
    egtCelsius?: number;
    fuelMassKg?: number;
    sfcGkwh?: number;
    fuelBurnRateKgHr?: number;
  };
  battery?: {
    socPercent?: number;
    socPct?: number;
    powerKw?: number;
    currentA?: number;
    tempCelsius?: number;
    voltageV?: number;
    cellTempAvgC?: number;
    dischargeKw?: number;
    packVoltageV?: number;
    currentDrawA?: number;
    remainingKwh?: number;
    status?: string;
  };
}

export interface AircraftPlatform {
  id: string;
  name: string;
  type: string;
  mtowKg: number;
  payloadKg: number;
  maxAltitudeFt: number;
  enduranceHours: number;
  powertrainType: string;
  hybridArchitecture: string;
  maxSpeedKm: number;
  cruiseSpeedKm: number;
  wingspanM?: number;
  emptyWeightKg?: number;
  batteryChemistry?: string;
  engineModel?: string;
  maxAltitudeM?: number;
}

export interface MissionProfile {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  cruiseAltitudeFt: number;
  payloadWeightKg: number;
  waypointsCount: number;
  payloadCapacityKg?: number;
}
