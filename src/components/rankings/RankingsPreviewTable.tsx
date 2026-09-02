import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Trash2, 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  UserX
} from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';
import { useSleeper } from '../../context/SleeperContext';
import { CsvDropzone } from './CsvDropzone';
import { MatchedRankingPlayer } from '../../lib/rankings/types';

// Position color mapping
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

export const RankingsPreviewTable: React.FC = () => {
  const { 
    dataset, 
    clearRankings, 
    downloadTemplate, 
    setIsUploadModalOpen, 
    setIsUnmatchedModalOpen,
    unmatchedPlayers 
  } = useRankings();
  const { league } = useSleeper();

  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FA' | 'ROSTERED' | 'MY_TEAM'>('ALL');

  // Filter items based on search and filters
  const filteredItems = useMemo<MatchedRankingPlayer[]>(() => {
    if (!dataset) return [];

    return dataset.items.filter((item) => {
      // Position filter
      if (positionFilter !== 'ALL') {
        const itemPos = item.pos.toUpperCase();
        if (positionFilter === 'FLEX') {
          if (!['RB', 'WR', 'TE'].includes(itemPos)) return false;
        } else if (itemPos !== positionFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'FA' && item.rosterStatus.type !== 'free_agent') {
        return false;
      }
      if (statusFilter === 'ROSTERED' && item.rosterStatus.type === 'free_agent') {
        return false;
      }
      if (statusFilter === 'MY_TEAM' && !item.rosterStatus.isMyTeam) {
        return false;
      }

      // Search query filter (name, team, or rostered team name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.playerName.toLowerCase().includes(q) || item.originalCsvName.toLowerCase().includes(q);
        const teamMatch = item.team ? item.team.toLowerCase().includes(q) : false;
        const rosterTeamMatch = item.rosterStatus.teamName ? item.rosterStatus.teamName.toLowerCase().includes(q) : false;
        if (!nameMatch && !teamMatch && !rosterTeamMatch) {
          return false;
        }
      }

      return true;
    });
  }, [dataset, searchQuery, positionFilter, statusFilter]);

  // If no rankings dataset is currently loaded, render the Dropzone
  if (!dataset) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">No Rankings Loaded</h2>
          <p className="text-sm text-slate-400">
            Upload your custom fantasy rankings CSV or load the sample consensus dataset to cross-reference with your Sleeper league.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <CsvDropzone />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dataset Summary Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{dataset.filename}</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {dataset.totalRows} Players
                </span>
                {league ? (
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Synced with {league.name}
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Connect League for Live Rosters
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingested {new Date(dataset.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                {' '}{dataset.matchedCount} Sleeper player matches ({Math.round((dataset.matchedCount / dataset.totalRows) * 100)}%)
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Replace CSV</span>
            </button>

            <button
              type="button"
              onClick={downloadTemplate}
              title="Download CSV Template"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={clearRankings}
              title="Clear current rankings"
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Total Ranked</span>
            <span className="font-mono font-bold text-slate-200">{dataset.totalRows}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-emerald-300/80">Available (FA)</span>
            <span className="font-mono font-bold text-emerald-400">{dataset.freeAgentCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Rostered</span>
            <span className="font-mono font-bold text-slate-200">{dataset.rosteredCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Match Rate</span>
            <span className="font-mono font-bold text-slate-200">
              {Math.round((dataset.matchedCount / dataset.totalRows) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player name, NFL team, or Sleeper roster..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
        </div>

        {/* Position and Status Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'ALL' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('FA')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'FA' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Free Agents
            </button>
            <button
              onClick={() => setStatusFilter('ROSTERED')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'ROSTERED' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rostered
            </button>
            <button
              onClick={() => setStatusFilter('MY_TEAM')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'MY_TEAM' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Team
            </button>
          </div>

          {/* Position Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs overflow-x-auto">
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                  positionFilter === pos
                    ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-3">Position</th>
                <th className="py-3.5 px-3">NFL Team</th>
                <th className="py-3.5 px-3">Bye</th>
                <th className="py-3.5 px-4">Sleeper Roster Status</th>
                <th className="py-3.5 px-3 text-center">Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserX className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No matching players found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search query or position/status filters.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isFA = item.rosterStatus.type === 'free_agent';
                  const isMyTeam = item.rosterStatus.isMyTeam;

                  return (
                    <tr 
                      key={`${item.id}-${item.rank}`}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isMyTeam ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                        #{item.rank}
                      </td>

                      {/* Player Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>{item.playerName}</span>
                              {item.tier && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  T{item.tier}
                                </span>
                              )}
                            </div>
                            {item.sleeperPlayer?.injury_status && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                                {item.sleeperPlayer.injury_status}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-xs border ${getPositionBadgeClass(item.pos)}`}>
                          {item.pos}{item.posRank ? item.posRank : ''}
                        </span>
                      </td>

                      {/* NFL Team */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {item.team || '—'}
                      </td>

                      {/* Bye */}
                      <td className="py-3 px-3 font-mono text-slate-400 text-xs">
                        {item.bye ? `W${item.bye}` : '—'}
                      </td>

                      {/* Sleeper Roster Status */}
                      <td className="py-3 px-4">
                        {isFA ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Free Agent (Available)
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {item.rosterStatus.avatarUrl ? (
                              <img
                                src={item.rosterStatus.avatarUrl}
                                alt=""
                                className="w-6 h-6 rounded-full ring-1 ring-slate-700"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                                {item.rosterStatus.teamName?.[0] || 'T'}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-slate-200 text-xs truncate max-w-[140px]">
                                  {item.rosterStatus.teamName}
                                </span>
                                {isMyTeam && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                                    My Team
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {item.rosterStatus.isStarter ? (
                                  <span className="text-amber-400 font-medium">Starter</span>
                                ) : item.rosterStatus.isReserve ? (
                                  <span className="text-rose-400 font-medium">IR/Reserve</span>
                                ) : item.rosterStatus.isTaxi ? (
                                  <span className="text-purple-400 font-medium">Taxi</span>
                                ) : (
                                  <span>Bench</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Match Status */}
                      <td className="py-3 px-3 text-center">
                        {item.isMatched ? (
                          <span title="Linked to Sleeper NFL Database" className="inline-flex text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsUnmatchedModalOpen(true)}
                            title="Unmatched to Sleeper ID. Click to inspect."
                            className="inline-flex text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredItems.length} of {dataset.totalRows} ranked players</span>
          <span>Rankings Engine v1.0</span>
        </div>
      </div>
    </div>
  );
};
