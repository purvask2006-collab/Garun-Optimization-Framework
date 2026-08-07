import React, { useState } from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { HalProject, HAL_PROJECTS } from '../../data/halProjectsData';
import { ChevronDown, Search, CheckCircle2, ShieldCheck, Cpu, Plane, Sparkles, Filter } from 'lucide-react';

interface HalProjectSelectorDropdownProps {
  selectedProject: HalProject;
  onSelectProject: (project: HalProject) => void;
}

export const HalProjectSelectorDropdown: React.FC<HalProjectSelectorDropdownProps> = ({
  selectedProject,
  onSelectProject
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredProjects = HAL_PROJECTS.filter((proj) => {
    const matchesSearch = 
      proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.codeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || proj.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'UAV', 'STEALTH_UCAV', 'HELICOPTER', 'ENGINE_TESTBED', 'TRANSPORT', 'SWARM'];

  return (
    <CornerReticle id="hal-project-selector" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col relative z-20 overflow-visible">
      {/* Selector Label & Dropdown Trigger Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Plane className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider">
              HAL AIRCRAFT & ENGINE PROGRAM SELECTION
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              11 ACTIVE PLATFORMS AVAILABLE FOR HYBRID RETROFIT
            </span>
          </div>
        </div>

        {/* Selected Category Tag */}
        <span className="bg-[#172236] text-[#00A8FF] text-[8.5px] px-2 py-0.5 rounded border border-[#1A2740] font-mono-data font-bold uppercase">
          {selectedProject.category.replace('_', ' ')}
        </span>
      </div>

      {/* Main Interactive Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#111A2E] hover:bg-[#172236] border border-[#00A8FF]/40 hover:border-[#00A8FF] p-2.5 rounded text-left transition-all duration-150 flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#00A8FF]/10 border border-[#00A8FF]/30 flex items-center justify-center text-[#00A8FF] font-bold font-mono-data text-xs">
              {selectedProject.id.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold font-sans-ui text-sm text-white group-hover:text-[#00A8FF] transition-colors">
                  {selectedProject.name}
                </span>
                <span className="text-[9.5px] font-mono-data text-[#8A9BBE] bg-[#172236] px-1.5 py-0.2 rounded border border-[#1A2740]">
                  {selectedProject.codeName}
                </span>
              </div>
              <span className="text-[9.5px] font-mono-data text-[#8A9BBE] line-clamp-1">
                {selectedProject.currentArchitecture}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[8px] font-mono-data text-[#8A9BBE] block uppercase">COMPATIBILITY</span>
              <span className="text-xs font-mono-data font-bold text-[#00E87A]">
                {selectedProject.compatibilityScore}% ({selectedProject.compatibilityRating})
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#00A8FF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Overlay Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1729] border border-[#00A8FF] rounded shadow-2xl z-50 p-2.5 max-h-[380px] overflow-y-auto space-y-2">
            {/* Search and Category Filters */}
            <div className="space-y-1.5 pb-2 border-b border-[#1A2740]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8A9BBE] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search HAL projects (e.g., GARUN, CATS, Kaveri, LUH...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#111A2E] border border-[#1A2740] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8A9BBE] focus:outline-none focus:border-[#00A8FF] font-mono-data"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-1 text-[8.5px] font-mono-data">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold'
                        : 'bg-[#172236] text-[#8A9BBE] hover:text-white'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Cards List */}
            <div className="space-y-1">
              {filteredProjects.map((proj) => {
                const isSelected = proj.id === selectedProject.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#00A8FF]/15 border-[#00A8FF] text-white'
                        : 'bg-[#111A2E]/80 hover:bg-[#172236] border-[#1A2740] text-[#E8EDF7]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded flex items-center justify-center font-bold font-mono-data text-[10px] ${
                        isSelected ? 'bg-[#00A8FF] text-[#0A0F1E]' : 'bg-[#172236] text-[#00A8FF]'
                      }`}>
                        {proj.id.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs">{proj.name}</span>
                          <span className="text-[8px] font-mono-data bg-[#172236] px-1 py-0.2 rounded text-[#8A9BBE]">
                            {proj.codeName}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono-data text-[#8A9BBE] block line-clamp-1">
                          {proj.currentArchitecture}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono-data">
                      <span className="text-[9px] font-bold text-[#00E87A] block">
                        {proj.compatibilityScore}% MATCH
                      </span>
                      <span className="text-[7.5px] text-[#8A9BBE] uppercase">
                        {proj.baselineMtowKg} kg MTOW
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CornerReticle>
  );
};
