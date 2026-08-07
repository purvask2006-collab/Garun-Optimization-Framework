import React, { useState } from 'react';
import { DocumentItem } from '../../data/knowledgeHubData';
import { CornerReticle } from '../common/CornerReticle';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  Download, 
  Bookmark, 
  MessageSquare, 
  FileText, 
  Share2, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';

interface PdfViewerModalProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (docId: string) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [userNotes, setUserNotes] = useState<{ id: string; text: string; page: number }[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [showNotesPanel, setShowNotesPanel] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    setUserNotes([...userNotes, { id: Date.now().toString(), text: newNoteText, page: currentPage }]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setUserNotes(userNotes.filter(n => n.id !== id));
  };

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0F1E]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1729] border border-[#00A8FF]/60 rounded-lg shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden relative">
        {/* PDF Viewer Header Bar */}
        <div className="bg-[#111A2E] border-b border-[#1A2740] px-4 py-2.5 flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#00A8FF]/10 border border-[#00A8FF]/30 flex items-center justify-center text-[#00A8FF]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold font-sans-ui text-white uppercase tracking-wider line-clamp-1">
                {document.title}
              </h2>
              <div className="flex items-center space-x-2 text-[9.5px] font-mono-data text-[#8A9BBE]">
                <span className="text-[#00E87A]">{document.code}</span>
                <span>•</span>
                <span>{document.authorOrBody}</span>
                <span>•</span>
                <span>{document.date}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            {/* Page Navigation */}
            <div className="flex items-center space-x-1 bg-[#172236] px-2 py-1 rounded border border-[#1A2740] text-[10px] font-mono-data">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-[#8A9BBE] hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-white px-1">Page {currentPage} of {document.pageCount}</span>
              <button 
                onClick={() => setCurrentPage(Math.min(document.pageCount, currentPage + 1))}
                disabled={currentPage === document.pageCount}
                className="text-[#8A9BBE] hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-[#172236] px-2 py-1 rounded border border-[#1A2740] text-[10px] font-mono-data">
              <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))} className="text-[#8A9BBE] hover:text-white">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[#00A8FF] font-bold px-1">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))} className="text-[#8A9BBE] hover:text-white">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bookmark Toggle */}
            <button
              onClick={() => onToggleBookmark(document.id)}
              className={`p-1.5 rounded border transition-colors ${
                isBookmarked 
                  ? 'bg-[#00E87A]/20 border-[#00E87A] text-[#00E87A]' 
                  : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE] hover:text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? '#00E87A' : 'none'} />
            </button>

            {/* User Notes Toggle */}
            <button
              onClick={() => setShowNotesPanel(!showNotesPanel)}
              className={`p-1.5 rounded border transition-colors relative ${
                showNotesPanel 
                  ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF]' 
                  : 'bg-[#172236] border-[#1A2740] text-[#8A9BBE] hover:text-white'
              }`}
              title="Annotations & Notes"
            >
              <MessageSquare className="w-4 h-4" />
              {userNotes.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00E87A] text-[#0A0F1E] text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {userNotes.length}
                </span>
              )}
            </button>

            {/* Share / Copy Link */}
            <button
              onClick={handleShare}
              className="p-1.5 bg-[#172236] border border-[#1A2740] rounded text-[#8A9BBE] hover:text-white transition-colors"
              title="Copy Reference Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#00E87A]" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 bg-[#172236] hover:bg-[#FF3B30] border border-[#1A2740] rounded text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Body Canvas Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Document Reader Viewport */}
          <div className="flex-1 bg-[#0A0F1E] p-6 overflow-y-auto flex justify-center">
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-3xl bg-[#0F1729] border border-[#1A2740] rounded-lg p-8 shadow-2xl transition-transform duration-150 text-[#E8EDF7]"
            >
              <div dangerouslySetInnerHTML={{ __html: document.contentPdfHtml }} />

              {/* Simulated Footer */}
              <div className="mt-12 pt-4 border-t border-[#1A2740] flex justify-between items-center text-[9px] font-mono-data text-[#8A9BBE]">
                <span>CONFIDENTIAL - FOR DEFENSE R&D USE ONLY</span>
                <span>PAGE {currentPage} / {document.pageCount}</span>
                <span>{document.code}</span>
              </div>
            </div>
          </div>

          {/* Optional Notes Sidebar */}
          {showNotesPanel && (
            <div className="w-80 bg-[#111A2E] border-l border-[#1A2740] p-3 flex flex-col h-full font-mono-data text-[9.5px]">
              <div className="flex justify-between items-center pb-2 border-b border-[#1A2740] mb-2">
                <span className="font-bold text-[#00A8FF] uppercase">ENGINEERING ANNOTATIONS</span>
                <span className="text-[8px] text-[#8A9BBE]">{userNotes.length} NOTES</span>
              </div>

              {/* New Note Input */}
              <div className="space-y-1.5 mb-3">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add technical annotation or calculation note..."
                  className="w-full bg-[#0F1729] border border-[#1A2740] rounded p-2 text-white text-[9.5px] focus:outline-none focus:border-[#00A8FF] h-20 resize-none"
                />
                <button
                  onClick={handleAddNote}
                  className="w-full bg-[#00A8FF] hover:bg-[#0088CC] text-[#0A0F1E] font-bold py-1.5 rounded flex items-center justify-center space-x-1 uppercase text-[9px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD NOTE (PAGE {currentPage})</span>
                </button>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {userNotes.length === 0 ? (
                  <p className="text-[#8A9BBE] text-center text-[9px] py-4">No annotations added yet.</p>
                ) : (
                  userNotes.map((note) => (
                    <div key={note.id} className="bg-[#0F1729] p-2 rounded border border-[#1A2740] space-y-1">
                      <div className="flex justify-between items-center text-[8px] text-[#8A9BBE]">
                        <span className="text-[#00E87A] font-bold">PAGE {note.page}</span>
                        <button onClick={() => handleDeleteNote(note.id)} className="text-[#8A9BBE] hover:text-[#FF3B30]">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-white text-[9px] leading-normal">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
