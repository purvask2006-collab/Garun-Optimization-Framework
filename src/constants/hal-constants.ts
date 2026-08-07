export const HAL_ORGANIZATION = {
  name: 'Hindustan Aeronautics Limited',
  division: 'Aero Engine Research & Design Centre (AERDC)',
  location: 'Bengaluru, India',
  certificationStandard: 'FAR CS-23 / DEF-STAN 00-970'
};

export const DEFAULT_HAL_AIRCRAFT = [
  {
    id: 'hal-garun-01',
    name: 'HAL Garun Hybrid-UAV',
    type: 'HYBRID-ELECTRIC MALE UAV',
    mtowKg: 982,
    payloadKg: 350,
    maxAltitudeFt: 9843,
    cruiseAltitudeM: 3000,
    cruiseAltitudeFt: 9843,
    enduranceHours: 9.2,
    enduranceHr: 9.2,
    powertrainType: 'Series Hybrid',
    hybridArchitecture: 'Honeywell LTS101-750 class 75kW Turboshaft + 65kW PMSM Motor',
    enginePowerKw: 75,
    batteryCapacityKwh: 22,
    batteryChemistry: 'LiPo (NMC)',
    busVoltageV: 400,
    motorCount: 1,
    maxSpeedKm: 340,
    cruiseSpeedKm: 220
  },
  {
    id: 'hal-htt40-hybrid',
    name: 'HTT-40 Electric Variant',
    type: 'TRAINER / LIGHT ATTACK',
    mtowKg: 2800,
    payloadKg: 500,
    maxAltitudeFt: 32000,
    enduranceHours: 6,
    powertrainType: 'Parallel Hybrid Turboprop',
    hybridArchitecture: 'Honeywell TPE331 + 150kW Booster Motor',
    maxSpeedKm: 450,
    cruiseSpeedKm: 320
  },
  {
    id: 'hal-luh-ev',
    name: 'LUH Light Utility Electric',
    type: 'HYBRID ROTORCRAFT',
    mtowKg: 3150,
    payloadKg: 1000,
    maxAltitudeFt: 22000,
    enduranceHours: 4.5,
    powertrainType: 'Series Hybrid Turboshaft',
    hybridArchitecture: 'Ardiden 1U Turboshaft + 200kW Direct Drive Motor',
    maxSpeedKm: 260,
    cruiseSpeedKm: 220
  },
  {
    id: 'hal-tapas-bh01',
    name: 'TAPAS-BH-201 Extended Range',
    type: 'MALE RECONNAISSANCE',
    mtowKg: 3100,
    payloadKg: 350,
    maxAltitudeFt: 30000,
    enduranceHours: 24,
    powertrainType: 'Dual Diesel-Electric Hybrid',
    hybridArchitecture: 'Dual Austro Engine AE300 + 80kW Generator',
    maxSpeedKm: 225,
    cruiseSpeedKm: 180
  }
];

export const HAL_AIRCRAFT_LIBRARY = DEFAULT_HAL_AIRCRAFT;

export const DEFAULT_MISSION_PROFILES = [
  {
    id: 'mp-recon-01',
    name: 'High-Altitude Border Reconnaissance',
    category: 'RECONNAISSANCE',
    durationMinutes: 480,
    cruiseAltitudeFt: 28000,
    payloadWeightKg: 220,
    waypointsCount: 14
  },
  {
    id: 'mp-patrol-02',
    name: 'Maritime SAR & Coastal Surveillance',
    category: 'SURVEILLANCE',
    durationMinutes: 600,
    cruiseAltitudeFt: 15000,
    payloadWeightKg: 310,
    waypointsCount: 22
  },
  {
    id: 'mp-[#cargo-03]',
    name: 'High-Altitude Logistics Cargo Drop',
    category: 'LOGISTICS',
    durationMinutes: 240,
    cruiseAltitudeFt: 22000,
    payloadWeightKg: 400,
    waypointsCount: 8
  },
  {
    id: 'mp-strike-04',
    name: 'Tactical Precision Escort Mission',
    category: 'STRIKE',
    durationMinutes: 180,
    cruiseAltitudeFt: 18000,
    payloadWeightKg: 280,
    waypointsCount: 12
  }
];
