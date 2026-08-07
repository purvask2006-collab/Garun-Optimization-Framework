import React, { useState } from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { HalProject } from '../../data/halProjectsData';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Activity, Clock, TrendingUp, Volume2, Shield, Fuel, Zap, Sparkles } from 'lucide-react';

interface HalMissionAdaptationSimProps {
  project: HalProject;
}

export const HalMissionAdaptationSim: React.FC<HalMissionAdaptationSimProps> = ({ project }) => {
  const [activeCurveTab, setActiveCurveTab] = useState<'PROFILE' | 'FUEL_SFC' | 'BATTERY_SOC'>('PROFILE');

  // Generate 11 mission flight profile checkpoints (0% to 100% mission time)
  const generateMissionData = () => {
    return [
      { pct: 0, altBase: 0, altHybrid: 0, sfcBase: 240, sfcHybrid: 190, soc: 100 },
      { pct: 10, altBase: 2000, altHybrid: 2500, sfcBase: 235, sfcHybrid: 180, soc: 92 },
      { pct: 20, altBase: 4500, altHybrid: 5200, sfcBase: 220, sfcHybrid: 172, soc: 84 },
      { pct: 30, altBase: 6500, altHybrid: 7000, sfcBase: 210, sfcHybrid: 165, soc: 78 },
      { pct: 40, altBase: 6500, altHybrid: 7000, sfcBase: 205, sfcHybrid: 160, soc: 72 },
      { pct: 50, altBase: 6500, altHybrid: 7000, sfcBase: 205, sfcHybrid: 158, soc: 66 },
      { pct: 60, altBase: 6500, altHybrid: 7000, sfcBase: 205, sfcHybrid: 158, soc: 60 },
      { pct: 70, altBase: 6500, altHybrid: 7000, sfcBase: 210, sfcHybrid: 162, soc: 52 },
      { pct: 80, altBase: 4500, altHybrid: 5000, sfcBase: 220, sfcHybrid: 170, soc: 40 },
      { pct: 90, altBase: 2000, altHybrid: 2200, sfcBase: 230, sfcHybrid: 178, soc: 28 },
      { pct: 100, altBase: 0, altHybrid: 0, sfcBase: 240, sfcHybrid: 185, soc: 20 }
    ];
  };

  const missionData = generateMissionData();

  return (
    <CornerReticle id="hal-mission-adaptation-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>HAL MISSION ADAPTATION & PERFORMANCE SIMULATOR</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              RETROFIT MISSION PROFILE ENHANCEMENT
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center space-x-1 bg-[#172236] p-0.5 rounded border border-[#1A2740] text-[8.5px] font-mono-data">
          <button
            onClick={() => setActiveCurveTab('PROFILE')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeCurveTab === 'PROFILE' ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
            }`}
          >
            ALTITUDE
          </button>
          <button
            onClick={() => setActiveCurveTab('FUEL_SFC')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeCurveTab === 'FUEL_SFC' ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
            }`}
          >
            FUEL SFC
          </button>
          <button
            onClick={() => setActiveCurveTab('BATTERY_SOC')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeCurveTab === 'BATTERY_SOC' ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
            }`}
          >
            SOC %
          </button>
        </div>
      </div>

      {/* Quantified Adaptation Benefits Strip */}
      <div className="grid grid-cols-4 gap-2 bg-[#111A2E] p-2 rounded border border-[#1A2740] mb-2 text-center text-[9px] font-mono-data flex-shrink-0">
        <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
          <span className="text-[#8A9BBE] text-[8px] block uppercase">ENDURANCE GAIN</span>
          <span className="font-bold text-sm text-[#00E87A]">+{project.adaptationBenefits.enduranceGainPct}%</span>
        </div>
        <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
          <span className="text-[#8A9BBE] text-[8px] block uppercase">SFC REDUCTION</span>
          <span className="font-bold text-sm text-[#00A8FF]">-{project.adaptationBenefits.sfcReductionPct}%</span>
        </div>
        <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
          <span className="text-[#8A9BBE] text-[8px] block uppercase">PAYLOAD CAPACITY</span>
          <span className="font-bold text-sm text-white">+{project.adaptationBenefits.payloadIncreaseKg} kg</span>
        </div>
        <div className="bg-[#172236]/80 p-1.5 rounded border border-[#1A2740]">
          <span className="text-[#8A9BBE] text-[8px] block uppercase">ACOUSTIC STEALTH</span>
          <span className="font-bold text-sm text-[#B47FFF]">-{project.adaptationBenefits.acousticReductionDb} dB</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeCurveTab === 'PROFILE' ? (
            <LineChart data={missionData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
              <XAxis dataKey="pct" stroke="#8A9BBE" fontSize={8} unit="%" />
              <YAxis stroke="#8A9BBE" fontSize={8} unit="m" />
              <Tooltip contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }} />
              <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="altHybrid" stroke="#00E87A" strokeWidth={2.5} name="Hybrid Retrofit Altitude (m)" />
              <Line type="monotone" dataKey="altBase" stroke="#8A9BBE" strokeWidth={1.5} strokeDasharray="3 3" name="Baseline Altitude (m)" />
            </LineChart>
          ) : activeCurveTab === 'FUEL_SFC' ? (
            <LineChart data={missionData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
              <XAxis dataKey="pct" stroke="#8A9BBE" fontSize={8} unit="%" />
              <YAxis stroke="#8A9BBE" fontSize={8} domain={[140, 260]} unit="g/kWh" />
              <Tooltip contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }} />
              <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="sfcHybrid" stroke="#00A8FF" strokeWidth={2.5} name="Hybrid Specific Fuel Consumption" />
              <Line type="monotone" dataKey="sfcBase" stroke="#FFB800" strokeWidth={1.5} strokeDasharray="3 3" name="Baseline Fuel SFC" />
            </LineChart>
          ) : (
            <LineChart data={missionData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1A2740" />
              <XAxis dataKey="pct" stroke="#8A9BBE" fontSize={8} unit="%" />
              <YAxis stroke="#B47FFF" fontSize={8} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0F1729', borderColor: '#1A2740', fontSize: '10px' }} />
              <Line type="monotone" dataKey="soc" stroke="#B47FFF" strokeWidth={2.5} name="Battery Pack State of Charge (%)" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </CornerReticle>
  );
};
