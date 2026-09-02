import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Upload, 
  ShieldAlert
} from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';
import { useSleeper } from '../../context/SleeperContext';
import { CsvDropzone } from './CsvDropzone';
import { MatchedRankingPlayer } from '../../lib/rankings/types';
import { RankingsFilterBar, FilterState } from './RankingsFilterBar';
import { RankingsTable } from './RankingsTable';
import { SelectedPlayersBar } from './SelectedPlayersBar';

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

  const maxRank = useMemo(() => {
    if (!dataset || dataset.items.length === 0) return 500;
    return Math.max(...dataset.items.map((i) => i.rank), dataset.items.length);
  }, [dataset]);

  const defaultFilters: FilterState = useMemo(() => ({
    searchQuery: '',
    position: 'ALL',
    status: 'ALL',
    selectedRosterIds: [],
    includeFreeAgents: true,
    minRank: 1,
    maxRank: maxRank,
    tierFilter: null,
  }), [maxRank]);

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      position: 'ALL',
      status: 'ALL',
      selectedRosterIds: [],
      includeFreeAgents: true,
      minRank: 1,
      maxRank: maxRank,
      tierFilter: null,
    });
  }, [maxRank]);

  // Filter items based on search and multi-criteria filters
  const filteredItems = useMemo<MatchedRankingPlayer[]>(() => {
    if (!dataset) return [];

    return dataset.items.filter((item) => {
      // 1. Position filter
      if (filters.position !== 'ALL') {
        const itemPos = item.pos.toUpperCase();
        if (filters.position === 'FLEX') {
          if (!['RB', 'WR', 'TE'].includes(itemPos)) return false;
        } else if (filters.position === 'DEF') {
          if (!['DEF', 'DST'].includes(itemPos)) return false;
        } else if (itemPos !== filters.position) {
          return false;
        }
      }

      // 2. Status filter
      if (filters.status === 'FA' && item.rosterStatus.type !== 'free_agent') {
        return false;
      }
      if (filters.status === 'ROSTERED' && item.rosterStatus.type === 'free_agent') {
        return false;
      }
      if (filters.status === 'MY_TEAM' && !item.rosterStatus.isMyTeam) {
        return false;
      }

      // 3. Multi-Roster Selection filter
      if (filters.selectedRosterIds.length > 0 || !filters.includeFreeAgents) {
        const isFA = item.rosterStatus.type === 'free_agent';
        const isSelectedRoster = item.rosterStatus.rosterId !== null && 
          filters.selectedRosterIds.includes(item.rosterStatus.rosterId);

        if (isFA && !filters.includeFreeAgents) {
          return false;
        }
        if (!isFA && !isSelectedRoster) {
          return false;
        }
        if (isFA && filters.selectedRosterIds.length > 0 && !filters.includeFreeAgents) {
          return false;
        }
      }

      // 4. Rank Range filter
      if (item.rank < filters.minRank || item.rank > filters.maxRank) {
        return false;
      }

      // 5. Tier filter
      if (filters.tierFilter !== null && item.tier !== filters.tierFilter) {
        return false;
      }

      // 6. Search query filter (name, team, or rostered team/owner name)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const nameMatch = item.playerName.toLowerCase().includes(q) || 
          item.originalCsvName.toLowerCase().includes(q);
        const teamMatch = item.team ? item.team.toLowerCase().includes(q) : false;
        const rosterTeamMatch = item.rosterStatus.teamName ? item.rosterStatus.teamName.toLowerCase().includes(q) : false;
        const ownerMatch = item.rosterStatus.ownerDisplayName ? item.rosterStatus.ownerDisplayName.toLowerCase().includes(q) : false;
        
        if (!nameMatch && !teamMatch && !rosterTeamMatch && !ownerMatch) {
          return false;
        }
      }

      return true;
    });
  }, [dataset, filters]);

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
    <div className="space-y-6 pb-20">
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

          {/* Action Buttons */}
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

      {/* Advanced Filter Bar */}
      <RankingsFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        totalCount={dataset.totalRows}
        filteredCount={filteredItems.length}
        maxAvailableRank={maxRank}
      />

      {/* TanStack Table View */}
      <RankingsTable
        data={filteredItems}
      />

      {/* Selected Players Multi-Select Action Bar */}
      <SelectedPlayersBar />
    </div>
  );
};
