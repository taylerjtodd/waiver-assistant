import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SleeperLeague, 
  SleeperUser, 
  SleeperRoster, 
  SleeperPlayer, 
  ProcessedRoster, 
  SavedLeague, 
  PlayerCacheMetadata 
} from '../lib/sleeper/types';
import { 
  fetchLeague, 
  fetchLeagueUsers, 
  fetchLeagueRosters, 
  fetchAndCachePlayers, 
  getCachedPlayersMetadata, 
  getCachedPlayers,
  processLeagueRosters, 
  getSleeperAvatarUrl 
} from '../lib/sleeper/api';
import { 
  getSavedLeagues, 
  saveLeagueMetadata, 
  removeSavedLeagueFromStorage, 
  getActiveLeagueId, 
  setActiveLeagueId, 
  getMyRosterPref, 
  setMyRosterPref 
} from '../lib/storage/leagueStorage';

interface SleeperContextType {
  league: SleeperLeague | null;
  users: SleeperUser[];
  rawRosters: SleeperRoster[];
  rosters: ProcessedRoster[];
  players: Record<string, SleeperPlayer> | null;
  playersMetadata: PlayerCacheMetadata | null;
  myRosterId: number | null;
  myRoster: ProcessedRoster | null;
  savedLeagues: SavedLeague[];
  activeLeagueId: string | null;
  isLoading: boolean;
  isSyncingPlayers: boolean;
  syncStatusMessage: string | null;
  error: string | null;
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
  connectLeague: (leagueId: string, autoSelectRosterForUser?: string) => Promise<void>;
  refreshLeague: () => Promise<void>;
  disconnectLeague: () => void;
  setMyRoster: (rosterId: number | null) => void;
  removeSavedLeague: (leagueId: string) => void;
  syncPlayers: (force?: boolean) => Promise<void>;
}

const SleeperContext = createContext<SleeperContextType | null>(null);

export const SleeperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [league, setLeague] = useState<SleeperLeague | null>(null);
  const [users, setUsers] = useState<SleeperUser[]>([]);
  const [rawRosters, setRawRosters] = useState<SleeperRoster[]>([]);
  const [players, setPlayers] = useState<Record<string, SleeperPlayer> | null>(null);
  const [playersMetadata, setPlayersMetadata] = useState<PlayerCacheMetadata | null>(null);
  const [myRosterId, setMyRosterIdState] = useState<number | null>(null);
  const [savedLeagues, setSavedLeagues] = useState<SavedLeague[]>(() => getSavedLeagues());
  const [activeLeagueId, setActiveLeagueIdState] = useState<string | null>(() => getActiveLeagueId());
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncingPlayers, setIsSyncingPlayers] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  // Sync / load player database
  const syncPlayers = useCallback(async (force: boolean = false) => {
    setIsSyncingPlayers(true);
    setError(null);
    try {
      const res = await fetchAndCachePlayers(force, (msg) => setSyncStatusMessage(msg));
      setPlayers(res.players);
      setPlayersMetadata(res.metadata);
    } catch (err: any) {
      console.error('[SleeperContext] Error syncing players:', err);
      setSyncStatusMessage(null);
    } finally {
      setIsSyncingPlayers(false);
      setTimeout(() => setSyncStatusMessage(null), 3000);
    }
  }, []);

  // Initial player cache load on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const metadata = await getCachedPlayersMetadata();
        if (metadata && isMounted) {
          setPlayersMetadata(metadata);
          const cached = await getCachedPlayers();
          if (cached && isMounted) {
            setPlayers(cached);
          }
        }
      } catch (err) {
        console.warn('Failed to load initial cached players:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Connect to a league
  const connectLeague = useCallback(async (leagueId: string, autoSelectUsername?: string) => {
    const cleanId = leagueId.trim();
    if (!cleanId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Parallel fetch league, users, rosters
      const [leagueData, usersData, rostersData] = await Promise.all([
        fetchLeague(cleanId),
        fetchLeagueUsers(cleanId),
        fetchLeagueRosters(cleanId),
      ]);

      setLeague(leagueData);
      setUsers(usersData);
      setRawRosters(rostersData);
      setActiveLeagueIdState(cleanId);
      setActiveLeagueId(cleanId);

      // Determine My Roster ID
      let selectedRosterId: number | null = getMyRosterPref(cleanId);

      if (selectedRosterId === null && autoSelectUsername) {
        // Try to match user by username
        const matchedUser = usersData.find(
          (u) => u.username.toLowerCase() === autoSelectUsername.toLowerCase()
        );
        if (matchedUser) {
          const matchedRoster = rostersData.find((r) => r.owner_id === matchedUser.user_id);
          if (matchedRoster) {
            selectedRosterId = matchedRoster.roster_id;
            setMyRosterPref(cleanId, selectedRosterId);
          }
        }
      }

      setMyRosterIdState(selectedRosterId);

      // Update saved leagues
      const savedItem: SavedLeague = {
        leagueId: leagueData.league_id,
        name: leagueData.name,
        season: leagueData.season,
        totalTeams: leagueData.total_rosters || rostersData.length,
        avatarUrl: getSleeperAvatarUrl(leagueData.avatar),
        myRosterId: selectedRosterId,
        lastConnectedAt: Date.now(),
      };
      const updated = saveLeagueMetadata(savedItem);
      setSavedLeagues(updated);

      // Auto-trigger background player cache fetch if not yet loaded
      if (!players) {
        syncPlayers(false).catch(() => {});
      }
    } catch (err: any) {
      console.error('[SleeperContext] Failed to connect league:', err);
      setError(err.message || 'Failed to connect to Sleeper league. Please check the League ID.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [players, syncPlayers]);

  // Refresh active league
  const refreshLeague = useCallback(async () => {
    if (!activeLeagueId) return;
    await connectLeague(activeLeagueId);
  }, [activeLeagueId, connectLeague]);

  // Disconnect active league
  const disconnectLeague = useCallback(() => {
    setLeague(null);
    setUsers([]);
    setRawRosters([]);
    setMyRosterIdState(null);
    setActiveLeagueIdState(null);
    setActiveLeagueId(null);
  }, []);

  // Set "My Team" roster selection
  const setMyRoster = useCallback((rosterId: number | null) => {
    if (!activeLeagueId) return;
    setMyRosterIdState(rosterId);
    setMyRosterPref(activeLeagueId, rosterId);

    // Update in saved leagues metadata as well
    if (league) {
      const savedItem: SavedLeague = {
        leagueId: league.league_id,
        name: league.name,
        season: league.season,
        totalTeams: league.total_rosters || rawRosters.length,
        avatarUrl: getSleeperAvatarUrl(league.avatar),
        myRosterId: rosterId,
        lastConnectedAt: Date.now(),
      };
      const updated = saveLeagueMetadata(savedItem);
      setSavedLeagues(updated);
    }
  }, [activeLeagueId, league, rawRosters.length]);

  // Remove a saved league
  const removeSavedLeague = useCallback((leagueId: string) => {
    const updated = removeSavedLeagueFromStorage(leagueId);
    setSavedLeagues(updated);
    if (activeLeagueId === leagueId) {
      disconnectLeague();
    }
  }, [activeLeagueId, disconnectLeague]);

  // Initial load of active league if present in localStorage
  useEffect(() => {
    if (activeLeagueId && !league && !isLoading) {
      connectLeague(activeLeagueId).catch((err) => {
        console.warn('Failed to auto-restore active league:', err);
      });
    }
  }, [activeLeagueId, league, isLoading, connectLeague]);

  // Process rosters with enriched user details
  const rosters = useMemo(() => {
    if (!rawRosters.length) return [];
    return processLeagueRosters(rawRosters, users, myRosterId);
  }, [rawRosters, users, myRosterId]);

  const myRoster = useMemo(() => {
    if (myRosterId === null) return null;
    return rosters.find((r) => r.rosterId === myRosterId) || null;
  }, [rosters, myRosterId]);

  const value = useMemo<SleeperContextType>(() => ({
    league,
    users,
    rawRosters,
    rosters,
    players,
    playersMetadata,
    myRosterId,
    myRoster,
    savedLeagues,
    activeLeagueId,
    isLoading,
    isSyncingPlayers,
    syncStatusMessage,
    error,
    isConnectModalOpen,
    setIsConnectModalOpen,
    connectLeague,
    refreshLeague,
    disconnectLeague,
    setMyRoster,
    removeSavedLeague,
    syncPlayers,
  }), [
    league,
    users,
    rawRosters,
    rosters,
    players,
    playersMetadata,
    myRosterId,
    myRoster,
    savedLeagues,
    activeLeagueId,
    isLoading,
    isSyncingPlayers,
    syncStatusMessage,
    error,
    isConnectModalOpen,
    setIsConnectModalOpen,
    connectLeague,
    refreshLeague,
    disconnectLeague,
    setMyRoster,
    removeSavedLeague,
    syncPlayers,
  ]);

  return (
    <SleeperContext.Provider value={value}>
      {children}
    </SleeperContext.Provider>
  );
};

export function useSleeper(): SleeperContextType {
  const context = useContext(SleeperContext);
  if (!context) {
    throw new Error('useSleeper must be used within a SleeperProvider');
  }
  return context;
}
