// ─── COMPETITION-GIVEN PARAMETERS (problem statement) ─────────────────────
// Source: IIT Indore × HAL problem statement (GARUN competition brief)
// These are NOT assumptions — they are direct problem statement inputs.
export const COMP_MTOW_KG = 1000;               // kg — "≈1000 kg" from problem statement
export const COMP_PAYLOAD_KG = 200;             // kg — "≈200 kg" from problem statement
export const COMP_CRUISE_SPEED_KMH = 250;       // km/h — "≈250 km/h" from problem statement
export const COMP_CRUISE_ALT_M_RANGE: [number, number] = [3000, 10000]; // m — "3–10 km" from problem statement
export const COMP_ENGINE_RATED_KW = 60;         // kW — "≈60 kW turboshaft" from problem statement
export const COMP_ARCHITECTURE = 'series_hybrid'; // from problem statement

// ─── CURRENT GARUN DESIGN DIRECTION (team-defined, NOT competition-given) ──
// These values are team design choices, subject to change by optimizer.
// Distinguish clearly from competition inputs above.
export const DESIGN_ENGINE_KW = 60;             // kW — aligned with competition preferred
export const DESIGN_BATTERY_KWH = 22;           // kWh — team decision (design variable in NSGA-II)
export const DESIGN_BUS_VOLTAGE_V = 400;        // V — team decision
export const DESIGN_MOTOR_KW = 55;              // kW — sized to match cruise requirement
export const DESIGN_ASPECT_RATIO = 12;          // team assumption
export const DESIGN_WING_AREA_M2 = 15;         // m² — team assumption (to be validated)

// ─── DERIVED WEIGHT BUDGET (must be verified each time inputs change) ──────
// THESE ARE NOT HARDCODED — compute fresh from inputs
// OEW is estimated from component mass budgets — update when propulsion sizing changes
export const EST_OEW_KG = 550;                  // kg — ESTIMATE ONLY. Verify with component sizing.
// Fuel = MTOW - OEW - Payload - Battery_mass
// Battery_mass = DESIGN_BATTERY_KWH × 1000 / BATTERY_SPECIFIC_ENERGY_WH_KG_PACK
// = 22000 / 200 = 110 kg
// Fuel = 1000 - 550 - 200 - 110 = 140 kg
// NOTE: Previous analysis used wrong payload (100kg not 200kg). Recalculate.

// ─── IMPORTANT FLAGS FOR DASHBOARD ─────────────────────────────────────────
// These flags help the dashboard communicate data confidence
export const DATA_CONFIDENCE = {
  COMP_GIVEN: 'competition-given',     // directly from problem statement
  LITERATURE: 'literature-derived',    // from published papers/datasheets
  TEAM_DESIGN: 'team-design-choice',  // team decision, subject to optimization
  ASSUMPTION: 'engineering-assumption', // assumed, must be documented
  COMPUTED: 'computed',                // derived from model/calculation
  OPTIMIZATION: 'optimization-output', // output of NSGA-II or sweep
  PLACEHOLDER: 'placeholder',          // temporary, replace before HAL presentation
} as const;
