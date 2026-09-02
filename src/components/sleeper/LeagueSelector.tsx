import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Trophy, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Check, 
  Database, 
  Loader2
} from 'lucide-react';
import { useSleeper } from '../../context/SleeperContext';

export const LeagueSelector: React.FC = () => {
  const {
    league,
    savedLeagues,
    activeLeagueId,
    isLoading,
    isSyncingPlayers,
    syncStatusMessage,
    playersMetadata,
    connectLeague,
    refreshLeague,
    removeSavedLeague,
    setIsConnectModalOpen,
    syncPlayers,
  } = useSleeper();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLeague = async (leagueId: string) => {
    if (leagueId === activeLeagueId) {
      setIsOpen(false);
      return;
    }
    try {
      await connectLeague(leagueId);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to switch league:', err);
    }
  };

  const handleRemoveLeague = (e: React.MouseEvent, leagueId: string) => {
    e.stopPropagation();
    removeSavedLeague(leagueId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {league ? (
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 text-slate-200 transition-all text-xs sm:text-sm font-medium shadow-sm group"
          >
            {league.avatar ? (
              <img
                src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`}
                alt={league.name}
                className="w-4 h-4 rounded-full object-cover ring-1 ring-emerald-500/50"
              />
            ) : (
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="max-w-[140px] sm:max-w-[200px] truncate font-semibold text-white">
              {league.name}
            </span>
            <span className="hidden md:inline-block text-[11px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
              {league.season}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Refresh Button */}
          <button
            onClick={() => refreshLeague()}
            disabled={isLoading}
            title="Refresh League Rosters & Matchups"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all text-xs sm:text-sm shadow-md shadow-emerald-500/20"
        >
          <Trophy className="w-4 h-4" />
          <span>Connect Sleeper League</span>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-emerald-950/40 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Saved Leagues ({savedLeagues.length})
            </span>
            <button
              onClick={() => { setIsOpen(false); setIsConnectModalOpen(true); }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {/* Saved League Items */}
          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 px-1.5">
            {savedLeagues.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No saved leagues yet.
              </div>
            ) : (
              savedLeagues.map((item) => {
                const isActive = item.leagueId === activeLeagueId;
                return (
                  <div
                    key={item.leagueId}
                    onClick={() => handleSelectLeague(item.leagueId)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.season} • {item.totalTeams} Teams
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isActive && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveLeague(e, item.leagueId)}
                        title="Remove league"
                        className="p-1 hover:text-red-400 text-slate-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Database & Sync Status Footer */}
          <div className="border-t border-slate-800 mt-1 pt-2 px-3 py-2 bg-slate-950/40 rounded-b-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-slate-500" />
                <span>NFL Player DB</span>
              </span>
              <span className="text-slate-300 font-medium">
                {playersMetadata?.playerCount ? `${playersMetadata.playerCount.toLocaleString()} players` : 'Not loaded'}
              </span>
            </div>

            {syncStatusMessage && (
              <div className="text-[10px] text-emerald-400 truncate">
                {syncStatusMessage}
              </div>
            )}

            <button
              onClick={() => syncPlayers(true)}
              disabled={isSyncingPlayers}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              {isSyncingPlayers ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                  <span>Syncing Players...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  <span>Force Re-sync Player DB</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
