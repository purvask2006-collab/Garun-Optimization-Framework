export interface VehicleParams {
  mtow_kg: number;
  payload_kg: number;
  oew_kg: number;
  wing_area_m2: number;
  AR: number;
  e: number;
  CD0: number;
  cruise_speed_kmh: number;
  loiter_speed_kmh: number;
  cruise_alt_m: number;
  loiter_alt_m: number;
}

export interface PropulsionParams {
  engine_rated_kw: number;
  sfc_rated_kg_kwh: number;
  generator_eff: number;
  battery_kwh: number;
  battery_specific_energy_wh_kg: number;
  battery_soc_min: number;
  battery_soc_max: number;
  motor_kw: number;
  prop_eff: number;
}

export interface EnergyParams {
  bus_voltage_v: number;
  rectifier_eff: number;
  inverter_eff: number;
  peukert_n: number;
}

export interface MissionPhaseResult {
  phase_name: string;
  duration_hr: number;
  alt_m: number;
  speed_kmh: number;
  engine_kw: number;
  battery_kw: number;
  motor_shaft_kw: number;
  fuel_flow_kg_hr: number;
  fuel_consumed_kg: number;
  energy_kwh: number;
  soc_start: number;
  soc_end: number;
  tet_k: number;
  feasible: boolean;
  notes: string;
}

export interface MissionResult {
  phases: MissionPhaseResult[];
  total_fuel_kg: number;
  total_endurance_hr: number;
  loiter_endurance_hr: number;
  final_soc: number;
  energy_balance_error_pct: number;
  feasible: boolean;
}

export interface ValidationResult {
  check_id: string;
  check_name: string;
  status: 'pass' | 'warning' | 'fail';
  actual_value: number;
  limit_value: number;
  unit: string;
  message: string;
}

export interface OptimizationPoint {
  battery_kwh: number;
  engine_kw: number;
  motor_kw: number;
  endurance_hr: number;
  fuel_kg: number;
  propulsion_mass_kg: number;
  sfc_kg_kwh: number;
  is_pareto_optimal: boolean;
  feasible: boolean;
}
