import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Hash, 
  User, 
  Trophy, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { useSleeper } from '../../context/SleeperContext';
import { fetchUser, fetchUserLeagues, getSleeperAvatarUrl } from '../../lib/sleeper/api';
import { SleeperLeague } from '../../lib/sleeper/types';

interface LeagueConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeagueConnectModal: React.FC<LeagueConnectModalProps> = ({ isOpen, onClose }) => {
  const { connectLeague, isLoading } = useSleeper();
  const [tab, setTab] = useState<'id' | 'username'>('id');
  
  // League ID Form State
  const [leagueIdInput, setLeagueIdInput] = useState('');
  
  // Username Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [seasonInput, setSeasonInput] = useState(new Date().getFullYear().toString());
  const [userLeagues, setUserLeagues] = useState<SleeperLeague[]>([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [searchedUsername, setSearchedUsername] = useState('');
  
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectById = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = leagueIdInput.trim();
    if (!cleanId) {
      setFormError('Please enter a valid Sleeper League ID');
      return;
    }
    setFormError(null);
    try {
      await connectLeague(cleanId);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to connect. Please verify the League ID.');
    }
  };

  const handleSearchUserLeagues = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    if (!cleanUser) {
      setFormError('Please enter a Sleeper username');
      return;
    }
    setFormError(null);
    setIsSearchingUser(true);
    setUserLeagues([]);
    try {
      const user = await fetchUser(cleanUser);
      const leagues = await fetchUserLeagues(user.user_id, seasonInput);
      setUserLeagues(leagues);
      setSearchedUsername(user.username);
      if (leagues.length === 0) {
        setFormError(`No active NFL leagues found for "${user.username}" in season ${seasonInput}.`);
      }
    } catch (err: any) {
      setFormError(err.message || 'Could not find user or leagues.');
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleSelectUserLeague = async (leagueId: string) => {
    setFormError(null);
    try {
      await connectLeague(leagueId, searchedUsername);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to connect to selected league.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-emerald-950/30 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Connect Sleeper League</h2>
              <p className="text-xs text-slate-400">Sync rosters, free agents, and league settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/30 gap-2">
          <button
            onClick={() => { setTab('id'); setFormError(null); }}
            className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              tab === 'id'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Direct League ID</span>
          </button>
          <button
            onClick={() => { setTab('username'); setFormError(null); }}
            className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              tab === 'username'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Search by Username</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{formError}</div>
            </div>
          )}

          {tab === 'id' ? (
            <form onSubmit={handleConnectById} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sleeper League ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={leagueIdInput}
                    onChange={(e) => setLeagueIdInput(e.target.value)}
                    placeholder="e.g. 112345678901234567"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                  <span>Found in Sleeper App: <b>League Settings &gt; General &gt; League ID</b></span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !leagueIdInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing League...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect League</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Helpful Hint Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Read-Only API</span>
                </div>
                <p>
                  No login credentials required. Sleeper provides public read-only endpoints for league rosters and scoring data.
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSearchUserLeagues} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Sleeper Username
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. fantasyguru"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Season
                    </label>
                    <input
                      type="text"
                      value={seasonInput}
                      onChange={(e) => setSeasonInput(e.target.value)}
                      placeholder="2025"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSearchingUser || !usernameInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-medium rounded-xl border border-slate-700 transition-all text-sm"
                >
                  {isSearchingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Looking up leagues...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-emerald-400" />
                      <span>Find My Leagues</span>
                    </>
                  )}
                </button>
              </form>

              {/* League List Results */}
              {userLeagues.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Found {userLeagues.length} League{userLeagues.length === 1 ? '' : 's'}:
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {userLeagues.map((lg) => {
                      const avatar = getSleeperAvatarUrl(lg.avatar);
                      return (
                        <div
                          key={lg.league_id}
                          onClick={() => handleSelectUserLeague(lg.league_id)}
                          className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 hover:border-emerald-500/50 border border-slate-700/60 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={lg.name}
                                className="w-9 h-9 rounded-lg object-cover bg-slate-700 ring-1 ring-slate-600"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                {lg.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                                {lg.name}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {lg.season} Season • {lg.total_rosters} Teams • {lg.status.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isLoading}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all flex items-center gap-1"
                          >
                            <span>Connect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
