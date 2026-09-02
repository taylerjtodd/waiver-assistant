import { 
  SleeperLeague, 
  SleeperUser, 
  SleeperRoster, 
  SleeperPlayer, 
  ProcessedRoster, 
  PlayerCacheMetadata 
} from './types';
import { idbGet, idbSet } from '../storage/indexedDb';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';
const PLAYERS_CACHE_KEY = 'sleeper_players_nfl_cache_v1';
const PLAYERS_METADATA_KEY = 'sleeper_players_metadata_v1';
const PLAYERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getSleeperAvatarUrl(avatarId: string | null | undefined): string | null {
  if (!avatarId) return null;
  // If it's already a full URL
  if (avatarId.startsWith('http://') || avatarId.startsWith('https://')) {
    return avatarId;
  }
  // Sleeper CDN avatar format
  return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
}

export async function fetchLeague(leagueId: string): Promise<SleeperLeague> {
  const cleanId = leagueId.trim();
  if (!cleanId) throw new Error('League ID is required');

  const res = await fetch(`${SLEEPER_BASE_URL}/league/${cleanId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`League not found with ID: ${cleanId}`);
    throw new Error(`Failed to fetch league (${res.status} ${res.statusText})`);
  }
  const data = await res.json();
  if (!data || !data.league_id) {
    throw new Error(`Invalid league data returned for ID: ${cleanId}`);
  }
  return data as SleeperLeague;
}

export async function fetchLeagueUsers(leagueId: string): Promise<SleeperUser[]> {
  const cleanId = leagueId.trim();
  const res = await fetch(`${SLEEPER_BASE_URL}/league/${cleanId}/users`);
  if (!res.ok) {
    throw new Error(`Failed to fetch league users (${res.status} ${res.statusText})`);
  }
  return (await res.json()) as SleeperUser[];
}

export async function fetchLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
  const cleanId = leagueId.trim();
  const res = await fetch(`${SLEEPER_BASE_URL}/league/${cleanId}/rosters`);
  if (!res.ok) {
    throw new Error(`Failed to fetch league rosters (${res.status} ${res.statusText})`);
  }
  return (await res.json()) as SleeperRoster[];
}

export async function fetchUser(usernameOrId: string): Promise<SleeperUser> {
  const cleanQuery = usernameOrId.trim();
  if (!cleanQuery) throw new Error('Username or User ID is required');

  const res = await fetch(`${SLEEPER_BASE_URL}/user/${encodeURIComponent(cleanQuery)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`User not found: ${cleanQuery}`);
    throw new Error(`Failed to fetch user (${res.status} ${res.statusText})`);
  }
  const data = await res.json();
  if (!data || !data.user_id) {
    throw new Error(`No user found for "${cleanQuery}"`);
  }
  return data as SleeperUser;
}

export async function fetchUserLeagues(userId: string, season: string = new Date().getFullYear().toString()): Promise<SleeperLeague[]> {
  const cleanUserId = userId.trim();
  const res = await fetch(`${SLEEPER_BASE_URL}/user/${cleanUserId}/leagues/nfl/${season}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user leagues for season ${season}`);
  }
  return (await res.json()) as SleeperLeague[];
}

export async function getCachedPlayersMetadata(): Promise<PlayerCacheMetadata | null> {
  return await idbGet<PlayerCacheMetadata>(PLAYERS_METADATA_KEY);
}

export async function getCachedPlayers(): Promise<Record<string, SleeperPlayer> | null> {
  return await idbGet<Record<string, SleeperPlayer>>(PLAYERS_CACHE_KEY);
}

/**
 * Fetch and cache the entire Sleeper NFL player database (~5MB).
 * Uses IndexedDB to avoid localStorage quota limits.
 * Checks for 24h TTL unless `forceRefresh` is true.
 */
export async function fetchAndCachePlayers(
  forceRefresh: boolean = false,
  onProgress?: (status: string) => void
): Promise<{ players: Record<string, SleeperPlayer>; metadata: PlayerCacheMetadata }> {
  // Check existing cache
  if (!forceRefresh) {
    onProgress?.('Checking cached NFL player database...');
    const metadata = await getCachedPlayersMetadata();
    const isFresh = metadata && (Date.now() - metadata.updatedAt < PLAYERS_CACHE_TTL_MS);

    if (isFresh) {
      const cached = await getCachedPlayers();
      if (cached && Object.keys(cached).length > 0) {
        onProgress?.(`Loaded ${Object.keys(cached).length.toLocaleString()} players from cache`);
        return { players: cached, metadata };
      }
    }
  }

  onProgress?.('Downloading latest NFL player database from Sleeper (~5MB)...');
  const res = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
  if (!res.ok) {
    throw new Error(`Failed to download NFL player database (${res.status} ${res.statusText})`);
  }

  onProgress?.('Parsing player records...');
  const players = (await res.json()) as Record<string, SleeperPlayer>;
  const playerCount = Object.keys(players).length;

  const metadata: PlayerCacheMetadata = {
    updatedAt: Date.now(),
    playerCount,
    version: '1.0',
  };

  onProgress?.('Saving to IndexedDB cache...');
  await idbSet(PLAYERS_CACHE_KEY, players);
  await idbSet(PLAYERS_METADATA_KEY, metadata);

  onProgress?.(`Successfully synced ${playerCount.toLocaleString()} NFL players`);
  return { players, metadata };
}

/**
 * Enrich raw Sleeper rosters with team names, owner display names, and avatars.
 */
export function processLeagueRosters(
  rosters: SleeperRoster[],
  users: SleeperUser[],
  myRosterId?: number | null
): ProcessedRoster[] {
  const userMap = new Map<string, SleeperUser>();
  users.forEach((u) => userMap.set(u.user_id, u));

  return rosters.map((roster) => {
    const owner = roster.owner_id ? userMap.get(roster.owner_id) : undefined;
    
    // Team name determination: metadata.team_name -> owner display_name -> "Team <roster_id>"
    const teamName = 
      owner?.metadata?.team_name?.trim() || 
      (owner ? `${owner.display_name}'s Team` : `Team ${roster.roster_id}`);

    const ownerDisplayName = owner?.display_name || 'Unassigned';
    const ownerUsername = owner?.username || '';
    
    // Avatar: team custom avatar in metadata or user's Sleeper avatar
    const customAvatar = owner?.metadata?.avatar;
    const avatarUrl = getSleeperAvatarUrl(customAvatar || owner?.avatar);

    const fpts = roster.settings?.fpts 
      ? Number(`${roster.settings.fpts}.${roster.settings.fpts_decimal || 0}`)
      : 0;

    return {
      rosterId: roster.roster_id,
      ownerId: roster.owner_id,
      teamName,
      ownerDisplayName,
      ownerUsername,
      avatarUrl,
      wins: roster.settings?.wins ?? 0,
      losses: roster.settings?.losses ?? 0,
      ties: roster.settings?.ties ?? 0,
      fpts,
      waiverBudgetRemaining: roster.settings?.waiver_budget_used !== undefined && roster.settings?.waiver_budget !== undefined
        ? Math.max(0, (roster.settings.waiver_budget || 100) - roster.settings.waiver_budget_used)
        : undefined,
      waiverPosition: roster.settings?.waiver_position,
      players: roster.players || [],
      starters: roster.starters || [],
      reserve: roster.reserve || [],
      taxi: roster.taxi || [],
      isMyTeam: myRosterId !== null && myRosterId !== undefined && roster.roster_id === myRosterId,
    };
  }).sort((a, b) => {
    // Sort by wins desc, then fpts desc
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.fpts - a.fpts;
  });
}
