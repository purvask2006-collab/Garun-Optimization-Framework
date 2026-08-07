import React, { useState } from 'react';
import { InteractiveEquation } from '../../data/knowledgeHubData';
import { CornerReticle } from '../common/CornerReticle';
import { Calculator, Bookmark, RotateCcw, Info, CheckCircle2 } from 'lucide-react';

interface EquationCalculatorCardProps {
  equation: InteractiveEquation;
  isBookmarked: boolean;
  onToggleBookmark: (eqId: string) => void;
}

export const EquationCalculatorCard: React.FC<EquationCalculatorCardProps> = ({
  equation,
  isBookmarked,
  onToggleBookmark
}) => {
  // Initialize state with default values of variables
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    equation.variables.forEach((v) => {
      initial[v.symbol] = v.defaultVal;
    });
    return initial;
  });

  const handleInputChange = (symbol: string, value: number) => {
    setInputs((prev) => ({ ...prev, [symbol]: value }));
  };

  const handleReset = () => {
    const reset: Record<string, number> = {};
    equation.variables.forEach((v) => {
      reset[v.symbol] = v.defaultVal;
    });
    setInputs(reset);
  };

  const result = equation.calculate(inputs);

  return (
    <CornerReticle id={`equation-card-${equation.id}`} className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col relative overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-white uppercase tracking-wider">
              {equation.name}
            </h2>
            <span className="text-[8.5px] font-mono-data text-[#00E87A] uppercase">
              {equation.category} FORMULA ENGINE
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleReset}
            className="p-1 text-[#8A9BBE] hover:text-white transition-colors"
            title="Reset Variables"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleBookmark(equation.id)}
            className={`p-1 rounded transition-colors ${
              isBookmarked ? 'text-[#00E87A]' : 'text-[#8A9BBE] hover:text-white'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark Equation'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? '#00E87A' : 'none'} />
          </button>
        </div>
      </div>

      {/* Symbolic Formula Box */}
      <div className="bg-[#111A2E] p-2 rounded border border-[#00A8FF]/30 font-mono-data text-[10px] text-[#00A8FF] mb-2 font-bold tracking-wide">
        {equation.symbolicFormula}
      </div>

      <p className="text-[8.5px] font-mono-data text-[#8A9BBE] mb-2 line-clamp-2">
        {equation.description}
      </p>

      {/* Variables Sliders Grid */}
      <div className="space-y-2 mb-3 flex-1 overflow-y-auto font-mono-data text-[9px]">
        {equation.variables.map((v) => (
          <div key={v.symbol} className="bg-[#111A2E]/80 p-2 rounded border border-[#1A2740]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[#8A9BBE]">{v.label} ({v.symbol})</span>
              <span className="font-bold text-[#00E87A]">
                {inputs[v.symbol]} <span className="text-[8px] text-[#8A9BBE]">{v.unit}</span>
              </span>
            </div>
            <input
              type="range"
              min={v.min}
              max={v.max}
              step={v.step}
              value={inputs[v.symbol] ?? v.defaultVal}
              onChange={(e) => handleInputChange(v.symbol, Number(e.target.value))}
              className="w-full accent-[#00A8FF] h-1.5 bg-[#172236] rounded cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Calculated Output Banner */}
      <div className="bg-[#172236] p-2.5 rounded border border-[#00E87A]/40 mt-auto flex-shrink-0 font-mono-data text-[9px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[#8A9BBE] font-bold uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
            <span>EVALUATED OUTPUT</span>
          </span>
          <span className="text-base font-bold text-[#00E87A]">
            {result.value.toLocaleString()} <span className="text-xs font-normal text-white">{result.unit}</span>
          </span>
        </div>
        <p className="text-[8px] text-[#8A9BBE] line-clamp-2">{result.breakdown}</p>
      </div>
    </CornerReticle>
  );
};
