import { create } from 'zustand';
import { DEFAULT_HAL_AIRCRAFT, DEFAULT_MISSION_PROFILES } from '../constants/hal-constants';
import { ModuleId } from '../types/ui';
import { AircraftPlatform, MissionProfile, TelemetryFrame } from '../types/telemetry';

export type ActiveModule =
  | ModuleId
  | 'dashboard'
  | 'hal'
  | 'knowledge';

export interface SimulationResult {
  totalFuelBurnKg: number;
  batteryEnergyUsedKwh: number;
  totalEnduranceHours: number;
  peakPowerKw?: number;
  averageSfcKgKwh?: number;
  peakPowerSplitPct?: number;
  co2EmissionsSavedKg?: number;
  thermalMarginC?: number;
  cs23ComplianceStatus?: string;
  missionPhases?: Array<{ phase: string; durationHr: number; powerKw: number }>;
}

export interface OptimizationResult {
  generation: number;
  paretoSolutionsCount: number;
  bestSfcKgKwh: number;
  bestEnduranceHr?: number;
  bestBatteryKwh?: number;
  bestEngineKw?: number;
  bestWeightKg?: number;
  convergenceStatus?: 'running' | 'converged' | 'stalled' | 'idle';
  hypervolume?: number;
  paretoPoints?: Array<{ id: number; sfcKgKwh: number; weightKg: number; enduranceHr: number; paretoOptimal: boolean }>;
}

export interface GarunStoreState {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  selectedAircraft: AircraftPlatform;
  setSelectedAircraft: (aircraft: AircraftPlatform) => void;
  selectedMissionProfile: MissionProfile;
  setSelectedMissionProfile: (profile: MissionProfile) => void;
  simulationResult: SimulationResult | null;
  optimizationRun: OptimizationResult | null;
  activeTelemetryFrame: TelemetryFrame;
  simulationParams: {
    powerSplitRatio: number;
    targetAltitudeFt: number;
    ambientTempC: number;
    cruiseMach: number;
    iceRpmTarget: number;
    payloadKg: number;
    cruiseAltitudeM: number;
    cruiseAirspeedKts: number;
    hybridRatioCruisePct: number;
    batteryCapacityKwh: number;
    motorKw?: number;
    engineKw?: number;
  };
  updateSimulationParams: (params: Partial<GarunStoreState['simulationParams']>) => void;
  vehicleInputs: {
    mtow_kg: number;
    payload_kg: number;
    wing_area_m2: number;
    aspect_ratio: number;
    cruise_speed_kmh: number;
    loiter_speed_kmh: number;
    cruise_alt_m: number;
    loiter_alt_m: number;
    cd0: number;
    oswald_e: number;
    eta_prop: number;
  };
  updateVehicleInputs: (params: Partial<GarunStoreState['vehicleInputs']>) => void;
  isTelemetryLive: boolean;
  setIsTelemetryLive: (live: boolean) => void;
  digitalTwinViewMode: string;
  setDigitalTwinViewMode: (mode: string) => void;
  updateTelemetryFrame: (frame: Partial<TelemetryFrame>) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isTelemetryDrawerOpen: boolean;
  setTelemetryDrawerOpen: (open: boolean) => void;
  updateBatterySOC: (powerDrawKw: number, deltaTimeSeconds: number) => void;
  systemMetrics: {
    cpuLoadPct: number;
    hilLatencyMs: number;
    busVoltageV: number;
    busCurrentA: number;
  };
}

export const useGarunStore = create<GarunStoreState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (activeModule) => set({ activeModule }),
  selectedAircraft: DEFAULT_HAL_AIRCRAFT[0],
  setSelectedAircraft: (selectedAircraft) => set({ selectedAircraft }),
  selectedMissionProfile: DEFAULT_MISSION_PROFILES[0],
  setSelectedMissionProfile: (selectedMissionProfile) => set({ selectedMissionProfile }),
  simulationResult: {
    totalFuelBurnKg: 248, // GARUN design spec
    batteryEnergyUsedKwh: 22, // GARUN design spec
    peakPowerSplitPct: 42,
    co2EmissionsSavedKg: 98.4,
    thermalMarginC: 18.2,
    cs23ComplianceStatus: 'PASS',
    totalEnduranceHours: 9.2 // GARUN design spec
  },
  optimizationRun: {
    generation: 150,
    paretoSolutionsCount: 24,
    bestSfcKgKwh: 0.215,
    bestWeightKg: 982 // GARUN design spec
  },
  activeTelemetryFrame: {
    timestamp: '14:32:08 UTC',
    altitudeFt: 9843, // GARUN design spec
    altitudeM: 3000, // GARUN design spec
    airspeedKts: 180,
    machNumber: 0.32,
    batterySocPct: 80.0, // GARUN design spec - LiPo chemistry baseline
    batterySOC: 80.0, // GARUN design spec
    batteryTempC: 38.5,
    iceRpm: 4200,
    icePowerKw: 63.2, // GARUN design spec (63.2 kW at 3000m altitude / 75 kW SL)
    motorRpm: 3100,
    motorPowerKw: 65, // GARUN design spec
    powerSplitRatio: 0.35,
    systemEfficiencyPct: 91.2,
    overallEfficiencyPct: 91.2,
    cabinPressurePsi: 11.4,
    vibrationG: 0.12,
    missionPhase: 'CRUISE',
    engine: {
      powerKw: 63.2, // GARUN design spec
      rpm: 5450,
      egtCelsius: 720,
      fuelMassKg: 248, // GARUN design spec
      sfcGkwh: 450 // GARUN design spec
    },
    battery: {
      socPct: 80.0, // GARUN design spec - LiPo chemistry baseline
      cellTempAvgC: 38.2,
      dischargeKw: 22.0, // GARUN design spec
      packVoltageV: 400.0, // GARUN design spec
      currentDrawA: 55.0, // GARUN design spec
      status: 'NOMINAL'
    }
  },
  simulationParams: {
    powerSplitRatio: 0.35,
    targetAltitudeFt: 9843, // GARUN design spec
    ambientTempC: -35,
    cruiseMach: 0.32,
    iceRpmTarget: 4200,
    payloadKg: 200, // Aligned with competition spec (200kg)
    cruiseAltitudeM: 3000, // GARUN design spec
    cruiseAirspeedKts: 180,
    hybridRatioCruisePct: 35,
    batteryCapacityKwh: 22, // GARUN design spec
    motorKw: 55, // GARUN design spec
    engineKw: 60  // GARUN design spec
  },
  updateSimulationParams: (params) =>
    set((state) => ({
      simulationParams: { ...state.simulationParams, ...params },
      vehicleInputs: {
        ...state.vehicleInputs,
        ...(params.payloadKg !== undefined ? { payload_kg: params.payloadKg } : {}),
        ...(params.cruiseAltitudeM !== undefined ? { cruise_alt_m: params.cruiseAltitudeM } : {}),
      },
    })),
  vehicleInputs: {
    mtow_kg: 1000,        // competition specification
    payload_kg: 200,      // competition specification
    wing_area_m2: 15,     // assumption
    aspect_ratio: 12,     // assumption
    cruise_speed_kmh: 250,// competition specification
    loiter_speed_kmh: 150,// assumption
    cruise_alt_m: 3000,   // team decision
    loiter_alt_m: 3000,   // team decision
    cd0: 0.022,           // clean fixed-wing MALE UAV assumption
    oswald_e: 0.82,       // span efficiency assumption
    eta_prop: 0.82,       // propeller efficiency assumption
  },
  updateVehicleInputs: (params) =>
    set((state) => ({
      vehicleInputs: { ...state.vehicleInputs, ...params },
      // keep simulationParams payload and altitude in sync if updated
      simulationParams: {
        ...state.simulationParams,
        ...(params.payload_kg !== undefined ? { payloadKg: params.payload_kg } : {}),
        ...(params.cruise_alt_m !== undefined ? { cruiseAltitudeM: params.cruise_alt_m } : {}),
      },
    })),
  isTelemetryLive: true,
  setIsTelemetryLive: (isTelemetryLive) => set({ isTelemetryLive }),
  digitalTwinViewMode: 'EXPLODED',
  setDigitalTwinViewMode: (digitalTwinViewMode) => set({ digitalTwinViewMode }),
  updateTelemetryFrame: (frame) =>
    set((state) => ({ activeTelemetryFrame: { ...state.activeTelemetryFrame, ...frame } })),
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  isTelemetryDrawerOpen: false,
  setTelemetryDrawerOpen: (isTelemetryDrawerOpen) => set({ isTelemetryDrawerOpen }),
  updateBatterySOC: (powerDrawKw, deltaTimeSeconds) =>
    set((state) => {
      const BATTERY_CAPACITY_KWH = Math.max(1, state.simulationParams.batteryCapacityKwh || 22); // dynamic battery capacity
      const SOC_MIN = 0.20; // 20% floor (Peukert reserve)
      const PEUKERT_N = 1.05;

      // Energy consumed in this time step (kWh)
      const energyConsumedKwh = powerDrawKw * (deltaTimeSeconds / 3600);

      // Peukert correction: effective consumption increases at high C-rate
      const cRate = Math.max(0.01, powerDrawKw / BATTERY_CAPACITY_KWH);
      const peukertFactor = Math.pow(cRate, PEUKERT_N - 1);
      const effectiveEnergyKwh = energyConsumedKwh * peukertFactor;

      // Current SOC
      const currentSOCVal =
        state.activeTelemetryFrame?.batterySocPct ??
        state.activeTelemetryFrame?.batterySOC ??
        state.activeTelemetryFrame?.battery?.socPct ??
        80.0;

      // Update SOC
      const newSOC = Math.max(
        SOC_MIN * 100,
        currentSOCVal - (effectiveEnergyKwh / BATTERY_CAPACITY_KWH) * 100
      );
      const roundedSOC = Math.round(newSOC * 10) / 10;

      return {
        activeTelemetryFrame: {
          ...state.activeTelemetryFrame,
          batterySocPct: roundedSOC,
          batterySOC: roundedSOC,
          battery: {
            ...state.activeTelemetryFrame?.battery,
            socPct: roundedSOC
          }
        }
      };
    }),
  systemMetrics: {
    cpuLoadPct: 24.5,
    hilLatencyMs: 1.2,
    busVoltageV: 400, // GARUN design spec
    busCurrentA: 280
  }
}));
