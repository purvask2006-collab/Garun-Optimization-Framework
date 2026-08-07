import React from 'react';
import { 
  KNOWLEDGE_DOCUMENTS, 
  INTERACTIVE_EQUATIONS, 
  ENGINE_DATABASE, 
  BATTERY_DATABASE, 
  MOTOR_DATABASE, 
  GENERATOR_DATABASE,
  DocumentItem
} from '../../data/knowledgeHubData';
import { CornerReticle } from '../common/CornerReticle';
import { Bookmark, FileText, Calculator, Flame, Battery, Zap, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksManagerPanelProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onOpenDoc: (doc: DocumentItem) => void;
}

export const BookmarksManagerPanel: React.FC<BookmarksManagerPanelProps> = ({
  bookmarkedIds,
  onToggleBookmark,
  onOpenDoc
}) => {
  // Aggregate all bookmarked items
  const bookmarkedDocs = KNOWLEDGE_DOCUMENTS.filter(d => bookmarkedIds.includes(d.id));
  const bookmarkedEqs = INTERACTIVE_EQUATIONS.filter(e => bookmarkedIds.includes(e.id));
  const bookmarkedEngines = ENGINE_DATABASE.filter(eng => bookmarkedIds.includes(eng.id));
  const bookmarkedBats = BATTERY_DATABASE.filter(b => bookmarkedIds.includes(b.id));
  const bookmarkedMotors = MOTOR_DATABASE.filter(m => bookmarkedIds.includes(m.id));
  const bookmarkedGens = GENERATOR_DATABASE.filter(g => bookmarkedIds.includes(g.id));

  const totalCount = 
    bookmarkedDocs.length + 
    bookmarkedEqs.length + 
    bookmarkedEngines.length + 
    bookmarkedBats.length + 
    bookmarkedMotors.length + 
    bookmarkedGens.length;

  return (
    <CornerReticle id="bookmarks-manager-panel" className="bg-[#0F1729] p-3 text-[#E8EDF7] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-[#00E87A]" fill="#00E87A" />
          <div>
            <h2 className="text-[11px] font-bold font-sans-ui text-white uppercase tracking-wider">
              BOOKMARKED ENGINEERING REFERENCES & DATASHEETS
            </h2>
            <span className="text-[9px] font-mono-data text-[#00E87A]">
              {totalCount} SAVED ITEM{totalCount === 1 ? '' : 'S'} IN KNOWLEDGE COLLECTION
            </span>
          </div>
        </div>
      </div>

      {/* Bookmarks List Container */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 font-mono-data text-[9px]">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#8A9BBE]">
            <Bookmark className="w-8 h-8 mb-2 opacity-30 text-[#00A8FF]" />
            <span className="font-bold text-xs text-white">NO BOOKMARKS SAVED YET</span>
            <p className="text-[9px] mt-1">
              Click the bookmark icon on any document, equation, or component datasheet to save it here for instant access.
            </p>
          </div>
        ) : (
          <>
            {/* Bookmarked Documents */}
            {bookmarkedDocs.map((doc) => (
              <div key={doc.id} className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#00A8FF]/10 border border-[#00A8FF]/30 flex items-center justify-center text-[#00A8FF]">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{doc.title}</span>
                    <span className="text-[8px] text-[#8A9BBE]">{doc.code} • {doc.category}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenDoc(doc)}
                    className="bg-[#00A8FF] text-[#0A0F1E] font-bold px-2 py-1 rounded text-[8px] uppercase flex items-center space-x-1"
                  >
                    <span>READ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => onToggleBookmark(doc.id)} className="text-[#8A9BBE] hover:text-[#FF3B30]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Bookmarked Equations */}
            {bookmarkedEqs.map((eq) => (
              <div key={eq.id} className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#00E87A]/10 border border-[#00E87A]/30 flex items-center justify-center text-[#00E87A]">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{eq.name}</span>
                    <span className="text-[8px] text-[#00A8FF] font-mono-data">{eq.symbolicFormula}</span>
                  </div>
                </div>

                <button onClick={() => onToggleBookmark(eq.id)} className="text-[#8A9BBE] hover:text-[#FF3B30]">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Bookmarked Engines, Batteries, Motors, Generators */}
            {[...bookmarkedEngines, ...bookmarkedBats, ...bookmarkedMotors, ...bookmarkedGens].map((item: { id: string; name?: string; chemistry?: string; type?: string }) => (
              <div key={item.id} className="bg-[#111A2E] p-2.5 rounded border border-[#1A2740] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{item.name || item.chemistry}</span>
                    <span className="text-[8px] text-[#8A9BBE]">{item.type || 'SPECS'}</span>
                  </div>
                </div>

                <button onClick={() => onToggleBookmark(item.id)} className="text-[#8A9BBE] hover:text-[#FF3B30]">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </CornerReticle>
  );
};
