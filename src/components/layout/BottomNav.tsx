import React from 'react';
import { 
  LayoutDashboard, 
  Crosshair, 
  Zap, 
  Play, 
  Dna, 
  BarChart3, 
  FileText, 
  Settings, 
  BookOpen,
  Bookmark,
  Plane,
  Scale,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useGarunStore } from '../../store/useGarunStore';
import { ModuleId } from '../../types/ui';

interface NavButtonProps {
  id: ModuleId;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-sans-ui font-medium transition-all duration-150 ${
      active 
        ? 'bg-[#00A8FF] text-[#0A0F1E] font-semibold shadow-sm shadow-[#00A8FF]/30' 
        : 'text-[#8A9BBE] hover:text-[#E8EDF7] hover:bg-[#172236]'
    }`}
  >
    <span className={active ? 'text-[#0A0F1E]' : 'text-[#00A8FF]'}>{icon}</span>
    <span>{label}</span>
  </button>
);

export const BottomNav: React.FC = () => {
  const { activeModule, setActiveModule } = useGarunStore();

  const navItems: { id: ModuleId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'mission-analysis', label: 'Mission Analysis & Intelligence', icon: <BarChart3 className="w-3.5 h-3.5 text-[#00E87A]" /> },
    { id: 'vehicle-definition', label: 'Mass Budget', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'validation', label: 'Validation', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#00E87A]" /> },
    { id: 'constraints', label: 'Mission', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: 'energy-flow', label: 'Propulsion', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'simulation', label: 'Simulation', icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'optimization', label: 'Optimization', icon: <Dna className="w-3.5 h-3.5" /> },
    { id: 'trade-studies', label: 'Trade Studies', icon: <TrendingUp className="w-3.5 h-3.5 text-[#00A8FF]" /> },
    { id: 'hal-integration', label: 'HAL Projects', icon: <Plane className="w-3.5 h-3.5" /> },
    { id: 'hardware-in-loop', label: 'Analysis', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'references', label: 'References', icon: <Bookmark className="w-3.5 h-3.5 text-[#00E87A]" /> },
    { id: 'diagnostics', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'knowledge-hub', label: 'Knowledge Hub', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <footer className="h-[40px] bg-[#0A0F1E] border-t border-[#1F2D45] px-3 flex items-center justify-between z-30 select-none">
      {/* Navigation Links */}
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            active={activeModule === item.id}
            onClick={() => setActiveModule(item.id)}
          />
        ))}
      </div>

      {/* Version Badge */}
      <div className="flex items-center space-x-2 text-[10px] font-mono-data text-[#8A9BBE] pl-3 border-l border-[#1F2D45] whitespace-nowrap">
        <span>HAL DESIGN SUITE</span>
        <span className="bg-[#172236] text-[#00A8FF] px-1.5 py-0.5 rounded border border-[#1F2D45] font-semibold">
          v2.5.0
        </span>
      </div>
    </footer>
  );
};
