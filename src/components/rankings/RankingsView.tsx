import React, { useState, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Upload
} from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';
import { useSleeper } from '../../context/SleeperContext';
import { MatchedRankingPlayer } from '../../lib/rankings/types';
import { RankingsFilterBar, FilterState } from './RankingsFilterBar';
import { RankingsTable } from './RankingsTable';
import { SelectedPlayersBar } from './SelectedPlayersBar';

export const RankingsView: React.FC = () => {
  const {
    dataset,
    loadSampleRankings,
    setIsRankingsDrawerOpen
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
        const nameMatch =
          (item.playerName ? item.playerName.toLowerCase().includes(q) : false) ||
          (item.originalCsvName ? item.originalCsvName.toLowerCase().includes(q) : false);
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

  // If no rankings dataset is loaded
  if (!dataset) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <FileSpreadsheet className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl font-bold text-slate-100">No Rankings Loaded</h2>
          <p className="text-sm text-slate-400">
            Import your custom fantasy rankings CSV or load sample consensus data to cross-reference with your Sleeper league rosters.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsRankingsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition-all shadow-md shadow-emerald-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>Import Rankings CSV</span>
          </button>
          <button
            type="button"
            onClick={loadSampleRankings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Load Sample Consensus</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Sleek Minimal Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Consensus Rankings</span>
            <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {dataset.totalRows} players
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {league ? `Cross-referenced with ${league.name} rosters` : 'Connect a Sleeper league to sync live rosters'} • {dataset.freeAgentCount} Free Agents
          </p>
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
