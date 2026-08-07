import React, { useState } from 'react';
import { CornerReticle } from '../common/CornerReticle';
import { HalProject, HAL_PROJECTS } from '../../data/halProjectsData';
import { Search, ArrowUpDown, CheckCircle2, ShieldCheck, Zap, ArrowRight, Table, Filter } from 'lucide-react';

interface HalComparisonTableProps {
  selectedProject: HalProject;
  onSelectProject: (project: HalProject) => void;
}

type SortKey = 'name' | 'category' | 'baselineMtowKg' | 'baselineSfcGkwh' | 'compatibilityScore' | 'recommendedHybridSplitPct';

export const HalComparisonTable: React.FC<HalComparisonTableProps> = ({
  selectedProject,
  onSelectProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('compatibilityScore');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortKey(key);
      setSortOrder('DESC');
    }
  };

  const filteredAndSortedProjects = HAL_PROJECTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.currentArchitecture.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (typeof valA === 'string') {
      valA = (valA as string).toLowerCase();
      valB = (valB as string).toLowerCase();
    }

    if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
    if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
    return 0;
  });

  const categories = ['ALL', 'UAV', 'STEALTH_UCAV', 'HELICOPTER', 'ENGINE_TESTBED', 'TRANSPORT', 'SWARM'];

  return (
    <CornerReticle id="hal-comparison-table-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Table className="w-4 h-4 text-[#00A8FF]" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] uppercase tracking-wider flex items-center space-x-1.5">
              <span>HAL PROPULSION ARCHITECTURE COMPARISON MATRIX</span>
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              11 INDIGENOUS AIRCRAFT & ENGINE PLATFORMS
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 text-[#8A9BBE] absolute left-2 top-1.5" />
            <input
              type="text"
              placeholder="Search platform..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111A2E] border border-[#1A2740] rounded pl-7 pr-2 py-1 text-[9px] text-white placeholder-[#8A9BBE] focus:outline-none focus:border-[#00A8FF] font-mono-data w-36"
            />
          </div>

          <div className="flex items-center space-x-0.5 bg-[#172236] p-0.5 rounded border border-[#1A2740] text-[8px] font-mono-data">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  categoryFilter === cat ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold' : 'text-[#8A9BBE] hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'ALL' : cat.substring(0, 4)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 border border-[#1A2740] rounded">
        <table className="w-full text-left border-collapse font-mono-data text-[9px]">
          <thead className="bg-[#111A2E] text-[#8A9BBE] uppercase sticky top-0 border-b border-[#1A2740] z-10">
            <tr>
              <th className="p-2 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                <div className="flex items-center space-x-1">
                  <span>PROGRAM PLATFORM</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="p-2 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                <div className="flex items-center space-x-1">
                  <span>CATEGORY</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="p-2">BASELINE ARCHITECTURE</th>
              <th className="p-2">PROPOSED HYBRID RETROFIT</th>
              <th className="p-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('baselineMtowKg')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>MTOW (KG)</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="p-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('baselineSfcGkwh')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>SFC (G/KWH)</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="p-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('recommendedHybridSplitPct')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>HYBRID SPLIT</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="p-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('compatibilityScore')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>MATCH SCORE</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="p-2 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A2740]">
            {filteredAndSortedProjects.map((proj) => {
              const isSelected = proj.id === selectedProject.id;
              return (
                <tr
                  key={proj.id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-[#00A8FF]/15 text-white font-bold'
                      : 'bg-[#0F1729] hover:bg-[#172236]/80 text-[#E8EDF7]'
                  }`}
                >
                  <td className="p-2">
                    <div className="font-bold flex items-center space-x-1.5">
                      <span className="text-[#00A8FF]">{proj.name}</span>
                      <span className="text-[7.5px] bg-[#172236] px-1 rounded text-[#8A9BBE]">
                        {proj.codeName}
                      </span>
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="bg-[#172236] text-[#8A9BBE] px-1.5 py-0.2 rounded text-[8px] uppercase">
                      {proj.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-2 text-[#8A9BBE] line-clamp-1">{proj.currentArchitecture}</td>
                  <td className="p-2 text-[#00E87A]">{proj.proposedHybridArchitecture}</td>
                  <td className="p-2 text-right font-bold">{proj.baselineMtowKg.toLocaleString()}</td>
                  <td className="p-2 text-right text-[#FFB800]">{proj.baselineSfcGkwh}</td>
                  <td className="p-2 text-right text-[#00A8FF]">{proj.recommendedHybridSplitPct}%</td>
                  <td className="p-2 text-right font-bold text-[#00E87A]">
                    {proj.compatibilityScore}%
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onSelectProject(proj)}
                      className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold transition-all ${
                        isSelected
                          ? 'bg-[#00E87A] text-[#0A0F1E]'
                          : 'bg-[#00A8FF]/20 text-[#00A8FF] hover:bg-[#00A8FF] hover:text-[#0A0F1E]'
                      }`}
                    >
                      {isSelected ? 'ACTIVE' : 'ANALYZE'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CornerReticle>
  );
};
