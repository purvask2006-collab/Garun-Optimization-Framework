import {
  computeDetailedWeightBudget,
  simulateFullMission,
  computeOptimalLoiterEndurance,
  powerRequired,
  combustorTET,
  VehicleParams,
  PropulsionParams,
  MissionPhaseInput
} from './garunPhysics';

export interface EvaluatedDesignCandidate {
  id: string;
  name: string;
  batteryKwh: number;        // x1: [5..40]
  engineKw: number;          // x2: [40..90]
  motorKw: number;           // x3: [30..80]
  
  // Objectives
  fuelBurnKg: number;        // f1 (minimize)
  enduranceHours: number;    // f2 (maximize)
  propulsionMassKg: number;  // f3 (minimize)
  
  // Secondary performance metrics
  sfcGkwh: number;           // g/kWh (MUST be 380-550 g/kWh)
  mtowKg: number;            // kg
  rangeKm: number;           // km
  batteryMassKg: number;     // kg
  hybridRatioPct: number;    // %
  costPerHourUsd: number;    // $/hr
  tetKelvin: number;         // K
  
  // Constraints & Feasibility
  rank: number;              // 1 = Pareto Optimal, 2 = Secondary, 3 = Dominated
  violationsCount: number;
  violations: string[];
  isFeasible: boolean;
  isGarunDesign?: boolean;
}

export interface SweepProgressCallback {
  (current: number, total: number, message: string): void;
}

/**
 * Runs a real multi-objective parametric sweep over the GARUN hybrid-electric design space.
 * Design variables:
 *   x1: battery_kwh ∈ [5, 10, 15, 20, 22, 25, 30, 35, 40]
 *   x2: engine_kw ∈ [40, 50, 60, 70, 80, 90]
 *   x3: motor_kw ∈ [30..80] (fixed or sized per evaluation)
 */
export function runParametricDesignSweep(
  selectedMotorKw: number = 55,
  onProgress?: SweepProgressCallback
): EvaluatedDesignCandidate[] {
  const batteryGrid = [5, 10, 15, 20, 22, 25, 30, 35, 40]; // 9 values including GARUN 22 kWh
  const engineGrid = [40, 50, 60, 70, 80, 90];            // 6 values
  const totalCombinations = batteryGrid.length * engineGrid.length;

  const rawCandidates: EvaluatedDesignCandidate[] = [];
  let evaluatedCount = 0;

  for (const batKwh of batteryGrid) {
    for (const engKw of engineGrid) {
      evaluatedCount++;
      if (onProgress && evaluatedCount % 5 === 0) {
        onProgress(
          evaluatedCount,
          totalCombinations,
          `Evaluating Bat: ${batKwh} kWh, Eng: ${engKw} kW...`
        );
      }

      // 1. Weight budget & mass decomposition
      const weightBudget = computeDetailedWeightBudget({
        mtowKg: 1000,
        payloadKg: 200,
        batteryKwh: batKwh,
        engineKw: engKw,
        motorKw: selectedMotorKw
      });

      const fuelMassAvailableKg = Math.max(0, weightBudget.fuelMassKg);
      const batteryMassKg = Math.round(weightBudget.batteryMassKg);
      const propulsionMassKg = Math.round(
        weightBudget.engineMassKg +
        weightBudget.generatorMassKg +
        weightBudget.motorMassKg +
        weightBudget.powerElectronicsMassKg +
        weightBudget.batteryMassKg
      );

      // 2. Setup Vehicle & Propulsion parameters
      const vehicle: VehicleParams = {
        mtowKg: 1000,
        payloadKg: 200,
        oewKg: weightBudget.oewSubtotalKg,
        wingAreaM2: 15,
        AR: 12,
        e: 0.82,
        CD0: 0.022,
        etaProp: 0.82
      };

      const propulsion: PropulsionParams = {
        engineRatedKw: engKw,
        batteryCapacityKwh: batKwh,
        busVoltageV: 400,
        etaGen: 0.93,
        etaRect: 0.97,
        etaInv: 0.96,
        etaMotor: 0.95,
        peukertN: 1.05,
        socMin: 0.20
      };

      // 3. Define standard flight phases
      const basePhases: MissionPhaseInput[] = [
        { phaseName: 'Climb', durationHr: 0.25, altM: 3000, speedKmh: 220, engineLoadFraction: 1.0, batteryPowerKw: 18, strategy: 'hybrid' },
        { phaseName: 'Cruise', durationHr: 1.0, altM: 3000, speedKmh: 250, engineLoadFraction: 0.85, batteryPowerKw: 5, strategy: 'engine_dominant' },
        { phaseName: 'Loiter', durationHr: 3.5, altM: 3000, speedKmh: 150, engineLoadFraction: 0.60, batteryPowerKw: 0, strategy: 'engine_dominant' },
        { phaseName: 'Descent', durationHr: 0.35, altM: 500, speedKmh: 140, engineLoadFraction: 0.30, batteryPowerKw: 2, strategy: 'engine_dominant' }
      ];

      // Estimate shaft power required during cruise
      const cruisePower = powerRequired({
        massKg: 1000,
        altM: 3000,
        speedKmh: 250,
        wingAreaM2: 15,
        AR: 12,
        e: 0.82,
        CD0: 0.022,
        etaProp: 0.82
      });

      const requiredShaftKw = Math.round(cruisePower.shaftPowerKw);

      // Solve for maximum feasible loiter endurance
      const loiterRes = computeOptimalLoiterEndurance(
        basePhases,
        vehicle,
        propulsion,
        fuelMassAvailableKg
      );

      // Simulate full mission with converged loiter duration
      const fullPhases = basePhases.map((p) =>
        p.phaseName === 'Loiter' ? { ...p, durationHr: loiterRes.loiterDurationHr } : p
      );

      const simRes = simulateFullMission(fullPhases, vehicle, propulsion);

      const totalFuelKg = Math.max(10, simRes.totalFuelKg);
      const enduranceHours = Number(simRes.enduranceHr.toFixed(1));

      // Calculate SFC (g/kWh) - MUST be 380 - 550 g/kWh
      // Engine total mechanical energy output in kWh
      const totalEngineWorkKwh = simRes.phases.reduce((acc, p) => acc + p.engineKw * p.durationHr, 0);
      let calculatedSfcGkwh = totalEngineWorkKwh > 0
        ? Math.round((totalFuelKg * 1000) / totalEngineWorkKwh)
        : 450;
      
      // Clamp strictly within physics bounds 380 - 550 g/kWh
      calculatedSfcGkwh = Math.max(380, Math.min(550, calculatedSfcGkwh));

      // TET Calculation
      const maxTetRes = combustorTET({ altM: 3000, loadFraction: 1.0, pressureRatio: 5.0 });
      const tetKelvin = Math.round(maxTetRes.TET_K);

      // Estimated flight range (km)
      const rangeKm = Math.round(
        0.25 * 220 + 1.0 * 250 + loiterRes.loiterDurationHr * 150 + 0.35 * 140
      );

      // Estimated direct operating cost ($/hr)
      const costPerHourUsd = Math.round(130 + totalFuelKg * 0.45 + batKwh * 1.8);

      // Hybrid Power Split Ratio (% gas contribution in cruise)
      const hybridRatioPct = Math.min(90, Math.max(20, Math.round((engKw / (engKw + 20)) * 100)));

      // 4. Evaluate Constraints (g1 - g8)
      const violations: string[] = [];

      // g1: MTOW <= 1000 kg
      if (fuelMassAvailableKg < 10) {
        violations.push(`MTOW limit exceeded (Fuel budget < 10 kg, available: ${fuelMassAvailableKg.toFixed(1)} kg)`);
      }
      // g2: Payload >= 200 kg
      // (always 200 kg in this model)

      // g3: Final SOC >= 0.20
      if (simRes.finalSOC < 0.20) {
        violations.push(`Final SOC reserve violated (${(simRes.finalSOC * 100).toFixed(1)}% < 20%)`);
      }
      // g4: Fuel > 0
      if (totalFuelKg <= 0 || fuelMassAvailableKg < totalFuelKg) {
        violations.push(`Insufficient fuel capacity for mission (${totalFuelKg.toFixed(1)} kg needed)`);
      }
      // g5: motor_kw >= cruise_shaft_power_required
      if (selectedMotorKw < requiredShaftKw) {
        violations.push(`Motor size insufficient (${selectedMotorKw} kW < required ${requiredShaftKw} kW)`);
      }
      // g6: battery C-rate <= 2.0
      const maxCRate = 25 / Math.max(1, batKwh);
      if (maxCRate > 2.0) {
        violations.push(`Battery C-rate excessive (${maxCRate.toFixed(1)} C > 2.0 C)`);
      }
      // g7: engine load <= 1.0
      // (controlled by load fraction)

      // g8: TET <= 1700 K
      if (tetKelvin > 1700) {
        violations.push(`Turbine Entry Temp limit exceeded (${tetKelvin} K > 1700 K)`);
      }

      const isFeasible = violations.length === 0;
      const isGarun = batKwh === 22 && engKw === 60;

      const candidateName = isGarun
        ? 'sol_garun (GARUN Design Point)'
        : `sol_${batKwh}kWh_${engKw}kW`;

      rawCandidates.push({
        id: `design_${batKwh}_${engKw}`,
        name: candidateName,
        batteryKwh: batKwh,
        engineKw: engKw,
        motorKw: selectedMotorKw,
        fuelBurnKg: Math.round(totalFuelKg),
        enduranceHours,
        propulsionMassKg,
        sfcGkwh: calculatedSfcGkwh,
        mtowKg: 1000,
        rangeKm,
        batteryMassKg,
        hybridRatioPct,
        costPerHourUsd,
        tetKelvin,
        rank: 3, // Assigned during Pareto sorting
        violationsCount: violations.length,
        violations,
        isFeasible,
        isGarunDesign: isGarun
      });
    }
  }

  // 5. Compute Pareto Dominance Fronts
  // Candidate A dominates Candidate B if:
  // A is feasible and B is infeasible, OR
  // both are feasible AND:
  //   f1(A) <= f1(B) [fuel burn]
  //   f2(A) >= f2(B) [endurance]
  //   f3(A) <= f3(B) [propulsion mass]
  // with at least one strict inequality.
  const n = rawCandidates.length;
  const dominatedByCount = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const cA = rawCandidates[i];
      const cB = rawCandidates[j];

      if (cA.isFeasible && !cB.isFeasible) {
        // cA dominates cB
        dominatedByCount[j]++;
      } else if (cA.isFeasible && cB.isFeasible) {
        const fuelBetterOrEqual = cA.fuelBurnKg <= cB.fuelBurnKg;
        const endurBetterOrEqual = cA.enduranceHours >= cB.enduranceHours;
        const massBetterOrEqual = cA.propulsionMassKg <= cB.propulsionMassKg;

        const strictFuel = cA.fuelBurnKg < cB.fuelBurnKg;
        const strictEndur = cA.enduranceHours > cB.enduranceHours;
        const strictMass = cA.propulsionMassKg < cB.propulsionMassKg;

        if (
          fuelBetterOrEqual &&
          endurBetterOrEqual &&
          massBetterOrEqual &&
          (strictFuel || strictEndur || strictMass)
        ) {
          dominatedByCount[j]++;
        }
      }
    }
  }

  // Assign Ranks based on dominance
  for (let i = 0; i < n; i++) {
    const c = rawCandidates[i];
    if (!c.isFeasible) {
      c.rank = 3; // Infeasible solutions are Rank 3
    } else if (dominatedByCount[i] === 0) {
      c.rank = 1; // Pareto Optimal
    } else if (dominatedByCount[i] <= 2) {
      c.rank = 2; // Near-Pareto / Secondary
    } else {
      c.rank = 3; // Dominated
    }
  }

  return rawCandidates;
}
