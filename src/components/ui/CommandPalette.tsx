import React, { useState, useEffect } from 'react';
import { Search, Compass, Cpu, FileText, Crosshair, X } from 'lucide-react';
import { useGarunStore, ActiveModule } from '../../store/useGarunStore';

export const CommandPalette: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveModule } = useGarunStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions: Array<{ id: string; name: string; module: ActiveModule; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', name: 'Go to Digital Twin & Mission Dashboard', module: 'dashboard', icon: Compass },
    { id: 'optimization', name: 'Go to NSGA-II Pareto Optimization', module: 'optimization', icon: Cpu },
    { id: 'hal', name: 'Go to HAL Cross-Platform Transfer Engine', module: 'hal', icon: Crosshair },
    { id: 'knowledge', name: 'Go to Aerospace Equations & Engineering Hub', module: 'knowledge', icon: FileText },
    { id: 'reports', name: 'Go to PDF/CSV Export & Report Generator', module: 'reports', icon: FileText },
  ];

  const filtered = actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 font-mono-data text-[10px]">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Command palette — search all features"
        className="bg-[#0F1729] border border-[#00A8FF]/40 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3 py-2 border-b border-[#1A2740] bg-[#111A2E]">
          <Search className="w-4 h-4 text-[#00A8FF] mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type command or search workspace... (Cmd+K)"
            aria-label="Search commands and navigation"
            className="bg-transparent text-white focus:outline-none w-full text-xs"
            autoFocus
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)} 
            aria-label="Close command palette"
            className="text-[#8A9BBE] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto" role="listbox">
          {filtered.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  setActiveModule(act.module);
                  setCommandPaletteOpen(false);
                }}
                aria-label={`Execute command: ${act.name}`}
                className="w-full text-left p-2 rounded bg-[#172236]/60 hover:bg-[#00A8FF]/20 hover:border-[#00A8FF] border border-transparent flex items-center space-x-2 text-white transition-all"
              >
                <Icon className="w-4 h-4 text-[#00A8FF]" />
                <span className="flex-1 font-bold">{act.name}</span>
                <span className="text-[8px] text-[#8A9BBE]">EXECUTE</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-[#8A9BBE]">No commands found</div>
          )}
        </div>
      </div>
    </div>
  );
};
