export interface CitationItem {
  key: string;
  parameter: string;
  value: string;
  source: string;
  type: 'international_standard' | 'standard' | 'engineering_assumption' | 'peer_reviewed' | 'textbook' | 'competition_given';
  confidence: 'definitive' | 'good' | 'moderate' | 'low';
  note?: string;
}

export const CITATIONS: Record<string, CitationItem> = {
  ISA_ATMOSPHERE: {
    key: 'ISA_ATMOSPHERE',
    parameter: 'ISA atmosphere model',
    value: 'T_SL=288.15K, L=0.0065K/m, P_SL=101325Pa',
    source: 'ICAO Standard Atmosphere, Doc 7488/3, 3rd Ed. 1994',
    type: 'international_standard',
    confidence: 'definitive',
  },
  JET_A1_LHV: {
    key: 'JET_A1_LHV',
    parameter: 'Jet-A1 lower heating value',
    value: '43.15 MJ/kg = 11.97 kWh/kg',
    source: 'ASTM D1655 Standard Specification for Aviation Turbine Fuels',
    type: 'standard',
    confidence: 'definitive',
  },
  TURBOSHAFT_SFC: {
    key: 'TURBOSHAFT_SFC',
    parameter: 'Small turboshaft SFC (~60kW class)',
    value: '0.38–0.52 kg/kWh at rated; using 0.450 kg/kWh',
    source: 'Engineering assumption based on small turboshaft class characteristics (Allison 250, Honeywell LTS101 class). No GARUN-specific engine datasheet available.',
    type: 'engineering_assumption',
    confidence: 'moderate',
    note: 'Real GARUN engine SFC must be confirmed from selected engine datasheet.',
  },
  BATTERY_SPECIFIC_ENERGY: {
    key: 'BATTERY_SPECIFIC_ENERGY',
    parameter: 'Li-ion NMC battery specific energy (pack level)',
    value: '200 Wh/kg (pack level); cell-level 250-280 Wh/kg',
    source: 'Löbberding H. et al. (2020). "From Cell to Battery System in BEVs." Energies, 13(23), 6345. https://doi.org/10.3390/en13236345',
    type: 'peer_reviewed',
    confidence: 'good',
  },
  PEUKERT_EXPONENT: {
    key: 'PEUKERT_EXPONENT',
    parameter: 'Peukert exponent n for Li-ion',
    value: 'n = 1.05',
    source: 'Doerffel D. & Sharkh S.A. (2006). "A critical review of using the Peukert equation for determining the remaining capacity of lead-acid and lithium-ion batteries." J. Power Sources, 155(2), 395-400.',
    type: 'peer_reviewed',
    confidence: 'good',
  },
  ELECTRICAL_EFFICIENCY: {
    key: 'ELECTRICAL_EFFICIENCY',
    parameter: 'Generator/rectifier/inverter/motor efficiencies',
    value: 'η_gen=0.93, η_rect=0.97, η_inv=0.96, η_motor=0.95; chain=0.821',
    source: 'Roboam X. et al. (2012). "Hybrid Energy Systems for Aircraft." Wiley-ISTE. Chapter 4.',
    type: 'textbook',
    confidence: 'good',
  },
  MOTOR_EFFICIENCY: {
    key: 'MOTOR_EFFICIENCY',
    parameter: 'PMSM motor efficiency at rated load',
    value: '0.93–0.96 typical; using 0.95',
    source: 'Fischer O. et al. (2018). "Electric motor technologies for hybrid electric aircraft." IEEE Trans. Power Electronics 33(11).',
    type: 'peer_reviewed',
    confidence: 'good',
  },
  CD0_ASSUMPTION: {
    key: 'CD0_ASSUMPTION',
    parameter: 'Profile drag coefficient CD0',
    value: '0.022 (ASSUMPTION for clean MALE UAV)',
    source: 'ENGINEERING ASSUMPTION. No GARUN-specific aerodynamic data available. Value typical for clean fixed-wing MALE UAV class (e.g., Predator-class: 0.020-0.025). Must be validated by aerodynamic analysis.',
    type: 'engineering_assumption',
    confidence: 'low',
  },
  OSWALD_EFFICIENCY: {
    key: 'OSWALD_EFFICIENCY',
    parameter: 'Oswald span efficiency factor e',
    value: '0.82 (ASSUMPTION)',
    source: 'ENGINEERING ASSUMPTION. Typical range 0.75-0.90 for fixed-wing aircraft. Must be validated.',
    type: 'engineering_assumption',
    confidence: 'low',
  },
  PROP_EFFICIENCY: {
    key: 'PROP_EFFICIENCY',
    parameter: 'Propeller efficiency η_prop',
    value: '0.82 at cruise (ASSUMPTION)',
    source: 'ENGINEERING ASSUMPTION. Fixed-pitch propeller optimized for cruise. Degrades at off-design speeds. Range 0.75-0.88 typical.',
    type: 'engineering_assumption',
    confidence: 'low',
  },
  COMPETITION_MTOW: {
    key: 'COMPETITION_MTOW',
    parameter: 'MTOW design target',
    value: '≈1000 kg',
    source: 'IIT Indore × HAL Problem Statement — direct competition input',
    type: 'competition_given',
    confidence: 'definitive',
  },
  COMPETITION_PAYLOAD: {
    key: 'COMPETITION_PAYLOAD',
    parameter: 'Payload requirement',
    value: '≈200 kg',
    source: 'IIT Indore × HAL Problem Statement — direct competition input',
    type: 'competition_given',
    confidence: 'definitive',
  },
  COMPETITION_CRUISE: {
    key: 'COMPETITION_CRUISE',
    parameter: 'Cruise speed',
    value: '≈250 km/h',
    source: 'IIT Indore × HAL Problem Statement — direct competition input',
    type: 'competition_given',
    confidence: 'definitive',
  },
  BUS_VOLTAGE_400V: {
    key: 'BUS_VOLTAGE_400V',
    parameter: 'High Voltage DC Bus Architecture',
    value: '400.0 V nominal',
    source: 'MIL-STD-704F Aircraft Electric Power Characteristics — HVDC standard baseline',
    type: 'standard',
    confidence: 'definitive',
  },
  TET_TEMPERATURE_LIMIT: {
    key: 'TET_TEMPERATURE_LIMIT',
    parameter: 'Uncooled Turbine Blade Temp Limit',
    value: '1700 K (1426.85 °C)',
    source: 'Mattingly, J. D. (2006). "Elements of Propulsion: Gas Turbines and Rockets." AIAA Education Series.',
    type: 'textbook',
    confidence: 'good',
  }
};
