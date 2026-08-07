import React, { useState } from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { Layers } from 'lucide-react';
import { EvaluatedDesignCandidate } from '../../physics/optimizationEngine';

interface ParallelCoordinatesPlotProps {
  candidates: EvaluatedDesignCandidate[];
  selectedCandidate: EvaluatedDesignCandidate;
  onSelectCandidate: (candidate: EvaluatedDesignCandidate) => void;
}

interface ParallelAxis {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  getValue: (c: EvaluatedDesignCandidate) => number;
}

const PARALLEL_AXES: ParallelAxis[] = [
  { id: 'batKwh', label: 'Battery (x1)', unit: 'kWh', min: 5, max: 40, getValue: (c) => c.batteryKwh },
  { id: 'engKw', label: 'Engine (x2)', unit: 'kW', min: 40, max: 90, getValue: (c) => c.engineKw },
  { id: 'motorKw', label: 'Motor (x3)', unit: 'kW', min: 30, max: 80, getValue: (c) => c.motorKw },
  { id: 'endurance', label: 'Endurance (f2)', unit: 'hr', min: 4, max: 14, getValue: (c) => c.enduranceHours },
  { id: 'fuel', label: 'Fuel Burn (f1)', unit: 'kg', min: 50, max: 300, getValue: (c) => c.fuelBurnKg },
  { id: 'propMass', label: 'Prop. Mass (f3)', unit: 'kg', min: 100, max: 400, getValue: (c) => c.propulsionMassKg },
  { id: 'sfc', label: 'Fuel SFC', unit: 'g/kWh', min: 380, max: 550, getValue: (c) => c.sfcGkwh }
];

export const ParallelCoordinatesPlot: React.FC<ParallelCoordinatesPlotProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate
}) => {
  const [hoveredCandidateId, setHoveredCandidateId] = useState<string | null>(null);

  // SVG Canvas Dimensions
  const width = 800;
  const height = 210;
  const paddingX = 60;
  const paddingTop = 30;
  const paddingBottom = 30;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingTop - paddingBottom;

  const axisSpacing = usableWidth / (PARALLEL_AXES.length - 1);

  // Map value to Y coordinate (0 = top, usableHeight = bottom)
  const getY = (axis: ParallelAxis, value: number) => {
    const clamped = Math.max(axis.min, Math.min(axis.max, value));
    const norm = (clamped - axis.min) / (axis.max - axis.min);
    // Invert Y so max is at top
    return paddingTop + usableHeight * (1 - norm);
  };

  const activeCandidate = candidates.find((c) => c.id === hoveredCandidateId) || selectedCandidate;

  return (
    <CornerReticle id="parallel-coordinates-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>PARALLEL COORDINATES TRADE SPACE</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              MULTI-DIMENSIONAL PARAMETRIC PATHWAYS ({candidates.length} EVALUATED)
            </span>
          </div>
        </div>

        {/* Candidate Info Callout */}
        {activeCandidate && (
          <div className="bg-[#172236] px-2.5 py-0.5 rounded border border-[#00A8FF]/40 text-[9px] font-mono-data text-[#00A8FF] flex items-center space-x-2">
            <span className="text-[#8A9BBE]">HIGHLIGHTED:</span>
            <strong className="text-white">{activeCandidate.name}</strong>
          </div>
        )}
      </div>

      {/* SVG Canvas Plot */}
      <div className="flex-1 min-h-[180px] w-full relative flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Vertical Axes Lines & Labels */}
          {PARALLEL_AXES.map((axis, i) => {
            const x = paddingX + i * axisSpacing;
            return (
              <g key={axis.id}>
                {/* Vertical Axis Line */}
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + usableHeight}
                  stroke="#1F2D45"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />

                {/* Top Label */}
                <text
                  x={x}
                  y={paddingTop - 12}
                  fill="#8A9BBE"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {axis.label}
                </text>
                <text
                  x={x}
                  y={paddingTop - 2}
                  fill="#00A8FF"
                  fontSize="7.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  ({axis.unit})
                </text>

                {/* Max / Min Bounds Labels */}
                <text x={x} y={paddingTop + 8} fill="#8A9BBE" fontSize="7" fontFamily="monospace" textAnchor="middle">
                  {axis.max}
                </text>
                <text x={x} y={paddingTop + usableHeight + 12} fill="#8A9BBE" fontSize="7" fontFamily="monospace" textAnchor="middle">
                  {axis.min}
                </text>
              </g>
            );
          })}

          {/* Candidate Polyline Curves */}
          {candidates.map((candidate) => {
            const isSelected = candidate.id === selectedCandidate?.id;
            const isHovered = candidate.id === hoveredCandidateId;
            const isActive = isSelected || isHovered;

            // Generate Path D string
            const points = PARALLEL_AXES.map((axis, i) => {
              const x = paddingX + i * axisSpacing;
              const y = getY(axis, axis.getValue(candidate));
              return `${x},${y}`;
            });

            const pathD = `M ${points.join(' L ')}`;

            let strokeColor = '#3A4D6F'; // default dimmed
            if (candidate.violationsCount > 0) strokeColor = '#FF3B30';
            else if (candidate.isGarunDesign) strokeColor = '#F59E0B';
            else if (candidate.rank === 1) strokeColor = '#00A8FF';
            else if (candidate.rank === 2) strokeColor = '#FFB800';

            if (isActive) strokeColor = '#00E87A';

            return (
              <g key={candidate.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isActive ? 3.5 : isSelected ? 2.5 : candidate.rank === 1 ? 1.5 : 0.8}
                  strokeOpacity={isActive ? 1.0 : hoveredCandidateId ? 0.15 : candidate.rank === 1 ? 0.7 : 0.4}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredCandidateId(candidate.id)}
                  onMouseLeave={() => setHoveredCandidateId(null)}
                  onClick={() => onSelectCandidate(candidate)}
                />

                {/* Interactive Points on Active Line */}
                {isActive &&
                  PARALLEL_AXES.map((axis, i) => {
                    const x = paddingX + i * axisSpacing;
                    const y = getY(axis, axis.getValue(candidate));
                    return (
                      <circle
                        key={`${candidate.id}-${axis.id}`}
                        cx={x}
                        cy={y}
                        r={4}
                        fill="#00E87A"
                        stroke="#0A0F1E"
                        strokeWidth={1.5}
                      />
                    );
                  })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Instructions */}
      <div className="flex items-center justify-between text-[8.5px] font-mono-data text-[#8A9BBE] pt-1 border-t border-[#1A2740] flex-shrink-0">
        <span>Hover line to preview pathway | Click line to set active trade candidate</span>
        <span className="text-[#00E87A] font-bold">PARALLEL DIMENSION VISUALIZER</span>
      </div>
    </CornerReticle>
  );
};
