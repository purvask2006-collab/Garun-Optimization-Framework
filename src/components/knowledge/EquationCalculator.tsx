import React, { useState, useMemo } from 'react';
import { ALL_EQUATIONS, EQUATION_CATEGORIES, EQUATION_DOMAINS, EquationItem } from '../../data/equationsData';
import { CornerReticle } from '../common/CornerReticle';
import { Calculator, Search, Filter, Bookmark, BookOpen, Info, CheckCircle2, Sliders } from 'lucide-react';

interface EquationCalculatorProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  globalSearchTerm?: string;
}

export const EquationCalculator: React.FC<EquationCalculatorProps> = ({
  bookmarkedIds,
  onToggleBookmark,
  globalSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [expandedEqId, setExpandedEqId] = useState<string | null>(null);

  // Combine global and local search queries
  const activeSearch = (searchTerm || globalSearchTerm).trim().toLowerCase();

  const filteredEquations = useMemo(() => {
    return ALL_EQUATIONS.filter((eq) => {
      // Category Filter
      if (selectedCategory !== 'ALL' && eq.category !== selectedCategory) {
        return false;
      }
      // Domain Filter
      if (selectedDomain !== 'ALL' && eq.domain !== selectedDomain) {
        return false;
      }
      // Search Filter
      if (activeSearch) {
        const matchesId = eq.id.toLowerCase().includes(activeSearch);
        const matchesName = eq.name.toLowerCase().includes(activeSearch);
        const matchesDomain = eq.domain.toLowerCase().includes(activeSearch);
        const matchesCategory = eq.category.toLowerCase().includes(activeSearch);
        const matchesDesc = eq.description.toLowerCase().includes(activeSearch);
        const matchesFormula = (eq.formula || eq.latex || eq.python || '').toLowerCase().includes(activeSearch);
        const matchesVars = eq.variables.some(
          (v) =>
            v.symbol.toLowerCase().includes(activeSearch) ||
            v.name.toLowerCase().includes(activeSearch) ||
            (v.unit && v.unit.toLowerCase().includes(activeSearch)) ||
            (v.notes && v.notes.toLowerCase().includes(activeSearch))
        );

        if (!matchesId && !matchesName && !matchesDomain && !matchesCategory && !matchesDesc && !matchesFormula && !matchesVars) {
          return false;
        }
      }
      return true;
    });
  }, [activeSearch, selectedCategory, selectedDomain]);

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-2 h-full overflow-hidden font-mono-data">
      {/* Search & Filter Header Bar */}
      <div className="bg-[#0F1729] p-2.5 rounded border border-[#1A2740] flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#8A9BBE] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter equations by name, ID, formula, or variable (e.g. Breguet, ISA, NSGA)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111A2E] border border-[#1A2740] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8A9BBE] focus:outline-none focus:border-[#00A8FF]"
            />
          </div>
        </div>

        {/* Domain Filter */}
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-[#00A8FF]" />
          <span className="text-[9px] text-[#8A9BBE] uppercase font-bold">DOMAIN:</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-[#111A2E] border border-[#1A2740] rounded px-2 py-1 text-xs text-[#00A8FF] focus:outline-none font-bold"
          >
            {EQUATION_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[9px] text-[#8A9BBE] uppercase font-bold">CATEGORY:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#111A2E] border border-[#1A2740] rounded px-2 py-1 text-xs text-[#00E87A] focus:outline-none font-bold"
          >
            {EQUATION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[9.5px] text-[#00E87A] font-bold bg-[#00E87A]/10 px-2 py-1 rounded border border-[#00E87A]/30">
          {filteredEquations.length} / {ALL_EQUATIONS.length} FORMULAS
        </div>
      </div>

      {/* Equations Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pr-1">
        {filteredEquations.map((eq) => {
          const isBookmarked = bookmarkedIds.includes(eq.id);
          const isExpanded = expandedEqId === eq.id;

          return (
            <CornerReticle
              key={eq.id}
              id={`equation-card-${eq.id}`}
              className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col relative overflow-hidden transition-all border border-[#1A2740] hover:border-[#00A8FF]/50"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-1.5 border-b border-[#1A2740] pb-2">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="bg-[#00A8FF]/15 text-[#00A8FF] text-[8.5px] font-bold px-1.5 py-0.5 rounded border border-[#00A8FF]/40 uppercase">
                    {eq.id}
                  </span>
                  <span className="bg-[#00E87A]/10 text-[#00E87A] text-[8.5px] font-bold px-1.5 py-0.5 rounded border border-[#00E87A]/30 uppercase">
                    {eq.category}
                  </span>
                </div>

                <button
                  onClick={() => onToggleBookmark(eq.id)}
                  className={`p-1 rounded transition-colors ${
                    isBookmarked ? 'text-[#00E87A]' : 'text-[#8A9BBE] hover:text-white'
                  }`}
                  title={isBookmarked ? 'Bookmarked' : 'Bookmark Equation'}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? '#00E87A' : 'none'} />
                </button>
              </div>

              {/* Domain & Title */}
              <div className="text-[8px] text-[#8A9BBE] uppercase tracking-wider mb-0.5 truncate">
                {eq.domain}
              </div>
              <h3 className="font-bold text-xs text-white font-sans-ui mb-2 leading-tight">
                {eq.name}
              </h3>

              {/* Symbolic / Code Formula Box */}
              <div className="bg-[#111A2E] p-2 rounded border border-[#00A8FF]/30 font-mono-data text-[10px] text-[#00A8FF] mb-2 font-bold break-all leading-relaxed">
                {eq.latex || eq.python || eq.formula}
              </div>

              {/* Description */}
              <p className="text-[9px] text-[#8A9BBE] mb-2 line-clamp-3 leading-normal">
                {eq.description}
              </p>

              {/* Variables List */}
              {eq.variables && eq.variables.length > 0 && (
                <div className="mt-auto pt-2 border-t border-[#1A2740]/80">
                  <div className="flex justify-between items-center mb-1 text-[8.5px] text-[#00A8FF] font-bold">
                    <span>VARIABLES & PARAMETERS ({eq.variables.length})</span>
                    <button
                      onClick={() => setExpandedEqId(isExpanded ? null : eq.id)}
                      className="text-[#00E87A] hover:underline"
                    >
                      {isExpanded ? 'COLLAPSE' : 'EXPAND'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    {(isExpanded ? eq.variables : eq.variables.slice(0, 3)).map((v) => (
                      <div
                        key={v.symbol}
                        className="bg-[#111A2E]/80 px-2 py-1 rounded border border-[#1A2740] flex items-center justify-between text-[8.5px]"
                      >
                        <span className="font-bold text-[#00E87A] mr-2">
                          {v.symbol}
                          {v.unit && <span className="text-[#8A9BBE] font-normal ml-1">({v.unit})</span>}
                        </span>
                        <span className="text-[#8A9BBE] truncate max-w-[160px]" title={v.name}>
                          {v.name}
                        </span>
                      </div>
                    ))}
                    {!isExpanded && eq.variables.length > 3 && (
                      <div className="text-[8px] text-[#8A9BBE] text-center pt-0.5">
                        +{eq.variables.length - 3} more variables...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CornerReticle>
          );
        })}
      </div>
    </div>
  );
};
