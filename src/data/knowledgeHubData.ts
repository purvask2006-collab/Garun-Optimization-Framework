export interface DocumentItem {
  id: string;
  title: string;
  category: 'ENGINEERING_REFERENCE' | 'MISSION_DOC' | 'HAL_NOTE' | 'DESIGN_ASSUMPTION';
  code: string;
  summary: string;
  authorOrBody: string;
  date: string;
  pageCount: number;
  tags: string[];
  contentPdfHtml: string; // Simulated formatted PDF document content
}

export interface InteractiveEquation {
  id: string;
  name: string;
  symbolicFormula: string;
  description: string;
  category: 'AERODYNAMICS' | 'PROPULSION' | 'ELECTRICAL' | 'THERMAL';
  variables: {
    symbol: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    defaultVal: number;
    step: number;
  }[];
  calculate: (inputs: Record<string, number>) => { value: number; unit: string; breakdown: string };
}

export interface EngineSpec {
  id: string;
  name: string;
  manufacturer: string;
  type: 'TURBOFAN' | 'TURBOPROP' | 'TURBOSHAFT' | 'MICRO_TURBINE';
  powerOrThrustKw: number;
  sfcGkwh: number;
  weightKg: number;
  pressureRatio: number;
  maxRpm: number;
  applications: string[];
  status: 'PRODUCTION' | 'DEVELOPMENT' | 'CONCEPT';
}

export interface BatterySpec {
  id: string;
  chemistry: string;
  gravimetricEnergyWhKg: number;
  volumetricEnergyWhL: number;
  nominalVoltageV: number;
  maxContinuousDischargeC: number;
  cycleLifeCount: number;
  thermalRunawayTempC: number;
  suitabilityRating: 'OPTIMAL' | 'VIABLE' | 'RESEARCH_ONLY';
}

export interface MotorSpec {
  id: string;
  name: string;
  type: 'PMSM' | 'AXIAL_FLUX' | 'SUPERCONDUCTING' | 'RADIAL_FLUX';
  powerKw: number;
  torqueNm: number;
  weightKg: number;
  efficiencyPct: number;
  powerDensityKwKg: number;
  maxRpm: number;
  operatingVoltageV: number;
}

export interface GeneratorSpec {
  id: string;
  name: string;
  type: 'HVDC_STARTER_GEN' | 'TURBOGENERATOR' | 'APU_GENERATOR';
  continuousPowerKw: number;
  voltageV: number;
  weightKg: number;
  efficiencyPct: number;
  coolingMedium: 'AIR' | 'GLYCOL_WATER' | 'OIL_JET';
}

// ----------------------------------------------------
// 1. ENGINEERING DOCUMENTS, HAL NOTES, MISSION DOCS
// ----------------------------------------------------

export const KNOWLEDGE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'DOC-FAR-CS23',
    title: 'CS-23 / FAR-23 Certification Standards for Hybrid-Electric Propulsion',
    category: 'ENGINEERING_REFERENCE',
    code: 'EASA CS-23 Amdt 6 / FAA AC 23.1309',
    summary: 'Airworthiness standards for normal, utility, and aerobatic category aeroplanes with high-voltage hybrid-electric powertrain architectures.',
    authorOrBody: 'EASA & FAA Joint Aerospace Committee',
    date: '2025-11-14',
    pageCount: 28,
    tags: ['CS-23', 'Airworthiness', 'HVDC Safety', 'Electric Flight', 'Certification'],
    contentPdfHtml: `
      <h1 style="color:#00A8FF; font-size:16px; border-bottom:1px solid #1A2740; padding-bottom:8px;">CS-23 AMENDMENT 6: SPECIAL CONDITION FOR HYBRID PROPULSION</h1>
      <p style="color:#8A9BBE; font-size:12px;"><strong>Document Ref:</strong> CS-23.2400-HYBRID-2025</p>
      
      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">1. Scope & High-Voltage Isolation (HVDC)</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        This document specifies structural, thermal, and electrical safety thresholds for integrating high-voltage direct current (HVDC) buses (&gt;270V DC up to 800V DC) on fixed-wing tactical unmanned aircraft and light rotorcraft. Single-point failure isolation must guarantee complete galvanic isolation within 15 milliseconds of short-circuit detection.
      </p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">2. Thermal Runaway Mitigation</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        Battery storage units must feature inter-cell fire barriers capable of containing thermal runaway propagation at temperatures exceeding 850°C for at least 15 minutes, allowing emergency descent and safe landing without airframe structural compromise.
      </p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">3. Redundant Power Distribution</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        Hybrid gas-turbine + electric architectures must maintain at least 30% emergency electric climb power even during total gas turbine flameout at altitudes up to 6,000m.
      </p>
    `
  },
  {
    id: 'DOC-DEF-STAN-970',
    title: 'DEF STAN 00-970 Military Airworthiness Requirements for Unmanned Swarms',
    category: 'ENGINEERING_REFERENCE',
    code: 'UK MOD DEF STAN 00-970 Vol 2',
    summary: 'Military airworthiness standards covering structural fatigue, electromagnetic compatibility (EMC), and propulsion safety for high-subsonic stealth UCAVs and swarm platforms.',
    authorOrBody: 'Defence Equipment & Support (DE&S)',
    date: '2024-08-20',
    pageCount: 42,
    tags: ['DEF STAN', 'UCAV', 'Swarm Integrity', 'Military Airworthiness', 'EMC/EMI'],
    contentPdfHtml: `
      <h1 style="color:#00A8FF; font-size:16px; border-bottom:1px solid #1A2740; padding-bottom:8px;">DEF STAN 00-970: MILITARY SWARM PROPULSION COMPLIANCE</h1>
      <p style="color:#8A9BBE; font-size:12px;"><strong>Document Ref:</strong> DEF-STAN-00970-SWARM-REV4</p>
      
      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">1. Electromagnetic Compatibility (EMC) in Dense RF Environments</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        Swarm units operating in electronic warfare (EW) conditions must shield high-frequency inverter switching transients (up to 50 kHz pulse-width modulation) to prevent interference with inter-swarm datalinks and satellite navigation receivers.
      </p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">2. Structural G-Load Limits</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        UCAV battery enclosures must sustain structural acceleration up to +9.0g / -3.5g without internal cell displacement, busbar degradation, or coolant loop breach.
      </p>
    `
  },
  {
    id: 'DOC-HAL-NOTE-01',
    title: 'HAL Indigenous Engineering Note: GTRE Kaveri Hybrid-Electric Co-Development Guidelines',
    category: 'HAL_NOTE',
    code: 'HAL-GTRE-ENG-NOTE-2026-09',
    summary: 'Internal HAL R&D memorandum detailing mechanical interface retrofit protocol for shaft-mounted starter-generators on Kaveri derivative turbofans.',
    authorOrBody: 'HAL Aircraft Research & Design Centre (ARDC), Bengaluru',
    date: '2026-02-10',
    pageCount: 18,
    tags: ['HAL ARDC', 'GTRE Kaveri', 'Shaft Power Offtake', 'Retrofit Protocol', 'Dry Turbofan'],
    contentPdfHtml: `
      <h1 style="color:#00A8FF; font-size:16px; border-bottom:1px solid #1A2740; padding-bottom:8px;">HAL ARDC MEMORANDUM: KAVERI HYBRID RETROFIT SPECIFICATION</h1>
      <p style="color:#8A9BBE; font-size:12px;"><strong>Author:</strong> Rotary & Fixed Wing Propulsion Directorate, HAL</p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">1. High-Pressure Spool Shaft Power Offtake</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        The GTRE Kaveri dry turbofan HP spool supports up to 85 kW mechanical power extraction via an accessory gearbox bevel drive. Integrating a high-speed permanent magnet starter-generator increases HP spool compressor stability margin by 12% during altitude relight sequences.
      </p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">2. Acoustic Signature Mitigation for Stealth Flying-Wing</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        Replacing standard mechanical accessory drives with electric power distribution reduces low-frequency acoustic emissions by 14 dB in the 100 Hz – 1 kHz band, critical for Ghatak UCAV low-observable operational profiles.
      </p>
    `
  },
  {
    id: 'DOC-MISSION-HAMP',
    title: 'Mission CONOPS: High-Altitude Maritime Patrol & Sub-Surface Surveillance',
    category: 'MISSION_DOC',
    code: 'CONOPS-HAMP-GARUN-2026',
    summary: 'Operational doctrine for long-endurance hybrid maritime patrol unmanned aerial vehicles over the Indian Ocean Region (IOR).',
    authorOrBody: 'Naval Aerospace Design Directorate / HAL Liaison',
    date: '2026-01-15',
    pageCount: 34,
    tags: ['CONOPS', 'Maritime Patrol', 'Indian Ocean Region', 'Hybrid Endurance', 'ASW'],
    contentPdfHtml: `
      <h1 style="color:#00A8FF; font-size:16px; border-bottom:1px solid #1A2740; padding-bottom:8px;">CONOPS: HIGH-ALTITUDE MARITIME PATROL (HAMP)</h1>
      <p style="color:#8A9BBE; font-size:12px;"><strong>Target Platform:</strong> GARUN / Tapas Hybrid Retrofit</p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">1. Mission Profile Phases</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        Phase 1: Hybrid takeoff & climb to 8,000m (20 min).<br/>
        Phase 2: Gas turbine economy cruise at 180 KCAS to transit area (800 km).<br/>
        Phase 3: Low-altitude acoustic stealth loiter at 1,500m using purely electric drive (2.5 hr loiter window).<br/>
        Phase 4: High-altitude return transit with battery regeneration during descent.
      </p>
    `
  },
  {
    id: 'DOC-ASSUMP-ISA',
    title: 'Aerospace Engineering Design Assumptions: ISA & Aerodynamic Drag Baseline',
    category: 'DESIGN_ASSUMPTION',
    code: 'HAL-DES-ASSUMP-ISA-2026',
    summary: 'Standard International Standard Atmosphere (ISA) atmospheric lookup profiles and baseline aerodynamic drag polar coefficients across mission phases.',
    authorOrBody: 'HAL Flight Dynamics & Performance Group',
    date: '2025-10-01',
    pageCount: 12,
    tags: ['ISA Atmosphere', 'Drag Polar', 'Cd0', 'Oswald Efficiency', 'Altitude Lookup'],
    contentPdfHtml: `
      <h1 style="color:#00A8FF; font-size:16px; border-bottom:1px solid #1A2740; padding-bottom:8px;">HAL DESIGN ASSUMPTIONS: ATMOSPHERE & AERODYNAMICS</h1>
      <p style="color:#8A9BBE; font-size:12px;"><strong>Standard Baseline:</strong> ISA Sea Level (15°C, 1013.25 hPa, 1.225 kg/m³)</p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">1. Atmosphere Interpolation Equations</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        Troposphere (0 to 11,000m): T(h) = 288.15 - 0.0065*h (K).<br/>
        Density ratio σ(h) = (1 - 2.25577e-5 * h)^4.25588.
      </p>

      <h2 style="color:#00E87A; font-size:13px; margin-top:12px;">2. Aerodynamic Coefficients</h2>
      <p style="color:#E8EDF7; font-size:11px; line-height:1.6;">
        Parasite Drag Coefficient $C_{d0}$ = 0.022 (Clean Wing Configuration).<br/>
        Oswald Oswald Efficiency Factor $e$ = 0.85.<br/>
        Wing Aspect Ratio $AR$ = 12.4.
      </p>
    `
  }
];

// ----------------------------------------------------
// 2. INTERACTIVE EQUATIONS WITH REAL-TIME EVALUATION
// ----------------------------------------------------
export const INTERACTIVE_EQUATIONS: InteractiveEquation[] = [
  {
    id: 'EQ-BREGUET-HYBRID',
    name: 'Hybrid-Electric Breguet Range Equation',
    symbolicFormula: 'R = (e_bat * eta_total / g) * (L/D) * ln(W0 / Wf) * Phi_hybrid',
    description: 'Calculates overall aircraft flight range (km) accounting for gas turbine fuel burn and battery energy boost fraction.',
    category: 'PROPULSION',
    variables: [
      { symbol: 'e_bat', label: 'Battery Energy Density', unit: 'Wh/kg', min: 150, max: 600, defaultVal: 350, step: 10 },
      { symbol: 'eta_tot', label: 'Powertrain Efficiency', unit: '%', min: 50, max: 95, defaultVal: 82, step: 1 },
      { symbol: 'L_D', label: 'Lift-to-Drag Ratio (L/D)', unit: '-', min: 8, max: 28, defaultVal: 18, step: 0.5 },
      { symbol: 'phi_hyb', label: 'Hybrid Electric Power Fraction', unit: '%', min: 0, max: 80, defaultVal: 35, step: 5 },
      { symbol: 'fuel_mass', label: 'Fuel Mass Ratio (W_fuel / W_tot)', unit: '%', min: 5, max: 45, defaultVal: 22, step: 1 }
    ],
    calculate: (vars) => {
      const e_bat = vars.e_bat || 350;
      const eta = (vars.eta_tot || 82) / 100;
      const ld = vars.L_D || 18;
      const phi = (vars.phi_hyb || 35) / 100;
      const fuelFrac = (vars.fuel_mass || 22) / 100;

      // Base Range from Breguet = (L/D) * (1/SFC_avg) * ln(W0/Wf)
      // Equivalent hybrid range in km
      const rangeKm = Math.round(ld * 120 * (1 + phi * 0.45) * Math.log(1 / (1 - fuelFrac)) * (e_bat / 250) * eta);
      return {
        value: rangeKm,
        unit: 'km',
        breakdown: `Range includes +${Math.round(phi * 42)}% electric range extension via ${vars.e_bat} Wh/kg batteries.`
      };
    }
  },
  {
    id: 'EQ-SFC-HYBRID',
    name: 'Effective Specific Fuel Consumption (SFC)',
    symbolicFormula: 'SFC_eff = m_dot_fuel / (P_shaft + P_elec)',
    description: 'Evaluates shaft power equivalent fuel efficiency (g/kWh) when electric motor assists gas turbine.',
    category: 'PROPULSION',
    variables: [
      { symbol: 'sfc_base', label: 'Baseline Gas Turbine SFC', unit: 'g/kWh', min: 180, max: 350, defaultVal: 240, step: 5 },
      { symbol: 'p_shaft', label: 'Turbine Shaft Power', unit: 'kW', min: 100, max: 2000, defaultVal: 650, step: 25 },
      { symbol: 'p_elec', label: 'Electric Assist Power', unit: 'kW', min: 0, max: 800, defaultVal: 250, step: 10 }
    ],
    calculate: (vars) => {
      const sfcBase = vars.sfc_base || 240;
      const pShaft = vars.p_shaft || 650;
      const pElec = vars.p_elec || 250;

      const fuelRateGhr = sfcBase * pShaft;
      const totalPowerKw = pShaft + pElec;
      const effectiveSfc = Math.round((fuelRateGhr / totalPowerKw) * 10) / 10;
      const reductionPct = Math.round(((sfcBase - effectiveSfc) / sfcBase) * 1000) / 10;

      return {
        value: effectiveSfc,
        unit: 'g/kWh',
        breakdown: `Reduces effective fuel consumption rate by ${reductionPct}% compared to baseline gas turbine.`
      };
    }
  },
  {
    id: 'EQ-BATTERY-MASS-FRACTION',
    name: 'Battery Mass Fraction for Required Endurance',
    symbolicFormula: 'M_bat = (P_elec * t_endurance) / (e_bat * eta_inverter * DoD)',
    description: 'Computes battery weight required to sustain purely electric or hybrid loiter phases.',
    category: 'ELECTRICAL',
    variables: [
      { symbol: 'p_elec', label: 'Electric Power Required', unit: 'kW', min: 20, max: 500, defaultVal: 120, step: 10 },
      { symbol: 't_loiter', label: 'Loiter Endurance', unit: 'hours', min: 0.25, max: 5.0, defaultVal: 1.5, step: 0.25 },
      { symbol: 'e_density', label: 'Cell Specific Energy', unit: 'Wh/kg', min: 180, max: 500, defaultVal: 320, step: 10 },
      { symbol: 'dod', label: 'Max Depth of Discharge', unit: '%', min: 60, max: 95, defaultVal: 85, step: 1 }
    ],
    calculate: (vars) => {
      const pKw = vars.p_elec || 120;
      const tHr = vars.t_loiter || 1.5;
      const eWhKg = vars.e_density || 320;
      const dod = (vars.dod || 85) / 100;
      const etaInverter = 0.96;

      const totalEnergyKwh = pKw * tHr;
      const reqCellEnergyKwh = totalEnergyKwh / (dod * etaInverter);
      const batteryMassKg = Math.round((reqCellEnergyKwh * 1000) / eWhKg);

      return {
        value: batteryMassKg,
        unit: 'kg',
        breakdown: `Requires total stored battery capacity of ${reqCellEnergyKwh.toFixed(1)} kWh for ${tHr} hr loiter.`
      };
    }
  }
];

// ----------------------------------------------------
// 3. COMPONENT DATABASES
// ----------------------------------------------------
export const ENGINE_DATABASE: EngineSpec[] = [
  {
    id: 'ENG-PTA7E',
    name: 'HAL PTA-7E Turbojet',
    manufacturer: 'HAL Engine Division, Koraput',
    type: 'TURBOFAN',
    powerOrThrustKw: 370,
    sfcGkwh: 285,
    weightKg: 65,
    pressureRatio: 4.2,
    maxRpm: 28000,
    applications: ['Lakshya PTA', 'HAL Swarms'],
    status: 'PRODUCTION'
  },
  {
    id: 'ENG-KAVERI-DRY',
    name: 'GTRE Kaveri Dry Turbofan Derivative',
    manufacturer: 'GTRE / HAL Bengaluru',
    type: 'TURBOFAN',
    powerOrThrustKw: 1850,
    sfcGkwh: 210,
    weightKg: 820,
    pressureRatio: 21.5,
    maxRpm: 17200,
    applications: ['Ghatak Stealth UCAV', 'CATS Warrior'],
    status: 'DEVELOPMENT'
  },
  {
    id: 'ENG-ARDIDEN-1U',
    name: 'Safran Ardiden 1U / Shakti Turboshaft',
    manufacturer: 'HAL Rotary Wing / Safran',
    type: 'TURBOSHAFT',
    powerOrThrustKw: 1030,
    sfcGkwh: 228,
    weightKg: 205,
    pressureRatio: 11.0,
    maxRpm: 21000,
    applications: ['HAL Dhruv ALH', 'HAL LUH', 'HAL LCH Prachand'],
    status: 'PRODUCTION'
  },
  {
    id: 'ENG-HTFE-25',
    name: 'HAL HTFE-25 Turbofan',
    manufacturer: 'HAL ARDC / Koraput',
    type: 'TURBOFAN',
    powerOrThrustKw: 2500,
    sfcGkwh: 195,
    weightKg: 450,
    pressureRatio: 16.8,
    maxRpm: 19500,
    applications: ['HAL HTT-40 Retrofit', 'HAL GARUN HAMP'],
    status: 'DEVELOPMENT'
  }
];

export const BATTERY_DATABASE: BatterySpec[] = [
  {
    id: 'BAT-LI-SULFUR',
    chemistry: 'Lithium-Sulfur (Li-S) Solid-Electrolyte',
    gravimetricEnergyWhKg: 420,
    volumetricEnergyWhL: 520,
    nominalVoltageV: 3.7,
    maxContinuousDischargeC: 5.0,
    cycleLifeCount: 1200,
    thermalRunawayTempC: 240,
    suitabilityRating: 'OPTIMAL'
  },
  {
    id: 'BAT-NMC-811',
    chemistry: 'NMC 811 High-Nickel Aerospace Grade',
    gravimetricEnergyWhKg: 290,
    volumetricEnergyWhL: 680,
    nominalVoltageV: 3.6,
    maxContinuousDischargeC: 12.0,
    cycleLifeCount: 2000,
    thermalRunawayTempC: 180,
    suitabilityRating: 'VIABLE'
  },
  {
    id: 'BAT-SOLID-STATE',
    chemistry: 'Solid-State Lithium Metal Anode',
    gravimetricEnergyWhKg: 510,
    volumetricEnergyWhL: 850,
    nominalVoltageV: 3.8,
    maxContinuousDischargeC: 8.0,
    cycleLifeCount: 1500,
    thermalRunawayTempC: 320,
    suitabilityRating: 'OPTIMAL'
  }
];

export const MOTOR_DATABASE: MotorSpec[] = [
  {
    id: 'MOT-PMSM-90',
    name: 'Hal-Aero PMSM 90kW Direct Drive',
    type: 'PMSM',
    powerKw: 90,
    torqueNm: 280,
    weightKg: 14.2,
    efficiencyPct: 96.8,
    powerDensityKwKg: 6.33,
    maxRpm: 12000,
    operatingVoltageV: 600
  },
  {
    id: 'MOT-AXIAL-150',
    name: 'Dual-Rotor Axial Flux 150kW Motor',
    type: 'AXIAL_FLUX',
    powerKw: 150,
    torqueNm: 450,
    weightKg: 18.5,
    efficiencyPct: 97.4,
    powerDensityKwKg: 8.10,
    maxRpm: 8500,
    operatingVoltageV: 800
  },
  {
    id: 'MOT-SUPERCRYO-300',
    name: 'High-Temperature Superconducting 300kW Motor',
    type: 'SUPERCONDUCTING',
    powerKw: 300,
    torqueNm: 950,
    weightKg: 22.0,
    efficiencyPct: 99.1,
    powerDensityKwKg: 13.63,
    maxRpm: 15000,
    operatingVoltageV: 1000
  }
];

export const GENERATOR_DATABASE: GeneratorSpec[] = [
  {
    id: 'GEN-HVDC-120',
    name: 'HAL 120kW High-Speed HVDC Starter-Generator',
    type: 'HVDC_STARTER_GEN',
    continuousPowerKw: 120,
    voltageV: 600,
    weightKg: 19.5,
    efficiencyPct: 96.2,
    coolingMedium: 'GLYCOL_WATER'
  },
  {
    id: 'GEN-TURBO-250',
    name: '250kW Turbogenerator Unit',
    type: 'TURBOGENERATOR',
    continuousPowerKw: 250,
    voltageV: 800,
    weightKg: 34.0,
    efficiencyPct: 95.8,
    coolingMedium: 'OIL_JET'
  }
];
