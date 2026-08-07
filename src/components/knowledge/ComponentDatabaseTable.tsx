import React, { useState } from 'react';
import { 
  ENGINE_DATABASE, 
  BATTERY_DATABASE, 
  MOTOR_DATABASE, 
  GENERATOR_DATABASE,
  EngineSpec,
  BatterySpec,
  MotorSpec,
  GeneratorSpec
} from '../../data/knowledgeHubData';
import { CornerReticle } from '../common/CornerReticle';
import { Database, Search, Bookmark, Cpu, Flame, Battery, Zap, ShieldCheck } from 'lucide-react';

interface ComponentDatabaseTableProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
}

export const ComponentDatabaseTable: React.FC<ComponentDatabaseTableProps> = ({
  bookmarkedIds,
  onToggleBookmark
}) => {
  const [activeTab, setActiveTab] = useState<'ENGINES' | 'BATTERIES' | 'MOTORS' | 'GENERATORS'>('ENGINES');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <CornerReticle id="component-database-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-white uppercase tracking-wider">
              AEROSPACE COMPONENT TECHNICAL DATABASES
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              ENGINES, BATTERY CHEMISTRIES, MOTORS & GENERATORS
            </span>
          </div>
        </div>

        {/* Component Category Tabs */}
        <div className="flex items-center space-x-1 bg-[#172236] p-0.5 rounded border border-[#1A2740] text-[8.5px] font-mono-data">
          {([
            { id: 'ENGINES', label: 'ENGINES', icon: <Flame className="w-3 h-3" /> },
            { id: 'BATTERIES', label: 'BATTERIES', icon: <Battery className="w-3 h-3" /> },
            { id: 'MOTORS', label: 'MOTORS', icon: <Zap className="w-3 h-3" /> },
            { id: 'GENERATORS', label: 'GENERATORS', icon: <Cpu className="w-3 h-3" /> }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 uppercase transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold'
                  : 'text-[#8A9BBE] hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-2 flex-shrink-0">
        <Search className="w-3.5 h-3.5 text-[#8A9BBE] absolute left-2.5 top-2" />
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()} by name, manufacturer, or specs...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111A2E] border border-[#1A2740] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8A9BBE] focus:outline-none focus:border-[#00A8FF] font-mono-data"
        />
      </div>

      {/* Database Content Grid / Table */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 font-mono-data text-[9px]">
        {activeTab === 'ENGINES' && (
          <div className="grid grid-cols-2 gap-2">
            {ENGINE_DATABASE.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())).map((eng) => {
              const isBm = bookmarkedIds.includes(eng.id);
              return (
                <div key={eng.id} className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-xs text-[#00A8FF]">{eng.name}</span>
                      <button onClick={() => onToggleBookmark(eng.id)} className="text-[#8A9BBE] hover:text-[#00E87A]">
                        <Bookmark className="w-3.5 h-3.5" fill={isBm ? '#00E87A' : 'none'} />
                      </button>
                    </div>
                    <span className="text-[8px] text-[#8A9BBE] block">{eng.manufacturer}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[8.5px] text-[#8A9BBE] bg-[#172236]/70 p-1.5 rounded">
                    <div>POWER/THRUST: <strong className="text-white">{eng.powerOrThrustKw} kW</strong></div>
                    <div>SFC: <strong className="text-[#FFB800]">{eng.sfcGkwh} g/kWh</strong></div>
                    <div>WEIGHT: <strong className="text-white">{eng.weightKg} kg</strong></div>
                    <div>PRESSURE RATIO: <strong className="text-white">{eng.pressureRatio}:1</strong></div>
                  </div>

                  <div className="flex justify-between items-center text-[8px]">
                    <span className="bg-[#172236] text-[#00E87A] px-1.5 py-0.2 rounded border border-[#1A2740]">
                      {eng.status}
                    </span>
                    <span className="text-[#8A9BBE] line-clamp-1">{eng.applications.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'BATTERIES' && (
          <div className="grid grid-cols-2 gap-2">
            {BATTERY_DATABASE.filter(b => b.chemistry.toLowerCase().includes(searchTerm.toLowerCase())).map((bat) => {
              const isBm = bookmarkedIds.includes(bat.id);
              return (
                <div key={bat.id} className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-xs text-[#00E87A]">{bat.chemistry}</span>
                      <button onClick={() => onToggleBookmark(bat.id)} className="text-[#8A9BBE] hover:text-[#00E87A]">
                        <Bookmark className="w-3.5 h-3.5" fill={isBm ? '#00E87A' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[8.5px] text-[#8A9BBE] bg-[#172236]/70 p-1.5 rounded">
                    <div>GRAVIMETRIC: <strong className="text-[#00E87A]">{bat.gravimetricEnergyWhKg} Wh/kg</strong></div>
                    <div>VOLUMETRIC: <strong className="text-white">{bat.volumetricEnergyWhL} Wh/L</strong></div>
                    <div>NOMINAL VOLT: <strong className="text-white">{bat.nominalVoltageV} V</strong></div>
                    <div>CYCLES: <strong className="text-white">{bat.cycleLifeCount}</strong></div>
                  </div>

                  <div className="flex justify-between items-center text-[8px]">
                    <span className="bg-[#00E87A]/10 text-[#00E87A] px-1.5 py-0.2 rounded font-bold uppercase">
                      {bat.suitabilityRating}
                    </span>
                    <span className="text-[#FFB800]">RUNAWAY: &gt;{bat.thermalRunawayTempC}°C</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'MOTORS' && (
          <div className="grid grid-cols-2 gap-2">
            {MOTOR_DATABASE.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((mot) => {
              const isBm = bookmarkedIds.includes(mot.id);
              return (
                <div key={mot.id} className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-xs text-[#00A8FF]">{mot.name}</span>
                      <button onClick={() => onToggleBookmark(mot.id)} className="text-[#8A9BBE] hover:text-[#00E87A]">
                        <Bookmark className="w-3.5 h-3.5" fill={isBm ? '#00E87A' : 'none'} />
                      </button>
                    </div>
                    <span className="text-[8px] text-[#8A9BBE] block">{mot.type} TYPE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[8.5px] text-[#8A9BBE] bg-[#172236]/70 p-1.5 rounded">
                    <div>POWER: <strong className="text-white">{mot.powerKw} kW</strong></div>
                    <div>TORQUE: <strong className="text-white">{mot.torqueNm} Nm</strong></div>
                    <div>EFFICIENCY: <strong className="text-[#00E87A]">{mot.efficiencyPct}%</strong></div>
                    <div>DENSITY: <strong className="text-[#00A8FF]">{mot.powerDensityKwKg} kW/kg</strong></div>
                  </div>

                  <div className="flex justify-between items-center text-[8px] text-[#8A9BBE]">
                    <span>VOLTAGE: <strong className="text-white">{mot.operatingVoltageV}V DC</strong></span>
                    <span>MAX RPM: <strong className="text-white">{mot.maxRpm.toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'GENERATORS' && (
          <div className="grid grid-cols-2 gap-2">
            {GENERATOR_DATABASE.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map((gen) => {
              const isBm = bookmarkedIds.includes(gen.id);
              return (
                <div key={gen.id} className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-xs text-[#00A8FF]">{gen.name}</span>
                      <button onClick={() => onToggleBookmark(gen.id)} className="text-[#8A9BBE] hover:text-[#00E87A]">
                        <Bookmark className="w-3.5 h-3.5" fill={isBm ? '#00E87A' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[8.5px] text-[#8A9BBE] bg-[#172236]/70 p-1.5 rounded">
                    <div>CONT. POWER: <strong className="text-white">{gen.continuousPowerKw} kW</strong></div>
                    <div>BUS VOLT: <strong className="text-[#00A8FF]">{gen.voltageV} V</strong></div>
                    <div>WEIGHT: <strong className="text-white">{gen.weightKg} kg</strong></div>
                    <div>COOLING: <strong className="text-[#00E87A]">{gen.coolingMedium}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CornerReticle>
  );
};
