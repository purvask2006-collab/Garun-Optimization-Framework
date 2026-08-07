import React from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { CheckCircle2, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useGarunStore } from '../../store/useGarunStore';
import { EvaluatedDesignCandidate } from '../../physics/optimizationEngine';

interface OptimizationSummaryCardProps {
  selectedCandidate: EvaluatedDesignCandidate;
  totalEvaluatedCount?: number;
  paretoCount?: number;
}

export const OptimizationSummaryCard: React.FC<OptimizationSummaryCardProps> = ({
  selectedCandidate,
  totalEvaluatedCount = 54,
  paretoCount = 8
}) => {
  const { updateSimulationParams, updateVehicleInputs } = useGarunStore();

  const handleApplyCandidate = () => {
    if (!selectedCandidate) return;

    updateSimulationParams({
      batteryCapacityKwh: selectedCandidate.batteryKwh,
      hybridRatioCruisePct: selectedCandidate.hybridRatioPct,
      powerSplitRatio: Number((selectedCandidate.hybridRatioPct / 100).toFixed(2)),
      cruiseAltitudeM: 3000,
      payloadKg: 200
    });

    updateVehicleInputs({
      payload_kg: 200,
      cruise_alt_m: 3000
    });
  };

  if (!selectedCandidate) {
    return null;
  }

  return (
    <CornerReticle id="optimization-summary-card" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>PARAMETRIC OPTIMIZATION SUMMARY</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              SELECTED CANDIDATE SPECIFICATIONS
            </span>
          </div>
        </div>

        <span className={`text-[8.5px] px-2 py-0.5 rounded border font-mono-data font-bold ${
          selectedCandidate.rank === 1
            ? 'bg-[#00E87A]/20 text-[#00E87A] border-[#00E87A]/40'
            : selectedCandidate.rank === 2
            ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40'
            : 'bg-[#8A9BBE]/20 text-[#8A9BBE] border-[#8A9BBE]/40'
        }`}>
          RANK {selectedCandidate.rank} {selectedCandidate.rank === 1 ? '(PARETO OPTIMAL)' : ''}
        </span>
      </div>

      {/* Selected Candidate Badge Box */}
      <div className="bg-[#111A2E] p-2.5 rounded border border-[#00A8FF]/40 mb-2 flex-shrink-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold font-mono-data text-[#00A8FF] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00E87A]" />
            <span>{selectedCandidate.name}</span>
          </span>
          <span className={`text-[9px] font-mono-data font-bold ${
            selectedCandidate.isFeasible ? 'text-[#00E87A]' : 'text-[#FF3B30]'
          }`}>
            {selectedCandidate.isFeasible ? 'FEASIBLE (0 VIOLATIONS)' : `${selectedCandidate.violationsCount} VIOLATION(S)`}
          </span>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#1A2740] text-center font-mono-data">
          <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
            <span className="text-[#8A9BBE] text-[8px] block uppercase">MAX ENDURANCE (f2)</span>
            <span className="text-base font-bold text-[#00E87A]">{selectedCandidate.enduranceHours} <span className="text-[9px]">hr</span></span>
          </div>
          <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
            <span className="text-[#8A9BBE] text-[8px] block uppercase">FUEL BURN (f1)</span>
            <span className="text-base font-bold text-[#FFB800]">{selectedCandidate.fuelBurnKg} <span className="text-[9px]">kg</span></span>
          </div>
          <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
            <span className="text-[#8A9BBE] text-[8px] block uppercase">PROP. MASS (f3)</span>
            <span className="text-base font-bold text-white">{selectedCandidate.propulsionMassKg} <span className="text-[9px]">kg</span></span>
          </div>
        </div>
      </div>

      {/* Domination Statistics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-[9px] font-mono-data flex-shrink-0">
        <div className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740] flex justify-between items-center">
          <span className="text-[#8A9BBE]">EVALUATED DESIGNS:</span>
          <strong className="text-white">{totalEvaluatedCount} DESIGNS</strong>
        </div>
        <div className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740] flex justify-between items-center">
          <span className="text-[#8A9BBE]">PARETO FRONTIER:</span>
          <strong className="text-[#00A8FF]">{paretoCount} Candidates</strong>
        </div>
        <div className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740] flex justify-between items-center">
          <span className="text-[#8A9BBE]">ENGINE / BATTERY:</span>
          <strong className="text-[#00E87A]">{selectedCandidate.engineKw} kW / {selectedCandidate.batteryKwh} kWh</strong>
        </div>
        <div className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740] flex justify-between items-center">
          <span className="text-[#8A9BBE]">EST. DIRECT COST:</span>
          <strong className="text-[#B47FFF]">${selectedCandidate.costPerHourUsd}/hr</strong>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto">
        <button
          onClick={handleApplyCandidate}
          className="w-full bg-[#00A8FF] hover:bg-[#0088CC] text-[#0A0F1E] font-bold font-sans-ui text-xs uppercase py-2.5 rounded transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-[#00A8FF]/20 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>APPLY CANDIDATE TO DASHBOARD SIMULATION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </CornerReticle>
  );
};
