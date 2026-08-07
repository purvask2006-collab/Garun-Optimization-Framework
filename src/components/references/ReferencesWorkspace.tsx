import React, { useState } from 'react';
import { Bookmark, Search, ShieldCheck, Filter, AlertTriangle, BookOpen, ExternalLink, CheckCircle2, Info } from 'lucide-react';
import { CornerReticle } from '../common/CornerReticle';
import { CITATIONS, CitationItem } from '../../data/citations';

const typeBadgeMap: Record<CitationItem['type'], { label: string; color: string; bg: string; border: string }> = {
  competition_given: {
    label: 'COMPETITION SPEC',
    color: 'text-[#00A8FF]',
    bg: 'bg-[#00A8FF]/10',
    border: 'border-[#00A8FF]/40'
  },
  peer_reviewed: {
    label: 'PEER-REVIEWED',
    color: 'text-[#00E87A]',
    bg: 'bg-[#00E87A]/10',
    border: 'border-[#00E87A]/40'
  },
  textbook: {
    label: 'TEXTBOOK / MONOGRAPH',
    color: 'text-[#00F5E4]',
    bg: 'bg-[#00F5E4]/10',
    border: 'border-[#00F5E4]/40'
  },
  international_standard: {
    label: 'ICAO / INT STANDARD',
    color: 'text-[#B47FFF]',
    bg: 'bg-[#B47FFF]/10',
    border: 'border-[#B47FFF]/40'
  },
  standard: {
    label: 'ASTM STANDARD',
    color: 'text-[#B47FFF]',
    bg: 'bg-[#B47FFF]/10',
    border: 'border-[#B47FFF]/40'
  },
  engineering_assumption: {
    label: 'ENGINEERING ASSUMPTION',
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/40'
  }
};

const confidenceMap: Record<CitationItem['confidence'], { label: string; color: string; bg: string }> = {
  definitive: { label: 'DEFINITIVE', color: 'text-[#00E87A]', bg: 'bg-[#00E87A]/20' },
  good: { label: 'GOOD', color: 'text-[#00A8FF]', bg: 'bg-[#00A8FF]/20' },
  moderate: { label: 'MODERATE', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/20' },
  low: { label: 'LOW CONFIDENCE', color: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]/20' }
};

export const ReferencesWorkspace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const citationList = Object.values(CITATIONS);

  // Counters
  const competitionCount = citationList.filter(c => c.type === 'competition_given').length;
  const peerReviewedCount = citationList.filter(c => c.type === 'peer_reviewed' || c.type === 'textbook' || c.type === 'international_standard' || c.type === 'standard').length;
  const assumptionsCount = citationList.filter(c => c.type === 'engineering_assumption').length;
  const lowConfidenceCount = citationList.filter(c => c.confidence === 'low').length;

  const filteredCitations = citationList.filter(item => {
    const matchesSearch = 
      item.parameter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'ALL' || item.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 bg-[#0A0F1E] p-4 flex flex-col space-y-4 overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-[#00E87A]/10 border border-[#00E87A]/40 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-[#00E87A]" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-2">
              <span>TECHNICAL CITATION & PARAMETER ORIGIN REGISTRY</span>
              <span className="text-[10px] bg-[#172236] text-[#00A8FF] px-2 py-0.5 rounded border border-[#1A2740] font-mono-data">
                HAL-AERDC-REF-2026
              </span>
            </h1>
            <p className="text-[10px] font-mono-data text-[#8A9BBE]">
              Strict parameter traceability audit database. Every design input mapped to literature, standards, or explicit assumptions.
            </p>
          </div>
        </div>

        {/* Audit Status */}
        <div className="flex items-center space-x-2 bg-[#111A2E] px-3 py-1.5 rounded border border-[#00E87A]/30 text-[11px] font-mono-data">
          <ShieldCheck className="w-4 h-4 text-[#00E87A]" />
          <span className="text-[#8A9BBE]">TRACEABILITY RATING:</span>
          <span className="text-[#00E87A] font-bold">100% AUDITABLE</span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-4 gap-3">
        {/* Competition Inputs */}
        <CornerReticle className="bg-[#0F1729] p-3 border border-[#00A8FF]/30 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono-data text-[#8A9BBE] uppercase block">COMPETITION INPUTS</span>
            <span className="text-xl font-bold font-mono-data text-[#00A8FF]">{competitionCount}</span>
            <span className="text-[9px] text-[#00A8FF] block mt-0.5">IIT Indore × HAL Specs</span>
          </div>
          <div className="p-2 rounded bg-[#00A8FF]/10 text-[#00A8FF]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </CornerReticle>

        {/* Peer-Reviewed & Standards */}
        <CornerReticle className="bg-[#0F1729] p-3 border border-[#00E87A]/30 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono-data text-[#8A9BBE] uppercase block">VERIFIED SOURCES</span>
            <span className="text-xl font-bold font-mono-data text-[#00E87A]">{peerReviewedCount}</span>
            <span className="text-[9px] text-[#00E87A] block mt-0.5">ICAO, ASTM, Journals, Textbooks</span>
          </div>
          <div className="p-2 rounded bg-[#00E87A]/10 text-[#00E87A]">
            <BookOpen className="w-5 h-5" />
          </div>
        </CornerReticle>

        {/* Assumptions */}
        <CornerReticle className="bg-[#0F1729] p-3 border border-[#F59E0B]/30 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono-data text-[#8A9BBE] uppercase block font-bold">ENGINEERING ASSUMPTIONS</span>
            <span className="text-xl font-bold font-mono-data text-[#F59E0B]">{assumptionsCount}</span>
            <span className="text-[9px] text-[#F59E0B] block mt-0.5">Requires tunnel/flight validation</span>
          </div>
          <div className="p-2 rounded bg-[#F59E0B]/10 text-[#F59E0B]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </CornerReticle>

        {/* Low Confidence Target */}
        <CornerReticle className="bg-[#0F1729] p-3 border border-[#FF3B30]/30 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono-data text-[#8A9BBE] uppercase block">LOW CONFIDENCE ITEMS</span>
            <span className="text-xl font-bold font-mono-data text-[#FF3B30]">{lowConfidenceCount}</span>
            <span className="text-[9px] text-[#FF3B30] block mt-0.5">Minimization Priority (CD0, e, η_prop)</span>
          </div>
          <div className="p-2 rounded bg-[#FF3B30]/10 text-[#FF3B30]">
            <Info className="w-5 h-5" />
          </div>
        </CornerReticle>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between bg-[#111A2E] p-2.5 rounded border border-[#1A2740]">
        <div className="flex items-center space-x-2 flex-1 max-w-md bg-[#0A0F1E] px-3 py-1.5 rounded border border-[#1A2740]">
          <Search className="w-4 h-4 text-[#8A9BBE]" />
          <input
            type="text"
            placeholder="Search parameter, source title, or citation ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-[11px] text-[#E8EDF7] focus:outline-none w-full font-mono-data"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#8A9BBE]" />
          <span className="text-[10px] font-mono-data text-[#8A9BBE] uppercase">SOURCE TYPE:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#0A0F1E] border border-[#1A2740] text-[#E8EDF7] text-[10.5px] font-mono-data px-2 py-1 rounded focus:outline-none"
          >
            <option value="ALL">ALL CATEGORIES ({citationList.length})</option>
            <option value="competition_given">COMPETITION GIVEN ({competitionCount})</option>
            <option value="peer_reviewed">PEER-REVIEWED PAPERS</option>
            <option value="textbook">TEXTBOOKS & MONOGRAPHS</option>
            <option value="standard">STANDARDS (ICAO / ASTM)</option>
            <option value="engineering_assumption">ENGINEERING ASSUMPTIONS ({assumptionsCount})</option>
          </select>
        </div>
      </div>

      {/* Citation Registry Table */}
      <CornerReticle className="flex-1 bg-[#0F1729] border border-[#1A2740] rounded overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left font-mono-data border-collapse">
            <thead>
              <tr className="bg-[#111A2E] text-[10px] text-[#8A9BBE] uppercase border-b border-[#1A2740]">
                <th className="py-2.5 px-3">PARAMETER</th>
                <th className="py-2.5 px-3">DESIGN VALUE / EXPRESSION</th>
                <th className="py-2.5 px-3">DOCUMENTED SOURCE / CITATION</th>
                <th className="py-2.5 px-3">TYPE</th>
                <th className="py-2.5 px-3">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2740] text-[10.5px]">
              {filteredCitations.map((item) => {
                const badge = typeBadgeMap[item.type];
                const conf = confidenceMap[item.confidence];
                const isLowConf = item.confidence === 'low' || item.type === 'engineering_assumption';

                return (
                  <tr
                    key={item.key}
                    className={`transition-colors hover:bg-[#172236]/80 ${
                      isLowConf ? 'bg-[#F59E0B]/5' : ''
                    }`}
                  >
                    {/* Parameter */}
                    <td className="py-3 px-3 font-bold text-white max-w-[200px]">
                      <div className="flex flex-col">
                        <span>{item.parameter}</span>
                        <span className="text-[8px] text-[#8A9BBE] font-normal">{item.key}</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-3 font-bold text-[#00E87A] max-w-[220px]">
                      <span className="bg-[#111A2E] px-2 py-1 rounded border border-[#1A2740] inline-block text-[10px]">
                        {item.value}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 text-[#E8EDF7] max-w-[340px] leading-relaxed">
                      <div>
                        <p className="text-[10px] text-[#E8EDF7]">{item.source}</p>
                        {item.note && (
                          <span className="text-[8.5px] text-[#F59E0B] italic block mt-0.5">
                            ★ Note: {item.note}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[8.5px] font-bold rounded border ${badge.bg} ${badge.color} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[8.5px] font-bold rounded ${conf.bg} ${conf.color}`}>
                        {conf.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CornerReticle>
    </div>
  );
};
