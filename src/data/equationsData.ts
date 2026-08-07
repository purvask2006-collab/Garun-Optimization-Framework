import batteryEqs from '../../Equations Database/battery.json';
import dragEqs from '../../Equations Database/drag.json';
import enduranceEqs from '../../Equations Database/endurance.json';
import engineEqs from '../../Equations Database/engine.json';
import fuelEqs from '../../Equations Database/fuel.json';
import generatorEqs from '../../Equations Database/generator.json';
import liftEqs from '../../Equations Database/lift.json';
import missionEqs from '../../Equations Database/mission.json';
import motorEqs from '../../Equations Database/motor.json';

export interface EquationVariable {
  symbol: string;
  name: string;
  unit?: string;
  typicalRange?: string;
  notes?: string;
}

export interface EquationItem {
  id: string;
  name: string;
  domain: string;
  category: string;
  latex?: string;
  python?: string;
  formula?: string;
  description: string;
  variables: EquationVariable[];
  rawVariables?: Record<string, unknown>;
  reference?: string | Record<string, string>;
  validation?: string | Record<string, string>;
}

const mapEquations = (jsonObj: Record<string, unknown>): EquationItem[] => {
  const domain = (jsonObj?._domain as string) || 'General Aerospace';
  const eqs = (jsonObj?.equations as Array<Record<string, unknown>>) || [];
  return eqs.map((eq) => {
    const varsList: EquationVariable[] = [];
    if (eq.variables && typeof eq.variables === 'object') {
      Object.entries(eq.variables as Record<string, Record<string, string>>).forEach(([sym, info]) => {
        varsList.push({
          symbol: sym,
          name: info.name || info.label || sym,
          unit: info.unit || '',
          typicalRange: info.typical_range || info.typicalRange || '',
          notes: info.notes || ''
        });
      });
    }
    return {
      id: (eq.id as string) || 'EQ-UNKNOWN',
      name: (eq.name as string) || 'Unnamed Equation',
      domain,
      category: (eq.category as string) || 'General',
      latex: eq.latex as string | undefined,
      python: eq.python as string | undefined,
      formula: ((eq.python || eq.latex || eq.formula) as string) || '',
      description: (eq.description as string) || '',
      variables: varsList,
      rawVariables: eq.variables as Record<string, unknown> | undefined,
      reference: eq.reference as string | Record<string, string> | undefined,
      validation: eq.validation as string | Record<string, string> | undefined
    };
  });
};

export const ALL_EQUATIONS: EquationItem[] = [
  ...mapEquations(batteryEqs),
  ...mapEquations(dragEqs),
  ...mapEquations(enduranceEqs),
  ...mapEquations(engineEqs),
  ...mapEquations(fuelEqs),
  ...mapEquations(generatorEqs),
  ...mapEquations(liftEqs),
  ...mapEquations(missionEqs),
  ...mapEquations(motorEqs),
].filter(Boolean);

export const EQUATION_CATEGORIES: string[] = [
  'ALL',
  ...Array.from(new Set(ALL_EQUATIONS.map((e) => e.category))).filter(Boolean)
];

export const EQUATION_DOMAINS: string[] = [
  'ALL',
  ...Array.from(new Set(ALL_EQUATIONS.map((e) => e.domain))).filter(Boolean)
];
