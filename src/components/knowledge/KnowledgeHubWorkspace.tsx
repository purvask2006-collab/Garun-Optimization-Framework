import React, { useState } from 'react';
import { 
  KNOWLEDGE_DOCUMENTS, 
  INTERACTIVE_EQUATIONS, 
  DocumentItem 
} from '../../data/knowledgeHubData';
import { PdfViewerModal } from './PdfViewerModal';
import { EquationCalculatorCard } from './EquationCalculatorCard';
import { EquationCalculator } from './EquationCalculator';
import { ComponentDatabaseTable } from './ComponentDatabaseTable';
import { BookmarksManagerPanel } from './BookmarksManagerPanel';
import { CornerReticle } from '../common/CornerReticle';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  Calculator, 
  Database, 
  FileText, 
  Shield, 
  Flame, 
  Clock, 
  Sliders, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  Filter
} from 'lucide-react';

export type KnowledgeCategoryTab = 
  | 'ALL_DOCS'
  | 'EQUATIONS'
  | 'COMPONENTS'
  | 'HAL_NOTES'
  | 'MISSION_DOCS'
  | 'DESIGN_ASSUMPTIONS'
  | 'BOOKMARKS';

export const KnowledgeHubWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KnowledgeCategoryTab>('ALL_DOCS');
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['DOC-FAR-CS23', 'EQ-BREGUET-HYBRID', 'ENG-KAVERI-DRY']);

  const handleToggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(b => b !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const handleOpenDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsPdfOpen(true);
  };

  // Filter documents based on active tab and search query
  const filteredDocuments = KNOWLEDGE_DOCUMENTS.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      doc.code.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(globalSearchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'HAL_NOTES') return doc.category === 'HAL_NOTE';
    if (activeTab === 'MISSION_DOCS') return doc.category === 'MISSION_DOC';
    if (activeTab === 'DESIGN_ASSUMPTIONS') return doc.category === 'DESIGN_ASSUMPTION';
    if (activeTab === 'ALL_DOCS') return true;

    return true;
  });

  return (
    <div id="knowledge-hub-workspace" className="flex-1 bg-[#0A0F1E] p-2 flex flex-col space-y-2 overflow-hidden select-none h-full">
      {/* 1. TOP KNOWLEDGE HUB HEADER & SEARCH BAR */}
      <div className="bg-[#0F1729] p-2.5 rounded border border-[#1A2740] flex items-center justify-between flex-shrink-0 space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-[#00A8FF]/10 border border-[#00A8FF]/30 flex items-center justify-center text-[#00A8FF]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold font-sans-ui text-white uppercase tracking-wider flex items-center space-x-2">
              <span>AEROSPACE KNOWLEDGE HUB & DOCUMENTATION SYSTEM</span>
              <span className="bg-[#00E87A]/20 text-[#00E87A] text-[8.5px] px-1.5 py-0.2 rounded border border-[#00E87A]/40 font-mono-data">
                HAL CERTIFIED KNOWLEDGE REPOSITORY
              </span>
            </h1>
            <p className="text-[9.5px] font-mono-data text-[#8A9BBE]">
              ENGINEERING REFERENCES, FORMULAS, COMPONENT DATABASES, MISSION DOCS & HAL NOTES
            </p>
          </div>
        </div>

        {/* Real-Time Quick Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#8A9BBE] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Quick search equations, HAL notes, CS-23 codes, engine datasheets..."
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            className="w-full bg-[#111A2E] border border-[#1A2740] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8A9BBE] focus:outline-none focus:border-[#00A8FF] font-mono-data"
          />
        </div>

        {/* Bookmarks Counter Button */}
        <button
          onClick={() => setActiveTab('BOOKMARKS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border text-[10px] font-mono-data font-bold transition-all ${
            activeTab === 'BOOKMARKS'
              ? 'bg-[#00E87A] text-[#0A0F1E] border-[#00E87A]'
              : 'bg-[#172236] text-[#00E87A] border-[#1A2740] hover:border-[#00E87A]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" fill={activeTab === 'BOOKMARKS' ? '#0A0F1E' : '#00E87A'} />
          <span>BOOKMARKS ({bookmarkedIds.length})</span>
        </button>
      </div>

      {/* 2. CATEGORY TABS STRIP */}
      <div className="flex items-center space-x-1 bg-[#0F1729] p-1 rounded border border-[#1A2740] flex-shrink-0 font-mono-data text-[9.5px] overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL_DOCS', label: 'ALL DOCUMENTS', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'EQUATIONS', label: 'EQUATIONS & CALCULATORS', icon: <Calculator className="w-3.5 h-3.5" /> },
          { id: 'COMPONENTS', label: 'COMPONENT DATABASES', icon: <Database className="w-3.5 h-3.5" /> },
          { id: 'HAL_NOTES', label: 'HAL NOTES', icon: <Shield className="w-3.5 h-3.5" /> },
          { id: 'MISSION_DOCS', label: 'MISSION CONOPS', icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'DESIGN_ASSUMPTIONS', label: 'DESIGN ASSUMPTIONS', icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'BOOKMARKS', label: 'SAVED BOOKMARKS', icon: <Bookmark className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as KnowledgeCategoryTab)}
            className={`px-3 py-1 rounded flex items-center space-x-1.5 uppercase transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm'
                : 'text-[#8A9BBE] hover:text-white hover:bg-[#172236]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. MAIN WORKSPACE CONTENT */}
      {activeTab === 'EQUATIONS' && (
        <div className="flex-1 min-h-0 h-full">
          <EquationCalculator
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            globalSearchTerm={globalSearchTerm}
          />
        </div>
      )}

      {activeTab === 'COMPONENTS' && (
        <div className="flex-1 min-h-0 h-full">
          <ComponentDatabaseTable
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        </div>
      )}

      {activeTab === 'BOOKMARKS' && (
        <div className="flex-1 min-h-0 h-full">
          <BookmarksManagerPanel
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenDoc={handleOpenDoc}
          />
        </div>
      )}

      {(activeTab === 'ALL_DOCS' || activeTab === 'HAL_NOTES' || activeTab === 'MISSION_DOCS' || activeTab === 'DESIGN_ASSUMPTIONS') && (
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
          {/* Document Cards List (Width 8/12) */}
          <div className="col-span-8 flex flex-col space-y-2 overflow-y-auto min-h-0">
            {filteredDocuments.map((doc) => {
              const isBm = bookmarkedIds.includes(doc.id);
              return (
                <CornerReticle key={doc.id} id={`doc-card-${doc.id}`} className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#172236] text-[#00A8FF] text-[8.5px] px-2 py-0.5 rounded border border-[#1A2740] font-mono-data font-bold uppercase">
                        {doc.code}
                      </span>
                      <span className="text-[8.5px] font-mono-data text-[#00E87A] bg-[#00E87A]/10 px-1.5 py-0.5 rounded">
                        {doc.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(doc.id)}
                      className={`p-1 rounded transition-colors ${
                        isBm ? 'text-[#00E87A]' : 'text-[#8A9BBE] hover:text-white'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isBm ? '#00E87A' : 'none'} />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white font-sans-ui mb-1">{doc.title}</h3>
                  <p className="text-[9.5px] font-mono-data text-[#8A9BBE] mb-2 line-clamp-2">{doc.summary}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1A2740] text-[8.5px] font-mono-data">
                    <div className="flex items-center space-x-2 text-[#8A9BBE]">
                      <span>{doc.authorOrBody}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                      <span>•</span>
                      <span>{doc.pageCount} Pages</span>
                    </div>

                    <button
                      onClick={() => handleOpenDoc(doc)}
                      className="bg-[#00A8FF] hover:bg-[#0088CC] text-[#0A0F1E] font-bold px-3 py-1 rounded transition-all flex items-center space-x-1 uppercase text-[8.5px]"
                    >
                      <span>OPEN PDF READER</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </CornerReticle>
              );
            })}
          </div>

          {/* Quick Equation Calculator Sidebar Widget (Width 4/12) */}
          <div className="col-span-4 h-full">
            <EquationCalculatorCard
              equation={INTERACTIVE_EQUATIONS[0]}
              isBookmarked={bookmarkedIds.includes(INTERACTIVE_EQUATIONS[0].id)}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {selectedDoc && (
        <PdfViewerModal
          document={selectedDoc}
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          isBookmarked={bookmarkedIds.includes(selectedDoc.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}
    </div>
  );
};
