import React, { useState } from 'react';
import { Bookmark, ChevronRight, ExternalLink, Info } from 'lucide-react';
import { CITATIONS, CitationItem } from '../../data/citations';
import { useGarunStore } from '../../store/useGarunStore';

export interface CitationBadgeProps {
  citationKey: string;
  label?: string;
  className?: string;
}

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
    label: 'TEXTBOOK',
    color: 'text-[#00F5E4]',
    bg: 'bg-[#00F5E4]/10',
    border: 'border-[#00F5E4]/40'
  },
  international_standard: {
    label: 'INT STANDARD',
    color: 'text-[#B47FFF]',
    bg: 'bg-[#B47FFF]/10',
    border: 'border-[#B47FFF]/40'
  },
  standard: {
    label: 'STANDARD',
    color: 'text-[#B47FFF]',
    bg: 'bg-[#B47FFF]/10',
    border: 'border-[#B47FFF]/40'
  },
  engineering_assumption: {
    label: 'ASSUMPTION',
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/40'
  }
};

export const CitationBadge: React.FC<CitationBadgeProps> = ({ citationKey, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveModule } = useGarunStore();

  const citation = CITATIONS[citationKey];
  if (!citation) return null;

  const badgeInfo = typeBadgeMap[citation.type] || typeBadgeMap.engineering_assumption;

  const handleGoToReferences = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModule('references');
  };

  return (
    <div className={`inline-block text-left font-mono-data ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title={`View Source Citation for ${citation.parameter}`}
        className={`inline-flex items-center space-x-1 px-1 py-0.2 text-[8.5px] rounded border transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#00E87A] text-[#0A0F1E] border-[#00E87A] font-bold shadow-sm'
            : `${badgeInfo.bg} ${badgeInfo.color} ${badgeInfo.border} hover:border-[#00E87A]/80`
        }`}
      >
        <Bookmark className="w-2.5 h-2.5" />
        <span>{label || citationKey}</span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 p-2.5 bg-[#0D1527] border border-[#00E87A]/60 rounded-md shadow-2xl text-[9.5px] text-[#E8EDF7] space-y-2 z-50 relative min-w-[260px] max-w-[340px]"
        >
          <div className="flex items-center justify-between border-b border-[#1A2740] pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#00E87A]" />
              <span className="font-bold text-white uppercase tracking-wider">SOURCE CITATION</span>
            </div>
            <span className={`text-[8px] px-1.5 py-0.2 rounded border font-bold ${badgeInfo.bg} ${badgeInfo.color} ${badgeInfo.border}`}>
              {badgeInfo.label}
            </span>
          </div>

          <div>
            <span className="text-[8px] text-[#8A9BBE] block uppercase font-sans-ui">PARAMETER</span>
            <span className="font-bold text-white text-[10px]">{citation.parameter}</span>
          </div>

          <div className="bg-[#111A2E] p-1.5 rounded border border-[#1A2740]">
            <span className="text-[8px] text-[#8A9BBE] block uppercase font-sans-ui mb-0.5">DESIGN VALUE</span>
            <span className="font-mono text-[#00E87A] font-bold text-[10px]">{citation.value}</span>
          </div>

          <div className="bg-[#111A2E] p-1.5 rounded border border-[#1A2740]">
            <span className="text-[8px] text-[#8A9BBE] block uppercase font-sans-ui mb-0.5">DOCUMENTED SOURCE</span>
            <p className="text-[9px] text-[#E8EDF7] leading-tight">{citation.source}</p>
          </div>

          {citation.note && (
            <div className="text-[8.5px] text-[#F59E0B] italic bg-[#F59E0B]/10 p-1 rounded border border-[#F59E0B]/30">
              Note: {citation.note}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoToReferences}
            className="w-full mt-1 py-1 bg-[#00E87A]/20 hover:bg-[#00E87A] text-[#00E87A] hover:text-[#0A0F1E] border border-[#00E87A]/50 rounded text-[9px] font-bold font-mono-data transition-colors flex items-center justify-center space-x-1"
          >
            <span>OPEN REFERENCES REGISTRY</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
