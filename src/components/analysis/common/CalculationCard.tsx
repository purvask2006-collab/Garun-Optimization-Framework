import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Database, FunctionSquare, FileText, Layers } from 'lucide-react';

export interface InputVariable {
  name: string;
  symbol?: string;
  value: string | number;
  unit: string;
  source?: string;
}

export interface CalculationCardProps {
  title: string;
  symbol?: string;
  value: string | number;
  unit: string;
  inputs: InputVariable[];
  equation: string;
  method?: string;
  dataSource: string;
  assumptions: string[];
  status?: 'VALID' | 'ESTIMATED' | 'MISSING_INPUT' | 'OUT_OF_BOUNDS';
  missingInputs?: string[];
  notes?: string;
  categoryBadge?: string;
}

export const CalculationCard: React.FC<CalculationCardProps> = ({
  title,
  symbol,
  value,
  unit,
  inputs,
  equation,
  method,
  dataSource,
  assumptions,
  status = 'VALID',
  missingInputs = [],
  notes,
  categoryBadge,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusBadge = () => {
    switch (status) {
      case 'VALID':
        return (
          <span className="bg-[#00E87A]/15 border border-[#00E87A]/40 text-[#00E87A] text-[9px] font-mono-data px-2 py-0.5 rounded font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
      case 'ESTIMATED':
        return (
          <span className="bg-[#00A8FF]/15 border border-[#00A8FF]/40 text-[#00A8FF] text-[9px] font-mono-data px-2 py-0.5 rounded font-bold flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>ISA MODEL ESTIMATED</span>
          </span>
        );
      case 'MISSING_INPUT':
        return (
          <span className="bg-[#FF3B30]/15 border border-[#FF3B30]/40 text-[#FF3B30] text-[9px] font-mono-data px-2 py-0.5 rounded font-bold flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>MISSING INPUT DATA</span>
          </span>
        );
      case 'OUT_OF_BOUNDS':
        return (
          <span className="bg-[#FFB800]/15 border border-[#FFB800]/40 text-[#FFB800] text-[9px] font-mono-data px-2 py-0.5 rounded font-bold flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>OUT OF PHYSICAL BOUNDS</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0E1626] border border-[#1F2D45] hover:border-[#00A8FF]/40 rounded-lg p-3.5 space-y-3 transition-all shadow-sm">
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            {categoryBadge && (
              <span className="text-[9px] font-mono-data text-[#8A9BBE] uppercase tracking-wider font-semibold">
                [{categoryBadge}]
              </span>
            )}
            <h4 className="text-xs font-bold font-sans-ui text-[#E8EDF7] tracking-tight">
              {title}
            </h4>
            {symbol && (
              <span className="text-[10px] font-mono-data text-[#00A8FF] bg-[#111827] px-1.5 py-0.5 rounded border border-[#1F2D45]">
                {symbol}
              </span>
            )}
          </div>
          {method && <p className="text-[10px] font-mono-data text-[#8A9BBE] mt-0.5">{method}</p>}
        </div>

        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#8A9BBE] hover:text-[#E8EDF7] p-1 rounded hover:bg-[#172236] transition-colors"
            title="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Calculated Value Display */}
      <div className="bg-[#111827] border border-[#1F2D45] rounded-md p-2.5 flex items-baseline justify-between">
        <span className="text-[10px] font-mono-data text-[#8A9BBE] uppercase font-semibold">RESULT</span>
        <div className="flex items-baseline space-x-1.5">
          {status === 'MISSING_INPUT' ? (
            <span className="text-sm font-mono-data font-bold text-[#FF3B30] uppercase">CANNOT CALCULATE</span>
          ) : (
            <>
              <span className="text-lg font-mono-data font-bold text-[#00E87A] tracking-tight">
                {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}
              </span>
              <span className="text-xs font-mono-data text-[#00A8FF] font-semibold">{unit}</span>
            </>
          )}
        </div>
      </div>

      {/* Missing Inputs Alert Box */}
      {(status === 'MISSING_INPUT' || missingInputs.length > 0) && (
        <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded p-2 text-[10px] font-mono-data text-[#FF3B30] space-y-1">
          <div className="flex items-center space-x-1.5 font-bold uppercase">
            <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>Missing Input Variables:</span>
          </div>
          <p className="text-[#8A9BBE]">
            The following required stream variable(s) were not detected in dataset:{' '}
            <span className="text-[#FF3B30] font-bold">{missingInputs.join(', ') || 'Required telemetry stream'}</span>.
          </p>
        </div>
      )}

      {/* Expanded Breakdown Section */}
      {isExpanded && (
        <div className="space-y-2.5 pt-1 border-t border-[#1F2D45]/60 text-[10px] font-mono-data">
          {/* Inputs Section */}
          <div>
            <span className="text-[#00A8FF] font-bold flex items-center space-x-1 uppercase mb-1">
              <Layers className="w-3 h-3" />
              <span>Inputs Consumed ({inputs.length})</span>
            </span>
            <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {inputs.map((inp, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] border-b border-[#1F2D45]/40 pb-0.5 last:border-0">
                  <span className="text-[#8A9BBE]">
                    {inp.name} {inp.symbol ? `(${inp.symbol})` : ''}:
                  </span>
                  <span className="font-bold text-[#E8EDF7]">
                    {inp.value} <span className="text-[#00A8FF] font-normal">{inp.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Equation Section */}
          <div>
            <span className="text-[#00E87A] font-bold flex items-center space-x-1 uppercase mb-1">
              <FunctionSquare className="w-3 h-3" />
              <span>Equation / Method</span>
            </span>
            <div className="bg-[#0A0F1E] border border-[#1F2D45] rounded p-2 text-[#00E87A] font-bold">
              {equation}
            </div>
          </div>

          {/* Data Source & Assumptions Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[#FFB800] font-bold flex items-center space-x-1 uppercase mb-0.5">
                <Database className="w-3 h-3" />
                <span>Data Source</span>
              </span>
              <p className="text-[#8A9BBE] bg-[#0A0F1E] border border-[#1F2D45] rounded p-1.5">
                {dataSource}
              </p>
            </div>

            <div>
              <span className="text-[#8A9BBE] font-bold flex items-center space-x-1 uppercase mb-0.5">
                <FileText className="w-3 h-3" />
                <span>Assumptions</span>
              </span>
              <ul className="text-[#8A9BBE] bg-[#0A0F1E] border border-[#1F2D45] rounded p-1.5 list-disc list-inside space-y-0.5">
                {assumptions.map((asm, idx) => (
                  <li key={idx}>{asm}</li>
                ))}
              </ul>
            </div>
          </div>

          {notes && (
            <div className="text-[9px] text-[#8A9BBE] italic bg-[#111827] p-1.5 rounded border border-[#1F2D45]">
              Note: {notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
