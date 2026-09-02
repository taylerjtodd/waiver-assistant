import { SavedLeague } from '../sleeper/types';

const STORAGE_KEYS = {
  SAVED_LEAGUES: 'waiver_assistant_saved_leagues_v1',
  ACTIVE_LEAGUE_ID: 'waiver_assistant_active_league_id_v1',
  MY_ROSTER_PREFERENCES: 'waiver_assistant_my_roster_prefs_v1',
};

export function getSavedLeagues(): SavedLeague[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_LEAGUES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Storage] Failed to read saved leagues:', err);
    return [];
  }
}

export function saveLeagueMetadata(league: SavedLeague): SavedLeague[] {
  try {
    const existing = getSavedLeagues();
    const filtered = existing.filter((l) => l.leagueId !== league.leagueId);
    const updated = [league, ...filtered].slice(0, 20); // Keep up to 20 recent leagues
    localStorage.setItem(STORAGE_KEYS.SAVED_LEAGUES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('[Storage] Failed to save league metadata:', err);
    return getSavedLeagues();
  }
}

export function removeSavedLeagueFromStorage(leagueId: string): SavedLeague[] {
  try {
    const existing = getSavedLeagues();
    const updated = existing.filter((l) => l.leagueId !== leagueId);
    localStorage.setItem(STORAGE_KEYS.SAVED_LEAGUES, JSON.stringify(updated));
    
    // Clear active league if it was removed
    if (getActiveLeagueId() === leagueId) {
      setActiveLeagueId(null);
    }
    return updated;
  } catch (err) {
    console.error('[Storage] Failed to remove saved league:', err);
    return getSavedLeagues();
  }
}

export function getActiveLeagueId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_LEAGUE_ID);
  } catch {
    return null;
  }
}

export function setActiveLeagueId(leagueId: string | null): void {
  try {
    if (leagueId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LEAGUE_ID, leagueId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_LEAGUE_ID);
    }
  } catch (err) {
    console.warn('[Storage] Failed to set active league id:', err);
  }
}

export function getMyRosterPref(leagueId: string): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MY_ROSTER_PREFERENCES);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return typeof map[leagueId] === 'number' ? map[leagueId] : null;
  } catch {
    return null;
  }
}

export function setMyRosterPref(leagueId: string, rosterId: number | null): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MY_ROSTER_PREFERENCES);
    const map = raw ? JSON.parse(raw) : {};
    if (rosterId === null) {
      delete map[leagueId];
    } else {
      map[leagueId] = rosterId;
    }
    localStorage.setItem(STORAGE_KEYS.MY_ROSTER_PREFERENCES, JSON.stringify(map));
  } catch (err) {
    console.warn('[Storage] Failed to save my roster preference:', err);
  }
}
