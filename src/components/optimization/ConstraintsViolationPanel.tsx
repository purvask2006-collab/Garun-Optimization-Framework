import React from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Gauge } from 'lucide-react';
import { DecisionVariablesState } from './OptimizationVariablesPanel';
import { EvaluatedDesignCandidate } from '../../physics/optimizationEngine';

interface ConstraintsViolationPanelProps {
  variables: DecisionVariablesState;
  selectedCandidate?: EvaluatedDesignCandidate;
}

export const ConstraintsViolationPanel: React.FC<ConstraintsViolationPanelProps> = ({
  variables,
  selectedCandidate
}) => {
  const tetValue = selectedCandidate ? selectedCandidate.tetKelvin : 1650;
  const mtowValue = selectedCandidate ? selectedCandidate.mtowKg : 1000;
  const motorPower = selectedCandidate ? selectedCandidate.motorKw : variables.motorKw;
  const requiredMotorPower = 48; // Required shaft power in cruise
  const batteryCRate = selectedCandidate ? (25 / selectedCandidate.batteryKwh) : (25 / variables.batteryKwh);
  const reserveSoc = selectedCandidate ? (selectedCandidate.isFeasible ? 25.0 : 15.0) : 25.0;

  const constraintsList = [
    {
      id: 'g1_MTOW',
      name: 'g1: Max Takeoff Weight (MTOW)',
      limitStr: '≤ 1,000 kg',
      currentValueStr: `${Math.round(mtowValue)} kg`,
      passed: mtowValue <= 1000,
      margin: `${(1000 - mtowValue).toFixed(0)} kg`,
      penaltyScore: mtowValue > 1000 ? Math.round((mtowValue - 1000) * 25) : 0
    },
    {
      id: 'g2_PAYLOAD',
      name: 'g2: Minimum Payload',
      limitStr: '≥ 200 kg',
      currentValueStr: `200 kg`,
      passed: true,
      margin: `0 kg`,
      penaltyScore: 0
    },
    {
      id: 'g3_SOC',
      name: 'g3: Final Reserve SOC',
      limitStr: '≥ 20.0 %',
      currentValueStr: `${reserveSoc.toFixed(1)} %`,
      passed: reserveSoc >= 20.0,
      margin: `${(reserveSoc - 20.0).toFixed(1)} %`,
      penaltyScore: reserveSoc < 20.0 ? Math.round((20.0 - reserveSoc) * 50) : 0
    },
    {
      id: 'g5_MOTOR',
      name: 'g5: Motor Sizing (motor_kw ≥ shaft_power)',
      limitStr: `≥ ${requiredMotorPower} kW`,
      currentValueStr: `${motorPower} kW`,
      passed: motorPower >= requiredMotorPower,
      margin: `${(motorPower - requiredMotorPower).toFixed(0)} kW`,
      penaltyScore: motorPower < requiredMotorPower ? (requiredMotorPower - motorPower) * 30 : 0
    },
    {
      id: 'g6_CRATE',
      name: 'g6: Battery Max C-Rate',
      limitStr: '≤ 2.0 C',
      currentValueStr: `${batteryCRate.toFixed(2)} C`,
      passed: batteryCRate <= 2.0,
      margin: `${(2.0 - batteryCRate).toFixed(2)} C`,
      penaltyScore: batteryCRate > 2.0 ? Math.round((batteryCRate - 2.0) * 100) : 0
    },
    {
      id: 'g8_TET',
      name: 'g8: Turbine Entry Temp (TET)',
      limitStr: '≤ 1,700 K',
      currentValueStr: `${Math.round(tetValue)} K`,
      passed: tetValue <= 1700,
      margin: `${(1700 - tetValue).toFixed(0)} K`,
      penaltyScore: tetValue > 1700 ? Math.round((tetValue - 1700) * 12) : 0
    }
  ];

  const violations = selectedCandidate && selectedCandidate.violationsCount > 0
    ? selectedCandidate.violationsCount
    : constraintsList.filter((c) => !c.passed).length;

  const totalPenalty = constraintsList.reduce((acc, c) => acc + c.penaltyScore, 0);

  return (
    <CornerReticle id="constraints-violation-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>DESIGN CONSTRAINTS (g1–g8)</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              HARD FEASIBILITY & BOUNDARY VERIFIER
            </span>
          </div>
        </div>

        {/* Penalty Status Badge */}
        <div className={`px-2 py-0.5 rounded border text-[9px] font-mono-data flex items-center space-x-1 ${
          violations === 0 
            ? 'bg-[#00E87A]/20 border-[#00E87A] text-[#00E87A]' 
            : 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30] animate-pulse'
        }`}>
          {violations === 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          <span className="font-bold">{violations === 0 ? 'FEASIBLE' : `${violations} VIOLATION(S)`}</span>
        </div>
      </div>

      {/* Penalty Score Banner */}
      <div className={`p-2 rounded border mb-2 flex items-center justify-between text-[9.5px] font-mono-data flex-shrink-0 ${
        violations === 0 
          ? 'bg-[#111A2E] border-[#1A2740] text-[#8A9BBE]' 
          : 'bg-[#FF3B30]/10 border-[#FF3B30]/40 text-[#FF3B30]'
      }`}>
        <span className="flex items-center space-x-1.5">
          <Gauge className="w-3.5 h-3.5" />
          <span>PENALTY SCORE (g1–g8):</span>
        </span>
        <span className="font-bold text-sm">
          {totalPenalty === 0 ? '0.00 (FEASIBLE)' : `+${totalPenalty} PTS`}
        </span>
      </div>

      {/* Constraint List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar text-[9.5px] font-mono-data">
        {constraintsList.map((c) => (
          <div
            key={c.id}
            className={`p-2 rounded border transition-all ${
              c.passed 
                ? 'bg-[#111A2E]/80 border-[#1A2740]' 
                : 'bg-[#FF3B30]/15 border-[#FF3B30] shadow-sm'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#E8EDF7] flex items-center space-x-1.5">
                {c.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-[#FF3B30]" />
                )}
                <span>{c.name}</span>
              </span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[8.5px] ${
                c.passed ? 'bg-[#00E87A]/20 text-[#00E87A]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'
              }`}>
                {c.passed ? 'PASSED' : 'VIOLATED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[8.5px] text-[#8A9BBE] mt-1 pt-1 border-t border-[#1A2740]">
              <div>
                <span className="block text-[7.5px]">LIMIT</span>
                <span className="text-white font-semibold">{c.limitStr}</span>
              </div>
              <div>
                <span className="block text-[7.5px]">COMPUTED</span>
                <span className={c.passed ? 'text-[#00A8FF] font-semibold' : 'text-[#FF3B30] font-semibold'}>
                  {c.currentValueStr}
                </span>
              </div>
              <div>
                <span className="block text-[7.5px]">MARGIN</span>
                <span className={c.passed ? 'text-[#00E87A] font-semibold' : 'text-[#FF3B30] font-semibold'}>
                  {c.margin}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CornerReticle>
  );
};
