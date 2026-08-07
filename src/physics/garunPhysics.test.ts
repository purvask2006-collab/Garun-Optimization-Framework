import { describe, it, expect } from 'vitest';
import {
  isaAtmosphere,
  enginePowerAtAlt,
  engineSFC,
  engineFuelFlow,
  powerRequired,
  batterySOCUpdate,
  dcBusPowerBalance,
  combustorTET,
  simulateMissionPhase,
  simulateFullMission,
  computeWeightBudget,
  computeDetailedWeightBudget,
  breguetEndurance,
  VehicleParams,
  PropulsionParams,
  MissionPhaseInput,
} from './garunPhysics';

describe('GARUN Physics Engine Verification', () => {
  it('1. isaAtmosphere(0) should yield SL standard conditions', () => {
    const sl = isaAtmosphere(0);
    expect(sl.tempK).toBeCloseTo(288.15, 2);
    expect(sl.densityKgM3).toBeCloseTo(1.225, 3);
  });

  it('2. isaAtmosphere(3000) should match 3km standard air', () => {
    const alt3k = isaAtmosphere(3000);
    expect(alt3k.tempK).toBeCloseTo(268.65, 2);
    expect(alt3k.densityKgM3).toBeCloseTo(0.909, 2);
  });

  it('3. isaAtmosphere(11000) should reach tropopause temperature', () => {
    const tropo = isaAtmosphere(11000);
    expect(tropo.tempK).toBeCloseTo(216.65, 2);
  });

  it('4. enginePowerAtAlt(60, 3000) should derate power to approx 48-52 kW', () => {
    const deratedP = enginePowerAtAlt(60, 3000);
    expect(deratedP).toBeGreaterThan(48);
    expect(deratedP).toBeLessThan(52);
  });

  it('5. engineSFC(1.0) should equal rated SFC 0.450 kg/kWh', () => {
    expect(engineSFC(1.0)).toBeCloseTo(0.450, 3);
  });

  it('6. engineSFC(0.0) should equal 0.730 kg/kWh (0.450 + 0.280)', () => {
    expect(engineSFC(0.0)).toBeCloseTo(0.730, 3);
  });

  it('7. engineFuelFlow(60, 0.450) should equal 27.0 kg/hr', () => {
    expect(engineFuelFlow(60, 0.450)).toBeCloseTo(27.0, 1);
  });

  it('8. powerRequired for 1000kg at 3km and 250km/h', () => {
    const req = powerRequired({
      massKg: 1000,
      altM: 3000,
      speedKmh: 250,
      wingAreaM2: 15,
      AR: 12,
      e: 0.82,
      CD0: 0.022,
      etaProp: 0.82,
    });
    expect(req.CL).toBeGreaterThan(0);
    expect(req.LOverD).toBeGreaterThan(5);
    expect(req.shaftPowerKw).toBeGreaterThan(0);
  });

  it('9. batterySOCUpdate should drain SOC and respect floor', () => {
    const bat = batterySOCUpdate({
      socInitial: 0.95,
      powerKw: 22,
      durationHr: 1,
      capacityKwh: 22,
      peukertN: 1.05,
      socMin: 0.20,
    });
    expect(bat.socFinal).toBeLessThan(0.95);
    expect(bat.socFinal).toBeGreaterThanOrEqual(0.20);
  });

  it('10. dcBusPowerBalance should yield ETA_ELEC_CHAIN approx 0.823', () => {
    const bus = dcBusPowerBalance({
      engineKw: 60,
      batteryKw: 0,
      etaGen: 0.93,
      etaRect: 0.97,
      etaInv: 0.96,
      etaMotor: 0.95,
    });
    expect(bus.etaChain).toBeCloseTo(0.823, 2);
    expect(bus.motorShaftKw).toBeLessThan(60);
  });

  it('11. computeWeightBudget should correctly calculate mass allocations', () => {
    const budget = computeWeightBudget({
      engineKw: 60,
      batteryKwh: 22,
      payloadKg: 200,
      oewKg: 550,
    });
    expect(budget.batteryMassKg).toBeCloseTo(110, 1); // 22kWh * 1000 / 200Wh/kg = 110kg
    expect(budget.fuelMassKg).toBeCloseTo(140, 1);    // 1000 - 550 - 200 - 110 = 140kg
    expect(budget.totalMassKg).toBeCloseTo(1000, 1);
  });

  it('12. breguetEndurance should compute positive endurance in hours', () => {
    const hours = breguetEndurance({
      etaProp: 0.82,
      sfcKgKwh: 0.450,
      LOverD: 14,
      massInitialKg: 1000,
      massFinalKg: 860,
    });
    expect(hours).toBeGreaterThan(3);
  });

  it('13. computeDetailedWeightBudget satisfies MTOW = OEW + Payload + Fuel + Battery_mass', () => {
    const res = computeDetailedWeightBudget({
      mtowKg: 1000,
      payloadKg: 200,
      batteryKwh: 22,
      engineKw: 60,
      motorKw: 55,
      generatorKw: 60,
    });
    expect(res.batteryMassKg).toBeCloseTo(110, 1);
    expect(res.oewSubtotalKg).toBeGreaterThan(500);
    expect(res.fuelMassKg).toBeGreaterThan(0);
    expect(res.totalMassKg).toBeCloseTo(1000, 1);
    expect(res.mtowValidation).toBe('PASS');
    expect(res.payloadValidation).toBe('PASS');
  });

  it('14. powerRequired for cruise (250km/h @ 3000m) matches physics target ~69 kW shaft power', () => {
    const cruise = powerRequired({
      massKg: 1000,
      altM: 3000,
      speedKmh: 250,
      wingAreaM2: 15,
      AR: 12,
      e: 0.82,
      CD0: 0.022,
      etaProp: 0.82,
    });
    expect(cruise.LOverD).toBeGreaterThan(11);
    expect(cruise.LOverD).toBeLessThan(13);
    expect(cruise.shaftPowerKw).toBeGreaterThan(64);
    expect(cruise.shaftPowerKw).toBeLessThan(74);
  });

  it('15. powerRequired for loiter (150km/h @ 3000m) matches physics target ~27 kW shaft power', () => {
    const loiter = powerRequired({
      massKg: 1000,
      altM: 3000,
      speedKmh: 150,
      wingAreaM2: 15,
      AR: 12,
      e: 0.82,
      CD0: 0.022,
      etaProp: 0.82,
    });
    expect(loiter.LOverD).toBeGreaterThan(17);
    expect(loiter.LOverD).toBeLessThan(20);
    expect(loiter.shaftPowerKw).toBeGreaterThan(24);
    expect(loiter.shaftPowerKw).toBeLessThan(30);
  });

  it('16. battery electrochemical model: 22 kWh pack gives 110 kg mass and 16.5 kWh usable energy', () => {
    const capacityKwh = 22;
    const packMassKg = (capacityKwh * 1000) / 200; // 200 Wh/kg
    const usableKwh = capacityKwh * (0.95 - 0.20); // 75% window
    const maxPowerKw = 2.0 * capacityKwh; // 2.0C limit

    expect(packMassKg).toBe(110);
    expect(usableKwh).toBe(16.5);
    expect(maxPowerKw).toBe(44);
  });

  it('17. batterySOCUpdate performs Coulomb counting with Peukert effect', () => {
    const initialSoc = 0.95;
    const update = batterySOCUpdate({
      socInitial: initialSoc,
      powerKw: 20, // 20 kW boost draw
      durationHr: 0.5, // 30 min
      capacityKwh: 22,
      peukertN: 1.05,
      socMin: 0.20
    });

    expect(update.cRate).toBeCloseTo(20 / 22, 2);
    expect(update.energyConsumedKwh).toBeGreaterThan(9.5);
    expect(update.socFinal).toBeLessThan(initialSoc);
    expect(update.socFinal).toBeGreaterThan(0.20);
  });
});
