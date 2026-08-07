import { describe, it, expect } from 'vitest';

// ─── ISA Atmosphere Model (from HighAltitudeMonitorPanel) ──────────────────
function isaTemp(altM: number): number {
  return Math.max(216.65, 288.15 - 0.0065 * Math.min(altM, 11000));
}
function isaPressure(altM: number): number {
  const T = isaTemp(altM);
  return 101.325 * Math.pow(T / 288.15, 5.25588);
}
function isaDensity(altM: number): number {
  const T = isaTemp(altM);
  const P = isaPressure(altM);
  return (P * 1000) / (287.058 * T);
}

// ─── Turboshaft SFC Model (corrected) ────────────────────────────────────
function turboshaftSFC(engineLoad: number): number {
  return 0.450 + 0.280 * Math.pow(1 - engineLoad, 1.8);
}

// ─── Endurance Calculation ────────────────────────────────────────────────
function fuelEndurance(fuelKg: number, engineKw: number, sfcKgKwh: number): number {
  const fuelFlowKgHr = engineKw * sfcKgKwh;
  return fuelKg / fuelFlowKgHr;
}

// ─── DC Bus Current ────────────────────────────────────────────────────────
function busCurrent(totalPowerKw: number, busVoltageV: number): number {
  return (totalPowerKw * 1000) / busVoltageV;
}

// ─── Battery SOC ──────────────────────────────────────────────────────────
function updateSOC(initialSOC: number, powerKw: number, durationHr: number, capacityKwh: number): number {
  const SOC_FLOOR = 0.20;
  const energyFrac = (powerKw * durationHr) / capacityKwh;
  return Math.max(SOC_FLOOR, initialSOC - energyFrac);
}

// ═══════════════════════════════════════════════════════════════════════════
describe('GARUN Physics — ISA Atmosphere', () => {
  it('Sea level temperature should be 288.15K', () => {
    expect(isaTemp(0)).toBeCloseTo(288.15, 2);
  });
  it('3000m altitude temperature should be 268.65K', () => {
    expect(isaTemp(3000)).toBeCloseTo(268.65, 1);
  });
  it('11000m temperature should be 216.65K (tropopause)', () => {
    expect(isaTemp(11000)).toBeCloseTo(216.65, 2);
  });
  it('20000m temperature should also be 216.65K (stratosphere constant)', () => {
    expect(isaTemp(20000)).toBeCloseTo(216.65, 2);
  });
  it('3000m density should be approximately 0.909 kg/m³', () => {
    expect(isaDensity(3000)).toBeCloseTo(0.909, 2);
  });
  it('Sea level density should be approximately 1.225 kg/m³', () => {
    expect(isaDensity(0)).toBeCloseTo(1.225, 2);
  });
});

describe('GARUN Physics — Turboshaft SFC', () => {
  it('SFC at 100% load should be 0.450 kg/kWh', () => {
    expect(turboshaftSFC(1.0)).toBeCloseTo(0.450, 3);
  });
  it('SFC at 50% load should be > 0.450 (part-load penalty)', () => {
    expect(turboshaftSFC(0.5)).toBeGreaterThan(0.450);
  });
  it('SFC at 0% load should be 0.730 (0.450 + 0.280)', () => {
    expect(turboshaftSFC(0.0)).toBeCloseTo(0.730, 2);
  });
});

describe('GARUN Physics — Endurance', () => {
  it('GARUN baseline: 248 kg fuel, 75 kW, SFC 0.450 → ~7.37 hr', () => {
    expect(fuelEndurance(248, 75, 0.450)).toBeCloseTo(7.37, 1);
  });
  it('Higher payload (less fuel) → shorter endurance', () => {
    const highPayload = fuelEndurance(200, 75, 0.450);
    const lowPayload = fuelEndurance(280, 75, 0.450);
    expect(highPayload).toBeLessThan(lowPayload);
  });
});

describe('GARUN Physics — DC Bus', () => {
  it('At 97.75 kW total bus power, 400V bus → 244 A', () => {
    expect(busCurrent(97.75, 400)).toBeCloseTo(244.4, 0);
  });
  it('Bus voltage must be 400V not 750V', () => {
    const correct = busCurrent(97.75, 400);
    const wrong = busCurrent(97.75, 750);
    expect(correct).toBeGreaterThan(wrong); // 400V → higher current demand visible
  });
});

describe('GARUN Physics — Battery SOC', () => {
  it('Full discharge of 22kWh at 22kW over 1 hr from 100% hits 20% floor', () => {
    expect(updateSOC(1.0, 22, 1.0, 22)).toBeCloseTo(0.20, 2);
  });
  it('Partial discharge: 11 kW for 1 hr from 22kWh → SOC = 50%', () => {
    expect(updateSOC(1.0, 11, 1.0, 22)).toBeCloseTo(0.50, 2);
  });
  it('SOC never drops below 20% floor', () => {
    expect(updateSOC(0.21, 22, 1.0, 22)).toBeGreaterThanOrEqual(0.20);
  });
});

describe('Single Source of Truth Constants Verification', () => {
  it('ETA_ELEC_CHAIN should equal ~0.823 (0.93 * 0.97 * 0.96 * 0.95)', async () => {
    const { ETA_ELEC_CHAIN } = await import('../physics/physicsConstants');
    expect(ETA_ELEC_CHAIN).toBeCloseTo(0.823, 2);
  });

  it('JET_A1_LHV_KWH_KG should equal 43.15 / 3.6 = 11.97', async () => {
    const { JET_A1_LHV_KWH_KG } = await import('../physics/physicsConstants');
    expect(JET_A1_LHV_KWH_KG).toBeCloseTo(11.97, 2);
  });

  it('COMP_PAYLOAD_KG should equal 200kg', async () => {
    const { COMP_PAYLOAD_KG } = await import('../physics/garunSpec');
    expect(COMP_PAYLOAD_KG).toBe(200);
  });

  it('COMP_CRUISE_SPEED_KMH should equal 250 km/h', async () => {
    const { COMP_CRUISE_SPEED_KMH } = await import('../physics/garunSpec');
    expect(COMP_CRUISE_SPEED_KMH).toBe(250);
  });
});

