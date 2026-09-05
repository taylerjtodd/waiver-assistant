import React, { useState } from 'react';
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  UserCheck
} from 'lucide-react';
import { useSleeper } from '../../context/SleeperContext';

export const RostersViewer: React.FC = () => {
  const { rosters, players, myRosterId, setMyRoster } = useSleeper();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRosterId, setExpandedRosterId] = useState<number | null>(null);

  if (!rosters.length) return null;

  const filteredRosters = rosters.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.teamName ? r.teamName.toLowerCase().includes(term) : false) ||
      (r.ownerDisplayName ? r.ownerDisplayName.toLowerCase().includes(term) : false) ||
      (r.ownerUsername ? r.ownerUsername.toLowerCase().includes(term) : false)
    );
  });

  const toggleExpand = (rosterId: number) => {
    setExpandedRosterId(expandedRosterId === rosterId ? null : rosterId);
  };

  const getPlayerDetails = (playerId: string) => {
    if (!players || !players[playerId]) {
      return { name: `Player #${playerId}`, position: 'N/A', team: 'N/A' };
    }
    const p = players[playerId];
    return {
      name: p.full_name || `${p.first_name} ${p.last_name}`,
      position: p.position || 'N/A',
      team: p.team || 'FA',
      injury: p.injury_status,
      number: p.number,
    };
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold text-slate-100">
            League Teams & Rosters ({rosters.length})
          </h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams or owners..."
            className="w-full sm:w-64 bg-slate-950/70 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredRosters.map((roster, index) => {
          const isExpanded = expandedRosterId === roster.rosterId;
          const isMyTeam = roster.rosterId === myRosterId;

          return (
            <div
              key={roster.rosterId}
              className={`rounded-xl border transition-all overflow-hidden ${
                isMyTeam 
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm' 
                  : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(roster.rosterId)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">
                    #{index + 1}
                  </span>
                  {roster.avatarUrl ? (
                    <img
                      src={roster.avatarUrl}
                      alt={roster.teamName}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {roster.teamName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-white truncate">
                        {roster.teamName}
                      </span>
                      {isMyTeam && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {roster.ownerDisplayName} • {roster.wins}-{roster.losses} ({roster.fpts.toFixed(1)} pts)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                    <span className="font-semibold text-slate-200">{roster.players.length}</span> players
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Players List */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/40 p-3 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">
                      {roster.starters.length} Starters • {roster.players.length - roster.starters.length} Bench
                      {roster.taxi.length > 0 && ` • ${roster.taxi.length} Taxi`}
                      {roster.reserve.length > 0 && ` • ${roster.reserve.length} IR`}
                    </span>

                    {!isMyTeam && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMyRoster(roster.rosterId);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Set as My Team</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {roster.players.map((playerId) => {
                      const details = getPlayerDetails(playerId);
                      const isStarter = roster.starters.includes(playerId);
                      const isTaxi = roster.taxi.includes(playerId);
                      const isReserve = roster.reserve.includes(playerId);

                      return (
                        <div
                          key={playerId}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`text-[10px] font-bold px-1 rounded ${
                              details.position === 'QB' ? 'bg-red-500/20 text-red-300' :
                              details.position === 'RB' ? 'bg-emerald-500/20 text-emerald-300' :
                              details.position === 'WR' ? 'bg-cyan-500/20 text-cyan-300' :
                              details.position === 'TE' ? 'bg-amber-500/20 text-amber-300' :
                              details.position === 'K' ? 'bg-purple-500/20 text-purple-300' :
                              details.position === 'DEF' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {details.position}
                            </span>
                            <span className="font-medium text-slate-200 truncate">
                              {details.name}
                            </span>
                            {details.team && details.team !== 'FA' && (
                              <span className="text-[10px] text-slate-400">
                                {details.team}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {details.injury && (
                              <span className="text-[9px] px-1 rounded bg-red-500/20 text-red-400 font-bold">
                                {details.injury}
                              </span>
                            )}
                            {isStarter && (
                              <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                                Start
                              </span>
                            )}
                            {isTaxi && (
                              <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-semibold">
                                Taxi
                              </span>
                            )}
                            {isReserve && (
                              <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300 font-semibold">
                                IR
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
