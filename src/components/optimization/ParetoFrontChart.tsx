import React, { useState } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell,
  ReferenceLine
} from 'recharts';
import { CornerReticle } from '../common/CornerReticle';
import { Sparkles, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';
import { EvaluatedDesignCandidate } from '../../physics/optimizationEngine';

export interface ParetoFrontChartProps {
  candidates: EvaluatedDesignCandidate[];
  selectedCandidate: EvaluatedDesignCandidate;
  onSelectCandidate: (candidate: EvaluatedDesignCandidate) => void;
}

export const GARUN_DESIGN_POINT_REFERENCE = {
  id: 'garun_design_star',
  name: '★ GARUN Design Target',
  batteryKwh: 22,
  engineKw: 60,
  motorKw: 55,
  enduranceHours: 9.2,
  fuelBurnKg: 248,
  sfcGkwh: 450,
  propulsionMassKg: 285,
  mtowKg: 1000,
  rangeKm: 2500,
  batteryMassKg: 110,
  hybridRatioPct: 70,
  costPerHourUsd: 190,
  tetKelvin: 1650,
  rank: 1,
  violationsCount: 0,
  violations: [],
  isFeasible: true,
  isGarunDesign: true
};

export const ParetoFrontChart: React.FC<ParetoFrontChartProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate
}) => {
  const [xAxisKey, setXAxisKey] = useState<'enduranceHours' | 'rangeKm'>('enduranceHours');
  const [yAxisKey, setYAxisKey] = useState<'fuelBurnKg' | 'sfcGkwh' | 'propulsionMassKg'>('fuelBurnKg');
  const [showRank2, setShowRank2] = useState<boolean>(true);
  const [showDominated, setShowDominated] = useState<boolean>(true);

  // Filter dataset based on rank visibility toggles
  const visibleCandidates = candidates.filter((c) => {
    if (c.rank === 1) return true;
    if (c.rank === 2 && showRank2) return true;
    if (c.rank === 3 && showDominated) return true;
    return false;
  });

  const getRankColor = (candidate: EvaluatedDesignCandidate) => {
    if (!candidate.isFeasible || candidate.violationsCount > 0) return '#FF3B30'; // Red for violations
    if (candidate.id === selectedCandidate?.id) return '#00E87A'; // Active highlight green
    if (candidate.isGarunDesign) return '#F59E0B'; // Star gold
    if (candidate.rank === 1) return '#00A8FF'; // Rank 1 Pareto cyan
    if (candidate.rank === 2) return '#FFB800'; // Rank 2 yellow
    return '#8A9BBE'; // Rank 3 grey
  };

  return (
    <CornerReticle id="pareto-front-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>PARETO OPTIMAL FRONTIER</span>
              <span className="text-[9px] bg-[#00A8FF]/20 text-[#00A8FF] px-1.5 py-0.2 rounded border border-[#00A8FF]/40 font-mono-data">
                PARAMETRIC SWEEP ({candidates.length} DESIGNS)
              </span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              MULTI-OBJECTIVE NON-DOMINATED PARETO FRONTIER
            </span>
          </div>
        </div>

        {/* View Dimension Axes Dropdowns */}
        <div className="flex items-center space-x-1.5 text-[9px] font-mono-data">
          <div className="flex items-center space-x-1 bg-[#172236] px-1.5 py-0.5 rounded border border-[#1A2740]">
            <span className="text-[#8A9BBE]">X:</span>
            <select
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value as 'enduranceHours' | 'rangeKm')}
              className="bg-transparent text-[#00A8FF] font-bold focus:outline-none cursor-pointer"
            >
              <option value="enduranceHours" className="bg-[#0F1729]">Endurance (hr)</option>
              <option value="rangeKm" className="bg-[#0F1729]">Range (km)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-[#172236] px-1.5 py-0.5 rounded border border-[#1A2740]">
            <span className="text-[#8A9BBE]">Y:</span>
            <select
              value={yAxisKey}
              onChange={(e) => setYAxisKey(e.target.value as 'fuelBurnKg' | 'sfcGkwh' | 'propulsionMassKg')}
              className="bg-transparent text-[#00A8FF] font-bold focus:outline-none cursor-pointer"
            >
              <option value="fuelBurnKg" className="bg-[#0F1729]">Fuel Consumption (kg)</option>
              <option value="sfcGkwh" className="bg-[#0F1729]">SFC (g/kWh)</option>
              <option value="propulsionMassKg" className="bg-[#0F1729]">Propulsion Mass (kg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend & Rank Filter Toggles */}
      <div className="flex items-center justify-between bg-[#111A2E] p-1.5 rounded border border-[#1A2740] mb-2 text-[9px] font-mono-data flex-shrink-0">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-[#F59E0B] font-bold">
            <span className="text-xs">★</span>
            <span>GARUN (22 kWh, 60 kW)</span>
          </span>
          <span className="flex items-center space-x-1 text-[#00A8FF] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00A8FF] inline-block" />
            <span>Rank 1 (Pareto)</span>
          </span>
          <button
            onClick={() => setShowRank2(!showRank2)}
            className={`flex items-center space-x-1 cursor-pointer transition-opacity ${showRank2 ? 'opacity-100 text-[#FFB800]' : 'opacity-40 text-[#8A9BBE]'}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFB800] inline-block" />
            <span>Rank 2</span>
          </button>
          <button
            onClick={() => setShowDominated(!showDominated)}
            className={`flex items-center space-x-1 cursor-pointer transition-opacity ${showDominated ? 'opacity-100 text-[#8A9BBE]' : 'opacity-40 text-[#8A9BBE]'}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#8A9BBE] inline-block" />
            <span>Dominated</span>
          </button>
          <span className="flex items-center space-x-1 text-[#FF3B30]">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] inline-block" />
            <span>Violations</span>
          </span>
        </div>

        <div className="text-[#8A9BBE]">
          Showing <strong className="text-white">{visibleCandidates.length}</strong> / {candidates.length} evaluated designs
        </div>
      </div>

      {/* Recharts Scatter Visualizer */}
      <div className="flex-1 min-h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
            <XAxis
              type="number"
              dataKey={xAxisKey}
              name={xAxisKey === 'enduranceHours' ? 'Endurance' : 'Range'}
              unit={xAxisKey === 'enduranceHours' ? ' hr' : ' km'}
              stroke="#8A9BBE"
              fontSize={9}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
            />
            <YAxis
              type="number"
              dataKey={yAxisKey}
              name={yAxisKey === 'fuelBurnKg' ? 'Fuel' : yAxisKey === 'sfcGkwh' ? 'SFC' : 'Propulsion Mass'}
              unit={yAxisKey === 'fuelBurnKg' ? ' kg' : yAxisKey === 'sfcGkwh' ? ' g/kWh' : ' kg'}
              stroke="#8A9BBE"
              fontSize={9}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <ZAxis type="number" dataKey="propulsionMassKg" range={[60, 220]} name="Propulsion Mass" unit=" kg" />
            
            {xAxisKey === 'enduranceHours' && (
              <ReferenceLine x={9.2} stroke="#00E87A" strokeDasharray="3 3" label={{ value: 'GARUN (9.2h)', fill: '#00E87A', fontSize: 8 }} />
            )}
            
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#00A8FF' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as EvaluatedDesignCandidate;
                  return (
                    <div className="bg-[#0D1527] border border-[#00A8FF] p-2.5 rounded shadow-xl text-[9.5px] font-mono-data space-y-1 z-50">
                      <div className="font-bold text-[#00A8FF] flex items-center justify-between border-b border-[#1A2740] pb-1 mb-1">
                        <span className="flex items-center space-x-1">
                          {data.isGarunDesign && <span className="text-[#F59E0B]">★ </span>}
                          <span>{data.name}</span>
                        </span>
                        {data.rank === 1 && <span className="bg-[#00E87A]/20 text-[#00E87A] text-[8px] px-1 rounded">PARETO RANK 1</span>}
                      </div>
                      <div className="text-white grid grid-cols-2 gap-x-3 gap-y-1">
                        <div>Battery (x1): <strong className="text-[#B47FFF]">{data.batteryKwh} kWh</strong></div>
                        <div>Engine (x2): <strong className="text-[#00A8FF]">{data.engineKw} kW</strong></div>
                        <div>Motor (x3): <strong className="text-[#00E87A]">{data.motorKw} kW</strong></div>
                        <div>Endurance (f2): <strong className="text-[#00E87A]">{data.enduranceHours} hr</strong></div>
                        <div>Fuel Burn (f1): <strong className="text-[#FFB800]">{data.fuelBurnKg} kg</strong></div>
                        <div>Prop. Mass (f3): <strong className="text-[#E8EDF7]">{data.propulsionMassKg} kg</strong></div>
                        <div>SFC: <strong className="text-[#FFB800]">{data.sfcGkwh} g/kWh</strong></div>
                        <div>Range: <strong className="text-[#00A8FF]">{data.rangeKm} km</strong></div>
                      </div>
                      {data.violationsCount > 0 && (
                        <div className="text-[#FF3B30] font-bold text-[8.5px] pt-1 border-t border-[#1A2740] space-y-0.5">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{data.violationsCount} Constraint Violation(s):</span>
                          </div>
                          {data.violations.map((v, i) => (
                            <div key={i} className="text-[#FF3B30]/90 text-[8px] font-normal">• {v}</div>
                          ))}
                        </div>
                      )}
                      <div className="text-[8px] text-[#8A9BBE] pt-1 italic text-center border-t border-[#1A2740]">
                        Click point to select & apply solution to dashboard
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              data={visibleCandidates}
              onClick={(entry: { payload?: EvaluatedDesignCandidate }) => {
                if (entry && entry.payload) {
                  onSelectCandidate(entry.payload);
                }
              }}
              className="cursor-pointer"
            >
              {visibleCandidates.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={getRankColor(entry)}
                  stroke={entry.id === selectedCandidate?.id ? '#FFFFFF' : '#0A0F1E'}
                  strokeWidth={entry.id === selectedCandidate?.id ? 2.5 : 1}
                />
              ))}
            </Scatter>
            
            {/* Reference GARUN Design Star */}
            <Scatter
              name="GARUN Design Point"
              data={[GARUN_DESIGN_POINT_REFERENCE]}
              fill="#F59E0B"
              shape={(props: { cx?: number; cy?: number }) => {
                const { cx, cy } = props;
                if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy)) {
                  return <g />;
                }
                return (
                  <g transform={`translate(${cx},${cy})`}>
                    <path
                      d="M 0 -9 L 2.6 -2.8 L 9.3 -1.9 L 4.5 2.5 L 5.7 9 L 0 5.8 L -5.7 9 L -4.5 2.5 L -9.3 -1.9 L -2.6 -2.8 Z"
                      fill="#F59E0B"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Candidate Quick Inspector Footer */}
      {selectedCandidate && (
        <div id="selected-candidate-bar" className="bg-[#111A2E] p-2 rounded border border-[#00A8FF]/40 mt-2 flex items-center justify-between text-[9.5px] font-mono-data flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-[#00E87A] animate-pulse" />
            <div>
              <span className="text-[#8A9BBE] block text-[8px] uppercase">SELECTED PARETO SOLUTION</span>
              <span className="font-bold text-[#00A8FF]">{selectedCandidate.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 text-center">
            <div>
              <span className="text-[#8A9BBE] text-[8px] block">BATTERY / ENG</span>
              <span className="font-bold text-[#B47FFF]">{selectedCandidate.batteryKwh} kWh / {selectedCandidate.engineKw} kW</span>
            </div>
            <div>
              <span className="text-[#8A9BBE] text-[8px] block">ENDURANCE</span>
              <span className="font-bold text-[#00E87A]">{selectedCandidate.enduranceHours} hr</span>
            </div>
            <div>
              <span className="text-[#8A9BBE] text-[8px] block">FUEL BURN</span>
              <span className="font-bold text-[#FFB800]">{selectedCandidate.fuelBurnKg} kg</span>
            </div>
            <div>
              <span className="text-[#8A9BBE] text-[8px] block">SFC</span>
              <span className="font-bold text-[#FFB800]">{selectedCandidate.sfcGkwh} g/kWh</span>
            </div>
            <div>
              <span className="text-[#8A9BBE] text-[8px] block">PROP MASS</span>
              <span className="font-bold text-white">{selectedCandidate.propulsionMassKg} kg</span>
            </div>
          </div>

          <button
            onClick={() => onSelectCandidate(selectedCandidate)}
            className="bg-[#00A8FF] hover:bg-[#0088CC] text-[#0A0F1E] font-bold px-2.5 py-1 rounded text-[9px] uppercase transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>SELECTED</span>
          </button>
        </div>
      )}
    </CornerReticle>
  );
};
