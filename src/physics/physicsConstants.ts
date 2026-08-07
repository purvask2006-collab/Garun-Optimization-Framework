// ─── UNIVERSAL PHYSICAL CONSTANTS ────────────────────────────────────────────
export const G_MS2 = 9.80665;                    // m/s² — standard gravity, BIPM
export const R_AIR_J_KG_K = 287.058;             // J/kg/K — specific gas constant for dry air
export const GAMMA_AIR = 1.4;                    // ratio of specific heats, dry air
export const CP_AIR_J_KG_K = 1005;              // J/kg/K — specific heat at constant pressure
export const CP_HOT_GAS_J_KG_K = 1150;         // J/kg/K — hot combustion gas

// ─── ISA ATMOSPHERE ────────────────────────────────────────────────────────
export const ISA_T_SL_K = 288.15;               // K — ICAO Doc 7488
export const ISA_P_SL_PA = 101325;              // Pa
export const ISA_RHO_SL_KG_M3 = 1.225;         // kg/m³
export const ISA_LAPSE_RATE_K_M = 0.0065;       // K/m below tropopause
export const ISA_TROPOPAUSE_M = 11000;           // m
export const ISA_T_TROPOPAUSE_K = 216.65;        // K

// ─── JET-A1 FUEL ──────────────────────────────────────────────────────────
export const JET_A1_LHV_MJ_KG = 43.15;          // MJ/kg — ASTM D1655
export const JET_A1_LHV_KWH_KG = 11.97;         // kWh/kg — derived: 43.15/3.6
export const JET_A1_DENSITY_KG_L = 0.800;        // kg/litre — typical

// ─── TURBOSHAFT ENGINE (60–75 kW class, assumption) ───────────────────────
// Source: analogous data from small turboshaft class (Allison 250, Honeywell LTS101)
// Assumption: not directly from a specific GARUN engine datasheet
export const ENGINE_SFC_RATED_KG_KWH = 0.450;   // kg/kWh at 100% load — ASSUMPTION
export const ENGINE_SFC_PARTLOAD_EXP = 1.8;      // SFC(load) = SFC_rated + 0.28×(1-load)^1.8
export const ENGINE_SFC_PARTLOAD_COEFF = 0.280;
export const ENGINE_ALT_LAPSE_EXP = 0.70;        // P_alt = P_SL × (rho_alt/rho_SL)^0.70 — ASSUMPTION
export const ENGINE_COMBUSTOR_ETA = 0.98;         // combustor efficiency — typical
export const ENGINE_COMPRESSOR_ETA = 0.82;        // isentropic efficiency — typical small turboshaft
export const ENGINE_TET_LIMIT_K = 1700;           // K — turbine entry temperature limit

// ─── ELECTRICAL DRIVETRAIN ─────────────────────────────────────────────────
// Source: Roboam et al. 2012 "Hybrid Energy Systems for Aircraft" Wiley; Fischer et al. 2018
export const ETA_GENERATOR = 0.93;               // PMSM generator — Assumption; range 0.91-0.95
export const ETA_RECTIFIER = 0.97;               // SiC MOSFET rectifier
export const ETA_INVERTER = 0.96;                // SiC MOSFET inverter
export const ETA_MOTOR = 0.95;                   // PMSM traction motor at rated load
export const ETA_ELEC_CHAIN = ETA_GENERATOR * ETA_RECTIFIER * ETA_INVERTER * ETA_MOTOR; // = 0.821

// ─── BATTERY (Li-ion NMC class) ─────────────────────────────────────────────
// Source: Löbberding et al. 2020, Energies 13(23):6345 — cell-level NMC specific energy
// Note: pack-level specific energy ≈ 70–80% of cell-level
export const BATTERY_SPECIFIC_ENERGY_WH_KG_CELL = 260;   // Wh/kg — cell level
export const BATTERY_SPECIFIC_ENERGY_WH_KG_PACK = 200;   // Wh/kg — pack level (incl. BMS, housing)
export const BATTERY_SOC_MIN = 0.20;             // minimum usable SOC — ASSUMPTION (conservative)
export const BATTERY_SOC_MAX = 0.95;             // maximum charge SOC
export const BATTERY_PEUKERT_N = 1.05;           // Peukert exponent Li-ion — Doerffel & Sharkh 2006
export const BATTERY_MAX_C_RATE = 2.0;           // maximum continuous C-rate — ASSUMPTION
export const BATTERY_ROUND_TRIP_ETA = 0.95;      // charge/discharge round-trip efficiency

// ─── AERODYNAMICS (MALE UAV class, assumption) ────────────────────────────
// No GARUN-specific aerodynamic data available. Assumptions documented here.
export const CD0_ASSUMPTION = 0.022;             // profile drag — ASSUMPTION for clean fixed-wing MALE UAV
export const OSWALD_E_ASSUMPTION = 0.82;         // Oswald span efficiency — ASSUMPTION
export const PROP_ETA_ASSUMPTION = 0.82;         // propeller efficiency — ASSUMPTION

// ─── ICAO RESERVE ──────────────────────────────────────────────────────────
export const ICAO_RESERVE_MINUTES = 30;          // minutes loiter reserve — ICAO Annex 6
