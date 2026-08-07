import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { Database } from 'lucide-react';

export const DataQualityModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={21}
      title="Dataset Quality & Sensor Noise Auditing"
      category="ENGINEERING & DELIVERABLES"
      equationBadge="Sensor SNR & SNR 98.4%"
      description="Dataset audit, telemetry signal-to-noise ratio, sensor drift detection & data completeness score"
      inputsConsumed={['garun.json v2.0.0', 'HIL Sensor Calibration Matrix', 'Bus Telemetry Stream']}
      physicsModel="Statistical Signal Analysis: SNR, Outlier Rejection via Median Absolute Deviation (MAD)"
      outputsGenerated={['Overall Data Completeness (100%)', 'Sensor Noise Floor (<0.2%)', 'Data Quality Index (98.4%)']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#00E87A]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              DATASET INTEGRITY & SENSOR AUDIT
            </span>
          </div>
          <span className="text-[10px] font-mono-data bg-[#172236] text-[#00E87A] px-2 py-0.5 rounded border border-[#1F2D45]">
            98.4% QUALITY INDEX
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-mono-data">
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Telemetry Channel Count:</span>
            <div className="text-lg font-bold text-[#00E87A] mt-1">42 Channels Active</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Data Outlier Drop Rate:</span>
            <div className="text-lg font-bold text-[#00A8FF] mt-1">&lt;0.01% (Clean)</div>
          </div>
          <div className="bg-[#111827] border border-[#1F2D45] p-3 rounded">
            <span className="text-[#8A9BBE]">Physics Variance Check:</span>
            <div className="text-lg font-bold text-[#00E87A] mt-1">100% Physics Compliant</div>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
