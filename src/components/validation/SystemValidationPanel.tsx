import React, { useState, useMemo } from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Wrench, 
  Info,
  Zap,
  Scale,
  Gauge,
  Flame,
  BatteryCharging,
  Cpu,
  Layers
} from 'lucide-react';
import { useGarunStore } from '../../store/useGarunStore';
import { 
  computeDetailedWeightBudget, 
  simulateFullMission, 
  powerRequired, 
  isaAtmosphere, 
  combustorTET,
  MissionPhaseInput
} from '../../physics/garunPhysics';
import { 
  DESIGN_MOTOR_KW, 
  DESIGN_ENGINE_KW, 
  COMP_MTOW_KG, 
  COMP_PAYLOAD_KG 
} from '../../physics/garunSpec';

export type ValidationStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface EngineeringCheckItem {
  id: string;
  name: string;
  category: 'MASS BUDGET' | 'POWER SIZING' | 'ELECTRICAL' | 'THERMAL' | 'BATTERY' | 'ENERGY BALANCE' | 'MISSION';
  status: ValidationStatus;
  actualValueStr: string;
  limitStr: string;
  marginStr: string;
  deficitDetail?: string;
  remediationFix: string;
}

interface SystemValidationPanelProps {
  className?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

export const SystemValidationPanel: React.FC<SystemValidationPanelProps> = ({
  className = '',
  isCollapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FAIL' | 'WARNING' | 'PASS'>('ALL');

  const { vehicleInputs, simulationParams, activeTelemetryFrame } = useGarunStore();

  // ─── LIVE AUTOMATED COMPUTATION OF ALL 12 CONSTRAINTS ────────────────────
  const validationSuite = useMemo(() => {
    const installedMotorKw = simulationParams.motorKw ?? DESIGN_MOTOR_KW;
    const installedEngineKw = simulationParams.engineKw ?? DESIGN_ENGINE_KW;

    // 1. Compute Weight Budget
    const weightBudget = computeDetailedWeightBudget({
      mtowKg: vehicleInputs.mtow_kg,
      payloadKg: vehicleInputs.payload_kg,
      batteryKwh: simulationParams.batteryCapacityKwh,
      engineKw: installedEngineKw,
      motorKw: installedMotorKw
    });

    // 2. Compute Power Required in Cruise
    const altM = vehicleInputs.cruise_alt_m || 3000;
    const speedKmh = vehicleInputs.cruise_speed_kmh || 250;
    const isa = isaAtmosphere(altM);
    const cruiseAero = powerRequired({
      massKg: vehicleInputs.mtow_kg,
      altM: altM,
      speedKmh: speedKmh,
      wingAreaM2: vehicleInputs.wing_area_m2,
      AR: vehicleInputs.aspect_ratio,
      e: vehicleInputs.oswald_e,
      CD0: vehicleInputs.cd0,
      etaProp: vehicleInputs.eta_prop
    });
    const requiredCruisePowerKw = cruiseAero.shaftPowerKw;

    const requiredMotorPowerWithMarginKw = requiredCruisePowerKw * 1.10;

    // 3. Simulate Full Mission
    const defaultMissionPhases: MissionPhaseInput[] = [
      { phaseName: 'Taxi & Warmup', durationHr: 0.1, altM: 0, speedKmh: 20, engineLoadFraction: 0.3, batteryPowerKw: 5, strategy: 'engine_dominant' },
      { phaseName: 'Takeoff & Climb', durationHr: 0.25, altM: altM / 2, speedKmh: 180, engineLoadFraction: 0.95, batteryPowerKw: 25, strategy: 'hybrid' },
      { phaseName: 'High Altitude Cruise', durationHr: 2.0, altM: altM, speedKmh: speedKmh, engineLoadFraction: 0.70, batteryPowerKw: 12, strategy: 'hybrid' },
      { phaseName: 'Loiter / Surveillance', durationHr: 3.5, altM: altM, speedKmh: vehicleInputs.loiter_speed_kmh || 150, engineLoadFraction: 0.55, batteryPowerKw: 8, strategy: 'hybrid' },
      { phaseName: 'Descent & Landing', durationHr: 0.25, altM: altM / 2, speedKmh: 140, engineLoadFraction: 0.20, batteryPowerKw: -10, strategy: 'engine_dominant' }
    ];

    const missionSim = simulateFullMission(
      defaultMissionPhases,
      {
        mtowKg: vehicleInputs.mtow_kg,
        payloadKg: vehicleInputs.payload_kg,
        oewKg: weightBudget.oewSubtotalKg,
        wingAreaM2: vehicleInputs.wing_area_m2,
        AR: vehicleInputs.aspect_ratio,
        CD0: vehicleInputs.cd0,
        e: vehicleInputs.oswald_e,
        etaProp: vehicleInputs.eta_prop
      },
      {
        engineRatedKw: installedEngineKw,
        batteryCapacityKwh: simulationParams.batteryCapacityKwh,
        busVoltageV: 400,
        etaGen: 0.95,
        etaRect: 0.97,
        etaInv: 0.97,
        etaMotor: 0.94,
        peukertN: 1.05,
        socMin: 0.20
      }
    );

    // Peak metrics
    const maxCRate = (25 / Math.max(1, simulationParams.batteryCapacityKwh)); // 25kW peak draw
    const maxBusCurrentA = (25000 / 400); // 62.5 A nominal at 400V
    const tetResult = combustorTET({ altM: altM, loadFraction: 0.95, pressureRatio: 8.5 });
    const peakTetK = tetResult.TET_K;
    const finalSoc = missionSim.finalSOC;
    const minMissionSoc = Math.min(...missionSim.phases.map(p => p.socFinal));
    const balanceErrorPct = missionSim.energyBalance.balanceErrorPct;
    const unfeasiblePhases = missionSim.phases.filter(p => !p.feasible);
    const maxEngineLoadPct = Math.max(...missionSim.phases.map(p => p.engineKw / Math.max(1, installedEngineKw))) * 100;

    // ─── DEFINITION OF 12 COMPREHENSIVE CHECKS ──────────────────────────────
    const checks: EngineeringCheckItem[] = [
      // 1. MASS BUDGET: MTOW Limit
      {
        id: 'chk_mtow',
        name: 'g1: Max Takeoff Weight (MTOW)',
        category: 'MASS BUDGET',
        status: vehicleInputs.mtow_kg <= COMP_MTOW_KG ? 'PASS' : 'FAIL',
        actualValueStr: `${vehicleInputs.mtow_kg} kg`,
        limitStr: `≤ ${COMP_MTOW_KG} kg`,
        marginStr: `${(COMP_MTOW_KG - vehicleInputs.mtow_kg).toFixed(0)} kg`,
        deficitDetail: vehicleInputs.mtow_kg > COMP_MTOW_KG 
          ? `MTOW exceeds competition limit by ${(vehicleInputs.mtow_kg - COMP_MTOW_KG).toFixed(1)} kg`
          : undefined,
        remediationFix: 'Reduce payload mass, battery capacity (kWh), or airframe structural mass to bring MTOW under 1,000 kg competition ceiling.'
      },

      // 2. MASS BUDGET: Minimum Payload Requirement
      {
        id: 'chk_payload',
        name: 'g2: Minimum Payload Capacity',
        category: 'MASS BUDGET',
        status: vehicleInputs.payload_kg >= COMP_PAYLOAD_KG ? 'PASS' : 'FAIL',
        actualValueStr: `${vehicleInputs.payload_kg} kg`,
        limitStr: `≥ ${COMP_PAYLOAD_KG} kg`,
        marginStr: `${(vehicleInputs.payload_kg - COMP_PAYLOAD_KG).toFixed(0)} kg`,
        deficitDetail: vehicleInputs.payload_kg < COMP_PAYLOAD_KG
          ? `Payload capacity is ${(COMP_PAYLOAD_KG - vehicleInputs.payload_kg).toFixed(1)} kg below competition spec`
          : undefined,
        remediationFix: 'Increase installed payload mass allocation to at least 200 kg to satisfy HAL GARUN defense competition rules.'
      },

      // 3. MASS BUDGET: Fuel Availability & Reserve
      {
        id: 'chk_fuel',
        name: 'g3: Mission Fuel Allocation & Reserve',
        category: 'MASS BUDGET',
        status: weightBudget.fuelMassKg <= 0 ? 'FAIL' : weightBudget.fuelMassKg < 100 ? 'WARNING' : 'PASS',
        actualValueStr: `${weightBudget.fuelMassKg.toFixed(1)} kg`,
        limitStr: `≥ 100.0 kg (Warning < 100kg, Fail ≤ 0kg)`,
        marginStr: `${(weightBudget.fuelMassKg - 100).toFixed(1)} kg`,
        deficitDetail: weightBudget.fuelMassKg <= 0 
          ? `Negative fuel allowance (${weightBudget.fuelMassKg.toFixed(1)} kg) — Aircraft cannot fly!`
          : weightBudget.fuelMassKg < 100
          ? `Low fuel margin (${weightBudget.fuelMassKg.toFixed(1)} kg) — Severely reduces endurance`
          : undefined,
        remediationFix: 'Reallocate weight budget by reducing battery kWh or empty structure mass to leave adequate Jet-A1 fuel mass.'
      },

      // 4. POWER SIZING: Motor Cruise Shaft Power Sizing
      {
        id: 'chk_motor_sizing',
        name: 'g4: Electric Motor Sizing (motor_kw ≥ cruise_shaft_power)',
        category: 'POWER SIZING',
        status: installedMotorKw < requiredCruisePowerKw 
          ? 'FAIL' 
          : installedMotorKw < requiredMotorPowerWithMarginKw 
          ? 'WARNING' 
          : 'PASS',
        actualValueStr: `${installedMotorKw} kW installed`,
        limitStr: `≥ ${requiredMotorPowerWithMarginKw.toFixed(1)} kW (10% margin)`,
        marginStr: `${(installedMotorKw - requiredMotorPowerWithMarginKw).toFixed(1)} kW`,
        deficitDetail: installedMotorKw < requiredCruisePowerKw
          ? `Required cruise shaft power: ${requiredCruisePowerKw.toFixed(1)} kW | Installed motor: ${installedMotorKw} kW | Deficit: ${(requiredCruisePowerKw - installedMotorKw).toFixed(1)} kW`
          : installedMotorKw < requiredMotorPowerWithMarginKw
          ? `Motor margin is <10% above required cruise shaft power (${requiredCruisePowerKw.toFixed(1)} kW)`
          : undefined,
        remediationFix: `Fix: Increase motor rating to ≥ ${requiredMotorPowerWithMarginKw.toFixed(1)} kW (cruise power × 1.10) OR Increase cruise altitude to reduce P_required OR Reduce cruise airspeed.`
      },

      // 5. POWER SIZING: Battery Discharge C-Rate Limit
      {
        id: 'chk_crate',
        name: 'g5: Battery Peak Discharge C-Rate',
        category: 'POWER SIZING',
        status: maxCRate > 2.0 ? 'FAIL' : maxCRate > 1.5 ? 'WARNING' : 'PASS',
        actualValueStr: `${maxCRate.toFixed(2)} C`,
        limitStr: `≤ 1.50 C (Warning > 1.5C, Fail > 2.0C)`,
        marginStr: `${(1.50 - maxCRate).toFixed(2)} C`,
        deficitDetail: maxCRate > 2.0
          ? `Battery C-rate (${maxCRate.toFixed(2)} C) exceeds safe thermal limit (2.0 C)`
          : maxCRate > 1.5
          ? `High C-rate discharge (${maxCRate.toFixed(2)} C) causes cell heating`
          : undefined,
        remediationFix: 'Increase battery pack capacity (kWh) or lower electric motor boost power draw to reduce C-rate.'
      },

      // 6. ELECTRICAL: DC Bus Thermal Current Limit
      {
        id: 'chk_bus_current',
        name: 'g6: DC Bus Current (400V Class)',
        category: 'ELECTRICAL',
        status: maxBusCurrentA > 300 ? 'FAIL' : maxBusCurrentA > 250 ? 'WARNING' : 'PASS',
        actualValueStr: `${maxBusCurrentA.toFixed(1)} A`,
        limitStr: `≤ 250.0 A (Fail > 300.0 A)`,
        marginStr: `${(250.0 - maxBusCurrentA).toFixed(1)} A`,
        deficitDetail: maxBusCurrentA > 300
          ? `DC Bus current (${maxBusCurrentA.toFixed(1)} A) risks thermal busbar overload`
          : maxBusCurrentA > 250
          ? `Bus current (${maxBusCurrentA.toFixed(1)} A) approaching thermal threshold`
          : undefined,
        remediationFix: 'Increase DC bus voltage architecture (e.g. 600V class) or limit peak inverter current draw.'
      },

      // 7. THERMAL: Turbine Entry Temperature (TET) Limit
      {
        id: 'chk_tet',
        name: 'g7: Combustor Turbine Entry Temp (TET)',
        category: 'THERMAL',
        status: peakTetK > 1700 ? 'FAIL' : peakTetK > 1600 ? 'WARNING' : 'PASS',
        actualValueStr: `${Math.round(peakTetK)} K (${Math.round(peakTetK - 273.15)} °C)`,
        limitStr: `≤ 1,600 K (Fail > 1,700 K)`,
        marginStr: `${(1600 - peakTetK).toFixed(0)} K`,
        deficitDetail: peakTetK > 1700
          ? `TET (${Math.round(peakTetK)} K) exceeds single-crystal turbine blade melt limit`
          : peakTetK > 1600
          ? `TET (${Math.round(peakTetK)} K) approaching thermal creep limit`
          : undefined,
        remediationFix: 'Derate turboshaft load fraction or increase electrical power split ratio to reduce combustor heat flux.'
      },

      // 8. BATTERY: Final Reserve SOC
      {
        id: 'chk_final_soc',
        name: 'g8: Final Reserve State of Charge (SOC)',
        category: 'BATTERY',
        status: finalSoc < 0.20 ? 'FAIL' : finalSoc < 0.25 ? 'WARNING' : 'PASS',
        actualValueStr: `${(finalSoc * 100).toFixed(1)} %`,
        limitStr: `≥ 25.0 % (Fail < 20.0 %)`,
        marginStr: `${((finalSoc - 0.25) * 100).toFixed(1)} %`,
        deficitDetail: finalSoc < 0.20
          ? `Final SOC (${(finalSoc * 100).toFixed(1)}%) violates Peukert battery floor`
          : finalSoc < 0.25
          ? `Final reserve SOC (${(finalSoc * 100).toFixed(1)}%) is tight (<25%)`
          : undefined,
        remediationFix: 'Increase battery capacity (kWh) or adjust in-flight generator charge-sustaining power level.'
      },

      // 9. BATTERY: Minimum Mission SOC Floor
      {
        id: 'chk_min_soc',
        name: 'g9: Minimum In-Flight SOC Floor',
        category: 'BATTERY',
        status: minMissionSoc < 0.20 ? 'FAIL' : 'PASS',
        actualValueStr: `${(minMissionSoc * 100).toFixed(1)} %`,
        limitStr: `≥ 20.0 % Floor`,
        marginStr: `${((minMissionSoc - 0.20) * 100).toFixed(1)} %`,
        deficitDetail: minMissionSoc < 0.20
          ? `SOC dropped to ${(minMissionSoc * 100).toFixed(1)}% during flight phase!`
          : undefined,
        remediationFix: 'Avoid deep battery discharge during climb phase by increasing turboshaft takeoff boost power.'
      },

      // 10. ENERGY BALANCE: Conservation Numerical Accuracy
      {
        id: 'chk_energy_balance',
        name: 'g10: Numerical Energy Balance Accuracy',
        category: 'ENERGY BALANCE',
        status: balanceErrorPct > 5.0 ? 'FAIL' : balanceErrorPct >= 2.0 ? 'WARNING' : 'PASS',
        actualValueStr: `${balanceErrorPct.toFixed(2)} % error`,
        limitStr: `< 2.00 % Error`,
        marginStr: `${(2.00 - balanceErrorPct).toFixed(2)} %`,
        deficitDetail: balanceErrorPct > 5.0
          ? `Simulation numerical integration error is ${balanceErrorPct.toFixed(2)}% (>5%)`
          : balanceErrorPct >= 2.0
          ? `Numerical energy discrepancy is ${balanceErrorPct.toFixed(2)}% (2–5%)`
          : undefined,
        remediationFix: 'Refine simulation time step or verify powertrain efficiency matrix in garunPhysics engine.'
      },

      // 11. MISSION: Phase Power Feasibility
      {
        id: 'chk_mission_feasibility',
        name: 'g11: Mission Phase Power Completion',
        category: 'MISSION',
        status: unfeasiblePhases.length > 0 ? 'FAIL' : 'PASS',
        actualValueStr: unfeasiblePhases.length === 0 ? '100% All Phases Feasible' : `${unfeasiblePhases.length} Phase Deficit`,
        limitStr: `All Phases Feasible`,
        marginStr: unfeasiblePhases.length === 0 ? 'Feasible' : 'Infeasible',
        deficitDetail: unfeasiblePhases.length > 0
          ? `Unfeasible phase(s): ${unfeasiblePhases.map(p => p.phaseName).join(', ')}`
          : undefined,
        remediationFix: 'Increase turboshaft rated kW or motor power capacity to meet power required in all phases.'
      },

      // 12. ENGINE: Turboshaft Continuous Load Margin
      {
        id: 'chk_engine_load',
        name: 'g12: Turboshaft Continuous Load Rating',
        category: 'POWER SIZING',
        status: maxEngineLoadPct > 100.0 ? 'FAIL' : maxEngineLoadPct > 90.0 ? 'WARNING' : 'PASS',
        actualValueStr: `${maxEngineLoadPct.toFixed(1)} % load`,
        limitStr: `≤ 90.0 % Load (Fail > 100.0%)`,
        marginStr: `${(90.0 - maxEngineLoadPct).toFixed(1)} %`,
        deficitDetail: maxEngineLoadPct > 100.0
          ? `Turboshaft engine overloaded at ${maxEngineLoadPct.toFixed(1)}% rating!`
          : maxEngineLoadPct > 90.0
          ? `High continuous engine thermal stress at ${maxEngineLoadPct.toFixed(1)}% load`
          : undefined,
        remediationFix: 'Increase engine rated kW or shift propulsive split to electric motor.'
      }
    ];

    const passCount = checks.filter(c => c.status === 'PASS').length;
    const warnCount = checks.filter(c => c.status === 'WARNING').length;
    const failCount = checks.filter(c => c.status === 'FAIL').length;

    const overallStatus: ValidationStatus = failCount > 0 ? 'FAIL' : warnCount > 0 ? 'WARNING' : 'PASS';

    return {
      checks,
      passCount,
      warnCount,
      failCount,
      overallStatus
    };
  }, [vehicleInputs, simulationParams]);

  // Filter checks based on tab selection
  const filteredChecks = useMemo(() => {
    if (filterStatus === 'ALL') return validationSuite.checks;
    return validationSuite.checks.filter(c => c.status === filterStatus);
  }, [validationSuite, filterStatus]);

  return (
    <CornerReticle id="system-validation-suite-panel" className={`bg-[#0F1729] text-[#E8EDF7] p-3 flex flex-col relative overflow-hidden select-none ${className}`}>
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldCheck className={`w-4 h-4 ${
            validationSuite.overallStatus === 'PASS' 
              ? 'text-[#00E87A]' 
              : validationSuite.overallStatus === 'WARNING' 
              ? 'text-[#FFB800]' 
              : 'text-[#FF3B30]'
          }`} />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-2">
              <span>AUTOMATED SYSTEM ENGINEERING VALIDATION MATRIX</span>
              <span className="text-[8.5px] bg-[#172236] text-[#00A8FF] px-1.5 py-0.2 rounded border border-[#1A2740] font-mono-data">
                12 CONSTRAINTS (g1–g12)
              </span>
            </h2>
            <span className="text-[9.5px] font-mono-data text-[#00E87A]">
              REAL-TIME CLOSED-LOOP COMPLIANCE & DEFECT DIAGNOSTIC SUITE
            </span>
          </div>
        </div>

        {/* Overall Status Badge */}
        <div className="flex items-center space-x-2">
          <div className={`px-2.5 py-1 rounded border text-[10px] font-mono-data font-bold uppercase flex items-center space-x-1.5 shadow-sm ${
            validationSuite.overallStatus === 'PASS'
              ? 'bg-[#00E87A]/20 text-[#00E87A] border-[#00E87A]'
              : validationSuite.overallStatus === 'WARNING'
              ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]'
              : 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30] animate-pulse'
          }`}>
            {validationSuite.overallStatus === 'PASS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />}
            {validationSuite.overallStatus === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-[#FFB800]" />}
            {validationSuite.overallStatus === 'FAIL' && <XCircle className="w-3.5 h-3.5 text-[#FF3B30]" />}
            <span>STATUS: {validationSuite.overallStatus}</span>
          </div>

          {isCollapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 bg-[#172236] hover:bg-[#1F2D45] border border-[#1A2740] rounded text-[#8A9BBE] transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Summary Counters Strip & Filter Buttons */}
      <div className="bg-[#111A2E] p-2 rounded border border-[#1A2740] mb-2 flex items-center justify-between text-[9.5px] font-mono-data flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-[#8A9BBE] flex items-center space-x-1">
            <span>VERIFIED:</span>
            <strong className="text-white font-bold">{validationSuite.checks.length} CHECKS</strong>
          </span>
          <span className="text-[#00E87A] flex items-center space-x-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{validationSuite.passCount} PASSING</span>
          </span>
          <span className="text-[#FFB800] flex items-center space-x-1 font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>{validationSuite.warnCount} WARNINGS</span>
          </span>
          <span className="text-[#FF3B30] flex items-center space-x-1 font-bold">
            <XCircle className="w-3 h-3" />
            <span>{validationSuite.failCount} FAILURES</span>
          </span>
        </div>

        {/* Filter Tab Group */}
        <div className="flex items-center space-x-1">
          <Filter className="w-3 h-3 text-[#8A9BBE]" />
          {(['ALL', 'FAIL', 'WARNING', 'PASS'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#00A8FF] text-[#0A0F1E]'
                  : 'bg-[#172236] text-[#8A9BBE] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Detailed Validation Table & Recommendations */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar text-[9.5px] font-mono-data">
          {filteredChecks.map((chk) => {
            const isItemExpanded = expandedCheckId === chk.id || chk.status === 'FAIL';

            return (
              <div
                key={chk.id}
                className={`p-2 rounded border transition-all ${
                  chk.status === 'FAIL'
                    ? 'bg-[#FF3B30]/10 border-[#FF3B30]'
                    : chk.status === 'WARNING'
                    ? 'bg-[#FFB800]/10 border-[#FFB800]/60'
                    : 'bg-[#111A2E]/80 border-[#1A2740] hover:border-[#00A8FF]/40'
                }`}
              >
                {/* Check Row Main Info */}
                <div
                  onClick={() => setExpandedCheckId(expandedCheckId === chk.id ? null : chk.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    {chk.status === 'PASS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A] flex-shrink-0" />}
                    {chk.status === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-[#FFB800] flex-shrink-0 animate-pulse" />}
                    {chk.status === 'FAIL' && <XCircle className="w-3.5 h-3.5 text-[#FF3B30] flex-shrink-0 animate-bounce" />}
                    <span className="font-bold text-[#E8EDF7]">{chk.name}</span>
                    <span className="text-[8px] bg-[#172236] text-[#8A9BBE] px-1 rounded border border-[#1A2740]">
                      {chk.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[#8A9BBE] text-[8.5px]">
                      COMPUTED: <strong className={chk.status === 'PASS' ? 'text-[#00E87A]' : chk.status === 'WARNING' ? 'text-[#FFB800]' : 'text-[#FF3B30]'}>
                        {chk.actualValueStr}
                      </strong>
                    </span>

                    <span className="text-[#8A9BBE] text-[8.5px]">
                      LIMIT: <span className="text-white">{chk.limitStr}</span>
                    </span>

                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      chk.status === 'PASS' ? 'bg-[#00E87A]/20 text-[#00E87A]' : chk.status === 'WARNING' ? 'bg-[#FFB800]/20 text-[#FFB800]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'
                    }`}>
                      {chk.status}
                    </span>

                    <ChevronDown className={`w-3.5 h-3.5 text-[#8A9BBE] transition-transform ${isItemExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Defect Detail & Actionable Engineering Fix */}
                {isItemExpanded && (
                  <div className="mt-2 pt-2 border-t border-[#1A2740] bg-[#0D1527] p-2 rounded space-y-1.5 text-[8.5px]">
                    {chk.deficitDetail && (
                      <div className="text-[#FF3B30] font-bold flex items-center space-x-1.5">
                        <XCircle className="w-3 h-3 flex-shrink-0" />
                        <span>DEFECT: {chk.deficitDetail}</span>
                      </div>
                    )}

                    <div className="text-[#00A8FF] flex items-start space-x-1.5">
                      <Wrench className="w-3 h-3 text-[#00A8FF] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white uppercase text-[8px]">ENGINEERING REMEDIATION ACTION:</span>
                        <p className="text-[#E8EDF7] font-normal leading-relaxed">{chk.remediationFix}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[8px] text-[#8A9BBE] pt-1 border-t border-[#1A2740]/60">
                      <span>MARGIN TO BOUNDARY: <strong className={chk.status === 'PASS' ? 'text-[#00E87A]' : 'text-[#FF3B30]'}>{chk.marginStr}</strong></span>
                      <span className="text-[#00E87A] italic">AUTO-COMPUTED FROM PHYSICS ENGINE</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CornerReticle>
  );
};
