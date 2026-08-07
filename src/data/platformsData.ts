export interface AircraftSpecs {
  id: string;
  name: string;
  codeName: string;
  category: 'uav_male' | 'ucav_stealth' | 'vtol_cargo' | 'helicopter' | 'demonstrator' | 'transport' | 'custom';
  status: string;
  isDefault?: boolean;
  description: string;
  
  // Weight Breakdown (kg)
  weight: {
    emptyWeightKg: number;
    mtowKg: number;
    maxFuelKg: number;
    batteryPackKg: number;
    usefulLoadKg: number;
  };
  
  // Payload Specifications
  payload: {
    maxPayloadKg: number;
    standardPayload: string;
    sensorsAndAvionics: string[];
    hardpointsCount?: number;
  };
  
  // Speed & Flight Performance
  cruise: {
    cruiseSpeedKmh: number;
    maxSpeedKmh: number;
    stallSpeedKmh: number;
    climbRateMs: number;
  };
  
  // Range & Endurance
  range: {
    maxRangeKm: number;
    combatRadiusKm: number;
    loiterTimeHr: number;
    ferryRangeKm: number;
  };
  
  // Altitude Specs
  altitude: {
    cruiseAltitudeM: number;
    serviceCeilingM: number;
    takeoffDistanceM: number;
  };
  
  // Powerplant & Propulsion System
  powerplant: {
    type: string;
    hybridArchitecture: 'Series' | 'Parallel' | 'Series-Parallel' | 'Pure Electric' | 'Conventional Turboshaft' | 'Turbofan';
    engineRatingKw: number;
    generatorRatingKw: number;
    motorRatingKw: number;
    batteryCapacityKwh: number;
    batteryChemistry: string;
    specificFuelConsumptionKgKwh: number;
  };
  
  // Mission & Operational Profile
  mission: {
    primaryMission: string;
    threatEnvironment: 'Low' | 'Medium' | 'High' | 'Severe';
    operatingTempRangeC: string;
    allWeatherCapability: boolean;
    stealthFeatures: string[];
  };
  
  // Aerodynamic & Structural Configuration
  configuration: {
    wingspanM: number;
    wingAreaM2: number;
    aspectRatio: number;
    parasiteDragCd0: number;
    fuselageLengthM: number;
    airfoilType: string;
  };
}

export const PLATFORMS_DATA: AircraftSpecs[] = [
  {
    id: 'comp_uav',
    name: 'Competition UAV (Default)',
    codeName: 'PS1-HYBRID-MALE',
    category: 'uav_male',
    status: 'HAL Aerothon Baseline Reference',
    isDefault: true,
    description: 'Reference 1000kg class MALE UAV utilizing a Series Hybrid-Electric propulsion architecture designed for 8+ hour persistent ISR missions.',
    weight: {
      emptyWeightKg: 520,
      mtowKg: 1000,
      maxFuelKg: 200,
      batteryPackKg: 80,
      usefulLoadKg: 480
    },
    payload: {
      maxPayloadKg: 200,
      standardPayload: 'EO/IR Turret + Synthetic Aperture Radar (SAR) + COMINT',
      sensorsAndAvionics: ['High-Def EO/IR Pod', 'X-band Lightweight SAR', 'Satellite Datalink', 'Triple-Redundant Flight Control'],
      hardpointsCount: 2
    },
    cruise: {
      cruiseSpeedKmh: 250,
      maxSpeedKmh: 320,
      stallSpeedKmh: 95,
      climbRateMs: 8.5
    },
    range: {
      maxRangeKm: 2000,
      combatRadiusKm: 500,
      loiterTimeHr: 8.5,
      ferryRangeKm: 2400
    },
    altitude: {
      cruiseAltitudeM: 6000,
      serviceCeilingM: 9000,
      takeoffDistanceM: 450
    },
    powerplant: {
      type: '60 kW Turboshaft + 30 kW Permanent Magnet Generator + Lithium-Sulfur Battery',
      hybridArchitecture: 'Series',
      engineRatingKw: 60,
      generatorRatingKw: 55,
      motorRatingKw: 75,
      batteryCapacityKwh: 25,
      batteryChemistry: 'Li-S (350 Wh/kg)',
      specificFuelConsumptionKgKwh: 0.215
    },
    mission: {
      primaryMission: 'Persistent ISR & Maritime Border Patrol',
      threatEnvironment: 'Medium',
      operatingTempRangeC: '-30°C to +55°C',
      allWeatherCapability: true,
      stealthFeatures: ['Composite Airframe', 'S-Duct Intake', 'Low-IR Exhaust Diffuser']
    },
    configuration: {
      wingspanM: 14.2,
      wingAreaM2: 12.8,
      aspectRatio: 15.7,
      parasiteDragCd0: 0.018,
      fuselageLengthM: 7.8,
      airfoilType: 'NACA 64-418 High-L/D Composite'
    }
  },
  {
    id: 'garun_uav',
    name: 'GARUN UAV',
    codeName: 'HAL-GARUN-H2',
    category: 'uav_male',
    status: 'Advanced Technology Demonstrator',
    description: 'HAL flagship high-altitude hybrid UAV featuring dual-fuel/hydrogen turbogenerator technology with ultra-low acoustic signature.',
    weight: {
      emptyWeightKg: 640,
      mtowKg: 1250,
      maxFuelKg: 280,
      batteryPackKg: 110,
      usefulLoadKg: 610
    },
    payload: {
      maxPayloadKg: 250,
      standardPayload: 'AESA Radar + Multi-Spectral EO/IR + EW Suite',
      sensorsAndAvionics: ['AESA Surveillance Radar', 'Cooperative Swarm Datalink', 'Cyber-Shielded Encryption Module'],
      hardpointsCount: 4
    },
    cruise: {
      cruiseSpeedKmh: 280,
      maxSpeedKmh: 360,
      stallSpeedKmh: 105,
      climbRateMs: 11.2
    },
    range: {
      maxRangeKm: 2800,
      combatRadiusKm: 700,
      loiterTimeHr: 12.0,
      ferryRangeKm: 3200
    },
    altitude: {
      cruiseAltitudeM: 8000,
      serviceCeilingM: 11000,
      takeoffDistanceM: 400
    },
    powerplant: {
      type: 'HTSE-derived 90 kW Turbogenerator + 40 kWh Solid-State Battery',
      hybridArchitecture: 'Series-Parallel',
      engineRatingKw: 90,
      generatorRatingKw: 85,
      motorRatingKw: 110,
      batteryCapacityKwh: 40,
      batteryChemistry: 'Solid-State NMC (400 Wh/kg)',
      specificFuelConsumptionKgKwh: 0.198
    },
    mission: {
      primaryMission: 'High-Altitude Frontier Surveillance & Tactical Electronic Warfare',
      threatEnvironment: 'High',
      operatingTempRangeC: '-45°C to +50°C',
      allWeatherCapability: true,
      stealthFeatures: ['RAM Coating', 'Internal Weapons Bay', 'Acoustic Attenuation Exhaust']
    },
    configuration: {
      wingspanM: 16.8,
      wingAreaM2: 15.4,
      aspectRatio: 18.3,
      parasiteDragCd0: 0.015,
      fuselageLengthM: 8.6,
      airfoilType: 'Laminar Flow Supercritical Airfoil'
    }
  },
  {
    id: 'cats_warrior',
    name: 'HAL CATS Warrior',
    codeName: 'CATS-W-1T',
    category: 'ucav_stealth',
    status: 'Full-Scale Integration / Ground Test',
    description: 'Loyal-wingman unmanned combat vehicle designed to team with Tejas Mk1A/Mk2 fighters for high-risk strike and suppression missions.',
    weight: {
      emptyWeightKg: 850,
      mtowKg: 1800,
      maxFuelKg: 500,
      batteryPackKg: 120,
      usefulLoadKg: 950
    },
    payload: {
      maxPayloadKg: 400,
      standardPayload: '2x Smart Anti-Airfield Weapons (SAAW) + Air-to-Air Missiles',
      sensorsAndAvionics: ['MUM-T Datalink Suite', 'Passive ESM Sensor Matrix', 'Autonomous Target Recognition AI'],
      hardpointsCount: 4
    },
    cruise: {
      cruiseSpeedKmh: 850,
      maxSpeedKmh: 1050,
      stallSpeedKmh: 180,
      climbRateMs: 35.0
    },
    range: {
      maxRangeKm: 1500,
      combatRadiusKm: 600,
      loiterTimeHr: 4.5,
      ferryRangeKm: 1800
    },
    altitude: {
      cruiseAltitudeM: 10000,
      serviceCeilingM: 14000,
      takeoffDistanceM: 650
    },
    powerplant: {
      type: 'PTAE-7 Dry Turbojet + 30 kW High-Burst Assist Electric Motor',
      hybridArchitecture: 'Parallel',
      engineRatingKw: 350,
      generatorRatingKw: 25,
      motorRatingKw: 45,
      batteryCapacityKwh: 18,
      batteryChemistry: 'Li-Ion High Rate (250 Wh/kg)',
      specificFuelConsumptionKgKwh: 0.380
    },
    mission: {
      primaryMission: 'Manned-Unmanned Teaming (MUM-T), SEAD/DEAD, Decoy & Escort',
      threatEnvironment: 'Severe',
      operatingTempRangeC: '-40°C to +55°C',
      allWeatherCapability: true,
      stealthFeatures: ['Serpentine Intake', 'Chined Fuselage', 'Radar Absorbent Composites']
    },
    configuration: {
      wingspanM: 8.4,
      wingAreaM2: 18.2,
      aspectRatio: 3.88,
      parasiteDragCd0: 0.012,
      fuselageLengthM: 9.2,
      airfoilType: 'Transonic Delta Airfoil'
    }
  },
  {
    id: 'alfa_swarm',
    name: 'ALFA Swarm Drone',
    codeName: 'CATS-ALFA-S',
    category: 'ucav_stealth',
    status: 'Canister Launch Flight Trials',
    description: 'Swarm-capable loitering munition and reconnaissance drone launched from canister or combat aircraft pylons.',
    weight: {
      emptyWeightKg: 18,
      mtowKg: 35,
      maxFuelKg: 8,
      batteryPackKg: 4,
      usefulLoadKg: 17
    },
    payload: {
      maxPayloadKg: 7,
      standardPayload: 'Shaped Charge Warhead + Optical Guidance Seeker',
      sensorsAndAvionics: ['Mesh Network Swarm Transceiver', 'Optical Flow Navigation', 'AI Target Tracking'],
      hardpointsCount: 0
    },
    cruise: {
      cruiseSpeedKmh: 160,
      maxSpeedKmh: 220,
      stallSpeedKmh: 65,
      climbRateMs: 5.0
    },
    range: {
      maxRangeKm: 120,
      combatRadiusKm: 50,
      loiterTimeHr: 1.5,
      ferryRangeKm: 140
    },
    altitude: {
      cruiseAltitudeM: 2000,
      serviceCeilingM: 4000,
      takeoffDistanceM: 0
    },
    powerplant: {
      type: 'Pure Electric Brushless Motor + High-Density Lithium Polymer',
      hybridArchitecture: 'Pure Electric',
      engineRatingKw: 0,
      generatorRatingKw: 0,
      motorRatingKw: 6,
      batteryCapacityKwh: 2.4,
      batteryChemistry: 'LiPo (260 Wh/kg)',
      specificFuelConsumptionKgKwh: 0
    },
    mission: {
      primaryMission: 'Autonomous Swarm Strike & Air Defense Saturation',
      threatEnvironment: 'High',
      operatingTempRangeC: '-20°C to +50°C',
      allWeatherCapability: false,
      stealthFeatures: ['Micro Radar Cross Section', 'Ultra-Quiet Rotor Blades']
    },
    configuration: {
      wingspanM: 1.8,
      wingAreaM2: 0.45,
      aspectRatio: 7.2,
      parasiteDragCd0: 0.022,
      fuselageLengthM: 1.4,
      airfoilType: 'Foldable Low-Speed Airfoil'
    }
  },
  {
    id: 'tapas_bh201',
    name: 'TAPAS BH-201',
    codeName: 'RUSTOM-II',
    category: 'uav_male',
    status: 'Limited Series Production',
    description: 'Indigenous MALE UAV developed by ADE/DRDO with HAL as production agency, for tri-service persistent intelligence and reconnaissance.',
    weight: {
      emptyWeightKg: 1800,
      mtowKg: 2800,
      maxFuelKg: 650,
      batteryPackKg: 60,
      usefulLoadKg: 1000
    },
    payload: {
      maxPayloadKg: 350,
      standardPayload: 'ELINT + COMINT + Synthetic Aperture Radar (SAR)',
      sensorsAndAvionics: ['ADE Flight Control Computer', 'GAGAN Satellite Transceiver', 'Dual EO/IR Gimbal'],
      hardpointsCount: 2
    },
    cruise: {
      cruiseSpeedKmh: 220,
      maxSpeedKmh: 280,
      stallSpeedKmh: 110,
      climbRateMs: 6.0
    },
    range: {
      maxRangeKm: 1000,
      combatRadiusKm: 350,
      loiterTimeHr: 18.0,
      ferryRangeKm: 1200
    },
    altitude: {
      cruiseAltitudeM: 7500,
      serviceCeilingM: 8500,
      takeoffDistanceM: 700
    },
    powerplant: {
      type: 'Twin Turbocharged Piston Engines (130 hp each) + Auxiliary Generator',
      hybridArchitecture: 'Conventional Turboshaft',
      engineRatingKw: 195,
      generatorRatingKw: 15,
      motorRatingKw: 0,
      batteryCapacityKwh: 12,
      batteryChemistry: 'Li-FePO4',
      specificFuelConsumptionKgKwh: 0.240
    },
    mission: {
      primaryMission: 'Tri-Service Long Endurance Tactical ISR',
      threatEnvironment: 'Medium',
      operatingTempRangeC: '-35°C to +50°C',
      allWeatherCapability: true,
      stealthFeatures: ['Composite Wing Skins']
    },
    configuration: {
      wingspanM: 20.6,
      wingAreaM2: 24.1,
      aspectRatio: 17.6,
      parasiteDragCd0: 0.020,
      fuselageLengthM: 9.5,
      airfoilType: 'High-Lift Composite Airfoil'
    }
  },
  {
    id: 'archer_ng',
    name: 'Archer NG',
    codeName: 'ARCHER-ARMED-MALE',
    category: 'uav_male',
    status: 'User Trials / Production Prep',
    description: 'Armed MALE UAV derived from Rustom-1 lineage, optimized for precision strike and real-time battle damage assessment.',
    weight: {
      emptyWeightKg: 920,
      mtowKg: 1500,
      maxFuelKg: 380,
      batteryPackKg: 40,
      usefulLoadKg: 580
    },
    payload: {
      maxPayloadKg: 300,
      standardPayload: 'Laser Guided Rockets + Anti-Tank Guided Missiles (ATGM)',
      sensorsAndAvionics: ['Laser Target Designator', 'Real-Time Video Datalink', 'Terrain Following Sensor'],
      hardpointsCount: 4
    },
    cruise: {
      cruiseSpeedKmh: 240,
      maxSpeedKmh: 300,
      stallSpeedKmh: 100,
      climbRateMs: 7.5
    },
    range: {
      maxRangeKm: 1500,
      combatRadiusKm: 450,
      loiterTimeHr: 12.0,
      ferryRangeKm: 1800
    },
    altitude: {
      cruiseAltitudeM: 6500,
      serviceCeilingM: 9100,
      takeoffDistanceM: 520
    },
    powerplant: {
      type: 'Single Turboprop Engine (180 hp) + Emergency Battery Assist',
      hybridArchitecture: 'Parallel',
      engineRatingKw: 135,
      generatorRatingKw: 20,
      motorRatingKw: 30,
      batteryCapacityKwh: 15,
      batteryChemistry: 'NMC Lithium-Ion',
      specificFuelConsumptionKgKwh: 0.225
    },
    mission: {
      primaryMission: 'Armed Reconnaissance & Precision Tactical Strike',
      threatEnvironment: 'Medium',
      operatingTempRangeC: '-30°C to +50°C',
      allWeatherCapability: true,
      stealthFeatures: ['IR Suppressor Nozzle']
    },
    configuration: {
      wingspanM: 15.8,
      wingAreaM2: 16.2,
      aspectRatio: 15.4,
      parasiteDragCd0: 0.019,
      fuselageLengthM: 8.1,
      airfoilType: 'NACA 4415 Modified'
    }
  },
  {
    id: 'luh',
    name: 'LUH (Light Utility Helicopter)',
    codeName: 'HAL-LUH-3T',
    category: 'helicopter',
    status: 'Serial Production Onboarding',
    description: '3-tonne class single-engine light utility helicopter purpose-built for high-altitude operations in Siachen and Himalaya sectors.',
    weight: {
      emptyWeightKg: 1910,
      mtowKg: 3150,
      maxFuelKg: 540,
      batteryPackKg: 30,
      usefulLoadKg: 1240
    },
    payload: {
      maxPayloadKg: 500,
      standardPayload: '6 Passengers or High-Altitude Cargo Pods / Rescue Hoist',
      sensorsAndAvionics: ['Smart Glass Cockpit System', 'Night Vision Goggle Compatible Displays', 'Dual FADEC Engine Control'],
      hardpointsCount: 0
    },
    cruise: {
      cruiseSpeedKmh: 220,
      maxSpeedKmh: 260,
      stallSpeedKmh: 0,
      climbRateMs: 14.2
    },
    range: {
      maxRangeKm: 350,
      combatRadiusKm: 160,
      loiterTimeHr: 3.2,
      ferryRangeKm: 500
    },
    altitude: {
      cruiseAltitudeM: 4000,
      serviceCeilingM: 6500,
      takeoffDistanceM: 0
    },
    powerplant: {
      type: 'Single Safran Ardiden 1U / Shakti-Derived Turboshaft Engine',
      hybridArchitecture: 'Conventional Turboshaft',
      engineRatingKw: 560,
      generatorRatingKw: 10,
      motorRatingKw: 0,
      batteryCapacityKwh: 10,
      batteryChemistry: 'LiFePO4 Aviation Battery',
      specificFuelConsumptionKgKwh: 0.285
    },
    mission: {
      primaryMission: 'High-Altitude Logistics, VIP Transport, SAR, Casualty Evacuation',
      threatEnvironment: 'Low',
      operatingTempRangeC: '-50°C to +55°C',
      allWeatherCapability: true,
      stealthFeatures: ['Low Acoustic Rotor Tip Design']
    },
    configuration: {
      wingspanM: 11.6, // Rotor diameter
      wingAreaM2: 105.7, // Rotor disc area
      aspectRatio: 12.1,
      parasiteDragCd0: 0.035,
      fuselageLengthM: 11.49,
      airfoilType: 'HAL High-Lift Composite Rotor Blade'
    }
  },
  {
    id: 'imrh',
    name: 'IMRH (Indian Multi-Role Helicopter)',
    codeName: 'HAL-IMRH-13T',
    category: 'helicopter',
    status: 'Detailed Design Phase',
    description: '13-tonne class twin-engine heavy multi-role helicopter designed to replace Mi-17 fleets for troop transport and assault.',
    weight: {
      emptyWeightKg: 7500,
      mtowKg: 13000,
      maxFuelKg: 2800,
      batteryPackKg: 80,
      usefulLoadKg: 5500
    },
    payload: {
      maxPayloadKg: 4000,
      standardPayload: '28 Armed Troops or 4,000 kg Slung Tactical Cargo',
      sensorsAndAvionics: ['Integrated Architecture Avionics System', 'Obstacle Avoidance Radar', 'FLIR Camera Pod'],
      hardpointsCount: 4
    },
    cruise: {
      cruiseSpeedKmh: 260,
      maxSpeedKmh: 300,
      stallSpeedKmh: 0,
      climbRateMs: 12.0
    },
    range: {
      maxRangeKm: 800,
      combatRadiusKm: 350,
      loiterTimeHr: 4.0,
      ferryRangeKm: 1100
    },
    altitude: {
      cruiseAltitudeM: 4500,
      serviceCeilingM: 6500,
      takeoffDistanceM: 0
    },
    powerplant: {
      type: 'Twin Safran / HAL Joint Venture Turboshaft Engines (2000 hp each)',
      hybridArchitecture: 'Conventional Turboshaft',
      engineRatingKw: 2980,
      generatorRatingKw: 45,
      motorRatingKw: 0,
      batteryCapacityKwh: 35,
      batteryChemistry: 'Advanced Li-Ion',
      specificFuelConsumptionKgKwh: 0.270
    },
    mission: {
      primaryMission: 'Heavy Air Assault, Tactical Troop Transport, Offshore Operations',
      threatEnvironment: 'Medium',
      operatingTempRangeC: '-40°C to +50°C',
      allWeatherCapability: true,
      stealthFeatures: ['Infrared Exhaust Suppressors', 'Armored Cockpit Plating']
    },
    configuration: {
      wingspanM: 16.2, // Main Rotor Diameter
      wingAreaM2: 206.1, // Rotor Disc Area
      aspectRatio: 14.2,
      parasiteDragCd0: 0.040,
      fuselageLengthM: 16.8,
      airfoilType: 'Composite Anhedral Rotor Blades'
    }
  },
  {
    id: 'htfe_25',
    name: 'HTFE-25 Demonstrator',
    codeName: 'HAL-HTFE-25-ENG',
    category: 'demonstrator',
    status: 'Test Bed Rig / Engine Demonstrator',
    description: '25 kN thrust class indigenous turbofan engine demonstrator for trainer aircraft and executive regional transport.',
    weight: {
      emptyWeightKg: 480,
      mtowKg: 480,
      maxFuelKg: 0,
      batteryPackKg: 0,
      usefulLoadKg: 0
    },
    payload: {
      maxPayloadKg: 0,
      standardPayload: 'Engine Test Bench Telemetry Sensors',
      sensorsAndAvionics: ['Dual-Channel FADEC System', 'Vibration Monitoring Array', 'Thermal Camera Matrix'],
      hardpointsCount: 0
    },
    cruise: {
      cruiseSpeedKmh: 0,
      maxSpeedKmh: 0,
      stallSpeedKmh: 0,
      climbRateMs: 0
    },
    range: {
      maxRangeKm: 0,
      combatRadiusKm: 0,
      loiterTimeHr: 0,
      ferryRangeKm: 0
    },
    altitude: {
      cruiseAltitudeM: 0,
      serviceCeilingM: 12000,
      takeoffDistanceM: 0
    },
    powerplant: {
      type: '25 kN Thrust Class Twin-Spool High-Bypass Turbofan',
      hybridArchitecture: 'Turbofan',
      engineRatingKw: 2500, // Equivalent Shaft Power
      generatorRatingKw: 60,
      motorRatingKw: 0,
      batteryCapacityKwh: 0,
      batteryChemistry: 'N/A',
      specificFuelConsumptionKgKwh: 0.650
    },
    mission: {
      primaryMission: 'Indigenous Propulsion R&D, Core Engine Technology Demonstrator',
      threatEnvironment: 'Low',
      operatingTempRangeC: '-50°C to +60°C',
      allWeatherCapability: true,
      stealthFeatures: ['Single-Crystal Blade Alloys', 'Low-Noise Fan Blades']
    },
    configuration: {
      wingspanM: 0,
      wingAreaM2: 0,
      aspectRatio: 0,
      parasiteDragCd0: 0,
      fuselageLengthM: 1.85,
      airfoilType: 'Supercritical Compressor Blades'
    }
  },
  {
    id: 'htse_1200',
    name: 'HTSE-1200 Demonstrator',
    codeName: 'HAL-HTSE-1200-SHAFT',
    category: 'demonstrator',
    status: 'Core Engine Full Power Run',
    description: '1200 kW shaft power class indigenous turboshaft engine core for 3-to-6 tonne helicopters and hybrid UAV generators.',
    weight: {
      emptyWeightKg: 220,
      mtowKg: 220,
      maxFuelKg: 0,
      batteryPackKg: 0,
      usefulLoadKg: 0
    },
    payload: {
      maxPayloadKg: 0,
      standardPayload: 'Dynamometer & Shaft Power Test Instrumentation',
      sensorsAndAvionics: ['Digital FADEC Unit', 'Torque Metering Sensors'],
      hardpointsCount: 0
    },
    cruise: {
      cruiseSpeedKmh: 0,
      maxSpeedKmh: 0,
      stallSpeedKmh: 0,
      climbRateMs: 0
    },
    range: {
      maxRangeKm: 0,
      combatRadiusKm: 0,
      loiterTimeHr: 0,
      ferryRangeKm: 0
    },
    altitude: {
      cruiseAltitudeM: 0,
      serviceCeilingM: 7000,
      takeoffDistanceM: 0
    },
    powerplant: {
      type: '1200 kW Turboshaft Engine (Compressor + Free Power Turbine)',
      hybridArchitecture: 'Conventional Turboshaft',
      engineRatingKw: 1200,
      generatorRatingKw: 1100,
      motorRatingKw: 0,
      batteryCapacityKwh: 0,
      batteryChemistry: 'N/A',
      specificFuelConsumptionKgKwh: 0.235
    },
    mission: {
      primaryMission: 'Power Generation Core for Hybrid Aircraft & Utility Helicopters',
      threatEnvironment: 'Low',
      operatingTempRangeC: '-45°C to +55°C',
      allWeatherCapability: true,
      stealthFeatures: ['Thermal Barrier Coating']
    },
    configuration: {
      wingspanM: 0,
      wingAreaM2: 0,
      aspectRatio: 0,
      parasiteDragCd0: 0,
      fuselageLengthM: 1.2,
      airfoilType: 'Axial-Centrifugal Hybrid Compressor'
    }
  },
  {
    id: 'rta_90',
    name: 'RTA-90 (Regional Transport Aircraft)',
    codeName: 'HAL-NAL-RTA-90',
    category: 'transport',
    status: 'Feasibility & Preliminary Design',
    description: '90-seat turboprop regional airliner joint program by HAL and NAL for Indian regional air connectivity (UDAN) scheme.',
    weight: {
      emptyWeightKg: 18500,
      mtowKg: 29000,
      maxFuelKg: 6500,
      batteryPackKg: 200,
      usefulLoadKg: 10500
    },
    payload: {
      maxPayloadKg: 9200,
      standardPayload: '90 Passengers + Baggage or 9.2 Tonnes Palletized Freight',
      sensorsAndAvionics: ['Advanced Integrated Flight Deck', 'TCAS II Collision Avoidance', 'Weather Radar'],
      hardpointsCount: 0
    },
    cruise: {
      cruiseSpeedKmh: 600,
      maxSpeedKmh: 650,
      stallSpeedKmh: 160,
      climbRateMs: 12.5
    },
    range: {
      maxRangeKm: 2500,
      combatRadiusKm: 1200,
      loiterTimeHr: 5.5,
      ferryRangeKm: 3200
    },
    altitude: {
      cruiseAltitudeM: 7600,
      serviceCeilingM: 9100,
      takeoffDistanceM: 1100
    },
    powerplant: {
      type: 'Twin Advanced Turboprop Engines (3500 hp each) with Hybrid-Electric Eco Cruise',
      hybridArchitecture: 'Parallel',
      engineRatingKw: 5200,
      generatorRatingKw: 150,
      motorRatingKw: 300,
      batteryCapacityKwh: 120,
      batteryChemistry: 'Advanced NMC',
      specificFuelConsumptionKgKwh: 0.205
    },
    mission: {
      primaryMission: 'Regional Passenger Airliner, Short-Field Operation, VIP / Cargo Variant',
      threatEnvironment: 'Low',
      operatingTempRangeC: '-30°C to +45°C',
      allWeatherCapability: true,
      stealthFeatures: ['Six-Blade Low-Noise Scimitar Propellers']
    },
    configuration: {
      wingspanM: 28.4,
      wingAreaM2: 74.5,
      aspectRatio: 10.8,
      parasiteDragCd0: 0.024,
      fuselageLengthM: 29.8,
      airfoilType: 'Supercritical Transonic Airfoil'
    }
  },
  {
    id: 'custom_ac',
    name: 'Custom Aircraft',
    codeName: 'USER-CUSTOM-V1',
    category: 'custom',
    status: 'User Defined Configuration',
    description: 'Fully customizable aerospace platform template allowing custom weight, payload, drag polar, and hybrid propulsion specs.',
    weight: {
      emptyWeightKg: 400,
      mtowKg: 800,
      maxFuelKg: 150,
      batteryPackKg: 60,
      usefulLoadKg: 400
    },
    payload: {
      maxPayloadKg: 150,
      standardPayload: 'User Defined Modular Sensor / Cargo Suite',
      sensorsAndAvionics: ['Configurable Flight Controller', 'Custom Telemetry Module'],
      hardpointsCount: 2
    },
    cruise: {
      cruiseSpeedKmh: 200,
      maxSpeedKmh: 260,
      stallSpeedKmh: 80,
      climbRateMs: 7.0
    },
    range: {
      maxRangeKm: 1200,
      combatRadiusKm: 300,
      loiterTimeHr: 6.0,
      ferryRangeKm: 1400
    },
    altitude: {
      cruiseAltitudeM: 5000,
      serviceCeilingM: 7000,
      takeoffDistanceM: 350
    },
    powerplant: {
      type: 'Custom Hybrid-Electric Engine Unit',
      hybridArchitecture: 'Series',
      engineRatingKw: 45,
      generatorRatingKw: 40,
      motorRatingKw: 55,
      batteryCapacityKwh: 20,
      batteryChemistry: 'Li-Ion Custom',
      specificFuelConsumptionKgKwh: 0.220
    },
    mission: {
      primaryMission: 'Custom User Research & Development Prototype',
      threatEnvironment: 'Low',
      operatingTempRangeC: '-20°C to +45°C',
      allWeatherCapability: false,
      stealthFeatures: ['Custom Airframe Options']
    },
    configuration: {
      wingspanM: 12.0,
      wingAreaM2: 10.5,
      aspectRatio: 13.7,
      parasiteDragCd0: 0.020,
      fuselageLengthM: 6.5,
      airfoilType: 'Custom User Airfoil'
    }
  }
];
