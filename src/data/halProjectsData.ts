export interface HalProject {
  id: string;
  name: string;
  codeName: string;
  category: 'UAV' | 'HELICOPTER' | 'ENGINE_TESTBED' | 'TRANSPORT' | 'STEALTH_UCAV' | 'SWARM';
  description: string;
  currentArchitecture: string;
  proposedHybridArchitecture: string;
  baselineMtowKg: number;
  baselinePowerKw: number;
  baselineSfcGkwh: number;
  baselineEnduranceHr: number;
  baselineRangeKm: number;
  compatibilityScore: number; // 0 - 100
  compatibilityRating: 'EXCELLENT' | 'HIGH' | 'MODERATE' | 'REQUIRES_REDESIGN';
  thermalCompatibilityPct: number;
  structuralFeasibilityPct: number;
  electricalVoltageV: number;
  recommendedBatteryKg: number;
  recommendedHybridSplitPct: number;
  adaptationBenefits: {
    enduranceGainPct: number;
    sfcReductionPct: number;
    payloadIncreaseKg: number;
    acousticReductionDb: number;
  };
  keySpecs: {
    role: string;
    primaryPowerplant: string;
    electricAssistPowerKw: number;
    cruiseSpeedKts: number;
    serviceCeilingM: number;
    stealthRating: string;
  };
}

export const HAL_PROJECTS: HalProject[] = [
  {
    id: 'GARUN',
    name: 'GARUN Heavy MALE UAV',
    codeName: 'HAL-GARUN-H1',
    category: 'UAV',
    description: 'Gas Turbine + Li-Sulfur Hybrid Heavy High-Altitude Long-Endurance (MALE) Unmanned Aerial Vehicle engineered for persistent maritime surveillance.',
    currentArchitecture: 'Parallel Hybrid Gas-Turbine + Li-Sulfur Battery',
    proposedHybridArchitecture: 'Dual-Spool High-Efficiency Parallel Electric Boost',
    baselineMtowKg: 950,
    baselinePowerKw: 220,
    baselineSfcGkwh: 185,
    baselineEnduranceHr: 12.5,
    baselineRangeKm: 2400,
    compatibilityScore: 98,
    compatibilityRating: 'EXCELLENT',
    thermalCompatibilityPct: 96,
    structuralFeasibilityPct: 99,
    electricalVoltageV: 800,
    recommendedBatteryKg: 180,
    recommendedHybridSplitPct: 45,
    adaptationBenefits: {
      enduranceGainPct: 38.5,
      sfcReductionPct: 22.4,
      payloadIncreaseKg: 65,
      acousticReductionDb: 14.2
    },
    keySpecs: {
      role: 'Deep Maritime Reconnaissance',
      primaryPowerplant: '220 kW Micro-Turboprop + 90 kW Electric Motor',
      electricAssistPowerKw: 90,
      cruiseSpeedKts: 165,
      serviceCeilingM: 9500,
      stealthRating: 'Medium-Low RCS'
    }
  },
  {
    id: 'CATS_WARRIOR',
    name: 'CATS Warrior Loyal Wingman',
    codeName: 'HAL-CATS-W1',
    category: 'STEALTH_UCAV',
    description: 'Unmanned Combat Aerial Vehicle designed to operate alongside manned fighters (Tejas/AMCA) in networked tactical strike formations.',
    currentArchitecture: 'Twin PTA-7E Turbojet / Micro-Turbofan',
    proposedHybridArchitecture: 'Turbo-Electric High-Power Pulse Power Hybrid',
    baselineMtowKg: 1300,
    baselinePowerKw: 380,
    baselineSfcGkwh: 210,
    baselineEnduranceHr: 4.5,
    baselineRangeKm: 850,
    compatibilityScore: 91,
    compatibilityRating: 'EXCELLENT',
    thermalCompatibilityPct: 89,
    structuralFeasibilityPct: 92,
    electricalVoltageV: 750,
    recommendedBatteryKg: 220,
    recommendedHybridSplitPct: 35,
    adaptationBenefits: {
      enduranceGainPct: 28.0,
      sfcReductionPct: 18.2,
      payloadIncreaseKg: 120,
      acousticReductionDb: 18.0
    },
    keySpecs: {
      role: 'Autonomous Strike & Loyal Wingman',
      primaryPowerplant: 'Twin PTA-7E Modified + High Energy Supercapacitors',
      electricAssistPowerKw: 140,
      cruiseSpeedKts: 380,
      serviceCeilingM: 12000,
      stealthRating: 'Very Low RCS (VLO)'
    }
  },
  {
    id: 'ALFA',
    name: 'ALFA Swarm Munition UAV',
    codeName: 'HAL-ALFA-S',
    category: 'SWARM',
    description: 'Air-Launched Flexible Asset (ALFA-S) miniaturized swarm drone for saturation attacks and high-risk electronic warfare mission profiles.',
    currentArchitecture: 'Single Electric / Mini Gas Turbine',
    proposedHybridArchitecture: 'All-Electric High Density Solid-State Swarm Propulsion',
    baselineMtowKg: 45,
    baselinePowerKw: 12,
    baselineSfcGkwh: 280,
    baselineEnduranceHr: 1.8,
    baselineRangeKm: 180,
    compatibilityScore: 86,
    compatibilityRating: 'HIGH',
    thermalCompatibilityPct: 94,
    structuralFeasibilityPct: 82,
    electricalVoltageV: 400,
    recommendedBatteryKg: 14,
    recommendedHybridSplitPct: 70,
    adaptationBenefits: {
      enduranceGainPct: 45.0,
      sfcReductionPct: 34.0,
      payloadIncreaseKg: 8,
      acousticReductionDb: 22.5
    },
    keySpecs: {
      role: 'Swarm Suppression & Recon',
      primaryPowerplant: 'Compact High-RPM Brushless Motor + Thermal Generator',
      electricAssistPowerKw: 10,
      cruiseSpeedKts: 110,
      serviceCeilingM: 4500,
      stealthRating: 'Ultra-Low Thermal / IR'
    }
  },
  {
    id: 'TAPAS',
    name: 'TAPAS BH-201 MALE UAV',
    codeName: 'HAL-TAPAS-201',
    category: 'UAV',
    description: 'Tactical Airborne Platform for Aerial Surveillance MALE UAV designed for 24-hour border security and reconnaissance operations.',
    currentArchitecture: 'Twin Saturn 36MT Turboprop Engines',
    proposedHybridArchitecture: 'Twin Gas-Turbine Parallel Electric Boost Hybrid',
    baselineMtowKg: 1800,
    baselinePowerKw: 215,
    baselineSfcGkwh: 230,
    baselineEnduranceHr: 18.0,
    baselineRangeKm: 1000,
    compatibilityScore: 88,
    compatibilityRating: 'HIGH',
    thermalCompatibilityPct: 87,
    structuralFeasibilityPct: 90,
    electricalVoltageV: 800,
    recommendedBatteryKg: 240,
    recommendedHybridSplitPct: 30,
    adaptationBenefits: {
      enduranceGainPct: 24.5,
      sfcReductionPct: 16.8,
      payloadIncreaseKg: 90,
      acousticReductionDb: 11.0
    },
    keySpecs: {
      role: 'Border & Overland MALE ISR',
      primaryPowerplant: 'Twin 100 HP Turboprops + Dual 40 kW Motors',
      electricAssistPowerKw: 80,
      cruiseSpeedKts: 135,
      serviceCeilingM: 9000,
      stealthRating: 'Standard Conventional'
    }
  },
  {
    id: 'LUH',
    name: 'LUH Light Utility Helicopter',
    codeName: 'HAL-LUH-3T',
    category: 'HELICOPTER',
    description: '3-Ton class single-engine light utility helicopter designed for operation in high-altitude Himalayan sectors (Siachen / Ladakh).',
    currentArchitecture: 'Single Safran Ardiden 1U Turboshaft Engine',
    proposedHybridArchitecture: 'Turboshaft + Emergency Reserve Electric Autorotation Assist',
    baselineMtowKg: 3150,
    baselinePowerKw: 750,
    baselineSfcGkwh: 265,
    baselineEnduranceHr: 3.5,
    baselineRangeKm: 350,
    compatibilityScore: 84,
    compatibilityRating: 'HIGH',
    thermalCompatibilityPct: 82,
    structuralFeasibilityPct: 86,
    electricalVoltageV: 600,
    recommendedBatteryKg: 160,
    recommendedHybridSplitPct: 25,
    adaptationBenefits: {
      enduranceGainPct: 19.0,
      sfcReductionPct: 14.2,
      payloadIncreaseKg: 110,
      acousticReductionDb: 9.5
    },
    keySpecs: {
      role: 'High-Altitude Troop & Cargo Lift',
      primaryPowerplant: 'Ardiden 1U (750 kW) + 120 kW Peak Electric Boost',
      electricAssistPowerKw: 120,
      cruiseSpeedKts: 120,
      serviceCeilingM: 6500,
      stealthRating: 'Low Radar Signature'
    }
  },
  {
    id: 'IMRH',
    name: 'IMRH Multi-Role Helicopter',
    codeName: 'HAL-IMRH-13T',
    category: 'HELICOPTER',
    description: '13-Ton multi-role twin-engine helicopter intended to replace Mi-17 fleets for tactical assault, air logistics, and maritime ops.',
    currentArchitecture: 'Twin 2000 kW High-Power Turboshaft Engines',
    proposedHybridArchitecture: 'Twin Turboshaft + Hybrid Electric Cruise Shutoff Architecture',
    baselineMtowKg: 13000,
    baselinePowerKw: 4000,
    baselineSfcGkwh: 240,
    baselineEnduranceHr: 4.0,
    baselineRangeKm: 800,
    compatibilityScore: 79,
    compatibilityRating: 'MODERATE',
    thermalCompatibilityPct: 78,
    structuralFeasibilityPct: 80,
    electricalVoltageV: 1000,
    recommendedBatteryKg: 650,
    recommendedHybridSplitPct: 20,
    adaptationBenefits: {
      enduranceGainPct: 22.0,
      sfcReductionPct: 17.5,
      payloadIncreaseKg: 350,
      acousticReductionDb: 8.0
    },
    keySpecs: {
      role: 'Heavy Multi-Role Transport & Assault',
      primaryPowerplant: 'Twin Turboshaft (4000 kW) + 300 kW APU Electric Generator',
      electricAssistPowerKw: 300,
      cruiseSpeedKts: 140,
      serviceCeilingM: 6000,
      stealthRating: 'Military Tactical Standard'
    }
  },
  {
    id: 'HTFE_25',
    name: 'HTFE-25 Turbofan Engine',
    codeName: 'HAL-HTFE-25KN',
    category: 'ENGINE_TESTBED',
    description: '25 kN Thrust Turbofan Engine designed for business jets, trainer aircraft, and heavy unmanned combat aircraft.',
    currentArchitecture: 'Twin-Spool Bypass Turbofan',
    proposedHybridArchitecture: 'Hybrid High-Pressure Spool Motor/Generator Embedded Architecture',
    baselineMtowKg: 4200,
    baselinePowerKw: 2500,
    baselineSfcGkwh: 195,
    baselineEnduranceHr: 5.2,
    baselineRangeKm: 1600,
    compatibilityScore: 92,
    compatibilityRating: 'EXCELLENT',
    thermalCompatibilityPct: 95,
    structuralFeasibilityPct: 89,
    electricalVoltageV: 800,
    recommendedBatteryKg: 320,
    recommendedHybridSplitPct: 35,
    adaptationBenefits: {
      enduranceGainPct: 31.0,
      sfcReductionPct: 20.5,
      payloadIncreaseKg: 210,
      acousticReductionDb: 15.0
    },
    keySpecs: {
      role: 'Core Engine Testbed & Jet Trainer Propulsion',
      primaryPowerplant: '25 kN Turbofan + HP Shaft Integrated Starter-Generator',
      electricAssistPowerKw: 200,
      cruiseSpeedKts: 420,
      serviceCeilingM: 11000,
      stealthRating: 'Low IR Exhaust Masking'
    }
  },
  {
    id: 'HTSE_1200',
    name: 'HTSE-1200 Turboshaft Engine',
    codeName: 'HAL-HTSE-1200KW',
    category: 'ENGINE_TESTBED',
    description: '1200 kW Turboshaft Engine test platform engineered for 3.5 to 6-ton indigenous helicopters and turboprop aircraft.',
    currentArchitecture: 'Free Turbine Turboshaft Engine',
    proposedHybridArchitecture: 'Direct-Drive Hybrid Electric Auxiliary Boost Unit',
    baselineMtowKg: 5500,
    baselinePowerKw: 1200,
    baselineSfcGkwh: 225,
    baselineEnduranceHr: 4.8,
    baselineRangeKm: 700,
    compatibilityScore: 95,
    compatibilityRating: 'EXCELLENT',
    thermalCompatibilityPct: 93,
    structuralFeasibilityPct: 97,
    electricalVoltageV: 700,
    recommendedBatteryKg: 210,
    recommendedHybridSplitPct: 30,
    adaptationBenefits: {
      enduranceGainPct: 27.5,
      sfcReductionPct: 19.2,
      payloadIncreaseKg: 140,
      acousticReductionDb: 12.8
    },
    keySpecs: {
      role: 'Indigenous Helicopter Engine Test Platform',
      primaryPowerplant: '1200 kW Free Turboshaft + 150 kW Permanent Magnet Motor',
      electricAssistPowerKw: 150,
      cruiseSpeedKts: 150,
      serviceCeilingM: 7000,
      stealthRating: 'Low Acoustic Rotor Signature'
    }
  },
  {
    id: 'RTA_90',
    name: 'RTA-90 Regional Transport',
    codeName: 'HAL-RTA-90P',
    category: 'TRANSPORT',
    description: '90-Seater Regional Transport Aircraft designed for civil regional connectivity (UDAN) and military transport derivatives.',
    currentArchitecture: 'Twin High-Efficiency Turboprops',
    proposedHybridArchitecture: 'Parallel Turbo-Electric Distributed Propulsion (DEP) Wing Pods',
    baselineMtowKg: 28000,
    baselinePowerKw: 9000,
    baselineSfcGkwh: 175,
    baselineEnduranceHr: 6.5,
    baselineRangeKm: 2200,
    compatibilityScore: 74,
    compatibilityRating: 'REQUIRES_REDESIGN',
    thermalCompatibilityPct: 76,
    structuralFeasibilityPct: 72,
    electricalVoltageV: 1200,
    recommendedBatteryKg: 1800,
    recommendedHybridSplitPct: 22,
    adaptationBenefits: {
      enduranceGainPct: 18.2,
      sfcReductionPct: 15.0,
      payloadIncreaseKg: 850,
      acousticReductionDb: 10.5
    },
    keySpecs: {
      role: 'Commercial Regional Airliner & Tactical Airlift',
      primaryPowerplant: 'Twin 4500 kW Turboprops + Distributed Wingtip Motors',
      electricAssistPowerKw: 800,
      cruiseSpeedKts: 320,
      serviceCeilingM: 8500,
      stealthRating: 'Civil Airline Standard'
    }
  },
  {
    id: 'GHATAK',
    name: 'Ghatak Stealth UCAV',
    codeName: 'HAL-GHATAK-ST',
    category: 'STEALTH_UCAV',
    description: 'Autonomous Flying-Wing Stealth Combat Unmanned Aircraft powered by GTRE Kaveri derivative engine for deep penetrating strikes.',
    currentArchitecture: 'Dry Kaveri Turbofan (Non-Afterburning)',
    proposedHybridArchitecture: 'Stealth Energy-Storage Turbo-Electric Pulse Laser Hybrid',
    baselineMtowKg: 7800,
    baselinePowerKw: 5200,
    baselineSfcGkwh: 205,
    baselineEnduranceHr: 6.0,
    baselineRangeKm: 1800,
    compatibilityScore: 90,
    compatibilityRating: 'EXCELLENT',
    thermalCompatibilityPct: 91,
    structuralFeasibilityPct: 89,
    electricalVoltageV: 900,
    recommendedBatteryKg: 450,
    recommendedHybridSplitPct: 40,
    adaptationBenefits: {
      enduranceGainPct: 35.0,
      sfcReductionPct: 21.0,
      payloadIncreaseKg: 420,
      acousticReductionDb: 25.0
    },
    keySpecs: {
      role: 'Deep Strike Autonomous UCAV',
      primaryPowerplant: '52 kN Dry Turbofan + 250 kW Energy System Generator',
      electricAssistPowerKw: 250,
      cruiseSpeedKts: 460,
      serviceCeilingM: 14000,
      stealthRating: 'Ultra Stealth Flying-Wing'
    }
  },
  {
    id: 'KAVERI',
    name: 'Kaveri GTRE Engine',
    codeName: 'GTRE-KAVERI-GT',
    category: 'ENGINE_TESTBED',
    description: 'Indigenous Gas Turbine Research Establishment (GTRE) twin-spool low-bypass turbofan testbed for fighter and drone propulsion.',
    currentArchitecture: 'Dry / Wet Low Bypass Turbofan Engine',
    proposedHybridArchitecture: 'High Voltage DC Hybrid-Shaft Co-Generation Engine',
    baselineMtowKg: 6200,
    baselinePowerKw: 4800,
    baselineSfcGkwh: 198,
    baselineEnduranceHr: 4.2,
    baselineRangeKm: 1400,
    compatibilityScore: 93,
    compatibilityRating: 'EXCELLENT',
    thermalCompatibilityPct: 97,
    structuralFeasibilityPct: 90,
    electricalVoltageV: 850,
    recommendedBatteryKg: 380,
    recommendedHybridSplitPct: 35,
    adaptationBenefits: {
      enduranceGainPct: 29.5,
      sfcReductionPct: 19.8,
      payloadIncreaseKg: 280,
      acousticReductionDb: 16.5
    },
    keySpecs: {
      role: 'Fighter & UCAV Gas Turbine Core Unit',
      primaryPowerplant: '52 kN Thrust Dry Kaveri + High Voltage Direct-Drive Motor',
      electricAssistPowerKw: 220,
      cruiseSpeedKts: 480,
      serviceCeilingM: 13500,
      stealthRating: 'Shielded IR Nozzle'
    }
  }
];
