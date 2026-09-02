import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useSleeper } from '../../context/SleeperContext';

export const LeagueStatusCard: React.FC = () => {
  const {
    league,
    rosters,
    myRosterId,
    myRoster,
    setMyRoster,
    playersMetadata,
    isSyncingPlayers,
    syncStatusMessage,
    syncPlayers,
    setIsConnectModalOpen,
    isLoading,
    refreshLeague,
  } = useSleeper();

  const [showRosterSelect, setShowRosterSelect] = useState(false);

  // Format league type
  const getLeagueType = () => {
    if (!league?.settings) return 'League';
    const type = league.settings.type;
    if (type === 2) return 'Dynasty';
    if (type === 1) return 'Keeper';
    return 'Redraft';
  };

  // Format scoring type
  const getScoringType = () => {
    if (!league?.scoring_settings) return 'Standard';
    const rec = league.scoring_settings.rec;
    if (rec === 1) return '1.0 PPR';
    if (rec === 0.5) return '0.5 Half-PPR';
    if (rec === 0) return 'Standard (0 PPR)';
    return `${rec} PPR`;
  };

  if (!league) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/95 via-slate-900/60 to-slate-950/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sleeper API & Database Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Connect Your Sleeper League
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Sync rosters, starters, taxi squads, and free agents in real-time. Match with external consensus rankings to immediately spot high-value waiver adds and trade targets.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                <span>Connect Sleeper League</span>
              </button>
            </div>
          </div>

          {/* Quick Features Matrix */}
          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-xs font-medium text-slate-400">NFL Player DB</div>
              <div className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5 mt-1">
                <Database className="w-4 h-4 text-emerald-400" />
                {playersMetadata?.playerCount ? `${playersMetadata.playerCount.toLocaleString()} Players` : 'IndexedDB Ready'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-xs font-medium text-slate-400">Roster Sync</div>
              <div className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Real-Time API
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        {/* League Info Left */}
        <div className="flex items-center gap-3.5">
          {league.avatar ? (
            <img
              src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`}
              alt={league.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-md shadow-emerald-950/40"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold shadow-md shadow-emerald-950/40">
              <Trophy className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {league.name}
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {league.season} Season
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {getLeagueType()} • {getScoringType()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{league.total_rosters || rosters.length} Teams</span>
              <span>•</span>
              <span>Status: <span className="text-emerald-400 font-medium capitalize">{league.status.replace('_', ' ')}</span></span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => refreshLeague()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Roster Data</span>
          </button>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch League</span>
          </button>
        </div>
      </div>

      {/* Grid: My Roster Info & Player DB Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Team Selector Card */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Active Roster / My Team</span>
            </div>
            <button
              onClick={() => setShowRosterSelect(!showRosterSelect)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {showRosterSelect ? 'Done' : 'Change'}
            </button>
          </div>

          {showRosterSelect ? (
            <div className="space-y-2">
              <label className="block text-xs text-slate-400">Select which team belongs to you:</label>
              <select
                value={myRosterId ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setMyRoster(val);
                  setShowRosterSelect(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Select Your Team --</option>
                {rosters.map((r) => (
                  <option key={r.rosterId} value={r.rosterId}>
                    {r.teamName} ({r.ownerDisplayName})
                  </option>
                ))}
              </select>
            </div>
          ) : myRoster ? (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                {myRoster.avatarUrl ? (
                  <img
                    src={myRoster.avatarUrl}
                    alt={myRoster.teamName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {myRoster.teamName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{myRoster.teamName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      My Team
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {myRoster.ownerDisplayName} • Record: {myRoster.wins}-{myRoster.losses}{myRoster.ties ? `-${myRoster.ties}` : ''} ({myRoster.fpts.toFixed(1)} pts)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-200">
                  {myRoster.players.length} Players
                </div>
                <div className="text-[11px] text-slate-400">
                  {myRoster.starters.length} Starters
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No team selected as "My Team".</span>
              </span>
              <button
                onClick={() => setShowRosterSelect(true)}
                className="underline font-semibold hover:text-amber-200"
              >
                Select Team
              </button>
            </div>
          )}
        </div>

        {/* Player Database Status Card */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Sleeper NFL Player Database</span>
            </div>
            <button
              onClick={() => syncPlayers(true)}
              disabled={isSyncingPlayers}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingPlayers ? 'animate-spin' : ''}`} />
              <span>{isSyncingPlayers ? 'Syncing...' : 'Force Sync'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{playersMetadata?.playerCount ? `${playersMetadata.playerCount.toLocaleString()} Players` : 'Loading...'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  IndexedDB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {playersMetadata?.updatedAt
                  ? `Last updated: ${new Date(playersMetadata.updatedAt).toLocaleDateString()} at ${new Date(playersMetadata.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Automatic 24-hour cache'}
              </p>
            </div>

            {syncStatusMessage && (
              <div className="text-xs text-emerald-400 font-medium max-w-[140px] text-right truncate">
                {syncStatusMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
