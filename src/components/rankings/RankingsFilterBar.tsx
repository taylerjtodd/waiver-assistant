import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  RotateCcw, 
  ChevronDown, 
  Sparkles,
  Users
} from 'lucide-react';
import { useSleeper } from '../../context/SleeperContext';

export interface FilterState {
  searchQuery: string;
  position: string;
  status: 'ALL' | 'FA' | 'ROSTERED' | 'MY_TEAM';
  selectedRosterIds: number[]; // empty means all rosters included
  includeFreeAgents: boolean; // when selectedRosterIds is active, whether to also include FAs
  minRank: number;
  maxRank: number;
  tierFilter: number | null; // null = all tiers
}

interface RankingsFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
  maxAvailableRank: number;
}

export const RankingsFilterBar: React.FC<RankingsFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  filteredCount,
  maxAvailableRank,
}) => {
  const { rosters, myRosterId, league } = useSleeper();
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTeamDropdownOpen(false);
      }
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) {
        setIsRangeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, searchQuery: val });
  };

  const handlePositionChange = (pos: string) => {
    onFilterChange({ ...filters, position: pos });
  };

  const handleStatusChange = (status: 'ALL' | 'FA' | 'ROSTERED' | 'MY_TEAM') => {
    onFilterChange({ ...filters, status });
  };

  const toggleRosterId = (rosterId: number) => {
    const exists = filters.selectedRosterIds.includes(rosterId);
    const newIds = exists
      ? filters.selectedRosterIds.filter((id) => id !== rosterId)
      : [...filters.selectedRosterIds, rosterId];
    onFilterChange({ ...filters, selectedRosterIds: newIds });
  };

  const toggleIncludeFA = () => {
    onFilterChange({ ...filters, includeFreeAgents: !filters.includeFreeAgents });
  };

  const selectAllRosters = () => {
    onFilterChange({
      ...filters,
      selectedRosterIds: [],
      includeFreeAgents: true,
    });
  };

  const selectOnlyFreeAgents = () => {
    onFilterChange({
      ...filters,
      selectedRosterIds: [],
      includeFreeAgents: true,
      status: 'FA',
    });
  };

  const selectWaiverMode = () => {
    if (myRosterId !== null) {
      onFilterChange({
        ...filters,
        selectedRosterIds: [myRosterId],
        includeFreeAgents: true,
        status: 'ALL',
      });
    } else {
      onFilterChange({
        ...filters,
        status: 'FA',
      });
    }
  };

  const handleRankPreset = (max: number) => {
    onFilterChange({
      ...filters,
      minRank: 1,
      maxRank: max === 0 ? maxAvailableRank : Math.min(max, maxAvailableRank),
    });
  };

  // Count active non-default filters
  const activeFilterCount = [
    filters.searchQuery.trim().length > 0,
    filters.position !== 'ALL',
    filters.status !== 'ALL',
    filters.selectedRosterIds.length > 0 || !filters.includeFreeAgents,
    filters.minRank > 1 || filters.maxRank < maxAvailableRank,
    filters.tierFilter !== null,
  ].filter(Boolean).length;

  return (
    <div className="relative z-30 space-y-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md shadow-lg">
      {/* Top Row: Search and Quick Preset Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by player, NFL team, or Sleeper owner..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns / Modals: Team Selector & Rank Slider */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Multi-Team/Roster Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                filters.selectedRosterIds.length > 0 || !filters.includeFreeAgents
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {filters.selectedRosterIds.length === 0
                  ? filters.includeFreeAgents
                    ? 'All Rosters & FA'
                    : 'Rostered Only'
                  : `${filters.selectedRosterIds.length} Team${filters.selectedRosterIds.length > 1 ? 's' : ''}${
                      filters.includeFreeAgents ? ' + FA' : ''
                    }`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isTeamDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="font-bold text-slate-200">Filter by Roster</span>
                  <button
                    onClick={selectAllRosters}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium"
                  >
                    Select All
                  </button>
                </div>

                {/* Quick Roster Presets */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={selectOnlyFreeAgents}
                    className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-left truncate transition-colors"
                  >
                    FA Only
                  </button>
                  <button
                    onClick={selectWaiverMode}
                    className="px-2 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-left truncate transition-colors"
                  >
                    FA + My Team
                  </button>
                </div>

                {/* Free Agents Option */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={filters.includeFreeAgents}
                      onChange={toggleIncludeFA}
                      className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                    />
                    <span className="flex-1 text-slate-200 font-medium">Free Agents (Available)</span>
                  </label>
                </div>

                {/* League Rosters List */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 px-2">
                    {league ? league.name : 'League Rosters'}
                  </p>
                  {rosters.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-slate-400 italic">
                      No Sleeper league connected.
                    </div>
                  ) : (
                    rosters.map((r) => {
                      const isChecked = filters.selectedRosterIds.includes(r.rosterId);
                      return (
                        <label
                          key={r.rosterId}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                            isChecked ? 'bg-emerald-500/10 text-emerald-200' : 'hover:bg-slate-800/50 text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRosterId(r.rosterId)}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                          />
                          <span className="truncate flex-1">
                            {r.teamName}
                            {r.isMyTeam && (
                              <span className="ml-1.5 text-[10px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                MY TEAM
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rank Range Preset / Custom Filter */}
          <div className="relative" ref={rangeRef}>
            <button
              type="button"
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                filters.minRank > 1 || filters.maxRank < maxAvailableRank
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {filters.minRank === 1 && filters.maxRank >= maxAvailableRank
                  ? 'All Ranks'
                  : `Rank #${filters.minRank}–#${filters.maxRank}`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRangeOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="font-bold text-slate-200">Rank Range</span>
                  <button
                    onClick={() => handleRankPreset(0)}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium"
                  >
                    Reset (All)
                  </button>
                </div>

                {/* Quick presets */}
                <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                  {[25, 50, 100, 150, 200, 0].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleRankPreset(preset)}
                      className={`px-2 py-1 rounded-lg border text-center transition-all ${
                        (preset === 0 && filters.maxRank >= maxAvailableRank && filters.minRank === 1) ||
                        (preset !== 0 && filters.maxRank === preset && filters.minRank === 1)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      {preset === 0 ? 'All' : `Top ${preset}`}
                    </button>
                  ))}
                </div>

                {/* Custom Min / Max Inputs */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Min Rank</span>
                    <input
                      type="number"
                      min={1}
                      max={filters.maxRank}
                      value={filters.minRank}
                      onChange={(e) =>
                        onFilterChange({
                          ...filters,
                          minRank: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-right text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Max Rank</span>
                    <input
                      type="number"
                      min={filters.minRank}
                      max={maxAvailableRank || 500}
                      value={filters.maxRank}
                      onChange={(e) =>
                        onFilterChange({
                          ...filters,
                          maxRank: Math.max(
                            filters.minRank,
                            parseInt(e.target.value) || maxAvailableRank
                          ),
                        })
                      }
                      className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-right text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Second Row: Status Pills & Position Tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Players' },
            { id: 'FA', label: 'Free Agents Only' },
            { id: 'ROSTERED', label: 'Rostered' },
            { id: 'MY_TEAM', label: 'My Team' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleStatusChange(item.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                filters.status === item.id
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Position Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800 text-xs overflow-x-auto">
          {['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map((pos) => (
            <button
              key={pos}
              onClick={() => handlePositionChange(pos)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                filters.position === pos
                  ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Metrics Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
        <div>
          Showing <span className="text-slate-200 font-semibold">{filteredCount}</span> of{' '}
          <span className="text-slate-200 font-semibold">{totalCount}</span> players
          {activeFilterCount > 0 && (
            <span className="ml-2 text-emerald-400">({activeFilterCount} active filters)</span>
          )}
        </div>

        {/* Quick waiver wire shortcut button */}
        {myRosterId !== null && (
          <button
            onClick={selectWaiverMode}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline-offset-2 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Waiver View: FA + My Roster</span>
          </button>
        )}
      </div>
    </div>
  );
};
