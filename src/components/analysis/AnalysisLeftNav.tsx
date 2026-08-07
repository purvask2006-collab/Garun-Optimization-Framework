import React, { useState } from 'react';
import { 
  BarChart2, 
  Clock, 
  Wind, 
  Zap, 
  Flame, 
  BatteryCharging, 
  Cpu, 
  Activity, 
  Compass, 
  Cloud, 
  Thermometer, 
  Scale, 
  Gauge, 
  AlertTriangle, 
  Radio, 
  TrendingUp, 
  Sliders, 
  Dna, 
  CheckCircle2, 
  BookOpen, 
  Database, 
  FileText,
  Search,
  ChevronRight
} from 'lucide-react';
import { AnalysisModuleId, AnalysisNavItem } from './types';

interface AnalysisLeftNavProps {
  activeTab: AnalysisModuleId;
  onTabSelect: (tab: AnalysisModuleId) => void;
}

export const ANALYSIS_NAV_ITEMS: AnalysisNavItem[] = [
  // Category 1: CORE FLIGHT & VEHICLE
  { id: 'overview', number: 1, label: 'Overview', category: 'CORE', iconName: 'BarChart2', badge: 'KPI', status: 'READY', description: 'Executive summary & mission readiness' },
  { id: 'flight-timeline', number: 2, label: 'Flight & Timeline', category: 'CORE', iconName: 'Clock', status: 'READY', description: 'Continuous flight telemetry time-series' },
  { id: 'aerodynamics', number: 3, label: 'Aerodynamics', category: 'CORE', iconName: 'Wind', status: 'READY', description: 'Drag polar, L/D curves & stall margins' },
  { id: 'propulsion', number: 4, label: 'Propulsion', category: 'CORE', iconName: 'Zap', status: 'READY', description: 'ICE & electric motor efficiency chain' },
  { id: 'fuel', number: 5, label: 'Fuel', category: 'CORE', iconName: 'Flame', status: 'READY', description: 'BSFC, burn rate & phase fuel balance' },
  { id: 'battery', number: 6, label: 'Battery', category: 'CORE', iconName: 'BatteryCharging', status: 'READY', description: 'SOC drawdown, C-rate & voltage sag' },

  // Category 2: POWER & ENERGY
  { id: 'hybrid-power', number: 7, label: 'Hybrid Power', category: 'POWER', iconName: 'Cpu', badge: 'EMS', status: 'READY', description: 'Series/Parallel power split strategy' },
  { id: 'energy', number: 8, label: 'Energy', category: 'POWER', iconName: 'Activity', status: 'READY', description: 'Full mission energy Sankey diagram' },
  { id: 'endurance-range', number: 9, label: 'Endurance & Range', category: 'POWER', iconName: 'Compass', status: 'READY', description: 'Breguet endurance & payload-range curves' },
  { id: 'environment', number: 10, label: 'Environment', category: 'POWER', iconName: 'Cloud', status: 'READY', description: 'ISA density altitude & wind corrections' },
  { id: 'thermal', number: 11, label: 'Thermal', category: 'POWER', iconName: 'Thermometer', status: 'READY', description: 'Inverter, motor & battery thermal margins' },
  { id: 'stability', number: 12, label: 'Stability', category: 'POWER', iconName: 'Scale', status: 'READY', description: 'Static margin & CG shift tracking' },
  { id: 'mission-efficiency', number: 13, label: 'Mission Efficiency', category: 'POWER', iconName: 'Gauge', status: 'READY', description: 'Overall transport efficiency score' },

  // Category 3: INTELLIGENCE & PREDICTION
  { id: 'anomalies', number: 14, label: 'Anomalies', category: 'INTELLIGENCE', iconName: 'AlertTriangle', badge: 'ALERT', status: 'READY', description: 'Physics constraint violation log' },
  { id: 'live-analysis', number: 15, label: 'Live Analysis', category: 'INTELLIGENCE', iconName: 'Radio', badge: 'LIVE', status: 'LIVE', description: 'Real-time telemetry stream processing' },
  { id: 'prediction', number: 16, label: 'Prediction', category: 'INTELLIGENCE', iconName: 'TrendingUp', badge: 'FORECAST', status: 'READY', description: 'Physics-based forward energy prediction' },
  { id: 'what-if', number: 17, label: 'What-If', category: 'INTELLIGENCE', iconName: 'Sliders', status: 'READY', description: 'Parameter trade-off sensitivity tool' },
  { id: 'optimization', number: 18, label: 'Optimization', category: 'INTELLIGENCE', iconName: 'Dna', badge: 'NSGA-II', status: 'READY', description: 'Multi-objective Pareto optimization' },
  { id: 'recommendations', number: 19, label: 'Recommendations', category: 'INTELLIGENCE', iconName: 'CheckCircle2', status: 'READY', description: 'Automated engineering action items' },

  // Category 4: ENGINEERING & DELIVERABLES
  { id: 'methodology', number: 20, label: 'Methodology', category: 'ENGINEERING', iconName: 'BookOpen', status: 'READY', description: 'Equations, FAR CS-23 & physics references' },
  { id: 'data-quality', number: 21, label: 'Data Quality', category: 'ENGINEERING', iconName: 'Database', status: 'READY', description: 'Sensor confidence & noise verification' },
  { id: 'generate-report', number: 22, label: 'Generate Report', category: 'ENGINEERING', iconName: 'FileText', badge: 'PDF/DOCX', status: 'READY', description: 'Automated engineering report builder' }
];

const renderIcon = (iconName: string) => {
  const props = { className: "w-3.5 h-3.5 flex-shrink-0" };
  switch (iconName) {
    case 'BarChart2': return <BarChart2 {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'Wind': return <Wind {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Flame': return <Flame {...props} />;
    case 'BatteryCharging': return <BatteryCharging {...props} />;
    case 'Cpu': return <Cpu {...props} />;
    case 'Activity': return <Activity {...props} />;
    case 'Compass': return <Compass {...props} />;
    case 'Cloud': return <Cloud {...props} />;
    case 'Thermometer': return <Thermometer {...props} />;
    case 'Scale': return <Scale {...props} />;
    case 'Gauge': return <Gauge {...props} />;
    case 'AlertTriangle': return <AlertTriangle {...props} />;
    case 'Radio': return <Radio {...props} />;
    case 'TrendingUp': return <TrendingUp {...props} />;
    case 'Sliders': return <Sliders {...props} />;
    case 'Dna': return <Dna {...props} />;
    case 'CheckCircle2': return <CheckCircle2 {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'Database': return <Database {...props} />;
    case 'FileText': return <FileText {...props} />;
    default: return <BarChart2 {...props} />;
  }
};

export const AnalysisLeftNav: React.FC<AnalysisLeftNavProps> = ({ activeTab, onTabSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = ANALYSIS_NAV_ITEMS.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.number.toString().includes(searchTerm)
  );

  const categories = [
    { key: 'CORE', title: 'CORE FLIGHT & VEHICLE' },
    { key: 'POWER', title: 'POWER & ENERGY' },
    { key: 'INTELLIGENCE', title: 'INTELLIGENCE & PREDICTION' },
    { key: 'ENGINEERING', title: 'ENGINEERING & DELIVERABLES' }
  ];

  return (
    <aside className="w-[260px] bg-[#0E1626] border-r border-[#1F2D45] flex flex-col h-full select-none flex-shrink-0">
      {/* Search & Filter Header */}
      <div className="p-2 border-b border-[#1F2D45] bg-[#0A0F1E]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#8A9BBE] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 22 Analysis Modules..."
            className="w-full bg-[#111827] border border-[#1F2D45] rounded pl-8 pr-2 py-1 text-[11px] font-mono-data text-[#E8EDF7] placeholder-[#8A9BBE]/60 focus:outline-none focus:border-[#00A8FF]"
          />
        </div>
      </div>

      {/* Module List Container */}
      <div className="flex-1 overflow-y-auto px-1.5 py-2 space-y-3 custom-scrollbar">
        {categories.map(cat => {
          const itemsInCat = filteredItems.filter(item => item.category === cat.key);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-1">
              <div className="px-2 py-0.5 text-[9px] font-mono-data font-bold tracking-wider text-[#8A9BBE] uppercase flex items-center justify-between border-b border-[#1F2D45]/40 pb-1">
                <span>{cat.title}</span>
                <span className="text-[8px] bg-[#172236] px-1 rounded text-[#00A8FF]">
                  {itemsInCat.length}
                </span>
              </div>

              <div className="space-y-0.5">
                {itemsInCat.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded transition-all duration-150 text-left group ${
                        isActive
                          ? 'bg-[#00A8FF]/15 text-[#00A8FF] font-semibold border-l-2 border-[#00A8FF] pl-2.5 shadow-sm'
                          : 'text-[#C5D1E8] hover:text-white hover:bg-[#172236]/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-1">
                        <span className={`text-[10px] font-mono-data w-4 text-right flex-shrink-0 ${isActive ? 'text-[#00A8FF]' : 'text-[#8A9BBE]'}`}>
                          {item.number.toString().padStart(2, '0')}.
                        </span>
                        <span className={isActive ? 'text-[#00A8FF]' : 'text-[#8A9BBE] group-hover:text-[#00A8FF]'}>
                          {renderIcon(item.iconName)}
                        </span>
                        <span className="text-[11px] font-sans-ui truncate leading-tight">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {item.badge && (
                          <span className={`text-[8px] font-mono-data px-1 py-0.5 rounded uppercase ${
                            item.badge === 'LIVE' ? 'bg-[#00E87A]/20 text-[#00E87A] border border-[#00E87A]/40 animate-pulse' :
                            item.badge === 'ALERT' ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40' :
                            item.badge === 'FORECAST' ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40' :
                            'bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? 'text-[#00A8FF] translate-x-0.5' : 'text-[#8A9BBE]/30 group-hover:text-[#8A9BBE]'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation Info */}
      <div className="p-2 border-t border-[#1F2D45] bg-[#0A0F1E] flex items-center justify-between text-[10px] font-mono-data text-[#8A9BBE]">
        <span className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E87A]" />
          <span>22 MODULES LOADED</span>
        </span>
        <span className="text-[9px] bg-[#172236] px-1.5 py-0.5 rounded text-[#00A8FF] border border-[#1F2D45]">
          ENGINE v1.0
        </span>
      </div>
    </aside>
  );
};
