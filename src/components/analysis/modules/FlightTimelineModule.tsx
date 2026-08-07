import React from 'react';
import { BaseModuleFrame } from './BaseModuleFrame';
import { Clock, Activity, Radio, Play } from 'lucide-react';

export const FlightTimelineModule: React.FC = () => {
  return (
    <BaseModuleFrame
      moduleNumber={2}
      title="Flight Profile & Continuous Timeline"
      category="CORE FLIGHT & VEHICLE"
      equationBadge="TIME-SERIES INTEGRATION"
      description="Continuous time-domain flight profile: synchronized altitude, airspeed, power demand & state-of-charge"
      inputsConsumed={['Mission Profile Segments', 'Simulated Clock (0 to 33,120 s)', 'ISA Density Model']}
      physicsModel="Euler Integration of Kinematic Equations: dx/dt = V, dSOC/dt = -P/E_bat"
      outputsGenerated={['Synchronized Telemetry Array', 'Phase Transition Timestamps', 'Cumulative Distance (2,300 km)']}
    >
      <div className="bg-[#0E1626] border border-[#1F2D45] rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2D45] pb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#00A8FF]" />
            <span className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              Continuous Mission Time-Series (0 - 9.20 Hours)
            </span>
          </div>
          <span className="text-[10px] font-mono-data text-[#00E87A] bg-[#111827] px-2 py-0.5 rounded border border-[#1F2D45]">
            ● SYNCHRONIZED 10 Hz SAMPLING
          </span>
        </div>

        {/* Placeholder Graphic Chart Representation */}
        <div className="h-[220px] bg-[#111827] border border-[#1F2D45] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8A9BBE]">
            <span>ALTITUDE & SPEED PROFILE [Y1: m, Y2: km/h]</span>
            <span className="text-[#00A8FF]">TIME AXIS [HOURS]</span>
          </div>

          <div className="flex-1 flex items-end justify-between px-4 py-2 space-x-2">
            {/* Phase 1 Takeoff */}
            <div className="w-[10%] h-[30%] bg-gradient-to-t from-[#FF6B35]/20 to-[#FF6B35]/60 border-t-2 border-[#FF6B35] rounded-t flex items-center justify-center text-[9px] font-mono-data text-white font-bold">
              CLIMB
            </div>
            {/* Phase 2 High Alt Cruise */}
            <div className="w-[45%] h-[85%] bg-gradient-to-t from-[#00A8FF]/20 to-[#00A8FF]/60 border-t-2 border-[#00A8FF] rounded-t flex items-center justify-center text-[9px] font-mono-data text-white font-bold">
              HIGH ALTITUDE CRUISE (3000m)
            </div>
            {/* Phase 3 Loiter */}
            <div className="w-[35%] h-[60%] bg-gradient-to-t from-[#00E87A]/20 to-[#00E87A]/60 border-t-2 border-[#00E87A] rounded-t flex items-center justify-center text-[9px] font-mono-data text-white font-bold">
              STEALTH LOITER (2000m)
            </div>
            {/* Phase 4 Descent */}
            <div className="w-[10%] h-[20%] bg-gradient-to-t from-[#8A9BBE]/20 to-[#8A9BBE]/60 border-t-2 border-[#8A9BBE] rounded-t flex items-center justify-center text-[9px] font-mono-data text-white font-bold">
              DESCENT
            </div>
          </div>

          <div className="flex justify-between text-[9px] font-mono-data text-[#8A9BBE] border-t border-[#1F2D45] pt-1">
            <span>0.0h</span>
            <span>0.25h</span>
            <span>4.75h</span>
            <span>8.75h</span>
            <span>9.20h</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-[10px] font-mono-data">
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45]">
            <span className="text-[#8A9BBE]">Total Elapsed Time:</span>
            <div className="text-sm font-bold text-[#E8EDF7] mt-0.5">33,120 seconds</div>
          </div>
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45]">
            <span className="text-[#8A9BBE]">Sampling Resolution:</span>
            <div className="text-sm font-bold text-[#00A8FF] mt-0.5">10 Hz (331,200 frames)</div>
          </div>
          <div className="bg-[#111827] p-2.5 rounded border border-[#1F2D45]">
            <span className="text-[#8A9BBE]">Phase Sequence:</span>
            <div className="text-sm font-bold text-[#00E87A] mt-0.5">4 Segments Validated</div>
          </div>
        </div>
      </div>
    </BaseModuleFrame>
  );
};
