import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Upload, 
  ShieldAlert,
  X,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';
import { useSleeper } from '../../context/SleeperContext';
import { CsvDropzone } from './CsvDropzone';
import { MatchedRankingPlayer } from '../../lib/rankings/types';

// Position color mapping export for badges
export function getPositionBadgeClass(pos: string): string {
  const p = pos.toUpperCase();
  switch (p) {
    case 'QB':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    case 'RB':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'WR':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    case 'TE':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'K':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    case 'DEF':
    case 'DST':
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    default:
      return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
  }
}

interface RankingsPreviewDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const RankingsPreviewTable: React.FC<RankingsPreviewDrawerProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { 
    dataset, 
    clearRankings, 
    downloadTemplate, 
    setIsUploadModalOpen, 
    setIsUnmatchedModalOpen,
    unmatchedPlayers,
    isRankingsDrawerOpen,
    setIsRankingsDrawerOpen
  } = useRankings();
  const { league } = useSleeper();

  const [previewSearch, setPreviewSearch] = useState('');

  const effectiveIsOpen = isOpen !== undefined ? isOpen : isRankingsDrawerOpen;
  const handleClose = onClose || (() => setIsRankingsDrawerOpen(false));

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && effectiveIsOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [effectiveIsOpen, handleClose]);

  // Filter preview items in drawer
  const previewItems = useMemo<MatchedRankingPlayer[]>(() => {
    if (!dataset) return [];
    if (!previewSearch.trim()) return dataset.items.slice(0, 100);

    const q = previewSearch.toLowerCase().trim();
    return dataset.items.filter((item) => {
      const nameMatch = 
        (item.playerName ? item.playerName.toLowerCase().includes(q) : false) || 
        (item.originalCsvName ? item.originalCsvName.toLowerCase().includes(q) : false);
      const teamMatch = item.team ? item.team.toLowerCase().includes(q) : false;
      const posMatch = item.pos ? item.pos.toLowerCase().includes(q) : false;
      return nameMatch || teamMatch || posMatch;
    }).slice(0, 100);
  }, [dataset, previewSearch]);

  if (!effectiveIsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-over Right Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div 
          className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="px-6 py-4.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/10">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Rankings File & Ingestion Stats</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {dataset ? `${dataset.filename} (${dataset.totalRows} players)` : 'Upload or manage fantasy rankings CSV'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Close drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!dataset ? (
              <div className="space-y-6">
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">No Rankings File Loaded</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Upload your custom fantasy rankings CSV or load sample data to cross-reference with your Sleeper league rosters.
                  </p>
                </div>

                <CsvDropzone />
              </div>
            ) : (
              <>
                {/* Dataset Summary Banner Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-100">{dataset.filename}</span>
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {dataset.totalRows} Players
                        </span>
                        {league ? (
                          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            Synced with {league.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            No League Synced
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Ingested {new Date(dataset.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                        {' '}{dataset.matchedCount} Sleeper player matches ({Math.round((dataset.matchedCount / dataset.totalRows) * 100)}%)
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Replace CSV</span>
                    </button>

                    {unmatchedPlayers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsUnmatchedModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>{unmatchedPlayers.length} Unmatched</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={downloadTemplate}
                      title="Download CSV Template"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Template</span>
                    </button>

                    <button
                      type="button"
                      onClick={clearRankings}
                      title="Clear current rankings"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Status Metrics Bar */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Matching & Roster Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Total Ranked</span>
                      <span className="font-mono font-bold text-base text-slate-200">{dataset.totalRows}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25">
                      <span className="text-emerald-300/80 block text-[11px]">Available (FA)</span>
                      <span className="font-mono font-bold text-base text-emerald-400">{dataset.freeAgentCount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Rostered</span>
                      <span className="font-mono font-bold text-base text-slate-200">{dataset.rosteredCount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Match Rate</span>
                      <span className="font-mono font-bold text-base text-slate-200">
                        {Math.round((dataset.matchedCount / dataset.totalRows) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ingestion Preview Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        File Ingestion Preview
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Showing first {previewItems.length} of {dataset.totalRows} parsed entries
                      </p>
                    </div>

                    {/* Search inside preview */}
                    <div className="relative w-44">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        placeholder="Search preview..."
                        className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
                    <div className="max-h-[360px] overflow-y-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium sticky top-0 z-10 text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">RK</th>
                            <th className="py-2.5 px-3">Player</th>
                            <th className="py-2.5 px-2.5">POS</th>
                            <th className="py-2.5 px-2.5">Team</th>
                            <th className="py-2.5 px-3">Roster Status</th>
                            <th className="py-2.5 px-2 text-center w-10">Sync</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {previewItems.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                                No preview records match "{previewSearch}"
                              </td>
                            </tr>
                          ) : (
                            previewItems.map((item) => {
                              const isFA = item.rosterStatus.type === 'free_agent';
                              return (
                                <tr key={`${item.id}-${item.rank}`} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="py-2 px-3 text-center font-mono font-bold text-slate-400">
                                    #{item.rank}
                                  </td>
                                  <td className="py-2 px-3 font-medium text-slate-200 max-w-[140px] truncate">
                                    {item.playerName}
                                  </td>
                                  <td className="py-2 px-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getPositionBadgeClass(item.pos)}`}>
                                      {item.pos}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2.5 font-mono text-slate-400 text-[11px]">
                                    {item.team || '—'}
                                  </td>
                                  <td className="py-2 px-3 text-[11px]">
                                    {isFA ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Free Agent
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 truncate block max-w-[120px]">
                                        {item.rosterStatus.teamName}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    {item.isMatched ? (
                                      <span title="Matched to Sleeper">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                                      </span>
                                    ) : (
                                      <span title="Unmatched">
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 inline" />
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Replace CSV</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RankingsPreviewTable as RankingsPreviewDrawer };
